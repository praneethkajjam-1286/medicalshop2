/* =========================================================
   EMERAVITA – Service Details Page Scripts (servicedetail.js)
   One reusable page, six service views.
   1. Reads ?service=<id> with URLSearchParams
   2. Finds the matching entry in SERVICES
   3. Renders ONLY that service (title, breadcrumb, hero, about,
      benefits, pricing, FAQs, CTA, <title> and meta description)
   4. Unknown / missing id  ->  "Service Not Found" view
   Shared header/footer behaviour uses the same localStorage keys
   as Home 1 ("careplus-theme", "zenora-dir"). No dependency on script.js.

   Pricing note: only figures that already exist elsewhere in this
   project are used (delivery charges from delivery.html and plan
   prices from membership.html). Product prices are shown as
   "Price varies by product" and anything else as "Contact for Pricing".
   ========================================================= */

/* =========================================================
   UNIQUE IMAGES – one hero + one about image per service
   Source: Unsplash (Unsplash License: free for commercial use,
   no attribution required). 12 photos, each used ONCE.
   None of these appear on services.html or any other page –
   keep it that way when adding images elsewhere.
   To use your own photos later, replace a URL with a local
   path such as "assets/images/sd-rx-hero.jpg".
   ========================================================= */
const U = (id, w = 1400) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=80`;

const SERVICE_IMAGES = {
  "prescription-medicines": {
    hero:  { src: U("1587854692152-cbe660dbde88", 1800), alt: "Prescription tablets and capsules ready to be dispensed" },
    about: { src: "assets/images/services/prescription-medicines.png", alt: "Pharmacist checking a medicine bottle on a pharmacy shelf" }
  },
  "otc-medicines": {
    hero:  { src: U("1584308666744-24d5c474f2ae", 1800), alt: "Everyday over-the-counter medicines" },
    about: { src: U("1471864190281-a93a3070b6de"),       alt: "Tablets held in an open hand" }
  },
  "vitamins-supplements": {
    hero:  { src: U("1607619056574-7b8d3ee536b2", 1800), alt: "Daily vitamin and supplement capsules" },
    about: { src: U("1550572017-edd951b55104"),          alt: "Supplement bottles and capsules on a table" }
  },
  "personal-care": {
    hero:  { src: U("1556228578-8c89e6adf883", 1800),    alt: "Skincare and personal care bottles" },
    about: { src: U("1620916566398-39f1143ab7be"),       alt: "Gentle skincare serum for sensitive skin" }
  },
  "medical-devices": {
    hero:  { src: U("1505751172876-fa1923c5c528", 1800), alt: "Stethoscope and health monitoring equipment" },
    about: { src: U("1559757148-5c350d0d3c56"),          alt: "Medical equipment used for health checks" }
  },
  "health-consultation": {
    hero:  { src: U("1576091160550-2173dba999ef", 1800), alt: "Healthcare professional reviewing patient information" },
    about: { src: U("1622253692010-333f2da6031d"),       alt: "Health professional ready to give guidance" }
  }
};

/* Duplicate guard – open the browser console (F12) to see a warning
   if the same photo is ever used twice in SERVICE_IMAGES. */
(() => {
  const seen = new Map();
  Object.entries(SERVICE_IMAGES).forEach(([key, pics]) => {
    ["hero", "about"].forEach((slot) => {
      const base = pics[slot].src.split("?")[0];
      if (seen.has(base)) console.warn(`[Emeravita] Duplicate image: ${key}.${slot} is the same as ${seen.get(base)}`);
      else seen.set(base, `${key}.${slot}`);
    });
  });
})();

/* Shared pricing facts taken from the existing pages */
const DELIVERY_PLAN = {
  name: "Home Delivery",
  price: "Free",
  unit: "on orders above ₹499",
  desc: "Same-day delivery is ₹29 on orders below ₹499. Express 2-hour delivery costs ₹49 below ₹499, ₹39 from ₹499–₹999 and is free above ₹999.",
  cta: { label: "Delivery Details", href: "delivery.html" }
};

const SERVICES = {
  /* ---------------------------------------------------------- */
  "prescription-medicines": {
    title: "Prescription Medicines",
    crumb: "Prescription Medicines",
    badge: "Rx Care",
    icon: "sd-shield",
    hero: {
      text: "Send us your doctor's prescription and our pharmacists check it, dispense the exact medicines and deliver them sealed to your door.",
      cta: { label: "Upload Prescription", href: "contact.html#prescription" },
      facts: ["Every prescription verified by a pharmacist", "Sealed, tamper-proof packing", "Cold-chain care for insulin and other temperature-sensitive medicines", "Refill reminders so you don't run out"]
    },
    about: {
      title: "Your prescription, handled with care",
      intro: "Prescription medicines must be dispensed exactly as your doctor intended. That's why a pharmacist reviews every order before it leaves our store.",
      desc: "Upload a clear photo of a valid prescription with your order or through our prescription enquiry form. We check the doctor's details, the medicine name, strength and quantity, and look for any obvious interactions with medicines you've told us you take. If anything is unclear, we call you or your doctor before dispensing.",
      stat: { num: "2 hrs", label: "Express delivery available for urgent refills" },
      features: ["Prescription and dosage check by a pharmacist", "Batch number and expiry printed on your bill", "Cold-chain packing for refrigerated medicines", "Original prescription collected at delivery where the law requires it"],
      expect: [
        { t: "Upload your prescription", d: "Add a photo at checkout or use the enquiry form." },
        { t: "Pharmacist verification", d: "We review it and call you if anything needs confirming." },
        { t: "Sealed delivery", d: "Your medicines arrive packed, labelled and sealed." }
      ],
      benefits: ["No queue at the counter", "Accurate dispensing", "Timely refills"]
    },
    why: {
      title: "Why fill your prescriptions with Emeravita",
      sub: "Careful checks, clear labelling and dependable delivery for the medicines you rely on every day.",
      items: [
        { icon: "sd-shield", t: "Checked, then dispensed", d: "A pharmacist reviews each prescription before any medicine is packed." },
        { icon: "sd-snow", t: "Cold-chain handling", d: "Insulin and other refrigerated items travel in insulated packs." },
        { icon: "sd-refresh", t: "Refill reminders", d: "We remind you before a long-term medicine runs out." },
        { icon: "sd-book", t: "Clear instructions", d: "Dosage and timing are written on the pack in plain language." }
      ]
    },
    pricing: {
      title: "What you pay for prescriptions",
      note: "You pay the printed price of the medicines on your prescription, plus delivery if it applies. Members save on every order.",
      plans: [
        { name: "Prescription Medicines", price: "Price varies by product", unit: "", desc: "Each medicine is charged at its printed MRP. You see the full bill before you confirm.", includes: ["Pharmacist verification", "Sealed, tamper-proof packing", "Itemised bill with batch and expiry"], cta: { label: "Upload Prescription", href: "contact.html#prescription" } },
        { ...DELIVERY_PLAN, includes: ["Same-day delivery if ordered before 6 PM", "Cold-chain items delivered free", "OTP-secured handover"] },
        { name: "Member Savings", price: "5–20%", unit: "off medicines", featured: true, tag: "Best value", desc: "Join an Emeravita membership to save on every refill. Plans start at ₹0/month.", includes: ["Basic ₹0/month: 5% off", "Emeravita ₹149/month: 15% off", "Family ₹299/month: 20% off for up to 5 members"], cta: { label: "Compare Plans", href: "membership.html" } }
      ],
      foot: "Medicine prices follow the MRP printed on each pack. Final totals are confirmed at checkout."
    },
    faqs: [
      { q: "What makes a prescription valid?", a: "It should show the doctor's name, registration number and signature, the patient's name, the date, and each medicine's name, strength and dosage. A clear photo of the original is enough to start your order." },
      { q: "Can I order without uploading a prescription?", a: "Not for prescription-only medicines. We can't dispense them without a valid prescription, but over-the-counter products can be ordered without one." },
      { q: "What if a medicine is out of stock?", a: "We'll call you before dispatch. With your consent and where your prescription allows it, we can offer the same medicine from another manufacturer, or deliver it separately once it's back in stock." },
      { q: "Do you deliver refrigerated medicines?", a: "Yes. Insulin, some vaccines and other temperature-sensitive items are packed in insulated bags with gel packs and are delivered free." },
      { q: "Can someone else receive my order?", a: "Yes. Share the delivery OTP with the person receiving it. For some medicines we may need to collect the original prescription at the door." }
    ],
    cta: { icon: "sd-box", title: "Ready to send your prescription?", text: "Upload it in a minute and our pharmacists take it from there.", label: "Upload Prescription", href: "contact.html#prescription" }
  },

  /* ---------------------------------------------------------- */
  "otc-medicines": {
    title: "OTC Medicines & Healthcare",
    crumb: "OTC Medicines",
    badge: "Everyday Care",
    icon: "sd-heart",
    hero: {
      text: "Everyday medicines for pain, fever, colds, allergies, digestion and minor injuries, available without a prescription and delivered fast.",
      cta: { label: "Shop OTC Medicines", href: "products.html" },
      facts: ["No prescription needed", "Genuine, in-date stock only", "Pharmacist guidance on how to use each product", "Express 2-hour delivery in city limits"]
    },
    about: {
      title: "The home medicine cabinet, sorted",
      intro: "Over-the-counter (OTC) medicines treat common, short-term problems. Choosing the right one, and using it correctly, still matters.",
      desc: "We stock trusted OTC brands for pain and fever, cough and cold, allergies, acidity and digestion, plus first-aid supplies such as antiseptics, bandages and ORS. Our pharmacists can explain how a product is used, how often, and when symptoms mean you should see a doctor instead.",
      stat: { num: "₹499+", label: "Orders ship free with same-day delivery" },
      features: ["Pain, fever, cough, cold and allergy relief", "Antacids, ORS and digestive care", "First-aid kits, antiseptics and dressings", "Label-reading and usage help from a pharmacist"],
      expect: [
        { t: "Pick your products", d: "Browse by need or ask a pharmacist for help." },
        { t: "Quick check", d: "We flag products that may not suit you, based on what you've told us." },
        { t: "Fast delivery", d: "Choose same-day or Express 2-hour delivery." }
      ],
      benefits: ["Relief without the wait", "Trusted brands", "Safe-use advice"]
    },
    why: {
      title: "Why buy everyday medicines from us",
      sub: "The convenience of online ordering, with a pharmacist on hand to make sure you choose wisely.",
      items: [
        { icon: "sd-clock", t: "Express when it matters", d: "Feeling unwell? Express delivery reaches you in about 2 hours, 7 AM – 9 PM." },
        { icon: "sd-shield", t: "Genuine stock", d: "Sourced from authorised distributors and checked for expiry before dispatch." },
        { icon: "sd-chat", t: "Ask before you buy", d: "Not sure which cough syrup or antacid to pick? Ask our pharmacists." },
        { icon: "sd-box", t: "First-aid ready", d: "Build a home first-aid kit with antiseptics, dressings and ORS." }
      ]
    },
    pricing: {
      title: "Simple pricing for everyday care",
      note: "OTC products are charged at their printed price. Delivery depends on your order value and speed.",
      plans: [
        { name: "OTC Products", price: "Price varies by product", unit: "", desc: "Every pack is billed at its printed MRP, with no hidden charges.", includes: ["Pain, cold, allergy and digestive care", "First-aid and wound care", "Usage guidance from a pharmacist"], cta: { label: "Shop Products", href: "products.html" } },
        { name: "Express Delivery", price: "₹49", unit: "below ₹499", featured: true, tag: "Fastest", desc: "Delivery in about 2 hours, 7 AM – 9 PM inside city limits.", includes: ["₹39 for orders of ₹499–₹999", "Free for orders above ₹999", "Free for Emeravita & Family members"], cta: { label: "Delivery Details", href: "delivery.html" } },
        { name: "Same-Day Delivery", price: "Free", unit: "on orders above ₹499", desc: "Order before 6 PM and receive it the same evening. ₹29 for orders below ₹499.", includes: ["Delivery before 10 PM", "Contactless option", "OTP-secured handover"], cta: { label: "Check Your Pincode", href: "delivery.html" } }
      ],
      foot: "Express delivery is available inside city limits only. Charges are shown at checkout before you pay."
    },
    faqs: [
      { q: "Are OTC medicines safe to take without a doctor?", a: "They are meant for short-term, common problems when used as directed on the label. If symptoms are severe, last more than a few days or keep coming back, please see a doctor." },
      { q: "Can I take an OTC medicine with my regular prescriptions?", a: "Some combinations aren't suitable. Tell our pharmacist what you already take and they'll let you know if a product may interact." },
      { q: "Are these medicines suitable for children?", a: "Many products have separate children's versions and doses are based on age or weight. Always follow the label, and ask a pharmacist or your child's doctor if you're unsure." },
      { q: "How quickly can I get OTC medicines?", a: "Express delivery reaches most addresses in city limits in about 2 hours between 7 AM and 9 PM. Same-day delivery is available if you order before 6 PM." },
      { q: "Can I return an OTC product?", a: "Unopened products supplied incorrectly or damaged in transit can be replaced or refunded if reported within 48 hours. For safety reasons, opened medicines can't be returned." }
    ],
    cta: { icon: "sd-heart", title: "Feeling under the weather?", text: "Get everyday relief delivered fast, with a pharmacist a call away if you need advice.", label: "Shop OTC Medicines", href: "products.html" }
  },

  /* ---------------------------------------------------------- */
  "vitamins-supplements": {
    title: "Vitamins & Supplements",
    crumb: "Vitamins & Supplements",
    badge: "Nutrition",
    icon: "sd-leaf",
    hero: {
      text: "Multivitamins, minerals, omega-3, protein and herbal supplements from trusted brands, with honest guidance on what may suit you.",
      cta: { label: "Shop Vitamins", href: "products.html" },
      facts: ["Trusted, well-known brands", "Interaction check with your current medicines", "Refill reminders for daily supplements", "Member discounts on every order"]
    },
    about: {
      title: "Support your diet, the sensible way",
      intro: "Supplements can help fill gaps in your diet, but they work alongside healthy food and sleep, not instead of them.",
      desc: "Our range covers daily multivitamins, vitamin D and B12, calcium, iron, omega-3, protein and herbal products. A pharmacist can help you compare options and check whether a supplement may interact with medicines you already take. If you have a medical condition, are pregnant or take regular prescriptions, we'll suggest checking with your doctor first.",
      stat: { num: "5–20%", label: "Member savings on supplements" },
      features: ["Multivitamins, vitamin D, B12, calcium and iron", "Omega-3, protein and sports nutrition", "Herbal and Ayurvedic ranges", "Side-by-side help comparing brands"],
      expect: [
        { t: "Tell us your goal", d: "General wellness, energy, bones or a gap in your diet." },
        { t: "Compare and check", d: "We help compare options and check for interactions." },
        { t: "Refill on time", d: "Set a reminder so your routine never breaks." }
      ],
      benefits: ["Trusted brands", "Interaction checks", "Routine reminders"]
    },
    why: {
      title: "Why choose your supplements with us",
      sub: "Clear, balanced advice in a crowded aisle, with no pressure to buy more than you need.",
      items: [
        { icon: "sd-shield", t: "Trusted brands only", d: "We stock well-known brands from authorised distributors." },
        { icon: "sd-search", t: "Interaction checks", d: "Some supplements affect how medicines work. We check before you buy." },
        { icon: "sd-refresh", t: "Never miss a refill", d: "Reminders help you keep a daily routine going." },
        { icon: "sd-tag", t: "Member savings", d: "Save 5–20% on supplements with an Emeravita membership." }
      ]
    },
    pricing: {
      title: "Supplement pricing",
      note: "Supplements are billed at their printed price. Membership discounts apply automatically at checkout.",
      plans: [
        { name: "Vitamins & Supplements", price: "Price varies by product", unit: "", desc: "Prices depend on brand, strength and pack size and are shown on each product.", includes: ["Multivitamins and minerals", "Omega-3, protein and herbal ranges", "Help comparing brands"], cta: { label: "Shop Vitamins", href: "products.html" } },
        { name: "Basic Membership", price: "₹0", unit: "/month", desc: "A free plan for anyone who buys supplements regularly.", includes: ["5% off on medicines", "Free delivery above ₹499", "Refill reminders"], cta: { label: "Join for Free", href: "membership.html" } },
        { name: "Emeravita Membership", price: "₹149", unit: "/month", featured: true, tag: "Most popular", desc: "More savings, plus a monthly pharmacist consult to review your routine.", includes: ["15% off on medicines", "Unlimited free delivery", "Monthly pharmacist consult"], cta: { label: "Compare Plans", href: "membership.html" } }
      ],
      foot: "Discounts follow the terms of each membership plan shown on the Membership page."
    },
    faqs: [
      { q: "Do I need a supplement if I eat a balanced diet?", a: "Many people get what they need from food. Supplements may help when there's a specific gap, such as low vitamin D or B12, which a doctor can confirm with a test." },
      { q: "Can supplements interact with my medicines?", a: "Yes, some can. For example, certain minerals and herbal products affect how some medicines are absorbed. Tell our pharmacist what you take so we can check." },
      { q: "Are herbal supplements safe for everyone?", a: "Not always. Herbal products can still have side effects and interactions. If you're pregnant, breastfeeding, or managing a health condition, talk to your doctor before starting one." },
      { q: "How should I store supplements?", a: "Keep them in a cool, dry place away from direct sunlight, in the original container, and out of children's reach. Some probiotics need refrigeration, so check the label." },
      { q: "Can I set up regular refills?", a: "Yes. Members get refill reminders so you can reorder before you run out." }
    ],
    cta: { icon: "sd-leaf", title: "Build a routine that suits you", text: "Ask a pharmacist to help compare supplements and check them against what you already take.", label: "Ask a Pharmacist", href: "contact.html" }
  },

  /* ---------------------------------------------------------- */
  "personal-care": {
    title: "Personal Care & Wellness",
    crumb: "Personal Care",
    badge: "Self-Care",
    icon: "sd-drop",
    hero: {
      text: "Skincare, hair and oral care, hygiene, baby and mother care, all chosen with sensitive skin and everyday routines in mind.",
      cta: { label: "Shop Personal Care", href: "products.html" },
      facts: ["Gentle and sensitive-skin ranges", "Baby and mother care essentials", "Oral care and hygiene basics", "Discreet packaging on every order"]
    },
    about: {
      title: "Everyday care, gently done",
      intro: "Good personal care is about consistency and choosing products that suit your skin, not about having the most products.",
      desc: "We stock cleansers, moisturisers and sunscreens, including fragrance-free and sensitive-skin options, along with hair care, oral care, feminine hygiene, adult and baby care. Our pharmacists can help you read ingredient lists and suggest simple routines. For persistent skin problems such as rashes, acne or eczema flare-ups, we'll recommend seeing a dermatologist.",
      stat: { num: "48 hrs", label: "To report a damaged or wrong item for replacement" },
      features: ["Fragrance-free and sensitive-skin options", "Sunscreens, cleansers and moisturisers", "Baby care: wipes, rash creams and bath essentials", "Oral care and feminine hygiene products"],
      expect: [
        { t: "Share your skin type", d: "Dry, oily, sensitive or combination." },
        { t: "Get a simple routine", d: "We suggest a few products that work well together." },
        { t: "Discreet delivery", d: "Orders arrive in plain, sealed packaging." }
      ],
      benefits: ["Skin-friendly picks", "Simple routines", "Discreet packaging"]
    },
    why: {
      title: "Why shop personal care at a pharmacy",
      sub: "The same everyday products, chosen with a healthcare eye on ingredients and sensitive skin.",
      items: [
        { icon: "sd-drop", t: "Sensitive-skin focus", d: "Plenty of fragrance-free and gentle options for reactive skin." },
        { icon: "sd-baby", t: "Baby & mother care", d: "Mild essentials for newborns and new mothers in one place." },
        { icon: "sd-book", t: "Ingredient help", d: "We'll help you read labels and avoid ingredients you react to." },
        { icon: "sd-box", t: "Discreet packaging", d: "Every order arrives in plain, sealed packaging." }
      ]
    },
    pricing: {
      title: "Personal care pricing",
      note: "Products are billed at their printed price, with free same-day delivery on larger orders.",
      plans: [
        { name: "Personal Care Products", price: "Price varies by product", unit: "", desc: "Prices depend on brand and pack size and are shown on each product.", includes: ["Skin, hair and oral care", "Baby and mother care", "Hygiene essentials"], cta: { label: "Shop Personal Care", href: "products.html" } },
        { ...DELIVERY_PLAN, includes: ["Same-day if ordered before 6 PM", "Plain, sealed packaging", "Contactless delivery option"] },
        { name: "Family Membership", price: "₹299", unit: "/month", featured: true, tag: "For families", desc: "One plan that covers the whole household's everyday orders.", includes: ["20% off for up to 5 members", "Unlimited free delivery", "Unlimited pharmacist consultations"], cta: { label: "Compare Plans", href: "membership.html" } }
      ],
      foot: "Membership benefits follow the terms shown on the Membership page."
    },
    faqs: [
      { q: "Which products suit sensitive skin?", a: "Look for fragrance-free, alcohol-free products with short ingredient lists. Patch-test anything new on a small area for a day or two before using it widely." },
      { q: "Can you recommend a routine for my skin type?", a: "Yes, our pharmacists can suggest a simple cleanse, moisturise and sun-protect routine. For ongoing skin conditions, please see a dermatologist." },
      { q: "Are baby care products safe for newborns?", a: "We stock products made for babies' skin. Always check the age guidance on the label and talk to your paediatrician about any rash or reaction." },
      { q: "Can I return a cosmetic product?", a: "For hygiene reasons, opened personal care products can't be returned. Unopened items that arrive damaged or wrong can be replaced if reported within 48 hours." },
      { q: "Is my order packed discreetly?", a: "Yes. Every order is delivered in plain, sealed packaging with no product names visible outside." }
    ],
    cta: { icon: "sd-drop", title: "Find products that suit your skin", text: "Tell us your skin type and concerns and we'll suggest a simple, gentle routine.", label: "Shop Personal Care", href: "products.html" }
  },

  /* ---------------------------------------------------------- */
  "medical-devices": {
    title: "Medical Devices & Equipment",
    crumb: "Medical Devices",
    badge: "Home Monitoring",
    icon: "sd-pulse",
    hero: {
      text: "Blood pressure monitors, glucometers, thermometers, pulse oximeters, nebulisers and mobility aids, with help setting them up at home.",
      cta: { label: "Shop Health Devices", href: "products.html" },
      facts: ["Manufacturer warranty on every device", "How-to-use walkthrough on request", "Test strips, lancets and refills in stock", "Help choosing the right model"]
    },
    about: {
      title: "Monitor your health with confidence",
      intro: "A home device is only useful if it's accurate and you know how to use it. We help with both.",
      desc: "We stock home monitoring devices from established brands, including automatic BP monitors, glucometers with matching strips, digital thermometers, pulse oximeters and nebulisers, plus walking aids and supports. Our team can show you how to take a reading correctly and how often to check. Home readings support your doctor's care but don't replace a professional diagnosis.",
      stat: { num: "1:1", label: "How-to-use walkthrough with your device" },
      features: ["Automatic BP monitors and glucometers", "Thermometers, pulse oximeters and nebulisers", "Walking aids, supports and braces", "Matching test strips, lancets and spares"],
      expect: [
        { t: "Choose a device", d: "We help match a model to your needs and budget." },
        { t: "Learn to use it", d: "Get a walkthrough on setup and taking accurate readings." },
        { t: "Keep it supplied", d: "Reorder strips, lancets and spares whenever you need them." }
      ],
      benefits: ["Accurate home readings", "Warranty support", "Easy refills"]
    },
    why: {
      title: "Why buy health devices from Emeravita",
      sub: "Reliable devices, a proper walkthrough, and the consumables you'll need later.",
      items: [
        { icon: "sd-shield", t: "Warranty support", d: "Devices come with the manufacturer's warranty. We help you make a claim if needed." },
        { icon: "sd-user", t: "Setup walkthrough", d: "We'll show you how to fit a BP cuff or use a glucometer correctly." },
        { icon: "sd-refresh", t: "Strips & spares", d: "Matching test strips, lancets and masks are stocked for reorder." },
        { icon: "sd-pulse", t: "Model guidance", d: "We help you compare features so you buy what you'll actually use." }
      ]
    },
    pricing: {
      title: "Device pricing",
      note: "Device prices depend on the brand and model. For clinic or bulk orders, contact us for a quote.",
      plans: [
        { name: "Home Health Devices", price: "Price varies by model", unit: "", desc: "Each device is billed at its printed price and includes the manufacturer's warranty.", includes: ["BP monitors, glucometers and thermometers", "Pulse oximeters and nebulisers", "Setup walkthrough on request"], cta: { label: "Shop Devices", href: "products.html" } },
        { name: "Strips & Consumables", price: "Price varies by brand", unit: "", featured: true, tag: "Reorder easily", desc: "Consumables matched to the device you own.", includes: ["Glucometer strips and lancets", "Nebuliser masks and spares", "Refill reminders for members"], cta: { label: "Shop Consumables", href: "products.html" } },
        { name: "Clinic & Bulk Orders", price: "Contact for Pricing", unit: "", desc: "For clinics, care homes and offices that need several devices.", includes: ["Quotes for multiple units", "Help choosing suitable models", "Scheduled delivery"], cta: { label: "Request a Quote", href: "contact.html" } }
      ],
      foot: "Warranty terms are set by each device manufacturer and are listed with the product."
    },
    faqs: [
      { q: "Which BP monitor should I buy?", a: "For most people, an automatic upper-arm monitor with the right cuff size gives the most reliable readings at home. We can help you check your cuff size." },
      { q: "Will you show me how to use my device?", a: "Yes. Ask for a walkthrough when you order or visit a store, and we'll explain setup and how to take accurate readings." },
      { q: "Do I need a specific brand of test strips?", a: "Yes. Glucometer strips are made for specific meters, so always buy strips that match your meter model." },
      { q: "What if my device stops working?", a: "Devices are covered by the manufacturer's warranty. Keep your bill, and contact us. We'll help you with the warranty claim." },
      { q: "Can a home device diagnose a condition?", a: "No. Home readings help you and your doctor track your health, but diagnosis and treatment decisions should come from your doctor." }
    ],
    cta: { icon: "sd-pulse", title: "Not sure which device you need?", text: "Tell us what you want to monitor and we'll help you choose a reliable model.", label: "Get Device Advice", href: "contact.html" }
  },

  /* ---------------------------------------------------------- */
  "health-consultation": {
    title: "Health Consultation & Guidance",
    crumb: "Health Consultation",
    badge: "Guidance",
    icon: "sd-chat",
    hero: {
      text: "Speak with an Emeravita pharmacist about your medicines, side effects, timing and everyday health questions, by phone or chat.",
      cta: { label: "Book a Consultation", href: "contact.html" },
      facts: ["Medicine reviews and timing advice", "Side-effect and interaction questions", "Phone or chat, 7 days a week", "Included in Emeravita and Family plans"]
    },
    about: {
      title: "Clear answers about your medicines",
      intro: "Taking several medicines can be confusing. A short conversation with a pharmacist can make your routine simpler and safer.",
      desc: "Our pharmacists can review the medicines and supplements you take, explain what each one is for, suggest a schedule that fits your day and answer questions about side effects or missed doses. We'll tell you clearly when something needs your doctor's attention. Pharmacist guidance supports, and does not replace, care from your doctor.",
      stat: { num: "₹149", label: "Emeravita: one pharmacist consult every month" },
      features: ["Full medicine and supplement review", "Help with timing and missed doses", "Side-effect and interaction questions", "A written summary you can share with your doctor"],
      expect: [
        { t: "Book a slot", d: "Choose phone or chat at a time that suits you." },
        { t: "Talk it through", d: "Share your medicine list and questions with a pharmacist." },
        { t: "Get a summary", d: "Receive simple notes you can keep or show your doctor." }
      ],
      benefits: ["Simpler routines", "Fewer mix-ups", "Peace of mind"]
    },
    why: {
      title: "Why talk to an Emeravita pharmacist",
      sub: "Practical, judgement-free guidance from people who know medicines inside out.",
      items: [
        { icon: "sd-user", t: "Pharmacist-led", d: "Your questions are answered by a pharmacist, not a script." },
        { icon: "sd-clock", t: "Fits your day", d: "Phone or chat, 7 days a week, without a clinic visit." },
        { icon: "sd-book", t: "Plain language", d: "We explain what each medicine does and how to take it." },
        { icon: "sd-heart", t: "Knows when to refer", d: "We'll tell you clearly when you should see your doctor." }
      ]
    },
    pricing: {
      title: "Consultation plans",
      note: "Pharmacist consultations are included in our paid membership plans. For one-off consultations, please contact us.",
      plans: [
        { name: "One-off Consultation", price: "Contact for Pricing", unit: "", desc: "A single consultation for non-members, by phone or chat.", includes: ["Medicine and supplement review", "Timing and missed-dose advice", "Written summary"], cta: { label: "Contact Us", href: "contact.html" } },
        { name: "Emeravita", price: "₹149", unit: "/month", featured: true, tag: "Most popular", desc: "One pharmacist consultation every month, plus member savings.", includes: ["1 pharmacist consult / month", "15% off on medicines", "Unlimited free delivery"], cta: { label: "Choose Emeravita", href: "membership.html" } },
        { name: "Family", price: "₹299", unit: "/month", desc: "Unlimited consultations for up to 5 family members.", includes: ["Unlimited pharmacist consultations", "20% off for up to 5 members", "Free yearly health check"], cta: { label: "Choose Family", href: "membership.html" } }
      ],
      foot: "The free Basic plan does not include pharmacist consultations. Plan details are on the Membership page."
    },
    faqs: [
      { q: "What can I ask a pharmacist?", a: "Anything about your medicines: what they're for, how and when to take them, side effects, missed doses, interactions with other medicines or supplements, and how to store them." },
      { q: "Can a pharmacist diagnose my condition?", a: "No. Pharmacists don't diagnose conditions or replace your doctor. If your symptoms need medical assessment, we'll advise you to see a doctor." },
      { q: "How do I book a consultation?", a: "Use our contact page to request a slot by phone or chat. Emeravita and Family members can book directly through their membership." },
      { q: "Should I have my medicines with me?", a: "Yes, it helps to have your medicine packs or a list with names and strengths, plus any recent prescriptions." },
      { q: "Is my information kept private?", a: "Yes. What you share is used only to advise you and is handled in line with our Privacy Policy." }
    ],
    cta: { icon: "sd-chat", title: "Have a question about your medicines?", text: "Book a phone or chat consultation with an Emeravita pharmacist.", label: "Book a Consultation", href: "contact.html" }
  }
};

/* =========================================================
   PAGE SCRIPT
   ========================================================= */
document.addEventListener("DOMContentLoaded", () => {
  const html = document.documentElement;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Saved theme + direction (same keys as the other pages) ---------- */
  const store = {
    get: (k) => { try { return localStorage.getItem(k); } catch { return null; } },
    set: (k, v) => { try { localStorage.setItem(k, v); } catch { /* ignore */ } }
  };
  const savedTheme = store.get("careplus-theme");
  const savedDir = store.get("zenora-dir");
  if (savedTheme === "light" || savedTheme === "dark") html.setAttribute("data-theme", savedTheme);
  else if (window.matchMedia("(prefers-color-scheme: dark)").matches) html.setAttribute("data-theme", "dark");
  if (savedDir) html.setAttribute("dir", savedDir);

  /* ---------- Header controls ---------- */
  document.getElementById("themeToggle")?.addEventListener("click", () => {
    const next = html.getAttribute("data-theme") === "dark" ? "light" : "dark";
    html.setAttribute("data-theme", next);
    store.set("careplus-theme", next);
  });
  document.getElementById("rtlToggle")?.addEventListener("click", () => {
    const next = html.getAttribute("dir") === "rtl" ? "ltr" : "rtl";
    html.setAttribute("dir", next);
    store.set("zenora-dir", next);
  });

  const menuToggle = document.getElementById("menuToggle");
  const mainNav = document.getElementById("mainNav");
  const closeMenu = () => {
    mainNav.classList.remove("open");
    menuToggle.classList.remove("active");
    menuToggle.setAttribute("aria-expanded", "false");
  };
  menuToggle?.addEventListener("click", () => {
    const open = mainNav.classList.toggle("open");
    menuToggle.classList.toggle("active", open);
    menuToggle.setAttribute("aria-expanded", open);
  });
  mainNav?.querySelectorAll("a").forEach((a) => a.addEventListener("click", closeMenu));

  document.querySelectorAll(".has-dropdown").forEach((item) => {
    const btn = item.querySelector(".dropdown-toggle");
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const open = item.classList.toggle("open");
      btn.setAttribute("aria-expanded", open);
    });
  });
  document.addEventListener("click", () =>
    document.querySelectorAll(".has-dropdown.open").forEach((i) => {
      i.classList.remove("open");
      i.querySelector(".dropdown-toggle").setAttribute("aria-expanded", "false");
    })
  );

  const header = document.getElementById("siteHeader");
  const toTop = document.getElementById("toTop");
  const onScroll = () => {
    const y = window.scrollY;
    header?.classList.toggle("scrolled", y > 40);
    toTop?.classList.toggle("show", y > 600);
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
  toTop?.addEventListener("click", () => window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" }));

  const year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();

  /* ---------- Small DOM helpers (text only, no innerHTML) ---------- */
  const $ = (id) => document.getElementById(id);
  const el = (tag, cls, text) => {
    const node = document.createElement(tag);
    if (cls) node.className = cls;
    if (text !== undefined) node.textContent = text;
    return node;
  };
  const icon = (id, size = 18, cls = "") => {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("width", size);
    svg.setAttribute("height", size);
    svg.setAttribute("aria-hidden", "true");
    if (cls) svg.setAttribute("class", cls);
    const use = document.createElementNS("http://www.w3.org/2000/svg", "use");
    use.setAttribute("href", `#${id}`);
    svg.appendChild(use);
    return svg;
  };
  const checkItem = (text) => {
    const li = el("li");
    li.append(icon("sd-check", 16), el("span", "", text));
    return li;
  };
  const setLink = (a, { label, href }) => {
    a.href = href;
    a.querySelector("span").textContent = label;
  };
  const setMeta = (desc) => document.querySelector('meta[name="description"]')?.setAttribute("content", desc);

  const page = $("sdPage");

  /* ---------- Resolve the requested service ---------- */
  const params = new URLSearchParams(window.location.search);
  const id = (params.get("service") || "").trim().toLowerCase();
  const service = Object.prototype.hasOwnProperty.call(SERVICES, id) ? SERVICES[id] : null;

  if (!service) {
    renderNotFound(id);
  } else {
    renderService(service);
  }

  /* ---------- Render: one service only ---------- */
  function renderService(s) {
    document.title = `${s.title} | Emeravita Services`;
    setMeta(`${s.title} at Emeravita Health Store – ${s.hero.text}`);

    // 1. Hero
    const pics = SERVICE_IMAGES[id] || {};
    const heroImg = $("sdHeroImg");
    if (pics.hero) {
      heroImg.src = pics.hero.src;
      heroImg.alt = pics.hero.alt;
    } else {
      heroImg.classList.add("img-fallback");
    }
    $("sdCrumb").textContent = s.crumb;
    $("sdBadge").textContent = s.badge;
    $("sdTitle").textContent = s.title;
    $("sdHeroText").textContent = s.hero.text;
    setLink($("sdHeroCta"), s.hero.cta);
    $("sdHeroIcon").setAttribute("href", `#${s.icon}`);
    $("sdFacts").replaceChildren(...s.hero.facts.map(checkItem));

    // 2. About
    const aboutImg = $("sdAboutImg");
    if (pics.about) {
      aboutImg.classList.remove("img-fallback");
      aboutImg.src = pics.about.src;
      aboutImg.alt = pics.about.alt;
    } else {
      aboutImg.classList.add("img-fallback");
      aboutImg.alt = "";
    }
    $("sdAboutTitle").textContent = s.about.title;
    $("sdIntro").textContent = s.about.intro;
    $("sdDesc").textContent = s.about.desc;
    $("sdStatNum").textContent = s.about.stat.num;
    $("sdStatLabel").textContent = s.about.stat.label;
    $("sdFeatures").replaceChildren(...s.about.features.map(checkItem));
    $("sdExpect").replaceChildren(...s.about.expect.map((step) => {
      const li = el("li");
      li.append(el("strong", "", step.t), el("span", "", step.d));
      return li;
    }));
    $("sdBenefits").replaceChildren(...s.about.benefits.map((b) => {
      const li = el("li");
      li.append(icon("sd-check", 14), el("span", "", b));
      return li;
    }));

    // 3. Why choose
    $("sdWhyTitle").textContent = s.why.title;
    $("sdWhySub").textContent = s.why.sub;
    $("sdWhy").replaceChildren(...s.why.items.map((item, i) => {
      const card = el("article", "sd-why-card sd-reveal");
      const ic = el("span", "sd-why-icon");
      ic.appendChild(icon(item.icon, 26));
      card.append(el("span", "sd-why-num", String(i + 1).padStart(2, "0")), ic, el("h3", "", item.t), el("p", "", item.d));
      card.querySelector(".sd-why-num").setAttribute("aria-hidden", "true");
      return card;
    }));

    // 4. Pricing
    $("sdPriceTitle").textContent = s.pricing.title;
    $("sdPriceNote").textContent = s.pricing.note;
    $("sdPricing").replaceChildren(...s.pricing.plans.map((plan) => {
      const card = el("article", `sd-price-card sd-reveal${plan.featured ? " is-featured special-card" : ""}`);
      if (plan.featured && plan.tag) card.appendChild(el("span", "sd-price-tag special-badge", plan.tag));
      const amount = el("p", "sd-price-amount");
      const isText = /[a-z]/i.test(plan.price) && plan.price !== "Free";
      amount.append(el("strong", isText ? "is-text" : "", plan.price));
      if (plan.unit) amount.append(el("span", "", plan.unit));
      const list = el("ul", "sd-price-list");
      list.append(...plan.includes.map(checkItem));
      const btn = el("a", `btn ${plan.featured ? "btn-secondary" : "btn-primary"}`, plan.cta.label);
      btn.href = plan.cta.href;
      card.append(el("h3", "", plan.name), amount, el("p", "sd-price-desc", plan.desc), list, btn);
      return card;
    }));
    const foot = $("sdPriceFoot");
    foot.replaceChildren(icon("sd-alert", 18), el("span", "", s.pricing.foot));

    // 5. FAQs + CTA
    $("sdFaqTitle").textContent = `${s.title}: common questions`;
    buildAccordion($("sdFaq"), s.faqs);
    $("sdCtaIcon").setAttribute("href", `#${s.cta.icon}`);
    $("sdCtaTitle").textContent = s.cta.title;
    $("sdCtaText").textContent = s.cta.text;
    setLink($("sdCtaBtn"), { label: s.cta.label, href: s.cta.href });

    page.classList.remove("is-loading");
    page.classList.add("is-ready");
    initReveal();
  }

  /* ---------- Render: invalid / missing id ---------- */
  function renderNotFound(badId) {
    document.title = "Service Not Found | Emeravita";
    setMeta("The requested Emeravita service could not be found. Browse all pharmacy services.");
    document.querySelectorAll(".sd-view").forEach((sec) => { sec.hidden = true; });
    const nf = $("sdNotFound");
    nf.hidden = false;
    if (badId) {
      $("sdNfText").textContent = `We couldn't find a service called "${badId.slice(0, 60)}". The link may be incorrect or the service may have moved.`;
    } else {
      $("sdNfText").textContent = "No service was selected. Choose one of our services below or go back to the Services page.";
    }
    // Links to the six real services (names only, no other service content is shown)
    $("sdNfLinks").replaceChildren(...Object.entries(SERVICES).map(([key, s]) => {
      const li = el("li");
      const a = el("a", "", s.title);
      const url = new URL("servicedetail.html", window.location.href);
      url.searchParams.set("service", key);
      a.href = url.href;
      li.appendChild(a);
      return li;
    }));
    page.classList.remove("is-loading");
  }

  /* ---------- Accessible accordion (one open at a time) ---------- */
  function buildAccordion(root, faqs) {
    const items = faqs.map((f, i) => {
      const item = el("div", "sd-acc-item");
      const h = el("h3", "sd-acc-h");
      const btn = el("button", "sd-acc-btn");
      btn.type = "button";
      btn.id = `sdq${i + 1}`;
      btn.setAttribute("aria-expanded", "false");
      btn.setAttribute("aria-controls", `sda${i + 1}`);
      btn.append(el("span", "", f.q));
      const pm = el("span", "sd-pm");
      pm.setAttribute("aria-hidden", "true");
      btn.appendChild(pm);
      h.appendChild(btn);
      const panel = el("div", "sd-acc-panel");
      panel.id = `sda${i + 1}`;
      panel.setAttribute("role", "region");
      panel.setAttribute("aria-labelledby", btn.id);
      panel.hidden = true;
      const inner = el("div");
      inner.appendChild(el("p", "", f.a));
      panel.appendChild(inner);
      item.append(h, panel);
      return item;
    });
    root.replaceChildren(...items);

    const buttons = [...root.querySelectorAll(".sd-acc-btn")];
    const setOpen = (btn, open) => {
      const panel = $(btn.getAttribute("aria-controls"));
      btn.setAttribute("aria-expanded", String(open));
      btn.closest(".sd-acc-item").classList.toggle("is-open", open);
      if (open) panel.hidden = false;
      else if (reduceMotion) panel.hidden = true;
      else setTimeout(() => { if (btn.getAttribute("aria-expanded") === "false") panel.hidden = true; }, 450);
    };
    buttons.forEach((btn, i) => {
      btn.addEventListener("click", () => {
        const willOpen = btn.getAttribute("aria-expanded") !== "true";
        buttons.forEach((b) => { if (b !== btn && b.getAttribute("aria-expanded") === "true") setOpen(b, false); });
        if (willOpen) {
          $(btn.getAttribute("aria-controls")).hidden = false;
          requestAnimationFrame(() => setOpen(btn, true));
        } else {
          setOpen(btn, false);
        }
      });
      btn.addEventListener("keydown", (e) => {
        let next = null;
        if (e.key === "ArrowDown") next = buttons[(i + 1) % buttons.length];
        else if (e.key === "ArrowUp") next = buttons[(i - 1 + buttons.length) % buttons.length];
        else if (e.key === "Home") next = buttons[0];
        else if (e.key === "End") next = buttons[buttons.length - 1];
        if (next) { e.preventDefault(); next.focus(); }
      });
    });
    if (buttons[0]) setOpen(buttons[0], true);
  }

  /* ---------- Scroll reveal ---------- */
  function initReveal() {
    const reveals = document.querySelectorAll(".sd-reveal");
    if (reduceMotion || !("IntersectionObserver" in window)) {
      reveals.forEach((r) => r.classList.add("sd-in"));
      return;
    }
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const node = entry.target;
        const group = [...node.parentElement.children].filter((c) => c.classList.contains("sd-reveal"));
        node.style.transitionDelay = `${Math.max(group.indexOf(node), 0) * 0.08}s`;
        node.classList.add("sd-in");
        obs.unobserve(node);
        setTimeout(() => { node.style.transitionDelay = ""; }, 1400);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    reveals.forEach((r) => obs.observe(r));
  }

  /* ---------- Smooth scroll for in-page links ---------- */
  document.querySelectorAll('.sd-page a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (e) => {
      const target = document.querySelector(link.getAttribute("href"));
      if (!target || target.hidden) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
    });
  });
});