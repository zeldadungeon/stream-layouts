"use strict";

const INTERVAL = 1000; // ms

module.exports = function (nodecg) {
    const stopwatch = nodecg.Replicant("stopwatch", {
        defaultValue: {
            time: 0,
            started: 0,
            state: "stopped",
            results: []
        }
    });
    
    /*
    const players = nodecg.Replicant("players", {
        defaultValue: {}
    });
    */

    let running = false;
    function step() {
        if (stopwatch.value.state === "running") {
            running = true;
            const now = Date.now();
            stopwatch.value.time = Math.floor((now - stopwatch.value.started) / INTERVAL);
            setTimeout(step, INTERVAL - (now - stopwatch.value.started) % INTERVAL);
        } else {
            running = false;
        }
    }

    if (stopwatch.value.state === "running") {
        step();
    }

    nodecg.listenFor("timer:start", () => {
        if (stopwatch.value.state !== "running") {
            stopwatch.value.state = "running";
            stopwatch.value.started = Date.now();
            if (!running) {
                step();
            }
        }
    });

    nodecg.listenFor("timer:stop", () => {
        stopwatch.value.state = "stopped";
        // Object.keys(players.value).forEach(p => players.value[p].finish = players.value[p].finish || stopwatch.value.time);
    });

    nodecg.listenFor("timer:reset", () => {
        stopwatch.value.time = 0;
        /*
        Object.keys(players.value).forEach(p => {
            players.value[p].finish = undefined;
            players.value[p].checkpoints = {};
            players.value[p].eliminated = false;
            players.value[p].danger = false;
            players.value[p].place = undefined;
            players.value[p].behind = players.value[p].offset;
            players.value[p].gained = undefined;
        });
        */
    });
};
