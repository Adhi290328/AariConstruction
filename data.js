/**
 * AARI CONSTRUCTION — Application Data Store
 * Clean, realistic construction project data for HLD presentation
 */

export const APP_CONFIG = {
  adminCredentials: { username: "admin", password: "aari2026" },
  companyName: "Aari Construction",
  tagline: "Precision-Built. Customer-Defined."
};

export const INITIAL_DATA = {
  projects: [
    {
      id: "proj-1",
      name: "Green Valley Apartments",
      type: "Apartment Complex",
      location: "Sector 48, Riverside Road, Chennai",
      totalUnits: 6,
      image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=600&q=80",
      blocks: [
        {
          name: "Block A",
          units: [
            {
              id: "gv-a-101",
              number: "A-101",
              floor: 1,
              sqft: 1250,
              customer: "Vikram Malhotra",
              email: "vikram@email.com",
              phone: "+91 98201 44102",
              package: "Bare-Bones",
              stages: [
                { name: "Foundation & Substructure", status: "completed", date: "15 Jan 2026" },
                { name: "RCC Frame & Columns", status: "completed", date: "22 Mar 2026" },
                { name: "Brick Masonry & Plastering", status: "completed", date: "14 Oct 2026" }
              ],
              scopeIncluded: ["RCC Structure", "Brickwork & Partition Walls", "Internal & External Plastering"],
              scopeExcluded: ["Electrical & Plumbing", "Painting & Wall Finishes", "Floor Tiles & Cladding", "Interior Woodwork"],
              photos: [
                { id: "ph-101-1", title: "Plastering Complete — Ground Floor", stage: "Plastering", timestamp: "14 Oct 2026, 04:30 PM", url: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=800&q=80", notes: "Internal surfaces smooth-plastered and cured. Ready for customer's contractor." },
                { id: "ph-101-2", title: "Main Door Frame Installed", stage: "Structure", timestamp: "10 Sep 2026, 11:00 AM", url: "https://images.unsplash.com/photo-1541888946425-d0fbb18615f8?auto=format&fit=crop&w=800&q=80", notes: "Lintels aligned per architectural blueprint." }
              ],
              customizations: []
            },
            {
              id: "gv-a-102",
              number: "A-102",
              floor: 1,
              sqft: 1380,
              customer: "Priya Sharma",
              email: "priya@email.com",
              phone: "+91 97112 88301",
              package: "Semi-Finished",
              stages: [
                { name: "Foundation & Substructure", status: "completed", date: "15 Jan 2026" },
                { name: "RCC Frame & Columns", status: "completed", date: "22 Mar 2026" },
                { name: "Brick Masonry & Plastering", status: "completed", date: "10 Jul 2026" },
                { name: "Electrical Conduit & Plumbing", status: "completed", date: "20 Sep 2026" },
                { name: "Wall Painting (Primer + Base)", status: "completed", date: "02 Oct 2026" },
                { name: "Tile Cladding & Fixtures", status: "in-progress", date: "Target: 15 Nov 2026" },
                { name: "Final Inspection & Handover", status: "pending", date: "Target: 15 Dec 2026" }
              ],
              scopeIncluded: ["RCC Structure & Masonry", "Double Plastering", "Concealed Electrical Conduit", "Sanitary Plumbing", "Primer & Base Paint", "Kitchen & Bathroom Cladding"],
              scopeExcluded: ["Modular Kitchen", "Wardrobes & Lighting", "False Ceiling", "Interior Decor"],
              photos: [
                { id: "ph-102-1", title: "Living Room Primer Applied", stage: "Painting", timestamp: "08 Oct 2026, 10:30 AM", url: "https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=800&q=80", notes: "First coat primer completed. Ready for customer color swatch review." },
                { id: "ph-102-2", title: "Electrical Circuit Breaker Panel", stage: "Electrical", timestamp: "04 Oct 2026, 03:15 PM", url: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=800&q=80", notes: "Concealed PVC conduit lines routed per extra socket plan." },
                { id: "ph-102-3", title: "Balcony Waterproofing & Cladding", stage: "Cladding", timestamp: "28 Sep 2026, 09:45 AM", url: "https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?auto=format&fit=crop&w=800&q=80", notes: "Waterproofing cured 72 hrs. Tile laying in progress." }
              ],
              customizations: [
                { id: "CR-1025", category: "Electrical", title: "Extra 16A AC point in study room", description: "Add 16-Amp socket on North wall of study for server setup.", status: "Pending", date: "07 Oct 2026", costImpact: "₹4,500", timeImpact: "No delay" },
                { id: "CR-1018", category: "Cladding", title: "Upgrade bathroom cladding to matte gray", description: "Replace standard ivory tile with matte slate gray in master bathroom.", status: "Approved", date: "25 Sep 2026", costImpact: "₹12,000", timeImpact: "+2 days" }
              ]
            },
            {
              id: "gv-a-103",
              number: "A-103",
              floor: 1,
              sqft: 1180,
              customer: "Sunil Verma",
              email: "sunil@email.com",
              phone: "+91 94112 00192",
              package: "Bare-Bones",
              stages: [
                { name: "Foundation & Substructure", status: "completed", date: "15 Jan 2026" },
                { name: "RCC Frame & Columns", status: "completed", date: "22 Mar 2026" },
                { name: "Brick Masonry & Plastering", status: "in-progress", date: "Target: 25 Oct 2026" }
              ],
              scopeIncluded: ["RCC Structure", "Brickwork", "Plastering"],
              scopeExcluded: ["Electrical", "Plumbing", "Painting", "Interiors"],
              photos: [],
              customizations: []
            },
            {
              id: "gv-a-201",
              number: "A-201",
              floor: 2,
              sqft: 1650,
              customer: "Rajesh Iyer",
              email: "rajesh@email.com",
              phone: "+91 98450 11928",
              package: "Fully Finished",
              stages: [
                { name: "Foundation & Substructure", status: "completed", date: "15 Jan 2026" },
                { name: "RCC Frame & Columns", status: "completed", date: "22 Mar 2026" },
                { name: "Brick Masonry & Plastering", status: "completed", date: "10 Jul 2026" },
                { name: "Electrical & Plumbing", status: "completed", date: "15 Aug 2026" },
                { name: "Premium Flooring & Paint", status: "completed", date: "20 Sep 2026" },
                { name: "Modular Kitchen & Wardrobes", status: "in-progress", date: "Target: 30 Nov 2026" },
                { name: "Smart Home Setup & Handover", status: "pending", date: "Target: 28 Jan 2027" }
              ],
              scopeIncluded: ["Complete Turnkey Construction", "Italian Marble Flooring", "Modular Kitchen", "Smart Home Automation", "Designer False Ceilings", "Hardwood Wardrobes"],
              scopeExcluded: [],
              photos: [
                { id: "ph-201-1", title: "Italian Marble Polishing Done", stage: "Flooring", timestamp: "05 Oct 2026, 05:00 PM", url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80", notes: "Mirror finish Botticino marble laid and diamond polished." }
              ],
              customizations: [
                { id: "CR-1041", category: "Smart Home", title: "Motorized blinds wiring", description: "Add concealed low-voltage supply along 3 master bedroom French doors.", status: "Approved", date: "01 Oct 2026", costImpact: "₹28,000", timeImpact: "+4 days" }
              ]
            },
            {
              id: "gv-a-202",
              number: "A-202",
              floor: 2,
              sqft: 1250,
              customer: "Anita Deshmukh",
              email: "anita@email.com",
              phone: "+91 99304 55198",
              package: "Semi-Finished",
              stages: [
                { name: "Foundation & Substructure", status: "completed", date: "15 Jan 2026" },
                { name: "RCC Frame & Columns", status: "completed", date: "22 Mar 2026" },
                { name: "Brick Masonry & Plastering", status: "completed", date: "18 Aug 2026" },
                { name: "Electrical Conduit & Plumbing", status: "in-progress", date: "Target: 10 Nov 2026" },
                { name: "Wall Painting", status: "pending", date: "Target: 10 Dec 2026" },
                { name: "Cladding & Handover", status: "pending", date: "Target: 18 Jan 2027" }
              ],
              scopeIncluded: ["Structure", "Plastering", "Electrical Conduit", "Base Painting"],
              scopeExcluded: ["Interior Furniture", "Custom Lighting", "Decor"],
              photos: [],
              customizations: []
            },
            {
              id: "gv-a-203",
              number: "A-203",
              floor: 2,
              sqft: 1100,
              customer: "Farhan Qureshi",
              email: "farhan@email.com",
              phone: "+91 91672 88490",
              package: "Bare-Bones",
              stages: [
                { name: "Foundation & Substructure", status: "completed", date: "15 Jan 2026" },
                { name: "RCC Frame & Columns", status: "completed", date: "22 Mar 2026" },
                { name: "Brick Masonry & Plastering", status: "completed", date: "01 Oct 2026" }
              ],
              scopeIncluded: ["Structure", "Brickwork", "Plastering"],
              scopeExcluded: ["All finishes & interiors"],
              photos: [],
              customizations: []
            }
          ]
        }
      ]
    },
    {
      id: "proj-2",
      name: "Palm Residency",
      type: "Gated Community",
      location: "East Boulevard, Phase 2, Coimbatore",
      totalUnits: 4,
      image: "https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=600&q=80",
      blocks: [
        {
          name: "Tower 1",
          units: [
            {
              id: "pr-t1-101",
              number: "T1-101",
              floor: 1,
              sqft: 1320,
              customer: "Kavita Rao",
              email: "kavita@email.com",
              phone: "+91 98800 23412",
              package: "Semi-Finished",
              stages: [
                { name: "Foundation", status: "completed", date: "01 Mar 2026" },
                { name: "Structure", status: "completed", date: "15 Jun 2026" },
                { name: "Plastering", status: "completed", date: "10 Sep 2026" },
                { name: "Electrical & Plumbing", status: "in-progress", date: "Target: 15 Nov 2026" },
                { name: "Painting & Cladding", status: "pending", date: "Target: 20 Jan 2027" }
              ],
              scopeIncluded: ["Structure", "Plaster", "Electrical", "Base Paint"],
              scopeExcluded: ["Interior Design", "Furniture"],
              photos: [],
              customizations: []
            }
          ]
        }
      ]
    },
    {
      id: "proj-3",
      name: "Lake View Villas",
      type: "Independent Villas",
      location: "Emerald Lake Valley, Ooty",
      totalUnits: 2,
      image: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=600&q=80",
      blocks: [
        {
          name: "Villa Row A",
          units: [
            {
              id: "lv-v-01",
              number: "V-01",
              floor: 1,
              sqft: 3200,
              customer: "Deepak Singhal",
              email: "deepak@email.com",
              phone: "+91 97204 33211",
              package: "Fully Finished",
              stages: [
                { name: "Foundation", status: "completed", date: "01 Dec 2025" },
                { name: "Structure", status: "completed", date: "15 Mar 2026" },
                { name: "Plastering & MEP", status: "completed", date: "01 Jul 2026" },
                { name: "Flooring & Paint", status: "completed", date: "15 Sep 2026" },
                { name: "Interiors & Landscaping", status: "completed", date: "01 Oct 2026" },
                { name: "Final Inspection", status: "in-progress", date: "Target: 05 Dec 2026" }
              ],
              scopeIncluded: ["Complete Turnkey Villa", "Landscape & Garden", "Swimming Pool"],
              scopeExcluded: [],
              photos: [],
              customizations: []
            }
          ]
        }
      ]
    }
  ]
};
