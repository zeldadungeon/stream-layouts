(function () {
    "use strict";
    
    Vue.component("zd-ticker-line", {
        template: `<tr class="zd-ticker__line">
            <td><input v-model.lazy="line.label" /></td>
            <td><input v-model.lazy="line.message" /></td>
            <td><button @click="$emit(line.newline ? 'add' : 'remove')">{{ line.newline ? "Add" : "Remove" }}</button></td>
        </tr>`,
        props: ["line"]
    });

    const app = new Vue({
        el: "#app",
        template: `<div class="zd-ticker">
            <table>
                <tr><th style="width: 30%">Label</th><th style="width: 60%">Message</th><th style="width: 10%"></th></tr>
                <zd-ticker-line v-for="(line, index) in ticker.lines" :line="line" @remove="remove(index)"></zd-ticker-line>
                <zd-ticker-line :line="newline" @add="addLine"></zd-ticker-line>
            </table>
        </div>`,
        replicants: ["ticker"],
        data: {
            newline: {
                newline: true,
                label: "",
                message: ""
            }
        },
        methods: {
            addLine: function() {
                this.ticker.lines.push({
                    label: this.newline.label,
                    message: this.newline.message
                });
                this.newline.label = "";
                this.newline.message = "";
            },
            remove: function(index) {
                if (window.confirm("sure?")) this.ticker.lines.splice(index, 1);
            }
        }
	});
})();
