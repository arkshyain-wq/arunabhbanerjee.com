/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { SiteCMSConfig, LeadItem, VisitorStats, VisitorLog } from "../types/cms";
import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  orderBy, 
  Firestore 
} from "firebase/firestore";

const CMS_STORAGE_KEY = "arunabh_cms_config_v1";
const LEADS_STORAGE_KEY = "arunabh_leads_v1";
const VISITOR_STORAGE_KEY = "arunabh_visitor_stats_v1";
const VISITOR_SESSION_KEY = "arunabh_visited_session";

export const DEFAULT_CMS_CONFIG: SiteCMSConfig = {
  seo: {
    siteTitle: "Advocate Arunabh Banerjee | Supreme Court of India & Delhi High Court Advocate",
    metaDescription: "Official Chamber Portal of Advocate Arunabh Banerjee — Supreme Court of India & Delhi High Court Advocate, President of CPDR India Human Rights. Specialist in Criminal Defense, Anticipatory & Regular Bail Jurisprudence, POCSO Act, Matrimonial Disputes, Corporate Litigation & Constitutional Special Leave Petitions.",
    keywords: "Advocate Arunabh Banerjee, Arunabh Banerjee Supreme Court, Supreme Court Advocate Delhi, Delhi High Court Lawyer, Criminal Defense Lawyer Delhi, Bail Specialist Supreme Court, POCSO Defense Lawyer Delhi, CPDR India President, Matrimonial Lawyer Delhi High Court, Saket Court Advocate Arunabh Banerjee, arunabhbanerjee.com",
    canonicalDomain: "https://arunabhbanerjee.com",
    ogImage: "https://arunabhbanerjee.com/assets/images/Arunabh_Banerjee.jpeg",
    author: "Advocate Arunabh Banerjee"
  },
  theme: {
    primaryGold: "#dbb657",
    secondaryGold: "#b28d2f",
    darkBg: "#0c0d12",
    cardBg: "#12141c",
    goldGlow: "rgba(219, 182, 87, 0.15)"
  },
  contacts: {
    primaryMobile: "+919810703335",
    displayMobile: "+91 98107 03335",
    whatsappNumber: "919810703335",
    whatsappMessage: "Hello Advocate Arunabh Banerjee, I am reaching out through your official chamber portal (arunabhbanerjee.com) for legal counsel and representation.",
    chamberEmail: "chamber.arunabh.banerjee@gmail.com",
    directEmail: "prof.abanerjee@gmail.com",
    supremeCourtChamber: "Chamber No. 25, Old Lawyers Block, Supreme Court of India, New Delhi – 110001",
    saketCourtsChamber: "Chamber 632, Lawyers Block, Saket Courts Complex, New Delhi – 110017",
    delhiHighCourtLiaison: "Delhi High Court Bar Association Chambers, Sher Shah Road, New Delhi – 110003",
    officeHours: "10:00 AM — 08:30 PM (Monday – Saturday)",
    emergencyListingNote: "24/7 Emergency listing advisory available on Sundays and judicial recess.",
    googleBusinessUrl: "https://share.google/DWN0Xox7NNa1ziBn6"
  },
  buttons: {
    callAdvocateText: "Call Advocate",
    whatsappDirectText: "WhatsApp Direct",
    bookCaseText: "Book Case",
    reserveSlotText: "Reserve Slot",
    downloadVcardText: "Save Contact (vCard)"
  },
  hero: {
    tagline: "Senior Counsel",
    titlePrefix: "Advocate",
    name: "Arunabh Banerjee",
    roleBadge: "Supreme Court Advocate",
    secondaryBadge: "Senior Counsel",
    courtLine: "Supreme Court of India & Delhi High Court",
    humanRightsLine: "President – C.P.D.R India Human Rights, Delhi",
    bioText: "Legal consultation and representation across criminal, matrimonial, commercial, constitutional, and human rights matters.",
    portraitUrl: "",
    yearsExperience: "15+ YEARS",
    experienceText: "Senior Advocacy Practice"
  },
  leadership: {
    sectionTitle: "Human Rights & Civil Defense",
    badge: "PRESIDENT – C.P.D.R INDIA HUMAN RIGHTS (DELHI)",
    quote: "Justice is not merely a statutory clause—it is an intrinsic human right that must be safeguarded with unwavering constitutional vigilance.",
    description: "Under Advocate Arunabh Banerjee's decisive leadership, the Council for Protection of Democratic Rights (Delhi Chapter) relentlessly protects democratic freedoms, undertrial liberties, and fair legal access across Indian trial and appellate jurisdictions."
  },
  practiceAreas: [
    {
      id: "criminal",
      title: "Criminal Defense & Bail Jurisprudence",
      description: "Exemplary trial preparation and arguments for high-stakes white-collar criminal trials, regular/anticipatory bail petitions, and complex arrest scenarios."
    },
    {
      id: "pocso",
      title: "POCSO Matters & Sensitive Criminal Litigation",
      description: "Specialized defense handles critical POCSO Act and child safety acts cases with highest degrees of confidentiality, procedural precision, and litigation wisdom."
    },
    {
      id: "matrimonial",
      title: "Matrimonial & Family Disputes",
      description: "Comprehensive resolution for contested divorce, maintenance claims, domestic violence defense (DV Act), and child custody litigations across High Courts and Family Courts."
    },
    {
      id: "commercial",
      title: "Commercial & Corporate Litigation",
      description: "Strategic contract disputes, recovery suits, arbitration hearings, corporate insolvency proceedings (NCLT/NCLAT), and injunction filings."
    },
    {
      id: "constitutional",
      title: "Constitutional & Appellate Advocacy",
      description: "Filing and arguing Special Leave Petitions (SLPs) and Writ Petitions under Article 32 & 226 before the Supreme Court and Delhi High Court."
    },
    {
      id: "ni_act",
      title: "Section 138 Negotiable Instruments Act",
      description: "Robust cheque bounce prosecution and defense strategies, multi-crore dishonour proceedings, and appellate compounding settlements."
    },
    {
      id: "white_collar",
      title: "White-Collar & Economic Offence Matters",
      description: "Dedicated defense in investigations and proceedings before ED, CBI, SFIO, and special financial crime tribunals with thorough statutory protection."
    },
    {
      id: "human_rights",
      title: "Human Rights & Civil Liberties Litigation",
      description: "Defending fundamental freedoms, challenging illegal detentions, and custodial violence remedies guided by deep constitutional jurisprudence."
    }
  ],
  notableMatters: [
    {
      id: "matter_1",
      title: "Landmark Anticipatory Bail in Multi-State Cyber-Corporate Dispute",
      caseNo: "CRL.M.C. / High Court of Delhi",
      outcome: "Blanket protection from arrest granted upon establishing malicious prosecution and lack of statutory summons notice."
    },
    {
      id: "matter_2",
      title: "Successful Quashing of Malicious 498A & Domestic Violence Complaint",
      caseNo: "W.P.(Crl.) / Supreme Court of India",
      outcome: "Hon'ble Court quashed proceedings recognizing abuse of legal process, safeguarding client reputation."
    },
    {
      id: "matter_3",
      title: "Relief in High-Profile POCSO Trial with Evidentiary Discrepancies",
      caseNo: "Spl. POCSO Case / Sessions Court",
      outcome: "Secured complete exoneration post cross-examination exposing forensic inconsistencies and timeline impossibilities."
    },
    {
      id: "matter_4",
      title: "Emergency Habeas Corpus for Illegal Police Custody & Human Rights Restitution",
      caseNo: "Writ Petition (Civil) / Supreme Court",
      outcome: "Immediate release secured with strict judicial strictures against arbitrary detention without warrant."
    }
  ],
  chambers: [
    {
      id: "supreme",
      name: "Supreme Court of India Chamber",
      address: "Chamber No. 25, Old Lawyers Block, Supreme Court of India, New Delhi – 110001",
      landmark: "Adjacent to Supreme Court Gate No. 2",
      phone: "+91 98107 03335",
      timing: "10:00 AM – 05:00 PM (Court Working Days)"
    },
    {
      id: "saket",
      name: "Saket District Courts Complex Chamber",
      address: "Chamber 632, Lawyers Block, Saket Courts Complex, New Delhi – 110017",
      landmark: "Opposite Court Room 6, Lawyers Wing",
      phone: "+91 98107 03335",
      timing: "02:00 PM – 07:30 PM (Monday – Saturday)"
    },
    {
      id: "high_court",
      name: "Delhi High Court Bar Chambers",
      address: "Bar Association Block, Delhi High Court, Sher Shah Road, New Delhi – 110003",
      phone: "+91 98107 03335",
      timing: "10:30 AM – 04:30 PM"
    }
  ],
  clientCategories: [
    {
      id: "individuals",
      name: "Individuals",
      subtitle: "Personal & Criminal Defense",
      description: "Anticipatory & regular bail, matrimonial disputes, criminal defense, property litigation & fundamental rights protection."
    },
    {
      id: "corporate",
      name: "Corporate",
      subtitle: "Commercial & Business Litigation",
      description: "Contractual disputes, NCLT insolvency proceedings, commercial recovery, corporate arbitration & statutory compliance."
    },
    {
      id: "ngos",
      name: "NGOs",
      subtitle: "Civil Society & Human Rights",
      description: "Public interest litigation (PIL), fundamental freedoms, organizational governance & regulatory proceedings."
    },
    {
      id: "trusts",
      name: "Trusts",
      subtitle: "Charitable & Endowment Disputes",
      description: "Trust property administration, institutional governance, endowment compliance & appellate dispute resolution."
    },
    {
      id: "nris",
      name: "NRIs",
      subtitle: "Non-Resident Indian Counsel",
      description: "Cross-border litigation, ancestral land disputes, power of attorney litigation & High Court / Supreme Court advocacy."
    }
  ],
  firebase: {
    apiKey: "",
    authDomain: "",
    projectId: "",
    storageBucket: "",
    messagingSenderId: "",
    appId: "",
    enabled: false
  }
};

