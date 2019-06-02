(function () {
    "use strict";

    Vue.use(VueMaterial.default);

    Vue.component("zd-bingo-card", {
        template: `<md-card>
            <zd-racer-card-header :racer="racer" :run="run"></zd-racer-card-header>
        
            <md-card-content class="md-layout">
                <md-button v-for="(task, index) in tasks.filter(t => !t.done)" class="md-raised md-primary md-layout-item md-size-100" :key="'todo'+index" :disabled="run.state != 'running'" @click="toggle(task)">{{ task.name }}</md-button>
                <md-button v-for="(task, index) in required.filter(t => !t.done[team])" class="md-raised md-primary md-layout-item md-size-100" :key="'todor'+index" :disabled="run.state != 'running'" @click="toggleRequired(task)">{{ task.name }}</md-button>
                <md-button v-for="(task, index) in bonus.filter(t => !t.done[team])" class="md-raised md-primary md-layout-item md-size-100" :key="'todob'+index" :disabled="run.state != 'running'" @click="toggleBonus(task)">{{ task.name }}</md-button>
            </md-card-content>

            <md-card-expand>
                <md-card-actions md-alignment="space-between">
                    <div>
                        <md-card-expand-trigger>
                            <md-button class="md-icon-button"><md-icon>keyboard_arrow_down</md-icon></md-button>
                        </md-card-expand-trigger>
                    </div>
                    <div>
                        <zd-finish-button :racer="racer" :disabled="!canFinish" @finish="finish"></zd-finish-button>
                    </div>
                </md-card-actions>

                <md-card-expand-content>
                    <md-card-content class="md-layout">
                        <md-button v-for="(task, index) in tasks.filter(t => t.done)" class="md-raised md-layout-item md-size-100" :key="'done'+index" @click="toggle2(task)">{{ task.name }}</md-button>
                        <md-button v-for="(task, index) in required.filter(t => t.done[team])" class="md-raised md-layout-item md-size-100" :key="'doner'+index" @click="toggleRequired(task)">{{ task.name }}</md-button>
                        <md-button v-for="(task, index) in bonus.filter(t => t.done[team])" class="md-raised md-layout-item md-size-100" :key="'doneb'+index" @click="toggleBonus(task)">{{ task.name }}</md-button>
                    </md-card-content>
                </md-card-expand-content>
            </md-card-expand>
        </md-card>`,
        props: ["racer", "run", "team"],
        replicants: ["players", "stopwatch", "bingo"],
        data() {
            return {
            }
        },
        computed: {
            tasks() {
                return this.bingo.teams && this.bingo.teams[this.team] || [];
            },
            required() {
                return (this.bingo.required && this.bingo.required.filter(r => r.name !== "Ganon")) || [];
            },
            bonus() {
                return (this.bingo.bonus && this.bingo.bonus.filter(b => this.bingo.raised >= b.requires)) || [];
            },
            canFinish() {
                return this.tasks.every(t => t.done) && this.required.every(r => r.done[this.team]) && this.bonus.every(b => b.done[this.team]);
            }
        },
        methods: {
            toggle(task) {
                this.$set(task, "done", !task.done);
            },
            toggleRequired(task) {
                this.$set(task.done, this.team, !task.done[this.team]);
            },
            toggleBonus(task) {
                this.$set(task.done, this.team, !task.done[this.team]);
            },
            finish() {
                if (this.run.state === "running" && this.run.racers.every(r => r.finish)) {
                    this.$emit("finish");
                }
            }
        }
    });
})();