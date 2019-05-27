(function () {
    "use strict";

    const colors = [
        "#ff5252",
        "#44c044",
        "#448aff",
        "#aaaa44",
        "#44aaaa",
        "#aa44aa",
        "#dda022",
        "#22dda0",
        "#a033ff",
        "#ff0000"
    ]

    Vue.component("zd-rumble-chart", {
        extends: VueChartJs.Line,
        mixins: [VueChartJs.mixins.reactiveProp],
        props: ['chartData', 'options'],
        mounted() {
            this.renderChart(this.chartData, this.options);
        }
    });
    
    const app = new Vue({
        el: "#app",
        template: `<zd-rumble-chart :chartData="data" :options="options" :styles="myStyles"></zd-rumble-chart>`,
        replicants: ["runs", "stopwatch"],
        computed: {
            myStyles() {
                return {
                    height: `${142 + Math.ceil(this.stopwatch.time / 60 / 60) * 50}px`,
                    position: "relative"
                };
            },
            racers() {
                return this.runs["Twilight Princess"] && this.runs["Twilight Princess"].racers || [];
            },
            longestEstimate() {
                return this.racers.reduce((longest, racer) => Math.max(longest, racer.estimate), 0);
            },
            data() {
                return {
                    labels: [
                        "Start",
                        "Lantern",
                        "Goats 2",
                        "Forest Temple",
                        "Gale Boomerang",
                        "Diababa",
                        "Demolition",
                        "Iron Boots",
                        "Goron Mines",
                        "Hero's Bow",
                        "Fyrus",
                        "Zora's Domain",
                        "Lanayru Vessel",
                        "Lakebed Temple",
                        "Clawshot",
                        "Morpheel",
                        "Master Sword",
                        "Arbiter's Grounds",
                        "Spinner",
                        "Stallord",
                        "Snowpeak Ruins",
                        "Ball and Chain",
                        "Blizzeta",
                        "Temple of Time",
                        "Dominion Rod",
                        "Armogohma",
                        "Ancient Sky Book",
                        "City in the Sky",
                        "Double Clawshots",
                        "Argorok",
                        "Palace of Twilight",
                        "Master Sword L2",
                        "Zant",
                        "Hyrule Castle",
                        "Big Key",
                        "Finish"
                    ],
                    datasets: this.racers.map((r, i) => ({
                        label: r.name,
                        data: [this.longestEstimate - r.estimate].concat(r.splits.slice(0, r.checkpoint - 1), r.finish).map(s => s / 60 / 60),
                        backgroundColor: "rgba(0,0,0,0)",
                        borderColor: colors[i]
                    }))
                }
            },
            options() {
                return {
                    legend: {
                        labels: {
                            fontColor: "#fff"
                        }
                    },
                    maintainAspectRatio: false,
                    responsive: true,
                    scales: {
                        yAxes: [{
                            ticks: {
                                fontColor: "#fff",
                                stepSize: 1,
                                callback(v) {
                                    return `${v}hr`;
                                }
                            },
                            gridLines: {
                                color: "rgba(255, 255, 255, .2)"
                            },
                        }],
                        xAxes: [{
                            position: "top",
                            ticks: {
                                fontColor: "#fff",
                                autoSkip: false
                            },
                            gridLines: {
                                color: "rgba(255, 255, 255, .2)"
                            }
                        }],
                    }
                };
            }
        }
    });
})();