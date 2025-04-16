(function () {
    "use strict";

    Vue.use(VueMaterial.default);

    const app = new Vue({
        el: "#app",
        template: `<md-app><md-app-content>
            <div class="md-subheading" style="line-height: 40px;">Tweets</div>
            <zd-tweet-card v-for="tweet in twitter.tweets" :key="tweet.id_str" :tweet="tweet"></zd-tweet-card>

            <div class="md-subheading" style="line-height: 40px;">Donations</div>
            <zd-donation-card v-for="donation in donations.donations" :key="donation.id" :donation="donation" @dismiss="dismiss"></zd-donation-card>
        </md-app-content></md-app>`,
        replicants: ["twitter", "donations"],
        methods: {
            dismiss: function(id) {
                const idx = this.donations.donations.findIndex(d => d.id === id);
                if (idx > -1) { this.donations.donations.splice(idx, 1); }
            }
        }
	});
})();