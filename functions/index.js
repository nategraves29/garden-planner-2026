const { onSchedule } = require("firebase-functions/v2/scheduler");
const admin = require("firebase-admin");

// Initialize the Admin SDK to bypass security rules and access Firestore directly
admin.initializeApp();

exports.hourlyWeatherCheck = onSchedule("every 1 hours", async (event) => {
  try {
    // 1. Fetch Current Weather from Open-Meteo
    const lat = 45.43490497216875; // My Garden
    const lon = -122.85666196045891;
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=weather_code&timezone=America%2FLos_Angeles`;

    const response = await fetch(url);
    const data = await response.json();
    const currentCode = data.current.weather_code;

    // 2. Define WMO Rain Codes
    const rainCodes = [51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82, 95, 96, 99];

    // 3. If it is raining, update Firestore
    if (rainCodes.includes(currentCode)) {
      const db = admin.firestore();
      const choresRef = db.collection("gardenData").doc("chores");
      const docSnap = await choresRef.get();

      if (docSnap.exists) {
        const currentData = docSnap.data();
        const now = new Date().toISOString();
        const todayStr = new Date().toDateString();
        const newData = {};

        // Loop through all saved data and reset water timers for planted crops
        for (const key in currentData) {
          if (key !== 'system' && currentData[key]?.planted) {
            newData[key] = { ...currentData[key], watered: now };
          }
        }

        // Log the system nature water event
        if (!newData.system) newData.system = { ...currentData.system };
        newData.system.lastNatureWater = todayStr;

        // Push the update to Firebase
        await choresRef.set(newData, { merge: true });
        console.log(`🌧️ Rain detected (Code ${currentCode}). Timers reset at ${now}.`);
      }
    } else {
      console.log(`🌤️ No rain detected (Code ${currentCode}).`);
    }

  } catch (error) {
    console.error("Hourly weather check failed:", error);
  }
});