(function () {
    "use strict";

    Vue.component("time-input", {
        template: `<input class="mdl-textfield__input" @focus="onFocus" @blur="onBlur" @input="onInput" @change="setDisplayValue">`,
        props: ["value"],
        data: function() {
            return {
                focused: false
            }
        },
        watch: {
            value: function() {
                if (!this.focused) {
                    this.setDisplayValue();
                }
            }
        },
        mounted: function() {
            this.setDisplayValue();
        },
        methods: {
            onInput: function() {
                this.$emit("input", this.parse(this.$el.value));
            },
            onFocus: function() {
                this.focused = true;
            },
            onBlur: function() {
                this.focused = false;
                this.setDisplayValue();
            },
            setDisplayValue: function() {
                this.$el.value = this.format(this.value);
            },
            parse: function(value) {
                const parts = value.trim().split(":");
                if (parts.length > 3) {
                    return 0;
                }

                // check seconds
                let seconds = Number(parts[parts.length - 1]);
                if (isNaN(seconds)) {
                    return 0;
                }

                // check minutes
                if (parts.length > 1) {
                    let minutes = Number(parts[parts.length - 2]);
                    if (isNaN(minutes)) {
                        return 0;
                    }
                    seconds += minutes * 60;
                }

                // check hours
                if (parts.length > 2) {
                    let hours = Number(parts[parts.length - 3]);
                    if (isNaN(hours)) {
                        return 0;
                    }
                    seconds += hours * 60 * 60;
                }
                
                return seconds;
            },
            format: function (time) {
				const h = Math.floor(time / 3600);
				const m = Math.floor(time % 3600 / 60);
				const s = Math.floor(time % 3600 % 60);

				return `${h}:${m < 10 ? "0" : ""}${m}:${s < 10 ? "0" : ""}${s}`;
            }
        }
    });

    Vue.component("zd-checkpoint", {
        template: `<td>
            <button
                v-if="!checkpointData || !checkpointData.finish"
                class="zd-checkpoint-button mdl-button mdl-button--raised"
                :disabled="prev && !player.checkpoints[prev]"
                @click="finish()">{{ checkpoint }}</button>
            <div v-else>
                <time-input v-model.lazy="checkpointData.finish" style="width: 200px;" @input="updateCheckpointData"></time-input>
                <div>Normal: {{ format(checkpointData.normalized) }} | Split: {{ format(checkpointData.split) }}</div>
                <div>Behind: {{ format(checkpointData.behind) }} ({{ format(checkpointData.gained, true) }})</div>
            </div>
        </td>`,
        props: ["position", "checkpoint", "prev"],
        replicants: ["players", "stopwatch"],
        computed: {
            player: function() {
                return this.players && this.stopwatch && this.stopwatch.results && this.players[this.stopwatch.results[this.position]];
            },
            offset: function() {
                return (this.player.offset || 0) * 60;
            },
            checkpointData: function() {
                return this.player.checkpoints[this.checkpoint];
            }
        },
        methods: {
            getFirstFinish(checkpoint) {
                return this.playerNames.reduce((best, p) => Math.min(best, this.players[p].checkpoints[checkpoint] || Number.MAX_VALUE), Number.MAX_VALUE);
            },
            getDiffFromFirst(checkpoint) {
                return this.player.checkpoints[checkpoint] - this.getFirstFinish(checkpoint);
            },
            finish: function() {
                if (!this.player.checkpoints) {
                    this.$set(this.player, "checkpoints", {});
                }

                if (!this.player.checkpoints[this.checkpoint]) {
                    this.$set(this.player.checkpoints, this.checkpoint, {});
                }

                this.$set(this.checkpointData, "finish", this.stopwatch.time);
                this.updateCheckpointData();
            },
            updateCheckpointData: function() {
                const finish = this.checkpointData.finish;
                const prevFinish = this.prev ? this.player.checkpoints[this.prev].finish : 0;
                const prevBehind = this.prev ? this.player.checkpoints[this.prev].behind : this.offset;
                this.$set(this.checkpointData, "normalized", finish - this.offset);
                this.$set(this.checkpointData, "split", finish - prevFinish);

                let firstFinish = Object.keys(this.players).reduce((best, p) => Math.min(best, this.players[p].checkpoints[this.checkpoint] && this.players[p].checkpoints[this.checkpoint].finish || Number.MAX_VALUE), Number.MAX_VALUE);
                if (firstFinish === Number.MAX_VALUE) { firstFinish = 0; } // this happens when the checkpoint is edited to 0 such that nobody's completed it
                this.$set(this.checkpointData, "behind", finish - firstFinish);
                this.$set(this.checkpointData, "gained", this.checkpointData.behind - prevBehind);
                this.$set(this.player, "behind", finish - firstFinish);

                if (this.checkpoint === "Finish") {
                    this.$set(this.player, "finish", finish);
                } else if (this.player.behind) {
                    this.$set(this.player, "gained", this.checkpointData.behind - prevBehind);
                    const self = this;
                    setTimeout(() => self.$set(self.player, "gained", undefined), 10000);
                }
            },
            format: function (time, diff = false) {
                let negative = false;
                if (time < 0) {
                    negative = true;
                    time = -time;
                }
				const h = Math.floor(time / 3600);
				const m = Math.floor(time % 3600 / 60);
				const s = Math.floor(time % 3600 % 60);

				return `${negative ? "-" : diff ? "+" : ""}${h}:${m < 10 ? "0" : ""}${m}:${s < 10 ? "0" : ""}${s}`;
            }
        }
    });

    Vue.component("zd-runner", {
        template: `<tr style="position: relative;">
            <td style="position: absolute; width: 160px; left: 15px; padding-top: 12px;">
                <select v-model="selected" @change="setPlayer">
                    <option v-for="p in playerNames" :value="p">{{ p }}</option>
                </select>
            </td>
            <zd-checkpoint
                v-if="player && stopwatch.time > offset"
                v-for="n in checkpoints.length"
                :key="n"
                :position="position"
                :checkpoint="checkpoints[n - 1]"
                :prev="checkpoints[n - 2]"></zd-checkpoint>
            <td v-if="player && stopwatch.time > offset"><button class="mdl-button mdl-button--raised" @click="clear">Clear</button></td>
            <td v-if="player && stopwatch.time <= offset" style="height: 38px;">Starts in {{ format(offset - stopwatch.time) }}</td>
        </tr>`,
        props: ["position"],
        replicants: ["players", "stopwatch"],
        data: function() {
            return {
                selected: undefined,
                checkpoints: [
                    "Enter Forest Temple",
                    "Finish Forest Temple",
                    "Enter Goron Mines",
                    "Finish Goron Mines",
                    "Enter Lakebed",
                    "Finish Lakebed",
                    "Master Sword",
                    "Enter Arbiter's Grounds",
                    "Finish Arbiter's Grounds",
                    "Enter Snowpeak",
                    "Finish Snowpeak",
                    "Enter Temple of Time",
                    "Finish Temple of Time",
                    "Hidden Village",
                    "Enter City in the Sky",
                    "Finish City in the Sky",
                    "Enter Palace of Twilight",
                    "Finish Palace of Twilight",
                    "Enter Hyrule Castle",
                    "Finish"
                ]
            };
        },
        computed: {
            playerNames: function() {
                return this.players ? Object.keys(this.players) : [];
            },
            player: function() {
                this.selected = this.stopwatch && this.stopwatch.results && this.stopwatch.results[this.position];
                return this.players && this.stopwatch && this.stopwatch.results && this.players[this.stopwatch.results[this.position]];
            },
            offset: function() {
                return (this.player && this.player.offset || 0) * 60;
            }
        },
        methods: {
            setPlayer: function() {
                console.log("setting to ", this.selected);
                this.$set(this.stopwatch.results, this.position, this.selected);
                console.log("results", this.stopwatch.results);
            },
            clear: function() {
                if (window.confirm("sure?")) {
                    this.player.finish = 0;
                    this.$set(this.player, "checkpoints", {});
                    this.$set(this.player, "place", undefined);
                }
            },
            format: function (time, diff = false) {
                let negative = false;
                if (time < 0) {
                    negative = true;
                    time = -time;
                }
				const h = Math.floor(time / 3600);
				const m = Math.floor(time % 3600 / 60);
				const s = Math.floor(time % 3600 % 60);

				return `${negative ? "-" : diff ? "+" : ""}${h}:${m < 10 ? "0" : ""}${m}:${s < 10 ? "0" : ""}${s}`;
            }
        }
    });
    
    const app = new Vue({
        el: "#app",
        template: `<div style="width: 100%">
            <zd-timer style="text-align: center; font-size: 2em;"></zd-timer>
            <div class="mdl-grid">
                <button
                    class="mdl-button mdl-button--raised mdl-cell mdl-cell--2-col"
                    v-if="stopwatch.state === 'stopped' && stopwatch.time === 0"
                    onclick="nodecg.sendMessage('timer:reset');nodecg.sendMessage('timer:start');">Start</button>
                <button
                    class="mdl-button mdl-button--raised mdl-cell mdl-cell--2-col"
                    v-if="stopwatch.state === 'stopped' && stopwatch.time > 0"
                    onclick="nodecg.sendMessage('timer:start');">Resume</button>
                <button
                    class="mdl-button mdl-button--raised mdl-cell mdl-cell--2-col"
                    v-if="stopwatch.state === 'running'"
                    onclick="nodecg.sendMessage('timer:stop');">Stop</button>
                <button
                    class="mdl-button mdl-button--raised mdl-cell mdl-cell--2-col"
                    onclick="if (window.confirm('sure?')) {nodecg.sendMessage('timer:stop');nodecg.sendMessage('timer:reset');}">Reset</button>
            </div>
            <div style="width: calc(100% - 160px); margin-left: 160px; overflow-x: auto;">
                <table>
                    <zd-runner v-for="n in show" :position="n - 1"></zd-runner>
                </table>
            </div>
            <button class="mdl-button mdl-button--fab" @click="showLess" style="margin-top: 38px;"><i class="material-icons">remove</i></button>
        </div>`,
        replicants: ["stopwatch"],
        computed: {
            show: function() {
                return this.stopwatch && this.stopwatch.results && this.stopwatch.results.length + 1 || 0;
            }
        },
        methods: {
            showLess: function() {
                if (this.stopwatch && this.stopwatch.results && this.stopwatch.results.length > 0) {
                    this.stopwatch.results.pop();
                }
            }
        }
	});
})();