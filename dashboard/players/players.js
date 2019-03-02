(function () {
	"use strict";
    
    const app = new Vue({
        el: "#app",
        template: `<div class="zd-players">
            <select v-model="selected">
                <option v-for="name in playerNames" :value="name">{{ name }}</option>
            </select>
            <button @click="addPlayer">Add</button>
            <table v-if="player">
                <tr><th>Name</th><td><input v-model.lazy="player.name" @change="changePlayerName" /></td></tr>
                <tr><th>Twitter</th><td><input v-model.lazy="player.twitter" /></td></tr>
                <tr><th>Twitch</th><td><input v-model.lazy="player.twitch" /></td></tr>
                <tr><th>Filename</th><td><input v-model.lazy="player.filename" /></td></tr>
                <tr><th>TP Handicap (minutes)</th><td><input type="number" v-model.number.lazy="player.offset" /></td></tr>
            </table>
            <button v-if="player" @click="remove">Remove</button>
        </div>`,
        replicants: {
            players: {}
        },
        data: {
            selected: undefined
        },
        computed: {
            playerNames: function() {
                return this.players ? Object.keys(this.players) : [];
            },
            player: function() {
                return this.players && this.selected ? this.players[this.selected] : undefined;
            }
        },
        methods: {
            addPlayer: function() {
                const newPlayer = {
                    name: "New Player",
                    twitter: "",
                    twitch: "",
                    filename: "",
                    tpHandicap: 0,
                    checkpoints: {}
                };
                this.$set(this.players, "New Player", newPlayer);
                this.selected = "New Player";
            },
            remove: function() {
                if (window.confirm("sure?")) {
                    const toDelete = this.selected;
                    this.selected = undefined;
                    this.$delete(this.players, toDelete);
                }
            },
            changePlayerName: function() {
                if (this.players[this.player.name]) {
                    window.alert("Player already exists!");
                    this.player.name = this.selected;
                } else {
                    const toDelete = this.selected;
                    this.$set(this.players, this.player.name, this.player);
                    this.selected = this.player.name;
                    this.$delete(this.players, toDelete);
                }
            }
        }
	});
})();