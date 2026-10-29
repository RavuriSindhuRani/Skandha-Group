/**
 * Master Plan Digitized GIS Dataset — Skandha Group, Kadthal
 * DTCP Approved Layout: TLP NO. 87/2024/H | TS RERA: PO2400009081
 * Reference: Authoritative Brochure Page 2 (96 Plots, Ac. 0.758 Park, Srisailam Highway NH-765)
 *
 * Local Coordinate System:
 * - Origin (0, 0): Center of layout
 * - X: West (-) to East (+) towards Srisailam Highway
 * - Z: North (-) to South (+) towards Phase 4
 * - Y: Height (elevation)
 * Units: meters (1 meter ~ 3.28 feet)
 */

export const LAYOUT_BOUNDS = {
  minX: -88,
  maxX: 70,
  minZ: -52,
  maxZ: 64,
  centerX: -9,
  centerZ: 6,
  width: 158,
  depth: 116
};

/**
 * Real-World Geographic Alignment at Kadthal, Srisailam Highway (NH-765)
 * Location: Chellampalle, Maisigandi Temple Road, Kadthal, Ranga Reddy Dist, Telangana
 * Exact Google Maps Coordinates: 16°57'11.1"N 78°29'30.6"E (16.9530655, 78.4918533)
 * DTCP Approval: TLP NO. 87/2024/H | TS RERA: PO2400009081
 */
export const SITE_GEO = {
  center: [16.9530689, 78.4918425], // [lat, lng] Exact Google Maps pin requested by user (16.9530689, 78.4918425)
  pin: [16.9530689, 78.4918425],
  zoom: 18.2, // Optimal scale framing Kadthal venture boundary, roads, and all 96 plot numbers
  minZoom: 12.0, // Smooth manual zoom out allows viewing regional map where layout is a small particle
  maxZoom: 20.5, // Prevents over-extending too large on zoom in
  locality: "Chellampalle, Kadthal, Srisailam Highway, Hyderabad",
  pinCode: "509358",
  state: "Telangana",
  mapsUrl: "https://www.google.com/maps?q=16.9530689,78.4918425&z=17&hl=en"
};

// Coordinate projection from local (x, z) meters to [lat, lng]
export function localToLatLng(x, z) {
  const LAT_METERS_PER_DEG = 110649;
  const LNG_METERS_PER_DEG = 106399;
  const lat = SITE_GEO.center[0] - (z / LAT_METERS_PER_DEG);
  const lng = SITE_GEO.center[1] + (x / LNG_METERS_PER_DEG);
  return [lat, lng];
}

/**
 * Exact Digitized Sanctioned Boundary Polygon from Authoritative Brochure Map
 * Traces exact cuts, the diagonal taper under Plot 36 (42'-9" down to 19'-9"),
 * the stepped southern blocks, vertical road stubs opening to 4th Phase,
 * East 33' road boundary, and Central Park (Ac. 0.758 cents).
 */
export const SITE_BOUNDARY_LOCAL = [
  // 1. Top-Left: North-West corner at 60'-0" road frontage
  [-88, -52],
  // 2. Top-Right: North-East corner at 60' road & East 33' road junction
  [77, -52],
  // 3. East: Along East 33' road to Southeast corner of layout
  [77, 67.5],
  // 4. Block K bottom: Slanted cut under Plot 96 and Plot 83
  [70, 67.5],
  [63.5, 65.5],
  [57, 63.5],
  // 5-6. Road V4 opening to 4th Phase
  [57, 67.5],
  [50, 67.5],
  // 7-8. Block J bottom: Slanted cut under Plot 82 and Plot 71
  [50, 65.7],
  [39.5, 63.7],
  [29, 61.8],
  // 9-10. Road V3 opening to 4th Phase
  [29, 64],
  [22, 64],
  // 11-12. Block I bottom: Flat cut under Plot 70 and Plot 59
  [22, 61.9],
  [0, 61.8],
  // 13-14. Road V2 opening to 4th Phase
  [0, 64],
  [-7, 64],
  // 15-16. Block H bottom: Flat cut under Plot 58 and chamfer cut under Plot 47
  [-7, 61.9],
  [-18, 62],
  [-25, 62],
  [-29, 60],
  // 17-18. Road V1 opening to 4th Phase
  [-29, 64],
  [-36, 64],
  // 19-20. Block G bottom: Slanted cut under Plot 46 and Plot 37
  [-36, 61.5],
  [-47, 55.5],
  [-58, 50],
  // 21-22. Road V0 opening to 4th Phase
  [-58, 52],
  [-65, 52],
  // 23-24. Block F bottom: Slanted taper cut under Plot 36 (60'-9" x 99'-6")
  [-65, 50],
  [-88, 43],
  // 25. Clean, straight West boundary along Block F (Plots 36, 35, 34, 33), 33' Road, and Park
  [-88, 4],
  [-88, -3],
  [-88, -42]
];

export const statusColors = {
  available: {
    bg: '#9BD89E',         // Soft Map Green
    border: '#6BBF6F',
    text: '#064E3B',
    badge: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    threeColor: '#9BD89E',
    label: 'Available'
  },
  booked: {
    bg: '#FBE38E',         // Warm Sunny Yellow / Amber
    border: '#EAB308',
    text: '#78350F',
    badge: 'bg-amber-100 text-amber-800 border-amber-300',
    threeColor: '#FBE38E',
    label: 'Booked'
  },
  sold: {
    bg: '#F89898',         // Soft Coral Red
    border: '#EF4444',
    text: '#7F1D1D',
    badge: 'bg-rose-100 text-rose-800 border-rose-300',
    threeColor: '#F89898',
    label: 'Sold Out'
  }
};

// Aliases for backward safety
statusColors.reserved = statusColors.booked;
statusColors.blocked = statusColors.available;

export const parkData = {
  id: 'PARK-01',
  name: 'Site Reserved for Open Space (Park)',
  areaCents: 'Ac. 0.758 cents',
  dimensions: "209'-9\" x 169'-3\" x 201'-6\"",
  polygon: [
    [-88, -42],
    [-36, -42],
    [-36, -3],
    [-88, -3]
  ],
  center: [-62, -22.5],
  width: 52,
  depth: 39,
  features: ['Landscaped Gardens', 'Jogging Track', 'Children Play Area', 'Lush Avenue Palm Trees']
};

