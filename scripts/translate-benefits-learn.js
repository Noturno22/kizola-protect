#!/usr/bin/env node
/**
 * Translates remaining English strings in ln.json (Lingala) and tl.json (Tagalog)
 * Only replaces values that still match the English source.
 */

const fs = require('fs');
const path = require('path');

const BASE = path.join(__dirname, '..', 'assets', 'translations');
const enSrc = JSON.parse(fs.readFileSync(path.join(BASE, '_en_source.json'), 'utf8'));
const lnFile = JSON.parse(fs.readFileSync(path.join(BASE, 'ln.json'), 'utf8'));
const tlFile = JSON.parse(fs.readFileSync(path.join(BASE, 'tl.json'), 'utf8'));

// ─── Lingala translations ────────────────────────────────────────────
const lnT = {
  // ── benefits short keys ──
  "New Services": "Sevisi Naini",
  "Housing Support": "Bikisi ya Ndako",
  "Housing search, Shelter and housing programs": "Lingela ndako, bikisi ya mpasi na program ya ndako",
  "Finance Help": "Bikisi ya Mabango",
  "EBT, state benefits, taxes and Tax Return": "EBT, mpacho ya etat, impôt na Retour d'Impôt",

  // ── learn UI keys ──
  "Articles": "Articles",
  "Categories": "Mpacho ya Category",
  "Health": "Santé",
  "Finance": "Mabango",
  "Education": "Lilongi",
  "Safety": "Kokende",
  "Community": "Communauté",
  "Work": "Travail",
  "Popular": "Populaire",
  "Recent": "Ya Libikolo",
  "Recommended for You": "Nayango Ngai",
  "Your Saved Articles": "Articles ya Ngai",
  "No saved articles yet": "Nazalaka article naini",
  "Sort by": "Kolanda",
  "Most Recent": "Ya Libikolo Nyoso",
  "Most Popular": "Ya Siku Nyoso",
  "A-Z": "A-Z",
  "Read Time": "Tanga",
  "Filters": "Kolanda",
  "Clear All": "Kolmisa Nyoso",
  "Apply Filters": "Kolanda Nyoso",
  "Difficulty": "Lokola",
  "Beginner": "Ya Natangaka",
  "Intermediate": "Ya Mokolo",
  "Advanced": "Ya Libikolo",
  "Under 5 min": "Mokolo 5",
  "5-10 min": "Mokolo 5-10",
  "10+ min": "Mokolo 10+",
  "Related Articles": "Articles ya Libikolo",
  "Saved": "Naswe",
  "Share Article": "Kosangisa Article",
  "No articles found": "Nazalaka article",
  "Try different search terms or filters": "Koya misonga mingi na kolanda",
  "min": "min",

  // ── learn article titles ──
  "Tax Return Filing Basics": "Ekombi ya Kolanda Impôt",
  "Common Tax Deductions": "Mpacho ya Impôt ya Siku",
  "Filing Taxes as Self-Employed": "Kolanda Impôt na Ngai",
  "Understanding Tax Refunds": "Monana Retour d'Impôt",
  "State Tax Guide": "Lilongi ya Impôt ya Etat",
  "Visa Types Overview": "Ekombi ya Visa",
  "Green Card Process": "Ekombi ya Green Card",
  "Path to Citizenship": "Ekombi ya Citizenship",
  "Understanding DACA": "Monana DACA",
  "Work Authorization Guide": "Lilongi ya Travail na Immigration",
  "Tenant Rights Overview": "Mpacho ya Nkisi ya Ndako",
  "Understanding Lease Agreements": "Monana Kasunduanu ya Ndako",
  "Eviction Protection": "Kokende ya Palaka",
  "Security Deposit Guide": "Lilongi ya Deposit",
  "Fair Housing Laws": "Lolongo ya Ndako",
  "When to Hire a Lawyer": "Siku ya Kolanda Lokola",
  "Free Legal Aid Resources": "Bikisi ya Lokola ya Libela",
  "Know Your Rights": "Monana Mpacho ya Ngai",
  "Handling Traffic Tickets": "Kokendisa Ticket ya Moto",
  "Employment Law Basics": "Ekombi ya Travail na Lolongo",
  "Resume Building Guide": "Lilongi ya CV",
  "Interview Preparation": "Kolanda Interview",
  "Networking Strategies": "Ekombi ya Network",
  "LinkedIn Optimization": "LinkedIn ya Ngai",
  "Career Change Guide": "Ekombi ya Travail",
  "Health Insurance Basics": "Ekombi ya Santé",
  "Understanding Medicaid": "Monana Medicaid",
  "Emergency Care Guide": "Lilongi ya Mpasi",
  "Mental Health Resources": "Bikisi ya Mpono",
  "Finding a Doctor": "Lingela Dokotolo",
  "Banking Basics": "Ekombi ya Banque",
  "Understanding Credit Score": "Monana Crédit",
  "Budgeting Guide": "Lilongi ya Budget",
  "Sending Money Abroad": "Kosenda Mabango",
  "Managing Debt": "Kokendisa Dette",
  "ESL Programs": "Program ya ESL",
  "GED Preparation": "Kolanda GED",
  "College Scholarships": "Scholarship ya École",
  "Online Learning Platforms": "Platform ya Lilongi",
  "Trade Schools Guide": "Lilongi ya Travail",
  "Scam Prevention": "Kokende ya Escroquerie",
  "Domestic Violence Resources": "Bikisi ya Mpasi ya Ndako",
  "Know Your Rights: ICE Encounters": "Monana Mpacho ya Ngai: ICE",
  "Emergency Planning": "Kolanda Mpasi",
  "Online Safety Guide": "Lilongi ya Kokende na Internet",
  "Cultural Adjustment": "Ekombi ya Culture",
  "Finding Your Community": "Lingela Communauté ya Ngai",
  "Language Exchange": "Kosangisa Lilongi",
  "Faith-Based Resources": "Bikisi ya Foi",
  "Volunteering Opportunities": "Mpacho ya Bénévolat",
  "Gig Economy Worker Rights": "Mpacho ya Travail ya Gig",
  "US Labor Laws": "Lolongo ya Travail ya US",
  "Wage Theft Prevention": "Kokende ya Sala",
  "Understanding Unions": "Monana Syndicat",

  // ── learn article descriptions ──
  "Essential guide to understanding tax filing requirements, deadlines, and deductions you may qualify for.":
    "Lilongi ya ekombi ya kolanda impôt, siku, na mpacho ya ngai.",
  "Maximize your refund by understanding which deductions and credits you qualify for as an immigrant.":
    "Kokanisa retour d'impôt na ngai na monana mpacho ya ngai.",
  "If you freelance, drive for rideshare, or run a small business, this guide covers your unique tax obligations.":
    "Soki otravaille na ngai, kokendisa moto, na kosala bisnis, lilongi yeki ezali na mpacho ya impôt na ngai.",
  "Learn how tax refunds work, how to maximize yours, and how to track your refund status.":
    "Monana ekombi ya retour d'impôt, kokanisa retour d'impôt na ngai, na kokendisa status ya retour d'impôt.",
  "Not all states have income tax. Learn which states tax you and how to file state returns.":
    "Etat nyoso ezali na impôt te. Monana etat naini ezali na impôt na ngai na ekombi ya kolanda retour d'impôt.",
  "A comprehensive guide to the most common US visa categories for work, family, and study.":
    "Lilongi ya visa ya US ya pamba, ndako, na lilongi.",
  "Step-by-step guide to obtaining permanent residency through family, employment, or other pathways.":
    "Ekombi ya monana résidence permanente na ndako, travail, na ekombi mingi.",
  "Understanding the naturalization process from permanent resident to US citizen.":
    "Monana ekombi ya naturalisation ya monana citoyen ya US.",
  "What DACA is, who qualifies, current status, and available alternatives for Dreamers.":
    "DACA ezali naini, naini ezali na DACA, status ya kati, na ekombi mingi ya Dreamers.",
  "How to obtain and maintain work authorization in the US, including EAD cards and employer sponsorship.":
    "Ekombi ya monana na kokendisa travail na US, kaka EAD na parrainage ya employer.",
  "Know your rights as a renter in the US, from habitability standards to protection against discrimination.":
    "Monana mpacho ya ngai na US, na habitabilité na kokende ya discrimination.",
  "What to look for in your lease, your rights and obligations, and common clauses to watch out for.":
    "Naini ya monana na kasunduanu ya ngai, mpacho na obligations na ngai, na clauses ya kokendisa.",
  "Understanding the eviction process, your rights during eviction, and how to fight illegal evictions.":
    "Monana ekombi ya palaka, mpacho ya ngai na palaka, na ekombi ya kolanda palaka.",
  "How security deposits work, what landlords can deduct, and how to get your money back.":
    "Ekombi ya deposit, naini landlord ezali na monana na deposit, na ekombi ya kokufa mabango na ngai.",
  "Protection against housing discrimination based on race, religion, national origin, and other characteristics.":
    "Kokende ya discrimination ya ndako na ngamba, relijion, nationalité, na naini mingi.",
  "Understanding when legal representation is essential and how to find affordable attorneys.":
    "Monana siku ya lokola ezali important na ekombi ya lingela lokola ya ngai.",
  "Where to find free or low-cost legal assistance in your community.":
    "Monana monie ya monana bikisi ya lokola ya libela na communauté ya ngai.",
  "Essential rights that protect you during police encounters, ICE interactions, and in daily life.":
    "Mpacho ya ngai ya kokende na polisi, ICE, na siku ya ngai.",
  "What to do if you receive a traffic ticket, your options, and how to protect your driving record.":
    "Naini ya kosala soki omoni ticket ya moto, ekombi ya ngai, na kokende ya histori ya kokendisa.",
  "Your rights in the workplace, from minimum wage to safety protections and anti-discrimination laws.":
    "Mpacho ya ngai na travail, na minimum wage na kokende ya discrimination.",
  "Create a professional resume that gets you interviews, with templates and tips for immigrants.":
    "Kosala CV ya ngai, na modèle na conseil ya imigrante.",
  "Master the art of interviewing, from common questions to follow-up strategies.":
    "Kokanisa interview, na misonga ya siku na stratégie ya libikolo.",
  "Build professional connections that lead to job opportunities and career growth.":
    "Kosala réseau ya travail na monana mpacho ya travail.",
  "Build a powerful LinkedIn profile that attracts recruiters and opportunities.":
    "Kosala profil LinkedIn ya ngai na monana opportunities.",
  "How to successfully transition to a new career field, from assessment to execution.":
    "Ekombi ya kokanisa travail, na évaluation na exécution.",
  "Understanding the US health insurance system, including marketplace plans and employer coverage.":
    "Monana système ya assurance maladie ya US, na plan na employer.",
  "Eligibility, benefits, and how to apply for Medicaid and CHIP coverage.":
    "Éligibilité, mpacho, na ekombi ya kolanda Medicaid na CHIP.",
  "What to do in a medical emergency, your rights at the ER, and how to manage emergency medical costs.":
    "Naini ya kosala na mpasi ya santé, mpacho na ER, na ekombi ya kokendisa frais médicaux.",
  "Accessing mental health services, therapy, and counseling, including resources for immigrants.":
    "Monana service ya santé mentale, thérapie, na counselling, kaka bikisi ya imigrante.",
  "How to find the right primary care physician, understand doctor-patient relationships, and navigate healthcare.":
    "Ekombi ya lingela dokotolo, monana relation dokotolo-na-patient, na système ya santé.",
  "How to open a bank account, choose the right bank, and manage your money in the US banking system.":
    "Ekombi ya kotanga compte banque, kolanda banque, na kokendisa mabango na système bancaire ya US.",
  "What a credit score is, how it affects your life, and how to build and improve yours.":
    "Crédit score ezali naini, ekombi ya ngai, na ekombi ya kokanisa crédit score na ngai.",
  "Create and maintain a personal budget that works for your income and goals.":
    "Kosala na kokendisa budget ya ngai na monana ekombi ya salaire na ngai.",
  "Compare services and methods for international money transfers, minimizing fees and maximizing value.":
    "Monana service na méthode ya kosenda mabango, na kokanisa frais na kokanisa valeur.",
  "Strategies for paying off debt, avoiding predatory lending, and building financial freedom.":
    "Stratégie ya kolanda dette, kokende ya prêt, na kokanisa liberté financière.",
  "Find English language classes, from free community programs to online learning platforms.":
    "Lingela lilongi ya lingala, na program ya communauté na platform ya internet.",
  "Earn your high school equivalency diploma through the GED test, with study resources and tips.":
    "Monana diplôme ya équivalence na test GED, na ressources ya étude na conseil.",
  "Find and apply for scholarships, grants, and financial aid to fund your education.":
    "Lingela na kolanda scholarship, bourse, na aide financière ya lilongi na ngai.",
  "Top platforms for learning new skills, earning certificates, and advancing your career online.":
    "Platform ya lilongi na internet, monana sertifikasi, na kokanisa carrière na ngai.",
  "Vocational training and trade school options for high-demand careers with shorter training periods.":
    "Formation professionnelle na école ya travail na carrière ya siku.",
  "Recognize and avoid common scams targeting immigrants, from phone fraud to fake services.":
    "Monana na kokende escroquerie ya imigrante, na fraude ya telephone na service ya fake.",
  "Safety planning, resources, and legal protections for victims of domestic violence.":
    "Plan ya kokende, ressources, na kokende ya lokola ya victimes ya violence domestique.",
  "What to do if ICE comes to your home, workplace, or you are stopped in public.":
    "Naini ya kosala soki ICE ezali na ndako na ngai, travail, na public.",
  "Create a family emergency plan that prepares you for natural disasters, separation, or crisis situations.":
    "Kosala plan ya mpasi ya ndako na ngai na monana équilibre, séparation, na situation ya crise.",
  "Protect yourself from online scams, identity theft, and digital privacy threats.":
    "Kokende ya ngai na escroquerie na internet, vol d'identité, na menaces ya numérique.",
  "Navigating culture shock, adapting to American customs, and maintaining your cultural identity.":
    "Ekombi ya culture shock, adaptation na coutumes américaines, na kokendisa identité culturelle.",
  "How to build a social network, find support groups, and create belonging in your new home.":
    "Ekombi ya kosala réseau social, lingela groupe ya soutien, na kosala sentiment ya appartenance.",
  "Find language exchange partners and programs to improve your English while sharing your language.":
    "Lingela partenaire ya échange linguistique na program ya kokanisa lingala na ngai.",
  "Finding religious communities and faith-based organizations that support immigrants.":
    "Lingela communautés religieuses na organisations ya foi na kokende ya imigrante.",
  "Give back to your community while building skills, connections, and experience.":
    "Kokanisa communauté na ngai na kokanisa compétences, connexions, na expérience.",
  "Understanding your rights as a gig worker, including rideshare, delivery, and freelance work.":
    "Monana mpacho ya ngai na travail ya gig, kaka rideshare, livraison, na freelance.",
  "Understanding minimum wage, overtime, breaks, and other workplace protections under federal and state law.":
    "Monana minimum wage, overtime, pauses, na kokende ya travail na lolongo ya fédéral na etat.",
  "Recognizing and recovering stolen wages, and how to report employers who don't pay fairly.":
    "Monana na kokufa salaire ya volé, na ekombi ya kosignaler employer naini ezali na kolanda sala.",
  "What unions are, how they protect workers, and how to organize or join one in your workplace.":
    "Syndicat ezali naini, ekombi ya kokende travailleur, na ekombi ya kosala na koyaka syndicat.",
  "Comprehensive guide to maintaining work authorization, changing employers, and compliance requirements.":
    "Lilongi ya kokendisa authorization ya travail, kokanisa employer, na exigences ya conformité.",
};

