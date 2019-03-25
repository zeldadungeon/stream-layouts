(function () {
    "use strict";

    Vue.use(VueMaterial.default);

    Vue.component("zd-run", {
        template: `<div v-if="run != undefined">
            <img class="zd-boxart md-elevation-5" :src="boxartUrl" />
            <div class="md-title" style="line-height: 40px;">{{ run.twitch.name }}<md-button class="md-icon-button" @click="editRun"><md-icon>edit</md-icon></md-button>
            </div>
            <md-button class="md-primary md-raised" @click="showQueueDialog = true" v-if="!run.state || run.state === 'done'">Queue</md-button>
            <md-button class="md-primary md-raised" @click="startRun" v-if="run.state === 'queued'">Start</md-button>
            <md-button class="md-primary md-raised" @click="stopRun" v-if="run.state === 'running'">Stop</md-button>
            <div v-if="run.state" style="display: inline-block; min-width: 88px; height: 36px; margin: 6px 8px; font-size: 14px; font-weight: 500;">
                <zd-timer style="height: 100%; padding: 0 8px; display: -webkit-box; display: flex; -webkit-box-pack: center; justify-content: center; -webkit-box-align: center; align-items: center;" />
            </div>
            <div style="clear: left;" />

            {{ run }}

            <md-dialog-confirm
                :md-active.sync="showQueueDialog"
                md-title="Queue this run?"
                md-content="This will set the current game on Twitch and reset the timer. Any active run will be stopped."
                md-confirm-text="Queue"
                md-cancel-text="Cancel"
                @md-confirm="queueRun" />
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
        replicants: ["runs"],
        data: function() {
            return {
                showEditDialog: false,
                showQueueDialog: false,
                edit: {}
            }
        },
        computed: {
            run: function() {
                return this.runs[this.runName] || {};
            },
            boxartUrl: function() {
                if (!this.run || !this.run.twitch || !this.run.twitch["box_art_url"]) {
                    return ""; // TODO placeholder img?
                }
                return this.run.twitch["box_art_url"].replace("{width}", "85").replace("{height}", "113");
            },
            formValid: function() {
                return this.edit.abbr && this.edit.game && this.edit.prev;
            }
        },
        methods: {
            editRun: function() {
                this.edit = {
                    abbr: this.run.abbr,
                    game: this.run.twitch.name,
                    gameValid: true,
                    prev: Object.keys(this.runs).find(k => this.runs[k].next === this.runName)
                };
                this.showEditDialog = true;
            },
            saveChanges: function() {
                fetch(`https://api.twitch.tv/helix/games?name=${this.edit.game}`, {
                    headers: {
                        "Client-ID": nodecg.bundleConfig.twitch.clientId
                    }
                }).then(result => result.json()).then(result => {
                    if (result.data.length > 0) {
                        this.run.abbr = this.edit.abbr;
                        this.run.twitch = result.data[0];

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
            queueRun: function() {
                Object.keys(this.runs).forEach(k => {
                    const r = this.runs[k];
                    // don't need to worry about "start" here. following will both be false.
                    if (r.state === "queued") {
                        r.state = undefined;
                    } else if (r.state === "running") {
                        this.doStopRun(r);
                    }
                });
                nodecg.sendMessage("timer:reset");
                // TODO set Twitch game
                this.$set(this.selectedRun, "state", "queued"); // $set because it starts out undefined. after this, can assign normally.
            },
            startRun: function() {
                this.run.state = "running";
                nodecg.sendMessage("timer:start");
            },
            stopRun: function() {
                this.doStopRun(this.run);
            },
            doStopRun: function(run) {
                nodecg.sendMessage("timer:stop");
                // TODO sort out racer results
                run.state = "done";
            }
        }
    });

    const app = new Vue({
        el: "#app",
        template: `<md-app md-waterfall md-mode="reveal">
            <md-app-toolbar class="md-primary">
                <md-button class="md-icon-button" @click="showDrawer = !showDrawer"><md-icon>menu</md-icon></md-button>
                <span class="md-title">{{ selectedRunName }}</span>
                <div v-if="selectedRunName" class="md-toolbar-section-end">
                    <md-button class="md-primary" @click="selectCurrentRun">Current</md-button>
                    <md-button class="md-primary" @click="selectRun(selectedRun.next)" v-if="selectedRun.next">Next</md-button>
                    <md-button @click="showDeleteDialog = true">Delete</md-button>
                    <md-dialog-confirm
                        :md-active.sync="showDeleteDialog"
                        md-title="Delete this run?"
                        md-content="Are you sure? Don't delete a run just because it's finished."
                        md-confirm-text="Delete"
                        md-cancel-text="Cancel"
                        @md-confirm="deleteRun" />
                </div>
            </md-app-toolbar>
            <md-app-drawer :md-active.sync="showDrawer">
                <md-list>
                    <md-list-item v-for="name in runNames" :key="name" @click="selectRun(name)">
                        <md-icon>{{ icons[runs[name].state] }}</md-icon>
                        <span class="md-list-item-text">{{ name }}</span>
                    </md-list-item>
                    <md-list-item @click="showCreateDialog = true">
                        <md-icon>playlist_add</md-icon>
                        <span class="md-list-item-text">Create New</span>
                    </md-list-item>
                </md-list>
                <md-dialog :md-active.sync="showCreateDialog">
                    <md-dialog-title>New Run</md-dialog-title>
                    <md-dialog-content>
                        <md-field :class="{ 'md-invalid': !newRunNameValid }">
                            <label>Name</label>
                            <md-input v-model="newRun.name" required></md-input>
                            <span class="md-error">This run already exists.</span>
                        </md-field>
                        <md-field>
                            <label>Abbreviation</label>
                            <md-input v-model="newRun.abbr" required></md-input>
                        </md-field>
                        <md-field :class="{ 'md-invalid': !newRunGameValid }">
                            <label>Twitch Game</label>
                            <md-input v-model="newRun.game" required></md-input>
                            <span class="md-error">Couldn't find this game on Twitch.</span>
                        </md-field>
                        <md-field>
                            <label>After</label>
                            <md-select v-model="newRun.next" required>
                                <md-option v-for="name in Object.keys(runs)" :key="name" :value="name">{{ name }}</md-option>
                            </md-select>
                        </md-field>
                    </md-dialog-content>
                    <md-dialog-actions>
                        <md-button class="md-primary" @click="showCreateDialog = false">Close</md-button>
                        <md-button class="md-primary" @click="addRun" :disabled="!formValid">Save</md-button>
                    </md-dialog-actions>
                </md-dialog>
            </md-app-drawer>
            <md-app-content><zd-run v-if="selectedRunName" :runName="selectedRunName" /></md-app-content>
        </md-app>`,
        replicants: {
            runs: { start: { next: undefined } }
        },
        data: function() {
            return {
                selectedRunName: undefined,
                showDrawer: false,
                showCreateDialog: false,
                showDeleteDialog: false,
                newRun: {},
                newRunGameValid: true,
                icons: {
                    queued: "navigate_next",
                    running: "play_arrow",
                    done: "done"
                }
            };
        },
        computed: {
            runNames: function() {
                const names = [];
                let name = this.runs.start.next;
                while(name) {
                    names.push(name);
                    name = this.runs[name].next;
                }
                return names;
            },
            selectedRun: function() {
                return this.runs[this.selectedRunName];
            },
            newRunNameValid: function() {
                return !this.runs[this.newRun.name];
            },
            formValid: function() {
                return this.newRun.name && this.newRun.game && this.newRun.next && this.newRunNameValid;
            }
        },
        mounted: function() {
            setTimeout(this.selectCurrentRun.bind(this), 500); // TODO why doesn't this work immediately? tried watching this.runs too, that one never fired
        },
        methods: {
            selectRun: function(run) {
                this.selectedRunName = run;
                this.showDrawer = false;
            },
            selectCurrentRun: function() {
                let runToSelect = this.runs.start.next;
                while(this.runs[runToSelect] && this.runs[runToSelect].state === "done") {
                    runToSelect = this.runs[runToSelect].next;
                }
                this.selectRun(runToSelect);
            },
            addRun: function() {
                fetch(`https://api.twitch.tv/helix/games?name=${this.newRun.game}`, {
                    headers: {
                        "Client-ID": nodecg.bundleConfig.twitch.clientId
                    }
                }).then(result => result.json()).then(result => {
                    if (result.data.length > 0) {
                        // complete twitch validation
                        this.newRunGameValid = true;
                        this.newRun.twitch = result.data[0];

                        // adjust order
                        const prev = this.newRun.next; // form put it here as a placeholder
                        const next = this.runs[prev].next;
                        this.$set(this.runs[prev], "next", this.newRun.name);
                        this.newRun.next = next;

                        // commit
                        this.$set(this.runs, this.newRun.name, this.newRun);
                        this.selectRun(this.newRun.name);
                        this.showCreateDialog = false;
                    } else {
                        this.newRunGameValid = false;
                    }
                });
            },
            createRun: function() {
                this.newRun = {};
                this.showCreateDialog = true;
            },
            deleteRun: function() {
                const prev = Object.keys(this.runs).find(k => this.runs[k].next === this.selectedRunName);
                const next = this.selectedRun.next;
                if (prev) {
                    this.runs[prev].next = next;
                }
                this.$delete(this.runs, this.selectedRunName);
                this.selectedRunName = next || prev !== "start" && prev || undefined;
            }
        }
	});
})();