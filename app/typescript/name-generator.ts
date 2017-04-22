﻿var words = ["Berry", "Blossom", "Bride", "Butterfly", "Candy", "Couple", "Cream", "Dear", "Dress", "Dumpling", "Flower", "Flute", "Girdle", "Glimmer", "Glisten", "Gloss", "Honey", "Incense", "Knit", "Lace", "Lark", "Lute", "Lyric", "Meadow", "Mellow", "Mother", "Music", "Nestle", "Nurture", "Pregnant", "Prim", "Queen", "Satin", "Sheen", "Show", "Silk", "Silky", "Sing", "Sister", "Skirt", "Skirt", "Smile", "Style", "Sugar", "Sweet", "Trim", "Tulip", "Tweet", "Velvet", "Wavy", "Wisp", "Wonder", "Dessert", "Fancy", "Lather", "Petal", "Droplet", "Pantomime", "Fragrance", "Glitter", "Sparkle", "Tragedy", "Cyclopean", "Trifle", "Luxury", "Euphoria", "Scintillate", "Sensual", "Malodorous", "Venerate", "Tress", "Ensorcel", "Fabulous", "Mirth", "Laconic", "Quiescent", "Reticent", "Saturnine", "Taciturn", "Fortuitous", "Tenebrous", "Morose", "Beloved", "Suitor", "Pungent", "Cherish", "Pristine", "Languish", "Adore", "Embrace", "Meander", "Bewilder", "Intricate", "Poem", "Poetry", "Poet", "Amethyst", "Aquamarine", "Azure", "Beige", "Sienna", "Umber", "Cardinal", "Carmine", "Cerulean", "Chartreuse", "Fuchsia", "Goldenrod", "Heliotrope", "Lavender", "Lilac", "Mauve", "Taupe", "Periwinkle", "Russet", "Saffron", "Vermilion", "Festival", "Animal", "Ape", "Autumn", "Beak", "Beast", "Bear", "Bee", "Beetle", "Berry", "Bird", "Blaze", "Blossom", "Boar", "Bog", "Buck", "Bush", "Butterfly", "Buzzard", "Canyon", "Cat", "Chill", "Chirp", "Clam", "Clearing", "Cobra", "Crab", "Creek", "Crow", "Dawn", "Deer", "Dirt", "Dusk", "Eagle", "Eel", "Fang", "Fin", "Fish", "Flower", "Fog", "Forest", "Frog", "Fruit", "Fungus", "Fur", "Gerbil", "Glen", "Gore", "Gorge", "Grape", "Grass", "Grove", "Grow", "Growl", "Growth", "Grub", "Hare", "Hawk", "Heather", "Hedge", "Hide", "Hill", "Hoary", "Hog", "Hoof", "Hop", "Horn", "Howl", "Ivy", "Jackal", "Jaw", "Jungle", "Kitten", "Lake", "Lark", "Larva", "Leaf", "Leopard", "Lizard", "Lobster", "Lush", "Maggot", "Mange", "Marsh", "Maw", "Meadow", "Mist", "Mite", "Mold", "Mole", "Monkey", "Moth", "Mud", "Mushroom", "Nature", "Nest", "Nettle", "Newt", "Nut", "Oak", "Owl", "Pack", "Panther", "Peach", "Plant", "Planter", "Rabbit", "Rain", "Ram", "Raptor", "Rat", "Raven", "Ripe", "River", "Rock", "Root", "Rose", "Sap", "Scorpion", "Sea", "Seal", "Season", "Seed", "Serpent", "Shark", "Shell", "Silt", "Skunk", "Sky", "Slither", "Slug", "Snake", "Soil", "Spider", "Spidery", "Spring", "Squid", "Stick", "Stone", "Storm", "Straw", "Summer", "Sun", "Swamp", "Tail", "Talon", "Tempest", "Thorn", "Thunder", "Tick", "Toad", "Tulip", "Tusk", "Tweet", "Twilight", "Vegetable", "Vegetation", "Viper", "Volcano", "Vulture", "Wasp", "Wave", "Weasel", "Weed", "Wheat", "Wing", "Winter", "Wood", "Worm", "Earth", "Bud", "Desert", "Field", "Glacier", "Mountain", "Prairie", "Tentacle", "Tundra", "Weevil", "Dune", "Pine", "Puppy", "Gnarled", "Stump", "Beard", "Water", "Wax", "Roar", "Ford", "Snarl", "Drink", "Flight", "Twig", "Tuft", "Fern", "Gully", "Lion", "Cactus", "Cloud", "Bean", "Pearl", "Pear", "Bunny", "Wind storm", "Skin", "Shin", "Island", "Grotto", "Shore", "Beach", "Coast", "Insect", "Bug", "Critter", "Pristine", "Weather", "Dale", "Dell", "Glade", "Vale", "Basin", "Den", "Valley", "Cyclone", "Typhoon", "Hurricane", "Gale", "Tornado", "Scale", "Whisker", "Bulb", "Stream", "Creature", "Snail", "Vine", "Morning", "Tree", "Chestnut", "Cinnamon", "Olive", "Flax", "Fuchsia", "Goldenrod", "Heliotrope", "Lavender", "Lemon", "Lilac", "Lime", "Mahogany", "Mint", "Moss", "Orange", "Periwinkle", "Plum", "Pumpkin", "Saffron", "Sepia", "Teal", "Birth", "Leap", "Jump", "Dive"];

function generateName() {
    getRandomName() + ' ' + getRandomName();

    function getRandomName() {
        return words[Math.floor(Math.random() * words.length)];
    }
}