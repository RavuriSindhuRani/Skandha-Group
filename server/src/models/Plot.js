import mongoose from 'mongoose';

const plotSchema = new mongoose.Schema({
  plotNumber: { type: Number, required: true, unique: true, index: true },
  block: { type: String, default: '' },
  areaSqYds: { type: Number, required: true },
  areaSqFt: { type: Number },
  dimensions: { type: String, required: true },
  facing: { type: String, required: true },
  isCorner: { type: Boolean, default: false },
  roadWidth: { type: String, default: "33'-0\"" },
  status: {
    type: String,
    enum: ['available', 'booked', 'sold'],
    default: 'available',
    index: true
  },
  basePricePerSqYd: { type: Number, default: 12500 },
  extraChargesPerSqYd: { type: Number, default: 0 },
  extraChargesBreakdown: [{
    label: String,
    rate: Number
  }],
  totalPrice: { type: Number },
  isUnverifiedPricing: { type: Boolean, default: true },
  polygon: { type: [[Number]], default: [] },
  bounds: {
    x: Number,
    y: Number,
    width: Number,
    height: Number
  },
  x3d: Number,
  z3d: Number,
  w3d: Number,
  customerName: { type: String, default: '' },
  customerPhone: { type: String, default: '' },
  customerEmail: { type: String, default: '' },
  bookingDate: { type: String, default: '' },
  bookingAmount: { type: Number, default: 0 },
  paymentStatus: {
    type: String,
    enum: ['unpaid', 'token_paid', 'partially_paid', 'fully_paid'],
    default: 'unpaid'
  },
  notes: { type: String, default: '' },
  updatedBy: { type: String }
}, { timestamps: true, bufferCommands: false });

plotSchema.pre('save', function (next) {
  if (this.areaSqYds) {
    this.areaSqFt = this.areaSqYds * 9;
  }
  if (this.basePricePerSqYd && this.areaSqYds) {
    this.totalPrice = this.areaSqYds * (this.basePricePerSqYd + (this.extraChargesPerSqYd || 0));
  }
  next();
});

export default mongoose.model('Plot', plotSchema);
