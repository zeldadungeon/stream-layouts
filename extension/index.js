"use strict";

module.exports = function(nodecg) {
    nodecg.Replicant("players", {
        defaultValue: {}
    });

    require("./timer")(nodecg);
    require("./ticker")(nodecg);
    require("./donations")(nodecg);

    if (nodecg.bundleConfig.twitch) {
        require("./twitch")(nodecg);
    }

    if (nodecg.bundleConfig.twitter) {
        require("./twitter")(nodecg);
    }
}