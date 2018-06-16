(function () {
    "use strict";
    
    Vue.component("zd-donation", {
        template: `<div class="zd-donations__donation mdl-card mdl-shadow--2dp">
            <div class="mdl-card__title">
                <h4 class="mdl-card__title-text">{{ donation.donorName }}</h4>
                <small class="mdl-card__subtitle-text">\${{ donation.donationAmount }}</small>
            </div>
            <div class="mdl-card__supporting-text">{{ donation.message }}</div>
            <div class="mdl-card__actions mdl-card--border">
                <a href="#" role="button" class="zd-donations__button mdl-button mdl-button--colored" @click.prevent="dismiss">Processed</a>
            </div>
        </div>`,
        props: ["donation"],
        methods: {
            dismiss: function() {
                this.$emit('dismiss', this.donation.timestamp);
            }
        }
    });

    const app = new Vue({
        el: "#app",
        template: `<div class="zd-donations">
            <zd-donation v-for="donation in donations.donations" :key="donation.timestamp" :donation="donation" @dismiss="dismiss"></zd-donation>
        </div>`,
        replicants: ["donations"],
        methods: {
            dismiss: function(timestamp) {
                const idx = this.donations.donations.findIndex(d => d.timestamp === timestamp);
                if (idx > -1) { this.donations.donations.splice(idx, 1); }
            }
        }
    });
})();