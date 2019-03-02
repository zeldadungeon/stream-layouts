"use strict";

module.exports = function (nodecg) {
    let idle = true;
    const queue = [];
    const displayedEvent = nodecg.Replicant("social_event");
    const ticker = nodecg.Replicant("ticker");

    console.log("listening for queue");
    nodecg.listenFor("events:queue", event => {
        console.log("queueing ", event);
        queue.push(event);
        if (idle) {
            idle = false;
            showEvent();
        }
    });
    console.log("listened for queue");

    function showEvent() {
        const event = queue.shift();
        displayedEvent.value = event;
        if (event) {
            setTimeout(showEvent, ticker.value.duration);
        } else {
            idle = true;
        }
    }
};