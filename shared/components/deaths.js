(function () {
	"use strict";

	Vue.component("zd-deaths", {
		template: `<div>
			{{ player.deaths || 0 }} <img src="/bundles/zelda/shared/images/rip.png" style="height: 1.5em;" />
		</div>`,
		props: ["num", "runName"],
		replicants: ["runs"],
		computed: {
			run() {
				return this.runs && this.runs.start && this.runs[this.runName || this.runs.start.current] || { racers: [] };
			},
			player() {
				return this.run.racers[this.num] || {};
			}
		}
	});
})();
