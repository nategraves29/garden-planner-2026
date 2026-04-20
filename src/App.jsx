import React, { useState, useEffect } from 'react';
import { PNW_GARDEN_CONTEXT } from './expertContext';
import { db } from './firebase';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';
import { GoogleGenerativeAI } from "@google/generative-ai";
import './App.css';

// ==========================================
// GEMINI API CONFIGURATION
// ==========================================
const API_KEY = atob("QUl6YVN5Q3BqYVpyOUxCekZHejUyc0MxekUzMjFQZEpIMW1kUU5z");
const genAI = new GoogleGenerativeAI(API_KEY);

const fileToGenerativePart = async (file) => {
  const base64EncodedDataPromise = new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result.split(',')[1]);
    reader.readAsDataURL(file);
  });
  return {
    inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
  };
};

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
  // DIRECT SOWN CROPS
  "Radishes": { color: "#ff8fab", method: "DIRECT SOW (Precision Poke)", quantity: "16", spacing: "3 inches apart", depth: "1/2 inch", harvest: "25-30 days", phases: [
    { name: "Sown (Pre-Emergence)", startDay: 0, waterDays: 1, water: "Mist the vermiculite daily to prevent drying out.", feedDays: null, feed: "None", pruning: "Do not touch surface.", tip: "Vermiculite acts as a sponge. Keep it damp." }, 
    { name: "Sprouting", startDay: 5, waterDays: 1, water: "Daily mist.", feedDays: 14, feed: "Light Fish Emulsion (5-1-1)", pruning: "Snip weakest sprouts.", tip: "Roots are pushing down." }, 
    { name: "Bulbing", startDay: 15, waterDays: 2, water: "Standard soak.", feedDays: null, feed: "None", pruning: "Keep weed-free.", tip: "Bulbs are swelling rapidly." },
    { name: "Harvest Ready", startDay: 25, waterDays: 2, water: "Standard soak.", feedDays: null, feed: "None", pruning: "Pull them!", tip: "Harvest promptly to free up root space for neighboring crops." }
  ]},
  "Carrots": { color: "#ffb703", method: "DIRECT SOW (Scatter & Thin)", quantity: "9", spacing: "4 inches apart", depth: "1/4 inch", harvest: "70-80 days", phases: [
    { name: "Sown (Pre-Emergence)", startDay: 0, waterDays: 1, water: "Mist the vermiculite daily to prevent drying out.", feedDays: null, feed: "None", pruning: "Do not touch surface.", tip: "Carrots are incredibly slow. Keep the vermiculite moist." }, 
    { name: "Germination", startDay: 14, waterDays: 2, water: "Surface misting every 2 days.", feedDays: null, feed: "None", pruning: "Wait to thin.", tip: "They look like tiny blades of grass." }, 
    { name: "Maturation", startDay: 30, waterDays: 3, water: "Deep soak every 3 days.", feedDays: 21, feed: "Light Fish Emulsion", pruning: "Thin down to 9 per sq ft.", tip: "Cut weeds at the base so you don't disturb the taproots." }, 
    { name: "Harvest Window", startDay: 70, waterDays: 3, water: "Standard soak.", feedDays: null, feed: "None", pruning: "Pull as needed.", tip: "Leave them in the ground until you need them." }
  ]},
  "Buttercrunch & Romaine": { color: "#90be6d", method: "DIRECT SOW (Precision Poke)", quantity: "4", spacing: "6 inches apart", depth: "Surface", harvest: "55-65 days", phases: [
    { name: "Sown (Pre-Emergence)", startDay: 0, waterDays: 1, water: "Mist the vermiculite daily.", feedDays: null, feed: "None", pruning: "None.", tip: "Lettuce needs light to germinate. Press into dirt, top lightly with vermiculite." }, 
    { name: "Seedling", startDay: 7, waterDays: 2, water: "Keep surface damp.", feedDays: 14, feed: "Light Fish Emulsion", pruning: "Snip weakest sprouts.", tip: "Let them establish." }, 
    { name: "Growth & Harvest", startDay: 25, waterDays: 2, water: "Standard soak.", feedDays: 14, feed: "Fish Emulsion", pruning: "Harvest outer leaves.", tip: "Pick the outermost leaves for salads and the center will keep growing." }
  ]},
  "Arugula": { color: "#73a942", method: "DIRECT SOW (Scatter & Thin)", quantity: "9", spacing: "4 inches apart", depth: "1/2 inch", harvest: "40-50 days", phases: [
    { name: "Sown (Pre-Emergence)", startDay: 0, waterDays: 1, water: "Mist the vermiculite daily.", feedDays: null, feed: "None", pruning: "None.", tip: "Keep surface moist." }, 
    { name: "Seedling", startDay: 7, waterDays: 2, water: "Standard soak.", feedDays: 14, feed: "Light Fish Emulsion", pruning: "Thin to 9 plants.", tip: "Watch for flea beetles." }, 
    { name: "Continuous Harvest", startDay: 30, waterDays: 2, water: "Standard soak.", feedDays: 14, feed: "Light Fish Emulsion", pruning: "Cut leaves 1 inch above soil.", tip: "Never pull roots. Cut leaves and it regrows." }
  ]},
  "Spinach": { color: "#538d22", method: "DIRECT SOW (Precision Poke)", quantity: "9", spacing: "4 inches apart", depth: "1/2 inch", harvest: "40-50 days", phases: [
    { name: "Sown (Pre-Emergence)", startDay: 0, waterDays: 1, water: "Mist the vermiculite daily.", feedDays: null, feed: "None", pruning: "None.", tip: "Prefers cool soil." }, 
    { name: "Seedling", startDay: 7, waterDays: 2, water: "Standard soak.", feedDays: 14, feed: "Light Fish Emulsion", pruning: "Keep weed free.", tip: "Establishing taproot." }, 
    { name: "Continuous Harvest", startDay: 35, waterDays: 2, water: "Standard soak.", feedDays: 14, feed: "Light Fish Emulsion", pruning: "Cut outermost leaves.", tip: "Shade with taller crops later in the season." }
  ]},
  "Parsley": { color: "#a7c957", method: "DIRECT SOW (Precision Poke)", quantity: "2-4", spacing: "6 inches apart", depth: "1/4 inch", harvest: "60-70 days", phases: [
    { name: "Sown (Pre-Emergence)", startDay: 0, waterDays: 1, water: "Mist the vermiculite daily.", feedDays: null, feed: "None", pruning: "None.", tip: "Extremely slow to germinate." }, 
    { name: "Seedling", startDay: 14, waterDays: 2, water: "Mist until strong.", feedDays: 21, feed: "Light Fish Emulsion", pruning: "Snip weakest sprout.", tip: "Let it establish." }, 
    { name: "Growth & Harvest", startDay: 30, waterDays: 2, water: "Standard soak.", feedDays: 21, feed: "Light Fish Emulsion", pruning: "Snip stems from outside in.", tip: "Harvest outer edge so center pushes new growth." }
  ]},
  "Cilantro": { color: "#a7c957", method: "DIRECT SOW (Precision Poke)", quantity: "2-4", spacing: "6 inches apart", depth: "1/4 inch", harvest: "60-70 days", phases: [
    { name: "Sown (Pre-Emergence)", startDay: 0, waterDays: 1, water: "Mist the vermiculite daily.", feedDays: null, feed: "None", pruning: "None.", tip: "Crack seed shell gently before planting to speed up." }, 
    { name: "Seedling", startDay: 14, waterDays: 2, water: "Mist until strong.", feedDays: 21, feed: "Light Fish Emulsion", pruning: "Snip weakest sprout.", tip: "Establishing." }, 
    { name: "Growth & Harvest", startDay: 30, waterDays: 2, water: "Standard soak.", feedDays: 21, feed: "Light Fish Emulsion", pruning: "Harvest aggressively.", tip: "Bolts in high heat. Cut often to delay flowering." }
  ]},
  "Sugar Snap Peas": { color: "#d9ed92", method: "DIRECT SOW (Precision Poke)", quantity: "9", spacing: "4 inches apart", depth: "1 inch", harvest: "60-70 days", phases: [
    { name: "Sown (Pre-Emergence)", startDay: 0, waterDays: 1, water: "Mist surface daily.", feedDays: null, feed: "None", pruning: "None.", tip: "Keep damp." }, 
    { name: "Seedling", startDay: 10, waterDays: 2, water: "Standard soak.", feedDays: 21, feed: "Light Fish Emulsion", pruning: "Guide tendrils to trellis.", tip: "Get them climbing early." }, 
    { name: "Vining & Climbing", startDay: 25, waterDays: 2, water: "Standard soak.", feedDays: null, feed: "None (Nitrogen Fixer)", pruning: "Train up the net.", tip: "Building frame." },
    { name: "Continuous Harvest", startDay: 50, waterDays: 2, water: "Standard soak.", feedDays: null, feed: "None", pruning: "Harvest every 1-2 days.", tip: "The more you pick, the more flowers it pushes." }
  ]},

  // TRANSPLANTS
  "Red Onions": { color: "#cda4f4", method: "TRANSPLANT", quantity: "4", spacing: "6 inches apart", depth: "Root depth", harvest: "90-110 days", phases: [
    { name: "Transplant Acclimation", startDay: 0, waterDays: 2, water: "Keep moist.", feedDays: 14, feed: "Transplant fertilizer at base.", pruning: "Hand-pull ALL weeds.", tip: "Recovering from root shock." }, 
    { name: "Vegetative Growth", startDay: 14, waterDays: 3, water: "Standard deep soak.", feedDays: 28, feed: "Fish Emulsion", pruning: "Hand-pull weeds.", tip: "Pushing up green tops." }, 
    { name: "Bulb Swelling", startDay: 45, waterDays: 3, water: "Standard deep soak.", feedDays: 28, feed: "Fish Emulsion", pruning: "Keep weed-free.", tip: "Bulbs are physically expanding." },
    { name: "Harvest Ready (Curing)", startDay: 90, waterDays: null, water: "CRITICAL: STOP WATERING.", feedDays: null, feed: "None.", pruning: "Do not touch them.", tip: "Green tops flopped over? Let sit in dry dirt 1 week to cure skins." }
  ]},
  "Walla Walla Onions": { color: "#fcefb4", method: "TRANSPLANT", quantity: "4", spacing: "6 inches apart", depth: "Root depth", harvest: "90-110 days", phases: [
    { name: "Transplant Acclimation", startDay: 0, waterDays: 2, water: "Keep moist.", feedDays: 14, feed: "Transplant fertilizer at base.", pruning: "Hand-pull ALL weeds.", tip: "Recovering from root shock." }, 
    { name: "Vegetative Growth", startDay: 14, waterDays: 3, water: "Standard deep soak.", feedDays: 28, feed: "Fish Emulsion", pruning: "Hand-pull weeds.", tip: "Pushing up green tops." }, 
    { name: "Bulb Swelling", startDay: 45, waterDays: 3, water: "Standard deep soak.", feedDays: 28, feed: "Fish Emulsion", pruning: "Keep weed-free.", tip: "Bulbs are physically expanding." },
    { name: "Harvest Ready (Curing)", startDay: 90, waterDays: null, water: "CRITICAL: STOP WATERING.", feedDays: null, feed: "None.", pruning: "Do not touch them.", tip: "Green tops flopped over? Let sit in dry dirt 1 week to cure skins." }
  ]},
  "Broccoli": { color: "#4c956c", method: "TRANSPLANT", quantity: "1", spacing: "Center of square (12\")", depth: "Crown level", harvest: "50-70 days", phases: [
    { name: "Transplant Acclimation", startDay: 0, waterDays: 2, water: "Keep moist.", feedDays: 14, feed: "Transplant fertilizer at base.", pruning: "Watch for shock.", tip: "Letting roots settle." }, 
    { name: "Heavy Growth", startDay: 14, waterDays: 3, water: "Deep soak 2-3x a week.", feedDays: 21, feed: "High Nitrogen (2 Tbsp/gal)", pruning: "Check under leaves for eggs.", tip: "Heavy feeder pushing giant leaves." }, 
    { name: "Head Formation", startDay: 45, waterDays: 3, water: "Deep soak.", feedDays: 21, feed: "High Nitrogen", pruning: "Watch crown.", tip: "The crown is forming." },
    { name: "Harvest Ready (Main Head)", startDay: 60, waterDays: 3, water: "Deep soak.", feedDays: 21, feed: "High Nitrogen", pruning: "Cut main head before it flowers.", tip: "Cut the big head while tight! Leave the plant for side-shoots." },
    { name: "Side-Shoots", startDay: 65, waterDays: 3, water: "Deep soak.", feedDays: 21, feed: "High Nitrogen", pruning: "Harvest mini-florets.", tip: "Plant will push small florets for weeks." }
  ]},
  "Kale": { color: "#2c6e49", method: "TRANSPLANT", quantity: "1", spacing: "Center of square (12\")", depth: "Crown level", harvest: "50-70 days", phases: [
    { name: "Transplant Acclimation", startDay: 0, waterDays: 2, water: "Keep moist.", feedDays: 14, feed: "Transplant fertilizer.", pruning: "Watch for shock.", tip: "Letting roots settle." }, 
    { name: "Growth", startDay: 14, waterDays: 3, water: "Standard soak.", feedDays: 21, feed: "High Nitrogen Fish Emulsion", pruning: "Harvest outermost leaves.", tip: "Twist leaves off downwards." }, 
    { name: "Continuous Harvest", startDay: 50, waterDays: 3, water: "Standard soak.", feedDays: 21, feed: "High Nitrogen Fish Emulsion", pruning: "Keep harvesting.", tip: "A light frost will make the leaves sweeter." }
  ]},
  "Collard Greens": { color: "#6a994e", method: "TRANSPLANT", quantity: "1", spacing: "Center of square (12\")", depth: "Crown level", harvest: "50-70 days", phases: [
    { name: "Transplant Acclimation", startDay: 0, waterDays: 2, water: "Keep moist.", feedDays: 14, feed: "Transplant fertilizer.", pruning: "Watch for shock.", tip: "Letting roots settle." }, 
    { name: "Growth", startDay: 14, waterDays: 3, water: "Standard soak.", feedDays: 21, feed: "High Nitrogen Fish Emulsion", pruning: "Harvest outermost leaves.", tip: "Harvest from bottom up. It will look like a palm tree." },
    { name: "Continuous Harvest", startDay: 50, waterDays: 3, water: "Standard soak.", feedDays: 21, feed: "High Nitrogen Fish Emulsion", pruning: "Keep harvesting.", tip: "Huge leaves are ready." }
  ]},

  // OTHER CROPS (Future-proofed placeholders for May)
  "Green Beans": { color: "#b5e48c", method: "DIRECT SOW (Precision Poke)", quantity: "9", spacing: "4 inches apart", depth: "1 inch", harvest: "50-60 days", phases: [{ name: "Sown (Pre-Emergence)", startDay: 0, waterDays: 1, water: "Mist surface.", feedDays: null, feed: "None", pruning: "-", tip: "Keep damp." }, { name: "Seedling", startDay: 10, waterDays: 2, water: "Standard soak.", feedDays: 21, feed: "Light Fish Emulsion", pruning: "Guide to trellis.", tip: "Nitrogen fixers." }, { name: "Continuous Harvest", startDay: 45, waterDays: 2, water: "Standard soak.", feedDays: null, feed: "None", pruning: "Harvest every 1-2 days.", tip: "Pick slender." }]},
  "Cucumbers": { color: "#52b788", method: "DIRECT SOW (Precision Poke)", quantity: "2", spacing: "Center of square (12\")", depth: "1 inch", harvest: "50-70 days", phases: [{ name: "Sown (Pre-Emergence)", startDay: 0, waterDays: 1, water: "Mist surface.", feedDays: null, feed: "None", pruning: "-", tip: "Keep damp." }, { name: "Vining", startDay: 10, waterDays: 2, water: "Heavy soak.", feedDays: 14, feed: "Light Fish Emulsion", pruning: "Train vine.", tip: "Heavy drinkers." }, { name: "Continuous Harvest", startDay: 45, waterDays: 2, water: "Heavy soak.", feedDays: 14, feed: "Fruiting Fertilizer", pruning: "Pick daily.", tip: "Thirsty cucumbers turn bitter." }]},
  "Roma Tomato": { color: "#e63946", method: "TRANSPLANT", quantity: "1", spacing: "Center of square (12\")", depth: "Bury stem deep", harvest: "65-85 days", phases: [{ name: "Transplant Acclimation", startDay: 0, waterDays: 2, water: "Deep soak.", feedDays: 14, feed: "Starter fertilizer.", pruning: "Strip bottom leaves.", tip: "Building taproot." }, { name: "Vegetative Growth", startDay: 14, waterDays: 3, water: "Deep root soak.", feedDays: 14, feed: "Switch to 2-8-4.", pruning: "Pinch suckers.", tip: "Vining out." }, { name: "Harvest Window", startDay: 65, waterDays: 5, water: "Cut water 50%.", feedDays: 14, feed: "Fruiting Fertilizer", pruning: "Maintain airflow.", tip: "Drought stress forces flavor." }]},
  "Beefsteak": { color: "#d62828", method: "TRANSPLANT", quantity: "1", spacing: "Center of square (12\")", depth: "Bury stem deep", harvest: "80-90 days", phases: [{ name: "Transplant Acclimation", startDay: 0, waterDays: 2, water: "Deep soak.", feedDays: 14, feed: "Starter fertilizer.", pruning: "Strip bottom leaves.", tip: "Building taproot." }, { name: "Vegetative Growth", startDay: 14, waterDays: 3, water: "Deep root soak.", feedDays: 14, feed: "Switch to 2-8-4.", pruning: "Pinch suckers.", tip: "Vining out." }, { name: "Harvest Window", startDay: 75, waterDays: 5, water: "Cut water 50%.", feedDays: 14, feed: "Fruiting Fertilizer", pruning: "Maintain airflow.", tip: "Drought stress forces flavor." }]},
  "Cherry Tomato": { color: "#f25c54", method: "TRANSPLANT", quantity: "1", spacing: "Center of square (12\")", depth: "Bury stem deep", harvest: "65-75 days", phases: [{ name: "Transplant Acclimation", startDay: 0, waterDays: 2, water: "Deep soak.", feedDays: 14, feed: "Starter fertilizer.", pruning: "Strip bottom leaves.", tip: "Building taproot." }, { name: "Wild Fruiting", startDay: 30, waterDays: 4, water: "Deep root soak.", feedDays: 14, feed: "Switch to 2-8-4.", pruning: "Let vine out.", tip: "Chaotic grower." }, { name: "Continuous Harvest", startDay: 60, waterDays: 4, water: "Deep root soak.", feedDays: 14, feed: "Fruiting Fertilizer", pruning: "Harvest.", tip: "Enjoy." }]},
  "Tomatillo": { color: "#a7c957", method: "TRANSPLANT", quantity: "1", spacing: "Center of square (12\")", depth: "Bury stem deep", harvest: "65-85 days", phases: [{ name: "Transplant Acclimation", startDay: 0, waterDays: 2, water: "Deep soak.", feedDays: 14, feed: "Starter fertilizer.", pruning: "Cage.", tip: "Settle." }, { name: "Growth & Bloom", startDay: 14, waterDays: 3, water: "Deep root soak.", feedDays: 21, feed: "Fruiting Fertilizer", pruning: "Support branches.", tip: "Requires 2 plants to pollinate." }, { name: "Continuous Harvest", startDay: 60, waterDays: 3, water: "Deep soak.", feedDays: 21, feed: "Fruiting Fertilizer", pruning: "Harvest.", tip: "Husk splits when ready." }]},
  "Bell Pepper": { color: "#f4a261", method: "TRANSPLANT", quantity: "1", spacing: "Center of square (12\")", depth: "Crown level", harvest: "70-80 days", phases: [{ name: "Transplant Acclimation", startDay: 0, waterDays: 2, water: "Deep soak.", feedDays: 14, feed: "Starter fertilizer.", pruning: "-", tip: "Settle." }, { name: "Frame Building", startDay: 14, waterDays: 3, water: "Consistent soak.", feedDays: 21, feed: "4-4-4.", pruning: "Pluck first blossoms.", tip: "Build strong canopy." }, { name: "Continuous Harvest", startDay: 65, waterDays: 4, water: "Slight stress.", feedDays: 14, feed: "Fruiting Fertilizer", pruning: "Harvest.", tip: "Turns red if left on plant." }]},
  "Jalapeno": { color: "#2a9d8f", method: "TRANSPLANT", quantity: "1", spacing: "Center of square (12\")", depth: "Crown level", harvest: "70-80 days", phases: [{ name: "Transplant Acclimation", startDay: 0, waterDays: 2, water: "Deep soak.", feedDays: 14, feed: "Starter fertilizer.", pruning: "-", tip: "Settle." }, { name: "Frame Building", startDay: 14, waterDays: 3, water: "Consistent soak.", feedDays: 21, feed: "4-4-4.", pruning: "Pluck first blossoms.", tip: "Build strong canopy." }, { name: "Harvest Window (Spice)", startDay: 65, waterDays: 5, water: "Drought stress.", feedDays: 14, feed: "Fruiting Fertilizer", pruning: "Harvest.", tip: "Stress forces capsaicin spike." }]},
  "Serrano": { color: "#2a9d8f", method: "TRANSPLANT", quantity: "1", spacing: "Center of square (12\")", depth: "Crown level", harvest: "70-80 days", phases: [{ name: "Transplant Acclimation", startDay: 0, waterDays: 2, water: "Deep soak.", feedDays: 14, feed: "Starter fertilizer.", pruning: "-", tip: "Settle." }, { name: "Frame Building", startDay: 14, waterDays: 3, water: "Consistent soak.", feedDays: 21, feed: "4-4-4.", pruning: "Pluck first blossoms.", tip: "Build strong canopy." }, { name: "Harvest Window (Spice)", startDay: 65, waterDays: 5, water: "Drought stress.", feedDays: 14, feed: "Fruiting Fertilizer", pruning: "Harvest.", tip: "Stress forces capsaicin spike." }]},
  "Thai Hot": { color: "#e63946", method: "TRANSPLANT", quantity: "1", spacing: "Center of square (12\")", depth: "Crown level", harvest: "70-80 days", phases: [{ name: "Transplant Acclimation", startDay: 0, waterDays: 2, water: "Deep soak.", feedDays: 14, feed: "Starter fertilizer.", pruning: "-", tip: "Settle." }, { name: "Frame Building", startDay: 14, waterDays: 3, water: "Consistent soak.", feedDays: 21, feed: "4-4-4.", pruning: "Pluck first blossoms.", tip: "Build strong canopy." }, { name: "Harvest Window (Spice)", startDay: 65, waterDays: 5, water: "Drought stress.", feedDays: 14, feed: "Fruiting Fertilizer", pruning: "Harvest.", tip: "Stress forces capsaicin spike." }]},
  "Shishito": { color: "#a7c957", method: "TRANSPLANT", quantity: "1", spacing: "Center of square (12\")", depth: "Crown level", harvest: "60-70 days", phases: [{ name: "Transplant Acclimation", startDay: 0, waterDays: 2, water: "Deep soak.", feedDays: 14, feed: "Starter fertilizer.", pruning: "-", tip: "Settle." }, { name: "Frame Building", startDay: 14, waterDays: 3, water: "Consistent soak.", feedDays: 21, feed: "4-4-4.", pruning: "Pluck first blossoms.", tip: "Build strong canopy." }, { name: "Continuous Harvest", startDay: 50, waterDays: 3, water: "Standard soak.", feedDays: 14, feed: "Fruiting Fertilizer", pruning: "Harvest continuously.", tip: "Pick green and wrinkled." }]},
  "Basil": { color: "#74c69d", method: "TRANSPLANT", quantity: "4", spacing: "6 inches apart", depth: "Crown level", harvest: "30-40 days", phases: [{ name: "Transplant Acclimation", startDay: 0, waterDays: 2, water: "Standard soak.", feedDays: 14, feed: "Light Fish Emulsion", pruning: "-", tip: "Settle." }, { name: "Continuous Harvest", startDay: 14, waterDays: 2, water: "Standard soak.", feedDays: 21, feed: "Light Fish Emulsion", pruning: "Pinch top clusters.", tip: "Never let it flower." }]},
  "Thai Basil": { color: "#52b788", method: "TRANSPLANT", quantity: "4", spacing: "6 inches apart", depth: "Crown level", harvest: "30-40 days", phases: [{ name: "Transplant Acclimation", startDay: 0, waterDays: 2, water: "Standard soak.", feedDays: 14, feed: "Light Fish Emulsion", pruning: "-", tip: "Settle." }, { name: "Continuous Harvest", startDay: 14, waterDays: 2, water: "Standard soak.", feedDays: 21, feed: "Light Fish Emulsion", pruning: "Pinch top clusters.", tip: "Never let it flower." }]},
  "Marigold": { color: "#fb8500", method: "TRANSPLANT", quantity: "1", spacing: "Center of square (12\")", depth: "Crown level", harvest: "50 days", phases: [{ name: "Transplant Acclimation", startDay: 0, waterDays: 2, water: "Standard soak.", feedDays: null, feed: "None.", pruning: "-", tip: "Settle." }, { name: "Bloom", startDay: 10, waterDays: 3, water: "Standard soak.", feedDays: null, feed: "None.", pruning: "Deadhead.", tip: "Kills root nematodes." }]},
  "Nasturtiums": { color: "#ff5400", method: "DIRECT SOW (Precision Poke)", quantity: "2", spacing: "6-8 inches apart", depth: "1 inch", harvest: "55-65 days", phases: [{ name: "Sown", startDay: 0, waterDays: 1, water: "Mist surface.", feedDays: null, feed: "None.", pruning: "-", tip: "Keep damp." }, { name: "Bloom", startDay: 20, waterDays: 3, water: "Standard soak.", feedDays: null, feed: "None.", pruning: "Cascade.", tip: "Trap crop." }]},
  "SubPod": { color: "#ebd9c8", method: "INFRASTRUCTURE", quantity: "-", spacing: "-", depth: "-", harvest: "Continuous", phases: [{ name: "Active", startDay: 0, waterDays: null, water: "Keep moist.", feedDays: null, feed: "Kitchen scraps", pruning: "-", tip: "The nutrient engine. Add brown cardboard with food scraps to balance carbon." }] },
  "Open Space": { color: "#e9ecef", method: "-", quantity: "-", spacing: "-", depth: "-", harvest: "-", phases: [{ name: "Empty", startDay: 0, waterDays: null, water: "-", feedDays: null, feed: "-", pruning: "-", tip: "Reserved area." }] }
};

