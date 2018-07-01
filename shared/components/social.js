(function () {
	"use strict";

	Vue.component("zd-social", {
		template: `<div class="zd-social">
			<transition name="fade" mode="out-in">
				<div class="zd-social__card" :key="display.id">
					<img class="zd-social__logo" :src="'../shared/images/' + display.image" />
					<div class="zd-social__text" v-html="display.text"></div>
				</div>
			</transition>
		</div>`,
		replicants: ["ticker", "social_event"],
		data: function() {
			return {
				event: undefined,
				cards: [{
					id: 0,
					image: "feather.svg",
					text: "ZeldaDungeon.net"
				}, {
					id: 1,
					image: "Glitch_Purple_RGB.svg",
					text: "/ZeldaDungeon"
				}, {
					id: 2,
					image: "youtube_social_icon_red.png",
					text: "/TheZeldaDungeon"
				}, {
					id: 3,
					image: "Twitter_Logo_Blue.svg",
					text: "@ZeldaDungeon"
				}, {
					id: 4,
					image: "flogo_RGB_HEX-72.svg",
					text: "ZeldaDungeon"
				}, {
					id: 5,
					image: "Discord-Logo-Color.svg",
					text: "discord.io/zelda"
				}, {
					id: 6,
					image: "Teespring.svg",
					text: "tinyurl.com/zdm-shirts"
				}, {
					id: 7,
					image: "ExtraLife_white.png",
					text: "tinyurl.com/zdm-donate"
				}]
			}
		},
		computed: {
			display: function() {
				const event = this.social_event;
				if (event) {
					switch(event.type) {
						case "tweet":
							return {
								id: event.id,
								image: "LA_Weathervane.gif",
								text: `<strong>@${event.name}</strong><br>${event.text}`
							};
						case "donation":
							return {
								id: event.id,
								image: "rupee_anim.gif",
								text: `${event.name ? `<strong>${event.name}</strong>` : `Someone`} donated <strong>$${event.amount}</strong>!`
							};
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

				return this.cards[Math.floor(this.ticker.tick / 2) % this.cards.length || 0];
			}
		}
	});
})();