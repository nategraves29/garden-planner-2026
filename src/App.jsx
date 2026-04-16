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
// PLANT DATABASE
// ==========================================
const plantDatabase = {
  "Radishes": { color: "#ff8fab", method: "DIRECT SOW", quantity: "16 seeds", depth: "1/2 inch", harvest: "25-30 days", water: "Daily mist. Scatter Vermiculite to hold moisture.", feed: "Light Fish Emulsion (5-1-1)", pruning: "Snip weakest sprouts until 16 remain.", notes: "Lightning fast crop." },
  "Carrots": { color: "#ffb703", method: "DIRECT SOW", quantity: "9 seeds", depth: "1/4 inch", harvest: "70-80 days", water: "Needs daily moisture for 21 days! Use cardboard trick.", feed: "Light Fish Emulsion (5-1-1)", pruning: "Dust with dirt, thin to 9.", notes: "Loose, rock-free soil." },
  "Buttercrunch & Romaine": { color: "#90be6d", method: "DIRECT SOW", quantity: "4 plants", depth: "Surface", harvest: "55-65 days", water: "Keep surface damp.", feed: "Light Fish Emulsion (5-1-1)", pruning: "Harvest outer leaves.", notes: "Press seeds firmly into surface." },
  "Arugula": { color: "#73a942", method: "DIRECT SOW", quantity: "9 plants", depth: "1/2 inch", harvest: "40-50 days", water: "Standard soak.", feed: "Light Fish Emulsion (5-1-1)", pruning: "Cut-and-come again.", notes: "Will bolt in heat. Shade with tomatoes." },
  "Spinach": { color: "#538d22", method: "DIRECT SOW", quantity: "9 plants", depth: "1/2 inch", harvest: "40-50 days", water: "Standard soak.", feed: "Light Fish Emulsion (5-1-1)", pruning: "Cut-and-come again.", notes: "Loves cool spring." },
  "Red Onions": { color: "#cda4f4", method: "TRANSPLANT", quantity: "4 plants", depth: "Root depth", harvest: "90-110 days", water: "Stop watering late in season.", feed: "Fish Emulsion every 3-4 weeks.", pruning: "Keep meticulously weeded.", notes: "Conservative spacing." },
  "Yellow Onions": { color: "#fcefb4", method: "TRANSPLANT", quantity: "4 plants", depth: "Root depth", harvest: "90-110 days", water: "Stop watering late in season.", feed: "Fish Emulsion every 3-4 weeks.", pruning: "Keep meticulously weeded.", notes: "Conservative spacing." },
  "Parsley": { color: "#a7c957", method: "DIRECT SOW", quantity: "2 plants", depth: "1/4 inch", harvest: "60-70 days", water: "Daily mist until sprout.", feed: "Light Fish Emulsion", pruning: "Snip stems from outside in.", notes: "Slow to germinate." },
  "Cilantro": { color: "#a7c957", method: "DIRECT SOW", quantity: "2 plants", depth: "1/4 inch", harvest: "60-70 days", water: "Daily mist until sprout.", feed: "Light Fish Emulsion", pruning: "Snip above leaf node to bush.", notes: "Bolts in heat." },
  "Broccoli": { color: "#4c956c", method: "TRANSPLANT", quantity: "1 plant", depth: "Crown level", harvest: "50-70 days", water: "Deep soak 2-3x a week.", feed: "High N Fish Emulsion (5-1-1)", pruning: "Leave plant after harvesting main head for side shoots.", notes: "Watch for cabbage loopers." },
  "Dwarf Siberian Kale": { color: "#2c6e49", method: "TRANSPLANT", quantity: "1 plant", depth: "Crown level", harvest: "50-70 days", water: "Standard soak.", feed: "High N Fish Emulsion (5-1-1)", pruning: "Cut-and-come-again: Harvest outermost leaves.", notes: "Frost makes leaves sweeter." },
  "Collard Greens": { color: "#6a994e", method: "TRANSPLANT", quantity: "1 plant", depth: "Crown level", harvest: "50-70 days", water: "Standard soak.", feed: "High N Fish Emulsion (5-1-1)", pruning: "Cut-and-come-again: Harvest outermost leaves.", notes: "Prehistoric-looking bush." },
  "Sugar Snap Peas": { color: "#d9ed92", method: "DIRECT SOW", quantity: "9 seeds", depth: "1 inch", harvest: "60-70 days", water: "Standard soak.", feed: "Light Fish Emulsion", pruning: "Harvest every 1-2 days.", notes: "Nitrogen fixer." },
  "Green Beans": { color: "#b5e48c", method: "DIRECT SOW", quantity: "9 seeds", depth: "1 inch", harvest: "50-60 days", water: "Standard soak.", feed: "Light Fish Emulsion", pruning: "Harvest every 1-2 days.", notes: "Plant outside after frost in late May." },
  "Cucumbers": { color: "#52b788", method: "DIRECT SOW", quantity: "1 plant", depth: "1 inch", harvest: "50-70 days", water: "Heavy drinker.", feed: "Light Fish Emulsion", pruning: "Pick continuously.", notes: "Reduced density saves summer water." },
  "Roma Tomato": { color: "#e63946", method: "TRANSPLANT", quantity: "1 massive plant", depth: "Bury stem deep", harvest: "65-85 days", water: "Cut water by 50% in late summer.", feed: "Fruiting Fertilizer (2-8-4)", pruning: "Pinch suckers.", notes: "Wait until late May to move outside." },
  "Beefsteak": { color: "#d62828", method: "TRANSPLANT", quantity: "1 massive plant", depth: "Bury stem deep", harvest: "80-90 days", water: "Deep soak.", feed: "Fruiting Fertilizer (2-8-4)", pruning: "Aggressive sucker pruning.", notes: "Wait until late May." },
  "Cherry Tomato": { color: "#f25c54", method: "TRANSPLANT", quantity: "1 massive plant", depth: "Bury stem deep", harvest: "65-75 days", water: "Deep soak.", feed: "Fruiting Fertilizer (2-8-4)", pruning: "Pinch early suckers.", notes: "Prolific." },
  "Tomatillo": { color: "#a7c957", method: "TRANSPLANT", quantity: "1 massive plant", depth: "Bury stem deep", harvest: "65-85 days", water: "Deep soak.", feed: "Fruiting Fertilizer (2-8-4)", pruning: "Heavy support needed.", notes: "Needs 2 to cross-pollinate." },
  "Basil": { color: "#74c69d", method: "TRANSPLANT", quantity: "4 plants", depth: "Crown level", harvest: "30-40 days", water: "Standard soak.", feed: "Light Fish Emulsion", pruning: "Pinch to bush out. Remove flowers.", notes: "Cold sensitive." },
  "Thai Basil": { color: "#52b788", method: "TRANSPLANT", quantity: "4 plants", depth: "Crown level", harvest: "30-40 days", water: "Standard soak.", feed: "Light Fish Emulsion", pruning: "Pinch to bush out.", notes: "Great tomato companion." },
  "Bell Pepper": { color: "#f4a261", method: "TRANSPLANT", quantity: "1 plant", depth: "Crown level (Do not bury)", harvest: "70-80 days", water: "Standard soak.", feed: "Fruiting Fertilizer (2-8-4)", pruning: "Pluck first early blossoms.", notes: "Leave on vine to turn red." },
  "Jalapeno": { color: "#2a9d8f", method: "TRANSPLANT", quantity: "1 plant", depth: "Crown level", harvest: "70-80 days", water: "Heat stress for max spice.", feed: "Fruiting Fertilizer", pruning: "Pluck first blossoms.", notes: "Turns red if left on vine." },
  "Serrano": { color: "#2a9d8f", method: "TRANSPLANT", quantity: "1 plant", depth: "Crown level", harvest: "70-80 days", water: "Heat stress for max spice.", feed: "Fruiting Fertilizer", pruning: "Pluck first blossoms.", notes: "Spicier than Jalapenos." },
  "Thai Hot": { color: "#e63946", method: "TRANSPLANT", quantity: "1 plant", depth: "Crown level", harvest: "70-80 days", water: "Heat stress for max spice.", feed: "Fruiting Fertilizer", pruning: "Pluck first blossoms.", notes: "Fiercely hot." },
  "Shishito": { color: "#a7c957", method: "TRANSPLANT", quantity: "1 plant", depth: "Crown level", harvest: "60-70 days", water: "Standard soak.", feed: "Fruiting Fertilizer", pruning: "Harvest green & wrinkly.", notes: "1 in 10 is spicy." },
  "Marigold": { color: "#fb8500", method: "TRANSPLANT", quantity: "1 plant", depth: "Crown level", harvest: "50 days", water: "Standard soak.", feed: "None required.", pruning: "Deadhead flowers.", notes: "Nematode defender." },
  "Nasturtiums": { color: "#ff5400", method: "DIRECT SOW", quantity: "2 plants", depth: "1 inch", harvest: "55-65 days", water: "Standard soak.", feed: "None.", pruning: "Cascade over edge.", notes: "Trap crop for aphids." },
  "Calendula": { color: "#ffb703", method: "DIRECT SOW", quantity: "1 plant", depth: "1/4 inch", harvest: "50-60 days", water: "Standard soak.", feed: "None required.", pruning: "Deadhead spent blooms.", notes: "Attracts predatory insects." },
  "SubPod": { color: "#ebd9c8", method: "INFRASTRUCTURE", quantity: "-", depth: "-", harvest: "Continuous", water: "Keep moist.", feed: "Kitchen scraps", pruning: "-", notes: "The nutrient engine." },
  "Open Space": { color: "#e9ecef", method: "-", quantity: "0", depth: "-", harvest: "-", water: "-", feed: "-", pruning: "-", notes: "Reserved area." }
};

