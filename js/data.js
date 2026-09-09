/**
 * SmartStop AI — Namma Metro Network Data & Configuration
 * Provides station directories, GPS coordinates, interchange hubs, and station types
 */

const METRO_DATA = {
  lines: {
    Purple: {
      name: "Purple Line",
      color: "#8E24AA",
      terminalEast: "Whitefield (Kadugodi)",
      terminalWest: "Challaghatta",
      stations: [
        { name: "Whitefield (Kadugodi)", type: "tech", lat: 12.9961, lon: 77.7610, hub: "IT Corridor" },
        { name: "Hopefarm Channasandra", type: "residential", lat: 12.9925, lon: 77.7533 },
        { name: "Kadugodi Tree Park", type: "residential", lat: 12.9902, lon: 77.7438 },
        { name: "Pattandur Agrahara", type: "tech", lat: 12.9880, lon: 77.7340, hub: "ITPB Entrance" },
        { name: "Sri Sathya Sai Hospital", type: "medical", lat: 12.9862, lon: 77.7251 },
        { name: "Nallurhalli", type: "residential", lat: 12.9840, lon: 77.7160 },
        { name: "Kundalahalli", type: "tech", lat: 12.9818, lon: 77.7075 },
        { name: "Seetharampalya", type: "tech", lat: 12.9790, lon: 77.6980 },
        { name: "Hoodi", type: "tech", lat: 12.9770, lon: 77.6890 },
        { name: "Garudacharapalya", type: "commercial", lat: 12.9750, lon: 77.6800 },
        { name: "Singayyanapalya", type: "commercial", lat: 12.9730, lon: 77.6710 },
        { name: "Krishnarajapura", type: "transit-hub", lat: 12.9710, lon: 77.6620, hub: "Railway Interchange" },
        { name: "Benniganahalli", type: "residential", lat: 12.9690, lon: 77.6530 },
        { name: "Baiyappanahalli", type: "transit-hub", lat: 12.9670, lon: 77.6440 },
        { name: "Swami Vivekananda Road", type: "residential", lat: 12.9650, lon: 77.6350 },
        { name: "Indiranagar", type: "commercial", lat: 12.9630, lon: 77.6260, hub: "Dining & Tech Hub" },
        { name: "Halasuru", type: "cultural", lat: 12.9610, lon: 77.6170 },
        { name: "Trinity", type: "commercial", lat: 12.9590, lon: 77.6080 },
        { name: "Mahatma Gandhi Road", type: "commercial", lat: 12.9756, lon: 77.6066, hub: "Central Business District" },
        { name: "Cubbon Park", type: "civic", lat: 12.9790, lon: 77.5990 },
        { name: "Vidhana Soudha", type: "civic", lat: 12.9797, lon: 77.5912, hub: "State Secretariat" },
        { name: "Sir M Visvesvaraya", type: "educational", lat: 12.9740, lon: 77.5850 },
        { name: "Majestic", type: "interchange", lat: 12.9758, lon: 77.5728, hub: "Central Multi-modal Interchange" },
        { name: "KSR Railway Station", type: "transit-hub", lat: 12.9780, lon: 77.5670 },
        { name: "Magadi Road", type: "residential", lat: 12.9750, lon: 77.5580 },
        { name: "Hosahalli", type: "residential", lat: 12.9720, lon: 77.5490 },
        { name: "Vijayanagar", type: "commercial", lat: 12.9690, lon: 77.5400 },
        { name: "Attiguppe", type: "residential", lat: 12.9660, lon: 77.5310 },
        { name: "Deepanjali Nagar", type: "commercial", lat: 12.9630, lon: 77.5220 },
        { name: "Mysuru Road", type: "transit-hub", lat: 12.9600, lon: 77.5130 },
        { name: "Pantharapalya", type: "residential", lat: 12.9570, lon: 77.5040 },
        { name: "Rajarajeshwari Nagar", type: "residential", lat: 12.9540, lon: 77.4950 },
        { name: "Jnanabharathi", type: "educational", lat: 12.9510, lon: 77.4860, hub: "Bangalore University" },
        { name: "Pattanagere", type: "residential", lat: 12.9480, lon: 77.4770 },
        { name: "Kengeri Bus Terminal", type: "transit-hub", lat: 12.9450, lon: 77.4680 },
        { name: "Kengeri", type: "residential", lat: 12.9420, lon: 77.4590 },
        { name: "Challaghatta", type: "depot", lat: 12.9390, lon: 77.4500 }
      ]
    },
    Green: {
      name: "Green Line",
      color: "#2E7D32",
      terminalNorth: "Madavara",
      terminalSouth: "Silk Institute",
      stations: [
        { name: "Madavara", type: "transit-hub", lat: 13.0650, lon: 77.4850, hub: "BIEC Exhibition Centre" },
        { name: "Chikkabidarakallu", type: "residential", lat: 13.0580, lon: 77.4920 },
        { name: "Manjunath Nagar", type: "residential", lat: 13.0510, lon: 77.4990 },
        { name: "Nagasandra", type: "residential", lat: 13.0440, lon: 77.5060 },
        { name: "Dasarahalli", type: "commercial", lat: 13.0370, lon: 77.5130 },
        { name: "Jalahalli", type: "residential", lat: 13.0300, lon: 77.5200 },
        { name: "Peenya Industry", type: "industrial", lat: 13.0230, lon: 77.5270, hub: "Industrial Estate" },
        { name: "Peenya", type: "industrial", lat: 13.0160, lon: 77.5340 },
        { name: "Goraguntepalya", type: "transit-hub", lat: 13.0090, lon: 77.5410 },
        { name: "Yeshwanthpur", type: "transit-hub", lat: 13.0020, lon: 77.5480, hub: "Major Railway Junction" },
        { name: "Sandal Soap Factory", type: "industrial", lat: 12.9950, lon: 77.5550 },
        { name: "Mahalakshmi", type: "residential", lat: 12.9880, lon: 77.5620 },
        { name: "Rajajinagar", type: "commercial", lat: 12.9810, lon: 77.5690 },
        { name: "Mahakavi Kuvempu Road", type: "residential", lat: 12.9770, lon: 77.5660 },
        { name: "Srirampura", type: "residential", lat: 12.9730, lon: 77.5630 },
        { name: "Sampige Road", type: "commercial", lat: 12.9690, lon: 77.5600, hub: "Malleshwaram Hub" },
        { name: "Majestic", type: "interchange", lat: 12.9758, lon: 77.5728, hub: "Central Multi-modal Interchange" },
        { name: "Chickpete", type: "commercial", lat: 12.9680, lon: 77.5760, hub: "Wholesale Market" },
        { name: "KR Market", type: "commercial", lat: 12.9620, lon: 77.5780 },
        { name: "National College", type: "educational", lat: 12.9550, lon: 77.5790 },
        { name: "Lalbagh", type: "cultural", lat: 12.9480, lon: 77.5810, hub: "Botanical Garden" },
        { name: "South End Circle", type: "residential", lat: 12.9410, lon: 77.5820 },
        { name: "Jayanagar", type: "commercial", lat: 12.9340, lon: 77.5830, hub: "Shopping District" },
        { name: "RV Road", type: "interchange", lat: 12.9270, lon: 77.5840, hub: "Future Yellow Line Interchange" },
        { name: "Banashankari", type: "transit-hub", lat: 12.9200, lon: 77.5850, hub: "BMTC Bus Hub" },
        { name: "Jayaprakash Nagar", type: "residential", lat: 12.9130, lon: 77.5860 },
        { name: "Yelachenahalli", type: "residential", lat: 12.9060, lon: 77.5870 },
        { name: "Konanakunte Cross", type: "commercial", lat: 12.8990, lon: 77.5880, hub: "Forum South Bengaluru" },
        { name: "Doddakallasandra", type: "residential", lat: 12.8920, lon: 77.5890 },
        { name: "Vajarahalli", type: "residential", lat: 12.8850, lon: 77.5900 },
        { name: "Thalaghattapura", type: "residential", lat: 12.8780, lon: 77.5910 },
        { name: "Silk Institute", type: "educational", lat: 12.8710, lon: 77.5920, hub: "CSTRI Campus" }
      ]
    }
  },

  // Seed history for demo accounts
  seedHistory: {
    "Karthik": {
      "Indiranagar": { "Whitefield (Kadugodi)": 14, "Mahatma Gandhi Road": 3 },
      "Whitefield (Kadugodi)": { "Indiranagar": 12, "Majestic": 2 },
      "Majestic": { "Indiranagar": 8, "Jayanagar": 4 }
    },
    "Shreyas": {
      "Yeshwanthpur": { "Majestic": 16, "National College": 5 },
      "Majestic": { "Whitefield (Kadugodi)": 11, "Yeshwanthpur": 9 }
    },
    "Guest": {
      "Indiranagar": { "Mahatma Gandhi Road": 6, "Whitefield (Kadugodi)": 4 },
      "Majestic": { "Whitefield (Kadugodi)": 5, "Indiranagar": 5 }
    }
  }
};

// Quick helper to fetch station list as strings for compatibility
const STATIONS = {
  Purple: METRO_DATA.lines.Purple.stations.map(s => s.name),
  Green: METRO_DATA.lines.Green.stations.map(s => s.name)
};

// Bind to window for global access
window.METRO_DATA = METRO_DATA;
window.STATIONS = STATIONS;

