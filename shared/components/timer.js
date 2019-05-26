function formatTime(time, small) {
    time = time || 0;
    let h = Math.floor(time / 3600);
    let m = Math.floor(time % 3600 / 60);
    let s = Math.floor(time % 3600 % 60);

    if (small && h === 0) {
        h = m;
        m = s;
    }

    return `${h}:${m < 10 ? "0" : ""}${m}${small ? "" : `:${s < 10 ? "0" : ""}${s}`}`;
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
                this.$el.value = formatTime(this.value);
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
})();