export const layoutRoads = [
  {
    id: 'ROAD-60-TOP',
    name: "Proposed 60'-0\" Wide Road",
    shortName: "PROP. 60'-0\" WIDE ROAD",
    width: '60ft',
    type: 'arterial',
    polygon: [
      [-88, -52],
      [77, -52],
      [77, -42],
      [-88, -42]
    ],
    center: [-5.5, -47],
    widthMeters: 10,
    hasDivider: true
  },
  {
    id: 'ROAD-33-EAST',
    name: "Proposed 33'-0\" Wide Road",
    shortName: "PROP. 33'-0\" WIDE ROAD",
    width: '33ft',
    type: 'arterial',
    polygon: [
      [70, -52],
      [77, -52],
      [77, 67.5],
      [70, 67.5]
    ],
    center: [73.5, 7.75],
    widthMeters: 7
  },
  {
    id: 'ROAD-33-MID',
    name: "Proposed 33'-0\" Wide Road",
    shortName: "PROP. 33'-0\" WIDE ROAD",
    width: '33ft',
    type: 'internal',
    polygon: [
      [-88, -3],
      [70, -3],
      [70, 4],
      [-88, 4]
    ],
    center: [-9, 0.5],
    widthMeters: 7
  },
  {
    id: 'ROAD-33-V0',
    name: "Proposed 33'-0\" Wide Road (to 4th Phase)",
    shortName: "PROP. 33'-0\" WIDE ROAD",
    width: '33ft',
    type: 'internal',
    polygon: [
      [-65, 4],
      [-58, 4],
      [-58, 52],
      [-65, 52]
    ],
    center: [-61.5, 28],
    widthMeters: 7
  },
  {
    id: 'ROAD-33-V1',
    name: "Proposed 33'-0\" Wide Road (Between Park & Plots)",
    shortName: "PROP. 33'-0\" WIDE ROAD",
    width: '33ft',
    type: 'internal',
    polygon: [
      [-36, -42],
      [-29, -42],
      [-29, 64],
      [-36, 64]
    ],
    center: [-32.5, 11],
    widthMeters: 7
  },
  {
    id: 'ROAD-33-V2',
    name: "Proposed 33'-0\" Wide Road (to 4th Phase)",
    shortName: "PROP. 33'-0\" WIDE ROAD",
    width: '33ft',
    type: 'internal',
    polygon: [
      [-7, -42],
      [0, -42],
      [0, 64],
      [-7, 64]
    ],
    center: [-3.5, 11],
    widthMeters: 7
  },
  {
    id: 'ROAD-33-V3',
    name: "Proposed 33'-0\" Wide Road (to 4th Phase)",
    shortName: "PROP. 33'-0\" WIDE ROAD",
    width: '33ft',
    type: 'internal',
    polygon: [
      [22, -42],
      [29, -42],
      [29, 64],
      [22, 64]
    ],
    center: [25.5, 11],
    widthMeters: 7
  },
  {
    id: 'ROAD-33-V4',
    name: "Proposed 33'-0\" Wide Road (to 4th Phase)",
    shortName: "PROP. 33'-0\" WIDE ROAD",
    width: '33ft',
    type: 'internal',
    polygon: [
      [50, -42],
      [57, -42],
      [57, 67.5],
      [50, 67.5]
    ],
    center: [53.5, 12.75],
    widthMeters: 7
  }
];

// Helper to create rectangular polygon quad
function createQuad(x0, x1, z0, z1) {
  return [
    [x0, z0],
    [x1, z0],
    [x1, z1],
    [x0, z1]
  ];
}

