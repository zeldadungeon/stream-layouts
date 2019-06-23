(function () {
    "use strict";

    Vue.use(VueMaterial.default);

    Vue.component("zd-levels-card", {
        template: `<md-card>
            <md-card-media-cover md-solid>
                <md-card-media><img :src="background" /></md-card-media>

                <md-card-area>
                    <zd-racer-card-header :racer="racer" :run="run"></zd-racer-card-header>
                
                    <md-card-content>
                        <md-field md-inline>
                            <label>Filename</label>
                            <md-input v-model="racer.filename"></md-input>
                        </md-field>
                    </md-card-content>
                </md-card-area>
            </md-card-media-cover>

            <md-card-expand>
                <md-card-actions md-alignment="space-between">
                    <div>
                        <md-card-expand-trigger>
                            <md-button class="md-icon-button"><md-icon>keyboard_arrow_down</md-icon></md-button>
                        </md-card-expand-trigger>
                    </div>
                    <div>
                        <md-button v-if="currentLevel.name != levels[0].name"
                                class="md-raised md-icon-button"
                                @click="undo"
                                :disabled="run.state !== 'running' || currentLevel.results.length !== 0 && currentLevel.results.indexOf(racer.name) === -1">
                            <md-icon>undo</md-icon>
                        </md-button>
                        <md-button
                                class="md-raised md-primary"
                                @click="split"
                                :disabled="run.state !== 'running' || currentLevel.results.indexOf(racer.name) !== -1">
                            Finish {{ currentLevel.name }}
                        </md-button>
                    </div>
                </md-card-actions>
                
                <md-card-expand-content>
                    <zd-individual-levels :run="run" :num="run.racers.findIndex(r => r.name === racer.name)" style="width: 100%;"></zd-individual-levels>
                </md-card-expand-content>
            </md-card-expand>
        </md-card>`,
        props: ["racer", "run"],
        data() {
            return {
            }
        },
        computed: {
            levels() {
                return this.run.levels;
            },
            currentLevel() {
                return this.levels.find(l => l.results.length < this.run.racers.length) || this.levels[this.levels.length - 1];
            },
            previousLevel() {
                return this.levels[this.levels.findIndex(l => l.name === this.currentLevel.name)];
            },
            background() {
                return `../../shared/images/Levels/${this.currentLevel.name}.png`;
            }
        },
        methods: {
            split() {
                this.currentLevel.results.push(this.racer.name);
            },
            undo() {
                let results = this.currentLevel.results;
                if (results.length === 0) {
                    results = this.levels[this.levels.findIndex(l => l.name === this.currentLevel.name) - 1].results;
                }
                results.splice(results.indexOf(this.racer.name), 1);
            }
        }
    });
})();