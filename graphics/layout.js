(function() {
    "use strict";

    const app = new Vue({
        el: "#app",
        replicants: ["runs"],
        data: {
            runName: decodeURIComponent(window.location.search.substring(1).split("&")[0]) || "",
            showTimer: decodeURIComponent(window.location.search.substring(1).split("&")[1]) !== "false"
        },
        computed: {
            run() {
                return this.runs && this.runs[this.runName || this.runs.start && this.runs.start.current] || { racers: [] };
            }
        }
    });
})();