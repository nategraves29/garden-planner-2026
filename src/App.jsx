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
// DYNAMIC CHRONOLOGICAL PLANT DATABASE
// ==========================================
const plantDatabase = {
  "Radishes": { color: "#ff8fab", method: "DIRECT SOW (Precision Poke)", quantity: "16 seeds", depth: "1/2 inch", harvest: "25-30 days", pruning: "Snip weakest sprouts.", notes: "Pro-Tip: Lightning fast. Harvest promptly to free up root space.", 
    phases: [{ name: "Growth", startDay: 0, waterDays: 1, water: "Daily mist to keep soil soft.", feedDays: 14, feed: "Light Fish Emulsion (5-1-1)" }] },
  "Carrots": { color: "#ffb703", method: "DIRECT SOW (Scatter & Thin)", quantity: "Thin to 9", depth: "1/4 inch", harvest: "70-80 days", pruning: "Dust with dirt, thin at 2 inches tall.", notes: "Sowing Secret: Seeds are tiny. Scatter lightly, then thin down to a conservative 9 per sq ft to preserve soil nutrients.", 
    phases: [
      { name: "Germination", startDay: 0, waterDays: 1, water: "Needs daily moisture! Use cardboard trick.", feedDays: null, feed: "None required yet." },
      { name: "Maturation", startDay: 21, waterDays: 3, water: "Deep soak every 3 days.", feedDays: 21, feed: "Light Fish Emulsion (5-1-1)" }
    ]},
  "Buttercrunch & Romaine": { color: "#90be6d", method: "DIRECT SOW (Precision Poke)", quantity: "4 seeds", depth: "Surface", harvest: "55-65 days", pruning: "Harvest outer leaves.", notes: "Sowing Secret: Lettuce needs light to germinate. Press seeds firmly into dirt, do not bury.", 
    phases: [{ name: "Growth", startDay: 0, waterDays: 2, water: "Keep surface damp.", feedDays: 14, feed: "Light Fish Emulsion (5-1-1)" }] },
  "Arugula": { color: "#73a942", method: "DIRECT SOW (Scatter & Thin)", quantity: "Thin to 9", depth: "1/2 inch", harvest: "40-50 days", pruning: "Cut-and-come again.", notes: "Continuous Harvest Secret: Never pull the roots. Just cut the leaves and it will regrow.", 
    phases: [{ name: "Growth", startDay: 0, waterDays: 2, water: "Standard soak.", feedDays: 14, feed: "Light Fish Emulsion (5-1-1)" }] },
  "Spinach": { color: "#538d22", method: "DIRECT SOW (Precision Poke)", quantity: "9 seeds", depth: "1/2 inch", harvest: "40-50 days", pruning: "Cut-and-come again.", notes: "Pro-Tip: Loves cool spring. Shade with taller crops later in the season.", 
    phases: [{ name: "Growth", startDay: 0, waterDays: 2, water: "Standard soak.", feedDays: 14, feed: "Light Fish Emulsion (5-1-1)" }] },
  "Red Onions": { color: "#cda4f4", method: "TRANSPLANT", quantity: "4 plants", depth: "Root depth", harvest: "90-110 days", pruning: "Keep meticulously weeded.", notes: "Growing Secret: Onions hate competition. Hand-pull all weeds immediately.", 
    phases: [
      { name: "Bulb Swelling", startDay: 0, waterDays: 3, water: "Standard deep soak.", feedDays: 28, feed: "Fish Emulsion every 4 weeks." },
      { name: "Curing", startDay: 80, waterDays: null, water: "CRITICAL: Stop watering entirely when tops flop over.", feedDays: null, feed: "None." }
    ]},
  "Yellow Onions": { color: "#fcefb4", method: "TRANSPLANT", quantity: "4 plants", depth: "Root depth", harvest: "90-110 days", pruning: "Keep meticulously weeded.", notes: "Growing Secret: Onions hate competition. Hand-pull all weeds immediately.", 
    phases: [
      { name: "Bulb Swelling", startDay: 0, waterDays: 3, water: "Standard deep soak.", feedDays: 28, feed: "Fish Emulsion every 4 weeks." },
      { name: "Curing", startDay: 80, waterDays: null, water: "CRITICAL: Stop watering entirely when tops flop over.", feedDays: null, feed: "None." }
    ]},
  "Parsley": { color: "#a7c957", method: "DIRECT SOW (Precision Poke)", quantity: "2 seeds", depth: "1/4 inch", harvest: "60-70 days", pruning: "Snip stems from outside in.", notes: "Sowing Secret: Extremely slow to germinate. Don't give up on it.", 
    phases: [{ name: "Growth", startDay: 0, waterDays: 2, water: "Daily mist until sprout, then standard.", feedDays: 21, feed: "Light Fish Emulsion" }] },
  "Cilantro": { color: "#a7c957", method: "DIRECT SOW (Precision Poke)", quantity: "2 seeds", depth: "1/4 inch", harvest: "60-70 days", pruning: "Snip above leaf node.", notes: "Growing Secret: Bolts instantly in high heat. Harvest aggressively.", 
    phases: [{ name: "Growth", startDay: 0, waterDays: 2, water: "Daily mist until sprout, then standard.", feedDays: 21, feed: "Light Fish Emulsion" }] },
  "Broccoli": { color: "#4c956c", method: "TRANSPLANT", quantity: "1 plant", depth: "Crown level", harvest: "50-70 days", pruning: "Leave plant after harvesting main head.", notes: "Fruiting Secret: After cutting the main head, it will push out smaller side-shoots for weeks.", 
    phases: [{ name: "Heavy Growth", startDay: 0, waterDays: 3, water: "Deep soak 2-3x a week.", feedDays: 21, feed: "High Nitrogen Fish Emulsion (2 Tbsp/gal)" }] },
  "Dwarf Siberian Kale": { color: "#2c6e49", method: "TRANSPLANT", quantity: "1 plant", depth: "Crown level", harvest: "50-70 days", pruning: "Harvest outermost leaves.", notes: "Growing Secret: A light frost causes the plant to push sugars into the leaves, making them sweeter.", 
    phases: [{ name: "Growth", startDay: 0, waterDays: 3, water: "Standard soak.", feedDays: 21, feed: "High Nitrogen Fish Emulsion" }] },
  "Collard Greens": { color: "#6a994e", method: "TRANSPLANT", quantity: "1 plant", depth: "Crown level", harvest: "50-70 days", pruning: "Harvest outermost leaves.", notes: "Pro-Tip: Stems are tough, strip the leaves off the center rib before cooking.", 
    phases: [{ name: "Growth", startDay: 0, waterDays: 3, water: "Standard soak.", feedDays: 21, feed: "High Nitrogen Fish Emulsion" }] },
  "Sugar Snap Peas": { color: "#d9ed92", method: "DIRECT SOW (Precision Poke)", quantity: "9 seeds", depth: "1 inch", harvest: "60-70 days", pruning: "Harvest every 1-2 days.", notes: "Fruiting Secret: The more you pick, the more flowers it pushes. Never let a pod get overly fat.", 
    phases: [{ name: "Growth", startDay: 0, waterDays: 2, water: "Standard soak.", feedDays: 21, feed: "Light Fish Emulsion" }] },
  "Green Beans": { color: "#b5e48c", method: "DIRECT SOW (Precision Poke)", quantity: "9 seeds", depth: "1 inch", harvest: "50-60 days", pruning: "Harvest every 1-2 days.", notes: "Fruiting Secret: Beans are nitrogen fixers and pull their own food from the air.", 
    phases: [{ name: "Growth", startDay: 0, waterDays: 2, water: "Standard soak.", feedDays: 21, feed: "Light Fish Emulsion" }] },
  "Cucumbers": { color: "#52b788", method: "DIRECT SOW (Precision Poke)", quantity: "2 seeds (thin to 1)", depth: "1 inch", harvest: "50-70 days", pruning: "Pick continuously.", notes: "Growing Secret: Poke 2 seeds per hole, snip the weakest one. Train vines up the trellis immediately.", 
    phases: [{ name: "Growth", startDay: 0, waterDays: 2, water: "Heavy drinker. Deep soak.", feedDays: 14, feed: "Light Fish Emulsion" }] },
  "Roma Tomato": { color: "#e63946", method: "TRANSPLANT (Deep Trench)", quantity: "1 massive plant", depth: "Bury stem deep", harvest: "65-85 days", pruning: "Aggressive sucker pruning. Clear bottom 12 inches.", notes: "Transplanting Secret: Strip the bottom leaves and bury the stem horizontally. The buried stem will grow a massive taproot.", 
    phases: [
      { name: "Vegetative", startDay: 0, waterDays: 3, water: "Deep root soak. Keep leaves dry.", feedDays: 14, feed: "Start with 4-4-4." },
      { name: "Fruiting/Ripening", startDay: 45, waterDays: 5, water: "Fruiting Secret: Cut water volume by 50% to force ripening.", feedDays: 14, feed: "Switch to Fruiting Fertilizer (2-8-4)." }
    ]},
  "Beefsteak": { color: "#d62828", method: "TRANSPLANT (Deep Trench)", quantity: "1 massive plant", depth: "Bury stem deep", harvest: "80-90 days", pruning: "Aggressive sucker pruning.", notes: "Transplanting Secret: Strip bottom leaves, bury stem deep to build the root engine.", 
    phases: [
      { name: "Vegetative", startDay: 0, waterDays: 3, water: "Deep root soak.", feedDays: 14, feed: "Start with 4-4-4." },
      { name: "Fruiting/Ripening", startDay: 50, waterDays: 5, water: "Fruiting Secret: Cut water volume by 50% to force ripening.", feedDays: 14, feed: "Switch to Fruiting Fertilizer (2-8-4)." }
    ]},
  "Cherry Tomato": { color: "#f25c54", method: "TRANSPLANT (Deep Trench)", quantity: "1 massive plant", depth: "Bury stem deep", harvest: "65-75 days", pruning: "Pinch early suckers only.", notes: "Fruiting Secret: Cherry tomatoes are chaotic. Prune early, then let them vine out wildly over the trellis.", 
    phases: [
      { name: "Vegetative", startDay: 0, waterDays: 3, water: "Deep root soak.", feedDays: 14, feed: "Start with 4-4-4." },
      { name: "Fruiting", startDay: 40, waterDays: 4, water: "Consistent deep soak.", feedDays: 14, feed: "Fruiting Fertilizer (2-8-4)." }
    ]},
  "Tomatillo": { color: "#a7c957", method: "TRANSPLANT", quantity: "1 massive plant", depth: "Bury stem deep", harvest: "65-85 days", pruning: "Heavy support needed.", notes: "Fruiting Secret: Strictly not self-pollinating. If one plant dies, the other will drop empty husks.", 
    phases: [{ name: "Growth & Bloom", startDay: 0, waterDays: 3, water: "Deep soak base, not leaves.", feedDays: 21, feed: "Fruiting Fertilizer (2-8-4)" }] },
  "Basil": { color: "#74c69d", method: "TRANSPLANT", quantity: "4 plants", depth: "Crown level", harvest: "30-40 days", pruning: "Pinch to bush out.", notes: "Growing Secret: Never let it flower. Pinch the top clusters off so it bushes outwards.", 
    phases: [{ name: "Growth", startDay: 0, waterDays: 2, water: "Standard soak.", feedDays: 21, feed: "Light Fish Emulsion" }] },
  "Thai Basil": { color: "#52b788", method: "TRANSPLANT", quantity: "4 plants", depth: "Crown level", harvest: "30-40 days", pruning: "Pinch to bush out.", notes: "Pro-Tip: Great companion for tomatoes, masks the scent from pests.", 
    phases: [{ name: "Growth", startDay: 0, waterDays: 2, water: "Standard soak.", feedDays: 21, feed: "Light Fish Emulsion" }] },
  "Bell Pepper": { color: "#f4a261", method: "TRANSPLANT", quantity: "1 plant", depth: "Crown level", harvest: "70-80 days", pruning: "Pluck first blossoms.", notes: "Growing Secret: Pluck the very first round of flowers off so the plant builds a stronger frame first.", 
    phases: [
      { name: "Growth", startDay: 0, waterDays: 3, water: "Consistent deep watering.", feedDays: 21, feed: "Start with 4-4-4." },
      { name: "Fruiting", startDay: 40, waterDays: 4, water: "Slight stress before picking.", feedDays: 14, feed: "Fruiting Fertilizer (2-8-4)." }
    ]},
  "Jalapeno": { color: "#2a9d8f", method: "TRANSPLANT", quantity: "1 plant", depth: "Crown level", harvest: "70-80 days", pruning: "Pluck first blossoms.", notes: "Fruiting Secret: Look for brown 'corking' lines on the skin—that means it's fully spicy and ready.", 
    phases: [
      { name: "Growth", startDay: 0, waterDays: 3, water: "Consistent deep watering.", feedDays: 21, feed: "Start with 4-4-4." },
      { name: "Fruiting (Spice Forcing)", startDay: 40, waterDays: 5, water: "Fruiting Secret: Heat & drought stress right before harvest spikes the capsaicin.", feedDays: 14, feed: "Fruiting Fertilizer (2-8-4)." }
    ]},
  "Serrano": { color: "#2a9d8f", method: "TRANSPLANT", quantity: "1 plant", depth: "Crown level", harvest: "70-80 days", pruning: "Pluck first blossoms.", notes: "Pro-Tip: Smaller and significantly spicier than Jalapenos.", 
    phases: [
      { name: "Growth", startDay: 0, waterDays: 3, water: "Consistent deep watering.", feedDays: 21, feed: "Start with 4-4-4." },
      { name: "Fruiting (Spice Forcing)", startDay: 40, waterDays: 5, water: "Fruiting Secret: Heat & drought stress right before harvest spikes the capsaicin.", feedDays: 14, feed: "Fruiting Fertilizer (2-8-4)." }
    ]},
  "Thai Hot": { color: "#e63946", method: "TRANSPLANT", quantity: "1 plant", depth: "Crown level", harvest: "70-80 days", pruning: "Pluck first blossoms.", notes: "Fruiting Secret: Produces hundreds of tiny peppers facing straight up at the sky.", 
    phases: [
      { name: "Growth", startDay: 0, waterDays: 3, water: "Consistent deep watering.", feedDays: 21, feed: "Start with 4-4-4." },
      { name: "Fruiting (Spice Forcing)", startDay: 40, waterDays: 5, water: "Fruiting Secret: Heat & drought stress right before harvest spikes the capsaicin.", feedDays: 14, feed: "Fruiting Fertilizer (2-8-4)." }
    ]},
  "Shishito": { color: "#a7c957", method: "TRANSPLANT", quantity: "1 plant", depth: "Crown level", harvest: "60-70 days", pruning: "Harvest green & wrinkly.", notes: "Growing Secret: 1 in 10 is spicy. Harvest when they are 2-3 inches long and very wrinkled.", 
    phases: [{ name: "Growth", startDay: 0, waterDays: 3, water: "Standard soak.", feedDays: 21, feed: "Fruiting Fertilizer (2-8-4)" }] },
  "Marigold": { color: "#fb8500", method: "TRANSPLANT", quantity: "1 plant", depth: "Crown level", harvest: "50 days", pruning: "Deadhead flowers.", notes: "Growing Secret: The roots secrete a chemical that actively kills root-knot nematodes in the soil.", 
    phases: [{ name: "Bloom", startDay: 0, waterDays: 3, water: "Standard soak.", feedDays: null, feed: "None required." }] },
  "Nasturtiums": { color: "#ff5400", method: "DIRECT SOW (Precision Poke)", quantity: "2 seeds", depth: "1 inch", harvest: "55-65 days", pruning: "Cascade over edge.", notes: "Growing Secret: A sacrificial trap crop. Aphids will attack this instead of your vegetables.", 
    phases: [{ name: "Bloom", startDay: 0, waterDays: 3, water: "Standard soak.", feedDays: null, feed: "None required." }] },
  "Calendula": { color: "#ffb703", method: "DIRECT SOW (Precision Poke)", quantity: "1 seed", depth: "1/4 inch", harvest: "50-60 days", pruning: "Deadhead spent blooms.", notes: "Growing Secret: Attracts predatory insects that hunt garden pests.", 
    phases: [{ name: "Bloom", startDay: 0, waterDays: 3, water: "Standard soak.", feedDays: null, feed: "None required." }] },
  "SubPod": { color: "#ebd9c8", method: "INFRASTRUCTURE", quantity: "-", depth: "-", harvest: "Continuous", pruning: "-", notes: "The nutrient engine.", phases: [{ name: "Active", startDay: 0, waterDays: null, water: "Keep moist.", feedDays: null, feed: "Kitchen scraps" }] },
  "Open Space": { color: "#e9ecef", method: "-", quantity: "0", depth: "-", harvest: "-", pruning: "-", notes: "Reserved area.", phases: [{ name: "Empty", startDay: 0, waterDays: null, water: "-", feedDays: null, feed: "-" }] }
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
              border: needsWater || needsFeed ? '3px solid #d62828' : '2px solid rgba(0,0,0,0.2)',
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

  // 1. Load Firebase Data
  useEffect(() => {
    const unsub = onSnapshot(doc(db, "gardenData", "chores"), (docSnap) => {
      if (docSnap.exists()) {
        setTimestamps(docSnap.data());
      }
      setTimestampsLoaded(true);
    });
    return () => unsub();
  }, []);

  // 2. Load Weather & Execute Nature Watering (WITH SAFETY CHECK)
  useEffect(() => {
    if (!timestampsLoaded) return;

    const fetchWeather = async () => {
      try {
        const apiKey = '33d438637f794339203a1ed6e9c071fc';
        const loc = 'Beaverton,US'; 
        
        // Fetch Current Weather
        const currentRes = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${loc}&units=imperial&appid=${apiKey}`);
        const currentData = await currentRes.json();
        
        // Fetch Forecast
        const forecastRes = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${loc}&units=imperial&appid=${apiKey}`);
        const forecastData = await forecastRes.json();

        // SAFETY CHECK: Only set weather and run logic if the API key is active and returned actual data (Code 200)
        if (currentData.cod === 200 && forecastData.cod === "200") {
          setWeather({ current: currentData, forecast: forecastData });

          // Logic Engine: Check for rain (Weather Codes 2xx, 3xx, 5xx)
          const weatherId = currentData.weather[0].id;
          const isRaining = weatherId >= 200 && weatherId < 600;

          if (isRaining) {
            const todayStr = new Date().toDateString();
            const lastNatureWater = timestamps['system']?.lastNatureWater;

            // If we haven't logged a rain event today, Nature Waters the garden!
            if (lastNatureWater !== todayStr) {
              triggerNatureWatering(todayStr, timestamps);
            }
          }
        } else {
          console.log("Weather API still activating or returned an error:", currentData.message);
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
      <div className="subtitle">
        Chronological Engine Active • Dim blocks await planting
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
      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
        <button 
          className="btn-action feed" 
          style={{ flex: 1, padding: '12px', fontSize: '16px', backgroundColor: '#e0b084', margin: 0 }}
          onClick={() => setShowFieldGuide(true)}
        >
          📖 Field Guide
        </button>
        <button 
          className="btn-action water" 
          style={{ flex: 1, padding: '12px', fontSize: '16px', backgroundColor: '#457b9d', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', margin: 0 }}
          onClick={handleManualRainLog}
        >
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
              
              <div className="info-box-title" style={{ color: '#d62828', borderBottom: '2px dashed #ccc', paddingBottom: '5px' }}>The 3-Step Seed Watering Strategy</div>
              <p><strong>1. The Pre-Soak:</strong> Before placing a single seed in the ground, the bed must be flooded. Dry soil wicks moisture away from the delicate seed coat. Soak the bed thoroughly the evening before planting.</p>
              <p><strong>2. The Cardboard Trick:</strong> Seeds like carrots and radishes are incredibly shallow and dry out in hours under direct sun. After direct sowing and misting the surface, lay a piece of plain brown cardboard directly over the dirt. This traps 100% of the moisture. Lift it daily to check for sprouts.</p>
              <p><strong>3. The Weaning Phase:</strong> Once germinated, remove the cardboard immediately. Transition from daily surface misting to deeper waterings every 2-3 days to force the young roots to dive downward in search of moisture.</p>
              
              <div className="info-box-title" style={{ color: '#2b4a24', borderBottom: '2px dashed #ccc', paddingBottom: '5px', marginTop: '30px' }}>Drip Irrigation Master Rules</div>
              <p><strong>Macro Rule 1 (Deep Root Soaking):</strong> Frequent, shallow watering creates weak, surface-level root systems that panic during a heatwave. The goal of the drip system is to run for longer periods (30-45 minutes depending on emitter flow) but less frequently (every 3-4 days), soaking the soil a full 8-12 inches down.</p>
              <p><strong>Macro Rule 2 (The Late-Summer Stress):</strong> For fruiting crops like Tomatoes and Peppers, water is your enemy in late August. Once the fruit has set and reached full size, cut your watering volume by 50%. This mild drought stress forces the plant to stop producing leaves and concentrate all its sugars into ripening the fruit, dramatically increasing flavor and spice.</p>
              <p><strong>Macro Rule 3 (The Allium Halt):</strong> Onions are susceptible to rot. When the green tops of your onions flop over onto the soil (usually mid-summer), their growing cycle is finished. You must stop watering that bed entirely to allow the bulbs to cure in the dry dirt before harvesting.</p>

            </div>
          </div>
        </div>
      )}

      {/* PLANT MODAL */}
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
                  <p style={{ color: '#d62828', fontWeight: 'bold' }}>This crop is currently unplanted.</p>
                  <button className="btn-action feed" onClick={() => markAction(info.name, 'planted')}>
                    🌱 MARK PLANTED (START CLOCK)
                  </button>
                </div>
              ) : (
                <>
                  {info.method !== "-" && info.method !== "INFRASTRUCTURE" && (
                    <div style={{ textAlign: 'center', marginBottom: '15px', fontWeight: 'bold', color: '#2b4a24', background: '#d9ed92', padding: '8px', borderRadius: '4px', border: '2px solid #2b4a24' }}>
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

              <div className="info-box"><div className="info-box-title">💧 Watering</div><div>{activePhase.water}</div></div>
              <div className="info-box"><div className="info-box-title">🧪 Feeding</div><div>{activePhase.feed}</div></div>
              <div className="info-box"><div className="info-box-title">✂️ Care</div><div>{info.pruning}</div></div>
              <div className="info-box" style={{ background: 'rgba(214, 40, 40, 0.1)', borderColor: '#d62828' }}>
                <div className="info-box-title" style={{color: '#d62828'}}>💡 Pro-Tip</div><div>{info.notes}</div>
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
              <div style={{ textAlign: 'center', fontStyle: 'italic', marginBottom: '20px', color: '#5d4037', fontWeight: 'bold' }}>
                Primary Focus: {bedInfo.focus}
              </div>
              <div className="info-box" style={{ borderColor: '#8c5b35' }}>
                <div className="info-box-title bed-theme">⛏️ Bed Prep & Soil</div><div>{bedInfo.soilPrep}</div>
              </div>
              <div className="info-box" style={{ borderColor: '#8c5b35' }}>
                <div className="info-box-title bed-theme">💧 Macro Watering</div><div>{bedInfo.macroWatering}</div>
              </div>
              <div className="info-box" style={{ borderColor: '#8c5b35' }}>
                <div className="info-box-title bed-theme">🧪 Macro Feeding</div><div>{bedInfo.macroFeeding}</div>
              </div>
              <div className="info-box" style={{ background: 'rgba(244, 162, 97, 0.2)', borderColor: '#f4a261' }}>
                <div className="info-box-title" style={{color: '#d62828'}}>🔑 Bed Secrets</div><div>{bedInfo.bedSecrets}</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}