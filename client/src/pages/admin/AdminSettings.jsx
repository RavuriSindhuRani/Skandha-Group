import React, { useState, useEffect } from 'react';
import { adminGetSettings, adminUpdateSettings } from '../../api/client';
import { Save, Check, AlertCircle, Shield, Globe, MessageSquare } from 'lucide-react';

const defaultSettings = {
  companyName: 'Skandha Group',
  projectName: "Kadthal Venture",
  projectLocation: 'Kadthal, Srisailam Highway, Hyderabad',
  officeAddress: '# 8-7-91/17/1, 4th Floor Bata Building, Beside Naveena Hospital, Main Road, Hastinapuram, Hyderabad, Telangana -500079',
  contactEmail: 'contact@skandhagroup.com',
  whatsappNumber: '919100031199',
  dtcpNumber: 'TLP NO. 87/2024/H',
  reraNumber: 'P02400009081',
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
    description: "Premium DTCP & RERA approved residential villa plots in Kadthal near Srisailam Highway & Maisigandi Temple by Skandha Group.",
    keywords: "open plots Kadthal, Skandha Group, DTCP approved plots, Srisailam Highway plots",
    ogImage: '/assets/hero_cover.jpg'
  }
};

export default function AdminSettings() {
  const [settings, setSettings] = useState(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    adminGetSettings()
      .then(res => {
        if (res && res.success && res.settings) {
          setSettings(prev => ({ ...prev, ...res.settings }));
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFeedback('');
    setError('');

    try {
      const res = await adminUpdateSettings(settings);
      if (res.success) {
        setFeedback('Settings and content updated successfully.');
        setTimeout(() => setFeedback(''), 3000);
      }
    } catch (err) {
      setError(err.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-400">Loading settings...</div>;
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-serif font-bold text-slate-900">
            Project Content & Settings
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure branding, official claims, private WhatsApp integration, and SEO metadata.
          </p>
        </div>
      </div>

      {feedback && (
        <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs rounded-xl flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>{feedback}</span>
        </div>
      )}

      {error && (
        <div className="p-3 bg-red-50 text-red-800 border border-red-200 text-xs rounded-xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-600" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Brand & Project */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="font-bold text-base text-slate-900 border-b border-slate-100 pb-2">
            Brand & Project Identity
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Company Name</label>
              <input
                type="text"
                value={settings.companyName}
                onChange={(e) => setSettings({ ...settings, companyName: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Project Name</label>
              <input
                type="text"
                value={settings.projectName}
                onChange={(e) => setSettings({ ...settings, projectName: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">DTCP Approval Permit</label>
              <input
                type="text"
                value={settings.dtcpNumber}
                onChange={(e) => setSettings({ ...settings, dtcpNumber: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none font-mono"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">TS RERA Registration</label>
              <input
                type="text"
                value={settings.reraNumber}
                onChange={(e) => setSettings({ ...settings, reraNumber: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none font-mono"
              />
            </div>
          </div>

          <div className="text-xs">
            <label className="block font-bold text-slate-700 mb-1">Registered Corporate Office Address</label>
            <input
              type="text"
              value={settings.officeAddress}
              onChange={(e) => setSettings({ ...settings, officeAddress: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none"
            />
          </div>
        </div>

        {/* Private WhatsApp & Communication Settings */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="border-b border-slate-100 pb-2">
            <h3 className="font-bold text-base text-slate-900">
              Communication & Private WhatsApp Channel
            </h3>
            <p className="text-xs text-slate-500">
              As required by brand guidelines, phone numbers are never displayed in marketing page text. The WhatsApp number below is used securely by the backend to build <code>wa.me</code> inquiry handoffs.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Public Inquiries Email</label>
              <input
                type="email"
                value={settings.contactEmail}
                onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Private WhatsApp Number (with Country Code)
              </label>
              <input
                type="text"
                placeholder="e.g. 919876543210"
                value={settings.whatsappNumber}
                onChange={(e) => setSettings({ ...settings, whatsappNumber: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none font-mono"
              />
            </div>
          </div>
        </div>

        {/* Official Social Media Channels */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="border-b border-slate-100 pb-2">
            <h3 className="font-bold text-base text-slate-900">
              Official Social Media Channels
            </h3>
            <p className="text-xs text-slate-500">
              Configured channels appear automatically in the website footer. Leave empty to hide.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Instagram Channel URL</label>
              <input
                type="text"
                placeholder="https://www.instagram.com/_skandhagroups_/"
                value={settings.socialLinks?.instagram ?? ''}
                onChange={(e) => setSettings({
                  ...settings,
                  socialLinks: { ...(settings.socialLinks || {}), instagram: e.target.value }
                })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">YouTube Channel URL</label>
              <input
                type="text"
                placeholder="https://www.youtube.com/@SkandhaGroups-hyd"
                value={settings.socialLinks?.youtube ?? ''}
                onChange={(e) => setSettings({
                  ...settings,
                  socialLinks: { ...(settings.socialLinks || {}), youtube: e.target.value }
                })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Facebook Page URL (Optional)</label>
              <input
                type="text"
                placeholder="https://facebook.com/..."
                value={settings.socialLinks?.facebook ?? ''}
                onChange={(e) => setSettings({
                  ...settings,
                  socialLinks: { ...(settings.socialLinks || {}), facebook: e.target.value }
                })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">Leave blank until ready; shows in footer when filled.</span>
            </div>
          </div>
        </div>

        {/* Media & Video Hero */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="font-bold text-base text-slate-900 border-b border-slate-100 pb-2">
            Media & Hero Background Video
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Hero Background Video URL (Muted / MP4)
              </label>
              <input
                type="text"
                placeholder="https://... or empty for poster fallback"
                value={settings.heroVideoUrl || ''}
                onChange={(e) => setSettings({ ...settings, heroVideoUrl: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Hero Poster Fallback Image</label>
              <input
                type="text"
                value={settings.heroPosterUrl}
                onChange={(e) => setSettings({ ...settings, heroPosterUrl: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none font-mono"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <input
              type="checkbox"
              id="claimsCheck"
              checked={settings.publicClaimsApproved}
              onChange={(e) => setSettings({ ...settings, publicClaimsApproved: e.target.checked })}
              className="rounded text-brand-orange"
            />
            <label htmlFor="claimsCheck" className="text-xs font-bold text-slate-700">
              Admin Approved: Publish verified location claims (Maisigandi Temple, Future City, Pharma Belt)
            </label>
          </div>
        </div>

        {/* SEO Configuration */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="font-bold text-base text-slate-900 border-b border-slate-100 pb-2">
            SEO & Social Metadata
          </h3>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Meta Page Title</label>
              <input
                type="text"
                value={settings.seo?.title || ''}
                onChange={(e) => setSettings({ ...settings, seo: { ...settings.seo, title: e.target.value } })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Meta Description</label>
              <textarea
                rows="2"
                value={settings.seo?.description || ''}
                onChange={(e) => setSettings({ ...settings, seo: { ...settings.seo, description: e.target.value } })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none resize-none"
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 bg-brand-orange hover:bg-brand-orange-dark text-white font-bold py-3 px-8 rounded-xl text-sm shadow transition-all disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save Site Settings'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
