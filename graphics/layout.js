(function() {
    "use strict";

    const app = new Vue({
        el: "#app",
        data: {
            runName: decodeURIComponent(window.location.search.substring(1).split("&")[0]) || ""
        }
    });
})();