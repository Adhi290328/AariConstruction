/**
 * AARI CONSTRUCTION — Application Data Store
 * Historical Portfolio, Category Definitions, and Request State Management
 */

export const CONFIG = {
  admin: {
    username: "aari",
    password: "aari2026"
  },
  owner: {
    name: "Mr. Aarikrishnan",
    title: "Founder & Managing Director",
    phone: "+91 98765 43210",
    phoneRaw: "919876543210",
    email: "contact@aariconstruction.in",
    address: "Aari Towers, 42 Mount Road, Guindy, Chennai - 600032",
    experienceYears: 18,
    projectsDelivered: 480
  }
};

export const HISTORICAL_PROJECTS = [
  {
    id: "proj-1",
    title: "Emerald Bay Luxury Residency",
    category: "Apartment",
    location: "East Coast Road (ECR), Chennai",
    year: "2024",
    units: "48 Luxury Flats",
    area: "85,000 sq.ft",
    image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1000&q=80",
    description: "Premium sea-facing residential apartments built with reinforced seismic-resistant structure, imported Italian marble lobbies, and custom client interior packages.",
    tags: ["High-Rise", "Sea View", "Full Finished"]
  },
  {
    id: "proj-2",
    title: "Royal Palm Enclave Villas",
    category: "Villa",
    location: "Race Course Road, Coimbatore",
    year: "2023",
    units: "18 Independent Luxury Villas",
    area: "72,000 sq.ft",
    image: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1000&q=80",
    description: "Contemporary Spanish-revival gated community villas with private plunge pools, solar energy integration, and tailored semi-finished & turnkey handover options.",
    tags: ["Gated Enclave", "Private Pool", "Custom Interiors"]
  },
  {
    id: "proj-3",
    title: "Sunstone Heritage Individual House",
    category: "Individual House",
    location: "KK Nagar, Madurai",
    year: "2024",
    units: "G+2 Custom Bungalow",
    area: "4,600 sq.ft",
    image: "https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=1000&q=80",
    description: "Architectural masterpiece combining traditional Chettinad courtyard aesthetics with cutting-edge smart home automation and bare-bones custom finishing stage delivery.",
    tags: ["Custom Bungalow", "Bare Bones Delivery", "Smart Home"]
  },
  {
    id: "proj-4",
    title: "The Grand Heritage Apartments",
    category: "Apartment",
    location: "Thillai Nagar, Trichy",
    year: "2022",
    units: "32 Units (2 & 3 BHK)",
    area: "54,000 sq.ft",
    image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1000&q=80",
    description: "Multi-storey urban residential complex featuring landscaped terrace gardens, basement automated car stack parking, and customized semi-finished electrical/plaster layouts.",
    tags: ["Urban Living", "Semi-Finished", "Clubhouse"]
  },
  {
    id: "proj-5",
    title: "Lakeview Manor Hillside Villas",
    category: "Villa",
    location: "Fernhill, Ooty",
    year: "2025",
    units: "12 Colonial Hill Villas",
    area: "38,000 sq.ft",
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1000&q=80",
    description: "Eco-sensitive hillside villas constructed with treated stone masonry, thermal-insulated double glazing, and bespoke teakwood finishes overlooking the Ooty valley.",
    tags: ["Hill Station", "Eco-Design", "Luxury Turnkey"]
  },
  {
    id: "proj-6",
    title: "Skyline Towers Premium Suites",
    category: "Apartment",
    location: "Anna Nagar West, Chennai",
    year: "2025",
    units: "64 Smart Apartments",
    area: "110,000 sq.ft",
    image: "https://images.unsplash.com/photo-1574362848149-11496d93a7c7?auto=format&fit=crop&w=1000&q=80",
    description: "Iconic twin 14-storey residential landmark in Chennai's heart. Delivered ahead of schedule with 100% customized client modular electrical and plumbing provisions.",
    tags: ["Landmark", "Central Chennai", "14 Floors"]
  }
];

