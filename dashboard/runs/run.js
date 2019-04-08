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

            <zd-race-card v-for="(racer, index) in run.racers" :racer="racer" :key="index" :index="index + 1" :run="run" />

            <div class="clear: both;">{{ run }}</div>

            <md-dialog-confirm
                :md-active.sync="showQueueDialog"
                md-title="Queue this run?"
                md-content="This will set the current game on Twitch and reset the timer. Any active run will be stopped."
                md-confirm-text="Queue"
                md-cancel-text="Cancel"
                @md-confirm="queueRun" />
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
                        <md-input v-model="edit.abbr" required></md-input>
                    </md-field>
                    <md-field :class="{ 'md-invalid': !edit.gameValid }">
                        <label>Twitch Game</label>
                        <md-input v-model="edit.game" required></md-input>
                        <span class="md-error">Couldn't find this game on Twitch.</span>
                    </md-field>
                    <md-field>
                        <label>Number of Racers/Teams</label>
                        <md-input type="number" v-model="edit.numRacers" required></md-input>
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
        </div>`,
        props: ["runName"],
        replicants: ["runs", "stopwatch"],
        data() {
            return {
                showEditDialog: false,
                showQueueDialog: false,
                showResetDialog: false,
                edit: {}
            }
        },
        computed: {
            run() {
                return this.runs[this.runName] || {};
            },
            boxartUrl() {
                if (!this.run || !this.run.twitch || !this.run.twitch["box_art_url"]) {
                    return ""; // TODO placeholder img?
                }
                return this.run.twitch["box_art_url"].replace("{width}", "85").replace("{height}", "113");
            },
            formValid() {
                return this.edit.abbr && this.edit.game && this.edit.prev;
            }
        },
        methods: {
            editRun() {
                this.edit = {
                    abbr: this.run.abbr,
                    game: this.run.twitch.name,
                    gameValid: true,
                    numRacers: this.run.racers && this.run.racers.length || 0,
                    prev: Object.keys(this.runs).find(k => this.runs[k].next === this.runName)
                };
                this.showEditDialog = true;
            },
            saveChanges() {
                fetch(`https://api.twitch.tv/helix/games?name=${this.edit.game}`, {
                    headers: {
                        "Client-ID": nodecg.bundleConfig.twitch.clientId
                    }
                }).then(result => result.json()).then(result => {
                    if (result.data.length > 0) {
                        // update basic info
                        this.run.abbr = this.edit.abbr;
                        this.run.twitch = result.data[0];

                        // update racers array
                        if (!this.run.racers) {
                            this.$set(this.run, "racers", []);
                        }
                        while (this.run.racers.length > this.edit.numRacers) {
                            this.run.racers.pop();
                        }
                        while (this.run.racers.length < this.edit.numRacers) {
                            this.run.racers.push({
                                name: "",
                                filename: ""
                            });
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
                // TODO set Twitch game
                if (this.run.finish) { this.run.finish = null; }
                this.$set(this.run, "state", "queued"); // $set because it starts out undefined. after this, can assign normally.
            },
            startRun() {
                this.run.state = "running";
                nodecg.sendMessage("timer:start");
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
                });
            }
        }
    });
})();