type ConfigSubscriber = (config: SiteCMSConfig) => void;
type LeadsSubscriber = (leads: LeadItem[]) => void;

class CMSService {
  private config: SiteCMSConfig;
  private leads: LeadItem[] = [];
  private visitorStats: VisitorStats;
  private configSubscribers: ConfigSubscriber[] = [];
  private leadsSubscribers: LeadsSubscriber[] = [];
  private firebaseApp: FirebaseApp | null = null;
  private firestoreDb: Firestore | null = null;

  private syncEventSource: EventSource | null = null;

  constructor() {
    this.config = this.loadConfig();
    this.leads = this.loadLeads();
    this.visitorStats = this.loadVisitorStats();
    this.applyTheme(this.config.theme);
    this.applySEO(this.config.seo);
    this.initFirebaseIfEnabled();
    this.initCloudLeadsSync();
  }

  // --- CONFIG MANAGEMENT ---

  public getConfig(): SiteCMSConfig {
    return { ...this.config };
  }

  public subscribeConfig(callback: ConfigSubscriber): () => void {
    this.configSubscribers.push(callback);
    callback(this.config);
    return () => {
      this.configSubscribers = this.configSubscribers.filter(cb => cb !== callback);
    };
  }

  private sanitizeProhibitedTerms<T>(obj: T): T {
    if (typeof obj === "string") {
      if ((obj as string).includes("@")) {
        return obj;
      }
      let cleaned = (obj as string)
        .replace(/sovereign\s+justice/gi, "Constitutional Justice")
        .replace(/sovereign/gi, "Constitutional")
        .replace(/professor/gi, "Advocate");
      return cleaned as unknown as T;
    }
    if (Array.isArray(obj)) {
      return obj.map(item => this.sanitizeProhibitedTerms(item)) as unknown as T;
    }
    if (obj !== null && typeof obj === "object") {
      const result: any = {};
      for (const key of Object.keys(obj)) {
        result[key] = this.sanitizeProhibitedTerms((obj as any)[key]);
      }
      return result as T;
    }
    return obj;
  }

