import mongoose from 'mongoose';

const galleryItemSchema = new mongoose.Schema({
  title: { type: String, required: true },
  category: {
    type: String,
    enum: ['development', 'infrastructure', 'amenities', 'location'],
    default: 'development'
  },
  imageUrl: { type: String, required: true },
  caption: { type: String },
  order: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.model('GalleryItem', galleryItemSchema);
