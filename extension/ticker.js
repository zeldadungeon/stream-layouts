"use strict";

module.exports = function (nodecg) {
    const template = [{
        message: "Welcome to the Zelda Dungeon Marathon!"
    }, {
        template: "games"
    }, {
        message: "[Extra Life - How to donate - include filename - testing a really long message that doesn't fit on one line]"
    }, {
        template: "incentives"
    }];

    const queue = [];

    const ticker = nodecg.Replicant("ticker", {
        defaultValue: {
            enabled: false,
            duration: 10000,
            tick: 0,
            lines: []
        }
    });

    const message = nodecg.Replicant("message", {
        defaultValue: { message: "" }
    });

    const runs = nodecg.Replicant("runs", {
        defaultValue: { start: { next: undefined } }
    });

    ticker.on("change", (newValue, oldValue) => {
        if (newValue.enabled && (!oldValue || !oldValue.enabled)) {
            tick();
        }
    });

    function tick() {
        if (ticker.value.enabled) {
            advanceQueue();
            ticker.value.tick++;
            setTimeout(tick, ticker.value.duration);
        }
    }

    function advanceQueue() {
        if (queue.length === 0) {
            const nextTemplate = template.shift();
            template.push(nextTemplate);
            if (nextTemplate.template === "games") {
                let done = [];
                let ptr = runs.value["start"].next;
                while (ptr && runs.value[ptr].state === "done") {
                    done.push(runs.value[ptr].abbr);
                    ptr = runs.value[ptr].next;
                }
                if (done.length > 0) {
                    queue.push({
                        label: "Completed",
                        message: done.join(", ")
                    });
                }
                if (ptr) {
                    queue.push({
                        label: "Now playing",
                        message: ptr
                    });
                    ptr = runs.value[ptr].next;
                    if (ptr) {
                        queue.push({
                            label: "Next up",
                            message: ptr
                        });
                    }
                }
            } else if (nextTemplate.template === "incentives") {
                let ptr = runs.value["start"].current;
                while (ptr && queue.length < 3) {
                    if (runs.value[ptr].incentives && runs.value[ptr].incentives.length > 0) {
                        runs.value[ptr].incentives.forEach(incentive => {
                            if (Object.keys(incentive.options).length > 0) {
                                queue.push({
                                    label: `${ptr} - ${incentive.name}`,
                                    message: Object.keys(incentive.options)
                                        .sort((a, b) => incentive.options[b] - incentive.options[a])
                                        .filter((v, i, a) => incentive.options[v] >= (incentive.options[a[runs.value[ptr].racers.length - 1]] || 0))
                                        .map((v, i, a) => {
                                            const result = `${v} $${incentive.options[v].toFixed(2)}`;
                                            return a.length > runs.value[ptr].racers.length && incentive.options[v] === incentive.options[a[runs.value[ptr].racers.length - 1]] ?
                                                `<strong>${result}</strong>` : result;
                                        })
                                        .join(` <strong>〉</strong>`)
                                });
                            }
                        });
                    }
                    ptr = runs.value[ptr].next;
                }
                if (queue.length === 0) {
                    advanceQueue(); // no incentives left
                }
            } else {
                queue.push(nextTemplate);
            }
        }

        message.value = queue.shift();
    }
};