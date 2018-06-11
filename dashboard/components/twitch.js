(function () {
    "use strict";

    Vue.component("zd-twitch", {
        template: `<div><div>{{ twitch }}</div><div>{{ bits }}</div><button @click="clearQueue">Clear Social Queue</button></div>`,
        replicants: ["twitch", "bits", "queue"],
        methods: {
            clearQueue: function() {
                this.queue.splice(0,this.queue.length);
            }
        }
    });
})();
