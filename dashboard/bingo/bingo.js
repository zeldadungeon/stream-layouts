(function () {
    "use strict";

    const app = new Vue({
        el: "#app",
        template: `<div class="zd-bingo">
            <div v-if="bingo.teams && bingo.required && bingo.bonus" class="mdl-grid">
                <div v-for="m in bingo.teams.length" v-if="bingo.teams[m - 1]" class="mdl-cell mdl-cell--4-col">
                    <h3>Team {{ m }}</h3>
                    <div v-for="n in bingo.teams[m - 1].length">
                        <button
                        class="mdl-button mdl-button--raised zd-bingo__button"
                        :class="{ 'zd-bingo__button--completed': bingo.teams[m - 1][n - 1].done }"
                        @click="toggle(m - 1, n - 1);">{{ bingo.teams[m - 1][n - 1].name }}</button>
                    </div>
                    <div v-for="n in bingo.required.length">
                        <button
                        class="mdl-button mdl-button--raised zd-bingo__button"
                        :class="{ 'zd-bingo__button--completed': bingo.required[n - 1].done[m - 1] }"
                        @click="toggleRequired(m - 1, n - 1);">{{ bingo.required[n - 1].name }}</button>
                    </div>
                    <div v-for="n in bingo.bonus.length">
                        <button
                        v-if="bingo.raised >= bingo.bonus[n - 1].requires"
                        class="mdl-button mdl-button--raised zd-bingo__button"
                        :class="{ 'zd-bingo__button--completed': bingo.bonus[n - 1].done[m - 1] }"
                        @click="toggleBonus(m - 1, n - 1);">{{ bingo.bonus[n - 1].name }}</button>
                    </div>
                </div>
            </div>
            <button class="mdl-button mdl-button--raised" onclick="if (window.confirm('This will reset all progress including donations!')) nodecg.sendMessage('bingo:shuffle');">Shuffle</button>
        </div>`,
        replicants: ["bingo"],
        methods: {
            toggle(team, task) {
                this.$set(this.bingo.teams[team][task], "done", !this.bingo.teams[team][task].done);
            },
            toggleRequired(team, task) {
                this.$set(this.bingo.required[task].done, team, !this.bingo.required[task].done[team]);
            },
            toggleBonus(team, task) {
                this.$set(this.bingo.bonus[task].done, team, !this.bingo.bonus[task].done[team]);
            }
        }
    });
})();