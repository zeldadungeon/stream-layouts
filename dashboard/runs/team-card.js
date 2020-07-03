(function () {
    "use strict";

    Vue.use(VueMaterial.default);

    Vue.component("zd-team-card", {
        template: `<md-card>
            <md-card-header>
                <md-card-header-text>
                    <div class="md-title">{{ racer.name }}<div style="float: right; margin-right: 1em;"><img src="../../shared/images/rip.png" style="height: 1.4em;" /> {{ racer.deaths }}</div></div>
                </md-card-header-text>
            
                <md-menu md-direction="bottom-end">
                    <md-button class="md-icon-button" md-menu-trigger>
                        <md-icon>more_vert</md-icon>
                    </md-button>
        
                    <md-menu-content>
                        <md-menu-item @click="showRemoveDialog = true">
                            <span>Remove</span>
                            <md-icon>remove</md-icon>
                        </md-menu-item>
                    </md-menu-content>
                </md-menu>

                <md-dialog-confirm
                    :md-active.sync="showRemoveDialog"
                    md-title="Remove this team?"
                    md-content="This team's filename and progress for this run will be lost. General player data will be preserved. Don't remove a team just because they've finished the run."
                    md-confirm-text="Remove"
                    md-cancel-text="Cancel"
                    @md-confirm="removeRacer" />
            </md-card-header>
    
            <md-card-content>
                <md-field md-inline>
                    <label>Filename</label>
                    <md-input v-model="racer.filename"></md-input>
                </md-field>

                <div class="md-subheading" style="line-height: 40px;">Members<md-button class="md-icon-button" @click="showAddMemberDialog = true"><md-icon>add</md-icon></md-button></div>
                <div v-if="members.length"><zd-team-member v-for="(member, index) in members" :key="'member-' + index" :team="racer" :member="member"></zd-team-member></div>

                <zd-player-dialog :show.sync="showAddMemberDialog" :taken="run.racers.reduce((acc, cur) => acc.concat((cur.members || []).map(r => r.name)), [])" @save="addMember"></zd-player-dialog>
            </md-card-content>

            <md-card-actions md-alignment="space-between">
                <div>
                    <md-button class="md-raised md-accent"
                        @click="gameover"
                        :disabled="run.state !== 'running'">
                        Game Over
                    </md-button>
                    <md-button class="md-raised md-primary"
                        @click="addPoint"
                        :disabled="run.state !== 'running'">
                        +1 Point
                    </md-button>
                </div>
                <div>
                    <zd-finish-button :racer="racer" :disabled="run.state !== 'running'" @finish="finish"></zd-finish-button>
                </div>
            </md-card-actions>
        </md-card>`,
        props: ["racer", "run"],
        replicants: ["stopwatch"],
        data() {
            return {
                showAddMemberDialog: false,
                showRemoveDialog: false
            }
        },
        computed: {
            members() {
                return this.racer && this.racer.members || [];
            }
        },
        methods: {
            addMember(name) {
                if (!this.racer.members) { this.$set(this.racer, "members", []); }
                this.members.push({
                    name,
                    points: 0
                });
                if (!this.racer.currentRacer) { this.$set(this.racer, "currentRacer", 0); }
                this.showAddMemberDialog = false;
            },
            gameover() {
                ++this.racer.deaths;
                this.racer.currentRacer = ((this.racer.currentRacer || 0) + 1) % this.racer.members.length;
            },
            addPoint() {
                let currentRacer = this.racer.members[this.racer.currentRacer || 0];
                if (currentRacer.points == undefined) {
                    this.$set(currentRacer, "points", 0);
                }
                ++currentRacer.points;
            },
            finish() {
                if (this.run.state === "running" && this.run.racers.every(r => r.finish)) {
                    this.$emit("finish");
                }
            },
            removeRacer() {
                this.run.racers.splice(this.run.racers.indexOf(this.racer), 1);
                this.run.racers.forEach((r, i) => r.name = `Team ${i + 1}`);
            }
        }
    });
})();