export const CATEGORIES = [
  {
    id: "individual",
    name: "Individual House",
    tagline: "Your standalone dream sanctuary, custom-engineered on your plot or ours.",
    image: "https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=1000&q=80",
    priceRange: "₹25 Lakhs – ₹1.80 Crores",
    minBudget: 2500000,
    maxBudget: 18000000,
    defaultBudget: 5500000,
    avgSqftRate: 2200,
    bhkOptions: ["2 BHK", "3 BHK", "4 BHK", "5+ BHK Duplex"],
    typicalSqft: "1,200 – 4,500 sq.ft",
    highlights: [
      "100% freehold land and structural autonomy",
      "Choice of Bare Bones (frame only) or Complete Turnkey",
      "Vastu-compliant architectural planning included",
      "Dedicated structural engineer supervision"
    ]
  },
  {
    id: "villa",
    name: "Villas",
    tagline: "Ultra-luxury gated enclave residences offering boundless privacy and elegance.",
    image: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1000&q=80",
    priceRange: "₹80 Lakhs – ₹5.50 Crores",
    minBudget: 8000000,
    maxBudget: 55000000,
    defaultBudget: 16000000,
    avgSqftRate: 2950,
    bhkOptions: ["3 BHK Luxury", "4 BHK Grande", "5 BHK Estate", "6 BHK Mansion"],
    typicalSqft: "2,800 – 8,000 sq.ft",
    highlights: [
      "Private garden, plunge pool & terrace lounge",
      "Gated community security & luxury club amenities",
      "Customizable Italian marble & imported wood packages",
      "Semi-finished stage handover option for interior decorators"
    ]
  },
  {
    id: "apartment",
    name: "Apartments",
    tagline: "Contemporary community living in strategic city hotspots with modern amenities.",
    image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1000&q=80",
    priceRange: "₹18 Lakhs – ₹95 Lakhs",
    minBudget: 1800000,
    maxBudget: 9500000,
    defaultBudget: 4200000,
    avgSqftRate: 2050,
    bhkOptions: ["1 BHK Studio", "2 BHK Smart", "3 BHK Premium", "4 BHK Penthouse"],
    typicalSqft: "650 – 2,200 sq.ft",
    highlights: [
      "Prime metropolitan connectivity and high rental yield",
      "24/7 power backup, high-speed lifts & clubhouse",
      "Custom electrical, lighting & tiling modification options",
      "RERA-approved and clear title documentation"
    ]
  }
];

export const CUSTOMIZATION_TIERS = [
  {
    id: "bare_bones",
    name: "Tier 1: Bare Bones Structure",
    desc: "RCC frame, brick masonry walls, structural plastering & rough plumbing conduits. You handle paint, tiles & interiors.",
    rateMultiplier: 1.0,
    costPerSqft: "₹1,650 / sq.ft"
  },
  {
    id: "semi_finished",
    name: "Tier 2: Semi-Finished",
    desc: "Plastering + electrical concealed wiring + plumbing fittings + base white coat primer. You do custom flooring & woodworks.",
    rateMultiplier: 1.35,
    costPerSqft: "₹2,250 / sq.ft"
  },
  {
    id: "full_finished",
    name: "Tier 3: Luxury Turnkey Finished",
    desc: "Complete move-in ready home: premium vitrified tiles, modular kitchen, branded sanitaryware, emulsion paints & lighting.",
    rateMultiplier: 1.85,
    costPerSqft: "₹3,100 / sq.ft"
  }
];

