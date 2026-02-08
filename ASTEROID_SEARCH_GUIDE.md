# Finding Asteroids in CosmosTrace

## Overview
CosmosTrace now has **multiple ways** to find asteroids, including famous asteroids like Eros, Apophis, Bennu, and thousands of others from the NASA database.

## Search Methods

### 1. Live Feed Dashboard
**Location:** Dashboard tab
- Shows asteroids with **close approaches in the next 7 days**
- Real-time data from NASA NEO Feed API
- Best for finding asteroids that are currently near Earth

**Asteroids Found Here:**
- Recently discovered asteroids with upcoming close approaches
- Potentially hazardous asteroids making approaches
- Active tracking targets

---

### 2. Dedicated Search Tab
**Location:** Search tab
- Search **any asteroid** in the NASA NEO database
- Includes famous asteroids like Eros, Apophis, Bennu, Itokawa
- Shows detailed information including orbital data
- Displays multiple future close approaches

**How to Use:**
1. Click the "Search" tab
2. Type asteroid name (e.g., "Eros", "Apophis")
3. View complete asteroid details including:
   - Diameter
   - Orbital period
   - Hazard classification
   - Future close approaches
   - Links to NASA JPL page

**Famous Asteroids Available:**
- **Eros** - S-type asteroid, visited by NEAR mission
- **Apophis** - 325m asteroid with predictable close approaches
- **Bennu** - B-type asteroid, OSIRIS-REx sample return mission
- **Itokawa** - S-type asteroid, Hayabusa mission target
- **2023 DW** - Recently discovered NEO
- **Toutatis** - Historic asteroid, multiple Earth encounters

---

### 3. Asteroid List with Quick Search
**Location:** Asteroids tab
- Shows asteroids with current close approaches
- Quick search buttons for famous asteroids
- Filter by hazard level
- Search within live feed results

**Quick Search Buttons:**
- Eros
- Apophis
- Bennu
- Itokawa

---

### 4. API Search Endpoints

#### Search Specific Asteroid by Name
```
GET /api/asteroid-lookup?name=Eros
```

Returns detailed information including:
- Full asteroid data
- Multiple close approach dates
- Orbital characteristics
- Hazard status

#### Example Response:
```json
{
  "id": "2000433",
  "name": "(433) Eros",
  "designation": "433",
  "diameter": {
    "estimated_diameter_min": 8.4,
    "estimated_diameter_max": 18.8
  },
  "hazardous": false,
  "orbitalData": {
    "orbital_period": 1.7603
  },
  "closeApproachData": [
    {
      "close_approach_date": "2026-02-14",
      "miss_distance": {
        "kilometers": "..."
      }
    }
  ]
}
```

---

## Which Method to Use

| Need | Method | Best For |
|------|--------|----------|
| See active threats now | Dashboard | Current situation awareness |
| Find a specific asteroid | Search Tab | Known asteroid lookup |
| Browse current passes | Asteroids Tab | Detailed live feed data |
| Technical data | API | Custom applications |

---

## Asteroid Categories

### Historical Asteroids (Always Findable)
These are well-documented asteroids with stable orbits:
- Eros
- Apophis
- Bennu
- Itokawa
- Toutatis

### Recently Discovered (In Feed When Approaching)
- Appear in Dashboard/Asteroids tab when within 7 days of closest approach
- Searchable anytime via Search tab
- Examples: 2023 DW, recent discoveries

---

## Tips for Finding Asteroids

1. **For Famous Asteroids:** Use the Search tab - these are always available
2. **For Current Close Approaches:** Use the Dashboard - updated in real-time
3. **For Hazardous Objects:** Use the Risk Analysis tab
4. **For Detailed Data:** Use the Asteroids tab with filters

---

## NASA Data Sources

All data comes from NASA's Near-Earth Object APIs:

1. **Feed API** - Current close approaches (7-day window)
2. **Browse API** - Complete NEO database (thousands of objects)
3. **Lookup API** - Specific asteroid details by ID or name

---

## Understanding Asteroid Status

### Potentially Hazardous (PHO)
- Absolute magnitude: 22.0 or brighter
- Minimum orbit intersection distance < 7.5 million km
- NOT an impact warning - just a classification
- Most will miss Earth

### Safe Classification
- Farther from Earth or smaller
- Still tracked and monitored
- Important for scientific study

---

## Common Questions

**Q: Why isn't Asteroid X in the live feed?**
A: The live feed only shows asteroids with close approaches in the next 7 days. Use the Search tab to find any asteroid.

**Q: Can I see historical data?**
A: Yes - the Search tab includes historical and orbital information for all asteroids.

**Q: Are these real-time predictions?**
A: Yes - all data is from NASA's current database and is updated regularly.

**Q: How often is data updated?**
A: The feed refreshes every 30 seconds. Historical data is updated as new observations are made.

---

## Need More Info?

- Click "View on NASA JPL" for official asteroid pages
- Check orbital data in search results for detailed mechanics
- Review close approach dates for future visibility windows
