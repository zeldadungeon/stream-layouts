(function() {
    "use strict";

    const app = new Vue({
        el: "#app",
        template: `<zd-bingo-shared :type="type" :orientation="orientation"></zd-bingo-shared>`,
        data: {
            type: (window.location.search.substring(1).split('&')[0] || "").startsWith("r") ? "required" : "bonus",
            orientation: (window.location.search.substring(1).split('&')[1] || "").startsWith("h") ? "horizontal" : "vertical"
        }
    });
})();