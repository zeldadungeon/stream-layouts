(function () {
    "use strict";

    Vue.use(VueMaterial.default);

    Vue.component("zd-run", {
        template: `<div v-if="run != undefined">
            <img class="zd-boxart md-elevation-5" :src="boxartUrl" />
            <div class="md-title" style="line-height: 40px;">{{ run.twitch.name }}<md-button class="md-icon-button" @click="editRun"><md-icon>edit</md-icon></md-button>
            </div>
            <md-button v-if="!run.state" class="md-primary md-raised" @click="showQueueDialog = true">Queue</md-button>
            <md-button v-else-if="run.state === 'queued'" class="md-primary md-raised" @click="startRun">Start</md-button>
            <md-button v-else-if="run.state === 'running'" class="md-accent md-raised" @click="stopRun">Stop</md-button>
            <md-button v-else-if="run.state === 'done'" class="md-accent md-raised" @click="showResetDialog = true">Reset</md-button>
            <div v-if="run.state" style="display: inline-block; min-width: 88px; height: 36px; margin: 6px 8px; font-size: 14px; font-weight: 500;">
                <zd-time-display :time="run.finish || stopwatch.time" style="height: 100%; padding: 0 8px; font-size: 28px; display: -webkit-box; display: flex; -webkit-box-pack: center; justify-content: center; -webkit-box-align: center; align-items: center;" />
                <md-progress-bar v-if="run.state === 'running'" md-mode="indeterminate"></md-progress-bar>
            </div>
            <div style="clear: left;" />
            
            <div v-if="run.rules === 'Teams'">
                <md-field style="width: 320px;">
                    <label>Player Rotation Mode</label>
                    <md-select v-model="run.teamRotationMode">
                        <md-option v-for="mode in teamRotationModes" :key="mode[1]" :value="mode[1]">{{ mode[0] }}</md-option>
                    </md-select>
                </md-field>
            </div>

            <div class="md-subheading" style="line-height: 40px;">Racers<md-button class="md-icon-button" @click="addRacer"><md-icon>add</md-icon></md-button></div>
            <div v-if="run.rules === 'Elimination'">
                <zd-elimination-card v-for="(racer, index) in run.racers" :racer="racer" :key="'racer-' + index" :run="run" @finish="stopRun" @remove="removeRacer(index)" />
            </div>
            <div v-else-if="run.rules === 'Royal Rumble'">
                <zd-rumble-card v-for="(racer, index) in run.racers" :racer="racer" :key="'racer-' + index" :run="run" @finish="stopRun" @remove="removeRacer(index)" />
            </div>
            <div v-else-if="run.rules === 'Bingo'">
                <zd-bingo-card v-for="(racer, index) in run.racers" :racer="racer" :key="'racer-' + index" :run="run" :team="index" @finish="stopRun" @remove="removeRacer(index)" />
            </div>
            <div v-else-if="run.rules === 'Individual Levels'">
                <zd-levels-card v-for="(racer, index) in run.racers" :racer="racer" :key="'racer-' + index" :run="run" @finish="stopRun" @remove="removeRacer(index)" />
            </div>
            <div v-else-if="run.rules === 'Teams'">
                <zd-team-card v-for="(racer, index) in run.racers" :racer="racer" :key="'racer-' + index" :run="run" @finish="stopRun" @remove="removeRacer(index)" />
            </div>
            <div v-else>
                <zd-race-card v-for="(racer, index) in run.racers" :racer="racer" :key="'racer-' + index" :run="run" @finish="stopRun" @remove="removeRacer(index)" />
            </div>

            <div class="md-subheading" style="line-height: 40px;">Incentives<md-button class="md-icon-button" @click="newIncentive"><md-icon>add</md-icon></md-button></div>
            <div><!--Yes this has to be wrapped in a div for some reason-->
                <zd-incentive-card v-for="(incentive, index) in run.incentives" :incentive="incentive" :numRacers="run.racers.length" :key="'incentive-' + index" @delete="deleteIncentive(index)" />
            </div>

            <md-switch v-model="run.showPlaceholders">Show layout placeholders</md-switch>

            <md-dialog-confirm
                :md-active.sync="showQueueDialog"
                md-title="Queue this run?"
                md-content="This will set the current game on Twitch and reset the timer. Any active run will be stopped."
                md-confirm-text="Queue"
                md-cancel-text="Cancel"
                @md-confirm="queueRun" />

            <md-dialog-alert
                :md-active.sync="showMissingEstimateDialog"
                md-content="Make sure all racers have estimates first."
                md-confirm-text="OK" />

            <md-dialog-confirm
                :md-active.sync="showResetDialog"
                md-title="Reset this run?"
                md-content="This will reset the finish time."
                md-confirm-text="Reset"
                md-cancel-text="Cancel"
                @md-confirm="resetRun" />

            <md-dialog :md-active.sync="showEditDialog">
                <md-dialog-title>Editing Run</md-dialog-title>
                <md-dialog-content>
                    <!-- TODO support renaming run? could be tricky since it's used as index -->
                    <md-field>
                        <label>Abbreviation</label>
                        <md-input v-model="edit.abbr"></md-input>
                    </md-field>
                    <md-field :class="{ 'md-invalid': !edit.gameValid }">
                        <label>Twitch Game</label>
                        <md-input v-model="edit.game" required></md-input>
                        <span class="md-error">Couldn't find this game on Twitch.</span>
                    </md-field>
                    <md-field>
                        <label>Rules</label>
                        <md-select v-model="edit.rules" required>
                            <md-option v-for="rule in ['Race', 'Teams', 'Elimination', 'Royal Rumble', 'Bingo', 'Individual Levels']" :key="rule" :value="rule">{{ rule }}</md-option>
                        </md-select>
                    </md-field>
                    <md-field>
                        <label>After</label>
                        <md-select v-model="edit.prev" required>
                            <md-option v-for="name in Object.keys(runs).filter(n => n !== runName)" :key="name" :value="name">{{ name }}</md-option>
                        </md-select>
                    </md-field>
                </md-dialog-content>
                <md-dialog-actions>
                    <md-button class="md-primary" @click="showEditDialog = false">Close</md-button>
                    <md-button class="md-primary" @click="saveChanges" :disabled="!formValid">Save</md-button>
                </md-dialog-actions>
            </md-dialog>

            <zd-player-dialog :show.sync="showAddRacerDialog" :taken="run.racers.map(r => r.name)" @save="doAddRacer"></zd-player-dialog>

            <md-dialog :md-active.sync="showAddIncentiveDialog">
                <md-dialog-title>New Donation Incentive</md-dialog-title>
                <md-dialog-content>
                    <md-field>
                        <label>Name</label>
                        <md-input v-model="edit.incentive.name" required></md-input>
                    </md-field>
                </md-dialog-content>
                <md-dialog-actions>
                    <md-button class="md-primary" @click="showAddIncentiveDialog = false">Close</md-button>
                    <md-button class="md-primary" @click="addIncentive" :disabled="!edit.incentive.name">Save</md-button>
                </md-dialog-actions>
            </md-dialog>
        </div>`,
        props: ["runName"],
        replicants: ["runs", "stopwatch", "twitch"],
        data() {
            return {
                showEditDialog: false,
                showQueueDialog: false,
                showMissingEstimateDialog: false,
                showResetDialog: false,
                showAddRacerDialog: false,
                showAddIncentiveDialog: false,
                edit: {
                    incentive: {}
                },
                teamRotationModes: [
                    ["Don't track rotations", "Static"],
                    ["Split members to separate nameplates", "Split"],
                    ["Rotate manually", "Manual"],
                    ["Automatically rotate from donations", "Donations"]
                ]
            }
        },
        computed: {
            run() {
                return this.runs[this.runName] || {
                    racers: [],
                    incentives: [],
                    twitch: {}
                };
            },
            boxartUrl() {
                if (!this.run || !this.run.twitch || !this.run.twitch["box_art_url"]) {
                    return ""; // TODO placeholder img?
                }
                return this.run.twitch["box_art_url"].replace("{width}", "85").replace("{height}", "113");
            },
            formValid() {
                return this.edit.game && this.edit.prev;
            }
        },
        methods: {
            editRun() {
                this.edit = {
                    abbr: this.run.abbr,
                    game: this.run.twitch.name,
                    gameValid: true,
                    rules: this.run.rules || "Race",
                    prev: Object.keys(this.runs).find(k => this.runs[k].next === this.runName),
                    incentive: {}
                };
                this.showEditDialog = true;
            },
            saveChanges() {
                fetch(`https://api.twitch.tv/helix/games?name=${encodeURIComponent(this.edit.game)}`, {
                    headers: {
                        Authorization: `Bearer ${nodecg.bundleConfig.twitch.oauthToken}`,
                        "Client-ID": nodecg.bundleConfig.twitch.clientId
                    }
                }).then(result => result.json()).then(result => {
                    if (result.data.length > 0) {
                        // update basic info
                        this.run.abbr = this.edit.abbr;
                        this.run.twitch = result.data[0];
                        this.run.rules = this.edit.rules;

                        if (this.run.rules === "Individual Levels" && !this.run.levels) {
                            this.$set(this.run, "levels", [
                                {name: "L1", results: []},
                                {name: "L2", results: []},
                                {name: "L3", multiplier: 2, results: []},
                                {name: "L4", multiplier: 2, results: []},
                                {name: "L5", multiplier: 3, results: []},
                                {name: "L6", multiplier: 3, results: []},
                                {name: "L7", multiplier: 4, results: []},
                                {name: "L8", multiplier: 4, results: []},
                                {name: "L9", multiplier: 5, results: []},
                            ]);
                        }

                        // update position
                        const prev = Object.keys(this.runs).find(k => this.runs[k].next === this.runName);
                        if (prev != this.edit.prev) {
                            // remove from current position
                            this.$set(this.runs[prev], "next", this.run.next);

                            // insert into new position
                            this.$set(this.run, "next", this.runs[this.edit.prev].next);
                            this.$set(this.runs[this.edit.prev], "next", this.runName);
                        }
                        this.showEditDialog = false;
                    } else {
                        this.edit.gameValid = false;
                    }
                });
            },
            queueRun() {
                Object.keys(this.runs).forEach(k => {
                    const r = this.runs[k];
                    // don't need to worry about "start" here. following will both be false.
                    if (r.state === "queued") {
                        r.state = null;
                    } else if (r.state === "running") {
                        this.doStopRun(r);
                    }
                });
                nodecg.sendMessage("timer:reset");
                this.twitch.game = {
                    fullTitle: this.run.twitch.name,
                    subtitle: this.runName,
                    initials: this.run.abbr
                };
                if (this.run.finish) { this.run.finish = null; }
                if (this.run.rules === "Bingo") {
                    nodecg.sendMessage("bingo:reset");
                }
                if (this.run.name === "Majora's Mask") {
                    nodecg.sendMessage("masks:reset"); // TODO I need to come up with some sort of plugin model for these...
                }
                this.$set(this.runs.start, "current", this.runName);
                this.$set(this.run, "state", "queued"); // $set because it starts out undefined. after this, can assign normally.
            },
            startRun() {
                if (this.run.rules === "Royal Rumble" && this.run.racers.some(r => !r.estimate)) {
                    this.showMissingEstimateDialog = true;
                } else {
                    this.run.state = "running";
                    nodecg.sendMessage("timer:start");
                }

                if (this.run.rules === "Bingo") {
                    nodecg.sendMessage("bingo:shuffle");
                }
            },
            stopRun() {
                this.doStopRun(this.run);
            },
            doStopRun(run) {
                nodecg.sendMessage("timer:stop");
                const time = this.stopwatch.time;
                this.$set(run, "finish", time);
                run.racers.forEach(r => {
                    if (!r.finish) {
                        this.$set(r, "finish", time);
                    }
                })
                run.state = "done";
            },
            resetRun() {
                this.run.state = null;
                this.run.finish = null;
                this.run.racers.forEach(r => {
                    r.finish = null;
                    r.position = undefined;
                    r.checkpoints = [];
                    r.checkpoint = 0;
                    r.warning = false;
                    r.eliminated = false;
                    r.state = "";
                    r.deaths = 0;
                    r.collected = 0;
                    r.required = 0;
                    if (r.members) {
                        r.members.forEach(m => {
                            m.points = 0;
                        });
                    }
                });
                if (this.run.levels) {
                    this.run.levels = [
                        {name: "L1", results: []},
                        {name: "L2", results: []},
                        {name: "L3", multiplier: 2, results: []},
                        {name: "L4", multiplier: 2, results: []},
                        {name: "L5", multiplier: 3, results: []},
                        {name: "L6", multiplier: 3, results: []},
                        {name: "L7", multiplier: 4, results: []},
                        {name: "L8", multiplier: 4, results: []},
                        {name: "L9", multiplier: 5, results: []},
                    ];
                }
                if (this.run.name === "Majora's Mask") {
                    nodecg.sendMessage("masks:reset"); // TODO I need to come up with some sort of plugin model for these...
                }
            },
            addRacer() {
                if (this.run.rules === "Teams") {
                    if (!this.run.racers) { this.$set(this.run, "racers", []); }
                    this.run.racers.push({
                        name: `Team ${this.run.racers.length + 1}`,
                        members: [],
                        deaths: 0,
                        currentRacer: null
                    })
                } else {
                    this.showAddRacerDialog = true;
                }
            },
            doAddRacer(name) {
                if (!this.run.racers) { this.$set(this.run, "racers", []); }
                this.run.racers.push({
                    name,
                    position: 0,
                    checkpoint: 0,
                    splits: []
                });
                this.showAddRacerDialog = false;
            },
            removeRacer(index) {
                this.run.racers.splice(index, 1);
            },
            newIncentive() {
                this.edit.incentive = {
                    name: "Filename",
                    options: {}
                };
                this.showAddIncentiveDialog = true;
            },
            addIncentive() {
                if (!this.run.incentives) { this.$set(this.run, "incentives", []); }
                this.run.incentives.push({
                    name: this.edit.incentive.name,
                    options: {}
                });
                this.showAddIncentiveDialog = false;
            },
            deleteIncentive(index) {
                this.run.incentives.splice(index, 1);
            }
        }
    });
})();