(function () {
    "use strict";

    const app = new Vue({
        el: "#app",
        template: `<div>
            <label>Current Game
                <select v-model="twitch.game">
                    <option v-for="game in games" :value="game">{{ game.subtitle }}</option>
                </select>
            </label>
            <div>{{ twitch }}</div><div>{{ bits }}</div>
        </div>`,
        replicants: ["twitch", "bits"],
        data: {
            games: [{
                fullTitle: "The Legend of Zelda",
                subtitle: "The Legend of Zelda"
            }, {
                fullTitle: "Zelda II: The Adventure of Link",
                subtitle: "The Adventure of Link"
            }, {
                fullTitle: "The Legend of Zelda: A Link to the Past",
                subtitle: "A Link to the Past"
            }, {
                fullTitle: "The Legend of Zelda: Link's Awakening",
                subtitle:  "Link's Awakening"
            }, {
                fullTitle: "The Legend of Zelda: Ocarina of Time 3D",
                subtitle: "Ocarina of Time 3D"
            }, {
                fullTitle: "The Legend of Zelda: Majora's Mask 3D",
                subtitle: "Majora's Mask 3D"
            }, {
                fullTitle: "The Legend of Zelda: Oracle of Seasons",
                subtitle: "Oracle of Seasons"
            }, {
                fullTitle: "The Legend of Zelda: Oracle of Ages",
                subtitle: "Oracle of Ages"
            }, {
                fullTitle: "The Legend of Zelda: The Wind Waker HD",
                subtitle: "The Wind Waker HD"
            }, {
                fullTitle: "The Legend of Zelda: The Minish Cap",
                subtitle: "The Minish Cap"
            }, {
                fullTitle: "The Legend of Zelda: Twilight Princess HD",
                subtitle: "Twilight Princess HD"
            }, {
                fullTitle: "The Legend of Zelda: Phantom Hourglass",
                subtitle: "Phantom Hourglass"
            }, {
                fullTitle: "The Legend of Zelda: Spirit Tracks",
                subtitle: "Spirit Tracks"
            }, {
                fullTitle: "The Legend of Zelda: Skyward Sword",
                subtitle: "Skyward Sword"
            }, {
                fullTitle: "The Legend of Zelda: A Link Between Worlds",
                subtitle: "A Link Between Worlds"
            }, {
                fullTitle: "The Legend of Zelda: Breath of the Wild",
                subtitle: "Breath of the Wild"
            }, {
                fullTitle: "Hyrule Warriors", // Twitch only has "Hyrule Warriors"
                subtitle: "Hyrule Warriors Definitive Edition" // but we want DE in our stream title
            }, {
                fullTitle: "The Legend of Zelda: Four Swords Anniversary Edition",
                subtitle: "Four Swords Anniversary Edition"
            }, {
                fullTitle: "The Legend of Zelda: Four Swords Adventures",
                subtitle: "Four Swords Adventures"
            }, {
                fullTitle: "The Legend of Zelda: Tri Force Heroes",
                subtitle: "Tri Force Heroes"
            }, {
                fullTitle: "Freshly-Picked: Tingle's Rosy Rupeeland",
                subtitle: "Tingle's Rosy Rupeeland"
            }, {
                fullTitle: "Zelda: The Wand of Gamelon",
                subtitle: "Wand of Gamelon"
            }, {
                fullTitle: "Link: The Faces of Evil",
                subtitle: "Faces of Evil"
            }, {
                fullTitle: "Jigsaw Puzzle",
                subtitle: "Puzzle"
            }]
        }
    });
})();
