"use strict";

module.exports = function (nodecg) {
    const ticker = nodecg.Replicant("ticker", {
        defaultValue: {
            enabled: false,
            duration: 10000,
            tick: 0,
            lines: []
        }
    });

    ticker.on("change", (newValue, oldValue) => {
        if (newValue.enabled && (!oldValue || !oldValue.enabled)) {
            tick();
        }
    });

    function tick() {
        if (ticker.value.enabled) {
            ticker.value.tick++;
            setTimeout(tick, ticker.value.duration);
        }
    }
};