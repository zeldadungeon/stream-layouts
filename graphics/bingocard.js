(function() {
    "use strict";

    const app = new Vue({
        el: "#app",
        template: `<zd-bingo-card :num="num"></zd-bingo-card>`,
        data: {
            num: Number(window.location.search.substring(1).split('&')[0]) - 1
        }
    });
})();