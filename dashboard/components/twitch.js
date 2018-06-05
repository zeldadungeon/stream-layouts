(function () {
	"use strict";

	Vue.component("zd-twitch", {
        template: `<div><div>{{ twitch }}</div><div>{{ bits }}</div></div>`,
        replicants: ["twitch", "bits"]
	});
})();
