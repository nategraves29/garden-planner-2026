import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Modal, TextInput, ActivityIndicator, Alert } from 'react-native';
import { useFonts, VT323_400Regular } from '@expo-google-fonts/vt323';
import { Silkscreen_400Regular } from '@expo-google-fonts/silkscreen';
import { db } from '../firebaseConfig'; // Ensure this matches your config file name
import { doc, setDoc, onSnapshot } from 'firebase/firestore';

// ==========================================
// DATABASES & CATALOGS
// ==========================================
const bedDatabase = {
  "bed1": { title: "BED 1 • Roots & Greens", focus: "The Nutrient Engine", soilPrep: "Soil must be kept incredibly loose and free of rocks/clumps down to 12 inches to ensure carrots grow straight.", macroWatering: "High surface-moisture dependency early in the season. Keep the top crust damp.", macroFeeding: "The SubPod acts as the core engine here. Worm castings and liquid tea will continuously leach into this bed.", bedSecrets: "Harvest radishes quickly to free up root space." },
  "bed2": { title: "BED 2 • Allium & Herb", focus: "Bulb Swelling & Weed Defense", soilPrep: "Excellent drainage is required. Onions will rot in standing water.", macroWatering: "Standard deep soak. CRITICAL: Stop watering this bed entirely in late summer when the onion tops flop over.", macroFeeding: "Conservative spacing means nutrients last longer. Feed every 3-4 weeks.", bedSecrets: "Onions have incredibly shallow root systems. Keep this bed meticulously weed-free by hand-pulling." },
  "bed3": { title: "BED 3 • Brassicas", focus: "Heavy Leaf Production", soilPrep: "Mix heavily with rich compost before planting.", macroWatering: "Deep, consistent soaking.", macroFeeding: "This is your hungriest bed. Hit it strictly with High Nitrogen Fish Emulsion (2 Tbsp/gal) every 3 weeks.", bedSecrets: "Watch out for cabbage loopers. The scattered Sweet Alyssum on the soil surface will attract hoverflies to help hunt pests." },
  "bed4": { title: "BED 4 • Pea Trellis & Peppers", focus: "The Nitrogen Relay", soilPrep: "Install a sturdy vertical trellis along the back edge before planting.", macroWatering: "Consistent deep watering. When peppers set fruit, slightly stress them (water less) right before picking to increase spice.", macroFeeding: "Start with 4-4-4, switch to Fruiting Fertilizer (2-8-4) once peppers flower.", bedSecrets: "The Sugar Snap Peas are legumes—they pull nitrogen from the air. As they die off in July, they leave primed soil for your peppers." },
  "bed5": { title: "BED 5 • Vines & Beans", focus: "Vertical Jungle", soilPrep: "Requires the heaviest, tallest trellising in the garden.", macroWatering: "Thirstiest bed in July/August. Never let this bed fully dry out during peak heat.", macroFeeding: "Light feeding (5-1-1). Beans are nitrogen-fixers.", bedSecrets: "Cucumbers and beans require aggressive daily harvesting to keep producing." },
  "bed6": { title: "BED 6 • Tomatillo Hub", focus: "Controlled Chaos", soilPrep: "Install heavy-duty wire cages early.", macroWatering: "Deep root soaking. Water the base of the plants, not leaves.", macroFeeding: "Fruiting Fertilizer (2-8-4) every 2-3 weeks.", bedSecrets: "Tomatillos are strictly not self-pollinating. You must ensure both plants in this bed survive and bloom at the same time." },
  "bed7": { title: "BED 7 • Tomato & Basil Haven", focus: "Heavy Fruiting", soilPrep: "Dig deep holes for the tomatoes. Bury the stems deep.", macroWatering: "Deep root soaking. Cut water volume by 50% in late summer to force ripening.", macroFeeding: "Fruiting Fertilizer (2-8-4) every 2-3 weeks.", bedSecrets: "Once tomatoes are 3 feet tall, prune off all branches in the bottom 12 inches to prevent soil-borne fungus." }
};

