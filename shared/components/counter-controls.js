(function () {
	"use strict";

	Vue.component("zd-counter", {
		template: `<div class="zd-counter md-label">
			<md-field>
				<md-input v-model="racer['collected-' + counter.name]" type="number"></md-input>
			</md-field> / <md-field>
				<md-input v-model="racer['required-' + counter.name]" type="number"></md-input>
			</md-field> <img :src="'/bundles/zelda/shared/images/Counters/' + counter.icon" style="height: 48px;" />
		</div>`,
		props: ["racer", "counter"],
		mounted() {
			if (this.racer["required-" + this.counter.name] == undefined) {
				this.$set(this.racer, "required-" + this.counter.name, 0);
			}
			if (this.racer["collected-" + this.counter.name] == undefined) {
				this.$set(this.racer, "collected-" + this.counter.name, 0);
			}
		}
	});

	Vue.component("zd-counters", {
		template: `<div class="zd-counters" style="display: flex; flex-direction: column;">
			<zd-counter v-for="counter in counters" :key="counter.name" :racer="racer" :counter="counter"></zd-counter>
		</div>`,
		props: ["racer"],
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
