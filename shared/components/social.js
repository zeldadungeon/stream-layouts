(function () {
	"use strict";

	Vue.component("zd-social", {
		template: `<div class="zd-social">
			<transition name="fade" mode="out-in">
				<div class="zd-social__card" :key="display.id">
					<div class="zd-social__logo-wrapper">
						<img :class="'zd-social__logo ' + (display.class || '')" :src="'../shared/images/' + display.image" :style="display.style || ''" />
					</div>
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
					image: "ZD_Icon.png",
					text: "ZeldaDungeon.net"
				}, {
					id: 1,
					image: "Glitch_Purple_RGB.svg",
					style: "width: 100px;",
					text: "ZeldaDungeon"
				}, {
					id: 2,
					image: "youtube_social_icon_red.png",
					style: "width: 100px;",
					text: "ZeldaDungeon"
				}, {
					id: 3,
					image: "Twitter_Logo_Blue.svg",
					text: "ZeldaDungeon"
				}, {
					id: 4,
					image: "flogo_RGB_HEX-72.svg",
					style: "width: 100px;",
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
					image: "ZDMerch_logo.png",
					text: "tinyurl.com/ZDMXmerch"
				}, {
					id: 7,
					image: "Game-to-Grow-Logo-Vertical.png",
					class: "zd-social__logo--game-to-grow",
					text: "tinyurl.com/ZDMXdonate"
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