const masterCatalog = {
  "🌱 Seed Packets": ["Radish Seeds", "Carrot Seeds", "Beet Seeds", "Lettuce Seeds", "Arugula Seeds", "Spinach Seeds", "Swiss Chard Seeds", "Pea Seeds", "Green Bean Seeds", "Cucumber Seeds", "Zucchini Seeds", "Butternut Squash Seeds", "Pumpkin Seeds", "Sweet Corn Seeds", "Red Onion Seeds", "Walla Walla Onion Seeds", "Broccoli Seeds", "Cabbage Seeds", "Kale Seeds", "Collard Greens Seeds", "Roma Tomato Seeds", "Beefsteak Tomato Seeds", "Cherry Tomato Seeds", "Tomatillo Seeds", "Eggplant Seeds", "Bell Pepper Seeds", "Jalapeno Seeds", "Serrano Seeds", "Thai Hot Seeds", "Shishito Seeds", "Basil Seeds", "Thai Basil Seeds", "Cilantro Seeds", "Parsley Seeds", "Marigold Seeds", "Nasturtium Seeds", "Sunflower Seeds"],
  "🪴 Transplants": ["Lettuce Starts", "Arugula Starts", "Spinach Starts", "Swiss Chard Starts", "Pea Starts", "Green Bean Starts", "Cucumber Starts", "Zucchini Starts", "Butternut Squash Starts", "Pumpkin Starts", "Sweet Corn Starts", "Red Onion Starts", "Walla Walla Onion Starts", "Broccoli Starts", "Cabbage Starts", "Kale Starts", "Collard Greens Starts", "Roma Tomato Starts", "Beefsteak Starts", "Cherry Tomato Starts", "Tomatillo Starts", "Eggplant Starts", "Bell Pepper Starts", "Jalapeno Starts", "Serrano Starts", "Thai Hot Starts", "Shishito Starts", "Basil Starts", "Thai Basil Starts", "Cilantro Starts", "Parsley Starts", "Marigold Starts", "Nasturtium Starts", "Sunflower Starts"],
  "🪨 Soils & Amendments": ["Organic Compost (Bag)", "Potting Soil (Bag)", "Coco Coir (Brick)", "Vermiculite (Bag)", "Perlite (Bag)", "Fish Emulsion (5-1-1)", "Fruiting Fertilizer (2-8-4)", "Bone Meal", "Blood Meal", "Kelp Meal", "Mycorrhizal Fungi", "Worm Blanket", "SubPod Carbon Bedding", "Straw Mulch"],
  "🛠️ Hardware": ["Drip Tubing (1/2\")", "Drip Tubing (1/4\")", "Drip Emitters", "Irrigation Stakes", "Hose Timer", "Tomato Cages", "Trellis Netting", "Korean EZ Digger", "Pruning Snips", "Twine", "Seedling Trays", "Heat Mat", "Grow Lights", "Plant Tags", "Neem Oil", "Slug/Snail Bait", "Frost Cover"]
};

