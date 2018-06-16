(function () {
	"use strict";

	const MOD = 6;

	Vue.component("zd-player", {
		template: `<div class="zd-player">
			<div class="zd-player__result" :class="resultClass">{{ result }}</div>
			<div class="zd-spinner">
				<div class="zd-spinner__item" :class="nameClass">{{player.name}}</div>
				<div class="zd-spinner__item" :class="twitchClass"><span class="zd-player__twitch">/{{player.twitch}}</span></div>
				<div class="zd-spinner__item" :class="twitterClass"><span class="zd-player__twitter">@{{player.twitter}}</span></div>
			</div>
		</div>`,
		props: ["num", "pos"],
		replicants: ["players", "ticker", "stopwatch"],
		computed: {
			player: function() {
				return this.players && this.stopwatch && this.stopwatch.results && this.players[this.stopwatch.results[this.num]] || {};
			},
			nameClass: function() {
				const mod = this.ticker.tick % MOD;
				const show = mod != 1 && mod != 3 || !this.player.twitch && mod == 1 || !this.player.twitter && mod == 3;
				return {
					"zd-spinner__item--show": show,
					"zd-spinner__item--hide": !show
				};
			},
			twitchClass: function() {
				const show = this.player.twitch && this.ticker.tick % MOD == 1;
				return {
					"zd-spinner__item--show": show,
					"zd-spinner__item--hide": !show
				};
			},
			twitterClass: function() {
				const show = this.player.twitter && this.ticker.tick % MOD == 3;
				return {
					"zd-spinner__item--show": show,
					"zd-spinner__item--hide": !show
				};
			},
            result: function() {
				const time = this.player && this.player.finish || 0;
				const h = Math.floor(time / 3600);
				const m = Math.floor(time % 3600 / 60);
				const s = Math.floor(time % 3600 % 60);

				return `${h}:${m < 10 ? "0" : ""}${m}:${s < 10 ? "0" : ""}${s}`;
			},
			resultClass: function() {
				return this.player && this.player.finish ? `zd-player__result--${this.pos || "topleft"}` : "";
			}
		}
	});
})();
