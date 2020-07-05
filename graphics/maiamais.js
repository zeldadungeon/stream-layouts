(function() {
    "use strict";

    const app = new Vue({
        el: "#app",
        template: `<zd-maiamais :num="num" :run-name="runName"></zd-maiamais>`,
        data: {
            num: Number(window.location.search.substring(1).split('&')[0]) - 1,
            runName: decodeURIComponent(window.location.search.substring(1).split("&")[1]) || ""
        }
    });
})();