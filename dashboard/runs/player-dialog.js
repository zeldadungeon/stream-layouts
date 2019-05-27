(function () {
    "use strict";

    Vue.use(VueMaterial.default);

    Vue.component("zd-player-dialog", {
        template: `<md-dialog :md-active="show" @update:mdActive="updateShow($event)">
            <md-dialog-title>Select Player</md-dialog-title>
            <md-dialog-content>
                <md-field>
                    <label>Player</label>
                    <md-select v-model="edit.racer" required>
                        <md-option v-for="player in playerOptions" :key="player" :value="player">{{ player }}</md-option>
                    </md-select>
                </md-field>
                <div v-if="edit.racer === 'New player'">
                    <md-field :class="{ 'md-invalid': !newPlayerNameValid }">
                        <label>Name</label>
                        <md-input v-model="edit.name" required></md-input>
                        <span class="md-error">This player already exists.</span>
                    </md-field>
                    <md-field>
                        <label>Twitter</label>
                        <md-input v-model="edit.twitter"></md-input>
                    </md-field>
                    <md-field>
                        <label>Twitch</label>
                        <md-input v-model="edit.twitch"></md-input>
                    </md-field>
                </div>
            </md-dialog-content>
            <md-dialog-actions>
                <md-button class="md-primary" @click="$emit('update:show', false);">Close</md-button>
                <md-button class="md-primary" @click="addPlayer" :disabled="!formValid">Save</md-button>
            </md-dialog-actions>
        </md-dialog>`,
        props: ["show", "taken"],
        replicants: ["players"],
        data() {
            return {
                edit: {}
            }
        },
        computed: {
            playerOptions() {
                const options = Object.keys(this.players).filter(p => !this.taken.includes(p));
                options.push("New player");

                return options;
            },
            newPlayerNameValid() {
                return !this.players[this.edit.name];
            },
            formValid() {
                return this.edit.racer !== "New player" || this.edit.name && this.newPlayerNameValid;
            }
        },
        methods: {
            addPlayer() {
                if (this.edit.racer === "New player") {
                    this.$set(this.players, this.edit.name, {
                        name: this.edit.name,
                        twitter: this.edit.twitter,
                        twitch: this.edit.twitch
                    });
                    this.$emit("save", this.edit.name);
                } else {
                    this.$emit("save", this.edit.racer);
                }
                this.$emit("update:show", false);
            },
            updateShow(show) {
                this.$emit("update:show", show);
            }
        },
        watch: {
            show(newValue, oldValue) {
                if (newValue) {
                    this.edit = {
                        racer: this.playerOptions[0],
                        name: "",
                        twitter: "",
                        twitch: ""
                    };
                }
            }
        }
    });
})();