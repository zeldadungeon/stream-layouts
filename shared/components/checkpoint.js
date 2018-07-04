(function () {
    "use strict";
    
    Vue.component("zd-checkpoint", {
        template: `<div class="zd-checkpoint" style="text-align: center; padding: 10px 15px; box-sizing: border-box;">
            <div style="display: inline-block; text-align: left;">
                <div v-if="num < checkpoints.length">Checkpoint {{ num + 1 }}: {{ count }} / {{ target }}<br />{{ checkpoints[num] }}<br /></div>
                <div style="display: flex; flex-wrap: wrap;">
                    <div v-for="finish in finished" style="flex: 1 1 50%; white-space: nowrap;">{{ finish }}</div>
                </div>
            </div>
        </div>`,
        replicants: ["players", "stopwatch"],
        data: function() {
            return {
                checkpoints: [
                    "Enter Deepwood Shrine",
                    "Get Gust Jar",
                    "Finish Deepwood Shrine",
                    "Enter Cave of Flames",
                    "Get Cane of Pacci",
                    "Finish Cave of Flames",
                    "Get Pegasus Boots",
                    "Enter Fortress of Winds"
                ]
            };
        },
        computed: {
            num: function() {
                const worstPlace = this.checkpoints.length + 3;
                let bestPlace = Object.keys(this.players).reduce((acc, cur) => Math.min(acc, this.players[cur].place || worstPlace), worstPlace);
                return this.checkpoints.length + 3 - bestPlace;
            },
            target: function() {
                return this.checkpoints.length - this.num + 1;
            },
            count: function() {
                return Object.keys(this.players).filter(p => this.players[p].checkpoints && this.players[p].checkpoints[this.checkpoints[this.num]]).length;
            },
            finished: function() {
                return !this.stopwatch.results ? [] : this.stopwatch.results
                    .filter(p => this.players[p].place)
                    .sort((a, b) => this.players[a].place - this.players[b].place)
                    .map(p => {
                        const position = this.players[p].place;

                        return `${position}${position === 1 ? "st" : position === 2 ? "nd" : position === 3 ? "rd" : "th"}: ${p}`
                    });
            }
        }
    });
})();