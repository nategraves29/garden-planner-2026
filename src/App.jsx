import React, { useState, useEffect } from 'react';
import { db } from './firebase';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';
import './App.css';

// ==========================================
// BED DATABASE
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

// ==========================================
// EVOLVING CHRONOLOGICAL PLANT DATABASE
// ==========================================
const plantDatabase = {
  "Radishes": { color: "#ff8fab", method: "DIRECT SOW (Precision Poke)", quantity: "16 seeds", depth: "1/2 inch", harvest: "25-30 days", 
    phases: [
      { name: "Sprouting", startDay: 0, waterDays: 1, water: "Daily mist to keep soil soft.", feedDays: 14, feed: "Light Fish Emulsion (5-1-1)", pruning: "Snip the weakest sprouts with scissors at the soil line.", tip: "Keep the surface wet so the roots can easily push down into the dirt." },
      { name: "Bulbing", startDay: 15, waterDays: 2, water: "Standard soak.", feedDays: null, feed: "None", pruning: "Keep area weed-free.", tip: "Lightning fast. Harvest promptly right around Day 25 to free up root space." }
    ]},
  "Carrots": { color: "#ffb703", method: "DIRECT SOW (Scatter & Thin)", quantity: "Thin to 9", depth: "1/4 inch", harvest: "70-80 days", 
    phases: [
      { name: "Germination", startDay: 0, waterDays: 1, water: "Needs daily moisture! Use cardboard trick.", feedDays: null, feed: "None required yet.", pruning: "Do not touch the soil surface.", tip: "Seeds are tiny and take forever to sprout. Keep the cardboard on until you see green." },
      { name: "Maturation", startDay: 21, waterDays: 3, water: "Deep soak every 3 days.", feedDays: 21, feed: "Light Fish Emulsion (5-1-1)", pruning: "Thin down to a conservative 9 per sq ft.", tip: "When weeding, cut weeds at the base rather than pulling, so you don't disturb the carrot taproots." },
      { name: "Harvest Window", startDay: 65, waterDays: 3, water: "Standard soak.", feedDays: null, feed: "None", pruning: "None.", tip: "A light frost actually forces sugars into the root. Leave them in the ground until you need to eat them." }
    ]},
  "Buttercrunch & Romaine": { color: "#90be6d", method: "DIRECT SOW (Precision Poke)", quantity: "4 seeds", depth: "Surface", harvest: "55-65 days", 
    phases: [
      { name: "Seedling", startDay: 0, waterDays: 2, water: "Keep surface damp.", feedDays: 14, feed: "Light Fish Emulsion (5-1-1)", pruning: "Snip weakest sprouts.", tip: "Lettuce needs light to germinate. Press seeds firmly into dirt, do not bury them." },
      { name: "Growth", startDay: 25, waterDays: 2, water: "Standard soak.", feedDays: 14, feed: "Fish Emulsion", pruning: "Harvest outer leaves only.", tip: "Pick the outermost leaves for salads and the center will keep growing." }
    ]},
  "Arugula": { color: "#73a942", method: "DIRECT SOW (Scatter & Thin)", quantity: "Thin to 9", depth: "1/2 inch", harvest: "40-50 days", 
    phases: [
      { name: "Growth", startDay: 0, waterDays: 2, water: "Standard soak.", feedDays: 14, feed: "Light Fish Emulsion (5-1-1)", pruning: "Thin to 9 plants.", tip: "Flea beetles love arugula. Keep an eye out for tiny holes in the leaves." },
      { name: "Harvest", startDay: 30, waterDays: 2, water: "Standard soak.", feedDays: 14, feed: "Light Fish Emulsion", pruning: "Cut leaves 1 inch above soil.", tip: "Continuous Harvest Secret: Never pull the roots. Just cut the leaves and it will regrow." }
    ]},
  "Spinach": { color: "#538d22", method: "DIRECT SOW (Precision Poke)", quantity: "9 seeds", depth: "1/2 inch", harvest: "40-50 days", 
    phases: [
      { name: "Growth", startDay: 0, waterDays: 2, water: "Standard soak.", feedDays: 14, feed: "Light Fish Emulsion (5-1-1)", pruning: "Keep weed free.", tip: "Loves the cool spring. If the weather gets too hot, it will 'bolt' (go to seed) and turn bitter." },
      { name: "Harvest", startDay: 35, waterDays: 2, water: "Standard soak.", feedDays: 14, feed: "Light Fish Emulsion", pruning: "Cut outermost leaves.", tip: "Shade with taller crops later in the season to extend its life." }
    ]},
  "Red Onions": { color: "#cda4f4", method: "TRANSPLANT", quantity: "4 plants", depth: "Root depth", harvest: "90-110 days", 
    phases: [
      { name: "Bulb Swelling", startDay: 0, waterDays: 3, water: "Standard deep soak.", feedDays: 28, feed: "Fish Emulsion every 4 weeks.", pruning: "Hand-pull ALL weeds immediately.", tip: "Growing Secret: Onions have tiny roots and hate competition. The bed must be perfectly weed-free." },
      { name: "Curing", startDay: 80, waterDays: null, water: "CRITICAL: Stop watering entirely.", feedDays: null, feed: "None.", pruning: "Do not touch them.", tip: "When the green tops flop over, they are done growing. Let them sit in dry dirt for a week to cure the skins." }
    ]},
  "Yellow Onions": { color: "#fcefb4", method: "TRANSPLANT", quantity: "4 plants", depth: "Root depth", harvest: "90-110 days", 
    phases: [
      { name: "Bulb Swelling", startDay: 0, waterDays: 3, water: "Standard deep soak.", feedDays: 28, feed: "Fish Emulsion every 4 weeks.", pruning: "Hand-pull ALL weeds immediately.", tip: "Growing Secret: Onions have tiny roots and hate competition. The bed must be perfectly weed-free." },
      { name: "Curing", startDay: 80, waterDays: null, water: "CRITICAL: Stop watering entirely.", feedDays: null, feed: "None.", pruning: "Do not touch them.", tip: "When the green tops flop over, they are done growing. Let them sit in dry dirt for a week to cure the skins." }
    ]},
  "Parsley": { color: "#a7c957", method: "DIRECT SOW (Precision Poke)", quantity: "2 seeds", depth: "1/4 inch", harvest: "60-70 days", 
    phases: [
      { name: "Seedling", startDay: 0, waterDays: 2, water: "Daily mist until sprout.", feedDays: 21, feed: "Light Fish Emulsion", pruning: "Snip weakest sprout.", tip: "Extremely slow to germinate. Don't give up on it." },
      { name: "Growth", startDay: 30, waterDays: 2, water: "Standard soak.", feedDays: 21, feed: "Light Fish Emulsion", pruning: "Snip stems from outside in.", tip: "Always harvest from the outer edge so the center crown continues pushing new growth." }
    ]},
  "Cilantro": { color: "#a7c957", method: "DIRECT SOW (Precision Poke)", quantity: "2 seeds", depth: "1/4 inch", harvest: "60-70 days", 
    phases: [
      { name: "Seedling", startDay: 0, waterDays: 2, water: "Daily mist until sprout.", feedDays: 21, feed: "Light Fish Emulsion", pruning: "Snip weakest sprout.", tip: "Crack the round seed shell gently before planting to speed up germination." },
      { name: "Growth", startDay: 25, waterDays: 2, water: "Standard soak.", feedDays: 21, feed: "Light Fish Emulsion", pruning: "Harvest aggressively.", tip: "Bolts instantly in high heat. Cut it often to delay flowering." }
    ]},
  "Broccoli": { color: "#4c956c", method: "TRANSPLANT", quantity: "1 plant", depth: "Crown level", harvest: "50-70 days", 
    phases: [
      { name: "Heavy Growth", startDay: 0, waterDays: 3, water: "Deep soak 2-3x a week.", feedDays: 21, feed: "High Nitrogen (2 Tbsp/gal)", pruning: "Check under leaves for eggs.", tip: "Very heavy feeder. Watch out for little white moths—they lay the green cabbage looper caterpillars." },
      { name: "Fruiting", startDay: 45, waterDays: 3, water: "Deep soak.", feedDays: 21, feed: "High Nitrogen", pruning: "Cut main head before it flowers.", tip: "Harvest the big head while it's tight. If you see yellow flowers, you waited too long." },
      { name: "Side-Shoots", startDay: 60, waterDays: 3, water: "Deep soak.", feedDays: 21, feed: "High Nitrogen", pruning: "Harvest mini-florets.", tip: "After cutting the main head, leave the plant! It will push out smaller side-shoots for weeks." }
    ]},
  "Dwarf Siberian Kale": { color: "#2c6e49", method: "TRANSPLANT", quantity: "1 plant", depth: "Crown level", harvest: "50-70 days", 
    phases: [
      { name: "Growth", startDay: 0, waterDays: 3, water: "Standard soak.", feedDays: 21, feed: "High Nitrogen Fish Emulsion", pruning: "Harvest outermost leaves.", tip: "Twist leaves off downwards to snap them cleanly from the main stalk." },
      { name: "Late Season", startDay: 60, waterDays: 3, water: "Standard soak.", feedDays: 21, feed: "High Nitrogen Fish Emulsion", pruning: "Keep harvesting.", tip: "A light frost causes the plant to push sugars into the leaves, making them significantly sweeter." }
    ]},
  "Collard Greens": { color: "#6a994e", method: "TRANSPLANT", quantity: "1 plant", depth: "Crown level", harvest: "50-70 days", 
    phases: [
      { name: "Growth", startDay: 0, waterDays: 3, water: "Standard soak.", feedDays: 21, feed: "High Nitrogen Fish Emulsion", pruning: "Harvest outermost leaves.", tip: "Just like kale, harvest from the bottom up. The plant will eventually look like a small palm tree." }
    ]},
  "Sugar Snap Peas": { color: "#d9ed92", method: "DIRECT SOW (Precision Poke)", quantity: "9 seeds", depth: "1 inch", harvest: "60-70 days", 
    phases: [
      { name: "Climbing", startDay: 0, waterDays: 2, water: "Standard soak.", feedDays: 21, feed: "Light Fish Emulsion", pruning: "Guide tendrils to trellis.", tip: "Peas hate hot weather. Get them climbing the trellis early so they get good airflow." },
      { name: "Fruiting", startDay: 45, waterDays: 2, water: "Standard soak.", feedDays: null, feed: "None (Nitrogen Fixer)", pruning: "Harvest every 1-2 days.", tip: "The more you pick, the more flowers it pushes. Never let a pod get overly fat and bumpy." }
    ]},
  "Green Beans": { color: "#b5e48c", method: "DIRECT SOW (Precision Poke)", quantity: "9 seeds", depth: "1 inch", harvest: "50-60 days", 
    phases: [
      { name: "Climbing", startDay: 0, waterDays: 2, water: "Standard soak.", feedDays: 21, feed: "Light Fish Emulsion", pruning: "Guide to trellis.", tip: "Beans are nitrogen fixers. They pull their own food from the air, so don't over-fertilize them." },
      { name: "Fruiting", startDay: 40, waterDays: 2, water: "Standard soak.", feedDays: null, feed: "None", pruning: "Harvest every 1-2 days.", tip: "Pick them when they are slender. If you can see the beans bulging inside the pod, they will be tough." }
    ]},
  "Cucumbers": { color: "#52b788", method: "DIRECT SOW (Precision Poke)", quantity: "2 seeds (thin to 1)", depth: "1 inch", harvest: "50-70 days", 
    phases: [
      { name: "Vining", startDay: 0, waterDays: 2, water: "Heavy drinker. Deep soak.", feedDays: 14, feed: "Light Fish Emulsion", pruning: "Snip weakest seedling.", tip: "Poke 2 seeds per hole, snip the weakest one. Train the surviving vine up the trellis immediately." },
      { name: "Fruiting", startDay: 45, waterDays: 2, water: "Heavy deep soak.", feedDays: 14, feed: "Fruiting Fertilizer (2-8-4)", pruning: "Pick continuously.", tip: "Water is critical now. A thirsty cucumber plant will produce bitter, twisted fruit." }
    ]},
  "Roma Tomato": { color: "#e63946", method: "TRANSPLANT (Deep Trench)", quantity: "1 massive plant", depth: "Bury stem deep", harvest: "65-85 days", 
    phases: [
      { name: "Vegetative", startDay: 0, waterDays: 3, water: "Deep root soak. Keep leaves dry.", feedDays: 14, feed: "Start with 4-4-4.", pruning: "Pinch off early armpit suckers.", tip: "Transplanting Secret: Strip the bottom leaves and bury the stem horizontally. The buried stem will grow a massive taproot." },
      { name: "Heavy Growth", startDay: 30, waterDays: 3, water: "Deep root soak.", feedDays: 14, feed: "Switch to 2-8-4.", pruning: "Aggressive pruning. Clear bottom 12 inches.", tip: "Remove all branches touching the ground. Soil splashing onto leaves is how blight starts." },
      { name: "Ripening", startDay: 60, waterDays: 5, water: "Cut water volume by 50%.", feedDays: 14, feed: "Fruiting Fertilizer (2-8-4)", pruning: "Maintain airflow.", tip: "Fruiting Secret: Drought stress forces the plant to panic and dump all its sugars into ripening the fruit. Less water = better flavor." }
    ]},
  "Beefsteak": { color: "#d62828", method: "TRANSPLANT (Deep Trench)", quantity: "1 massive plant", depth: "Bury stem deep", harvest: "80-90 days", 
    phases: [
      { name: "Vegetative", startDay: 0, waterDays: 3, water: "Deep root soak.", feedDays: 14, feed: "Start with 4-4-4.", pruning: "Pinch suckers.", tip: "Bury the stem deep. You are building the root engine right now." },
      { name: "Heavy Growth", startDay: 35, waterDays: 3, water: "Deep root soak.", feedDays: 14, feed: "Switch to 2-8-4.", pruning: "Clear bottom 12 inches.", tip: "These are heavy tomatoes. Make sure your trellis or cage is fully secured." },
      { name: "Ripening", startDay: 70, waterDays: 5, water: "Cut water volume by 50%.", feedDays: 14, feed: "Fruiting Fertilizer (2-8-4)", pruning: "Maintain airflow.", tip: "Drought stress forces ripening. Pick them right as they 'blush' red and let them finish ripening on the kitchen counter to prevent bug damage." }
    ]},
  "Cherry Tomato": { color: "#f25c54", method: "TRANSPLANT (Deep Trench)", quantity: "1 massive plant", depth: "Bury stem deep", harvest: "65-75 days", 
    phases: [
      { name: "Vegetative", startDay: 0, waterDays: 3, water: "Deep root soak.", feedDays: 14, feed: "Start with 4-4-4.", pruning: "Pinch early suckers only.", tip: "Bury stem deep. Establish the roots." },
      { name: "Wild Fruiting", startDay: 40, waterDays: 4, water: "Consistent deep soak.", feedDays: 14, feed: "Fruiting Fertilizer (2-8-4).", pruning: "Let it vine out wildly.", tip: "Fruiting Secret: Cherry tomatoes are chaotic. Unlike Romas, you don't need to strictly prune suckers. Let them become a massive bush over the trellis." }
    ]},
  "Tomatillo": { color: "#a7c957", method: "TRANSPLANT", quantity: "1 massive plant", depth: "Bury stem deep", harvest: "65-85 days", 
    phases: [
      { name: "Growth & Bloom", startDay: 0, waterDays: 3, water: "Deep soak base, not leaves.", feedDays: 21, feed: "Fruiting Fertilizer (2-8-4)", pruning: "Cage immediately.", tip: "Strictly not self-pollinating. If one plant dies, the other will drop empty husks. Protect them both." },
      { name: "Fruiting", startDay: 50, waterDays: 3, water: "Deep soak.", feedDays: 21, feed: "Fruiting Fertilizer (2-8-4)", pruning: "Support heavy branches.", tip: "Harvest when the green fruit completely fills the papery husk and the husk splits open at the bottom." }
    ]},
  "Basil": { color: "#74c69d", method: "TRANSPLANT", quantity: "4 plants", depth: "Crown level", harvest: "30-40 days", 
    phases: [
      { name: "Growth", startDay: 0, waterDays: 2, water: "Standard soak.", feedDays: 21, feed: "Light Fish Emulsion", pruning: "Pinch top clusters.", tip: "Never let it flower. Pinch the top leaves off so it bushes outwards into a massive shrub." }
    ]},
  "Thai Basil": { color: "#52b788", method: "TRANSPLANT", quantity: "4 plants", depth: "Crown level", harvest: "30-40 days", 
    phases: [
      { name: "Growth", startDay: 0, waterDays: 2, water: "Standard soak.", feedDays: 21, feed: "Light Fish Emulsion", pruning: "Pinch top clusters.", tip: "Great companion for tomatoes, the heavy scent masks the smell of the tomatoes from pests." }
    ]},
  "Bell Pepper": { color: "#f4a261", method: "TRANSPLANT", quantity: "1 plant", depth: "Crown level", harvest: "70-80 days", 
    phases: [
      { name: "Frame Building", startDay: 0, waterDays: 3, water: "Consistent deep watering.", feedDays: 21, feed: "Start with 4-4-4.", pruning: "Pluck the very first blossoms.", tip: "Growing Secret: Pluck the first round of flowers off so the plant builds a stronger physical frame first." },
      { name: "Fruiting", startDay: 45, waterDays: 4, water: "Slight stress before picking.", feedDays: 14, feed: "Fruiting Fertilizer (2-8-4).", pruning: "Provide stake support.", tip: "You can eat them green, but if you leave them on the plant for another 2-3 weeks they will turn red and sweeten dramatically." }
    ]},
  "Jalapeno": { color: "#2a9d8f", method: "TRANSPLANT", quantity: "1 plant", depth: "Crown level", harvest: "70-80 days", 
    phases: [
      { name: "Frame Building", startDay: 0, waterDays: 3, water: "Consistent deep watering.", feedDays: 21, feed: "Start with 4-4-4.", pruning: "Pluck first blossoms.", tip: "Pinch early flowers to build a strong canopy." },
      { name: "Spice Forcing", startDay: 45, waterDays: 5, water: "Drought stress before harvest.", feedDays: 14, feed: "Fruiting Fertilizer (2-8-4).", pruning: "Snip with shears.", tip: "Fruiting Secret: Heat & drought stress right before harvest spikes the capsaicin. Look for brown 'corking' lines on the skin for max spice." }
    ]},
  "Serrano": { color: "#2a9d8f", method: "TRANSPLANT", quantity: "1 plant", depth: "Crown level", harvest: "70-80 days", 
    phases: [
      { name: "Frame Building", startDay: 0, waterDays: 3, water: "Consistent deep watering.", feedDays: 21, feed: "Start with 4-4-4.", pruning: "Pluck first blossoms.", tip: "Pinch early flowers to build a strong canopy." },
      { name: "Spice Forcing", startDay: 45, waterDays: 5, water: "Drought stress before harvest.", feedDays: 14, feed: "Fruiting Fertilizer (2-8-4).", pruning: "Snip with shears.", tip: "Smaller and significantly spicier than Jalapenos. Drought stress increases the heat." }
    ]},
  "Thai Hot": { color: "#e63946", method: "TRANSPLANT", quantity: "1 plant", depth: "Crown level", harvest: "70-80 days", 
    phases: [
      { name: "Frame Building", startDay: 0, waterDays: 3, water: "Consistent deep watering.", feedDays: 21, feed: "Start with 4-4-4.", pruning: "Pluck first blossoms.", tip: "Pinch early flowers to build a strong canopy." },
      { name: "Spice Forcing", startDay: 45, waterDays: 5, water: "Drought stress before harvest.", feedDays: 14, feed: "Fruiting Fertilizer (2-8-4).", pruning: "Snip with shears.", tip: "Produces hundreds of tiny peppers facing straight up at the sky. They turn bright red when fully spicy." }
    ]},
  "Shishito": { color: "#a7c957", method: "TRANSPLANT", quantity: "1 plant", depth: "Crown level", harvest: "60-70 days", 
    phases: [
      { name: "Growth", startDay: 0, waterDays: 3, water: "Consistent deep watering.", feedDays: 21, feed: "Start with 4-4-4.", pruning: "Pluck first blossoms.", tip: "Build the frame before letting it fruit." },
      { name: "Harvesting", startDay: 40, waterDays: 3, water: "Standard soak.", feedDays: 14, feed: "Fruiting Fertilizer (2-8-4).", pruning: "Harvest continuously.", tip: "Harvest when they are 2-3 inches long, green, and very wrinkled. Roughly 1 in 10 will be spicy." }
    ]},
  "Marigold": { color: "#fb8500", method: "TRANSPLANT", quantity: "1 plant", depth: "Crown level", harvest: "50 days", 
    phases: [
      { name: "Bloom", startDay: 0, waterDays: 3, water: "Standard soak.", feedDays: null, feed: "None required.", pruning: "Deadhead dead flowers.", tip: "The roots secrete a chemical that actively kills root-knot nematodes in the soil." }
    ]},
  "Nasturtiums": { color: "#ff5400", method: "DIRECT SOW (Precision Poke)", quantity: "2 seeds", depth: "1 inch", harvest: "55-65 days", 
    phases: [
      { name: "Bloom", startDay: 0, waterDays: 3, water: "Standard soak.", feedDays: null, feed: "None required.", pruning: "Cascade over the bed edge.", tip: "A sacrificial trap crop. Aphids will attack this instead of your vegetables." }
    ]},
  "Calendula": { color: "#ffb703", method: "DIRECT SOW (Precision Poke)", quantity: "1 seed", depth: "1/4 inch", harvest: "50-60 days", 
    phases: [
      { name: "Bloom", startDay: 0, waterDays: 3, water: "Standard soak.", feedDays: null, feed: "None required.", pruning: "Deadhead spent blooms.", tip: "Attracts predatory insects that hunt garden pests." }
    ]},
  "SubPod": { color: "#ebd9c8", method: "INFRASTRUCTURE", quantity: "-", depth: "-", harvest: "Continuous", 
    phases: [{ name: "Active", startDay: 0, waterDays: null, water: "Keep moist.", feedDays: null, feed: "Kitchen scraps", pruning: "-", tip: "The nutrient engine. Add brown cardboard with food scraps to balance carbon." }] },
  "Open Space": { color: "#e9ecef", method: "-", quantity: "0", depth: "-", harvest: "-", 
    phases: [{ name: "Empty", startDay: 0, waterDays: null, water: "-", feedDays: null, feed: "-", pruning: "-", tip: "Reserved area." }] }
};

