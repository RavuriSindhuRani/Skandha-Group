import mongoose from 'mongoose';

const activityEventSchema = new mongoose.Schema({
  eventType: {
    type: String,
    required: true,
    enum: [
      'layout_opened',
      'view_mode_toggled',
      'plot_viewed',
      'filter_applied',
      'search_performed',
      'enquiry_started',
      'enquiry_submitted',
      'brochure_downloaded',
      'page_viewed',
      'contact_clicked',
      'callback_requested',
      'plot_drawer_opened'
    ],
    index: true
  },
  plotNumber: { type: Number, index: true },
  customerName: { type: String, default: '' },
  customerPhone: { type: String, default: '' },
  customerEmail: { type: String, default: '' },
  page: { type: String, default: '' },
  actionDetails: { type: String, default: '' },
  metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  userAgent: { type: String }
}, { timestamps: true });

export default mongoose.model('ActivityEvent', activityEventSchema);
