(function () {
    "use strict";
    
    Vue.component("zd-donation", {
        template: `<li class="zd-donations__donation" :class="donationClass">
            <h4>{{ donation.donorName }}</h4>
            <strong>\${{ donation.donationAmount }}</strong>
            <p>{{ donation.message }}</p>
            <a href="#" role="button" class="zd-donations__button zd-donations__button--read" @click.prevent="markRead">Read</a><a href="#" role="button" class="zd-donations__button zd-donations__button--processed" @click.prevent="markProcessed">Processed</a>
        </li>`,
        props: ["donation"],
        computed: {
            donationClass: function() {
                return {
                    "zd-donations__donation--read": this.donation.read,
                    "zd-donations__donation--processed": this.donation.processed
                };
            }
        },
        methods: {
            markRead: function() {
                if (this.donation.read === undefined) {
                    this.$set(this.donation, "read", true);
                } else {
                    this.donation.read = !this.donation.read;
                }
            },
            markProcessed: function() {
                if (this.donation.processed == undefined) {
                    this.$set(this.donation, "processed", true);
                } else {
                    this.donation.processed = !this.donation.processed;
                }
            }
        }
    });

    const app = new Vue({
        el: "#app",
        template: `<div class="zd-donations">
            <input type="checkbox" id="enable-donations" v-model="donations.enabled">
            <label for="enable-donations">Enable Donations Link</label>
            <ul><zd-donation v-for="donation in donations.donations" :donation="donation"></zd-donation></ul>
        </div>`,
        replicants: {
            donations: {
                enabled: false,
                total: 0,
                donations: []
            }
        },
        created: function() {
            console.log(this.donations);
        }
    });
})();