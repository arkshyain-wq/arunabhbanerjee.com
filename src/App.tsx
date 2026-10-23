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
  Copy,
  Check,
  Send,
  User,
  Building2,
  Shield,
  Award,
  Globe,
  ArrowRight,
  Users
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
// @ts-ignore
import arunabhPortrait from "./assets/images/Arunabh_Banerjee.jpeg";
import AdminPanel from "./components/AdminPanel";
import { cmsService } from "./services/cmsService";
import { LeadItem, SiteCMSConfig } from "./types/cms";

export default function App() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [config, setConfig] = useState<SiteCMSConfig>(cmsService.getConfig());

  // Form State: Manual case subject entry, client category selection, no time slots
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    clientCategory: "Individuals",
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

    // Subscribe to real-time CMS configuration updates
    const unsubConfig = cmsService.subscribeConfig((newConfig) => {
      setConfig(newConfig);
    });

    // Initialize default appointment date to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split("T")[0];
    setFormData(prev => ({
      ...prev,
      date: prev.date || tomorrowStr
    }));

    return () => {
      window.removeEventListener("hashchange", checkAdminRoute);
      window.removeEventListener("popstate", checkAdminRoute);
      unsubConfig();
    };

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
        clientCategory: formData.clientCategory,
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
        clientCategory: "Individuals",
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
              {config.hero?.titlePrefix ? `${config.hero.titlePrefix} ` : ""}{config.hero?.name || "Advocate Arunabh Banerjee"}
            </span>
            <span className="text-[10px] sm:text-[11px] uppercase tracking-[0.22em] text-[#d4af37]/85 font-medium font-sans">
              {config.hero?.roleBadge || "Supreme Court Advocate"}
            </span>
          </a>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <button
              onClick={() => scrollToSection("home")}
              className="text-xs uppercase tracking-widest text-gray-300 hover:text-[#d4af37] transition-colors focus:outline-none font-medium cursor-pointer"
            >
              Home
            </button>
            <button
              onClick={() => scrollToSection("clients")}
              className="text-xs uppercase tracking-widest text-gray-300 hover:text-[#d4af37] transition-colors focus:outline-none font-medium cursor-pointer"
            >
              Client Categories
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
                onClick={() => scrollToSection("clients")}
                className="block w-full text-left text-sm uppercase tracking-wider text-gray-300 hover:text-[#d4af37] py-2.5 border-b border-gray-800"
              >
                Client Categories
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
                  {config.hero?.courtLine || "Supreme Court of India & Delhi High Court"}
                </span>
              </div>

              {/* Name & Title */}
              <div className="space-y-1.5">
                <span className="text-xs sm:text-sm uppercase tracking-[0.25em] text-gray-400 font-semibold block">
                  {config.hero?.tagline || "Senior Counsel"}
                </span>
                <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-medium tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-[#f5d77f] via-[#d4af37] to-[#997a2e] leading-[1.1]">
                  {config.hero?.name || "Arunabh Banerjee"}
                </h1>
                <p className="text-base sm:text-lg text-[#d4af37] font-serif tracking-wide pt-1">
                  {config.hero?.roleBadge || "Supreme Court Advocate"}
                </p>
              </div>

              {/* Short Description */}
              <p className="text-sm sm:text-base text-gray-300 leading-relaxed max-w-xl">
                {config.hero?.bioText || "Legal consultation and representation across criminal, matrimonial, commercial, constitutional, and human rights matters."}
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
                    href={`tel:${config.contacts?.primaryMobile || "+919810703335"}`} 
                    onClick={() => cmsService.trackClick("call")}
                    className="text-base sm:text-lg font-mono font-bold text-white hover:text-[#d4af37] transition-colors"
                  >
                    {config.contacts?.displayMobile || "+91 98107 03335"}
                  </a>
                </div>
              </div>

            </div>

            {/* Right Advocate Portrait (desktop) / Stacked (mobile) */}
            <div className="lg:col-span-5 flex justify-center lg:justify-end">
              <div className="max-w-xs sm:max-w-sm w-full">
                
                {/* Portrait Card with Glow */}
                <div className="relative group">
                  {/* Double Gold Framing & Glow */}
                  <div className="absolute -inset-1 bg-gradient-to-b from-[#d4af37]/45 via-[#b28d2f]/20 to-transparent rounded-xs blur-[2px] group-hover:from-[#d4af37]/70 transition-all duration-500 pointer-events-none" />
                  
                  <div className="relative border border-[#d4af37]/50 bg-[#0f121a] p-2.5 rounded-xs shadow-2xl">
                    
                    {/* Decorative Classical Corner Accents */}
                    <div className="absolute top-1 left-1 w-3 h-3 border-t border-l border-[#d4af37] pointer-events-none" />
                    <div className="absolute top-1 right-1 w-3 h-3 border-t border-r border-[#d4af37] pointer-events-none" />
                    <div className="absolute bottom-1 left-1 w-3 h-3 border-b border-l border-[#d4af37] pointer-events-none" />
                    <div className="absolute bottom-1 right-1 w-3 h-3 border-b border-r border-[#d4af37] pointer-events-none" />

                    {/* Real Portrait */}
                    <img
                      src={config.hero?.portraitUrl || arunabhPortrait}
                      alt={`${config.hero?.name || "Advocate Arunabh Banerjee"}, Supreme Court of India Advocate`}
                      className="w-full aspect-[4/5] object-cover rounded-xs filter contrast-[1.05] brightness-[0.98]"
                      loading="eager"
                    />

                  </div>
                </div>

                {/* Action Buttons Directly Under the Image */}
                <div className="mt-3.5 flex flex-col sm:flex-row gap-2.5 w-full relative z-20">
                  {/* WhatsApp */}
                  <a
                    href={`https://wa.me/${(config.contacts?.whatsappNumber || "919810703335").replace(/[^0-9]/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => cmsService.trackClick("whatsapp")}
                    className="flex-1 inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xs border border-emerald-500/60 bg-emerald-950/40 hover:bg-emerald-900/60 text-emerald-300 hover:text-emerald-200 text-xs uppercase tracking-wider font-semibold active:scale-[0.98] transition-all shadow-[0_0_15px_rgba(16,185,129,0.18)] cursor-pointer"
                  >
                    <MessageSquare className="w-4 h-4 text-emerald-400" />
                    WhatsApp
                  </a>

                  {/* Book Appointment */}
                  <a
                    href="#booking"
                    onClick={(e) => {
                      e.preventDefault();
                      scrollToSection("booking");
                    }}
                    className="flex-1 inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xs bg-gradient-to-r from-[#b28d2f] via-[#d4af37] to-[#b28d2f] text-black font-bold text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(212,175,55,0.3)] hover:brightness-110 active:scale-[0.98] transition-all cursor-pointer text-center"
                  >
                    <Calendar className="w-4 h-4 text-black" />
                    Book Appointment
                  </a>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* =========================================================================
          3. CLIENT CATEGORIES (Individuals, Corporate, NGOs, Trusts & NRIs)
      ========================================================================= */}
      <section id="clients" className="py-14 md:py-18 border-b border-[#d4af37]/15 relative bg-[#08090e]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          <div className="text-center space-y-2 mb-10">
            <span className="text-[11px] font-mono uppercase tracking-[0.25em] text-[#d4af37] font-semibold inline-flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-[#d4af37]" />
              Clientele Representation
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-medium text-white tracking-tight">
              Client Categories
            </h2>
            <p className="text-xs sm:text-sm text-gray-400 max-w-xl mx-auto">
              Chamber legal advisory and courtroom representation across personal, institutional, non-profit, and cross-border client categories.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {[
              {
                id: "Individuals",
                name: "Individuals",
                subtitle: "Personal & Criminal Defense",
                desc: "Anticipatory & regular bail, criminal trials, matrimonial disputes, fundamental rights & civil litigation.",
                icon: User
              },
              {
                id: "Corporate",
                name: "Corporate",
                subtitle: "Commercial & Business Litigation",
                desc: "High-value commercial contracts, NCLT insolvency proceedings, corporate arbitration, debt recovery & statutory defense.",
                icon: Building2
              },
              {
                id: "NGOs",
                name: "NGOs",
                subtitle: "Civil Society & Human Rights",
                desc: "Protection of democratic rights, human rights advocacy, public interest litigations (PIL) & regulatory compliance.",
                icon: Shield
              },
              {
                id: "Trusts",
                name: "Trusts",
                subtitle: "Charitable & Endowment Disputes",
                desc: "Trust property administration, institutional governance disputes, public charitable foundations & endowment compliance.",
                icon: Award
              },
              {
                id: "NRIs",
                name: "NRIs",
                subtitle: "Non-Resident Indian Counsel",
                desc: "Cross-border litigation, ancestral real estate disputes, power of attorney litigation & High Court / Supreme Court representation.",
                icon: Globe
              }
            ].map((cat) => {
              const IconComp = cat.icon;
              return (
                <div 
                  key={cat.id} 
                  className="bg-[#10131c] border border-gray-800 hover:border-[#d4af37]/60 rounded-xs p-5 flex flex-col justify-between transition-all duration-300 group hover:shadow-[0_8px_30px_rgba(212,175,55,0.1)] hover:-translate-y-0.5"
                >
                  <div className="space-y-3">
                    <div className="w-10 h-10 rounded-xs bg-[#171b26] border border-[#d4af37]/40 flex items-center justify-center text-[#d4af37] group-hover:scale-110 transition-transform">
                      <IconComp className="w-5 h-5 text-[#d4af37]" />
                    </div>
                    <div>
                      <h3 className="font-serif text-lg font-bold text-white group-hover:text-[#f5d77f] transition-colors">
                        {cat.name}
                      </h3>
                      <span className="text-[10px] text-[#d4af37] uppercase font-mono block mt-0.5">
                        {cat.subtitle}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 leading-relaxed">
                      {cat.desc}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setFormData(prev => ({ ...prev, clientCategory: cat.id }));
                      scrollToSection("booking");
                    }}
                    className="mt-4 pt-3 border-t border-gray-800/80 flex items-center justify-between text-xs text-gray-300 group-hover:text-[#d4af37] transition-colors cursor-pointer w-full text-left"
                  >
                    <span className="text-[11px] font-medium uppercase tracking-wider">Book Consultation</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* =========================================================================
          4. APPOINTMENT BOOKING (Manual case matter entry, no time slots)
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
                    <span className="text-gray-400">Client Category:</span>
                    <span className="text-[#d4af37] font-semibold">{confirmedBooking.clientCategory || "Individuals"}</span>
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
                      `Hello Advocate Arunabh Banerjee, I have scheduled a consultation on arunabhbanerjee.com.\n\nBooking ID: ${confirmedBooking.id}\nName: ${confirmedBooking.name}\nCategory: ${confirmedBooking.clientCategory || "Individuals"}\nPreferred Date: ${confirmedBooking.date}\nSubject Matter: ${confirmedBooking.caseType}`
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

                {/* Client Category Selector */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs uppercase tracking-wider text-gray-300 font-medium">
                      Client Category <span className="text-[#d4af37]">*</span>
                    </label>
                    <span className="text-[10px] text-gray-500 font-mono">Individuals • Corporate • NGOs • Trusts • NRIs</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                    {[
                      { id: "Individuals", label: "Individuals", icon: User },
                      { id: "Corporate", label: "Corporate", icon: Building2 },
                      { id: "NGOs", label: "NGOs", icon: Shield },
                      { id: "Trusts", label: "Trusts", icon: Award },
                      { id: "NRIs", label: "NRIs", icon: Globe }
                    ].map((item) => {
                      const IconComponent = item.icon;
                      const isSelected = formData.clientCategory === item.id;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, clientCategory: item.id }))}
                          className={`py-2 px-2 text-xs font-semibold rounded-xs border transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                            isSelected
                              ? "bg-gradient-to-r from-[#d4af37]/25 to-[#b28d2f]/20 border-[#d4af37] text-[#f5d77f] shadow-[0_0_12px_rgba(212,175,55,0.25)] font-bold"
                              : "bg-[#151926] border-gray-700/80 text-gray-400 hover:text-white hover:border-gray-600"
                          }`}
                        >
                          <IconComponent className={`w-3.5 h-3.5 ${isSelected ? "text-[#d4af37]" : "text-gray-400"}`} />
                          <span>{item.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

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
      <footer className="py-6 bg-[#040508] border-t border-gray-800/80 text-gray-400 text-xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
            
            {/* Branding & Short Copyright */}
            <div className="space-y-0.5">
              <p className="font-serif text-xs font-semibold text-white tracking-wide">
                Advocate Arunabh Banerjee • Supreme Court Advocate
              </p>
              <div className="flex items-center gap-2 text-[10px] text-gray-400 font-mono">
                <span>© 2026 All Rights Reserved</span>
                <span>•</span>
                <button
                  type="button"
                  onClick={() => setShowAdminPanel(true)}
                  className="text-gray-500 hover:text-[#d4af37] transition-colors cursor-pointer underline underline-offset-2"
                  title="Chamber Admin Portal (Passcode: 2026)"
                >
                  Chamber Portal
                </button>
              </div>
            </div>

            {/* Action buttons: Google Business Profile & Contact Developer */}
            <div className="flex items-center flex-wrap gap-2 pt-1 sm:pt-0 justify-center sm:justify-end">
              {/* Google Business Profile Link */}
              <a
                href={config.contacts?.googleBusinessUrl || "https://share.google/DWN0Xox7NNa1ziBn6"}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => cmsService.trackClick("maps")}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#0f121a] hover:bg-[#161a24] border border-blue-500/40 hover:border-blue-400 text-gray-300 hover:text-blue-300 text-[10px] font-mono rounded-xs transition-colors cursor-pointer shadow-xs"
                title="View Official Advocate Arunabh Banerjee Profile on Google Search & Maps"
              >
                <MapPin className="w-3 h-3 text-blue-400" />
                <span>Google Business Profile</span>
              </a>

              {/* Contact Developer Button (WhatsApp: 01609166109) */}
              <a
                href="https://wa.me/8801609166109?text=Hello%20Developer%2C%20I%20am%20contacting%20you%20regarding%20the%20Advocate%20Arunabh%20Banerjee%20website."
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#0f121a] hover:bg-[#161a24] border border-gray-700/80 hover:border-emerald-500/60 text-gray-300 hover:text-emerald-400 text-[10px] font-mono rounded-xs transition-colors cursor-pointer"
                title="Chat with Web Developer on WhatsApp (01609166109)"
              >
                <MessageSquare className="w-3 h-3 text-emerald-400" />
                <span>Contact Developer</span>
              </a>
            </div>

          </div>
        </div>
      </footer>

      {/* Admin Panel Modal (for reviewing & exporting bookings, tracking visitors & clicks) */}
      {showAdminPanel && (
        <AdminPanel onClose={() => {
          setShowAdminPanel(false);
          if (window.location.hash === "#admin" || window.location.pathname.includes("/admin")) {
            window.history.pushState(null, "", "/");
          }
        }} />
      )}

    </div>
  );
}