const plantDatabase = {
  "Radishes": { color: "#ff8fab", method: "DIRECT SOW (Precision Poke)", quantity: "16 seeds", depth: "1/2 inch", harvest: "25-30 days", phases: [{ name: "Sprouting", startDay: 0, waterDays: 1, water: "Daily mist to keep soil soft.", feedDays: 14, feed: "Light Fish Emulsion (5-1-1)", pruning: "Snip the weakest sprouts with scissors at the soil line.", tip: "Keep the surface wet so the roots can easily push down into the dirt." }, { name: "Bulbing", startDay: 15, waterDays: 2, water: "Standard soak.", feedDays: null, feed: "None", pruning: "Keep area weed-free.", tip: "Lightning fast. Harvest promptly right around Day 25 to free up root space." }]},
  "Carrots": { color: "#ffb703", method: "DIRECT SOW (Scatter & Thin)", quantity: "Thin to 9", depth: "1/4 inch", harvest: "70-80 days", phases: [{ name: "Germination", startDay: 0, waterDays: 1, water: "Needs daily moisture! Use cardboard trick.", feedDays: null, feed: "None required yet.", pruning: "Do not touch the soil surface.", tip: "Seeds are tiny and take forever to sprout. Keep the cardboard on until you see green." }, { name: "Maturation", startDay: 21, waterDays: 3, water: "Deep soak every 3 days.", feedDays: 21, feed: "Light Fish Emulsion (5-1-1)", pruning: "Thin down to a conservative 9 per sq ft.", tip: "When weeding, cut weeds at the base rather than pulling, so you don't disturb the carrot taproots." }, { name: "Harvest Window", startDay: 65, waterDays: 3, water: "Standard soak.", feedDays: null, feed: "None", pruning: "None.", tip: "A light frost actually forces sugars into the root. Leave them in the ground until you need to eat them." }]},
  "Buttercrunch & Romaine": { color: "#90be6d", method: "DIRECT SOW (Precision Poke)", quantity: "4 seeds", depth: "Surface", harvest: "55-65 days", phases: [{ name: "Seedling", startDay: 0, waterDays: 2, water: "Keep surface damp.", feedDays: 14, feed: "Light Fish Emulsion (5-1-1)", pruning: "Snip weakest sprouts.", tip: "Lettuce needs light to germinate. Press seeds firmly into dirt, do not bury them." }, { name: "Growth", startDay: 25, waterDays: 2, water: "Standard soak.", feedDays: 14, feed: "Fish Emulsion", pruning: "Harvest outer leaves only.", tip: "Pick the outermost leaves for salads and the center will keep growing." }]},
  "Arugula": { color: "#73a942", method: "DIRECT SOW (Scatter & Thin)", quantity: "Thin to 9", depth: "1/2 inch", harvest: "40-50 days", phases: [{ name: "Growth", startDay: 0, waterDays: 2, water: "Standard soak.", feedDays: 14, feed: "Light Fish Emulsion (5-1-1)", pruning: "Thin to 9 plants.", tip: "Flea beetles love arugula. Keep an eye out for tiny holes in the leaves." }, { name: "Harvest", startDay: 30, waterDays: 2, water: "Standard soak.", feedDays: 14, feed: "Light Fish Emulsion", pruning: "Cut leaves 1 inch above soil.", tip: "Continuous Harvest Secret: Never pull the roots. Just cut the leaves and it will regrow." }]},
  "Spinach": { color: "#538d22", method: "DIRECT SOW (Precision Poke)", quantity: "9 seeds", depth: "1/2 inch", harvest: "40-50 days", phases: [{ name: "Growth", startDay: 0, waterDays: 2, water: "Standard soak.", feedDays: 14, feed: "Light Fish Emulsion (5-1-1)", pruning: "Keep weed free.", tip: "Loves the cool spring. If the weather gets too hot, it will 'bolt' (go to seed) and turn bitter." }, { name: "Harvest", startDay: 35, waterDays: 2, water: "Standard soak.", feedDays: 14, feed: "Light Fish Emulsion", pruning: "Cut outermost leaves.", tip: "Shade with taller crops later in the season to extend its life." }]},
  "Red Onions": { color: "#cda4f4", method: "TRANSPLANT", quantity: "4 plants", depth: "Root depth", harvest: "90-110 days", phases: [{ name: "Bulb Swelling", startDay: 0, waterDays: 3, water: "Standard deep soak.", feedDays: 28, feed: "Fish Emulsion every 4 weeks.", pruning: "Hand-pull ALL weeds immediately.", tip: "Growing Secret: Onions have tiny roots and hate competition. The bed must be perfectly weed-free." }, { name: "Curing", startDay: 80, waterDays: null, water: "CRITICAL: Stop watering entirely.", feedDays: null, feed: "None.", pruning: "Do not touch them.", tip: "When the green tops flop over, they are done growing. Let them sit in dry dirt for a week to cure the skins." }]},
  "Yellow Onions": { color: "#fcefb4", method: "TRANSPLANT", quantity: "4 plants", depth: "Root depth", harvest: "90-110 days", phases: [{ name: "Bulb Swelling", startDay: 0, waterDays: 3, water: "Standard deep soak.", feedDays: 28, feed: "Fish Emulsion every 4 weeks.", pruning: "Hand-pull ALL weeds immediately.", tip: "Growing Secret: Onions have tiny roots and hate competition. The bed must be perfectly weed-free." }, { name: "Curing", startDay: 80, waterDays: null, water: "CRITICAL: Stop watering entirely.", feedDays: null, feed: "None.", pruning: "Do not touch them.", tip: "When the green tops flop over, they are done growing. Let them sit in dry dirt for a week to cure the skins." }]},
  "Parsley": { color: "#a7c957", method: "DIRECT SOW (Precision Poke)", quantity: "2 seeds", depth: "1/4 inch", harvest: "60-70 days", phases: [{ name: "Seedling", startDay: 0, waterDays: 2, water: "Daily mist until sprout.", feedDays: 21, feed: "Light Fish Emulsion", pruning: "Snip weakest sprout.", tip: "Extremely slow to germinate. Don't give up on it." }, { name: "Growth", startDay: 30, waterDays: 2, water: "Standard soak.", feedDays: 21, feed: "Light Fish Emulsion", pruning: "Snip stems from outside in.", tip: "Always harvest from the outer edge so the center crown continues pushing new growth." }]},
  "Cilantro": { color: "#a7c957", method: "DIRECT SOW (Precision Poke)", quantity: "2 seeds", depth: "1/4 inch", harvest: "60-70 days", phases: [{ name: "Seedling", startDay: 0, waterDays: 2, water: "Daily mist until sprout.", feedDays: 21, feed: "Light Fish Emulsion", pruning: "Snip weakest sprout.", tip: "Crack the round seed shell gently before planting to speed up germination." }, { name: "Growth", startDay: 25, waterDays: 2, water: "Standard soak.", feedDays: 21, feed: "Light Fish Emulsion", pruning: "Harvest aggressively.", tip: "Bolts instantly in high heat. Cut it often to delay flowering." }]},
  "Broccoli": { color: "#4c956c", method: "TRANSPLANT", quantity: "1 plant", depth: "Crown level", harvest: "50-70 days", phases: [{ name: "Heavy Growth", startDay: 0, waterDays: 3, water: "Deep soak 2-3x a week.", feedDays: 21, feed: "High Nitrogen (2 Tbsp/gal)", pruning: "Check under leaves for eggs.", tip: "Very heavy feeder. Watch out for little white moths—they lay the green cabbage looper caterpillars." }, { name: "Fruiting", startDay: 45, waterDays: 3, water: "Deep soak.", feedDays: 21, feed: "High Nitrogen", pruning: "Cut main head before it flowers.", tip: "Harvest the big head while it's tight. If you see yellow flowers, you waited too long." }, { name: "Side-Shoots", startDay: 60, waterDays: 3, water: "Deep soak.", feedDays: 21, feed: "High Nitrogen", pruning: "Harvest mini-florets.", tip: "After cutting the main head, leave the plant! It will push out smaller side-shoots for weeks." }]},
  "Dwarf Siberian Kale": { color: "#2c6e49", method: "TRANSPLANT", quantity: "1 plant", depth: "Crown level", harvest: "50-70 days", phases: [{ name: "Growth", startDay: 0, waterDays: 3, water: "Standard soak.", feedDays: 21, feed: "High Nitrogen Fish Emulsion", pruning: "Harvest outermost leaves.", tip: "Twist leaves off downwards to snap them cleanly from the main stalk." }, { name: "Late Season", startDay: 60, waterDays: 3, water: "Standard soak.", feedDays: 21, feed: "High Nitrogen Fish Emulsion", pruning: "Keep harvesting.", tip: "A light frost causes the plant to push sugars into the leaves, making them significantly sweeter." }]},
  "Collard Greens": { color: "#6a994e", method: "TRANSPLANT", quantity: "1 plant", depth: "Crown level", harvest: "50-70 days", phases: [{ name: "Growth", startDay: 0, waterDays: 3, water: "Standard soak.", feedDays: 21, feed: "High Nitrogen Fish Emulsion", pruning: "Harvest outermost leaves.", tip: "Just like kale, harvest from the bottom up. The plant will eventually look like a small palm tree." }]},
  "Sugar Snap Peas": { color: "#d9ed92", method: "DIRECT SOW (Precision Poke)", quantity: "9 seeds", depth: "1 inch", harvest: "60-70 days", phases: [{ name: "Climbing", startDay: 0, waterDays: 2, water: "Standard soak.", feedDays: 21, feed: "Light Fish Emulsion", pruning: "Guide tendrils to trellis.", tip: "Peas hate hot weather. Get them climbing the trellis early so they get good airflow." }, { name: "Fruiting", startDay: 45, waterDays: 2, water: "Standard soak.", feedDays: null, feed: "None (Nitrogen Fixer)", pruning: "Harvest every 1-2 days.", tip: "The more you pick, the more flowers it pushes. Never let a pod get overly fat and bumpy." }]},
  "Green Beans": { color: "#b5e48c", method: "DIRECT SOW (Precision Poke)", quantity: "9 seeds", depth: "1 inch", harvest: "50-60 days", phases: [{ name: "Climbing", startDay: 0, waterDays: 2, water: "Standard soak.", feedDays: 21, feed: "Light Fish Emulsion", pruning: "Guide to trellis.", tip: "Beans are nitrogen fixers. They pull their own food from the air, so don't over-fertilize them." }, { name: "Fruiting", startDay: 40, waterDays: 2, water: "Standard soak.", feedDays: null, feed: "None", pruning: "Harvest every 1-2 days.", tip: "Pick them when they are slender. If you can see the beans bulging inside the pod, they will be tough." }]},
  "Cucumbers": { color: "#52b788", method: "DIRECT SOW (Precision Poke)", quantity: "2 seeds (thin to 1)", depth: "1 inch", harvest: "50-70 days", phases: [{ name: "Vining", startDay: 0, waterDays: 2, water: "Heavy drinker. Deep soak.", feedDays: 14, feed: "Light Fish Emulsion", pruning: "Snip weakest seedling.", tip: "Poke 2 seeds per hole, snip the weakest one. Train the surviving vine up the trellis immediately." }, { name: "Fruiting", startDay: 45, waterDays: 2, water: "Heavy deep soak.", feedDays: 14, feed: "Fruiting Fertilizer (2-8-4)", pruning: "Pick continuously.", tip: "Water is critical now. A thirsty cucumber plant will produce bitter, twisted fruit." }]},
  "Roma Tomato": { color: "#e63946", method: "TRANSPLANT (Deep Trench)", quantity: "1 massive plant", depth: "Bury stem deep", harvest: "65-85 days", phases: [{ name: "Vegetative", startDay: 0, waterDays: 3, water: "Deep root soak. Keep leaves dry.", feedDays: 14, feed: "Start with 4-4-4.", pruning: "Pinch off early armpit suckers.", tip: "Transplanting Secret: Strip the bottom leaves and bury the stem horizontally. The buried stem will grow a massive taproot." }, { name: "Heavy Growth", startDay: 30, waterDays: 3, water: "Deep root soak.", feedDays: 14, feed: "Switch to 2-8-4.", pruning: "Aggressive pruning. Clear bottom 12 inches.", tip: "Remove all branches touching the ground. Soil splashing onto leaves is how blight starts." }, { name: "Ripening", startDay: 60, waterDays: 5, water: "Cut water volume by 50%.", feedDays: 14, feed: "Fruiting Fertilizer (2-8-4)", pruning: "Maintain airflow.", tip: "Fruiting Secret: Drought stress forces the plant to panic and dump all its sugars into ripening the fruit. Less water = better flavor." }]},
  "Beefsteak": { color: "#d62828", method: "TRANSPLANT (Deep Trench)", quantity: "1 massive plant", depth: "Bury stem deep", harvest: "80-90 days", phases: [{ name: "Vegetative", startDay: 0, waterDays: 3, water: "Deep root soak.", feedDays: 14, feed: "Start with 4-4-4.", pruning: "Pinch suckers.", tip: "Bury the stem deep. You are building the root engine right now." }, { name: "Heavy Growth", startDay: 35, waterDays: 3, water: "Deep root soak.", feedDays: 14, feed: "Switch to 2-8-4.", pruning: "Clear bottom 12 inches.", tip: "These are heavy tomatoes. Make sure your trellis or cage is fully secured." }, { name: "Ripening", startDay: 70, waterDays: 5, water: "Cut water volume by 50%.", feedDays: 14, feed: "Fruiting Fertilizer (2-8-4)", pruning: "Maintain airflow.", tip: "Drought stress forces ripening. Pick them right as they 'blush' red and let them finish ripening on the kitchen counter to prevent bug damage." }]},
  "Cherry Tomato": { color: "#f25c54", method: "TRANSPLANT (Deep Trench)", quantity: "1 massive plant", depth: "Bury stem deep", harvest: "65-75 days", phases: [{ name: "Vegetative", startDay: 0, waterDays: 3, water: "Deep root soak.", feedDays: 14, feed: "Start with 4-4-4.", pruning: "Pinch early suckers only.", tip: "Bury stem deep. Establish the roots." }, { name: "Wild Fruiting", startDay: 40, waterDays: 4, water: "Consistent deep soak.", feedDays: 14, feed: "Fruiting Fertilizer (2-8-4).", pruning: "Let it vine out wildly.", tip: "Fruiting Secret: Cherry tomatoes are chaotic. Unlike Romas, you don't need to strictly prune suckers. Let them become a massive bush over the trellis." }]},
  "Tomatillo": { color: "#a7c957", method: "TRANSPLANT", quantity: "1 massive plant", depth: "Bury stem deep", harvest: "65-85 days", phases: [{ name: "Growth & Bloom", startDay: 0, waterDays: 3, water: "Deep soak base, not leaves.", feedDays: 21, feed: "Fruiting Fertilizer (2-8-4)", pruning: "Cage immediately.", tip: "Strictly not self-pollinating. If one plant dies, the other will drop empty husks. Protect them both." }, { name: "Fruiting", startDay: 50, waterDays: 3, water: "Deep soak.", feedDays: 21, feed: "Fruiting Fertilizer (2-8-4)", pruning: "Support heavy branches.", tip: "Harvest when the green fruit completely fills the papery husk and the husk splits open at the bottom." }]},
  "Basil": { color: "#74c69d", method: "TRANSPLANT", quantity: "4 plants", depth: "Crown level", harvest: "30-40 days", phases: [{ name: "Growth", startDay: 0, waterDays: 2, water: "Standard soak.", feedDays: 21, feed: "Light Fish Emulsion", pruning: "Pinch top clusters.", tip: "Never let it flower. Pinch the top leaves off so it bushes outwards into a massive shrub." }]},
  "Thai Basil": { color: "#52b788", method: "TRANSPLANT", quantity: "4 plants", depth: "Crown level", harvest: "30-40 days", phases: [{ name: "Growth", startDay: 0, waterDays: 2, water: "Standard soak.", feedDays: 21, feed: "Light Fish Emulsion", pruning: "Pinch top clusters.", tip: "Great companion for tomatoes, the heavy scent masks the smell of the tomatoes from pests." }]},
  "Bell Pepper": { color: "#f4a261", method: "TRANSPLANT", quantity: "1 plant", depth: "Crown level", harvest: "70-80 days", phases: [{ name: "Frame Building", startDay: 0, waterDays: 3, water: "Consistent deep watering.", feedDays: 21, feed: "Start with 4-4-4.", pruning: "Pluck the very first blossoms.", tip: "Growing Secret: Pluck the first round of flowers off so the plant builds a stronger physical frame first." }, { name: "Fruiting", startDay: 45, waterDays: 4, water: "Slight stress before picking.", feedDays: 14, feed: "Fruiting Fertilizer (2-8-4).", pruning: "Provide stake support.", tip: "You can eat them green, but if you leave them on the plant for another 2-3 weeks they will turn red and sweeten dramatically." }]},
  "Jalapeno": { color: "#2a9d8f", method: "TRANSPLANT", quantity: "1 plant", depth: "Crown level", harvest: "70-80 days", phases: [{ name: "Frame Building", startDay: 0, waterDays: 3, water: "Consistent deep watering.", feedDays: 21, feed: "Start with 4-4-4.", pruning: "Pluck first blossoms.", tip: "Pinch early flowers to build a strong canopy." }, { name: "Spice Forcing", startDay: 45, waterDays: 5, water: "Drought stress before harvest.", feedDays: 14, feed: "Fruiting Fertilizer (2-8-4).", pruning: "Snip with shears.", tip: "Fruiting Secret: Heat & drought stress right before harvest spikes the capsaicin. Look for brown 'corking' lines on the skin for max spice." }]},
  "Serrano": { color: "#2a9d8f", method: "TRANSPLANT", quantity: "1 plant", depth: "Crown level", harvest: "70-80 days", phases: [{ name: "Frame Building", startDay: 0, waterDays: 3, water: "Consistent deep watering.", feedDays: 21, feed: "Start with 4-4-4.", pruning: "Pluck first blossoms.", tip: "Pinch early flowers to build a strong canopy." }, { name: "Spice Forcing", startDay: 45, waterDays: 5, water: "Drought stress before harvest.", feedDays: 14, feed: "Fruiting Fertilizer (2-8-4).", pruning: "Snip with shears.", tip: "Smaller and significantly spicier than Jalapenos. Drought stress increases the heat." }]},
  "Thai Hot": { color: "#e63946", method: "TRANSPLANT", quantity: "1 plant", depth: "Crown level", harvest: "70-80 days", phases: [{ name: "Frame Building", startDay: 0, waterDays: 3, water: "Consistent deep watering.", feedDays: 21, feed: "Start with 4-4-4.", pruning: "Pluck first blossoms.", tip: "Pinch early flowers to build a strong canopy." }, { name: "Spice Forcing", startDay: 45, waterDays: 5, water: "Drought stress before harvest.", feedDays: 14, feed: "Fruiting Fertilizer (2-8-4).", pruning: "Snip with shears.", tip: "Produces hundreds of tiny peppers facing straight up at the sky. They turn bright red when fully spicy." }]},
  "Shishito": { color: "#a7c957", method: "TRANSPLANT", quantity: "1 plant", depth: "Crown level", harvest: "60-70 days", phases: [{ name: "Growth", startDay: 0, waterDays: 3, water: "Consistent deep watering.", feedDays: 21, feed: "Start with 4-4-4.", pruning: "Pluck first blossoms.", tip: "Build the frame before letting it fruit." }, { name: "Harvesting", startDay: 40, waterDays: 3, water: "Standard soak.", feedDays: 14, feed: "Fruiting Fertilizer (2-8-4).", pruning: "Harvest continuously.", tip: "Harvest when they are 2-3 inches long, green, and very wrinkled. Roughly 1 in 10 will be spicy." }]},
  "Marigold": { color: "#fb8500", method: "TRANSPLANT", quantity: "1 plant", depth: "Crown level", harvest: "50 days", phases: [{ name: "Bloom", startDay: 0, waterDays: 3, water: "Standard soak.", feedDays: null, feed: "None required.", pruning: "Deadhead dead flowers.", tip: "The roots secrete a chemical that actively kills root-knot nematodes in the soil." }]},
  "Nasturtiums": { color: "#ff5400", method: "DIRECT SOW (Precision Poke)", quantity: "2 seeds", depth: "1 inch", harvest: "55-65 days", phases: [{ name: "Bloom", startDay: 0, waterDays: 3, water: "Standard soak.", feedDays: null, feed: "None required.", pruning: "Cascade over the bed edge.", tip: "A sacrificial trap crop. Aphids will attack this instead of your vegetables." }]},
  "Calendula": { color: "#ffb703", method: "DIRECT SOW (Precision Poke)", quantity: "1 seed", depth: "1/4 inch", harvest: "50-60 days", phases: [{ name: "Bloom", startDay: 0, waterDays: 3, water: "Standard soak.", feedDays: null, feed: "None required.", pruning: "Deadhead spent blooms.", tip: "Attracts predatory insects that hunt garden pests." }]},
  "SubPod": { color: "#ebd9c8", method: "INFRASTRUCTURE", quantity: "-", depth: "-", harvest: "Continuous", phases: [{ name: "Active", startDay: 0, waterDays: null, water: "Keep moist.", feedDays: null, feed: "Kitchen scraps", pruning: "-", tip: "The nutrient engine. Add brown cardboard with food scraps to balance carbon." }] },
  "Open Space": { color: "#e9ecef", method: "-", quantity: "0", depth: "-", harvest: "-", phases: [{ name: "Empty", startDay: 0, waterDays: null, water: "-", feedDays: null, feed: "-", pruning: "-", tip: "Reserved area." }] }
};

