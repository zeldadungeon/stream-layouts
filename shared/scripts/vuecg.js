var Vue; // late binding

/**
 * Bind a nodecg replicant to a key on a vm.
 *
 * @param {Vue} vm
 * @param {string} key replicant with this key will be exposed on the vm with the same key
 * @param {any} defaultValue initial value before the replicant is synced (or if the replicant needs initialization)
 */
function bind(vm, key, defaultValue) {
    const replicant = defaultValue === undefined ? nodecg.Replicant(key) : nodecg.Replicant(key, { defaultValue: defaultValue });
    
    if (key in vm) {
        vm[key] = defaultValue === undefined ? {} : defaultValue;
    } else {
        Vue.util.defineReactive(vm, key, defaultValue === undefined ? {} : defaultValue);
    }
    
    const callback = function(val, oldVal) {
        val = val && JSON.parse(JSON.stringify(val));
        const currentVal = vm[key] && JSON.parse(JSON.stringify(vm[key]));
        if (!_.isEqual(val, currentVal)) {
            vm[key] = val;
        }
    };
    replicant.on("change", callback);

    const unwatch = vm.$watch(key, function(val, oldVal) {
        val = val && JSON.parse(JSON.stringify(val));
        const currentVal = replicant.value && JSON.parse(JSON.stringify(replicant.value));
        if (!_.isEqual(val, currentVal)) {
            replicant.value = val;
        }
    }, {
        deep: true
    });

    vm._nodecgReplicants[key] = replicant;
    vm._nodecgListeners[key] = { change: callback };
    vm._vueUnwatches[key] = unwatch;
}

/**
 * Unbind a replicate-bound key from a vm.
 *
 * @param {Vue} vm
 * @param {string} key
 */
function unbind (vm, key) {
    const listeners = vm._nodecgListeners[key];
    for (var event in listeners) {
        vm._nodecgReplicants[key].removeListener(event, listeners[event]);
    }
    
    vm._vueUnwatches[key]();
    vm._vueUnwatches[key] = null;

    vm[key] = null;
    vm._nodecgReplicants[key] = null;
    vm._nodecgListeners[key] = null;
}

const VueCGMixin = {
    created: function () {
        let replicants = this.$options.replicants;
        if (typeof replicants === "function") { replicants = replicants.call(this); }
        if (Array.isArray(replicants)) {
            this._nodecgReplicants = Object.create(null);
            this._nodecgListeners = Object.create(null);
            this._vueUnwatches = [];

            for (var i = 0; i < replicants.length; ++i) {
                bind(this, replicants[i]);
            }
        } else if (typeof replicants === "object") {
            this._nodecgReplicants = Object.create(null);
            this._nodecgListeners = Object.create(null);
            this._vueUnwatches = [];

            Object.keys(replicants).forEach(key => bind(this, key, replicants[key]));
        }
    },
    beforeDestroy: function () {
        const replicants = this.$options.replicants;
        if (typeof replicants === "function") { replicants = replicants.call(this); }
        if (Array.isArray(replicants)) {
            for (var i = 0; i < replicants.length; ++i) {
                unbind(this, replicants[i]);
            }

            this._nodecgReplicants = null;
            this._nodecgListeners = null;
            this._vueUnwatches = null;
        } else if (typeof replicants === "object") {
            Object.keys(replicants).forEach(key => unbind(this, key));

            this._nodecgReplicants = null;
            this._nodecgListeners = null;
            this._vueUnwatches = null;
        }
    }
}

/**
 * Install function passed to Vue.use() in manual installation.
 *
 * @param {function} _Vue
 */
function install (_Vue) {
    Vue = _Vue;
    Vue.mixin(VueCGMixin);

    // TODO what does this do?
    const mergeStrats = Vue.config.optionMergeStrategies;
    mergeStrats.replicants = mergeStrats.provide;
}

// auto install
if (typeof window !== "undefined" && window.Vue) {
    install(window.Vue);
}