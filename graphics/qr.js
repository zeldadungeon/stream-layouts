(function() {
    "use strict";

    const app = new Vue({
        el: "#app",
        data: {
            arg: decodeURIComponent(window.location.search.substring(1)) || "",
            qrData: {
                WiFi: `WIFI:T:WPA;S:"${nodecg.bundleConfig.localResources.wifiSSID}";P:"${nodecg.bundleConfig.localResources.wifiPassword}";;`,
                Dashboard: `${nodecg.bundleConfig.localResources.nodecgServer}/dashboard/#fullbleed/feed`
            }
        },
        mounted() {
            new QRCode(document.getElementById("qr"), { text: this.qrData[this.arg], width: 800, height: 800 });
        }
    });
})();