// Master Plot Specifications digitized from Authoritative Brochure Page 2 (Exact 96 Plots)
export const masterPlotsData = [
  // ==========================================
  // TOP SECTION: NORTH BLOCKS (Z: -42 to -3)
  // Continuous blocks matching brochure: Park -> Road V1 -> Block A -> Road V2 -> Block B -> Road V3 -> Block D -> Road V4 -> Block E -> East Road
  // ==========================================

  // BLOCK E-TOP (Plots 1 to 8) - Directly above Block K (Plots 83 to 96)
  // Between Road V4 (X: 57) and East 33' Road (X: 70). Center X: 63.5.
  // East Row (facing East 33' Road): Plots 1 to 4 (North to South)
  { plotNumber: 1, block: 'Block E', areaSqYds: 247, dimensions: "58'-3\" x 37'-3\"", facing: 'North-East', isCorner: true, roadWidth: '60ft', status: 'booked', customerName: 'P. Venkat Reddy', customerPhone: '+91 98480 23145', customerEmail: 'venkat.reddy@gmail.com', bookingDate: '2024-10-12', bookingAmount: 250000, paymentStatus: 'token_paid', notes: 'East-facing corner plot near entrance boulevard.', quad: [63.5, 70, -42, -31.5] },
  { plotNumber: 2, block: 'Block E', areaSqYds: 217, dimensions: "59'-3\" x 33'", facing: 'East', isCorner: false, roadWidth: '33ft', status: 'available', quad: [63.5, 70, -31.5, -22.5] },
  { plotNumber: 3, block: 'Block E', areaSqYds: 221, dimensions: "60'-3\" x 33'", facing: 'East', isCorner: false, roadWidth: '33ft', status: 'available', quad: [63.5, 70, -22.5, -13.5] },
  { plotNumber: 4, block: 'Block E', areaSqYds: 380, dimensions: "61'-3\" x 55' (63')", facing: 'South-East', isCorner: true, roadWidth: '33ft', status: 'available', quad: [63.5, 70, -13.5, -3] },
  // West Row (facing Road V4): Plots 5 to 8 (South to North)
  { plotNumber: 5, block: 'Block E', areaSqYds: 336, dimensions: "55' x 55'", facing: 'South-West', isCorner: true, roadWidth: '33ft', status: 'sold', customerName: 'Dr. K. Srinivas Rao', customerPhone: '+91 99890 56781', customerEmail: 'dr.srinivas@apollo.org', bookingDate: '2024-09-18', bookingAmount: 4200000, paymentStatus: 'fully_paid', notes: 'Full registration completed. Title deed registered.', quad: [57, 63.5, -13.5, -3] },
  { plotNumber: 6, block: 'Block E', areaSqYds: 202, dimensions: "55' x 33'", facing: 'West', isCorner: false, roadWidth: '33ft', status: 'available', quad: [57, 63.5, -22.5, -13.5] },
  { plotNumber: 7, block: 'Block E', areaSqYds: 202, dimensions: "55' x 33'", facing: 'West', isCorner: false, roadWidth: '33ft', status: 'available', quad: [57, 63.5, -31.5, -22.5] },
  { plotNumber: 8, block: 'Block E', areaSqYds: 241, dimensions: "55'-1\" x 39'-3\"", facing: 'North-West', isCorner: true, roadWidth: '60ft', status: 'available', quad: [57, 63.5, -42, -31.5] },

  // BLOCK D-TOP (Plots 9 to 16) - Directly above Block J (Plots 71 to 82)
  // Between Road V3 (X: 29) and Road V4 (X: 50). Center X: 39.5.
  // East Row (facing Road V4): Plots 9 to 12 (North to South)
  { plotNumber: 9,  block: 'Block D', areaSqYds: 243, dimensions: "55'-1\" x 39'-9\"", facing: 'North-East', isCorner: true, roadWidth: '60ft', status: 'available', quad: [39.5, 50, -42, -31.5] },
  { plotNumber: 10, block: 'Block D', areaSqYds: 202, dimensions: "55' x 33'", facing: 'East', isCorner: false, roadWidth: '33ft', status: 'available', quad: [39.5, 50, -31.5, -22.5] },
  { plotNumber: 11, block: 'Block D', areaSqYds: 202, dimensions: "55' x 33'", facing: 'East', isCorner: false, roadWidth: '33ft', status: 'available', quad: [39.5, 50, -22.5, -13.5] },
  { plotNumber: 12, block: 'Block D', areaSqYds: 336, dimensions: "55' x 55'", facing: 'South-East', isCorner: true, roadWidth: '33ft', status: 'booked', customerName: 'Smt. Anitha Sharma', customerPhone: '+91 94401 87654', customerEmail: 'anitha.sharma@yahoo.com', bookingDate: '2024-10-05', bookingAmount: 300000, paymentStatus: 'token_paid', notes: 'Vasthu consultation approved.', quad: [39.5, 50, -13.5, -3] },
  // West Row (facing Road V3): Plots 13 to 16 (South to North)
  { plotNumber: 13, block: 'Block D', areaSqYds: 336, dimensions: "55' x 55'", facing: 'South-West', isCorner: true, roadWidth: '33ft', status: 'available', quad: [29, 39.5, -13.5, -3] },
  { plotNumber: 14, block: 'Block D', areaSqYds: 202, dimensions: "55' x 33'", facing: 'West', isCorner: false, roadWidth: '33ft', status: 'available', quad: [29, 39.5, -22.5, -13.5] },
  { plotNumber: 15, block: 'Block D', areaSqYds: 202, dimensions: "55' x 33'", facing: 'West', isCorner: false, roadWidth: '33ft', status: 'available', quad: [29, 39.5, -31.5, -22.5] },
  { plotNumber: 16, block: 'Block D', areaSqYds: 260, dimensions: "55'-1\" x 42'-6\"", facing: 'North-West', isCorner: true, roadWidth: '60ft', status: 'available', quad: [29, 39.5, -42, -31.5] },

  // BLOCK B-TOP (Plots 17 to 24) - Directly above Block I (Plots 59 to 70)
  // Between Road V2 (X: 0) and Road V3 (X: 22). Center X: 11.
  // East Row (facing Road V3): Plots 17 to 20 (North to South)
  { plotNumber: 17, block: 'Block B', areaSqYds: 242, dimensions: "50'-1\" x 43'-3\"", facing: 'North-East', isCorner: true, roadWidth: '60ft', status: 'available', quad: [11, 22, -42, -31.5] },
  { plotNumber: 18, block: 'Block B', areaSqYds: 183, dimensions: "50' x 33'", facing: 'East', isCorner: false, roadWidth: '33ft', status: 'available', quad: [11, 22, -31.5, -22.5] },
  { plotNumber: 19, block: 'Block B', areaSqYds: 183, dimensions: "50' x 33'", facing: 'East', isCorner: false, roadWidth: '33ft', status: 'available', quad: [11, 22, -22.5, -13.5] },
  { plotNumber: 20, block: 'Block B', areaSqYds: 306, dimensions: "50' x 55'", facing: 'South-East', isCorner: true, roadWidth: '33ft', status: 'available', quad: [11, 22, -13.5, -3] },
  // West Row (facing Road V2): Plots 21 to 24 (South to North)
  { plotNumber: 21, block: 'Block B', areaSqYds: 306, dimensions: "50' x 55'", facing: 'South-West', isCorner: true, roadWidth: '33ft', status: 'available', quad: [0, 11, -13.5, -3] },
  { plotNumber: 22, block: 'Block B', areaSqYds: 183, dimensions: "50' x 33'", facing: 'West', isCorner: false, roadWidth: '33ft', status: 'available', quad: [0, 11, -22.5, -13.5] },
  { plotNumber: 23, block: 'Block B', areaSqYds: 183, dimensions: "50' x 33'", facing: 'West', isCorner: false, roadWidth: '33ft', status: 'available', quad: [0, 11, -31.5, -22.5] },
  { plotNumber: 24, block: 'Block B', areaSqYds: 249, dimensions: "50'-1\" x 45'-3\"", facing: 'North-West', isCorner: true, roadWidth: '60ft', status: 'sold', customerName: 'G. Mahender Reddy', customerPhone: '+91 91000 45678', customerEmail: 'mahender.g@gmail.com', bookingDate: '2024-08-22', bookingAmount: 3112500, paymentStatus: 'fully_paid', notes: 'Immediate spot registration done.', quad: [0, 11, -42, -31.5] },

  // BLOCK A-TOP (Plots 25 to 32) - Directly above Block H (Plots 47 to 58)
  // Between Road V1 (X: -36) and Road V2 (X: -7). Center X: -18.
  // East Row (facing Road V2): Plots 25 to 28 (North to South)
  { plotNumber: 25, block: 'Block A', areaSqYds: 259, dimensions: "50'-1\" x 46'-3\"", facing: 'North-East', isCorner: true, roadWidth: '60ft', status: 'available', quad: [-18, -7, -42, -31.5] },
  { plotNumber: 26, block: 'Block A', areaSqYds: 183, dimensions: "50' x 33'", facing: 'East', isCorner: false, roadWidth: '33ft', status: 'available', quad: [-18, -7, -31.5, -22.5] },
  { plotNumber: 27, block: 'Block A', areaSqYds: 183, dimensions: "50' x 33'", facing: 'East', isCorner: false, roadWidth: '33ft', status: 'available', quad: [-18, -7, -22.5, -13.5] },
  { plotNumber: 28, block: 'Block A', areaSqYds: 306, dimensions: "50' x 55'", facing: 'South-East', isCorner: true, roadWidth: '33ft', status: 'available', quad: [-18, -7, -13.5, -3] },
  // West Row (facing Road V1 & Park): Plots 29 to 32 (South to North)
  { plotNumber: 29, block: 'Block A', areaSqYds: 264, dimensions: "50'-1\" x 48' (47')", facing: 'North-West', isCorner: true, roadWidth: '60ft', status: 'available', quad: [-29, -18, -42, -31.5] },
  { plotNumber: 30, block: 'Block A', areaSqYds: 183, dimensions: "50' x 33'", facing: 'West', isCorner: false, roadWidth: '33ft', status: 'booked', customerName: 'K. Ramesh Babu', customerPhone: '+91 97012 34567', customerEmail: 'ramesh.babu@tcs.com', bookingDate: '2024-10-19', bookingAmount: 200000, paymentStatus: 'token_paid', notes: 'Token advance received via NEFT.', quad: [-29, -18, -31.5, -22.5] },
  { plotNumber: 31, block: 'Block A', areaSqYds: 183, dimensions: "50' x 33'", facing: 'West', isCorner: false, roadWidth: '33ft', status: 'sold', customerName: 'V. Lakshmi Narayana', customerPhone: '+91 98665 12349', customerEmail: 'v.narayana@outlook.com', bookingDate: '2024-09-02', bookingAmount: 2287500, paymentStatus: 'fully_paid', notes: 'SBI Home Loan disbursed.', quad: [-29, -18, -22.5, -13.5] },
  { plotNumber: 32, block: 'Block A', areaSqYds: 306, dimensions: "50' x 55'", facing: 'South-West', isCorner: true, roadWidth: '33ft', status: 'available', quad: [-29, -18, -13.5, -3] },

  // ==========================================
  // BOTTOM SECTION: SOUTH BLOCKS (Z: 4 to bottom cuts)
  // Boustrophedon sequence: 33-36 down | 37-41 up & 42-46 down | 47-52 up & 53-58 down | 59-64 up & 65-70 down | 71-76 up & 77-82 down | 83-89 up & 90-96 down
  // ==========================================

  // BLOCK F-WEST (Plots 33 to 36)
  // Between West Boundary (X: -88) and Road V0 (X: -65). Single column facing Road V0.
  { plotNumber: 33, block: 'Block F', areaSqYds: 362, dimensions: "58'-9\" x 55'", facing: 'North-East', isCorner: true, roadWidth: '33ft', status: 'available', quad: [-88, -65, 4, 14.5] },
  { plotNumber: 34, block: 'Block F', areaSqYds: 220, dimensions: "59'-9\" x 33'", facing: 'East', isCorner: false, roadWidth: '33ft', status: 'available', quad: [-88, -65, 14.5, 25.0] },
  { plotNumber: 35, block: 'Block F', areaSqYds: 222, dimensions: "60'-3\" x 33'", facing: 'East', isCorner: false, roadWidth: '33ft', status: 'available', quad: [-88, -65, 25.0, 35.5] },
  {
    plotNumber: 36,
    block: 'Block F',
    areaSqYds: 393,
    dimensions: "60'-9\" x 99'-6\"",
    facing: 'South-East',
    isCorner: true,
    roadWidth: '33ft',
    status: 'available',
    quad: [-88, -65, 35.5, 50.0],
    polygon: [
      [-88, 35.5],
      [-65, 35.5],
      [-65, 50.0],
      [-88, 43.0]
    ]
  },

  // BLOCK G-MID (Plots 37 to 46)
  // Between Road V0 (X: -58) and Road V1 (X: -36). Center X: -47.
  // Z range: 4 to 61.5
  // West Row (facing Road V0): Plots 41, 40, 39, 38, 37
  { plotNumber: 41, block: 'Block G', areaSqYds: 336, dimensions: "55' x 55'", facing: 'North-West', isCorner: true, roadWidth: '33ft', status: 'available', quad: [-58, -47, 4, 14] },
  { plotNumber: 40, block: 'Block G', areaSqYds: 202, dimensions: "55' x 33'", facing: 'West', isCorner: false, roadWidth: '33ft', status: 'available', quad: [-58, -47, 14, 24] },
  { plotNumber: 39, block: 'Block G', areaSqYds: 202, dimensions: "55' x 33'", facing: 'West', isCorner: false, roadWidth: '33ft', status: 'available', quad: [-58, -47, 24, 34] },
  { plotNumber: 38, block: 'Block G', areaSqYds: 202, dimensions: "55' x 33'", facing: 'West', isCorner: false, roadWidth: '33ft', status: 'available', quad: [-58, -47, 34, 44] },
  {
    plotNumber: 37,
    block: 'Block G',
    areaSqYds: 309,
    dimensions: "42'-9\" x 58'-3\"",
    facing: 'South-West',
    isCorner: true,
    roadWidth: '33ft',
    status: 'available',
    quad: [-58, -47, 44, 55.5],
    polygon: [
      [-58, 44],
      [-47, 44],
      [-47, 55.5],
      [-58, 50]
    ]
  },
  // East Row (facing Road V1): Plots 42, 43, 44, 45, 46
  { plotNumber: 42, block: 'Block G', areaSqYds: 336, dimensions: "55' x 55'", facing: 'North-East', isCorner: true, roadWidth: '33ft', status: 'booked', customerName: 'Ch. Madhusudhan Rao', customerPhone: '+91 94901 23450', customerEmail: 'madhu.ch@gmail.com', bookingDate: '2024-10-21', bookingAmount: 350000, paymentStatus: 'partially_paid', notes: 'Avenue corner plot facing Maisigandi corridor.', quad: [-47, -36, 4, 14] },
  { plotNumber: 43, block: 'Block G', areaSqYds: 202, dimensions: "55' x 33'", facing: 'East', isCorner: false, roadWidth: '33ft', status: 'available', quad: [-47, -36, 14, 24] },
  { plotNumber: 44, block: 'Block G', areaSqYds: 202, dimensions: "55' x 33'", facing: 'East', isCorner: false, roadWidth: '33ft', status: 'available', quad: [-47, -36, 24, 34] },
  { plotNumber: 45, block: 'Block G', areaSqYds: 202, dimensions: "55' x 33'", facing: 'East', isCorner: false, roadWidth: '33ft', status: 'available', quad: [-47, -36, 34, 44] },
  {
    plotNumber: 46,
    block: 'Block G',
    areaSqYds: 403,
    dimensions: "58'-3\" x 73'-9\"",
    facing: 'South-East',
    isCorner: true,
    roadWidth: '33ft',
    status: 'sold',
    customerName: 'B. Suresh Kumar',
    customerPhone: '+91 99499 87654',
    customerEmail: 'suresh.kumar@wipro.com',
    bookingDate: '2024-08-30',
    bookingAmount: 5037500,
    paymentStatus: 'fully_paid',
    notes: 'ICICI loan sanctioned and registered.',
    quad: [-47, -36, 44, 61.5],
    polygon: [
      [-47, 44],
      [-36, 44],
      [-36, 61.5],
      [-47, 55.5]
    ]
  },

  // BLOCK H-MID (Plots 47 to 58)
  // Between Road V1 (X: -29) and Road V2 (X: -7). Center X: -18.
  // Z range: 4 to 62
  // West Row (facing Road V1): Plots 52, 51, 50, 49, 48, 47
  { plotNumber: 52, block: 'Block H', areaSqYds: 306, dimensions: "50' x 55'", facing: 'West', isCorner: true, roadWidth: '33ft', status: 'available', quad: [-29, -18, 4, 13.6] },
  { plotNumber: 51, block: 'Block H', areaSqYds: 183, dimensions: "50' x 33'", facing: 'West', isCorner: false, roadWidth: '33ft', status: 'available', quad: [-29, -18, 13.6, 23.2] },
  { plotNumber: 50, block: 'Block H', areaSqYds: 183, dimensions: "50' x 33'", facing: 'West', isCorner: false, roadWidth: '33ft', status: 'available', quad: [-29, -18, 23.2, 32.8] },
  { plotNumber: 49, block: 'Block H', areaSqYds: 183, dimensions: "50' x 33'", facing: 'West', isCorner: false, roadWidth: '33ft', status: 'available', quad: [-29, -18, 32.8, 42.4] },
  { plotNumber: 48, block: 'Block H', areaSqYds: 183, dimensions: "50' x 33'", facing: 'West', isCorner: false, roadWidth: '33ft', status: 'available', quad: [-29, -18, 42.4, 52.0] },
  {
    plotNumber: 47,
    block: 'Block H',
    areaSqYds: 306,
    dimensions: "50' x 56'-9\"",
    facing: 'South-West',
    isCorner: true,
    roadWidth: '33ft',
    status: 'available',
    quad: [-29, -18, 52, 62],
    polygon: [
      [-29, 52],
      [-18, 52],
      [-18, 62],
      [-25, 62],
      [-29, 60]
    ]
  },
  // East Row (facing Road V2): Plots 53, 54, 55, 56, 57, 58
  { plotNumber: 53, block: 'Block H', areaSqYds: 306, dimensions: "50' x 55'", facing: 'East', isCorner: true, roadWidth: '33ft', status: 'available', quad: [-18, -7, 4, 13.6] },
  { plotNumber: 54, block: 'Block H', areaSqYds: 183, dimensions: "50' x 33'", facing: 'East', isCorner: false, roadWidth: '33ft', status: 'available', quad: [-18, -7, 13.6, 23.2] },
  { plotNumber: 55, block: 'Block H', areaSqYds: 183, dimensions: "50' x 33'", facing: 'East', isCorner: false, roadWidth: '33ft', status: 'available', quad: [-18, -7, 23.2, 32.8] },
  { plotNumber: 56, block: 'Block H', areaSqYds: 183, dimensions: "50' x 33'", facing: 'East', isCorner: false, roadWidth: '33ft', status: 'available', quad: [-18, -7, 32.8, 42.4] },
  { plotNumber: 57, block: 'Block H', areaSqYds: 183, dimensions: "50' x 33'", facing: 'East', isCorner: false, roadWidth: '33ft', status: 'available', quad: [-18, -7, 42.4, 52.0] },
  {
    plotNumber: 58,
    block: 'Block H',
    areaSqYds: 314,
    dimensions: "56'-9\" x 56'-6\"",
    facing: 'South-East',
    isCorner: true,
    roadWidth: '33ft',
    status: 'available',
    quad: [-18, -7, 52, 62],
    polygon: [
      [-18, 52],
      [-7, 52],
      [-7, 61.9],
      [-18, 62]
    ]
  },

  // BLOCK I-MID (Plots 59 to 70)
  // Between Road V2 (X: 0) and Road V3 (X: 22). Center X: 11.
  // Z range: 4 to 61.9
  // West Row (facing Road V2): Plots 64, 63, 62, 61, 60, 59
  { plotNumber: 64, block: 'Block I', areaSqYds: 306, dimensions: "50' x 55'", facing: 'West', isCorner: true, roadWidth: '33ft', status: 'available', quad: [0, 11, 4, 13.6] },
  { plotNumber: 63, block: 'Block I', areaSqYds: 183, dimensions: "50' x 33'", facing: 'West', isCorner: false, roadWidth: '33ft', status: 'available', quad: [0, 11, 13.6, 23.2] },
  { plotNumber: 62, block: 'Block I', areaSqYds: 183, dimensions: "50' x 33'", facing: 'West', isCorner: false, roadWidth: '33ft', status: 'available', quad: [0, 11, 23.2, 32.8] },
  { plotNumber: 61, block: 'Block I', areaSqYds: 183, dimensions: "50' x 33'", facing: 'West', isCorner: false, roadWidth: '33ft', status: 'available', quad: [0, 11, 32.8, 42.4] },
  { plotNumber: 60, block: 'Block I', areaSqYds: 183, dimensions: "50' x 33'", facing: 'West', isCorner: false, roadWidth: '33ft', status: 'available', quad: [0, 11, 42.4, 52.0] },
  {
    plotNumber: 59,
    block: 'Block I',
    areaSqYds: 313,
    dimensions: "50' x 56'-3\"",
    facing: 'South-West',
    isCorner: true,
    roadWidth: '33ft',
    status: 'available',
    quad: [0, 11, 52, 61.8],
    polygon: [
      [0, 52],
      [11, 52],
      [11, 61.8],
      [0, 61.8]
    ]
  },
  // East Row (facing Road V3): Plots 65, 66, 67, 68, 69, 70
  { plotNumber: 65, block: 'Block I', areaSqYds: 306, dimensions: "50' x 55'", facing: 'East', isCorner: true, roadWidth: '33ft', status: 'booked', customerName: 'M. Vikram Chandra', customerPhone: '+91 98850 67890', customerEmail: 'vikram.chandra@gmail.com', bookingDate: '2024-10-15', bookingAmount: 250000, paymentStatus: 'token_paid', notes: 'Family site visit completed.', quad: [11, 22, 4, 13.6] },
  { plotNumber: 66, block: 'Block I', areaSqYds: 183, dimensions: "50' x 33'", facing: 'East', isCorner: false, roadWidth: '33ft', status: 'available', quad: [11, 22, 13.6, 23.2] },
  { plotNumber: 67, block: 'Block I', areaSqYds: 183, dimensions: "50' x 33'", facing: 'East', isCorner: false, roadWidth: '33ft', status: 'available', quad: [11, 22, 23.2, 32.8] },
  { plotNumber: 68, block: 'Block I', areaSqYds: 183, dimensions: "50' x 33'", facing: 'East', isCorner: false, roadWidth: '33ft', status: 'available', quad: [11, 22, 32.8, 42.4] },
  { plotNumber: 69, block: 'Block I', areaSqYds: 183, dimensions: "50' x 33'", facing: 'East', isCorner: false, roadWidth: '33ft', status: 'available', quad: [11, 22, 42.4, 52.0] },
  {
    plotNumber: 70,
    block: 'Block I',
    areaSqYds: 314,
    dimensions: "50' x 56'-6\"",
    facing: 'South-East',
    isCorner: true,
    roadWidth: '33ft',
    status: 'sold',
    customerName: 'D. Prabhakar Reddy',
    customerPhone: '+91 90001 23456',
    customerEmail: 'prabhakar.d@gmail.com',
    bookingDate: '2024-09-14',
    bookingAmount: 3925000,
    paymentStatus: 'fully_paid',
    notes: 'Boundary demarcation complete.',
    quad: [11, 22, 52, 61.9],
    polygon: [
      [11, 52],
      [22, 52],
      [22, 61.9],
      [11, 61.8]
    ]
  },

  // BLOCK J-MID (Plots 71 to 82)
  // Between Road V3 (X: 29) and Road V4 (X: 50). Center X: 39.5.
  // Z range: 4 to 65.7
  // West Row (facing Road V3): Plots 76, 75, 74, 73, 72, 71
  { plotNumber: 76, block: 'Block J', areaSqYds: 336, dimensions: "55' x 55'", facing: 'West', isCorner: true, roadWidth: '33ft', status: 'available', quad: [29, 39.5, 4, 13.6] },
  { plotNumber: 75, block: 'Block J', areaSqYds: 202, dimensions: "55' x 33'", facing: 'West', isCorner: false, roadWidth: '33ft', status: 'available', quad: [29, 39.5, 13.6, 23.2] },
  { plotNumber: 74, block: 'Block J', areaSqYds: 202, dimensions: "55' x 33'", facing: 'West', isCorner: false, roadWidth: '33ft', status: 'available', quad: [29, 39.5, 23.2, 32.8] },
  { plotNumber: 73, block: 'Block J', areaSqYds: 202, dimensions: "55' x 33'", facing: 'West', isCorner: false, roadWidth: '33ft', status: 'available', quad: [29, 39.5, 32.8, 42.4] },
  { plotNumber: 72, block: 'Block J', areaSqYds: 202, dimensions: "55' x 33'", facing: 'West', isCorner: false, roadWidth: '33ft', status: 'available', quad: [29, 39.5, 42.4, 52.0] },
  {
    plotNumber: 71,
    block: 'Block J',
    areaSqYds: 364,
    dimensions: "55' x 56'-9\"",
    facing: 'South-West',
    isCorner: true,
    roadWidth: '33ft',
    status: 'available',
    quad: [29, 39.5, 52, 63.7],
    polygon: [
      [29, 52],
      [39.5, 52],
      [39.5, 63.7],
      [29, 61.8]
    ]
  },
  // East Row (facing Road V4): Plots 77, 78, 79, 80, 81, 82
  { plotNumber: 77, block: 'Block J', areaSqYds: 336, dimensions: "55' x 55'", facing: 'East', isCorner: true, roadWidth: '33ft', status: 'available', quad: [39.5, 50, 4, 13.6] },
  { plotNumber: 78, block: 'Block J', areaSqYds: 202, dimensions: "55' x 33'", facing: 'East', isCorner: false, roadWidth: '33ft', status: 'booked', customerName: 'T. Ravinder Goud', customerPhone: '+91 98499 65432', customerEmail: 'ravinder.t@gmail.com', bookingDate: '2024-10-24', bookingAmount: 200000, paymentStatus: 'token_paid', notes: 'Token advance received via UPI.', quad: [39.5, 50, 13.6, 23.2] },
  { plotNumber: 79, block: 'Block J', areaSqYds: 202, dimensions: "55' x 33'", facing: 'East', isCorner: false, roadWidth: '33ft', status: 'available', quad: [39.5, 50, 23.2, 32.8] },
  { plotNumber: 80, block: 'Block J', areaSqYds: 202, dimensions: "55' x 33'", facing: 'East', isCorner: false, roadWidth: '33ft', status: 'available', quad: [39.5, 50, 32.8, 42.4] },
  { plotNumber: 81, block: 'Block J', areaSqYds: 202, dimensions: "55' x 33'", facing: 'East', isCorner: false, roadWidth: '33ft', status: 'available', quad: [39.5, 50, 42.4, 52.0] },
  {
    plotNumber: 82,
    block: 'Block J',
    areaSqYds: 405,
    dimensions: "55' x 69'-6\"",
    facing: 'South-East',
    isCorner: true,
    roadWidth: '33ft',
    status: 'available',
    quad: [39.5, 50, 52, 65.7],
    polygon: [
      [39.5, 52],
      [50, 52],
      [50, 65.7],
      [39.5, 63.7]
    ]
  },

  // BLOCK K-EAST (Plots 83 to 96)
  // Between Road V4 (X: 57) and Highway Service Road (X: 70). Center X: 63.5.
  // Z range: 4 to 67.5
  // West Row (facing Road V4): Plots 89, 88, 87, 86, 85, 84, 83
  { plotNumber: 89, block: 'Block K', areaSqYds: 336, dimensions: "55' x 55'", facing: 'West', isCorner: true, roadWidth: '33ft', status: 'available', quad: [57, 63.5, 4, 12.5] },
  { plotNumber: 88, block: 'Block K', areaSqYds: 202, dimensions: "55' x 33'", facing: 'West', isCorner: false, roadWidth: '33ft', status: 'sold', customerName: 'N. Sridhar Varma', customerPhone: '+91 97000 11223', customerEmail: 'sridhar.varma@gmail.com', bookingDate: '2024-08-15', bookingAmount: 3450000, paymentStatus: 'fully_paid', notes: 'Registration complete.', quad: [57, 63.5, 12.5, 21.0] },
  { plotNumber: 87, block: 'Block K', areaSqYds: 202, dimensions: "55' x 33'", facing: 'West', isCorner: false, roadWidth: '33ft', status: 'available', quad: [57, 63.5, 21.0, 29.5] },
  { plotNumber: 86, block: 'Block K', areaSqYds: 202, dimensions: "55' x 33'", facing: 'West', isCorner: false, roadWidth: '33ft', status: 'available', quad: [57, 63.5, 29.5, 38.0] },
  { plotNumber: 85, block: 'Block K', areaSqYds: 202, dimensions: "55' x 33'", facing: 'West', isCorner: false, roadWidth: '33ft', status: 'available', quad: [57, 63.5, 38.0, 46.5] },
  { plotNumber: 84, block: 'Block K', areaSqYds: 202, dimensions: "55' x 33'", facing: 'West', isCorner: false, roadWidth: '33ft', status: 'available', quad: [57, 63.5, 46.5, 55.0] },
  {
    plotNumber: 83,
    block: 'Block K',
    areaSqYds: 295,
    dimensions: "40'-6\" x 60'-6\"",
    facing: 'South-West',
    isCorner: true,
    roadWidth: '33ft',
    status: 'available',
    quad: [57, 63.5, 55.0, 65.5],
    polygon: [
      [57, 55],
      [63.5, 55],
      [63.5, 65.5],
      [57, 63.5]
    ]
  },
  // East Row (facing Highway Service Road): Plots 90, 91, 92, 93, 94, 95, 96
  { plotNumber: 90, block: 'Block K', areaSqYds: 395, dimensions: "64' x 55'", facing: 'East', isCorner: true, roadWidth: '33ft', status: 'available', quad: [63.5, 70, 4, 12.5] },
  { plotNumber: 91, block: 'Block K', areaSqYds: 241, dimensions: "53'-1\" x 33'", facing: 'East', isCorner: false, roadWidth: '33ft', status: 'available', quad: [63.5, 70, 12.5, 21.0] },
  { plotNumber: 92, block: 'Block K', areaSqYds: 245, dimensions: "53'-10\" x 33'", facing: 'East', isCorner: false, roadWidth: '33ft', status: 'available', quad: [63.5, 70, 21.0, 29.5] },
  { plotNumber: 93, block: 'Block K', areaSqYds: 248, dimensions: "54'-6\" x 33'", facing: 'East', isCorner: false, roadWidth: '33ft', status: 'available', quad: [63.5, 70, 29.5, 38.0] },
  { plotNumber: 94, block: 'Block K', areaSqYds: 251, dimensions: "55'-3\" x 33'", facing: 'East', isCorner: false, roadWidth: '33ft', status: 'available', quad: [63.5, 70, 38.0, 46.5] },
  { plotNumber: 95, block: 'Block K', areaSqYds: 254, dimensions: "55'-10\" x 33'", facing: 'East', isCorner: false, roadWidth: '33ft', status: 'available', quad: [63.5, 70, 46.5, 55.0] },
  {
    plotNumber: 96,
    block: 'Block K',
    areaSqYds: 372,
    dimensions: "51'-9\" x 65'-3\"",
    facing: 'South-East',
    isCorner: true,
    roadWidth: '33ft',
    status: 'booked',
    customerName: 'S. Kishore Kumar',
    customerPhone: '+91 91234 56789',
    customerEmail: 'kishore.s@gmail.com',
    bookingDate: '2024-10-26',
    bookingAmount: 300000,
    paymentStatus: 'token_paid',
    notes: 'Highway corridor facing.',
    quad: [63.5, 70, 55.0, 67.5],
    polygon: [
      [63.5, 55],
      [70, 55],
      [70, 67.5],
      [63.5, 65.5]
    ]
  }
];

