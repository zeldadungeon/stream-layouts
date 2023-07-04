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
		template: `<div class="zd-bingo-card zd-bingo-card--vertical">
			<div v-for="(task, index) in tasks" class="zd-bingo-card__task" v-if="index % 2 == {'even':0,'odd':1}[type]">
				<div class="zd-bingo-card__progress"></div>
				<div class="zd-bingo-card__teams">
					<div v-for="n in 4" :class="getCompletionClass(task, n)"></div>
				</div>
				<span class="zd-bingo-card__taskname">{{ bingo.raised >= task.requires ? task.name : "$" + bingo.raised.toFixed(2) + "/" + task.requires }}</span>
			</div>
		</div>`,
		props: ["type"],
		replicants: ["bingo"],
		computed: {
			tasks: function() {
				return this.bingo && this.bingo.bonus || [];
			}
		},
		methods: {
			getCompletionClass(task, team) {
				return `zd-bingo-card__team${task.done[team - 1] ? ` zd-bingo-card__done${team}` : ""}`;
			}
		}
	});

	Vue.component("zd-bingo-beasts", {
		template: `<div class="zd-bingo-beasts">
			<img class="zd-bingo-beasts__icon" v-for="beast in ['Wind Temple', 'Fire Temple', 'Water Temple', 'Lightning Temple', 'Spirit Temple', 'Hyrule Castle']" :key="beast" v-if="isDone(beast)" :src="'../shared/images/' + beast + '.png'" />
		</div>`,
		props: ["team"],
		replicants: ["bingo"],
		computed: {
			required() {
				return this.bingo && this.bingo.required || [];
			}
		},
		methods: {
			isDone(beast) {
				return this.required.some(r => r.name === beast && r.done[this.team]);
			}
		}
	});
})();
