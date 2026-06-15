/* ============================================================
   PORTFOLIO DATA LAYER
   ------------------------------------------------------------
   Every piece of text/image/color on the site lives in one
   JSON object. The admin panel edits this object and saves it
   to localStorage (key: "portfolioData"). The public site
   reads from localStorage if data exists, otherwise falls back
   to DEFAULT_DATA below.

   To move your edited data to another browser / after hosting:
   Admin Panel -> Export / Import tab -> Download JSON, then
   on the new device use "Import" to load it back in.
   ============================================================ */

const STORAGE_KEY = "portfolioData";
const AUTH_KEY = "portfolioAdminPassword";
const DEFAULT_PASSWORD = "admin123";

const DEFAULT_DATA = {
  meta: {
    siteTitle: "Your Name — Portfolio",
    browserTag: "YN",          // short text shown in browser tab favicon
    loaderText: "booting up..."
  },

  theme: {
    primary: "#7C3AED",   // violet — main accent
    cyan:    "#22D3EE",   // electric cyan — secondary accent
    pink:    "#F472B6",   // signal pink — tertiary accent
    amber:   "#FBBF24",   // amber — highlight / warning glow
    bg:      "#10112a"    // base background (deep indigo)
  },

  nav: {
    logoText: "YN"
  },

  hero: {
    eyebrow: "Hello, my name is",
    name: "Your Name",
    role: "Mechatronics Engineer & Web Developer",
    tagline: "I design circuits, build apps, and turn ideas into working products — from PCB traces to production code.",
    ctaPrimaryText: "View Projects",
    ctaPrimaryLink: "#projects",
    ctaSecondaryText: "Get In Touch",
    ctaSecondaryLink: "#contact",
    profileImage: "",
    resumeUrl: "",
    socials: [
      { platform: "github", label: "GitHub", url: "https://github.com/" },
      { platform: "linkedin", label: "LinkedIn", url: "https://linkedin.com/" },
      { platform: "email", label: "Email", url: "mailto:you@example.com" }
    ]
  },

  about: {
    heading: "About Me",
    eyebrow: "01 // Who I Am",
    paragraphs: [
      "I'm a Mechatronics & Computer Science student who loves the space where hardware meets software — wiring up sensors one day, writing React components the next.",
      "Currently building practical, real-world projects: mobile apps, automation tools, and small electronics builds — always learning, always shipping something new."
    ],
    image: "",
    stats: [
      { value: "3+", label: "Years Learning" },
      { value: "10+", label: "Projects Built" },
      { value: "5", label: "Tech Stacks" },
      { value: "100%", label: "Curiosity" }
    ]
  },

  skills: [
    {
      category: "Programming & Web",
      items: [
        { name: "JavaScript", level: 80 },
        { name: "React", level: 70 },
        { name: "HTML / CSS", level: 90 },
        { name: "Python", level: 65 }
      ]
    },
    {
      category: "Mobile & Apps",
      items: [
        { name: "Flutter", level: 60 },
        { name: "Firebase", level: 55 },
        { name: "Android Basics", level: 60 }
      ]
    },
    {
      category: "Electronics & Hardware",
      items: [
        { name: "PCB Design", level: 65 },
        { name: "Sensors & Transducers", level: 70 },
        { name: "Arduino / Microcontrollers", level: 60 },
        { name: "CNC Technology", level: 55 }
      ]
    }
  ],

  projects: [
    {
      title: "AI Language Learning App",
      description: "A Flutter mobile app for practicing a new language with voice exercises, gamified lessons and an AI conversation partner powered by the Gemini API.",
      image: "",
      tags: ["Flutter", "Firebase", "Gemini API"],
      demoUrl: "",
      codeUrl: ""
    },
    {
      title: "Passport Photo Maker",
      description: "A browser-based tool that detects faces and automatically crops and formats passport-size photos, with real-time background and size adjustment.",
      image: "",
      tags: ["JavaScript", "face-api.js", "Canvas"],
      demoUrl: "",
      codeUrl: ""
    },
    {
      title: "AI Telegram Teaching Bot",
      description: "A Telegram bot that teaches computer skills in Bengali using the OpenAI API, deployed on Railway with automated responses for common questions.",
      image: "",
      tags: ["Python", "Telegram Bot", "OpenAI API"],
      demoUrl: "",
      codeUrl: ""
    }
  ],

  experience: [
    {
      role: "Apprentice / Trainee",
      org: "Tata Motors — NTTF L&E Programme",
      duration: "Present",
      description: "Hands-on training in CNC Technology, Industrial Electrical systems, Sensors & Transducers, and PCB Design as part of the Diploma in Mechatronics."
    }
  ],

  education: [
    {
      degree: "Diploma in Mechatronics (Semester 3)",
      institution: "NTTF – Tata Motors L&E Programme",
      duration: "Ongoing",
      description: "Core subjects: CNC Technology, Material Technology, Sensors & Transducers, Industrial Electrical, PCB Design."
    }
  ],

  services: [
    {
      icon: "code",
      title: "Web Development",
      description: "Building responsive websites and web apps with modern HTML, CSS, JavaScript and React."
    },
    {
      icon: "smartphone",
      title: "App Development",
      description: "Creating cross-platform mobile apps using Flutter, integrated with Firebase and AI APIs."
    },
    {
      icon: "cpu",
      title: "Electronics & PCB",
      description: "Designing circuits, working with sensors/microcontrollers, and PCB layout for small projects."
    }
  ],

  contact: {
    heading: "Get In Touch",
    eyebrow: "05 // Let's Connect",
    description: "Have a project in mind, an opportunity, or just want to talk tech? My inbox is always open.",
    email: "you@example.com",
    phone: "+91 00000 00000",
    location: "India",
    socials: [
      { platform: "github", label: "GitHub", url: "https://github.com/" },
      { platform: "linkedin", label: "LinkedIn", url: "https://linkedin.com/" },
      { platform: "youtube", label: "YouTube", url: "https://youtube.com/" },
      { platform: "instagram", label: "Instagram", url: "https://instagram.com/" }
    ]
  },

  footer: {
    text: "Designed & built with circuits and code."
  }
};

/* ---------- helper functions (shared) ---------- */

function loadPortfolioData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return JSON.parse(JSON.stringify(DEFAULT_DATA));
    const parsed = JSON.parse(raw);
    // shallow-merge so new default fields (after updates) don't break old saved data
    return deepMerge(JSON.parse(JSON.stringify(DEFAULT_DATA)), parsed);
  } catch (e) {
    console.error("Failed to load portfolio data, using defaults.", e);
    return JSON.parse(JSON.stringify(DEFAULT_DATA));
  }
}

function savePortfolioData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function resetPortfolioData() {
  localStorage.removeItem(STORAGE_KEY);
}

function deepMerge(base, override) {
  if (Array.isArray(override)) return override;
  if (typeof override !== "object" || override === null) return override;
  const result = { ...base };
  for (const key of Object.keys(override)) {
    if (
      typeof base[key] === "object" &&
      base[key] !== null &&
      !Array.isArray(base[key]) &&
      typeof override[key] === "object" &&
      override[key] !== null &&
      !Array.isArray(override[key])
    ) {
      result[key] = deepMerge(base[key], override[key]);
    } else {
      result[key] = override[key];
    }
  }
  return result;
}

function getAdminPassword() {
  return localStorage.getItem(AUTH_KEY) || DEFAULT_PASSWORD;
}

function setAdminPassword(pw) {
  localStorage.setItem(AUTH_KEY, pw);
}
