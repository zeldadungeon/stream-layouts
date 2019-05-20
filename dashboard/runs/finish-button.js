(function () {
    "use strict";

    Vue.use(VueMaterial.default);

    Vue.component("zd-finish-button", {
        template: `<md-button class="md-accent md-raised" :disabled="disabled" @click="finished ? editFinish() : finish()">
            <zd-time-display v-if="finished" :time="racer.finish" />
            <span v-else>Finish</span>
            <md-dialog :md-active.sync="showFinishDialog">
                <md-dialog-title>Finish Time for {{ racer.name }}</md-dialog-title>
                <md-dialog-content>
                    <md-field class="md-has-value"><zd-time-input v-model="edit.finish" /></md-field>
                </md-dialog-content>
                <md-dialog-actions>
                    <md-button class="md-accent" @click="reset">Reset</md-button>
                    <md-button class="md-primary" @click="showFinishDialog = false">Close</md-button>
                    <md-button class="md-primary" @click="saveFinishChanges">Save</md-button>
                </md-dialog-actions>
            </md-dialog>
        </md-button>`,
        props: ["racer", "disabled"],
        replicants: ["stopwatch"],
        data() {
            return {
                showFinishDialog: false,
                edit: {
                    finish: null,
                }
            }
        },
        computed: {
            finished() {
                return this.racer.finish != undefined;
            }
        },
        methods: {
            finish() {
                this.$set(this.racer, "finish", this.stopwatch.time);
                this.$emit("finish");
            },
            editFinish() {
                this.edit.finish = this.racer.finish;
                this.showFinishDialog = true;
            },
            reset() {
                this.racer.finish = null;
                this.showFinishDialog = false;
                this.$emit("reset");
            },
            saveFinishChanges() {
                this.racer.finish = this.edit.finish;
                this.showFinishDialog = false;
            }
        }
    });
})();