// ─── Tagalog translations ────────────────────────────────────────────
const tlT = {
  // ── benefits short keys ──
  "New Services": "Mga Bagong Serbisyo",
  "Housing Support": "Suporta sa Pabahay",
  "Housing search, Shelter and housing programs": "Paghahanap ng pabahay, shelter at mga programa sa pabahay",
  "Finance Help": "Tulong sa Pananalapi",
  "EBT, state benefits, taxes and Tax Return": "EBT, mga benepisyo ng estado, buwis at Tax Return",

  // ── learn UI keys ──
  "Articles": "Mga Artikulo",
  "Categories": "Mga Kategorya",
  "Health": "Kalusugan",
  "Finance": "Pananalapi",
  "Education": "Edukasyon",
  "Safety": "Kaligtasan",
  "Community": "Komunidad",
  "Work": "Trabaho",
  "Popular": "Sikat",
  "Recent": "Kamakailan",
  "Recommended for You": "Inirerekumenda Para sa Iyo",
  "Your Saved Articles": "Iyong Mga Na-save na Artikulo",
  "No saved articles yet": "Wala pang na-save na artikulo",
  "Sort by": "I-sort ayon sa",
  "Most Recent": "Pinakabago",
  "Most Popular": "Pinakasikat",
  "A-Z": "A-Z",
  "Read Time": "Oras ng Pagbasa",
  "Filters": "Mga Salain",
  "Clear All": "I-clear Lahat",
  "Apply Filters": "I-apply ang Mga Salain",
  "Difficulty": "Antas ng Hirap",
  "Beginner": "Nagsisimula",
  "Intermediate": "Gitnang Antas",
  "Advanced": "Advanced",
  "Under 5 min": "Mas mababa sa 5 min",
  "5-10 min": "5-10 min",
  "10+ min": "10+ min",
  "Related Articles": "Mga Kaugnay na Artikulo",
  "Saved": "Na-save",
  "Share Article": "Ibahagi ang Artikulo",
  "No articles found": "Walang nakitang artikulo",
  "Try different search terms or filters": "Subukan ang ibang mga salita sa paghahanap o mga salain",
  "min": "min",

  // ── learn article titles ──
  "Tax Return Filing Basics": "Mga Pangunahing Kaalaman sa Paghahain ng Buwis",
  "Common Tax Deductions": "Mga Karaniwang Deduction sa Buwis",
  "Filing Taxes as Self-Employed": "Paghahain ng Buwis bilang Self-Employed",
  "Understanding Tax Refunds": "Pag-unawa sa mga Refund ng Buwis",
  "State Tax Guide": "Gabay sa Buwis ng Estado",
  "Visa Types Overview": "Pangkalahatang-ideya ng mga Uri ng Visa",
  "Green Card Process": "Proseso ng Green Card",
  "Path to Citizenship": "Landas Patungo sa Citizenship",
  "Understanding DACA": "Pag-unawa sa DACA",
  "Work Authorization Guide": "Gabay sa Authorization ng Trabaho",
  "Tenant Rights Overview": "Pangkalahatang-ideya ng mga Karapatan ng Nangungupahan",
  "Understanding Lease Agreements": "Pag-unawa sa mga Kasunduan sa Pag-upa",
  "Eviction Protection": "Proteksyon laban sa Pagpapalayas",
  "Security Deposit Guide": "Gabay sa Security Deposit",
  "Fair Housing Laws": "Mga Batas sa Patas na Pabahay",
  "When to Hire a Lawyer": "Kailan Gumamit ng Abogado",
  "Free Legal Aid Resources": "Mga Mapagkukunan ng Libreng Legal na Tulong",
  "Know Your Rights": "Alamin ang Iyong mga Karapatan",
  "Handling Traffic Tickets": "Paghawak ng mga Ticket sa Trapiko",
  "Employment Law Basics": "Mga Pangunahing Kaalaman sa Batas ng Trabaho",
  "Resume Building Guide": "Gabay sa Pagbuo ng Resume",
  "Interview Preparation": "Paghahanda sa Interbyu",
  "Networking Strategies": "Mga Estratehiya sa Networking",
  "LinkedIn Optimization": "Pag-optimize ng LinkedIn",
  "Career Change Guide": "Gabay sa Pagbabago ng Karera",
  "Health Insurance Basics": "Mga Pangunahing Kaalaman sa Health Insurance",
  "Understanding Medicaid": "Pag-unawa sa Medicaid",
  "Emergency Care Guide": "Gabay sa Emergency na Pangangalaga",
  "Mental Health Resources": "Mga Mapagkukunan sa Kalusugang Pangkaisipan",
  "Finding a Doctor": "Paghahanap ng Doktor",
  "Banking Banking Basics": "Mga Pangunahing Kaalaman sa Pagbabangko",
  "Understanding Credit Score": "Pag-unawa sa Credit Score",
  "Budgeting Guide": "Gabay sa Pagbabadyet",
  "Sending Money Abroad": "Pagpapadala ng Pera sa Ibang Bansa",
  "Managing Debt": "Pamamahala ng Utang",
  "ESL Programs": "Mga Programa ng ESL",
  "GED Preparation": "Paghahanda sa GED",
  "College Scholarships": "Mga Scholarship sa Kolehiyo",
  "Online Learning Platforms": "Mga Platform sa Online na Pag-aaral",
  "Trade Schools Guide": "Gabay sa mga Paaralan ng Kalakalan",
  "Scam Prevention": "Paghaharang sa mga Scam",
  "Domestic Violence Resources": "Mga Mapagkukunan para sa Biktima ng Domestic Violence",
  "Know Your Rights: ICE Encounters": "Alamin ang Iyong mga Karapatan: mga Encuentro sa ICE",
  "Emergency Planning": "Pagpaplano ng Emergency",
  "Online Safety Guide": "Gabay sa Kaligtasan sa Online",
  "Cultural Adjustment": "Pagsasaayos sa Kultura",
  "Finding Your Community": "Paghahanap ng Iyong Komunidad",
  "Language Exchange": "Pagpapalitan ng Wika",
  "Faith-Based Resources": "Mga Mapagkukunan na Nakabatay sa Pananampalataya",
  "Volunteering Opportunities": "Mga Oportunidad sa Boluntaryo",
  "Gig Economy Worker Rights": " mga Karapatan ng Trabahador sa Gig Economy",
  "US Labor Laws": "Mga Batas sa Paggawa ng US",
  "Wage Theft Prevention": "Paghaharang sa Pagnanakaw ng Sahod",
  "Understanding Unions": "Pag-unawa sa mga Unyon",

  // ── learn article descriptions ──
  "Essential guide to understanding tax filing requirements, deadlines, and deductions you may qualify for.":
    "Mahalagang gabay sa pag-unawa sa mga kinakailangan sa paghahain ng buwis, deadlines, at mga deduction na maaari mong maging kwalipikado.",
  "Maximize your refund by understanding which deductions and credits you qualify for as an immigrant.":
    "I-maximize ang iyong refund sa pamamagitan ng pag-unawa sa mga deduction at credit naQualified ka bilang isang imigrante.",
  "If you freelance, drive for rideshare, or run a small business, this guide covers your unique tax obligations.":
    "Kung nagpa-freelance, nagmamaneho para sa rideshare, o nagpapatakbo ng maliit na negosyo, saklaw ng gabay na ito ang iyong mga natatanging obligasyon sa buwis.",
  "Learn how tax refunds work, how to maximize yours, and how to track your refund status.":
    "Alamin kung paano gumagana ang mga refund ng buwis, kung paano i-maximize ang sa iyo, at kung paano masubaybayan ang katayuan ng iyong refund.",
  "Not all states have income tax. Learn which states tax you and how to file state returns.":
    "Hindi lahat ng estado ay may buwis sa kita. Alamin kung aling mga estado ang naniningil sa iyo at kung paano maghain ng mga return ng estado.",
  "A comprehensive guide to the most common US visa categories for work, family, and study.":
    "Isang komprehensibong gabay sa mga pinaka-karaniwang kategorya ng visa ng US para sa trabaho, pamilya, at pag-aaral.",
  "Step-by-step guide to obtaining permanent residency through family, employment, or other pathways.":
    "Gabay na hakbang-hakbang sa pagkuha ng permanenteng paninirahan sa pamamagitan ng pamilya, trabaho, o iba pang mga landas.",
  "Understanding the naturalization process from permanent resident to US citizen.":
    "Pag-unawa sa proseso ng naturalisasyon mula sa permanenteng residente hanggang sa mamamayang Amerikano.",
  "What DACA is, who qualifies, current status, and available alternatives for Dreamers.":
    "Kung ano ang DACA, kung sino ang qualified, kasalukuyang katayuan, at mga available na alternatibo para sa mga Dreamer.",
  "How to obtain and maintain work authorization in the US, including EAD cards and employer sponsorship.":
    "Kung paano makuha at mapanatili ang authorization ng trabaho sa US, kabilang ang mga EAD card at employer sponsorship.",
  "Know your rights as a renter in the US, from habitability standards to protection against discrimination.":
    "Alamin ang iyong mga karapatan bilang nangungupahan sa US, mula sa mga pamantayan ng kakayahang tirhan hanggang sa proteksyon laban sa diskriminasyon.",
  "What to look for in your lease, your rights and obligations, and common clauses to watch out for.":
    "Kung ano ang hahanapin sa iyong lease, ang iyong mga karapatan at obligasyon, at mga karaniwang clause na dapat bantayan.",
  "Understanding the eviction process, your rights during eviction, and how to fight illegal evictions.":
    "Pag-unawa sa proseso ng pagpapalayas, ang iyong mga karapatan habang nagpapalayas, at kung paano labanan ang mga ilegal na pagpapalayas.",
  "How security deposits work, what landlords can deduct, and how to get your money back.":
    "Kung paano gumagana ang mga security deposit, kung ano ang maaaring ibawas ng mga may-ari ng bahay, at kung paano mabawi ang iyong pera.",
  "Protection against housing discrimination based on race, religion, national origin, and other characteristics.":
    "Proteksyon laban sa diskriminasyon sa pabahay batay sa lahi, relihiyon, pinagmulang nasyonal, at iba pang mga katangian.",
  "Understanding when legal representation is essential and how to find affordable attorneys.":
    "Pag-unawa kung kailan kailangan ng legal na representasyon at kung paano makahanap ng abot-kayang mga abogado.",
  "Where to find free or low-cost legal assistance in your community.":
    "Saan makahanap ng libre o mababang halaga na legal na tulong sa iyong komunidad.",
  "Essential rights that protect you during police encounters, ICE interactions, and in daily life.":
    "Mga pangunahing karapatan na nagpoprotekta sa iyo habang nakikipag-ugnayan sa pulis, ICE, at sa pang-araw-araw na buhay.",
  "What to do if you receive a traffic ticket, your options, and how to protect your driving record.":
    "Kung ano ang gagawin kung nakatanggap ka ng ticket sa trapiko, ang iyong mga pagpipilian, at kung paano protektahan ang iyong rekord sa pagmamaneho.",
  "Your rights in the workplace, from minimum wage to safety protections and anti-discrimination laws.":
    "Ang iyong mga karapatan sa lugar ng trabaho, mula sa minimum wage hanggang sa mga proteksyon sa kaligtasan at mga batas laban sa diskriminasyon.",
  "Create a professional resume that gets you interviews, with templates and tips for immigrants.":
    "Gumawa ng propesyonal na resume na makakakuha sa iyo ng mga interbyu, na may mga template at tip para sa mga imigrante.",
  "Master the art of interviewing, from common questions to follow-up strategies.":
    "Sanayin ang sining ng interbyu, mula sa mga karaniwang tanong hanggang sa mga estratehiya sa follow-up.",
  "Build professional connections that lead to job opportunities and career growth.":
    "Magtayo ng mga propesyonal na koneksyon na humahantong sa mga oportunidad sa trabaho at paglago ng karera.",
  "Build a powerful LinkedIn profile that attracts recruiters and opportunities.":
    "Gumawa ng malakas na LinkedIn profile na umaakit ng mga recruiter at mga oportunidad.",
  "How to successfully transition to a new career field, from assessment to execution.":
    "Kung paano matagumpay na lumipat sa bagong larangan ng karera, mula sa pagsusuri hanggang sa pagpapatupad.",
  "Understanding the US health insurance system, including marketplace plans and employer coverage.":
    "Pag-unawa sa sistema ng health insurance ng US, kabilang ang mga marketplace plan at saklaw ng employer.",
  "Eligibility, benefits, and how to apply for Medicaid and CHIP coverage.":
    "Karapat-dapat, mga benepisyo, at kung paano mag-apply para sa Medicaid at CHIP coverage.",
  "What to do in a medical emergency, your rights at the ER, and how to manage emergency medical costs.":
    "Kung ano ang gagawin sa medikal na emergency, ang iyong mga karapatan sa ER, at kung paano pamahalaan ang mga gastos sa emergency na medikal.",
  "Accessing mental health services, therapy, and counseling, including resources for immigrants.":
    "Pag-access sa mga serbisyo sa kalusugang pangkaisipan, therapy, at counseling, kabilang ang mga mapagkukunan para sa mga imigrante.",
  "How to find the right primary care physician, understand doctor-patient relationships, and navigate healthcare.":
    "Kung paano mahanap ang tamang primary care physician, unawain ang mga relasyong doktor-pasyente, at i-navigate ang healthcare.",
  "How to open a bank account, choose the right bank, and manage your money in the US banking system.":
    "Kung paano magbukas ng bank account, pumili ng tamang bangko, at pamahalaan ang iyong pera sa sistema ng pagbabangko ng US.",
  "What a credit score is, how it affects your life, and how to build and improve yours.":
    "Kung ano ang credit score, kung paano ito nakakaapekto sa iyong buhay, at kung paano itayo at pagbutihin ang sa iyo.",
  "Create and maintain a personal budget that works for your income and goals.":
    "Gumawa at panatilihin ang personal na badyet na gumagana para sa iyong kita at mga layunin.",
  "Compare services and methods for international money transfers, minimizing fees and maximizing value.":
    "Ihambing ang mga serbisyo at pamamaraan para sa internasyonal na pagpapadala ng pera, binabawasan ang mga bayarin at pinapataas ang halaga.",
  "Strategies for paying off debt, avoiding predatory lending, and building financial freedom.":
    "Mga estratehiya sa pagbabayad ng utang, pag-iwas sa mapanlamang pagpapautang, at pagtatayo ng kalayaang pang-ekonomiya.",
  "Find English language classes, from free community programs to online learning platforms.":
    "Maghanap ng mga klase sa wikang Ingles, mula sa mga libreng programa ng komunidad hanggang sa mga online na platform sa pag-aaral.",
  "Earn your high school equivalency diploma through the GED test, with study resources and tips.":
    "Kumita ng iyong diploma ng high school equivalency sa pamamagitan ng GED test, na may mga mapagkukunan sa pag-aaral at mga tip.",
  "Find and apply for scholarships, grants, and financial aid to fund your education.":
    "Maghanap at mag-apply para sa mga scholarship, grant, at financial aid upang pondohan ang iyong edukasyon.",
  "Top platforms for learning new skills, earning certificates, and advancing your career online.":
    "Mga nangungunang platform para sa pag-aaral ng mga bagong kasanayan, pagkita ng mga sertipiko, at pagpapabuti ng iyong karera online.",
  "Vocational training and trade school options for high-demand careers with shorter training periods.":
    "Mga opsyon sa bokasyonal na pagsasanay at paaralan ng kalakalan para sa mga karera na mataas ang demand na may mas maikling panahon ng pagsasanay.",
  "Recognize and avoid common scams targeting immigrants, from phone fraud to fake services.":
    "Kilalanin at iwasan ang mga karaniwang scam na nakatutok sa mga imigrante, mula sa pandaraya sa telepono hanggang sa mga pekeng serbisyo.",
  "Safety planning, resources, and legal protections for victims of domestic violence.":
    "Pagpaplano ng kaligtasan, mga mapagkukunan, at mga legal na proteksyon para sa mga biktima ng domestic violence.",
  "What to do if ICE comes to your home, workplace, or you are stopped in public.":
    "Kung ano ang gagawin kung dumating ang ICE sa iyong bahay, lugar ng trabaho, o ikaw ay nahinto sa pampublikong lugar.",
  "Create a family emergency plan that prepares you for natural disasters, separation, or crisis situations.":
    "Gumawa ng plano ng emergency ng pamilya na naghahanda sa iyo para sa mga kalamidad, hiwalayan, o mga sitwasyon ng krisis.",
  "Protect yourself from online scams, identity theft, and digital privacy threats.":
    "Protektahan ang iyong sarili mula sa mga online na scam, pagnanakaw ng pagkakakilanlan, at mga banta sa digital na privacy.",
  "Navigating culture shock, adapting to American customs, and maintaining your cultural identity.":
    "Pag-navigate sa culture shock, pag-aangkop sa mga kaugaliang Amerikano, at pagpapanatili ng iyong pagkakakilanlang kultural.",
  "How to build a social network, find support groups, and create belonging in your new home.":
    "Kung paano magtayo ng social network, maghanap ng mga grupo ng suporta, at lumikha ng pakiramdam ng pagmamay-ari sa iyong bagong tahanan.",
  "Find language exchange partners and programs to improve your English while sharing your language.":
    "Maghanap ng mga kapartnero sa pagpapalit ng wika at mga programa upang mapabuti ang iyong Ingles habang ibinabahagi ang iyong wika.",
  "Finding religious communities and faith-based organizations that support immigrants.":
    "Paghahanap ng mga relihiyosong komunidad at mga organisasyong nakabatay sa pananampalataya na sumusuporta sa mga imigrante.",
  "Give back to your community while building skills, connections, and experience.":
    "Magbalik sa iyong komunidad habang nagtatayo ng mga kasanayan, koneksyon, at karanasan.",
  "Understanding your rights as a gig worker, including rideshare, delivery, and freelance work.":
    "Pag-unawa sa iyong mga karapatan bilang isang gig worker, kabilang ang rideshare, delivery, at freelance na trabaho.",
  "Understanding minimum wage, overtime, breaks, and other workplace protections under federal and state law.":
    "Pag-unawa sa minimum wage, overtime, mga pahinga, at iba pang mga proteksyon sa lugar ng trabaho sa ilalim ng batas pederal at ng estado.",
  "Recognizing and recovering stolen wages, and how to report employers who don't pay fairly.":
    "Pagkilala at pagbawi ng mga ninakaw na sahod, at kung paano iulat ang mga employer na hindi nagbabayad nang patas.",
  "What unions are, how they protect workers, and how to organize or join one in your workplace.":
    "Kung ano ang mga unyon, kung paano sila nagpoprotekta sa mga manggagawa, at kung paano mag-organisa o sumali sa isa sa iyong lugar ng trabaho.",
  "Comprehensive guide to maintaining work authorization, changing employers, and compliance requirements.":
    "Komprehensibong gabay sa pagpapanatili ng authorization ng trabaho, pagpapalit ng mga employer, at mga kinakailangan sa pagsunod sa mga patakaran.",
};

