(function () {
	'use strict';

	Vue.component('zd-social', {
		template: `<div class="zd-social">
			<transition name="fade" mode="out-in">
				<div v-if="display" class="zd-social__card" :key="display.id">
					<div v-if="display.logo" class="zd-social__logo-wrapper">
						<img :class="'zd-social__logo ' + (display.class || '')" :src="'../shared/images/' + display.logo" :style="display.style || ''" />
					</div>
					<div v-if="display.qrcode" class="zd-social__qrcode-wrapper">
						<img class="zd-social__qrcode" :src="'../shared/images/' + display.qrcode" />
					</div>
					<div class="zd-social__text" v-html="display.text"></div>
				</div>
			</transition>
		</div>`,
		replicants: ['ticker', 'social_event'],
		data: function() {
			return {
				event: undefined,
				cards: [{
					id: 0,
					logo: 'ZD_Icon.png',
					text: 'ZeldaDungeon.net'
				}, {
					id: 1,
					logo: 'STREAM-Logo_RGB_primary-full-color.png',
					style: 'max-width: 100%;',
					text: 'nokidhungry.org'
				}, {
					id: 2,
					qrcode: 'qr_donate_25.png',
					style: 'height: 100%;',
					text: 'Donate'
				}]
			}
		},
		computed: {
			display: function() {
				const interval = Math.floor(this.ticker.tick / 2) // rotate every other tick
				const index = Math.min(this.cards.length - 1, interval % (this.cards.length * 2)) // linger on the last card for a while
				return this.cards[index];
			}
		}
	});
})();