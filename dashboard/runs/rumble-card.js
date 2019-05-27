(function () {
    "use strict";

    Vue.use(VueMaterial.default);

    Vue.component("zd-rumble-card", {
        template: `<md-card>
            <md-card-media-cover md-text-scrim>
                <md-card-media md-ratio="16:9"><img :src="background" /></md-card-media>

                <md-card-area>
                    <zd-racer-card-header :racer="racer" :run="run"></zd-racer-card-header>
                
                    <md-card-content>
                        <div class="md-layout md-gutter">
                            <div class="md-layout-item">
                                <md-field md-inline>
                                    <label>Link</label>
                                    <md-input v-model="racer.filename"></md-input>
                                </md-field>
                            </div>
                            <div class="md-layout-item">
                                <md-field md-inline>
                                    <label>Epona</label>
                                    <md-input v-model="racer.filename2"></md-input>
                                </md-field>
                            </div>
                        </div>
                    </md-card-content>
                </md-card-area>
            </md-card-media-cover>

            <md-card-expand>
                <md-card-actions md-alignment="space-between">
                    <div>
                        <md-card-expand-trigger>
                            <md-button class="md-icon-button"><md-icon>keyboard_arrow_down</md-icon></md-button>
                        </md-card-expand-trigger>
                        <span style="line-height: 40px;">{{ position }}</span>
                    </div>
                    <div>
                        <md-button v-if="racer.checkpoint > 0 && racer.finish == undefined"
                                class="md-raised md-icon-button"
                                @click="undo">
                            <md-icon>undo</md-icon>
                        </md-button>
                        <md-button v-if="racer.checkpoint < checkpoints.length"
                                class="md-raised md-primary"
                                @click="split"
                                :disabled="run.state !== 'running' || timeToStart > 0">
                            {{ splitButtonText }}
                        </md-button>
                        <zd-finish-button v-else :racer="racer" @finish="finish" @reset="racer.checkpoint--"></zd-finish-button>
                    </div>
                </md-card-actions>

                <md-card-expand-content>
                    <md-card-content>
                        <div class="md-layout md-gutter">
                            <div class="md-layout-item">
                                <md-field class="md-has-value">
                                    <label>Estimate</label>
                                    <zd-time-input v-model="racer.estimate" />
                                </md-field>
                            </div>
                            <div class="md-layout-item" v-if="racer.checkpoint">
                                <md-field>
                                    <label>Split</label>
                                    <md-select v-model="viewSplit">
                                        <md-option v-for="n in racer.checkpoint" :key="n - 1" :value="n - 1">{{ checkpoints[n - 1] || "Finish" }}</md-option>
                                    </md-select>
                                </md-field>
                            </div>
                        </div>
                        <div v-if="racer.checkpoint">
                            <div class="md-layout md-gutter">
                                <div class="md-layout-item md-size-50">
                                    <md-field class="md-has-value">
                                        <label>Time</label>
                                        <zd-time-input v-model="racer.splits[viewSplit]" />
                                    </md-field>
                                </div>
                                <div class="md-layout-item md-size-50">
                                    <zd-readonly-field :label="'Behind first'" :value="behindFirst === 0 ? 'N/A' : formatTime(behindFirst)" />
                                </div>
                                <div class="md-layout-item md-size-50">
                                    <zd-readonly-field :label="'Normalized'" :value="formatTime(normalized)" />
                                </div>
                                <div class="md-layout-item md-size-50">
                                    <zd-readonly-field
                                        :label="'Paced to pass first at'"
                                        :value="projection === viewTime ? 'N/A' : projection < viewTime ? 'Never' : projection > (60 * 60 * 24) ? 'A long time' : formatTime(projection)"
                                        :state="projection === viewTime ? '' : projection < viewTime || projection > longestEstimate ? 'bad' : 'good'" />
                                </div>
                                <div class="md-layout-item md-size-50">
                                    <zd-readonly-field :label="'Split'" :value="formatTime(thisSplit)" />
                                </div>
                                <div class="md-layout-item md-size-50">
                                    <zd-readonly-field :label="'Gained'" :value="gained" :state="gained === 'N/A' || gained === '0:00' ? '' : gained.startsWith('-') ? 'bad' : 'good'" />
                                </div>
                            </div>
                        </div>
                    </md-card-content>
                </md-card-expand-content>
            </md-card-expand>
        </md-card>`,
        props: ["racer", "run"],
        replicants: ["players", "stopwatch"],
        data() {
            return {
                checkpoints: [
                    "Lantern",
                    "Goats 2",
                    "Forest Temple",
                    "Gale Boomerang",
                    "Diababa",
                    "Demolition",
                    "Iron Boots",
                    "Goron Mines",
                    "Hero's Bow",
                    "Fyrus",
                    "Zora's Domain",
                    "Lanayru Vessel",
                    "Lakebed Temple",
                    "Clawshot",
                    "Morpheel",
                    "Master Sword",
                    "Arbiter's Grounds",
                    "Spinner",
                    "Stallord",
                    "Snowpeak Ruins",
                    "Ball and Chain",
                    "Blizzeta",
                    "Temple of Time",
                    "Dominion Rod",
                    "Armogohma",
                    "Ancient Sky Book",
                    "City in the Sky",
                    "Double Clawshots",
                    "Argorok",
                    "Palace of Twilight",
                    "Master Sword L2",
                    "Zant",
                    "Hyrule Castle",
                    "Big Key"
                ],
                viewSplit: null
            }
        },
        computed: {
            background() {
                return `../../shared/images/Rumble/${this.timeToStart > 0 ? "Start" : this.checkpoints[this.racer.checkpoint || 0] || "Finish"}.png`;
            },
            position() {
                return { 0: " ", 1: "1st", 2: "2nd", 3: "3rd" }[this.racer.position || 0] || `${this.racer.position}th`;
            },
            longestEstimate() {
                return this.run.racers.reduce((longest, racer) => Math.max(longest, racer.estimate), 0);
            },
            timeToStart() {
                return this.longestEstimate - this.racer.estimate - this.stopwatch.time;
            },
            splitButtonText() {
                return this.timeToStart > 0 ? `Starts in ${formatTime(this.timeToStart, "countdown")}` : this.checkpoints[this.racer.checkpoint || 0];
            },
            viewTime() {
                return this.racer.splits[this.viewSplit];
            },
            behindFirst() {
                const first = this.run.racers.reduce((first, racer) => Math.min(first, racer.splits[this.viewSplit] || Number.MAX_SAFE_INTEGER), this.viewTime);

                return this.viewTime - first;
            },
            offset() {
                return this.longestEstimate - this.racer.estimate;
            },
            normalized() {
                return this.viewTime - this.longestEstimate + this.racer.estimate;
            },
            projection() {
                const first = this.run.racers.reduce((first, racer) => racer.splits[this.viewSplit] < first.splits[this.viewSplit] ? racer : first, this.racer);
                if (first === this.racer) {
                    return this.viewTime;
                }

                const firstOffset = this.longestEstimate - first.estimate;
                const firstNormalized = first.splits[this.viewSplit] - firstOffset;
                if (this.normalized === firstNormalized) return 0; // protect against division by zero
                const projection = Math.round((firstOffset * this.normalized - this.offset * firstNormalized) / (this.normalized - firstNormalized));
                return projection;
            },
            thisSplit() {
                return this.viewTime - (this.racer.splits[this.viewSplit - 1] || this.offset);
            },
            gained() {
                const thisSplit = this.viewTime - this.run.racers.reduce((first, racer) => Math.min(first, racer.splits[this.viewSplit] || Number.MAX_SAFE_INTEGER), this.viewTime);
                const prevSplit = this.viewSplit === 0 ? this.offset :
                    this.racer.splits[this.viewSplit - 1] - this.run.racers.reduce((first, racer) => Math.min(first, racer.splits[this.viewSplit - 1] || Number.MAX_SAFE_INTEGER), this.racer.splits[this.viewSplit - 1]);
                const diff = prevSplit - thisSplit;

                return thisSplit === 0 && prevSplit === 0 ? "N/A" : // leader both splits
                    diff < 0 ? `-${formatTime(-diff)}` : // fell behind
                    formatTime(diff);
            },
            checkpoint() {
                return this.racer.checkpoint;
            }
        },
        methods: {
            split() {

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
                const sorted = this.run.racers.slice().sort((a, b) =>
                    b.checkpoint - a.checkpoint || // higher checkpoint is better. if same,
                    (a.checkpoint === 0 ? 0 : // if they haven't started then they're tied, else
                    a.splits[a.checkpoint - 1] - b.splits[b.checkpoint - 1])); // lower time is better

                sorted.forEach((r, i) => {
                    r.position = i + 1;
                });
            },
            finish() {
                this.split();
                if (this.run.state === "running" && this.run.racers.every(r => r.finish)) {
                    this.$emit("finish");
                }
            },
            formatTime(time, mode) { // this gives the template access to the global formatTime function
                return formatTime(time, mode);
            }
        },
        watch: {
            checkpoint(val) {
                this.viewSplit = val - 1;
            }
        },
        mounted() {
            this.viewSplit = this.checkpoint - 1;
        }
    });
})();