const getPlantData = (plantName) => {
  if (plantDatabase[plantName]) return { name: plantName, ...plantDatabase[plantName] };
  const key = Object.keys(plantDatabase).find(k => plantName.includes(k));
  if (key) return { name: key, ...plantDatabase[key] };
  return null;
};

// ==========================================
// CHRONOLOGICAL LOGIC ENGINE
// ==========================================
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
    if (age >= phase.startDay) {
      current = phase;
    }
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

// ==========================================
// STARDEW DATE & TIME MATH
// ==========================================
const getStardewDate = () => {
  const now = new Date();
  const month = now.getMonth(); 
  let season = "Spring";
  let daysPassed = 0;

  if (month >= 2 && month <= 4) { // Mar, Apr, May
    season = "Spring";
    const start = new Date(now.getFullYear(), 2, 1);
    daysPassed = Math.floor((now - start) / (1000 * 60 * 60 * 24));
  } else if (month >= 5 && month <= 7) { // Jun, Jul, Aug
    season = "Summer";
    const start = new Date(now.getFullYear(), 5, 1);
    daysPassed = Math.floor((now - start) / (1000 * 60 * 60 * 24));
  } else if (month >= 8 && month <= 10) { // Sep, Oct, Nov
    season = "Fall";
    const start = new Date(now.getFullYear(), 8, 1);
    daysPassed = Math.floor((now - start) / (1000 * 60 * 60 * 24));
  } else { // Dec, Jan, Feb
    season = "Winter";
    let startYear = month === 11 ? now.getFullYear() : now.getFullYear() - 1;
    const start = new Date(startYear, 11, 1);
    daysPassed = Math.floor((now - start) / (1000 * 60 * 60 * 24));
  }

  // Squeeze 90-92 real days down to exactly 28 Stardew Days
  let stardewDay = Math.floor((daysPassed / 92) * 28) + 1;
  if (stardewDay > 28) stardewDay = 28;
  if (stardewDay < 1) stardewDay = 1;

  return { season, stardewDay };
};

