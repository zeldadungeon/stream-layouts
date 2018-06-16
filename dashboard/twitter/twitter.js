(function () {
    "use strict";
    
    Vue.component("zd-tweet", {
        template: `<div class="zd-twitter__tweet mdl-card mdl-shadow--2dp">
            <div class="mdl-card__title"><div class="mdl-card__title-text">{{ tweet.user.name }}</div></div>
            <div class="mdl-card__supporting-text" v-html="tweet.text"></div>
            <div class="mdl-card__actions mdl-card--border">
                <a href="#" role="button" class="zd-twitter__button zd-twitter__button--reject mdl-button mdl-button--colored" @click="reject">Reject</a>
                <a href="#" role="button" class="zd-twitter__button zd-twitter__button--accept mdl-button mdl-button--colored" @click="accept">Accept</a>
            </div>
        </div>`,
        props: ["tweet"],
        methods: {
            reject: function() {
                console.log("about to reject " + this.tweet.id_str);
                nodecg.sendMessage("twitter:reject", this.tweet.id_str);
            },
            accept: function() {
                console.log("about to accept " + this.tweet);
                nodecg.sendMessage("twitter:accept", this.tweet.id_str);
            }
        }
    });

    const app = new Vue({
        el: "#app",
        template: `<div class="zd-twitter">
            <zd-tweet v-for="tweet in twitter.tweets" :tweet="tweet"></zd-tweet>
        </div>`,
        replicants: ["twitter"]
	});
})();
