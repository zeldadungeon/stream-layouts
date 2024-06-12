"use strict";

module.exports = function (nodecg) {
    const bingo = nodecg.Replicant("bingo", {
        defaultValue: {
            teams: [[], [], [], []],
            bonus: [],
            required: [],
            totalAtStart: 0,
            raised: 0
        }
    });

    const donations = nodecg.Replicant("donations");
    donations.on("change", (newValue, oldValue) => {
        bingo.value.raised = newValue.total - bingo.value.totalAtStart;
    });

    nodecg.listenFor("bingo:reset", () => {
        bingo.value = {
            teams: Array(4).fill(Array(5).fill({ name: "TBD" })),
            bonus: [],
            required: ["Wind Temple", "Fire Temple", "Water Temple", "Lightning Temple", "Hyrule Castle", "Spirit Temple"].map(t => {
                return {
                    name: t,
                    requires: 0,
                    done: []
                }
            }),
            totalAtStart: donations.value.total,
            raised: 0
        };
    });

    nodecg.listenFor("bingo:shuffle", () => {
        let board = generateBoard();
        let bonus;

        do { // this block rarely executes more than once
            // generate a new board just for bonus objectives
            let bonusCandidate = generateBoard().sort((a, b) => b.difficulty - a.difficulty);
            bonus = [];
            bonusCandidate.forEach(task => {
                // throw out 'dupes' (e.g. team must activate 10 towers, everyone must activate 7 towers)

                if (!board.concat(bonus).some(t => JSON.stringify(t.types.sort()) === JSON.stringify(task.types.sort()))) {
                    bonus.push(task);
                }
            });
        } while(bonus.length < 6);

        bonus = bonus.slice(0, 6).reverse(); // take the 6 hardest ones
        // bonus.push({ difficulty: 25, types: ["DLC"], name: "Obliterator", synergy: 0 });
        for (let i = 0; i < 6; ++i) {
            bonus[i].requires = [100, 225, 400, 600, 900, 1200][i];
            bonus[i].done = [];
        }

        console.log(bonus);

        bingo.value = {
            teams: [
                board.slice(1,6).sort((a, b) => a.difficulty - b.difficulty),
                board.slice(6,11).sort((a, b) => a.difficulty - b.difficulty),
                board.slice(11,16).sort((a, b) => a.difficulty - b.difficulty),
                board.slice(16,21).sort((a, b) => a.difficulty - b.difficulty)
            ],
            bonus: bonus/*[{
                name: "Camera Work in the Depths",
                requires: 100,
                done: []
            }, {
                name: "Impa and the Geoglyphs",
                requires: 250,
                done: []
            }, {
                name: "A Mystery in the Depths",
                requires: 450,
                done: []
            }, {
                name: "Trail of the Master Sword",
                requires: 700,
                done: []
            }, {
                name: "Recovering the Hero's Sword",
                requires: 1000,
                done: []
            }, {
                name: "The Dragon's Tears",
                requires: 1500,
                done: []
            }]*/,
            required: ["Wind Temple", "Fire Temple", "Water Temple", "Lightning Temple", "Hyrule Castle", "Spirit Temple"].map(t => ({
                name: t,
                requires: 0,
                done: []
            })),
            totalAtStart: donations.value.total,
            raised: 0
        };
    });
};

function generateBoard() {
    var bingoList = getTasksTotk();
    var SEED = Math.ceil(999999 * Math.random());

	var lineCheckList = [];
		lineCheckList[1]  = [1,2,3,4,5,10,15,20,6,12,18,24];
		lineCheckList[2]  = [0,2,3,4,6,11,16,21];
		lineCheckList[3]  = [0,1,3,4,7,12,17,22];
		lineCheckList[4]  = [0,1,2,4,8,13,18,23];
		lineCheckList[5]  = [0,1,2,3,8,12,16,20,9,14,19,24];

		lineCheckList[6]  = [0,10,15,20,6,7,8,9];
		lineCheckList[7]  = [0,12,18,24,5,7,8,9,1,11,16,21];
		lineCheckList[8]  = [5,6,8,9,2,12,17,22];
		lineCheckList[9]  = [4,12,16,20,9,7,6,5,3,13,18,23];
		lineCheckList[10]  = [4,14,19,24,8,7,6,5];

		lineCheckList[11] = [0,5,15,20,11,12,13,14];
		lineCheckList[12] = [1,6,16,21,10,12,13,14];
		lineCheckList[13] = [0,6,12,18,24,20,16,8,4,2,7,17,22,10,11,13,14];
		lineCheckList[14] = [3,8,18,23,10,11,12,14];
		lineCheckList[15] = [4,9,19,24,10,11,12,13];

		lineCheckList[16] = [0,5,10,20,16,17,18,19];
		lineCheckList[17] = [15,17,18,19,1,6,11,21,20,12,8,4];
		lineCheckList[18] = [15,16,18,19,2,7,12,22];
		lineCheckList[19] = [15,16,17,19,23,13,8,3,24,12,6,0];
		lineCheckList[20] = [4,9,14,24,15,16,17,18];

		lineCheckList[21] = [0,5,10,15,16,12,8,4,21,22,23,24];
		lineCheckList[22] = [20,22,23,24,1,6,11,16];
		lineCheckList[23] = [2,7,12,17,20,21,23,24];
		lineCheckList[24] = [20,21,22,24,3,8,13,18];
		lineCheckList[25] = [0,6,12,18,20,21,22,23,19,14,9,4];

	function difficulty(i) {
		// To create the magic square we need 2 random orderings of the numbers 0, 1, 2, 3, 4.
		// The following creates those orderings and calls them Table5 and Table1

		var Num3 = SEED%1000;	// Table5 will use the ones, tens, and hundreds digits.

		var Rem8 = Num3%8;
		var Rem4 = Math.floor(Rem8/2);
		var Rem2 = Rem8%2;
		var Rem5 = Num3%5;
		var Rem3 = Num3%3;	// Note that Rem2, Rem3, Rem4, and Rem5 are mathematically independent.
		var RemT = Math.floor(Num3/120);	// This is between 0 and 8

		// The idea is to begin with an array containing a single number, 0.
		// Each number 1 through 4 is added in a random spot in the array's current size.
		// The result - the numbers 0 to 4 are in the array in a random (and uniform) order.
		var Table5 = [0];
		Table5.splice(Rem2, 0, 1);
		Table5.splice(Rem3, 0, 2);
		Table5.splice(Rem4, 0, 3);
		Table5.splice(Rem5, 0, 4);

		Num3 = Math.floor(SEED/1000);	// Table1 will use the next 3 digits.
		Num3 = Num3%1000;

		Rem8 = Num3%8;
		Rem4 = Math.floor(Rem8/2);
		Rem2 = Rem8%2;
		Rem5 = Num3%5;
		Rem3 = Num3%3;
		RemT = RemT * 8 + Math.floor(Num3/120);	 // This is between 0 and 64.

		var Table1 = [0];
		Table1.splice(Rem2, 0, 1);
		Table1.splice(Rem3, 0, 2);
		Table1.splice(Rem4, 0, 3);
		Table1.splice(Rem5, 0, 4);

		i--;
		RemT = RemT%5;		//  Between 0 and 4, fairly uniformly.
		var x = (i+RemT)%5;		//  RemT is horizontal shift to put any diagonal on the main diagonal.
		var y = Math.floor(i/5);

		// The Tables are set into a single magic square template
		// Some are the same up to some rotation, reflection, or row permutation.
		// However, all genuinely different magic squares can arise in this fashion.
		var e5 = Table5[(x + 3*y)%5];
		var e1 = Table1[(3*x + y)%5];

		// Table5 controls the 5* part and Table1 controls the 1* part.
		var value = 5*e5 + e1;

        //value = Math.floor((value + 25) / 2);
        value++;
		return value;
	}

	function checkLine (i, typesA) {
		var synergy = 0;
		if (typeof typesA != 'undefined') {
			for (var j=0; j<lineCheckList[i].length; j++) {
				var typesB = bingoBoard[lineCheckList[i][j]+1].types;
				if (typeof typesB != 'undefined') {
					for (var k=0; k < typesA.length; k++) {
						for (var l=0; l < typesB.length; l++) {
							if (typesA[k] == typesB[l]) {
								synergy++; // if match increase
								if (k==0) { synergy++; } // if main type increase
								if (l==0) { synergy++; } // if main type increase
							}
						}
					}
				}
			}
		}
		return synergy;
	}

	var bingoBoard = []; //the board itself stored as an array first
	for (var i=1;i<=25;i++) {
		bingoBoard[i] = {difficulty: difficulty(i)}; //array with objects that
		//console.log(bingoBoard[i].difficulty);       //store the difficulty
	}                                          // in order 1-25

	//populate the bingo board in the array
	var seen = [];
	for (i=1; i<=25; i++) {
		var getDifficulty = bingoBoard[i].difficulty - 1; // difficulty of current square
		var RNG = Math.floor(bingoList[getDifficulty].length * Math.random());
		if (RNG == bingoList[getDifficulty].length) { RNG--; } //fix a miracle
		var j = 0, synergy = 0, currentObj = null, minSynObj = null;

		do {
			currentObj = bingoList[getDifficulty][(j+RNG)%bingoList[getDifficulty].length];
			synergy = checkLine(i, currentObj.types);
			if (seen.indexOf(currentObj.name) < 0 && (minSynObj == null || synergy < minSynObj.synergy)) {
			  minSynObj = { synergy: synergy, value: currentObj };
			}
			j++;
		} while (!(synergy == 0 && seen.indexOf(currentObj.name) < 0) && (j<bingoList[getDifficulty].length));

		bingoBoard[i].types = minSynObj.value.types;
		bingoBoard[i].name = minSynObj.value.name;
		bingoBoard[i].synergy = minSynObj.synergy;
		seen.push(minSynObj.value.name);
	}

	return bingoBoard;
}; // setup

