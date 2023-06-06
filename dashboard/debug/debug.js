(function () {
	"use strict";
    
    const app = new Vue({
        el: "#app",
        template: `<div class="zd-debug">
            <label><input type="checkbox" v-model="ticker.enabled" /> Ticker Enabled</label>
            <br />
            <label><input type="number" v-model.number.lazy="ticker.duration" style="width: 6em" /> ms</label>
            <hr />
            <label><input type="checkbox" v-model="donations.enabled" /> Donations Link Enabled</label>
            <br />
            <label>Donation Total <input type="number" v-model.number.lazy="donations.total" style="width: 6em"></label>
            <br />
            <label>Last donation <input type="number" v-model.number.lazy="donations.lastDonation" style="width: 6em"></label>
            <br />
            <button @click="clearDonations">Clear Donations</button>
            <br />
            <label><input v-model="donation.displayName" /> Name</label>
            <label><input v-model="donation.amount" /> Amount</label>
            <label><input v-model="donation.message" /> Msg</label>
            <label><input v-model.number.lazy="donation.rewardId" /> Reward</label>
            <br />
            <button @click="addDonation">Add Donation</button>
            <hr />
            <label><input type="checkbox" v-model="twitter.enabled" /> Twitter Link Enabled</label>
            <br />
            <label><input v-model="tweet.text" /> Text</label>
            <br />
            <button @click="addTweet">Add Tweet</button>
            <br />
            <button @click="clearTweets">Clear Tweets</button>
            <hr />
            <label><input type="checkbox" v-model="twitch.enabled" /> Twitch Link Enabled</label>
            <hr />
            <button @click="queueTweet">Add Tweet to Queue</button>
            <button @click="queueCheer">Add Cheer to Queue</button>
            <button @click="queueFollow">Add Follow to Queue</button>
            <button @click="queueSub">Add Sub to Queue</button>
            <hr />
            <label>Raised during MM <input type="number" v-model.number.lazy="masks.raised" style="width: 6em"></label>
        </div>`,
        replicants: ["donations", "ticker", "twitter", "twitch", "masks"],
        data() {
            return {
                donation: {},
                tweet: {}
            }
        },
        methods: {
            queueItem: function(item) {
                nodecg.sendMessage("events:queue", item);
            },
            addDonation: function() {
                nodecg.sendMessage("donations:debug", {
                    createdDateUTC: new Date().toISOString(),
                    displayName: this.donation.displayName,
                    amount: Number(this.donation.amount),
                    message: this.donation.message,
                    rewardId: this.donation.rewardId
                });
            },
            addTweet: function() {
                const id = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
                nodecg.sendMessage("twitter:debug", {
                    id: id,
                    id_str: `${id}`,
                    text: this.tweet.text,
                    user: {screen_name: "test", name: "name"}
                });
            },
            queueTweet: function() {
                this.queueItem({
                    type: "tweet",
                    id: Date.now(),
                    name: "nayruslove",
                    text: `I'm watching <span class="hashtag">#ZDMarathon</span>!`
                });
            },
            queueCheer: function() {
                this.queueItem({
                    type: "cheer",
                    id: Date.now(),
                    name: "dinspower",
                    bits: 5
                });
            },
            queueFollow: function() {
                this.queueItem({
                    type: "follow",
                    id: Date.now(),
                    name: "dinspower"
                });
            },
            queueSub: function() {
                this.queueItem({
                    type: "sub",
                    id: Date.now(),
                    name: "dinspower"
                });
            },
            clearTweets: function() {
                this.twitter.tweets.splice(0, this.twitter.tweets.length);
            },
            clearDonations: function() {
                this.donations.donations.splice(0, this.donations.donations.length);
            },
        }
	});
})();