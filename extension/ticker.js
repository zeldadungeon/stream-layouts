﻿"use strict";

module.exports = function (nodecg) {
    const template = [{
        message: "Welcome to the Zelda Dungeon Marathon supporting No Kid Hungry!"
    }, {
    //    template: "games"
    //}, {
        label: 'Follow us',
        message: '<img src="../shared/images/youtube_social_icon_red.png" /> &nbsp; <img src="../shared/images/X.svg" /> &nbsp; <img src="../shared/images/flogo_RGB_HEX-72.svg" /> &nbsp; <img src="../shared/images/Tiktok.webp" /> ZeldaDungeon &nbsp; <img src="../shared/images/instagram.png" style="transform: scale(1.4)" /> Zelda_Dungeon &nbsp; <img src="../shared/images/Discord-Logo-Color.svg" /> discord.io/zelda'
    }, {
        message: "Donate, view the schedule, and more at zeldadungeon.net/marathon"
    }, {
        message: "Donate $20 or more to move a game one spot in the ranking - tinyurl.com/zdmranking"
    }, {
        message: "Include a game and filename in your donation message - we'll use the ones with the highest total"
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
        defaultValue: {}
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
                const runNames = Object.keys(runs.value).filter(r => r !== "start");
                const done = runNames.filter(r => runs.value[r].state === "done" && runs.value[r].abbr).map(r => runs.value[r].abbr);
                if (done.length > 0) {
                    queue.push({
                        label: "Completed",
                        message: done.join(", ")
                    });
                }
                if (runs.value.start.current) {
                    queue.push({
                        label: "Now playing",
                        message: runs.value.start.current
                    });
                    if (runs.value[runs.value.start.current] && runs.value[runs.value.start.current].next) {
                        queue.push({
                            label: "Next up",
                            message: runs.value[runs.value.start.current].next
                        });
                    }
                }
            } else if (nextTemplate.template === "incentives") {
                let ptr = runs.value.start.current;
                if (ptr && runs.value[ptr]) {
                    while (ptr && queue.length < 3) {
                        if (runs.value[ptr].incentives && runs.value[ptr].incentives.length > 0) {
                            runs.value[ptr].incentives.forEach(incentive => {
                                const options = Object.keys(incentive.options);
                                queue.push({
                                    label: `${ptr} - ${incentive.name}`,
                                    message: options.length === 0 ? "No donations yet!" : options
                                        .sort((a, b) => incentive.options[b] - incentive.options[a])
                                        .filter((v, i, a) => incentive.options[v] >= (incentive.options[a[runs.value[ptr].racers.length - 1]] || 0))
                                        .map((v, i, a) => {
                                            const result = `${v} $${incentive.options[v].toFixed(2)}`;
                                            return a.length > runs.value[ptr].racers.length && incentive.options[v] === incentive.options[a[runs.value[ptr].racers.length - 1]] ?
                                                `<strong>${result}</strong>` : result;
                                        })
                                        .join(` <strong>〉</strong>`)
                                });
                            });
                        }
                        ptr = runs.value[ptr].next;
                    }
                }
                if (queue.length === 0) {
                    advanceQueue(); // no incentives left
                    return;
                }
            } else {
                queue.push(nextTemplate);
            }
        }

        message.value = queue.shift();
    }
};