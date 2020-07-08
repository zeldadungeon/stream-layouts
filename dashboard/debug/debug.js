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
            <label><input v-model="donation.displayName" /> Name</label><label><input v-model="donation.amount" /> Amount</label><label><input v-model="donation.message" /> Message</label>
            <br />
            <button @click="addDonation">Add Donation</button>
            <hr />
            <label><input type="checkbox" v-model="twitter.enabled" /> Twitter Link Enabled</label>
            <br />
            <button @click="clearTweets">Clear Tweets</button>
            <hr />
            <label><input type="checkbox" v-model="twitch.enabled" /> Twitch Link Enabled</label>
            <hr />
            <button @click="addTweet">Add Tweet to Queue</button>
            <button @click="addCheer">Add Cheer to Queue</button>
            <button @click="addFollow">Add Follow to Queue</button>
            <button @click="addSub">Add Sub to Queue</button>
            <hr />
            <label>Raised during MM <input type="number" v-model.number.lazy="masks.raised" style="width: 6em"></label>
        </div>`,
        replicants: ["donations", "ticker", "twitter", "twitch", "masks"],
        data() {
            return {
                donation: {}
            }
        },
        methods: {
            addItem: function(item) {
                nodecg.sendMessage("events:queue", item);
            },
            addTweet: function() {
                this.addItem({
                    type: "tweet",
                    id: Date.now(),
                    name: "nayruslove",
                    text: `I'm watching <span class="hashtag">#ZDMarathon</span>!`
                });
            },
            addDonation: function() {
                nodecg.sendMessage("donations:debug", {
                    createdDateUTC: new Date().toISOString(),
                    displayName: this.donation.displayName,
                    amount: Number(this.donation.amount),
                    message: this.donation.message
                });
            },
            addCheer: function() {
                this.addItem({
                    type: "cheer",
                    id: Date.now(),
                    name: "dinspower",
                    bits: 5
                });
            },
            addFollow: function() {
                this.addItem({
                    type: "follow",
                    id: Date.now(),
                    name: "dinspower"
                });
            },
            addSub: function() {
                this.addItem({
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