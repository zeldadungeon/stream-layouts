(function() {
    "use strict";

    const app = new Vue({
        el: "#app",
        template: `<zd-player :num="num" :pos="pos" :run-name="runName"></zd-player>`,
        data: {
            num: Number(window.location.search.substring(1).split('&')[0]) - 1,
            pos: window.location.search.substring(1).split("&")[1] || "topleft",
            runName: decodeURIComponent(window.location.search.substring(1).split("&")[2]) || ""
        }
    });
})();