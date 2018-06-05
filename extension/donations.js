"use strict";

const request = require("request-promise");
const POLL_INTERVAL = 60 * 1000;

module.exports = function (nodecg) {
    const config = nodecg.bundleConfig.extralife;
	const log = new nodecg.Logger(`${nodecg.bundleName}:donations`);
    
    const donations = nodecg.Replicant("donations", {
        defaultValue: {
            enabled: false,
            total: 0,
            donations: [],
            wars: []
        }
    });

    donations.on("change", (newValue, oldValue) => {
        if (newValue.enabled && (!oldValue || !oldValue.enabled)) {
            poll();
        }
    });

    function poll() {
        if (donations.value.enabled) {
            request({
                method: "get",
                uri: `https://www.extra-life.org/index.cfm?fuseaction=donorDrive.participant&format=json&participantID=${config.participantId}`,
                json: true
            }).then(res => {
                if (res.totalRaisedAmount !== donations.value.total) {
                    donations.value.total = res.totalRaisedAmount;
                    getDonations();
                }
            }).catch(err => {
                log.error("Failed to get donation total:\n\t", err);
            });
            
            setTimeout(poll, POLL_INTERVAL);
        }
    }

    function getDonations() {
        request({
			method: "get",
			uri: `https://www.extra-life.org/index.cfm?fuseaction=donorDrive.participantDonations&format=json&participantID=${config.participantId}`,
			json: true
		}).then(res => {
            // iterate backwards, add new ones to beginning of our list (don't override read/processed for old ones)
            for (let i = res.length - 1; i >= 0; --i) {
                if (!donations.value.donations.some(d => d.timestamp === res[i].timestamp)) {
                    donations.value.donations.unshift(res[i]);
                }
            }
		}).catch(err => {
			log.error("Failed to get donation list:\n\t", err);
        });
    }
};