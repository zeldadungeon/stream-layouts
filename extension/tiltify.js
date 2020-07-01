"use strict";

const TiltifyClient = require("tiltify-api-client");
const POLL_INTERVAL = 5 * 1000;
const POLL_INTERVAL_MOCK = 1 * 1000;

module.exports = function (nodecg, enqueue) {
    const config = nodecg.bundleConfig.tiltify;
    const log = new nodecg.Logger(`${nodecg.bundleName}:donations`);
    const tiltify = new TiltifyClient(config.oauthToken);
    
    const donations = nodecg.Replicant("donations", {
        defaultValue: {
            enabled: false,
            total: 0,
            donations: [],
            lastDonation: 0,
            wars: []
        }
    });

    const mockCampaign = {
        amountRaised: 0
    };
    const mockDonations = [];

    nodecg.listenFor("donations:debug", d => {
        mockDonations.unshift(d);
        mockCampaign.amountRaised += d.amount;
    });

    function poll() {
        getRecentDonations(res => {
            let updateTotal = false;
            for (let i = res.length - 1; i >= 0; --i) {
                if (res[i].id > donations.value.lastDonation) {
                    updateTotal = true;
                    donations.value.lastDonation = res[i].id;
                    // TODO push to dashboard
                    // TODO hook into incentives using rewardId and challengeId
                    // For now, handling these on the Tiltify dashboard
                    // donations.value.donations.push(res[i]);
                    enqueue({
                        type: "donation",
                        id: res[i].id,
                        name: res[i].name,
                        amount: res[i].amount
                    });
                }
            }

            if (updateTotal) {
                getCampaign(res => {
                    donations.value.total = res.amountRaised;
                });
            }
        });
        
        setTimeout(poll, donations.value.enabled ? POLL_INTERVAL : POLL_INTERVAL_MOCK);
    }
    poll();

    function getRecentDonations(callback) {
        if (donations.value.enabled) {
            tiltify.Campaigns.getRecentDonations(config.campaignId, callback);
        } else {
            callback(mockDonations);
        }
    }

    function getCampaign(callback) {
        if (donations.value.enabled) {
            tiltify.Campaigns.get(config.campaignId, callback);
        } else {
            callback(mockCampaign);
        }
    }
};