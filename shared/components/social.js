(function () {
	"use strict";

	const MOD = 6;

	Vue.component("zd-social-event", {
		template: `<li class="zd-social__event--wrapper"><div class="zd-social__event" :class="typeClass" v-html="html"></div></li>`,
		props: ["event"],
		computed: {
			html: function() {
				switch(this.event.type) {
					case "tweet":
						return `<strong>@${this.event.name}</strong><br>${this.event.text}`;
					case "donation":
						return `${this.event.name ? `<strong>${this.event.name}</strong>` : `Someone`} donated <strong>$${this.event.amount}</strong>!`;
					case "cheer":
						return `<strong>${this.event.name}</strong> cheered with <strong>${this.event.bits} bit${this.event.bits > 1 ? "s" : ""}</strong>!`;
					case "follow":
						return `<strong>${this.event.name}</strong> followed!`;
					case "sub":
						return `<strong>${this.event.name}</strong> subscribed!`;
				}
			},
			typeClass: function() {
				return `zd-social__event--${this.event.type}`;
			}
		}
	})

	Vue.component("zd-social", {
		template: `<div class="zd-social" :class="socialClass">
			<div class="zd-player"><div class="zd-spinner">
				<div class="zd-spinner__item" :class="chooseClass(0)">ZeldaDungeon.net</div>
				<div class="zd-spinner__item" :class="chooseClass(1)"><span class="zd-player__twitch">/ZeldaDungeon</span></div>
				<div class="zd-spinner__item" :class="chooseClass(2)"><span class="zd-player__youtube">/TheZeldaDungeon</span></div>
				<div class="zd-spinner__item" :class="chooseClass(3)"><span class="zd-player__twitter">@ZeldaDungeon</span></div>
				<div class="zd-spinner__item" :class="chooseClass(4)"><span class="zd-player__facebook">ZeldaDungeon</span></div>
				<div class="zd-spinner__item" :class="chooseClass(5)"><span class="zd-player__discord">discord.io/zelda</span></div>
			</div></div>
			<transition-group name="zd-social__queue" class="zd-social__queue" tag="ul">
				<zd-social-event v-for="event in queue" :key="event.id" :event="event"></zd-social-event>
			</transition-group>
		</div>`,
		props: ["pos"],
		replicants: ["queue", "ticker"],
		computed: {
			socialClass: function() {
				return `zd-social--${this.pos}`;
			}
		},
		methods: {
			chooseClass: function(index) {
				const show = this.ticker.tick % MOD == index;
				return {
					"zd-spinner__item--show": show,
					"zd-spinner__item--hide": !show
				};
			}
		}
	});
})();
