(function () {
    "use strict";
    
    Vue.component("zd-checkpoint", {
        template: `<div class="zd-checkpoint" style="text-align: center;">
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
                let i = 0;
                let count;
                do {
                    count = Object.keys(this.players).filter(p => this.players[p].checkpoints && this.players[p].checkpoints[this.checkpoints[i]]).length;
                } while(count >= this.checkpoints.length - i + 1 && i++ < this.checkpoints.length);

                return i;
            },
            target: function() {
                return this.checkpoints.length - this.num + 1;
            },
            count: function() {
                return Object.keys(this.players).filter(p => this.players[p].checkpoints && this.players[p].checkpoints[this.checkpoints[this.num]]).length;
            },
            finished: function() {
                return !this.stopwatch.results ? [] : this.stopwatch.results
                    .filter(p => this.players[p].finish)
                    .sort((a, b) => this.players[a].finish - this.players[b].finish)
                    .map(p => {
                        const position = this.players[p].finish;

                        return `${position}${position === 1 ? "st" : position === 2 ? "nd" : position === 3 ? "rd" : "th"}: ${p}`
                    });
            }
        }
    });
})();

// TODO list 10-3rd place above