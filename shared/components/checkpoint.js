(function () {
    "use strict";
    
    Vue.component("zd-checkpoint", {
        template: `<div class="zd-checkpoint" style="text-align: center; padding: 10px 15px; box-sizing: border-box;">
            <div style="display: inline-block; text-align: left;">
                <div v-if="checkpoint < checkpoints.length">Checkpoint {{ checkpoint + 1 }}: {{ count }} / {{ target }}<br />{{ checkpoints[checkpoint] }}<br /></div>
                <div style="display: flex; flex-wrap: wrap;">
                    <div v-for="finish in finished" style="flex: 1 1 50%; white-space: nowrap;">{{ finish }}</div>
                </div>
            </div>
        </div>`,
        props: ["runName"],
        replicants: ["runs"],
        data: function() {
            return {
                checkpoints: [
                    "Deepwood Shrine",
                    "Gust Jar",
                    "Earth Element",
                    "Cave of Flames",
                    "Cane of Pacci",
                    "Fire Element",
                    "Pegasus Boots",
                    "Fortress of Winds"
                ]
            };
        },
        computed: {
			run() {
				return this.runs && this.runs.start && this.runs[this.runName || this.runs.start.current] || { racers: [] };
            },
            checkpoint() {
                return this.run.racers.filter(r => r.state === "eliminated").length;
            },
            target() {
                return this.checkpoints.length - this.checkpoint + 1;
            },
            count() {
                return this.run.racers.filter(r => r.checkpoint > this.checkpoint).length;
            },
            finished() {
                return this.run.racers
                    .filter(r => r.state === "eliminated")
                    .sort((a, b) => a.position - b.position)
                    .map(r => `${r.position}${{1:"st",2:"nd",3:"rd"}[r.position]||"th"}: ${r.name}`);
            }
        }
    });
})();