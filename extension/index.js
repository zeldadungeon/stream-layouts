"use strict";

module.exports = function(nodecg) {
    // defaults
    const players = nodecg.Replicant("players", {
        defaultValue: {}
    });
    const runs = nodecg.Replicant("runs", {
        defaultValue: {
            start: {
                next: undefined,
                current: undefined
            }
        }
    });

    let idle = true;
    const queue = [];
    const displayedEvent = nodecg.Replicant("social_event");
    const ticker = nodecg.Replicant("ticker");

    function enqueue(event) {
        queue.push(event);
        if (idle) {
            idle = false;
            showEvent();
        }
    }

    function showEvent() {
        const event = queue.shift();
        displayedEvent.value = event;
        if (event) {
            setTimeout(showEvent, ticker.value.duration);
        } else {
            idle = true;
        }
    }

    nodecg.listenFor("events:queue", d => {
        enqueue(d);
    });

    require("./timer")(nodecg);
    require("./ticker")(nodecg);
    require("./donations")(nodecg, enqueue);
    require("./bingo")(nodecg);

    if (nodecg.bundleConfig.twitch) {
        require("./twitch")(nodecg, enqueue);
    }

    if (nodecg.bundleConfig.twitter) {
        require("./twitter")(nodecg, enqueue);
    }
}