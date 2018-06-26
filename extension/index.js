"use strict";

module.exports = function(nodecg) {
    require("./timer")(nodecg);
    require("./ticker")(nodecg);
    require("./donations")(nodecg);
    require("./bingo")(nodecg);

    if (nodecg.bundleConfig.twitch) {
        require("./twitch")(nodecg);
    }

    if (nodecg.bundleConfig.twitter) {
        require("./twitter")(nodecg);
    }
}