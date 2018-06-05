(function () {
    "use strict";

    Vue.component("time-input", {
        template: `<input @focus="onFocus" @blur="onBlur" @input="onInput" @change="setDisplayValue">`,
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
            <td v-if="player"><button v-if="!player.finish" @click="finish">Finish</button><time-input v-else v-model.lazy="player.finish" style="width: 52px;"></time-input></td>
            <td v-if="player"><button @click="clear">Clear</button></td>
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
            <zd-timer></zd-timer>
            <button onclick="nodecg.sendMessage("timer:start")">Start</button>
            <button onclick="nodecg.sendMessage("timer:stop")">Stop</button>
            <button onclick="nodecg.sendMessage("timer:reset")">Reset</button>
            <table>
                <zd-runner v-for="n in show" v-if="n < show" :position="n - 1"></zd-runner>
            </table>
            <button @click="showMore">+</button>
            <button @click="showLess">-</button>
        </div>`,
        replicants: ["players"],
        data: {
            show: 4
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