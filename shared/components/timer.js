function formatTime(time, mode) {
    time = time || 0;
    const h = Math.floor(time / 3600);
    const m = Math.floor(time % 3600 / 60);
    const s = Math.floor(time % 3600 % 60);

    const parts = [];
    if (mode === "full" || h > 0) {
        parts.push(`${h}`); // never 0-pad hours
    }
    // if (mode === "full" || time >= 60) {
        parts.push(`${m < 10 && parts.length > 0 ? "0" : ""}${m}`);
    // }
    if (mode !== "countdown" || h === 0) {
        parts.push(`${s < 10 && parts.length > 0 ? "0" : ""}${s}`);
    }

    return parts.join(":");
}

(function () {
    "use strict";

    Vue.component("zd-time-display", {
        template: `<span>{{ display }}</span>`,
        props: ["time"],
        computed: {
            display() {
                return formatTime(this.time);
            }
        }
    })
    
    Vue.component("zd-timer", {
        template: `<div class="zd-timer" :class="{ 'zd-timer--running': stopwatch.state == 'running' }"><zd-time-display :time="stopwatch.time" /></div>`,
        replicants: ["stopwatch"]
    });

    Vue.component("zd-time-input", {
        template: `<md-input @focus="onFocus" @blur="onBlur" @input="onInput" @change="setDisplayValue" />`,
        props: ["value"],
        data() {
            return {
                focused: false
            }
        },
        watch: {
            value() {
                if (!this.focused) {
                    this.setDisplayValue();
                }
            }
        },
        mounted() {
            this.setDisplayValue();
        },
        methods: {
            onInput() {
                this.$emit("input", this.parse(this.$el.value));
            },
            onFocus() {
                this.focused = true;
            },
            onBlur() {
                this.focused = false;
                this.setDisplayValue();
            },
            setDisplayValue() {
                this.$el.value = formatTime(this.value, "full");
            },
            parse(value) {
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
            }
        }
    });

    Vue.component("zd-countdown", {
        template: `<span class="zd-countdown"">Starts in {{ display }}</span>`,
        data: function() {
            return {
                now: new Date()
            }
        },
        computed: {
            display() {
                return formatTime((new Date(window.location.search.substring(2).split('&')[1]) - this.now)/1000);
            }
        },
        created() {
            setInterval(() => this.now = new Date(), 1000);
        }
    });
})();