// ─── Article content translations ────────────────────────────────────
// Lingala content translations for articles
const lnContent = {
  // tax articles
  "## Understanding Tax Filing\n\nFiling your taxes doesn't have to be overwhelming. Here's what every immigrant in the US needs to know.\n\n### Key Deadlines\n- **April 15**: Standard filing deadline for most taxpayers\n- **October 15**: Extended filing deadline (file Form 4868 by April 15)\n- **Quarterly**: Estimated tax payments due April 15, June 15, September 15, and January 15\n\n### Who Must File?\nYou must file a federal tax return if your gross income exceeds the standard deduction for your filing status. For 2024, these thresholds are:\n- Single: $14,600\n- Married Filing Jointly: $29,200\n- Head of Household: $21,900\n\n### Documents You Need\n- **W-2** forms from every employer\n- **1099** forms for freelance or contract income\n- **1099-INT** for bank interest\n- Social Security numbers for you and dependents\n- Last year's tax return for reference\n\n### Free Filing Options\n- **IRS Free File**: Federal return free if income is under $79,000\n- **VITA Program**: Free in-person preparation at community sites\n- **TCE Program**: Free help for taxpayers 60 and older\n\n### Direct Deposit for Faster Refund\nProviding your bank routing and account numbers on your return can speed up your refund by up to 3 weeks compared to a paper check.":
    "## Monana Ekombi ya Kolanda Impôt\n\nKolanda impôt na bino ezali na monana te. Naini ya monana na imigrante na US.\n\n### Siku ya Siku\n- **Siku 15 ya Mwezi 4**: Siku ya standard ya kolanda\n- **Siku 15 ya Mwezi 10**: Siku ya extension (kolanda Form 4868 na siku 15 ya mwezi 4)\n- **Quarterly**: Paiement ya impôt na siku 15 ya mwezi 4, 6, 9, na 1\n\n### Naini ya Kolanda?\nOko kolanda retour d'impôt fédéral soki salaire brut ya ngai ezali na standard déduction ya status ya ngai. Na 2024, seuls ya:\n- Single: $14,600\n- Married: $29,200\n- Head of Household: $21,900\n\n### Papie ya Ngai\n- **W-2** ya employer nyoso\n- **1099** ya freelance na contrat\n- **1099-INT** ya intérêt banque\n- Social Security number ya ngai na dependants\n- Retour d'impôt ya mwaka ya libikolo\n\n### Kolanda ya Libela\n- **IRS Free File**: Retour fédéral libela soki salaire ezali na $79,000\n- **VITA Program**: Kolanda libela na communautés\n- **TCE Program**: Bikisi libela ya bato 60+ na libikolo\n\n### Direct Deposit\nKosenda numéro banque na retour d'impôt na bino ekoki na retour d'impôt na siku 3 libikolo na monana chèque ya papie.",

  "## Maximizing Your Tax Deductions\n\nUnderstanding deductions can save you hundreds or even thousands of dollars on your tax return.\n\n### Standard vs. Itemized Deductions\nThe **standard deduction** is a fixed amount based on your filing status. Most taxpayers take this because it's simpler. Itemize only if your deductible expenses exceed the standard deduction.\n\n### Common Itemized Deductions\n- **State and local taxes (SALT)**: Up to $10,000\n- **Mortgage interest**: On loans up to $750,000\n- **Charitable contributions**: Cash donations up to 60% of AGI\n- **Medical expenses**: Exceeding 7.5% of AGI\n\n### Above-the-Line Deductions\nThese reduce your adjusted gross income (AGI) even if you take the standard deduction:\n- **Student loan interest**: Up to $2,500 per year\n- **IRA contributions**: Up to $7,000 ($8,000 if over 50)\n- **Health Savings Account (HSA)**: Up to $4,150 individual / $8,300 family\n- **Self-employed health insurance**: Premiums you pay\n\n### Tax Credits (Better Than Deductions)\nCredits reduce your tax bill dollar-for-dollar:\n- **Earned Income Tax Credit (EITC)**: Up to $7,430 for families\n- **Child Tax Credit**: $2,000 per qualifying child\n- **American Opportunity Credit**: Up to $2,500 for education\n- **Child and Dependent Care Credit**: Up to $2,100\n\n### Common Mistakes to Avoid\n- Don't forget to report all income, including cash tips\n- Keep receipts for at least 3 years\n- Don't inflate charitable contributions":
    "## Kokanisa Déduction ya Impôt na Ngai\n\nMonana déduction ekoki na kolanda $500 na $2,000 na retour d'impôt na ngai.\n\n### Standard vs. Itemized Deduction\n**Standard deduction** ezali montant ya fixe na status ya kolanda. Bato nyoso kolanda sé because ezali simple. Itemize soki frais ya deductible ezali na standard deduction.\n\n### Itemized Déduction ya Siku\n- **Impôt ya état (SALT)**: Na $10,000\n- **Intérêt mortgage**: Na prêt $750,000\n- **Contributions charitables**: Dons na cash na 60% ya AGI\n- **Frais médicaux**: Na 7.5% ya AGI\n\n### Above-the-Line Déduction\nDéduction na yeki kolanda AGI na bino:\n- **Intérêt prêt étudiant**: Na $2,500 na mwaka\n- **Contributions IRA**: Na $7,000 ($8,000 soki 50+)\n- **Health Savings Account (HSA)**: Na $4,150 individuel / $8,300 famille\n- **Assurance maladie self-employed**: Prime na bino kolaka\n\n### Crédit d'Impôt (Mboti na Déduction)\nCrédit kolaka facture d'impôt na bino:\n- **Earned Income Tax Credit (EITC)**: Na $7,430 ya familles\n- **Child Tax Credit**: $2,000 na mwana ya qualifié\n- **American Opportunity Credit**: Na $2,500 ya éducation\n- **Child and Dependent Care Credit**: Na $2,100\n\n### Mpasi ya Siku ya Kokende\n- Koboya kosala tout revenu, kaka pourboires cash\n- Koka reçus na siku 3 na libikolo\n- Koboya kontribution charitables",

  "## Self-Employment Tax Guide\n\nIf you earn income outside of traditional employment, you have additional tax responsibilities.\n\n### Who Is Self-Employed?\n- Freelancers and independent contractors\n- Rideshare and delivery drivers (Uber, Lyft, DoorDash)\n- Small business owners\n- Gig workers\n- Home-based business operators\n\n### Self-Employment Tax\nAs a self-employed person, you pay **both** the employer and employee portions of Social Security and Medicare taxes:\n- Social Security: 12.4%\n- Medicare: 2.9%\n- **Total: 15.3%** on net earnings\n\n### Quarterly Estimated Taxes\nIf you expect to owe $1,000 or more in taxes, you must make quarterly payments:\n- **Form 1040-ES** for calculating payments\n- Due: April 15, June 15, September 15, January 15\n- Use **IRS Direct Pay** or **EFTPS** for electronic payments\n\n### Deductions for Self-Employed\n- **Home office deduction**: Dedicated workspace in your home\n- **Vehicle expenses**: Standard mileage rate (67 cents/mile for 2024) or actual expenses\n- **Internet and phone**: Business-use percentage\n- **Professional development**: Courses, books, conferences\n- **Health insurance premiums**: If not eligible for employer coverage\n\n### Record Keeping\n- Use accounting software (QuickBooks, Wave, FreshBooks)\n- Keep all receipts and invoices\n- Track mileage with a phone app\n- Separate personal and business bank accounts\n\n### Filing Forms\n- **Schedule C (Form 1040)**: Report business income and expenses\n- **Schedule SE**: Calculate self-employment tax\n- **Form 1040-ES**: Quarterly estimated payments":
    "## Lilongi ya Impôt ya Self-Employed\n\nSoki ozali na salaire na travail, ozali na obligasyon ya impôt ya additionnel.\n\n### Naini Self-Employed?\n- Freelancers na contractors indépendants\n- Conducteurs rideshare na livraison (Uber, Lyft, DoorDash)\n- Propriétaires ya bisnis ya moko\n- Travailleurs ya gig\n- Opérateurs ya bisnis na ndako\n\n### Impôt ya Self-Employed\nNa bino ozali self-employed, obayaka portion ya employer na employé ya Social Security na Medicare:\n- Social Security: 12.4%\n- Medicare: 2.9%\n- **Total: 15.3%** na bénéfice net\n\n### Impôt Quarterly\nSoki ozali na dettes ya $1,000+ na impôt, okolaka paiement quarterly:\n- **Form 1040-ES** ya calcul paiement\n- Échéance: Siku 15 mwezi 4, 6, 9, 1\n- Kolanda **IRS Direct Pay** na **EFTPS** ya paiement électronique\n\n### Déduction ya Self-Employed\n- **Déduction bureau**: Workspace na ndako na ngai\n- **Frais véhicule**: Tarif mileage standard (67 cents/mile na 2024) na frais réel\n- **Internet na téléphone**: Pourcentage ya usage bisnis\n- **Développement professionnel**: Cours, livres, conférences\n- **Prime assurance maladie**: Soki ozali na éligibilité ya employer\n\n### Conservation ya Enregistrements\n- Kolanda logiciel ya comptabilité (QuickBooks, Wave, FreshBooks)\n- Koka tous reçus na factures\n- Suivre mileage na application téléphone\n- Séparer comptes bancaires personnels na bisnis\n\n### Formulaires ya Kolanda\n- **Schedule C (Form 1040)**: Sosaler revenu na frais bisnis\n- **Schedule SE**: Calculer impôt self-employment\n- **Form 1040-ES**: Paiements trimestriels estimés",

  "## How Tax Refunds Work\n\nA tax refund means you overpaid taxes throughout the year. Here's how to understand and maximize yours.\n\n### Why You Get a Refund\n- Too much tax withheld from paychecks (Form W-4 adjustment)\n- Eligible for refundable tax credits (EITC, Child Tax Credit)\n- Overpaid estimated quarterly taxes\n\n### Average Refund\nThe average federal tax refund is typically between $2,000 and $3,000. While getting a refund feels good, it means you gave the government an interest-free loan.\n\n### Faster Refund Options\n- **E-file with direct deposit**: Refund in 21 days or less\n- **Avoid paper filing**: Can add 4-6 weeks to processing\n- **Use IRS Free File**: Available if income under $79,000\n- **Check early**: File as soon as possible after January 31\n\n### Track Your Refund\n- **Where's My Refund?** tool on IRS.gov\n- **IRS2Go app** for mobile tracking\n- Available 24 hours after e-filing or 4 weeks after mailing\n\n### Refund Timing\n- E-file + direct deposit: **21 days**\n- E-file + mailed check: **4-6 weeks**\n- Paper filed + direct deposit: **6-8 weeks**\n- Paper filed + mailed check: **8-12 weeks**\n\n### Adjusting Withholding\nIf you consistently get large refunds, adjust your **W-4** with your employer to have less tax withheld. This puts more money in each paycheck.\n\n### Common Refund Delays\n- Errors on the return\n- Incomplete information\n- Identity verification required\n- Injured Spouse or Innocent Spouse claims\n- Earned Income Credit or Additional Child Tax Credit (pathAct)":
    "## Ekombi ya Retour d'Impôt\n\nRetour d'impôt ezali na bino ozali na overpayment ya impôt na mwaka. Naini ya monana na kokanisa retour d'impôt na bino.\n\n### Naini ozali na Retour d'Impôt\n- Overwithholding na salaire (ajustement Form W-4)\n- Éligibilité ya crédit d'impôt remboursable (EITC, Child Tax Credit)\n- Overpayment ya impôt estimés quarterly\n\n### Retour d'Impôt Moyen\nRetour d'impôt fédéral moyen ezali na $2,000 na $3,000. Soki retour d'impôt ezali mpono te, ezali na bino ozali na prêt sans intérêt na gouvernement.\n\n### Ekombi ya Retour d'Impôt Rapide\n- **E-file na direct deposit**: Retour d'impôt na siku 21 na libikolo\n- **Koboya papier filing**: Ekoki na siku 4-6 na traitement\n- **Kolanda IRS Free File**: Disponible soki salaire ezali na $79,000\n- **Monana na siku**: Kolanda na siku na bino na 31 mwezi 1\n\n### Suivre Retour d'Impôt na Bino\n- **Où est mon remboursement?** na IRS.gov\n- **IRS2Go app** ya mobile tracking\n- Disponible siku 24 na e-filing na siku 4 na envoi postal\n\n### Timing ya Retour d'Impôt\n- E-file + direct deposit: **siku 21**\n- E-file + chèque postal: **siku 4-6**\n- Papier + direct deposit: **siku 6-8**\n- Papier + chèque postal: **siku 8-12**\n\n### Ajustement ya Retour d'Impôt\nSoki ozali na retour d'impôt na moko na mwaka, ajouter **W-4** na bino na employer na kolaka overwithholding na bino. Ezali na bino ozali na salaire na moko.\n\n### Mpasi ya Retour d'Impôt ya Siku\n- Errors na retour\n- Informations incomplètes\n- Vérification d'identité requis\n- Claims Injured Spouse na Innocent Spouse\n- Earned Income Credit na Additional Child Tax Credit (pathAct)",

  "## Understanding State Income Tax\n\nYour federal return is just the beginning. Many states also require a separate tax return.\n\n### States With No Income Tax\n- **Alaska**\n- **Florida**\n- **Nevada**\n- **New Hampshire** (taxes only interest and dividends above $4,000)\n- **South Dakota**\n- **Tennessee** (taxes only interest and dividends above $1,250)\n- **Texas**\n- **Washington**\n- **Wyoming**\n\n### States With Flat Tax\nThese states tax all income at the same rate:\n- **Colorado**: 4.4%\n- **Illinois**: 4.95%\n- **Indiana**: 3.05%\n- **Michigan**: 4.25%\n- **North Carolina**: 4.5%\n- **Pennsylvania**: 3.07%\n\n### States With Highest Tax Rates\n- **California**: Up to 13.3%\n- **New York**: Up to 10.9%\n- **New Jersey**: Up to 10.75%\n- **Hawaii**: Up to 11%\n- **Oregon**: Up to 9.9%\n\n### Filing Requirements\n- Most states require filing if income exceeds the state standard deduction\n- Some states (like PA) have no standard deduction\n- State returns are typically due April 15 (same as federal)\n- Some states offer free filing options\n\n### Important Notes for Immigrants\n- Your state of residence on December 31 determines your state filing\n- If you moved during the year, you may need to file part-year returns in both states\n- Some states don't conform to federal rules on deductions and credits\n\n### Where to Get Help\n- State tax agency websites\n- VITA sites (many prepare state returns too)\n- Tax preparation software (many include state filing)":
    "## Monana Impôt ya État\n\nRetour fédéral na bino ezali na natangi te. État nyoso ezali na retour d'impôt ya séparé te.\n\n### État na Nazalaka Impôt\n- **Alaska**\n- **Florida**\n- **Nevada**\n- **New Hampshire** (impôt intérêt na dividendes na $4,000)\n- **South Dakota**\n- **Tennessee** (impôt intérêt na dividendes na $1,250)\n- **Texas**\n- **Washington**\n- **Wyoming**\n\n### État na Flat Tax\nÉtat na yeki kolaka impôt na tous revenus na tarif ya moko:\n- **Colorado**: 4.4%\n- **Illinois**: 4.95%\n- **Indiana**: 3.05%\n- **Michigan**: 4.25%\n- **North Carolina**: 4.5%\n- **Pennsylvania**: 3.07%\n\n### État na Impôt ya Plus\n- **California**: Na 13.3%\n- **New York**: Na 10.9%\n- **New Jersey**: Na 10.75%\n- **Hawaii**: Na 11%\n- **Oregon**: Na 9.9%\n\n### Exigences ya Kolanda\n- État nyoso kolaka kolanda soki salaire ezali na standard déduction ya état\n- État mingi (kaka PA) nazalaka standard déduction\n- Retour d'impôt état ezali na siku 15 mwezi 4 (na fédéral)\n- État mingi kolaka kolanda libela\n\n### Makamshi ya Importants ya Imigrante\n- État ya résidence na bino na siku 31 mwezi 12 ezali na état ya kolanda\n- Soki ozali na déménagement na mwaka, ozali na kolaka retour part-year na état nyoso\n- État mingi nazalaka conformité na lolongo fédéral ya déduction na crédit\n\n### Monie ya Bikisi\n- Site web ya agence d'impôt ya état\n- Site VITA (mingi kolaka retour d'impôt état)\n- Logiciel ya préparation d'impôt (mingi kolaka filing état)",
};