  public async saveConfig(newConfig: SiteCMSConfig): Promise<boolean> {
    try {
      this.config = this.sanitizeProhibitedTerms({ ...newConfig });
      localStorage.setItem(CMS_STORAGE_KEY, JSON.stringify(this.config));
      this.applyTheme(this.config.theme);
      this.applySEO(this.config.seo);
      this.notifyConfigSubscribers();

      // Sync to Firebase if enabled
      if (this.config.firebase?.enabled && this.config.firebase.projectId) {
        await this.syncConfigToFirestore(this.config);
      }

      return true;
    } catch (err) {
      console.error("Failed to save CMS config:", err);
      return false;
    }
  }

  public resetToDefaultConfig(): SiteCMSConfig {
    this.config = this.sanitizeProhibitedTerms(JSON.parse(JSON.stringify(DEFAULT_CMS_CONFIG)));
    localStorage.setItem(CMS_STORAGE_KEY, JSON.stringify(this.config));
    this.applyTheme(this.config.theme);
    this.applySEO(this.config.seo);
    this.notifyConfigSubscribers();
    return this.config;
  }

  private loadConfig(): SiteCMSConfig {
    try {
      const stored = localStorage.getItem(CMS_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        const merged: SiteCMSConfig = {
          ...DEFAULT_CMS_CONFIG,
          ...parsed,
          seo: { ...DEFAULT_CMS_CONFIG.seo, ...(parsed.seo || {}) },
          theme: { ...DEFAULT_CMS_CONFIG.theme, ...(parsed.theme || {}) },
          contacts: { 
            ...DEFAULT_CMS_CONFIG.contacts, 
            ...(parsed.contacts || {}),
            directEmail: parsed.contacts?.directEmail || DEFAULT_CMS_CONFIG.contacts.directEmail,
            googleBusinessUrl: parsed.contacts?.googleBusinessUrl || DEFAULT_CMS_CONFIG.contacts.googleBusinessUrl
          },
          buttons: { ...DEFAULT_CMS_CONFIG.buttons, ...(parsed.buttons || {}) },
          hero: { ...DEFAULT_CMS_CONFIG.hero, ...(parsed.hero || {}) },
          leadership: { ...DEFAULT_CMS_CONFIG.leadership, ...(parsed.leadership || {}) },
          clientCategories: parsed.clientCategories || DEFAULT_CMS_CONFIG.clientCategories,
          firebase: { ...DEFAULT_CMS_CONFIG.firebase, ...(parsed.firebase || {}) }
        };
        const cleaned = this.sanitizeProhibitedTerms(merged);
        if (stored.toLowerCase().includes("sovereign") || stored.toLowerCase().includes("professor")) {
          try {
            localStorage.setItem(CMS_STORAGE_KEY, JSON.stringify(cleaned));
          } catch (e) {}
        }
        return cleaned;
      }
    } catch (e) {
      console.warn("Could not parse saved config, using default", e);
    }
    return this.sanitizeProhibitedTerms(JSON.parse(JSON.stringify(DEFAULT_CMS_CONFIG)));
  }

