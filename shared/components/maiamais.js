(function () {
	"use strict";

	Vue.component("zd-maiamais", {
		template: `<div class="zd-maiamais md-label">
			{{ player.collected || 0 }} <md-button
				v-if="showControls"
				class="md-icon-button"
			  	@click="addCollected">
				<md-icon>add</md-icon>
			</md-button> / {{ player.required || 0 }} <md-button
				v-if="showControls"
				class="md-icon-button"
				@click="addRequired">
				<md-icon>add</md-icon>
			</md-button> <img src="/bundles/zelda/shared/images/maiamai.png" style="height: 1.5em;" />
		</div>`,
		props: ["num", "runName", "racer", "showControls"],
		replicants: ["runs"],
		computed: {
			run() {
				return this.runs && this.runs.start && this.runs[this.runName || this.runs.start.current] || { racers: [] };
			},
			player() {
				return this.racer || this.run.racers[this.num] || {};
			}
		},
		methods: {
			addCollected() {
				if (this.player.collected == undefined) {
					this.$set(this.player, "collected", 0);
				}
				++this.player.collected;
			},
			addRequired() {
				if (this.player.required == undefined) {
					this.$set(this.player, "required", 0);
				}
				++this.player.required;
			}
		}
	});
})();
