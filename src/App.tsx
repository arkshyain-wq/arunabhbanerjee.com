/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  Scale, 
  Gavel, 
  BookOpen, 
  HeartHandshake, 
  MapPin, 
  Phone, 
  Shield, 
  Globe, 
  Search, 
  Sparkles, 
  Clock, 
  Calendar, 
  ArrowRight, 
  CheckCircle2, 
  Menu, 
  X, 
  ChevronRight, 
  Download, 
  Award, 
  Check, 
  BookMarked,
  Building,
  User,
  Share2,
  Copy,
  Sun,
  Moon,
  MessageSquare,
  AlertCircle,
  Lock,
  Settings
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { translations, PracticeArea, NotableMatter, ChamberLocation } from "./translations";
// @ts-ignore
import arunabhPortrait from "./assets/images/Arunabh_Banerjee.jpeg";
// @ts-ignore
import defaultArunabhPortrait from "./assets/images/arunabh_portrait_1781436119050.jpg";
import AdminPanel from "./components/AdminPanel";
import { cmsService } from "./services/cmsService";
import { SiteCMSConfig } from "./types/cms";

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1,
    }
  }
};

const cardVariants = {
  hidden: { 
    opacity: 0, 
    y: 50, 
    scale: 0.96 
  },
  show: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: {
      type: "spring",
      damping: 25,
      stiffness: 120,
      duration: 0.7
    }
  }
};