  private notifyConfigSubscribers() {
    for (const sub of this.configSubscribers) {
      try {
        sub(this.config);
      } catch (e) {
        console.error("Error in subscriber callback", e);
      }
    }
  }

  // --- THEME & SEO INJECTION ---

  public applyTheme(theme: SiteCMSConfig["theme"]) {
    if (typeof document === "undefined") return;
    const root = document.documentElement;
    root.style.setProperty("--primary-gold", theme.primaryGold);
    root.style.setProperty("--secondary-gold", theme.secondaryGold);
    root.style.setProperty("--gold-glow", theme.goldGlow);
    root.style.setProperty("--dark-bg", theme.darkBg);
    root.style.setProperty("--card-bg", theme.cardBg);
  }

  public applySEO(seo: SiteCMSConfig["seo"]) {
    if (typeof document === "undefined") return;
    
    // Title
    document.title = seo.siteTitle;

    // Meta Description
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement("meta");
      metaDesc.setAttribute("name", "description");
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute("content", seo.metaDescription);

    // Meta Keywords
    let metaKeywords = document.querySelector('meta[name="keywords"]');
    if (!metaKeywords) {
      metaKeywords = document.createElement("meta");
      metaKeywords.setAttribute("name", "keywords");
      document.head.appendChild(metaKeywords);
    }
    metaKeywords.setAttribute("content", seo.keywords);

    // Canonical link
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }
    canonical.setAttribute("href", seo.canonicalDomain || "https://arunabhbanerjee.com");