// Enrich plots with polygon vertices, 3D bounds, and pricing
export function getEnrichedPlots(overridePlots = null) {
  const source = overridePlots || masterPlotsData;
  return masterPlotsData.map(def => {
    // If override from database exists, merge its dynamic status/price
    const live = overridePlots?.find(p => p.plotNumber === def.plotNumber);
    const [x0, x1, z0, z1] = def.quad;
    const width = Math.abs(x1 - x0);
    const depth = Math.abs(z1 - z0);
    let centerX = (x0 + x1) / 2;
    let centerZ = (z0 + z1) / 2;
    if (def.polygon && def.polygon.length > 0) {
      centerX = def.polygon.reduce((sum, p) => sum + p[0], 0) / def.polygon.length;
      centerZ = def.polygon.reduce((sum, p) => sum + p[1], 0) / def.polygon.length;
    }

    const baseStatus = live?.status || def.status;
    const price = live?.price !== undefined ? live.price : (def.price || 12500);

    return {
      ...def,
      ...live,
      status: baseStatus,
      price,
      hasCustomPolygon: !!def.polygon,
      areaSqFt: def.areaSqYds * 9,
      polygon: def.polygon || createQuad(x0, x1, z0, z1),
      bounds: {
        x: x0,
        z: z0,
        width,
        depth
      },
      center: [centerX, centerZ],
      // Geographic Coordinates [latitude, longitude] at Kadthal, Srisailam Highway
      geoCenter: localToLatLng(centerX, centerZ),
      geoPolygon: def.polygon
        ? def.polygon.map(([px, pz]) => localToLatLng(px, pz))
        : [
            localToLatLng(x0, z0),
            localToLatLng(x1, z0),
            localToLatLng(x1, z1),
            localToLatLng(x0, z1)
          ],
      // 2D SVG canvas normalized coordinates (scaled to standard 1200x800 viewBox)
      // Map X: [-90, +90] -> SVG [60, 1140] (factor: 6.0)
      // Map Z: [-55, +65] -> SVG [60, 740] (factor: 5.66)
      svgPolygon: def.polygon
        ? def.polygon.map(([px, pz]) => [(px + 95) * 6.0, (pz + 58) * 5.6])
        : [
            [(x0 + 95) * 6.0, (z0 + 58) * 5.6],
            [(x1 + 95) * 6.0, (z0 + 58) * 5.6],
            [(x1 + 95) * 6.0, (z1 + 58) * 5.6],
            [(x0 + 95) * 6.0, (z1 + 58) * 5.6]
          ],
      // Authoritative layout attributes from brochure plan (cannot be overwritten by stale DB fields)
      block: def.block,
      dimensions: def.dimensions,
      facing: def.facing,
      isCorner: def.isCorner,
      roadWidth: def.roadWidth,
      customerName: live?.customerName !== undefined ? live.customerName : def.customerName,
      customerPhone: live?.customerPhone !== undefined ? live.customerPhone : def.customerPhone,
      customerEmail: live?.customerEmail !== undefined ? live.customerEmail : def.customerEmail,
      bookingDate: live?.bookingDate !== undefined ? live.bookingDate : def.bookingDate,
      bookingAmount: live?.bookingAmount !== undefined ? live.bookingAmount : def.bookingAmount,
      paymentStatus: live?.paymentStatus !== undefined ? live.paymentStatus : def.paymentStatus,
      notes: live?.notes !== undefined ? live.notes : def.notes
    };
  });
}