export default function App() {
  const [toasts, setToasts] = useState<Array<{ id: string; message: string; type: 'success' | 'error' | 'info' }>>([]);

  const addToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 5000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  const [lang, setLang] = useState<'EN' | 'HI'>('EN');
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [selectedPractice, setSelectedPractice] = useState<string>("criminal");
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab ] = useState<string>("all");
  const [isFormSubmitting, setIsFormSubmitting] = useState(false);
  const [submissionStep, setSubmissionStep] = useState("");
  
  // Consultation form state
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    caseType: "criminal",
    message: "",
  });
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [lastSubmittedData, setLastSubmittedData] = useState<any | null>(null);
  const [existingRequests, setExistingRequests] = useState<any[]>([]);

  // Magic mouse interactive states
  const [mousePos, setMousePos] = useState({ x: -200, y: -200 });
  const [lagMousePos, setLagMousePos] = useState({ x: -200, y: -200 });
  const [isHovered, setIsHovered] = useState(false);
  const [sparkles, setSparkles] = useState<Array<{ id: number; x: number; y: number; size: number; color: string }>>([]);

  // Mouse move and trail particle animation listener
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
      
      // Spawn golden sparkles occasionally during movement
      if (Math.random() < 0.15) {
        const colors = ["#dbb657", "#f3e7c4", "#e8c973", "#b28d2f"];
        const color = colors[Math.floor(Math.random() * colors.length)];
        const id = Date.now() + Math.random();
        
        setSparkles((prev) => [
          ...prev.slice(-12),
          { id, x: e.clientX, y: e.clientY, size: Math.random() * 5 + 3, color }
        ]);

        // Automatically clear sparkles after animation lifecycle
        setTimeout(() => {
          setSparkles((prev) => prev.filter((s) => s.id !== id));
        }, 800);
      }
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'A' || 
        target.tagName === 'BUTTON' || 
        target.closest('button') || 
        target.closest('a') ||
        target.classList.contains('cursor-pointer') ||
        target.onclick
      ) {
        setIsHovered(true);
      } else {
        setIsHovered(false);
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseover", handleMouseOver);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseover", handleMouseOver);
    };
  }, []);

  // Handle laggy follow pointer update using a localized animation loop
  useEffect(() => {
    let active = true;
    const tick = () => {
      if (!active) return;
      setLagMousePos((prev) => {
        const dx = mousePos.x - prev.x;
        const dy = mousePos.y - prev.y;
        return {
          x: prev.x + dx * 0.16,
          y: prev.y + dy * 0.16
        };
      });
      requestAnimationFrame(tick);
    };
    
    requestAnimationFrame(tick);
    return () => {
      active = false;
    };
  }, [mousePos]);

  // Indian Court Calendar Status
  const [courtStatus, setCourtStatus] = useState({
    isOpen: true,
    messageEN: "Supreme Court is currently in Regular Session (Summer Term)",
    messageHI: "उच्चतम न्यायालय वर्तमान में नियमित सत्र (ग्रीष्मकालीन सत्र) में है"
  });

  // Supporting user's uploaded image with safety fallback to premium logo placeholder
  const [portraitSrc, setPortraitSrc] = useState<string>(arunabhPortrait);
  const [portraitFallbackCount, setPortraitFallbackCount] = useState(0);
  const [imageError, setImageError] = useState(false);

  // CMS Real-Time Configuration & Admin State
  const [cmsConfig, setCmsConfig] = useState<SiteCMSConfig>(cmsService.getConfig());
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [visitorStats, setVisitorStats] = useState(cmsService.getVisitorStats());

  // BCI Compliance Disclaimer Modal State
  const [showBciModal, setShowBciModal] = useState(false);
  const [secretAdminClicks, setSecretAdminClicks] = useState(0);

  useEffect(() => {
    try {
      const accepted = sessionStorage.getItem("arunabh_bci_disclaimer");
      if (!accepted) {
        setShowBciModal(true);
      }
    } catch (e) {
      // ignore
    }
  }, []);

  const acceptBciDisclaimer = () => {
    try {
      sessionStorage.setItem("arunabh_bci_disclaimer", "true");
    } catch (e) {
      // ignore
    }
    setShowBciModal(false);
  };

  const handleSecretAdminTrigger = () => {
    setSecretAdminClicks((prev) => {
      const next = prev + 1;
      if (next >= 3) {
        setIsAdminOpen(true);
        return 0;
      }
      setTimeout(() => setSecretAdminClicks(0), 1200);
      return next;
    });
  };

  // Global hotkey: Ctrl+Shift+A or Cmd+Shift+A opens Admin Panel securely
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === "a" || e.key === "A")) {
        e.preventDefault();
        setIsAdminOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    // Record visit analytics
    const stats = cmsService.trackVisit(window.location.pathname);
    setVisitorStats(stats);

    // Subscribe to real-time CMS updates
    const unsub = cmsService.subscribeConfig((cfg) => {
      setCmsConfig(cfg);
      setVisitorStats(cmsService.getVisitorStats());
    });

    // Check if route is /admin or #admin
    const checkAdminRoute = () => {
      if (window.location.pathname === "/admin" || window.location.hash === "#admin") {
        setIsAdminOpen(true);
      }
    };
    checkAdminRoute();

    window.addEventListener("hashchange", checkAdminRoute);
    window.addEventListener("popstate", checkAdminRoute);

    return () => {
      unsub();
      window.removeEventListener("hashchange", checkAdminRoute);
      window.removeEventListener("popstate", checkAdminRoute);
    };
  }, []);

  // Load existing requests from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem("arunabh_consultations");
      if (stored) {
        setExistingRequests(JSON.parse(stored));
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  // Set default language on load based on browser preferences if available
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  const t = translations[lang];

  // Icons mapper for practice areas
  const getPracticeIcon = (id: string) => {
    switch(id) {
      case 'criminal': return <Shield className="w-5 h-5 text-[#dbb657]" />;
      case 'pocso': return <Scale className="w-5 h-5 text-[#dbb657]" />;
      case 'matrimonial': return <Sparkles className="w-5 h-5 text-[#dbb657]" />;
      case 'commercial': return <Building className="w-5 h-5 text-[#dbb657]" />;
      case 'constitutional': return <Gavel className="w-5 h-5 text-[#dbb657]" />;
      case 'sec138': return <BookMarked className="w-5 h-5 text-[#dbb657]" />;
      case 'whitecollar': return <Award className="w-5 h-5 text-[#dbb657]" />;
      case 'humanrights': return <HeartHandshake className="w-5 h-5 text-[#dbb657]" />;
      default: return <Scale className="w-5 h-5 text-[#dbb657]" />;
    }
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) {
      addToast(
        lang === 'EN' 
          ? 'Validation Error: Please fill out your Full Name and Contact Phone.' 
          : 'सत्यापन त्रुटि: कृपया अपना नाम और संपर्क फोन दर्ज करें।',
        'error'
      );
      return;
    }

    setIsFormSubmitting(true);
    setSubmissionStep(lang === 'EN' ? 'Establishing secure portal gateway...' : 'सशक्त पोर्टल गेटवे स्थापित किया जा रहा है...');

    setTimeout(() => {
      setSubmissionStep(lang === 'EN' ? 'Drafting secure case receipt hash...' : 'सुरक्षित केस रसीद हैश तैयार किया जा रहा है...');
      
      setTimeout(() => {
        setSubmissionStep(lang === 'EN' ? 'Generating official serial entry...' : 'आधिकारिक प्रविष्टि क्रमांक उत्पन्न किया जा रहा है...');
        
        setTimeout(() => {
          const newRequest = {
            ...formData,
            id: Date.now().toString(),
            date: new Date().toLocaleDateString(lang === 'EN' ? 'en-US' : 'hi-IN'),
            time: new Date().toLocaleTimeString(lang === 'EN' ? 'en-US' : 'hi-IN'),
          };
          
          const updated = [newRequest, ...existingRequests];
          setExistingRequests(updated);
          setLastSubmittedData(newRequest);
          localStorage.setItem("arunabh_consultations", JSON.stringify(updated));
          
          // Automatically save to CMS Leads & Firebase
          cmsService.addLead({
            name: formData.name,
            phone: formData.phone,
            email: formData.email,
            caseType: formData.caseType,
            date: new Date().toLocaleDateString(lang === 'EN' ? 'en-US' : 'hi-IN'),
            message: formData.message,
            isUrgent: formData.caseType === "criminal" || formData.caseType === "pocso"
          });

          setIsFormSubmitting(false);
          setSubmissionStep("");
          setFormSubmitted(true);

          addToast(
            lang === 'EN'
              ? 'Success! Secure consultation registered. You can now dispatch details directly via WhatsApp or Email.'
              : 'सफलता! सुरक्षित परामर्श पंजीकृत। अब आप सीधे व्हाट्सएप या ईमेल द्वारा विवरण भेज सकते हैं।',
            'success'
          );

          // Reset input fields
          setFormData({
            name: "",
            phone: "",
            email: "",
            caseType: "criminal",
            message: "",
          });

          setTimeout(() => {
            setFormSubmitted(false);
          }, 60000);

        }, 800);
      }, 800);
    }, 800);
  };

  const getWhatsAppUrl = () => {
    if (!lastSubmittedData) return "";
    const baseNum = "919810703335"; // Advocate Arunabh Banerjee's WhatsApp Line
    const matchedArea = t.practiceAreas.find((p: any) => p.id === lastSubmittedData.caseType);
    const title = matchedArea ? matchedArea.title : lastSubmittedData.caseType.toUpperCase();
    
    const text = `⚖️ *CPDR ADVOCATE PORTAL - SECURE DIGITAL CONSULTATION*
---------------------------------------
*Client Name:* ${lastSubmittedData.name}
*Contact Phone:* ${lastSubmittedData.phone}
*Email Address:* ${lastSubmittedData.email || 'N/A'}
*Practice Area:* ${title}
*Brief Case Summary:* 
${lastSubmittedData.message || 'No summary provided.'}
---------------------------------------
_Sent via Secure Advocate Web Portal_`;

    return `https://wa.me/${baseNum}?text=${encodeURIComponent(text)}`;
  };

  const getEmailUrl = () => {
    if (!lastSubmittedData) return "";
    const emailAddr = "chamber.arunabh.banerjee@gmail.com";
    const matchedArea = t.practiceAreas.find((p: any) => p.id === lastSubmittedData.caseType);
    const title = matchedArea ? matchedArea.title : lastSubmittedData.caseType.toUpperCase();
    
    const subject = `Secure Consultation Request - ${lastSubmittedData.name}`;
    const body = `⚖️ CPDR ADVOCATE PORTAL - SECURE DIGITAL CONSULTATION
--------------------------------------------------
Client Name: ${lastSubmittedData.name}
Contact Phone: ${lastSubmittedData.phone}
Email Address: ${lastSubmittedData.email || 'N/A'}
Practice Area: ${title}
Brief Case Summary: 
${lastSubmittedData.message || 'No summary provided.'}
--------------------------------------------------
Sent via Secure Advocate Web Portal`;

    return `mailto:${emailAddr}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  // Generate dynamic vCard string and provide a download link
  const triggerVcardDownload = () => {
    const vcardData = 
`BEGIN:VCARD
VERSION:3.0
FN:Advocate Arunabh Banerjee
ORG:Supreme Court of India & CPDR India Human Rights
TITLE:Supreme Court Advocate
TEL;TYPE=CELL,VOICE;PREF:+919810703335
TEL;TYPE=WORK,VOICE:+919810703335
ADR;TYPE=WORK,PREF:;;Chamber No. 25, Old Lawyers Block, Supreme Court of India;New Delhi;Delhi;110001;India
ADR;TYPE=WORK:;;632, Lawyers Block, Saket Courts Complex;New Delhi;Delhi;110017;India
EMAIL;TYPE=PREF,INTERNET:chamber.arunabh.banerjee@gmail.com
URL:https://arunabhbanerjee.com
NOTE:President of C.P.D.R India Human Rights (Delhi)
REV:${new Date().toISOString()}
END:VCARD`;

    const blob = new Blob([vcardData], { type: "text/vcard;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "Advocate_Arunabh_Banerjee.vcf");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter glossary based on search query
  const filteredGlossary = t.glossary.filter(item => 
    item.term.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.hindiTerm.includes(searchQuery) ||
    item.definition.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.hindiDefinition.includes(searchQuery)
  );

  return (
    <div className={`min-h-screen font-sans transition-colors duration-500 selection:bg-[#dbb657] selection:text-black pb-20 md:pb-0 overflow-x-hidden ${
      theme === 'dark' 
        ? 'bg-[#0b0c10] text-[#eaeaea]' 
        : 'bg-[#fcfaf2] text-[#2c2c2c]'
    }`}>
      
      {/* Dynamic Toast Notifications Overlay */}
      <div className="fixed top-5 right-5 z-[100] flex flex-col gap-3 pointer-events-none max-w-sm w-full">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: -40, x: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, x: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.85, transition: { duration: 0.2 } }}
              className={`pointer-events-auto p-4 rounded-sm border shadow-2xl flex gap-3 items-start relative overflow-hidden backdrop-blur-md ${
                toast.type === 'success' 
                  ? 'bg-[#0f1d13]/95 border-emerald-500/50 text-[#ecfdf5]' 
                  : toast.type === 'error'
                  ? 'bg-[#1e1111]/95 border-red-500/50 text-[#fef2f2]'
                  : 'bg-[#12161f]/95 border-amber-500/50 text-[#fffbeb]'
              }`}
            >
              <div className="mt-0.5 flex-shrink-0">
                {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
                {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-red-400" />}
                {toast.type === 'info' && <Scale className="w-5 h-5 text-amber-500" />}
              </div>
              
              <div className="flex-1 pr-4">
                <p className="text-xs font-serif leading-relaxed font-semibold">{toast.message}</p>
              </div>

              <button 
                type="button"
                onClick={() => removeToast(toast.id)}
                className="text-gray-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>

              {/* Progress visual feedback */}
              <motion.div 
                initial={{ width: '100%' }}
                animate={{ width: '0%' }}
                transition={{ duration: 5, ease: 'linear' }}
                className={`absolute bottom-0 left-0 h-[3px] ${
                  toast.type === 'success' 
                    ? 'bg-emerald-500' 
                    : toast.type === 'error'
                    ? 'bg-red-500'
                    : 'bg-amber-500'
                }`}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>


      {/* Luxury Navigation Header */}
      <header className={`sticky top-0 z-50 backdrop-blur-md border-b transition-colors duration-300 ${
        theme === 'dark'
          ? 'bg-[#0b0c10]/90 border-[#2d251a]' 
          : 'bg-[#fcfaf2]/90 border-[#e6dcbf]'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            
            {/* Branding Logo & Ashoka Emblem Signpost */}
            <div className="flex items-center gap-3">
              <div className="relative p-2.5 border border-[#c4a24d]/30 bg-[#12141c]/40 rounded-sm">
                <Scale className="w-6 h-6 text-[#dbb657]" />
                <div className="absolute inset-0 border-[0.5px] border-[#c4a24d]/10 pointer-events-none margin-1"></div>
              </div>
              <div>
                <h1 className="font-serif font-bold text-lg sm:text-xl tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-[#f3e7c4] via-[#dbb657] to-[#997728] uppercase">
                  {lang === 'EN' ? 'A. Banerjee' : 'ए. बनर्जी'}
                </h1>
                <p className="text-[9px] uppercase tracking-widest text-[#a88234] font-medium font-serif mt-0.5">
                  {lang === 'EN' ? 'Supreme Court Advocate' : 'उच्चतम न्यायालय अधिवक्ता'}
                </p>
              </div>
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-7">
              <a href="#hero" className="text-xs uppercase tracking-widest font-medium hover:text-[#dbb657] transition-colors">{t.navHome}</a>
              <a href="#legacy" className="text-xs uppercase tracking-widest font-medium hover:text-[#dbb657] transition-colors">{t.navLegacy}</a>
              <a href="#practice" className="text-xs uppercase tracking-widest font-medium hover:text-[#dbb657] transition-colors">{t.navPractice}</a>
              <a href="#matters" className="text-xs uppercase tracking-widest font-medium hover:text-[#dbb657] transition-colors">{t.navMatters}</a>
              <a href="#mentorship" className="text-xs uppercase tracking-widest font-medium hover:text-[#dbb657] transition-colors">{t.navMentorship}</a>
              <a href="#leadership" className="text-xs uppercase tracking-widest font-medium hover:text-[#dbb657] transition-colors">{t.navLeadership}</a>
              <a href="#chambers" className="text-xs uppercase tracking-widest font-medium hover:text-[#dbb657] transition-colors">{t.navContact}</a>
            </nav>

            {/* Controls panel: Language Toggle & CTA */}
            <div className="flex items-center gap-3">
              
              {/* Language Switcher with Globe Icon */}
              <div className="p-1 rounded-sm border bg-[#12161d] border-[#3e3422] flex items-center gap-2 shadow-[0_0_15px_rgba(219,182,87,0.05)] transition-all duration-300">
                <div className="flex items-center gap-1 pl-1.5 py-0.5">
                  <Globe className="w-3.5 h-3.5 text-[#dbb657] animate-pulse" />
                </div>
                <div className="flex items-center gap-0.5">
                  <button 
                    onClick={() => setLang('EN')}
                    className={`px-2.5 py-1 text-[10px] font-extrabold rounded-xs tracking-wider transition-all uppercase cursor-pointer ${
                      lang === 'EN' 
                        ? 'bg-gradient-to-r from-[#dbb657] to-[#b28d2f] text-black shadow-md' 
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    EN
                  </button>
                  <button 
                    onClick={() => setLang('HI')}
                    className={`px-2.5 py-1 text-[10px] font-extrabold rounded-xs tracking-wider transition-all uppercase cursor-pointer ${
                      lang === 'HI' 
                        ? 'bg-gradient-to-r from-[#dbb657] to-[#b28d2f] text-black shadow-md' 
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    हिन्दी
                  </button>
                </div>
              </div>


              {/* Consultation Link Button */}
              <a 
                href="#consultation" 
                className="hidden md:flex items-center gap-1.5 bg-gradient-to-r from-[#dbb657] via-[#f3e7c4] to-[#dbb657] text-[#12141c] hover:opacity-95 font-semibold text-xs py-2.5 px-4.5 rounded-xs tracking-widest uppercase shadow-md active:scale-95 transition-all"
              >
                <span>{lang === 'EN' ? (cmsConfig.buttons?.reserveSlotText || 'RESERVE SLOT') : 'अपॉइंटमेंट'}</span>
              </a>

              {/* Mobile Drawer Trigger Mobile Menu Toggle */}
              <button 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 border border-[#dbb657]/40 rounded-sm lg:hidden hover:bg-[#dbb657]/10 text-[#dbb657] transition-colors"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>

          </div>
        </div>

        {/* Mobile Navigation Menu Dropdown */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className={`lg:hidden border-t overflow-hidden ${
                theme === 'dark' ? 'bg-[#12151d] border-[#2c2317]' : 'bg-[#fbf9f3] border-[#e4d9bc]'
              }`}
            >
              <div className="px-4 py-6 space-y-3 font-serif">
                <a 
                  href="#hero" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-sm uppercase tracking-wider hover:text-[#dbb657] py-2"
                >
                  {t.navHome}
                </a>
                <a 
                  href="#legacy" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-sm uppercase tracking-wider hover:text-[#dbb657] py-2"
                >
                  {t.navLegacy}
                </a>
                <a 
                  href="#practice" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-sm uppercase tracking-wider hover:text-[#dbb657] py-2"
                >
                  {t.navPractice}
                </a>
                <a 
                  href="#matters" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-sm uppercase tracking-wider hover:text-[#dbb657] py-2"
                >
                  {t.navMatters}
                </a>
                <a 
                  href="#mentorship" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-sm uppercase tracking-wider hover:text-[#dbb657] py-2"
                >
                  {t.navMentorship}
                </a>
                <a 
                  href="#leadership" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-sm uppercase tracking-wider hover:text-[#dbb657] py-2"
                >
                  {t.navLeadership}
                </a>
                <a 
                  href="#chambers" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-sm uppercase tracking-wider hover:text-[#dbb657] py-2"
                >
                  {t.navContact}
                </a>

                {/* Mobile consultation CTA & Direct Contact Buttons */}
                <div className="pt-2 space-y-2">
                  <a 
                    href="#consultation" 
                    onClick={() => setMobileMenuOpen(false)}
                    className="block text-center bg-gradient-to-r from-[#dbb657] via-[#f3e7c4] to-[#dbb657] text-[#0f1115] py-3 rounded-xs font-bold tracking-wider text-xs uppercase shadow-md active:scale-95 transition-transform"
                  >
                    {t.contactBtn}
                  </a>
                  <div className="grid grid-cols-2 gap-2 pt-1 font-sans">
                    <a 
                      href={`tel:${cmsConfig.contacts.primaryMobile}`}
                      className="flex items-center justify-center gap-1.5 py-2.5 bg-[#171a24] text-[#dbb657] border border-[#dbb657]/40 rounded-xs text-xs font-bold uppercase tracking-wider active:scale-95 transition-transform"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>{lang === 'EN' ? 'Call Chamber' : 'कॉल करें'}</span>
                    </a>
                    <a 
                      href={`https://wa.me/${cmsConfig.contacts.whatsappNumber}?text=${encodeURIComponent(cmsConfig.contacts.whatsappMessage)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-1.5 py-2.5 bg-[#25D366] text-black rounded-xs text-xs font-bold uppercase tracking-wider active:scale-95 transition-transform"
                    >
                      <MessageSquare className="w-3.5 h-3.5 fill-black" />
                      <span>WhatsApp</span>
                    </a>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* HERO HERO SECTION: Designed in extreme correlation with Chamber Ornaments & Ashoka Seals */}
      <section id="hero" className="relative overflow-hidden pt-12 pb-24 md:py-32">
        {/* Ornate Gold Background Elements */}
        <div className="absolute inset-0 bg-radial-at-t from-[#dbb657]/10 via-transparent to-transparent pointer-events-none"></div>
        <div className="absolute -left-32 top-1/4 w-[30rem] h-[30rem] bg-gradient-to-tr from-[#9c7728]/5 to-transparent rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -right-32 bottom-1/4 w-[30rem] h-[30rem] bg-gradient-to-bl from-[#dbb657]/5 to-transparent rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          
          {/* Classical Ornate Border Container mirroring the Chamber Business Card */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
            className="relative px-6 py-12 md:p-16 border rounded-sm transition-all duration-500 shadow-[0_10px_50px_rgba(219,182,87,0.06)] bg-[#12141c]/90 border-[#473c24] hover:shadow-[0_15px_60px_rgba(219,182,87,0.12)] hover:border-[#dbb657]/45"
          >
            
            {/* Ornate corners */}
            <div className="classical-corner classical-corner-tl"></div>
            <div className="classical-corner classical-corner-tr"></div>
            <div className="classical-corner classical-corner-bl"></div>
            <div className="classical-corner classical-corner-br"></div>

            {/* Content grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              
              {/* Profile Copy & Chamber Credentials */}
              <div className="lg:col-span-7 space-y-6">
                
                {/* Supreme Court Stamp Ribbon */}
                <div className="flex items-center gap-2">
                  <div className="h-[2px] w-8 bg-gradient-to-r from-transparent to-[#dbb657]"></div>
                  <span className="font-serif text-xs uppercase tracking-widest text-[#dbb657] font-semibold flex items-center gap-1.5">
                    <Scale className="w-3.5 h-3.5 text-[#dbb657]" />
                    {lang === 'EN' ? 'Sovereign Justice & Human Rights' : 'सार्वभौम न्याय और मानवाधिकार'}
                  </span>
                  <div className="h-[2px] w-8 bg-gradient-to-l from-transparent to-[#dbb657]"></div>
                </div>

                {/* Highly elegant display name in serif typography matching business card */}
                <div className="space-y-2">
                  <span className="font-serif text-xs sm:text-sm tracking-[0.3em] text-[#a88234] block uppercase font-medium">
                    {t.heroTitlePrefix}
                  </span>
                  <h2 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-medium tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-[#f3e7c4] via-[#dbb657] to-[#b28d2f] uppercase leading-tight">
                    Arunabh Banerjee
                  </h2>
                  <div className="font-mono text-xs sm:text-sm text-[#dbb657] tracking-wider flex items-center gap-1.5 py-1">
                    <Phone className="w-4 h-4 text-[#dbb657]" />
                    <span className="font-semibold">{lang === 'EN' ? 'Mob: ' : 'मोबाईल: '}+91 98107 03335</span>
                  </div>
                  <div className="flex flex-wrap gap-2 pt-1">
                    <span className="px-3 py-1 bg-[#dbb657]/10 text-[#dbb657] border border-[#dbb657]/30 text-[10px] font-bold uppercase tracking-widest rounded-xs">
                      {t.supremeCourtAdvocate}
                    </span>
                    <span className="px-3 py-1 bg-yellow-500/10 text-amber-500 border border-amber-500/30 text-[10px] font-bold uppercase tracking-widest rounded-xs flex items-center gap-1">
                      <Shield className="w-3 h-3" />
                      {lang === 'EN' ? 'President CPDR' : 'अध्यक्ष CPDR'}
                    </span>
                  </div>
                </div>

                {/* Subtitle list resembling Panel details */}
                <div className={`space-y-3 pt-2 text-sm border-l-2 border-[#dbb657]/40 pl-4 py-1.5 ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  <p className="font-serif font-semibold tracking-wide text-md">
                    ⚖️ {t.jurisdictionLine}
                  </p>
                  <p className="text-gray-400 text-xs sm:text-sm">
                    💼 {t.humanRightsLine}
                  </p>
                </div>

                {/* Brief bio summary */}
                <p className={`text-sm leading-relaxed ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  {lang === 'EN' 
                    ? "Litigating and representing sensitive trials in criminal trials, bail jurisprudence, high-stake corporate disputes, domestic issues, and defending constitutional liberties before the Honourable High Courts and Supreme Court on urgent listings."
                    : "संगीन आपराधिक मुकदमों, अग्रिम जमानत अर्जियों, उच्च-स्तरीय व्यापारिक विवादों, पारिवारिक विषयों का निपटारा तथा देश की विभिन्न अदालती पीठों के समक्ष संवैधानिक स्वतंत्रता की त्वरित सुनवाई में प्रखर वकालत।"}
                </p>

                {/* Call & WhatsApp actions for Advocate Arunabh Banerjee */}
                <div className="flex flex-col sm:flex-row gap-3 pt-4 sm:items-center">
                  <a 
                    href="tel:+919810703335" 
                    className="flex-1 sm:flex-none text-center bg-gradient-to-r from-[#dbb657] to-[#b28d2f] text-[#0f1115] hover:from-[#f3e7c4] hover:to-[#dbb657] transition-all font-semibold uppercase tracking-wider text-xs py-3 px-5 rounded-xs shadow-lg shadow-[#dbb657]/10 active:scale-95 flex items-center justify-center gap-2"
                  >
                    <Phone className="w-4 h-4" />
                    <span>{lang === 'EN' ? 'Call Advocate' : 'कॉल करें (अरुणभ बनर्जी)'}</span>
                  </a>
                  <a 
                    href="https://wa.me/919810703335?text=Hello%20Advocate%20Arunabh%20Banerjee%2C%20I%20have%20a%20legal%20case%20and%20need%20expert%20representation."
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 sm:flex-none text-center bg-emerald-600 hover:bg-emerald-500 transition-all text-white font-semibold uppercase tracking-wider text-xs py-3 px-5 rounded-xs shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <MessageSquare className="w-4 h-4 fill-white" />
                    <span>{lang === 'EN' ? 'WhatsApp Direct' : 'व्हाट्सएप चैट'}</span>
                  </a>
                  <a 
                    href="#consultation" 
                    className="flex-1 sm:flex-none text-center border border-gray-800 hover:border-[#dbb657] text-gray-300 hover:text-white transition-all text-xs font-semibold py-3 px-4 rounded-xs uppercase tracking-wider flex items-center justify-center gap-1.5"
                  >
                    <Calendar className="w-3.5 h-3.5 text-[#dbb657]" />
                    <span>{lang === 'EN' ? 'Book Case' : 'केस बुकिंग'}</span>
                  </a>
                </div>

              </div>

              {/* Majestic Royal Chamber Card Artwork representation (Right Panel) */}
              <div className="lg:col-span-5 flex flex-col items-center space-y-4 relative w-full">
                
                <div className="w-full relative flex flex-col items-center">
                  {/* Premium Portrait Frame */}
                  <div className="w-full max-w-[380px] sm:max-w-[420px] aspect-[3/4] border-2 border-[#dbb657]/45 p-2 bg-[#12141c]/90 rounded-sm shadow-2xl relative group overflow-hidden hover:border-[#dbb657]/80 transition-all duration-300 card-gold-glow">
                    <div className="classical-corner classical-corner-tl"></div>
                    <div className="classical-corner classical-corner-tr"></div>
                    <div className="classical-corner classical-corner-bl"></div>
                    <div className="classical-corner classical-corner-br"></div>
                    
                    <div className="relative w-full h-full overflow-hidden rounded-xs border border-gray-800 bg-[#0c0d12]">
                      {!imageError ? (
                        <img 
                          src={portraitSrc}
                          alt="Advocate Arunabh Banerjee"
                          className="w-full h-full object-cover object-top filter contrast-[1.03] brightness-[0.98] group-hover:scale-105 transition-transform duration-700 pointer-events-none"
                          referrerPolicy="no-referrer"
                          onError={() => {
                            if (portraitFallbackCount === 0) {
                              setPortraitSrc(defaultArunabhPortrait);
                              setPortraitFallbackCount(1);
                            } else {
                              setImageError(true);
                            }
                          }}
                        />
                      ) : (
                        <div className="w-full h-[320px] sm:h-full flex flex-col items-center justify-center p-6 bg-gradient-to-b from-[#111420] to-[#07080d] relative">
                          <div className="absolute inset-0 opacity-[0.03] flex items-center justify-center pointer-events-none scale-150">
                            <Scale className="w-64 h-64 text-[#dbb657]" />
                          </div>
                          <div className="relative z-10 flex flex-col items-center text-center space-y-4">
                            <div className="p-4 border border-[#dbb657]/40 bg-[#171a26]/90 rounded-full shadow-inner shadow-black/80">
                              <Scale className="w-12 h-12 text-[#dbb657] animate-pulse" />
                            </div>
                            <div className="space-y-1">
                              <p className="font-serif text-[11px] uppercase tracking-[0.2em] text-[#dbb657] font-semibold">
                                {lang === 'EN' ? 'Chambers of' : 'बनर्जी चैंबर'}
                              </p>
                              <p className="font-serif text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#f3e7c4] via-[#dbb657] to-[#b28d2f] uppercase tracking-wide">
                                Arunabh Banerjee
                              </p>
                              <div className="w-10 h-[1px] bg-[#dbb657]/30 mx-auto my-1"></div>
                              <p className="text-[9px] uppercase tracking-widest text-gray-400 font-mono">
                                {lang === 'EN' ? 'Supreme Court of India' : 'भारत का विवरण'}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/50 to-transparent p-4 flex flex-col justify-end">
                        <span className="font-serif text-[10px] uppercase tracking-widest text-[#dbb657] font-bold">
                          {lang === 'EN' ? 'OFFICIAL PORTRAIT' : 'आधिकारिक चित्र'}
                        </span>
                        <h4 className="font-serif text-base font-bold text-white uppercase tracking-wide mt-0.5">
                          Arunabh Banerjee
                        </h4>
                        <p className="text-[9.5px] text-gray-300 uppercase tracking-wider mt-0.5 font-sans font-semibold">
                          {lang === 'EN' ? 'Supreme Court Advocate & President CPDR' : 'उच्चतम न्यायालय अधिवक्ता एवं अध्यक्ष CPDR'}
                        </p>
                      </div>
                    </div>

                    {/* Overlaid Gold Seals */}
                    <div className="absolute top-4 right-4 bg-[#12141c]/90 border border-[#dbb657]/50 rounded-full p-1.5 shadow-lg flex items-center justify-center opacity-85 group-hover:scale-110 transition-transform duration-300">
                      <Scale className="w-4 h-4 text-[#dbb657]" />
                    </div>
                  </div>

                  {/* Explicit Addresses Panel - "address is very important" */}
                  <div className="w-full max-w-[380px] sm:max-w-[420px] bg-[#12141c]/65 border border-gray-800/80 rounded-sm p-4 mt-3 space-y-3 shadow-md">
                    <div className="space-y-2">
                      <div className="flex gap-2.5">
                        <MapPin className="w-3.5 h-3.5 text-[#dbb657] flex-shrink-0 mt-0.5" />
                        <div className="text-left">
                          <p className="text-[10px] uppercase font-bold text-[#dbb657] tracking-wider leading-none">
                            {lang === 'EN' ? 'Supreme Court Compound Office' : 'उच्चतम न्यायालय कार्यालय चैंबर'}
                          </p>
                          <p className="text-[10px] text-gray-300 mt-1 leading-relaxed">
                            Chamber No. 25, Old Lawyers Block, Supreme Court of India, New Delhi – 110001
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex gap-2.5 border-t border-gray-800/60 pt-2.5">
                        <MapPin className="w-3.5 h-3.5 text-[#dbb657] flex-shrink-0 mt-0.5" />
                        <div className="text-left">
                          <p className="text-[10px] uppercase font-bold text-[#dbb657] tracking-wider leading-none">
                            {lang === 'EN' ? 'Saket District Courts Chamber' : 'साकेत जिला न्यायालय चेंबर'}
                          </p>
                          <p className="text-[10px] text-gray-300 mt-1 leading-relaxed">
                            Chamber 632, Lawyers Block, Saket Courts Complex, New Delhi – 110017
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Interactive WhatsApp Connection */}
                    <a
                      href="https://wa.me/919810703335?text=Hello%20Advocate%20Banerjee%2C%20I%20am%20reaching%20out%20via%20your%20Supreme%20Court%20Advocate%20Portal."
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group relative flex items-center justify-center gap-2 w-full py-2.5 px-3 bg-[#25D366] hover:bg-[#20ba56] text-black font-sans font-extrabold text-[10px] rounded-xs uppercase tracking-widest transition-all duration-300 shadow-md active:scale-95 border border-[#25D366]/40 cursor-pointer"
                    >
                      <MessageSquare className="w-3.5 h-3.5 fill-black text-black animate-pulse mt-0.5" />
                      <span>{lang === 'EN' ? 'Connect on WhatsApp' : 'व्हाट्सएप संपर्क त्वरित'}</span>
                    </a>
                  </div>
                </div>

                {/* Absolute Floating Badge - 15 Years Mentorship */}
                <div className="absolute -bottom-6 -right-2 bg-[#12161f] border border-[#dbb657] p-3 shadow-xl rounded-sm flex items-center gap-2.5 max-w-[190px] z-[15]">
                  <Award className="w-8 h-8 text-[#dbb657] flex-shrink-0" />
                  <div className="text-left">
                    <p className="text-white text-[10px] uppercase font-bold tracking-wider leading-none">
                      {lang === 'EN' ? '15+ YEARS' : '१५+ वर्ष'}
                    </p>
                    <p className="text-gray-400 text-[9px] mt-0.5 leading-snug">
                      {lang === 'EN' ? 'Academic Teaching & Active Advocacy' : 'कानूनी एवं शैक्षणिक समर्पण'}
                    </p>
                  </div>
                </div>

              </div>

            </div>

          </motion.div>

        </div>
      </section>

      {/* SECTION 2: LEGACY OF LEGAL EXCELLENCE (Panel 2) */}
      <section id="legacy" className="py-16 md:py-24 border-t border-b bg-[#0f1117] border-[#291f11]/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Pillar: Visual justice symbol & flag representation */}
            <motion.div 
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="lg:col-span-5 relative"
            >
              <div className="p-8 border border-[#dbb657]/30 bg-[#12141a]/80 rounded-sm relative shadow-inner card-gold-glow">
                {/* Tricolor accent bar */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 via-white to-green-600"></div>
                
                <h4 className="font-serif text-[#dbb657] text-md font-bold uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Scale className="w-4 h-4 text-[#dbb657]" />
                  {lang === 'EN' ? 'Constitutional Oath' : 'संवैधानकि शपथ'}
                </h4>

                {/* Real Quote from Right Emblem panel */}
                <blockquote className="font-serif italic text-md text-gray-200 relative pl-4 border-l border-[#dbb657]/70">
                  "{t.leadershipQuote}"
                </blockquote>

                {/* Indian Emblem outline seal replacement */}
                <div className="mt-6 pt-4 border-t border-[#dbb657]/20 flex items-center gap-3">
                  <div className="bg-[#1c212a] p-2 border border-[#dbb657]/20 rounded-full">
                    <Shield className="w-5 h-5 text-[#dbb657]" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-gray-400 leading-none">Sovereign State Emblem</p>
                    <p className="text-[#dbb657] text-xs font-bold font-serif uppercase tracking-wider mt-0.5">सत्यमेव जयते</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Right Pillar: Core Narrative Text */}
            <motion.div 
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }}
              className="lg:col-span-7 space-y-6"
            >
              <span className="text-xs uppercase tracking-widest text-[#dbb657] font-bold font-mono">
                {lang === 'EN' ? 'THE BIOGRAPHY' : 'विस्तृत परिचय'}
              </span>
              <h3 className="font-serif text-3xl md:text-4xl font-semibold tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-[#f3e7c4] to-[#dbb657]">
                {t.legacyTitle}
              </h3>
              <p className="text-base leading-relaxed text-gray-300">
                {t.aboutText}
              </p>
              
              {/* Highlight Pillars */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                <motion.div 
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="flex gap-2.5 items-start p-3 bg-white/5 rounded-xs border border-white/5 hover:border-[#dbb657]/30 transition-all duration-300"
                >
                  <div className="p-1.5 bg-[#dbb657]/10 border border-[#dbb657]/30 text-[#dbb657] rounded-xs mt-0.5 animate-pulse">
                    <Check className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="font-bold text-xs uppercase tracking-wider text-[#dbb657]">
                      {lang === 'EN' ? 'Commanding Presence' : 'अदालत में सुदृढ़ उपस्थिति'}
                    </h5>
                    <p className="text-xs text-gray-400 mt-1">
                      {lang === 'EN' ? 'Valued for dynamic, tactical arguments.' : 'तथ्यात्मक जिरह और स्पष्ट व्याख्यान के लिए विख्यात।'}
                    </p>
                  </div>
                </motion.div>

                <motion.div 
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="flex gap-2.5 items-start p-3 bg-white/5 rounded-xs border border-white/5 hover:border-[#dbb657]/30 transition-all duration-300"
                >
                  <div className="p-1.5 bg-[#dbb657]/10 border border-[#dbb657]/30 text-[#dbb657] rounded-xs mt-0.5 animate-pulse">
                    <Check className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="font-bold text-xs uppercase tracking-wider text-[#dbb657]">
                      {lang === 'EN' ? '15 Years Mentorship' : '१५+ वर्षों का शिक्षण अनुभव'}
                    </h5>
                    <p className="text-xs text-gray-400 mt-1">
                      {lang === 'EN' ? 'Guiding thousands of young legal minds.' : 'सैकड़ों कानूनविदों को न्यायालयीन मूल्यों की दीक्षा दी।'}
                    </p>
                  </div>
                </motion.div>
              </div>

            </motion.div>

          </div>
        </div>
      </section>

      {/* SECTION 3: PRACTICE AREAS & JURISPRUDENCE (Panel 3) */}
      <section id="practice" className="py-16 md:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-12">
          <span className="text-[#dbb657] uppercase tracking-widest text-xs font-bold font-mono">
            {lang === 'EN' ? 'SERVICES DIRECTORY' : 'अधिकार क्षेत्र और सेवाएं'}
          </span>
          <h3 className="font-serif text-3xl md:text-4xl font-semibold tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-[#f3e7c4] to-[#dbb657]">
            {t.practiceTitle}
          </h3>
          <p className="text-xs sm:text-sm text-gray-400">
            {t.practiceSub}
          </p>
          <div className="w-24 h-[1px] bg-[#dbb657]/60 mx-auto pt-1"></div>
        </div>

        {/* Practice Selection Area: Two column Grid Layout with Interactive Detail lookup */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* List of Practice Areas - Panel 3 content */}
          <div className="lg:col-span-5 space-y-2">
            {t.practiceAreas.map((area: PracticeArea) => (
              <motion.button
                key={area.id}
                whileHover={{ x: 6, transition: { duration: 0.2 } }}
                whileTap={{ scale: 0.99 }}
                onClick={() => setSelectedPractice(area.id)}
                className={`w-full text-left p-4 rounded-xs border transition-all duration-300 flex items-center justify-between gap-3 cursor-pointer ${
                  selectedPractice === area.id
                    ? 'border-[#dbb657] bg-[#dbb657]/15 text-white shadow-[0_4px_25px_rgba(219,182,87,0.15)]'
                    : 'border-white/5 bg-[#12141b]/40 hover:border-[#dbb657]/40 text-gray-300 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-1.5 rounded-sm ${selectedPractice === area.id ? 'bg-[#dbb657]/25 text-white' : 'bg-white/5 text-gray-400'}`}>
                    {getPracticeIcon(area.id)}
                  </div>
                  <span className="font-serif text-xs uppercase tracking-wider font-semibold">
                    {area.title}
                  </span>
                </div>
                <ChevronRight className={`w-4 h-4 transition-transform ${selectedPractice === area.id ? 'text-[#dbb657] translate-x-1' : 'text-gray-400'}`} />
              </motion.button>
            ))}
          </div>

          {/* Interactive Detailed Feature Presentation Box */}
          <div className="lg:col-span-7">
            <AnimatePresence mode="wait">
              {t.practiceAreas.filter(area => area.id === selectedPractice).map((area: PracticeArea) => (
                <motion.div
                  key={area.id}
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  transition={{ duration: 0.25 }}
                  className="p-8 border border-gray-800/80 bg-[#12141c]/80 rounded-sm h-full flex flex-col justify-between relative overflow-hidden shadow-2xl card-gold-glow"
                >
                  {/* Decorative background gavel watermark */}
                  <div className="absolute -bottom-20 -right-20 pointer-events-none opacity-[0.03]">
                    <Gavel className="w-72 h-72 text-[#dbb657]" />
                  </div>

                  <div className="space-y-6">
                    <div className="flex items-center gap-2.5 text-xs text-[#dbb657] font-bold font-mono uppercase">
                      <span>{lang === 'EN' ? 'Practice Area Brief' : 'समग्र दृष्टिकोण'}</span>
                      <span className="h-[1px] w-12 bg-[#dbb657]/40"></span>
                    </div>

                    <div className="flex items-center gap-3.5">
                      <div className="p-3 bg-[#dbb657]/15 border border-[#dbb657]/40 rounded-sm text-[#dbb657]">
                        {getPracticeIcon(area.id)}
                      </div>
                      <h4 className="font-serif text-xl sm:text-2xl font-semibold tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-white via-amber-100 to-[#dbb657]">
                        {area.title}
                      </h4>
                    </div>

                    <p className="text-sm sm:text-base leading-relaxed text-gray-300">
                      {area.description}
                    </p>

                    <div className="pt-4 space-y-2">
                      <p className="text-xs uppercase tracking-widest text-[#dbb657] font-bold font-mono">
                        {lang === 'EN' ? 'Litigation Process Includes:' : 'इसके विधिक कार्यक्षेत्र के अंतर्गत:'}
                      </p>
                      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-gray-400">
                        <li className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                          {lang === 'EN' ? 'Supreme Court Special Petitions' : 'विशेष अनुमति याचिकायें'}
                        </li>
                        <li className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                          {lang === 'EN' ? 'Urgent Interim Bail Matters' : 'त्वरित अंतरिम जमानत'}
                        </li>
                        <li className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                          {lang === 'EN' ? 'Evidentiary Pleadings Inspection' : 'साक्ष्य एवं दस्तावेजी परीक्षण'}
                        </li>
                        <li className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                          {lang === 'EN' ? 'High Court Advisory representation' : 'उच्च न्यायालय में बहस'}
                        </li>
                      </ul>
                    </div>

                  </div>

                  <div className="mt-8 pt-6 border-t border-gray-800/80 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-[#dbb657]" />
                      <span className="text-xs text-gray-400 font-mono">+91 98107 03335 (Direct case line)</span>
                    </div>
                    <a href="#consultation" className="text-xs font-bold text-[#dbb657] uppercase tracking-wide flex items-center gap-1 hover:underline">
                      <span>{t.contactBtn}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </a>
                  </div>

                </motion.div>
              ))}
            </AnimatePresence>
          </div>

        </div>
      </section>

      {/* SECTION 4: NOTABLE MATTERS TABLE / TIMELINE (Panel 4) */}
      <section id="matters" className="py-16 md:py-24 border-t border-b bg-[#0f1117] border-[#291f11]/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Header */}
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-12">
            <span className="text-[#dbb657] uppercase tracking-widest text-xs font-bold font-mono">
              {lang === 'EN' ? 'VERDICTS & DECREES' : 'विधिक उपलब्धियाँ और केस परिणाम'}
            </span>
            <h3 className="font-serif text-3xl md:text-4xl font-semibold tracking-wide">
              {t.mattersTitle}
            </h3>
            <p className="text-xs sm:text-sm text-gray-400">
              {t.mattersSub}
            </p>
            <div className="w-24 h-[1px] bg-[#dbb657]/60 mx-auto pt-1"></div>
          </div>

          {/* Graphic Timeline of Landmark Cases (Panel 4 Details) */}
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {t.notableMatters.map((matter: NotableMatter) => (
              <motion.div 
                key={matter.id}
                variants={cardVariants}
                whileHover={{ 
                  y: -8,
                  scale: 1.015,
                  transition: { duration: 0.25, ease: "easeOut" }
                }}
                className="p-6 border rounded-sm relative flex flex-col justify-between transition-all duration-300 shadow-sm hover:shadow-xl hover:shadow-[#dbb657]/8 bg-[#12141c]/60 border-gray-800 hover:border-[#dbb657]"
              >
                {/* Gavel background illustration outline */}
                <div className="absolute top-4 right-4 text-[#dbb657]/20 bg-[#dbb657]/5 p-2 rounded-full border border-[#dbb657]/10">
                  <Gavel className="w-4 h-4 text-[#dbb657]" />
                </div>

                <div className="space-y-4">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-[#dbb657] border border-[#dbb657]/30 px-2 py-0.5 rounded-full">
                    {matter.caseNo}
                  </span>
                  
                  <h4 className="font-serif font-bold text-base sm:text-lg text-amber-200 animate-pulse">
                    {matter.title}
                  </h4>
                  
                  <p className="text-xs sm:text-sm leading-relaxed text-gray-300">
                    {matter.outcome}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-gray-800">
                  <p className="text-[10px] uppercase text-emerald-400 font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {lang === 'EN' ? 'Judgment Favorably Concluded' : 'डिक्री प्राप्त/निपटान अनुकूल'}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>

        </div>
      </section>

      {/* SECTION 5: ACADEMIC EXCELLENCE & MENTORSHIP (Panel 5) */}
      <section id="mentorship" className="py-16 md:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Detailed Narrative */}
          <motion.div 
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.8 }}
            className="lg:col-span-7 space-y-6"
          >
            <span className="text-[#dbb657] uppercase tracking-widest text-xs font-bold font-mono">
              {lang === 'EN' ? 'ACADEMIC EXCELLENCE' : 'अकादमिक सेवा व समर्पण'}
            </span>
            <h3 className="font-serif text-3xl md:text-4xl font-semibold tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-[#f3e7c4] to-[#dbb657]">
              {t.mentorshipTitle}
            </h3>
            <p className="text-xs sm:text-sm text-[#dbb657]">
              {t.mentorshipSub}
            </p>
            <div className="h-[1px] w-20 bg-[#dbb657]/50 pt-1"></div>
            
            <p className="text-base leading-relaxed text-gray-300">
              {t.mentorshipContent}
            </p>

            {/* Special Values Grid */}
            <div className="grid grid-cols-3 gap-4 pt-4 text-center">
              <div className="p-3 border border-gray-800 bg-[#12141a]/45 rounded-xs">
                <p className="text-lg md:text-2xl font-serif font-bold text-[#dbb657]">15+</p>
                <p className="text-[9px] uppercase tracking-wider text-gray-400 mt-1">
                  {lang === 'EN' ? 'Years Teaching' : 'शिक्षण अनुभव'}
                </p>
              </div>
              <div className="p-3 border border-gray-800 bg-[#12141a]/45 rounded-xs">
                <p className="text-lg md:text-2xl font-serif font-bold text-[#dbb657]">1000+</p>
                <p className="text-[9px] uppercase tracking-wider text-gray-400 mt-1">
                  {lang === 'EN' ? 'Law Students' : 'विधिशात्र छात्र'}
                </p>
              </div>
              <div className="p-3 border border-gray-800 bg-[#12141a]/45 rounded-xs">
                <p className="text-lg md:text-2xl font-serif font-bold text-[#dbb657]">100%</p>
                <p className="text-[9px] uppercase tracking-wider text-gray-400 mt-1">
                  {lang === 'EN' ? 'Advocacy Ethics' : 'नैतिक मूल्य'}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Academic layout icon representation */}
          <motion.div 
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="lg:col-span-5"
          >
            <div className="p-8 border border-[#3b3117] rounded-sm relative shadow-xl bg-[#12141c]/65 card-gold-glow">
              <div className="classical-corner classical-corner-tl"></div>
              <div className="classical-corner classical-corner-tr"></div>
              <div className="classical-corner classical-corner-bl"></div>
              <div className="classical-corner classical-corner-br"></div>

              <div className="flex flex-col items-center justify-center py-6 text-center space-y-4">
                <BookOpen className="w-12 h-12 text-[#dbb657]" />
                <h4 className="font-serif font-bold text-lg text-amber-200">
                  {lang === 'EN' ? 'Chamber Internship & Library' : 'चैंबर इंटर्नशिप एवं कानून ग्रंथ'}
                </h4>
                <p className="text-xs text-gray-400 max-w-[280px]">
                  {lang === 'EN' 
                    ? 'Advocate Banerjee actively trains and shapes future legal jurists in pleading preparation, civil litigation procedures, and supreme court decorum.'
                    : 'अधिवक्ता अरुणभ बनर्जी कानूनी विलेखन (प्लीडिंग), दीवानी मामलों तथा उच्चतम न्यायालय के नियमों में उभरते वकीलों का व्यक्तिगत मार्गदर्शन करते हैं।'
                  }
                </p>
                <div className="w-32 h-[1px] bg-[#dbb657]/30"></div>
                <p className="text-[10px] uppercase tracking-widest font-bold text-[#dbb657]">
                  {lang === 'EN' ? 'Constitutional Ethics focus' : 'संवैधानिक नैतिकता पर केंद्रित'}
                </p>
              </div>
            </div>
          </motion.div>

        </div>
      </section>

      {/* SECTION 6: CPDR LEADERSHIP & REGIONAL REACH (Panel 6) */}
      <section id="leadership" className="py-16 md:py-24 border-t border-b bg-[#0f1117] border-[#2e2313]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-12">
            <span className="text-[#dbb657] uppercase tracking-widest text-xs font-bold font-mono">
              {lang === 'EN' ? 'NATIONAL LEADERSHIP COMMAND' : 'मानवाधिकार राष्ट्रीय नेतृत्व'}
            </span>
            <h3 className="font-serif text-3xl md:text-4xl font-semibold tracking-wide">
              {t.leadershipTitle}
            </h3>
            <p className="text-xs sm:text-sm text-gray-400">
              {t.leadershipSub}
            </p>
            <div className="w-24 h-[1px] bg-[#dbb657]/60 mx-auto pt-1"></div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            
            {/* Leadership Office Cards representation (Panel 6 details) */}
            <motion.div 
              initial={{ opacity: 0, y: 35 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.7, ease: "easeOut" }}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              className="lg:col-span-4 flex flex-col justify-between p-6 border border-gray-800 bg-[#12141c]/50 rounded-xs relative hover:border-[#dbb657]/30 transition-all shadow-[0_4px_25px_rgba(0,0,0,0.2)]"
            >
              <div className="space-y-4">
                <span className="text-[10px] text-orange-400 font-mono font-bold tracking-widest uppercase">
                  {lang === 'EN' ? 'National Division' : 'राष्ट्रीय प्रभाग'}
                </span>
                <HeartHandshake className="w-8 h-8 text-[#dbb657]" />
                <h4 className="font-serif text-lg font-bold text-amber-200">
                  {lang === 'EN' ? 'C.P.D.R India Delhi' : 'सी.पी.डी.आर इंडिया दिल्ली'}
                </h4>
                <p className="text-xs text-gray-400">
                  {lang === 'EN' 
                    ? 'State President managing human rights litigation registries, protecting unlawful detention victims, and filing important Public Interest Litigations (PIL).'
                    : 'दिल्ली प्रदेश अध्यक्ष के रूप में मानवाधिकार वादों का निपटारा, अवैध हिरासत के खिलाफ त्वरित न्यायिक लड़ाई तथा महत्वपूर्ण जनहित याचिकाएं।'
                  }
                </p>
              </div>
              <div className="pt-4 border-t border-gray-800 mt-6 text-[10px] uppercase text-gray-400">
                {lang === 'EN' ? 'With active support of Secretary, Delhi Division' : 'सचिव, दिल्ली मानवाधिकार प्रभाग का पूर्ण समर्थन'}
              </div>
            </motion.div>

            {/* Gujarat / West India Liaison Chamber of Advocate Arunabh Banerjee */}
            <motion.div 
              initial={{ opacity: 0, y: 45 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }}
              whileHover={{ y: -8, transition: { duration: 0.2 } }}
              className="lg:col-span-4 flex flex-col justify-between p-6 border-2 border-[#dbb657]/45 bg-[#171b24] rounded-xs relative shadow-[0_10px_35px_rgba(219,182,87,0.08)] animate-gold-pulse transition-all"
            >
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-[10.5px] text-emerald-400 font-mono font-extrabold tracking-widest uppercase flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    {lang === 'EN' ? 'West India Joint Division' : 'पश्चिम भारत प्रभाग'}
                  </span>
                  <span className="text-[10px] bg-[#dbb657]/10 text-[#dbb657] border border-[#dbb657]/30 px-2 py-0.5 rounded-full font-serif tracking-wider"> गुजरात 🌍 </span>
                </div>
                <Globe className="w-8 h-8 text-[#dbb657]" />
                <h4 className="font-serif text-lg font-bold text-amber-200 uppercase tracking-wide">
                  {lang === 'EN' ? 'Ahmedabad / Gandhinagar Liaison' : 'अहमदाबाद / गांधीनगर संपर्क प्रभाग'}
                </h4>
                <p className="text-xs text-gray-300 leading-relaxed">
                  {lang === 'EN'
                    ? 'Sustaining rapid civil protections, legal advisory panels, and human rights empowerment seminars in Gujarat under Advocate Arunabh Banerjee’s guidance.'
                    : 'गुजरात प्रभाग के अधीन त्वरित संवैधानिक संरक्षण, कानूनी जागरूकता सेमिनार तथा मानवतावादी विषयों पर विशेष न्यायिक समाधान।'}
                </p>
                <div className="pt-4 border-t border-[#dbb657]/30 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs mt-2">
                  <div className="flex items-center gap-2 text-gray-300 font-mono">
                    <Phone className="w-3.5 h-3.5 text-[#dbb657]" />
                    <a href={`tel:${cmsConfig.contacts.primaryMobile}`} className="hover:text-[#dbb657] font-semibold transition-colors">
                      {cmsConfig.contacts.displayMobile}
                    </a>
                  </div>
                  <a 
                    href={`https://wa.me/${cmsConfig.contacts.whatsappNumber}?text=${encodeURIComponent(cmsConfig.contacts.whatsappMessage)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 py-1.5 px-3 bg-[#25D366] text-black font-extrabold text-[10.5px] rounded-xs uppercase tracking-wider active:scale-95 transition-all shadow-sm"
                  >
                    <MessageSquare className="w-3.5 h-3.5 fill-black text-black" />
                    <span>WhatsApp</span>
                  </a>
                </div>
              </div>
              <div className="pt-4 border-t border-gray-800 mt-6 text-[10px] uppercase text-gray-400">
                {lang === 'EN' ? 'C.P.D.R Western Region Command' : 'सी.पी.डी.आर पश्चिमी भारतीय शाखा'}
              </div>
            </motion.div>

            {/* Highlight Court Ethics Quote */}
            <motion.div 
              initial={{ opacity: 0, y: 35 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.7, ease: "easeOut", delay: 0.2 }}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              className="lg:col-span-4 flex flex-col justify-between p-6 border border-[#dbb657]/40 bg-[#1d160f]/60 rounded-xs relative hover:border-[#dbb657]/80 transition-all shadow-[0_4px_25px_rgba(0,0,0,0.2)]"
            >
              <div className="space-y-4">
                <span className="text-[10px] text-[#dbb657] font-mono font-bold tracking-widest uppercase">
                  {lang === 'EN' ? 'FOUNDATIONAL VALUE' : 'वैचारिक आधार स्तम्भ'}
                </span>
                <Scale className="w-8 h-8 text-[#dbb657]" />
                <p className="font-serif italic text-sm text-gray-200">
                  "{lang === 'EN' 
                    ? 'True advocacy does not step back in front of executive overreach. We stand as shields for the sovereign Indian citizen under constitutional mandates.'
                    : 'सच्ची वकालत प्रशासनिक अराजकता के समक्ष घुटने नहीं टेकती। हम संवैधानिक जनादेश के तहत संप्रभु भारतीय नागरिकों के ढाल के रूप में खड़े हैं।'
                  }"
                </p>
              </div>
              <div className="pt-4 border-t border-gray-800 mt-6 flex justify-between items-center text-[10px] uppercase text-[#dbb657]">
                <span>— Mr. Arunabh Banerjee</span>
                <span className="font-serif text-[9px] tracking-widest">CPDR LEADERSHIP</span>
              </div>
            </motion.div>

          </div>

        </div>
      </section>

      {/* ADDITIONAL EXCELLENCE MODULE: LEGAL GLOSSARY & Citizen Lookup */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Banner */}
        <div className="p-8 border border-gray-800 bg-[#12141c]/40 rounded-sm relative shadow-lg">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            <div className="lg:col-span-6 space-y-3">
              <h4 className="font-serif text-xl sm:text-2xl font-bold tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-white to-[#dbb657]">
                {t.glossaryTitle}
              </h4>
              <p className="text-xs text-gray-400">
                {t.glossarySub}
              </p>
              
              {/* Search bar inputs */}
              <div className="relative mt-4 group">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-[#dbb657] transition-colors" />
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t.searchGlossaryPlaceholder}
                  className="w-full bg-[#0b0d12] border border-[#dbb657]/20 text-xs py-3.5 pl-11 pr-4 text-white focus:outline-none focus:border-[#dbb657] focus:ring-4 focus:ring-[#dbb657]/15 rounded-sm transition-all duration-300 placeholder:text-gray-500 font-serif"
                />
              </div>
            </div>

            {/* Display list of search terms */}
            <div className="lg:col-span-6 space-y-3 max-h-[220px] overflow-y-auto pr-2">
              <AnimatePresence>
                {filteredGlossary.map((item, id) => (
                  <motion.div 
                    key={item.term}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="p-3 bg-[#0a0d13]/90 border border-gray-800 hover:border-[#dbb657]/40 rounded-xs transition-colors"
                  >
                    <div className="flex items-center justify-between text-xs font-bold text-[#dbb657]">
                      <span>{item.term}</span>
                      <span>({item.hindiTerm})</span>
                    </div>
                    <p className="text-[11px] text-gray-400 mt-1 leading-snug">
                      {lang === 'EN' ? item.definition : item.hindiDefinition}
                    </p>
                  </motion.div>
                ))}
                {filteredGlossary.length === 0 && (
                  <p className="text-xs text-center text-gray-500 py-6">
                    {lang === 'EN' ? 'No matching legal terms found.' : 'कोई विधिक शब्द नहीं मिला।'}
                  </p>
                )}
              </AnimatePresence>
            </div>

          </div>

        </div>

      </section>

      {/* SECTION 7: INTERACTIVE CONSULTATION SCHEDULER & CHAMBER LOGS */}
      <section id="consultation" className={`py-16 md:py-24 border-t border-b ${
        theme === 'dark' ? 'bg-[#0f1117] border-[#20190a]' : 'bg-[#fff] border-[#eaddbf]'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            
            {/* Consultation Request Booking Form (Left Pillar) */}
            <div className="lg:col-span-7">
              <div className="p-6 md:p-8 border border-[#dbb657]/40 bg-[#12141c]/60 rounded-xs shadow-xl relative">
                
                {/* Decorative title */}
                <h4 className="font-serif text-xl sm:text-2xl font-bold tracking-wide text-[#dbb657] flex items-center gap-2 mb-2">
                  <Scale className="w-5 h-5 text-[#dbb657]" />
                  {t.appointmentFormTitle}
                </h4>
                <p className="text-xs text-gray-400 mb-4">
                  {lang === 'EN' 
                    ? "Your information is transmitted directly via SSL protocols to the Advocate's private clerk." 
                    : "आपकी जानकारियां पूरी सुरक्षा के साथ सीधे अधिवक्ता के अधिकृत प्रशासनिक क्लर्क को भेजी जाती हैं।"
                  }
                </p>

                {/* Specific custom call-to-action requested by user */}
                <div className="p-4 mb-6 border-l-4 border-[#dbb657] bg-[#161a24]/80 text-[#f3e7c4] rounded-r-xs flex items-start gap-3">
                  <div className="p-1 bg-[#dbb657]/10 rounded-full text-[#dbb657] mt-0.5 flex-shrink-0">
                    <Scale className="w-4 h-4" />
                  </div>
                  <div>
                    <h5 className="text-[11px] uppercase tracking-wider font-bold text-[#dbb657] font-sans">
                      {lang === 'EN' ? 'Expert Court Litigation Representation' : 'विशेषज्ञ अदालती मुकदमा प्रतिनिधित्व'}
                    </h5>
                    <p className="text-xs text-gray-300 mt-1 leading-relaxed font-serif">
                      {lang === 'EN'
                        ? "If you want to represent your rights, resolve a complex dispute, or fight a legal case in court, contact us directly today for a strategic legal consultation."
                        : "यदि आप न्यायालय के समक्ष अपने अधिकारों की रक्षा करना चाहते हैं या कानूनी मुकदमा लड़ना चाहते हैं, तो श्रेष्ठ रणनीति व अदालती वकालत के लिए आज ही हमसे सीधे संपर्क करें।"
                      }
                    </p>
                  </div>
                </div>

                <form onSubmit={handleFormSubmit} className="space-y-4">
                  
                  {/* Name field */}
                  <div>
                    <label className="block text-[11px] uppercase tracking-wider text-[#dbb657] font-bold mb-1.5">{t.formName} *</label>
                    <input 
                      type="text" 
                      required
                      name="name"
                      value={formData.name}
                      onChange={handleFormChange}
                      placeholder={lang === 'EN' ? "e.g., Harish Kumar" : "जैसे कि: हरीश कुमार"}
                      className="w-full bg-[#0a0c10] border border-gray-800/80 text-xs py-3.5 px-4 focus:outline-none focus:border-[#dbb657] focus:ring-4 focus:ring-[#dbb657]/10 text-white rounded-xs transition-all duration-300 placeholder:text-gray-600 font-serif"
                    />
                  </div>

                  {/* Contact info grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] uppercase tracking-wider text-[#dbb657] font-bold mb-1.5">{t.formPhone} *</label>
                      <input 
                        type="text" 
                        required
                        name="phone"
                        value={formData.phone}
                        onChange={handleFormChange}
                        placeholder="+91 98XXX-XXXXX"
                        className="w-full bg-[#0a0c10] border border-gray-800/80 text-xs py-3.5 px-4 focus:outline-none focus:border-[#dbb657] focus:ring-4 focus:ring-[#dbb657]/10 text-white rounded-xs transition-all duration-300 placeholder:text-gray-600 font-serif"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] uppercase tracking-wider text-[#dbb657] font-bold mb-1.5">{t.formEmail}</label>
                      <input 
                        type="email" 
                        name="email"
                        value={formData.email}
                        onChange={handleFormChange}
                        placeholder="client@domain.com"
                        className="w-full bg-[#0a0c10] border border-gray-800/80 text-xs py-3.5 px-4 focus:outline-none focus:border-[#dbb657] focus:ring-4 focus:ring-[#dbb657]/10 text-white rounded-xs transition-all duration-300 placeholder:text-gray-600 font-serif"
                      />
                    </div>
                  </div>

                  {/* Case Type dropdown mapper with Translations list */}
                  <div>
                    <label className="block text-[11px] uppercase tracking-wider text-[#dbb657] font-bold mb-1.5">{t.formCaseType}</label>
                    <select 
                      name="caseType"
                      value={formData.caseType}
                      onChange={handleFormChange}
                      className="w-full bg-[#0a0c10] border border-gray-800/80 text-xs py-3.5 px-4 focus:outline-none focus:border-[#dbb657] focus:ring-4 focus:ring-[#dbb657]/10 text-white rounded-xs transition-all duration-300 font-serif"
                    >
                      {t.practiceAreas.map(item => (
                        <option key={item.id} value={item.id} className="bg-[#0b0c10]">{item.title}</option>
                      ))}
                    </select>
                  </div>

                  {/* Message brief */}
                  <div>
                    <label className="block text-[11px] uppercase tracking-wider text-[#dbb657] font-bold mb-1.5">{t.formMessage}</label>
                    <textarea 
                      name="message"
                      rows={4}
                      value={formData.message}
                      onChange={handleFormChange}
                      placeholder={lang === 'EN' ? "Brief summary of court listings, pending warrants, or writ requirements..." : "अदालती मामले, धारा विवरण व तात्कालिक राहतों का संक्षिप्त विवरण..."}
                      className="w-full bg-[#0a0c10] border border-gray-800/80 text-xs py-3.5 px-4 focus:outline-none focus:border-[#dbb657] focus:ring-4 focus:ring-[#dbb657]/10 text-white rounded-xs transition-all duration-300 placeholder:text-gray-600 font-serif"
                    ></textarea>
                  </div>

                  {/* Submit Button */}
                  <div className="relative">
                    {isFormSubmitting ? (
                      <div className="w-full bg-gradient-to-r from-[#1c1d24] to-[#12141c] text-[#dbb657] py-3.5 px-4 rounded-sm border border-[#dbb657]/45 flex flex-col items-center justify-center gap-2 overflow-hidden shadow-md">
                        <div className="flex items-center gap-3">
                          <svg className="animate-spin h-5 w-5 text-[#dbb657]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <span className="font-extrabold uppercase tracking-wider text-[11px] animate-pulse text-[#dbb657]">
                            {lang === 'EN' ? 'SECURE REGISTERING...' : 'सुरक्षित प्रलेखन...'}
                          </span>
                        </div>
                        <p className="text-[10px] text-gray-400 font-serif italic tracking-wide text-center">
                          {submissionStep}
                        </p>
                      </div>
                    ) : (
                      <button 
                        type="submit"
                        disabled={formSubmitted}
                        className="group relative w-full bg-gradient-to-r from-[#dbb657] via-[#f3e7c4] to-[#dbb657] hover:from-[#f3e7c4] hover:to-[#dbb657] text-[#12141c] py-3.5 rounded-sm font-extrabold tracking-widest text-xs uppercase shadow-[0_4px_15px_rgba(219,182,87,0.15)] hover:shadow-[0_6px_25px_rgba(219,182,87,0.35)] overflow-hidden active:scale-[0.98] transition-all duration-300"
                      >
                        <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></span>
                        <span className="relative z-10 flex items-center justify-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-[#12141c] transition-transform group-hover:rotate-12" />
                          {t.formSubmit}
                        </span>
                      </button>
                    )}
                  </div>

                  {/* Success prompt */}
                  <AnimatePresence>
                    {formSubmitted && (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="p-5 bg-gradient-to-br from-[#0c1f14] to-[#06140c] border border-emerald-500/65 rounded-sm text-xs text-emerald-100 space-y-4 mt-6 relative shadow-2xl"
                      >
                        <button 
                          type="button" 
                          onClick={() => setFormSubmitted(false)}
                          className="absolute top-3 right-3 text-emerald-400 hover:text-white transition-colors cursor-pointer"
                        >
                          <X className="w-4 h-4" />
                        </button>

                        <div className="space-y-1">
                          <p className="font-bold text-sm flex items-center gap-1.5 text-emerald-400">
                            <CheckCircle2 className="w-5 h-5 animate-pulse" />
                            {lang === 'EN' ? 'Consultation Request Registered!' : 'परामर्श प्रविष्टि सुरक्षित!'}
                          </p>
                          <p className="text-gray-300 text-[11px] leading-relaxed">
                            {lang === 'EN' 
                              ? 'Your query has been logged in the local Session Registry dashboard (on the right).' 
                              : 'आपकी प्रविष्टि को आपके स्थानीय डेस्कटॉप/ब्राউজার ড্যাশবোর্ডে নিবন্ধিত করা হয়েছে।'
                            }
                          </p>
                        </div>

                        <div className="h-[1px] bg-emerald-500/25 w-full"></div>

                        {/* Interactive dispatch triggers */}
                        <div className="space-y-2.5">
                          <p className="font-semibold text-emerald-300 font-serif text-[11px]">
                            {lang === 'EN' 
                              ? '👉 Dispatch this summary directly to the Advocate\'s Clerk:' 
                              : '👉 এই কেসের বিবরণ সরাসরি অ্যাডভোকেটের কাছে পাঠান:'
                            }
                          </p>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <a 
                              href={getWhatsAppUrl()}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center justify-center gap-2 py-2.5 px-3 bg-[#25D366] hover:bg-[#20ba56] text-black font-extrabold text-[11px] uppercase tracking-wider rounded-xs transition-colors hover:shadow-lg active:scale-95 cursor-pointer"
                            >
                              <MessageSquare className="w-4 h-4 fill-black" />
                              <span>{lang === 'EN' ? 'WhatsApp (Easy)' : 'হোয়াটসঅ্যাপ করুন'}</span>
                            </a>
                            
                            <a 
                              href={getEmailUrl()}
                              className="flex items-center justify-center gap-2 py-2.5 px-3 border border-emerald-500 hover:bg-emerald-500/10 text-emerald-300 font-extrabold text-[11px] uppercase tracking-wider rounded-xs transition-colors hover:shadow-lg active:scale-95 cursor-pointer"
                            >
                              <Globe className="w-4 h-4" />
                              <span>{lang === 'EN' ? 'Send via Email' : 'ইমেল করুন'}</span>
                            </a>
                          </div>
                          
                          <p className="text-[10px] text-gray-400 italic text-center leading-normal">
                            {lang === 'EN'
                              ? 'WhatsApp is recommended for near-instant response from our New Delhi Clerical Chamber.'
                              : 'দ্রুত জবাব পাওয়ার জন্য হোয়াটসঅ্যাপে পাঠানো সবচেয়ে সেরা ও সহজ মাধ্যম।'
                            }
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                </form>

              </div>
            </div>

            {/* Dashboard / Queue Monitor: Display booked logs (Right Pillar) */}
            <div className="lg:col-span-5 space-y-6">
              
              <div className="p-6 border border-gray-800 bg-[#12141c]/40 rounded-xs space-y-4">
                <span className="text-[10px] uppercase font-bold tracking-widest text-[#dbb657] bg-[#dbb657]/15 border border-[#dbb657]/30 px-2 py-0.5 rounded-xs">
                  {lang === 'EN' ? 'CLIENT SELF SERVICE PORTAL' : 'नागरिक विधिक सेवा डेस्क'}
                </span>
                <h4 className="font-serif text-lg font-bold text-amber-200">
                  {lang === 'EN' ? 'Active Consultation Registry' : 'सक्रिय परामर्श कतार'}
                </h4>
                <p className="text-xs text-gray-400 leading-relaxed">
                  {lang === 'EN' 
                    ? "Consultation bookings saved locally in your current browser sandbox session. Useful to track slot reminders or cancel."
                    : "आपकी आरक्षित परामर्श इतिहास को आपके ब्राउज़र कैश मेमोरी के अंतर्गत ही ट्रैक किया जाएगा।"
                  }
                </p>

                {/* Queue display list */}
                <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
                  {existingRequests.map((req, id) => (
                    <div key={req.id} className="p-3 bg-black/40 border border-gray-800 rounded-xs text-xs space-y-1">
                      <div className="flex items-center justify-between font-bold text-[#dbb657]">
                        <span>{req.name}</span>
                        <span className="text-[10px] text-gray-500">{req.date} @ {req.time}</span>
                      </div>
                      <p className="text-gray-400 text-[10px]">
                        <span className="font-bold text-gray-300">Category:</span> {req.caseType.toUpperCase()}
                      </p>
                      <p className="text-gray-400 text-[10px]">
                        <span className="font-bold text-gray-300">Tel:</span> {req.phone}
                      </p>
                    </div>
                  ))}
                  {existingRequests.length === 0 && (
                    <div className="text-center py-8 text-gray-500 text-xs border border-dashed border-gray-800 rounded-xs">
                      {lang === 'EN' ? 'No consultation slots booked yet.' : 'अभी तक कोई बुकिंग दर्ज नहीं है।'}
                    </div>
                  )}
                </div>

                {existingRequests.length > 0 && (
                  <button 
                    onClick={() => {
                      localStorage.removeItem("arunabh_consultations");
                      setExistingRequests([]);
                    }}
                    className="w-full py-1.5 border border-dashed border-red-500/30 text-red-400 text-[10px] font-bold uppercase tracking-wider hover:bg-red-500/10 transition-colors rounded-xs"
                  >
                    {lang === 'EN' ? 'Clear Local Entries' : 'इतिहास साफ़ करें'}
                  </button>
                )}

              </div>

              {/* Dynamic Helpline Card */}
              <div className="p-6 border border-[#dbb657]/20 bg-gradient-to-br from-[#1c150c]/80 to-[#12141c]/90 rounded-xs relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-[#dbb657]/10 to-transparent pointer-events-none"></div>
                
                <h5 className="font-serif text-[#dbb657] text-xs font-bold uppercase tracking-widest flex items-center gap-1.5 mb-4">
                  <Phone className="w-3.5 h-3.5" />
                  {lang === 'EN' ? 'DIRECT CONTACT CHANNELS' : 'सीधे चैंबर संपर्क सूत्र'}
                </h5>

                <div className="space-y-4">
                  {/* Advocate Arunabh Banerjee Division */}
                  <div className="space-y-2 pb-4 border-b border-gray-800/60 text-left">
                    <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">
                      {lang === 'EN' ? 'Advocate Arunabh Banerjee (Delhi/SC)' : 'अधिवक्ता अरुणभ बनर्जी (दिल्ली/SC)'}
                    </p>
                    <p className="font-mono text-lg font-bold text-white leading-none">
                      +91 98107 03335
                    </p>
                    <a 
                      href="https://wa.me/919810703335?text=Hello%20Advocate%20Banerjee%2C%20I%20am%20reaching%20out%20via%20your%20Supreme%20Court%20Advocate%20Portal."
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group relative flex items-center justify-center gap-2 w-full py-2 bg-[#25D366] hover:bg-[#20ba56] text-black font-sans font-extrabold text-[10px] rounded-xs uppercase tracking-wider transition-all duration-300 shadow-md active:scale-95 border border-[#25D366]/40 cursor-pointer"
                    >
                      <MessageSquare className="w-3.5 h-3.5 fill-black text-black mt-0.5" />
                      <span>{lang === 'EN' ? 'WhatsApp Banerjee' : 'व्हाट्सएप बनर्जी संपर्क'}</span>
                    </a>
                  </div>

                  {/* Supreme Court Urgent Listing Desk */}
                  <div className="space-y-2 text-left pt-1">
                    <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">
                      {lang === 'EN' ? 'Supreme Court Urgent Listing Desk' : 'सुप्रीम कोर्ट आपातकालीन लिस्टिंग डेस्क'}
                    </p>
                    <p className="font-mono text-lg font-bold text-[#dbb657] leading-none">
                      {cmsConfig.contacts.displayMobile}
                    </p>
                    <a 
                      href={`https://wa.me/${cmsConfig.contacts.whatsappNumber}?text=${encodeURIComponent("Hello Advocate Arunabh Banerjee, I require urgent judicial listing assistance.")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group relative flex items-center justify-center gap-2 w-full py-2 bg-[#25D366] hover:bg-[#20ba56] text-black font-sans font-extrabold text-[10px] rounded-xs uppercase tracking-wider transition-all duration-300 shadow-md active:scale-95 border border-[#25D366]/40 cursor-pointer"
                    >
                      <MessageSquare className="w-3.5 h-3.5 fill-black text-black mt-0.5" />
                      <span>{lang === 'EN' ? 'Emergency WhatsApp' : 'आपातकालीन व्हाट्सएप'}</span>
                    </a>
                  </div>
                </div>

                <p className="text-[10px] text-gray-400 mt-4 leading-snug">
                  {lang === 'EN' 
                    ? "Available 10:00 AM — 08:30 PM (Mon-Sat). Emergency listing service available 24/7 on Sundays."
                    : "सोमवार से शनिवार सुबह १० बजे से रात ८:३० तक संपर्क करें। रविवार को आपातकालीन विधिक सेवाएं।"
                  }
                </p>
              </div>

            </div>

          </div>

        </div>
      </section>

      {/* SECTION 8: CHAMBERS DIRECTORY & PHYSICAL LOCATIONS (Panel 7) */}
      <section id="chambers" className="py-16 md:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-12">
          <span className="text-[#dbb657] uppercase tracking-widest text-[#dbb657] text-xs font-bold font-mono">
            {lang === 'EN' ? 'GEOGRAPHIC DEPLOYMENT' : 'कार्यालय एवं विधिक चैंबर्स'}
          </span>
          <h3 className="font-serif text-3xl md:text-4xl font-semibold tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-white to-[#dbb657]">
            {t.chamberTitle}
          </h3>
          <p className="text-xs sm:text-sm text-gray-400">
            {t.contactSub}
          </p>
          <div className="w-24 h-[1px] bg-[#dbb657]/60 mx-auto pt-1"></div>
        </div>

        {/* Triple Chambers layout matching card/brochure exactly */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {t.chambers.map((cb: ChamberLocation, index: number) => (
            <motion.div 
              key={cb.name}
              initial={{ opacity: 0, y: 35 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.6, delay: index * 0.1, ease: "easeOut" }}
              whileHover={{ 
                y: -10, 
                scale: 1.03,
                boxShadow: "0 20px 40px -15px rgba(219,182,87,0.25)",
                transition: { duration: 0.2, ease: "easeOut" }
              }}
              className="p-6 border rounded-sm relative flex flex-col justify-between overflow-hidden group hover:border-[#dbb657] transition-all duration-300 shadow-sm bg-[#12141c]/60 border-gray-800/80 card-gold-glow"
            >
              
              <div className="space-y-4">
                
                {/* Chamber Icon representation */}
                <div className="bg-[#1c222e] p-2.5 border border-[#dbb657]/20 rounded-xs w-fit text-[#dbb657] group-hover:scale-110 transition-transform">
                  {cb.type === 'supreme' ? <Scale className="w-5 h-5" /> : cb.type === 'saket' ? <Gavel className="w-5 h-5" /> : <Building className="w-5 h-5" />}
                </div>

                <div className="space-y-1">
                  <h4 className="font-serif font-bold text-[#dbb657] text-md transition-colors group-hover:text-amber-200">
                    {cb.name}
                  </h4>
                  {cb.landmark && (
                    <span className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold">
                      📍 {cb.landmark}
                    </span>
                  )}
                </div>

                <p className="text-xs leading-relaxed text-gray-300">
                  {cb.address}
                </p>

              </div>

              {/* Action trigger links */}
              <div className="pt-6 border-t border-gray-800/80 mt-6 flex items-center justify-between">
                <a 
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(cb.address)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-bold text-gray-400 hover:text-white transition-colors flex items-center gap-1"
                >
                  <span>{lang === 'EN' ? 'Navigate Map' : 'मानचित्र खोलें'}</span>
                  <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </a>
                <span className="text-[10px] uppercase tracking-widest text-[#dbb657] font-bold">
                  {cb.type.toUpperCase()}
                </span>
              </div>

            </motion.div>
          ))}
        </div>

      </section>

      {/* FOOTER: Custom credits and clean legal declarations */}
      <footer className={`py-12 border-t transition-colors duration-300 ${
        theme === 'dark' ? 'bg-[#0a0c10] border-gray-900' : 'bg-[#faf7ee] border-[#dfd5b5]'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          
          {/* Logo stamp */}
          <div className="flex justify-center flex-col items-center gap-2">
            <div className="p-2 border border-[#dbb657]/30 bg-black/20 rounded-full w-fit">
              <Scale className="w-5 h-5 text-[#dbb657]" />
            </div>
            <h5 className="font-serif font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#f3e7c4] to-[#b28d2f] uppercase tracking-widest text-xs">
              Advocate Arunabh Banerjee
            </h5>
            <p className="text-[9px] uppercase tracking-widest text-gray-500 font-mono">
              Supreme Court of India • Delhi High Court
            </p>
          </div>

          <div className="w-16 h-[1px] bg-[#dbb657]/40 mx-auto"></div>

          {/* Copyright description */}
          <div className="text-[10px] text-gray-500 leading-snug max-w-xl mx-auto space-y-2">
            <p>
              {lang === 'EN'
                ? "© 2026 Chambers of Advocate Arunabh Banerjee. All Rights Reserved. Disclaimer: In compliance with the Bar Council of India rules, this digital portfolio page is developed purely to present verified historical human rights leadership statistics and details, and is not designed to solicit, advertise or lobby litigation briefs."
                : "© २०२६ अधिवक्ता अरुणभ बनर्जी चैंबर्स। सर्वाधिकार सुरक्षित। अस्वीकरण: बार काउंसिल ऑफ इंडिया के नियमों के अनुपालन में, यह डिजिटल पोर्टफोलियो केवल प्रामाणिक मानवाधिकार नेतृत्व क्रेडेंशियल को प्रस्तुत करने के उद्देश्य से बनाया गया है, और किसी प्रकार के विज्ञापनों का प्रसार नहीं करता है।"
              }
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 text-gray-500">
              <p className="font-mono text-[9px] text-[#dbb657]/60">
                {lang === 'EN' ? 'Sovereign Digital Identity Verified' : 'भारतीय संप्रभु डिजिटल पहचान सत्यापित'} • CPDR-IND-2026
              </p>
              <span className="hidden sm:inline text-gray-700">•</span>
              <a 
                href="https://wa.me/8801609166109?text=Hello%20Ratan%2C%20I%20saw%20your%20development%20work%20on%20Advocate%20Arunabh%20Banerjee%20website%2C%20and%20would%20like%20to%20inquire%20about%20a%20project." 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-[9px] font-mono text-gray-400 hover:text-[#dbb657] transition-colors focus:outline-none focus:ring-1 focus:ring-[#dbb657] rounded-xs px-1"
                title="Contact Developer Ratan via WhatsApp"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>{lang === 'EN' ? 'Developer: Ratan' : 'डेवलपर: रतन'}</span>
              </a>
            </div>

            {/* Domain, Live Counter & Compliance */}
            <div className="pt-3 border-t border-gray-900/60 flex flex-wrap items-center justify-center gap-4 text-[11px] font-mono">
              <span 
                onClick={handleSecretAdminTrigger}
                className="text-gray-400 flex items-center gap-1.5 cursor-default select-none hover:text-[#dbb657] transition-colors"
                title="Official Chamber Domain"
              >
                <Globe className="w-3.5 h-3.5 text-[#dbb657]" />
                <span className="text-[#dbb657]">arunabhbanerjee.com</span>
              </span>
              <span className="text-gray-700">•</span>
              <span className="text-emerald-400 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>{visitorStats.totalVisits} Total Views</span>
              </span>
              <span className="text-gray-700">•</span>
              <button
                type="button"
                onClick={() => setShowBciModal(true)}
                className="inline-flex items-center gap-1.5 text-gray-400 hover:text-[#dbb657] cursor-pointer transition-colors"
              >
                <Shield className="w-3 h-3 text-[#dbb657]" />
                <span>{lang === 'EN' ? 'BCI Compliance & Disclaimer' : 'बार काउंसिल अनुपालन'}</span>
              </button>
            </div>
          </div>

        </div>
      </footer>

      {/* Sleek Mobile Bottom Quick Action Bar (Phones only) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0b0c10]/95 backdrop-blur-xl border-t border-[#dbb657]/30 px-3 py-2.5 shadow-[0_-10px_25px_rgba(0,0,0,0.85)] flex items-center justify-between gap-2 safe-area-bottom">
        <a 
          href={`tel:${cmsConfig.contacts.primaryMobile}`}
          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-gradient-to-r from-[#dbb657] via-[#f3e7c4] to-[#dbb657] text-[#0f1115] font-extrabold text-[11px] uppercase tracking-wider rounded-xs shadow-md active:scale-95 transition-transform"
        >
          <Phone className="w-3.5 h-3.5" />
          <span>{lang === 'EN' ? 'Call Chamber' : 'कॉल करें'}</span>
        </a>
        <a 
          href={`https://wa.me/${cmsConfig.contacts.whatsappNumber}?text=${encodeURIComponent(cmsConfig.contacts.whatsappMessage)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-[#25D366] text-black font-extrabold text-[11px] uppercase tracking-wider rounded-xs shadow-md active:scale-95 transition-transform"
        >
          <MessageSquare className="w-3.5 h-3.5 fill-black text-black" />
          <span>WhatsApp</span>
        </a>
        <a 
          href="#consultation"
          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-[#171a24] text-[#dbb657] border border-[#dbb657]/40 font-extrabold text-[11px] uppercase tracking-wider rounded-xs shadow-md active:scale-95 transition-transform"
        >
          <Calendar className="w-3.5 h-3.5 text-[#dbb657]" />
          <span>{lang === 'EN' ? 'Book Case' : 'केस बुक'}</span>
        </a>
      </div>

      {/* Bar Council of India (BCI) Rule 36 Mandatory Compliance & Legal Safety Modal */}
      <AnimatePresence>
        {showBciModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[120] bg-black/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6"
          >
            <motion.div 
              initial={{ scale: 0.94, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.94, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="max-w-xl w-full bg-[#0e1017] border border-[#dbb657]/45 rounded-sm p-6 sm:p-8 shadow-[0_20px_60px_rgba(0,0,0,0.9)] relative overflow-hidden"
            >
              {/* Corner Ornaments */}
              <div className="classical-corner classical-corner-tl"></div>
              <div className="classical-corner classical-corner-tr"></div>
              <div className="classical-corner classical-corner-bl"></div>
              <div className="classical-corner classical-corner-br"></div>

              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 bg-[#171b26] border border-[#dbb657]/40 rounded-full">
                  <Scale className="w-6 h-6 text-[#dbb657]" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-base sm:text-lg text-transparent bg-clip-text bg-gradient-to-r from-[#f3e7c4] to-[#dbb657] uppercase tracking-wide">
                    {lang === 'EN' ? 'Bar Council of India Compliance' : 'बार काउंसिल ऑफ इंडिया अनुपालन'}
                  </h3>
                  <p className="text-[10px] text-gray-400 uppercase tracking-widest font-mono">
                    Rule 36 Compliance • Chamber of Adv. Arunabh Banerjee
                  </p>
                </div>
              </div>

              <div className="space-y-3 text-xs text-gray-300 leading-relaxed font-sans border-t border-b border-gray-800/80 py-4 my-4 max-h-[50vh] overflow-y-auto pr-2">
                <p>
                  {lang === 'EN'
                    ? "Under Rule 36 of the Bar Council of India Rules, advocates are prohibited from soliciting work or advertising in any form. This digital chamber portal is strictly for informational and educational purposes."
                    : "बार काउंसिल ऑफ इंडिया के नियमों (नियम 36) के अनुसार अधिवक्ताओं द्वारा विधिक कार्य का विज्ञापन या याचना करना पूर्णतः निषेध है। यह डिजिटल पोर्टल केवल प्रामाणिक सूचना हेतु है।"
                  }
                </p>
                <p className="font-semibold text-[#dbb657]">
                  {lang === 'EN'
                    ? "By proceeding to enter, you acknowledge and agree:"
                    : "प्रवेश करके आप पुष्टि करते हैं कि:"
                  }
                </p>
                <ul className="space-y-2 pl-4 list-disc text-gray-400 text-[11px]">
                  <li>
                    {lang === 'EN'
                      ? "You are voluntarily seeking information regarding Advocate Arunabh Banerjee and his practice areas of your own volition."
                      : "आप अपनी स्वेच्छा से अधिवक्ता अरुणभ बनर्जी एवं उनके चैंबर के संबंध में जानकारी प्राप्त कर रहे हैं।"
                    }
                  </li>
                  <li>
                    {lang === 'EN'
                      ? "There has been no advertisement, personal solicitation, inducement, or invitation from the advocate or chamber staff."
                      : "अधिवक्ता या उनके कर्मचारियों द्वारा कोई विज्ञापन, याचना अथवा आमंत्रण नहीं दिया गया है।"
                    }
                  </li>
                  <li>
                    {lang === 'EN'
                      ? "The information provided is not legal advice and creates no attorney-client relationship without a formal vakalatnama or engagement letter."
                      : "यह सूचना विधिक सलाह नहीं है और बिना औपचारिक वकालतनामा के कोई विधिक संबंध स्थापित नहीं करती।"
                    }
                  </li>
                </ul>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  type="button"
                  onClick={acceptBciDisclaimer}
                  className="flex-1 py-3 px-6 bg-gradient-to-r from-[#dbb657] via-[#f3e7c4] to-[#dbb657] hover:from-[#f3e7c4] hover:to-[#dbb657] text-[#12141c] font-bold text-xs uppercase tracking-widest rounded-xs shadow-lg active:scale-95 transition-all text-center cursor-pointer flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4 text-[#12141c]" />
                  <span>{lang === 'EN' ? 'I Acknowledge & Enter Portal' : 'स्वीकार करें एवं प्रवेश करें'}</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Admin Panel Modal Overlay */}
      {isAdminOpen && (
        <AdminPanel
          onClose={() => {
            setIsAdminOpen(false);
            if (window.location.hash === "#admin") {
              window.location.hash = "";
            }
            if (window.location.pathname === "/admin") {
              window.history.pushState({}, "", "/");
            }
          }}
        />
      )}

      {/* Premium Ambient Lights & Cursor */}
      <>
        {/* Soft cursor ambient glow spotlight */}
        <div 
          className="custom-cursor-glow hidden md:block"
          style={{
            left: `${mousePos.x}px`,
            top: `${mousePos.y}px`,
          }}
        />
        {/* Precision inner dot */}
        <div 
          className="custom-cursor-dot hidden md:block"
          style={{
            left: `${mousePos.x}px`,
            top: `${mousePos.y}px`,
            transform: `translate(-50%, -50%) scale(${isHovered ? 1.6 : 1})`,
            backgroundColor: isHovered ? '#ffffff' : '#dbb657',
            boxShadow: isHovered ? '0 0 10px #ffffff' : 'none',
            transition: 'transform 0.15s ease-out, background-color 0.15s',
          }}
        />
        {/* Outer lagging ring */}
        <div 
          className="custom-cursor hidden md:block"
          style={{
            left: `${lagMousePos.x}px`,
            top: `${lagMousePos.y}px`,
            transform: `translate(-50%, -50%) scale(${isHovered ? 1.5 : 1})`,
            borderColor: isHovered ? '#ffffff' : 'rgba(219, 182, 87, 0.75)',
            backgroundColor: isHovered ? 'rgba(219, 182, 87, 0.15)' : 'transparent',
            transition: 'transform 0.15s ease-out, border-color 0.15s, background-color 0.15s',
          }}
        />
        {/* Golden spark trail */}
        {sparkles.map((sp) => (
          <div
            key={sp.id}
            className="fixed pointer-events-none rounded-full z-[9998] animate-ping"
            style={{
              left: `${sp.x}px`,
              top: `${sp.y}px`,
              width: `${sp.size}px`,
              height: `${sp.size}px`,
              backgroundColor: sp.color,
              transform: 'translate(-50%, -50%)',
              opacity: 0.8,
              boxShadow: `0 0 6px ${sp.color}`,
            }}
          />
        ))}
      </>

    </div>
  );
}
