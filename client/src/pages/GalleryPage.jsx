import React, { useState } from 'react';
import Lightbox from '../components/Lightbox';
import { Maximize2 } from 'lucide-react';

const BRUNDAVANAM_GALLERY_PHOTOS = [
  {
    _id: 'brundavanam-site-1',
    imageUrl: '/assets/gallery_1.jpg',
    title: 'Brundavanam Site Development - View 1'
  },
  {
    _id: 'brundavanam-site-2',
    imageUrl: '/assets/gallery_2.jpg',
    title: 'Brundavanam Site Development - View 2'
  },
  {
    _id: 'brundavanam-site-3',
    imageUrl: '/assets/gallery_3.jpg',
    title: 'Brundavanam Site Development - View 3'
  },
  {
    _id: 'brundavanam-site-4',
    imageUrl: '/assets/gallery_4.jpg',
    title: 'Brundavanam Site Development - View 4'
  },
  {
    _id: 'brundavanam-site-5',
    imageUrl: '/assets/gallery_5.jpg',
    title: 'Brundavanam Site Development - View 5'
  },
  {
    _id: 'brundavanam-site-6',
    imageUrl: '/assets/gallery_6.jpg',
    title: 'Brundavanam Aerial Layout View 1'
  },
  {
    _id: 'brundavanam-site-7',
    imageUrl: '/assets/gallery_7.jpg',
    title: 'Brundavanam Aerial Layout View 2'
  },
  {
    _id: 'brundavanam-site-8',
    imageUrl: '/assets/gallery_8.jpg',
    title: 'Brundavanam Aerial Layout View 3'
  },
  {
    _id: 'brundavanam-site-9',
    imageUrl: '/assets/gallery_9.jpg',
    title: 'Brundavanam Aerial Layout View 4'
  }
];

export default function GalleryPage() {
  const [items] = useState(BRUNDAVANAM_GALLERY_PHOTOS);
  const [lightboxIndex, setLightboxIndex] = useState(null);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-14 pb-20 space-y-10">
      {/* Brundavanam Gallery Header */}
      <div className="text-center space-y-4 pb-2">
        <div className="flex items-center justify-center">
          <h1 className="bg-brand-orange text-white text-3xl sm:text-4xl lg:text-5xl font-extrabold px-6 sm:px-8 py-2 sm:py-2.5 rounded-sm shadow-md tracking-tight inline-block font-serif">
            Brundavanam
          </h1>
        </div>

        <p className="text-xs sm:text-sm text-slate-600 max-w-2xl mx-auto leading-relaxed">
          Authentic on-site infrastructure, sanctioned blueprints, and scenic surroundings of Skandha Group&apos;s 10.50-acre gated residential plotted development at Kadthal, adjoining Srisailam Highway (NH 765).
        </p>
      </div>

      {/* Gallery Cards Grid (Image Only) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
        {items.map((item, idx) => (
          <div
            key={item._id || idx}
            onClick={() => setLightboxIndex(idx)}
            className="group relative cursor-pointer overflow-hidden rounded-2xl border border-slate-200/90 bg-slate-950 shadow-sm hover:shadow-2xl hover:border-brand-orange/50 transition-all duration-300 aspect-[4/3] flex items-center justify-center"
          >
            <img
              src={item.imageUrl}
              alt={item.title || `Site Photo ${idx + 1}`}
              className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-108"
              loading="lazy"
            />
            {/* Hover Enlarge Overlay */}
            <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center pointer-events-none">
              <span className="text-xs font-bold text-white bg-brand-orange/95 px-4 py-2 rounded-xl flex items-center gap-2 shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                <Maximize2 className="w-4 h-4" />
                <span>Enlarge Photo</span>
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Full-Screen High-Resolution Lightbox Modal */}
      <Lightbox
        items={items}
        currentIndex={lightboxIndex}
        onClose={() => setLightboxIndex(null)}
        onPrev={() => setLightboxIndex(prev => (prev > 0 ? prev - 1 : items.length - 1))}
        onNext={() => setLightboxIndex(prev => (prev < items.length - 1 ? prev + 1 : 0))}
      />
    </div>
  );
}
