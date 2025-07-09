(function () {
	"use strict";

	Vue.component("zd-counter", {
		template: `<div class="zd-counter md-label">
			{{ collected }}/{{ required }} <img :src="'/bundles/zelda/shared/images/Counters/' + counter.icon" style="height: 1em;" />
		</div>`,
		props: ["playerNum", "runName", "counter"],
		replicants: ["runs"],
		computed: {
			run() {
				return this.runs && this.runs.start && this.runs[this.runName || this.runs.start.current] || { racers: [] };
			},
			player() {
				return this.run.racers[this.playerNum] || {};
			},
			required() {
				return this.player && this.player["required-" + this.counter.name] || 0;
			},
			collected() {
				return this.player && this.player["collected-" + this.counter.name] || 0;
			}
		}
	});

	Vue.component("zd-counters", {
		template: `<div :id="'zd-counters-' + playerNum" class="zd-counters" style="display: flex; justify-content: space-between;">
			<zd-counter v-for="counter in counters" :key="counter.name" :run-name="runName" :player-num="playerNum" :counter="counter"></zd-counter>
		</div>`,
		props: ["runName", "playerNum"],
		data: function() {
			return {
				counters: [
					// TODO get this data from the run
					/*{
						name: "Deaths",
						icon: "rip.png"
					},
					{
						name: "Maiamais",
						icon: "maiamai.png"
					},*/
					{
						name: "Secret Seashells",
						icon: "Seashell.png"
					},
					{
						name: "Figures",
						icon: "LA_Figure.png"
					},
					{
						name: "Chamber Dungeons",
						icon: "Chamber.png"
					},
				]
			}
		}
	});
})();
