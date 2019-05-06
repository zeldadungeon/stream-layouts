(function () {
    "use strict";

    Vue.use(VueMaterial.default);

    Vue.component("zd-race-card", {
        template: `<md-card>
            <md-card-header>
                <md-card-header-text>
                    <div class="md-title">Racer {{ index }}</div>
                </md-card-header-text>
                
                <md-menu md-direction="bottom-end">
                    <md-button :disabled="!racer.name" class="md-icon-button" md-menu-trigger>
                        <md-icon>more_vert</md-icon>
                    </md-button>
        
                    <md-menu-content>
                        <md-menu-item @click="editPlayer">
                            <span>Edit selected player</span>
                            <md-icon>edit</md-icon>
                        </md-menu-item>
            
                        <md-menu-item @click="addPlayer">
                            <span>Add new player</span>
                            <md-icon>add</md-icon>
                        </md-menu-item>
                    </md-menu-content>
                </md-menu>
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
                    <md-button class="md-primary" @click="saveFinishChanges">Save</md-button>
                </md-dialog-actions>
            </md-dialog>

            <md-dialog :md-active.sync="showEditDialog">
                <md-dialog-title>Editing {{ racer.name }}</md-dialog-title>
                <md-dialog-content>
                    <md-field>
                        <label>Twitter</label>
                        <md-input v-model="edit.player.twitter"></md-input>
                    </md-field>
                    <md-field>
                        <label>Twitch</label>
                        <md-input v-model="edit.player.twitch"></md-input>
                    </md-field>
                </md-dialog-content>
                <md-dialog-actions>
                    <md-button class="md-primary" @click="showEditDialog = false">Close</md-button>
                    <md-button class="md-primary" @click="savePlayerChanges">Save</md-button>
                </md-dialog-actions>
            </md-dialog>
            
            <md-dialog :md-active.sync="showCreateDialog">
                <md-dialog-title>New Player</md-dialog-title>
                <md-dialog-content>
                    <md-field :class="{ 'md-invalid': !newPlayerNameValid }">
                        <label>Name</label>
                        <md-input v-model="edit.player.name" required></md-input>
                        <span class="md-error">This player already exists.</span>
                    </md-field>
                    <md-field>
                        <label>Twitter</label>
                        <md-input v-model="edit.player.twitter"></md-input>
                    </md-field>
                    <md-field>
                        <label>Twitch</label>
                        <md-input v-model="edit.player.twitch"></md-input>
                    </md-field>
                </md-dialog-content>
                <md-dialog-actions>
                    <md-button class="md-primary" @click="showCreateDialog = false">Close</md-button>
                    <md-button class="md-primary" @click="doAddPlayer" :disabled="!formValid">Save</md-button>
                </md-dialog-actions>
            </md-dialog>
        </md-card>`,
        props: ["racer", "index", "run"],
        replicants: ["players", "stopwatch"],
        data() {
            return {
                showFinishDialog: false,
                showEditDialog: false,
                showCreateDialog: false,
                edit: {
                    finish: null,
                    player: {}
                }
            }
        },
        computed: {
            playerNames() {
                return Object.keys(this.players);
            },
            newPlayerNameValid() {
                return !this.players[this.edit.player.name];
            },
            formValid() {
                return this.edit.player.name && this.edit.player.name != "" && this.newPlayerNameValid;
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
            saveFinishChanges() {
                this.racer.finish = this.edit.finish;
                this.showFinishDialog = false;
            },
            editPlayer() {
                this.edit.player = {
                    twitter: this.players[this.racer.name].twitter,
                    twitch: this.players[this.racer.name].twitch
                };
                this.showEditDialog = true;
            },
            savePlayerChanges() {
                this.players[this.racer.name].twitter = this.edit.player.twitter;
                this.players[this.racer.name].twitch = this.edit.player.twitch;
                this.showEditDialog = false;
            },
            addPlayer() {
                this.edit.player = {
                    name: "",
                    twitter: "",
                    twitch: ""
                };
                this.showCreateDialog = true;
            },
            doAddPlayer() {
                this.$set(this.players, this.edit.player.name, {
                    name: this.edit.player.name,
                    twitter: this.edit.player.twitter,
                    twitch: this.edit.player.twitch
                });
                this.showCreateDialog = false;
            }
        }
    });
})();