const getStardewTime = () => {
   const now = new Date();
   let hours = now.getHours();
   const minutes = now.getMinutes();
   const ampm = hours >= 12 ? 'pm' : 'am';
   const icon = (hours >= 6 && hours < 18) ? '☀️' : '🌙';
   
   hours = hours % 12;
   hours = hours ? hours : 12; 
   const minutesStr = minutes < 10 ? '0' + minutes : minutes;
   
   return { time: `${hours}:${minutesStr} ${ampm}`, icon };
};

// ==========================================
// WEATHER HELPER
// ==========================================
const getWeatherEmoji = (iconCode) => {
  const map = {
    '01d': '☀️', '01n': '🌙', '02d': '⛅', '02n': '☁️',
    '03d': '☁️', '03n': '☁️', '04d': '☁️', '04n': '☁️',
    '09d': '🌧️', '09n': '🌧️', '10d': '🌦️', '10n': '🌧️',
    '11d': '⛈️', '11n': '⛈️', '13d': '❄️', '13n': '❄️',
    '50d': '🌫️', '50n': '🌫️'
  };
  return map[iconCode] || '🌤️';
};

// ==========================================
// RENDER HELPERS
// ==========================================
const GridRenderer = ({ title, bedId, columns, data, onPlantClick, onBedClick, timestamps }) => (
  <div className="bed-section">
    <div className="bed-header" onClick={() => onBedClick(bedId)}>
      {title} <span className="bed-header-icon">🔎 View Care</span>
    </div>
    <div className={columns === 6 ? "grid-6" : "grid-3"}>
      {data.map((plant, idx) => {
        const info = getPlantData(plant);
        const needsWater = checkNeedsAttention(plant, timestamps, 'water');
        const needsFeed = checkNeedsAttention(plant, timestamps, 'feed');
        const isPlanted = timestamps[info?.name]?.planted;

        return (
          <div 
            key={idx} 
            className="grid-item" 
            style={{ 
              backgroundColor: info ? info.color : '#ced4da',
              border: needsWater || needsFeed ? '3px solid #d62828' : '2px solid #36141a',
              opacity: isPlanted || plant === "SubPod" || plant === "Open Space" ? 1 : 0.6 
            }}
            onClick={() => onPlantClick(plant)}
          >
            {(needsWater || needsFeed) && (
              <div style={{ fontSize: '18px', marginBottom: '4px' }}>
                {needsWater && '💧'} {needsFeed && '🧪'}
              </div>
            )}
            {!isPlanted && plant !== "SubPod" && plant !== "Open Space" && (
              <div style={{ fontSize: '14px', marginBottom: '2px' }}>⏳</div>
            )}
            <span>{plant}</span>
            {info && info.quantity !== "0" && info.quantity !== "-" && (
              <span className="qty-badge">{info.quantity}</span>
            )}
            {info && info.method !== "-" && info.method !== "INFRASTRUCTURE" && (
              <span className="method-badge">[{info.method}]</span>
            )}
          </div>
        );
      })}
    </div>
  </div>
);

