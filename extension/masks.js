"use strict";

module.exports = function (nodecg) {
    const requirements = {};
    [
        "Mask of Scents",
        "Romani's Mask",
        "All-Night Mask",
        "Don Gero's Mask",
        "Bremen Mask",
        "Bunny Hood",
        "Mask of Truth",
        "Stone Mask",
        "Great Fairy's Mask",
        "Blast Mask",
        "Kamaro's Mask",
        "Troupe Leader's Mask"
    ].forEach((m, i) => {
        requirements[m] = 20 * (i + 1);
    });
    ["Kafei's Mask", "Keaton Mask", "Postman's Hat", "Couple's Mask", "Fierce Deity's Mask"].forEach(m => requirements[m] = 300);
    ["Deku Mask", "Goron Mask", "Zora Mask", "Captain's Hat", "Garo's Mask", "Gibdo Mask", "Giant's Mask"].forEach(m => requirements[m] = 0);

    const grid = [
        ["Postman's Hat", "All-Night Mask", "Blast Mask", "Stone Mask", "Great Fairy's Mask", "Deku Mask"],
        ["Keaton Mask", "Bremen Mask", "Bunny Hood", "Don Gero's Mask", "Mask of Scents", "Goron Mask"],
        ["Romani's Mask", "Troupe Leader's Mask", "Kafei's Mask", "Couple's Mask", "Mask of Truth", "Zora Mask"],
        ["Kamaro's Mask", "Gibdo Mask", "Garo's Mask", "Captain's Hat", "Giant's Mask", "Fierce Deity's Mask"]
    ].map(row => row.map(m => ({
        name: m,
        requires: requirements[m],
        done: []
    })))

    const masks = nodecg.Replicant("masks", {
        defaultValue: {
            grid,
            totalAtStart: 0,
            raised: 0
        }
    });

    const donations = nodecg.Replicant("donations");

    donations.on("change", (newValue, oldValue) => {
        masks.value.raised = newValue.total - masks.value.totalAtStart;
    });

    nodecg.listenFor("masks:reset", () => {
        masks.value = {
            grid,
            totalAtStart: donations.value.total,
            raised: 0
        };
    });
};