const getPlantData = (plantName) => {
  if (plantDatabase[plantName]) return { name: plantName, ...plantDatabase[plantName] };
  const key = Object.keys(plantDatabase).find(k => plantName.includes(k));
  if (key) return { name: key, ...plantDatabase[key] };
  return null;
};

// ==========================================
// RENDER HELPERS
// ==========================================
const GridRenderer = ({ title, bedId, columns, data, onPlantClick, onBedClick }) => (
  <div className="bed-section">
    <div className="bed-header" onClick={() => onBedClick(bedId)}>
      {title} <span className="bed-header-icon">🔎 View Care</span>
    </div>
    <div className={columns === 6 ? "grid-6" : "grid-3"}>
      {data.map((plant, idx) => {
        const info = getPlantData(plant);
        return (
          <div 
            key={idx} 
            className="grid-item" 
            style={{ backgroundColor: info ? info.color : '#ced4da' }}
            onClick={() => onPlantClick(plant)}
          >
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
  const [timestamps, setTimestamps] = useState({});

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "gardenData", "chores"), (docSnap) => {
      if (docSnap.exists()) {
        setTimestamps(docSnap.data());
      }
    });
    return () => unsub();
  }, []);

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

  return (
    <div className="container">
      <h1>GARDEN PLANNER 2026</h1>
      <div className="subtitle">Database Sync Active • Tap Blocks to Log Chores</div>

      <GridRenderer bedId="bed1" title="BED 1 • Roots & Greens (6x3x2')" columns={6} data={bed1} onPlantClick={setSelectedPlant} onBedClick={setSelectedBed} />
      <GridRenderer bedId="bed2" title="BED 2 • Allium & Herb (6x3x2')" columns={6} data={bed2} onPlantClick={setSelectedPlant} onBedClick={setSelectedBed} />
      <GridRenderer bedId="bed3" title="BED 3 • Brassicas (6x3x2')" columns={6} data={bed3} onPlantClick={setSelectedPlant} onBedClick={setSelectedBed} />

      <div className="flex-row">
        <div className="flex-col">
          <GridRenderer bedId="bed4" title="BED 4 • Pea Trellis & Peppers" columns={3} data={bed4} onPlantClick={setSelectedPlant} onBedClick={setSelectedBed} />
        </div>
        <div className="flex-col">
          <GridRenderer bedId="bed5" title="BED 5 • Vines & Beans" columns={3} data={bed5} onPlantClick={setSelectedPlant} onBedClick={setSelectedBed} />
        </div>
        <div className="flex-col">
          <GridRenderer bedId="bed6" title="BED 6 • Tomatillo Hub" columns={3} data={bed6} onPlantClick={setSelectedPlant} onBedClick={setSelectedBed} />
        </div>
      </div>

      <GridRenderer bedId="bed7" title="BED 7 • Tomato & Basil Haven (6x3x3')" columns={6} data={bed7} onPlantClick={setSelectedPlant} onBedClick={setSelectedBed} />

      {/* PLANT MODAL */}
      {selectedPlant && info && (
        <div className="modal-overlay" onClick={() => setSelectedPlant(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              {info.name}
              <button className="close-btn" onClick={() => setSelectedPlant(null)}>X</button>
            </div>
            <div className="modal-body">
              
              <div className="action-buttons">
                <button className="btn-action water" onClick={() => markAction(info.name, 'watered')}>💦 Watered</button>
                <button className="btn-action feed" onClick={() => markAction(info.name, 'fed')}>🧪 Fed</button>
              </div>

              <div className="status-box">
                <p>Last Watered: {timestamps[info.name]?.watered ? new Date(timestamps[info.name].watered).toLocaleString([], {month: 'numeric', day: 'numeric', hour: '2-digit', minute:'2-digit'}) : 'Never'}</p>
                <p>Last Fed: {timestamps[info.name]?.fed ? new Date(timestamps[info.name].fed).toLocaleString([], {month: 'numeric', day: 'numeric', hour: '2-digit', minute:'2-digit'}) : 'Never'}</p>
              </div>

              <div className="data-row"><div className="data-label">Method</div><div className="data-value"><strong>{info.method}</strong></div></div>
              <div className="data-row"><div className="data-label">Spacing</div><div className="data-value">{info.quantity} / sq ft</div></div>
              <div className="data-row"><div className="data-label">Seed Depth</div><div className="data-value">{info.depth}</div></div>
              <div className="data-row"><div className="data-label">Timeline</div><div className="data-value">{info.harvest}</div></div>

              <div className="info-box"><div className="info-box-title">💧 Watering</div><div>{info.water}</div></div>
              <div className="info-box"><div className="info-box-title">🧪 Feeding</div><div>{info.feed}</div></div>
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