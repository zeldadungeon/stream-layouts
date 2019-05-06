(function () {
    "use strict";

    Vue.use(VueMaterial.default);

    Vue.component("zd-incentive-card", {
        template: `<md-card>
            <md-card-header>
                <md-card-header-text>
                    <div class="md-title">{{ incentive.name }}</div>
                </md-card-header-text>

                <md-menu md-direction="bottom-end">
                    <md-button class="md-icon-button" md-menu-trigger>
                        <md-icon>more_vert</md-icon>
                    </md-button>
        
                    <md-menu-content>
                        <md-menu-item @click="editIncentive">
                            <span>Edit</span>
                            <md-icon>edit</md-icon>
                        </md-menu-item>
            
                        <md-menu-item @click="deleteIncentive">
                            <span>Delete</span>
                            <md-icon>delete</md-icon>
                        </md-menu-item>
                    </md-menu-content>
                </md-menu>
            </md-card-header>
    
            <md-card-content>
                <md-list>
                    <md-list-item v-for="option in options" :key="option">
                        <div class="md-list-item-text md-primary">{{ option }}</div>
                        <div class="md-list-item-text" style="text-align: right;"><span>{{ formatMoney(incentive.options[option]) }}</span></div>
                        <md-button class="md-icon-button" @click="editOption(option)"><md-icon>add</md-icon></md-button>
                    </md-list-item>
                </md-list>
            </md-card-content>
    
            <md-card-actions>
                <md-button class="md-primary md-raised" @click="newOption">Add Option</md-button>
            </md-card-actions>

            <md-dialog :md-active.sync="showEditIncentiveDialog">
                <md-dialog-title>Editing Donation Incentive</md-dialog-title>
                <md-dialog-content>
                    <md-field>
                        <label>Name</label>
                        <md-input v-model="edit.incentive.name" required></md-input>
                    </md-field>
                </md-dialog-content>
                <md-dialog-actions>
                    <md-button class="md-primary" @click="showEditIncentiveDialog = false">Close</md-button>
                    <md-button class="md-primary" @click="saveIncentiveChanges" :disabled="!edit.incentive.name">Save</md-button>
                </md-dialog-actions>
            </md-dialog>

            <md-dialog-confirm
                :md-active.sync="showDeleteIncentiveDialog"
                md-title="Delete this incentive?"
                md-content="Are you sure? The donation tally for this incentive will be lost. Don't delete an incentive just because the run is finished."
                md-confirm-text="Delete"
                md-cancel-text="Cancel"
                @md-confirm="doDeleteIncentive" />

            <md-dialog :md-active.sync="showAddOptionDialog">
                <md-dialog-title>New Incentive Option</md-dialog-title>
                <md-dialog-content>
                    <md-field :class="{ 'md-invalid': !newOptionNameValid }">
                        <label>Name</label>
                        <md-input v-model="edit.option.name" required></md-input>
                        <span class="md-error">This option already exists.</span>
                    </md-field>
                    <md-field :class="{ 'md-invalid': !newOptionValueValid }">
                        <label>Value</label>
                        <md-input v-model="edit.option.value" required></md-input>
                        <span class="md-error">Must be a number.</span>
                    </md-field>
                </md-dialog-content>
                <md-dialog-actions>
                    <md-button class="md-primary" @click="showAddOptionDialog = false">Close</md-button>
                    <md-button class="md-primary" @click="addOption" :disabled="!formValid">Save</md-button>
                </md-dialog-actions>
            </md-dialog>

            <md-dialog :md-active.sync="showEditOptionDialog">
                <md-dialog-title>Editing {{ edit.option.name }}</md-dialog-title>
                <md-dialog-content>
                    <md-radio v-model="edit.option.action" value="add">Add this value to the total</md-radio><br />
                    <md-radio v-model="edit.option.action" value="subtract">Subtract this value from the total</md-radio><br />
                    <md-radio v-model="edit.option.action" value="set">Set the total to this value</md-radio>
                    <md-field :class="{ 'md-invalid': !newOptionValueValid }">
                        <label>Value</label>
                        <md-input v-model="edit.option.value" required></md-input>
                        <span class="md-error">Must be a number.</span>
                    </md-field>
                </md-dialog-content>
                <md-dialog-actions>
                    <md-button class="md-primary" @click="showEditOptionDialog = false">Close</md-button>
                    <md-button class="md-primary" @click="saveOptionChanges" :disabled="!newOptionValueValid">Save</md-button>
                </md-dialog-actions>
            </md-dialog>
        </md-card>`,
        props: ["incentive"],
        data() {
            return {
                showEditIncentiveDialog: false,
                showDeleteIncentiveDialog: false,
                showAddOptionDialog: false,
                showEditOptionDialog: false,
                edit: {
                    incentive: {},
                    option: {}
                }
            }
        },
        computed: {
            options() {
                return Object.keys(this.incentive.options).sort((a, b) => this.incentive.options[b] - this.incentive.options[a]);
            },
            newOptionNameValid() {
                return !this.incentive.options[this.edit.option.name];
            },
            newOptionValueValid() {
                const val = Number(this.edit.option.value);
                return !isNaN(val) && val >= 0;
            },
            formValid() {
                return this.newOptionNameValid && this.edit.option.name && this.newOptionValueValid && this.edit.option.value;
            }
        },
        methods: {
            formatMoney(val) {
                return `$${val.toFixed(2)}`;
            },
            editIncentive() {
                this.edit.incentive = {
                    name: this.incentive.name
                };
                this.showEditIncentiveDialog = true;
            },
            saveIncentiveChanges() {
                this.incentive.name = this.edit.incentive.name;
                this.showEditIncentiveDialog = false;
            },
            deleteIncentive() {
                this.showDeleteIncentiveDialog = true;
            },
            doDeleteIncentive() {
                this.$emit("delete");
            },
            newOption() {
                this.edit.option = {
                    name: "",
                    value: ""
                };
                this.showAddOptionDialog = true;
            },
            addOption() {
                this.$set(this.incentive.options, this.edit.option.name, Number(this.edit.option.value));
                this.showAddOptionDialog = false;
            },
            editOption(option) {
                this.edit.option = {
                    name: option,
                    action: "add",
                    value: ""
                };
                this.showEditOptionDialog = true;
            },
            saveOptionChanges() {
                const name = this.edit.option.name;
                const action = this.edit.option.action;
                const valueInput = Number(this.edit.option.value);
                const valueFinal = action === "add" ? this.incentive.options[name] + valueInput : action === "subtract" ? this.incentive.options[name] - valueInput : valueInput;
                this.incentive.options[name] = valueFinal;
                this.showEditOptionDialog = false;
            }
        }
    });
})();