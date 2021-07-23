(function () {
	"use strict";

	const MOD = 12;

	Vue.component("zd-player", {
		template: `<div class="zd-player" :class="specialClass">
			<div class="zd-player__result" :class="resultClass" v-html="result"></div>
			<div class="zd-spinner">
				<div class="zd-spinner__item" :class="nameClass">
					<div v-if="run.rules === 'Teams'">
						<div v-if="mem != undefined">{{ currentPlayer.name }}</div>
						<div v-else>
							<span v-for="(member, index) in racer.members" :key="member.name"><span :class="memberClass(member)">{{ member.name }}</span><span v-if="index < racer.members.length - 1">, </span></span>
						</div>
					</div>
					<div v-else>{{ player.name }}{{ info }}</div>
				</div>
				<div class="zd-spinner__item" :class="twitchClass"><span class="zd-player__twitch">{{currentPlayer.twitch}}</span></div>
				<div class="zd-spinner__item" :class="twitterClass"><span class="zd-player__twitter">{{currentPlayer.twitter}}</span></div>
				<div class="zd-spinner__item" :class="instagramClass"><span class="zd-player__instagram">{{currentPlayer.instagram}}</span></div>
				<div class="zd-spinner__item" :class="filenameClass">{{ filenameText }}</div>
			</div>
		</div>`,
		props: ["num", "mem", "pos", "runName", "totalNumDisplayed"],
		replicants: ["runs", "players", "ticker", "stopwatch"],
        data: function() {
            return {
				positionChange: "",
				gainedTime: ""
            };
        },
		computed: {
			run() {
				return this.runs && this.runs.start && this.runs[this.runName || this.runs.start.current] || { racers: [] };
			},
			adjustedNum() {
				if (this.run.rules === "Elimination") {
					let numNotEliminated = 0;
					for (let i = 0; i < this.run.racers.length; ++i) {
						if ((this.run.racers[i].position == undefined || this.run.racers[i].position <= this.totalNumDisplayed) && numNotEliminated++ === this.num) {
							return i;
						}
					}
				}

				return this.num;
			},
			racer() {
				return this.run.racers[this.adjustedNum] || {};
			},
			player() {
				return this.players && this.players[this.racer.name] || {};
			},
			currentRacer() {
				if (!this.racer.members) {
					// individual racer, not a team
					return this.racer;
				}

				if (this.run.teamRotationMode == "Split" && this.mem != undefined) {
					return this.racer.members[this.mem] || {};
				}

				if (this.run.teamRotationMode == undefined || this.run.teamRotationMode === "Static") {
					// "currentRacer" isn't relevant, but let's rotate through their social media
					const mod = this.ticker.tick % (MOD * this.racer.members.length);
					return this.racer.members[Math.floor(mod/MOD)] || {};
				}

				return this.racer.members[this.racer.currentRacer] || {};
			},
			currentPlayer() {
				return this.players && this.players[this.currentRacer.name] || this.player;
			},
			nameClass() {
				const mod = this.ticker.tick % MOD;
				const show = mod != 0 && mod != 1 && mod != 2 && mod != 5 || !this.currentPlayer.twitch && mod == 0 || !this.currentPlayer.twitter && mod == 1 || !this.currentPlayer.instagram && mod == 2 || !this.racer.filename && mod == 5;
				return {
					"zd-spinner__item--show": show,
					"zd-spinner__item--hide": !show
				};
			},
			twitchClass() {
				const show = this.currentPlayer.twitch && this.ticker.tick % MOD == 0;
				return {
					"zd-spinner__item--show": show,
					"zd-spinner__item--hide": !show
				};
			},
			twitterClass() {
				const show = this.currentPlayer.twitter && this.ticker.tick % MOD == 1;
				return {
					"zd-spinner__item--show": show,
					"zd-spinner__item--hide": !show
				};
			},
			instagramClass() {
				const show = this.currentPlayer.instagram && this.ticker.tick % MOD == 2;
				return {
					"zd-spinner__item--show": show,
					"zd-spinner__item--hide": !show
				};
			},
			filenameClass() {
				const show = this.racer.filename && this.ticker.tick % MOD == 5;
				return {
					"zd-spinner__item--show": show,
					"zd-spinner__item--hide": !show
				};
			},
			filenameText() {
				return this.racer.filename2 ? `${this.racer.filename} / ${this.racer.filename2}` : `Filename: ${this.racer.filename}`;
			},
            result() {
				if (!this.racer) { return this.format(0); }

				if (this.run.rules === "Elimination" && this.racer.state === "eliminated") {
					const place = this.racer.position;
					return `OUT - ${place}${{1: "st", 2: "nd", 3: "rd"}[place] || "th"} place`
				} else if (this.run.rules === "Royal Rumble" && !this.racer.finish) {
					return [this.positionChange, this.gainedTime].filter(v => v).join(" ");
				}

				return this.format(this.racer.finish || 0);
			},
			resultClass() {
				return this.racer && (this.racer.finish ||
					this.run.rules === "Elimination" && this.racer.state === "eliminated" ||
					this.run.rules === "Royal Rumble" && (this.positionChange || this.gainedTime)) ?
						`zd-player__result--${this.pos || "topleft"}` : "";
			},
            specialClass() {
				return `zd-player--${this.pos || "topleft"}${this.run.rules === "Elimination" && this.racer && {
					eliminated: " zd-player--eliminated",
					warning: " zd-player--warning"
				}[this.racer.state] || ""}`;
			},
			info() {
				if (this.run.rules === "Royal Rumble") {
					const longestEstimate = this.run.racers.reduce((longest, racer) => Math.max(longest, racer.estimate), 0);
					if (this.racer.position === 1 || !this.racer.position && this.racer.estimate === longestEstimate) {
						return " - Leader";
					}

					const offset = longestEstimate - this.racer.estimate;
					if (this.stopwatch.time < offset) {
						return " joins in " + this.format(offset - this.stopwatch.time);
					}

					if (!this.racer.checkpoint) {
						return ` - ${this.format(offset)} behind`;
					}

					const mySplit = this.racer.splits[this.racer.checkpoint - 1];
					const first = this.run.racers.reduce((first, racer) => Math.min(first, racer.splits[this.racer.checkpoint - 1] || Number.MAX_SAFE_INTEGER), mySplit);
					if (mySplit === first) {
						return " lost the lead!";
					}

					console.log(mySplit, first);
					return  ` - ${this.format(mySplit - first)} behind`;
				} else return "";
			}
		},
		methods: {
			memberClass(member) {
				return  this.run.teamRotationMode != undefined && this.run.teamRotationMode !== 'Static' && member === this.currentRacer ? "zd-highlight" : "";
			},
            format(time, diff = false) {
                let negative = time < 0;
                if (negative) { time = -time; }
				const h = Math.floor(time / 3600);
				const m = Math.floor(time % 3600 / 60);
				const s = Math.floor(time % 3600 % 60);
				const formatted = `${h ? `${h}:` : ""}${m < 10 ? "0" : ""}${m}:${s < 10 ? "0" : ""}${s}`;

				return diff ? `<span class="zd-time--${time === 0 ? "zero" : negative ? "negative" : "positive"}">${formatted}</span>` :
					`${negative ? "-" : ""}${formatted}`;
            }
		},
		mounted() {
			this.$watch("racer.checkpoint", function(val, old) {
				if (val <= old || val < 1 || !old || !val) return;

				const longestEstimate = this.run.racers.reduce((longest, racer) => Math.max(longest, racer.estimate), 0);
				const offset = longestEstimate - this.racer.estimate;
				const mySplit = this.racer.splits[this.racer.checkpoint - 1];
				const thisSplit = mySplit - this.run.racers.reduce((first, racer) => Math.min(first, racer.splits[this.racer.checkpoint - 1] || Number.MAX_SAFE_INTEGER), mySplit);
                const prevSplit = this.racer.checkpoint - 1 === 0 ? offset :
                    this.racer.splits[this.racer.checkpoint - 2] - this.run.racers.reduce((first, racer) => Math.min(first, racer.splits[this.racer.checkpoint - 2] || Number.MAX_SAFE_INTEGER), this.racer.splits[this.racer.checkpoint - 2]);
                const diff = thisSplit - prevSplit;

				if (thisSplit === 0 && prevSplit === 0) return; // leader both splits

				this.gainedTime = this.format(diff, true);
				const self = this;
				setTimeout(() => self.gainedTime = undefined, 10000);
			});
			this.$watch("racer.position", function(val, old) {
				if (val === old || !old || !val) return;

				this.positionChange = `<span style="color: ${val < old ? "lightgreen" : "lightcoral"};">${val}${{1:"st",2:"nd",3:"rd"}[val]||"th"}</span>`
				const self = this;
				setTimeout(() => self.positionChange = undefined, 10000);
			});
		}
	});
})();
