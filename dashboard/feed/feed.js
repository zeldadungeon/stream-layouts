(function () {
    "use strict";

    Vue.use(VueMaterial.default);

    const app = new Vue({
        el: "#app",
        template: `<md-app><md-app-content>
            <div class="md-medium-hide" style="float: right;">
                <div style="display: inline-flex; flex-direction: column; align-items: center; margin-right: 100px;">
                    <div id="qr-wifi" style="padding: 10px; background-color: white;" />
                    <span class="md-title">WiFi</span>
                </div>
                <div style="display: inline-flex; flex-direction: column; align-items: center;">
                    <div id="qr-feed" style="padding: 10px; background-color: white;" />
                    <span class="md-title">Feed</span>
                </div>
            </div>

            <div class="md-subheading" style="line-height: 40px;">Tweets</div>
            <zd-tweet-card v-for="tweet in twitter.tweets" :key="tweet.id_str" :tweet="tweet"></zd-tweet-card>

            <div class="md-subheading" style="line-height: 40px;">Donations</div>
            <zd-donation-card v-for="donation in donations.donations" :key="donation.createdDateUTC" :donation="donation" @dismiss="dismiss"></zd-donation-card>
        </md-app-content></md-app>`,
        replicants: ["twitter", "donations"],
        methods: {
            dismiss: function(timestamp) {
                const idx = this.donations.donations.findIndex(d => d.createdDateUTC === timestamp);
                if (idx > -1) { this.donations.donations.splice(idx, 1); }
            }
        },
        mounted() {
            const localResources = nodecg.bundleConfig.localResources;
            new QRCode(document.getElementById("qr-wifi"), `WIFI:T:WPA;S:"${localResources.wifiSSID}";P:"${localResources.wifiPassword}";;`);
            new QRCode(document.getElementById("qr-feed"), `${localResources.nodecgServer}/dashboard/#fullbleed/feed`);
        }
	});
})();