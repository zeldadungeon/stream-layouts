(function () {
	"use strict";

	const MOD = 6;

	Vue.component("zd-player", {
		template: `<div class="zd-player" :class="specialClass">
			<div class="zd-player__result" :class="resultClass">{{ result }}</div>
			<div class="zd-spinner">
				<div class="zd-spinner__item" :class="nameClass">{{player.name}}</div>
				<div class="zd-spinner__item" :class="twitchClass"><span class="zd-player__twitch">/{{player.twitch}}</span></div>
				<div class="zd-spinner__item" :class="twitterClass"><span class="zd-player__twitter">@{{player.twitter}}</span></div>
			</div>
		</div>`,
		props: ["num", "pos", "type"],
		replicants: ["players", "ticker", "stopwatch"],
        data: function() {
            return {
                checkpoints: [
                    "Enter Deepwood Shrine",
                    "Get Gust Jar",
                    "Finish Deepwood Shrine",
                    "Enter Cave of Flames",
                    "Get Cane of Pacci",
                    "Finish Cave of Flames",
                    "Get Pegasus Boots",
                    "Enter Fortress of Winds"
                ]
            };
        },
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
				if (this.type === "elimination" && time < 16) {
					return `DELETED - ${time}${time === 1 ? "st" : time === 2 ? "nd" : time === 3 ? "rd" : "th"} place`
				}
				const h = Math.floor(time / 3600);
				const m = Math.floor(time % 3600 / 60);
				const s = Math.floor(time % 3600 % 60);

				return `${h}:${m < 10 ? "0" : ""}${m}:${s < 10 ? "0" : ""}${s}`;
			},
			resultClass: function() {
				return this.player && this.player.finish ? `zd-player__result--${this.pos || "topleft"}` : "";
			},
            specialClass: function() {
				if (this.type !== "elimination") return ""; // only applies to elimination
                // if you're a player, and there's some checkpoint for which:
                return this.player && this.checkpoints.some((checkpoint, index) => {
                    // you have not completed it, and
                    if (this.player.checkpoints && this.player.checkpoints[checkpoint]) {
                        return false; 
                    }

                    // there are enough other players who have completed it
                    const count = Object.keys(this.players).filter(p => this.players[p].checkpoints && this.players[p].checkpoints[checkpoint]).length;
                    if (count > this.checkpoints.length - index) {
                        return true;
                    }

                    return false;
				}) ? "zd-player--eliminated" : // then you're eliminated
                // if you're a player, and there's some checkpoint for which:
				this.player && this.checkpoints.some((checkpoint, index) => {
                    // you have not completed it, and
                    if (this.player.checkpoints && this.player.checkpoints[checkpoint]) {
                        return false; 
                    }

                    // there are almost enough other players who have completed it
                    const count = Object.keys(this.players).filter(p => this.players[p].checkpoints && this.players[p].checkpoints[checkpoint]).length;
                    if (count > this.checkpoints.length - index -1 ) {
                        return true;
                    }

                    return false;
				}) ? "zd-player--warning" : ""; // then you're close to being eliminated
            }
		}
	});
})();
