/**
 * AARI CONSTRUCTION - Mock Data & Initial State
 * Tailored for HLD Architecture Presentation
 */

export const INITIAL_DATA = {
  projects: [
    {
      id: "proj-1",
      name: "Green Valley Apartments",
      type: "Apartment Complex",
      location: "Sector 48, Riverside Road",
      totalUnits: 48,
      overallProgress: 76,
      expectedDelivery: "20 Dec 2026",
      status: "On Schedule",
      image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=600&q=80",
      description: "Twin-tower premium apartment complex with 48 customizable residential units across 4 blocks.",
      blocks: [
        {
          name: "Block A",
          units: [
            {
              id: "gv-a-101",
              number: "Flat 101",
              floor: 1,
              customer: "Vikram Malhotra",
              phone: "+91 98201 44102",
              package: "Bare-Bones",
              packageBadge: "badge-barebones",
              description: "Structural frame, external & internal brick masonry, and coarse plastering only. Interiors & MEP by customer.",
              stage: "Plastering",
              stageIndex: 2, // 0: Foundation, 1: Structure, 2: Plastering, 3: Electrical/Plumbing, 4: Painting, 5: Cladding, 6: Handover
              progress: 100, // For Bare-Bones, Plastering is 100% of their scope!
              isReadyForHandover: true,
              expectedHandover: "28 Oct 2026",
              handoverStatus: "Ready for Delivery",
              stages: [
                { name: "Foundation", status: "completed", date: "15 Jan 2026", note: "Deep piling & RCC raft completed" },
                { name: "Structure & Columns", status: "completed", date: "22 Mar 2026", note: "Slab casting finished" },
                { name: "Brick Masonry & Plastering", status: "completed", date: "14 Oct 2026", note: "Plastering cured and approved for handover" },
                { name: "MEP Rough-in", status: "excluded", note: "Excluded (Customer Scope)" },
                { name: "Wall Painting & Finishing", status: "excluded", note: "Excluded (Customer Scope)" },
                { name: "Exterior Cladding & Fixtures", status: "excluded", note: "Excluded (Customer Scope)" },
                { name: "Interior Handover", status: "completed", date: "Handover Ready", note: "Early handover certificate issued" }
              ],
              scopeIncluded: ["Foundation & RCC Structure", "Brickwork & Partition Walls", "Internal & External Plastering"],
              scopeExcluded: ["Electrical & Plumbing MEP", "Painting & Wall Finishes", "Floor Tiles & Cladding", "Interior Woodwork"],
              photos: [
                {
                  id: "ph-101-1",
                  title: "Structural Walls & Plastering Complete",
                  stage: "Plastering",
                  timestamp: "Yesterday, 04:30 PM",
                  url: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=800&q=80",
                  notes: "Internal surfaces smooth-plastered and cured. Ready for customer's private contractor."
                },
                {
                  id: "ph-101-2",
                  title: "Flat 101 Main Door Frame & Masonry",
                  stage: "Structure",
                  timestamp: "10 Oct 2026, 11:00 AM",
                  url: "https://images.unsplash.com/photo-1541888946425-d0fbb18615f8?auto=format&fit=crop&w=800&q=80",
                  notes: "Lintels aligned with architectural blueprint."
                }
              ],
              customizations: []
            },
            {
              id: "gv-a-102",
              number: "Flat 102",
              floor: 1,
              customer: "Priya Sharma",
              phone: "+91 97112 88301",
              package: "Semi-Finished",
              packageBadge: "badge-semifinished",
              description: "Bare structure + electrical conduits, plumbing rough-ins, base wall painting, and premium tile cladding. Custom interior decor handled by customer.",
              stage: "Painting & Cladding",
              stageIndex: 5,
              progress: 80,
              isReadyForHandover: false,
              expectedHandover: "15 Dec 2026",
              handoverStatus: "On Track",
              stages: [
                { name: "Foundation", status: "completed", date: "15 Jan 2026", note: "RCC foundation certified" },
                { name: "Structure & Columns", status: "completed", date: "22 Mar 2026", note: "Superstructure complete" },
                { name: "Brick Masonry & Plastering", status: "completed", date: "10 Jul 2026", note: "Both coats done" },
                { name: "Electrical & Plumbing Rough-in", status: "completed", date: "20 Sep 2026", note: "Conduiting & pressure testing passed" },
                { name: "Wall Painting (Primer & Base)", status: "completed", date: "02 Oct 2026", note: "First coat Asian Paints primer applied" },
                { name: "Exterior & Bathroom Cladding", status: "in-progress", date: "Target: 15 Nov 2026", note: "Balcony granite cladding in progress" },
                { name: "Customer Interior Handover", status: "pending", date: "Target: 15 Dec 2026", note: "Final walk-through & key handover" }
              ],
              scopeIncluded: ["RCC Structure & Masonry", "Double Plastering", "Concealed Conduit Electricals", "Sanitary Plumbing", "Base Primer & Two-coat Paint", "Kitchen & Balcony Cladding"],
              scopeExcluded: ["Modular Kitchen Cabinetry", "Custom Wardrobes & Lighting", "Designer False Ceiling"],
              photos: [
                {
                  id: "ph-102-1",
                  title: "Living Room Base Primer Applied",
                  stage: "Painting",
                  timestamp: "Today, 10:30 AM",
                  url: "https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=800&q=80",
                  notes: "First coat primer completed. Ready for customer chosen color swatch review."
                },
                {
                  id: "ph-102-2",
                  title: "Electrical Junction & Circuit Breaker Points",
                  stage: "Electrical",
                  timestamp: "04 Oct 2026, 03:15 PM",
                  url: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=800&q=80",
                  notes: "Concealed PVC conduit lines routed per requested extra socket plan."
                },
                {
                  id: "ph-102-3",
                  title: "Balcony Waterproofing & Granite Cladding",
                  stage: "Cladding",
                  timestamp: "28 Sep 2026, 09:45 AM",
                  url: "https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?auto=format&fit=crop&w=800&q=80",
                  notes: "Waterproofing cured 72 hours; wall cladding tile laying ongoing."
                }
              ],
              customizations: [
                {
                  id: "CR-1025",
                  category: "Electrical & Lighting",
                  title: "Additional 16A AC Point in Study Room",
                  description: "Requesting an extra 16-Amp power socket on the North wall of the study room for server setup before final paint.",
                  status: "Pending",
                  date: "07 Oct 2026",
                  costImpact: "+ ₹4,500",
                  timeImpact: "0 days (Concurrent)"
                },
                {
                  id: "CR-1018",
                  category: "Cladding / Tiles",
                  title: "Matte Gray Porcelano Bathroom Cladding",
                  description: "Upgrade master bathroom vertical tile cladding from standard ivory to matte slate gray tiles.",
                  status: "Approved",
                  date: "25 Sep 2026",
                  costImpact: "+ ₹12,000",
                  timeImpact: "+ 2 days"
                }
              ]
            },
            {
              id: "gv-a-103",
              number: "Flat 103",
              floor: 1,
              customer: "Sunil Verma",
              phone: "+91 94112 00192",
              package: "Bare-Bones",
              packageBadge: "badge-barebones",
              description: "Structure and outer walls only.",
              stage: "Structure",
              stageIndex: 1,
              progress: 62,
              isReadyForHandover: false,
              expectedHandover: "10 Nov 2026",
              handoverStatus: "In Progress",
              stages: [
                { name: "Foundation", status: "completed", date: "15 Jan 2026" },
                { name: "Structure & Columns", status: "completed", date: "22 Mar 2026" },
                { name: "Brick Masonry & Plastering", status: "in-progress", date: "Target: 25 Oct 2026" }
              ],
              scopeIncluded: ["Structure", "Brickwork", "Plastering"],
              scopeExcluded: ["Finishes", "MEP", "Interiors"],
              photos: [],
              customizations: []
            },
            {
              id: "gv-a-104",
              number: "Flat 104",
              floor: 2,
              customer: "Rajesh Iyer",
              phone: "+91 98450 11928",
              package: "Fully Finished + Custom",
              packageBadge: "badge-fullyfinished",
              description: "Turnkey luxury package including Italian marble flooring, sound-insulated acoustic ceilings, smart home automation, and Italian kitchen.",
              stage: "Interior Customization",
              stageIndex: 6,
              progress: 92,
              isReadyForHandover: false,
              expectedHandover: "28 Jan 2027",
              handoverStatus: "Custom Work Ongoing",
              stages: [
                { name: "Foundation", status: "completed" },
                { name: "Structure", status: "completed" },
                { name: "Plastering", status: "completed" },
                { name: "Electrical & Automation", status: "completed" },
                { name: "Luxury Marble & Painting", status: "completed" },
                { name: "Bespoke Italian Kitchen", status: "in-progress", note: "Imported cabinetry being assembled" },
                { name: "Smart Home Handover", status: "pending" }
              ],
              scopeIncluded: ["End-to-End Turnkey House", "Smart Home Automation", "Italian Modular Kitchen", "Designer False Ceilings", "Hardwood Wardrobes"],
              scopeExcluded: [],
              photos: [
                {
                  id: "ph-104-1",
                  title: "Italian Marble Polishing Completed",
                  stage: "Interiors",
                  timestamp: "05 Oct 2026, 05:00 PM",
                  url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80",
                  notes: "Mirror finish Italian Botticino marble laid and diamond polished."
                }
              ],
              customizations: [
                {
                  id: "CR-1041",
                  category: "Smart Home",
                  title: "Automated Motorized Blinds Wiring",
                  description: "Add concealed low-voltage power supply lines along the 3 master bedroom terrace French doors.",
                  status: "Approved",
                  date: "01 Oct 2026",
                  costImpact: "+ ₹28,000",
                  timeImpact: "+ 4 days"
                }
              ]
            },
            {
              id: "gv-a-105",
              number: "Flat 105",
              floor: 2,
              customer: "Anita Deshmukh",
              phone: "+91 99304 55198",
              package: "Semi-Finished",
              packageBadge: "badge-semifinished",
              description: "Structure, plumbing, electrical and white-wash primer.",
              stage: "Structure & MEP",
              stageIndex: 3,
              progress: 45,
              isReadyForHandover: false,
              expectedHandover: "18 Jan 2027",
              handoverStatus: "In Progress",
              stages: [],
              scopeIncluded: ["Structure", "Rough Plaster", "Electrical"],
              scopeExcluded: ["Interiors"],
              photos: [],
              customizations: []
            },
            {
              id: "gv-a-106",
              number: "Flat 106",
              floor: 2,
              customer: "Farhan Qureshi",
              phone: "+91 91672 88490",
              package: "Bare-Bones",
              packageBadge: "badge-barebones",
              description: "Core structural framework only.",
              stage: "Plastering",
              stageIndex: 2,
              progress: 88,
              isReadyForHandover: false,
              expectedHandover: "05 Nov 2026",
              handoverStatus: "Near Completion",
              stages: [],
              scopeIncluded: ["Structure", "Brickwork"],
              scopeExcluded: ["All finishes"],
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
      location: "East Boulevard Road, Phase 2",
      totalUnits: 60,
      overallProgress: 55,
      expectedDelivery: "15 Jan 2027",
      status: "In Progress",
      image: "https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=600&q=80",
      description: "60 High-rise residential apartments with customized tier completion options.",
      blocks: [
        {
          name: "Tower 1",
          units: [
            {
              id: "pr-t1-201",
              number: "Unit 201",
              floor: 2,
              customer: "Kavita Rao",
              phone: "+91 98800 23412",
              package: "Semi-Finished",
              packageBadge: "badge-semifinished",
              description: "Wall painting & tile cladding package.",
              stage: "Electrical",
              stageIndex: 3,
              progress: 58,
              isReadyForHandover: false,
              expectedHandover: "20 Jan 2027",
              handoverStatus: "In Progress",
              stages: [],
              scopeIncluded: ["Structure", "Plaster", "Electrical", "Base Paint"],
              scopeExcluded: ["Interiors"],
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
      type: "Luxury Independent Villas",
      location: "Emerald Lake Valley",
      totalUnits: 10,
      overallProgress: 84,
      expectedDelivery: "10 Dec 2026",
      status: "Final Stages",
      image: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=600&q=80",
      description: "Exclusive 10 bespoke luxury villas with private gardens and customizable pools.",
      blocks: [
        {
          name: "Villa Row A",
          units: [
            {
              id: "lv-v-01",
              number: "Villa 01",
              floor: 1,
              customer: "Deepak Singhal",
              phone: "+91 97204 33211",
              package: "Fully Finished + Custom",
              packageBadge: "badge-fullyfinished",
              description: "Complete luxury turn-key villa with bespoke landscape.",
              stage: "Handover Inspection",
              stageIndex: 6,
              progress: 96,
              isReadyForHandover: true,
              expectedHandover: "05 Dec 2026",
              handoverStatus: "Ready for Delivery",
              stages: [],
              scopeIncluded: ["Complete Construction & Bespoke Interiors"],
              scopeExcluded: [],
              photos: [],
              customizations: []
            }
          ]
        }
      ]
    }
  ],

  // System Stats for Dashboard
  metrics: {
    totalProjects: 12,
    totalUnits: 148,
    activeConstruction: 42,
    readyForHandover: 36,
    pendingCustomizations: 5,
    customerSatisfaction: "98.4%"
  },

  // Presentation Team Breakdown (6 Members for the Team's Activity)
  teamBreakdown: [
    {
      member: "Member 1",
      role: "System Architecture & Navigation Lead",
      focus: "Role-based switching (Consultant vs Customer), shell navigation, and High-Level Design core framework."
    },
    {
      member: "Member 2",
      role: "Project & Portfolio Lead",
      focus: "Consultant executive dashboard, multi-project metrics, and overall construction stage summaries."
    },
    {
      member: "Member 3",
      role: "Unit Matrix & Package Segregation Lead",
      focus: "Apartment/unit matrix showing how Bare-Bones, Semi-Finished, and Full Finish coexist without delays."
    },
    {
      member: "Member 4",
      role: "Progress & Dynamic ETA Lead",
      focus: "Construction milestone tracking (Foundation to Interior), dynamic ETA calculator per tier."
    },
    {
      member: "Member 5",
      role: "Site Verification & Media Lead",
      focus: "Floor worker real-time photo uploads, visual evidence logs, and timeline verification."
    },
    {
      member: "Member 6",
      role: "Customer Portal & Customization Lead",
      focus: "Customer transparency dashboard, change requests approval cycle, and non-blocking delivery guarantees."
    }
  ]
};
