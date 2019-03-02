(function () {
	"use strict";

	const MOD = 12;

	Vue.component("zd-player", {
		template: `<div class="zd-player" :class="specialClass">
			<div class="zd-player__result" :class="resultClass" v-html="result"></div>
			<div class="zd-spinner">
				<div class="zd-spinner__item" :class="nameClass">{{ player.name }}{{ info }}</div>
				<div class="zd-spinner__item" :class="twitchClass"><span class="zd-player__twitch">/{{player.twitch}}</span></div>
				<div class="zd-spinner__item" :class="twitterClass"><span class="zd-player__twitter">@{{player.twitter}}</span></div>
				<div class="zd-spinner__item" :class="filenameClass">Filename: {{ player.filename }}</div>
			</div>
		</div>`,
		props: ["num", "pos", "type"],
		replicants: ["players", "ticker", "stopwatch"],
        data: function() {
            return {
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
                    "Enter Hyrule Castle"
				],
				showGained: false
            };
        },
		computed: {
			player: function() {
				return this.players && this.stopwatch && this.stopwatch.results && this.players[this.stopwatch.results[this.num]] || {};
			},
			nameClass: function() {
				const mod = this.ticker.tick % MOD;
				const show = mod != 0 && mod != 1 && mod != 5 || !this.player.twitch && mod == 0 || !this.player.twitter && mod == 1 || !this.player.filename && mod == 5;
				return {
					"zd-spinner__item--show": show,
					"zd-spinner__item--hide": !show
				};
			},
			twitchClass: function() {
				const show = this.player.twitch && this.ticker.tick % MOD == 0;
				return {
					"zd-spinner__item--show": show,
					"zd-spinner__item--hide": !show
				};
			},
			twitterClass: function() {
				const show = this.player.twitter && this.ticker.tick % MOD == 1;
				return {
					"zd-spinner__item--show": show,
					"zd-spinner__item--hide": !show
				};
			},
			filenameClass: function() {
				const show = this.player.filename && this.ticker.tick % MOD == 5;
				return {
					"zd-spinner__item--show": show,
					"zd-spinner__item--hide": !show
				};
			},
            result: function() {
				if (!this.player) { return this.format(0); }

				const place = this.player.place;
				if (this.type === "elimination" && place) {
					return `DELETED - ${place}${place === 1 ? "st" : place === 2 ? "nd" : place === 3 ? "rd" : "th"} place`
				} else if (this.type === "rumble" && !this.player.finish) {
					return this.format(this.player.gained, true);
				}

				return this.format(this.player.finish || 0);
			},
			resultClass: function() {
				return this.player && (this.player.finish ||
					this.type === "elimination" && this.player.eliminated ||
					this.type === "rumble" && this.player.gained != undefined) ?
						`zd-player__result--${this.pos || "topleft"}` : "";
			},
            specialClass: function() {
				if (this.type !== "elimination") return "";
                return this.player && this.player.eliminated ? "zd-player--eliminated" :
                	this.player && this.player.danger ? "zd-player--warning" : "";
			},
			info: function() {
				if (this.type === "rumble") {
					const offset = (this.player.offset || 0) * 60;
					if (this.stopwatch.time < offset) {
						return " joins in " + this.format(offset - this.stopwatch.time);
					} else if (this.player.behind) {
						console.log(this.player.behind);
						return ` - ${this.format(this.player.behind)} behind`;
					} else return " - Leader";
				} else return "";
			}
		},
		methods: {
            format: function (time, diff = false) {
                let negative = time < 0;
                if (negative) { time = -time; }
				const h = Math.floor(time / 3600);
				const m = Math.floor(time % 3600 / 60);
				const s = Math.floor(time % 3600 % 60);
				const formatted = `${h ? `${h}:` : ""}${m < 10 ? "0" : ""}${m}:${s < 10 ? "0" : ""}${s}`;

				return diff ? `<span class="zd-time--${time === 0 ? "zero" : negative ? "negative" : "positive"}">${formatted}</span>` :
					`${negative ? "-" : ""}${formatted}`;
            }
		}
	});
})();
