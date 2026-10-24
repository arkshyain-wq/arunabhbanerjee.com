/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface PracticeArea {
  id: string;
  title: string;
  description: string;
}

export interface NotableMatter {
  id: string;
  title: string;
  caseNo: string;
  outcome: string;
}

export interface ChamberLocation {
  name: string;
  address: string;
  landmark?: string;
  type: 'supreme' | 'saket' | 'panchsheel' | 'crpark' | 'chamber' | 'office' | 'also_at';
}

export interface GlossaryItem {
  term: string;
  definition: string;
  hindiTerm: string;
  hindiDefinition: string;
}

export interface TranslationSchema {
  navHome: string;
  navLegacy: string;
  navPractice: string;
  navMatters: string;
  navMentorship: string;
  navLeadership: string;
  navContact: string;
  themeToggle: string;
  lightTheme: string;
  darkTheme: string;
  heroTitle: string;
  heroTitlePrefix: string;
  supremeCourtAdvocate: string;
  jurisdictionLine: string;
  humanRightsLine: string;
  contactBtn: string;
  practiceTitle: string;
  practiceSub: string;
  mattersTitle: string;
  mattersSub: string;
  mentorshipTitle: string;
  mentorshipSub: string;
  mentorshipContent: string;
  leadershipTitle: string;
  leadershipSub: string;
  leadershipQuote: string;
  contactTitle: string;
  contactSub: string;
  appointmentFormTitle: string;
  formName: string;
  formPhone: string;
  formEmail: string;
  formCaseType: string;
  formMessage: string;
  formSubmit: string;
  formSuccessMsg: string;
  chamberTitle: string;
  phoneLabel: string;
  vcardDownload: string;
  vcardSuccess: string;
  searchGlossaryPlaceholder: string;
  glossaryTitle: string;
  glossarySub: string;
  legacyTitle: string;
}

