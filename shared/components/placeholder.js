(function () {
	"use strict";

	Vue.component("zd-placeholder", {
		template: `<div class="zd-placeholder" :style="wrapperStyle">
			<table style="position: absolute; width: 100%; height: 100%; text-align: center; text-shadow: 0 0 5px black;">
				<tr><td>L: {{ left }}</td><td>T: {{ top }}</td></tr>
				<tr><td>W: {{ width }}</td><td>H: {{ height }}</td></tr>
			</table>
			<div :style="bgStyle" />
		</div>`,
		props: ["kind", "left", "top", "width", "height", "runName"],
		replicants: ["runs"],
        data: function() {
            return {};
        },
		computed: {
			wrapperStyle() {
				return `display: ${ this.run.showPlaceholders ? "block" : "none" };
					left: ${ this.left }px;
					top: ${ this.top }px;
					width: ${ this.width }px;
					height: ${ this.height }px;`;
			},
			bgStyle() {
				return `position: absolute;
					z-index: -1;
					opacity: .5;
					width: 100%;
					height: 100%;
					background: center / 100% 100% url('placeholders/${ this.kind }.png')`;
			},
			run() {
				return this.runs && this.runs.start && this.runs[this.runName || this.runs.start.current] || {};
			}
		}
	});
})();
