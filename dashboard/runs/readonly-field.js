(function () {
    "use strict";

    Vue.use(VueMaterial.default);

    Vue.component("zd-readonly-field", {
        template: `<md-field class="md-has-value zd-readonly-field">
            <label>{{ label }}</label>
            <div class="zd-readonly-field-value">{{ value }}</div>
        </md-field>`,
        props: ["label", "value"]
    });
})();