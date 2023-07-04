(function() {
    "use strict";

    const app = new Vue({
        el: "#app",
        template: `<div class="zd-omnibar">
            <transition name="slide" mode="out-in">
                <div class="zd-omnibar__slideover" v-if="event">
                    <div class="zd-omnibar__slideover-body"><img class="zd-omnibar__slideover-icon" :src="'../shared/images/' + event.image" /><span v-html="event.text" style="vertical-align: middle;"></span></div>
                </div>
			</transition>
            <div class="zd-omnibar__logo">
                <transition name="zd-omnibar__logo-transition">
                    <img v-if="expandLogo" src="../shared/images/ZDM23_Logo.png" />
                </transition>
                <transition name="zd-omnibar__logo-transition">
                    <div style="overflow: visible clip;"><img v-if="!expandLogo" style="left: 0px; height: 100%; transform: scale(1.5);" src="../shared/images/ZDM23_Logo.png" /></div>
                </transition>
                <transition name="zd-omnibar__logo-transition">
                    <img v-if="!expandLogo" style="right: 0px;" src="../shared/images/ST_Logo-Tagline_Orange.png" />
                </transition>
            </div>
            <div class="zd-omnibar__divider" />
            <div ref="boundary" class="zd-omnibar__ticker">
                <div class="zd-label" :class="slot1.labelClass">{{ slot1.label }}</div>
                <div ref="slot1Message" :class="slot1.messageClass" v-html="slot1.message"></div>
                <div class="zd-label" :class="slot2.labelClass">{{ slot2.label }}</div>
                <div ref="slot2Message" :class="slot2.messageClass" v-html="slot2.message"></div>
            </div>
            <div class="zd-omnibar__divider" />
            <div class="zd-omnibar__total">
                <div class="zd-bignumber">{{ totalDisplay }}</div>
                <div class="zd-label">Total Raised</div>
                <transition name="rupee">
                    <img v-if="total < donations.total" class="zd-omnibar__total__rupee" :src="rupee" />
                </transition>
                <transition name="match">
                    <div v-if="donations.isMatchActive" class="zd-omnibar__total__match zd-label">Match Active</div>
                </transition>
            </div>
            <div class="zd-omnibar__divider" />
            <div class="zd-omnibar__time"><div class="zd-bignumber">{{ now }}</div><div class="zd-label">Local Time</div></div>
        </div>`,
        replicants: ["ticker", "donations", "message", "social_event"],
        data: {
            now: new Date().toLocaleString("en-US", { hour: "numeric", minute: "numeric", hour12: true }),
            total: 0,
            showSlot1: false,
            slot1: {
                label: "",
                message: "",
                labelClass: "",
                messageClass: ""
            },
            slot2: {
                label: "",
                message: "",
                labelClass: "",
                messageClass: ""
            },
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
            expandLogo: function() {
                const tick = this.ticker && Math.floor(this.ticker.tick / 3) % 6;
                return false; // BGC's and ZD's logos are small so we can keep them both up all the time
                // return tick == 0;
            },
			event: function() {
				const event = this.social_event;
				if (event) {
					switch(event.type) {
						case "tweet":
							return {
								id: event.id,
								image: "LA_Weathervane.gif",
								text: `<strong>@${event.name}: </strong>${event.text}`
							};
						case "donation":
							return {
								id: event.id,
								image: "rupee_anim.gif",
								text: `${event.name ? `<strong>${event.name}</strong>` : `Someone`} donated <strong>$${event.amount.toFixed(2)}</strong>!`
							};
                        case "donationMatch":
                            const endsAt = new Date(event.endsAt);
                            const sameDay = new Date().getDate() == endsAt.getDate();
                            const endTime = endsAt.toLocaleString("en-US", sameDay ? {
                                hour: "numeric",
                                minute: "2-digit",
                                timeZoneName: "shortGeneric"
                            } : {
                                month: "long",
                                day: "numeric",
                                hour: "numeric",
                                minute: "2-digit",
                                timeZoneName: "shortGeneric"
                            });
                            nodecg.playSound("Beedle");
                            return {
                                id: event.id,
                                image: "Beedle.png",
                                text: `${event.name ? `<strong>${event.name}</strong>` : `Someone`} is matching donations until <strong>${endTime}</strong>!`
                            }
						case "cheer":
							return {
								id: event.id,
								image: "force_gem.gif",
								text: `<strong>${event.name}</strong> cheered with <strong>${event.bits} bit${event.bits > 1 ? "s" : ""}</strong>!`
							};
						case "follow":
							return {
								id: event.id,
								image: "BowWow.gif",
								text: `<strong>${event.name}</strong> followed!`
							};
						case "sub":
							return {
								id: event.id,
								image: "phone.gif",
								text: `<strong>${event.name}</strong> subscribed!`
							};
					}
				}

				return null;
			}
        },
        methods: {
        },
        created: function() {
            setInterval(() => this.now = new Date().toLocaleString("en-US", { hour: "numeric", minute: "numeric", hour12: true }), 1000);

            this._nodecgReplicants["message"].on("change", (newVal, oldVal) => {
                this.showSlot1 = !this.showSlot1;
                const activeSlot = this.showSlot1 ? this.slot1 : this.slot2;
                const stagingSlot = this.showSlot1 ? this.slot2 : this.slot1;
                activeSlot.label = newVal.label;
                activeSlot.message = newVal.message;
                activeSlot.labelClass = `zd-omnibar__ticker__active--label`;
                activeSlot.messageClass = `zd-omnibar__ticker__active--${ activeSlot.label ? "message" : "full" }`;
                stagingSlot.labelClass = `zd-omnibar__ticker__staging--label`;
                stagingSlot.messageClass = `zd-omnibar__ticker__staging--${ stagingSlot.label ? "message" : "full" }`;

                if (activeSlot.label) {
                    setTimeout(() => {
                        const messageRef = this.showSlot1 ? this.$refs.slot1Message : this.$refs.slot2Message;
                        if (messageRef && this.$refs.boundary && messageRef.getBoundingClientRect().width > this.$refs.boundary.getBoundingClientRect().width) {
                            activeSlot.messageClass += " zd-omnibar__ticker__active--scroll";
                        }
                    }, Math.max(0, this.ticker.duration/2 - 1500));
                }
            });

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
                        diff === 16 || (diff % 1).toFixed(2) === "0.16" ? "Donation16" :
                        diff >= 100 ? "Donation100+" :
                        diff >= 50 ? "Donation50+" : "Donation");
                }
            });
        }
    });
})();