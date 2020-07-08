(function() {
    "use strict";

    const app = new Vue({
        el: "#app",
        template: `<zd-masks :num="num"></zd-masks>`,
        data: {
            num: Number(window.location.search.substring(1).split('&')[0]) - 1
        }
    });
})();