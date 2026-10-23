/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useId } from "react";
import { 
  Scale, 
  Phone, 
  MessageSquare, 
  Calendar, 
  MapPin, 
  CheckCircle2, 
  AlertCircle, 
  Menu, 
  X, 
  ExternalLink, 
  Lock,
  Copy,
  Check,
  Send
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
// @ts-ignore
import arunabhPortrait from "./assets/images/Arunabh_Banerjee.jpeg";
import AdminPanel from "./components/AdminPanel";
import { cmsService } from "./services/cmsService";
import { LeadItem } from "./types/cms";

export default function App() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);

  // Form State: Manual case subject entry, no time slots
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    caseSubject: "",
    date: "",
    description: ""
  });

  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState<LeadItem | null>(null);
  const [copiedRef, setCopiedRef] = useState(false);

  // Unique IDs for form accessibility
  const nameInputId = useId();
  const phoneInputId = useId();
  const caseSubjectInputId = useId();
  const dateInputId = useId();
  const descriptionTextareaId = useId();

  // Get minimum date (today) in YYYY-MM-DD
  const todayISO = new Date().toISOString().split("T")[0];

  // Initialize tracking & check if user opened /admin or #admin
  useEffect(() => {
    // Track visitor on mount
    cmsService.trackVisit(window.location.pathname || "/");

    // Check URL for direct /admin access
    const checkAdminRoute = () => {
      const path = window.location.pathname.toLowerCase();
      const hash = window.location.hash.toLowerCase();
      const search = window.location.search.toLowerCase();

      if (path.includes("/admin") || hash === "#admin" || search.includes("admin")) {
        setShowAdminPanel(true);
      }
    };

    checkAdminRoute();
    window.addEventListener("hashchange", checkAdminRoute);
    window.addEventListener("popstate", checkAdminRoute);

    // Initialize default appointment date to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split("T")[0];
    setFormData(prev => ({
      ...prev,
      date: prev.date || tomorrowStr
    }));

    // Keyboard shortcut for chamber portal: Ctrl + Shift + A
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === "A" || e.key === "a")) {
        e.preventDefault();
        setShowAdminPanel(prev => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("hashchange", checkAdminRoute);
      window.removeEventListener("popstate", checkAdminRoute);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (formError) setFormError("");
  };

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    // Required Field Validations
    if (!formData.name.trim() || formData.name.trim().length < 2) {
      setFormError("Please enter your full name.");
      return;
    }

    const cleanPhone = formData.phone.trim().replace(/\D/g, "");
    if (!cleanPhone || cleanPhone.length < 10) {
      setFormError("Please provide a valid contact number (at least 10 digits with country code).");
      return;
    }

    if (!formData.caseSubject.trim() || formData.caseSubject.trim().length < 2) {
      setFormError("Please enter the case matter or subject you wish to consult on (e.g. Criminal Bail, Divorce, Cheque Bounce, etc.).");
      return;
    }

    if (!formData.date) {
      setFormError("Please select an appointment date.");
      return;
    }

    if (formData.date < todayISO) {
      setFormError("Appointment date cannot be in the past.");
      return;
    }

    setIsSubmitting(true);

    try {
      // Save persistently via cmsService (stores in localStorage and Firestore if enabled)
      const savedLead = await cmsService.addLead({
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        caseType: formData.caseSubject.trim(),
        date: formData.date,
        message: formData.description.trim(),
        isUrgent: false
      });

      // Track booking conversion click in visitor analytics
      cmsService.trackClick("booking");

      setConfirmedBooking(savedLead);

      // Reset form fields
      setFormData({
        name: "",
        phone: "",
        caseSubject: "",
        date: formData.date,
        description: ""
      });
    } catch (err) {
      console.error("Booking error:", err);
      setFormError("Unable to record booking right now. Please call or WhatsApp chamber directly.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyReferenceNumber = (refId: string) => {
    navigator.clipboard.writeText(refId);
    setCopiedRef(true);
    setTimeout(() => setCopiedRef(false), 2500);
  };

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-[#07080c] text-gray-200 font-sans selection:bg-[#d4af37] selection:text-black antialiased relative">
      
      {/* Ambient regal gold lighting gradient */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[450px] bg-gradient-to-b from-[#d4af37]/8 via-transparent to-transparent pointer-events-none blur-[140px] z-0" />

      {/* =========================================================================
          1. HEADER (Home, Contact, Book Appointment)
      ========================================================================= */}
      <header className="sticky top-0 z-40 bg-[#07080c]/90 backdrop-blur-md border-b border-[#d4af37]/25 transition-all duration-300">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between relative z-10">
          
          {/* Advocate Branding */}
          <a 
            href="#home" 
            onClick={(e) => { e.preventDefault(); scrollToSection("home"); }}
            className="flex flex-col group focus:outline-none"
          >
            <span className="font-serif text-lg sm:text-xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-[#f5d77f] via-[#d4af37] to-[#997a2e] group-hover:brightness-110 transition-all">
              Advocate Arunabh Banerjee
            </span>
            <span className="text-[10px] sm:text-[11px] uppercase tracking-[0.22em] text-[#d4af37]/85 font-medium font-sans">
              Supreme Court Advocate
            </span>
          </a>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <button
              onClick={() => scrollToSection("home")}
              className="text-xs uppercase tracking-widest text-gray-300 hover:text-[#d4af37] transition-colors focus:outline-none font-medium"
            >
              Home
            </button>

            {/* Prominent CTA */}
            <button
              onClick={() => scrollToSection("booking")}
              className="bg-gradient-to-r from-[#b28d2f] via-[#d4af37] to-[#b28d2f] text-black font-semibold text-xs tracking-wider uppercase px-5 py-2.5 rounded-xs shadow-[0_0_15px_rgba(212,175,55,0.25)] hover:shadow-[0_0_22px_rgba(212,175,55,0.45)] hover:brightness-110 active:scale-[0.98] transition-all flex items-center gap-2 cursor-pointer"
            >
              <Calendar className="w-3.5 h-3.5" />
              Book Appointment
            </button>
          </nav>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-3">
            <button
              onClick={() => scrollToSection("booking")}
              className="bg-gradient-to-r from-[#b28d2f] via-[#d4af37] to-[#b28d2f] text-black font-semibold text-[11px] tracking-wider uppercase px-3.5 py-2 rounded-xs"
            >
              Book
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-gray-300 hover:text-[#d4af37] border border-[#d4af37]/35 rounded-xs focus:outline-none"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5 text-[#d4af37]" /> : <Menu className="w-5 h-5 text-[#d4af37]" />}
            </button>
          </div>

        </div>

        {/* Mobile Dropdown Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden bg-[#0c0e15] border-b border-[#d4af37]/25 px-6 py-5 space-y-4"
            >
              <button
                onClick={() => scrollToSection("home")}
                className="block w-full text-left text-sm uppercase tracking-wider text-gray-300 hover:text-[#d4af37] py-2.5 border-b border-gray-800"
              >
                Home
              </button>
              <button
                onClick={() => scrollToSection("booking")}
                className="w-full bg-gradient-to-r from-[#b28d2f] via-[#d4af37] to-[#b28d2f] text-black font-bold text-xs tracking-wider uppercase py-3 rounded-xs flex items-center justify-center gap-2 mt-2"
              >
                <Calendar className="w-4 h-4" />
                Book Appointment
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* =========================================================================
          2. HERO SECTION
      ========================================================================= */}
      <section id="home" className="relative pt-10 pb-16 md:pt-16 md:pb-20 overflow-hidden border-b border-[#d4af37]/15">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            
            {/* Left Content (desktop) / Stacked (mobile) */}
            <div className="lg:col-span-7 space-y-6 text-left">
              
              {/* Judicial Jurisdiction Ribbon */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[#d4af37]/35 bg-[#121520]/80">
                <Scale className="w-3.5 h-3.5 text-[#d4af37]" />
                <span className="text-[11px] font-medium tracking-widest uppercase text-[#d4af37]">
                  Supreme Court of India &amp; Delhi High Court
                </span>
              </div>

              {/* Name & Title */}
              <div className="space-y-1.5">
                <span className="text-xs sm:text-sm uppercase tracking-[0.25em] text-gray-400 font-semibold block">
                  Senior Counsel
                </span>
                <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-medium tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-[#f5d77f] via-[#d4af37] to-[#997a2e] leading-[1.1]">
                  Arunabh Banerjee
                </h1>
                <p className="text-base sm:text-lg text-[#d4af37] font-serif tracking-wide pt-1">
                  Supreme Court Advocate
                </p>
              </div>

              {/* Short Description */}
              <p className="text-sm sm:text-base text-gray-300 leading-relaxed max-w-xl">
                Legal consultation and representation across criminal, matrimonial, commercial, constitutional, and human rights matters.
              </p>

              {/* Prominent Direct Phone */}
              <div className="flex items-center gap-3 pt-1">
                <div className="w-9 h-9 rounded-full bg-[#141724] border border-[#d4af37]/45 flex items-center justify-center text-[#d4af37] shadow-[0_0_12px_rgba(212,175,55,0.2)]">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-gray-400 block font-mono">
                    Direct Chamber Helpline
                  </span>
                  <a 
                    href="tel:+919810703335" 
                    onClick={() => cmsService.trackClick("call")}
                    className="text-base sm:text-lg font-mono font-bold text-white hover:text-[#d4af37] transition-colors"
                  >
                    +91 98107 03335
                  </a>
                </div>
              </div>

              {/* Three Main Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 sm:gap-4 pt-3">
                
                {/* 1. Call Now */}
                <a
                  href="tel:+919810703335"
                  onClick={() => cmsService.trackClick("call")}
                  className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xs border border-[#d4af37]/65 text-[#f5d77f] hover:bg-[#d4af37]/10 text-xs uppercase tracking-wider font-semibold active:scale-[0.98] transition-all cursor-pointer"
                >
                  <Phone className="w-3.5 h-3.5 text-[#d4af37]" />
                  Call Now
                </a>

                {/* 2. WhatsApp */}
                <a
                  href="https://wa.me/919810703335"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => cmsService.trackClick("whatsapp")}
                  className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xs border border-emerald-500/50 bg-emerald-950/20 text-emerald-400 hover:bg-emerald-900/30 text-xs uppercase tracking-wider font-semibold active:scale-[0.98] transition-all shadow-[0_0_15px_rgba(16,185,129,0.12)] cursor-pointer"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                  WhatsApp
                </a>

                {/* 3. Book Appointment */}
                <button
                  onClick={() => scrollToSection("booking")}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xs bg-gradient-to-r from-[#b28d2f] via-[#d4af37] to-[#b28d2f] text-black font-bold text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(212,175,55,0.3)] hover:brightness-110 active:scale-[0.98] transition-all cursor-pointer"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  Book Appointment
                </button>

              </div>

            </div>

            {/* Right Advocate Portrait (desktop) / Stacked (mobile) */}
            <div className="lg:col-span-5 flex justify-center lg:justify-end">
              <div className="relative max-w-xs sm:max-w-sm w-full group">
                
                {/* Double Gold Framing & Glow */}
                <div className="absolute -inset-1 bg-gradient-to-b from-[#d4af37]/45 via-[#b28d2f]/20 to-transparent rounded-xs blur-[2px] group-hover:from-[#d4af37]/70 transition-all duration-500" />
                
                <div className="relative border border-[#d4af37]/50 bg-[#0f121a] p-2.5 rounded-xs shadow-2xl">
                  
                  {/* Decorative Classical Corner Accents */}
                  <div className="absolute top-1 left-1 w-3 h-3 border-t border-l border-[#d4af37]" />
                  <div className="absolute top-1 right-1 w-3 h-3 border-t border-r border-[#d4af37]" />
                  <div className="absolute bottom-1 left-1 w-3 h-3 border-b border-l border-[#d4af37]" />
                  <div className="absolute bottom-1 right-1 w-3 h-3 border-b border-r border-[#d4af37]" />

                  {/* Real Portrait */}
                  <img
                    src={arunabhPortrait}
                    alt="Advocate Arunabh Banerjee, Supreme Court of India Advocate"
                    className="w-full aspect-[4/5] object-cover rounded-xs filter contrast-[1.05] brightness-[0.98]"
                    loading="eager"
                  />

                  {/* Caption Banner */}
                  <div className="mt-3 pt-2.5 border-t border-[#d4af37]/25 text-center">
                    <p className="font-serif text-xs font-semibold text-[#d4af37] tracking-wider uppercase">
                      Advocate Arunabh Banerjee
                    </p>
                    <p className="text-[10px] text-gray-400 tracking-widest uppercase font-mono mt-0.5">
                      Chambers • Supreme Court of India
                    </p>
                  </div>

                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* =========================================================================
          3. APPOINTMENT BOOKING (Manual case matter entry, no time slots)
      ========================================================================= */}
      <section id="booking" className="py-16 md:py-20 border-b border-[#d4af37]/15 relative bg-[#0a0c12]">
        
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          {/* Section Heading */}
          <div className="text-center space-y-2 mb-10">
            <span className="text-[11px] font-mono uppercase tracking-[0.25em] text-[#d4af37] font-semibold inline-flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-[#d4af37]" />
              Direct Chamber Access
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-medium text-white tracking-tight">
              Book Legal Consultation
            </h2>
            <p className="text-xs sm:text-sm text-gray-400 max-w-lg mx-auto">
              Please enter your contact details and specify the subject matter you wish to discuss with Advocate Arunabh Banerjee.
            </p>
          </div>

          {/* Booking Container */}
          <div className="bg-[#10131c] border border-[#d4af37]/40 rounded-xs p-6 sm:p-9 shadow-[0_10px_40px_rgba(0,0,0,0.6)]">
            
            {/* Case: Booking Confirmed Card */}
            {confirmedBooking ? (
              <div className="text-center py-6 space-y-6">
                
                <div className="w-16 h-16 rounded-full bg-emerald-950/40 border border-emerald-500/50 flex items-center justify-center mx-auto text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                  <CheckCircle2 className="w-9 h-9" />
                </div>

                <div className="space-y-1.5">
                  <span className="text-xs font-mono uppercase tracking-widest text-emerald-400 font-semibold">
                    Consultation Request Successfully Queued
                  </span>
                  <h3 className="font-serif text-2xl sm:text-3xl text-white font-medium">
                    Booking Confirmed
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-400 max-w-md mx-auto">
                    Your briefing request has been securely recorded in the chamber calendar. The clerk will reach out to confirm your briefing.
                  </p>
                </div>

                {/* Details Summary Card */}
                <div className="max-w-md mx-auto bg-[#151926] border border-[#d4af37]/35 rounded-xs p-5 text-left space-y-3 font-mono text-xs">
                  
                  <div className="flex items-center justify-between pb-2 border-b border-gray-800">
                    <span className="text-gray-400 uppercase text-[10px]">Reference Number</span>
                    <button
                      onClick={() => copyReferenceNumber(confirmedBooking.id)}
                      className="inline-flex items-center gap-1.5 text-[#d4af37] hover:underline font-bold"
                    >
                      {confirmedBooking.id}
                      {copiedRef ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Client Name:</span>
                    <span className="text-white font-semibold">{confirmedBooking.name}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Contact:</span>
                    <span className="text-white">{confirmedBooking.phone}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Consultation Subject:</span>
                    <span className="text-[#d4af37] font-semibold">{confirmedBooking.caseType}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Preferred Date:</span>
                    <span className="text-white">{confirmedBooking.date}</span>
                  </div>

                </div>

                {/* Follow-up Buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2 max-w-md mx-auto">
                  
                  <a
                    href={`https://wa.me/919810703335?text=${encodeURIComponent(
                      `Hello Advocate Arunabh Banerjee, I have scheduled a consultation on arunabhbanerjee.com.\n\nBooking ID: ${confirmedBooking.id}\nName: ${confirmedBooking.name}\nPreferred Date: ${confirmedBooking.date}\nSubject Matter: ${confirmedBooking.caseType}`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => cmsService.trackClick("whatsapp")}
                    className="w-full sm:w-auto flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xs border border-emerald-500/50 bg-emerald-950/30 text-emerald-300 hover:bg-emerald-900/40 text-xs uppercase tracking-wider font-semibold transition-all cursor-pointer"
                  >
                    <MessageSquare className="w-4 h-4 text-emerald-400" />
                    Notify via WhatsApp
                  </a>

                  <button
                    onClick={() => setConfirmedBooking(null)}
                    className="w-full sm:w-auto px-5 py-3 rounded-xs border border-[#d4af37]/40 text-gray-300 hover:text-white hover:bg-[#d4af37]/10 text-xs uppercase tracking-wider font-semibold transition-all cursor-pointer"
                  >
                    Book Another
                  </button>

                </div>

              </div>
            ) : (
              /* Case: Booking Form */
              <form onSubmit={handleBookingSubmit} className="space-y-5">
                
                {/* Error Banner */}
                {formError && (
                  <div className="p-3.5 bg-red-950/40 border border-red-500/50 rounded-xs text-red-300 text-xs flex items-start gap-2.5">
                    <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                    <span>{formError}</span>
                  </div>
                )}

                {/* Row 1: Full Name & Phone Number */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  
                  {/* Full Name */}
                  <div className="space-y-1.5">
                    <label htmlFor={nameInputId} className="block text-xs uppercase tracking-wider text-gray-300 font-medium">
                      Full Name <span className="text-[#d4af37]">*</span>
                    </label>
                    <input
                      id={nameInputId}
                      type="text"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="e.g. Rajesh Sharma"
                      className="w-full bg-[#151926] border border-gray-700/80 focus:border-[#d4af37] rounded-xs px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none transition-colors"
                    />
                  </div>

                  {/* Phone Number with country code */}
                  <div className="space-y-1.5">
                    <label htmlFor={phoneInputId} className="block text-xs uppercase tracking-wider text-gray-300 font-medium">
                      Phone Number with Country Code <span className="text-[#d4af37]">*</span>
                    </label>
                    <input
                      id={phoneInputId}
                      type="tel"
                      name="phone"
                      required
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="e.g. +91 98123 45678"
                      className="w-full bg-[#151926] border border-gray-700/80 focus:border-[#d4af37] rounded-xs px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none transition-colors"
                    />
                  </div>

                </div>

                {/* Row 2: Manual Subject Matter & Preferred Date */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  
                  {/* Subject Matter (Manually typed) */}
                  <div className="space-y-1.5">
                    <label htmlFor={caseSubjectInputId} className="block text-xs uppercase tracking-wider text-gray-300 font-medium">
                      Subject / Matter for Consultation <span className="text-[#d4af37]">*</span>
                    </label>
                    <input
                      id={caseSubjectInputId}
                      type="text"
                      name="caseSubject"
                      required
                      value={formData.caseSubject}
                      onChange={handleInputChange}
                      placeholder="e.g. Bail Application, Matrimonial, Cheque Bounce, Supreme Court SLP..."
                      className="w-full bg-[#151926] border border-gray-700/80 focus:border-[#d4af37] rounded-xs px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none transition-colors"
                    />
                  </div>

                  {/* Preferred Appointment Date */}
                  <div className="space-y-1.5">
                    <label htmlFor={dateInputId} className="block text-xs uppercase tracking-wider text-gray-300 font-medium">
                      Preferred Appointment Date <span className="text-[#d4af37]">*</span>
                    </label>
                    <input
                      id={dateInputId}
                      type="date"
                      name="date"
                      required
                      min={todayISO}
                      value={formData.date}
                      onChange={handleInputChange}
                      className="w-full bg-[#151926] border border-gray-700/80 focus:border-[#d4af37] rounded-xs px-4 py-2.5 text-sm text-white focus:outline-none transition-colors font-mono"
                    />
                  </div>

                </div>

                {/* Brief Case Description (optional) */}
                <div className="space-y-1.5 pt-1">
                  <label htmlFor={descriptionTextareaId} className="block text-xs uppercase tracking-wider text-gray-300 font-medium">
                    Brief Case Details <span className="text-gray-500 font-normal">(Optional)</span>
                  </label>
                  <textarea
                    id={descriptionTextareaId}
                    name="description"
                    rows={3}
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Briefly state jurisdiction court, matter background, or upcoming hearing date..."
                    className="w-full bg-[#151926] border border-gray-700/80 focus:border-[#d4af37] rounded-xs px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none transition-colors resize-none"
                  />
                </div>

                {/* Submit Booking Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-gradient-to-r from-[#b28d2f] via-[#d4af37] to-[#b28d2f] text-black font-bold text-xs uppercase tracking-widest py-3.5 rounded-xs shadow-[0_0_20px_rgba(212,175,55,0.25)] hover:shadow-[0_0_30px_rgba(212,175,55,0.45)] hover:brightness-105 active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                        Saving Consultation...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 text-black" />
                        Confirm Consultation Booking
                      </>
                    )}
                  </button>
                  <p className="text-[10px] text-gray-400 text-center mt-2.5">
                    Client privacy protected • Consultation requests are securely saved and dispatched to chamber clerks.
                  </p>
                </div>

              </form>
            )}

          </div>

        </div>
      </section>

      {/* =========================================================================
          4. MINIMAL FOOTER
      ========================================================================= */}
      <footer className="py-10 bg-[#050609] text-gray-400 text-xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-6 border-b border-gray-800">
            <div>
              <p className="font-serif text-sm font-semibold text-white tracking-wide">
                Advocate Arunabh Banerjee
              </p>
              <p className="text-[11px] text-[#d4af37] font-mono tracking-wider uppercase">
                Supreme Court Advocate
              </p>
            </div>

            <div className="flex items-center gap-6 text-xs font-mono">
              <a 
                href="tel:+919810703335" 
                onClick={() => cmsService.trackClick("call")}
                className="hover:text-[#d4af37] transition-colors flex items-center gap-1.5"
              >
                <Phone className="w-3.5 h-3.5 text-[#d4af37]" />
                +91 98107 03335
              </a>
              <a 
                href="https://wa.me/919810703335" 
                target="_blank" 
                rel="noopener noreferrer" 
                onClick={() => cmsService.trackClick("whatsapp")}
                className="hover:text-emerald-400 transition-colors flex items-center gap-1.5"
              >
                <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                WhatsApp
              </a>
            </div>
          </div>

          {/* Professional Legal Disclaimer */}
          <p className="text-[11px] text-gray-400 leading-relaxed text-center sm:text-left">
            In accordance with the rules of the Bar Council of India, this website is intended solely for informational purposes and to facilitate client communication, and does not constitute advertisement, solicitation, or legal advice. Seeking legal consultation through this portal creates an advocate-client advisory request.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-2 text-[10px] text-gray-400 border-t border-gray-800/60 font-mono">
            <p>© 2026 Chambers of Advocate Arunabh Banerjee. All Rights Reserved.</p>
            
            {/* Discreet Chamber Admin Access */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowAdminPanel(true)}
                className="inline-flex items-center gap-1 text-gray-400 hover:text-[#d4af37] transition-colors focus:outline-none cursor-pointer"
                title="Chamber Portal Clerk Login (Passcode: 2026)"
              >
                <Lock className="w-3 h-3 text-[#d4af37]" />
                Chamber Admin Portal
              </button>
              <span className="text-gray-700">|</span>
              <a
                href="#admin"
                onClick={(e) => { e.preventDefault(); setShowAdminPanel(true); }}
                className="text-gray-500 hover:text-gray-300"
              >
                /admin
              </a>
            </div>
          </div>

        </div>
      </footer>

      {/* Admin Panel Modal (for reviewing & exporting bookings, tracking visitors & clicks) */}
      {showAdminPanel && (
        <AdminPanel onClose={() => {
          setShowAdminPanel(false);
          if (window.location.hash === "#admin") {
            window.history.pushState(null, "", window.location.pathname);
          }
        }} />
      )}

    </div>
  );
}
