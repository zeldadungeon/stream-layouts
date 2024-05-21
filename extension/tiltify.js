"use strict";

const request = require("request-promise");
const TiltifyClient = require("tiltify-api-client");
const v5OAuthEndpoint = "https://v5api.tiltify.com/oauth/token";
const v5ApiEndpoint = "https://v5api.tiltify.com/api/public";
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
            lastMatchInsertedMs: Date.now(),
            isMatchActive: false,
            rewards: []
        }
    });

    const mockCampaign = {
        amount_raised: 0
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
    const mockDonationMatches = [
        {
        "active": true,
        "amount": {
        "currency": "USD",
        "value": "182.32"
        },
        "completed_at": "2023-06-13T18:04:05.791864Z",
        "donation_id": "ab55768a-6933-48af-afc6-0fd6ef52a982",
        "ends_at": "2023-07-04T18:04:05.791861Z",
        "id": "4ca94f18-a6eb-49be-b206-1b70e2c503db",
        "inserted_at": "2023-06-13T18:04:05.791835Z",
        "matched_by": "Big Donor 1",
        "started_at_amount": {
        "currency": "USD",
        "value": "182.32"
        },
        "starts_at": "2023-06-13T18:04:05.791856Z",
        "total_amount_raised": {
        "currency": "USD",
        "value": "182.32"
        },
        "updated_at": "2023-06-13T18:04:05.791851Z"
        }, 
        {
        "active": true,
        "amount": {
        "currency": "USD",
        "value": "182.32"
        },
        "completed_at": "2023-06-13T18:04:05.791864Z",
        "donation_id": "ab55768a-6933-48af-afc6-0fd6ef52a982",
        "ends_at": "2023-06-13T18:04:05.791861Z",
        "id": "4ca94f18-a6eb-49be-b206-1b70e2c503db",
        "inserted_at": "2023-07-05T19:04:05.791835Z",
        "matched_by": "Big Donor 2",
        "started_at_amount": {
        "currency": "USD",
        "value": "182.32"
        },
        "starts_at": "2023-06-13T18:04:05.791856Z",
        "total_amount_raised": {
        "currency": "USD",
        "value": "182.32"
        },
        "updated_at": "2023-06-13T18:04:05.791851Z"
        }];

    nodecg.listenFor("donations:debug", d => {
        d.id = mockDonations.length + 1;
        d.rewardId = parseInt(d.rewardId);
        mockDonations.unshift(d);
        mockCampaign.amount_raised += d.amount;
    });

    let oauthToken = null;

    function refreshOauthToken() {
        request.post({
            uri: v5OAuthEndpoint, 
            body: {
                "client_id": config.clientId,
                "client_secret": config.clientSecret,
                "grant_type": "client_credentials",
                "scope": "public"
            },
            json: true
        }).then(response => {
            const refreshInMs = Date.parse(response.created_at) + (response.expires_in * 1000) - Date.now();
            log.info("Got access token\n\tcreated_at:", response.created_at, "\n\texpires_in:", response.expires_in, "\n\trefreshing in ", refreshInMs, "ms");
            oauthToken = response.access_token;
            setTimeout(refreshOauthToken, refreshInMs);
        }).catch(err => {
            log.error("Failed to get access token:\n\t", err);
            setTimeout(refreshOauthToken, 10 * 1000); // hope it's transient
        });
    }

    refreshOauthToken();

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
        if (oauthToken != null) {
            getCampaign(campaign => {
                const totalRaised = Number(campaign.amount_raised.value);
                if (donations.value.total == totalRaised) {
                    return;
                }

                getRecentDonations(recentDonations => {
                    let newDonations = recentDonations.filter(d => d.legacy_id > donations.value.lastDonation);

                    // First, fix any discrepency
                    let newDonationsTotal = newDonations.reduce((total, d) => total + Number(d.amount.value), 0);
                    if (donations.value.total + newDonationsTotal != totalRaised) {
                        donations.value.total = totalRaised - newDonationsTotal;

                        if (newDonationsTotal == 0) {
                            // there were no new donations, only a discrepancy of the total
                            return;
                        }
                    }

                    // Only add one donation per poll so that we get the right sound cue
                    let firstNewDonation = newDonations.reduce((oldest, d) => d.legacy_id < oldest.legacy_id ? d : oldest);
                    donations.value.total += Number(firstNewDonation.amount.value);
                    donations.value.lastDonation = firstNewDonation.legacy_id;
                    enqueue({
                        type: "donation",
                        id: firstNewDonation.legacy_id,
                        name: firstNewDonation.donor_name,
                        comment: firstNewDonation.donor_comment,
                        amount: Number(firstNewDonation.amount.value),
                        rewardId: firstNewDonation.reward_id
                    });
                    
                    donations.value.donations.push(firstNewDonation);
                });
            });

            getActiveDonationMatches(matches => {
                donations.value.isMatchActive = matches.length > 0;

                let oldestUnprocessedActiveMatch = null;
                let oldestUnprocessedActiveMatchInsertedMs = 0;
                for (let match of matches) {
                    const matchInsertedMs = Date.parse(match.inserted_at);
                    if (matchInsertedMs > donations.value.lastMatchInsertedMs &&
                        (oldestUnprocessedActiveMatch == null || matchInsertedMs < oldestUnprocessedActiveMatchInsertedMs)) {
                        oldestUnprocessedActiveMatch = match;
                        oldestUnprocessedActiveMatchInsertedMs = matchInsertedMs;
                    }
                }

                if (oldestUnprocessedActiveMatch != null) {
                    donations.value.lastMatchInsertedMs = oldestUnprocessedActiveMatchInsertedMs;
                    enqueue({
                        type: "donationMatch",
                        id: oldestUnprocessedActiveMatch.id,
                        name: oldestUnprocessedActiveMatch.matched_by,
                        endsAt: oldestUnprocessedActiveMatch.ends_at
                    })
                }
            });
        }
        
        setTimeout(poll2, donations.value.enabled ? POLL_INTERVAL : POLL_INTERVAL_MOCK);
    }

    function getCampaign(callback) {
        if (donations.value.enabled) {
            //tiltify.Campaigns.get(config.campaignLegacyId, callback);

            request.get({
                uri: `${v5ApiEndpoint}/campaigns/${config.campaignId}`,
                headers: {
                    Authorization: `Bearer ${oauthToken}`
                },
                json: true
            }).then(response => callback(response.data));
        } else {
            callback(mockCampaign);
        }
    }

    function getRecentDonations(callback) {
        if (donations.value.enabled) {
            //tiltify.Campaigns.getRecentDonations(config.campaignLegacyId, callback);

            request.get({
                uri: `${v5ApiEndpoint}/campaigns/${config.campaignId}/donations`,
                headers: {
                    Authorization: `Bearer ${oauthToken}`
                },
                json: true
            }).then(response => callback(response.data));
        } else {
            callback(mockDonations);
        }
    }

    function getActiveDonationMatches(callback) {
        if (donations.value.enabled) {
            request.get({
                uri: `${v5ApiEndpoint}/campaigns/${config.campaignId}/donation_matches`,
                headers: {
                    Authorization: `Bearer ${oauthToken}`
                },
                json: true
            }).then(response => callback(response.data.filter(m => Date.parse(m.endsAt) > Date.UTC())));
        } else {
            callback(mockDonationMatches);
        }
    }

    /*
    function getRewards(callback) {
        if (donations.value.enabled) {
            tiltify.Campaigns.getRewards(config.campaignLegacyId, callback);
        } else {
            callback(mockRewards);
        }
    }

    // Populate rewards on startup. If rewards are changed in tiltify, nodecg must be restarted.
    getRewards(rewards => {
        donations.value.rewards = rewards;
        log.info("Synced rewards");
    });
    */

    log.info("Begin polling campaign");
    poll2();
};