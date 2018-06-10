(function() {
    "use strict";

    const app = new Vue({
        el: "#app",
        template: `<zd-player :num="num"></zd-player>`,
        data: {
            num: Number(window.location.search.substring(1)) - 1
        }
    });
})();