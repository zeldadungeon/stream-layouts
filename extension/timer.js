"use strict";

const NanoTimer = require("nanotimer");
const timer = new NanoTimer();

module.exports = function (nodecg) {
    const stopwatch = nodecg.Replicant("stopwatch", {
        defaultValue: {
            time: 0,
            state: "stopped",
            results: []
        }
    });

    nodecg.listenFor("timer:start", () => {
        if (stopwatch.value.state != "running") {
            stopwatch.value.state = "running";
            timer.setInterval(() => {
                ++stopwatch.value.time;
            }, "", "1s");
        }
    });

    nodecg.listenFor("timer:lap", position => {
        stopwatch.value.results[position] = stopwatch.value.time;
    });

    nodecg.listenFor("timer:stop", () => {
        stopwatch.value.state = "stopped";
        timer.clearInterval();
    });

    nodecg.listenFor("timer:reset", () => {
        stopwatch.value.time = 0;
        stopwatch.value.results = [];
    });
};