const masterCatalog = {
  "🌱 Seed Packets": ["Radish Seeds", "Carrot Seeds", "Beet Seeds", "Lettuce Seeds", "Arugula Seeds", "Spinach Seeds", "Swiss Chard Seeds", "Pea Seeds", "Green Bean Seeds", "Cucumber Seeds", "Zucchini Seeds", "Butternut Squash Seeds", "Pumpkin Seeds", "Sweet Corn Seeds", "Red Onion Seeds", "Yellow Onion Seeds", "Broccoli Seeds", "Cabbage Seeds", "Kale Seeds", "Collard Greens Seeds", "Roma Tomato Seeds", "Beefsteak Tomato Seeds", "Cherry Tomato Seeds", "Tomatillo Seeds", "Eggplant Seeds", "Bell Pepper Seeds", "Jalapeno Seeds", "Serrano Seeds", "Thai Hot Seeds", "Shishito Seeds", "Basil Seeds", "Thai Basil Seeds", "Cilantro Seeds", "Parsley Seeds", "Marigold Seeds", "Nasturtium Seeds", "Calendula Seeds", "Sunflower Seeds"],
  "🪴 Transplants": ["Lettuce Starts", "Arugula Starts", "Spinach Starts", "Swiss Chard Starts", "Pea Starts", "Green Bean Starts", "Cucumber Starts", "Zucchini Starts", "Butternut Squash Starts", "Pumpkin Starts", "Sweet Corn Starts", "Red Onion Starts", "Yellow Onion Starts", "Broccoli Starts", "Cabbage Starts", "Kale Starts", "Collard Greens Starts", "Roma Tomato Starts", "Beefsteak Starts", "Cherry Tomato Starts", "Tomatillo Starts", "Eggplant Starts", "Bell Pepper Starts", "Jalapeno Starts", "Serrano Starts", "Thai Hot Starts", "Shishito Starts", "Basil Starts", "Thai Basil Starts", "Cilantro Starts", "Parsley Starts", "Marigold Starts", "Nasturtium Starts", "Calendula Starts", "Sunflower Starts"],
  "🪨 Soils & Amendments": ["Organic Compost (Bag)", "Potting Soil (Bag)", "Coco Coir (Brick)", "Vermiculite (Bag)", "Perlite (Bag)", "Fish Emulsion (5-1-1)", "Fruiting Fertilizer (2-8-4)", "Bone Meal", "Blood Meal", "Kelp Meal", "Mycorrhizal Fungi", "Worm Blanket", "SubPod Carbon Bedding", "Straw Mulch"],
  "🛠️ Hardware": ["Drip Tubing (1/2\")", "Drip Tubing (1/4\")", "Drip Emitters", "Irrigation Stakes", "Hose Timer", "Tomato Cages", "Trellis Netting", "Korean EZ Digger", "Pruning Snips", "Twine", "Seedling Trays", "Heat Mat", "Grow Lights", "Plant Tags", "Neem Oil", "Slug/Snail Bait", "Frost Cover"]
};

