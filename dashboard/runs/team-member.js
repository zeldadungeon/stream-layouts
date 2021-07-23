(function () {
    "use strict";

    Vue.use(VueMaterial.default);

    Vue.component("zd-team-member", {
        template: `<div class="md-layout">
            <div class="md-layout-item">
                <md-button class="md-raised" :class="buttonClass" @click="selectMember">{{ member.name }}</md-button>
            </div>
            <!--div class="md-layout-item md-label">{{ member.points }} Points</div-->
            <div class="md-layout-item">
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
                    <md-dialog-title>Editing {{ member.name }}</md-dialog-title>
                    <md-dialog-content>
                        <md-field>
                            <label>Twitter</label>
                            <md-input v-model="edit.player.twitter"></md-input>
                        </md-field>
                        <md-field>
                            <label>Twitch</label>
                            <md-input v-model="edit.player.twitch"></md-input>
                        </md-field>
                        <md-field>
                            <label>Instagram</label>
                            <md-input v-model="edit.player.instagram"></md-input>
                        </md-field>
                    </md-dialog-content>
                    <md-dialog-actions>
                        <md-button class="md-primary" @click="showEditDialog = false">Close</md-button>
                        <md-button class="md-primary" @click="savePlayerChanges">Save</md-button>
                    </md-dialog-actions>
                </md-dialog>
                
                <zd-player-dialog :show.sync="showSwapDialog" :taken="[member.name]" @save="swapMember"></zd-player-dialog>

                <md-dialog-confirm
                    :md-active.sync="showRemoveDialog"
                    md-title="Remove this member?"
                    md-content="This member's score for this run will be lost. General player data will be preserved."
                    md-confirm-text="Remove"
                    md-cancel-text="Cancel"
                    @md-confirm="removeMember" />
            </div>
        </div>`,
        props: ["team", "member"],
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
            buttonClass: function() {
                return this.team.members[this.team.currentRacer || 0].name === this.member.name ? "md-primary" : "";
            }
        },
        methods: {
            selectMember() {
                this.team.currentRacer = this.team.members.findIndex(m => m.name === this.member.name);
            },
            editPlayer() {
                this.edit.player = {
                    twitter: this.players[this.member.name].twitter,
                    twitch: this.players[this.member.name].twitch,
                    instagram: this.players[this.member.name].instagram
                };
                this.showEditDialog = true;
            },
            savePlayerChanges() {
                this.players[this.member.name].twitter = this.edit.player.twitter;
                this.players[this.member.name].twitch = this.edit.player.twitch;
                this.players[this.member.name].instagram = this.edit.player.instagram;
                this.showEditDialog = false;
            },
            swapMember(name) {
                for (let i = 0; i < this.team.members.length; ++i) {
                    if (this.team.members[i].name === name) {
                        this.team.members[i].name = this.member.name;
                        break;
                    }
                }
                this.member.name = name;
                this.showSwapDialog = false;
            },
            removeMember() {
                let memberIndex = this.team.members.indexOf(this.member);
                if (this.team.currentRacer >= memberIndex) {
                    --this.team.currentRacer;
                }
                this.team.members.splice(memberIndex, 1);
            }
        }
    });
})();