// Tagalog content translations for articles
const tlContent = {
  "## Understanding Tax Filing\n\nFiling your taxes doesn't have to be overwhelming. Here's what every immigrant in the US needs to know.\n\n### Key Deadlines\n- **April 15**: Standard filing deadline for most taxpayers\n- **October 15**: Extended filing deadline (file Form 4868 by April 15)\n- **Quarterly**: Estimated tax payments due April 15, June 15, September 15, and January 15\n\n### Who Must File?\nYou must file a federal tax return if your gross income exceeds the standard deduction for your filing status. For 2024, these thresholds are:\n- Single: $14,600\n- Married Filing Jointly: $29,200\n- Head of Household: $21,900\n\n### Documents You Need\n- **W-2** forms from every employer\n- **1099** forms for freelance or contract income\n- **1099-INT** for bank interest\n- Social Security numbers for you and dependents\n- Last year's tax return for reference\n\n### Free Filing Options\n- **IRS Free File**: Federal return free if income is under $79,000\n- **VITA Program**: Free in-person preparation at community sites\n- **TCE Program**: Free help for taxpayers 60 and older\n\n### Direct Deposit for Faster Refund\nProviding your bank routing and account numbers on your return can speed up your refund by up to 3 weeks compared to a paper check.":
    "## Pag-unawa sa Paghahain ng Buwis\n\nAng paghahain ng iyong buwis ay hindi kailangang maging napakabigat. Narito ang kailangan mong malaman:\n\n### Mga Pangunahing Deadline\n- **Abril 15**: Standard filing deadline para sa karamihan ng mga nagbabayad ng buwis\n- **Oktubre 15**: Extended filing deadline (i-file ang Form 4868 bago ang Abril 15)\n- **Quarterly**: Tinatayang pagbabayad ng buwis (kung self-employed)\n\n### Sino ang Dapat Mag-file?\nDapat kang mag-file ng federal tax return kung ang iyong gross income ay lumampas sa standard deduction para sa iyong filing status. Para sa 2024, ang mga threshold na ito ay:\n- Single: $14,600\n- Married Filing Jointly: $29,200\n- Head of Household: $21,900\n\n### Mga Dokumentong Kailangan Mo\n- **W-2** forms mula sa mga employer\n- **1099** forms para sa ibang kita\n- **1099-INT** para sa interes sa bangko\n- Social Security numbers para sa mga dependent\n- Impormasyon ng bank account para sa direct deposit\n\n### Mga Libreng Opsyon sa Paghahain\n- **IRS Free File**: Libre ang federal return kung ang kita ay nasa ilalim ng $73,000\n- **VITA program** para sa mga kwalipikadong nagbabayad ng buwis\n- **Military OneSource** para sa mga miyembro ng serbisyo\n\n### Direct Deposit para sa Mas Mabilis na Refund\nAng pagbibigay ng iyong bank routing at account numbers sa iyong return ay maaaring pabilisin ang iyong refund hanggang 3 linggo kumpara sa papel na tseke.",

  "## Maximizing Your Tax Deductions\n\nUnderstanding deductions can save you hundreds or even thousands of dollars on your tax return.\n\n### Standard vs. Itemized Deductions\nThe **standard deduction** is a fixed amount based on your filing status. Most taxpayers take this because it's simpler. Itemize only if your deductible expenses exceed the standard deduction.\n\n### Common Itemized Deductions\n- **State and local taxes (SALT)**: Up to $10,000\n- **Mortgage interest**: On loans up to $750,000\n- **Charitable contributions**: Cash donations up to 60% of AGI\n- **Medical expenses**: Exceeding 7.5% of AGI\n\n### Above-the-Line Deductions\nThese reduce your adjusted gross income (AGI) even if you take the standard deduction:\n- **Student loan interest**: Up to $2,500 per year\n- **IRA contributions**: Up to $7,000 ($8,000 if over 50)\n- **Health Savings Account (HSA)**: Up to $4,150 individual / $8,300 family\n- **Self-employed health insurance**: Premiums you pay\n\n### Tax Credits (Better Than Deductions)\nCredits reduce your tax bill dollar-for-dollar:\n- **Earned Income Tax Credit (EITC)**: Up to $7,430 for families\n- **Child Tax Credit**: $2,000 per qualifying child\n- **American Opportunity Credit**: Up to $2,500 for education\n- **Child and Dependent Care Credit**: Up to $2,100\n\n### Common Mistakes to Avoid\n- Don't forget to report all income, including cash tips\n- Keep receipts for at least 3 years\n- Don't inflate charitable contributions":
    "## Pag-maximize ng Iyong mga Deduction sa Buwis\n\nAng pag-unawa sa mga deduction ay makakapagligtas sa iyo ng daan-daang o libo-libong dolyar sa iyong tax return.\n\n### Standard vs. Itemized Deductions\nAng **standard deduction** ay isang fixed na halaga batay sa iyong filing status. Karamihan ng mga nagbabayad ng buwis ay gumagamit nito dahil mas simple. I-itemize lamang kung ang iyong mga gastos na mababawasan ay lumampas sa standard deduction.\n\n### Mga Karaniwang Itemized Deductions\n- **State at local na buwis (SALT)**: Hanggang $10,000\n- **Interes sa mortgage**: Sa mga loan hanggang $750,000\n- **Mga kontribusyon sa charity**: Mga donasyong cash hanggang 60% ng AGI\n- **Mga gastos medikal**: Lumampas sa 7.5% ng AGI\n\n### Above-the-Line Deductions\nBinabawasan nito ang iyong adjusted gross income (AGI) kahit na gamitin mo ang standard deduction:\n- **Interes sa student loan**: Hanggang $2,500 bawat taon\n- **Mga kontribusyon sa IRA**: Hanggang $7,000 ($8,000 kung lampas sa 50)\n- **Health Savings Account (HSA)**: Hanggang $4,150 indibidwal / $8,300 pamilya\n- **Health insurance ng self-employed**: Mga premium na iyong binabayaran\n\n### mga Tax Credit (Mas Mainam kaysa Deduction)\nBinabawasan ng mga credit ang iyong buwis dolyar sa dolyar:\n- **Earned Income Tax Credit (EITC)**: Hanggang $7,430 para sa mga pamilya\n- **Child Tax Credit**: $2,000 bawat kwalipikadong bata\n- **American Opportunity Credit**: Hanggang $2,500 para sa edukasyon\n- **Child and Dependent Care Credit**: Hanggang $2,100\n\n### Mga Karaniwang Pagkakamali na Dapat Iwasan\n- Huwag kalimutang iulat ang lahat ng kita, kabilang ang mga tip na cash\n- Itago ang mga resibo sa loob ng hindi bababa sa 3 taon\n- Huwag palakihin ang mga kontribusyon sa charity",

  "## Self-Employment Tax Guide\n\nIf you earn income outside of traditional employment, you have additional tax responsibilities.\n\n### Who Is Self-Employed?\n- Freelancers and independent contractors\n- Rideshare and delivery drivers (Uber, Lyft, DoorDash)\n- Small business owners\n- Gig workers\n- Home-based business operators\n\n### Self-Employment Tax\nAs a self-employed person, you pay **both** the employer and employee portions of Social Security and Medicare taxes:\n- Social Security: 12.4%\n- Medicare: 2.9%\n- **Total: 15.3%** on net earnings\n\n### Quarterly Estimated Taxes\nIf you expect to owe $1,000 or more in taxes, you must make quarterly payments:\n- **Form 1040-ES** for calculating payments\n- Due: April 15, June 15, September 15, January 15\n- Use **IRS Direct Pay** or **EFTPS** for electronic payments\n\n### Deductions for Self-Employed\n- **Home office deduction**: Dedicated workspace in your home\n- **Vehicle expenses**: Standard mileage rate (67 cents/mile for 2024) or actual expenses\n- **Internet and phone**: Business-use percentage\n- **Professional development**: Courses, books, conferences\n- **Health insurance premiums**: If not eligible for employer coverage\n\n### Record Keeping\n- Use accounting software (QuickBooks, Wave, FreshBooks)\n- Keep all receipts and invoices\n- Track mileage with a phone app\n- Separate personal and business bank accounts\n\n### Filing Forms\n- **Schedule C (Form 1040)**: Report business income and expenses\n- **Schedule SE**: Calculate self-employment tax\n- **Form 1040-ES**: Quarterly estimated payments":
    "## Gabay sa Buwis ng Self-Employed\n\nKung kumikita ka ng kita sa labas ng tradisyonal na trabaho, mayroon kang mga karagdagang obligasyon sa buwis.\n\n### Sino ang Self-Employed?\n- Mga freelancer at independent contractor\n- Mga driver ng rideshare at delivery (Uber, Lyft, DoorDash)\n- Mga may-ari ng maliit na negosyo\n- Mga gig worker\n- Mga operator ng negosyo sa bahay\n\n### Buwis ng Self-Employed\nBilang isang self-employed na tao, nagbabayad ka ng **parehong** bahagi ng employer at empleyado ng Social Security at Medicare:\n- Social Security: 12.4%\n- Medicare: 2.9%\n- **Kabuuan: 15.3%** sa netong kita\n\n### Quarterly na Tinatayang Buwis\nKung inaasahan mong may utang kang $1,000 o higit pa sa buwis, dapat kang magbayad ng quarterly:\n- **Form 1040-ES** para sa pagkalkula ng mga bayarin\n- Huling araw: Abril 15, Hunyo 15, Setyembre 15, Enero 15\n- Gamitin ang **IRS Direct Pay** o **EFTPS** para sa elektronikong pagbabayad\n\n### Mga Deduction para sa Self-Employed\n- **Deduction sa home office**: Nakalaang workspace sa iyong bahay\n- **Mga gastos sa sasakyan**: Standard mileage rate (67 sentimo/milya para sa 2024) o aktwal na mga gastos\n- **Internet at telepono**: Porsyento ng paggamit sa negosyo\n- **Propesyonal na pag-unlad**: Mga kurso, libro, kumperensya\n- **Mga premium ng health insurance**: Kung hindi kwalipikado sa saklaw ng employer\n\n### Pag-iingat ng mga Talaan\n- Gumamit ng accounting software (QuickBooks, Wave, FreshBooks)\n- Itago ang lahat ng resibo at invoice\n- Subaybayan ang mileage gamit ang app sa telepono\n- Paghiwalayin ang personal at negosyong bank account\n\n### Mga Form ng Paghahain\n- **Schedule C (Form 1040)**: Iulat ang kita at gastos ng negosyo\n- **Schedule SE**: Kalkulahin ang buwis ng self-employment\n- **Form 1040-ES**: Quarterly na tinatayang mga bayarin",

  "## How Tax Refunds Work\n\nA tax refund means you overpaid taxes throughout the year. Here's how to understand and maximize yours.\n\n### Why You Get a Refund\n- Too much tax withheld from paychecks (Form W-4 adjustment)\n- Eligible for refundable tax credits (EITC, Child Tax Credit)\n- Overpaid estimated quarterly taxes\n\n### Average Refund\nThe average federal tax refund is typically between $2,000 and $3,000. While getting a refund feels good, it means you gave the government an interest-free loan.\n\n### Faster Refund Options\n- **E-file with direct deposit**: Refund in 21 days or less\n- **Avoid paper filing**: Can add 4-6 weeks to processing\n- **Use IRS Free File**: Available if income under $79,000\n- **Check early**: File as soon as possible after January 31\n\n### Track Your Refund\n- **Where's My Refund?** tool on IRS.gov\n- **IRS2Go app** for mobile tracking\n- Available 24 hours after e-filing or 4 weeks after mailing\n\n### Refund Timing\n- E-file + direct deposit: **21 days**\n- E-file + mailed check: **4-6 weeks**\n- Paper filed + direct deposit: **6-8 weeks**\n- Paper filed + mailed check: **8-12 weeks**\n\n### Adjusting Withholding\nIf you consistently get large refunds, adjust your **W-4** with your employer to have less tax withheld. This puts more money in each paycheck.\n\n### Common Refund Delays\n- Errors on the return\n- Incomplete information\n- Identity verification required\n- Injured Spouse or Innocent Spouse claims\n- Earned Income Credit or Additional Child Tax Credit (pathAct)":
    "## Paano Gumagana ang mga Refund ng Buwis\n\nAng tax refund ay nangangahulugang nag-overpay ka ng buwis sa buong taon. Narito kung paano maunawaan at ma-maximize ang sa iyo.\n\n### Bakit Ka Nakakakuha ng Refund\n- Napakaraming buwis na ibinawas sa mga sahod (adjustment ng Form W-4)\n- Kwalipikado para sa mga refundable na tax credit (EITC, Child Tax Credit)\n- Nag-overpay sa mga tinatayang quarterly na buwis\n\n### Average na Refund\nAng average na federal tax refund ay karaniwang nasa pagitan ng $2,000 at $3,000. Habang nakakaramdam ng mabuti ang pagkakuha ng refund, nangangahulugang nagbigay ka ng walang-interes na utang sa gobyerno.\n\n### Mga Opsyon para sa Mas Mabilis na Refund\n- **E-file na may direct deposit**: Refund sa 21 araw o mas mababa\n- **Iwasan ang papel na filing**: Maaaring magdagdag ng 4-6 linggo sa proseso\n- **Gamitin ang IRS Free File**: Available kung ang kita ay nasa ilalim ng $79,000\n- **Suriin nang maaga**: Mag-file hangga't maaari pagkatapos ng Enero 31\n\n### Subaybayan ang Iyong Refund\n- **Nasaan ang Aking Refund?** tool sa IRS.gov\n- **IRS2Go app** para sa mobile tracking\n- Available 24 oras pagkatapos ng e-filing o 4 linggo pagkatapos ng pagpapadala\n\n### Oras ng Refund\n- E-file + direct deposit: **21 araw**\n- E-file + tseke sa koreo: **4-6 linggo**\n- Papel + direct deposit: **6-8 linggo**\n- Papel + tseke sa koreo: **8-12 linggo**\n\n### Pag-a-adjust ng Withholding\nKung palagi kang nakakakuha ng malalaking refund, i-adjust ang iyong **W-4** sa iyong employer upang mabawasan ang ibinabawas na buwis. Naglalagay ito ng mas maraming pera sa bawat sahod.\n\n### Mga Karaniwang Pagkaantala ng Refund\n- Mga error sa return\n- Hindi kumpletong impormasyon\n- Kailangan ng pag-verify ng pagkakakilanlan\n- mga claim ng Injured Spouse o Innocent Spouse\n- Earned Income Credit o Additional Child Tax Credit (pathAct)",

  "## Understanding State Income Tax\n\nYour federal return is just the beginning. Many states also require a separate tax return.\n\n### States With No Income Tax\n- **Alaska**\n- **Florida**\n- **Nevada**\n- **New Hampshire** (taxes only interest and dividends above $4,000)\n- **South Dakota**\n- **Tennessee** (taxes only interest and dividends above $1,250)\n- **Texas**\n- **Washington**\n- **Wyoming**\n\n### States With Flat Tax\nThese states tax all income at the same rate:\n- **Colorado**: 4.4%\n- **Illinois**: 4.95%\n- **Indiana**: 3.05%\n- **Michigan**: 4.25%\n- **North Carolina**: 4.5%\n- **Pennsylvania**: 3.07%\n\n### States With Highest Tax Rates\n- **California**: Up to 13.3%\n- **New York**: Up to 10.9%\n- **New Jersey**: Up to 10.75%\n- **Hawaii**: Up to 11%\n- **Oregon**: Up to 9.9%\n\n### Filing Requirements\n- Most states require filing if income exceeds the state standard deduction\n- Some states (like PA) have no standard deduction\n- State returns are typically due April 15 (same as federal)\n- Some states offer free filing options\n\n### Important Notes for Immigrants\n- Your state of residence on December 31 determines your state filing\n- If you moved during the year, you may need to file part-year returns in both states\n- Some states don't conform to federal rules on deductions and credits\n\n### Where to Get Help\n- State tax agency websites\n- VITA sites (many prepare state returns too)\n- Tax preparation software (many include state filing)":
    "## Pag-unawa sa Buwis ng Kita ng Estado\n\nAng iyong federal return ay nagsisimula pa lamang. Maraming estado ang nangangailangan ng hiwalay na tax return.\n\n### Mga Estado na Walang Buwis sa Kita\n- **Alaska**\n- **Florida**\n- **Nevada**\n- **New Hampshire** (tinatax lamang ang interes at dividend na lampas sa $4,000)\n- **South Dakota**\n- **Tennessee** (tinatax lamang ang interes at dividend na lampas sa $1,250)\n- **Texas**\n- **Washington**\n- **Wyoming**\n\n### Mga Estado na may Flat Tax\nAng mga estado na ito ay nagpapataw ng buwis sa lahat ng kita sa parehong halaga:\n- **Colorado**: 4.4%\n- **Illinois**: 4.95%\n- **Indiana**: 3.05%\n- **Michigan**: 4.25%\n- **North Carolina**: 4.5%\n- **Pennsylvania**: 3.07%\n\n### Mga Estado na may Pinakamataas na Buwis\n- **California**: Hanggang 13.3%\n- **New York**: Hanggang 10.9%\n- **New Jersey**: Hanggang 10.75%\n- **Hawaii**: Hanggang 11%\n- **Oregon**: Hanggang 9.9%\n\n### Mga kinakailangan sa Paghahain\n- Karamihan ng mga estado ay nangangailangan ng paghahain kung ang kita ay lumampas sa standard deduction ng estado\n- Ang ilang mga estado (tulad ng PA) ay walang standard deduction\n- Ang mga return ng estado ay karaniwang bayaran hanggang Abril 15 (pareho sa federal)\n- Ang ilang mga estado ay nag-aalok ng libreng opsyon sa paghahain\n\n### Mga Mahalagang Tala para sa mga Imigrante\n- Ang iyong estado ng paninirahan noong Disyembre 31 ang tumutukoy sa iyong estado filing\n- Kung lumipat ka sa panahon ng taon, maaari kang kailanganin na mag-file ng mga part-year return sa parehong estado\n- Ang ilang mga estado ay hindi sumusunod sa mga pederal na patakaran tungkol sa mga deduction at credit\n\n### Saan Makakakuha ng Tulong\n- Mga website ng ahensya ng buwis ng estado\n- Mga site ng VITA (marami ang naghahanda rin ng return ng estado)\n- Software sa paghahanda ng buwis (marami ang may kasamang estado filing)",
};

