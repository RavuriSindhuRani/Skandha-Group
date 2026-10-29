/**
 * Skandha Group - Layout Plot Dataset
 * Digitized directly from Brochure Page 2:
 * DTCP Approved Layout TLP NO. 87/2024/H | TS RERA: P02400009081 @ Kadthal
 * Total 96 Plots + Open Space Park (Ac. 0.758 cents)
 */

export const parkData = {
  id: 'PARK-01',
  name: 'Site Reserved for Open Space (Park)',
  areaCents: 'Ac. 0.758 cents',
  dimensions: "209'-9\" x 169'-3\" x 201'-6\"",
  bounds: { x: 40, y: 80, width: 220, height: 180 },
  polygon: [[40, 80], [260, 80], [260, 260], [40, 260]],
  features: ['Landscaped Gardens', 'Jogging Track', 'Children Play Area', 'Lush Avenue Trees']
};

export const layoutRoads = [
  { id: 'ROAD-60-TOP', name: "Proposed 60'-0\" Wide Road", width: '60ft', type: 'arterial', x: 20, y: 20, widthPx: 960, heightPx: 45, orientation: 'horizontal' },
  { id: 'ROAD-33-EAST', name: "Proposed 33'-0\" Wide Road", width: '33ft', type: 'arterial', x: 940, y: 20, widthPx: 45, heightPx: 670, orientation: 'vertical' },
  { id: 'ROAD-33-MID', name: "Proposed 33'-0\" Wide Road (Main Internal Boulevard)", width: '33ft', type: 'internal', x: 20, y: 275, widthPx: 920, heightPx: 40, orientation: 'horizontal' },
  { id: 'ROAD-33-V0', name: "Proposed 33'-0\" Wide Road (Between Park & Plots)", width: '33ft', type: 'internal', x: 140, y: 320, widthPx: 30, heightPx: 360, orientation: 'vertical' },
  { id: 'ROAD-33-V1', name: "Proposed 33'-0\" Wide Road", width: '33ft', type: 'internal', x: 375, y: 65, widthPx: 30, heightPx: 615, orientation: 'vertical' },
  { id: 'ROAD-33-V2', name: "Proposed 33'-0\" Wide Road", width: '33ft', type: 'internal', x: 535, y: 65, widthPx: 30, heightPx: 615, orientation: 'vertical' },
  { id: 'ROAD-33-V3', name: "Proposed 33'-0\" Wide Road", width: '33ft', type: 'internal', x: 695, y: 65, widthPx: 30, heightPx: 615, orientation: 'vertical' },
  { id: 'ROAD-33-V4', name: "Proposed 33'-0\" Wide Road", width: '33ft', type: 'internal', x: 845, y: 65, widthPx: 30, heightPx: 615, orientation: 'vertical' }
];

