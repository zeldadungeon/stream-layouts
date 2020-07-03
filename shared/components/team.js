(function () {
	"use strict";

	const MOD = 12;

	Vue.component("zd-team", {
		template: `<div class="zd-player" :class="specialClass">
			<div class="zd-player__result" :class="resultClass" v-html="result"></div>
			<div class="zd-spinner">
				<div class="zd-spinner__item" :class="nameClass">
					<span v-for="(member, index) in team.members" :key="member.name"><span :class="memberClass(member)">{{ member.name }}: {{ member.points }}</span><span v-if="index < team.members.length - 1">, </span></span>
				</div>
				<div class="zd-spinner__item" :class="twitchClass"><span class="zd-player__twitch">{{ currentPlayer.twitch }}</span></div>
				<div class="zd-spinner__item" :class="twitterClass"><span class="zd-player__twitter">{{ currentPlayer.twitter }}</span></div>
				<div class="zd-spinner__item" :class="filenameClass">{{ filenameText }}</div>
			</div>
		</div>`,
		props: ["num", "pos", "runName"],
		replicants: ["runs", "players", "ticker", "stopwatch"],
		computed: {
			run() {
				return this.runs && this.runs.start && this.runs[this.runName || this.runs.start.current] || { racers: [] };
			},
			team() {
				return this.run.racers[this.num] || {};
			},
			currentRacer() {
				return this.team.members && this.team.members[this.team.currentRacer] || {};
			},
			currentPlayer() {
				return this.players && this.players[this.currentRacer.name] || {};
			},
			nameClass() {
				const mod = this.ticker.tick % MOD;
				const show = mod != 0 && mod != 1 && mod != 5 || !this.currentPlayer.twitch && mod == 0 || !this.currentPlayer.twitter && mod == 1 || !this.team.filename && mod == 5;
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
			filenameClass() {
				const show = this.team.filename && this.ticker.tick % MOD == 5;
				return {
					"zd-spinner__item--show": show,
					"zd-spinner__item--hide": !show
				};
			},
			filenameText() {
				return this.team.filename2 ? `${this.team.filename} / ${this.team.filename2}` : `Filename: ${this.team.filename}`;
			},
            result() {
				if (!this.team) { return this.format(0); }

				return this.format(this.team.finish || 0);
			},
			resultClass() {
				return this.team && this.team.finish ?
						`zd-player__result--${this.pos || "topleft"}` : "";
			},
            specialClass() {
				return `zd-player--${this.pos || "topleft"}`;
			}
		},
		methods: {
			memberClass(member) {
				return member === this.currentRacer ? "zd-highlight" : "";
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
		}
	});
})();
