(function () {
    "use strict";

    Vue.use(VueMaterial.default);

    Vue.component("zd-readonly-field", {
        template: `<md-field class="md-has-value zd-readonly-field">
            <label>{{ label }}</label>
            <div class="zd-readonly-field-value" :class="valueClass">{{ value }}</div>
        </md-field>`,
        props: ["label", "value", "state"],
        computed: {
            valueClass() {
                return {
                    good: "zd-text-good",
                    bad: "zd-text-bad"
                }[this.state] || "";
            }
        }
    });
})();