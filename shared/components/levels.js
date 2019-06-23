(function () {
	"use strict";

	Vue.component("zd-individual-levels", {
		template: `<div class="zd-individual-levels">
			<div v-for="level in levels" class="zd-individual-levels__level">
				<div class="zd-individual-levels__levelname">{{ level.name }}<sup> x{{ level.multiplier || 1 }}</sup></div>
				<div class="zd-individual-levels__result">{{ myResult(level) }}</div>
			</div>
			<div class="zd-individual-levels__level">
				<div class="zd-individual-levels__levelname">Total<sup> {{ myPosition }}</sup></div>
				<div class="zd-individual-levels__result">{{ myTotal }}</div>
			</div>
		</div>`,
		props: ["run", "num"],
		computed: {
			racer() {
				return this.run.racers[this.num];
			},
			levels() {
				return this.run.levels;
			},
			myTotal() {
				return this.racer ? this.total(this.racer.name) : 0;
			},
			myPosition() {
				const myTotal = this.myTotal;
				const pos = this.run.racers.reduce((acc, cur) => acc + +(this.total(cur.name) > myTotal), 0) + 1;

				return `${pos}${{1:"st",2:"nd",3:"rd"}[pos]||"th"}`;
			}
		},
		methods: {
			myResult(level) {
				return this.result(level, this.racer.name);
			},
			result(level, racerName) {
				const place = level.results.findIndex(r => r === racerName);

				return place === -1 ? 0 : (this.run.racers.length - place - 1) * (level.multiplier || 1);
			},
			total(racerName) {
				return this.levels.map(l => this.result(l, racerName)).reduce((acc, cur) => acc + cur, 0);
			}
		}
	});
})();