// ==========================================
// MATHEMATICAL HELPER FUNCTIONS
// ==========================================
const getPlantData = (plantName) => {
  if (plantDatabase[plantName]) return { name: plantName, ...plantDatabase[plantName] };
  const key = Object.keys(plantDatabase).find(k => plantName.includes(k));
  if (key) return { name: key, ...plantDatabase[key] };
  return null;
};

const getPlantAge = (plantName, timestamps) => {
  const planted = timestamps[plantName]?.planted;
  if (!planted) return null;
  return Math.floor((new Date() - new Date(planted)) / (1000 * 60 * 60 * 24));
};

const getCurrentPhase = (plantName, timestamps) => {
  const info = getPlantData(plantName);
  if (!info || !info.phases) return null;
  const age = getPlantAge(plantName, timestamps);
  if (age === null) return info.phases[0]; 
  let current = info.phases[0];
  for (const phase of info.phases) {
    if (age >= phase.startDay) current = phase;
  }
  return current;
};

const checkNeedsAttention = (plantName, timestamps, type) => {
  const info = getPlantData(plantName);
  if (!info || !timestamps[plantName]?.planted) return false; 
  const phase = getCurrentPhase(plantName, timestamps);
  const limit = type === 'water' ? phase.waterDays : phase.feedDays;
  if (!limit) return false;
  const actionKey = type === 'water' ? 'watered' : 'fed';
  const lastAction = timestamps[plantName]?.[actionKey] || timestamps[plantName]?.planted; 
  const daysSince = (new Date() - new Date(lastAction)) / (1000 * 60 * 60 * 24);
  return daysSince >= limit;
};

