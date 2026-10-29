import mongoose from 'mongoose';

const leadSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true, lowercase: true },
  phone: { type: String, trim: true, default: '' },
  preferredContactMethod: {
    type: String,
    enum: ['whatsapp', 'email', 'phone'],
    default: 'whatsapp'
  },
  plotNumber: { type: Number },
  message: { type: String, trim: true },
  consent: { type: Boolean, required: true, default: true },
  status: {
    type: String,
    enum: ['new', 'contacted', 'qualified', 'closed', 'spam'],
    default: 'new',
    index: true
  },
  assignedTo: { type: String, default: 'Sales Team' },
  followUpNotes: [{
    text: String,
    author: String,
    createdAt: { type: Date, default: Date.now }
  }],
  ipAddress: { type: String },
  userAgent: { type: String }
}, { timestamps: true });

export default mongoose.model('Lead', leadSchema);
