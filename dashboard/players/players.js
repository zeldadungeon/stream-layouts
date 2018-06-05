(function () {
	"use strict";
    
    const app = new Vue({
        el: "#app",
        template: `<div class="zd-players">
            <select v-model="selected">
                <option v-for="(player, index) in players" :value="index">{{ player.name }}</option>
            </select>
            <button @click="addPlayer">Add</button>
            <table v-if="players[selected]">
                <tr><th>Player {{ selected + 1 }}</th><td><button @click="down">-</button> <button @click="up">+</button> <button @click="remove">Remove</button></td></tr>
                <tr><th>Name</th><td><input v-model.lazy="players[selected].name" /></td></tr>
                <tr><th>Twitter</th><td><input v-model.lazy="players[selected].twitter" /></td></tr>
                <tr><th>Twitch</th><td><input v-model.lazy="players[selected].twitch" /></td></tr>
                <tr><th>Filename</th><td><input v-model.lazy="players[selected].filename" /></td></tr>
                <tr><th>TP Handicap (minutes)</th><td><input type="number" v-model.number.lazy="players[selected].tpHandicap" /></td></tr>
            </table>
        </div>`,
        replicants: {
            players: []
        },
        data: {
            selected: 0
        },
        methods: {
            addPlayer: function() {
                const newPlayer = {
                    name: "",
                    twitter: "",
                    twitch: "",
                    filename: "",
                    tpHandicap: 0
                };
                this.players.push(newPlayer);
                this.selected = this.players.length - 1;
            },
            down: function() {
                if (this.selected > 0) {
                    this.players.splice(this.selected - 1, 0, this.players.splice(this.selected, 1)[0]);
                    this.selected--;
                }
            },
            up: function() {
                if (this.selected < this.players.length - 1) {
                    this.players.splice(this.selected + 1, 0, this.players.splice(this.selected, 1)[0]);
                    this.selected++;
                }
            },
            remove: function() {
                if (window.confirm("sure?")) this.players.splice(this.selected, 1);
            }
        }
	});
})();