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
					text: "ZeldaDungeon"
				}, {
					id: 2,
					image: "youtube_social_icon_red.png",
					text: "TheZeldaDungeon"
				}, {
					id: 3,
					image: "Twitter_Logo_Blue.svg",
					text: "ZeldaDungeon"
				}, {
					id: 4,
					image: "flogo_RGB_HEX-72.svg",
					text: "ZeldaDungeon"
				}, {
					id: 8,
					image: "instagram.png",
					text: "Zelda_Dungeon"
				}, {
					id: 5,
					image: "Discord-Logo-Color.svg",
					text: "discord.io/zelda"
				}, {
					id: 6,
					image: "Teespring.svg",
					text: "tinyurl.com/zdmshirts"
				}, {
					id: 7,
					image: "ExtraLife_icon.png",
					text: "tinyurl.com/zdmdonate2019"
				}]
			}
		},
		computed: {
			display: function() {
				return this.cards[Math.floor(this.ticker.tick / 2) % this.cards.length || 0];
			}
		}
	});
})();