const getStardewSeason = () => {
  const month = new Date().getMonth(); 
  if (month >= 2 && month <= 4) return "Spring"; 
  if (month >= 5 && month <= 7) return "Summer"; 
  if (month >= 8 && month <= 10) return "Fall"; 
  return "Winter"; 
};

const getRealDateTime = () => {
  const now = new Date();
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const dateStr = `${monthNames[now.getMonth()]} ${now.getDate()}`;
  let hours = now.getHours();
  const minutes = now.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;
  const minutesStr = minutes < 10 ? '0' + minutes : minutes;
  return `${dateStr} • ${hours}:${minutesStr} ${ampm}`;
};

const getWMOEmoji = (code, isNight = false) => {
  if (code === 0) return isNight ? '🌙' : '☀️';
  if ([1, 2, 3].includes(code)) return '☁️';
  if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code)) return '🌧️';
  if ([71, 73, 75, 77, 85, 86].includes(code)) return '❄️';
  return '⛅';
};

const getWMODesc = (code) => {
  if (code === 0) return 'Clear';
  if ([1, 2, 3].includes(code)) return 'Cloudy';
  if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code)) return 'Rain';
  return 'Varied';
};

// ==========================================
// RENDER HELPERS (GRID COMPONENT)
// ==========================================
const GridRenderer = ({ title, bedId, columns, data, onPlantClick, onBedClick, timestamps }) => (
  <View style={styles.bedSection}>
    <TouchableOpacity style={styles.bedHeader} onPress={() => onBedClick(bedId)}>
      <Text style={styles.bedHeaderText}>{title} <Text style={styles.bedHeaderIcon}>🔎 View Care</Text></Text>
    </TouchableOpacity>
    <View style={columns === 6 ? styles.grid6 : styles.grid3}>
      {data.map((plant, idx) => {
        const info = getPlantData(plant);
        const needsWater = checkNeedsAttention(plant, timestamps, 'water');
        const needsFeed = checkNeedsAttention(plant, timestamps, 'feed');
        const isPlanted = timestamps[plant]?.planted;

        return (
          <TouchableOpacity 
            key={idx} 
            style={[
              styles.gridItem, 
              columns === 6 ? styles.gridItem6 : styles.gridItem3,
              { 
                backgroundColor: info ? info.color : '#ced4da',
                borderColor: needsWater || needsFeed ? '#d62828' : '#36141a',
                borderWidth: needsWater || needsFeed ? 3 : 2,
                opacity: isPlanted || plant === "SubPod" || plant === "Open Space" ? 1 : 0.6 
              }
            ]}
            onPress={() => onPlantClick(plant)}
          >
            {(needsWater || needsFeed) && (
              <View style={{ marginBottom: 4 }}>
                <Text style={{ fontSize: 18 }}>
                  {needsWater && '💧'} {needsFeed && '🧪'}
                </Text>
              </View>
            )}
            {!isPlanted && plant !== "SubPod" && plant !== "Open Space" && (
              <View style={{ marginBottom: 2 }}>
                <Text style={{ fontSize: 14 }}>⏳</Text>
              </View>
            )}
            <Text style={styles.gridItemText}>{plant}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  </View>
);

// ==========================================
// MAIN APP COMPONENT
// ==========================================
export default function App() {
  const [fontsLoaded] = useFonts({
    VT323: VT323_400Regular,
    Silkscreen: Silkscreen_400Regular,
  });

  const [currentView, setCurrentView] = useState('planner'); 
  const [selectedPlant, setSelectedPlant] = useState(null);
  const [selectedBed, setSelectedBed] = useState(null);
  const [showFieldGuide, setShowFieldGuide] = useState(false);
  const [timestamps, setTimestamps] = useState({});
  const [timestampsLoaded, setTimestampsLoaded] = useState(false);
  
  const [weatherData, setWeatherData] = useState(null);
  const [timeData, setTimeData] = useState({ season: getStardewSeason(), realTime: getRealDateTime() });
  
  const [shoppingList, setShoppingList] = useState({});
  const [catSelection, setCatSelection] = useState("🌱 Seed Packets");
  const [itemSelection, setItemSelection] = useState(masterCatalog["🌱 Seed Packets"][0]);
  const [catalogQty, setCatalogQty] = useState(1);
  const [customName, setCustomName] = useState("");
  const [customQty, setCustomQty] = useState(1);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeData({ season: getStardewSeason(), realTime: getRealDateTime() });
    }, 60000); 
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "gardenData", "chores"), (docSnap) => {
      if (docSnap.exists()) setTimestamps(docSnap.data());
      setTimestampsLoaded(true);
    });
    const unsubShop = onSnapshot(doc(db, "gardenData", "shoppingList"), (docSnap) => {
      if (docSnap.exists()) setShoppingList(docSnap.data());
      else setShoppingList({});
    });
    return () => { unsub(); unsubShop(); };
  }, []);

  useEffect(() => {
    if (!timestampsLoaded) return;
    const fetchWeather = async () => {
      try {
        const lat = 45.4349; 
        const lon = -122.8566;
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code&hourly=temperature_2m,weather_code&temperature_unit=fahrenheit&precipitation_unit=inch&wind_speed_unit=mph&timezone=America%2FLos_Angeles&forecast_days=2`;
        const res = await fetch(url);
        const data = await res.json();
        const currentTemp = data.current.temperature_2m;
        const currentCode = data.current.weather_code;
        const nowEpoch = new Date().getTime();
        const startIndex = data.hourly.time.findIndex(t => new Date(t).getTime() >= nowEpoch) || 0;
        const next12 = [];
        for(let i=1; i<=12; i++) { 
           const tStr = data.hourly.time[startIndex + i];
           const dateObj = new Date(tStr);
           let hr = dateObj.getHours();
           const ampm = hr >= 12 ? 'PM' : 'AM';
           hr = hr % 12 || 12;
           next12.push({ 
             displayTime: `${hr} ${ampm}`, 
             temp: data.hourly.temperature_2m[startIndex + i], 
             code: data.hourly.weather_code[startIndex + i],
             isNight: dateObj.getHours() >= 18 || dateObj.getHours() < 6
           });
        }
        setWeatherData({ current: { temp: currentTemp, code: currentCode }, hourly: next12 });
        const rainCodes = [51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82, 95, 96, 99];
        if (rainCodes.includes(currentCode)) {
          const todayStr = new Date().toDateString();
          if (timestamps['system']?.lastNatureWater !== todayStr) triggerNatureWatering(todayStr, timestamps);
        }
      } catch (error) { console.error("Weather error", error); }
    };
    fetchWeather();
  }, [timestampsLoaded]); 

  const triggerNatureWatering = async (todayStr, currentData) => {
    const now = new Date().toISOString();
    const newData = { ...currentData }; 
    Object.keys(plantDatabase).forEach(plant => {
      if (plantDatabase[plant].method !== "-" && plantDatabase[plant].method !== "INFRASTRUCTURE" && newData[plant]?.planted) {
        newData[plant] = { ...newData[plant], watered: now };
      }
    });
    newData['system'] = { ...newData['system'], lastNatureWater: todayStr };
    await setDoc(doc(db, "gardenData", "chores"), newData, { merge: true });
  };

  const handleManualRainLog = () => {
    Alert.alert("Log Rain", "Did it rain heavily today? This will reset all watering timers.", [
      { text: "Cancel", style: "cancel" },
      { text: "Confirm", onPress: () => triggerNatureWatering(new Date().toDateString(), timestamps) }
    ]);
  };

  const markAction = async (plantName, actionType) => {
    const now = new Date().toISOString();
    const currentData = { ...timestamps };
    if (!currentData[plantName]) currentData[plantName] = {};
    currentData[plantName][actionType] = now;
    await setDoc(doc(db, "gardenData", "chores"), currentData, { merge: true });
  };

  const handleAddToList = async (name, qty) => {
    if (!name.trim()) return;
    const count = parseInt(qty) || 1;
    const currentData = { ...shoppingList };
    if (currentData[name]) {
      currentData[name].quantity += count;
      currentData[name].checked = false; 
    } else {
      currentData[name] = { quantity: count, checked: false };
    }
    await setDoc(doc(db, "gardenData", "shoppingList"), currentData);
    setCustomName(""); setCustomQty(1); setCatalogQty(1);
  };

  const toggleShopItem = async (name) => {
    const currentData = { ...shoppingList };
    currentData[name].checked = !currentData[name].checked;
    await setDoc(doc(db, "gardenData", "shoppingList"), currentData);
  };

  const clearCheckedItems = async () => {
    const currentData = { ...shoppingList };
    Object.keys(currentData).forEach(key => { if (currentData[key].checked) delete currentData[key]; });
    await setDoc(doc(db, "gardenData", "shoppingList"), currentData);
  };

  const bed1 = ["SubPod", "SubPod", "SubPod", "Radishes", "Carrots", "Buttercrunch & Romaine", "SubPod", "SubPod", "SubPod", "Radishes", "Carrots", "Arugula", "SubPod", "SubPod", "SubPod", "Radishes", "Carrots", "Spinach"];
  const bed2 = ["Red Onions", "Red Onions", "Yellow Onions", "Yellow Onions", "Parsley", "Calendula", "Red Onions", "Red Onions", "Yellow Onions", "Yellow Onions", "Parsley", "Open Space", "Red Onions", "Red Onions", "Yellow Onions", "Yellow Onions", "Cilantro", "Cilantro"];
  const bed3 = ["Broccoli", "Broccoli", "Dwarf Siberian Kale", "Dwarf Siberian Kale", "Collard Greens", "Collard Greens", "Broccoli", "Broccoli", "Dwarf Siberian Kale", "Dwarf Siberian Kale", "Collard Greens", "Collard Greens", "Broccoli", "Broccoli", "Dwarf Siberian Kale", "Dwarf Siberian Kale", "Collard Greens", "Collard Greens"];
  const bed4 = ["Sugar Snap Peas", "Sugar Snap Peas", "Sugar Snap Peas", "Bell Pepper", "Jalapeno", "Serrano", "Thai Hot", "Shishito", "Marigold"];
  const bed5 = ["Cucumbers", "Cucumbers", "Cucumbers", "Green Beans", "Green Beans", "Green Beans", "Nasturtiums", "Nasturtiums", "Nasturtiums"];
  const bed6 = ["Tomatillo", "Open Space", "Open Space", "Open Space", "Tomatillo", "Open Space", "Open Space", "Open Space", "Open Space"];
  const bed7 = ["Marigold", "Roma Tomato", "Roma Tomato", "Beefsteak", "Cherry Tomato", "Marigold", "Basil", "Roma Tomato", "Roma Tomato", "Beefsteak", "Cherry Tomato", "Thai Basil", "Marigold", "Basil", "Thai Basil", "Beefsteak", "Cherry Tomato", "Marigold"];

  const info = selectedPlant ? getPlantData(selectedPlant) : null;
  const bedInfo = selectedBed ? bedDatabase[selectedBed] : null;
  let activePhase = null, plantAge = null, isPlanted = false;
  if (info) {
    activePhase = getCurrentPhase(info.name, timestamps);
    plantAge = getPlantAge(info.name, timestamps);
    isPlanted = !!timestamps[info.name]?.planted;
  }
  const isCurrentlyNight = new Date().getHours() >= 18 || new Date().getHours() < 6;

  if (!fontsLoaded) return <ActivityIndicator size="large" color="#36141a" style={{ flex: 1, backgroundColor: '#5ea740' }} />;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.h1}>{currentView === 'planner' ? "GARDEN PLANNER 2026" : "CAROL'S SHOP"}</Text>
      
      <View style={styles.stardewHud}>
        <Text style={styles.sdSeason}>{timeData.season}</Text>
        <Text style={styles.sdTimeRow}>{timeData.realTime}</Text>
      </View>

      <View style={[styles.actionButtons, { marginBottom: 25 }]}>
        <TouchableOpacity style={[styles.btnAction, styles.feed, { opacity: currentView === 'planner' ? 1 : 0.5 }]} onPress={() => setCurrentView('planner')}>
          <Text style={styles.btnActionText}>🪴 The Garden</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.btnAction, styles.water, { opacity: currentView === 'shop' ? 1 : 0.5, backgroundColor: currentView === 'shop' ? '#d62828' : '#823c11' }]} onPress={() => setCurrentView('shop')}>
          <Text style={styles.btnActionText}>🛒 Carol's Shop</Text>
        </TouchableOpacity>
      </View>

      {currentView === 'shop' && (
        <View>
          <View style={[styles.bedSection, { backgroundColor: '#fce7b1' }]}>
            <View style={[styles.bedHeader, { backgroundColor: '#823c11' }]}><Text style={styles.bedHeaderText}>Catalog Entry</Text></View>
            <Text style={styles.inputLabel}>Category (Tap to change):</Text>
            <ScrollView horizontal style={{ marginBottom: 10 }}>
              {Object.keys(masterCatalog).map(cat => (
                <TouchableOpacity key={cat} style={[styles.tabBtn, catSelection === cat && styles.tabBtnActive]} onPress={() => { setCatSelection(cat); setItemSelection(masterCatalog[cat][0]); }}>
                  <Text style={styles.tabBtnText}>{cat}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <Text style={styles.inputLabel}>Item (Tap to change):</Text>
            <ScrollView horizontal style={{ marginBottom: 10 }}>
              {masterCatalog[catSelection].map(item => (
                <TouchableOpacity key={item} style={[styles.tabBtn, itemSelection === item && styles.tabBtnActive]} onPress={() => setItemSelection(item)}>
                  <Text style={styles.tabBtnText}>{item}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <View style={styles.qtyControl}>
              <TouchableOpacity style={styles.qtyBtn} onPress={() => setCatalogQty(Math.max(1, catalogQty - 1))}><Text style={styles.qtyBtnText}>-</Text></TouchableOpacity>
              <TextInput style={[styles.sdInput, styles.qtyInput]} value={String(catalogQty)} keyboardType="numeric" onChangeText={t => setCatalogQty(parseInt(t)||1)} />
              <TouchableOpacity style={styles.qtyBtn} onPress={() => setCatalogQty(catalogQty + 1)}><Text style={styles.qtyBtnText}>+</Text></TouchableOpacity>
              <TouchableOpacity style={[styles.btnAction, styles.feed, { flex: 1, marginLeft: 10 }]} onPress={() => handleAddToList(itemSelection, catalogQty)}><Text style={styles.btnActionText}>Add</Text></TouchableOpacity>
            </View>
          </View>

          <View style={[styles.bedSection, { backgroundColor: '#fce7b1' }]}>
            <View style={[styles.bedHeader, { backgroundColor: '#823c11' }]}><Text style={styles.bedHeaderText}>Custom Item Request</Text></View>
            <TextInput style={[styles.sdInput, { marginBottom: 15 }]} placeholder="e.g. Hose, Snips" value={customName} onChangeText={setCustomName} />
            <View style={styles.qtyControl}>
              <TouchableOpacity style={styles.qtyBtn} onPress={() => setCustomQty(Math.max(1, customQty - 1))}><Text style={styles.qtyBtnText}>-</Text></TouchableOpacity>
              <TextInput style={[styles.sdInput, styles.qtyInput]} value={String(customQty)} keyboardType="numeric" onChangeText={t => setCustomQty(parseInt(t)||1)} />
              <TouchableOpacity style={styles.qtyBtn} onPress={() => setCustomQty(customQty + 1)}><Text style={styles.qtyBtnText}>+</Text></TouchableOpacity>
              <TouchableOpacity style={[styles.btnAction, styles.water, { flex: 1, marginLeft: 10 }]} onPress={() => handleAddToList(customName, customQty)}><Text style={styles.btnActionText}>Add</Text></TouchableOpacity>
            </View>
          </View>

          <View style={styles.bedSection}>
            <View style={styles.bedHeader}><Text style={styles.bedHeaderText}>Active Shopping List</Text></View>
            {Object.keys(shoppingList).length === 0 ? <Text style={styles.emptyText}>Empty List</Text> : 
              Object.entries(shoppingList).map(([itemName, data]) => (
                <TouchableOpacity key={itemName} style={[styles.shopItem, data.checked && styles.shopItemChecked]} onPress={() => toggleShopItem(itemName)}>
                  <Text style={[styles.shopItemText, data.checked && styles.shopItemTextChecked]}>{itemName}</Text>
                  <View style={styles.shopQtyBadge}><Text style={styles.shopQtyBadgeText}>x{data.quantity}</Text></View>
                </TouchableOpacity>
            ))}
            {Object.values(shoppingList).some(item => item.checked) && (
              <TouchableOpacity style={[styles.btnAction, { backgroundColor: '#d62828', width: '100%', marginTop: 20 }]} onPress={clearCheckedItems}><Text style={styles.btnActionText}>🗑️ Clear Checked</Text></TouchableOpacity>
            )}
          </View>
        </View>
      )}

      {currentView === 'planner' && (
        <View>
          {weatherData && (
            <View style={styles.weatherBoard}>
              <View style={styles.weatherCurrentHeader}>
                <View style={styles.weatherStat}>
                  <Text style={styles.weatherLabel}>Current Setup</Text>
                  <Text style={styles.weatherTemp}>{Math.round(weatherData.current.temp)}° {getWMOEmoji(weatherData.current.code, isCurrentlyNight)}</Text>
                  <Text style={styles.weatherDesc}>{getWMODesc(weatherData.current.code)}</Text>
                </View>
                <Text style={{ fontSize: 36, paddingRight: 10 }}>📍</Text>
              </View>
              <ScrollView horizontal style={styles.weatherHourlyContainer}>
                {weatherData.hourly.map((hour, i) => (
                  <View key={i} style={styles.weatherHourBlock}>
                    <Text style={styles.weatherHourTime}>{hour.displayTime}</Text>
                    <Text style={{ fontSize: 24, marginVertical: 4 }}>{getWMOEmoji(hour.code, hour.isNight)}</Text>
                    <Text style={styles.weatherHourTemp}>{Math.round(hour.temp)}°</Text>
                  </View>
                ))}
              </ScrollView>
            </View>
          )}

          <View style={[styles.actionButtons, { marginBottom: 20 }]}>
            <TouchableOpacity style={[styles.btnAction, styles.feed]} onPress={() => setShowFieldGuide(true)}><Text style={styles.btnActionText}>📖 Field Guide</Text></TouchableOpacity>
            <TouchableOpacity style={[styles.btnAction, styles.water]} onPress={handleManualRainLog}><Text style={styles.btnActionText}>🌧️ Log Rain</Text></TouchableOpacity>
          </View>

          <GridRenderer bedId="bed1" title="BED 1 • Roots & Greens" columns={6} data={bed1} onPlantClick={setSelectedPlant} onBedClick={setSelectedBed} timestamps={timestamps} />
          <GridRenderer bedId="bed2" title="BED 2 • Allium & Herb" columns={6} data={bed2} onPlantClick={setSelectedPlant} onBedClick={setSelectedBed} timestamps={timestamps} />
          <GridRenderer bedId="bed3" title="BED 3 • Brassicas" columns={6} data={bed3} onPlantClick={setSelectedPlant} onBedClick={setSelectedBed} timestamps={timestamps} />
          
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <View style={{ flex: 1 }}><GridRenderer bedId="bed4" title="BED 4" columns={3} data={bed4} onPlantClick={setSelectedPlant} onBedClick={setSelectedBed} timestamps={timestamps} /></View>
            <View style={{ flex: 1 }}><GridRenderer bedId="bed5" title="BED 5" columns={3} data={bed5} onPlantClick={setSelectedPlant} onBedClick={setSelectedBed} timestamps={timestamps} /></View>
            <View style={{ flex: 1 }}><GridRenderer bedId="bed6" title="BED 6" columns={3} data={bed6} onPlantClick={setSelectedPlant} onBedClick={setSelectedBed} timestamps={timestamps} /></View>
          </View>
          <GridRenderer bedId="bed7" title="BED 7 • Tomato & Basil Haven" columns={6} data={bed7} onPlantClick={setSelectedPlant} onBedClick={setSelectedBed} timestamps={timestamps} />
        </View>
      )}

      {/* MODALS */}
      <Modal transparent visible={showFieldGuide} animationType="fade">
        <TouchableOpacity style={styles.modalOverlay} onPress={() => setShowFieldGuide(false)}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}><Text style={styles.modalHeaderText}>MASTER FIELD GUIDE</Text></View>
            <ScrollView style={styles.modalBody}>
              <Text style={styles.guideTitle}>The 3-Step Seed Watering Strategy</Text>
              <Text style={styles.guideText}>1. The Pre-Soak: Soak the bed the evening before planting.</Text>
              <Text style={styles.guideText}>2. The Cardboard Trick: Lay brown cardboard over seeds to trap moisture.</Text>
              <Text style={styles.guideText}>3. The Weaning Phase: Transition to deeper waterings every 2-3 days.</Text>
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>

      <Modal transparent visible={!!selectedPlant} animationType="fade">
        <TouchableOpacity style={styles.modalOverlay} onPress={() => setSelectedPlant(null)}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}><Text style={styles.modalHeaderText}>{info?.name}</Text></View>
            <ScrollView style={styles.modalBody}>
              {!isPlanted && info?.method !== "INFRASTRUCTURE" ? (
                <TouchableOpacity style={[styles.btnAction, styles.feed]} onPress={() => markAction(info.name, 'planted')}><Text style={styles.btnActionText}>🌱 MARK PLANTED</Text></TouchableOpacity>
              ) : (
                <View>
                  <View style={styles.phaseBanner}><Text style={styles.phaseBannerText}>{activePhase?.name} (Day {plantAge})</Text></View>
                  <View style={styles.actionButtons}>
                    <TouchableOpacity style={[styles.btnAction, styles.water]} onPress={() => markAction(info.name, 'watered')}><Text style={styles.btnActionText}>💦 Water</Text></TouchableOpacity>
                    <TouchableOpacity style={[styles.btnAction, styles.feed]} onPress={() => markAction(info.name, 'fed')}><Text style={styles.btnActionText}>🧪 Feed</Text></TouchableOpacity>
                  </View>
                </View>
              )}
              <View style={styles.infoBox}><Text style={styles.infoBoxTitle}>✂️ Pruning</Text><Text style={styles.infoBoxText}>{activePhase?.pruning}</Text></View>
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>

      <Modal transparent visible={!!selectedBed} animationType="fade">
        <TouchableOpacity style={styles.modalOverlay} onPress={() => setSelectedBed(null)}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}><Text style={styles.modalHeaderText}>{bedInfo?.title}</Text></View>
            <ScrollView style={styles.modalBody}>
              <Text style={styles.focusText}>Focus: {bedInfo?.focus}</Text>
              <View style={styles.infoBox}><Text style={styles.infoBoxTitle}>⛏️ Soil Prep</Text><Text style={styles.infoBoxText}>{bedInfo?.soilPrep}</Text></View>
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>

    </ScrollView>
  );
}

// ==========================================
// STYLESHEET (STARDEW AESTHETIC)
// ==========================================
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#5ea740' },
  contentContainer: { padding: 10, paddingTop: 50, paddingBottom: 50 },
  h1: { fontFamily: 'Silkscreen', fontSize: 24, color: '#ffda9e', textAlign: 'center', marginBottom: 15 },
  stardewHud: { backgroundColor: '#ffda9e', borderWidth: 4, borderColor: '#823c11', padding: 10, marginBottom: 20, alignSelf: 'flex-end' },
  sdSeason: { fontFamily: 'Silkscreen', fontSize: 16, color: '#823c11' },
  sdTimeRow: { fontFamily: 'VT323', fontSize: 22, color: '#36141a' },
  actionButtons: { flexDirection: 'row', justifyContent: 'space-between', gap: 10 },
  btnAction: { flex: 1, borderWidth: 4, borderColor: '#36141a', padding: 12, alignItems: 'center' },
  feed: { backgroundColor: '#5ea740' },
  water: { backgroundColor: '#2a9d8f' },
  btnActionText: { fontFamily: 'Silkscreen', fontSize: 14, color: '#fff' },
  weatherBoard: { backgroundColor: '#ffda9e', borderWidth: 4, borderColor: '#823c11', padding: 15, marginBottom: 20 },
  weatherCurrentHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  weatherStat: { flex: 1 },
  weatherLabel: { fontFamily: 'Silkscreen', fontSize: 14, color: '#823c11' },
  weatherTemp: { fontFamily: 'VT323', fontSize: 32, color: '#36141a' },
  weatherDesc: { fontFamily: 'VT323', fontSize: 18, color: '#36141a' },
  weatherHourlyContainer: { flexDirection: 'row' },
  weatherHourBlock: { alignItems: 'center', marginRight: 15 },
  weatherHourTime: { fontFamily: 'VT323', fontSize: 14, color: '#823c11' },
  weatherHourTemp: { fontFamily: 'VT323', fontSize: 16, color: '#36141a' },
  bedSection: { backgroundColor: '#823c11', borderWidth: 4, borderColor: '#36141a', padding: 8, marginBottom: 20 },
  bedHeader: { backgroundColor: '#ffda9e', borderWidth: 2, borderColor: '#36141a', padding: 8, marginBottom: 10 },
  bedHeaderText: { fontFamily: 'Silkscreen', fontSize: 12, color: '#36141a' },
  bedHeaderIcon: { fontFamily: 'VT323', fontSize: 14 },
  grid6: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  grid3: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  gridItem: { padding: 4, marginBottom: 6, alignItems: 'center', justifyContent: 'center', minHeight: 65 },
  gridItem6: { width: '15.5%' },
  gridItem3: { width: '31%' },
  gridItemText: { fontFamily: 'VT323', fontSize: 11, color: '#36141a', textAlign: 'center' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', padding: 15 },
  modalContent: { backgroundColor: '#ffda9e', borderWidth: 6, borderColor: '#823c11', maxHeight: '85%' },
  modalHeader: { backgroundColor: '#823c11', padding: 12 },
  modalHeaderText: { fontFamily: 'Silkscreen', fontSize: 14, color: '#ffda9e' },
  modalBody: { padding: 15 },
  inputLabel: { fontFamily: 'VT323', fontSize: 18, color: '#36141a', marginBottom: 5 },
  tabBtn: { backgroundColor: '#d4a055', borderWidth: 2, borderColor: '#823c11', padding: 8, marginRight: 8 },
  tabBtnActive: { backgroundColor: '#5ea740', borderColor: '#36141a' },
  tabBtnText: { fontFamily: 'VT323', fontSize: 16, color: '#36141a' },
  sdInput: { backgroundColor: '#fff', borderWidth: 2, borderColor: '#823c11', padding: 10, fontFamily: 'VT323', fontSize: 18 },
  qtyControl: { flexDirection: 'row', alignItems: 'center' },
  qtyBtn: { backgroundColor: '#d4a055', borderWidth: 2, borderColor: '#823c11', width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  qtyBtnText: { fontFamily: 'VT323', fontSize: 24 },
  qtyInput: { width: 50, textAlign: 'center', marginHorizontal: 10 },
  shopItem: { backgroundColor: '#ffda9e', borderWidth: 2, borderColor: '#823c11', padding: 10, marginBottom: 8, flexDirection: 'row', justifyContent: 'space-between' },
  shopItemChecked: { opacity: 0.5, backgroundColor: '#d4a055' },
  shopItemText: { fontFamily: 'VT323', fontSize: 20 },
  shopItemTextChecked: { textDecorationLine: 'line-through' },
  shopQtyBadge: { backgroundColor: '#36141a', paddingHorizontal: 6 },
  shopQtyBadgeText: { color: '#fff', fontFamily: 'VT323', fontSize: 14 },
  emptyText: { fontFamily: 'VT323', fontSize: 20, textAlign: 'center', padding: 20 },
  focusText: { fontFamily: 'VT323', fontSize: 22, textAlign: 'center', fontStyle: 'italic', color: '#823c11', marginBottom: 15 },
  infoBox: { backgroundColor: '#d4a055', borderWidth: 2, borderColor: '#823c11', padding: 10, marginBottom: 10 },
  infoBoxTitle: { fontFamily: 'VT323', fontSize: 20, fontWeight: 'bold' },
  infoBoxText: { fontFamily: 'VT323', fontSize: 18 },
  guideTitle: { fontFamily: 'VT323', fontSize: 22, color: '#d62828', marginBottom: 5 },
  guideText: { fontFamily: 'VT323', fontSize: 18, marginBottom: 10 },
  phaseBanner: { backgroundColor: '#2b4a24', padding: 10, borderWidth: 2, marginBottom: 15 },
  phaseBannerText: { color: '#ffda9e', fontFamily: 'Silkscreen', fontSize: 12, textAlign: 'center' }
});