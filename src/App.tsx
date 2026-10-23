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
  Clock, 
  MapPin, 
  Shield, 
  Users, 
  Briefcase, 
  Gavel, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Menu, 
  X, 
  ArrowRight, 
  ExternalLink, 
  Lock,
  Copy,
  Check
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
// @ts-ignore
import arunabhPortrait from "./assets/images/Arunabh_Banerjee.jpeg";
import AdminPanel from "./components/AdminPanel";
import { cmsService } from "./services/cmsService";
import { LeadItem } from "./types/cms";

const PRACTICE_AREAS = [
  {
    id: "criminal",
    title: "Criminal Defense & Bail",
    description: "Trial defense preparation, regular & anticipatory bail, POCSO defense, and urgent remand protection.",
    icon: Shield
  },
  {
    id: "matrimonial",
    title: "Matrimonial & Family Disputes",
    description: "Contested divorce proceedings, maintenance, child custody, and domestic violence defense.",
    icon: Users
  },
  {
    id: "commercial",
    title: "Commercial Litigation",
    description: "Contractual disputes, corporate recovery suits, commercial arbitration, and business litigation.",
    icon: Briefcase
  },
  {
    id: "constitutional",
    title: "Constitutional & Appellate Advocacy",
    description: "Special Leave Petitions (SLPs) and Writ Petitions under Article 32 & 226 before High Courts and Supreme Court.",
    icon: Gavel
  },
  {
    id: "ni_act",
    title: "Section 138 Negotiable Instruments Act",
    description: "Statutory cheque dishonour prosecution, financial liability defense, and compounding settlements.",
    icon: FileText
  },
  {
    id: "human_rights",
    title: "Human Rights & Civil Liberties",
    description: "Protection of constitutional freedoms, remedies against unlawful detention, and undertrial civil defense.",
    icon: Scale
  }
];

const TIME_SLOTS = [
  "10:00 AM – 11:00 AM",
  "11:30 AM – 12:30 PM",
  "02:00 PM – 03:00 PM",
  "03:30 PM – 04:30 PM",
  "05:00 PM – 06:00 PM",
  "06:30 PM – 07:30 PM"
];

