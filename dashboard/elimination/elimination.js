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
    
    Vue.component("zd-runner", {
        template: `<tr :class="{ 'zd-runner--eliminated': eliminated }">
            <td>
                <select v-model="selected" @change="setPlayer">
                    <option v-for="p in playerNames" :value="p">{{ p }}</option>
                </select>
            </td>
            <td v-if="player"><button v-if="!player.finish" class="mdl-button mdl-button--raised" @click="finish">Finish</button><time-input v-else v-model.lazy="player.finish"></time-input></td>
            <td v-if="player"><button class="mdl-button mdl-button--raised" @click="clear">Clear</button></td>
            <td v-if="player" v-for="n in checkpoints.length">
                <button
                    class="mdl-button mdl-button--raised"
                    :class="{ 'zd-bingo__button--completed': player.checkpoints && player.checkpoints[checkpoints[n - 1]] }"
                    :disabled="eliminated || n > 1 && (!player.checkpoints || !player.checkpoints[checkpoints[n - 2]])"
                    @click="toggle(checkpoints[n - 1])">{{ checkpoints[n - 1] }}</button>
            </td>
        </tr>`,
        props: ["position"],
        replicants: ["players", "stopwatch"],
        data: function() {
            return {
                selected: undefined,
                checkpoints: [
                    "Enter Deepwood Shrine",
                    "Finish Deepwood Shrine",
                    "Enter Cave of Flames",
                    "Finish Cave of Flames",
                    "Enter Fortress of Winds",
                    "Finish Fortress of Winds"
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
            eliminated: function() { // you're elminated if:
                // you're a player, and there's some checkpoint for which:
                return this.player && this.checkpoints.some((checkpoint, index) => {
                    // you have not completed it, and
                    if (this.player.checkpoints && this.player.checkpoints[checkpoint]) {
                        return false; 
                    }

                    // there are enough other players who have completed it
                    const count = this.playerNames.reduce((acc, cur) =>
                        acc + (this.players[cur].checkpoints && this.players[cur].checkpoints[checkpoint] ? 1 : 0), 0);
                    if (count > this.checkpoints.length - index) {
                        this.$set(this.player, "finish", this.checkpoints.length - index + 2); // side-effect: set place

                        return true;
                    }

                    return false;
                });
            }
        },
        methods: {
            setPlayer: function() {
                console.log("setting to ", this.selected);
                this.$set(this.stopwatch.results, this.position, this.selected);
                console.log("results", this.stopwatch.results);
            },
            finish: function() {
                console.log("finish", this.player.finish, this.stopwatch.time);
                if (this.player.finish === undefined) {
                    this.$set(this.player, "finish", this.stopwatch.time);
                } else {
                    this.player.finish = this.stopwatch.time;
                }
            },
            clear: function() {
                if (window.confirm("sure?")) this.player.finish = 0;
            },
            toggle: function(checkpoint) {
                console.log("toggle", checkpoint);
                if (!this.player.checkpoints) {
                    this.$set(this.player, "checkpoints", {});
                }
                if (this.player.checkpoints[checkpoint]) {
                    console.log(this.player.checkpoints[checkpoint]);
                    this.player.checkpoints[checkpoint] = undefined;
                } else {
                    this.$set(this.player.checkpoints, checkpoint, this.stopwatch.time);
                }
            }
        }
    });
    
    const app = new Vue({
        el: "#app",
        template: `<div>
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
            <table>
                <zd-runner v-for="n in show" :position="n - 1"></zd-runner>
            </table>
            <button class="mdl-button mdl-button--fab" @click="showMore"><i class="material-icons">add</i></button>
            <button class="mdl-button mdl-button--fab" @click="showLess"><i class="material-icons">remove</i></button>
        </div>`,
        replicants: ["stopwatch"],
        data: {
            show: 10
        },
        methods: {
            showMore: function() {
                ++this.show;
            },
            showLess: function() {
                if (this.show > 0) {
                    --this.show;
                }
            }
        }
	});
})();