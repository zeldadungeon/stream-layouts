(function () {
	"use strict";

	Vue.component("zd-social2", {
		template: `<div class="zd-social2">
			<transition name="fade" mode="out-in">
				<div class="zd-social2__card" :key="display.id">
					<img class="zd-social2__logo" :src="'../shared/images/' + display.image" />
					<span class="zd-social2__text">{{ display.text }}</span>
				</div>
			</transition>
		</div>`,
		replicants: ["queue", "ticker"],
		data: function() {
			return {
				cards: [{
					image: "zd_logo.png",
					text: "ZeldaDungeon.net"
				}, {
					image: "Glitch_Purple_RGB.svg",
					text: "/ZeldaDungeon"
				}, {
					image: "youtube_social_icon_red.png",
					text: "/TheZeldaDungeon"
				}, {
					image: "Twitter_Logo_Blue.svg",
					text: "@ZeldaDungeon"
				}, {
					image: "flogo_RGB_HEX-72.svg",
					text: "ZeldaDungeon"
				}, {
					image: "Discord-Logo-Color.svg",
					text: "discord.io/zelda"
				}, {
					image: "Teespring.svg",
					text: "tinyurl.com/zdm-shirts"
				}, {
					image: "ExtraLife_white.png",
					text: "tinyurl.com/zdm-donate"
				}]
			}
		},
		computed: {
			display: function() {
				// TODO check queue
				const tick = Math.floor(this.ticker.tick / 2) % this.cards.length || 0;
				const display = this.cards[tick];
				display.id = tick;
				return display;
			}
		}
	});
})();
