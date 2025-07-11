(function () {
    "use strict";

    Vue.use(VueMaterial.default);

    Vue.component("zd-race-card", {
        template: `<md-card>
            <zd-racer-card-header :racer="racer" :run="run"></zd-racer-card-header>
    
            <md-card-content>
                <md-field md-inline>
                    <label>Filename</label>
                    <md-input v-model="racer.filename"></md-input>
                </md-field>
                <zd-counters v-if="run.name === 'Link\\'s Awakening (2019)'" :racer="racer" />
                <!--zd-masks v-if="run.name === 'Majora\\'s Mask'" :num="run.racers.findIndex(r => r.name === racer.name)" /-->
            </md-card-content>

            <md-card-actions><zd-finish-button :racer="racer" :disabled="run.state !== 'running'" @finish="finish"></zd-finish-button></md-card-actions>
        </md-card>`,
        props: ["racer", "run"],
        replicants: ["stopwatch"],
        methods: {
            finish() {
                if (this.run.state === "running" && this.run.racers.every(r => r.finish)) {
                    this.$emit("finish");
                }
            }
        }
    });
})();