export const translations: Record<'EN' | 'HI', TranslationSchema & {
  practiceAreas: PracticeArea[];
  notableMatters: NotableMatter[];
  chambers: ChamberLocation[];
  glossary: GlossaryItem[];
  aboutText: string;
}> = {
  EN: {
    navHome: "Home",
    navLegacy: "Legacy",
    navPractice: "Practice Areas",
    navMatters: "Notable Matters",
    navMentorship: "Mentorship",
    navLeadership: "Human Rights",
    navContact: "Chambers",
    themeToggle: "Theme",
    lightTheme: "Imperial Cream",
    darkTheme: "Chamber Charcoal",
    heroTitle: "Advocate Arunabh Banerjee",
    heroTitlePrefix: "ADVOCATE",
    supremeCourtAdvocate: "SUPREME COURT ADVOCATE",
    jurisdictionLine: "Supreme Court & High Court (All Courts & Tribunals)",
    humanRightsLine: "President – C.P.D.R India Human Rights, Delhi",
    contactBtn: "Schedule Consultation",
    legacyTitle: "A Legacy of Legal Excellence",
    aboutText: "Mr. Arunabh Banerjee is a distinguished Supreme Court Advocate renowned for his commanding courtroom presence, refined legal strategy, and unwavering dedication to justice. With an accomplished litigation career spanning criminal, matrimonial, commercial, constitutional and human rights matters, and over 15 years of distinguished teaching experience, he has emerged as a respected litigator, legal mentor and human rights advocate.",
    practiceTitle: "Distinguished Legal Practice",
    practiceSub: "Providing expert counsel & robust representation across key constitutional & statutory areas.",
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
        description: "Holistic handling of highly contested divorce petitions, child custody, domestic violence appeals, maintenance disputes, and mutual agreements."
      },
      {
        id: "commercial",
        title: "Commercial & Corporate Litigation",
        description: "Expert contractual resolution, business tort disputes, shareholder oppression appeals, insolvency and bankruptcy proceedings before NCLT and appellate tribunals."
      },
      {
        id: "constitutional",
        title: "Constitutional & Appellate Advocacy",
        description: "Comprehensive Special Leave Petitions (SLPs) and Writ Jurisdictions under Articles 32 and 226/227 defending fundamental liberties before high courts and Supreme Court."
      },
      {
        id: "sec138",
        title: "Section 138 Negotiable Instruments Act",
        description: "Robust litigation representation regarding commercial dishonor of cheques, handling notices, trial defenses, and high value summary recoveries."
      },
      {
        id: "whitecollar",
        title: "White-Collar & Economic Offence Matters",
        description: "Sophisticated handling of investigations by ED, CBI, SFIO, or EOW involving prevention of money laundering, bribery, cyber frauds, or assets seizures."
      },
      {
        id: "humanrights",
        title: "Human Rights & Civil Liberties Litigation",
        description: "Championing civil, social, and constitutional liberties under CPDR India framework. Direct legal interventions for unlawful detentions and minority rights."
      }
    ],
    mattersTitle: "Notable Matters",
    mattersSub: "A proven record of landmark verdicts and client-first outcomes in statutory & high courts.",
    notableMatters: [
      {
        id: "m1",
        title: "Dharmendra Sharma Vs Pooja Sharma",
        caseNo: "Divorce Decree Reference",
        outcome: "Successfully represented petitioner in a highly contested matrimonial claim; divorce decree rightfully granted with fair alimony resolution."
      },
      {
        id: "m2",
        title: "Unique Engineers Vs EES Pvt. Ltd.",
        caseNo: "Commercial Summary Suit",
        outcome: "Successfully represented Unique Engineers in key engineering vendor claims; commercial decree passed entirely in favor of the client."
      },
      {
        id: "m3",
        title: "Section 138 NI Act Recoveries",
        caseNo: "Multiple Statutory Matters",
        outcome: "Successfully handled numerous sophisticated Section 138 NI Act matters involving cheque dishonor and structural business recoveries across North India."
      },
      {
        id: "m4",
        title: "Sensitive POCSO & Bail Interventions",
        caseNo: "Supreme Court Special Petitions",
        outcome: "Successfully represented and secured anticipatory & statutory bail for erroneously accused clients in cross-jurisdictional POCSO and highly complex criminal trials."
      }
    ],
    mentorshipTitle: "Academic Excellence & Mentorship",
    mentorshipSub: "Shaping the minds of tomorrow's officers of the court.",
    mentorshipContent: "With over 15 years of dedicated teaching and classroom experience at prestigious educational and training institutions, Advocate Banerjee has mentored countless aspiring advocates, law students, and junior litigating practitioners. His pedagogical focus lies on critical constitutional ethics, supreme court advocacy skills, precise legal drafting (pleadings), and rigorous courtroom discipline.",
    leadershipTitle: "Human Rights Leadership",
    leadershipSub: "Advancing civil liberties and humanitarian justice across the Indian subcontinent.",
    leadershipQuote: "Justice is not merely a profession, but a lifelong commitment to constitutional values, human dignity, and the rule of law.",
    contactTitle: "Chamber Directory",
    contactSub: "Schedule an advisory appointment across our specialized capital chambers.",
    appointmentFormTitle: "Secure Digital Consultation Request",
    formName: "Full Name",
    formPhone: "Contact Phone (with Code)",
    formEmail: "Email Address",
    formCaseType: "Practice Area",
    formMessage: "Brief Case Summary",
    formSubmit: "Book Consultation Slot",
    formSuccessMsg: "Thank you. Your briefing summary and consultation request have been securely queued to Advocate Banerjee's chamber clerk. We will contact you back under 12 hours.",
    chamberTitle: "Official Chamber Locations",
    phoneLabel: "Chamber Helpline",
    vcardDownload: "Download Advocate vCard",
    vcardSuccess: "vCard Generated! Copy business card credentials dynamically.",
    searchGlossaryPlaceholder: "Search legal terms (e.g. bail, writ, पॉक्सो, रिट)...",
    glossaryTitle: "Legal Glossary & Translation Hub",
    glossarySub: "Simplifying legal definitions in Hindi and English simultaneously for citizens.",
    chambers: [
      {
        name: "Chamber",
        address: "632, Lawyer's Block, Saket Courts Complex, New Delhi 110017",
        landmark: "Lawyer's Block, Saket Courts",
        type: "saket"
      },
      {
        name: "Office",
        address: "M-18, Ground Floor, CR Park, New Delhi - 110019",
        landmark: "Chittaranjan Park, Ground Floor",
        type: "crpark"
      },
      {
        name: "Also at",
        address: "C-81, UGF, Panchsheel Enclave, New Delhi 110017",
        landmark: "Near Outer Ring Road / S-Block Corner",
        type: "panchsheel"
      }
    ],
    glossary: [
      { term: "Bail", definition: "Temporary release of an accused person awaiting trial, sometimes on condition that a sum of money be lodged.", hindiTerm: "जमानत", hindiDefinition: "किसी अभियुक्त को मुकदमे के लंबित रहने तक सशर्त या प्रतिभूति पर अस्थायी रूप से रिहा किया जाना।" },
      { term: "Writ", definition: "A form of written command in the name of a court or other legal authority to act, or abstain from acting, in some way.", hindiTerm: "रिट (याचिका)", hindiDefinition: "संविधान के अनुच्छेद ३२ या २२६ के तहत मूल अधिकारों के प्रचालन के लिए अदालत द्वारा जारी एक लिखित आदेश।" },
      { term: "Adjudication", definition: "The legal process of resolving a dispute or deciding a case under judicial authorization.", hindiTerm: "न्यायनिर्णयन", hindiDefinition: "न्यायालय द्वारा विवादों का निर्णय करने और न्यायसंगत निष्कर्ष पर पहुंचने की प्रक्रिया।" },
      { term: "Decree", definition: "A formal and authoritative order that has the force of law, declaring the rights of the parties.", hindiTerm: "डिक्री (न्याप्ति)", hindiDefinition: "न्यायालय द्वारा दिया गया वह औपचारिक निर्णय जो पक्षों के अधिकारों को अंतिम रूप से संसूचित करता है।" },
      { term: "Pleadings", definition: "Written statements by the parties to a lawsuit, specifying the facts and legal claims being made.", hindiTerm: "अभिवचन", hindiDefinition: "वादपत्र या लिखित कथन जिसके माध्यम से मुकदमे के पक्षकार अपना पक्ष न्यायालय के समक्ष प्रस्तुत करते हैं।" }
    ]
  },
  HI: {
    navHome: "मुख्य पृष्ठ",
    navLegacy: "प्रतिभा व विरासत",
    navPractice: "कार्यक्षेत्र",
    navMatters: "महत्वपूर्ण मामले",
    navMentorship: "शैक्षणिक मार्गदर्शन",
    navLeadership: "मानवाधिकार",
    navContact: "चैंबर्स निर्देशिका",
    themeToggle: "थीम बटन",
    lightTheme: "शाही क्रीम",
    darkTheme: "चैंबर ब्लैक",
    heroTitle: "अधिवक्ता अरुणभ बनर्जी",
    heroTitlePrefix: "अधिवक्ता",
    supremeCourtAdvocate: "उच्चतम न्यायालय अधिवक्ता",
    jurisdictionLine: "सुप्रीम कोर्ट एवं हाई कोर्ट (समस्त न्यायालय व अधिकरण)",
    humanRightsLine: "अध्यक्ष - सी.पी.डी.आर इंडिया मानवाधिकार, दिल्ली",
    contactBtn: "परामर्श के लिए समय आरक्षित करें",
    legacyTitle: "कानूनी उत्कृष्टता की एक विरासत",
    aboutText: "श्री अरुणभ बनर्जी भारत के उच्चतम न्यायालय के एक प्रतिष्ठित और वरिष्ठ अधिवक्ता हैं, जो अपनी संजीदा अदालती उपस्थिति, परिष्कृत कानूनी रणनीति और न्याय के प्रति अपने उत्कृष्ट समर्पण के लिए पूरे देश के कानूनी समुदाय में जाने जाते हैं। आपराधिक, वैवाहिक, वाणिज्यिक, संवैधानिक और मानवाधिकार मामलों में फैले न्यायसंगत मुकदमेबाजी अनुभव और १५ वर्षों के प्रख्यात शैक्षणिक अध्यापन के साथ, वह देश के अग्रणी अधिवक्ताओं, कानूनी संरक्षकों और मानवाधिकार रक्षकों में से एक हैं।",
    practiceTitle: "सराहनीय कानूनी अभ्यास",
    practiceSub: "मुख्य संवैधानिक, दीवानी और कानूनी मामलों में उच्च-स्तरीय कानूनी परामर्श और प्रभावी प्रतिनिधित्व।",
    practiceAreas: [
      {
        id: "criminal",
        title: "आपराधिक बचाव और जमानत न्यायशास्त्र",
        description: "बड़े आर्थिक और व्हाइट-कॉलर अपराधों के मुकदमों, अग्रिम तथा नियमित जमानत याचिकाओं और कानूनी गिरफ्तारी के खिलाफ अकाट्य अदालती बचाव।"
      },
      {
        id: "pocso",
        title: "पॉक्सो मामले और संवेदनशील आपराधिक मुकदमे",
        description: "पॉक्सो (विशेष बच्चों के कानून) अधिनियम के अत्यंत गोपनीय मुकदमों का प्रभावी, न्यायसंगत और संपूर्ण निष्पक्षतापूर्ण कानूनी प्रतिनिधित्व।"
      },
      {
        id: "matrimonial",
        title: "वैवाहिक और पारिवारिक विवाद मामले",
        description: "विवाह विच्छेद (तलाक), बच्चों की कस्टडी, घरेलू हिंसा अधिनियम की अपीलों और आपसी सहमति के समझौतों का मानवीय और सटीक निपटारा।"
      },
      {
        id: "commercial",
        title: "वाणिज्यिक और कॉर्पोरेट मुकदमेबाजी",
        description: "अनुबंध विवादों, राष्ट्रीय कंपनी विधि न्यायाधिकरण (NCLT) और अपीलीय न्यायाधिकरणों के समक्ष व्यावसायिक और दिवालियापन के मुकदमों का समाधान।"
      },
      {
        id: "constitutional",
        title: "संवैधानिक और अपीलीय वकालत",
        description: "संविधान के अनुच्छेद 32 तथा 226/227 के तहत देश के उच्च न्यायालयों तथा माननीय उच्चतम न्यायालय में विशेष अनुमति याचिका (SLP) और रिट याचिकाएं।"
      },
      {
        id: "sec138",
        title: "धारा 138 परक्राम्य लिखत अधिनियम (चेक बाउंस)",
        description: "व्यावसायिक चेक अनादर (बाउंस) के मुकदमों में विधिक नोटिस भेजने, परीक्षण के दौरान जिरह करने और त्वरित धन वसूली के मुकदमों का प्रभावी संचालन।"
      },
      {
        id: "whitecollar",
        title: "व्हाइट-कॉलर और आर्थिक अपराध मामले",
        description: "प्रवर्तन निदेशालय (ED), CBI, गंभीर धोखाधड़ी जांच कार्यालय (SFIO) और आर्थिक अपराध शाखा (EOW) की जांचों और PMLA अधिनियमों के तहत कुशल बचाव।"
      },
      {
        id: "humanrights",
        title: "मानवाधिकार और नागरिक स्वतंत्रता",
        description: "सी.पी.डी.आर (CPDR) इंडिया के जरिए देशवासियों के कानूनी अधिकारों, अवैध हिरासत और नागरिक अधिकारों की बहाली के लिए निरंतर संघर्ष और सुप्रीम कोर्ट सेवाएं।"
      }
    ],
    mattersTitle: "महत्वपूर्ण ऐतिहासिक वाद",
    mattersSub: "विभिन्न उच्च एवं उच्चतम न्यायालयों में हमारे सफल व ऐतिहासिक मुकदमों की सारणी।",
    notableMatters: [
      {
        id: "m1",
        title: "धर्मेंद्र शर्मा बनाम पूजा शर्मा",
        caseNo: "वैवाहिक डिक्री संदर्भ",
        outcome: "अत्यधिक विवादित वैवाहिक मामले में वादी का प्रतिनिधित्व करते हुए; उचित कानूनी प्रक्रियाओं के बाद तलाक की डिक्री सफलतापूर्वक प्रदान कराई।"
      },
      {
        id: "m2",
        title: "यूनिक इंजीनियर्स बनाम ईईएस प्रा. लिमिटेड",
        caseNo: "दीवानी कमर्शियल दावा",
        outcome: "यूनिक इंजीनियर्स कंपनी का पक्ष रखते हुए; उनके पक्ष में पूरी तरह व्यावसायिक बकाया राशि की डिक्री सम्मानपूर्वक पारित कराई।"
      },
      {
        id: "m3",
        title: "धारा 138 NI एक्ट (चेक बाउंस मुकदमे)",
        caseNo: "महानगरीय अदालत संदर्भ",
        outcome: "चेक अनादर और उससे होने वाले व्यापारिक नुकसान के खिलाफ उत्तर भारत के कई बड़े औद्योगिक पक्षों के लिए रिकवरी डिक्री हासिल की।"
      },
      {
        id: "m4",
        title: "संवेदनशील पॉक्सो व आपराधिक जमानत अर्जी",
        caseNo: "विशेष अनुमति याचिका (सुप्रीम कोर्ट)",
        outcome: "गलत और राजनीति से प्रेरित आरोपों में फँसाए गए कई मुवक्किलों को पॉक्सो और संगीन मुकदमों में अग्रिम व नियमित जमानत दिलाने में सर्वोच्च सफलता प्राप्त की।"
      }
    ],
    mentorshipTitle: "शैक्षणिक उत्कृष्टता और शिक्षण वकालत",
    mentorshipSub: "न्यायालय के भावी अधिकारियों और समर्पित अधिवक्ताओं का निर्माण।",
    mentorshipContent: "१५ वर्षों से अधिक समय से विशिष्ट कानून विश्वविद्यालयों और विधि अकादमियों में अध्यापन करते हुए, अधिवक्ता अरुणभ बनर्जी ने सैकड़ों उभरते अधिवक्ताओं और जूनियर वकीलों को प्रशिक्षित किया है। उनका प्रमुख ध्यान संवैधानिक मूल्यों, सटीक ड्राफ्टिंग (अधियाचन प्रारूप), अदालत के नियमों और कठोर अदालती अनुशासन पर होता है।",
    leadershipTitle: "मानवाधिकार नेतृत्व एवं कार्य",
    leadershipSub: "भारतीय उपमहाद्वीप में राष्ट्रीय और अंतर्राष्ट्रीय स्तर पर न्याय और मानवीय सम्मान को सशक्त करना।",
    leadershipQuote: "न्याय केवल एक पेशा नहीं है, बल्कि संवैधानिक मूल्यों, मानवीय गरिमा और कानून के शासन के प्रति एक आजीवन प्रतिबद्धता है।",
    contactTitle: "चैंबर्स संपर्क सूची",
    contactSub: "राष्ट्रीय राजधानी दिल्ली के प्रमुख विधिक क्षेत्रों में स्थित हमारे चैंबर्स का विवरण।",
    appointmentFormTitle: "डिजिटल परामर्श बुकिंग फॉर्म",
    formName: "पूरा नाम",
    formPhone: "मोबाइल नंबर (देश के कोड सहित)",
    formEmail: "ईमेल आईडी",
    formCaseType: "मामले की श्रेणी",
    formMessage: "मामले का संक्षिप्त विवरण",
    formSubmit: "परामर्श के लिए समय बुक करें",
    formSuccessMsg: "धन्यवाद। आपकी जानकारी अधिवक्ता बनर्जी के चेंबर क्लर्क के पास सुरक्षित रूप से दर्ज कर ली गई है। हम अगले १२ घंटे में आपसे संपर्क करेंगे।",
    chamberTitle: "चैंबर्स एवं आधिकारिक कार्यालय",
    phoneLabel: "चैंबर हेल्पलाइन",
    vcardDownload: "डिजिटल बिज़नेस कार्ड डाउनलोड करें",
    vcardSuccess: "विजिटिंग कार्ड उत्पन्न हुआ! संपर्क जानकारी सिंक कर सकते हैं।",
    searchGlossaryPlaceholder: "विधिक शब्दों को खोजें (जैसे कि: bail, writ, जमानत, रिट)...",
    glossaryTitle: "विधिक शब्दावली और अनुवाद केंद्र",
    glossarySub: "आम नागरिकों के लिए अंग्रेजी और हिंदी भाषा में महत्वपूर्ण कानूनी अर्थों की आसान समझ।",
    chambers: [
      {
        name: "चैंबर (Chamber)",
        address: "632, लॉयर्स ब्लॉक, साकेत कोर्ट कॉम्प्लेक्स, नई दिल्ली 110017",
        landmark: "साकेत कोर्ट्स संस्थागत क्षेत्र",
        type: "saket"
      },
      {
        name: "कार्यालय (Office)",
        address: "एम-18, ग्राउंड फ्लोर, सी.आर. पार्क, नई दिल्ली - 110019",
        landmark: "चित्तरंजन पार्क, ग्राउंड फ्लोर",
        type: "crpark"
      },
      {
        name: "अतिरिक्त कार्यालय (Also at)",
        address: "सी-81, यूजीएफ, पंचशील एन्क्लेव, नई दिल्ली 110017",
        landmark: "आउटर रिंग रोड के पास / एस-ब्लॉक किनारा",
        type: "panchsheel"
      }
    ],
    glossary: [
      { term: "Bail", definition: "Temporary release of an accused person awaiting trial, sometimes on condition that a sum of money be lodged.", hindiTerm: "जमानत", hindiDefinition: "किसी अभियुक्त को मुकदमे के लंबित रहने तक सशर्त या प्रतिभूति पर अस्थायी रूप से रिहा किया जाना।" },
      { term: "Writ", definition: "A form of written command in the name of a court or other legal authority to act, or abstain from acting, in some way.", hindiTerm: "रिट (याचिका)", hindiDefinition: "संविधान के अनुच्छेद ३२ या २२६ के तहत मूल अधिकारों के प्रचालन के लिए अदालत द्वारा जारी एक लिखित आदेश।" },
      { term: "Adjudication", definition: "The legal process of resolving a dispute or deciding a case under judicial authorization.", hindiTerm: "न्यायनिर्णयन", hindiDefinition: "न्यायालय द्वारा विवादों का निर्णय करने और न्यायसंगत निष्कर्ष पर पहुंचने की प्रक्रिया।" },
      { term: "Decree", definition: "A formal and authoritative order that has the force of law, declaring the rights of the parties.", hindiTerm: "डिक्री (न्याप्ति)", hindiDefinition: "न्यायालय द्वारा दिया गया वह औपचारिक निर्णय जो पक्षों के अधिकारों को अंतिम रूप से संसूचित करता है।" },
      { term: "Pleadings", definition: "Written statements by the parties to a lawsuit, specifying the facts and legal claims being made.", hindiTerm: "अभिवचन", hindiDefinition: "वादपत्र या लिखित कथन जिसके माध्यम से मुकदमे के पक्षकार अपना पक्ष न्यायालय के समक्ष प्रस्तुत करते हैं।" }
    ]
  }
};