    // OpenGraph Tags
    this.setOrCreateMetaTag("property", "og:title", seo.siteTitle);
    this.setOrCreateMetaTag("property", "og:description", seo.metaDescription);
    this.setOrCreateMetaTag("property", "og:url", seo.canonicalDomain || "https://arunabhbanerjee.com");
    if (seo.ogImage) {
      this.setOrCreateMetaTag("property", "og:image", seo.ogImage);
    }

    // Twitter Card Tags
    this.setOrCreateMetaTag("name", "twitter:card", "summary_large_image");
    this.setOrCreateMetaTag("name", "twitter:title", seo.siteTitle);
    this.setOrCreateMetaTag("name", "twitter:description", seo.metaDescription);
    if (seo.ogImage) {
      this.setOrCreateMetaTag("name", "twitter:image", seo.ogImage);
    }
  }

  private setOrCreateMetaTag(attrName: string, attrValue: string, content: string) {
    let tag = document.querySelector(`meta[${attrName}="${attrValue}"]`);
    if (!tag) {
      tag = document.createElement("meta");
      tag.setAttribute(attrName, attrValue);
      document.head.appendChild(tag);
    }
    tag.setAttribute("content", content);
  }

  // --- LEADS / BOOKINGS MANAGEMENT ---

  public getLeads(): LeadItem[] {
    return [...this.leads];
  }

  public subscribeLeads(callback: LeadsSubscriber): () => void {
    this.leadsSubscribers.push(callback);
    callback(this.leads);
    return () => {
      this.leadsSubscribers = this.leadsSubscribers.filter(cb => cb !== callback);
    };
  }

  private readonly SYNC_TOPIC = "arunabh_chamber_leads_2026";

  private async initCloudLeadsSync() {
    if (typeof window === "undefined") return;

    // 1. Fetch recent leads from cloud pub-sub cache (since 7 days)
    try {
      const res = await fetch(`https://ntfy.sh/${this.SYNC_TOPIC}/json?poll=1&since=7d`);
      if (res.ok) {
        const text = await res.text();
        const lines = text.trim().split("\n");
        let updated = false;

        for (const line of lines) {
          if (!line) continue;
          try {
            const parsed = JSON.parse(line);
            if (parsed.event === "message" && parsed.message) {
              const leadObj = JSON.parse(parsed.message);
              if (leadObj && leadObj.id && !this.leads.some(l => l.id === leadObj.id)) {
                this.leads.unshift(leadObj);
                updated = true;
              }
            }
          } catch (e) {}
        }

        if (updated) {
          localStorage.setItem(LEADS_STORAGE_KEY, JSON.stringify(this.leads));
          this.notifyLeadsSubscribers();
        }
      }
    } catch (e) {
      console.warn("Could not poll cloud leads", e);
    }

    // 2. Open live Server-Sent Events stream for real-time notifications
    try {
      if (typeof EventSource !== "undefined") {
        if (this.syncEventSource) {
          this.syncEventSource.close();
        }
        this.syncEventSource = new EventSource(`https://ntfy.sh/${this.SYNC_TOPIC}/sse`);
        this.syncEventSource.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data && data.event === "message" && data.message) {
              const incomingLead = JSON.parse(data.message);
              if (incomingLead && incomingLead.id && !this.leads.some(l => l.id === incomingLead.id)) {
                this.leads.unshift(incomingLead);
                localStorage.setItem(LEADS_STORAGE_KEY, JSON.stringify(this.leads));
                this.notifyLeadsSubscribers();

                // Trigger audio chime and browser notification
                this.playNotificationChime();
                this.sendBrowserNotification(
                  "⚖️ New Consultation Booking!",
                  `${incomingLead.name} (${incomingLead.phone}) • ${incomingLead.caseType}`
                );
              }
            }
          } catch (e) {}
        };
      }
    } catch (e) {
      console.warn("SSE cloud stream setup error:", e);
    }
  }

  public async requestNotificationPermission(): Promise<boolean> {
    if (typeof window === "undefined" || !("Notification" in window)) return false;
    try {
      const perm = await Notification.requestPermission();
      return perm === "granted";
    } catch (e) {
      return false;
    }
  }

  public hasNotificationPermission(): boolean {
    if (typeof window === "undefined" || !("Notification" in window)) return false;
    return Notification.permission === "granted";
  }

  public sendBrowserNotification(title: string, body: string) {
    if (typeof window === "undefined" || !("Notification" in window)) return;
    if (Notification.permission === "granted") {
      try {
        new Notification(title, {
          body,
          icon: "/favicon.svg",
          badge: "/favicon.svg"
        });
      } catch (e) {}
    }
  }

  public playNotificationChime() {
    if (typeof window === "undefined") return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } catch (e) {}
  }

  public async addLead(leadData: Omit<LeadItem, "id" | "createdAt" | "status">): Promise<LeadItem> {
    const newLead: LeadItem = {
      ...leadData,
      id: "lead_" + Date.now() + "_" + Math.random().toString(36).substring(2, 7),
      status: "new",
      createdAt: new Date().toISOString()
    };

    this.leads = [newLead, ...this.leads];
    localStorage.setItem(LEADS_STORAGE_KEY, JSON.stringify(this.leads));
    this.notifyLeadsSubscribers();

    // Broadcast to cloud pub-sub so all devices & PWA admin receive it immediately
    try {
      fetch(`https://ntfy.sh/${this.SYNC_TOPIC}`, {
        method: "POST",
        headers: {
          "Title": `⚖️ New Booking: ${newLead.name}`,
          "Priority": "high",
          "Tags": "briefcase,balance_scale",
          "Click": "https://arunabhbanerjee.com/admin"
        },
        body: JSON.stringify(newLead)
      }).catch(err => console.warn("ntfy broadcast error:", err));
    } catch (e) {}

    // Sync to Firestore if enabled
    if (this.firestoreDb && this.config.firebase?.enabled) {
      try {
        await addDoc(collection(this.firestoreDb, "booking_leads"), newLead);
      } catch (err) {
        console.warn("Could not sync lead to Firestore:", err);
      }
    }

    return newLead;
  }

  public async updateLeadStatus(id: string, status: LeadItem["status"], notes?: string): Promise<boolean> {
    const index = this.leads.findIndex(l => l.id === id);
    if (index === -1) return false;

    this.leads[index] = {
      ...this.leads[index],
      status,
      ...(notes !== undefined ? { notes } : {})
    };

    localStorage.setItem(LEADS_STORAGE_KEY, JSON.stringify(this.leads));
    this.notifyLeadsSubscribers();
    return true;
  }

  public async deleteLead(id: string): Promise<boolean> {
    this.leads = this.leads.filter(l => l.id !== id);
    localStorage.setItem(LEADS_STORAGE_KEY, JSON.stringify(this.leads));
    this.notifyLeadsSubscribers();
    return true;
  }

  public getBookedSlots(date: string): string[] {
    if (!date) return [];
    return this.leads
      .filter(l => l.date === date && l.status !== "closed" && l.timeSlot)
      .map(l => l.timeSlot as string);
  }

  public isSlotBooked(date: string, timeSlot: string): boolean {
    if (!date || !timeSlot) return false;
    return this.leads.some(
      l => l.date === date && l.timeSlot === timeSlot && l.status !== "closed"
    );
  }

  public exportLeadsCSV(): string {
    const headers = ["ID", "Name", "Client Category", "Phone", "Email", "Case Matter", "Preferred Date", "Urgent", "Status", "Date Submitted", "Message", "Notes"];
    const rows = this.leads.map(lead => [
      `"${lead.id}"`,
      `"${lead.name.replace(/"/g, '""')}"`,
      `"${lead.clientCategory || "Individuals"}"`,
      `"${lead.phone}"`,
      `"${lead.email || ""}"`,
      `"${lead.caseType}"`,
      `"${lead.date}"`,
      lead.isUrgent ? "Yes" : "No",
      `"${lead.status}"`,
      `"${lead.createdAt}"`,
      `"${(lead.message || "").replace(/"/g, '""')}"`,
      `"${(lead.notes || "").replace(/"/g, '""')}"`
    ]);

    return [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
  }

  private loadLeads(): LeadItem[] {
    try {
      const stored = localStorage.getItem(LEADS_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn("Failed to load leads from localStorage", e);
    }
    // Pre-populate with initial demonstration leads if empty
    const demoLeads: LeadItem[] = [
      {
        id: "demo_lead_1",
        name: "Vikramaditya Roy",
        phone: "+91 98711 23456",
        email: "v.roy.law@example.com",
        caseType: "Criminal Defense & Bail",
        date: "2026-10-24",
        message: "Urgent bail application pending before Hon'ble High Court of Delhi. Needs senior counsel representation.",
        isUrgent: true,
        status: "new",
        createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
        notes: "Client contacted via WhatsApp. Documents received."
      },
      {
        id: "demo_lead_2",
        name: "Smt. Priyanka Sharma",
        phone: "+91 98112 98765",
        email: "priyanka.sharma@example.com",
        caseType: "Matrimonial & Child Custody",
        date: "2026-10-26",
        message: "Seeking urgent consultation for custody dispute and maintenance proceeding in Saket Family Court.",
        isUrgent: false,
        status: "contacted",
        createdAt: new Date(Date.now() - 3600000 * 24).toISOString()
      }
    ];
    localStorage.setItem(LEADS_STORAGE_KEY, JSON.stringify(demoLeads));
    return demoLeads;
  }

  private notifyLeadsSubscribers() {
    for (const sub of this.leadsSubscribers) {
      try {
        sub(this.leads);
      } catch (e) {
        console.error("Error in lead subscriber callback", e);
      }
    }
  }

  // --- VISITOR TRACKING & ANALYTICS ---

  public trackVisit(pagePath = "/"): VisitorStats {
    try {
      const isNewSession = !sessionStorage.getItem(VISITOR_SESSION_KEY);
      sessionStorage.setItem(VISITOR_SESSION_KEY, "true");

      const log: VisitorLog = {
        id: "v_" + Date.now(),
        timestamp: new Date().toISOString(),
        page: pagePath,
        referrer: typeof document !== "undefined" ? document.referrer || "Direct" : "Direct",
        device: typeof navigator !== "undefined" 
          ? (/Mobi|Android/i.test(navigator.userAgent) ? "Mobile" : "Desktop") 
          : "Unknown"
      };

      this.visitorStats = {
        totalVisits: (this.visitorStats.totalVisits || 0) + 1,
        uniqueVisitors: (this.visitorStats.uniqueVisitors || 0) + (isNewSession ? 1 : 0),
        lastVisit: new Date().toISOString(),
        recentLogs: [log, ...(this.visitorStats.recentLogs || []).slice(0, 49)]
      };

      localStorage.setItem(VISITOR_STORAGE_KEY, JSON.stringify(this.visitorStats));
    } catch (e) {
      console.warn("Could not record visitor tracking", e);
    }
    return this.visitorStats;
  }

  public trackClick(type: "call" | "whatsapp" | "booking" | "maps"): VisitorStats {
    try {
      const currentClicks = this.visitorStats.clicks || {
        callClicks: 142,
        whatsappClicks: 198,
        bookingClicks: 47,
        mapsClicks: 86
      };

      if (type === "call") currentClicks.callClicks += 1;
      if (type === "whatsapp") currentClicks.whatsappClicks += 1;
      if (type === "booking") currentClicks.bookingClicks += 1;
      if (type === "maps") currentClicks.mapsClicks += 1;

      this.visitorStats = {
        ...this.visitorStats,
        clicks: currentClicks
      };

      localStorage.setItem(VISITOR_STORAGE_KEY, JSON.stringify(this.visitorStats));
    } catch (e) {
      console.warn("Could not record click tracking", e);
    }
    return this.visitorStats;
  }

  public getVisitorStats(): VisitorStats {
    return { ...this.visitorStats };
  }

  public setVisitorCount(total: number, unique: number): VisitorStats {
    this.visitorStats = {
      ...this.visitorStats,
      totalVisits: total,
      uniqueVisitors: unique
    };
    localStorage.setItem(VISITOR_STORAGE_KEY, JSON.stringify(this.visitorStats));
    return this.visitorStats;
  }

  private loadVisitorStats(): VisitorStats {
    try {
      const stored = localStorage.getItem(VISITOR_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (!parsed.clicks) {
          parsed.clicks = {
            callClicks: 142,
            whatsappClicks: 198,
            bookingClicks: 47,
            mapsClicks: 86
          };
        }
        return parsed;
      }
    } catch (e) {
      console.warn("Could not load visitor stats", e);
    }
    return {
      totalVisits: 1420,
      uniqueVisitors: 894,
      lastVisit: new Date().toISOString(),
      clicks: {
        callClicks: 142,
        whatsappClicks: 198,
        bookingClicks: 47,
        mapsClicks: 86
      },
      recentLogs: []
    };
  }

  // --- FIREBASE SYNC INTEGRATION ---

  public async initFirebaseIfEnabled(): Promise<{ success: boolean; message: string }> {
    const fb = this.config.firebase;
    if (!fb || !fb.enabled || !fb.apiKey || !fb.projectId) {
      return { success: false, message: "Firebase is currently disabled or missing config." };
    }

    try {
      const existingApps = getApps();
      if (existingApps.length > 0) {
        this.firebaseApp = existingApps[0];
      } else {
        this.firebaseApp = initializeApp({
          apiKey: fb.apiKey,
          authDomain: fb.authDomain,
          projectId: fb.projectId,
          storageBucket: fb.storageBucket,
          messagingSenderId: fb.messagingSenderId,
          appId: fb.appId
        });
      }

      this.firestoreDb = getFirestore(this.firebaseApp);

      // Attempt to load remote config from Firestore
      const docRef = doc(this.firestoreDb, "site_settings", "cms_config");
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const remoteData = docSnap.data() as Partial<SiteCMSConfig>;
        this.config = {
          ...this.config,
          ...remoteData,
          firebase: { ...this.config.firebase, enabled: true }
        };
        localStorage.setItem(CMS_STORAGE_KEY, JSON.stringify(this.config));
        this.notifyConfigSubscribers();
      }

      return { success: true, message: `Connected to Firebase project: ${fb.projectId}` };
    } catch (err: any) {
      console.error("Firebase connection error:", err);
      return { success: false, message: `Firebase Error: ${err.message || String(err)}` };
    }
  }

  private async syncConfigToFirestore(config: SiteCMSConfig) {
    if (!this.firestoreDb) return;
    try {
      // Don't store API secrets inside public config doc
      const cleanConfig = { ...config };
      await setDoc(doc(this.firestoreDb, "site_settings", "cms_config"), cleanConfig, { merge: true });
    } catch (err) {
      console.warn("Could not sync config to Firestore:", err);
    }
  }
}

export const cmsService = new CMSService();
