(function () {
    "use strict";

    Vue.use(VueMaterial.default);

    const app = new Vue({
        el: "#app",
        template: `<md-app md-waterfall>
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
        data() {
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
            runNames() {
                const names = [];
                let name = this.runs.start.next;
                while(name) {
                    names.push(name);
                    name = this.runs[name].next;
                }
                return names;
            },
            selectedRun() {
                return this.runs[this.selectedRunName];
            },
            newRunNameValid() {
                return !this.runs[this.newRun.name];
            },
            formValid() {
                return this.newRun.name && this.newRun.game && this.newRun.next && this.newRunNameValid;
            }
        },
        mounted() {
            setTimeout(this.selectCurrentRun.bind(this), 500); // TODO why doesn't this work immediately? tried watching this.runs too, that one never fired
        },
        methods: {
            selectRun(run) {
                this.selectedRunName = run;
                this.showDrawer = false;
            },
            selectCurrentRun() {
                let runToSelect = "start";
                while((this.runs[runToSelect].state === "done" || runToSelect === "start") && this.runs[runToSelect].next) {
                    runToSelect = this.runs[runToSelect].next;
                }
                this.selectRun(runToSelect);
            },
            addRun() {
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
            createRun() {
                this.newRun = {};
                this.showCreateDialog = true;
            },
            deleteRun() {
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