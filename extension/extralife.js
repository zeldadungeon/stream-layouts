"use strict";

const request = require("request-promise");
const POLL_INTERVAL = 15 * 1000;
const POLL_INTERVAL_MOCK = 1 * 1000;

module.exports = function (nodecg, enqueue) {
    const config = nodecg.bundleConfig.extralife;
	const log = new nodecg.Logger(`${nodecg.bundleName}:donations`);
    
    const donations = nodecg.Replicant("donations", {
        defaultValue: {
            enabled: false,
            total: 0,
            donations: [],
            lastDonation: 0,
            wars: []
        }
    });

    const mockParticipant = {
        sumDonations: 0
    };
    const mockDonations = [];

    nodecg.listenFor("donations:debug", d => {
        mockDonations.unshift(d);
        mockParticipant.sumDonations += d.amount;
    });

    function poll() {
        requestParticipant().then(res => {
            if (res.sumDonations !== donations.value.total) {
                donations.value.total = res.sumDonations;
                getDonations();
            }
        }).catch(err => {
            log.error("Failed to get donation total:\n\t", err);
        });
        
        setTimeout(poll, donations.value.enabled ? POLL_INTERVAL : POLL_INTERVAL_MOCK);
    }
    poll();

    function getDonations() {
        requestDonations().then(res => {
            // iterate backwards, add new ones to beginning of our list (don't override read/processed for old ones)
            for (let i = res.length - 1; i >= 0; --i) {
                const timestamp = Date.parse(res[i].createdDateUTC);
                if (timestamp > donations.value.lastDonation) {
                    donations.value.lastDonation = timestamp;
                    donations.value.donations.push(res[i]);
                    enqueue({
                        type: "donation",
                        id: timestamp,
                        name: res[i].displayName,
                        amount: res[i].amount
                    });
                }
            }
		}).catch(err => {
			log.error("Failed to get donation list:\n\t", err);
        });
    }

    function requestParticipant() {
        return donations.value.enabled ? request({
            method: "get",
            uri: `https://www.extra-life.org/api/participants/${config.participantId}`,
            json: true
        }) : Promise.resolve(mockParticipant);
    }

    function requestDonations() {
        return donations.value.enabled ? request({
			method: "get",
			uri: `https://www.extra-life.org/api/participants/${config.participantId}/donations`,
			json: true
		}) : Promise.resolve(mockDonations);
    }
};