// ─── Processing logic ────────────────────────────────────────────────
function processTranslations(enSource, targetFile, translations, contentTranslations, langName) {
  let replaced = 0;
  const replacedKeys = [];

  // Process flat keys (benefits.* and learn.* except articles)
  for (const [key, enValue] of Object.entries(enSource)) {
    if (typeof enValue !== 'string') continue;
    if (!key.startsWith('benefits.') && !key.startsWith('learn.')) continue;

    const parts = key.split('.');
    // Navigate to the correct nested object in the target
    let targetVal = targetFile;
    let found = true;
    for (const part of parts) {
      if (targetVal && typeof targetVal === 'object' && part in targetVal) {
        targetVal = targetVal[part];
      } else {
        found = false;
        break;
      }
    }

    if (!found || typeof targetVal !== 'string') continue;

    // Check if it still matches English
    if (targetVal === enValue) {
      const translated = translations[enValue];
      if (translated) {
        // Set the value
        let obj = targetFile;
        for (let i = 0; i < parts.length - 1; i++) {
          obj = obj[parts[i]];
        }
        obj[parts[parts.length - 1]] = translated;
        replaced++;
        replacedKeys.push(key);
      }
    }
  }

  // Process article content (learn.articles.*.content)
  function processArticles(articles, enArticles) {
    if (!articles || !enArticles) return;
    for (const [catKey, catVal] of Object.entries(enArticles)) {
      if (catKey === 'title' || catKey === 'description' || catKey === 'content') continue;
      if (!catVal || typeof catVal !== 'object') continue;

      const enCat = enArticles[catKey];
      const tgtCat = articles[catKey];
      if (!tgtCat) continue;

      for (const [numKey, numVal] of Object.entries(enCat)) {
        if (typeof numVal !== 'object' || !numVal) continue;
        const tgtNum = tgtCat[numKey];
        if (!tgtNum) continue;

        for (const field of ['title', 'description', 'content']) {
          if (typeof numVal[field] !== 'string') continue;
          if (typeof tgtNum[field] !== 'string') continue;

          if (tgtNum[field] === numVal[field]) {
            const translated = contentTranslations[numVal[field]] || translations[numVal[field]];
            if (translated) {
              tgtNum[field] = translated;
              replaced++;
              replacedKeys.push(`learn.articles.${catKey}.${numKey}.${field}`);
            }
          }
        }
      }
    }
  }

  if (targetFile.learn && targetFile.learn.articles && enSrc.learn && enSrc.learn.articles) {
    processArticles(targetFile.learn.articles, enSrc.learn.articles);
  }

  console.log(`[${langName}] Replaced ${replaced} strings`);
  if (replacedKeys.length > 0) {
    console.log(`[${langName}] Keys: ${replacedKeys.join(', ')}`);
  }

  return replaced;
}

// ─── Run ─────────────────────────────────────────────────────────────
const lnReplaced = processTranslations(enSrc, lnFile, lnT, lnContent, 'Lingala');
const tlReplaced = processTranslations(enSrc, tlFile, tlT, tlContent, 'Tagalog');

fs.writeFileSync(path.join(BASE, 'ln.json'), JSON.stringify(lnFile, null, 2) + '\n', 'utf8');
fs.writeFileSync(path.join(BASE, 'tl.json'), JSON.stringify(tlFile, null, 2) + '\n', 'utf8');

console.log(`\nDone! Lingala: ${lnReplaced} replaced, Tagalog: ${tlReplaced} replaced`);
