"use strict";

const TiltifyClient = require("tiltify-api-client");
const POLL_INTERVAL = 5 * 1000;
const POLL_INTERVAL_MOCK = 1 * 1000;

module.exports = function (nodecg, enqueue) {
    const config = nodecg.bundleConfig.tiltify;
    const log = new nodecg.Logger(`${nodecg.bundleName}:tiltify`);
    const tiltify = new TiltifyClient(config.oauthToken);
    
    const donations = nodecg.Replicant("donations", {
        defaultValue: {
            enabled: false,
            total: 0,
            donations: [],
            lastDonation: 0,
            rewards: []
        }
    });

    const mockCampaign = {
        amountRaised: 0
    };
    const mockRewards = [
        {
            id: 1,
            name: "Game 1 Filename"
        },
        {
            id: 2,
            name: "Game 2 Filename"
        }
    ];
    const mockDonations = [];

    nodecg.listenFor("donations:debug", d => {
        d.id = mockDonations.length + 1;
        d.rewardId = parseInt(d.rewardId);
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

    // this version polls the total first, then if that's different polls for new donations
    // it's also careful to increment the total by individual donation amount in order to get the right sound cues
    function poll2() {
        getCampaign(campaign => {
            if (donations.value.total == campaign.amountRaised) {
                return;
            }

            getRecentDonations(recentDonations => {
                let newDonations = recentDonations.filter(d => d.id > donations.value.lastDonation);

                // First, fix any discrepency
                let newDonationsTotal = newDonations.reduce((total, d) => total + d.amount, 0);
                if (donations.value.total + newDonationsTotal != campaign.amountRaised) {
                    donations.value.total = campaign.amountRaised - newDonationsTotal;

                    if (newDonationsTotal == 0) {
                        // there were no new donations, only a discrepancy of the total
                        return;
                    }
                }

                // Only add one donation per poll so that we get the right sound cue
                let firstNewDonation = newDonations.reduce((oldest, d) => d.id < oldest.id ? d : oldest);
                donations.value.lastDonation = firstNewDonation.id;
                enqueue({
                    type: "donation",
                    id: firstNewDonation.id,
                    name: firstNewDonation.name,
                    comment: firstNewDonation.comment,
                    amount: firstNewDonation.amount,
                    rewardId: firstNewDonation.rewardId
                });
                
                donations.value.donations.push(firstNewDonation);
            });
        });
        
        setTimeout(poll2, donations.value.enabled ? POLL_INTERVAL : POLL_INTERVAL_MOCK);
    }

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

    function getRewards(callback) {
        if (donations.value.enabled) {
            tiltify.Campaigns.getRewards(config.campaignId, callback);
        } else {
            callback(mockRewards);
        }
    }

    // Populate rewards on startup. If rewards are changed in tiltify, nodecg must be restarted.
    getRewards(rewards => {
        donations.value.rewards = rewards;
        log.info("Synced rewards");
    });

    log.info("Begin polling campaign");
    poll2();
};