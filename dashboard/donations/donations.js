(function () {
    "use strict";
    
    Vue.component("zd-donation", {
        template: `<li class="zd-donations__donation">
            <h4>{{ donation.donorName }}</h4>
            <strong>\${{ donation.donationAmount }}</strong>
            <p>{{ donation.message }}</p>
            <a href="#" role="button" class="zd-donations__button" @click.prevent="dismiss">Processed</a>
        </li>`,
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
            <ul><zd-donation v-for="donation in donations.donations" :key="donation.timestamp" :donation="donation" @dismiss="dismiss"></zd-donation></ul>
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