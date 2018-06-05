(function () {
    "use strict";
    
    Vue.component("zd-war-option", {
        template: `<tr class="zd-wars__option">
            <td><input v-model.lazy="option.label" /></td>
            <td><input type="number" v-model.number.lazy="option.amount" /></td>
            <td><button @click="$emit(option.newOption ? "add" : "remove")">{{ option.newOption ? "Add" : "Remove" }}</button></td>
        </tr>`,
        props: ["option"]
    });

    const app = new Vue({
        el: "#app",
        template: `<div class="zd-wars">
            <select v-model="selected">
                <option v-for="war in donations.wars" :value="war">{{ war.title }}</option>
            </select>
            <button @click="addWar">Add</button><br />
            <label v-if="selected">Title <input v-model.lazy="selected.title" /></label>
            <table v-if="selected">
                <tr><th style="width: 50%">Label</th><th style="width: 40%">Amount</th><th style="width: 10%"></th></tr>
                <zd-war-option v-for="(option, index) in selected.options" :option="option" @remove="remove(index)"></zd-war-option>
                <zd-war-option :option="newOption" @add="addOption"></zd-war-option>
            </table>
        </div>`,
        replicants: ["donations"],
        data: {
            selected: null,
            newOption: {
                newOption: true,
                label: "",
                amount: 0
            }
        },
        methods: {
            addWar: function() {
                const newWar = {
                    title: "New War",
                    options: []
                };
                this.donations.wars.push(newWar);
                this.selected = newWar;
            },
            addOption: function() {
                this.selected.options.push({
                    label: this.newOption.label,
                    amount: this.newOption.amount
                });
                this.newOption.label = "";
                this.newOption.amount = 0;
            },
            remove: function(index) {
                if (window.confirm("sure?")) this.ticker.lines.splice(index, 1);
            }
        }
	});
})();
