(function () {
    "use strict";
    
    Vue.component("zd-tweet", {
        template: `<li class="zd-twitter__tweet">
            <h4>{{ tweet.user.name }}</h4>
            <p v-html="tweet.text"></p>
            <a href="#" role="button" class="zd-twitter__button zd-twitter__button--reject" @click="reject">Reject</a><a href="#" role="button" class="zd-twitter__button zd-twitter__button--accept" @click="accept">Accept</a>
        </li>`,
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
            <ul><zd-tweet v-for="tweet in twitter.tweets" :tweet="tweet"></zd-tweet></ul>
        </div>`,
        replicants: ["twitter"]
	});
})();
