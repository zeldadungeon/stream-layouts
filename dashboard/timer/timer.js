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
        template: `<tr>
            <td>
                <select v-model="selected" @change="setPlayer">
                    <option v-for="p in playerNames" :value="p">{{ p }}</option>
                </select>
            </td>
            <td v-if="player"><button v-if="!player.finish" class="mdl-button mdl-button--raised" @click="finish">Finish</button><time-input v-else v-model.lazy="player.finish"></time-input></td>
            <td v-if="player"><button class="mdl-button mdl-button--raised" @click="clear">Clear</button></td>
        </tr>`,
        props: ["position"],
        replicants: ["players", "stopwatch"],
        data: function() {
            return {
                selected: undefined
            };
        },
        computed: {
            playerNames: function() {
                return this.players ? Object.keys(this.players) : [];
            },
            player: function() {
                this.selected = this.stopwatch && this.stopwatch.results && this.stopwatch.results[this.position];
                return this.players && this.stopwatch && this.stopwatch.results && this.players[this.stopwatch.results[this.position]];
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
            <button class="mdl-button mdl-button--fab" @click="showLess"><i class="material-icons">remove</i></button>
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