const getPlantData = (plantName) => {
  if (plantDatabase[plantName]) return { name: plantName, ...plantDatabase[plantName] };
  const key = Object.keys(plantDatabase).find(k => plantName.includes(k));
  if (key) return { name: key, ...plantDatabase[key] };
  return null;
};

const getPlantAge = (plantName, timestamps) => {
  const planted = timestamps[plantName]?.planted;
  if (!planted) return null;

  // Normalize both dates to midnight local time
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const plantDate = new Date(planted);
  plantDate.setHours(0, 0, 0, 0);

  // Calculate strict calendar days
  return Math.floor((today - plantDate) / (1000 * 60 * 60 * 24));
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
  
  // Normalize both dates to midnight local time
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const actionDate = new Date(lastAction);
  actionDate.setHours(0, 0, 0, 0);

  const daysSince = Math.floor((today - actionDate) / (1000 * 60 * 60 * 24));
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

  // PLANT DOCTOR STATES
  const [doctorLoading, setDoctorLoading] = useState(false);
  const [doctorResult, setDoctorResult] = useState(null);

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
           next12.push({ displayTime: `${hr} ${ampm}`, temp: data.hourly.temperature_2m[startIndex + i], code: data.hourly.weather_code[startIndex + i], isNight: dateObj.getHours() >= 18 || dateObj.getHours() < 6 });
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
    if (window.confirm("Did it rain heavily today? This will reset watering timers.")) {
      triggerNatureWatering(new Date().toDateString(), timestamps);
    }
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
    if (currentData[name]) { currentData[name].quantity += count; currentData[name].checked = false; }
    else { currentData[name] = { quantity: count, checked: false }; }
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

  // GEMINI AI CALL (Updated for 2026)
const runPlantDoctor = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setDoctorLoading(true);
    setDoctorResult(null);

    try {
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
      const prompt = `You are an expert Oregon organic gardener. Examine this image of my ${selectedPlant}. Identify any diseases, pests, or nutrient deficiencies. Provide a brief diagnosis and 3 step-by-step organic, pet-safe remedies to fix it. Keep it concise.`;
      
      const imagePart = await fileToGenerativePart(file);
      const result = await model.generateContent([prompt, imagePart]);
      
      setDoctorResult(result.response.text());
    } catch (error) {
      setDoctorResult("Error: Could not analyze the image. Make sure your API key is correct.");
      console.error(error);
    }
    setDoctorLoading(false);
  };

  // UPDATED ROSTERS
  const bed1 = ["SubPod", "SubPod", "SubPod", "Radishes", "Carrots", "Buttercrunch & Romaine", "SubPod", "SubPod", "SubPod", "Radishes", "Carrots", "Arugula", "SubPod", "SubPod", "SubPod", "Radishes", "Carrots", "Spinach"];
  const bed2 = ["Red Onions", "Red Onions", "Walla Walla Onions", "Walla Walla Onions", "Parsley", "Parsley", "Red Onions", "Red Onions", "Walla Walla Onions", "Walla Walla Onions", "Parsley", "Cilantro", "Red Onions", "Red Onions", "Walla Walla Onions", "Walla Walla Onions", "Cilantro", "Cilantro"];
  const bed3 = ["Broccoli", "Broccoli", "Kale", "Kale", "Collard Greens", "Collard Greens", "Broccoli", "Broccoli", "Kale", "Kale", "Collard Greens", "Collard Greens", "Broccoli", "Broccoli", "Kale", "Kale", "Collard Greens", "Collard Greens"];
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

  return (
    <div className="container">
      <h1>{currentView === 'planner' ? "GARDEN PLANNER 2026" : "CAROL'S SHOP"}</h1>
      
      <div className="stardew-hud">
        <div className="sd-season">{timeData.season}</div>
        <div className="sd-time-row">{timeData.realTime}</div>
      </div>

      <div className="action-buttons" style={{ marginBottom: '25px' }}>
        <button className="btn-action feed" onClick={() => setCurrentView('planner')} style={{ opacity: currentView === 'planner' ? 1 : 0.5 }}>🪴 The Garden</button>
        <button className="btn-action water" onClick={() => setCurrentView('shop')} style={{ opacity: currentView === 'shop' ? 1 : 0.5, backgroundColor: currentView === 'shop' ? '#d62828' : '#823c11' }}>🛒 Carol's Shop</button>
      </div>

      {currentView === 'shop' && (
        <div>
          <div className="bed-section" style={{ backgroundColor: '#fce7b1' }}>
            <div className="bed-header" style={{ backgroundColor: '#823c11' }}>Catalog Entry</div>
            <select className="sd-select" value={catSelection} onChange={(e) => { setCatSelection(e.target.value); setItemSelection(masterCatalog[e.target.value][0]); }}>
              {Object.keys(masterCatalog).map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
            <select className="sd-select" value={itemSelection} onChange={(e) => setItemSelection(e.target.value)}>
              {masterCatalog[catSelection].map(item => <option key={item} value={item}>{item}</option>)}
            </select>
            <div className="qty-control">
              <button className="qty-btn" onClick={() => setCatalogQty(Math.max(1, catalogQty - 1))}>-</button>
              <input type="number" className="sd-input qty-input" value={catalogQty} onChange={(e) => setCatalogQty(parseInt(e.target.value)||1)} />
              <button className="qty-btn" onClick={() => setCatalogQty(catalogQty + 1)}>+</button>
              <button className="btn-action feed" style={{ width: '100%' }} onClick={() => handleAddToList(itemSelection, catalogQty)}>Add to Cart</button>
            </div>
          </div>

          <div className="bed-section" style={{ backgroundColor: '#fce7b1' }}>
            <div className="bed-header" style={{ backgroundColor: '#823c11' }}>Custom Item Request</div>
            <input type="text" className="sd-input" style={{ marginBottom: '15px' }} placeholder="e.g. Garden Hose, Snips" value={customName} onChange={(e) => setCustomName(e.target.value)} />
            <div className="qty-control">
              <button className="qty-btn" onClick={() => setCustomQty(Math.max(1, customQty - 1))}>-</button>
              <input type="number" className="sd-input qty-input" value={customQty} onChange={(e) => setCustomQty(parseInt(e.target.value)||1)} />
              <button className="qty-btn" onClick={() => setCustomQty(customQty + 1)}>+</button>
              <button className="btn-action water" style={{ width: '100%' }} onClick={() => handleAddToList(customName, customQty)}>Add</button>
            </div>
          </div>

          <div className="bed-section">
            <div className="bed-header">Active Shopping List</div>
            {Object.keys(shoppingList).length === 0 ? (
              <div style={{ textAlign: 'center', color: '#ffe5a9', padding: '20px', fontSize: '22px' }}>Your cart is empty.</div>
            ) : (
              Object.entries(shoppingList).map(([itemName, data]) => (
                <div key={itemName} className={`shop-item ${data.checked ? 'checked' : ''}`} onClick={() => toggleShopItem(itemName)}>
                  <span>{itemName}</span>
                  <span className="shop-qty-badge">x{data.quantity}</span>
                </div>
              ))
            )}
            {Object.values(shoppingList).some(item => item.checked) && (
              <button className="btn-action" style={{ background: '#d62828', width: '100%', marginTop: '20px' }} onClick={clearCheckedItems}>🗑️ Clear Checked Items</button>
            )}
          </div>
        </div>
      )}

      {currentView === 'planner' && (
        <>
          {weatherData && (
            <div className="weather-board">
              <div className="weather-current-header">
                <div className="weather-stat">
                  <div className="weather-label">Current Weather</div>
                  <div className="weather-temp">{Math.round(weatherData.current.temp)}° {getWMOEmoji(weatherData.current.code, isCurrentlyNight)}</div>
                  <div className="weather-desc">{getWMODesc(weatherData.current.code)}</div>
                </div>
                <div style={{fontSize: '36px', paddingRight: '10px'}}>📍</div>
              </div>
              <div className="weather-hourly-container">
                {weatherData.hourly.map((hour, i) => (
                  <div key={i} className="weather-hour-block">
                    <div className="weather-hour-time">{hour.displayTime}</div>
                    <div className="weather-hour-icon">{getWMOEmoji(hour.code, hour.isNight)}</div>
                    <div className="weather-hour-temp">{Math.round(hour.temp)}°</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="action-buttons" style={{ marginBottom: '20px' }}>
            <button className="btn-action feed" onClick={() => setShowFieldGuide(true)}>📖 Field Guide</button>
            <button className="btn-action water" onClick={handleManualRainLog}>🌧️ Log Rain</button>
          </div>

          <GridRenderer bedId="bed1" title="BED 1 • Roots & Greens (6x3x2')" columns={6} data={bed1} onPlantClick={setSelectedPlant} onBedClick={setSelectedBed} timestamps={timestamps} />
          <GridRenderer bedId="bed2" title="BED 2 • Allium & Herb (6x3x2')" columns={6} data={bed2} onPlantClick={setSelectedPlant} onBedClick={setSelectedBed} timestamps={timestamps} />
          <GridRenderer bedId="bed3" title="BED 3 • Brassicas (6x3x2')" columns={6} data={bed3} onPlantClick={setSelectedPlant} onBedClick={setSelectedBed} timestamps={timestamps} />
          
          <div className="flex-row">
            <div className="flex-col"><GridRenderer bedId="bed4" title="BED 4 • Pea Trellis & Peppers" columns={3} data={bed4} onPlantClick={setSelectedPlant} onBedClick={setSelectedBed} timestamps={timestamps} /></div>
            <div className="flex-col"><GridRenderer bedId="bed5" title="BED 5 • Vines & Beans" columns={3} data={bed5} onPlantClick={setSelectedPlant} onBedClick={setSelectedBed} timestamps={timestamps} /></div>
            <div className="flex-col"><GridRenderer bedId="bed6" title="BED 6 • Tomatillo Hub" columns={3} data={bed6} onPlantClick={setSelectedPlant} onBedClick={setSelectedBed} timestamps={timestamps} /></div>
          </div>
          
          <GridRenderer bedId="bed7" title="BED 7 • Tomato & Basil Haven (6x3x3')" columns={6} data={bed7} onPlantClick={setSelectedPlant} onBedClick={setSelectedBed} timestamps={timestamps} />
        </>
      )}

      {showFieldGuide && (
        <div className="modal-overlay" onClick={() => setShowFieldGuide(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">MASTER FIELD GUIDE <button className="close-btn" onClick={() => setShowFieldGuide(false)}>X</button></div>
            <div className="modal-body" style={{ textAlign: 'left' }}>
              <div className="info-box-title" style={{ color: '#d62828', borderBottom: '3px dotted #823c11', paddingBottom: '5px' }}>The 3-Step Seed Watering Strategy</div>
              <p><strong>1. The Pre-Soak:</strong> Before placing a single seed in the ground, the bed must be flooded. Dry soil wicks moisture away from the delicate seed coat. Soak the bed thoroughly the evening before planting.</p>
              <p><strong>2. The Vermiculite Top-Coat:</strong> Seeds like carrots and radishes are incredibly shallow and dry out in hours under direct sun. Instead of burying them, press them into the surface and top with a thin layer of vermiculite. Mist this layer daily; it acts as a sponge to trap moisture against the seed coat.</p>
              <p><strong>3. The Weaning Phase:</strong> Once germinated, transition from daily surface misting to deeper waterings every 2-3 days to force the young roots to dive downward in search of moisture.</p>
              
              <div className="info-box-title" style={{ color: '#2b4a24', borderBottom: '3px dotted #823c11', paddingBottom: '5px', marginTop: '30px' }}>Drip Irrigation Master Rules</div>
              <p><strong>Macro Rule 1 (Deep Root Soaking):</strong> Frequent, shallow watering creates weak, surface-level root systems that panic during a heatwave. The goal of the drip system is to run for longer periods (30-45 minutes depending on emitter flow) but less frequently (every 3-4 days), soaking the soil a full 8-12 inches down.</p>
              <p><strong>Macro Rule 2 (The Late-Summer Stress):</strong> For fruiting crops like Tomatoes and Peppers, water is your enemy in late August. Once the fruit has set and reached full size, cut your watering volume by 50%. This mild drought stress forces the plant to stop producing leaves and concentrate all its sugars into ripening the fruit, dramatically increasing flavor and spice.</p>
              <p><strong>Macro Rule 3 (The Allium Halt):</strong> Onions are susceptible to rot. When the green tops of your onions flop over onto the soil (usually mid-summer), their growing cycle is finished. You must stop watering that bed entirely to allow the bulbs to cure in the dry dirt before harvesting.</p>
              
              <div className="info-box-title" style={{ color: '#823c11', borderBottom: '3px dotted #823c11', paddingBottom: '5px', marginTop: '30px' }}>Fertilization Master Rules</div>
              <p><strong>Rule 1 (The Seed Battery):</strong> NEVER fertilize seeds when direct sowing. A seed is a self-contained battery pack that has all the nutrients it needs. Adding fertilizer to a seed will chemically burn the emerging root. Wait 10-14 days until the first "True Leaves" appear.</p>
              <p><strong>Rule 2 (The Transplant Trench):</strong> When planting nursery starts (Tomatoes, Peppers), place a small scoop of organic fertilizer at the very bottom of your hole. Cover it with an inch of plain dirt, then place the plant. The roots will discover the food naturally as they grow downward without suffering chemical shock.</p>
              <p><strong>Rule 3 (The SubPod Exception):</strong> Bed 1 is a living nutrient engine. The worms are constantly pushing castings and "worm tea" into the surrounding dirt. Direct sow crops rarely need supplemental feeding unless they look visibly yellow and starved.</p>
            </div>
          </div>
        </div>
      )}

      {selectedPlant && info && (
        <div className="modal-overlay" onClick={() => {
          setSelectedPlant(null);
          setDoctorResult(null); // Clear doctor result when closing
        }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">{info.name} <button className="close-btn" onClick={() => { setSelectedPlant(null); setDoctorResult(null); }}>X</button></div>
            <div className="modal-body">
              {!isPlanted && info.method !== "-" && info.method !== "INFRASTRUCTURE" ? (
                <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                  <p style={{ color: '#d62828', fontWeight: 'bold', fontSize: '22px' }}>This crop is currently unplanted.</p>
                  <button className="btn-action feed" onClick={() => markAction(info.name, 'planted')} style={{ width: '100%' }}>🌱 MARK PLANTED</button>
                </div>
              ) : (
                <>
                  {info.method !== "-" && info.method !== "INFRASTRUCTURE" && (
                    <div style={{ textAlign: 'center', marginBottom: '10px', fontWeight: 'bold', color: '#f5cc85', background: '#2b4a24', padding: '12px', border: '4px solid #36141a', fontSize: '24px', boxShadow: 'inset 4px 4px 0px rgba(255,255,255,0.2)' }}>
                      Current Phase: {activePhase.name} (Day {plantAge})
                    </div>
                  )}
                  
                  {/* PLANT DOCTOR BUTTON */}
                  {info.method !== "-" && info.method !== "INFRASTRUCTURE" && (
                    <div className="action-buttons" style={{ marginBottom: '15px' }}>
                      <label className="btn-action" style={{ background: '#d4a055', width: '100%', textAlign: 'center', display: 'block', cursor: 'pointer', color: '#36141a' }}>
                        📸 Plant Doctor
                        <input type="file" accept="image/*" capture="environment" style={{ display: 'none' }} onChange={runPlantDoctor} />
                      </label>
                    </div>
                  )}

                  {/* DOCTOR LOADING/RESULT AREA */}
                  {doctorLoading && <div style={{ padding: '10px', textAlign: 'center', color: '#d62828', fontFamily: 'VT323', fontSize: '22px' }}>Analyzing plant tissue... 🔬</div>}
                  {doctorResult && (
                    <div className="info-box" style={{ background: '#ebd9c8', borderColor: '#d62828', marginBottom: '15px' }}>
                      <div className="info-box-title" style={{ color: '#d62828' }}>🩺 Diagnosis & Remedy</div>
                      <div style={{ whiteSpace: 'pre-wrap', fontFamily: 'sans-serif', fontSize: '14px', lineHeight: '1.4', color: '#36141a' }}>{doctorResult}</div>
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
              <div className="data-row"><div className="data-label">Quantity</div><div className="data-value">{info.quantity} / sq ft</div></div>
              <div className="data-row"><div className="data-label">Spacing</div><div className="data-value">{info.spacing}</div></div>
              <div className="data-row"><div className="data-label">Seed Depth</div><div className="data-value">{info.depth}</div></div>
              <div className="data-row"><div className="data-label">Timeline</div><div className="data-value">{info.harvest}</div></div>
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

      {selectedBed && bedInfo && (
        <div className="modal-overlay" onClick={() => setSelectedBed(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">{bedInfo.title} <button className="close-btn" onClick={() => setSelectedBed(null)}>X</button></div>
            <div className="modal-body">
              <div style={{ textAlign: 'center', fontStyle: 'italic', marginBottom: '20px', color: '#823c11', fontSize: '22px' }}>Primary Focus: {bedInfo.focus}</div>
              <div className="info-box"><div className="info-box-title">⛏️ Bed Prep & Soil</div><div>{bedInfo.soilPrep}</div></div>
              <div className="info-box"><div className="info-box-title">💧 Macro Watering</div><div>{bedInfo.macroWatering}</div></div>
              <div className="info-box"><div className="info-box-title">🧪 Macro Feeding</div><div>{bedInfo.macroFeeding}</div></div>
              <div className="info-box" style={{ background: '#d17c38', color: '#ffe5a9', border: '4px solid #36141a' }}><div className="info-box-title" style={{color: '#ffe5a9'}}>🔑 Bed Secrets</div><div>{bedInfo.bedSecrets}</div></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