function getTasksTotk() {
    const tasks = [];
    for (let i = 0; i < 25; ++i) {
        tasks.push([]);
    }

    function task(name, ...types) {
        return {
            "name": name,
            "types": types
        }
    }

    // Region Weights
    function region(name, weight) {
        return {
            "name": name,
            "weight": weight
        };
    }
    const regions = [
        region("Hyrule Field", 0),
        region("Hyrule Ridge", 1),
        region("Tabantha Frontier", 2),
        region("Hebra", 4),
        region("Woodland", 3),
        region("Eldin", 3),
        region("Akkala", 4),
        region("Lanayru", 3),
        region("West Necluda", 1),
        region("East Necluda", 2),
        region("Faron", 3),
        region("Great Plateau", 2),
        region("Gerudo Desert", 3),
        region("Gerudo Highlands", 4),
        region("Sky", 3)
    ]

    // Towers
    function tower(name, location) {
        return task(name, "Tower", location);
    }
    tasks[1].push(tower("Lindor's Brow Skyview Tower", "Hyrule Ridge"));
    tasks[2].push(tower("Rospro Pass Skyview Tower", "Tabantha Frontier"));
    tasks[2].push(tower("Hyrule Field Skyview Tower", "Hyrule Field"));
    tasks[2].push(tower("Sahasra Slope Skyview Tower", "West Necluda"));
    tasks[3].push(tower("Gerudo Canyon Skyview Tower", "Gerudo Desert"));
    tasks[3].push(tower("Upland Zorana Skyview Tower", "Lanayru"));
    tasks[3].push(tower("Eldin Canyon Skyview Tower", "Eldin"));
    tasks[4].push(tower("Popla Foothills Skyview Tower", "Faron"));
    tasks[5].push(tower("Ulri Mountain Skyview Tower", "Akkala"));
    tasks[6].push(tower("Rabella Wetlands Skyview Tower", "East Necluda"));
    tasks[6].push(tower("Thyphlo Ruins Skyview Tower", "Woodland"));
    tasks[7].push(tower("Gerudo Highlands Skyview Tower", "Gerudo Highlands"));
    tasks[7].push(tower("Pikida Stonegrove Skyview Tower", "Hebra"));
    tasks[7].push(tower("Mount Lanayru Skyview Tower", "Mount Lanayru"));
    tasks[8].push(task("Activate 4 Skyview Towers", "Tower"));
    tasks[9].push(task("Activate 5 Skyview Towers", "Tower"));
    tasks[10].push(task("Activate 6 Skyview Towers", "Tower"));
    tasks[11].push(task("Activate 7 Skyview Towers", "Tower"));
    tasks[12].push(task("Activate 8 Skyview Towers", "Tower"));
    tasks[13].push(task("Activate 9 Skyview Towers", "Tower"));
    tasks[14].push(task("Activate 10 Skyview Towers", "Tower"));
    tasks[16].push(task("Activate 11 Skyview Towers", "Tower"));
    tasks[18].push(task("Activate 12 Skyview Towers", "Tower"));
    tasks[20].push(task("Activate 13 Skyview Towers", "Tower"));
    tasks[22].push(task("Activate 14 Skyview Towers", "Tower"));
    tasks[24].push(task("Activate 15 Skyview Towers", "Tower"));

    // Shrines
    tasks[3].push(task("Any Proving Grounds Shrine", "Shrine"));
    for (let i = 0; i < regions.length; ++i) {
        tasks[6 + regions[i].weight].push(task(`3 ${regions[i].name} Shrines`, "Shrine", regions[i].name));
        tasks[8 + regions[i].weight].push(task(`4 ${regions[i].name} Shrines`, "Shrine", regions[i].name));
        tasks[10 + regions[i].weight].push(task(`5 ${regions[i].name} Shrines`, "Shrine", regions[i].name));
    }
    for (let i = 10; i <= 20; ++i) {
        tasks[i + 4].push(task(`${i} Shrines of Light`, "Shrine"));
    }

    // Lightroots
    for (let i = 1; i <= 24; ++i) {
        tasks[i].push(task(`Activate ${i} Lightroot${i == 1 ? "" : "s"}`, "Lightroot", "Depths"));
    }

    // Koroks
    for (let i = 0; i < regions.length; ++i) {
        tasks[regions[i].weight].push(task(`3 ${regions[i].name} Korok Seeds`, "Korok", regions[i].name));
        tasks[3 + regions[i].weight].push(task(`6 ${regions[i].name} Korok Seeds`, "Korok", regions[i].name));
        tasks[6 + regions[i].weight].push(task(`9 ${regions[i].name} Korok Seeds`, "Korok", regions[i].name));
        tasks[10 + regions[i].weight].push(task(`12 ${regions[i].name} Korok Seeds`, "Korok", regions[i].name));
        tasks[15 + regions[i].weight].push(task(`15 ${regions[i].name} Korok Seeds`, "Korok", regions[i].name));
    }
    for (let i = 5; i <= 50; i += 5) {
        // exponential curve. made sure it's bounded under 24 at 50 koroks.
        tasks[Math.ceil(0.16*i + 0.006*i*i)].push(task(`${i} Korok Seeds`, "Korok"));
    }

    // Compendium
    for (let i = 3; i <= 15; i += 3) {
        const difficulty = Math.ceil(3 + 0.25*i + 0.05*i*i);
        tasks[difficulty].push(task(`${i} Creatures in Compendium`, "Camera", "Compendium"));
        tasks[difficulty].push(task(`${i} Monsters in Compendium`, "Camera", "Compendium"));
        tasks[difficulty].push(task(`${i} Materials in Compendium`, "Camera", "Compendium"));
        tasks[difficulty].push(task(`${i} Equipment in Compendium`, "Camera", "Compendium"));
    }
    for (let i = 5; i <= 30; i += 5) {
        tasks[Math.ceil(3 + 0.14*i + 0.014*i*i)].push(task(`${i} Compendium Entries`, "Camera", "Compendium"));
    }

    // Sky Exploration
    tasks[10].push(task("4 Sage's Wills", "Sky"));
    tasks[10].push(task("5 Old Maps", "Sky"));
    tasks[16].push(task("8 Sage's Wills", "Sky"));
    tasks[16].push(task("10 Old Maps", "Sky"));
    tasks[24].push(task("12 Sage's Wills", "Sky"));
    tasks[24].push(task("15 Old Maps", "Sky"));

    // Bubbul Gems
    for (let i = 5; i <= 30; i += 5) {
        // 5 gems = difficulty 5, 30 gems = difficulty 20
        tasks[Math.ceil(3 + 0.14*i + 0.014*i*i)].push(task(`${i} Bubbul Gems`, "Bubbul Gems"));
    }

    // Depths Exploration
    tasks[3].push(task("1 Schema Stone", "Depths"));
    tasks[3].push(task("1 Yiga Schematic", "Depths"));
    tasks[4].push(task("2 Yiga Schematics", "Depths"));
    tasks[5].push(task("2 Schema Stones", "Depths"));
    tasks[6].push(task("3 Yiga Schematics", "Depths"));
    tasks[7].push(task("3 Schema Stones", "Depths"));
    tasks[8].push(task("4 Yiga Schematics", "Depths"));
    tasks[10].push(task("5 Yiga Schematics", "Depths"));
    tasks[11].push(task("4 Schema Stones", "Depths"));
    tasks[12].push(task("6 Yiga Schematics", "Depths"));
    tasks[14].push(task("7 Yiga Schematics", "Depths"));
    tasks[16].push(task("5 Schema Stones", "Depths"));
    tasks[16].push(task("8 Yiga Schematics", "Depths"));

    // Pony Points
    tasks[1].push(task("Towing Harness", "Pony Points"));
    tasks[3].push(task("Horse-God Fabric", "Pony Points", "Fabric"));
    tasks[6].push(task("Access Melanya Bed", "Pony Points"));
    tasks[12].push(task("Traveler's Saddle+Bridle", "Pony Points"));
    tasks[20].push(task("Extravagant Saddle+Bridle", "Pony Points"));

    // Fabrics
    tasks[2].push(task("Cece Fabric", "Fabric", "East Necluda", "Hateno"));
    tasks[3].push(task("Chuchu Fabric", "Fabric", "East Necluda", "Hateno", "Camera", "Side Quest"));
    tasks[6].push(task("Aerocuda Fabric", "Fabric", "East Necluda", "Hateno", "Camera"));
    tasks[6].push(task("Cucco Fabric", "Fabric", "East Necluda", "Hateno", "Camera"));
    tasks[8].push(task("Eldin-Ostrich Fabric", "Fabric", "East Necluda", "Hateno", "Camera"));
    tasks[7].push(task("Gleeok Fabric", "Fabric", "East Necluda", "Hateno", "Camera"));
    tasks[8].push(task("Grizzlemaw-Bear Fabric", "Fabric", "East Necluda", "Hateno", "Camera"));
    tasks[6].push(task("Horse Fabric", "Fabric", "East Necluda", "Hateno", "Camera"));
    tasks[7].push(task("Lynel Fabric", "Fabric", "East Necluda", "Hateno", "Camera"));
    tasks[7].push(task("Stalnox Fabric", "Fabric", "East Necluda", "Hateno", "Camera"));
    tasks[2].push(task("Nostalgic Fabric", "Fabric", "Great Plateau"));
    tasks[4].push(task("Royal Hyrulean Fabric", "Fabric", "Hyrule Castle"));
    tasks[8].push(task("Hudson Construction Fabric", "Fabric", "Akkala", "Side Quest"));
    tasks[8].push(task("Zonai Fabric", "Fabric", "Sky", "Side Quest"));
    tasks[8].push(task("Zora Fabric", "Fabric", "Lanayru", "Side Quest"));
    tasks[14].push(task("Lurelin Village Fabric", "Fabric", "East Necluda", "Side Adventure", "Side Quest"));
    tasks[2].push(task("Korok Fabric", "Fabric", "Woodland", "Side Quest")); // TODO if in future years we don't require Trail of the Master Sword, increase this difficulty
    tasks[12].push(task("Zonai Survey Team Fabric", "Fabric", "Sky", "Side Adventure"));
    tasks[8].push(task("Lucky Clover Gazette Fabric", "Fabric", "Side Adventure"));
    tasks[16].push(task("Monster-Control-Crew Fabric", "Fabric", "Side Quest"));
    tasks[7].push(task("Gerudo Fabric", "Fabric", "Gerudo Desert"));
    tasks[9].push(task("Goron Fabric", "Fabric", "Eldin"));
    tasks[13].push(task("Yiga Fabric", "Fabric", "Armor", "Side Adventure")); // see "Infiltrating the Yiga Clan" Side Adventure
    tasks[7].push(task("Sheikah Fabric", "Fabric", "Armor", "Rupees")); // requires buying armor from Enchanted
    // Horse-God Fabric - see Pony Points

    // Armor
    function addArmor(name, diff0, diff1, diff2, ...types) {
        if (diff0 != null) tasks[diff0].push(task(name, "Armor", ...types));
        if (diff1 != null) tasks[diff1].push(task(`${name} ★`, "Armor", "Great Fairy", ...types));
        if (diff2 != null) tasks[diff2].push(task(`${name} ★★`, "Armor", "Great Fairy", "Rupees", ...types));
    }
    function addArmorSet(name, diff0, diff1, types,
        hName, hDiff0, hDiff1, hDiff2, hTypes,
        aName, aDiff0, aDiff1, aDiff2, aTypes,
        lName, lDiff0, lDiff1, lDiff2, lTypes) {
        addArmor(hName, hDiff0, hDiff1, hDiff2, `${name} Set`, ...hTypes);
        addArmor(aName, aDiff0, aDiff1, aDiff2, `${name} Set`, ...aTypes);
        addArmor(lName, lDiff0, lDiff1, lDiff2, `${name} Set`, ...lTypes);
        if (diff0 != null) tasks[diff0].push(task(`Full ${name} Set`, "Armor", `${name} Set`, ...types));
        if (diff1 != null) tasks[diff1].push(task(`Full ${name} Set ★`, "Armor", `${name} Set`, "Great Fairy", ...types));
    }

    // sky/surface chests
    addArmorSet("Zonaite", 12, 17, ["Sky"],
        "Zonaite Helm", 4, 8, 11, ["Sky"],
        "Zonaite Waistguard", 4, 8, 11, ["Sky"],
        "Zonaite Shin Guards", 4, 8, 11, ["Sky"]);
    addArmorSet("Barbarian", 12, 17, [],
        "Barbarian Helm", 4, 8, 11, ["East Necluda"],
        "Barbarian Armor", 3, 7, 10, ["Hyrule Field"],
        "Barbarian Leg Wraps", 5, 9, 12, ["East Necluda"]);
    addArmorSet("Fierce Deity", 8, 17, [],
        "Fierce Deity Mask", 3, 8, 11, ["Akkala"],
        "Fierce Deity Armor", 3, 8, 11, ["Akkala"],
        "Fierce Deity Boots", 2, 7, 10, ["Hyrule Field"]);
    addArmorSet("Charged", 3, 8, ["Faron"],
        "Charged Headdress", 1, 5, 8, ["Faron"],
        "Charged Shirt", 1, 5, 8, ["Faron"],
        "Charged Trousers", 1, 5, 8, ["Faron"]);
    addArmorSet("Ember", 8, 13, ["Eldin"],
        "Ember Headdress", 2, 6, 9, ["Eldin"],
        "Ember Shirt", 3, 7, 10, ["Eldin"],
        "Ember Trousers", 3, 7, 10, ["Eldin"]);
    addArmorSet("Frostbite", 9, 14, ["Hebra"],
        "Frostbite Headdress", 4, 8, 11, ["Hebra"],
        "Frostbite Shirt", 2, 6, 9, ["Tabantha Frontier"],
        "Frostbite Trousers", 3, 7, 10, ["Hebra"]);
    addArmorSet("Climbing", 6, 11, [],
        "Climber's Bandanna", 3, 7, 10, ["Lanayru"],
        "Climbing Gear", 1, 5, 8, ["Hyrule Ridge"],
        "Climbing Boots", 2, 6, 9, ["Lanayru"]);
    addArmorSet("Phantom", 9, null, [],
        "Phantom Helmet", 3, null, null, ["Faron"],
        "Phantom Armor", 3, null, null, ["Gerudo Highlands"],
        "Phantom Greaves", 3, null, null, ["Gerudo Desert"]);
    addArmorSet("Rubber", 8, 13, [],
        "Rubber Helm", 3, 7, 10, ["Faron"],
        "Rubber Armor", 2, 6, 9, ["Hyrule Field"],
        "Rubber Tights", 3, 7, 10, ["Lanayru"]);
    addArmorSet("Soldier's", 3, 8, ["Hyrule Field"],
        "Soldier's Helm", 1, 5, 8, ["Hyrule Field"],
        "Soldier's Armor", 1, 5, 8, ["Hyrule Field"],
        "Soldier's Greaves", 1, 5, 8, ["Hyrule Field"]);
    addArmorSet("Royal Guard", 9, 14, ["Hyrule Castle"],
        "Royal Guard Cap", 3, 7, 10, ["Hyrule Castle"],
        "Royal Guard Uniform", 3, 7, 10, ["Hyrule Castle"],
        "Royal Guard Boots", 3, 7, 10, ["Hyrule Castle"]);
    addArmorSet("Zora", 3, 8, ["Lanayru"],
        "Zora Helm", 1, 5, 8, ["Lanayru"],
        "Zora Armor", null, 4, 7, ["Lanayru"], // part of main quest
        "Zora Greaves", 2, 6, 9, ["Lanayru"]);

    // depths chests
    addArmorSet("Miner's", 6, 11, ["Depths"],
        "Miner's Mask", 3, 7, 10, ["Depths"],
        "Miner's Top", 1, 5, 8, ["Depths"],
        "Miner's Trousers", 2, 6, 9, ["Depths"]);
    addArmorSet("Hero", 9, 19, ["Depths"],
        "Cap of the Hero", 3, 8, 12, ["Depths"],
        "Tunic of the Hero", 3, 8, 12, ["Depths"],
        "Trousers of the Hero", 3, 8, 12, ["Depths"]);
    addArmorSet("Hero of the Sky", 9, 19, ["Depths"],
        "Cap of the Sky", 3, 8, 12, ["Depths"],
        "Tunic of the Sky", 3, 8, 12, ["Depths"],
        "Trousers of the Sky", 3, 8, 12, ["Depths"]);
    addArmorSet("Hero of the Wild", 12, 22, ["Depths"],
        "Cap of the Wild", 4, 9, 13, ["Depths"],
        "Tunic of the Wild", 4, 9, 13, ["Depths"],
        "Trousers of the Wild", 4, 9, 13, ["Depths"]);
    addArmorSet("Hero of the Wind", 11, 21, ["Depths"],
        "Cap of the Wind", 4, 9, 13, ["Depths"],
        "Tunic of the Wind", 3, 8, 12, ["Depths"],
        "Trousers of the Wind", 4, 9, 13, ["Depths"]);
    addArmorSet("Hero of Time", 9, 19, ["Depths"],
        "Cap of Time", 3, 8, 12, ["Depths"],
        "Tunic of Time", 3, 8, 12, ["Depths"],
        "Trousers of Time", 3, 8, 12, ["Depths"]);
    addArmorSet("Hero of Twilight", 9, 19, ["Depths"],
        "Cap of Twilight", 3, 8, 12, ["Depths"],
        "Tunic of Twilight", 3, 8, 12, ["Depths"],
        "Trousers of Twilight", 3, 8, 12, ["Depths"]);

    // purchase
    addArmorSet("Hylian", 5, 10, ["Rupees", "Hyrule Field"],
        "Hylian Hood", 1, 5, 8, ["Rupees", "Hyrule Field"],
        "Hylian Tunic", 2, 6, 9, ["Rupees", "Hyrule Field"],
        "Hylian Trousers", 2, 6, 9, ["Rupees", "Hyrule Field"]);
    addArmorSet("Stealth", 13, 18, ["Rupees", "West Necluda"],
        "Stealth Mask", 4, 8, 11, ["Rupees", "West Necluda"],
        "Stealth Chest Guard", 4, 8, 11, ["Rupees", "West Necluda"],
        "Stealth Tights", 5, 9, 12, ["Rupees", "West Necluda"]);
    addArmorSet("Radiant", 15, 20, ["Rupees", "West Necluda"],
        "Radiant Mask", 5, 9, 12, ["Rupees", "West Necluda"],
        "Radiant Shirt", 5, 9, 12, ["Rupees", "West Necluda"],
        "Radiant Tights", 5, 9, 12, ["Rupees", "West Necluda"]);
    addArmorSet("Snowquill", 15, 20, ["Rupees", "Tabantha Frontier"],
        "Snowquill Headdress", 4, 8, 11, ["Rupees", "Tabantha Frontier"],
        "Snowquill Tunic", 4, 8, 11, ["Rupees", "Tabantha Frontier"],
        "Snowquill Trousers", 7, 11, 14, ["Rupees", "Tabantha Frontier"]);
    addArmorSet("Flamebreaker", 17, 22, ["Rupees", "Eldin"],
        "Flamebreaker Helm", 8, 12, 15, ["Rupees", "Eldin"],
        "Flamebreaker Armor", 4, 8, 11, ["Rupees", "Eldin"],
        "Flamebreaker Boots", 7, 11, 14, ["Rupees", "Eldin"]);
    addArmorSet("Desert Voe", 17, 22, ["Rupees", "Gerudo Desert"],
        "Desert Voe Headband", 4, 8, 11, ["Rupees", "Gerudo Desert"],
        "Desert Voe Spaulder", 7, 11, 14, ["Rupees", "Gerudo Desert"],
        "Desert Voe Trousers", 7, 11, 14, ["Rupees", "Gerudo Desert"]);
    addArmorSet("Dark", 15, null, ["Depths"], // 5 bargainer statues + 650 poes + 1 great fairy + 30 rupees + materials (TBD)
        "Dark Hood", 8, null, null, ["Depths"], // 5 bargainer statues + 300 poes
        "Dark Tunic", 4, null, null, ["Depths"], // 1 bargainer statue + 150 poes
        "Dark Trousers", 6, null, null, ["Depths"]); // 3 bargainer statues + 200 poes
    addArmorSet("Depths", 16, 21, ["Depths"], // 6 bargainer statues + 650 poes + 1 great fairy + 30 rupees + materials (TBD)
        "Hood of the Depths", 9, 13, 18, ["Depths"], // 6 bargainer statues + 300 poes
        "Tunic of the Depths", 5, 9, 14, ["Depths"], // 2 bargainer statues + 150 poes
        "Gaiters of the Depths", 7, 11, 16, ["Depths"]); // 4 bargainer statues + 200 poes
    addArmorSet("Mystic", 24, null, ["Side Quest", "Bubbul Gems"], // find koltin side quest + 46 bubbul gems
        "Mystic Headpiece", 24, null, null, ["Side Quest", "Bubbul Gems"], // find koltin side quest + 46 bubbul gems
        "Mystic Robe", 8, null, null, ["Side Quest", "Bubbul Gems"], // find koltin side quest + 8 bubbul gems
        "Mystic Trousers", 16, null, null, ["Side Quest", "Bubbul Gems"]); // find koltin side quest + 21 bubbul gems

    // quests
    addArmorSet("Tingle", 15, null, ["Side Quest"],
        "Tingle's Hood", 5, null, null, ["Side Quest"],
        "Tingle's Shirt", 5, null, null, ["Side Quest"],
        "Tingle's Tights", 5, null, null, ["Side Quest"]);
    addArmorSet("Hero of Awakening", 15, 22, ["Side Quest"], // upgrades require Star Fragments
        "Mask of Awakening", 5, 10, 14, ["Side Quest"],
        "Tunic of Awakening", 5, 10, 14, ["Side Quest"],
        "Trousers of Awakening", 5, 10, 14, ["Side Quest"]);
    addArmorSet("Evil Spirit", 18, null, ["Side Quest"], // 3 side quests
        "Evil Spirit Mask", 6, null, null, ["Side Quest"], // side quest
        "Evil Spirit Armor", 6, null, null, ["Side Quest"], // side quest
        "Evil Spirit Greaves", 6, null, null, ["Side Quest"]); // side quest
    addArmorSet("Yiga", 15, 20, ["Side Adventure"],
        "Yiga Mask", 5, 9, 12, ["Side Adventure"],
        "Yiga Armor", 5, 9, 12, ["Side Adventure"],
        "Yiga Tights", 5, 9, 12, ["Side Adventure"]);
    addArmorSet("Froggy", 18, 23, ["Side Adventure"], // all 12 Penn side adventures
        "Froggy Hood", 18, 21, 24, ["Side Adventure"], // all 12 Penn side adventures
        "Froggy Sleeve", 8, 12, 15, ["Side Adventure"], // 4 Penn side adventures
        "Froggy Leggings", 13, 17, 20, ["Side Adventure"]); // 9 Penn side adventures
    addArmorSet("Glide", 15, 20, ["Sky", "Shrine"],
        "Glide Mask", 5, 9, 12, ["Sky", "Shrine"],
        "Glide Shirt", 5, 9, 12, ["Sky", "Shrine"],
        "Glide Tights", 5, 9, 12, ["Sky", "Shrine"]);

    // purchase
    addArmor("Amber Earrings", 3, 7, 12, "Gerudo Desert", "Rupees");
    addArmor("Opal Earrings", 5, 9, 14);
    addArmor("Topaz Earrings", 7, 11, 16);
    addArmor("Ruby Circlet", 7, 11, 16);
    addArmor("Sapphire Circlet", 8, 12, 17);
    addArmor("Diamond Circlet", 12, 16, 21);
    addArmor("Sand Boots", 8, 12, 16);
    addArmor("Snow Boots", 8, 12, 16);

    // Bubbul gems
    addArmor("Bokoblin Mask", 3, null, null, "Bubbul Gems", "Side Quest"); // 1 bubbul gem?
    addArmor("Moblin Mask", 4, null, null, "Bubbul Gems", "Side Quest"); // 2 bubbul gems
    addArmor("Lizalfos Mask", 12, null, null, "Bubbul Gems", "Side Quest"); // 14 bubbul gems
    addArmor("Horriblin Mask", 20, null, null, "Bubbul Gems", "Side Quest"); // 29 bubbul gems
    addArmor("Lynel Mask", 22, null, null, "Bubbul Gems", "Side Quest"); // 37 bubbul gems

    // Quests
    addArmor("Cece Hat", 10, null, null, "Hateno", "East Necluda", "Side Adventure"); // The Mayoral Election Side Adventure
    addArmor("Lightning Helm", 18, null, null, "Gerudo Desert", "Side Adventure", "Yiga Set");

    // Coliseums
    addArmor("Korok Mask", 7, null, null, "Woodland", "Depths");
    addArmor("Majora's Mask", 16, null, null, "Hyrule Field", "Depths");
    addArmor("Midna's Helmet", 8, null, null, "East Necluda", "Depths");
    addArmor("Ravio's Hood", 7, null, null, "West Necluda", "Depths");
    addArmor("Sheik's Mask", 7, 12, 16); // star fragments
    addArmor("Zant's Helmet", 7, null, null);

    // Chests
    addArmor("Archaic Tunic", 1, null, null, "Sky");
    addArmor("Archaic Legwear", 1, null, null, "Sky");
    addArmor("Well-Worn Hair Band", 3, null, null, "Hateno", "East Necluda");
    addArmor("Vah Medoh Divine Helm", 7, 11, 15, "Hebra");
    addArmor("Vah Naboris Divine Helm", 7, 11, 15, "Gerudo Desert");
    addArmor("Vah Rudania Divine Helm", 5, 10, 14, "Eldin");
    addArmor("Vah Ruta Divine Helm", 5, 9, 13, "Lanayru");
    addArmor("Champion's Leathers", 3, 8, 13, "Hyrule Castle");
    addArmor("Island Lobster Shirt", 4, null, null, "East Necluda");
    addArmor("Tunic of Memories", 12, 17, 22);
    addArmor("Archaic Warm Greaves", 1, null, null);

    // Bosses
    tasks[1].push(task("Defeat a Stone Talus", "Boss"));
    tasks[2].push(task("Defeat a Battle Talus", "Boss"));
    tasks[3].push(task("Defeat a Stone Talus (Luminous)", "Boss"));
    tasks[4].push(task("Defeat a Stone Talus (Rare)", "Boss"));
    tasks[4].push(task("Defeat an Igneo Talus", "Boss"));
    tasks[4].push(task("Defeat a Frost Talus", "Boss"));
    tasks[2].push(task("Defeat a Hinox", "Boss"));
    tasks[3].push(task("Defeat a Blue Hinox", "Boss"));
    tasks[4].push(task("Defeat a Black Hinox", "Boss"));
    tasks[4].push(task("Defeat a Stalnox", "Boss"));
    tasks[2].push(task("Defeat a Flux Construct I", "Boss"));
    tasks[3].push(task("Defeat a Flux Construct II", "Boss"));
    tasks[4].push(task("Defeat a Flux Construct III", "Boss"));
    tasks[2].push(task("Defeat a Frox", "Boss"));
    tasks[4].push(task("Defeat an Obsidian Frox", "Boss"));
    tasks[6].push(task("Defeat a Blue-White Frox", "Boss"));
    tasks[5].push(task("Defeat a Molduga", "Boss"));
    tasks[4].push(task("Defeat a Lynel", "Boss"));
    tasks[5].push(task("Defeat a Blue Lynel", "Boss"));
    tasks[7].push(task("Defeat a White-Maned Lynel", "Boss"));
    tasks[8].push(task("Defeat a Silver Lynel", "Boss"));
    tasks[6].push(task("Defeat any armored Lynel", "Boss"));
    tasks[8].push(task("Defeat a Flame Gleeok", "Boss"));
    tasks[8].push(task("Defeat a Thunder Gleeok", "Boss"));
    tasks[8].push(task("Defeat a Frost Gleeok", "Boss"));
    tasks[10].push(task("Defeat a King Gleeok"));

    // Main Quests
    /*
    tasks[24].push(task("The Dragon's Tears", "Main Quest"));
    tasks[19].push(task("Recovering the Hero's Sword", "Main Quest", "Shrine"));
    tasks[13].push(task("Trail of the Master Sword", "Main Quest", "Woodland", "Depths"));
    tasks[9].push(task("A Mystery in the Depths", "Main Quest", "Depths", "Hyrule Field"));
    tasks[8].push(task("Impa and the Geoglyphs", "Main Quest"));
    tasks[4].push(task("Camera Work in the Depths", "Main Quest"));
    */

    // Side Adventures
    function sa(name, ...types) {
        return task(name, "Side Adventure", ...types);
    }
    tasks[2].push(sa("Hateno Village Research Lab", "East Necluda", "Hateno")); // TODO difficulty assumes A Mystery in the Depths is required
    //tasks[TODO].push(sa("Filling Out the Compendium", "East Necluda", "Hateno")); // TODO difficulty assumes A Mystery in the Depths is required
    tasks[11].push(sa("Presenting: The Travel Medallion!", "")); // A Mystery in the Depths (Main Quest) + Hateno Village Research Lab (Side Adventure) + 5 Towers
    tasks[17].push(sa("Presenting: Hero's Path Mode!", "East Necluda", "Hateno")); // A Mystery in the Depths (Main Quest) + Hateno Village Research Lab (Side Adventure) + 15 Shrines
    tasks[6].push(sa("Presenting: Sensor +!", "East Necluda", "Hateno", "Camera")); // A Mystery in the Depths (Main Quest) + Hateno Village Research Lab (Side Adventure) + 5 compendium entries
    tasks[6].push(sa("Mattison's Independence", "Akkala")); // 10 Sundelions and a bunch of talking
    tasks[2].push(sa("A Letter to Koyin", "East Necluda", "Hateno"));
    tasks[4].push(sa("A New Signature Food", "East Necluda", "Hateno")); // A Letter to Koyin (Side Adventure) + start Team Cece or Team Reede? Side Adventure
    tasks[5].push(sa("Reede's Secret", "East Necluda", "Hateno")); // start Team Cece or Team Reede? Side Adventure
    tasks[5].push(sa("Cece's Secret", "East Necluda", "Hateno")); // start Team Cece or Team Reede? Side Adventure
    tasks[7].push(sa("Team Cece or Team Reede?", "East Necluda", "Hateno"));
    tasks[17].push(sa("The Mayoral Election", "East Necluda", "Hateno"));
    tasks[7].push(sa("Ruffian-Infested Village", "East Necluda", "Lurelin"));
    tasks[12].push(sa("Lurelin Village Restoration Project", "East Necluda", "Lurelin"));
    tasks[24].push(sa("Potential Princess Sightings!"));
    tasks[9].push(sa("The Beckoning Woman", "Hyrule Field"));
    tasks[7].push(sa("Gourmets Gone Missing", "Hyrule Field"));
    tasks[6].push(sa("The Beast and the Princess", "Faron"));
    tasks[6].push(sa("Zelda's Golden Horse", "Hebra"));
    tasks[6].push(sa("White Goats Gone Missing", "Hyrule Ridge"));
    tasks[8].push(sa("For Our Princess!", "Eldin"));
    tasks[7].push(sa("The All-Clucking Cucco", "Akkala"));
    tasks[8].push(sa("The Missing Farm Tools", "Hyrule Field"));
    tasks[6].push(sa("Princess Zelda Kidnapped?!", "West Necluda"));
    tasks[7].push(sa("An Eerie Voice", "Faron"));
    tasks[7].push(sa("The Blocked Well", "Gerudo Desert"));
    tasks[8].push(sa("2 Lucky CLover Gazette Side Adventures"));
    tasks[10].push(sa("3 Lucky CLover Gazette Side Adventures"));
    tasks[12].push(sa("4 Lucky CLover Gazette Side Adventures"));
    tasks[14].push(sa("5 Lucky CLover Gazette Side Adventures"));
    tasks[16].push(sa("6 Lucky CLover Gazette Side Adventures"));
    tasks[7].push(sa("The Flute Player's Plan", "Faron")); // 10 fireflies, go at night
    tasks[5].push(sa("Honey, Bee Mine", "West Necluda")); // 3 honey
    tasks[6].push(sa("The Hornist's Dramatic Escape", "Tabantha Frontier"));
    tasks[8].push(sa("Serenade to a Great Fairy", "Woodland"));
    tasks[8].push(sa("Serenade to Kaysa", "West Necluda"));
    tasks[8].push(sa("Serenade to Cotera", "Tabantha Frontier", "Hebra"));
    tasks[8].push(sa("Serenade to Mija", "Faron", "Hyrule Field"));
    tasks[4].push(sa("Bring Peace to Hyrule Field!", "Hyrule Field"));
    tasks[4].push(sa("Bring Peace to Necluda!", "West Necluda"));
    tasks[4].push(sa("Bring Peace to Eldin!", "Eldin"));
    tasks[4].push(sa("Bring Peace to Akkala!", "Akkala"));
    tasks[4].push(sa("Bring Peace to Faron!", "Faron"));
    tasks[4].push(sa("Bring Peace to Hebra!", "Hebra"));
    tasks[1].push(sa("Hestu's Concerns"));
    tasks[2].push(sa("The Hunt for Bubbul Gems", "Woodland"));
    tasks[4].push(sa("The Search for Koltin")); // The Hunt for Bubbul Gems
    tasks[13].push(sa("A Monstrous Collection I", "Akkala", "Camera")); // The Hunt for Bubbul Gems + The Search for Koltin + Mattison's Independence + Camera + bokoblin
    tasks[14].push(sa("A Monstrous Collection II", "Akkala", "Camera")); // horriblin
    tasks[15].push(sa("A Monstrous Collection III", "Akkala", "Camera")); // battle talus
    tasks[17].push(sa("A Monstrous Collection IV", "Akkala", "Camera")); // frox
    tasks[19].push(sa("A Monstrous Collection V", "Akkala", "Camera")); // king gleeok
    tasks[9].push(sa("Investigate the Thyphlo Ruins", "Woodland")); // difficulty assumes all dungeons are required
    tasks[2].push(sa("The Owl Protected by Dragons", "Woodland"));
    tasks[2].push(sa("The Corridor between Two Dragons", "Woodland"));
    tasks[2].push(sa("The Six Dragons", "Woodland"));
    tasks[2].push(sa("The Long Dragon", "Woodland"));
    tasks[6].push(sa("Legend of the Great Sky Island", "Sky")); // requires zora armor, difficulty assumes this is already done
    tasks[18].push(sa("Messages from an Ancient Era", "Sky", "Camera"));
    tasks[4].push(sa("2 Zonai Reliefs", "Sky", "Camera"));
    tasks[6].push(sa("3 Zonai Reliefs", "Sky", "Camera"));
    tasks[8].push(sa("4 Zonai Reliefs", "Sky", "Camera"));
    tasks[10].push(sa("5 Zonai Reliefs", "Sky", "Camera"));
    tasks[12].push(sa("6 Zonai Reliefs", "Sky", "Camera"));
    tasks[2].push(sa("A Deal With the Statue", "Hyrule Field")); // requires one dungeon, difficulty assumes this is done
    tasks[2].push(sa("Who Goes There?", "Hyrule Field"));
    tasks[10].push(sa("A Call from the Depths", "Great Plateau", "Depths"));
    tasks[16].push(sa("Infiltrating the Yiga Clan", "Gerudo Desert"));
    tasks[19].push(sa("The Yiga Clan Exam", "Gerudo Desert"));
    tasks[22].push(sa("Master Kohga of the Yiga Clan", "Depths")); // requires one dungeon, difficulty assumes this is done

    // Shrine Quests
    function shq(name, ...types) {
        return task(name, "Shrine Quest", "Shrine", ...types);
    }
    tasks[2].push(shq("A Pretty Stone and Five Golden Apples"));
    tasks[2].push(shq("Dyeing to Find It"));
    tasks[2].push(shq("Keys Born of Water"));
    tasks[2].push(shq("Legend of the Soaring Spear"));
    tasks[2].push(shq("Maca's Special Place"));
    tasks[2].push(shq("None Shall Pass"));
    tasks[2].push(shq("Ride the Giant Horse"));
    tasks[2].push(shq("Rock For Sale"));
    tasks[2].push(shq("The Death Caldera Crystal"));
    tasks[2].push(shq("The East Hebra Sky Crystal"));
    tasks[2].push(shq("The Gerudo Canyon Crystal"));
    tasks[2].push(shq("The Gisa Crater Crystal"));
    tasks[2].push(shq("The High Spring and the Light Rings"));
    tasks[2].push(shq("The Lake Hylia Crystal"));
    tasks[2].push(shq("The Lake Intenoch Cave Crystal"));
    tasks[2].push(shq("The Lanayru Road Crystal"));
    tasks[2].push(shq("The Necluda Sky Crystal"));
    tasks[2].push(shq("The North Hebra Mountains Crystal"));
    tasks[2].push(shq("The North Hyrule Sky Crystal"));
    tasks[2].push(shq("The North Necluda Sky Crystal"));
    tasks[2].push(shq("The Northwest Hebra Cave Crystal"));
    tasks[2].push(shq("The Oakle's Navel Cave Crystal"));
    tasks[2].push(shq("The Ralis Channel Crystal"));
    tasks[2].push(shq("The Satori Mountain Crystal"));
    tasks[2].push(shq("The Sky Mine Crystal"));
    tasks[2].push(shq("The Sokkala Sky Crystal"));
    tasks[2].push(shq("The South Hyrule Sky Crystal"));
    tasks[2].push(shq("The South Lanayru Sky Crystal"));
    tasks[2].push(shq("The Tabantha Sky Crystal"));
    tasks[2].push(shq("The West Necluda Sky Crystal"));
    tasks[2].push(shq("The White Bird's Guidance"));
    tasks[5].push(shq("3 Shrine Quests"));
    tasks[10].push(shq("6 Shrine Quests"));
    tasks[15].push(shq("9 Shrine Quests"));
    tasks[20].push(shq("12 Shrine Quests"));

    // Side Quests
    function sq(name, ...types) {
        return task(name, "Side Quest", ...types);
    }
    tasks[3].push(sq("Spotting Spot", "Hyrule Field"));
    tasks[4].push(sq("Village Attacked by Pirates", "Hyrule Field", "East Necluda"));
    tasks[3].push(sq("Today's Menu", "Hyrule Field"));
    tasks[3].push(sq("The Incomplete Stable", "Hyrule Field"));
    tasks[6].push(sq("WANTED: Stone Talus", "Hyrule Field")); // requires Bring Peace to Hyrule Field
    tasks[8].push(sq("WANTED: Molduga", "Hyrule Field")); // requires Bring Peace to Hyrule Field
    tasks[7].push(sq("WANTED: Hinox", "Hyrule Field")); // requires Bring Peace to Hyrule Field
    tasks[7].push(sq("Unknown Sky Giant", "Hyrule Field")); // requires Bring Peace to Hyrule Field
    tasks[10].push(sq("Unknown Three-Headed Monster", "Hyrule Field")); // requires Bring Peace to Hyrule Field
    tasks[7].push(sq("Unknown Huge Silhouette", "Hyrule Field")); // requires Bring Peace to Hyrule Field
    tasks[5].push(sq("The Horse Guard's Request", "Hyrule Field")); // gather horses
    tasks[4].push(sq("A Picture for Outskirt Stable", "Hyrule Field", "Camera")); // cherry blossom
    tasks[3].push(sq("Feathered Fugitives", "Hyrule Field")); // collect cuccos
    tasks[4].push(sq("A Picture for Riverside Stable", "Hyrule Field", "Camera")); // goddess statue
    tasks[3].push(sq("Horse-Drawn Dreams", "Hyrule Ridge")); // repair wagon and catch a horse
    tasks[3].push(sq("A Picture for New Serenne Stable", "Hyrule Ridge", "Camera")); // Geoglyph
    tasks[3].push(sq("Genli's Home Cooking", "Tabantha Frontier")); // Staminoka Bass
    tasks[7].push(sq("Treasure of the Secret Springs", "Hebra")); // vah medoh divine helm
    tasks[2].push(sq("Molli the Fletcher's Quest", "Tabantha Frontier")); // ice fruits?
    tasks[7].push(sq("Legacy of the Rito", "Tabantha Frontier")); // swallow bow, 5 wood bundles, 3 diamonds
    tasks[3].push(sq("Fish for Fletching", "Tabantha Frontier")); // trade for arrows
    tasks[4].push(sq("The Rito Rope Bridge", "Tabantha Frontier")); // wood
    tasks[3].push(sq("A Picture for Tabantha Bridge Stable", "Tabantha Frontier", "Camera")); // Ancient Columns
    tasks[4].push(sq("A Picture for Snowfield Stable", "Hebra", "Camera")); // snow bird
    tasks[2].push(sq("Crossing the Cold Pool", "Hebra")); // 10 chillshrooms
    tasks[1].push(sq("Open the Door", "Hebra")); // defeat monsters outside cabin
    tasks[1].push(sq("Supply-Eyeing Fliers", "Tabantha Frontier")); // defeat monsters
    tasks[1].push(sq("The Blocked Cave", "Hebra")); // break rocks
    tasks[4].push(sq("The Duchess Who Disappeared", "Hebra")); // ?
    tasks[3].push(sq("Kaneli's Flight Training", "Hebra")); // minigame
    tasks[2].push(sq("Cave Mushrooms That Glow", "Tabantha Frontier")); // 10 brightcaps
    tasks[3].push(sq("The Captured Tent", "Hebra")); // defeat monsters, requires Cave Mushrooms that Glow
    tasks[6].push(sq("Who Finds the Haven?", "Hebra")); // explore Sturnida Springs Cave, requires The Captured Tent
    tasks[3].push(sq("Whirly Swirly Things", "Camera")); // pics of whirlpool and sand spiral, requires korok main quest, difficulty assumes it is done
    tasks[2].push(sq("The Secret Room", "Woodland")); // requires korok main quest, difficulty assumes it is done
    tasks[3].push(sq("Walton's Treasure Hunt", "Woodland")); // find the korok weapons, requires korok main quest, difficulty assumes it is done
    tasks[4].push(sq("Amber Dealer", "Eldin")); // 10 amber
    tasks[2].push(sq("The Ancient City Gorondia!", "Eldin"));
    tasks[2].push(sq("The Ancient City Gorondia?", "Eldin"));
    tasks[7].push(sq("Soul of the Gorons", "Eldin")); // cobble crusher, 5 flint, 3 diamonds
    tasks[4].push(sq("Moon-Gazing Gorons", "Eldin", "Camera")); // pic of moon cave
    tasks[5].push(sq("The Hidden Treasure at Lizard Lakes", "Eldin")); // vah rudania helm
    tasks[2].push(sq("Simmerstone Springs", "Eldin")); // break into cave
    tasks[6].push(sq("Cash In on Ripened Flint", "Eldin")); // rng
    tasks[3].push(sq("Meat for Meat", "Eldin")); // rock roast in cave
    tasks[4].push(sq("Rock Roast or Dust", "Eldin")); // requires Meat for Meat
    tasks[3].push(sq("Mine-Cart Land: Open for Business!", "Eldin"));
    tasks[4].push(sq("Mine-Cart Land: Quickshot Course", "Eldin"));
    tasks[6].push(sq("Mine-Cart Land: Death Mountain", "Eldin"));
    tasks[4].push(sq("A Picture for Woodland Stable", "Woodland", "Camera")); // goron in hot spring
    tasks[4].push(sq("A Picture for Foothill Stable", "Eldin", "Camera")); // daruk sculpture
    tasks[2].push(sq("Fell into a Well!", "Hyrule Field")); // fix ladder
    tasks[3].push(sq("The Abandoned Laborer", "Eldin")); // launch goron out of cave
    tasks[1].push(sq("The Treasure Hunters", "Woodland")); // get chest from bog
    tasks[3].push(sq("Misko's Cave of Chests", "Eldin")); // use dog to find the right chest
    tasks[10].push(sq("Misko's Treasure: The Fierce Deity")); // fierce deity set
    tasks[6].push(sq("Misko's Treasure: Twins Manuscript", "West Necluda")); // find tingle armor
    tasks[6].push(sq("Misko's Treasure: Pirate Manuscript", "East Necluda")); // find tingle armor
    tasks[6].push(sq("Misko's Treasure: Heroines Manuscript", "Gerudo Highlands")); // find tingle armor
    tasks[6].push(sq("Misko's Treasure of Awakening I", "Tabantha Frontier")); // ancient columns
    tasks[6].push(sq("Misko's Treasure of Awakening II", "Hyrule Field"));
    tasks[6].push(sq("Misko's Treasure of Awakening III", "Hyrule Ridge"));
    tasks[5].push(sq("The Tarrey Town Race Is On!", "Akkala"));
    tasks[1].push(sq("Secrets Within", "Akkala"));
    tasks[3].push(sq("Master the Vehicle Prototype", "Akkala"));
    tasks[12].push(sq("Home on Arrange", "Akkala", "Rupees")); // start building home, requires mattison side adventure + 1500 rupees
    tasks[5].push(sq("Strongest in the World", "Akkala")); // lynel horn
    tasks[6].push(sq("The Gathering Pirates", "Akkala")); // akkala pirates
    tasks[4].push(sq("A Picture for East Akkala Stable", "Akkala", "Camera")); // octorok lake
    tasks[3].push(sq("Eldin's Colossal Fossil", "Eldin"));
    tasks[3].push(sq("Hebra's Colossal Fossil", "Hebra"));
    tasks[3].push(sq("Gerudo's Colossal Fossil", "Gerudo Desert"));
    tasks[1].push(sq("One-Hit Wonder!", "Akkala")); // break ore deposit
    tasks[4].push(sq("A Picture for South Akkala Stable", "Akkala", "Camera")); // Unity Bell in Tarrey Town
    tasks[4].push(sq("True Treasure", "Lanayru")); // escort on raft
    tasks[6].push(sq("Secret Treasure Under the Great Fish", "Lanayru")); // vah ruta helm
    tasks[2].push(sq("The Never-Ending Lecture", "Lanayru")); // zora helm
    tasks[3].push(sq("The Moonlit Princess", "Lanayru", "Camera")); // pic of mipha statue under the moonlight
    tasks[3].push(sq("The Fort at Ja'Abu Ridge", "Lanayru")); // defeat monsters
    tasks[7].push(sq("Glory of the Zora", "Lanayru")); // zora spear, 5 flint, 3 diamonds
    tasks[2].push(sq("A Crabulous Deal", "Lanayru")); // 10 bright-eyed crabs
    tasks[3].push(sq("A Wife Wafted Away", "Lanayru")); // talk to Mei on Wellspring Island
    tasks[3].push(sq("A Token of Friendship", "Lanayru")); // zora greaves
    tasks[4].push(sq("A Picture for Wetland Stable", "Hyrule Field", "Camera")); // ring ruins
    tasks[2].push(sq("An Uninvited Guest", "Hyrule Field")); // defeat monsters
    tasks[3].push(sq("The Blue Stone", "Lanayru")); // bring a blue stone (not fused)
    tasks[2].push(sq("The Ultimate Dish?", "West Necluda")); // dubious food
    tasks[1].push(sq("Mired in Muck", "Lanayru")); // clean muck
    tasks[2].push(sq("Out of the Inn", "West Necluda")); // find owner
    tasks[2].push(sq("Follow the Cuccos", "West Necluda")); // 10 eggs
    tasks[4].push(sq("A Trip through History", "West Necluda")); // read 4 ring ruins slabs
    tasks[2].push(sq("Codgers' Quarrel", "West Necluda")); // defeat monsters
    tasks[2].push(sq("Gloom-Borne Illness", "West Necluda")); // sunny veggie porrige
    tasks[4].push(sq("A New Champion's Tunic", "East Necluda", "Hateno", "Hyrule Castle")); // champion's leathers
    tasks[4].push(sq("Teach Me a Lesson I", "East Necluda", "Hateno", "Camera")); // pic of calamity
    tasks[5].push(sq("Teach Me a Lesson II", "East Necluda", "Hateno")); // monster curry
    tasks[2].push(sq("Dantz's Prize Cows", "East Necluda", "Hateno")); // 3 acorns
    tasks[19].push(sq("Homegrown in Hateno", "East Necluda", "Hateno")); // requires The Mayoral Election
    tasks[2].push(sq("Photographing a Chuchu", "East Necluda", "Hateno", "Camera"));
    tasks[7].push(sq("Uma's Garden", "East Necluda", "Hateno")); // requires Teach Me a Lesson II
    tasks[4].push(sq("Manny's Beloved", "East Necluda", "Hateno")); // 10 hot-footed frogs
    tasks[18].push(sq("Lurelin Resort Project", "East Necluda", "Lurelin")); // requires Lurelin Village Restoration Project + The Tarrey Town Race is On!
    tasks[14].push(sq("Dad's Blue Shirt", "East Necluda", "Lurelin")); // find islander shirt, requires Lurelin Village Restoration Project
    tasks[15].push(sq("A Way to Trade, Washed Away", "East Necluda", "Lurelin")); // bring boat, requires Lurelin Village Restoration Project
    tasks[14].push(sq("Rattled Ralera", "East Necluda", "Lurelin", "Hateno")); // requires Lurelin Village Restoration Project
    tasks[4].push(sq("A Picture for Dueling Peaks Stable", "West Necluda", "East Necluda")); // sunrise
    tasks[3].push(sq("A Bottled Cry for Help", "East Necluda")); // rescue from cave
    tasks[8].push(sq("Seeking the Pirate Hideout", "East Necluda")); // eventide
    tasks[7].push(sq("Ousting The Giants", "East Necluda")); // 3 hinoxes
    tasks[4].push(sq("A Picture for Lakeside Stable", "Faron", "Camera")); // floria falls
    tasks[4].push(sq("A Picture for Highland Stable", "Faron", "Camera")); // giant white stallion
    tasks[5].push(sq("The Heroines' Secret", "Gerudo Desert", "Camera")); // 4 stellae
    tasks[7].push(sq("Treasure of the Gerudo Desert", "Gerudo Desert")); // vah naboris helm
    tasks[10].push(sq("Pride of the Gerudo", "Gerudo Desert")); // scimitar, shield, 10 flint, 4 diamonds
    tasks[3].push(sq("Dalia's Game", "Gerudo Desert")); // find sand seal plush
    tasks[15].push(sq("The Mysterious Eighth", "Gerudo Desert")); // requires heroines' Secret, Dalia's Game, Lost in the Dunes
    tasks[5].push(sq("The Missing Owner", "Gerudo Desert")); // molduga
    tasks[4].push(sq("To the Ruins!", "Gerudo Desert")); // take Pokki to east gerudo ruins (heroine statues)
    tasks[3].push(sq("Decorate with Passion", "Gerudo Desert")); // radiant weapon
    tasks[3].push(sq("Lost in the Dunes", "Gerudo Desert")); // rescue Ponthos
    tasks[3].push(sq("A Picture for Closed Stable I", "Gerudo Canyon", "Camera")); // spectacle rock smiling
    tasks[3].push(sq("A Picture for Closed Stable II", "Gerudo Canyon", "Camera")); // forgotten sword
    tasks[1].push(sq("Piaffe, Packed Away", "Gerudo Canyon")); // break crates
    tasks[10].push(sq("Gleeok Guts", "Gerudo Canyon")); // king gleeok
    tasks[5].push(sq("Disaster in Gerudo Canyon", "Gerudo Canyon")); // find lost travelers
    tasks[2].push(sq("The Great Tumbleweed Purge", "Gerudo Canyon")); // clean tumbleweeds
    tasks[6].push(sq("Heat-Endurance Contest!", "Gerudo Canyon")); // wait
    tasks[4].push(sq("Cold-Endurance Contest!", "Gerudo Canyon")); // wait
    tasks[3].push(sq("The Icelesss Icehouse", "Gerudo Desert")); // make ice
//    tasks[24].push(sq("Where Are the Wells?")); // all 58 wells
    tasks[1].push(sq("Ancient Blades Below", "Depths")); // after spirit temple, trade zonaite for ancient blade
    tasks[6].push(sq("The North Lomei Prophecy"));
    tasks[6].push(sq("The Lomei Labyrinth Island Prophecy"));
    tasks[6].push(sq("The South Lomei Prophecy"));
    tasks[5].push(sq("Goddess Statue of Wisdom")); // offer naydra's claw
    tasks[5].push(sq("Goddess Statue of Power")); // offer dinraal's claw
    tasks[5].push(sq("Goddess Statue of Courage")); // offer farosh's claw
    tasks[12].push(sq("The Mother Goddess Statue")); // requires above three
//    tasks[24].push(sq("The Shrine Explorer")); // all 152 shrines

    // Meals
    // Stamina Vessels, Heart Containers (these are awkward IMO)
    // Dyed gear
    // Any piece of gear set
    // Minigames
    // Reach a certain height
    // Defeat a boss using only Zonai devices
    // Read a Zonai Relief aloud

    return tasks;
}

