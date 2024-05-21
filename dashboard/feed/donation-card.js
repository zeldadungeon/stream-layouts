(function () {
    "use strict";

    Vue.use(VueMaterial.default);
    
    Vue.component("zd-donation-card", {
        template: `<md-card>
            <md-card-header>
                <md-card-header-text>
                    <div class="md-title">{{ donation.donor_name }}</div>
                    <div>\${{ donation.amount.value }}</div>
                </md-card-header-text>
            </md-card-header>

            <md-card-content>
                {{ donation.donor_comment }}
            </md-card-content>

            <md-card-actions md-alignment="space-between">
                <md-button class="md-raised md-accent" @click.prevent="dismiss">Dismiss</md-button>
                <md-button class="md-raised md-primary" @click="showIncentiveDialog = true">Incentive</md-button>
            </md-card-actions>

            <md-dialog :md-active.sync="showIncentiveDialog">
                <md-dialog-title>Apply full amount to incentive</md-dialog-title>
                <md-dialog-content>
                    <div>This will dismiss the donation, so read the message first.</div>
                    <md-field>
                        <label>Run</label>
                        <md-select v-model="run" required>
                            <md-option v-for="name in runNames" :key="name" :value="name">{{ name }}</md-option>
                        </md-select>
                    </md-field>
                    <md-field v-if="run">
                        <label>Incentive</label>
                        <md-select v-model="incentive" required>
                            <md-option v-for="(i, idx) in runs[run].incentives" :key="i.name" :value="idx">{{ i.name }}</md-option>
                        </md-select>
                    </md-field>
                    <md-field v-if="run">
                        <label>Option</label>
                        <md-select v-model="option" required>
                            <md-option v-for="o in ['New option'].concat(Object.keys(runs[run].incentives[incentive].options))" :key="o" :value="o">{{ o }}</md-option>
                        </md-select>
                    </md-field>
                    <md-field v-if="run && option === 'New option'">
                        <label>Name</label>
                        <md-input v-model="newOption" required></md-input>
                    </md-field>
                </md-dialog-content>
                <md-dialog-actions>
                    <md-button class="md-primary" @click="showIncentiveDialog = false">Close</md-button>
                    <md-button class="md-primary" @click="apply" :disabled="!canApply">Save</md-button>
                </md-dialog-actions>
            </md-dialog>
        </md-card>`,
        props: ["donation"],
        replicants: ["runs"],
        data() {
            return {
                showIncentiveDialog: false,
                run: "",
                incentive: 0,
                option: "New option",
                newOption: ""
            };
        },
        computed: {
            runNames() {
                const names = [];
                let name = this.runs.start && (this.runs.start.current || this.runs.start.next);
                while(name && this.runs[name]) {
                    if (this.runs[name].state !== "running" && this.runs[name].incentives.length > 0) {
                        names.push(name);
                    }
                    name = this.runs[name].next;
                }
                return names;
            },
            canApply() {
                return this.option !== "New option" || this.newOption !== "";
            }
        },
        methods: {
            dismiss() {
                this.$emit("dismiss", this.donation.createdDateUTC);
            },
            apply() {
                const name = this.option === "New option" ? this.newOption : this.option;
                const current = this.runs[this.run].incentives[this.incentive].options[name];
                console.log(name, current, this.donation.amount.value);
                if (current) {
                    this.runs[this.run].incentives[this.incentive].options[name] += this.donation.amount.value;
                } else {
                    this.$set(this.runs[this.run].incentives[this.incentive].options, name, this.donation.amount.value);
                }

                this.showIncentiveDialog = false;
                setTimeout(() => this.dismiss(), 0); // let vuecg commit the replicant first
            }
        }
    });
})();
