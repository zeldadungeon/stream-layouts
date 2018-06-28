(function () {
	"use strict";

	Vue.component("zd-bingo-card", {
		template: `<div class="zd-bingo-card">
			<div v-for="task in team" class="zd-bingo-card__task" :class="{ 'zd-bingo-card__task--done': task.completed }"><span>{{ task.name }}</span></div>
		</div>`,
		props: ["num"],
		replicants: ["bingo"],
		computed: {
			team: function() {
				return this.bingo && this.bingo.teams && this.bingo.teams[this.num] || [];
			}
		}
	});
})();
