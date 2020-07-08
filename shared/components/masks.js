(function () {
	"use strict";

	Vue.component("zd-masks", {
		template: `<div class="zd-masks">
			<table style="border-collapse: collapse">
				<tr v-for="row in masks.grid">
					<td v-for="mask in row" style="padding: 0px;">
						<div style="display: flex; align-items: center; height: 48px; width: 48px; overflow: hidden;">
							<div v-if="mask.done[num]" @click="uncomplete(mask)" style="cursor: pointer;">
								<img :src="'/bundles/zelda/shared/images/masks/' + mask.name + '.png'" />
							</div>
							<div v-else-if="masks.raised >= mask.requires" @click="complete(mask)" style="cursor: pointer;">
								<img :src="'/bundles/zelda/shared/images/masks/' + mask.name + '_Shadow.png'" />
							</div>
							<span v-else>{{ getUnlockText(mask) }}</span>
						</div>
					</td>
				</tr>
			</table>
		</div>`,
		props: ["num"],
		replicants: ["masks"],
		methods: {
			uncomplete(mask) {
				console.log('uncomplete');
				this.$set(mask.done, this.num, false);
			},
			complete(mask) {
				console.log('complete');
				this.$set(mask.done, this.num, true);
			},
			getUnlockText(mask) {
				for (let i = 0; i < this.masks.grid.length; ++i) {
					for (let j = 0; j < this.masks.grid[i].length; ++j) {
						// if there's a mask that isn't unlocked yet but has a lower requirement, then don't show text for this one
						const otherMask = this.masks.grid[i][j];
						if (otherMask.requires > this.masks.raised && otherMask.requires < mask.requires) {
							return "";
						}
					}
				}

				return `\$${(mask.requires - this.masks.raised).toFixed(2)}`;
			}
		}
	});
})();
