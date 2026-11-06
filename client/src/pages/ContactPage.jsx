import React, { useState } from 'react';
import {
  Mail,
  Building,
  Clock,
  Send,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  MessageCircle
} from 'lucide-react';
import { submitLead, trackActivityEvent } from '../api/client';

export default function ContactPage({ settings }) {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    project: 'Brundavanam DTCP Open Plots (Kadthal, Sri Sailam Highway near Future City & Sagar Highway)',
    subject: '',
    message: ''
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null); // 'success' | 'error' | null
  const [statusMessage, setStatusMessage] = useState('');
  const [whatsappUrl, setWhatsappUrl] = useState('');

  const email = (settings && settings.contactEmail) || 'contact@skandhagroup.com';
  const officeAddress = (settings && settings.officeAddress) || '# 8-7-91/17/1, 4th Floor Bata Building, Beside Naveena Hospital, Main Road, Hastinapuram, Hyderabad, Telangana - 500079';

  const validate = () => {
    const errs = {};
    if (!formData.fullName.trim() || formData.fullName.trim().length < 2) {
      errs.fullName = 'Please enter your full name (at least 2 characters).';
    }
    if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errs.email = 'Please provide a valid email address.';
    }
    if (!formData.subject.trim()) {
      errs.subject = 'Please enter an inquiry subject.';
    }
    if (!formData.message.trim() || formData.message.trim().length < 10) {
      errs.message = 'Please write a brief message (minimum 10 characters).';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setStatus(null);

    try {
      const res = await submitLead({
        name: formData.fullName,
        email: formData.email,
        message: `[${formData.project} - ${formData.subject}] ${formData.message}`,
        preferredContactMethod: 'email',
        consent: true
      });

      if (res.success) {
        setStatus('success');
        setStatusMessage('Thank you for reaching out! Your inquiry has been routed to our corporate advisory team. We will review your requirements and respond shortly.');
        trackActivityEvent('enquiry_submitted', null, {
          source: 'contact_page',
          customerName: formData.fullName,
          customerEmail: formData.email
        });
        if (res.whatsappUrl) {
          setWhatsappUrl(res.whatsappUrl);
        }
        setFormData({
          fullName: '',
          email: '',
          project: 'Brundavanam DTCP Open Plots (Kadthal, Sri Sailam Highway near Future City & Sagar Highway)',
          subject: '',
          message: ''
        });
      } else {
        setStatus('error');
        setStatusMessage(res.error || 'Failed to submit inquiry. Please try again or email us directly.');
      }
    } catch (err) {
      setStatus('error');
      setStatusMessage(err.message || 'Error transmitting your message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white">
      {/* ========================================================== */}
      {/* 1. TOP HERO HEADER (MATCHING skanda-groups.vercel.app)     */}
      {/* ========================================================== */}
      <section className="bg-gradient-to-b from-[#FFF5EC] to-white py-16 lg:py-20 border-b border-[#E5E7EB]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[#F58220]/30 text-xs font-bold text-[#F58220] uppercase tracking-wider mb-4 shadow-xs">
            <Mail className="w-4 h-4 text-[#F58220]" />
            <span>Direct Client Services &amp; Corporate Desk</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-extrabold text-[#202124] tracking-tight leading-tight font-serif">
            Connect with Skandha Groups
          </h1>

          <p className="text-base sm:text-lg text-[#6B7280] mt-4 leading-relaxed font-light">
            Have questions regarding our developments, statutory standards, or corporate consultations? Our advisory team is ready to assist you.
          </p>
        </div>
      </section>

      {/* ========================================================== */}
      {/* 2. MAIN CONTENT GRID (OFFICE DETAILS + INQUIRY FORM)       */}
      {/* ========================================================== */}
      <section className="py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Left Column: Office Details */}
            <div className="lg:col-span-5 space-y-6 text-left">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#F58220]">
                  Get In Touch
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-[#202124] mt-1 font-serif">
                  Visit Our Corporate Office
                </h2>
                <p className="text-sm text-[#6B7280] mt-2 leading-relaxed">
                  We welcome buyers and channel partners to our Hastinapuram headquarters for personalized consultations.
                </p>
              </div>

              {/* Card 1: Registered Office */}
              <div className="p-6 rounded-2xl bg-white border border-[#E5E7EB] shadow-xs hover:border-[#F58220] transition-colors">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[#FFF5EC] text-[#F58220] flex items-center justify-center shrink-0">
                    <Building className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold uppercase text-[#202124] tracking-wider">
                      Registered Office
                    </h3>
                    <address className="not-italic text-sm text-[#6B7280] mt-1.5 leading-relaxed">
                      # 8-7-91/17/1, 4th Floor Bata Building,<br />
                      Beside Naveena Hospital, Main Road,<br />
                      Hastinapuram, Hyderabad, Telangana - 500079
                    </address>
                  </div>
                </div>
              </div>

              {/* Card 2: Email Inquiries */}
              <div className="p-6 rounded-2xl bg-white border border-[#E5E7EB] shadow-xs hover:border-[#F58220] transition-colors">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[#FFF5EC] text-[#F58220] flex items-center justify-center shrink-0">
                    <Mail className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold uppercase text-[#202124] tracking-wider">
                      Email Inquiries
                    </h3>
                    <p className="text-xs text-[#6B7280] mt-1">
                      For corporate proposals, partnerships, and legal queries:
                    </p>
                    <a
                      href={`mailto:${email}`}
                      className="inline-block mt-2 text-sm font-bold text-[#F58220] hover:underline"
                    >
                      {email}
                    </a>
                  </div>
                </div>
              </div>

              {/* Card 3: Corporate Office Hours */}
              <div className="p-6 rounded-2xl bg-[#F7F7F7] border border-[#E5E7EB]">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-gray-200 text-[#202124] flex items-center justify-center shrink-0">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold uppercase text-[#202124] tracking-wider">
                      Corporate Office Hours
                    </h3>
                    <p className="text-xs text-[#6B7280] mt-1 leading-relaxed">
                      Monday &ndash; Sunday: 9:30 AM to 6:30 PM (Site Visits 7 Days a Week)
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Inquiry Form */}
            <div className="lg:col-span-7">
              <div className="bg-white rounded-3xl border border-[#E5E7EB] p-6 sm:p-10 shadow-lg">
                <div className="mb-8">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#F58220]">
                    Schedule a Consultation
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-[#202124] mt-1 font-serif">
                    Send Us an Inquiry
                  </h3>
                  <p className="text-sm text-[#6B7280] mt-2">
                    Fill out the form below to receive personalized property consultation or speak with our corporate advisory team.
                  </p>
                </div>

                {/* Success Alert */}
                {status === 'success' && (
                  <div className="mb-8 p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-start gap-3">
                    <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
                    <div className="text-xs sm:text-sm">
                      <h4 className="font-bold text-emerald-950">Inquiry Received</h4>
                      <p className="mt-1 leading-relaxed">{statusMessage}</p>
                      {whatsappUrl && (
                        <a
                          href={whatsappUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-3 inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#1EBE5D] text-white font-bold text-xs px-4 py-2 rounded-lg transition-all shadow-sm"
                        >
                          <MessageCircle className="w-4 h-4" />
                          <span>Chat on WhatsApp Directly</span>
                        </a>
                      )}
                    </div>
                  </div>
                )}

                {/* Error Alert */}
                {status === 'error' && (
                  <div className="mb-8 p-5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 flex items-start gap-3">
                    <AlertCircle className="w-6 h-6 text-rose-600 shrink-0 mt-0.5" />
                    <div className="text-xs sm:text-sm">
                      <h4 className="font-bold text-rose-950">Submission Error</h4>
                      <p className="mt-1 leading-relaxed">{statusMessage}</p>
                    </div>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Full Name */}
                  <div>
                    <label htmlFor="fullName" className="block text-xs font-bold uppercase tracking-wider text-[#202124] mb-1.5">
                      Full Name <span className="text-[#F58220]">*</span>
                    </label>
                    <input
                      type="text"
                      id="fullName"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      placeholder="e.g. Ramesh Reddy"
                      className={`w-full px-4 py-3 rounded-xl border text-base sm:text-sm transition-colors outline-none ${
                        errors.fullName ? 'border-red-400 bg-red-50/30 focus:border-red-500' : 'border-[#E5E7EB] bg-white focus:border-[#F58220]'
                      }`}
                      disabled={loading}
                    />
                    {errors.fullName && (
                      <p className="mt-1 text-xs text-red-600">{errors.fullName}</p>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label htmlFor="email" className="block text-xs font-bold uppercase tracking-wider text-[#202124] mb-1.5">
                      Email Address <span className="text-[#F58220]">*</span>
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="e.g. ramesh@example.com"
                      className={`w-full px-4 py-3 rounded-xl border text-base sm:text-sm transition-colors outline-none ${
                        errors.email ? 'border-red-400 bg-red-50/30 focus:border-red-500' : 'border-[#E5E7EB] bg-white focus:border-[#F58220]'
                      }`}
                      disabled={loading}
                    />
                    {errors.email && (
                      <p className="mt-1 text-xs text-red-600">{errors.email}</p>
                    )}
                  </div>

                  {/* Project of Interest */}
                  <div>
                    <label htmlFor="project" className="block text-xs font-bold uppercase tracking-wider text-[#202124] mb-1.5">
                      Project of Interest
                    </label>
                    <select
                      id="project"
                      name="project"
                      value={formData.project}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl border border-[#E5E7EB] bg-white text-base sm:text-sm focus:border-[#F58220] transition-colors outline-none"
                      disabled={loading}
                    >
                      <option value="Brundavanam DTCP Open Plots (Kadthal, Sri Sailam Highway near Future City & Sagar Highway)">
                        Brundavanam DTCP Open Plots (Kadthal, Sri Sailam Highway near Future City &amp; Sagar Highway)
                      </option>
                      <option value="General Corporate Consultation">
                        General Corporate Consultation
                      </option>
                      <option value="Partnership & Land Advisory">
                        Partnership &amp; Land Advisory
                      </option>
                    </select>
                  </div>

                  {/* Subject */}
                  <div>
                    <label htmlFor="subject" className="block text-xs font-bold uppercase tracking-wider text-[#202124] mb-1.5">
                      Subject <span className="text-[#F58220]">*</span>
                    </label>
                    <input
                      type="text"
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      placeholder="e.g. Plot Availability &amp; Free Site Visit Transport"
                      className={`w-full px-4 py-3 rounded-xl border text-base sm:text-sm transition-colors outline-none ${
                        errors.subject ? 'border-red-400 bg-red-50/30 focus:border-red-500' : 'border-[#E5E7EB] bg-white focus:border-[#F58220]'
                      }`}
                      disabled={loading}
                    />
                    {errors.subject && (
                      <p className="mt-1 text-xs text-red-600">{errors.subject}</p>
                    )}
                  </div>

                  {/* Message */}
                  <div>
                    <label htmlFor="message" className="block text-xs font-bold uppercase tracking-wider text-[#202124] mb-1.5">
                      Message <span className="text-[#F58220]">*</span>
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      rows={4}
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Please mention your preferred plot size (Sq. Yds), orientation (East/West/Corner), or preferred date for a guided site visit..."
                      className={`w-full px-4 py-3 rounded-xl border text-base sm:text-sm transition-colors outline-none ${
                        errors.message ? 'border-red-400 bg-red-50/30 focus:border-red-500' : 'border-[#E5E7EB] bg-white focus:border-[#F58220]'
                      }`}
                      disabled={loading}
                    />
                    {errors.message && (
                      <p className="mt-1 text-xs text-red-600">{errors.message}</p>
                    )}
                  </div>

                  {/* Submit Button */}
                  <div>
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-xl font-bold text-white bg-[#F58220] hover:bg-[#E07016] shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-60 cursor-pointer"
                    >
                      {loading ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Processing Inquiry...</span>
                        </>
                      ) : (
                        <>
                          <span>Submit Inquiry</span>
                          <Send className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================== */}
      {/* 3. CORPORATE OFFICE LOCATION MAP (MATCHING VERCEL SITE)    */}
      {/* ========================================================== */}
      <section className="pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl overflow-hidden border border-[#E5E7EB] shadow-md bg-gray-100">
            <div className="p-6 bg-white border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h3 className="text-lg font-bold text-[#202124]">
                  Corporate Office Location Map
                </h3>
                <p className="text-xs text-[#6B7280] mt-0.5">
                  Bata Building, Beside Naveena Hospital, Main Road, Hastinapuram, Hyderabad
                </p>
              </div>

              <a
                href="https://maps.google.com/?q=Hastinapuram,Hyderabad,Telangana"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-bold text-[#F58220] hover:underline inline-flex items-center gap-1"
              >
                <span>Open in Google Maps</span>
                <span>&rarr;</span>
              </a>
            </div>

            <div className="aspect-[21/9] sm:aspect-[21/7] w-full min-h-[360px]">
              <iframe
                title="Skandha Groups Office Location"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3809.112999464619!2d78.5362947!3d17.3421251!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bcba23a6338bdfb%3A0x6b10070bc0e914df!2sHastinapuram%2C%20Hyderabad%2C%20Telangana!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
