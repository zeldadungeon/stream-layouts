(function () {
    "use strict";

    Vue.use(VueMaterial.default);

    Vue.component("zd-elimination-card", {
        template: `<md-card>
            <md-card-media-cover md-solid>
                <md-card-media><img :src="background" /></md-card-media>

                <md-card-area>
                    <zd-racer-card-header :racer="racer" :run="run"></zd-racer-card-header>
                
                    <md-card-content>
                        <md-field md-inline>
                            <label>Filename</label>
                            <md-input v-model="racer.filename"></md-input>
                        </md-field>
                    </md-card-content>
                </md-card-area>
            </md-card-media-cover>

            <md-card-actions md-alignment="space-between">
                <div>{{ position }}</div>
                <div>
                    <md-button v-if="racer.checkpoint > 0 && racer.state !== 'eliminated' && racer.finish == undefined"
                            class="md-raised md-icon-button"
                            @click="undo">
                        <md-icon>undo</md-icon>
                    </md-button>
                    <md-button v-if="racer.state === 'eliminated'" class="md-raised" disabled>Eliminated</md-button>
                    <md-button v-else-if="racer.checkpoint < checkpoints.length"
                            class="md-raised"
                            :class="splitButtonClass"
                            @click="split"
                            :disabled="run.state !== 'running'">
                        {{ checkpoints[racer.checkpoint || 0] }}
                    </md-button>
                    <zd-finish-button v-else :racer="racer" :disabled="run.state !== 'running'" @finish="finish"></zd-finish-button>
                </div>
            </md-card-actions>
        </md-card>`,
        props: ["racer", "run"],
        replicants: ["players", "stopwatch"],
        data() {
            return {
                checkpoints: [
                    "Deepwood Shrine",
                    "Gust Jar",
                    "Earth Element",
                    "Cave of Flames",
                    "Cane of Pacci",
                    "Fire Element",
                    "Pegasus Boots",
                    "Fortress of Winds"
                ],
                showFinishDialog: false,
                edit: {
                    finish: null,
                }
            }
        },
        computed: {
            background() {
                return `../../shared/images/Elimination/${this.racer.state === "eliminated" && "Eliminated" || this.checkpoints[this.racer.checkpoint || 0] || "Finish"}.png`;
            },
            position() {
                return { 0: " ", 1: "1st", 2: "2nd", 3: "3rd" }[this.racer.position || 0] || `${this.racer.position}th`;
            },
            splitButtonClass() {
                return this.racer.state === 'warning' ? "md-accent" : "md-primary";
            }
        },
        methods: {
            split() {
                // define reactive properties
                if (this.racer.splits == undefined) { this.$set(this.racer, "splits", []); }
                if (this.racer.checkpoint == undefined) { this.$set(this.racer, "checkpoint", 0); }
                if (this.racer.position == undefined) { this.$set(this.racer, "position", 0); }

                // split time and increment checkpoint
                this.$set(this.racer.splits, this.racer.checkpoint++, this.stopwatch.time);
                this.updateStats();
            },
            undo() {
                this.racer.checkpoint--;
                this.updateStats();
            },
            updateStats() {
                // calculate positions (and also define reactive state)
                this.run.racers.slice() // don't sort the actual array
                    .sort((a, b) => b.checkpoint - a.checkpoint || !a.splits && 1 || !b.splits && -1 || a.splits[a.checkpoint - 1] - b.splits[b.checkpoint - 1])
                    .forEach((r, i) => {
                        this.$set(r, "position", r.checkpoint ? i + 1 : this.run.racers.length);
                        this.$set(r, "state", "");
                    });

                // calculate warning/elimination
                for (let i = this.checkpoints.length; i >= 1; --i) {
                    const allowed = this.run.racers.length - i;
                    
                    const numPassed = this.run.racers.filter(r => r.checkpoint >= i).length;
                    if (numPassed >= allowed) {
                        // eliminate everyone else
                        this.run.racers.filter(r => r.checkpoint < i).forEach(r => r.state = "eliminated");
                    } else if (numPassed === allowed - 1) {
                        const numChasing = this.run.racers.filter(r => r.checkpoint === i - 1).length;

                        if (numChasing > 0) {
                            // warn everyone not chasing (as well as those who are chasing, if more than 1)
                            this.run.racers.filter(r => r.checkpoint < (numChasing > 1 ? i : i - 1)).forEach(r => r.state = r.state || "warning");
                        }
                    }
                }
            },
            finish() {
                if (this.run.state === "running" && this.run.racers.every(r => r.finish || r.state === "eliminated")) {
                    this.$emit("finish");
                }
            }
        }
    });
})();