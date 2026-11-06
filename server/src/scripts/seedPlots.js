import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import Plot from '../models/Plot.js';
import SiteSettings from '../models/SiteSettings.js';
import GalleryItem from '../models/GalleryItem.js';
import AdminUser from '../models/AdminUser.js';
import { getEnrichedPlots } from '../data/layoutCoordinates.js';

async function seedDatabase() {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/skandha_brundavan';
  console.log(`Connecting to MongoDB: ${mongoUri}`);
  await mongoose.connect(mongoUri);

  // 1. Seed Plots
  console.log('Seeding approved layout plots...');
  const enrichedPlots = getEnrichedPlots();
  let plotsCount = 0;

  for (const plotData of enrichedPlots) {
    await Plot.findOneAndUpdate(
      { plotNumber: plotData.plotNumber },
      { ...plotData, updatedBy: 'system-seed' },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    plotsCount++;
  }
  console.log(`✓ Seeded ${plotsCount} plots matching Brochure Page 2 layout plan.`);

  // 2. Seed Site Settings
  console.log('Seeding site settings...');
  let settings = await SiteSettings.findOne();
  if (!settings) {
    settings = await SiteSettings.create({
      companyName: 'Skandha Group',
      projectName: "Kadthal Venture",
      projectLocation: 'Kadthal, Srisailam Highway, Telangana',
      officeAddress: '# 8-7-91/17/1, 4th Floor Bata Building, Beside Naveena Hospital, Main Road, Hastinapuram, Hyderabad, Telangana -500079',
      contactEmail: 'contact@skandhagroup.com',
      whatsappNumber: process.env.DEFAULT_WHATSAPP_NUMBER || '919100031199',
      dtcpNumber: 'TLP NO. 87/2024/H',
      reraNumber: 'PO2400009081',
      heroVideoUrl: '/assets/skanda-group.mp4',
      heroPosterUrl: '/assets/hero_cover.jpg',
      brochurePdfUrl: '/assets/skandha_brochure.pdf',
      flyerPdfUrl: '/assets/skandha_flyer.pdf',
      socialLinks: {
        facebook: 'https://www.facebook.com/share/1FMmY12zRG/',
        instagram: 'https://www.instagram.com/_skandhagroups_/',
        youtube: 'https://www.youtube.com/@SkandhaGroups-hyd'
      },
      publicClaimsApproved: true,
      seo: {
        title: "Skandha Group | DTCP & RERA Approved Open Plots in Kadthal",
        description: "Premium DTCP & RERA approved residential villa plots in Kadthal near Srisailam Highway & Maisigandi Temple by Skandha Group. 100% Vasthu compliant with 40' & 33' BT roads.",
        keywords: "open plots Kadthal, Skandha Group, DTCP approved plots, Srisailam Highway plots, Pharma City plots",
        ogImage: '/assets/hero_cover.jpg'
      }
    });
    console.log('✓ Initialized default site settings.');
  } else {
    settings.projectName = "Kadthal Venture";
    settings.brochurePdfUrl = '/assets/skandha_brochure.pdf';
    settings.flyerPdfUrl = '/assets/skandha_flyer.pdf';
    settings.seo = {
      title: "Skandha Group | DTCP & RERA Approved Open Plots in Kadthal",
      description: "Premium DTCP & RERA approved residential villa plots in Kadthal near Srisailam Highway & Maisigandi Temple by Skandha Group. 100% Vasthu compliant with 40' & 33' BT roads.",
      keywords: "open plots Kadthal, Skandha Group, DTCP approved plots, Srisailam Highway plots, Pharma City plots",
      ogImage: '/assets/hero_cover.jpg'
    };
    await settings.save();
    console.log('✓ Updated existing site settings to Kadthal Venture.');
  }

  // 3. Seed Gallery Items from brochure development photos
  console.log('Seeding development gallery items...');
  const defaultGallery = [
    { title: 'Grand Entrance Gate with Security Arch', category: 'infrastructure', imageUrl: '/assets/site_entrance_arch.jpg', caption: 'Secure gated entrance with fencing and security cabin', order: 1 },
    { title: 'Overhead Water Tank Facility', category: 'amenities', imageUrl: '/assets/site_overhead_tank.jpg', caption: 'Dedicated overhead storage tank for constant water supply', order: 2 },
    { title: 'Children Play Area & Activity Zone', category: 'amenities', imageUrl: '/assets/site_children_park.jpg', caption: 'Safe play zone with modern equipment for kids', order: 3 },
    { title: 'Wide B.T Roads with Avenue Plantation', category: 'infrastructure', imageUrl: '/assets/site_bt_roads.jpg', caption: '40ft & 33ft wide blacktop roads with curbing', order: 4 },
    { title: 'Landscaped Parks & Green Spaces', category: 'amenities', imageUrl: '/assets/site_landscape_park.jpg', caption: 'Ac. 0.758 cents reserved park space with lush greens', order: 5 },
    { title: 'Dedicated Jogging Track', category: 'amenities', imageUrl: '/assets/site_jogging_track.jpg', caption: 'Paved jogging track amidst fresh green trees', order: 6 },
    { title: 'Underground Drainage System', category: 'infrastructure', imageUrl: '/assets/site_drainage_system.jpg', caption: 'Engineered underground drainage infrastructure', order: 7 },
    { title: 'Avenue Plantation & Street Lights', category: 'infrastructure', imageUrl: '/assets/site_avenue_plantation.jpg', caption: 'Unique street lighting along avenue tree borders', order: 8 },
    { title: 'Site Aerial Development Progress', category: 'development', imageUrl: '/assets/site_aerial_view.jpg', caption: 'Aerial layout progress view at Kadthal', order: 9 }
  ];

  for (const item of defaultGallery) {
    await GalleryItem.findOneAndUpdate(
      { title: item.title },
      item,
      { upsert: true, new: true }
    );
  }
  console.log(`✓ Seeded ${defaultGallery.length} verified site development photos.`);

  // 4. Seed Default Admin
  console.log('Checking admin user...');
  const salt = await bcrypt.genSalt(12);
  const passwordHash = await bcrypt.hash('admin@123', salt);

  await AdminUser.findOneAndUpdate(
    { username: 'admin' },
    {
      username: 'admin',
      email: 'admin@skandhagroup.com',
      passwordHash,
      role: 'superadmin',
      isActive: true,
      mustChangePassword: false
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  console.log('✓ Admin account verified and active (admin / admin@123)');

  console.log('Database seeding completed successfully!');
  await mongoose.disconnect();
}

seedDatabase().catch(err => {
  console.error('Seeding error:', err);
  process.exit(1);
});
