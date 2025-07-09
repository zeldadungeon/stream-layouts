(function () {
	"use strict";

	Vue.component("zd-feed", {
		template: `<div :class="wrapperClass" :style="wrapperStyle">
			<div :style="guidesStyle">
				<table style="position: absolute; width: 100%; height: 100%; text-align: center; text-shadow: 0 0 5px black;">
					<tr><td>L: {{ left }}</td><td>T: {{ top }}</td></tr>
					<tr><td>W: {{ width }}</td><td>H: {{ height }}</td></tr>
				</table>
				<div :style="bgStyle" />
			</div>
			<zd-player v-if="playerNum != undefined" :style="nameplateStyle" :num="playerNum" :run-name="runName" :pos="nameplateOverlayPos" :total-num-displayed="totalNumDisplayed"></zd-player>
			<div style="position: absolute; top: -60px;"><slot name="topleft" :pos="'bottomright'"></slot></div>
			<div style="position: absolute; top: -60px; width: 100%; display: flex; justify-content: center;"><slot name="top" :pos="'bottomright'"></slot></div>
			<div style="position: absolute; top: -60px; right: 0;"><slot name="topright" :pos="'bottomleft'"></slot></div>
			<div style="position: absolute; left: -400px;"><slot name="lefttop" :pos="'right'"></slot></div>
			<div style="position: absolute; left: -400px; height: 100%; display: flex; align-items: center;"><slot name="left" :pos="'right'"></slot></div>
			<div style="position: absolute; left: -400px; bottom: 0;"><slot name="leftbottom" :pos="'right'"></slot></div>
			<div style="position: absolute; right: -400px;"><slot name="righttop" :pos="'left'"></slot></div>
			<div style="position: absolute; right: -400px; height: 100%; display: flex; align-items: center;"><slot name="right" :pos="'left'"></slot></div>
			<div style="position: absolute; right: -400px; bottom: 0;"><slot name="rightbottom" :pos="'left'"></slot></div>
			<div style="position: absolute; bottom: -60px;"><slot name="bottomleft" :pos="'topright'"></slot></div>
			<div style="position: absolute; bottom: -60px; width: 100%; display: flex; justify-content: center;"><slot name="bottom" :pos="'topright'"></slot><slot :pos="'topright'"></slot></div>
			<div style="position: absolute; bottom: -60px; right: 0;"><slot name="bottomright" :pos="'topleft'"></slot></div>
		</div>`,
		props: ["kind", "left", "top", "width", "height", "runName", "playerNum", "nameplatePos", "totalNumDisplayed"],
		replicants: ["runs"],
        data: function() {
            return {};
        },
		computed: {
			wrapperClass() {
				return `zd-feed zd-feed--${ this.kind }`;
			},
			wrapperStyle() {
				return `left: ${ this.left }px;
					top: ${ this.top }px;
					width: ${ this.width }px;
					height: ${ this.height }px;`;
			},
			guidesStyle() {
				return this.run.showPlaceholders ? 'display: block;' : 'display: none;'
			},
			bgStyle() {
				return `position: absolute;
					z-index: -1;
					opacity: .5;
					width: 100%;
					height: 100%;
					background: center / 100% 100% url('placeholders/${ this.kind }.png')`;
			},
			nameplateStyle() {
				let pos = this.nameplatePos ?? 'bottom';
				const inside = pos?.startsWith('inside') ?? false;
				if (inside)
				{
					pos = pos.substring(6).trim();

					if (pos === '')
					{
						pos = 'bottom'
					}
				}

				let style = 'position: absolute;';

				if (['top', 'topleft', 'topright'].includes(pos)) {
					style += inside ? ' top: 0px;' : ' top: -60px;';
				} else if (['left', 'lefttop', 'leftbottom'].includes(pos)) {
					style += inside ? ' left: 0px;' : ' left: -400px;';
				} else if (['right', 'righttop', 'rightbottom'].includes(pos)) {
					style += inside ? ' right: 0px;' : ' right: -400px;';
				} else if (['bottom', 'bottomleft', 'bottomright'].includes(pos)) {
					style += inside ? ' bottom: 0px;' : ' bottom: -60px;';
				}

				if (['top', 'bottom'].includes(pos)) {
					style += ` left: ${ this.width / 2 - 200 }px;`;
				} else if (['topright', 'bottomright'].includes(pos)) {
					style += ` right: 0;`;
				} else if (['left', 'right'].includes(pos)) {
					style += ` top: ${ this.height / 2 - 30 }px;`;
				} else if (['leftbottom', 'rightbottom'].includes(pos)) {
					style += ` bottom: 0;`;
				}

				return style;
			},
			nameplateOverlayPos() {
				switch (this.nameplatePos) {
					case 'top':
					case 'topleft':
						return 'bottomright';
					case 'topright':
						return 'bottomleft';
					case 'left':
					case 'lefttop':
					case 'leftbottom':
						return 'right';
					case 'right':
					case 'righttop':
					case 'rightbottom':
						return 'left';
					case 'bottomright':
						return 'topleft';
					default: // bottom, bottomleft
						return 'topright';
				}
			},
			run() {
				return this.runs && this.runs.start && this.runs[this.runName || this.runs.start.current] || {};
			}
		}
	});
})();
