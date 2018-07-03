(function() {
    "use strict";

    const app = new Vue({
        el: "#app",
        template: `<div class="zd-omnibar">
            <div class="zd-omnibar__logo">
                <transition name="zd-omnibar__logo-transition">
                    <img v-if="expandLogo" src="../shared/images/zd marathon.svg" />
                </transition>
                <transition name="zd-omnibar__logo-transition">
                    <img v-if="!expandLogo" style="left: 0px;" src="../shared/images/zdm icon.svg" />
                </transition>
                <transition name="zd-omnibar__logo-transition">
                    <img v-if="!expandLogo" style="right: 0px;" src="../shared/images/ExtraLife_white.png" />
                </transition>
            </div>
            <div class="zd-omnibar__divider" />
            <div ref="boundary" class="zd-omnibar__ticker">
                <div class="zd-label" :class="frame0LabelClass">{{ frame0Label }}</div>
                <div ref="frame0Message" :class="frame0MessageClass" v-html="frame0Message"></div>
                <div class="zd-label" :class="frame1LabelClass">{{ frame1Label }}</div>
                <div ref="frame1Message" :class="frame1MessageClass" v-html="frame1Message"></div>
            </div>
            <div class="zd-omnibar__divider" />
            <div class="zd-omnibar__total">
                <div class="zd-bignumber">{{ totalDisplay }}</div>
                <div class="zd-label">Total Raised</div>
                <transition name="rupee">
                    <img v-if="total < donations.total" class="zd-omnibar__total__rupee" :src="rupee" />
                </transition>
            </div>
            <div class="zd-omnibar__divider" />
            <div class="zd-omnibar__time"><div class="zd-bignumber">{{ now }}</div><div class="zd-label">Local Time</div></div>
        </div>`,
        replicants: ["ticker", "donations"],
        data: {
            now: new Date().toLocaleString("en-US", { hour: "numeric", minute: "numeric", hour12: true }),
            total: 0,
            scroll0: false,
            scroll1: false,
            rupee: "../shared/images/BotW_Green_Rupee_Icon.png"
        },
        computed: {
            totalDisplay: function() {
                if (this.total === 0) { // initialize to current total
                    this.total = this.donations.total || 0;
                } else if (this.total !== this.donations.total) {
                    const self = this;
                    setTimeout(() => {
                        if (self.donations.total > self.total) {
                            self.total = +((self.total + Math.max(0.01, (self.donations.total - self.total)/100)).toFixed(2));
                        } else if (self.donations.total < self.total) {
                            self.total = +((self.total - Math.max(0.01, (self.total - self.donations.total)/100)).toFixed(2));
                        }
                    }, 2);
                }

                return `\$${this.total.toFixed(2)}`;
            },
            messages: function() {
                return this.ticker && this.ticker.lines || [];
            },
            expandLogo: function() {
                const tick = this.ticker && Math.floor(this.ticker.tick / 3) % 6;
                return tick == 0;
            },
            frame: function() {
                if (this.ticker.tick % 2 === 1) {
                    this.scroll0 = false;
                    setTimeout(() => this.scroll0 = true, Math.max(0, this.ticker.duration/2 - 1500));
                } else if (this.ticker.tick % 2 === 0) {
                    this.scroll1 = false;
                    setTimeout(() => this.scroll1 = true, Math.max(0, this.ticker.duration/2 - 1500));
                }
                return this.ticker.tick % 2;
            },
            frame0Label: function() {
                if (this.messages.length === 0) return "";
                return this.messages[(this.ticker.tick + this.frame) % this.messages.length].label || "";
            },
            frame1Label: function() {
                if (this.messages.length === 0) return "";
                return this.messages[(this.ticker.tick + 1 - this.frame) % this.messages.length].label || "";
            },
            frame0Message: function() {
                if (this.messages.length === 0) return "";
                return this.getMessageForIndex((this.ticker.tick + this.frame) % this.messages.length);
            },
            frame1Message: function() {
                if (this.messages.length === 0) return "";
                return this.getMessageForIndex((this.ticker.tick + 1 - this.frame) % this.messages.length);
            },
            frame0LabelClass: function() {
                return `zd-omnibar__ticker__${this.frame0Label === "" || this.frame === 0 ? "staging" : "active"}--label`
            },
            frame1LabelClass: function() {
                return `zd-omnibar__ticker__${this.frame1Label === "" || this.frame === 1 ? "staging" : "active"}--label`
            },
            frame0MessageClass: function() {
                let scrollClass = "";
                if (this.scroll0 && //this.frame !== 0 &&
                    this.frame0Label !== "" &&
                    this.$refs.frame0Message && this.$refs.boundary &&
                    this.$refs.frame0Message.getBoundingClientRect().width > this.$refs.boundary.getBoundingClientRect().width) {
                    scrollClass = " zd-omnibar__ticker__active--scroll";
                }
                return `zd-omnibar__ticker__${this.frame === 0 ? "staging" : "active"}--${this.frame0Label === "" ? "full" : "message"}${scrollClass}`
            },
            frame1MessageClass: function() {
                let scrollClass = "";
                if (this.scroll1 && //this.frame !== 1 &&
                    this.frame1Label !== "" &&
                    this.$refs.frame1Message && this.$refs.boundary &&
                    this.$refs.frame1Message.getBoundingClientRect().width > this.$refs.boundary.getBoundingClientRect().width) {
                    scrollClass = " zd-omnibar__ticker__active--scroll";
                }
                return `zd-omnibar__ticker__${this.frame === 1 ? "staging" : "active"}--${this.frame1Label === "" ? "full" : "message"}${scrollClass}`
            }
        },
        methods: {
            getMessageForIndex: function(index) {
                for (let war of this.donations.wars) {
                    if (war.title === this.messages[index].label) {
                        const sortedOptions = war.options.sort((a, b) => b.amount - a.amount);
                        let message = "";
                        if (sortedOptions.length > 0) message = `${sortedOptions[0].label} $${sortedOptions[0].amount.toFixed(2)}`
                        if (sortedOptions.length > 1) message = `${message} <strong>〉</strong>${sortedOptions[1].label} $${sortedOptions[1].amount.toFixed(2)}`
                        if (sortedOptions.length > 2) message = `${message} <strong>〉</strong>${sortedOptions[2].label} $${sortedOptions[2].amount.toFixed(2)}`
                        if (sortedOptions.length > 3) message = `${message} <strong>〉</strong>${sortedOptions[3].label} $${sortedOptions[3].amount.toFixed(2)}`
                        return message;
                    }
                }

                return this.messages[index].message || "";
            }
        },
        created: function() {
            setInterval(() => this.now = new Date().toLocaleString("en-US", { hour: "numeric", minute: "numeric", hour12: true }), 1000);

            // Ideally I should watch the vue property but that isn't working.
            // I assume it's because I didn't properly make it reactive, but then why is totalDisplay working??
            this._nodecgReplicants["donations"].on("change", (newVal, oldVal) => {
                if (newVal && oldVal && newVal.total > oldVal.total) {
                    const diff = newVal.total - oldVal.total;
                    const color =
                        diff < 5 ? "Green" :
                        diff < 20 ? "Blue" :
                        diff < 50 ? "Red" :
                        diff < 100 ? "Purple" :
                        diff < 300 ? "Silver" : "Gold";
                    this.rupee = `../shared/images/BotW_${color}_Rupee_Icon.png`;
                    nodecg.playSound(
                        diff === 16 ? "Donation16" :
                        diff >= 100 ? "Donation100+" :
                        diff >= 50 ? "Donation50+" : "Donation");
                }
            });
        }
    });
})();