export const initialPlots = [
  { plotNumber: 1, block: 'Block E', areaSqYds: 247, dimensions: "58'-3\" x 37'-3\"", facing: 'North-East', isCorner: true, roadWidth: '60ft', status: 'booked', customerName: 'P. Venkat Reddy', customerPhone: '+91 98480 23145', customerEmail: 'venkat.reddy@gmail.com', bookingDate: '2024-10-12', bookingAmount: 250000, paymentStatus: 'token_paid', notes: 'East-facing corner plot near entrance boulevard.' },
  { plotNumber: 2, block: 'Block E', areaSqYds: 217, dimensions: "59'-3\" x 33'", facing: 'East', isCorner: false, roadWidth: '33ft', status: 'available' },
  { plotNumber: 3, block: 'Block E', areaSqYds: 221, dimensions: "60'-3\" x 33'", facing: 'East', isCorner: false, roadWidth: '33ft', status: 'available' },
  { plotNumber: 4, block: 'Block E', areaSqYds: 380, dimensions: "61'-3\" x 55' (63')", facing: 'South-East', isCorner: true, roadWidth: '33ft', status: 'available' },
  { plotNumber: 5, block: 'Block E', areaSqYds: 336, dimensions: "55' x 55'", facing: 'South-West', isCorner: true, roadWidth: '33ft', status: 'sold', customerName: 'Dr. K. Srinivas Rao', customerPhone: '+91 99890 56781', customerEmail: 'dr.srinivas@apollo.org', bookingDate: '2024-09-18', bookingAmount: 4200000, paymentStatus: 'fully_paid', notes: 'Full registration completed. Title deed registered.' },
  { plotNumber: 6, block: 'Block E', areaSqYds: 202, dimensions: "55' x 33'", facing: 'West', isCorner: false, roadWidth: '33ft', status: 'available' },
  { plotNumber: 7, block: 'Block E', areaSqYds: 202, dimensions: "55' x 33'", facing: 'West', isCorner: false, roadWidth: '33ft', status: 'available' },
  { plotNumber: 8, block: 'Block E', areaSqYds: 241, dimensions: "55'-1\" x 39'-3\"", facing: 'North-West', isCorner: true, roadWidth: '60ft', status: 'available' },
  { plotNumber: 9, block: 'Block D', areaSqYds: 243, dimensions: "55'-1\" x 39'-9\"", facing: 'North-East', isCorner: true, roadWidth: '60ft', status: 'available' },
  { plotNumber: 10, block: 'Block D', areaSqYds: 202, dimensions: "55' x 33'", facing: 'East', isCorner: false, roadWidth: '33ft', status: 'available' },
  { plotNumber: 11, block: 'Block D', areaSqYds: 202, dimensions: "55' x 33'", facing: 'East', isCorner: false, roadWidth: '33ft', status: 'available' },
  { plotNumber: 12, block: 'Block D', areaSqYds: 336, dimensions: "55' x 55'", facing: 'South-East', isCorner: true, roadWidth: '33ft', status: 'booked', customerName: 'Smt. Anitha Sharma', customerPhone: '+91 94401 87654', customerEmail: 'anitha.sharma@yahoo.com', bookingDate: '2024-10-05', bookingAmount: 300000, paymentStatus: 'token_paid', notes: 'Vasthu consultation approved.' },
  { plotNumber: 13, block: 'Block D', areaSqYds: 336, dimensions: "55' x 55'", facing: 'South-West', isCorner: true, roadWidth: '33ft', status: 'available' },
  { plotNumber: 14, block: 'Block D', areaSqYds: 202, dimensions: "55' x 33'", facing: 'West', isCorner: false, roadWidth: '33ft', status: 'available' },
  { plotNumber: 15, block: 'Block D', areaSqYds: 202, dimensions: "55' x 33'", facing: 'West', isCorner: false, roadWidth: '33ft', status: 'available' },
  { plotNumber: 16, block: 'Block D', areaSqYds: 260, dimensions: "55'-1\" x 42'-6\"", facing: 'North-West', isCorner: true, roadWidth: '60ft', status: 'available' },
  { plotNumber: 17, block: 'Block B', areaSqYds: 242, dimensions: "50'-1\" x 43'-3\"", facing: 'North-East', isCorner: true, roadWidth: '60ft', status: 'available' },
  { plotNumber: 18, block: 'Block B', areaSqYds: 183, dimensions: "50' x 33'", facing: 'East', isCorner: false, roadWidth: '33ft', status: 'available' },
  { plotNumber: 19, block: 'Block B', areaSqYds: 183, dimensions: "50' x 33'", facing: 'East', isCorner: false, roadWidth: '33ft', status: 'available' },
  { plotNumber: 20, block: 'Block B', areaSqYds: 306, dimensions: "50' x 55'", facing: 'South-East', isCorner: true, roadWidth: '33ft', status: 'available' },
  { plotNumber: 21, block: 'Block B', areaSqYds: 306, dimensions: "50' x 55'", facing: 'South-West', isCorner: true, roadWidth: '33ft', status: 'available' },
  { plotNumber: 22, block: 'Block B', areaSqYds: 183, dimensions: "50' x 33'", facing: 'West', isCorner: false, roadWidth: '33ft', status: 'available' },
  { plotNumber: 23, block: 'Block B', areaSqYds: 183, dimensions: "50' x 33'", facing: 'West', isCorner: false, roadWidth: '33ft', status: 'available' },
  { plotNumber: 24, block: 'Block B', areaSqYds: 249, dimensions: "50'-1\" x 45'-3\"", facing: 'North-West', isCorner: true, roadWidth: '60ft', status: 'sold', customerName: 'G. Mahender Reddy', customerPhone: '+91 91000 45678', customerEmail: 'mahender.g@gmail.com', bookingDate: '2024-08-22', bookingAmount: 3112500, paymentStatus: 'fully_paid', notes: 'Immediate spot registration done.' },
  { plotNumber: 25, block: 'Block A', areaSqYds: 259, dimensions: "50'-1\" x 46'-3\"", facing: 'North-East', isCorner: true, roadWidth: '60ft', status: 'available' },
  { plotNumber: 26, block: 'Block A', areaSqYds: 183, dimensions: "50' x 33'", facing: 'East', isCorner: false, roadWidth: '33ft', status: 'available' },
  { plotNumber: 27, block: 'Block A', areaSqYds: 183, dimensions: "50' x 33'", facing: 'East', isCorner: false, roadWidth: '33ft', status: 'available' },
  { plotNumber: 28, block: 'Block A', areaSqYds: 306, dimensions: "50' x 55'", facing: 'South-East', isCorner: true, roadWidth: '33ft', status: 'available' },
  { plotNumber: 29, block: 'Block A', areaSqYds: 264, dimensions: "50'-1\" x 48' (47')", facing: 'North-West', isCorner: true, roadWidth: '60ft', status: 'available' },
  { plotNumber: 30, block: 'Block A', areaSqYds: 183, dimensions: "50' x 33'", facing: 'West', isCorner: false, roadWidth: '33ft', status: 'booked', customerName: 'K. Ramesh Babu', customerPhone: '+91 97012 34567', customerEmail: 'ramesh.babu@tcs.com', bookingDate: '2024-10-19', bookingAmount: 200000, paymentStatus: 'token_paid', notes: 'Token advance received via NEFT.' },
  { plotNumber: 31, block: 'Block A', areaSqYds: 183, dimensions: "50' x 33'", facing: 'West', isCorner: false, roadWidth: '33ft', status: 'sold', customerName: 'V. Lakshmi Narayana', customerPhone: '+91 98665 12349', customerEmail: 'v.narayana@outlook.com', bookingDate: '2024-09-02', bookingAmount: 2287500, paymentStatus: 'fully_paid', notes: 'SBI Home Loan disbursed.' },
  { plotNumber: 32, block: 'Block A', areaSqYds: 306, dimensions: "50' x 55'", facing: 'South-West', isCorner: true, roadWidth: '33ft', status: 'available' },
  { plotNumber: 33, block: 'Block F', areaSqYds: 362, dimensions: "58'-9\" x 55'", facing: 'North-East', isCorner: true, roadWidth: '33ft', status: 'available' },
  { plotNumber: 34, block: 'Block F', areaSqYds: 220, dimensions: "59'-9\" x 33'", facing: 'East', isCorner: false, roadWidth: '33ft', status: 'available' },
  { plotNumber: 35, block: 'Block F', areaSqYds: 222, dimensions: "60'-3\" x 33'", facing: 'East', isCorner: false, roadWidth: '33ft', status: 'available' },
  { plotNumber: 36, block: 'Block F', areaSqYds: 393, dimensions: "60'-9\" x 99'-6\"", facing: 'South-East', isCorner: true, roadWidth: '33ft', status: 'available' },
  { plotNumber: 41, block: 'Block G', areaSqYds: 336, dimensions: "55' x 55'", facing: 'North-West', isCorner: true, roadWidth: '33ft', status: 'available' },
  { plotNumber: 40, block: 'Block G', areaSqYds: 202, dimensions: "55' x 33'", facing: 'West', isCorner: false, roadWidth: '33ft', status: 'available' },
  { plotNumber: 39, block: 'Block G', areaSqYds: 202, dimensions: "55' x 33'", facing: 'West', isCorner: false, roadWidth: '33ft', status: 'available' },
  { plotNumber: 38, block: 'Block G', areaSqYds: 202, dimensions: "55' x 33'", facing: 'West', isCorner: false, roadWidth: '33ft', status: 'available' },
  { plotNumber: 37, block: 'Block G', areaSqYds: 309, dimensions: "42'-9\" x 58'-3\"", facing: 'South-West', isCorner: true, roadWidth: '33ft', status: 'available' },
  { plotNumber: 42, block: 'Block G', areaSqYds: 336, dimensions: "55' x 55'", facing: 'North-East', isCorner: true, roadWidth: '33ft', status: 'booked', customerName: 'Ch. Madhusudhan Rao', customerPhone: '+91 94901 23450', customerEmail: 'madhu.ch@gmail.com', bookingDate: '2024-10-21', bookingAmount: 350000, paymentStatus: 'partially_paid', notes: 'Avenue corner plot facing Maisigandi corridor.' },
  { plotNumber: 43, block: 'Block G', areaSqYds: 202, dimensions: "55' x 33'", facing: 'East', isCorner: false, roadWidth: '33ft', status: 'available' },
  { plotNumber: 44, block: 'Block G', areaSqYds: 202, dimensions: "55' x 33'", facing: 'East', isCorner: false, roadWidth: '33ft', status: 'available' },
  { plotNumber: 45, block: 'Block G', areaSqYds: 202, dimensions: "55' x 33'", facing: 'East', isCorner: false, roadWidth: '33ft', status: 'available' },
  { plotNumber: 46, block: 'Block G', areaSqYds: 403, dimensions: "58'-3\" x 73'-9\"", facing: 'South-East', isCorner: true, roadWidth: '33ft', status: 'sold', customerName: 'B. Suresh Kumar', customerPhone: '+91 99499 87654', customerEmail: 'suresh.kumar@wipro.com', bookingDate: '2024-08-30', bookingAmount: 5037500, paymentStatus: 'fully_paid', notes: 'ICICI loan sanctioned and registered.' },
  { plotNumber: 52, block: 'Block H', areaSqYds: 306, dimensions: "50' x 55'", facing: 'West', isCorner: true, roadWidth: '33ft', status: 'available' },
  { plotNumber: 51, block: 'Block H', areaSqYds: 183, dimensions: "50' x 33'", facing: 'West', isCorner: false, roadWidth: '33ft', status: 'available' },
  { plotNumber: 50, block: 'Block H', areaSqYds: 183, dimensions: "50' x 33'", facing: 'West', isCorner: false, roadWidth: '33ft', status: 'available' },
  { plotNumber: 49, block: 'Block H', areaSqYds: 183, dimensions: "50' x 33'", facing: 'West', isCorner: false, roadWidth: '33ft', status: 'available' },
  { plotNumber: 48, block: 'Block H', areaSqYds: 183, dimensions: "50' x 33'", facing: 'West', isCorner: false, roadWidth: '33ft', status: 'available' },
  { plotNumber: 47, block: 'Block H', areaSqYds: 306, dimensions: "50' x 56'-9\"", facing: 'South-West', isCorner: true, roadWidth: '33ft', status: 'available' },
  { plotNumber: 53, block: 'Block H', areaSqYds: 306, dimensions: "50' x 55'", facing: 'East', isCorner: true, roadWidth: '33ft', status: 'available' },
  { plotNumber: 54, block: 'Block H', areaSqYds: 183, dimensions: "50' x 33'", facing: 'East', isCorner: false, roadWidth: '33ft', status: 'available' },
  { plotNumber: 55, block: 'Block H', areaSqYds: 183, dimensions: "50' x 33'", facing: 'East', isCorner: false, roadWidth: '33ft', status: 'available' },
  { plotNumber: 56, block: 'Block H', areaSqYds: 183, dimensions: "50' x 33'", facing: 'East', isCorner: false, roadWidth: '33ft', status: 'available' },
  { plotNumber: 57, block: 'Block H', areaSqYds: 183, dimensions: "50' x 33'", facing: 'East', isCorner: false, roadWidth: '33ft', status: 'available' },
  { plotNumber: 58, block: 'Block H', areaSqYds: 314, dimensions: "56'-9\" x 56'-6\"", facing: 'South-East', isCorner: true, roadWidth: '33ft', status: 'available' },
  { plotNumber: 64, block: 'Block I', areaSqYds: 306, dimensions: "50' x 55'", facing: 'West', isCorner: true, roadWidth: '33ft', status: 'available' },
  { plotNumber: 63, block: 'Block I', areaSqYds: 183, dimensions: "50' x 33'", facing: 'West', isCorner: false, roadWidth: '33ft', status: 'available' },
  { plotNumber: 62, block: 'Block I', areaSqYds: 183, dimensions: "50' x 33'", facing: 'West', isCorner: false, roadWidth: '33ft', status: 'available' },
  { plotNumber: 61, block: 'Block I', areaSqYds: 183, dimensions: "50' x 33'", facing: 'West', isCorner: false, roadWidth: '33ft', status: 'available' },
  { plotNumber: 60, block: 'Block I', areaSqYds: 183, dimensions: "50' x 33'", facing: 'West', isCorner: false, roadWidth: '33ft', status: 'available' },
  { plotNumber: 59, block: 'Block I', areaSqYds: 313, dimensions: "50' x 56'-3\"", facing: 'South-West', isCorner: true, roadWidth: '33ft', status: 'available' },
  { plotNumber: 65, block: 'Block I', areaSqYds: 306, dimensions: "50' x 55'", facing: 'East', isCorner: true, roadWidth: '33ft', status: 'booked', customerName: 'M. Vikram Chandra', customerPhone: '+91 98850 67890', customerEmail: 'vikram.chandra@gmail.com', bookingDate: '2024-10-15', bookingAmount: 250000, paymentStatus: 'token_paid', notes: 'Family site visit completed.' },
  { plotNumber: 66, block: 'Block I', areaSqYds: 183, dimensions: "50' x 33'", facing: 'East', isCorner: false, roadWidth: '33ft', status: 'available' },
  { plotNumber: 67, block: 'Block I', areaSqYds: 183, dimensions: "50' x 33'", facing: 'East', isCorner: false, roadWidth: '33ft', status: 'available' },
  { plotNumber: 68, block: 'Block I', areaSqYds: 183, dimensions: "50' x 33'", facing: 'East', isCorner: false, roadWidth: '33ft', status: 'available' },
  { plotNumber: 69, block: 'Block I', areaSqYds: 183, dimensions: "50' x 33'", facing: 'East', isCorner: false, roadWidth: '33ft', status: 'available' },
  { plotNumber: 70, block: 'Block I', areaSqYds: 314, dimensions: "50' x 56'-6\"", facing: 'South-East', isCorner: true, roadWidth: '33ft', status: 'sold', customerName: 'D. Prabhakar Reddy', customerPhone: '+91 90001 23456', customerEmail: 'prabhakar.d@gmail.com', bookingDate: '2024-09-14', bookingAmount: 3925000, paymentStatus: 'fully_paid', notes: 'Boundary demarcation complete.' },
  { plotNumber: 76, block: 'Block J', areaSqYds: 336, dimensions: "55' x 55'", facing: 'West', isCorner: true, roadWidth: '33ft', status: 'available' },
  { plotNumber: 75, block: 'Block J', areaSqYds: 202, dimensions: "55' x 33'", facing: 'West', isCorner: false, roadWidth: '33ft', status: 'available' },
  { plotNumber: 74, block: 'Block J', areaSqYds: 202, dimensions: "55' x 33'", facing: 'West', isCorner: false, roadWidth: '33ft', status: 'available' },
  { plotNumber: 73, block: 'Block J', areaSqYds: 202, dimensions: "55' x 33'", facing: 'West', isCorner: false, roadWidth: '33ft', status: 'available' },
  { plotNumber: 72, block: 'Block J', areaSqYds: 202, dimensions: "55' x 33'", facing: 'West', isCorner: false, roadWidth: '33ft', status: 'available' },
  { plotNumber: 71, block: 'Block J', areaSqYds: 364, dimensions: "55' x 56'-9\"", facing: 'South-West', isCorner: true, roadWidth: '33ft', status: 'available' },
  { plotNumber: 77, block: 'Block J', areaSqYds: 336, dimensions: "55' x 55'", facing: 'East', isCorner: true, roadWidth: '33ft', status: 'available' },
  { plotNumber: 78, block: 'Block J', areaSqYds: 202, dimensions: "55' x 33'", facing: 'East', isCorner: false, roadWidth: '33ft', status: 'booked', customerName: 'T. Ravinder Goud', customerPhone: '+91 98499 65432', customerEmail: 'ravinder.t@gmail.com', bookingDate: '2024-10-24', bookingAmount: 200000, paymentStatus: 'token_paid', notes: 'Token advance received via UPI.' },
  { plotNumber: 79, block: 'Block J', areaSqYds: 202, dimensions: "55' x 33'", facing: 'East', isCorner: false, roadWidth: '33ft', status: 'available' },
  { plotNumber: 80, block: 'Block J', areaSqYds: 202, dimensions: "55' x 33'", facing: 'East', isCorner: false, roadWidth: '33ft', status: 'available' },
  { plotNumber: 81, block: 'Block J', areaSqYds: 202, dimensions: "55' x 33'", facing: 'East', isCorner: false, roadWidth: '33ft', status: 'available' },
  { plotNumber: 82, block: 'Block J', areaSqYds: 405, dimensions: "55' x 69'-6\"", facing: 'South-East', isCorner: true, roadWidth: '33ft', status: 'available' },
  { plotNumber: 89, block: 'Block K', areaSqYds: 336, dimensions: "55' x 55'", facing: 'West', isCorner: true, roadWidth: '33ft', status: 'available' },
  { plotNumber: 88, block: 'Block K', areaSqYds: 202, dimensions: "55' x 33'", facing: 'West', isCorner: false, roadWidth: '33ft', status: 'sold', customerName: 'N. Sridhar Varma', customerPhone: '+91 97000 11223', customerEmail: 'sridhar.varma@gmail.com', bookingDate: '2024-08-15', bookingAmount: 3450000, paymentStatus: 'fully_paid', notes: 'Registration complete.' },
  { plotNumber: 87, block: 'Block K', areaSqYds: 202, dimensions: "55' x 33'", facing: 'West', isCorner: false, roadWidth: '33ft', status: 'available' },
  { plotNumber: 86, block: 'Block K', areaSqYds: 202, dimensions: "55' x 33'", facing: 'West', isCorner: false, roadWidth: '33ft', status: 'available' },
  { plotNumber: 85, block: 'Block K', areaSqYds: 202, dimensions: "55' x 33'", facing: 'West', isCorner: false, roadWidth: '33ft', status: 'available' },
  { plotNumber: 84, block: 'Block K', areaSqYds: 202, dimensions: "55' x 33'", facing: 'West', isCorner: false, roadWidth: '33ft', status: 'available' },
  { plotNumber: 83, block: 'Block K', areaSqYds: 295, dimensions: "40'-6\" x 60'-6\"", facing: 'South-West', isCorner: true, roadWidth: '33ft', status: 'available' },
  { plotNumber: 90, block: 'Block K', areaSqYds: 395, dimensions: "64' x 55'", facing: 'East', isCorner: true, roadWidth: '33ft', status: 'available' },
  { plotNumber: 91, block: 'Block K', areaSqYds: 241, dimensions: "53'-1\" x 33'", facing: 'East', isCorner: false, roadWidth: '33ft', status: 'available' },
  { plotNumber: 92, block: 'Block K', areaSqYds: 245, dimensions: "53'-10\" x 33'", facing: 'East', isCorner: false, roadWidth: '33ft', status: 'available' },
  { plotNumber: 93, block: 'Block K', areaSqYds: 248, dimensions: "54'-6\" x 33'", facing: 'East', isCorner: false, roadWidth: '33ft', status: 'available' },
  { plotNumber: 94, block: 'Block K', areaSqYds: 251, dimensions: "55'-3\" x 33'", facing: 'East', isCorner: false, roadWidth: '33ft', status: 'available' },
  { plotNumber: 95, block: 'Block K', areaSqYds: 254, dimensions: "55'-10\" x 33'", facing: 'East', isCorner: false, roadWidth: '33ft', status: 'available' },
  { plotNumber: 96, block: 'Block K', areaSqYds: 372, dimensions: "51'-9\" x 65'-3\"", facing: 'South-East', isCorner: true, roadWidth: '33ft', status: 'booked', customerName: 'S. Kishore Kumar', customerPhone: '+91 91234 56789', customerEmail: 'kishore.s@gmail.com', bookingDate: '2024-10-26', bookingAmount: 300000, paymentStatus: 'token_paid', notes: 'Highway corridor facing.' }
];

export function calculateExtraCharges(facing, isCorner, roadWidth) {
  let charges = 0;
  const breakdown = [];
  if (isCorner) {
    if (facing.includes('North-East') || facing.includes('North-West')) {
      charges += 800;
      breakdown.push({ label: 'N/E or N/W Corner', rate: 800 });
    } else if (facing.includes('South-East') || facing.includes('South-West')) {
      charges += 600;
      breakdown.push({ label: 'S/E or S/W Corner', rate: 600 });
    }
  } else {
    if (facing === 'East') {
      charges += 500;
      breakdown.push({ label: 'East Facing', rate: 500 });
    } else if (facing === 'North') {
      charges += 500;
      breakdown.push({ label: 'North Facing', rate: 500 });
    }
  }
  if (roadWidth === '40ft' || roadWidth === '60ft') {
    charges += 500;
    breakdown.push({ label: `${roadWidth} Wide Road`, rate: 500 });
  }
  return { totalPerSqYd: charges, breakdown };
}
