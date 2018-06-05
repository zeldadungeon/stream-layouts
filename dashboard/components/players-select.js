(function () {
	"use strict";

	Vue.component("zd-player-select", {
        template: `<tr>
            <th>Player {{ num + 1 }}</th>
            <td>
                <select v-model="players[num]">
                    <option v-for="player in playerlist" :value="player">{{ player.name }}</option>
                </select>
            </td>
            <td><button @click="lap">Lap</button></td>
            <td>{{ result }}</td>
        </tr>`,
        props: ["num"],
        replicants: ["players", "stopwatch"],
		data: function() {
			return {
                selected: "",
                playerlist: [
                    { name: "Mases", twitch: "ZeldaDungeon" },
                    { name: "Locke", twitter: "LockeExile", twitch: "LockeExile" },
                    { name: "Bomby" }
                ]
			};
        },
        computed: {
            result: function() {
				const time = this.stopwatch.results && this.stopwatch.results[this.num] ? this.stopwatch.results[this.num] : 0;
				const h = Math.floor(time / 3600);
				const m = Math.floor(time % 3600 / 60);
				const s = Math.floor(time % 3600 % 60);

				return `${h}:${m < 10 ? "0" : ""}${m}:${s < 10 ? "0" : ""}${s}`;
            }
        },
        methods: {
            lap: function() {
                nodecg.sendMessage("timer:lap", this.num);
            }
        }
	});
})();
