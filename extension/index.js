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

    function incrementPlayerRequired(playerName) {
        let player = runs.value['Link Between Worlds'].racers.find(r => r.name === playerName);
        console.log(JSON.stringify(player));
        player.required = (player.required || 0) + 1;
    }

    function incrementAllPlayersRequired() {
        runs.value['Link Between Worlds'].racers.forEach(r => {
            r.required = (r.required || 0) + 1;
        });
    }

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
            // TODO design this better using event handlers or something and not in index.js
            if (event.type === 'donation')
            {
                const currentRun = runs.value[runs.value.start && runs.value.start.current];
                if (currentRun && currentRun.state === 'running' && currentRun.rules === 'Teams' && currentRun.teamRotationMode === 'Donations') {
                    for (let racer of currentRun.racers) {
                        console.log(JSON.stringify(racer));
                        racer.currentRacer = ((racer.currentRacer || 0) + 1) % racer.members.length;
                    }
                }

                if (event.rewardId != undefined) {
                    switch (event.rewardId) {
                        case 102541:
                            incrementAllPlayersRequired();
                            break;
                        case 102542:
                            incrementPlayerRequired('Rod');
                            break;
                        case 102543:
                            incrementPlayerRequired('Corey');
                            break;
                        case 102544:
                            incrementPlayerRequired('Sean');
                            break;
                        case 102545:
                            incrementPlayerRequired('Gooey');
                            break;
                        case 102546:
                            incrementPlayerRequired('Mases');
                            break;
                        case 102547:
                            incrementPlayerRequired('Josh');
                            break;
                    }
                }
            }

            // Schedule the display of the next event
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
    require("./tiltify")(nodecg, enqueue);
    require("./bingo")(nodecg);
    require("./masks")(nodecg);

    if (nodecg.bundleConfig.twitch) {
        require("./twitch")(nodecg, enqueue);
    }

    if (nodecg.bundleConfig.twitter) {
        require("./twitter")(nodecg, enqueue);
    }
}