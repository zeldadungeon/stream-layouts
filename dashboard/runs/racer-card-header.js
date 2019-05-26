(function () {
    "use strict";

    Vue.use(VueMaterial.default);

    Vue.component("zd-racer-card-header", {
        template: `<md-card-header>
            <md-card-header-text>
                <div class="md-title">{{ racer.name }}</div>
            </md-card-header-text>
            
            <md-menu md-direction="bottom-end">
                <md-button class="md-icon-button" md-menu-trigger>
                    <md-icon>more_vert</md-icon>
                </md-button>
    
                <md-menu-content>
                    <md-menu-item @click="editPlayer">
                        <span>Edit</span>
                        <md-icon>edit</md-icon>
                    </md-menu-item>

                    <md-menu-item @click="showSwapDialog = true">
                        <span>Swap</span>
                        <md-icon>swap_horiz</md-icon>
                    </md-menu-item>
        
                    <md-menu-item @click="showRemoveDialog = true">
                        <span>Remove</span>
                        <md-icon>remove</md-icon>
                    </md-menu-item>
                </md-menu-content>
            </md-menu>

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
            
            <zd-player-dialog :show="showSwapDialog" :taken="[racer.name]" @save="swapRacer"></zd-player-dialog>

            <md-dialog-confirm
                :md-active.sync="showRemoveDialog"
                md-title="Remove this racer?"
                md-content="This racer's filename and progress for this run will be lost. General player data will be preserved. Don't remove a player just because they've finished the run."
                md-confirm-text="Remove"
                md-cancel-text="Cancel"
                @md-confirm="removeRacer" />
        </md-card-header>`,
        props: ["racer", "run"],
        replicants: ["players"],
        data() {
            return {
                showEditDialog: false,
                showSwapDialog: false,
                showRemoveDialog: false,
                edit: {
                    player: {}
                }
            }
        },
        computed: {
        },
        methods: {
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
            swapRacer(name) {
                for (let i = 0; i < this.run.racers.length; ++i) {
                    if (this.run.racers[i].name === name) {
                        this.run.racers[i].name = this.racer.name;
                        break;
                    }
                }
                this.racer.name = name;
                this.showSwapDialog = false;
            },
            removeRacer() {
                this.run.racers.splice(this.run.racers.indexOf(this.racer), 1);
            }
        }
    });
})();