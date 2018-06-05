(function () {
    "use strict";
    
    Vue.component("zd-timer", {
        template: `<div class="zd-timer" :class="{ "zd-timer--running": stopwatch.state == "running" }">{{ display }}</div>`,
        replicants: ["stopwatch"],
        computed: {
            display: function() {
                const time = this.stopwatch.time || 0;
                const h = Math.floor(time / 3600);
                const m = Math.floor(time % 3600 / 60);
                const s = Math.floor(time % 3600 % 60);

                return `${h}:${m < 10 ? "0" : ""}${m}:${s < 10 ? "0" : ""}${s}`;
            }
        }
    });
})();
