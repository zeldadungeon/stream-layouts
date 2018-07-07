(function () {
    "use strict";
    
    Vue.component("zd-war-option", {
        template: `<tr class="zd-wars__option">
            <td><input class="mdl-textfield__input" v-model.lazy="option.label" /></td>
            <td><input class="mdl-textfield__input" type="number" v-model.number.lazy="option.amount" @change="$emit('change')"/></td>
            <td><button class="mdl-button mdl-button--raised" @click="$emit(option.newOption ? 'add' : 'remove')">{{ option.newOption ? 'Add' : 'Remove' }}</button></td>
        </tr>`,
        props: ["option"]
    });

    const app = new Vue({
        el: "#app",
        template: `<div class="zd-wars">
            <select v-model="selected">
                <option v-for="war in donations.wars" :value="war">{{ war.title }}</option>
            </select>
            <button class="mdl-button mdl-button--raised" style="float: right;" @click="addWar">Add War</button>
            <div v-if="selected" class="mdl-textfield mdl-js-textfield mdl-js-textfield--floating-label" ref="title">
                <input class="mdl-textfield__input" v-model.lazy="selected.title" />
                <label class="mdl-textfield__label">Title</label>
            </div>
            <table v-if="selected">
                <tr><th style="width: 50%">Label</th><th style="width: 40%">Amount</th><th style="width: 10%"></th></tr>
                <zd-war-option v-for="(option, index) in selected.options" :option="option" @change="sort" @remove="removeOption(index)"></zd-war-option>
                <tr style="height: 2em;" />
                <zd-war-option :option="newOption" @add="addOption"></zd-war-option>
            </table>
            <button v-if="selected" class="mdl-button mdl-button--raised" style="float: right;" @click="removeWar">Remove War</button>
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
            removeWar: function() {
                if (window.confirm("sure?")) {
                    this.donations.wars.splice(this.donations.wars.indexOf(this.selected), 1);
                    this.selected = null;
                }
            },
            addOption: function() {
                this.selected.options.push({
                    label: this.newOption.label,
                    amount: this.newOption.amount
                });
                this.newOption.label = "";
                this.newOption.amount = 0;
            },
            removeOption: function(index) {
                if (window.confirm("sure?")) this.selected.options.splice(index, 1);
            },
            sort: function() {
                console.log(this.selected.options);
                this.selected.options = this.selected.options.sort((a, b) => b.amount - a.amount);
                console.log(this.selected.options);
            }
        },
        watch: {
            selected: function() {
                var vm = this;
                Vue.nextTick().then(function () {
                    if (vm.$refs.title) {
                        componentHandler.upgradeElement(vm.$refs.title);
                    }
                });
            }
        }
	});
})();
