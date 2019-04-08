(function () {
    "use strict";

    Vue.use(VueMaterial.default);

    Vue.component("zd-race-card", {
        template: `<md-card>
            <md-card-header>
                <div class="md-title">Player {{ index }}</div>
            </md-card-header>
    
            <md-card-content>
                <md-field md-inline v-if="playerNames.length">
                    <label>Player</label>
                    <md-select v-model="racer.name">
                        <md-option v-for="playerName in playerNames" :key="playerName" :value="playerName">{{ playerName }}</md-option>
                    </md-select>
                </md-field>
                <md-field md-inline>
                    <label>Filename</label>
                    <md-input v-model="racer.filename"></md-input>
                </md-field>
            </md-card-content>
    
            <md-card-actions>
                <md-button class="md-accent md-raised" v-if="racer.finish == undefined" @click="finish" :disabled="run.state !== 'running' && run.state !== 'done'">Finish</md-button>
                <md-button class="md-accent md-raised" v-else @click="editFinish"><zd-time-display :time="racer.finish" /></md-button>
            </md-card-actions>

            <md-dialog :md-active.sync="showFinishDialog">
                <md-dialog-title>Finish Time for {{ racer.name }}</md-dialog-title>
                <md-dialog-content>
                    <md-field class="md-has-value"><zd-time-input v-model="edit.finish" /></md-field>
                </md-dialog-content>
                <md-dialog-actions>
                    <md-button class="md-accent" @click="reset">Reset</md-button>
                    <md-button class="md-primary" @click="showFinishDialog = false">Close</md-button>
                    <md-button class="md-primary" @click="saveChanges">Save</md-button>
                </md-dialog-actions>
            </md-dialog>
        </md-card>`,
        props: ["racer", "index", "run"],
        replicants: ["players", "stopwatch"],
        data() {
            return {
                showFinishDialog: false,
                edit: {
                    finish: null
                }
            }
        },
        computed: {
            playerNames() {
                return Object.keys(this.players);
            }
        },
        methods: {
            finish() {
                this.$set(this.racer, "finish", this.run.state === "done" ? this.run.finish : this.stopwatch.time);
                if (this.run.state === "running" && this.run.racers.every(r => r.finish)) {
                    // TODO this is bad - duplicated code here and in run.js doStopRun. maybe use events instead and don't depend on run at all? but different card types might have different behavior for some events, don't want to pollute run.js with that
                    nodecg.sendMessage("timer:stop");
                    const time = this.stopwatch.time;
                    this.$set(this.run, "finish", time);
                    this.run.state = "done";
                }
            },
            editFinish() {
                this.edit.finish = this.racer.finish;
                this.showFinishDialog = true;
            },
            reset() {
                this.racer.finish = null;
                this.showFinishDialog = false;
            },
            saveChanges() {
                this.racer.finish = this.edit.finish;
                this.showFinishDialog = false;
            }
        }
    });
})();