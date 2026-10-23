/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  Lock, 
  Shield, 
  Save, 
  RotateCcw, 
  ExternalLink, 
  LogOut, 
  Check, 
  AlertCircle, 
  Users, 
  FileText, 
  Phone, 
  Image as ImageIcon, 
  Palette, 
  Globe, 
  Database, 
  Trash2, 
  Download, 
  Plus, 
  Search, 
  MessageSquare, 
  Eye, 
  Sparkles, 
  Briefcase, 
  Compass,
  CheckCircle2,
  Calendar,
  Clock,
  Upload,
  Bell,
  BellRing,
  Smartphone,
  Edit3,
  Scale,
  X
} from "lucide-react";
import { SiteCMSConfig, LeadItem, VisitorStats } from "../types/cms";
import { cmsService } from "../services/cmsService";

interface AdminPanelProps {
  onClose: () => void;
}

export default function AdminPanel({ onClose }: AdminPanelProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [passwordInput, setPasswordInput] = useState<string>("");
  const [authError, setAuthError] = useState<string>("");
  const [rememberPasscode, setRememberPasscode] = useState<boolean>(true);
  const [deferredInstallPrompt, setDeferredInstallPrompt] = useState<any>(null);
  const [isAppInstalled, setIsAppInstalled] = useState<boolean>(false);
  const [showInstallModal, setShowInstallModal] = useState<boolean>(false);
  const [hasNotificationPerm, setHasNotificationPerm] = useState<boolean>(cmsService.hasNotificationPermission());

  const [activeTab, setActiveTab] = useState<
    "dashboard" | "leads" | "texts" | "practice" | "contacts" | "buttons" | "pictures" | "clientCategories" | "theme" | "seo" | "firebase"
  >("dashboard");

  const [config, setConfig] = useState<SiteCMSConfig>(cmsService.getConfig());
  const [leads, setLeads] = useState<LeadItem[]>(cmsService.getLeads());
  const [visitorStats, setVisitorStats] = useState<VisitorStats>(cmsService.getVisitorStats());
  const [saveStatus, setSaveStatus] = useState<string>("");
  const [searchLeadQuery, setSearchLeadQuery] = useState<string>("");
  const [leadStatusFilter, setLeadStatusFilter] = useState<string>("all");
  const [firebaseStatusMsg, setFirebaseStatusMsg] = useState<string>("");
  const [leadToDelete, setLeadToDelete] = useState<LeadItem | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // Check if session was already authenticated or remembered
  useEffect(() => {
    const remembered = localStorage.getItem("arunabh_admin_remember");
    const storedPass = localStorage.getItem("arunabh_admin_auth");
    const sessionPass = sessionStorage.getItem("arunabh_admin_auth");

    if ((remembered === "true" && storedPass === "2026") || sessionPass === "2026") {
      setIsAuthenticated(true);
    }

    // Capture PWA beforeinstallprompt event
    const installHandler = (e: any) => {
      e.preventDefault();
      setDeferredInstallPrompt(e);
    };
    window.addEventListener("beforeinstallprompt", installHandler);

    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsAppInstalled(true);
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", installHandler);
    };
  }, []);

  // Subscribe to live leads and config updates
  useEffect(() => {
    const unsubConfig = cmsService.subscribeConfig((newConfig) => {
      setConfig(newConfig);
    });
    const unsubLeads = cmsService.subscribeLeads((newLeads) => {
      setLeads(newLeads);
    });
    setVisitorStats(cmsService.getVisitorStats());

    return () => {
      unsubConfig();
      unsubLeads();
    };
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === "2026") {
      setIsAuthenticated(true);
      if (rememberPasscode) {
        localStorage.setItem("arunabh_admin_remember", "true");
        localStorage.setItem("arunabh_admin_auth", "2026");
      } else {
        localStorage.removeItem("arunabh_admin_remember");
        localStorage.removeItem("arunabh_admin_auth");
      }
      sessionStorage.setItem("arunabh_admin_auth", "2026");
      setAuthError("");
    } else {
      setAuthError("Incorrect passcode. Access denied.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("arunabh_admin_remember");
    localStorage.removeItem("arunabh_admin_auth");
    sessionStorage.removeItem("arunabh_admin_auth");
    setIsAuthenticated(false);
    setPasswordInput("");
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

  const handleToggleNotifications = async () => {
    const granted = await cmsService.requestNotificationPermission();
    setHasNotificationPerm(granted);
    if (granted) {
      cmsService.playNotificationChime();
      cmsService.sendBrowserNotification("⚖️ Chamber Notifications Active", "You will receive instant alerts for every new consultation booking.");
    }
  };

  const handleCreateTestLead = async () => {
    setSaveStatus("Creating test booking...");
    await cmsService.addLead({
      name: "Test Verification Client",
      phone: "+91 98107 03335",
      clientCategory: "Corporate",
      caseType: "Commercial Dispute & Arbitration",
      date: new Date().toISOString().split("T")[0],
      message: "Testing instant admin notification & real-time synchronization.",
      isUrgent: true
    });
    setSaveStatus("Test booking created and synced!");
    setTimeout(() => setSaveStatus(""), 4000);
  };

  const handleSaveAll = async () => {
    setSaveStatus("Saving changes...");
    const success = await cmsService.saveConfig(config);
    if (success) {
      setSaveStatus("Saved successfully in real-time!");
      setTimeout(() => setSaveStatus(""), 4000);
    } else {
      setSaveStatus("Failed to save changes.");
    }
  };

  const handleResetDefaults = () => {
    if (window.confirm("Are you sure you want to reset all site settings to official defaults?")) {
      const reset = cmsService.resetToDefaultConfig();
      setConfig(reset);
      setSaveStatus("Reset to default configuration.");
      setTimeout(() => setSaveStatus(""), 3000);
    }
  };

  const handleLeadStatusChange = (id: string, newStatus: LeadItem["status"]) => {
    cmsService.updateLeadStatus(id, newStatus);
  };

  const handleDeleteLeadClick = (lead: LeadItem, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setLeadToDelete(lead);
  };

  const confirmDeleteLead = async () => {
    if (!leadToDelete) return;
    const targetId = leadToDelete.id;
    const targetName = leadToDelete.name;
    setIsDeleting(true);
    try {
      // 1. Optimistic instant UI update
      setLeads(prev => prev.filter(l => l.id !== targetId));
      // 2. Persist deletion in cmsService
      await cmsService.deleteLead(targetId);
      setSaveStatus(`Deleted lead: ${targetName}`);
      setTimeout(() => setSaveStatus(""), 3500);
    } catch (err) {
      console.error("Failed to delete lead", err);
    } finally {
      setIsDeleting(false);
      setLeadToDelete(null);
    }
  };

  const handleExportCSV = () => {
    const csvContent = cmsService.exportLeadsCSV();
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `consultation_leads_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("Image file size should be less than 2MB for fast loading.");
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        setConfig(prev => ({
          ...prev,
          hero: {
            ...prev.hero,
            portraitUrl: base64
          }
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleTestFirebase = async () => {
    setFirebaseStatusMsg("Connecting to Firebase...");
    await cmsService.saveConfig(config);
    const res = await cmsService.initFirebaseIfEnabled();
    setFirebaseStatusMsg(res.message);
  };

  // Filtered Leads
  const filteredLeads = leads.filter(l => {
    const matchQuery = 
      l.name.toLowerCase().includes(searchLeadQuery.toLowerCase()) ||
      l.phone.includes(searchLeadQuery) ||
      (l.email && l.email.toLowerCase().includes(searchLeadQuery.toLowerCase())) ||
      (l.clientCategory && l.clientCategory.toLowerCase().includes(searchLeadQuery.toLowerCase())) ||
      l.caseType.toLowerCase().includes(searchLeadQuery.toLowerCase());
    
    if (leadStatusFilter === "all") return matchQuery;
    return matchQuery && l.status === leadStatusFilter;
  });

  // -------------------------------------------------------------
  // LOGIN SCREEN
  // -------------------------------------------------------------
  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 z-50 bg-[#07080d]/95 backdrop-blur-xl flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-[#12141c] border-2 border-[#dbb657]/50 rounded-sm p-8 shadow-[0_15px_60px_rgba(219,182,87,0.15)] relative">
          <div className="flex flex-col items-center text-center space-y-4">
            {/* App Icon */}
            <div className="relative">
              <img 
                src="/app-icon.png" 
                alt="Chamber Portal App Icon" 
                className="w-20 h-20 rounded-2xl shadow-[0_0_30px_rgba(219,182,87,0.35)] border-2 border-[#dbb657]/70 object-cover"
              />
            </div>
            
            <div className="space-y-1">
              <span className="font-serif text-[11px] tracking-[0.25em] text-[#dbb657] uppercase font-semibold">
                CHAMBER CONTROL SYSTEM
              </span>
              <h2 className="font-serif text-2xl font-bold text-white tracking-wide uppercase">
                Chamber Admin Portal
              </h2>
              <p className="text-xs text-gray-400">
                Enter your authorized chamber passcode to access controls.
              </p>
            </div>

            <form onSubmit={handleLogin} className="w-full space-y-4 pt-2">
              <div>
                <div className="relative">
                  <input
                    type="password"
                    placeholder="Enter Chamber Passcode"
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    className="w-full px-4 py-3 bg-[#0a0b10] border border-gray-700 focus:border-[#dbb657] text-white text-center font-mono tracking-widest text-lg rounded-xs outline-none transition-all placeholder:text-gray-600"
                    autoFocus
                  />
                  <Lock className="w-4 h-4 text-gray-500 absolute left-3 top-3.5" />
                </div>
                {authError && (
                  <p className="text-red-400 text-xs mt-2 flex items-center justify-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{authError}</span>
                  </p>
                )}
                
                {/* Remember Passcode Checkbox */}
                <label className="flex items-center justify-center gap-2 text-xs text-gray-400 mt-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberPasscode}
                    onChange={(e) => setRememberPasscode(e.target.checked)}
                    className="w-4 h-4 rounded-xs accent-[#dbb657] cursor-pointer"
                  />
                  <span>Remember on this device</span>
                </label>
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 py-3 px-4 bg-gradient-to-r from-[#dbb657] to-[#b28d2f] hover:from-[#f3e7c4] hover:to-[#dbb657] text-[#0f1115] font-bold text-xs uppercase tracking-wider rounded-xs transition-all shadow-lg active:scale-95 cursor-pointer"
                >
                  Unlock Admin Portal
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="py-3 px-4 border border-gray-700 hover:border-gray-500 text-gray-300 text-xs uppercase tracking-wider rounded-xs transition-all cursor-pointer"
                >
                  Exit
                </button>
              </div>

              {/* Install Chamber App PWA Button */}
              <button
                type="button"
                onClick={handleInstallApp}
                className="w-full py-2.5 px-3 bg-[#151924] hover:bg-[#1c2233] border border-[#dbb657]/40 text-[#dbb657] text-xs font-semibold rounded-xs flex items-center justify-center gap-2 transition-colors cursor-pointer mt-2"
              >
                <Smartphone className="w-4 h-4" />
                <span>{isAppInstalled ? "App Installed on Device" : "📱 Download Chamber App (PWA)"}</span>
              </button>
            </form>

            <div className="pt-2 text-[11px] text-gray-500 font-mono">
              Domain: <span className="text-[#dbb657]">arunabhbanerjee.com</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // AUTHENTICATED ADMIN DASHBOARD
  // -------------------------------------------------------------
  return (
    <div className="fixed inset-0 z-50 bg-[#0a0b10] text-gray-200 flex flex-col overflow-hidden font-sans">
      
      {/* TOP BAR */}
      <header className="border-b border-[#dbb657]/30 bg-[#10121a] px-3 sm:px-6 py-2.5 flex items-center justify-between gap-2 flex-shrink-0 z-20">
        <div className="flex items-center gap-2">
          <img 
            src="/app-icon.png" 
            alt="Chamber Portal" 
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg border border-[#dbb657]/60 object-cover shadow-sm"
          />
          <div>
            <h1 className="font-serif text-xs sm:text-sm font-bold text-white tracking-wide uppercase">
              Chamber Admin
            </h1>
            <p className="text-[10px] text-gray-400 font-mono hidden sm:block">
              arunabhbanerjee.com
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2">
          {saveStatus && (
            <span className="text-[10px] sm:text-xs px-2 py-1 bg-emerald-950/90 border border-emerald-500/60 text-emerald-300 rounded-xs flex items-center gap-1 animate-pulse">
              <Check className="w-3 h-3" />
              <span className="hidden sm:inline">{saveStatus}</span>
            </span>
          )}

          {/* Quick Push Notification Alert Toggle */}
          <button
            onClick={handleToggleNotifications}
            className={`p-1.5 sm:px-2.5 sm:py-1.5 border rounded-xs text-xs font-mono flex items-center gap-1 cursor-pointer transition-colors ${
              hasNotificationPerm 
                ? "bg-emerald-950/60 border-emerald-500/50 text-emerald-300"
                : "bg-gray-800/80 border-gray-700 text-gray-300 hover:text-white"
            }`}
            title="Notification Alerts"
          >
            {hasNotificationPerm ? <BellRing className="w-3.5 h-3.5 text-emerald-400" /> : <Bell className="w-3.5 h-3.5 text-gray-400" />}
            <span className="hidden md:inline">{hasNotificationPerm ? "Alerts On" : "Enable Alerts"}</span>
          </button>

          {/* Install App Button (PC & Mobile) */}
          <button
            onClick={handleInstallApp}
            className="flex items-center gap-1.5 p-1.5 sm:px-2.5 sm:py-1.5 bg-[#171b26] hover:bg-[#202534] border border-[#dbb657]/50 text-[#dbb657] text-xs font-semibold rounded-xs transition-colors cursor-pointer"
            title="Download & Install Chamber App on PC or Mobile"
          >
            <Download className="w-3.5 h-3.5 text-[#dbb657]" />
            <span className="hidden md:inline">{isAppInstalled ? "App Installed" : "Install App (PC & Mobile)"}</span>
          </button>

          {/* Save All Button */}
          <button
            onClick={handleSaveAll}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-[#dbb657] to-[#b28d2f] hover:brightness-110 text-black text-xs font-bold uppercase tracking-wider rounded-xs shadow-md active:scale-95 cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save</span>
          </button>

          {/* View Website Button */}
          <button
            onClick={onClose}
            className="flex items-center gap-1 p-1.5 sm:px-2.5 sm:py-1.5 border border-gray-700 hover:border-[#dbb657] text-gray-300 hover:text-white text-xs rounded-xs transition-colors cursor-pointer"
            title="View Website"
          >
            <Eye className="w-3.5 h-3.5 text-[#dbb657]" />
            <span className="hidden sm:inline">Website</span>
          </button>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="p-1.5 border border-red-900/60 hover:bg-red-950/50 text-red-400 rounded-xs transition-colors cursor-pointer"
            title="Lock & Logout"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* MOBILE 3-SEGMENT NAVIGATION (Dashboard / Leads / Edit Website) */}
      <div className="md:hidden bg-[#0c0e15] border-b border-gray-800 shrink-0">
        <div className="grid grid-cols-3 p-1.5 gap-1.5">
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xs text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "dashboard"
                ? "bg-gradient-to-r from-[#dbb657] to-[#b28d2f] text-black shadow-md font-bold"
                : "bg-[#141722] text-gray-300 hover:bg-[#1a1f2e] border border-gray-800"
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Dashboard</span>
          </button>

          <button
            onClick={() => setActiveTab("leads")}
            className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xs text-xs font-semibold transition-all cursor-pointer relative ${
              activeTab === "leads"
                ? "bg-gradient-to-r from-[#dbb657] to-[#b28d2f] text-black shadow-md font-bold"
                : "bg-[#141722] text-gray-300 hover:bg-[#1a1f2e] border border-gray-800"
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>Leads</span>
            {leads.length > 0 && (
              <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                activeTab === "leads" ? "bg-black text-amber-300" : "bg-amber-400 text-black"
              }`}>
                {leads.length}
              </span>
            )}
          </button>

          <button
            onClick={() => {
              if (activeTab === "dashboard" || activeTab === "leads") {
                setActiveTab("texts");
              }
            }}
            className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xs text-xs font-semibold transition-all cursor-pointer ${
              activeTab !== "dashboard" && activeTab !== "leads"
                ? "bg-gradient-to-r from-[#dbb657] to-[#b28d2f] text-black shadow-md font-bold"
                : "bg-[#141722] text-gray-300 hover:bg-[#1a1f2e] border border-gray-800"
            }`}
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Edit Site</span>
          </button>
        </div>

        {/* SUB-TABS WHEN IN EDIT SITE MODE */}
        {activeTab !== "dashboard" && activeTab !== "leads" && (
          <div className="flex overflow-x-auto no-scrollbar gap-1.5 px-2 pb-2 pt-0.5">
            {[
              { id: "texts", label: "Bio & Texts", icon: FileText },
              { id: "contacts", label: "Helpline & Email", icon: Phone },
              { id: "pictures", label: "Portrait Photo", icon: ImageIcon },
              { id: "clientCategories", label: "Categories", icon: Users },
              { id: "practice", label: "Practice Areas", icon: Scale },
              { id: "theme", label: "Colors & SEO", icon: Palette },
            ].map((sub) => {
              const SubIcon = sub.icon;
              const isSubActive = activeTab === sub.id;
              return (
                <button
                  key={sub.id}
                  onClick={() => setActiveTab(sub.id as any)}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-xs text-[11px] font-mono whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                    isSubActive
                      ? "bg-[#dbb657]/20 border border-[#dbb657] text-[#dbb657] font-bold"
                      : "bg-[#12141c] text-gray-400 border border-gray-800 hover:text-white"
                  }`}
                >
                  <SubIcon className="w-3 h-3" />
                  <span>{sub.label}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* MAIN CONTAINER: SIDEBAR (Desktop) + CONTENT */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* DESKTOP SIDEBAR NAVIGATION */}
        <aside className="hidden md:flex w-64 border-r border-gray-800 bg-[#0e1017] flex-col flex-shrink-0 overflow-y-auto">
          <div className="p-3 text-[10px] font-mono uppercase tracking-widest text-gray-500 px-4 pt-4">
            Main Overview
          </div>

          <nav className="space-y-1 px-2">
            {[
              { id: "dashboard", label: "Dashboard & Traffic", icon: Users, badge: `${visitorStats.totalVisits}` },
              { id: "leads", label: "Booking Leads", icon: Briefcase, badge: `${leads.length}` },
            ].map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as any)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xs text-xs font-medium transition-all cursor-pointer ${
                    isActive
                      ? "bg-[#dbb657]/15 text-[#dbb657] border-l-2 border-[#dbb657] font-semibold"
                      : "text-gray-400 hover:text-gray-200 hover:bg-[#141824]"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? "text-[#dbb657]" : "text-gray-500"}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className={`text-[9px] px-1.5 py-0.5 rounded-xs font-mono font-bold ${
                      isActive ? "bg-[#dbb657]/30 text-white" : "bg-gray-800 text-gray-400"
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          <div className="p-3 text-[10px] font-mono uppercase tracking-widest text-gray-500 px-4 pt-4">
            Website Content & CMS
          </div>

          <nav className="space-y-1 px-2">
            {[
              { id: "texts", label: "Advocate Bio & Titles", icon: FileText },
              { id: "contacts", label: "Helpline, Email & Maps", icon: Phone },
              { id: "pictures", label: "Official Portrait Photo", icon: ImageIcon },
              { id: "clientCategories", label: "Client Categories", icon: Users },
              { id: "practice", label: "Practice Areas & Matters", icon: Scale },
              { id: "theme", label: "Colors & Theme", icon: Palette },
              { id: "seo", label: "SEO & Google Identity", icon: Globe },
              { id: "firebase", label: "Firebase Cloud Sync", icon: Database, badge: config.firebase?.enabled ? "Active" : "Ready" },
            ].map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as any)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xs text-xs font-medium transition-all cursor-pointer ${
                    isActive
                      ? "bg-[#dbb657]/15 text-[#dbb657] border-l-2 border-[#dbb657] font-semibold"
                      : "text-gray-400 hover:text-gray-200 hover:bg-[#141824]"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? "text-[#dbb657]" : "text-gray-500"}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className={`text-[9px] px-1.5 py-0.5 rounded-xs font-mono ${
                      isActive ? "bg-[#dbb657]/30 text-white" : "bg-gray-800 text-gray-400"
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          <div className="mt-auto p-4 border-t border-gray-800 text-[11px] text-gray-500">
            <p className="font-semibold text-gray-400">Backend Status:</p>
            <p className="mt-1 flex items-center gap-1.5">
              <span className={`h-2 w-2 rounded-full ${config.firebase?.enabled ? "bg-emerald-500" : "bg-amber-500"}`}></span>
              <span>{config.firebase?.enabled ? "Firebase Firestore Connected" : "Local Real-Time Storage"}</span>
            </p>
          </div>
        </aside>

        {/* CONTENT AREA */}
        <main className="flex-1 overflow-y-auto p-3.5 sm:p-6 md:p-8 bg-[#0c0d12]">
          
          {/* TAB 1: DASHBOARD & VISITORS */}
          {activeTab === "dashboard" && (
            <div className="space-y-6 max-w-5xl">
              <div>
                <h2 className="text-xl font-bold font-serif text-white uppercase tracking-wide">
                  Chamber Analytics & Real-Time Overview
                </h2>
                <p className="text-xs text-gray-400">
                  Track website traffic, lead inquiries, and chamber reach across jurisdictions.
                </p>
              </div>

              {/* STAT CARDS */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
                <div className="p-3.5 sm:p-5 bg-[#12141c] border border-gray-800 rounded-xs space-y-1">
                  <span className="text-[10px] uppercase font-mono text-gray-500 tracking-wider">Total Views</span>
                  <p className="text-2xl sm:text-3xl font-bold font-serif text-[#dbb657]">{visitorStats.totalVisits}</p>
                  <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    Live Counter
                  </span>
                </div>

                <div className="p-3.5 sm:p-5 bg-[#12141c] border border-gray-800 rounded-xs space-y-1">
                  <span className="text-[10px] uppercase font-mono text-gray-500 tracking-wider">Unique Visitors</span>
                  <p className="text-2xl sm:text-3xl font-bold font-serif text-white">{visitorStats.uniqueVisitors}</p>
                  <span className="text-[10px] text-gray-400">Unique Devices</span>
                </div>

                <div className="p-3.5 sm:p-5 bg-[#12141c] border border-gray-800 rounded-xs space-y-1">
                  <span className="text-[10px] uppercase font-mono text-gray-500 tracking-wider">Bookings</span>
                  <p className="text-2xl sm:text-3xl font-bold font-serif text-amber-300">{leads.length}</p>
                  <span className="text-[10px] text-amber-400">{leads.filter(l => l.status === 'new').length} New Pending</span>
                </div>

                <div className="p-3.5 sm:p-5 bg-[#12141c] border border-gray-800 rounded-xs space-y-1">
                  <span className="text-[10px] uppercase font-mono text-gray-500 tracking-wider">Domain</span>
                  <p className="text-xs sm:text-base font-bold font-mono text-emerald-400 truncate">arunabhbanerjee.com</p>
                  <span className="text-[10px] text-gray-400">Live SSL Protected</span>
                </div>
              </div>

              {/* QUICK RECENT BOOKINGS (Instant Contact on Phone) */}
              <div className="p-4 sm:p-5 bg-[#12141c] border border-gray-800 rounded-xs space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white uppercase font-serif tracking-wider flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-[#dbb657]" />
                    <span>Recent Consultation Bookings</span>
                  </h3>
                  <button 
                    onClick={() => setActiveTab("leads")}
                    className="text-xs text-[#dbb657] hover:underline font-semibold cursor-pointer"
                  >
                    View All ({leads.length}) →
                  </button>
                </div>

                {leads.length > 0 ? (
                  <div className="space-y-2 pt-1">
                    {leads.slice(0, 3).map((lead) => (
                      <div key={lead.id} className="p-3 bg-[#0a0b10] border border-gray-800 rounded-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-white">{lead.name}</span>
                            <span className="text-[9px] px-1.5 py-0.5 bg-[#dbb657]/15 text-[#dbb657] border border-[#dbb657]/30 rounded-xs font-mono font-bold">
                              {lead.clientCategory || "Individuals"}
                            </span>
                          </div>
                          <p className="text-xs text-gray-400 mt-0.5">{lead.caseType} • <span className="font-mono text-gray-500">{lead.date}</span></p>
                        </div>
                        <div className="flex items-center gap-1.5 sm:gap-2">
                          <a
                            href={`tel:${lead.phone.replace(/\s+/g, '')}`}
                            className="flex-1 sm:flex-initial px-2.5 sm:px-3 py-1.5 bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/50 text-emerald-300 text-xs font-semibold rounded-xs flex items-center justify-center gap-1.5"
                          >
                            <Phone className="w-3.5 h-3.5" /> Call
                          </a>
                          <a
                            href={`https://wa.me/${lead.phone.replace(/[^0-9]/g, '')}?text=Hello%20${encodeURIComponent(lead.name)}%2C%20Advocate%20Arunabh%20Banerjee's%20chamber%20is%20reviewing%20your%20consultation%20request.`}
                            target="_blank"
                            rel="noreferrer"
                            className="flex-1 sm:flex-initial px-2.5 sm:px-3 py-1.5 bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/50 text-emerald-300 text-xs font-semibold rounded-xs flex items-center justify-center gap-1.5"
                          >
                            <MessageSquare className="w-3.5 h-3.5" /> WhatsApp
                          </a>
                          <button
                            type="button"
                            onClick={(e) => handleDeleteLeadClick(lead, e)}
                            className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-xs transition-colors cursor-pointer"
                            title="Delete Lead Record"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-gray-500 py-2">No bookings received yet.</p>
                )}
              </div>

              {/* USER INTERACTION & CLICK ANALYTICS */}
              <div className="p-4 sm:p-5 bg-[#12141c] border border-gray-800 rounded-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-white uppercase font-serif tracking-wider">
                      Client Engagement & Click Analytics
                    </h3>
                    <p className="text-xs text-gray-400">
                      Live tracking of call, WhatsApp, booking form, and navigation interactions.
                    </p>
                  </div>
                  <span className="px-2 py-0.5 bg-emerald-950/60 border border-emerald-500/40 text-emerald-400 text-[10px] font-mono rounded-xs">
                    Live Telemetry Active
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 pt-2">
                  <div className="p-3 bg-[#0a0b10] border border-gray-800 rounded-xs">
                    <span className="text-[10px] uppercase font-mono text-gray-500 block">📞 Call Clicks</span>
                    <p className="text-xl sm:text-2xl font-bold font-mono text-white mt-1">{visitorStats.clicks?.callClicks || 0}</p>
                    <span className="text-[9px] text-gray-400 font-mono truncate block">tel:+919810703335</span>
                  </div>

                  <div className="p-3 bg-[#0a0b10] border border-gray-800 rounded-xs">
                    <span className="text-[10px] uppercase font-mono text-gray-500 block">💬 WhatsApp Clicks</span>
                    <p className="text-xl sm:text-2xl font-bold font-mono text-emerald-400 mt-1">{visitorStats.clicks?.whatsappClicks || 0}</p>
                    <span className="text-[9px] text-gray-400 font-mono truncate block">Direct chat opened</span>
                  </div>

                  <div className="p-3 bg-[#0a0b10] border border-gray-800 rounded-xs">
                    <span className="text-[10px] uppercase font-mono text-gray-500 block">📅 Bookings Saved</span>
                    <p className="text-xl sm:text-2xl font-bold font-mono text-[#dbb657] mt-1">{leads.length}</p>
                    <span className="text-[9px] text-gray-400 font-mono truncate block">Consultation leads</span>
                  </div>

                  <div className="p-3 bg-[#0a0b10] border border-gray-800 rounded-xs">
                    <span className="text-[10px] uppercase font-mono text-gray-500 block">🗺️ Maps Directions</span>
                    <p className="text-xl sm:text-2xl font-bold font-mono text-blue-400 mt-1">{visitorStats.clicks?.mapsClicks || 0}</p>
                    <span className="text-[9px] text-gray-400 font-mono truncate block">Supreme Court & Saket</span>
                  </div>
                </div>
              </div>

              {/* VISITOR COUNTER MANUAL OVERRIDE */}
              <div className="p-5 bg-[#12141c] border border-gray-800 rounded-xs space-y-4">
                <h3 className="text-sm font-bold text-white uppercase font-serif tracking-wider">
                  Visitor Counter Adjustment
                </h3>
                <p className="text-xs text-gray-400">
                  Set baseline counter values to reflect historical visits before portal migration.
                </p>
                <div className="flex flex-wrap gap-4 items-center">
                  <div>
                    <label className="text-[10px] text-gray-400 uppercase font-mono block mb-1">Total Visits</label>
                    <input
                      type="number"
                      value={visitorStats.totalVisits}
                      onChange={(e) => setVisitorStats(prev => ({ ...prev, totalVisits: parseInt(e.target.value) || 0 }))}
                      className="px-3 py-2 bg-[#08090d] border border-gray-700 text-white font-mono rounded-xs w-36 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-400 uppercase font-mono block mb-1">Unique Visitors</label>
                    <input
                      type="number"
                      value={visitorStats.uniqueVisitors}
                      onChange={(e) => setVisitorStats(prev => ({ ...prev, uniqueVisitors: parseInt(e.target.value) || 0 }))}
                      className="px-3 py-2 bg-[#08090d] border border-gray-700 text-white font-mono rounded-xs w-36 text-sm"
                    />
                  </div>
                  <button
                    onClick={() => {
                      cmsService.setVisitorCount(visitorStats.totalVisits, visitorStats.uniqueVisitors);
                      setSaveStatus("Visitor counters updated!");
                      setTimeout(() => setSaveStatus(""), 3000);
                    }}
                    className="mt-5 px-4 py-2 bg-gray-800 hover:bg-[#dbb657] hover:text-black text-xs font-bold uppercase rounded-xs transition-colors cursor-pointer"
                  >
                    Apply Counter
                  </button>
                </div>
              </div>

              {/* RECENT VISITOR LOGS */}
              <div className="p-5 bg-[#12141c] border border-gray-800 rounded-xs space-y-3">
                <h3 className="text-sm font-bold text-white uppercase font-serif tracking-wider">
                  Recent Visitor Sessions
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-gray-800 text-gray-500 font-mono text-[10px] uppercase">
                        <th className="py-2 px-3">Timestamp</th>
                        <th className="py-2 px-3">Target Route</th>
                        <th className="py-2 px-3">Device</th>
                        <th className="py-2 px-3">Referrer</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800/60 font-mono">
                      {visitorStats.recentLogs && visitorStats.recentLogs.length > 0 ? (
                        visitorStats.recentLogs.slice(0, 10).map((log) => (
                          <tr key={log.id} className="hover:bg-gray-800/20">
                            <td className="py-2.5 px-3 text-gray-400">{new Date(log.timestamp).toLocaleString()}</td>
                            <td className="py-2.5 px-3 text-[#dbb657]">{log.page}</td>
                            <td className="py-2.5 px-3 text-gray-300">{log.device}</td>
                            <td className="py-2.5 px-3 text-gray-500 truncate max-w-xs">{log.referrer}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={4} className="py-4 text-center text-gray-500 font-sans">
                            No visitor records logged yet. Visits will record automatically as users browse.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: BOOKING LEADS */}
          {activeTab === "leads" && (
            <div className="space-y-6 max-w-6xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold font-serif text-white uppercase tracking-wide">
                    Legal Consultation Bookings & Leads
                  </h2>
                  <p className="text-xs text-gray-400">
                    Real-time lead submissions captured from the website consultation form.
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={handleCreateTestLead}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/50 text-emerald-300 text-xs font-semibold rounded-xs transition-colors cursor-pointer"
                    title="Simulate an instant consultation booking to test notifications & cross-device sync"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Test Booking Sync</span>
                  </button>

                  <button
                    onClick={handleExportCSV}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-xs font-semibold rounded-xs transition-colors cursor-pointer text-gray-200"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Export CSV</span>
                  </button>
                </div>
              </div>

              {/* SEARCH & FILTERS */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-gray-500 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search by client name, phone, case type..."
                    value={searchLeadQuery}
                    onChange={(e) => setSearchLeadQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-[#12141c] border border-gray-800 focus:border-[#dbb657] text-xs text-white rounded-xs outline-none"
                  />
                </div>
                <select
                  value={leadStatusFilter}
                  onChange={(e) => setLeadStatusFilter(e.target.value)}
                  className="px-3 py-2 bg-[#12141c] border border-gray-800 text-xs text-gray-300 rounded-xs outline-none"
                >
                  <option value="all">All Statuses ({leads.length})</option>
                  <option value="new">New ({leads.filter(l => l.status === 'new').length})</option>
                  <option value="contacted">Contacted ({leads.filter(l => l.status === 'contacted').length})</option>
                  <option value="consultation_scheduled">Scheduled ({leads.filter(l => l.status === 'consultation_scheduled').length})</option>
                  <option value="closed">Closed ({leads.filter(l => l.status === 'closed').length})</option>
                </select>
              </div>

              {/* MOBILE LEADS CARDS VIEW (Phones) */}
              <div className="md:hidden space-y-3">
                {filteredLeads.length > 0 ? (
                  filteredLeads.map((lead) => (
                    <div key={lead.id} className="p-4 bg-[#12141c] border border-gray-800 rounded-xs space-y-2.5 shadow-sm">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-bold text-white text-sm">{lead.name}</p>
                          <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                            <span className="px-1.5 py-0.5 bg-[#dbb657]/15 text-[#dbb657] border border-[#dbb657]/40 rounded-xs text-[10px] font-mono font-bold">
                              {lead.clientCategory || "Individuals"}
                            </span>
                            <span className="text-[10px] text-gray-400 font-mono">📅 {lead.date || "Not set"}</span>
                          </div>
                        </div>
                        <select
                          value={lead.status}
                          onChange={(e) => handleLeadStatusChange(lead.id, e.target.value as any)}
                          className={`text-[10px] font-bold uppercase px-2 py-1 rounded-xs border outline-none ${
                            lead.status === 'new' 
                              ? 'bg-amber-950/80 border-amber-500/60 text-amber-300' 
                              : lead.status === 'contacted'
                              ? 'bg-blue-950/80 border-blue-500/60 text-blue-300'
                              : lead.status === 'consultation_scheduled'
                              ? 'bg-emerald-950/80 border-emerald-500/60 text-emerald-300'
                              : 'bg-gray-800 border-gray-600 text-gray-400'
                          }`}
                        >
                          <option value="new">New</option>
                          <option value="contacted">Contacted</option>
                          <option value="consultation_scheduled">Scheduled</option>
                          <option value="closed">Closed</option>
                        </select>
                      </div>

                      <div className="bg-[#0a0b10] p-2.5 rounded-xs border border-gray-800/80">
                        <span className="text-[10px] uppercase font-mono text-gray-500 block">Consultation Matter:</span>
                        <p className="text-xs text-[#dbb657] font-semibold mt-0.5">{lead.caseType}</p>
                      </div>

                      {lead.message && (
                        <p className="text-[11px] text-gray-300 italic bg-[#0d0f17] p-2 rounded-xs border border-gray-800/60">
                          "{lead.message}"
                        </p>
                      )}

                      <div className="flex items-center justify-between pt-2 border-t border-gray-800/80">
                        <div className="flex gap-2">
                          <a
                            href={`tel:${lead.phone.replace(/\s+/g, '')}`}
                            className="px-2.5 py-1.5 bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/50 text-emerald-300 text-xs font-mono rounded-xs flex items-center gap-1"
                          >
                            <Phone className="w-3.5 h-3.5" /> Call
                          </a>
                          <a
                            href={`https://wa.me/${lead.phone.replace(/[^0-9]/g, '')}?text=Hello%20${encodeURIComponent(lead.name)}%2C%20Advocate%20Arunabh%20Banerjee's%20chamber%20is%20reviewing%20your%20consultation%20request.`}
                            target="_blank"
                            rel="noreferrer"
                            className="px-2.5 py-1.5 bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/50 text-emerald-300 text-xs font-mono rounded-xs flex items-center gap-1"
                          >
                            <MessageSquare className="w-3.5 h-3.5" /> WhatsApp
                          </a>
                        </div>

                        <button
                          type="button"
                          onClick={(e) => handleDeleteLeadClick(lead, e)}
                          className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-xs transition-colors cursor-pointer"
                          title="Delete Lead"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center text-gray-500 bg-[#12141c] border border-gray-800 rounded-xs text-xs">
                    No booking leads matching your search criteria.
                  </div>
                )}
              </div>

              {/* DESKTOP LEADS TABLE (Computer Screens) */}
              <div className="hidden md:block bg-[#12141c] border border-gray-800 rounded-xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-gray-800 bg-[#0f1118] text-gray-400 font-mono text-[10px] uppercase">
                        <th className="py-3 px-4">Client Name</th>
                        <th className="py-3 px-4">Phone / WhatsApp</th>
                        <th className="py-3 px-4">Case Category</th>
                        <th className="py-3 px-4">Preferred Date</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800/80">
                      {filteredLeads.length > 0 ? (
                        filteredLeads.map((lead) => (
                          <tr key={lead.id} className="hover:bg-gray-800/30 transition-colors">
                            <td className="py-3 px-4">
                              <p className="font-semibold text-white">{lead.name}</p>
                              <span className="inline-block mt-0.5 px-1.5 py-0.5 bg-[#dbb657]/15 text-[#dbb657] border border-[#dbb657]/30 text-[9px] font-mono rounded-xs font-semibold">
                                {lead.clientCategory || "Individuals"}
                              </span>
                              {lead.email && <p className="text-[10px] text-gray-400">{lead.email}</p>}
                              {lead.message && (
                                <p className="text-[11px] text-gray-300 italic mt-1 max-w-sm line-clamp-2">
                                  "{lead.message}"
                                </p>
                              )}
                            </td>
                            <td className="py-3 px-4 font-mono">
                              <p className="text-[#dbb657] font-semibold">{lead.phone}</p>
                              <div className="flex gap-2 mt-1">
                                <a
                                  href={`tel:${lead.phone.replace(/\s+/g, '')}`}
                                  className="text-[10px] text-emerald-400 hover:underline flex items-center gap-0.5"
                                >
                                  <Phone className="w-3 h-3" /> Call
                                </a>
                                <a
                                  href={`https://wa.me/${lead.phone.replace(/[^0-9]/g, '')}?text=Hello%20${encodeURIComponent(lead.name)}%2C%20Advocate%20Arunabh%20Banerjee's%20chamber%20is%20reviewing%20your%20consultation%20request.`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-[10px] text-[#25D366] hover:underline flex items-center gap-0.5"
                                >
                                  <MessageSquare className="w-3 h-3" /> WhatsApp
                                </a>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <span className="px-2 py-1 bg-gray-800/80 text-gray-200 rounded-xs text-[10px] font-medium border border-gray-700">
                                {lead.caseType}
                              </span>
                            </td>
                            <td className="py-3 px-4 font-mono text-gray-300">
                              {lead.date || "Not Specified"}
                            </td>
                            <td className="py-3 px-4">
                              <select
                                value={lead.status}
                                onChange={(e) => handleLeadStatusChange(lead.id, e.target.value as any)}
                                className={`text-[10px] font-bold uppercase px-2 py-1 rounded-xs border outline-none ${
                                  lead.status === 'new' 
                                    ? 'bg-amber-950/80 border-amber-500/60 text-amber-300' 
                                    : lead.status === 'contacted'
                                    ? 'bg-blue-950/80 border-blue-500/60 text-blue-300'
                                    : lead.status === 'consultation_scheduled'
                                    ? 'bg-emerald-950/80 border-emerald-500/60 text-emerald-300'
                                    : 'bg-gray-800 border-gray-600 text-gray-400'
                                }`}
                              >
                                <option value="new">New</option>
                                <option value="contacted">Contacted</option>
                                <option value="consultation_scheduled">Scheduled</option>
                                <option value="closed">Closed</option>
                              </select>
                            </td>
                            <td className="py-3 px-4">
                              <button
                                type="button"
                                onClick={(e) => handleDeleteLeadClick(lead, e)}
                                className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-xs transition-colors cursor-pointer group flex items-center justify-center"
                                title="Delete Lead"
                              >
                                <Trash2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={6} className="py-8 text-center text-gray-500">
                            No booking leads matching your search criteria.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: SITE TEXTS & BIO */}
          {activeTab === "texts" && (
            <div className="space-y-6 max-w-4xl">
              <div>
                <h2 className="text-xl font-bold font-serif text-white uppercase tracking-wide">
                  Hero Banner & Chamber Texts
                </h2>
                <p className="text-xs text-gray-400">
                  Edit all titles, slogans, court references, and chamber biographies in real-time.
                </p>
              </div>

              <div className="p-6 bg-[#12141c] border border-gray-800 rounded-xs space-y-4">
                <h3 className="text-sm font-bold text-[#dbb657] uppercase font-serif tracking-wider">
                  Hero Header Content
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] text-gray-400 uppercase font-mono block mb-1">Tagline</label>
                    <input
                      type="text"
                      value={config.hero.tagline}
                      onChange={(e) => setConfig({ ...config, hero: { ...config.hero, tagline: e.target.value } })}
                      className="w-full px-3 py-2 bg-[#08090d] border border-gray-700 text-white text-xs rounded-xs outline-none focus:border-[#dbb657]"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-gray-400 uppercase font-mono block mb-1">Title Prefix</label>
                    <input
                      type="text"
                      value={config.hero.titlePrefix}
                      onChange={(e) => setConfig({ ...config, hero: { ...config.hero, titlePrefix: e.target.value } })}
                      className="w-full px-3 py-2 bg-[#08090d] border border-gray-700 text-white text-xs rounded-xs outline-none focus:border-[#dbb657]"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-gray-400 uppercase font-mono block mb-1">Advocate Name</label>
                    <input
                      type="text"
                      value={config.hero.name}
                      onChange={(e) => setConfig({ ...config, hero: { ...config.hero, name: e.target.value } })}
                      className="w-full px-3 py-2 bg-[#08090d] border border-gray-700 text-[#dbb657] font-serif font-bold text-sm rounded-xs outline-none focus:border-[#dbb657]"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-gray-400 uppercase font-mono block mb-1">Primary Role Badge</label>
                    <input
                      type="text"
                      value={config.hero.roleBadge}
                      onChange={(e) => setConfig({ ...config, hero: { ...config.hero, roleBadge: e.target.value } })}
                      className="w-full px-3 py-2 bg-[#08090d] border border-gray-700 text-white text-xs rounded-xs outline-none focus:border-[#dbb657]"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-gray-400 uppercase font-mono block mb-1">Secondary Role Badge</label>
                    <input
                      type="text"
                      value={config.hero.secondaryBadge}
                      onChange={(e) => setConfig({ ...config, hero: { ...config.hero, secondaryBadge: e.target.value } })}
                      className="w-full px-3 py-2 bg-[#08090d] border border-gray-700 text-white text-xs rounded-xs outline-none focus:border-[#dbb657]"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-gray-400 uppercase font-mono block mb-1">Experience Years</label>
                    <input
                      type="text"
                      value={config.hero.yearsExperience}
                      onChange={(e) => setConfig({ ...config, hero: { ...config.hero, yearsExperience: e.target.value } })}
                      className="w-full px-3 py-2 bg-[#08090d] border border-gray-700 text-white text-xs rounded-xs outline-none focus:border-[#dbb657]"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] text-gray-400 uppercase font-mono block mb-1">Court Jurisdictions Line</label>
                  <input
                    type="text"
                    value={config.hero.courtLine}
                    onChange={(e) => setConfig({ ...config, hero: { ...config.hero, courtLine: e.target.value } })}
                    className="w-full px-3 py-2 bg-[#08090d] border border-gray-700 text-white text-xs rounded-xs outline-none focus:border-[#dbb657]"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-gray-400 uppercase font-mono block mb-1">Human Rights Office Line</label>
                  <input
                    type="text"
                    value={config.hero.humanRightsLine}
                    onChange={(e) => setConfig({ ...config, hero: { ...config.hero, humanRightsLine: e.target.value } })}
                    className="w-full px-3 py-2 bg-[#08090d] border border-gray-700 text-white text-xs rounded-xs outline-none focus:border-[#dbb657]"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-gray-400 uppercase font-mono block mb-1">Chamber Litigation Bio</label>
                  <textarea
                    rows={4}
                    value={config.hero.bioText}
                    onChange={(e) => setConfig({ ...config, hero: { ...config.hero, bioText: e.target.value } })}
                    className="w-full px-3 py-2 bg-[#08090d] border border-gray-700 text-white text-xs rounded-xs outline-none focus:border-[#dbb657] leading-relaxed"
                  />
                </div>
              </div>

              {/* HUMAN RIGHTS & LEADERSHIP SECTION */}
              <div className="p-6 bg-[#12141c] border border-gray-800 rounded-xs space-y-4">
                <h3 className="text-sm font-bold text-[#dbb657] uppercase font-serif tracking-wider">
                  Human Rights & CPDR Section
                </h3>

                <div>
                  <label className="text-[10px] text-gray-400 uppercase font-mono block mb-1">Section Title</label>
                  <input
                    type="text"
                    value={config.leadership.sectionTitle}
                    onChange={(e) => setConfig({ ...config, leadership: { ...config.leadership, sectionTitle: e.target.value } })}
                    className="w-full px-3 py-2 bg-[#08090d] border border-gray-700 text-white text-xs rounded-xs outline-none focus:border-[#dbb657]"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-gray-400 uppercase font-mono block mb-1">Presidential Badge</label>
                  <input
                    type="text"
                    value={config.leadership.badge}
                    onChange={(e) => setConfig({ ...config, leadership: { ...config.leadership, badge: e.target.value } })}
                    className="w-full px-3 py-2 bg-[#08090d] border border-gray-700 text-white text-xs rounded-xs outline-none focus:border-[#dbb657]"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-gray-400 uppercase font-mono block mb-1">Keynote Quote</label>
                  <textarea
                    rows={2}
                    value={config.leadership.quote}
                    onChange={(e) => setConfig({ ...config, leadership: { ...config.leadership, quote: e.target.value } })}
                    className="w-full px-3 py-2 bg-[#08090d] border border-gray-700 text-white text-xs rounded-xs outline-none focus:border-[#dbb657]"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-gray-400 uppercase font-mono block mb-1">Leadership Description</label>
                  <textarea
                    rows={3}
                    value={config.leadership.description}
                    onChange={(e) => setConfig({ ...config, leadership: { ...config.leadership, description: e.target.value } })}
                    className="w-full px-3 py-2 bg-[#08090d] border border-gray-700 text-white text-xs rounded-xs outline-none focus:border-[#dbb657]"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: PRACTICE & MATTERS */}
          {activeTab === "practice" && (
            <div className="space-y-6 max-w-5xl">
              <div>
                <h2 className="text-xl font-bold font-serif text-white uppercase tracking-wide">
                  Practice Areas & Landmark Matters
                </h2>
                <p className="text-xs text-gray-400">
                  Manage legal specializations, high-stakes trial services, and Supreme Court case outcomes.
                </p>
              </div>

              {/* PRACTICE AREAS */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-[#dbb657] uppercase font-serif tracking-wider">
                    Legal Practice Areas ({config.practiceAreas.length})
                  </h3>
                  <button
                    onClick={() => {
                      const newId = "practice_" + Date.now();
                      setConfig({
                        ...config,
                        practiceAreas: [
                          ...config.practiceAreas,
                          { id: newId, title: "New Legal Practice Area", description: "Comprehensive representation and statutory defense." }
                        ]
                      });
                    }}
                    className="flex items-center gap-1 px-3 py-1 bg-gray-800 hover:bg-[#dbb657] hover:text-black text-xs font-semibold rounded-xs transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Practice Area
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {config.practiceAreas.map((pa, idx) => (
                    <div key={pa.id} className="p-4 bg-[#12141c] border border-gray-800 rounded-xs space-y-2 relative group">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono text-gray-500">#{idx + 1}</span>
                        <button
                          onClick={() => {
                            setConfig({
                              ...config,
                              practiceAreas: config.practiceAreas.filter(p => p.id !== pa.id)
                            });
                          }}
                          className="text-gray-500 hover:text-red-400 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <input
                        type="text"
                        value={pa.title}
                        onChange={(e) => {
                          const updated = [...config.practiceAreas];
                          updated[idx].title = e.target.value;
                          setConfig({ ...config, practiceAreas: updated });
                        }}
                        className="w-full px-2.5 py-1.5 bg-[#08090d] border border-gray-700 text-white text-xs font-bold rounded-xs outline-none focus:border-[#dbb657]"
                      />
                      <textarea
                        rows={2}
                        value={pa.description}
                        onChange={(e) => {
                          const updated = [...config.practiceAreas];
                          updated[idx].description = e.target.value;
                          setConfig({ ...config, practiceAreas: updated });
                        }}
                        className="w-full px-2.5 py-1.5 bg-[#08090d] border border-gray-700 text-gray-300 text-xs rounded-xs outline-none focus:border-[#dbb657]"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* NOTABLE MATTERS */}
              <div className="space-y-4 pt-6 border-t border-gray-800">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-[#dbb657] uppercase font-serif tracking-wider">
                    Notable Judicial Matters & Verdicts ({config.notableMatters.length})
                  </h3>
                  <button
                    onClick={() => {
                      const newId = "matter_" + Date.now();
                      setConfig({
                        ...config,
                        notableMatters: [
                          ...config.notableMatters,
                          { id: newId, title: "Landmark Judgment Title", caseNo: "W.P.(Crl.) / Supreme Court of India", outcome: "Favorable outcome granted." }
                        ]
                      });
                    }}
                    className="flex items-center gap-1 px-3 py-1 bg-gray-800 hover:bg-[#dbb657] hover:text-black text-xs font-semibold rounded-xs transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Verdict
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {config.notableMatters.map((matter, idx) => (
                    <div key={matter.id} className="p-4 bg-[#12141c] border border-gray-800 rounded-xs space-y-2 relative group">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono text-gray-500">#{idx + 1}</span>
                        <button
                          onClick={() => {
                            setConfig({
                              ...config,
                              notableMatters: config.notableMatters.filter(m => m.id !== matter.id)
                            });
                          }}
                          className="text-gray-500 hover:text-red-400 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <input
                        type="text"
                        value={matter.title}
                        onChange={(e) => {
                          const updated = [...config.notableMatters];
                          updated[idx].title = e.target.value;
                          setConfig({ ...config, notableMatters: updated });
                        }}
                        placeholder="Matter Title"
                        className="w-full px-2.5 py-1.5 bg-[#08090d] border border-gray-700 text-white text-xs font-bold rounded-xs outline-none focus:border-[#dbb657]"
                      />
                      <input
                        type="text"
                        value={matter.caseNo}
                        onChange={(e) => {
                          const updated = [...config.notableMatters];
                          updated[idx].caseNo = e.target.value;
                          setConfig({ ...config, notableMatters: updated });
                        }}
                        placeholder="Court / Case Citation"
                        className="w-full px-2.5 py-1.5 bg-[#08090d] border border-gray-700 text-[#dbb657] font-mono text-xs rounded-xs outline-none focus:border-[#dbb657]"
                      />
                      <textarea
                        rows={2}
                        value={matter.outcome}
                        onChange={(e) => {
                          const updated = [...config.notableMatters];
                          updated[idx].outcome = e.target.value;
                          setConfig({ ...config, notableMatters: updated });
                        }}
                        placeholder="Judicial Relief / Outcome"
                        className="w-full px-2.5 py-1.5 bg-[#08090d] border border-gray-700 text-gray-300 text-xs rounded-xs outline-none focus:border-[#dbb657]"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB: CLIENT CATEGORIES (Individuals, Corporate, NGOs, Trusts, NRIs) */}
          {activeTab === "clientCategories" && (
            <div className="space-y-6 max-w-4xl">
              <div>
                <h2 className="text-xl font-bold font-serif text-white uppercase tracking-wide">
                  Client Categories Management
                </h2>
                <p className="text-xs text-gray-400">
                  Edit the 5 client classification categories shown on homepage cards and booking form.
                </p>
              </div>

              <div className="p-4 sm:p-6 bg-[#12141c] border border-gray-800 rounded-xs space-y-4">
                <div className="space-y-3">
                  {(config.clientCategories || []).map((cat, idx) => (
                    <div key={cat.id} className="p-3.5 bg-[#0a0b10] border border-gray-800 rounded-xs space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white font-mono flex items-center gap-2">
                          <span className="text-[#dbb657]">#{idx + 1}</span>
                          {cat.name}
                        </span>
                        <span className="text-[10px] text-gray-500 font-mono">ID: {cat.id}</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="text-[10px] text-gray-400 uppercase font-mono block mb-1">Category Title</label>
                          <input
                            type="text"
                            value={cat.name}
                            onChange={(e) => {
                              const updated = [...(config.clientCategories || [])];
                              updated[idx] = { ...updated[idx], name: e.target.value };
                              setConfig({ ...config, clientCategories: updated });
                            }}
                            className="w-full px-3 py-2 bg-[#12141c] border border-gray-700 text-white text-xs rounded-xs font-bold focus:border-[#dbb657]"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-gray-400 uppercase font-mono block mb-1">Subtitle</label>
                          <input
                            type="text"
                            value={cat.subtitle}
                            onChange={(e) => {
                              const updated = [...(config.clientCategories || [])];
                              updated[idx] = { ...updated[idx], subtitle: e.target.value };
                              setConfig({ ...config, clientCategories: updated });
                            }}
                            className="w-full px-3 py-2 bg-[#12141c] border border-gray-700 text-[#dbb657] text-xs rounded-xs font-mono focus:border-[#dbb657]"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: CONTACTS, NUMBERS & ADDRESSES */}
          {activeTab === "contacts" && (
            <div className="space-y-6 max-w-4xl">
              <div>
                <h2 className="text-xl font-bold font-serif text-white uppercase tracking-wide">
                  Chamber Numbers, WhatsApp & Addresses
                </h2>
                <p className="text-xs text-gray-400">
                  Update primary phone lines, WhatsApp integration, and chamber offices across Delhi.
                </p>
              </div>

              <div className="p-6 bg-[#12141c] border border-gray-800 rounded-xs space-y-4">
                <h3 className="text-sm font-bold text-[#dbb657] uppercase font-serif tracking-wider">
                  Direct Phone & Digital Lines
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] text-gray-400 uppercase font-mono block mb-1">Primary Mobile (Call Target)</label>
                    <input
                      type="text"
                      value={config.contacts.primaryMobile}
                      onChange={(e) => setConfig({ ...config, contacts: { ...config.contacts, primaryMobile: e.target.value } })}
                      className="w-full px-3 py-2 bg-[#08090d] border border-gray-700 text-white font-mono text-xs rounded-xs outline-none focus:border-[#dbb657]"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-gray-400 uppercase font-mono block mb-1">Mobile Display Text</label>
                    <input
                      type="text"
                      value={config.contacts.displayMobile}
                      onChange={(e) => setConfig({ ...config, contacts: { ...config.contacts, displayMobile: e.target.value } })}
                      className="w-full px-3 py-2 bg-[#08090d] border border-gray-700 text-[#dbb657] font-mono font-bold text-xs rounded-xs outline-none focus:border-[#dbb657]"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-gray-400 uppercase font-mono block mb-1">WhatsApp Direct Number (e.g. 919810703335)</label>
                    <input
                      type="text"
                      value={config.contacts.whatsappNumber}
                      onChange={(e) => setConfig({ ...config, contacts: { ...config.contacts, whatsappNumber: e.target.value } })}
                      className="w-full px-3 py-2 bg-[#08090d] border border-gray-700 text-emerald-400 font-mono text-xs rounded-xs outline-none focus:border-[#dbb657]"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-gray-400 uppercase font-mono block mb-1">Chamber Email</label>
                    <input
                      type="email"
                      value={config.contacts.chamberEmail}
                      onChange={(e) => setConfig({ ...config, contacts: { ...config.contacts, chamberEmail: e.target.value } })}
                      className="w-full px-3 py-2 bg-[#08090d] border border-gray-700 text-white font-mono text-xs rounded-xs outline-none focus:border-[#dbb657]"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-gray-400 uppercase font-mono block mb-1">Direct Advocate Email (Own)</label>
                    <input
                      type="email"
                      value={config.contacts.directEmail || "prof.abanerjee@gmail.com"}
                      onChange={(e) => setConfig({ ...config, contacts: { ...config.contacts, directEmail: e.target.value } })}
                      className="w-full px-3 py-2 bg-[#08090d] border border-gray-700 text-white font-mono text-xs rounded-xs outline-none focus:border-[#dbb657]"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] text-gray-400 uppercase font-mono block mb-1">Pre-filled WhatsApp Message</label>
                  <textarea
                    rows={2}
                    value={config.contacts.whatsappMessage}
                    onChange={(e) => setConfig({ ...config, contacts: { ...config.contacts, whatsappMessage: e.target.value } })}
                    className="w-full px-3 py-2 bg-[#08090d] border border-gray-700 text-white text-xs rounded-xs outline-none focus:border-[#dbb657]"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-gray-400 uppercase font-mono block mb-1">
                    Google My Business Profile Link (Search & Maps Identity)
                  </label>
                  <input
                    type="url"
                    value={config.contacts.googleBusinessUrl || ""}
                    onChange={(e) => setConfig({ ...config, contacts: { ...config.contacts, googleBusinessUrl: e.target.value } })}
                    placeholder="https://share.google/DWN0Xox7NNa1ziBn6"
                    className="w-full px-3 py-2 bg-[#08090d] border border-gray-700 text-blue-400 font-mono text-xs rounded-xs outline-none focus:border-[#dbb657]"
                  />
                  <p className="text-[10px] text-gray-500 mt-1">
                    Connects directly to Google Search Knowledge Panel and Google Maps profile.
                  </p>
                </div>
              </div>

              {/* CHAMBER ADDRESSES */}
              <div className="p-6 bg-[#12141c] border border-gray-800 rounded-xs space-y-4">
                <h3 className="text-sm font-bold text-[#dbb657] uppercase font-serif tracking-wider">
                  Chamber Physical Locations
                </h3>

                <div>
                  <label className="text-[10px] text-gray-400 uppercase font-mono block mb-1">Supreme Court Compound Chamber</label>
                  <input
                    type="text"
                    value={config.contacts.supremeCourtChamber}
                    onChange={(e) => setConfig({ ...config, contacts: { ...config.contacts, supremeCourtChamber: e.target.value } })}
                    className="w-full px-3 py-2 bg-[#08090d] border border-gray-700 text-white text-xs rounded-xs outline-none focus:border-[#dbb657]"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-gray-400 uppercase font-mono block mb-1">Saket Courts Complex Chamber</label>
                  <input
                    type="text"
                    value={config.contacts.saketCourtsChamber}
                    onChange={(e) => setConfig({ ...config, contacts: { ...config.contacts, saketCourtsChamber: e.target.value } })}
                    className="w-full px-3 py-2 bg-[#08090d] border border-gray-700 text-white text-xs rounded-xs outline-none focus:border-[#dbb657]"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-gray-400 uppercase font-mono block mb-1">Office Timings</label>
                  <input
                    type="text"
                    value={config.contacts.officeHours}
                    onChange={(e) => setConfig({ ...config, contacts: { ...config.contacts, officeHours: e.target.value } })}
                    className="w-full px-3 py-2 bg-[#08090d] border border-gray-700 text-white text-xs rounded-xs outline-none focus:border-[#dbb657]"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-gray-400 uppercase font-mono block mb-1">Emergency Listing Notice</label>
                  <input
                    type="text"
                    value={config.contacts.emergencyListingNote}
                    onChange={(e) => setConfig({ ...config, contacts: { ...config.contacts, emergencyListingNote: e.target.value } })}
                    className="w-full px-3 py-2 bg-[#08090d] border border-gray-700 text-white text-xs rounded-xs outline-none focus:border-[#dbb657]"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: BUTTONS & ACTION LINKS */}
          {activeTab === "buttons" && (
            <div className="space-y-6 max-w-4xl">
              <div>
                <h2 className="text-xl font-bold font-serif text-white uppercase tracking-wide">
                  Action Buttons & CTAs
                </h2>
                <p className="text-xs text-gray-400">
                  Customize button labels across hero, navigation, and consultation sections.
                </p>
              </div>

              <div className="p-6 bg-[#12141c] border border-gray-800 rounded-xs space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] text-gray-400 uppercase font-mono block mb-1">Call Advocate Button</label>
                    <input
                      type="text"
                      value={config.buttons.callAdvocateText}
                      onChange={(e) => setConfig({ ...config, buttons: { ...config.buttons, callAdvocateText: e.target.value } })}
                      className="w-full px-3 py-2 bg-[#08090d] border border-gray-700 text-white text-xs rounded-xs outline-none focus:border-[#dbb657]"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-gray-400 uppercase font-mono block mb-1">WhatsApp Direct Button</label>
                    <input
                      type="text"
                      value={config.buttons.whatsappDirectText}
                      onChange={(e) => setConfig({ ...config, buttons: { ...config.buttons, whatsappDirectText: e.target.value } })}
                      className="w-full px-3 py-2 bg-[#08090d] border border-gray-700 text-white text-xs rounded-xs outline-none focus:border-[#dbb657]"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-gray-400 uppercase font-mono block mb-1">Book Case Button</label>
                    <input
                      type="text"
                      value={config.buttons.bookCaseText}
                      onChange={(e) => setConfig({ ...config, buttons: { ...config.buttons, bookCaseText: e.target.value } })}
                      className="w-full px-3 py-2 bg-[#08090d] border border-gray-700 text-white text-xs rounded-xs outline-none focus:border-[#dbb657]"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-gray-400 uppercase font-mono block mb-1">Reserve Slot Button</label>
                    <input
                      type="text"
                      value={config.buttons.reserveSlotText}
                      onChange={(e) => setConfig({ ...config, buttons: { ...config.buttons, reserveSlotText: e.target.value } })}
                      className="w-full px-3 py-2 bg-[#08090d] border border-gray-700 text-white text-xs rounded-xs outline-none focus:border-[#dbb657]"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-gray-400 uppercase font-mono block mb-1">vCard Contact Download Button</label>
                    <input
                      type="text"
                      value={config.buttons.downloadVcardText}
                      onChange={(e) => setConfig({ ...config, buttons: { ...config.buttons, downloadVcardText: e.target.value } })}
                      className="w-full px-3 py-2 bg-[#08090d] border border-gray-700 text-white text-xs rounded-xs outline-none focus:border-[#dbb657]"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: PICTURES & MEDIA */}
          {activeTab === "pictures" && (
            <div className="space-y-6 max-w-4xl">
              <div>
                <h2 className="text-xl font-bold font-serif text-white uppercase tracking-wide">
                  Portraits & Visual Assets
                </h2>
                <p className="text-xs text-gray-400">
                  Change Advocate Arunabh Banerjee's official portrait via direct image upload or image URL.
                </p>
              </div>

              <div className="p-6 bg-[#12141c] border border-gray-800 rounded-xs space-y-6">
                
                {/* PORTRAIT PREVIEW & UPLOAD */}
                <div className="flex flex-col sm:flex-row gap-6 items-start">
                  <div className="w-44 aspect-[3/4] border-2 border-[#dbb657] rounded-sm overflow-hidden bg-black flex-shrink-0 shadow-lg relative group">
                    <img
                      src={config.hero.portraitUrl || "/assets/images/Arunabh_Banerjee.jpeg"}
                      alt="Advocate Arunabh Banerjee Portrait Preview"
                      className="w-full h-full object-cover object-top"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "/assets/images/arunabh_portrait_1781436119050.jpg";
                      }}
                    />
                    <div className="absolute inset-x-0 bottom-0 bg-black/80 py-1 text-center text-[10px] text-[#dbb657] font-mono">
                      Active Portrait
                    </div>
                  </div>

                  <div className="flex-1 space-y-4">
                    <div>
                      <label className="text-[10px] text-gray-400 uppercase font-mono block mb-1">Upload New Portrait Photo (from Computer)</label>
                      <label className="flex items-center gap-2 px-4 py-3 bg-[#08090d] border border-dashed border-gray-700 hover:border-[#dbb657] rounded-xs cursor-pointer text-xs text-gray-300 transition-colors">
                        <Upload className="w-4 h-4 text-[#dbb657]" />
                        <span>Choose Image File (JPEG, PNG, WebP)</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageFileUpload}
                          className="hidden"
                        />
                      </label>
                      <p className="text-[10px] text-gray-500 mt-1">
                        Select a high-resolution photo. It will be converted and stored securely.
                      </p>
                    </div>

                    <div>
                      <label className="text-[10px] text-gray-400 uppercase font-mono block mb-1">Or Paste Image URL</label>
                      <input
                        type="url"
                        placeholder="https://example.com/arunabh_portrait.jpg"
                        value={config.hero.portraitUrl}
                        onChange={(e) => setConfig({ ...config, hero: { ...config.hero, portraitUrl: e.target.value } })}
                        className="w-full px-3 py-2 bg-[#08090d] border border-gray-700 text-white text-xs rounded-xs outline-none focus:border-[#dbb657]"
                      />
                    </div>

                    {config.hero.portraitUrl && (
                      <button
                        onClick={() => setConfig({ ...config, hero: { ...config.hero, portraitUrl: "" } })}
                        className="text-xs text-amber-400 hover:underline"
                      >
                        Reset to Default Chamber Portrait
                      </button>
                    )}
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* TAB 8: THEME & BRANDING COLORS */}
          {activeTab === "theme" && (
            <div className="space-y-6 max-w-4xl">
              <div>
                <h2 className="text-xl font-bold font-serif text-white uppercase tracking-wide">
                  Color Palette & Chamber Aesthetics
                </h2>
                <p className="text-xs text-gray-400">
                  Fine-tune the Supreme Court gold gradients, accent highlights, and contrast hues. Changes apply instantly in real-time.
                </p>
              </div>

              <div className="p-6 bg-[#12141c] border border-gray-800 rounded-xs space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  
                  {/* Primary Gold */}
                  <div className="p-4 bg-[#0a0b10] border border-gray-800 rounded-xs space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-white">Primary Gold Accent</label>
                      <span className="font-mono text-xs text-[#dbb657]">{config.theme.primaryGold}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={config.theme.primaryGold}
                        onChange={(e) => {
                          const updated = { ...config.theme, primaryGold: e.target.value };
                          setConfig({ ...config, theme: updated });
                          cmsService.applyTheme(updated);
                        }}
                        className="h-10 w-16 bg-transparent border border-gray-700 rounded-xs cursor-pointer"
                      />
                      <input
                        type="text"
                        value={config.theme.primaryGold}
                        onChange={(e) => {
                          const updated = { ...config.theme, primaryGold: e.target.value };
                          setConfig({ ...config, theme: updated });
                          cmsService.applyTheme(updated);
                        }}
                        className="flex-1 px-3 py-2 bg-[#12141c] border border-gray-700 text-xs text-white font-mono rounded-xs"
                      />
                    </div>
                  </div>

                  {/* Secondary Gold */}
                  <div className="p-4 bg-[#0a0b10] border border-gray-800 rounded-xs space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-white">Secondary Burnished Gold</label>
                      <span className="font-mono text-xs text-amber-500">{config.theme.secondaryGold}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={config.theme.secondaryGold}
                        onChange={(e) => {
                          const updated = { ...config.theme, secondaryGold: e.target.value };
                          setConfig({ ...config, theme: updated });
                          cmsService.applyTheme(updated);
                        }}
                        className="h-10 w-16 bg-transparent border border-gray-700 rounded-xs cursor-pointer"
                      />
                      <input
                        type="text"
                        value={config.theme.secondaryGold}
                        onChange={(e) => {
                          const updated = { ...config.theme, secondaryGold: e.target.value };
                          setConfig({ ...config, theme: updated });
                          cmsService.applyTheme(updated);
                        }}
                        className="flex-1 px-3 py-2 bg-[#12141c] border border-gray-700 text-xs text-white font-mono rounded-xs"
                      />
                    </div>
                  </div>

                  {/* Dark Background */}
                  <div className="p-4 bg-[#0a0b10] border border-gray-800 rounded-xs space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-white">Chamber Deep Charcoal Background</label>
                      <span className="font-mono text-xs text-gray-400">{config.theme.darkBg}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={config.theme.darkBg}
                        onChange={(e) => {
                          const updated = { ...config.theme, darkBg: e.target.value };
                          setConfig({ ...config, theme: updated });
                          cmsService.applyTheme(updated);
                        }}
                        className="h-10 w-16 bg-transparent border border-gray-700 rounded-xs cursor-pointer"
                      />
                      <input
                        type="text"
                        value={config.theme.darkBg}
                        onChange={(e) => {
                          const updated = { ...config.theme, darkBg: e.target.value };
                          setConfig({ ...config, theme: updated });
                          cmsService.applyTheme(updated);
                        }}
                        className="flex-1 px-3 py-2 bg-[#12141c] border border-gray-700 text-xs text-white font-mono rounded-xs"
                      />
                    </div>
                  </div>

                  {/* Card Background */}
                  <div className="p-4 bg-[#0a0b10] border border-gray-800 rounded-xs space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-white">Panel & Card Background</label>
                      <span className="font-mono text-xs text-gray-400">{config.theme.cardBg}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={config.theme.cardBg}
                        onChange={(e) => {
                          const updated = { ...config.theme, cardBg: e.target.value };
                          setConfig({ ...config, theme: updated });
                          cmsService.applyTheme(updated);
                        }}
                        className="h-10 w-16 bg-transparent border border-gray-700 rounded-xs cursor-pointer"
                      />
                      <input
                        type="text"
                        value={config.theme.cardBg}
                        onChange={(e) => {
                          const updated = { ...config.theme, cardBg: e.target.value };
                          setConfig({ ...config, theme: updated });
                          cmsService.applyTheme(updated);
                        }}
                        className="flex-1 px-3 py-2 bg-[#12141c] border border-gray-700 text-xs text-white font-mono rounded-xs"
                      />
                    </div>
                  </div>

                </div>

                {/* PRESET PALETTES */}
                <div>
                  <label className="text-[10px] text-gray-400 uppercase font-mono block mb-2">Preset Royal Palettes</label>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => {
                        const royalGold = {
                          primaryGold: "#dbb657",
                          secondaryGold: "#b28d2f",
                          darkBg: "#0c0d12",
                          cardBg: "#12141c",
                          goldGlow: "rgba(219, 182, 87, 0.15)"
                        };
                        setConfig({ ...config, theme: royalGold });
                        cmsService.applyTheme(royalGold);
                      }}
                      className="px-3 py-1.5 bg-[#171a24] hover:bg-[#202534] border border-[#dbb657]/40 rounded-xs text-xs text-[#dbb657]"
                    >
                      Imperial Supreme Gold (Default)
                    </button>
                    <button
                      onClick={() => {
                        const platinum = {
                          primaryGold: "#e2c974",
                          secondaryGold: "#9c7c2b",
                          darkBg: "#08090d",
                          cardBg: "#0f121a",
                          goldGlow: "rgba(226, 201, 116, 0.18)"
                        };
                        setConfig({ ...config, theme: platinum });
                        cmsService.applyTheme(platinum);
                      }}
                      className="px-3 py-1.5 bg-[#171a24] hover:bg-[#202534] border border-gray-700 rounded-xs text-xs text-amber-200"
                    >
                      High Court Gilded Bronze
                    </button>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* TAB 9: SEO & DOMAIN (arunabhbanerjee.com) */}
          {activeTab === "seo" && (
            <div className="space-y-6 max-w-4xl">
              <div>
                <h2 className="text-xl font-bold font-serif text-white uppercase tracking-wide">
                  SEO Optimization & Custom Domain
                </h2>
                <p className="text-xs text-gray-400">
                  Targeted SEO metadata for custom domain <span className="text-amber-300 font-mono">arunabhbanerjee.com</span> to rank on Google.
                </p>
              </div>

              {/* GOOGLE SEARCH PREVIEW SNIPPET */}
              <div className="p-5 bg-[#12141c] border border-gray-800 rounded-xs space-y-2">
                <span className="text-[10px] uppercase font-mono text-gray-400 tracking-wider">
                  Live Google Search Snippet Preview
                </span>
                <div className="p-4 bg-[#0a0b10] border border-gray-700 rounded-xs space-y-1 font-sans">
                  <div className="flex items-center gap-1.5 text-xs text-gray-400">
                    <Globe className="w-3.5 h-3.5 text-emerald-400" />
                    <span>https://arunabhbanerjee.com</span>
                  </div>
                  <h4 className="text-base text-blue-400 font-medium hover:underline cursor-pointer">
                    {config.seo.siteTitle}
                  </h4>
                  <p className="text-xs text-gray-300 leading-snug">
                    {config.seo.metaDescription}
                  </p>
                </div>
              </div>

              <div className="p-6 bg-[#12141c] border border-gray-800 rounded-xs space-y-4">
                <div>
                  <label className="text-[10px] text-gray-400 uppercase font-mono block mb-1">Target Canonical Domain</label>
                  <input
                    type="text"
                    value={config.seo.canonicalDomain}
                    onChange={(e) => setConfig({ ...config, seo: { ...config.seo, canonicalDomain: e.target.value } })}
                    placeholder="https://arunabhbanerjee.com"
                    className="w-full px-3 py-2 bg-[#08090d] border border-gray-700 text-emerald-400 font-mono text-xs rounded-xs outline-none focus:border-[#dbb657]"
                  />
                  <p className="text-[10px] text-gray-500 mt-1">
                    Canonical link ensures search engines attribute all ranking authority to your domain arunabhbanerjee.com.
                  </p>
                </div>

                <div>
                  <label className="text-[10px] text-gray-400 uppercase font-mono block mb-1">Meta Title Tag (&lt;title&gt;)</label>
                  <input
                    type="text"
                    value={config.seo.siteTitle}
                    onChange={(e) => setConfig({ ...config, seo: { ...config.seo, siteTitle: e.target.value } })}
                    className="w-full px-3 py-2 bg-[#08090d] border border-gray-700 text-white text-xs rounded-xs outline-none focus:border-[#dbb657]"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-gray-400 uppercase font-mono block mb-1">Meta Description Tag</label>
                  <textarea
                    rows={3}
                    value={config.seo.metaDescription}
                    onChange={(e) => setConfig({ ...config, seo: { ...config.seo, metaDescription: e.target.value } })}
                    className="w-full px-3 py-2 bg-[#08090d] border border-gray-700 text-white text-xs rounded-xs outline-none focus:border-[#dbb657]"
                  />
                  <p className="text-[10px] text-gray-500 mt-1">Recommended length: 140–160 characters.</p>
                </div>

                <div>
                  <label className="text-[10px] text-gray-400 uppercase font-mono block mb-1">SEO Target Keywords (comma separated)</label>
                  <textarea
                    rows={2}
                    value={config.seo.keywords}
                    onChange={(e) => setConfig({ ...config, seo: { ...config.seo, keywords: e.target.value } })}
                    className="w-full px-3 py-2 bg-[#08090d] border border-gray-700 text-white text-xs rounded-xs outline-none focus:border-[#dbb657]"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-gray-400 uppercase font-mono block mb-1">Social Media Share Image (og:image URL)</label>
                  <input
                    type="url"
                    value={config.seo.ogImage}
                    onChange={(e) => setConfig({ ...config, seo: { ...config.seo, ogImage: e.target.value } })}
                    className="w-full px-3 py-2 bg-[#08090d] border border-gray-700 text-white text-xs rounded-xs outline-none focus:border-[#dbb657]"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 10: FIREBASE INTEGRATION */}
          {activeTab === "firebase" && (
            <div className="space-y-6 max-w-4xl">
              <div>
                <h2 className="text-xl font-bold font-serif text-white uppercase tracking-wide">
                  Firebase Cloud Backend Integration
                </h2>
                <p className="text-xs text-gray-400">
                  Connect your Google Cloud Firebase project for cross-device real-time sync and cloud database persistence.
                </p>
              </div>

              {/* CURRENT STATUS */}
              <div className="p-5 bg-[#12141c] border border-gray-800 rounded-xs flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-[10px] font-mono uppercase text-gray-400 tracking-wider">Current Backend Status</span>
                  <div className="flex items-center gap-2">
                    <span className={`h-2.5 w-2.5 rounded-full ${config.firebase?.enabled ? "bg-emerald-500 animate-pulse" : "bg-amber-500"}`}></span>
                    <span className="text-sm font-bold text-white">
                      {config.firebase?.enabled ? "Firebase Cloud Firestore Enabled" : "Local Real-Time Engine (Active & Ready for Firebase)"}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400">
                    {config.firebase?.enabled 
                      ? `Connected to Firestore project: ${config.firebase.projectId}` 
                      : "All texts, leads, and visitor counters are currently preserved in browser storage. Paste your Firebase keys below whenever you create your project!"
                    }
                  </p>
                </div>

                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.firebase?.enabled || false}
                    onChange={(e) => {
                      setConfig({
                        ...config,
                        firebase: {
                          ...config.firebase,
                          enabled: e.target.checked
                        }
                      });
                    }}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
              </div>

              {/* FIREBASE SETUP INSTRUCTIONS */}
              <div className="p-5 bg-gradient-to-r from-amber-950/20 to-transparent border border-amber-500/30 rounded-xs space-y-2">
                <h4 className="text-xs font-bold text-[#dbb657] uppercase font-mono flex items-center gap-1.5">
                  <Database className="w-4 h-4 text-[#dbb657]" />
                  How to get your Firebase configuration:
                </h4>
                <ol className="text-xs text-gray-300 list-decimal list-inside space-y-1 pl-1">
                  <li>Go to <a href="https://console.firebase.google.com" target="_blank" rel="noreferrer" className="text-amber-300 underline">console.firebase.google.com</a> and click <strong>Create a project</strong>.</li>
                  <li>In project dashboard, click <strong>Web (&lt;/&gt;)</strong> to register an app.</li>
                  <li>Enable <strong>Firestore Database</strong> from the Build menu (start in Test mode or Production mode).</li>
                  <li>Copy the configuration keys shown in the Firebase SDK snippet and paste them below.</li>
                </ol>
              </div>

              {/* CONFIG INPUTS */}
              <div className="p-6 bg-[#12141c] border border-gray-800 rounded-xs space-y-4">
                <h3 className="text-sm font-bold text-[#dbb657] uppercase font-serif tracking-wider">
                  Firebase Credentials & Keys
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] text-gray-400 uppercase font-mono block mb-1">API Key (apiKey)</label>
                    <input
                      type="text"
                      placeholder="AIzaSy..."
                      value={config.firebase?.apiKey || ""}
                      onChange={(e) => setConfig({ ...config, firebase: { ...config.firebase, apiKey: e.target.value } })}
                      className="w-full px-3 py-2 bg-[#08090d] border border-gray-700 text-white font-mono text-xs rounded-xs outline-none focus:border-[#dbb657]"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-gray-400 uppercase font-mono block mb-1">Project ID (projectId)</label>
                    <input
                      type="text"
                      placeholder="arunabh-banerjee-legal"
                      value={config.firebase?.projectId || ""}
                      onChange={(e) => setConfig({ ...config, firebase: { ...config.firebase, projectId: e.target.value } })}
                      className="w-full px-3 py-2 bg-[#08090d] border border-gray-700 text-white font-mono text-xs rounded-xs outline-none focus:border-[#dbb657]"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-gray-400 uppercase font-mono block mb-1">Auth Domain (authDomain)</label>
                    <input
                      type="text"
                      placeholder="arunabh-banerjee-legal.firebaseapp.com"
                      value={config.firebase?.authDomain || ""}
                      onChange={(e) => setConfig({ ...config, firebase: { ...config.firebase, authDomain: e.target.value } })}
                      className="w-full px-3 py-2 bg-[#08090d] border border-gray-700 text-white font-mono text-xs rounded-xs outline-none focus:border-[#dbb657]"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-gray-400 uppercase font-mono block mb-1">Storage Bucket (storageBucket)</label>
                    <input
                      type="text"
                      placeholder="arunabh-banerjee-legal.appspot.com"
                      value={config.firebase?.storageBucket || ""}
                      onChange={(e) => setConfig({ ...config, firebase: { ...config.firebase, storageBucket: e.target.value } })}
                      className="w-full px-3 py-2 bg-[#08090d] border border-gray-700 text-white font-mono text-xs rounded-xs outline-none focus:border-[#dbb657]"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-gray-400 uppercase font-mono block mb-1">Messaging Sender ID</label>
                    <input
                      type="text"
                      placeholder="1234567890"
                      value={config.firebase?.messagingSenderId || ""}
                      onChange={(e) => setConfig({ ...config, firebase: { ...config.firebase, messagingSenderId: e.target.value } })}
                      className="w-full px-3 py-2 bg-[#08090d] border border-gray-700 text-white font-mono text-xs rounded-xs outline-none focus:border-[#dbb657]"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] text-gray-400 uppercase font-mono block mb-1">App ID (appId)</label>
                    <input
                      type="text"
                      placeholder="1:1234567890:web:abcdef"
                      value={config.firebase?.appId || ""}
                      onChange={(e) => setConfig({ ...config, firebase: { ...config.firebase, appId: e.target.value } })}
                      className="w-full px-3 py-2 bg-[#08090d] border border-gray-700 text-white font-mono text-xs rounded-xs outline-none focus:border-[#dbb657]"
                    />
                  </div>
                </div>

                <div className="pt-2 flex items-center gap-3">
                  <button
                    onClick={handleTestFirebase}
                    className="px-4 py-2 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-bold text-xs uppercase tracking-wider rounded-xs transition-colors cursor-pointer"
                  >
                    Test & Save Firebase Connection
                  </button>

                  {firebaseStatusMsg && (
                    <span className="text-xs text-amber-300 font-mono">
                      {firebaseStatusMsg}
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* PWA INSTALLATION INSTRUCTION MODAL */}
      {showInstallModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#12141c] border-2 border-[#dbb657] rounded-sm p-6 shadow-2xl relative space-y-4">
            <button
              onClick={() => setShowInstallModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white p-1 rounded-xs"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <img 
                src="/app-icon.png" 
                alt="Chamber App Icon" 
                className="w-12 h-12 rounded-xl border border-[#dbb657]/70 shadow-md object-cover"
              />
              <div>
                <h3 className="font-serif text-lg font-bold text-white tracking-wide">
                  Install Chamber App
                </h3>
                <p className="text-xs text-gray-400">Add to your Phone or Computer Home Screen</p>
              </div>
            </div>

            <div className="space-y-3 text-xs text-gray-300 max-h-[60vh] overflow-y-auto pr-1">
              <div className="p-3 bg-[#0a0b10] border border-gray-800 rounded-xs space-y-1">
                <span className="font-bold text-[#dbb657] block">💻 Windows PC, Mac & Chromebook:</span>
                <p>1. Look at your browser address bar (top right) and click the <strong className="text-white">Install icon</strong> (computer screen with down arrow) or click browser menu (⋮) → <strong className="text-white">"Install app"</strong>.</p>
                <p>2. Click <strong className="text-white">"Install"</strong>.</p>
                <p>3. The app will launch in its own standalone desktop window with taskbar pinning and instant desktop notifications!</p>
              </div>

              <div className="p-3 bg-[#0a0b10] border border-gray-800 rounded-xs space-y-1">
                <span className="font-bold text-[#dbb657] block">📱 Android & Google Chrome:</span>
                <p>1. Tap the three dots menu (⋮) in your browser top right corner.</p>
                <p>2. Select <strong className="text-white">"Install app"</strong> or <strong className="text-white">"Add to Home screen"</strong>.</p>
                <p>3. The Chamber Admin app icon will appear on your phone home screen.</p>
              </div>

              <div className="p-3 bg-[#0a0b10] border border-gray-800 rounded-xs space-y-1">
                <span className="font-bold text-[#dbb657] block">🍏 Apple iPhone & iPad (Safari):</span>
                <p>1. Tap the <strong className="text-white">Share button</strong> (square with arrow pointing up) at the bottom.</p>
                <p>2. Scroll down and tap <strong className="text-white">"Add to Home Screen"</strong>.</p>
                <p>3. Tap <strong className="text-white">Add</strong> in top right. You're done!</p>
              </div>

              <div className="p-3 bg-emerald-950/40 border border-emerald-500/30 rounded-xs text-emerald-300">
                ✨ <strong>Instant Alerts:</strong> Once installed, you will receive sound alerts and push notifications directly on your PC and Phone whenever a client books a consultation.
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

      {/* CUSTOM IN-APP DELETE LEAD CONFIRMATION MODAL (100% Guaranteed cross-device execution) */}
      {leadToDelete && (
        <div className="fixed inset-0 z-[9999] bg-black/85 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="w-full max-w-md bg-[#12141c] border border-red-500/50 rounded-xs p-5 sm:p-6 shadow-2xl relative space-y-4">
            <button
              type="button"
              onClick={() => setLeadToDelete(null)}
              disabled={isDeleting}
              className="absolute top-4 right-4 text-gray-400 hover:text-white p-1 rounded-xs cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-red-950/80 border border-red-500/50 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5 text-red-400" />
              </div>
              <div className="pr-6">
                <h3 className="font-serif text-base font-bold text-white tracking-wide">
                  Delete Consultation Lead?
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  This action cannot be undone. The client booking record will be permanently deleted.
                </p>
              </div>
            </div>

            <div className="p-3.5 bg-[#08090d] border border-gray-800 rounded-xs space-y-1 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-sm">{leadToDelete.name}</span>
                <span className="text-[10px] px-1.5 py-0.5 bg-[#dbb657]/15 text-[#dbb657] border border-[#dbb657]/30 rounded-xs font-mono font-bold">
                  {leadToDelete.clientCategory || "Individuals"}
                </span>
              </div>
              <p className="text-gray-300 font-mono text-[11px]">{leadToDelete.phone}</p>
              <p className="text-[#dbb657] text-[11px] font-medium">{leadToDelete.caseType}</p>
              {leadToDelete.date && (
                <p className="text-gray-500 text-[10px] font-mono">Preferred Date: {leadToDelete.date}</p>
              )}
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-gray-800/80">
              <button
                type="button"
                onClick={() => setLeadToDelete(null)}
                disabled={isDeleting}
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-semibold rounded-xs transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteLead}
                disabled={isDeleting}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xs transition-colors shadow-lg shadow-red-950 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isDeleting ? "Deleting..." : "Delete Permanently"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
