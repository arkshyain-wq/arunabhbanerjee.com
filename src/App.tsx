/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useId } from "react";
import { 
  Scale, 
  Phone, 
  Mail,
  MessageSquare, 
  Calendar, 
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
  Users,
  Download,
  Smartphone,
  Laptop,
  MapPin,
  Clock,
  Navigation
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
// @ts-ignore
import arunabhPortrait from "./assets/images/Arunabh_Banerjee.jpeg";
import AdminPanel from "./components/AdminPanel";
import TiltCard from "./components/TiltCard";
import LegalCursor from "./components/LegalCursor";
import { cmsService } from "./services/cmsService";
import { LeadItem, SiteCMSConfig } from "./types/cms";

export default function App() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [config, setConfig] = useState<SiteCMSConfig>(cmsService.getConfig());
  const [deferredInstallPrompt, setDeferredInstallPrompt] = useState<any>(null);
  const [isAppInstalled, setIsAppInstalled] = useState<boolean>(false);
  const [showInstallModal, setShowInstallModal] = useState<boolean>(false);

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
  const [copiedAddressId, setCopiedAddressId] = useState<string | null>(null);

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

    // PWA beforeinstallprompt handler
    const installHandler = (e: any) => {
      e.preventDefault();
      setDeferredInstallPrompt(e);
    };
    window.addEventListener("beforeinstallprompt", installHandler);

    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsAppInstalled(true);
    }

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
      window.removeEventListener("beforeinstallprompt", installHandler);
      window.removeEventListener("keydown", handleKeyDown);
      unsubConfig();
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

  const copyAddress = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedAddressId(id);
    setTimeout(() => setCopiedAddressId(null), 2500);
  };

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleInstallApp = async () => {
    if (deferredInstallPrompt) {
      try {
        await deferredInstallPrompt.prompt();
        const choice = await deferredInstallPrompt.userChoice;
        if (choice?.outcome === "accepted") {
          setIsAppInstalled(true);
        }
        setDeferredInstallPrompt(null);
      } catch (err) {
        console.error("Install prompt error:", err);
      }
    }
    setShowInstallModal(true);
  };

  const handleDirectEmailClick = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    cmsService.trackClick("email");
    const email = config.contacts?.directEmail || "prof.abanerjee@gmail.com";
    const subject = encodeURIComponent("Legal Consultation Inquiry — Advocate Arunabh Banerjee");
    const body = encodeURIComponent(
      "Hello Advocate Arunabh Banerjee,\n\nI am contacting you regarding a legal consultation and counsel representation.\n\nClient Name: \nPhone Number: \nCity / Jurisdiction: \nCase Category / Subject: \nBrief Summary of Legal Matter: \n"
    );
    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    if (isMobile) {
      window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
    } else {
      window.open(`https://mail.google.com/mail/?view=cm&fs=1&to=${email}&su=${subject}&body=${body}`, "_blank", "noopener,noreferrer");
    }
  };

  const handleDirectNumberClick = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    cmsService.trackClick("whatsapp");
    const text = encodeURIComponent(
      "Hello Advocate Arunabh Banerjee, I am contacting you for legal consultation and representation."
    );
    const url = `https://wa.me/919810703335?text=${text}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="min-h-screen bg-[#07080c] text-gray-200 font-sans selection:bg-[#d4af37] selection:text-black antialiased relative">
      
      {/* Interactive 3D Legal Lawyer Cursor & Ambient Glow Trail */}
      <LegalCursor />

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
            <button
              onClick={() => scrollToSection("chambers")}
              className="text-xs uppercase tracking-widest text-gray-300 hover:text-[#d4af37] transition-colors focus:outline-none font-medium cursor-pointer"
            >
              Chamber &amp; Offices
            </button>

            {/* Install App Button (PC & Mobile) */}
            <button
              id="install-app-btn"
              onClick={handleInstallApp}
              className="px-3 py-2 border border-[#d4af37]/45 hover:border-[#d4af37] bg-[#141724]/90 hover:bg-[#1a1f30] text-[#d4af37] hover:text-white text-xs font-mono rounded-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Install Official App on PC or Mobile"
            >
              <Download className="w-3.5 h-3.5 text-[#d4af37]" />
              <span>{isAppInstalled ? "App Installed" : "Install App"}</span>
            </button>

            {/* Prominent CTA */}
            <button
              onClick={() => scrollToSection("booking")}
              className="shine-hover btn-3d-gold text-black font-extrabold text-xs tracking-wider uppercase px-5 py-2.5 rounded-xs hover:brightness-110 active:translate-y-1 active:scale-[0.98] transition-all flex items-center gap-2 cursor-pointer group"
            >
              <Calendar className="w-3.5 h-3.5 text-black group-hover:scale-125 group-hover:-rotate-12 transition-transform duration-300" />
              Book Appointment
            </button>
          </nav>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2 sm:gap-3">
            <button
              onClick={handleInstallApp}
              className="p-1.5 text-[#d4af37] border border-[#d4af37]/40 rounded-xs text-[10px] font-mono flex items-center gap-1"
              title="Install App"
            >
              <Download className="w-3 h-3 text-[#d4af37]" />
              <span className="hidden xs:inline">App</span>
            </button>
            <button
              onClick={() => scrollToSection("booking")}
              className="bg-gradient-to-r from-[#b28d2f] via-[#d4af37] to-[#b28d2f] text-black font-semibold text-[11px] tracking-wider uppercase px-3 py-1.5 rounded-xs"
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
                onClick={() => scrollToSection("chambers")}
                className="block w-full text-left text-sm uppercase tracking-wider text-gray-300 hover:text-[#d4af37] py-2.5 border-b border-gray-800"
              >
                Chamber &amp; Offices
              </button>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleInstallApp();
                }}
                className="flex items-center gap-2 w-full text-left text-sm uppercase tracking-wider text-[#d4af37] py-2.5 border-b border-gray-800"
              >
                <Download className="w-4 h-4 text-[#d4af37]" />
                <span>{isAppInstalled ? "App Installed" : "Install App (PC & Mobile)"}</span>
              </button>
              
              {/* Direct Messaging Quick Links in Mobile Menu */}
              <div className="pt-2 border-b border-gray-800 pb-3 space-y-2">
                <a
                  href={`https://wa.me/919810703335?text=${encodeURIComponent("Hello Advocate Arunabh Banerjee, I am contacting you for legal consultation and representation.")}`}
                  onClick={(e) => {
                    setMobileMenuOpen(false);
                    handleDirectNumberClick(e);
                  }}
                  className="flex items-center gap-2 text-xs font-mono text-emerald-400 hover:text-emerald-300 py-1"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>WhatsApp SMS: {config.contacts?.displayMobile || "+91 98107 03335"}</span>
                </a>
                <a
                  href={`https://mail.google.com/mail/?view=cm&fs=1&to=${config.contacts?.directEmail || "prof.abanerjee@gmail.com"}&su=${encodeURIComponent("Legal Consultation Inquiry — Advocate Arunabh Banerjee")}`}
                  onClick={(e) => {
                    setMobileMenuOpen(false);
                    handleDirectEmailClick(e);
                  }}
                  className="flex items-center gap-2 text-xs font-mono text-red-400 hover:text-red-300 py-1"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Gmail Compose: {config.contacts?.directEmail || "prof.abanerjee@gmail.com"}</span>
                </a>
              </div>

              <button
                onClick={() => scrollToSection("booking")}
                className="shine-hover w-full btn-3d-gold text-black font-extrabold text-xs tracking-wider uppercase py-3 rounded-xs flex items-center justify-center gap-2 mt-2 cursor-pointer group"
              >
                <Calendar className="w-4 h-4 text-black group-hover:scale-125 group-hover:-rotate-12 transition-transform duration-300" />
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
              
              {/* Judicial Jurisdiction Ribbon & Team Strength Badge */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[#d4af37]/35 bg-[#121520]/80">
                  <Scale className="w-3.5 h-3.5 text-[#d4af37]" />
                  <span className="text-[11px] font-medium tracking-widest uppercase text-[#d4af37]">
                    {config.hero?.courtLine || "Supreme Court & High Court (All Courts & Tribunals)"}
                  </span>
                </div>

                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-emerald-500/35 bg-emerald-950/40 text-emerald-300">
                  <Users className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-[11px] font-mono tracking-wider font-semibold">
                    {config.hero?.teamBadge || "Leading a Chamber Team of 12 Advocates"}
                  </span>
                </div>
              </div>

              {/* Name & Title */}
              <div className="space-y-1.5">
                <span className="text-xs sm:text-sm uppercase tracking-[0.25em] text-gray-400 font-semibold block">
                  {config.hero?.tagline || "Senior Counsel"}
                </span>
                <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-medium tracking-tight text-shimmer-3d leading-[1.1] drop-shadow-[0_4px_12px_rgba(212,175,55,0.25)]">
                  {config.hero?.name?.startsWith("Advocate") ? config.hero.name : `Advocate ${config.hero?.name || "Arunabh Banerjee"}`}
                </h1>
                <p className="text-base sm:text-lg text-[#d4af37] font-serif tracking-wide pt-1">
                  {config.hero?.roleBadge || "Supreme Court Advocate"} • {config.hero?.courtLine || "Supreme Court & High Court (All Courts & Tribunals)"}
                </p>
              </div>

              {/* Short Description */}
              <p className="text-sm sm:text-base text-gray-300 leading-relaxed max-w-xl">
                {config.hero?.bioText || "Legal consultation and representation across criminal, matrimonial, commercial, constitutional, and human rights matters."}
              </p>

              {/* Direct Contact Points: Helpline & Direct Email */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 pt-1">
                {/* Direct Chamber Helpline */}
                <div className="flex items-center gap-3">
                  <div 
                    onClick={handleDirectNumberClick}
                    className="relative w-10 h-10 rounded-full bg-[#141724] border border-[#d4af37]/45 flex items-center justify-center text-[#d4af37] shadow-[0_0_15px_rgba(212,175,55,0.25)] shrink-0 cursor-pointer hover:border-emerald-500 hover:text-emerald-400 hover:scale-110 active:scale-95 transition-all duration-300 group/icon"
                    title="Click to Message on WhatsApp / SMS"
                  >
                    <span className="absolute -inset-1 rounded-full bg-emerald-500/20 animate-pulse-ring pointer-events-none" />
                    <MessageSquare className="w-4 h-4 text-emerald-400 group-hover/icon:scale-120 group-hover/icon:rotate-12 transition-transform duration-300" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-gray-400 block font-mono">
                      Direct Chamber Helpline &amp; SMS
                    </span>
                    <a 
                      href={`https://wa.me/919810703335?text=${encodeURIComponent("Hello Advocate Arunabh Banerjee, I am contacting you for legal consultation and representation.")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={handleDirectNumberClick}
                      className="text-base sm:text-lg font-mono font-bold text-white hover:text-emerald-400 transition-colors cursor-pointer"
                      title="Click to Message directly on WhatsApp / SMS"
                    >
                      {config.contacts?.displayMobile || "+91 98107 03335"}
                    </a>
                    {/* Instant 1-tap SMS & Call Actions */}
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <a
                        href={`https://wa.me/919810703335?text=${encodeURIComponent("Hello Advocate Arunabh Banerjee, I am contacting you for legal consultation and representation.")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={handleDirectNumberClick}
                        className="btn-3d-dark text-[10px] font-mono text-emerald-400 hover:text-emerald-300 flex items-center gap-1.5 bg-emerald-950/50 border border-emerald-500/50 hover:border-emerald-400/80 px-2.5 py-1 rounded-xs cursor-pointer group/wa hover:shadow-[0_0_15px_rgba(16,185,129,0.35)]"
                        title="Chat &amp; SMS on WhatsApp"
                      >
                        <MessageSquare className="w-2.5 h-2.5 group-hover/wa:scale-125 transition-transform" /> WhatsApp SMS
                      </a>
                      <a
                        href={`tel:${config.contacts?.primaryMobile || "+919810703335"}`}
                        onClick={() => cmsService.trackClick("call")}
                        className="btn-3d-dark text-[10px] font-mono text-gray-300 hover:text-[#d4af37] flex items-center gap-1.5 bg-gray-900/80 border border-gray-700 hover:border-[#d4af37]/60 px-2.5 py-1 rounded-xs group/call hover:shadow-[0_0_15px_rgba(212,175,55,0.3)]"
                        title="Direct Phone Call"
                      >
                        <Phone className="w-2.5 h-2.5 text-[#d4af37] group-hover/call:animate-icon-wobble" /> Call
                      </a>
                      <a
                        href={`sms:+919810703335?body=${encodeURIComponent("Hello Advocate Arunabh Banerjee, I need urgent legal assistance.")}`}
                        className="btn-3d-dark sm:hidden text-[10px] font-mono text-blue-300 hover:text-white flex items-center gap-1 bg-blue-950/40 border border-blue-500/40 px-2 py-0.5 rounded-xs"
                        title="Direct Mobile SMS"
                      >
                        SMS
                      </a>
                    </div>
                  </div>
                </div>

                {/* Direct Advocate Email */}
                <div className="flex items-center gap-3 sm:border-l sm:border-gray-800/80 sm:pl-4">
                  <div 
                    onClick={handleDirectEmailClick}
                    className="relative w-10 h-10 rounded-full bg-[#141724] border border-[#d4af37]/45 flex items-center justify-center text-[#d4af37] shadow-[0_0_15px_rgba(212,175,55,0.25)] shrink-0 cursor-pointer hover:border-red-400 hover:text-red-400 hover:scale-110 active:scale-95 transition-all duration-300 group/mail"
                    title="Click to Open Direct Gmail Compose"
                  >
                    <span className="absolute -inset-1 rounded-full bg-red-500/20 animate-pulse-ring pointer-events-none" />
                    <Mail className="w-4 h-4 text-red-400 group-hover/mail:scale-120 group-hover/mail:-rotate-12 transition-transform duration-300" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-gray-400 block font-mono">
                      Direct Gmail / Email
                    </span>
                    <a 
                      href={`https://mail.google.com/mail/?view=cm&fs=1&to=${config.contacts?.directEmail || "prof.abanerjee@gmail.com"}&su=${encodeURIComponent("Legal Consultation Inquiry — Advocate Arunabh Banerjee")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={handleDirectEmailClick}
                      className="text-sm sm:text-base font-mono font-bold text-white hover:text-red-400 transition-colors cursor-pointer"
                      title="Click to Open Direct Gmail Compose Window"
                    >
                      {config.contacts?.directEmail || "prof.abanerjee@gmail.com"}
                    </a>
                    {/* Instant Direct Gmail Compose Badge */}
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <a
                        href={`https://mail.google.com/mail/?view=cm&fs=1&to=${config.contacts?.directEmail || "prof.abanerjee@gmail.com"}&su=${encodeURIComponent("Legal Consultation Inquiry — Advocate Arunabh Banerjee")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={handleDirectEmailClick}
                        className="btn-3d-dark text-[10px] font-mono text-red-400 hover:text-red-300 flex items-center gap-1.5 bg-red-950/40 border border-red-500/40 hover:border-red-400/80 px-2.5 py-1 rounded-xs cursor-pointer group/gmail hover:shadow-[0_0_15px_rgba(239,68,68,0.35)]"
                        title="Direct Gmail Compose Window"
                      >
                        <Mail className="w-2.5 h-2.5 text-red-400 group-hover/gmail:scale-125 transition-transform" /> Direct Gmail Compose
                      </a>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* Right Advocate Portrait (desktop) / Stacked (mobile) */}
            <div className="lg:col-span-5 flex justify-center lg:justify-end">
              <div className="max-w-xs sm:max-w-sm w-full">
                
                {/* 3D Tilt Portrait Card with Multi-layer Depth */}
                <TiltCard maxTilt={12} scale={1.03} glowColor="rgba(212, 175, 55, 0.28)" className="group">
                  <div className="relative">
                    {/* Double Gold Framing & Glow */}
                    <div className="absolute -inset-1 bg-gradient-to-b from-[#d4af37]/45 via-[#b28d2f]/20 to-transparent rounded-xs blur-[2px] group-hover:from-[#d4af37]/70 transition-all duration-500 pointer-events-none" />
                    
                    <div className="relative border border-[#d4af37]/50 bg-[#0f121a] p-2.5 rounded-xs shadow-2xl preserve-3d">
                      
                      {/* Decorative Classical Corner Accents */}
                      <div className="absolute top-1 left-1 w-3 h-3 border-t border-l border-[#d4af37] pointer-events-none translate-z-20" />
                      <div className="absolute top-1 right-1 w-3 h-3 border-t border-r border-[#d4af37] pointer-events-none translate-z-20" />
                      <div className="absolute bottom-1 left-1 w-3 h-3 border-b border-l border-[#d4af37] pointer-events-none translate-z-20" />
                      <div className="absolute bottom-1 right-1 w-3 h-3 border-b border-r border-[#d4af37] pointer-events-none translate-z-20" />

                      {/* Real Portrait */}
                      <img
                        src={config.hero?.portraitUrl || arunabhPortrait}
                        alt={`${config.hero?.name || "Advocate Arunabh Banerjee"}, Supreme Court of India Advocate`}
                        className="w-full aspect-[4/5] object-cover rounded-xs filter contrast-[1.05] brightness-[0.98] translate-z-10"
                        loading="eager"
                      />

                    </div>
                  </div>
                </TiltCard>

                {/* Action Buttons Directly Under the Image */}
                <div className="mt-3.5 flex flex-col sm:flex-row gap-2.5 w-full relative z-20">
                  {/* WhatsApp */}
                  <a
                    href={`https://wa.me/${(config.contacts?.whatsappNumber || "919810703335").replace(/[^0-9]/g, "")}?text=${encodeURIComponent("Hello Advocate Arunabh Banerjee, I am contacting you for legal consultation and representation.")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => cmsService.trackClick("whatsapp")}
                    className="shine-hover flex-1 inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xs border border-emerald-500/60 bg-gradient-to-r from-emerald-950/70 via-emerald-900/50 to-emerald-950/70 hover:bg-emerald-900/70 text-emerald-300 hover:text-emerald-100 text-xs uppercase tracking-wider font-semibold shadow-[0_4px_16px_rgba(16,185,129,0.22)] hover:shadow-[0_8px_25px_rgba(16,185,129,0.45)] hover:-translate-y-0.5 active:translate-y-0.5 active:scale-[0.98] transition-all cursor-pointer group"
                  >
                    <MessageSquare className="w-4 h-4 text-emerald-400 group-hover:scale-125 group-hover:rotate-12 transition-transform duration-300" />
                    WhatsApp
                  </a>

                  {/* Book Appointment */}
                  <a
                    href="#booking"
                    onClick={(e) => {
                      e.preventDefault();
                      scrollToSection("booking");
                    }}
                    className="shine-hover flex-1 inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xs btn-3d-gold text-black font-extrabold text-xs uppercase tracking-wider hover:-translate-y-0.5 active:translate-y-1 active:scale-[0.98] transition-all cursor-pointer text-center group"
                  >
                    <Calendar className="w-4 h-4 text-black group-hover:scale-125 group-hover:-rotate-12 transition-transform duration-300" />
                    Book Appointment
                  </a>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* =========================================================================
          2. CLIENT CATEGORIES (Individuals, Corporate, NGOs, Trusts & NRIs)
      ========================================================================= */}
      <section id="clients" className="py-12 md:py-18 border-b border-[#d4af37]/15 relative bg-[#08090e]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          <div className="text-center space-y-2 mb-8 sm:mb-10">
            <span className="text-[11px] font-mono uppercase tracking-[0.25em] text-[#d4af37] font-semibold inline-flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-[#d4af37]" />
              Clientele Representation
            </span>
            <h2 className="font-serif text-2xl sm:text-4xl font-medium text-white tracking-tight">
              Client Categories
            </h2>
            <p className="text-xs sm:text-sm text-gray-400 max-w-xl mx-auto">
              Chamber legal advisory and courtroom representation across personal, institutional, non-profit, and cross-border client categories.
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-5 gap-2.5 sm:gap-4">
            {[
              {
                id: "Individuals",
                name: "Individuals",
                subtitle: "Personal & Criminal Defense",
                icon: User
              },
              {
                id: "Corporate",
                name: "Corporate",
                subtitle: "Commercial & Business Litigation",
                icon: Building2
              },
              {
                id: "NGOs",
                name: "NGOs",
                subtitle: "Civil Society & Human Rights",
                icon: Shield
              },
              {
                id: "Trusts",
                name: "Trusts",
                subtitle: "Charitable & Endowment Disputes",
                icon: Award
              },
              {
                id: "NRIs",
                name: "NRIs",
                subtitle: "Non-Resident Indian Counsel",
                icon: Globe
              }
            ].map((cat, idx) => {
              const IconComp = cat.icon;
              const isLastOdd = idx === 4;
              return (
                <TiltCard
                  key={cat.id}
                  maxTilt={14}
                  scale={1.04}
                  glowColor="rgba(212, 175, 55, 0.22)"
                  className={isLastOdd ? "col-span-2 lg:col-span-1" : "col-span-1"}
                  onClick={() => {
                    setFormData(prev => ({ ...prev, clientCategory: cat.id }));
                    scrollToSection("booking");
                  }}
                >
                  <div className="w-full h-full bg-[#10131c] border border-gray-800/90 hover:border-[#d4af37]/80 rounded-xs p-3.5 sm:p-5 flex flex-col justify-between transition-all duration-300 group hover:shadow-[0_16px_40px_rgba(212,175,55,0.25)] cursor-pointer preserve-3d shine-hover">
                    <div className="space-y-2 sm:space-y-3">
                      <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xs bg-[#171b26] border border-[#d4af37]/40 flex items-center justify-center text-[#d4af37] group-hover:scale-120 group-hover:rotate-6 group-hover:bg-[#202538] group-hover:border-[#d4af37] group-hover:shadow-[0_0_20px_rgba(212,175,55,0.45)] transition-all duration-300 translate-z-20 shadow-[0_0_12px_rgba(212,175,55,0.15)]">
                        <IconComp className="w-4 h-4 sm:w-5 sm:h-5 text-[#d4af37] group-hover:text-white transition-colors" />
                      </div>
                      <div className="translate-z-10">
                        <h3 className="font-serif text-sm sm:text-lg font-bold text-white group-hover:text-[#f5d77f] transition-colors leading-snug">
                          {cat.name}
                        </h3>
                        <span className="text-[9px] sm:text-[10px] text-[#d4af37] uppercase font-mono block mt-1 tracking-wide font-semibold leading-tight">
                          {cat.subtitle}
                        </span>
                      </div>
                    </div>

                    <div className="mt-3 pt-2.5 sm:mt-4 sm:pt-3 border-t border-gray-800/80 flex items-center justify-between text-[10px] sm:text-xs text-gray-300 group-hover:text-[#d4af37] transition-colors w-full translate-z-10">
                      <span className="text-[10px] sm:text-[11px] font-medium uppercase tracking-wider">
                        <span className="sm:hidden">Consult</span>
                        <span className="hidden sm:inline">Book Consultation</span>
                      </span>
                      <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0 group-hover:translate-x-2 transition-transform duration-300" />
                    </div>
                  </div>
                </TiltCard>
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
          <div className="bg-[#10131c] border border-[#d4af37]/40 rounded-xs p-4 sm:p-8 md:p-9 shadow-[0_10px_40px_rgba(0,0,0,0.6)]">
            
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
                    <label className="block text-xs uppercase tracking-wider text-gray-200 font-semibold">
                      Client Category <span className="text-[#d4af37]">*</span>
                    </label>
                    <span className="hidden sm:inline text-[10px] text-gray-400 font-mono">Individuals • Corporate • NGOs • Trusts • NRIs</span>
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
                        <motion.button
                          key={item.id}
                          type="button"
                          whileHover={{ scale: 1.04, y: -2 }}
                          whileTap={{ scale: 0.95, y: 1 }}
                          onClick={() => setFormData(prev => ({ ...prev, clientCategory: item.id }))}
                          className={`${item.id === "NRIs" ? "col-span-2 sm:col-span-1" : "col-span-1"} py-2.5 sm:py-2.5 px-2 text-xs font-semibold rounded-xs border transition-all flex items-center justify-center gap-2 cursor-pointer preserve-3d group relative ${
                            isSelected
                              ? "bg-gradient-to-b from-[#d4af37]/35 via-[#b28d2f]/25 to-[#161a26] border-[#d4af37] text-[#f5d77f] shadow-[0_4px_16px_rgba(212,175,55,0.38),inset_0_1px_1px_rgba(255,255,255,0.4)] font-bold ring-1 ring-[#d4af37]/60 -translate-y-0.5"
                              : "bg-[#141724] border-gray-700/80 text-gray-400 hover:text-white hover:border-[#d4af37]/50 hover:bg-[#1a1f30] hover:shadow-[0_4px_12px_rgba(0,0,0,0.5)]"
                          }`}
                        >
                          <motion.div
                            key={`${item.id}-${isSelected ? 'selected' : 'unselected'}`}
                            animate={
                              isSelected 
                                ? { 
                                    scale: [1, 1.45, 0.9, 1.25, 1], 
                                    rotate: [0, -18, 18, -6, 0],
                                    y: [0, -3, 1, -1, 0]
                                  } 
                                : { scale: 1, rotate: 0, y: 0 }
                            }
                            transition={{ duration: 0.5, ease: "easeOut" }}
                            className="relative flex items-center justify-center"
                          >
                            <IconComponent className={`w-4 h-4 transition-all duration-300 ${isSelected ? "text-[#f5d77f] drop-shadow-[0_0_8px_rgba(212,175,55,0.8)]" : "text-gray-400 group-hover:text-[#d4af37] group-hover:scale-115"}`} />
                          </motion.div>
                          <span className="tracking-wide">{item.label}</span>
                        </motion.button>
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
                      className="w-full bg-[#151926] border border-gray-700/80 focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37]/40 focus:shadow-[0_0_18px_rgba(212,175,55,0.2)] focus:-translate-y-0.5 rounded-xs px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none transition-all duration-200"
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
                      className="w-full bg-[#151926] border border-gray-700/80 focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37]/40 focus:shadow-[0_0_18px_rgba(212,175,55,0.2)] focus:-translate-y-0.5 rounded-xs px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none transition-all duration-200"
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
                      className="w-full bg-[#151926] border border-gray-700/80 focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37]/40 focus:shadow-[0_0_18px_rgba(212,175,55,0.2)] focus:-translate-y-0.5 rounded-xs px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none transition-all duration-200"
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
                      className="w-full bg-[#151926] border border-gray-700/80 focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37]/40 focus:shadow-[0_0_18px_rgba(212,175,55,0.2)] focus:-translate-y-0.5 rounded-xs px-4 py-2.5 text-sm text-white focus:outline-none transition-all duration-200 font-mono"
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
                    className="w-full bg-[#151926] border border-gray-700/80 focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37]/40 focus:shadow-[0_0_18px_rgba(212,175,55,0.2)] focus:-translate-y-0.5 rounded-xs px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none transition-all duration-200 resize-none"
                  />
                </div>

                {/* Submit Booking Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="shine-hover w-full btn-3d-gold text-black font-extrabold text-xs uppercase tracking-widest py-3.5 rounded-xs hover:brightness-110 active:translate-y-1 active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer group"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                        Saving Consultation...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 text-black group-hover:translate-x-2 group-hover:-translate-y-1 group-hover:scale-115 transition-transform duration-300" />
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
          CHAMBER STRENGTHS & KEY METRICS STRIP (Positioned under Booking Section)
      ========================================================================= */}
      <section className="border-b border-[#d4af37]/20 bg-[#090b11] py-6 sm:py-8 px-4 sm:px-6 relative z-10 shadow-inner">
        <div className="max-w-6xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5 text-center">
          
          {/* Metric 1: Chamber Team Strength */}
          <TiltCard maxTilt={10} scale={1.03} glowColor="rgba(212, 175, 55, 0.2)">
            <div className="w-full h-full p-3.5 sm:p-4 rounded-xs bg-[#10131c]/80 border border-gray-800/80 hover:border-[#d4af37]/60 transition-colors flex flex-col items-center justify-center preserve-3d">
              <div className="flex items-center gap-2 text-[#dbb657] mb-1 translate-z-15">
                <Users className="w-5 h-5 text-[#dbb657]" />
                <span className="font-serif text-2xl sm:text-3xl font-bold">12</span>
              </div>
              <span className="text-xs font-semibold text-white tracking-wide translate-z-10">Advocates Team</span>
              <span className="text-[10px] text-gray-400 font-mono mt-0.5">Led by Advocate Arunabh Banerjee</span>
            </div>
          </TiltCard>

          {/* Metric 2: Judicial Jurisdictions */}
          <TiltCard maxTilt={10} scale={1.03} glowColor="rgba(212, 175, 55, 0.2)">
            <div className="w-full h-full p-3.5 sm:p-4 rounded-xs bg-[#10131c]/80 border border-gray-800/80 hover:border-[#d4af37]/60 transition-colors flex flex-col items-center justify-center preserve-3d">
              <div className="flex items-center gap-2 text-[#dbb657] mb-1 translate-z-15">
                <Scale className="w-5 h-5 text-[#dbb657]" />
                <span className="font-serif text-sm sm:text-base font-bold leading-tight">Supreme Court &amp; High Court</span>
              </div>
              <span className="text-xs font-semibold text-white tracking-wide translate-z-10">All Courts &amp; Tribunals</span>
              <span className="text-[10px] text-gray-400 font-mono mt-0.5">Appellate &amp; Trial Jurisdictions</span>
            </div>
          </TiltCard>

          {/* Metric 3: Client Representation Sectors */}
          <TiltCard maxTilt={10} scale={1.03} glowColor="rgba(212, 175, 55, 0.2)">
            <div className="w-full h-full p-3.5 sm:p-4 rounded-xs bg-[#10131c]/80 border border-gray-800/80 hover:border-[#d4af37]/60 transition-colors flex flex-col items-center justify-center preserve-3d">
              <div className="flex items-center gap-2 text-[#dbb657] mb-1 translate-z-15">
                <Shield className="w-5 h-5 text-[#dbb657]" />
                <span className="font-serif text-2xl sm:text-3xl font-bold">5</span>
              </div>
              <span className="text-xs font-semibold text-white tracking-wide translate-z-10">Client Sectors</span>
              <span className="text-[10px] text-gray-400 font-mono mt-0.5">Individuals, Corporate, NGOs, Trusts &amp; NRIs</span>
            </div>
          </TiltCard>

          {/* Metric 4: Direct Legal Helpline Access */}
          <TiltCard maxTilt={10} scale={1.03} glowColor="rgba(16, 185, 129, 0.2)">
            <div className="w-full h-full p-3.5 sm:p-4 rounded-xs bg-[#10131c]/80 border border-gray-800/80 hover:border-emerald-500/60 transition-colors flex flex-col items-center justify-center preserve-3d">
              <div className="flex items-center gap-2 text-emerald-400 mb-1 translate-z-15">
                <MessageSquare className="w-5 h-5 text-emerald-400" />
                <span className="font-serif text-base sm:text-lg font-bold">Direct Helpline</span>
              </div>
              <span className="text-xs font-semibold text-white tracking-wide translate-z-10">Instant Consultation</span>
              <a 
                href={`https://wa.me/919810703335?text=${encodeURIComponent("Hello Advocate Arunabh Banerjee, I am contacting you for legal consultation and representation.")}`}
                onClick={handleDirectNumberClick}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] text-emerald-400 hover:text-emerald-300 font-mono mt-0.5 cursor-pointer underline underline-offset-2"
                title="Chat with Chamber on WhatsApp"
              >
                +91 98107 03335 (WhatsApp &amp; Call)
              </a>
            </div>
          </TiltCard>

        </div>
      </section>

      {/* =========================================================================
          CHAMBER & OFFICE DIRECTORY (Saket Courts, CR Park, Panchsheel Enclave)
      ========================================================================= */}
      <section id="chambers" className="py-14 md:py-18 border-b border-[#d4af37]/20 relative bg-[#07090e]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          {/* Section Heading */}
          <div className="text-center space-y-2 mb-10">
            <span className="text-[11px] font-mono uppercase tracking-[0.25em] text-[#d4af37] font-semibold inline-flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-[#d4af37]" />
              Official Locations
            </span>
            <h2 className="font-serif text-2xl sm:text-4xl font-medium text-white tracking-tight">
              Chamber &amp; Office Addresses
            </h2>
            <p className="text-xs sm:text-sm text-gray-400 max-w-xl mx-auto">
              Supreme Court &amp; High Court practice chambers, primary legal office, and executive consultation suites across New Delhi.
            </p>
          </div>

          {/* Locations Grid: 3 Distinct Locations */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            
            {/* 1. Chamber: Saket Courts Complex */}
            <TiltCard maxTilt={12} scale={1.03} glowColor="rgba(212, 175, 55, 0.25)">
              <div className="w-full h-full bg-[#10131c] border border-[#d4af37]/40 hover:border-[#d4af37] rounded-xs p-5 sm:p-6 flex flex-col justify-between transition-all duration-300 hover:shadow-[0_16px_40px_rgba(212,175,55,0.25)] group preserve-3d shine-hover">
                <div className="space-y-4">
                  <div className="flex items-center justify-between translate-z-20">
                    <div className="w-10 h-10 rounded-xs bg-[#171b26] border border-[#d4af37]/50 flex items-center justify-center text-[#d4af37] group-hover:scale-120 group-hover:rotate-6 group-hover:bg-[#202538] group-hover:border-[#d4af37] group-hover:shadow-[0_0_20px_rgba(212,175,55,0.45)] transition-all duration-300 shadow-[0_0_12px_rgba(212,175,55,0.18)]">
                      <Scale className="w-5 h-5 text-[#d4af37] group-hover:text-white transition-colors" />
                    </div>
                    <span className="px-2.5 py-1 text-[10px] font-mono font-bold tracking-wider uppercase bg-[#d4af37]/15 text-[#f5d77f] border border-[#d4af37]/40 rounded-xs shadow-xs">
                      CHAMBER
                    </span>
                  </div>

                  <div className="translate-z-10">
                    <h3 className="font-serif text-lg font-bold text-white group-hover:text-[#f5d77f] transition-colors leading-snug">
                      Saket Courts Complex
                    </h3>
                    <span className="text-[11px] text-[#d4af37] font-mono block mt-0.5 font-medium">
                      Judicial Court Chamber
                    </span>
                  </div>

                  <div className="space-y-2.5 text-xs text-gray-300 border-t border-gray-800/80 pt-3 translate-z-10">
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-[#d4af37] shrink-0 mt-0.5" />
                      <p className="leading-relaxed font-sans text-gray-200">
                        {config.contacts?.saketCourtsChamber && !config.contacts.saketCourtsChamber.startsWith("Chamber 632")
                          ? config.contacts.saketCourtsChamber 
                          : "632, Lawyer's Block, Saket Courts Complex, New Delhi 110017"}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-gray-400 font-mono">
                      <Clock className="w-3.5 h-3.5 text-gray-500 shrink-0" />
                      <span>10:00 AM — 05:00 PM (Court Working Days)</span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-5 pt-3 border-t border-gray-800/80 flex items-center gap-2 translate-z-10">
                  <button
                    type="button"
                    onClick={() => copyAddress("saket", "632, Lawyer's Block, Saket Courts Complex, New Delhi 110017")}
                    className="btn-3d-dark flex-1 py-2 px-2.5 bg-[#151926] hover:bg-[#1c2233] border border-gray-700/80 hover:border-[#d4af37]/70 text-gray-300 hover:text-white rounded-xs text-[11px] font-mono flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                    title="Copy Chamber Address"
                  >
                    {copiedAddressId === "saket" ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400 font-bold">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-gray-400" />
                        <span>Copy Address</span>
                      </>
                    )}
                  </button>
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent("632, Lawyer's Block, Saket Courts Complex, New Delhi 110017")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => cmsService.trackClick("maps")}
                    className="btn-3d-dark py-2 px-3 bg-[#151926] hover:bg-[#1c2233] border border-gray-700/80 hover:border-[#d4af37] text-[#d4af37] rounded-xs text-[11px] font-mono flex items-center gap-1 transition-all cursor-pointer hover:shadow-[0_0_15px_rgba(212,175,55,0.3)]"
                    title="View on Google Maps"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Maps</span>
                  </a>
                </div>
              </div>
            </TiltCard>

            {/* 2. Office: CR Park */}
            <TiltCard maxTilt={12} scale={1.03} glowColor="rgba(16, 185, 129, 0.25)">
              <div className="w-full h-full bg-[#10131c] border border-emerald-500/40 hover:border-emerald-500/80 rounded-xs p-5 sm:p-6 flex flex-col justify-between transition-all duration-300 hover:shadow-[0_16px_40px_rgba(16,185,129,0.25)] group preserve-3d shine-hover">
                <div className="space-y-4">
                  <div className="flex items-center justify-between translate-z-20">
                    <div className="w-10 h-10 rounded-xs bg-[#171b26] border border-emerald-500/50 flex items-center justify-center text-emerald-400 group-hover:scale-120 group-hover:rotate-6 group-hover:bg-[#1b262a] group-hover:border-emerald-400 group-hover:shadow-[0_0_20px_rgba(16,185,129,0.45)] transition-all duration-300 shadow-[0_0_12px_rgba(16,185,129,0.18)]">
                      <Building2 className="w-5 h-5 text-emerald-400 group-hover:text-white transition-colors" />
                    </div>
                    <span className="px-2.5 py-1 text-[10px] font-mono font-bold tracking-wider uppercase bg-emerald-950/60 text-emerald-300 border border-emerald-500/40 rounded-xs shadow-xs">
                      OFFICE
                    </span>
                  </div>

                  <div className="translate-z-10">
                    <h3 className="font-serif text-lg font-bold text-white group-hover:text-emerald-300 transition-colors leading-snug">
                      CR Park (Chittaranjan Park)
                    </h3>
                    <span className="text-[11px] text-emerald-400 font-mono block mt-0.5 font-medium">
                      Primary Office &amp; Consultation Suite
                    </span>
                  </div>

                  <div className="space-y-2.5 text-xs text-gray-300 border-t border-gray-800/80 pt-3 translate-z-10">
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <p className="leading-relaxed font-sans text-gray-200">
                        {config.contacts?.crParkOffice || "M-18, Ground Floor, CR Park, New Delhi - 110019"}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-gray-400 font-mono">
                      <Clock className="w-3.5 h-3.5 text-gray-500 shrink-0" />
                      <span>10:00 AM — 08:30 PM (Monday – Saturday)</span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-5 pt-3 border-t border-gray-800/80 flex items-center gap-2 translate-z-10">
                  <button
                    type="button"
                    onClick={() => copyAddress("crpark", config.contacts?.crParkOffice || "M-18, Ground Floor, CR Park, New Delhi - 110019")}
                    className="btn-3d-dark flex-1 py-2 px-2.5 bg-[#151926] hover:bg-[#1c2233] border border-gray-700/80 hover:border-emerald-500/70 text-gray-300 hover:text-white rounded-xs text-[11px] font-mono flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                    title="Copy Office Address"
                  >
                    {copiedAddressId === "crpark" ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400 font-bold">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-gray-400" />
                        <span>Copy Address</span>
                      </>
                    )}
                  </button>
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(config.contacts?.crParkOffice || "M-18, Ground Floor, CR Park, New Delhi - 110019")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => cmsService.trackClick("maps")}
                    className="btn-3d-dark py-2 px-3 bg-[#151926] hover:bg-[#1c2233] border border-gray-700/80 hover:border-emerald-400 text-emerald-400 rounded-xs text-[11px] font-mono flex items-center gap-1 transition-all cursor-pointer hover:shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                    title="View on Google Maps"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Maps</span>
                  </a>
                </div>
              </div>
            </TiltCard>

            {/* 3. Also at: Panchsheel Enclave */}
            <TiltCard maxTilt={12} scale={1.03} glowColor="rgba(59, 130, 246, 0.25)">
              <div className="w-full h-full bg-[#10131c] border border-blue-500/40 hover:border-blue-500/80 rounded-xs p-5 sm:p-6 flex flex-col justify-between transition-all duration-300 hover:shadow-[0_16px_40px_rgba(59,130,246,0.25)] group preserve-3d shine-hover">
                <div className="space-y-4">
                  <div className="flex items-center justify-between translate-z-20">
                    <div className="w-10 h-10 rounded-xs bg-[#171b26] border border-blue-500/50 flex items-center justify-center text-blue-400 group-hover:scale-120 group-hover:rotate-6 group-hover:bg-[#1c2538] group-hover:border-blue-400 group-hover:shadow-[0_0_20px_rgba(59,130,246,0.45)] transition-all duration-300 shadow-[0_0_12px_rgba(59,130,246,0.18)]">
                      <Navigation className="w-5 h-5 text-blue-400 group-hover:text-white transition-colors" />
                    </div>
                    <span className="px-2.5 py-1 text-[10px] font-mono font-bold tracking-wider uppercase bg-blue-950/60 text-blue-300 border border-blue-500/40 rounded-xs shadow-xs">
                      ALSO AT
                    </span>
                  </div>

                  <div className="translate-z-10">
                    <h3 className="font-serif text-lg font-bold text-white group-hover:text-blue-300 transition-colors leading-snug">
                      Panchsheel Enclave
                    </h3>
                    <span className="text-[11px] text-blue-400 font-mono block mt-0.5 font-medium">
                      Additional Office &amp; Advisory Suite
                    </span>
                  </div>

                  <div className="space-y-2.5 text-xs text-gray-300 border-t border-gray-800/80 pt-3 translate-z-10">
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                      <p className="leading-relaxed font-sans text-gray-200">
                        {config.contacts?.panchsheelOffice || "C-81, UGF, Panchsheel Enclave, New Delhi 110017"}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-gray-400 font-mono">
                      <Clock className="w-3.5 h-3.5 text-gray-500 shrink-0" />
                      <span>By Prior Consultation Appointment</span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-5 pt-3 border-t border-gray-800/80 flex items-center gap-2 translate-z-10">
                  <button
                    type="button"
                    onClick={() => copyAddress("panchsheel", config.contacts?.panchsheelOffice || "C-81, UGF, Panchsheel Enclave, New Delhi 110017")}
                    className="btn-3d-dark flex-1 py-2 px-2.5 bg-[#151926] hover:bg-[#1c2233] border border-gray-700/80 hover:border-blue-500/70 text-gray-300 hover:text-white rounded-xs text-[11px] font-mono flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                    title="Copy Panchsheel Enclave Address"
                  >
                    {copiedAddressId === "panchsheel" ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400 font-bold">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-gray-400" />
                        <span>Copy Address</span>
                      </>
                    )}
                  </button>
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(config.contacts?.panchsheelOffice || "C-81, UGF, Panchsheel Enclave, New Delhi 110017")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => cmsService.trackClick("maps")}
                    className="btn-3d-dark py-2 px-3 bg-[#151926] hover:bg-[#1c2233] border border-gray-700/80 hover:border-blue-400 text-blue-400 rounded-xs text-[11px] font-mono flex items-center gap-1 transition-all cursor-pointer hover:shadow-[0_0_15px_rgba(59,130,246,0.3)]"
                    title="View on Google Maps"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Maps</span>
                  </a>
                </div>
              </div>
            </TiltCard>

          </div>

        </div>
      </section>



      {/* =========================================================================
          4. MINIMAL FOOTER
      ========================================================================= */}
      <footer className="py-8 bg-[#040508] border-t border-gray-800/80 text-gray-400 text-xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-5">
          
          {/* Chamber & Office Locations Quick Reference in Footer */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pb-2 border-b border-gray-800/70 text-left font-mono text-[11px]">
            <div className="p-3 bg-[#0a0d15] border border-gray-800/80 rounded-xs space-y-1">
              <span className="text-[#d4af37] font-bold block uppercase text-[10px] tracking-wider">⚖️ Chamber:</span>
              <p className="text-gray-300 font-sans text-xs">632, Lawyer's Block, Saket Courts Complex, New Delhi 110017</p>
            </div>
            <div className="p-3 bg-[#0a0d15] border border-gray-800/80 rounded-xs space-y-1">
              <span className="text-emerald-400 font-bold block uppercase text-[10px] tracking-wider">🏢 Office:</span>
              <p className="text-gray-300 font-sans text-xs">M-18, Ground Floor, CR Park, New Delhi - 110019</p>
            </div>
            <div className="p-3 bg-[#0a0d15] border border-gray-800/80 rounded-xs space-y-1">
              <span className="text-blue-400 font-bold block uppercase text-[10px] tracking-wider">📍 Also at:</span>
              <p className="text-gray-300 font-sans text-xs">C-81, UGF, Panchsheel Enclave, New Delhi 110017</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
            
            {/* Branding & Short Copyright */}
            <div className="space-y-0.5">
              <p className="font-serif text-xs font-semibold text-white tracking-wide">
                Advocate Arunabh Banerjee • Supreme Court &amp; High Court (All Courts &amp; Tribunals)
              </p>
              <div className="flex items-center flex-wrap gap-2 text-[10px] text-gray-400 font-mono">
                <span>© 2026 All Rights Reserved</span>
                <span>•</span>
                <a 
                  href={`https://wa.me/919810703335?text=${encodeURIComponent("Hello Advocate Arunabh Banerjee, I am contacting you for legal consultation and representation.")}`}
                  onClick={handleDirectNumberClick}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-emerald-400 transition-colors cursor-pointer flex items-center gap-1"
                  title="WhatsApp Direct SMS & Helpline"
                >
                  <MessageSquare className="w-2.5 h-2.5 text-emerald-400" />
                  <span>{config.contacts?.displayMobile || "+91 98107 03335"}</span>
                </a>
                <span>•</span>
                <a 
                  href={`https://mail.google.com/mail/?view=cm&fs=1&to=${config.contacts?.directEmail || "prof.abanerjee@gmail.com"}&su=${encodeURIComponent("Legal Consultation Inquiry — Advocate Arunabh Banerjee")}`}
                  onClick={handleDirectEmailClick}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-red-400 transition-colors cursor-pointer flex items-center gap-1"
                  title="Direct Gmail Compose Window"
                >
                  <Mail className="w-2.5 h-2.5 text-red-400" />
                  <span>{config.contacts?.directEmail || "prof.abanerjee@gmail.com"}</span>
                </a>
                <span>•</span>
                <button
                  type="button"
                  onClick={handleInstallApp}
                  className="text-[#d4af37]/80 hover:text-[#d4af37] transition-colors cursor-pointer inline-flex items-center gap-1"
                  title="Install Chamber App on PC or Mobile"
                >
                  <Download className="w-2.5 h-2.5" />
                  <span>Install App</span>
                </button>
                <span>•</span>
                <button
                  type="button"
                  onClick={() => setShowAdminPanel(true)}
                  className="text-gray-500 hover:text-[#d4af37] transition-colors cursor-pointer underline underline-offset-2"
                  title="Chamber Admin Portal"
                >
                  Chamber Portal
                </button>
              </div>
            </div>

            {/* Contact Developer Button (WhatsApp: 01609166109) */}
            <div className="flex items-center flex-wrap gap-2 pt-1 sm:pt-0 justify-center sm:justify-end">
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

      {/* PWA INSTALLATION MODAL FOR PC AND MOBILE */}
      {showInstallModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
          <div className="w-full max-w-md bg-[#12141c] border-2 border-[#d4af37] rounded-xs p-6 shadow-2xl relative space-y-4">
            <button
              onClick={() => setShowInstallModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white p-1 rounded-xs cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <img 
                src="/app-icon.png" 
                alt="Chamber App Icon" 
                className="w-12 h-12 rounded-xl border border-[#d4af37]/70 shadow-md object-cover"
              />
              <div>
                <h3 className="font-serif text-lg font-bold text-white tracking-wide">
                  Install Chamber App
                </h3>
                <p className="text-xs text-gray-400">Install on Windows PC, Mac, Android & iPhone</p>
              </div>
            </div>

            <div className="space-y-3 text-xs text-gray-300 max-h-[60vh] overflow-y-auto pr-1">
              <div className="p-3 bg-[#0a0b10] border border-gray-800 rounded-xs space-y-1">
                <span className="font-bold text-[#d4af37] block flex items-center gap-1.5">
                  <Laptop className="w-3.5 h-3.5" /> 💻 Windows PC, Mac & Chromebook:
                </span>
                <p>1. Look at your browser address bar (top right) and click the <strong className="text-white">Install icon</strong> (computer screen with down arrow) or click browser menu (⋮) → <strong className="text-white">"Install Advocate Arunabh Banerjee"</strong>.</p>
                <p>2. Click <strong className="text-white">"Install"</strong>.</p>
                <p>3. Opens in a high-speed desktop window with taskbar pinning and instant consultation access.</p>
              </div>

              <div className="p-3 bg-[#0a0b10] border border-gray-800 rounded-xs space-y-1">
                <span className="font-bold text-[#d4af37] block flex items-center gap-1.5">
                  <Smartphone className="w-3.5 h-3.5" /> 📱 Android & Google Chrome:
                </span>
                <p>1. Tap the three dots menu (⋮) in your browser top right corner.</p>
                <p>2. Select <strong className="text-white">"Install app"</strong> or <strong className="text-white">"Add to Home screen"</strong>.</p>
                <p>3. The official Chamber App icon will appear on your phone home screen.</p>
              </div>

              <div className="p-3 bg-[#0a0b10] border border-gray-800 rounded-xs space-y-1">
                <span className="font-bold text-[#d4af37] block">🍏 Apple iPhone & iPad (Safari):</span>
                <p>1. Tap the <strong className="text-white">Share button</strong> (square with arrow pointing up) at the bottom.</p>
                <p>2. Scroll down and tap <strong className="text-white">"Add to Home Screen"</strong>.</p>
                <p>3. Tap <strong className="text-white">Add</strong> in top right. You're done!</p>
              </div>
            </div>

            <div className="flex flex-col gap-2 pt-2">
              {deferredInstallPrompt && (
                <button
                  onClick={() => {
                    deferredInstallPrompt.prompt();
                    deferredInstallPrompt.userChoice.then((choiceResult: any) => {
                      if (choiceResult.outcome === "accepted") {
                        setIsAppInstalled(true);
                        setShowInstallModal(false);
                      }
                      setDeferredInstallPrompt(null);
                    });
                  }}
                  className="w-full py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-black font-bold uppercase tracking-wider text-xs rounded-xs hover:brightness-110 transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg"
                >
                  <Download className="w-4 h-4 text-black" />
                  Install App Now (1-Click)
                </button>
              )}
              <button
                onClick={() => setShowInstallModal(false)}
                className="w-full py-2.5 bg-gradient-to-r from-[#dbb657] to-[#b28d2f] text-black font-bold uppercase tracking-wider text-xs rounded-xs hover:opacity-90 transition-opacity cursor-pointer"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