// ==========================================
// MAIN APP COMPONENT
// ==========================================
export default function App() {
  const [selectedPlant, setSelectedPlant] = useState(null);
  const [selectedBed, setSelectedBed] = useState(null);
  const [showFieldGuide, setShowFieldGuide] = useState(false);
  const [timestamps, setTimestamps] = useState({});
  const [timestampsLoaded, setTimestampsLoaded] = useState(false);
  const [weather, setWeather] = useState(null);
  const [timeData, setTimeData] = useState({ sdDate: getStardewDate(), sdTime: getStardewTime() });

  // 1. Start the Live Stardew Clock
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeData({ sdDate: getStardewDate(), sdTime: getStardewTime() });
    }, 60000); // Ticks every minute
    return () => clearInterval(timer);
  }, []);

  // 2. Load Firebase Data
  useEffect(() => {
    const unsub = onSnapshot(doc(db, "gardenData", "chores"), (docSnap) => {
      if (docSnap.exists()) {
        setTimestamps(docSnap.data());
      }
      setTimestampsLoaded(true);
    });
    return () => unsub();
  }, []);

  // 3. Load Weather & Execute Nature Watering
  useEffect(() => {
    if (!timestampsLoaded) return;

    const fetchWeather = async () => {
      try {
        const apiKey = '33d438637f794339203a1ed6e9c071fc';
        const loc = 'Beaverton,US'; 
        
        const currentRes = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${loc}&units=imperial&appid=${apiKey}`);
        const currentData = await currentRes.json();
        
        const forecastRes = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${loc}&units=imperial&appid=${apiKey}`);
        const forecastData = await forecastRes.json();

        if (currentData.cod === 200 && forecastData.cod === "200") {
          setWeather({ current: currentData, forecast: forecastData });

          const weatherId = currentData.weather[0].id;
          const isRaining = weatherId >= 200 && weatherId < 600;

          if (isRaining) {
            const todayStr = new Date().toDateString();
            const lastNatureWater = timestamps['system']?.lastNatureWater;

            if (lastNatureWater !== todayStr) {
              triggerNatureWatering(todayStr, timestamps);
            }
          }
        }
      } catch (error) {
        console.error("Failed to fetch weather data", error);
      }
    };

    fetchWeather();
    // eslint-disable-next-line
  }, [timestampsLoaded]); 

  const triggerNatureWatering = async (todayStr, currentData) => {
    const now = new Date().toISOString();
    const newData = { ...currentData }; 

    Object.keys(plantDatabase).forEach(plant => {
      const info = plantDatabase[plant];
      if (info.method !== "-" && info.method !== "INFRASTRUCTURE" && newData[plant]?.planted) {
        newData[plant] = { ...newData[plant], watered: now };
      }
    });

    if (!newData['system']) newData['system'] = {};
    newData['system'].lastNatureWater = todayStr;

    await setDoc(doc(db, "gardenData", "chores"), newData, { merge: true });
  };

  const handleManualRainLog = () => {
    if (window.confirm("Did it rain heavily today? This will log a 'Watered by Nature' event and reset the watering timers for all planted crops.")) {
      const todayStr = new Date().toDateString();
      triggerNatureWatering(todayStr, timestamps);
    }
  };

  const markAction = async (plantName, actionType) => {
    const now = new Date().toISOString();
    const currentData = { ...timestamps };
    if (!currentData[plantName]) currentData[plantName] = {};
    currentData[plantName][actionType] = now;
    await setDoc(doc(db, "gardenData", "chores"), currentData, { merge: true });
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

  let activePhase = null;
  let plantAge = null;
  let isPlanted = false;
  if (info) {
    activePhase = getCurrentPhase(info.name, timestamps);
    plantAge = getPlantAge(info.name, timestamps);
    isPlanted = !!timestamps[info.name]?.planted;
  }

  return (
    <div className="container">
      <h1>GARDEN PLANNER 2026</h1>
      
      {/* STARDEW DATE & TIME HUD */}
      <div className="stardew-hud">
        <div className="sd-season">{timeData.sdDate.season}. {timeData.sdDate.stardewDay}</div>
        <div className="sd-time-row">
          <span className="sd-icon">{timeData.sdTime.icon}</span>
          <span className="sd-time">{timeData.sdTime.time}</span>
        </div>
      </div>

      {/* WEATHER DASHBOARD */}
      {weather && weather.current?.main && (
        <div className="weather-board">
          <div className="weather-stat">
            <div className="weather-label">Current</div>
            <div className="weather-temp">
              {Math.round(weather.current.main.temp)}° {getWeatherEmoji(weather.current.weather[0].icon)}
            </div>
            <div className="weather-desc">{weather.current.weather[0].description}</div>
          </div>
          <div className="weather-divider"></div>
          <div className="weather-stat">
             <div className="weather-label">Next 3 Hrs</div>
             <div className="weather-temp">
                {Math.round(weather.forecast.list[1].main.temp)}° {getWeatherEmoji(weather.forecast.list[1].weather[0].icon)}
             </div>
          </div>
          <div className="weather-divider"></div>
          <div className="weather-stat">
             <div className="weather-label">Tomorrow</div>
             <div className="weather-temp">
                {Math.round(weather.forecast.list[8].main.temp)}° {getWeatherEmoji(weather.forecast.list[8].weather[0].icon)}
             </div>
          </div>
        </div>
      )}

      {/* GLOBAL ACTIONS ROW */}
      <div className="action-buttons" style={{ marginBottom: '20px' }}>
        <button className="btn-action feed" onClick={() => setShowFieldGuide(true)}>
          📖 Field Guide
        </button>
        <button className="btn-action water" onClick={handleManualRainLog}>
          🌧️ Log Rain Event
        </button>
      </div>

      <GridRenderer bedId="bed1" title="BED 1 • Roots & Greens (6x3x2')" columns={6} data={bed1} onPlantClick={setSelectedPlant} onBedClick={setSelectedBed} timestamps={timestamps} />
      <GridRenderer bedId="bed2" title="BED 2 • Allium & Herb (6x3x2')" columns={6} data={bed2} onPlantClick={setSelectedPlant} onBedClick={setSelectedBed} timestamps={timestamps} />
      <GridRenderer bedId="bed3" title="BED 3 • Brassicas (6x3x2')" columns={6} data={bed3} onPlantClick={setSelectedPlant} onBedClick={setSelectedBed} timestamps={timestamps} />

      <div className="flex-row">
        <div className="flex-col">
          <GridRenderer bedId="bed4" title="BED 4 • Pea Trellis & Peppers" columns={3} data={bed4} onPlantClick={setSelectedPlant} onBedClick={setSelectedBed} timestamps={timestamps} />
        </div>
        <div className="flex-col">
          <GridRenderer bedId="bed5" title="BED 5 • Vines & Beans" columns={3} data={bed5} onPlantClick={setSelectedPlant} onBedClick={setSelectedBed} timestamps={timestamps} />
        </div>
        <div className="flex-col">
          <GridRenderer bedId="bed6" title="BED 6 • Tomatillo Hub" columns={3} data={bed6} onPlantClick={setSelectedPlant} onBedClick={setSelectedBed} timestamps={timestamps} />
        </div>
      </div>

      <GridRenderer bedId="bed7" title="BED 7 • Tomato & Basil Haven (6x3x3')" columns={6} data={bed7} onPlantClick={setSelectedPlant} onBedClick={setSelectedBed} timestamps={timestamps} />

      {/* FIELD GUIDE MODAL */}
      {showFieldGuide && (
        <div className="modal-overlay" onClick={() => setShowFieldGuide(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              MASTER FIELD GUIDE
              <button className="close-btn" onClick={() => setShowFieldGuide(false)}>X</button>
            </div>
            <div className="modal-body" style={{ textAlign: 'left' }}>
              
              <div className="info-box-title" style={{ color: '#d62828', borderBottom: '3px dotted #823c11', paddingBottom: '5px' }}>The 3-Step Seed Watering Strategy</div>
              <p><strong>1. The Pre-Soak:</strong> Before placing a single seed in the ground, the bed must be flooded. Dry soil wicks moisture away from the delicate seed coat. Soak the bed thoroughly the evening before planting.</p>
              <p><strong>2. The Cardboard Trick:</strong> Seeds like carrots and radishes are incredibly shallow and dry out in hours under direct sun. After direct sowing and misting the surface, lay a piece of plain brown cardboard directly over the dirt. This traps 100% of the moisture. Lift it daily to check for sprouts.</p>
              <p><strong>3. The Weaning Phase:</strong> Once germinated, remove the cardboard immediately. Transition from daily surface misting to deeper waterings every 2-3 days to force the young roots to dive downward in search of moisture.</p>
              
              <div className="info-box-title" style={{ color: '#2b4a24', borderBottom: '3px dotted #823c11', paddingBottom: '5px', marginTop: '30px' }}>Drip Irrigation Master Rules</div>
              <p><strong>Macro Rule 1 (Deep Root Soaking):</strong> Frequent, shallow watering creates weak, surface-level root systems that panic during a heatwave. The goal of the drip system is to run for longer periods (30-45 minutes depending on emitter flow) but less frequently (every 3-4 days), soaking the soil a full 8-12 inches down.</p>
              <p><strong>Macro Rule 2 (The Late-Summer Stress):</strong> For fruiting crops like Tomatoes and Peppers, water is your enemy in late August. Once the fruit has set and reached full size, cut your watering volume by 50%. This mild drought stress forces the plant to stop producing leaves and concentrate all its sugars into ripening the fruit, dramatically increasing flavor and spice.</p>
              <p><strong>Macro Rule 3 (The Allium Halt):</strong> Onions are susceptible to rot. When the green tops of your onions flop over onto the soil (usually mid-summer), their growing cycle is finished. You must stop watering that bed entirely to allow the bulbs to cure in the dry dirt before harvesting.</p>

              <div className="info-box-title" style={{ color: '#823c11', borderBottom: '3px dotted #823c11', paddingBottom: '5px', marginTop: '30px' }}>Fertilization Master Rules</div>
              <p><strong>Rule 1 (The Seed Battery):</strong> NEVER fertilize seeds when direct sowing. A seed is a self-contained battery pack that has all the nutrients it needs. Adding fertilizer to a seed will chemically burn the emerging root. Wait 10-14 days until the first "True Leaves" appear.</p>
              <p><strong>Rule 2 (The Transplant Trench):</strong> When planting nursery starts (Tomatoes, Peppers), place a small scoop of organic fertilizer at the very bottom of your hole. Cover it with an inch of plain dirt, then place the plant. The roots will discover the food naturally as they grow downward without suffering chemical shock.</p>
              <p><strong>Rule 3 (The SubPod Exception):</strong> Bed 1 is a living nutrient engine. The worms are constantly pushing castings and "worm tea" into the surrounding dirt. Direct sow crops in this bed rarely need supplemental feeding unless they look visibly yellow and starved.</p>

            </div>
          </div>
        </div>
      )}

      {/* EVOLVING PLANT MODAL */}
      {selectedPlant && info && (
        <div className="modal-overlay" onClick={() => setSelectedPlant(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              {info.name}
              <button className="close-btn" onClick={() => setSelectedPlant(null)}>X</button>
            </div>
            <div className="modal-body">
              
              {!isPlanted && info.method !== "-" && info.method !== "INFRASTRUCTURE" ? (
                <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                  <p style={{ color: '#d62828', fontWeight: 'bold', fontSize: '22px' }}>This crop is currently unplanted.</p>
                  <button className="btn-action feed" onClick={() => markAction(info.name, 'planted')} style={{ width: '100%' }}>
                    🌱 MARK PLANTED (START CLOCK)
                  </button>
                </div>
              ) : (
                <>
                  {info.method !== "-" && info.method !== "INFRASTRUCTURE" && (
                    <div style={{ textAlign: 'center', marginBottom: '20px', fontWeight: 'bold', color: '#f5cc85', background: '#2b4a24', padding: '12px', border: '4px solid #36141a', fontSize: '24px', boxShadow: 'inset 4px 4px 0px rgba(255,255,255,0.2)' }}>
                      Current Phase: {activePhase.name} (Day {plantAge})
                    </div>
                  )}
                  
                  <div className="action-buttons">
                    <button className="btn-action water" onClick={() => markAction(info.name, 'watered')}>💦 Watered</button>
                    <button className="btn-action feed" onClick={() => markAction(info.name, 'fed')}>🧪 Fed</button>
                  </div>

                  <div className="status-box">
                    <p>Last Watered: {timestamps[info.name]?.watered ? new Date(timestamps[info.name].watered).toLocaleString([], {month: 'numeric', day: 'numeric', hour: '2-digit', minute:'2-digit'}) : 'Never'}</p>
                    <p>Last Fed: {timestamps[info.name]?.fed ? new Date(timestamps[info.name].fed).toLocaleString([], {month: 'numeric', day: 'numeric', hour: '2-digit', minute:'2-digit'}) : 'Never'}</p>
                  </div>
                </>
              )}

              <div className="data-row"><div className="data-label">Method</div><div className="data-value"><strong>{info.method}</strong></div></div>
              <div className="data-row"><div className="data-label">Spacing</div><div className="data-value">{info.quantity} / sq ft</div></div>
              <div className="data-row"><div className="data-label">Seed Depth</div><div className="data-value">{info.depth}</div></div>
              <div className="data-row"><div className="data-label">Timeline</div><div className="data-value">{info.harvest}</div></div>

              {/* DYNAMIC PHASE INSTRUCTIONS */}
              <div className="info-box"><div className="info-box-title">💧 Watering</div><div>{activePhase.water}</div></div>
              <div className="info-box"><div className="info-box-title">🧪 Feeding</div><div>{activePhase.feed}</div></div>
              <div className="info-box"><div className="info-box-title">✂️ Care & Pruning</div><div>{activePhase.pruning}</div></div>
              <div className="info-box" style={{ background: '#d17c38', color: '#ffe5a9', border: '4px solid #36141a' }}>
                <div className="info-box-title" style={{color: '#ffe5a9'}}>💡 Phase Secret</div><div>{activePhase.tip}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* BED MODAL */}
      {selectedBed && bedInfo && (
        <div className="modal-overlay" onClick={() => setSelectedBed(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              {bedInfo.title}
              <button className="close-btn" onClick={() => setSelectedBed(null)}>X</button>
            </div>
            <div className="modal-body">
              <div style={{ textAlign: 'center', fontStyle: 'italic', marginBottom: '20px', color: '#823c11', fontSize: '22px' }}>
                Primary Focus: {bedInfo.focus}
              </div>
              <div className="info-box">
                <div className="info-box-title">⛏️ Bed Prep & Soil</div><div>{bedInfo.soilPrep}</div>
              </div>
              <div className="info-box">
                <div className="info-box-title">💧 Macro Watering</div><div>{bedInfo.macroWatering}</div>
              </div>
              <div className="info-box">
                <div className="info-box-title">🧪 Macro Feeding</div><div>{bedInfo.macroFeeding}</div>
              </div>
              <div className="info-box" style={{ background: '#d17c38', color: '#ffe5a9', border: '4px solid #36141a' }}>
                <div className="info-box-title" style={{color: '#ffe5a9'}}>🔑 Bed Secrets</div><div>{bedInfo.bedSecrets}</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}