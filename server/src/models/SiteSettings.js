import mongoose from 'mongoose';

const siteSettingsSchema = new mongoose.Schema({
  companyName: { type: String, default: 'Skandha Group' },
  projectName: { type: String, default: "Kadthal Venture" },
  projectLocation: { type: String, default: 'Kadthal, Srisailam Highway, Telangana' },
  officeAddress: {
    type: String,
    default: '# 8-7-91/17/1, 4th Floor Bata Building, Beside Naveena Hospital, Main Road, Hastinapuram, Hyderabad, Telangana -500079'
  },
  contactEmail: { type: String, default: 'contact@skandhagroup.com' },
  // Private backend destination for wa.me link generation (never exposed as raw text on marketing pages)
  whatsappNumber: { type: String, default: '919100031199' },
  dtcpNumber: { type: String, default: 'TLP NO. 87/2024/H' },
  reraNumber: { type: String, default: 'PO2400009081' },
  heroVideoUrl: { type: String, default: '' },
  heroPosterUrl: { type: String, default: '/assets/hero_cover.jpg' },
  brochurePdfUrl: { type: String, default: '/assets/skandha_brochure.pdf' },
  flyerPdfUrl: { type: String, default: '/assets/skandha_flyer.pdf' },
  socialLinks: {
    facebook: { type: String, default: '' },
    instagram: { type: String, default: 'https://www.instagram.com/_skandhagroups_/' },
    youtube: { type: String, default: 'https://www.youtube.com/@SkandhaGroups-hyd' }
  },
  publicClaimsApproved: { type: Boolean, default: true },
  seo: {
    title: { type: String, default: "Skandha Group | DTCP & RERA Approved Open Plots in Kadthal" },
    description: { type: String, default: "Premium DTCP & RERA approved residential villa plots in Kadthal near Srisailam Highway & Maisigandi Temple by Skandha Group. 100% Vasthu compliant with 40' & 33' BT roads." },
    keywords: { type: String, default: "open plots Kadthal, Skandha Group, DTCP approved plots, Srisailam Highway plots, Pharma City plots" },
    ogImage: { type: String, default: '/assets/hero_cover.jpg' }
  }
}, { timestamps: true });

export default mongoose.model('SiteSettings', siteSettingsSchema);
