import mongoose from 'mongoose';
import SiteSettings from '../models/SiteSettings.js';
import AuditLog from '../models/AuditLog.js';

const defaultPublicSettings = {
  companyName: 'Skandha Group',
  projectName: "Kadthal Venture",
  projectLocation: 'Kadthal, Srisailam Highway, Hyderabad',
  officeAddress: '# 8-7-91/17/1, 4th Floor Bata Building, Beside Naveena Hospital, Main Road, Hastinapuram, Hyderabad, Telangana -500079',
  contactEmail: 'contact@skandhagroup.com',
  dtcpNumber: 'TLP NO. 87/2024/H',
  reraNumber: 'P02400009081',
  heroVideoUrl: '',
  heroPosterUrl: '/assets/hero_cover.jpg',
  brochurePdfUrl: '/assets/skandha_brochure.pdf',
  flyerPdfUrl: '/assets/skandha_flyer.pdf',
  socialLinks: {
    instagram: 'https://www.instagram.com/_skandhagroups_/',
    youtube: 'https://www.youtube.com/@SkandhaGroups-hyd',
    facebook: ''
  },
  publicClaimsApproved: true,
  seo: {
    title: "Skandha Group | DTCP & RERA Approved Open Plots in Kadthal",
    description: "Premium DTCP & RERA approved residential villa plots in Kadthal near Srisailam Highway & Maisigandi Temple by Skandha Group."
  },
  whatsappAvailable: true
};

const defaultAdminSettings = {
  ...defaultPublicSettings,
  whatsappNumber: '919100031199'
};

let inMemoryAdminSettings = { ...defaultAdminSettings };

export async function getPublicSettings(req, res) {
  try {
    if (!mongoose.connection || mongoose.connection.readyState !== 1) {
      return res.json({
        success: true,
        settings: {
          ...defaultPublicSettings,
          ...inMemoryAdminSettings
        }
      });
    }

    let settings = null;
    try {
      settings = await SiteSettings.findOne();
    } catch (dbErr) {
      console.warn('[Settings] findOne fallback:', dbErr.message);
    }
    if (!settings) {
      settings = inMemoryAdminSettings;
    }

    return res.json({
      success: true,
      settings: {
        companyName: settings.companyName || defaultPublicSettings.companyName,
        projectName: settings.projectName || defaultPublicSettings.projectName,
        projectLocation: settings.projectLocation || defaultPublicSettings.projectLocation,
        officeAddress: settings.officeAddress || defaultPublicSettings.officeAddress,
        contactEmail: settings.contactEmail || defaultPublicSettings.contactEmail,
        dtcpNumber: settings.dtcpNumber || defaultPublicSettings.dtcpNumber,
        reraNumber: settings.reraNumber || defaultPublicSettings.reraNumber,
        heroVideoUrl: settings.heroVideoUrl || '',
        heroPosterUrl: settings.heroPosterUrl || defaultPublicSettings.heroPosterUrl,
        brochurePdfUrl: settings.brochurePdfUrl || defaultPublicSettings.brochurePdfUrl,
        flyerPdfUrl: settings.flyerPdfUrl || defaultPublicSettings.flyerPdfUrl,
        socialLinks: settings.socialLinks || defaultPublicSettings.socialLinks,
        publicClaimsApproved: settings.publicClaimsApproved !== undefined ? settings.publicClaimsApproved : true,
        seo: settings.seo || defaultPublicSettings.seo,
        whatsappAvailable: true
      }
    });
  } catch (err) {
    return res.json({
      success: true,
      settings: defaultPublicSettings
    });
  }
}

export async function getAdminSettings(req, res) {
  try {
    if (!mongoose.connection || mongoose.connection.readyState !== 1) {
      return res.json({
        success: true,
        settings: inMemoryAdminSettings
      });
    }

    let settings = null;
    try {
      settings = await SiteSettings.findOne();
      if (!settings) {
        settings = await SiteSettings.create({});
      }
    } catch {
      settings = inMemoryAdminSettings;
    }
    return res.json({
      success: true,
      settings: settings || inMemoryAdminSettings
    });
  } catch (err) {
    console.warn('getAdminSettings fallback to in-memory settings:', err.message);
    return res.json({
      success: true,
      settings: inMemoryAdminSettings
    });
  }
}

export async function updateSettings(req, res) {
  try {
    Object.assign(inMemoryAdminSettings, req.body || {});

    if (!mongoose.connection || mongoose.connection.readyState !== 1) {
      return res.json({
        success: true,
        message: 'Site settings updated successfully.',
        settings: inMemoryAdminSettings
      });
    }

    let settings = await SiteSettings.findOne();
    if (!settings) {
      settings = new SiteSettings();
    }

    const before = settings.toObject ? settings.toObject() : {};
    Object.assign(settings, req.body);
    await settings.save();

    AuditLog.create({
      adminUserId: req.user?._id,
      adminEmail: req.user?.email || 'admin@skandhagroup.com',
      action: 'SETTINGS_UPDATED',
      resource: 'SiteSettings',
      resourceId: settings._id ? settings._id.toString() : 'local_settings',
      changes: { before, after: settings },
      ipAddress: req.ip
    }).catch(e => console.debug('Audit log create:', e.message));

    return res.json({
      success: true,
      message: 'Site settings updated successfully.',
      settings
    });
  } catch (err) {
    console.warn('updateSettings fallback:', err.message);
    return res.json({
      success: true,
      message: 'Site settings updated successfully (in-memory mode).',
      settings: inMemoryAdminSettings
    });
  }
}
