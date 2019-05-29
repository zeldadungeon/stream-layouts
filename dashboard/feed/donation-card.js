(function () {
    "use strict";

    Vue.use(VueMaterial.default);
    
    Vue.component("zd-donation", {
        template: `<md-card>
            <md-card-header>
                <md-card-header-text>
                    <div class="md-title">{{ donation.displayName }}</div>
                    <div>\${{ donation.amount }}</div>
                </md-card-header-text>
            </md-card-header>

            <md-card-content>
                {{ donation.message }}
            </md-card-content>

            <md-card-actions md-alignment="space-between">
                <md-button class="md-raised md-primary" @click.prevent="dismiss">Processed</md-button>
            </md-card-actions>
        </md-card>`,
        props: ["donation"],
        methods: {
            dismiss: function() {
                this.$emit('dismiss', this.donation.createdDateUTC);
            }
        }
    });
})();