export default function App() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    practiceArea: "",
    date: "",
    timeSlot: "",
    description: ""
  });

  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState<LeadItem | null>(null);
  const [copiedRef, setCopiedRef] = useState(false);
  const [bookedSlotsForDate, setBookedSlotsForDate] = useState<string[]>([]);

  // Unique IDs for form accessibility
  const nameInputId = useId();
  const phoneInputId = useId();
  const practiceAreaSelectId = useId();
  const dateInputId = useId();
  const descriptionTextareaId = useId();

  // Get minimum date (today) in YYYY-MM-DD
  const todayISO = new Date().toISOString().split("T")[0];

  // Initialize default date (tomorrow or today)
  useEffect(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split("T")[0];
    setFormData(prev => ({
      ...prev,
      date: prev.date || tomorrowStr
    }));
  }, []);

  // Update booked slots whenever selected date changes
  useEffect(() => {
    if (formData.date) {
      const booked = cmsService.getBookedSlots(formData.date);
      setBookedSlotsForDate(booked);
      // Reset selected slot if it became unavailable
      if (formData.timeSlot && booked.includes(formData.timeSlot)) {
        setFormData(prev => ({ ...prev, timeSlot: "" }));
      }
    } else {
      setBookedSlotsForDate([]);
    }
  }, [formData.date]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (formError) setFormError("");
  };

  const handleSlotSelect = (slot: string) => {
    if (bookedSlotsForDate.includes(slot)) return;
    setFormData(prev => ({ ...prev, timeSlot: slot }));
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

    if (!formData.practiceArea) {
      setFormError("Please select a relevant Practice Area.");
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

    if (!formData.timeSlot) {
      setFormError("Please select an available time slot.");
      return;
    }

    // Check duplicate slot booking
    if (cmsService.isSlotBooked(formData.date, formData.timeSlot)) {
      setFormError("This time slot has just been reserved. Please select another slot or date.");
      setBookedSlotsForDate(cmsService.getBookedSlots(formData.date));
      return;
    }

    setIsSubmitting(true);

    try {
      // Save persistently via cmsService (stores in localStorage and Firestore if enabled)
      const savedLead = await cmsService.addLead({
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        caseType: formData.practiceArea,
        date: formData.date,
        timeSlot: formData.timeSlot,
        message: formData.description.trim(),
        isUrgent: false
      });

      setConfirmedBooking(savedLead);
      // Refresh booked slots list
      setBookedSlotsForDate(cmsService.getBookedSlots(formData.date));

      // Reset form fields
      setFormData({
        name: "",
        phone: "",
        practiceArea: "",
        date: formData.date,
        timeSlot: "",
        description: ""
      });
    } catch (err) {
      console.error("Booking error:", err);
      setFormError("Unable to record booking at this time. Please call or WhatsApp chamber directly.");
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
    <div className="min-h-screen bg-[#0b0d14] text-gray-200 font-sans selection:bg-[#dbb657] selection:text-black antialiased relative">
      
      {/* =========================================================================
          1. HEADER
      ========================================================================= */}
      <header className="sticky top-0 z-40 bg-[#0b0d14]/90 backdrop-blur-md border-b border-[#dbb657]/20 transition-all duration-300">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          
          {/* Advocate Branding */}
          <a 
            href="#home" 
            onClick={(e) => { e.preventDefault(); scrollToSection("home"); }}
            className="flex flex-col group focus:outline-none"
          >
            <span className="font-serif text-lg sm:text-xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-[#f3e7c4] via-[#dbb657] to-[#b28d2f] group-hover:brightness-110 transition-all">
              Advocate Arunabh Banerjee
            </span>
            <span className="text-[10px] sm:text-[11px] uppercase tracking-[0.2em] text-[#dbb657]/80 font-medium font-sans">
              Supreme Court Advocate
            </span>
          </a>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <button
              onClick={() => scrollToSection("home")}
              className="text-xs uppercase tracking-widest text-gray-300 hover:text-[#dbb657] transition-colors focus:outline-none"
            >
              Home
            </button>
            <button
              onClick={() => scrollToSection("practice")}
              className="text-xs uppercase tracking-widest text-gray-300 hover:text-[#dbb657] transition-colors focus:outline-none"
            >
              Practice Areas
            </button>
            <button
              onClick={() => scrollToSection("contact")}
              className="text-xs uppercase tracking-widest text-gray-300 hover:text-[#dbb657] transition-colors focus:outline-none"
            >
              Contact
            </button>

            {/* Prominent CTA */}
            <button
              onClick={() => scrollToSection("booking")}
              className="bg-gradient-to-r from-[#b28d2f] via-[#dbb657] to-[#b28d2f] text-black font-semibold text-xs tracking-wider uppercase px-5 py-2.5 rounded-sm shadow-[0_0_15px_rgba(219,182,87,0.25)] hover:shadow-[0_0_20px_rgba(219,182,87,0.45)] hover:brightness-105 active:scale-[0.98] transition-all flex items-center gap-2"
            >
              <Calendar className="w-3.5 h-3.5" />
              Book Appointment
            </button>
          </nav>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-3">
            <button
              onClick={() => scrollToSection("booking")}
              className="bg-gradient-to-r from-[#b28d2f] via-[#dbb657] to-[#b28d2f] text-black font-semibold text-[11px] tracking-wider uppercase px-3.5 py-2 rounded-sm"
            >
              Book
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-gray-300 hover:text-[#dbb657] border border-[#dbb657]/30 rounded-sm focus:outline-none"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5 text-[#dbb657]" /> : <Menu className="w-5 h-5 text-[#dbb657]" />}
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
              className="md:hidden bg-[#0e1017] border-b border-[#dbb657]/20 px-6 py-5 space-y-4"
            >
              <button
                onClick={() => scrollToSection("home")}
                className="block w-full text-left text-sm uppercase tracking-wider text-gray-300 hover:text-[#dbb657] py-2 border-b border-gray-800"
              >
                Home
              </button>
              <button
                onClick={() => scrollToSection("practice")}
                className="block w-full text-left text-sm uppercase tracking-wider text-gray-300 hover:text-[#dbb657] py-2 border-b border-gray-800"
              >
                Practice Areas
              </button>
              <button
                onClick={() => scrollToSection("contact")}
                className="block w-full text-left text-sm uppercase tracking-wider text-gray-300 hover:text-[#dbb657] py-2 border-b border-gray-800"
              >
                Contact
              </button>
              <button
                onClick={() => scrollToSection("booking")}
                className="w-full bg-gradient-to-r from-[#b28d2f] via-[#dbb657] to-[#b28d2f] text-black font-bold text-xs tracking-wider uppercase py-3 rounded-sm flex items-center justify-center gap-2 mt-2"
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
      <section id="home" className="relative pt-12 pb-16 md:pt-20 md:pb-24 overflow-hidden border-b border-[#dbb657]/15">
        
        {/* Subtle ambient gold radial background glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-[#dbb657]/5 blur-[120px] pointer-events-none rounded-full" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            
            {/* Left Content (desktop) / Top Content (mobile) */}
            <div className="lg:col-span-7 space-y-6 text-left">
              
              {/* Supreme Court Authority Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-[#dbb657]/30 bg-[#141722]/80">
                <Scale className="w-3.5 h-3.5 text-[#dbb657]" />
                <span className="text-[11px] font-medium tracking-widest uppercase text-[#dbb657]">
                  Supreme Court of India &amp; Delhi High Court
                </span>
              </div>

              {/* Advocate Title & Name */}
              <div className="space-y-1.5">
                <span className="text-xs sm:text-sm uppercase tracking-[0.25em] text-gray-400 font-semibold block">
                  Senior Counsel
                </span>
                <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-medium tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-[#f3e7c4] via-[#dbb657] to-[#b28d2f] leading-[1.1]">
                  Arunabh Banerjee
                </h1>
                <p className="text-base sm:text-lg text-[#dbb657] font-serif tracking-wide pt-1">
                  Supreme Court Advocate
                </p>
              </div>

              {/* Short Description */}
              <p className="text-sm sm:text-base text-gray-300 leading-relaxed max-w-xl">
                Legal consultation and representation across criminal, matrimonial, commercial, constitutional, and human rights matters.
              </p>

              {/* Prominent Phone Highlight */}
              <div className="flex items-center gap-3 pt-1">
                <div className="w-9 h-9 rounded-full bg-[#161a25] border border-[#dbb657]/40 flex items-center justify-center text-[#dbb657]">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-gray-400 block font-mono">
                    Direct Chamber Helpline
                  </span>
                  <a 
                    href="tel:+919810703335" 
                    className="text-base sm:text-lg font-mono font-bold text-white hover:text-[#dbb657] transition-colors"
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
                  className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-sm border border-[#dbb657]/60 text-[#f3e7c4] hover:bg-[#dbb657]/10 text-xs uppercase tracking-wider font-semibold active:scale-[0.98] transition-all"
                >
                  <Phone className="w-3.5 h-3.5 text-[#dbb657]" />
                  Call Now
                </a>

                {/* 2. WhatsApp */}
                <a
                  href="https://wa.me/919810703335"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-sm border border-emerald-500/50 bg-emerald-950/20 text-emerald-400 hover:bg-emerald-900/30 text-xs uppercase tracking-wider font-semibold active:scale-[0.98] transition-all shadow-[0_0_15px_rgba(16,185,129,0.1)]"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                  WhatsApp
                </a>

                {/* 3. Book Appointment */}
                <button
                  onClick={() => scrollToSection("booking")}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-sm bg-gradient-to-r from-[#b28d2f] via-[#dbb657] to-[#b28d2f] text-black font-bold text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(219,182,87,0.3)] hover:brightness-110 active:scale-[0.98] transition-all"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  Book Appointment
                </button>

              </div>

            </div>

            {/* Right Advocate Portrait (desktop) / Stacked (mobile) */}
            <div className="lg:col-span-5 flex justify-center lg:justify-end">
              <div className="relative max-w-xs sm:max-w-sm w-full group">
                
                {/* Elegant Double Gold Framing */}
                <div className="absolute -inset-1.5 bg-gradient-to-b from-[#dbb657]/40 via-[#b28d2f]/20 to-transparent rounded-sm blur-[1px] group-hover:from-[#dbb657]/60 transition-all duration-500" />
                
                <div className="relative border border-[#dbb657]/50 bg-[#12151e] p-2.5 rounded-sm shadow-2xl">
                  
                  {/* Decorative Classical Corner Accents */}
                  <div className="absolute top-1 left-1 w-3 h-3 border-t border-l border-[#dbb657]" />
                  <div className="absolute top-1 right-1 w-3 h-3 border-t border-r border-[#dbb657]" />
                  <div className="absolute bottom-1 left-1 w-3 h-3 border-b border-l border-[#dbb657]" />
                  <div className="absolute bottom-1 right-1 w-3 h-3 border-b border-r border-[#dbb657]" />

                  {/* Existing Real Advocate Image */}
                  <img
                    src={arunabhPortrait}
                    alt="Advocate Arunabh Banerjee, Supreme Court of India Advocate"
                    className="w-full aspect-[4/5] object-cover rounded-xs filter contrast-[1.05] brightness-[0.98]"
                    loading="eager"
                  />

                  {/* Caption Banner */}
                  <div className="mt-3 pt-2.5 border-t border-[#dbb657]/20 text-center">
                    <p className="font-serif text-xs font-semibold text-[#dbb657] tracking-wider uppercase">
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
          3. PRACTICE AREAS
      ========================================================================= */}
      <section id="practice" className="py-16 md:py-20 border-b border-[#dbb657]/15 bg-[#0e1017]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Section Header */}
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
            <span className="text-[11px] font-mono uppercase tracking-[0.25em] text-[#dbb657] font-semibold">
              Legal Expertise
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-medium text-white tracking-tight">
              Practice Areas
            </h2>
            <p className="text-xs sm:text-sm text-gray-400">
              Focused litigation counsel and trial representation across key judicial domains.
            </p>
          </div>

          {/* 6 Compact Practice Areas Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {PRACTICE_AREAS.map((item) => {
              const IconComp = item.icon;
              return (
                <div
                  key={item.id}
                  className="bg-[#12151f] border border-[#dbb657]/20 hover:border-[#dbb657]/60 p-5 rounded-sm transition-all duration-200 hover:-translate-y-1 shadow-sm hover:shadow-[0_4px_20px_rgba(219,182,87,0.12)] flex flex-col justify-between group"
                >
                  <div className="space-y-3">
                    <div className="w-9 h-9 rounded-sm bg-[#181c28] border border-[#dbb657]/30 flex items-center justify-center text-[#dbb657] group-hover:scale-105 transition-transform">
                      <IconComp className="w-4 h-4" />
                    </div>
                    <h3 className="font-serif text-base font-semibold text-gray-100 group-hover:text-[#dbb657] transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-xs text-gray-400 leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  <div className="pt-4 mt-4 border-t border-gray-800/80 flex items-center justify-between">
                    <span className="text-[10px] uppercase font-mono tracking-wider text-gray-400">
                      Chamber Advisory
                    </span>
                    <button
                      onClick={() => {
                        setFormData(prev => ({ ...prev, practiceArea: item.title }));
                        scrollToSection("booking");
                      }}
                      className="text-[11px] text-[#dbb657] hover:underline font-medium flex items-center gap-1 focus:outline-none"
                    >
                      Book Case
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* =========================================================================
          4. APPOINTMENT BOOKING — THE MAIN FEATURE
      ========================================================================= */}
      <section id="booking" className="py-16 md:py-24 border-b border-[#dbb657]/15 relative">
        
        {/* Subtle background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-[#dbb657]/5 blur-[150px] pointer-events-none rounded-full" />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          {/* Section Heading */}
          <div className="text-center space-y-2 mb-10">
            <span className="text-[11px] font-mono uppercase tracking-[0.25em] text-[#dbb657] font-semibold inline-flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-[#dbb657]" />
              Direct Chamber Access
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-medium text-white tracking-tight">
              Book Legal Consultation
            </h2>
            <p className="text-xs sm:text-sm text-gray-400 max-w-xl mx-auto">
              Schedule an in-person briefing at Supreme Court / Saket Chambers or secure a virtual legal conference.
            </p>
          </div>

          {/* Booking Container */}
          <div className="bg-[#11141d] border border-[#dbb657]/40 rounded-sm p-6 sm:p-10 shadow-[0_10px_40px_rgba(0,0,0,0.5)]">
            
            {/* Case: Booking Confirmed Banner */}
            {confirmedBooking ? (
              <div className="text-center py-6 space-y-6">
                
                <div className="w-16 h-16 rounded-full bg-emerald-950/40 border border-emerald-500/50 flex items-center justify-center mx-auto text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                  <CheckCircle2 className="w-9 h-9" />
                </div>

                <div className="space-y-1.5">
                  <span className="text-xs font-mono uppercase tracking-widest text-emerald-400 font-semibold">
                    Booking Successfully Saved &amp; Queued
                  </span>
                  <h3 className="font-serif text-2xl sm:text-3xl text-white font-medium">
                    Consultation Slot Confirmed
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-400 max-w-md mx-auto">
                    Your appointment has been securely stored in the chamber calendar. The advocate's clerk will verify the schedule.
                  </p>
                </div>

                {/* Booking Details Card */}
                <div className="max-w-md mx-auto bg-[#171a26] border border-[#dbb657]/30 rounded-sm p-5 text-left space-y-3 font-mono text-xs">
                  
                  <div className="flex items-center justify-between pb-2 border-b border-gray-800">
                    <span className="text-gray-400 uppercase text-[10px]">Reference ID</span>
                    <button
                      onClick={() => copyReferenceNumber(confirmedBooking.id)}
                      className="inline-flex items-center gap-1.5 text-[#dbb657] hover:underline font-bold"
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
                    <span className="text-gray-400">Practice Area:</span>
                    <span className="text-[#dbb657] font-semibold">{confirmedBooking.caseType}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Reserved Date:</span>
                    <span className="text-white">{confirmedBooking.date}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Time Slot:</span>
                    <span className="text-emerald-400 font-semibold">{confirmedBooking.timeSlot}</span>
                  </div>

                </div>

                {/* Next Steps Buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2 max-w-md mx-auto">
                  
                  <a
                    href={`https://wa.me/919810703335?text=${encodeURIComponent(
                      `Hello Advocate Arunabh Banerjee, I have scheduled an appointment on arunabhbanerjee.com.\n\nBooking ID: ${confirmedBooking.id}\nName: ${confirmedBooking.name}\nDate: ${confirmedBooking.date}\nTime Slot: ${confirmedBooking.timeSlot}\nPractice Area: ${confirmedBooking.caseType}`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-sm border border-emerald-500/50 bg-emerald-950/30 text-emerald-300 hover:bg-emerald-900/40 text-xs uppercase tracking-wider font-semibold transition-all"
                  >
                    <MessageSquare className="w-4 h-4 text-emerald-400" />
                    Notify on WhatsApp
                  </a>

                  <button
                    onClick={() => setConfirmedBooking(null)}
                    className="w-full sm:w-auto px-5 py-3 rounded-sm border border-[#dbb657]/40 text-gray-300 hover:text-white hover:bg-[#dbb657]/10 text-xs uppercase tracking-wider font-semibold transition-all"
                  >
                    Book Another
                  </button>

                </div>

              </div>
            ) : (
              /* Case: Booking Form */
              <form onSubmit={handleBookingSubmit} className="space-y-6">
                
                {/* Error Banner */}
                {formError && (
                  <div className="p-3.5 bg-red-950/40 border border-red-500/50 rounded-sm text-red-300 text-xs flex items-start gap-2.5">
                    <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                    <span>{formError}</span>
                  </div>
                )}

                {/* Row 1: Full Name & Phone Number */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  
                  {/* Full Name */}
                  <div className="space-y-1.5">
                    <label htmlFor={nameInputId} className="block text-xs uppercase tracking-wider text-gray-300 font-medium">
                      Full Name <span className="text-[#dbb657]">*</span>
                    </label>
                    <input
                      id={nameInputId}
                      type="text"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="e.g. Rajesh Sharma"
                      className="w-full bg-[#181c28] border border-gray-700 focus:border-[#dbb657] rounded-sm px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none transition-colors"
                    />
                  </div>

                  {/* Phone Number with country code */}
                  <div className="space-y-1.5">
                    <label htmlFor={phoneInputId} className="block text-xs uppercase tracking-wider text-gray-300 font-medium">
                      Phone Number with Country Code <span className="text-[#dbb657]">*</span>
                    </label>
                    <input
                      id={phoneInputId}
                      type="tel"
                      name="phone"
                      required
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="e.g. +91 98123 45678"
                      className="w-full bg-[#181c28] border border-gray-700 focus:border-[#dbb657] rounded-sm px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none transition-colors"
                    />
                  </div>

                </div>

                {/* Row 2: Practice Area & Preferred Date */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  
                  {/* Practice Area Dropdown */}
                  <div className="space-y-1.5">
                    <label htmlFor={practiceAreaSelectId} className="block text-xs uppercase tracking-wider text-gray-300 font-medium">
                      Practice Area <span className="text-[#dbb657]">*</span>
                    </label>
                    <select
                      id={practiceAreaSelectId}
                      name="practiceArea"
                      required
                      value={formData.practiceArea}
                      onChange={handleInputChange}
                      className="w-full bg-[#181c28] border border-gray-700 focus:border-[#dbb657] rounded-sm px-4 py-2.5 text-sm text-white focus:outline-none transition-colors"
                    >
                      <option value="" disabled>Select Practice Area</option>
                      {PRACTICE_AREAS.map(p => (
                        <option key={p.id} value={p.title}>{p.title}</option>
                      ))}
                      <option value="General Legal Consultation">General Legal Consultation</option>
                    </select>
                  </div>

                  {/* Preferred Appointment Date */}
                  <div className="space-y-1.5">
                    <label htmlFor={dateInputId} className="block text-xs uppercase tracking-wider text-gray-300 font-medium">
                      Preferred Appointment Date <span className="text-[#dbb657]">*</span>
                    </label>
                    <input
                      id={dateInputId}
                      type="date"
                      name="date"
                      required
                      min={todayISO}
                      value={formData.date}
                      onChange={handleInputChange}
                      className="w-full bg-[#181c28] border border-gray-700 focus:border-[#dbb657] rounded-sm px-4 py-2.5 text-sm text-white focus:outline-none transition-colors font-mono"
                    />
                  </div>

                </div>

                {/* Available Time Slots Selection */}
                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs uppercase tracking-wider text-gray-300 font-medium">
                      Available Time Slot <span className="text-[#dbb657]">*</span>
                    </label>
                    <span className="text-[10px] font-mono text-gray-400">
                      {bookedSlotsForDate.length > 0 ? `${bookedSlotsForDate.length} slot(s) reserved for date` : "All slots currently open"}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {TIME_SLOTS.map((slot) => {
                      const isBooked = bookedSlotsForDate.includes(slot);
                      const isSelected = formData.timeSlot === slot;

                      return (
                        <button
                          key={slot}
                          type="button"
                          disabled={isBooked}
                          onClick={() => handleSlotSelect(slot)}
                          className={`px-3 py-2.5 rounded-sm text-xs font-mono transition-all text-center flex items-center justify-center gap-1.5 border ${
                            isBooked
                              ? "bg-gray-900/50 border-gray-800 text-gray-600 cursor-not-allowed line-through"
                              : isSelected
                              ? "bg-[#dbb657] border-[#dbb657] text-black font-bold shadow-[0_0_12px_rgba(219,182,87,0.3)]"
                              : "bg-[#181c28] border-gray-700/80 text-gray-300 hover:border-[#dbb657]/70 hover:text-white"
                          }`}
                        >
                          <Clock className={`w-3 h-3 ${isSelected ? "text-black" : isBooked ? "text-gray-600" : "text-[#dbb657]"}`} />
                          <span>{slot}</span>
                          {isBooked && <span className="text-[9px] uppercase tracking-wider block text-red-500/80">(Booked)</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Brief Case Description (optional) */}
                <div className="space-y-1.5 pt-1">
                  <label htmlFor={descriptionTextareaId} className="block text-xs uppercase tracking-wider text-gray-300 font-medium">
                    Brief Case Description <span className="text-gray-500 font-normal">(Optional)</span>
                  </label>
                  <textarea
                    id={descriptionTextareaId}
                    name="description"
                    rows={3}
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Briefly state court jurisdiction, matter type, or upcoming hearing date..."
                    className="w-full bg-[#181c28] border border-gray-700 focus:border-[#dbb657] rounded-sm px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none transition-colors resize-none"
                  />
                </div>

                {/* Submit Booking Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-gradient-to-r from-[#b28d2f] via-[#dbb657] to-[#b28d2f] text-black font-bold text-xs uppercase tracking-widest py-3.5 rounded-sm shadow-[0_0_20px_rgba(219,182,87,0.25)] hover:shadow-[0_0_30px_rgba(219,182,87,0.45)] hover:brightness-105 active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                        Saving &amp; Verifying Slot...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-black" />
                        Confirm Consultation Booking
                      </>
                    )}
                  </button>
                  <p className="text-[10px] text-gray-400 text-center mt-2.5">
                    Client privacy protected • Information securely stored for chamber scheduling.
                  </p>
                </div>

              </form>
            )}

          </div>

        </div>
      </section>

      {/* =========================================================================
          5. CONTACT & CHAMBERS
      ========================================================================= */}
      <section id="contact" className="py-16 md:py-20 border-b border-[#dbb657]/15 bg-[#0e1017]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
            <span className="text-[11px] font-mono uppercase tracking-[0.25em] text-[#dbb657] font-semibold">
              Chamber Directory
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-medium text-white tracking-tight">
              Contact &amp; Chambers
            </h2>
            <p className="text-xs sm:text-sm text-gray-400">
              Chambers situated within premier capital judicial complexes.
            </p>
          </div>

          {/* 2 Compact Chamber Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            
            {/* 1. Supreme Court Compound Office */}
            <div className="bg-[#12151f] border border-[#dbb657]/30 hover:border-[#dbb657]/70 p-6 rounded-sm transition-all shadow-sm flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-sm bg-[#191d2a] border border-[#dbb657]/40 flex items-center justify-center text-[#dbb657]">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[#dbb657]">
                      Apex Court Chamber
                    </span>
                    <h3 className="font-serif text-base font-semibold text-white">
                      Supreme Court Compound Office
                    </h3>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-gray-300 leading-relaxed pl-1">
                  Chamber No. 25, Old Lawyers Block, Supreme Court of India, New Delhi – 110001.
                </p>

                <div className="text-[11px] font-mono text-gray-400 flex items-center gap-2 pl-1">
                  <Clock className="w-3.5 h-3.5 text-[#dbb657]" />
                  <span>10:00 AM – 05:00 PM (Court Working Days)</span>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-800 flex items-center gap-3">
                <a
                  href="tel:+919810703335"
                  className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 border border-[#dbb657]/40 text-[#f3e7c4] hover:bg-[#dbb657]/10 text-xs font-semibold rounded-sm transition-colors"
                >
                  <Phone className="w-3 h-3 text-[#dbb657]" />
                  Call Office
                </a>
                <a
                  href="https://maps.google.com/?q=Supreme+Court+of+India+New+Delhi"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-1.5 py-2 px-3 border border-gray-700 text-gray-300 hover:text-white hover:border-gray-500 text-xs rounded-sm transition-colors"
                >
                  <ExternalLink className="w-3 h-3 text-[#dbb657]" />
                  Maps
                </a>
              </div>
            </div>

            {/* 2. Saket District Courts Chamber */}
            <div className="bg-[#12151f] border border-[#dbb657]/30 hover:border-[#dbb657]/70 p-6 rounded-sm transition-all shadow-sm flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-sm bg-[#191d2a] border border-[#dbb657]/40 flex items-center justify-center text-[#dbb657]">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[#dbb657]">
                      District Complex Chamber
                    </span>
                    <h3 className="font-serif text-base font-semibold text-white">
                      Saket District Courts Chamber
                    </h3>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-gray-300 leading-relaxed pl-1">
                  Chamber 632, Lawyers Block, Saket Courts Complex, New Delhi – 110017.
                </p>

                <div className="text-[11px] font-mono text-gray-400 flex items-center gap-2 pl-1">
                  <Clock className="w-3.5 h-3.5 text-[#dbb657]" />
                  <span>02:00 PM – 07:30 PM (Monday – Saturday)</span>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-800 flex items-center gap-3">
                <a
                  href="tel:+919810703335"
                  className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 border border-[#dbb657]/40 text-[#f3e7c4] hover:bg-[#dbb657]/10 text-xs font-semibold rounded-sm transition-colors"
                >
                  <Phone className="w-3 h-3 text-[#dbb657]" />
                  Call Chamber
                </a>
                <a
                  href="https://maps.google.com/?q=Saket+Courts+Complex+New+Delhi"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-1.5 py-2 px-3 border border-gray-700 text-gray-300 hover:text-white hover:border-gray-500 text-xs rounded-sm transition-colors"
                >
                  <ExternalLink className="w-3 h-3 text-[#dbb657]" />
                  Maps
                </a>
              </div>
            </div>

          </div>

          {/* Quick Direct Communications Strip */}
          <div className="mt-8 max-w-4xl mx-auto p-4 bg-[#141722] border border-[#dbb657]/20 rounded-sm flex flex-wrap items-center justify-between gap-4 text-xs font-mono">
            <div className="flex items-center gap-2 text-gray-300">
              <Phone className="w-4 h-4 text-[#dbb657]" />
              <span>Direct Phone:</span>
              <a href="tel:+919810703335" className="text-[#dbb657] font-bold hover:underline">+91 98107 03335</a>
            </div>

            <div className="flex items-center gap-2 text-gray-300">
              <MessageSquare className="w-4 h-4 text-emerald-400" />
              <span>WhatsApp:</span>
              <a href="https://wa.me/919810703335" target="_blank" rel="noopener noreferrer" className="text-emerald-400 font-bold hover:underline">
                +91 98107 03335
              </a>
            </div>

            <div className="text-gray-400 text-[11px]">
              Chamber email: chamber.arunabh.banerjee@gmail.com
            </div>
          </div>

        </div>
      </section>

      {/* =========================================================================
          6. MINIMAL FOOTER
      ========================================================================= */}
      <footer className="py-10 bg-[#090a0f] text-gray-400 text-xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-6 border-b border-gray-800">
            <div>
              <p className="font-serif text-sm font-semibold text-white tracking-wide">
                Advocate Arunabh Banerjee
              </p>
              <p className="text-[11px] text-[#dbb657] font-mono tracking-wider uppercase">
                Supreme Court Advocate
              </p>
            </div>

            <div className="flex items-center gap-6 text-xs font-mono">
              <a href="tel:+919810703335" className="hover:text-[#dbb657] transition-colors flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-[#dbb657]" />
                +91 98107 03335
              </a>
              <a href="https://wa.me/919810703335" target="_blank" rel="noopener noreferrer" className="hover:text-emerald-400 transition-colors flex items-center gap-1.5">
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
            <button
              onClick={() => setShowAdminPanel(true)}
              className="inline-flex items-center gap-1 text-gray-400 hover:text-[#dbb657] transition-colors focus:outline-none"
              title="Chamber Portal Clerk Login"
            >
              <Lock className="w-3 h-3" />
              Chamber Portal
            </button>
          </div>

        </div>
      </footer>

      {/* Admin Panel Modal (for reviewing & exporting bookings) */}
      {showAdminPanel && (
        <AdminPanel onClose={() => setShowAdminPanel(false)} />
      )}

    </div>
  );
}
