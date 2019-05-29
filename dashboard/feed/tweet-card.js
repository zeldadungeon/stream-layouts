(function () {
    "use strict";

    Vue.use(VueMaterial.default);
    
    Vue.component("zd-tweet-card", {
        template: `<md-card>
            <md-card-header>
                <md-card-header-text>
                    <div class="md-title">{{ tweet.user.name }}</div>
                </md-card-header-text>
            </md-card-header>

            <md-card-content v-html="tweet.text">
            </md-card-content>

            <md-card-actions md-alignment="space-between">
                <md-button class="md-raised md-accent" @click="reject">Reject</md-button>
                <md-button class="md-raised md-primary" @click="accept">Accept</md-button>
            </md-card-actions>
        </md-card>`,
        props: ["tweet"],
        methods: {
            reject: function() {
                nodecg.sendMessage("twitter:reject", this.tweet.id_str);
            },
            accept: function() {
                nodecg.sendMessage("twitter:accept", this.tweet.id_str);
            }
        }
    });
})();