// Seed sample requests with realistic construction lifecycle stages
export const INITIAL_REQUESTS = [
  {
    id: "REQ-2026-101",
    clientName: "Dr. K. Rajesh",
    clientEmail: "rajesh.cardio@gmail.com",
    clientPhone: "+91 94441 23456",
    category: "Villas",
    bhk: "4 BHK Grande",
    city: "Chennai (ECR)",
    budgetNum: 18500000,
    budgetText: "₹1.85 Crores",
    customizationTier: "full_finished",
    approxSqft: 3400,
    notes: "Requires east-facing pooja room and EV charging port in portico.",
    createdAt: "2026-10-06 10:30 AM",
    status: "Pending", // Pending | Approved | Rejected
    assignedFlat: "",
    constructionStage: "Pending", // Pending | Needs to Start | Processing | Finished | Rejected
    progressPercent: 0,
    progressStageNotes: "Awaiting phone verification call for token advance payment.",
    adminNotes: "Called client. Advance token payment verification pending."
  },
  {
    id: "REQ-2026-094",
    clientName: "Meenakshi Sundaram",
    clientEmail: "meenakshi.s@tcs.com",
    clientPhone: "+91 98840 54321",
    category: "Apartments",
    bhk: "3 BHK Premium",
    city: "Anna Nagar, Chennai",
    budgetNum: 6200000,
    budgetText: "₹62.0 Lakhs",
    customizationTier: "semi_finished",
    approxSqft: 1450,
    notes: "Wants open-concept kitchen layout and wooden flooring in master bedroom.",
    createdAt: "2026-10-04 03:15 PM",
    status: "Approved",
    assignedFlat: "Tower B - Flat 402",
    constructionStage: "Processing",
    progressPercent: 65,
    progressStageNotes: "Brick masonry and concealed conduits completed. Plastering & tile primer in progress.",
    adminNotes: "Advance token verified. Structural modifications approved by chief engineer."
  },
  {
    id: "REQ-2026-088",
    clientName: "Senthil Kumar V",
    clientEmail: "senthil.k@yahoo.in",
    clientPhone: "+91 97908 99881",
    category: "Individual House",
    bhk: "3 BHK",
    city: "Madurai",
    budgetNum: 4800000,
    budgetText: "₹48.0 Lakhs",
    customizationTier: "bare_bones",
    approxSqft: 1850,
    notes: "We have own plot in KK Nagar. Need structure completed within 6 months.",
    createdAt: "2026-10-02 11:00 AM",
    status: "Approved",
    assignedFlat: "Plot #14 - Sunstone Enclave",
    constructionStage: "Needs to Start",
    progressPercent: 12,
    progressStageNotes: "Site clearance completed. Soil testing done. Foundation excavation starts Monday.",
    adminNotes: "Advance token verified. Soil test report submitted to municipal corporation."
  },
  {
    id: "REQ-2026-079",
    clientName: "Aravindh & Priya",
    clientEmail: "aravindh.p@gmail.com",
    clientPhone: "+91 98402 77112",
    category: "Villas",
    bhk: "4 BHK Grande",
    city: "ECR, Chennai",
    budgetNum: 21000000,
    budgetText: "₹2.10 Crores",
    customizationTier: "full_finished",
    approxSqft: 3800,
    notes: "Private plunge pool with landscaped deck and automated irrigation system.",
    createdAt: "2026-09-28 04:45 PM",
    status: "Approved",
    assignedFlat: "Villa Rosa - Plot 08",
    constructionStage: "Finished",
    progressPercent: 100,
    progressStageNotes: "Project 100% completed. Handover certified and keys presented to customer.",
    adminNotes: "Full payment received. Handover inspection sign-off completed."
  },
  {
    id: "REQ-2026-065",
    clientName: "Karthikeyan N",
    clientEmail: "karthik.civil@yahoo.com",
    clientPhone: "+91 97103 44556",
    category: "Apartments",
    bhk: "2 BHK Smart",
    city: "Coimbatore",
    budgetNum: 3500000,
    budgetText: "₹35.0 Lakhs",
    customizationTier: "bare_bones",
    approxSqft: 950,
    notes: "Interested in ground floor with parking.",
    createdAt: "2026-09-25 09:15 AM",
    status: "Rejected",
    assignedFlat: "",
    constructionStage: "Rejected",
    progressPercent: 0,
    progressStageNotes: "Inquiry cancelled upon manual verification.",
    adminNotes: "Customer cancelled inquiry due to relocation outside Tamil Nadu."
  }
];

export function getRequests() {
  try {
    const raw = localStorage.getItem('aari_construction_requests');
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error("Error reading requests from localStorage", e);
  }
  // Store default seed
  localStorage.setItem('aari_construction_requests', JSON.stringify(INITIAL_REQUESTS));
  return INITIAL_REQUESTS;
}

export function saveRequests(list) {
  try {
    localStorage.setItem('aari_construction_requests', JSON.stringify(list));
  } catch (e) {
    console.error("Error saving requests", e);
  }
}
