(function () {
	"use strict";
    
    const app = new Vue({
        el: "#app",
        template: `<div class="zd-debug">
            <label><input type="checkbox" v-model="ticker.enabled" /> Ticker Enabled</label>
            <br />
            <label><input type="number" v-model.number.lazy="ticker.duration" style="width: 5em" /> ms</label>
            <hr />
            <label>Donation Total <input type="number" v-model.number.lazy="donations.total" style="width: 5em"></label>
            <hr />
            <button @click="addTweet">Add Tweet to Queue</button>
            <button @click="addDonation">Add Donation to Queue</button>
            <button @click="addAnonymous">Add Anonymous Donation to Queue</button>
            <button @click="addCheer">Add Cheer to Queue</button>
            <button @click="addFollow">Add Follow to Queue</button>
            <button @click="addSub">Add Sub to Queue</button>
            <button @click="clearQueue">Clear Social Queue</button>
        </div>`,
        replicants: ["donations", "queue", "ticker"],
        methods: {
            addItem: function(item) {
                this.queue.unshift(item);
                if (this.queue.length > 10) this.queue.splice(10, this.queue.length);
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
                this.addItem({
                    type: "donation",
                    id: Date.now(),
                    name: "farorescourage",
                    amount: "5.00"
                });
            },
            addAnonymous: function() {
                this.addItem({
                    type: "donation",
                    id: Date.now(),
                    name: null,
                    amount: "5.00"
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
            clearQueue: function() {
                this.queue.splice(0, this.queue.length);
            }
        }
	});
})();