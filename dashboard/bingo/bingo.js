(function () {
    "use strict";

    const app = new Vue({
        el: "#app",
        template: `<div class="zd-bingo">
            <div class="mdl-grid">
                <div v-if="bingo.teams" v-for="m in bingo.teams.length" class="mdl-cell mdl-cell--4-col"><h3>Team {{ m }}</h3>
                    <div v-if="bingo.teams[m - 1]" v-for="n in bingo.teams[m - 1].length">
                        <button
                        v-if="!bingo.teams[m - 1][n - 1].requires || bingo.raised >= bingo.teams[m - 1][n - 1].requires"
                        style="width: 100%"
                        class="mdl-button mdl-button--raised"
                        :class="{ 'zd-completed': bingo.teams[m - 1][n - 1].completed }"
                        @click="toggle(m - 1, n - 1);">{{ bingo.teams[m - 1][n - 1].name }}</button>
                    </div>
                </div>
            </div>
            <button class="mdl-button mdl-button--raised" onclick="nodecg.sendMessage('bingo:shuffle');">Shuffle</button>
            <label>(TODO debug) <input type="number" v-model.number.lazy="bingo.raised" style="width: 6em"></label>
            <div>{{ bingo }}</div>
        </div>`,
        replicants: ["bingo"],
        methods: {
            toggle(team, task) {
                this.$set(this.bingo.teams[team][task], "completed", !this.bingo.teams[team][task].completed);
            }
        }
    });
})();