// Site boundary in geographic coordinates [lat, lng] tracing exact brochure cuts
export const SITE_BOUNDARY_GEO = SITE_BOUNDARY_LOCAL.map(([x, z]) => localToLatLng(x, z));

// Outward layout-shaped buffer following the exact contour and cuts of the venture layout (organic grass fringe, no square box)
export const LAYOUT_GRASS_BUFFER_LOCAL = [
  [-96, -60],
  [85, -60],
  [85, 74],
  [50, 74],
  [50, 71],
  [22, 71],
  [-7, 71],
  [-36, 70],
  [-47, 63],
  [-58, 58],
  [-65, 58],
  [-96, 49]
];

export const LAYOUT_GRASS_BUFFER_GEO = LAYOUT_GRASS_BUFFER_LOCAL.map(([x, z]) => localToLatLng(x, z));

/**
 * Authoritative Curated Regional Landmarks & Connectivity around Kadthal
 * Srisailam National Highway (NH-765) Corridor
 */
export const REGIONAL_LANDMARKS = [
  {
    id: 'LM-SITE',
    name: "Skandha Venture (Layout Site)",
    shortName: "Skandha Venture",
    category: 'SITE',
    categoryLabel: 'Project Site',
    distance: '0 km',
    time: '0 min',
    direction: 'At Site (Chellampalle, Kadthal)',
    coordinates: [16.9530655, 78.4918533],
    threePos: [0, 0, 0],
    icon: '🏡',
    color: '#16A34A',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    desc: "DTCP & TS RERA Sanctioned Gated Layout (96 Plots, Ac. 0.758 Park, Srisailam Highway).",
    mapsUrl: 'https://www.google.com/maps/place//@16.9530655,78.4918533,52m/data=!3m1!1e3!4m6!1m5!3m4!2zMTbCsDU3JzExLjEiTiA3OMKwMjknMzAuNiJF!8m2!3d16.9530689!4d78.4918425'
  },
  {
    id: 'LM-MAISIGANDI',
    name: 'Sri Maisigandi Maha Maisamma Temple',
    shortName: 'Maisigandi Temple',
    category: 'SPIRITUAL',
    categoryLabel: 'Spiritual Landmark',
    distance: '1.2 km',
    time: '2 mins',
    direction: 'East (via 60ft Road to NH-765)',
    coordinates: [16.9545, 78.5145],
    threePos: [110, 0, -45],
    icon: '🛕',
    color: '#F59E0B',
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-300',
    desc: 'Famous revered temple directly adjoining the 60-ft layout approach road and Srisailam Highway.',
    mapsUrl: 'https://www.google.com/maps/dir/?api=1&origin=16.953069,78.491842&destination=16.9545,78.5145'
  },
  {
    id: 'LM-KADTHAL',
    name: 'Kadthal Town Center & RTC Bus Station',
    shortName: 'Kadthal Town Center',
    category: 'TOWN',
    categoryLabel: 'Township & Transit',
    distance: '3.2 km',
    time: '5 mins',
    direction: 'North-East (via NH-765)',
    coordinates: [16.9715, 78.5135],
    threePos: [65, 0, -110],
    icon: '🏪',
    color: '#3B82F6',
    badgeColor: 'bg-blue-100 text-blue-800 border-blue-300',
    desc: 'Bustling commercial hub with markets, banking, clinics, schools, and frequent TSRTC bus connectivity.',
    mapsUrl: 'https://www.google.com/maps/dir/?api=1&origin=16.953069,78.491842&destination=16.9715,78.5135'
  },
  {
    id: 'LM-PYRAMID',
    name: 'Maheshwara Maha Pyramid (Kadthal)',
    shortName: 'Maha Pyramid',
    category: 'SPIRITUAL',
    categoryLabel: 'Spiritual Wonder',
    distance: '3.8 km',
    time: '6 mins',
    direction: 'North',
    coordinates: [16.9750, 78.4950],
    threePos: [15, 0, -125],
    icon: '🧘',
    color: '#8B5CF6',
    badgeColor: 'bg-purple-100 text-purple-800 border-purple-300',
    desc: "World's largest meditational pyramid attracting thousands of visitors and tourists globally.",
    mapsUrl: 'https://www.google.com/maps/dir/?api=1&origin=16.953069,78.491842&destination=16.9750,78.4950'
  },
  {
    id: 'LM-RRR',
    name: 'Regional Ring Road (RRR) Kadthal Junction',
    shortName: 'Regional Ring Road (RRR)',
    category: 'HIGHWAY',
    categoryLabel: 'Mega Expressway',
    distance: '5.2 km',
    time: '7 mins',
    direction: 'North (NH-765 Interchange)',
    coordinates: [16.9950, 78.5140],
    threePos: [45, 0, -170],
    icon: '🌐',
    color: '#10B981',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    desc: 'Transformative 330km mega expressway project encircling Hyderabad, boosting capital value exponentially.',
    mapsUrl: 'https://www.google.com/maps/dir/?api=1&origin=16.953069,78.491842&destination=16.9950,78.5140'
  },
  {
    id: 'LM-PHARMACITY',
    name: 'Mucherla Hyderabad Pharma City & Future City',
    shortName: 'Pharma City & Future City',
    category: 'ECONOMIC',
    categoryLabel: 'Economic & AI Hub',
    distance: '15.5 km',
    time: '15 mins',
    direction: 'North-East',
    coordinates: [17.0650, 78.5600],
    threePos: [110, 0, -210],
    icon: '🏭',
    color: '#EC4899',
    badgeColor: 'bg-pink-100 text-pink-800 border-pink-300',
    desc: 'Government flagship 19,000-acre industrial and AI megaproject generating lakhs of high-value employment.',
    mapsUrl: 'https://www.google.com/maps/dir/?api=1&origin=16.953069,78.491842&destination=17.0650,78.5600'
  },
  {
    id: 'LM-WONDERLA',
    name: 'Wonderla Amusement Park (Raviryala)',
    shortName: 'Wonderla Amusement Park',
    category: 'AMUSEMENT',
    categoryLabel: 'Entertainment',
    distance: '23 km',
    time: '21 mins',
    direction: 'North along Srisailam Hwy',
    coordinates: [17.1890, 78.6010],
    threePos: [140, 0, -260],
    icon: '🎢',
    color: '#EAB308',
    badgeColor: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    desc: "Hyderabad's premier world-class theme and water amusement park destination.",
    mapsUrl: 'https://www.google.com/maps/dir/?api=1&origin=16.953069,78.491842&destination=17.1890,78.6010'
  },
  {
    id: 'LM-ORR',
    name: 'Outer Ring Road (ORR) Exit 14 Tukkuguda',
    shortName: 'ORR Exit 14 (Tukkuguda)',
    category: 'HIGHWAY',
    categoryLabel: 'City Expressway Junction',
    distance: '25 km',
    time: '23 mins',
    direction: 'North direct via NH-765',
    coordinates: [17.1850, 78.5200],
    threePos: [20, 0, -280],
    icon: '🛣️',
    color: '#06B6D4',
    badgeColor: 'bg-cyan-100 text-cyan-800 border-cyan-300',
    desc: 'High-speed signal-free interchange linking Srisailam Highway directly to Gachibowli, Financial District, and Hitec City.',
    mapsUrl: 'https://www.google.com/maps/dir/?api=1&origin=16.953069,78.491842&destination=17.1850,78.5200'
  },
  {
    id: 'LM-RGIA',
    name: 'Rajiv Gandhi International Airport (RGIA)',
    shortName: 'Hyderabad Airport (RGIA)',
    category: 'TRANSIT',
    categoryLabel: 'International Airport',
    distance: '29 km',
    time: '27 mins',
    direction: 'North-West (Shamshabad)',
    coordinates: [17.2403, 78.4294],
    threePos: [-110, 0, -310],
    icon: '✈️',
    color: '#0EA5E9',
    badgeColor: 'bg-sky-100 text-sky-800 border-sky-300',
    desc: 'Rapid seamless commute to Shamshabad International Airport via ORR & 4-lane Highway.',
    mapsUrl: 'https://www.google.com/maps/dir/?api=1&origin=16.953069,78.491842&destination=17.2403,78.4294'
  }
];