function getTasksBotw() {
    return [
        // 0
        [
            {
                "name": "Hylian Hood",
                "types": [
                    "Clothes",
                    "Hylian Gear",
                    "Rupee"
                ]
            },
            {
                "name": "Hylian Tunic",
                "types": [
                    "Clothes",
                    "Hylian Gear",
                    "Rupee",
                    "Rupee"
                ]
            },
            {
                "name": "Warm Doublet",
                "types": [
                    "Clothes",
                    "Cold Resistance",
                    "Hateno"
                ]
            },
            {
                "name": "3 Great Plateau Koroks",
                "types": [
                    "Korok",
                    "Plateau"
                ]
            },
            {
                "name": "Hylian Trousers",
                "types": [
                    "Clothes",
                    "Hylian Gear",
                    "Rupee"
                ]
            },
            {
                "name": "Any 'Boko' Equipment item",
                "types": [
                    "Equipment"
                ]
            },
            {
                "name": "3 Dueling Peaks Koroks",
                "types": [
                    "Korok",
                    "Dueling Peaks"
                ]
            },
            {
                "name": "3 Central Tower Koroks",
                "types": [
                    "Korok",
                    "Central Hyrule"
                ]
            }
        ],
        // 1
        [
            {
                "name": "5 Koroks",
                "types": [
                    "Korok"
                ]
            },
            {
                "name": "3 Hateno Koroks",
                "types": [
                    "Korok",
                    "Hateno"
                ]
            },
            {
                "name": "3 Faron Koroks",
                "types": [
                    "Korok",
                    "Faron"
                ]
            },
            {
                "name": "3 Ridgeland Koroks",
                "types": [
                    "Korok",
                    "Ridgeland"
                ]
            },
            {
                "name": "Any 'Rusty' Equipment item",
                "types": [
                    "Equipment"
                ]
            },
            {
                "name": "Any Energizing meal",
                "types": [
                    "Cooking",
                    "Stamina"
                ]
            },
            {
                "name": "Give Beedle a Beetle",
                "types": [
                    "Horse"
                ]
            },
            {
                "name": "Register a Horse",
                "types": [
                    "Horse"
                ]
            },
            {
                "name": "Anger a Cucco",
                "types": [
                    "Cucco"
                ]
            },
            {
                "name": "Activate Dueling Peaks Tower",
                "types": [
                    "Tower",
                    "Dueling Peaks"
                ]
            },
            {
                "name": "Soup Ladle",
                "types": [
                    "Equipment"
                ]
            },
/*            {
                "name": "1 Koko Cooking Side Quest",
                "types": [
                    "Side Quest",
                    "Dueling Peaks"
                ]
            },
*/
            {
                "name": "'Find Kheel' Side Quest",
                "types": [
                    "Side Quest",
                    "Tabantha"
                ]
            },
            {
                "name": "'The Jewel Trade' Side Quest",
                "types": [
                    "Side Quest",
                    "Eldin",
                    "Gems"
                ]
            },
            {
                "name": "Any Hasty meal",
                "types": [
                    "Cooking"
                ]
            },
            {
                "name": "Any Spicy meal",
                "types": [
                    "Cooking",
                    "Cold Resistance"
                ]
            }
        ],
        // 2
        [
            {
                "name": "5 Great Plateau Koroks",
                "types": [
                    "Korok",
                    "Plateau"
                ]
            },
            {
                "name": "6 Dueling Peaks Koroks",
                "types": [
                    "Korok",
                    "Dueling Peaks"
                ]
            },
            {
                "name": "3 Lake Tower Koroks",
                "types": [
                    "Korok",
                    "Lake"
                ]
            },
            {
                "name": "3 Wasteland Koroks",
                "types": [
                    "Korok",
                    "Wasteland"
                ]
            },
            {
                "name": "3 Woodland Koroks",
                "types": [
                    "Korok",
                    "Woodland"
                ]
            },
            {
                "name": "3 Lanayru Koroks",
                "types": [
                    "Korok", 
                    "Lanayru"
                ]
            },
            {
                "name": "'The Priceless Maracas' Side Quest",
                "types": [
                    "Side Quest",
                    "Dueling Peaks"
                ]
            },
/*            {
                "name": "'Playtime with Cottla' Side Quest",
                "types": [
                    "Side Quest",
                    "Dueling Peaks"
                ]
            },
*/
            {
                "name": "'Wild Horses' Side Quest",
                "types": [
                    "Side Quest",
                    "Dueling Peaks",
                    "Horse"
                ]
            },
            {
                "name": "'The Statue's Bargain' Side Quest",
                "types": [
                    "Side Quest",
                    "Hateno"
                ]
            },
/*            {
                "name": "'Frog Catching' Side Quest",
                "types": [
                    "Side Quest",
                    "Lanayru"
                ]
            },
*/
            {
                "name": "'Luminous Stone Gathering' Side Quest",
                "types": [
                    "Side Quest",
                    "Lanayru",
                    "Gems"
                ]
            },
            {
                "name": "'A Wife Washed Away' Side Quest",
                "types": [
                    "Side Quest",
                    "Lanayru"
                ]
            },
            {
                "name": "'Watch Out for the Flowers' Shrine Quest",
                "types": [
                    "Shrine",
                    "Shrine Quest",
                    "Dueling Peaks"
                ]
            },
            {
                "name": "Any Enduring meal",
                "types": [
                    "Cooking",
                    "Stamina"
                ]
            },
            {
                "name": "Any Mighty meal",
                "types": [
                    "Cooking"
                ]
            },
            {
                "name": "Any Sneaky meal",
                "types": [
                    "Cooking"
                ]
            },
            {
                "name": "Dubious Food",
                "types": [
                    "Cooking"
                ]
            },
            {
                "name": "Open 2 Bokoblin Camp Chests",
                "types": [
                    "Plateau"
                ]
            },
            {
                "name": "Save a Traveler in Peril",
                "types": [
                    "Monster"
                ]
            },
            {
                "name": "Activate Lake Tower",
                "types": [
                    "Tower",
                    "Lake"
                ]
            },
            {
                "name": "3 Tabantha Koroks",
                "types": [
                    "Korok",
                    "Tabantha"
                ]
            },
            {
                "name": "Any Stalfos 'Arm' Equipment item",
                "types": [
                    "Equipment"
                ]
            },
            {
                "name": "3 Side Quests",
                "types": [
                    "Side Quest"
                ]
            }
        ],
        // 3
        [
            {
                "name": "10 Koroks",
                "types": [
                    "Korok"
                ]
            },
            {
                "name": "3 Eldin Koroks",
                "types": [
                    "Korok",
                    "Eldin"
                ]
            },
            {
                "name": "3 Akkala Koroks",
                "types": [
                    "Korok",
                    "Akkala"
                ]
            },
            {
                "name": "Pay 1 Great Fairy",
                "types": [
                    "Rupee",
                    "Great Fairy"
                ]
            },
            {
                "name": "Full Hylian Set",
                "types": [
                    "Clothes",
                    "Hylian Gear",
                    "Rupee"
                ]
            },
            {
                "name": "Soldier's Helm",
                "types": [
                    "Clothes",
                    "Soldier Gear",
                    "Rupee",
                    "Hateno"
                ]
            },
            {
                "name": "Soldier's Armor",
                "types": [
                    "Clothes",
                    "Soldier Gear",
                    "Rupee",
                    "Hateno"
                ]
            },
            {
                "name": "Soldier's Greaves",
                "types": [
                    "Clothes",
                    "Soldier Gear",
                    "Rupee",
                    "Hateno"
                ]
            },
            {
                "name": "Stealth Mask",
                "types": [
                    "Clothes",
                    "Stealth Gear",
                    "Rupee",
                    "Dueling Peaks"
                ]
            },
            {
                "name": "Stealth Tights",
                "types": [
                    "Clothes",
                    "Stealth Gear",
                    "Rupee",
                    "Dueling Peaks"
                ]
            },
            {
                "name": "Climber's Bandanna",
                "types": [
                    "Clothes",
                    "Climbing Gear",
                    "Dueling Peaks"
                ]
            },
            {
                "name": "'Flown the Coop' Side Quest",
                "types": [
                    "Side Quest",
                    "Dueling Peaks",
                    "Heirloom"
                ]
            },
/*            {
                "name": "2 Koko Cooking Side Quests",
                "types": [
                    "Side Quest",
                    "Dueling Peaks"
                ]
            },
*/
            {
                "name": "'Arrows of Burning Heat' Side Quest",
                "types": [
                    "Side Quest",
                    "Dueling Peaks"
                ]
            },
            {
                "name": "'The Apple of My Eye' Side Quest",
                "types": [
                    "Side Quest",
                    "Tabantha"
                ]
            },
            {
                "name": "'Face the Frost Talus' Side Quest",
                "types": [
                    "Side Quest",
                    "Tabantha",
                    "Hebra",
                    "Cold Resistance"
                ]
            },
            {
                "name": "'The Giant of Ralis Pond' Side Quest",
                "types": [
                    "Side Quest",
                    "Lanayru",
                    "Hinox"
                ]
            },
            {
                "name": "A Minor Test of Strength Shrine",
                "types": [
                    "Shrine",
                    "Guardian"
                ]
            },
            {
                "name": "Farming Hoe",
                "types": [
                    "Equipment"
                ]
            },
            {
                "name": "Any Hearty meal",
                "types": [
                    "Cooking"
                ]
            },
            {
                "name": "Any Tough meal",
                "types": [
                    "Cooking"
                ]
            },
            {
                "name": "Hearty Elixir",
                "types": [
                    "Cooking"
                ]
            },
            {
                "name": "Energizing Elixir",
                "types": [
                    "Cooking"
                ]
            },
            {
                "name": "Chilly Elixir",
                "types": [
                    "Cooking"
                ]
            },
            {
                "name": "Hasty Elixir",
                "types": [
                    "Cooking"
                ]
            },
            {
                "name": "Enduring Elixir",
                "types": [
                    "Cooking"
                ]
            },
            {
                "name": "Mighty Elixir",
                "types": [
                    "Cooking"
                ]
            },
            {
                "name": "Tough Elixir",
                "types": [
                    "Cooking"
                ]
            },
            {
                "name": "Sneaky Elixir",
                "types": [
                    "Cooking"
                ]
            },
            {
                "name": "Rock-Hard Food",
                "types": [
                    "Cooking"
                ]
            },
            {
                "name": "Kill a Wizzrobe of any kind",
                "types": [
                    "Wizzrobe"
                ]
            },
            {
                "name": "Kill a Stone Talus of any kind",
                "types": [
                    "Rupee",
                    "Gems",
                    "Miniboss",
                    "Talus"
                ]
            },
            {
                "name": "Kill a (normal) Stone Talus",
                "types": [
                    "Rupee",
                    "Gems",
                    "Miniboss",
                    "Talus"
                ]
            },
            {
                "name": "Kill a Decayed Guardian",
                "types": [
                    "Miniboss",
                    "Guardian"
                ]
            },
            {
                "name": "Mount a Deer",
                "types": [
                    "Horse"
                ]
            },
            {
                "name": "Obtain a Purple Rupee",
                "types": [
                    "Rupee"
                ]
            },
            {
                "name": "Read Paya's Diary",
                "types": [
                    "Dueling Peaks"
                ]
            },
            {
                "name": "Read Purah's Diary",
                "types": [
                    "Hateno"
                ]
            },
            {
                "name": "Activate Hateno Tower",
                "types": [
                    "Tower",
                    "Hateno"
                ]
            },
            {
                "name": "Activate Faron Tower",
                "types": [
                    "Tower",
                    "Faron"
                ]
            },
            {
                "name": "Activate Wasteland Tower",
                "types": [
                    "Tower",
                    "Wasteland"
                ]
            },
            {
                "name": "Activate Ridgeland Tower",
                "types": [
                    "Tower",
                    "Ridgeland"
                ]
            },
            {
                "name": "4 Side Quests",
                "types": [
                    "Side Quest"
                ]
            },
            {
                "name": "Any Rod weapon",
                "types": [
                    "Equipment",
                    "Wizzrobe"
                ]
            }
        ],
        // 4
        [
            {
                "name": "6 Hateno Koroks",
                "types": [
                    "Korok",
                    "Hateno"
                ]
            },
            {
                "name": "6 Faron Koroks",
                "types": [
                    "Korok",
                    "Faron"
                ]
            },
            {
                "name": "6 Lake Tower Koroks",
                "types": [
                    "Korok",
                    "Lake"
                ]
            },
            {
                "name": "6 Wasteland Koroks",
                "types": [
                    "Korok",
                    "Wasteland"
                ]
            },
            {
                "name": "3 Gerudo Koroks",
                "types": [
                    "Korok",
                    "Gerudo"
                ]
            },
            {
                "name": "6 Ridgeland Koroks",
                "types": [
                    "Korok",
                    "Ridgeland"
                ]
            },
            {
                "name": "3 Hebra Koroks",
                "types": [
                    "Korok",
                    "Hebra",
                    "Cold Resistance"
                ]
            },
            {
                "name": "6 Woodland Koroks",
                "types": [
                    "Korok",
                    "Woodland"
                ]
            },
            {
                "name": "6 Lanayru Koroks",
                "types": [
                    "Korok. Lanayru"
                ]
            },
            {
                "name": "6 Central Tower Koroks",
                "types": [
                    "Korok",
                    "Central Hyrule"
                ]
            },
            {
                "name": "Rubber Helm",
                "types": [
                    "Clothes",
                    "Rubber Gear",
                    "Faron"
                ]
            },
            {
                "name": "Rubber Armor",
                "types": [
                    "Clothes",
                    "Rubber Gear",
                    "Ridgeland"
                ]
            },
            {
                "name": "Rubber Tights",
                "types": [
                    "Clothes",
                    "Rubber Gear",
                    "Faron"
                ]
            },
            {
                "name": "Stealth Chest Guard",
                "types": [
                    "Clothes",
                    "Stealth Gear",
                    "Rupee",
                    "Dueling Peaks"
                ]
            },
            {
                "name": "'Misko, the Great Bandit' Side Quest",
                "types": [
                    "Side Quest",
                    "Dueling Peaks"
                ]
            },
            {
                "name": "'Sunken Treasure' Side Quest",
                "types": [
                    "Side Quest",
                    "Hateno"
                ]
            },
            {
                "name": "'The Hero's Cache' Side Quest",
                "types": [
                    "Side Quest",
                    "Hateno"
                ]
            },
            {
                "name": "'Thunder Magnet' Side Quest",
                "types": [
                    "Side Quest",
                    "Faron",
                    "Rubber Gear"
                ]
            },
            {
                "name": "'A Good-Sized Horse' Side Quest",
                "types": [
                    "Side Quest",
                    "Wasteland",
                    "Horse"
                ]
            },
            {
                "name": "'The Spark of Romance' Side Quest",
                "types": [
                    "Side Quest",
                    "Tabantha"
                ]
            },
            {
                "name": "'A Gift for the Great Fairy' Side Quest",
                "types": [
                    "Side Quest",
                    "Tabantha",
                    "Rupee",
                    "Great Fairy"
                ]
            },
            {
                "name": "'Balloon Flight' Side Quest",
                "types": [
                    "Side Quest",
                    "Woodland"
                ]
            },
            {
                "name": "'Riverbed Reward' Side Quest",
                "types": [
                    "Side Quest",
                    "Central Hyrule"
                ]
            },
/*            {
                "name": "'The Mystery Polluter' Side Quest",
                "types": [
                    "Side Quest",
                    "Wasteland"
                ]
            },
*/
            {
                "name": "'The Two Rings' Shrine Quest",
                "types": [
                    "Shrine",
                    "Shrine Quest",
                    "Ridgeland"
                ]
            },
            {
                "name": "Any Boomerang",
                "types": [
                    "Equipment"
                ]
            },
            {
                "name": "Any 'Lizal' Equipment item",
                "types": [
                    "Equipment"
                ]
            },
            {
                "name": "Boat Oar",
                "types": [
                    "Equipment"
                ]
            },
            {
                "name": "Any 'Moblin' Equipment item",
                "types": [
                    "Equipment"
                ]
            },
            {
                "name": "Wooden Mop",
                "types": [
                    "Equipment"
                ]
            },
            {
                "name": "Any Chilly meal",
                "types": [
                    "Cooking",
                    "Wasteland"
                ]
            },
            {
                "name": "Any Electro meal",
                "types": [
                    "Cooking"
                ]
            },
            {
                "name": "Spicy Elixir",
                "types": [
                    "Cooking"
                ]
            },
            {
                "name": "Electro Elixir",
                "types": [
                    "Cooking"
                ]
            },
            {
                "name": "Kill a fire-typed Wizzrobe",
                "types": [
                    "Wizzrobe"
                ]
            },
            {
                "name": "Kill an electric-typed Wizzrobe",
                "types": [
                    "Wizzrobe"
                ]
            },
            {
                "name": "Kill a Hinox of any kind",
                "types": [
                    "Miniboss",
                    "Hinox"
                ]
            },
            {
                "name": "Kill a (red) Hinox",
                "types": [
                    "Miniboss",
                    "Hinox"
                ]
            },
            {
                "name": "500m in the Gliding Minigame",
                "types": [
                    "Minigame",
                    "Ridgeland"
                ]
            },
            {
                "name": "Activate Lanayru Tower",
                "types": [
                    "Tower",
                    "Lanayru"
                ]
            },
            {
                "name": "Activate Central Tower",
                "types": [
                    "Tower",
                    "Central Hyrule"
                ]
            }
        ],
        // 5
        [
            {
                "name": "6 Tabantha Koroks",
                "types": [
                    "Korok",
                    "Tabantha"
                ]
            },
            {
                "name": "6 Akkala Koroks",
                "types": [
                    "Korok",
                    "Akkala"
                ]
            },
            {
                "name": "Gerudo Set",
                "types": [
                    "Clothes",
                    "Wasteland",
                    "Rupee"
                ]
            },
            {
                "name": "Red Dyed Hylian Hood",
                "types": [
                    "Clothes",
                    "Hylian Gear",
                    "Hateno"
                ]
            },
            {
                "name": "Yellow Dyed Hylian Hood",
                "types": [
                    "Clothes",
                    "Hylian Gear",
                    "Hateno"
                ]
            },
            {
                "name": "Purple Dyed Hylian Hood",
                "types": [
                    "Clothes",
                    "Hylian Gear",
                    "Hateno"
                ]
            },
            {
                "name": "Green Dyed Hylian Hood",
                "types": [
                    "Clothes",
                    "Hylian Gear",
                    "Hateno"
                ]
            },
            {
                "name": "Light Yellow Dyed Hylian Hood",
                "types": [
                    "Clothes",
                    "Hylian Gear",
                    "Hateno"
                ]
            },
            {
                "name": "Gray Dyed Hylian Hood",
                "types": [
                    "Clothes",
                    "Hylian Gear",
                    "Hateno"
                ]
            },
/*            {
                "name": "3 Koko Cooking Side Quests",
                "types": [
                    "Side Quest",
                    "Dueling Peaks"
                ]
            },
*/
            {
                "name": "'A Gift of Nightshade' Side Quest",
                "types": [
                    "Side Quest",
                    "Faron"
                ]
            },
            {
                "name": "'The Horseback Hoodlums' Side Quest",
                "types": [
                    "Side Quest",
                    "Lake"
                ]
            },
            {
                "name": "'The Royal White Stallion' Side Quest",
                "types": [
                    "Side Quest",
                    "Central Hyrule",
                    "Horse",
                    "Stamina"
                ]
            },
            {
                "name": "'The Cursed Statue' Shrine Quest",
                "types": [
                    "Shrine",
                    "Shrine Quest",
                    "Hateno"
                ]
            },
/*            {
                "name": "'Recital at Warbler's Nest' Shrine Quest",
                "types": [
                    "Shrine",
                    "Shrine Quest",
                    "Tabantha"
                ]
            },
*/
            {
                "name": "'The Ceremonial Song' Shrine Quest",
                "types": [
                    "Shrine",
                    "Shrine Quest",
                    "Lanayru"
                ]
            },
            {
                "name": "Fishing Harpoon",
                "types": [
                    "Equipment"
                ]
            },
            {
                "name": "3 Identical Weapons",
                "types": [
                    "Equipment"
                ]
            },
            {
                "name": "Fireproof Elixir",
                "types": [
                    "Cooking"
                ]
            },
            {
                "name": "Hard-Boiled Egg",
                "types": [
                    "Cooking"
                ]
            },
            {
                "name": "Kill an ice-typed Wizzrobe",
                "types": [
                    "Wizzrobe"
                ]
            },
            {
                "name": "Obtain a Silver Rupee",
                "types": [
                    "Rupee"
                ]
            },
            {
                "name": "Activate Tabantha Tower",
                "types": [
                    "Tower",
                    "Tabantha"
                ]
            },
            {
                "name": "Activate Woodland Tower",
                "types": [
                    "Tower",
                    "Woodland"
                ]
            }
        ],
        // 6
        [
            {
                "name": "15 Koroks",
                "types": [
                    "Korok"
                ]
            },
            {
                "name": "Snowquill Tunic",
                "types": [
                    "Clothes",
                    "Snow Gear",
                    "Cold Resistance",
                    "Rupee",
                    "Tabantha"
                ]
            },
            {
                "name": "Snowquill Trousers",
                "types": [
                    "Clothes",
                    "Snow Gear",
                    "Cold Resistance",
                    "Rupee",
                    "Tabantha"
                ]
            },
            {
                "name": "Zora Helm",
                "types": [
                    "Clothes",
                    "Zora Gear",
                    "Lanayru"
                ]
            },
            {
                "name": "Zora Armor",
                "types": [
                    "Clothes",
                    "Zora Gear",
                    "Lanayru"
                ]
            },
            {
                "name": "Blue Dyed Hylian Hood",
                "types": [
                    "Clothes",
                    "Hylian Gear",
                    "Hateno"
                ]
            },
            {
                "name": "White Dyed Hylian Hood",
                "types": [
                    "Clothes",
                    "Hylian Gear",
                    "Hateno"
                ]
            },
            {
                "name": "Light Blue Dyed Hylian Hood",
                "types": [
                    "Clothes",
                    "Hylian Gear",
                    "Hateno"
                ]
            },
            {
                "name": "Orange Dyed Hylian Hood",
                "types": [
                    "Clothes",
                    "Hylian Gear",
                    "Hateno"
                ]
            },
            {
                "name": "Crimson Dyed Hylian Hood",
                "types": [
                    "Clothes",
                    "Hylian Gear",
                    "Hateno"
                ]
            },
            {
                "name": "Brown Dyed Hylian Hood",
                "types": [
                    "Clothes",
                    "Hylian Gear",
                    "Hateno"
                ]
            },
/*            {
                "name": "4 Koko Cooking Side Quests",
                "types": [
                    "Side Quest",
                    "Dueling Peaks"
                ]
            },
*/
            {
                "name": "'The Sheep Rustlers' Side Quest",
                "types": [
                    "Side Quest",
                    "Hateno"
                ]
            },
            {
                "name": "'An Ice Guy' Side Quest",
                "types": [
                    "Side Quest",
                    "Wasteland"
                ]
            },
            {
                "name": "'Diving is Beauty!' Side Quest",
                "types": [
                    "Side Quest",
                    "Lanayru"
                ]
            },
            {
                "name": "3 Dueling Peaks Shrines",
                "types": [
                    "Shrine",
                    "Dueling Peaks"
                ]
            },
            {
                "name": "'Crowned Beast' Shrine Quest",
                "types": [
                    "Shrine",
                    "Shrine Quest",
                    "Hateno",
                    "Horse"
                ]
            },
            {
                "name": "'A Landscape of a Stable' Shrine Quest",
                "types": [
                    "Shrine",
                    "Shrine Quest",
                    "Eldin"
                ]
            },
            {
                "name": "Any 'Zora' Equipment item",
                "types": [
                    "Equipment"
                ]
            },
            {
                "name": "Any Ice-typed Equipment item",
                "types": [
                    "Equipment"
                ]
            },
            {
                "name": "Any Fairy Tonic",
                "types": [
                    "Cooking"
                ]
            },
            {
                "name": "Glazed Meat",
                "types": [
                    "Cooking"
                ]
            },
            {
                "name": "Salt-Grilled Crab",
                "types": [
                    "Cooking"
                ]
            },
            {
                "name": "2 Stamina Vessels",
                "types": [
                    "Shrine",
                    "Stamina"
                ]
            },
            {
                "name": "Read Robbie's Diary",
                "types": [
                    "Akkala"
                ]
            },
            {
                "name": "Activate Gerudo Tower",
                "types": [
                    "Tower",
                    "Gerudo"
                ]
            },
            {
                "name": "Activate Eldin Tower",
                "types": [
                    "Tower",
                    "Eldin"
                ]
            }
        ],
        // 7
        [
            {
                "name": "7 Great Plateau Koroks",
                "types": [
                    "Korok",
                    "Plateau"
                ]
            },
            {
                "name": "9 Dueling Peaks Koroks",
                "types": [
                    "Korok",
                    "Dueling Peaks"
                ]
            },
            {
                "name": "9 Hateno Koroks",
                "types": [
                    "Korok",
                    "Hateno"
                ]
            },
            {
                "name": "9 Lake Tower Koroks",
                "types": [
                    "Korok",
                    "Lake"
                ]
            },
            {
                "name": "6 Gerudo Koroks",
                "types": [
                    "Korok",
                    "Gerudo"
                ]
            },
            {
                "name": "6 Hebra Koroks",
                "types": [
                    "Korok",
                    "Hebra",
                    "Cold Resistance"
                ]
            },
            {
                "name": "6 Eldin Koroks",
                "types": [
                    "Korok",
                    "Eldin"
                ]
            },
            {
                "name": "9 Central Tower Koroks",
                "types": [
                    "Korok",
                    "Central Hyrule"
                ]
            },
            {
                "name": "Hylian Hood ★",
                "types": [
                    "Clothes",
                    "Hylian Gear",
                    "Rupee",
                    "Great Fairy",
                    "Bokoblin"
                ]
            },
            {
                "name": "Hylian Tunic ★",
                "types": [
                    "Clothes",
                    "Hylian Gear",
                    "Rupee",
                    "Great Fairy",
                    "Bokoblin"
                ]
            },
            {
                "name": "Hylian Trousers ★",
                "types": [
                    "Clothes",
                    "Hylian Gear",
                    "Rupee",
                    "Great Fairy",
                    "Bokoblin"
                ]
            },
            {
                "name": "Full Soldier's Set",
                "types": [
                    "Clothes",
                    "Soldier Gear",
                    "Rupee",
                    "Hateno"
                ]
            },
            {
                "name": "Snowquill Headdress",
                "types": [
                    "Clothes",
                    "Snow Gear",
                    "Cold Resistance",
                    "Rupee",
                    "Tabantha"
                ]
            },
            {
                "name": "Flamebreaker Armor",
                "types": [
                    "Clothes",
                    "Flame Gear",
                    "Eldin",
                    "Rupee"
                ]
            },
            {
                "name": "Flamebreaker Boots",
                "types": [
                    "Clothes",
                    "Flame Gear",
                    "Eldin",
                    "Rupee"
                ]
            },
            {
                "name": "Black Dyed Hylian Hood",
                "types": [
                    "Clothes",
                    "Hylian Gear",
                    "Hateno"
                ]
            },
            {
                "name": "Navy Dyed Hylian Hood",
                "types": [
                    "Clothes",
                    "Hylian Gear",
                    "Hateno"
                ]
            },
            {
                "name": "Peach Dyed Hylian Hood",
                "types": [
                    "Clothes",
                    "Hylian Gear",
                    "Hateno"
                ]
            },
            {
                "name": "'A Freezing Rod' Side Quest",
                "types": [
                    "Side Quest",
                    "Woodland",
                    "Wizzrobe"
                ]
            },
            {
                "name": "3 Lake Shrines",
                "types": [
                    "Shrine",
                    "Lake"
                ]
            },
            {
                "name": "3 Central Tower Shrines",
                "types": [
                    "Shrine",
                    "Central Hyrule"
                ]
            },
            {
                "name": "'Master of the Wind' Shrine Quest",
                "types": [
                    "Shrine",
                    "Shrine Quest",
                    "Lanayru"
                ]
            },
            {
                "name": "Any 'Forest Dweller's' Equipment item",
                "types": [
                    "Equipment"
                ]
            },
            {
                "name": "Any Fire-typed Equipment item",
                "types": [
                    "Equipment"
                ]
            },
            {
                "name": "Any Electric-typed Equipment item",
                "types": [
                    "Equipment"
                ]
            },
            {
                "name": "Any Guardian Spear",
                "types": [
                    "Equipment",
                    "Guardian"
                ]
            },
            {
                "name": "Fruitcake",
                "types": [
                    "Cooking"
                ]
            },
            {
                "name": "Copious Fish Skewers",
                "types": [
                    "Cooking"
                ]
            },
            {
                "name": "Kill a Guardian Stalker",
                "types": [
                    "Miniboss",
                    "Guardian"
                ]
            },
            {
                "name": "Register the Royal Horse",
                "types": [
                    "Horse",
                    "Central Hyrule",
                    "Stamina"
                ]
            },
            {
                "name": "Talk to Kilton",
                "types": [
                    "Kilton",
                    "Akkala"
                ]
            },
            {
                "name": "Obtain a Gold Rupee",
                "types": [
                    "Rupee"
                ]
            },
            {
                "name": "5 Heart Containers",
                "types": [
                    "Shrine",
                    "Heart"
                ]
            },
            {
                "name": "5 Deer in Hunting Minigame",
                "types": [
                    "Minigame",
                    "Hateno"
                ]
            },
            {
                "name": "Activate Hebra Tower",
                "types": [
                    "Tower",
                    "Hebra",
                    "Cold Resistance"
                ]
            }
        ],
        // 8
        [
            {
                "name": "9 Faron Koroks",
                "types": [
                    "Korok",
                    "Faron"
                ]
            },
            {
                "name": "9 Ridgeland Koroks",
                "types": [
                    "Korok",
                    "Ridgeland"
                ]
            },
            {
                "name": "9 Lanayru Koroks",
                "types": [
                    "Korok. Lanayru"
                ]
            },
            {
                "name": "Climbing Boots",
                "types": [
                    "Clothes",
                    "Climbing Gear",
                    "Hateno"
                ]
            },
            {
                "name": "'What's for Dinner?' Side Quest",
                "types": [
                    "Side Quest",
                    "Faron"
                ]
            },
            {
                "name": "'The Secret Club's Secret' Side Quest",
                "types": [
                    "Side Quest",
                    "Wasteland",
                    "Radiant Gear",
                    "Desert Gear"
                ]
            },
            {
                "name": "'Missing in Action' Side Quest",
                "types": [
                    "Side Quest",
                    "Wasteland"
                ]
            },
            {
                "name": "'Fireproof Lizard Roundup' Side Quest",
                "types": [
                    "Side Quest",
                    "Eldin",
                    "Flame Gear"
                ]
            },
            {
                "name": "'Zora Stone Monuments' Side Quest",
                "types": [
                    "Side Quest",
                    "Lanayru"
                ]
            },
            {
                "name": "'The Search for Barta' Side Quest",
                "types": [
                    "Side Quest",
                    "Wasteland"
                ]
            },
            {
                "name": "'The Undefeated Champ' Shrine Quest",
                "types": [
                    "Shrine",
                    "Shrine Quest",
                    "Wastelands"
                ]
            },
            {
                "name": "3 Ridgeland Shrines",
                "types": [
                    "Shrine",
                    "Ridgeland"
                ]
            },
            {
                "name": "'Twin Memories' Shrines",
                "types": [
                    "Shrine",
                    "Shrine Quest",
                    "Dueling Peaks"
                ]
            },
            {
                "name": "'Song of Storms' Shrine Quest",
                "types": [
                    "Shrine",
                    "Shrine Quest",
                    "Faron"
                ]
            },
            {
                "name": "1 Korok Trial",
                "types": [
                    "Shrine",
                    "Shrine Quest",
                    "Woodland"
                ]
            },
            {
                "name": "Any Guardian Sword",
                "types": [
                    "Equipment",
                    "Guardian"
                ]
            },
            {
                "name": "3 Identical Shields",
                "types": [
                    "Equipment"
                ]
            },
            {
                "name": "3 Identical Bows",
                "types": [
                    "Equipment"
                ]
            },
            {
                "name": "Apple Pie",
                "types": [
                    "Cooking",
                    "Tabantha"
                ]
            },
            {
                "name": "Curry Pilaf",
                "types": [
                    "Cooking"
                ]
            },
            {
                "name": "Kill a Blue Hinox",
                "types": [
                    "Miniboss",
                    "Hinox"
                ]
            },
            {
                "name": "Finish Golf Minigame",
                "types": [
                    "Minigame",
                    "Woodland"
                ]
            },
            {
                "name": "Activate Akkala Tower",
                "types": [
                    "Tower",
                    "Akkala"
                ]
            },
            {
                "name": "Obtain a Material from Farosh",
                "types": [
                    "Dragon"
                ]
            }
        ],
        // 9
        [
            {
                "name": "9 Wasteland Koroks",
                "types": [
                    "Korok",
                    "Wasteland"
                ]
            },
            {
                "name": "9 Tabantha Koroks",
                "types": [
                    "Korok",
                    "Tabantha"
                ]
            },
            {
                "name": "9 Woodland Koroks",
                "types": [
                    "Korok",
                    "Woodland"
                ]
            },
            {
                "name": "9 Akkala Koroks",
                "types": [
                    "Korok",
                    "Akkala"
                ]
            },
            {
                "name": "Climber's Bandanna ★",
                "types": [
                    "Clothes",
                    "Climbing Gear",
                    "Great Fairy"
                ]
            },
            {
                "name": "Barbarian Armor",
                "types": [
                    "Clothes",
                    "Barbarian Gear",
                    "Wasteland"
                ]
            },
            {
                "name": "'Take Back the Sea' Side Quest",
                "types": [
                    "Side Quest",
                    "Faron"
                ]
            },
            {
                "name": "'Hunt for the Giant Horse' Side Quest",
                "types": [
                    "Side Quest",
                    "Lake",
                    "Horse",
                    "Stamina"
                ]
            },
            {
                "name": "3 Faron Shrines",
                "types": [
                    "Shrine",
                    "Faron"
                ]
            },
            {
                "name": "3 Wasteland Shrines",
                "types": [
                    "Shrine",
                    "Wasteland"
                ]
            },
            {
                "name": "A Modest Test of Strength Shrine",
                "types": [
                    "Shrine",
                    "Guardian"
                ]
            },
            {
                "name": "'Secret of the Cedars' Shrine Quest",
                "types": [
                    "Shrine",
                    "Shrine Quest",
                    "Hateno"
                ]
            },
            {
                "name": "'The Desert Labyrinth' Shrine Quest",
                "types": [
                    "Shrine",
                    "Shrine Quest",
                    "Wastelands",
                    "Barbarian Gear"
                ]
            },
            {
                "name": "'The Eye of the Sandstorm' Shrine Quest",
                "types": [
                    "Shrine",
                    "Shrine Quest",
                    "Wastelands"
                ]
            },
            {
                "name": "'Into the Vortex' Shrine Quest",
                "types": [
                    "Shrine",
                    "Shrine Quest",
                    "Akkala"
                ]
            },
            {
                "name": "'The Skull's Eye' Shrine Quest",
                "types": [
                    "Shrine",
                    "Shrine Quest",
                    "Akkala"
                ]
            },
            {
                "name": "Any Guardian Shield",
                "types": [
                    "Equipment",
                    "Guardian"
                ]
            },
            {
                "name": "Cream of Mushroom Soup",
                "types": [
                    "Cooking"
                ]
            },
            {
                "name": "Play the Bowling Minigame",
                "types": [
                    "Minigame",
                    "Hebra",
                    "Cold Resistance"
                ]
            }
        ],
        // 10
        [
            {
                "name": "20 Koroks",
                "types": [
                    "Korok"
                ]
            },
            {
                "name": "Pay 2 Great Fairies",
                "types": [
                    "Rupee",
                    "Great Fairy"
                ]
            },
            {
                "name": "Soldier's Armor ★",
                "types": [
                    "Clothes",
                    "Soldier Gear",
                    "Rupee",
                    "Great Fairy"
                ]
            },
            {
                "name": "Desert Voe Headband",
                "types": [
                    "Clothes",
                    "Desert Gear",
                    "Wasteland",
                    "Rupee"
                ]
            },
            {
                "name": "Desert Voe Trousers",
                "types": [
                    "Clothes",
                    "Desert Gear",
                    "Wasteland",
                    "Rupee"
                ]
            },
            {
                "name": "Rubber Helm ★",
                "types": [
                    "Clothes",
                    "Rubber Gear",
                    "Faron",
                    "Great Fairy"
                ]
            },
            {
                "name": "Stealth Mask ★",
                "types": [
                    "Clothes",
                    "Stealth Gear",
                    "Rupee",
                    "Great Fairy"
                ]
            },
            {
                "name": "Stealth Chest Guard ★",
                "types": [
                    "Clothes",
                    "Stealth Gear",
                    "Rupee",
                    "Great Fairy"
                ]
            },
            {
                "name": "Stealth Tights ★",
                "types": [
                    "Clothes",
                    "Stealth Gear",
                    "Rupee",
                    "Great Fairy"
                ]
            },
            {
                "name": "Full Stealth Set",
                "types": [
                    "Clothes",
                    "Stealth Gear",
                    "Rupee",
                    "Dueling Peaks"
                ]
            },
            {
                "name": "Barbarian Helm",
                "types": [
                    "Clothes",
                    "Barbarian Gear",
                    "Akkala"
                ]
            },
            {
                "name": "'A Gift for My Beloved' Side Quest",
                "types": [
                    "Side Quest",
                    "Hateno"
                ]
            },
            {
                "name": "3 Hateno Shrines",
                "types": [
                    "Shrine",
                    "Hateno"
                ]
            },
            {
                "name": "3 Tabantha Shrines",
                "types": [
                    "Shrine",
                    "Tabantha"
                ]
            },
            {
                "name": "3 Woodland Shrines",
                "types": [
                    "Shrine",
                    "Woodland"
                ]
            },
            {
                "name": "3 Akkala Shrines",
                "types": [
                    "Shrine",
                    "Akkala"
                ]
            },
            {
                "name": "'The Silent Swordswomen' Shrine Quest",
                "types": [
                    "Shrine",
                    "Shrine Quest",
                    "Wastelands"
                ]
            },
            {
                "name": "'Secret of the Snowy Peaks' Shrine Quest",
                "types": [
                    "Shrine",
                    "Shrine Quest",
                    "Wastelands",
                    "Cold Resistance"
                ]
            },
            {
                "name": "Forgotten Temple Shrine",
                "types": [
                    "Shrine",
                    "Shrine Quest",
                    "Woodland"
                ]
            },
            {
                "name": "'Shrouded Shrine' Shrine Quest",
                "types": [
                    "Shrine",
                    "Shrine Quest",
                    "Woodland"
                ]
            },
            {
                "name": "'The Gut Check Challenge' Shrine Quest",
                "types": [
                    "Shrine",
                    "Shrine Quest",
                    "Eldin"
                ]
            },
            {
                "name": "Akkala 'Trial of the Labyrinth' Shrine Quest",
                "types": [
                    "Shrine",
                    "Shrine Quest",
                    "Akkala",
                    "Barbarian Gear"
                ]
            },
            {
                "name": "Any 'Royal Guard's' Equipment item",
                "types": [
                    "Equipment"
                ]
            },
            {
                "name": "Any second tier Rod weapon",
                "types": [
                    "Equipment",
                    "Wizzrobe"
                ]
            },
            {
                "name": "Any Ancient Battle Axe",
                "types": [
                    "Equipment",
                    "Guardian"
                ]
            },
            {
                "name": "Monster cake",
                "types": [
                    "Cooking",
                    "Kilton"
                ]
            },
            {
                "name": "Wildberry Crepe",
                "types": [
                    "Cooking",
                    "Tabantha"
                ]
            },
            {
                "name": "Kill a Stone Talus (Rare)",
                "types": [
                    "Rupee",
                    "Miniboss",
                    "Talus"
                ]
            },
            {
                "name": "Register the Giant Horse",
                "types": [
                    "Horse",
                    "Lake",
                    "Stamina"
                ]
            },
            {
                "name": "Mount a Bear",
                "types": [
                    "Horse",
                    "Stamina"
                ]
            },
            {
                "name": "Mount a Stalhorse",
                "types": [
                    "Horse"
                ]
            },
            {
                "name": "2000 Rupees",
                "types": [
                    "Rupee"
                ]
            },
            {
                "name": "Read King's Diary",
                "types": [
                    "Hyrule Castle"
                ]
            },
            {
                "name": "Take a Selfie with Hestu",
                "types": [
                    "Dueling Peaks",
                    "Camera"
                ]
            },
            {
                "name": "Sheikah Sensor +",
                "types": [
                    "Camera",
                    "Rune Upgrade",
                    "Hateno"
                ]
            }
        ],
        // 11
        [
            {
                "name": "12 Dueling Peaks Koroks",
                "types": [
                    "Korok",
                    "Dueling Peaks"
                ]
            },
            {
                "name": "9 Eldin Koroks",
                "types": [
                    "Korok",
                    "Eldin"
                ]
            },
            {
                "name": "12 Central Tower Koroks",
                "types": [
                    "Korok",
                    "Central Hyrule"
                ]
            },
            {
                "name": "Champion's Tunic",
                "types": [
                    "Clothes",
                    "Champion",
                    "Camera"
                ]
            },
            {
                "name": "Soldier's Helm ★",
                "types": [
                    "Clothes",
                    "Soldier Gear",
                    "Rupee",
                    "Great Fairy"
                ]
            },
            {
                "name": "Soldier's Greaves ★",
                "types": [
                    "Clothes",
                    "Soldier Gear",
                    "Rupee",
                    "Great Fairy"
                ]
            },
            {
                "name": "Desert Voe Spaulder",
                "types": [
                    "Clothes",
                    "Desert Gear",
                    "Wasteland",
                    "Rupee"
                ]
            },
            {
                "name": "Rubber Armor ★",
                "types": [
                    "Clothes",
                    "Rubber Gear",
                    "Ridgeland",
                    "Great Fairy"
                ]
            },
            {
                "name": "Rubber Tights ★",
                "types": [
                    "Clothes",
                    "Rubber Gear",
                    "Faron",
                    "Great Fairy"
                ]
            },
            {
                "name": "Zora Greaves",
                "types": [
                    "Clothes",
                    "Zora Gear",
                    "Lanayru",
                    "Camera"
                ]
            },
            {
                "name": "Amber Earrings",
                "types": [
                    "Clothes",
                    "Gems",
                    "Rupee",
                    "Wasteland"
                ]
            },
            {
                "name": "'A Royal Recipe' Side Quest",
                "types": [
                    "Side Quest",
                    "Central Hyrule",
                    "Cooking"
                ]
            },
            {
                "name": "2 Shrine Quests",
                "types": [
                    "Shrine",
                    "Shrine Quest"
                ]
            },
            {
                "name": "'The Seven Heroines' Shrine Quest",
                "types": [
                    "Shrine",
                    "Shrine Quest",
                    "Wastelands"
                ]
            },
            {
                "name": "'Cliffside Etchings' Shrine Quest",
                "types": [
                    "Shrine",
                    "Shrine Quest",
                    "Gerudo",
                    "Cold Resistance"
                ]
            },
            {
                "name": "'Sign of the Shadow' Shrine Quest",
                "types": [
                    "Shrine",
                    "Shrine Quest",
                    "Gerudo"
                ]
            },
            {
                "name": "Collect 1 Picture Memory",
                "types": [
                    "Camera"
                ]
            },
            {
                "name": "Read Zelda's Diary",
                "types": [
                    "Hyrule Castle"
                ]
            },
            {
                "name": "Take a Selfie with Kass",
                "types": [
                    "Camera"
                ]
            },
            {
                "name": "3 Lanayru Shrines",
                "types": [
                    "Shrine",
                    "Lanayru"
                ]
            },
            {
                "name": "'Sunshroom Sensing' Side Quest",
                "types": [
                    "Side Quest",
                    "Hateno",
                    "Camera"
                ]
            },
            {
                "name": "'By Firefly's Light' Side Quest",
                "types": [
                    "Side Quest",
                    "Dueling Peaks",
                    "Heirloom",
                    "Camera"
                ]
            }
        ],
        // 12
        [
            {
                "name": "12 Hateno Koroks",
                "types": [
                    "Korok",
                    "Hateno"
                ]
            },
            {
                "name": "12 Lake Tower Koroks",
                "types": [
                    "Korok",
                    "Lake"
                ]
            },
            {
                "name": "12 Ridgeland Koroks",
                "types": [
                    "Korok",
                    "Ridgeland"
                ]
            },
            {
                "name": "9 Hebra Koroks",
                "types": [
                    "Korok",
                    "Hebra",
                    "Cold Resistance"
                ]
            },
            {
                "name": "Flamebreaker Helm",
                "types": [
                    "Clothes",
                    "Flame Gear",
                    "Eldin",
                    "Rupee"
                ]
            },
            {
                "name": "Zora Armor ★",
                "types": [
                    "Clothes",
                    "Zora Gear",
                    "Great Fairy",
                    "Lizalfos"
                ]
            },
            {
                "name": "Barbarian Leg Wraps",
                "types": [
                    "Clothes",
                    "Barbarian Gear",
                    "Hebra"
                ]
            },
            {
                "name": "3 Hebra Shrines",
                "types": [
                    "Shrine",
                    "Hebra",
                    "Cold Resistance"
                ]
            },
            {
                "name": "3 Eldin Shrines",
                "types": [
                    "Shrine",
                    "Eldin"
                ]
            },
            {
                "name": "'The Serpent's Jaws' Shrine Quest",
                "types": [
                    "Shrine",
                    "Shrine Quest",
                    "Lake",
                    "Dragon"
                ]
            },
            {
                "name": "'Test of Will' Shrine Quest",
                "types": [
                    "Shrine",
                    "Shrine Quest",
                    "Gerudo"
                ]
            },
            {
                "name": "Kill a Frost Talus",
                "types": [
                    "Rupee",
                    "Gems",
                    "Miniboss",
                    "Talus",
                    "Cold Resistance"
                ]
            },
            {
                "name": "Kill a Guardian Turret",
                "types": [
                    "Miniboss",
                    "Guardian",
                    "Hyrule Castle"
                ]
            },
            {
                "name": "5 Creatures in Compendium",
                "types": [
                    "Camera",
                    "Compendium"
                ]
            },
            {
                "name": "5 Monsters in Compendium",
                "types": [
                    "Camera",
                    "Compendium"
                ]
            },
            {
                "name": "5 Equipment in Compendium",
                "types": [
                    "Camera",
                    "Compendium"
                ]
            },
            {
                "name": "Take a Selfie with Sidon",
                "types": [
                    "Lanayru",
                    "Camera"
                ]
            },
            {
                "name": "Obtain a Material from Dinraal",
                "types": [
                    "Dragon"
                ]
            },
            {
                "name": "Finish Basic Shield Surfing Minigame",
                "types": [
                    "Minigame",
                    "Hebra",
                    "Cold Resistance"
                ]
            },
            {
                "name": "Snow Boots",
                "types": [
                    "Clothes",
                    "Boots",
                    "Side Quest",
                    "Gerudo",
                    "Camera"
                ]
            },
            {
                "name": "Kill a Igneo Talus",
                "types": [
                    "Rupee",
                    "Gems",
                    "Miniboss",
                    "Talus",
                    "Eldin"
                ]
            }
        ],
        // 13
        [
            {
                "name": "25 Koroks",
                "types": [
                    "Korok"
                ]
            },
            {
                "name": "12 Faron Koroks",
                "types": [
                    "Korok",
                    "Faron"
                ]
            },
            {
                "name": "9 Gerudo Koroks",
                "types": [
                    "Korok",
                    "Gerudo"
                ]
            },
            {
                "name": "12 Tabantha Koroks",
                "types": [
                    "Korok",
                    "Tabantha"
                ]
            },
            {
                "name": "12 Woodland Koroks",
                "types": [
                    "Korok",
                    "Woodland"
                ]
            },
            {
                "name": "12 Akkala Koroks",
                "types": [
                    "Korok",
                    "Akkala"
                ]
            },
            {
                "name": "12 Lanayru Koroks",
                "types": [
                    "Korok. Lanayru"
                ]
            },
            {
                "name": "Pay Horse God Malanya",
                "types": [
                    "Lake",
                    "Rupee"
                ]
            },
            {
                "name": "'Tools of the Trade' Side Quest",
                "types": [
                    "Side Quest",
                    "Wasteland",
                    "Gems"
                ]
            },
            {
                "name": "Zora Helm ★",
                "types": [
                    "Clothes",
                    "Zora Gear",
                    "Great Fairy",
                    "Lizalfos"
                ]
            },
            {
                "name": "Radiant Mask",
                "types": [
                    "Clothes",
                    "Radiant Gear",
                    "Rupee",
                    "Gems",
                    "Wasteland"
                ]
            },
            {
                "name": "Radiant Shirt",
                "types": [
                    "Clothes",
                    "Radiant Gear",
                    "Rupee",
                    "Gems",
                    "Wasteland"
                ]
            },
            {
                "name": "Radiant Tights",
                "types": [
                    "Clothes",
                    "Radiant Gear",
                    "Rupee",
                    "Gems",
                    "Wasteland"
                ]
            },
            {
                "name": "Topaz Earrings",
                "types": [
                    "Clothes",
                    "Gems",
                    "Rupee",
                    "Wasteland"
                ]
            },
            {
                "name": "'Curry for What Ails You' Side Quest",
                "types": [
                    "Side Quest",
                    "Tabantha",
                    "Eldin"
                ]
            },
            {
                "name": "10 Shrines",
                "types": [
                    "Shrine"
                ]
            },
            {
                "name": "3 Gerudo Shrines",
                "types": [
                    "Shrine",
                    "Gerudo",
                    "Cold Resistance"
                ]
            },
            {
                "name": "'Fragmented Monument' Shrine Quest",
                "types": [
                    "Shrine",
                    "Shrine Quest",
                    "Faron",
                    "Camera"
                ]
            },
            {
                "name": "Collect 2 Picture Memories",
                "types": [
                    "Camera"
                ]
            },
            {
                "name": "Kill a Black Hinox",
                "types": [
                    "Miniboss",
                    "Hinox"
                ]
            },
            {
                "name": "Kill a Stalnox",
                "types": [
                    "Miniboss",
                    "Hinox"
                ]
            },
            {
                "name": "Kill a Guardian Skywatcher",
                "types": [
                    "Miniboss",
                    "Guardian"
                ]
            },
            {
                "name": "3 Stamina Vessels",
                "types": [
                    "Shrine",
                    "Stamina"
                ]
            },
            {
                "name": "Obtain a Material from Naydra",
                "types": [
                    "Hateno",
                    "Cold Resistance",
                    "Dragon"
                ]
            },
            {
                "name": "Remote Bomb +",
                "types": [
                    "Camera",
                    "Rune Upgrade",
                    "Hateno"
                ]
            },
            {
                "name": "Activate 4 Towers",
                "types": [
                    "Tower"
                ]
            },
            {
                "name": "11 Side Quests",
                "types": [
                    "Side Quest"
                ]
            }
        ],
        // 14
        [
            {
                "name": "12 Wasteland Koroks",
                "types": [
                    "Korok",
                    "Wasteland"
                ]
            },
            {
                "name": "Snowquill Tunic ★",
                "types": [
                    "Clothes",
                    "Snow Gear",
                    "Cold Resistance",
                    "Rupee",
                    "Great Fairy"
                ]
            },
            {
                "name": "Snowquill Trousers ★",
                "types": [
                    "Clothes",
                    "Snow Gear",
                    "Cold Resistance",
                    "Rupee",
                    "Great Fairy"
                ]
            },
            {
                "name": "Full Snowquill Set",
                "types": [
                    "Clothes",
                    "Snow Gear",
                    "Cold Resistance",
                    "Rupee",
                    "Tabantha"
                ]
            },
            {
                "name": "Flamebreaker Boots ★",
                "types": [
                    "Clothes",
                    "Flame Gear",
                    "Eldin",
                    "Rupee",
                    "Great Fairy"
                ]
            },
            {
                "name": "Climbing Boots ★",
                "types": [
                    "Clothes",
                    "Climbing Gear",
                    "Great Fairy"
                ]
            },
            {
                "name": "Sapphire Circlet",
                "types": [
                    "Clothes",
                    "Gems",
                    "Rupee",
                    "Wasteland"
                ]
            },
            {
                "name": "Ruby Circlet",
                "types": [
                    "Clothes",
                    "Gems",
                    "Rupee",
                    "Wasteland"
                ]
            },
            {
                "name": "Bokoblin Mask",
                "types": [
                    "Clothes",
                    "Kilton"
                ]
            },
/*            {
                "name": "'Death Mountain's Secret' Side Quest",
                "types": [
                    "Side Quest",
                    "Eldin"
                ]
            },
*/
            {
                "name": "'Lynel Safari' Side Quest",
                "types": [
                    "Side Quest",
                    "Lanayru",
                    "Camera",
                    "Zora Gear"
                ]
            },
            {
                "name": "'The Royal Guard's Gear' Side Quest",
                "types": [
                    "Side Quest",
                    "Hyrule Castle"
                ]
            },
            {
                "name": "'Stranded on Eventide' Shrine Quest",
                "types": [
                    "Shrine",
                    "Shrine Quest",
                    "Faron"
                ]
            },
            {
                "name": "'Three Giant Brothers' Shrine Quest",
                "types": [
                    "Shrine",
                    "Shrine Quest",
                    "Faron",
                    "Hinox"
                ]
            },
            {
                "name": "'The Bird in the Mountains' Shrine Quest",
                "types": [
                    "Shrine",
                    "Shrine Quest",
                    "Hebra",
                    "Cold Resistance"
                ]
            },
            {
                "name": "Hebra Labyrinth 'Trial on the Cliff' Shrine Quest",
                "types": [
                    "Shrine",
                    "Shrine Quest",
                    "Hebra",
                    "Cold Resistance",
                    "Barbarian Gear"
                ]
            },
            {
                "name": "Windcleaver",
                "types": [
                    "Equipment",
                    "Wasteland"
                ]
            },
            {
                "name": "Kill a Lynel",
                "types": [
                    "Miniboss",
                    "Lynel"
                ]
            },
            {
                "name": "Kill a Molduga",
                "types": [
                    "Miniboss",
                    "Molduga",
                    "Wasteland"
                ]
            },
            {
                "name": "6 Heart Containers",
                "types": [
                    "Shrine",
                    "Heart"
                ]
            },
            {
                "name": "Take a Selfie with Riju",
                "types": [
                    "Wasteland",
                    "Camera"
                ]
            },
            {
                "name": "Take a Selfie while on fire",
                "types": [
                    "Eldin",
                    "Camera"
                ]
            },
            {
                "name": "Stasis +",
                "types": [
                    "Camera",
                    "Rune Upgrade",
                    "Hateno"
                ]
            },
            {
                "name": "10 Equipment in Compendium",
                "types": [
                    "Camera",
                    "Compendium"
                ]
            }
        ],
        // 15
        [
            {
                "name": "15 Dueling Peaks Koroks",
                "types": [
                    "Korok",
                    "Dueling Peaks"
                ]
            },
            {
                "name": "15 Central Tower Koroks",
                "types": [
                    "Korok",
                    "Central Hyrule"
                ]
            },
            {
                "name": "Champion's Tunic ★",
                "types": [
                    "Clothes",
                    "Champion",
                    "Camera",
                    "Great Fairy"
                ]
            },
            {
                "name": "Snowquill Headdress ★",
                "types": [
                    "Clothes",
                    "Snow Gear",
                    "Cold Resistance",
                    "Rupee",
                    "Great Fairy"
                ]
            },
            {
                "name": "Full Rubber Set",
                "types": [
                    "Clothes",
                    "Rubber Gear",
                    "Faron",
                    "Ridgeland"
                ]
            },
            {
                "name": "Flamebreaker Armor ★",
                "types": [
                    "Clothes",
                    "Flame Gear",
                    "Eldin",
                    "Rupee",
                    "Great Fairy"
                ]
            },
            {
                "name": "Opal Earrings",
                "types": [
                    "Clothes",
                    "Gems",
                    "Rupee",
                    "Wasteland"
                ]
            },
            {
                "name": "'Medicinal Molduga' Side Quest",
                "types": [
                    "Side Quest",
                    "Wasteland",
                    "Molduga"
                ]
            },
            {
                "name": "'The Road to Respect' Side Quest",
                "types": [
                    "Side Quest",
                    "Eldin",
                    "Talus"
                ]
            },
            {
                "name": "'Little Sister's Big Request' Side Quest",
                "types": [
                    "Side Quest",
                    "Akkala"
                ]
            },
            {
                "name": "'Legendary Rabbit Trial' Side Quest",
                "types": [
                    "Side Quest",
                    "Wasteland",
                    "Camera"
                ]
            },
            {
                "name": "12 Side Quests",
                "types": [
                    "Side Quest"
                ]
            },
            {
                "name": "10 Creatures in Compendium",
                "types": [
                    "Camera",
                    "Compendium"
                ]
            },
            {
                "name": "10 Monsters in Compendium",
                "types": [
                    "Camera",
                    "Compendium"
                ]
            },
            {
                "name": "Remake a Champion's Weapon or Shield",
                "types": [
                    "Equipment",
                    "Divine Beast",
                    "Gems"
                ]
            }
        ],
        // 16
        [
            {
                "name": "15 Hateno Koroks",
                "types": [
                    "Korok",
                    "Hateno"
                ]
            },
            {
                "name": "15 Lake Tower Koroks",
                "types": [
                    "Korok",
                    "Lake"
                ]
            },
            {
                "name": "12 Gerudo Koroks",
                "types": [
                    "Korok",
                    "Gerudo"
                ]
            },
            {
                "name": "15 Ridgeland Koroks",
                "types": [
                    "Korok",
                    "Ridgeland"
                ]
            },
            {
                "name": "12 Hebra Koroks",
                "types": [
                    "Korok",
                    "Hebra",
                    "Cold Resistance"
                ]
            },
            {
                "name": "12 Eldin Koroks",
                "types": [
                    "Korok",
                    "Eldin"
                ]
            },
            {
                "name": "Desert Voe Headband ★",
                "types": [
                    "Clothes",
                    "Desert Gear",
                    "Wasteland",
                    "Rupee",
                    "Great Fairy"
                ]
            },
            {
                "name": "Desert Voe Spaulder ★",
                "types": [
                    "Clothes",
                    "Desert Gear",
                    "Wasteland",
                    "Rupee",
                    "Great Fairy"
                ]
            },
            {
                "name": "Desert Voe Trousers ★",
                "types": [
                    "Clothes",
                    "Desert Gear",
                    "Wasteland",
                    "Rupee",
                    "Great Fairy"
                ]
            },
            {
                "name": "Sand Boots",
                "types": [
                    "Clothes",
                    "Boots",
                    "Side Quest",
                    "Gerudo"
                ]
            },
            {
                "name": "'The Eighth Heroine' Side Quest",
                "types": [
                    "Side Quest",
                    "Wasteland",
                    "Gerudo",
                    "Boots",
                    "Cold Resistance",
                    "Camera"
                ]
            },
            {
                "name": "11 Shrines",
                "types": [
                    "Shrine"
                ]
            },
            {
                "name": "5 Shrine Quests",
                "types": [
                    "Shrine",
                    "Shrine Quest"
                ]
            },
            {
                "name": "'Guardian Slideshow' Shrine Quest",
                "types": [
                    "Shrine",
                    "Shrine Quest",
                    "Lake",
                    "Camera",
                    "Guardian"
                ]
            },
            {
                "name": "'The Spring of Power' Shrine Quest",
                "types": [
                    "Shrine",
                    "Shrine Quest",
                    "Akkala",
                    "Dragon"
                ]
            },
            {
                "name": "Any 'Lynel' Equipment item",
                "types": [
                    "Equipment",
                    "Lynel"
                ]
            },
            {
                "name": "1 Fire, 1 Ice, and 1 Electric weapons",
                "types": [
                    "Equipment"
                ]
            },
            {
                "name": "20 Targets in Flight Range Minigame",
                "types": [
                    "Minigame",
                    "Tabantha",
                    "Cold Resistance"
                ]
            },
            {
                "name": "Activate 5 Towers",
                "types": [
                    "Tower"
                ]
            },
            {
                "name": "15 Equipment in Compendium",
                "types": [
                    "Camera",
                    "Compendium"
                ]
            }
        ],
        // 17
        [
            {
                "name": "15 Creatures in Compendium",
                "types": [
                    "Camera",
                    "Compendium"
                ]
            },
            {
                "name": "15 Monsters in Compendium",
                "types": [
                    "Camera",
                    "Compendium"
                ]
            },
            {
                "name": "30 Koroks",
                "types": [
                    "Korok"
                ]
            },
            {
                "name": "15 Faron Koroks",
                "types": [
                    "Korok",
                    "Faron"
                ]
            },
            {
                "name": "15 Akkala Koroks",
                "types": [
                    "Korok",
                    "Akkala"
                ]
            },
            {
                "name": "15 Lanayru Koroks",
                "types": [
                    "Korok. Lanayru"
                ]
            },
            {
                "name": "Full Desert Voe Set",
                "types": [
                    "Clothes",
                    "Desert Gear",
                    "Wasteland",
                    "Rupee"
                ]
            },
            {
                "name": "Flamebreaker Helm ★",
                "types": [
                    "Clothes",
                    "Flame Gear",
                    "Eldin",
                    "Rupee",
                    "Great Fairy"
                ]
            },
            {
                "name": "Zora Greaves ★",
                "types": [
                    "Clothes",
                    "Zora Gear",
                    "Great Fairy",
                    "Lizalfos",
                    "Camera"
                ]
            },
            {
                "name": "Radiant Mask ★",
                "types": [
                    "Clothes",
                    "Radiant Gear",
                    "Rupee",
                    "Gems",
                    "Great Fairy"
                ]
            },
            {
                "name": "Snow Boots ★",
                "types": [
                    "Clothes",
                    "Boots",
                    "Side Quest",
                    "Great Fairy",
                    "Camera"
                ]
            },
            {
                "name": "'Slated for Upgrades' Side Quest",
                "types": [
                    "Side Quest",
                    "Hateno",
                    "Camera"
                ]
            },
            {
                "name": "'A Shady Customer' Side Quest",
                "types": [
                    "Side Quest",
                    "Akkala",
                    "Kilton",
                    "Camera"
                ]
            },
            {
                "name": "12 Shrines",
                "types": [
                    "Shrine"
                ]
            },
            {
                "name": "'The Spring of Wisdom' Shrine Quest",
                "types": [
                    "Shrine",
                    "Shrine Quest",
                    "Hateno",
                    "Cold Resistance",
                    "Dragon"
                ]
            },
            {
                "name": "Collect 3 Picture Memories",
                "types": [
                    "Camera"
                ]
            },
            {
                "name": "Hylian Shield",
                "types": [
                    "Miniboss",
                    "Hinox",
                    "Hyrule Castle"
                ]
            },
            {
                "name": "Mount the Lord of the Mountain",
                "types": [
                    "Horse",
                    "Ridgeland",
                    "Stamina"
                ]
            },
            {
                "name": "Buy a House",
                "types": [
                    "Hateno",
                    "Rupee"
                ]
            },
            {
                "name": "A Major Test of Strength Shrine",
                "types": [
                    "Shrine",
                    "Guardian"
                ]
            }
        ],
        // 18
        [
            {
                "name": "15 Wasteland Koroks",
                "types": [
                    "Korok",
                    "Wasteland"
                ]
            },
            {
                "name": "15 Tabantha Koroks",
                "types": [
                    "Korok",
                    "Tabantha"
                ]
            },
            {
                "name": "15 Woodland Koroks",
                "types": [
                    "Korok",
                    "Woodland"
                ]
            },
            {
                "name": "Radiant Shirt ★",
                "types": [
                    "Clothes",
                    "Radiant Gear",
                    "Rupee",
                    "Gems",
                    "Great Fairy"
                ]
            },
            {
                "name": "Radiant Tights ★",
                "types": [
                    "Clothes",
                    "Radiant Gear",
                    "Rupee",
                    "Gems",
                    "Great Fairy"
                ]
            },
            {
                "name": "Amber Earrings ★",
                "types": [
                    "Clothes",
                    "Gems",
                    "Rupee",
                    "Great Fairy"
                ]
            },
            {
                "name": "'Stalhorse: Pictured!' Side Quest",
                "types": [
                    "Side Quest",
                    "Hebra",
                    "Camera"
                ]
            },
            {
                "name": "'The Stolen Heirloom' Shrine Quest",
                "types": [
                    "Shrine",
                    "Shrine Quest",
                    "Dueling Peaks",
                    "Heirloom",
                    "Camera"
                ]
            },
            {
                "name": "'Brother's Roast' Shrine Quest",
                "types": [
                    "Shrine",
                    "Shrine Quest",
                    "Eldin"
                ]
            },
            {
                "name": "Kill Coliseum Lynel",
                "types": [
                    "Miniboss",
                    "Lynel",
                    "Central Hyrule"
                ]
            },
            {
                "name": "Activate 6 Towers",
                "types": [
                    "Tower"
                ]
            },
            {
                "name": "13 Side Quests",
                "types": [
                    "Side Quest"
                ]
            },
            {
                "name": "Climbing Gear",
                "types": [
                    "Clothes",
                    "Climbing Gear",
                    "Hateno"
                ]
            }
        ],
        // 19
        [
            {
                "name": "15 Gerudo Koroks",
                "types": [
                    "Korok",
                    "Gerudo"
                ]
            },
            {
                "name": "15 Hebra Koroks",
                "types": [
                    "Korok",
                    "Hebra",
                    "Cold Resistance"
                ]
            },
            {
                "name": "15 Eldin Koroks",
                "types": [
                    "Korok",
                    "Eldin"
                ]
            },
            {
                "name": "Full Zora Set",
                "types": [
                    "Clothes",
                    "Zora Gear",
                    "Lanayru",
                    "Camera"
                ]
            },
            {
                "name": "Barbarian Helm ★",
                "types": [
                    "Clothes",
                    "Barbarian Gear",
                    "Great Fairy",
                    "Lynel"
                ]
            },
            {
                "name": "Barbarian Armor ★",
                "types": [
                    "Clothes",
                    "Barbarian Gear",
                    "Great Fairy",
                    "Lynel"
                ]
            },
            {
                "name": "Topaz Earrings ★",
                "types": [
                    "Clothes",
                    "Gems",
                    "Rupee",
                    "Great Fairy"
                ]
            },
            {
                "name": "Diamond Circlet",
                "types": [
                    "Clothes",
                    "Gems",
                    "Rupee",
                    "Wasteland"
                ]
            },
            {
                "name": "'The Forgotten Sword' Side Quest",
                "types": [
                    "Side Quest",
                    "Wasteland",
                    "Gerudo",
                    "Boots",
                    "Cold Resistance",
                    "Camera"
                ]
            },
            {
                "name": "'Robbie's Research' Side Quest",
                "types": [
                    "Side Quest",
                    "Akkala",
                    "Camera"
                ]
            },
            {
                "name": "6 Shrine Quests",
                "types": [
                    "Shrine",
                    "Shrine Quest"
                ]
            },
            {
                "name": "Collect 4 Picture Memories",
                "types": [
                    "Camera"
                ]
            },
            {
                "name": "4 Stamina Vessels",
                "types": [
                    "Shrine",
                    "Stamina"
                ]
            },
            {
                "name": "20 Equipment in Compendium",
                "types": [
                    "Camera",
                    "Compendium"
                ]
            }
        ],
        // 20
        [
            {
                "name": "20 Creatures in Compendium",
                "types": [
                    "Camera",
                    "Compendium"
                ]
            },
            {
                "name": "20 Monsters in Compendium",
                "types": [
                    "Camera",
                    "Compendium"
                ]
            },
            {
                "name": "35 Koroks",
                "types": [
                    "Korok"
                ]
            },
            {
                "name": "Pay 3 Great Fairies",
                "types": [
                    "Rupee",
                    "Great Fairy"
                ]
            },
            {
                "name": "Full Flamebreaker Set",
                "types": [
                    "Clothes",
                    "Flame Gear",
                    "Eldin",
                    "Rupee"
                ]
            },
            {
                "name": "Barbarian Leg Wraps ★",
                "types": [
                    "Clothes",
                    "Barbarian Gear",
                    "Great Fairy",
                    "Lynel"
                ]
            },
            {
                "name": "Full Radiant Set",
                "types": [
                    "Clothes",
                    "Radiant Gear",
                    "Rupee",
                    "Gems",
                    "Wasteland"
                ]
            },
            {
                "name": "Opal Earrings ★",
                "types": [
                    "Clothes",
                    "Gems",
                    "Rupee",
                    "Great Fairy"
                ]
            },
            {
                "name": "Sapphire Circlet ★",
                "types": [
                    "Clothes",
                    "Gems",
                    "Rupee",
                    "Great Fairy"
                ]
            },
            {
                "name": "Ruby Circlet ★",
                "types": [
                    "Clothes",
                    "Gems",
                    "Rupee",
                    "Great Fairy"
                ]
            },
            {
                "name": "13 Shrines",
                "types": [
                    "Shrine"
                ]
            },
            {
                "name": "7 Shrine Quests",
                "types": [
                    "Shrine",
                    "Shrine Quest"
                ]
            },
            {
                "name": "'The Perfect Drink' Shrine Quest",
                "types": [
                    "Shrine",
                    "Shrine Quest",
                    "Wastelands"
                ]
            },
            {
                "name": "'The Ancient Rito Song' Shrine Quest",
                "types": [
                    "Shrine",
                    "Shrine Quest",
                    "Tabantha"
                ]
            },
            {
                "name": "Collect 5 Picture Memories",
                "types": [
                    "Camera"
                ]
            },
            {
                "name": "Spring-Loaded Hammer",
                "types": [
                    "Equipment",
                    "Kilton"
                ]
            },
            {
                "name": "7 Heart Containers",
                "types": [
                    "Shrine",
                    "Heart"
                ]
            },
            {
                "name": "Upgrade All Runes",
                "types": [
                    "Camera",
                    "Rune Upgrade",
                    "Hateno"
                ]
            }
        ],
        // 21
        [
            {
                "name": "'Riddles of Hyrule' Side Quest",
                "types": [
                    "Side Quest",
                    "Woodland",
                    "Lynel"
                ]
            },
            {
                "name": "14 Shrines",
                "types": [
                    "Shrine"
                ]
            },
            {
                "name": "8 Shrine Quests",
                "types": [
                    "Shrine",
                    "Shrine Quest"
                ]
            },
            {
                "name": "Activate 7 Towers",
                "types": [
                    "Tower"
                ]
            },
            {
                "name": "14 Side Quests",
                "types": [
                    "Side Quest"
                ]
            }
        ],
        // 22
        [
            {
                "name": "40 Koroks",
                "types": [
                    "Korok"
                ]
            },
            {
                "name": "15 Shrines",
                "types": [
                    "Shrine"
                ]
            },
            {
                "name": "Collect 6 Picture Memories",
                "types": [
                    "Camera"
                ]
            },
            {
                "name": "Climbing Gear ★★",
                "types": [
                    "Clothes",
                    "Climbing Gear",
                    "Great Fairy"
                ]
            },
            {
                "name": "Activate 8 Towers",
                "types": [
                    "Tower"
                ]
            }
        ],
        // 23
        [
            {
                "name": "45 Koroks",
                "types": [
                    "Korok"
                ]
            },
            {
                "name": "'Leviathan Bones' Side Quest",
                "types": [
                    "Side Quest",
                    "Camera"
                ]
            },
            {
                "name": "16 Shrines",
                "types": [
                    "Shrine"
                ]
            },
            {
                "name": "Activate 9 Towers",
                "types": [
                    "Tower"
                ]
            },
            {
                "name": "Full Climber's Set",
                "types": [
                    "Clothes",
                    "Climbing Gear"
                ]
            }
        ],
        // 24
        [
            {
                "name": "50 Koroks",
                "types": [
                    "Korok"
                ]
            },
            {
                "name": "Activate 10 Towers",
                "types": [
                    "Tower"
                ]
            },
            {
                "name": "15 Side Quests",
                "types": [
                    "Side Quest"
                ]
            },
            {
                "name": "Full Barbarian Set",
                "types": [
                    "Clothes",
                    "Barbarian Gear"
                ]
            }
        ]
    ];
}