(function () {
	"use strict";

	Vue.component("zd-bingo-card", {
		template: `<div class="zd-bingo-card" :class="cardClass">
			<div v-for="task in team" class="zd-bingo-card__task" :class="getCompletionClass(task)">
				<span class="zd-bingo-card__taskname">{{ task.name }}</span>
			</div>
		</div>`,
		props: ["num", "orientation"],
		replicants: ["bingo"],
		computed: {
			cardClass: function() {
				return `zd-bingo-card--${this.orientation} zd-bingo-card--team${this.num}`;
			},
			team: function() {
				return this.bingo && this.bingo.teams && this.bingo.teams[this.num - 1] || [];
			}
		},
		methods: {
			getCompletionClass(task) {
				return task.done ? `zd-bingo-card__done${this.num}` : "";
			}
		}
	});

	Vue.component("zd-bingo-shared", {
		template: `<div class="zd-bingo-card" :class="'zd-bingo-card--' + (orientation || 'horizontal')">
			<div v-for="task in tasks" class="zd-bingo-card__task">
				<div class="zd-bingo-card__progress"></div>
				<div class="zd-bingo-card__teams">
					<div v-for="n in 3" :class="getCompletionClass(task, n)"></div>
				</div>
				<span class="zd-bingo-card__taskname">{{ bingo.raised >= task.requires ? task.name : "$" + bingo.raised.toFixed(2) + "/" + task.requires }}</span>
			</div>
		</div>`,
		props: ["type", "orientation"],
		replicants: ["bingo"],
		computed: {
			tasks: function() {
				return this.bingo && this.bingo[this.type] || [];
			}
		},
		methods: {
			getCompletionClass(task, team) {
				return `zd-bingo-card__team${task.done[team - 1] ? ` zd-bingo-card__done${team}` : ""}`;
			}
		}
	});
})();
