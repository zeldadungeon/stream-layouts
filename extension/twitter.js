"use strict";

const twemoji = require("twemoji");
const TwitterStream = require("twitter-stream-api");

module.exports = function (nodecg) {
    const config = nodecg.bundleConfig.twitter;
    const TARGET_USER_ID = config.userId;
    
    const twitter = nodecg.Replicant("twitter", {
        defaultValue: {
            enabled: false,
            tweets: []
        }
    });

    const queue = nodecg.Replicant("queue", {
        defaultValue: []
    });
    
    const streams = {};

    twitter.on("change", (newVal, oldVal) => {
        // turn twitter connection on or off
        if (newVal.enabled) {
            if (!streams.user) {
                initializeStream("user");
            }
            if (!streams.filter && config.hashtag && config.hashtag !== "") {
                initializeStream("filter");
            }
        } else {
            if (streams.user) {
                try {
                    streams.user.close();
                } catch(ex) {
                    nodecg.log.error("[twitter] Exception while closing user connection: ", ex)
                }
                streams.user = undefined;
            }
            if (streams.filter) {
                try {
                    streams.filter.close();
                } catch(ex) {
                    nodecg.log.error("[twitter] Exception while closing filter connection: ", ex)
                }
                streams.filter = undefined;
            }
        }
    });

    nodecg.listenFor("twitter:accept", tweetId => {
        const tweet = removeTweetById(tweetId);
        queue.value.unshift({
            type: "tweet",
            id: tweet.id,
            name: tweet.user.screen_name, // tweet.user.name
            text: tweet.text
        });
        if (queue.value.length > 10) queue.value.splice(10, queue.value.length);
    });

    nodecg.listenFor("twitter:reject", removeTweetById);

    /**
     * Builds the stream. Called once every 90 minutes because sometimes the stream just dies silently.
     * @returns {undefined}
     */
    function initializeStream(type) {
        streams[type] = new TwitterStream({
            consumer_key: config.consumerKey,
            consumer_secret: config.consumerSecret,
            token: config.accessTokenKey,
            token_secret: config.accessTokenSecret
        });

        streams[type].on("data", data => {
            // We discard quoted statuses because we can't show them.
            if (data.quoted_status) {
                return;
            }

            if (data.event) {
                switch (data.event) {
                    case "favorite":
                        if (data.source.id_str !== TARGET_USER_ID) {
                            return;
                        }

                        addTweet(data.target_object);
                        break;
                    case "unfavorite":
                        if (data.source.id_str !== TARGET_USER_ID) {
                            return;
                        }

                        removeTweetById(data.target_object.id_str);
                        break;
                    default:
                    // do nothing
                }
            } else if (data.delete) {
                removeTweetById(data.delete.status.id_str);
            } else if (data.retweeted_status) {
                if (data.user.id_str !== TARGET_USER_ID) {
                    return;
                }

                const retweetedStatus = data.retweeted_status;
                retweetedStatus.retweetId = data.id_str;
                addTweet(retweetedStatus);
            } else if (data.text) {
                if (data.user.id_str !== TARGET_USER_ID) {
                //	return;
                }

                // Filter out @ replies
                if (data.text.charAt(0) === "@") {
                    return;
                }

                addTweet(data);
            }
        });

        streams[type].on("error", error => {
            nodecg.log.error("[twitter]", error.stack);
        });

        streams[type].on("connection success", () => {
            nodecg.log.info("[twitter] Connection success.");
        });

        streams[type].on("connection aborted", () => {
            nodecg.log.warn("[twitter] Connection aborted!");
        });

        streams[type].on("connection error network", error => {
            nodecg.log.error("[twitter] Connection error network:", error.stack);
        });

        streams[type].on("connection error stall", () => {
            nodecg.log.error("[twitter] Connection error stall!");
        });

        streams[type].on("connection error http", httpStatusCode => {
            nodecg.log.error("[twitter] Connection error HTTP:", httpStatusCode);
        });

        streams[type].on("connection rate limit", httpStatusCode => {
            nodecg.log.error("[twitter] Connection rate limit:", httpStatusCode);
        });

        streams[type].on("connection error unknown", error => {
            nodecg.log.error("[twitter] Connection error unknown:", error.stack);
            streams[type].close();
            streams[type] = new TwitterStream({
                consumer_key: config.consumerKey,
                consumer_secret: config.consumerSecret,
                token: config.accessTokenKey,
                token_secret: config.accessTokenSecret
            });
            subscribeStream(type);
        });

        subscribeStream(type);

        // Close and re-open the twitter connection every 90 minutes
        const thisStream = streams[type];
        setTimeout(() => {
            // make sure twitter's enabled and this is the same connection as before
            if (twitter.value.enabled && streams[type] === thisStream) {
                nodecg.log.info("[twitter] Restarting Twitter connection (done every 90 minutes).");
                streams[type].close();
                initializeStream(type);
            }
        }, 90 * 60 * 1000);
    }

    function subscribeStream(type) {
        switch (type) {
            case "user":
                subscribeUserStream();
                break;
            case "filter":
                subscribeFilterStream();
                break;
        }
    }

    function subscribeUserStream() {
        if (streams.user) {
            streams.user.stream("user", {thisCantBeNull: true});
        }
    }

    function subscribeFilterStream() {
        if (streams.filter && config.hashtag && config.hashtag !== "") {
            streams.filter.stream("statuses/filter", {
                track: config.hashtag
            });
        }
    }

    /**
     * Adds a Tweet to the queue.
     * @param {Object} tweet - The tweet to add.
     * @returns {undefined}
     */
    function addTweet(tweet) {
        // Reject tweets with media.
        if (tweet.extended_entities && tweet.extended_entities.media.length > 0) {
            return;
        }

        // Don't add the tweet if we already have it
        const isDupe = twitter.value.tweets.find(t => t.id_str === tweet.id_str);
        if (isDupe) {
            return;
        }

        // Parse emoji.
        tweet.text = twemoji.parse(tweet.text);

        // Replace newlines with spaces
        tweet.text = tweet.text.replace(/\n/ig, " ");

        // Highlight the hashtag.
        if (config.hashtag && config.hashtag !== "") {
            tweet.text = tweet.text.replace(new RegExp(`#${config.hashtag}`, "ig"), `<span class="hashtag">#${config.hashtag}</span>`);
        }

        // Add the tweet to the list
        twitter.value.tweets.push(tweet);
    }

    /**
     * Removes a Tweet (by id) from the queue.
     * @param {String} idToRemove - The ID string of the Tweet to remove.
     * @returns {Object} - The removed tweet. "Undefined" if tweet not found.
     */
    function removeTweetById(idToRemove) {
        if (typeof idToRemove !== "string") {
            throw new Error(`[twitter] Must provide a string ID when removing a tweet. ID provided was: ${idToRemove}`);
        }

        let removedTweet;
        twitter.value.tweets.some((tweet, index) => {
            if (tweet.id_str === idToRemove || tweet.retweetId === idToRemove) {
                removedTweet = twitter.value.tweets.splice(index, 1)[0];

                return true;
            }

            return false;
        });

        return removedTweet;
    }
};