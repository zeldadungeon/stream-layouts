"use strict";

const request = require("request-promise");
const TwitchPubSub = require("twitchps");

module.exports = function (nodecg, enqueue) {
    const BITS_TOTAL_UPDATE_INTERVAL = 10 * 1000;
    const FOLLOWERS_UPDATE_INTERVAL = 10 * 1000;
    const config = nodecg.bundleConfig.twitch;
    const log = new nodecg.Logger(`${nodecg.bundleName}:twitch`);

    const twitch = nodecg.Replicant("twitch", {
        defaultValue: {
            enabled: false,
            live: false,
            title: "",
            game: null,
            event: null
        }
    });

    const bits = nodecg.Replicant("bits", {
        defaultValue: {
            total: 0,
            offset: 0
        }
    });

    const pubsub = new TwitchPubSub({
        init_topics: [{
            topic: `channel-bits-events-v1.${config.channelId}`,
            token: config.oauthToken
        }, {
            topic: `channel-subscribe-events-v1.${config.channelId}`,
            token: config.oauthToken
        }, {
            topic: `video-playback.${config.channelName}`
        }],
        reconnect: true,
        debug: false
    });

    
    twitch.on("change", (newVal, oldVal) => {
        const gameChanged = newVal.game && oldVal && oldVal.game && (
            newVal.game.fullTitle !== oldVal.game.fullTitle ||
            newVal.game.subtitle !== oldVal.game.subtitle ||
            newVal.game.initials !== oldVal.game.initials);

        if (gameChanged) {
            putStreamInfo(config.template
                .replace("${fullTitle}", newVal.game && newVal.game.fullTitle || "")
                .replace("${subtitle}", newVal.game && newVal.game.subtitle || "")
                .replace("${initials}", newVal.game && newVal.game.initials || ""),
                newVal.game.id);
        }
    });

    pubsub.on("connected", () => {
        log.info("Connected to Twitch PubSub.");
    });

    pubsub.on("disconnected", () => {
        log.warn("Disconnected from Twitch PubSub.");
    });

    pubsub.on("reconnect", () => {
        log.info("Reconnecting to Twitch PubSub...");
    });

    pubsub.on("stream-up", event => {
        /*
        time - {integer} 
        channel_name- {string}
        play_delay - {string}
        */
        twitch.value.live = true;
    });

    pubsub.on("stream-down", event => {
        /*
        time - {integer} 
        channel_name- {string}
        */
        twitch.value.live = false;
    });

    pubsub.on("bits", cheer => {
        /*
        bits_used - {integer} 
        channel_id - {string} 
        channel_name - {string}
        chat_message - {string}
        context - {string} 
        message_id - {string} 
        message_type - {string}
        time - {string}
        total_bits_used - {integer} 
        user_id - {string} 
        user_name - {string}
        version - {string}
        */
       enqueue({
           type: "cheer",
           id: cheer.time,
           name: cheer.user_name,
           bits: cheer.bits_used
       });
    });

    pubsub.on("subscribe", sub => {
        /*
        user_name - {string} 
        display_name - {string} 
        channel_name - {string}
        user_id - {string} 
        channel_id- {string}
        time- {string}
        sub_plan- {string}
        sub_plan_name - {string}
        months - {integer}
        context - {string}
        sub_message - {object}
        sub_message.message - {string}
        sub_message.emotes - {array}
        */
       enqueue({
           type: "sub",
           id: sub.time,
           name: sub.display_name
       });
    });

    function getChannelStatus() {
        request({
            method: "get",
            uri: `https://api.twitch.tv/helix/streams?user_id=${config.channelId}`,
            headers: {
                Authorization: `Bearer ${config.oauthToken}`,
                "Client-ID": config.clientId,
                "Content-Type": "application/json"
            },
            json: true
        }).then(res => {
            twitch.value.live = !!(res && res.data && res.data.length > 0)
        }).catch(err => {
            log.error("Failed to get stream live status:\n\t", err);
            twitch.value.live = false;
        });
    }

    function getBitsTotal() {
        const query = twitch.value.event ? `?event=${twitch.value.event}` : "";
        request({
            method: "get",
            uri: `https://api.twitch.tv/bits/channels/${config.channelId}${query}`,
            headers: {
                Accept: "application/vnd.twitchtv.v5+json",
                Authorization: `OAuth ${config.oauthToken}`,
                "Client-ID": config.clientId,
                "Content-Type": "application/json"
            },
            json: true
        }).then(res => {
            const total = res.total;
            if (typeof res.total !== "number" || Number.isNaN(total)) {
                throw `Bits total was an unexpected value: ${res}`;
            }

            bits.value.total = total - bits.value.offset;
        }).catch(err => {
            log.error("Failed to update bits total:\n\t", err);
        });
    }

    let followers; // cache of user IDs that are already followed (recently)
    function getFollowers() {
        request({
            method: "get",
            uri: `https://api.twitch.tv/helix/channels/followers?broadcaster_id=${config.channelId}`,
            headers: {
                Authorization: `Bearer ${config.oauthToken}`,
                "Client-ID": config.clientId,
                "Content-Type": "application/json"
            },
            json: true
        }).then(res => {
            if (!res || !res.data || res.data.length === 0) { return; }
            if (followers == undefined) {
                // first call, just populate the cache and don't send any events
                followers = res.data.map(f => f.from_id);
                return;
            }

            // iterate backwards to get oldest first
            for (let i = res.data.length - 1; i >= 0; --i) {
                const follow = res.data[i];
                if (followers.indexOf(follow.from_id) === -1) {
                    followers.push(follow.from_id);
                    enqueue({
                        type: "follow",
                        id: follow.followed_at,
                        name: follow.from_name
                    });
                }
            }
        }).catch(err => {
            log.error("Failed to get follows:\n\t", err);
        });
    }

    function putStreamInfo(title, game) {
        const update = {
            title: title,
            game_id: game
        };
        log.info("Updating Twitch title and game to", update);
        request({
            method: "patch",
            uri: `https://api.twitch.tv/helix/channels?broadcaster_id=${config.channelId}`,
            headers: {
                Authorization: `Bearer ${config.oauthToken}`,
                "Client-ID": config.clientId,
                "Content-Type": "application/json"
            },
            body: update,
            json: true
        }).then(() => {
            log.info("Successfully updated Twitch title and game to", update);
        }).catch(err => {
            log.error("Failed updating Twitch title and game:\n\t", err);
        });
    }

    getChannelStatus();
    // updateBitsTotal();
    // setInterval(updateBitsTotal, BITS_TOTAL_UPDATE_INTERVAL);
    getFollowers();
    setInterval(getFollowers, FOLLOWERS_UPDATE_INTERVAL);
}