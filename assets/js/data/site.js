/**
 * site.js — all editable content, in the shape a CMS would hand it over.
 *
 * Every block on the site is one of four things: a list, a table, a rich-text
 * area, or a toggle. Nothing here is layout — swap this module for a fetch()
 * against a real backend and the components are unchanged.
 */

/**
 * Feature switches. Nothing is deleted when one is off — the page, its
 * component and its content all stay in place; only the ways in are hidden,
 * and a direct visit is sent home. Flip a flag back to true to restore it.
 */
export const features = {
  /* The management-software gateway. Off until the school's system is ready:
     hides the header button, the footer link, the Students → Student Portal
     entry and the portal button on the Students page, and closes login.html. */
  login: false,

  /* Results & Events. Off until the board figures and event write-ups are
     real: hides the nav item, the footer and home-page links, and closes
     results.html and event.html. */
  results: false,

  /* The syllabus tab of the Academic Calendar. Off until the subject PDFs are
     uploaded: hides the tab and the header dropdown entry. */
  syllabus: false,

  /* The exam schedule. Off because the routine still carries the design's
     invented dates, which run Jun 2026 – Mar 2027 and so contradict the real
     holiday list beside them. On again once the school's routine is in. */
  exams: false,
};

export const school = {
  name: 'Purba Barasat Adarsha Bidyapith',
  nameBn: 'পূর্ব বারাসাত আদর্শ বিদ্যাপীঠ',
  district: 'North 24 Parganas',
  established: 1963,
  logo: null,                       // path to a crest image; null keeps the LOGO plate
  address: ['Purba Barasat, P.O. Barasat', 'North 24 Parganas, West Bengal 700124'],
  /* Two office lines. `phone` is the first of them, so anything showing a
     single number — the footer, the PDF header, the enquiry fallback — keeps
     working unchanged. */
  phones: [
    { label: '(033) 2552 2928', href: 'tel:+913325522928' },
    { label: '(033) 2584 4601', href: 'tel:+913325844601' },
  ],
  get phone() { return this.phones[0]; },
  email: { label: 'pbab.1963@gmail.com', href: 'mailto:pbab.1963@gmail.com' },
  officeHours: 'Office hours: 10:30–16:30, Mon–Sat',
  session: 'Session 2026–27',
  /* UDISE+ code, confirmed against the national school register and matched
     to the school's WBCHSE institute code 103182. */
  diseCode: '19112301305',
  wbchseCode: '103182',
  lastUpdated: '18 Sep 2026',
};

/** The line above the masthead: what kind of school this is, at a glance. */
export const headerStrip = {
  authority: 'Government-sponsored · School Education Department, Govt. of West Bengal · Affiliated to WBBSE & WBCHSE',
  meta: [school.session, 'Office: 10:30–16:30, Mon–Sat'],
};

/** Primary navigation. `children` turns an item into a dropdown / drawer group. */
export const navigation = [
  { label: 'About Us',          bn: 'আমাদের সম্পর্কে',       href: 'about.html' },
  { label: "From HM's Desk",    bn: 'প্রধান শিক্ষকের কলম',    href: 'hm.html' },
  { label: 'Teachers',          bn: 'শিক্ষকমণ্ডলী',          href: 'teachers.html',
    children: [
      { label: 'Teaching Staff',     bn: 'শিক্ষক',           href: 'teachers.html' },
      { label: 'Non-teaching Staff', bn: 'শিক্ষাকর্মী',       href: 'teachers.html#non-teaching' },
    ] },
  { label: 'Students',          bn: 'ছাত্রছাত্রী',           href: 'students.html',
    children: [
      { label: 'Class-wise Strength', bn: 'শ্রেণিভিত্তিক',   href: 'students.html' },
      { label: 'Student Portal',      bn: 'পোর্টাল',          href: 'login.html', feature: 'login' },
    ] },
  { label: 'Admission',         bn: 'ভর্তি',                href: 'admission.html' },
  { label: 'Academic Calendar', bn: 'শিক্ষাবর্ষ পঞ্জিকা',     href: 'calendar.html',
    children: [
      { label: 'Holiday List',  bn: 'ছুটির তালিকা',          href: 'calendar.html#holidays' },
      { label: 'Exam Schedule', bn: 'পরীক্ষার সূচি',          href: 'calendar.html#exams', feature: 'exams' },
      { label: 'Syllabus',      bn: 'পাঠ্যসূচি',             href: 'calendar.html#syllabus', feature: 'syllabus' },
    ] },
  { label: 'Results & Events',  bn: 'ফলাফল ও অনুষ্ঠান',      href: 'results.html', feature: 'results' },
  { label: 'Contact Us',        bn: 'যোগাযোগ',              href: 'contact.html' },
];

/** Carousel slides. Give a slide an `image` and the hatched plate steps aside. */
export const carouselSlides = [
  /* `duotone: true` washes a photograph into the steel accent, which is the
     design system's treatment for content imagery. It is off here so the
     school's own photographs read as themselves. */
  { caption: 'Teaching and non-teaching staff, in front of the main building',
    image: 'assets/img/staff-group.jpg',
    alt: 'The teaching and non-teaching staff of Purba Barasat Adarsha Bidyapith, photographed together in front of the main school building',
    duotone: false },
  { caption: 'Science laboratory, Class XI', image: null },
  { caption: 'Annual sports day, 2026',     image: null },
  { caption: 'Library reading room',        image: null },
  { caption: 'Independence Day assembly',   image: null },
];

export const carouselIntro = {
  kicker: `Estd. ${school.established} · Govt.-sponsored · Classes V–XII`,
  title: `Welcome to ${school.name}`,
  titleBn: 'পূর্ব বারাসাত আদর্শ বিদ্যাপীঠে আপনাকে স্বাগত',
  shortMeta: `Estd. ${school.established} · Classes V–XII`,
};

/** Toggle `active` off outside the admission window. */
export const admissionBanner = {
  active: true,
  chip: 'Open now',
  title: 'Admission open for Class V — Session 2027–28',
  sub: 'ভর্তি চলছে: পঞ্চম শ্রেণি · Forms accepted 5–25 January 2027',
  cta: { label: 'Go to Admission', href: 'admission.html' },
};

/** Notices, newest first. `tone` picks the chip: 'accent' highlights, 'neutral' files. */
export const notices = [
  { id: 'n1', day: '18 Sep', year: '2026', tag: 'Holiday', tone: 'accent', href: 'notice.html#n1',
    text: 'Puja vacation: school closed from 14 Oct to 2 Nov 2026. Classes resume 3 Nov.' },
  { id: 'n2', day: '15 Sep', year: '2026', tag: 'Exam', tone: 'neutral', href: 'notice.html#n2',
    text: 'Second Summative Evaluation (S2) routine for Classes V–X published.' },
  { id: 'n3', day: '09 Sep', year: '2026', tag: 'Office', tone: 'neutral', href: 'notice.html#n3',
    text: 'Class XI registration (WBCHSE) — submit forms to the office by 20 Sep.' },
  { id: 'n4', day: '02 Sep', year: '2026', tag: 'Meeting', tone: 'neutral', href: 'notice.html#n4',
    text: 'Parent–teacher meeting for Classes IX & X on Saturday, 12 Sep, 11:00.' },
];

export const headmaster = {
  kicker: "From the HM's Desk · প্রধান শিক্ষকের কলম",
  kickerShort: "From the HM's Desk",
  name: 'Samir Acharya',
  post: 'Headmaster (HM) · M.Sc. (Chemistry), B.Ed. (First Class)',
  postShort: 'Headmaster · M.Sc. (Chemistry), B.Ed. (First Class)',
  photo: null,
  excerpt: 'Dear parents and students, a new session is a chance to begin again. Our teachers have prepared a fuller calendar of remedial classes this year, and I ask every guardian to keep the school informed of…',
  href: 'hm.html',
};

export const quickLinks = [
  { icon: 'bell',     title: 'Notice',            shortTitle: 'Notice',   bn: 'বিজ্ঞপ্তি', sub: 'All circulars & PDFs',        href: 'notice.html' },
  { icon: 'trophy',   title: 'Results',           shortTitle: 'Results',  bn: 'ফলাফল',    sub: 'Madhyamik & HS',              href: 'results.html', feature: 'results' },
  { icon: 'calendar', title: 'Academic Calendar', shortTitle: 'Calendar', bn: 'পঞ্জিকা',   sub: features.syllabus ? 'Holidays, exams, syllabus' : 'Holidays and exam schedule',
    href: 'calendar.html' },
  { icon: 'map-pin',  title: 'Contact',           shortTitle: 'Contact',  bn: 'যোগাযোগ',   sub: 'Address, phone, map',         href: 'contact.html' },
];

export const footerLinks = [
  { label: 'Notice',       href: 'notice.html' },
  { label: 'Admission',    href: 'admission.html' },
  { label: 'Results',      href: 'results.html', feature: 'results' },
  { label: 'Holiday List', href: 'calendar.html#holidays' },
  { label: 'Teachers',     href: 'teachers.html' },
  { label: 'Log In',       href: 'login.html', feature: 'login' },
];

export const affiliation =
  'Government-sponsored school under the <strong>School Education Department, Government of West Bengal</strong>. ' +
  'Affiliated to WBBSE (Madhyamik) and WBCHSE (Higher Secondary).';

/** Log-in gateway. Roles are data, so a fourth one is a single entry. */
export const loginPage = {
  kicker: 'Log In · লগ ইন',
  title: 'Sign in to the School Management Software',
  titleShort: 'School Management Software',
  intro: "Attendance, marks, fees and internal notices live in the school's management software, not on this website. Choose your role to continue — you will leave the public site.",
  introShort: 'Choose your role. You will leave the public website.',
  note: 'This opens <strong>PBAB Management Software</strong> in the same tab. Guardians without a login should contact the office.',
  noteShort: `Opens PBAB Management Software. Guardians without a login: call the office ${school.phone.label}.`,
  forgotHref: '#forgot',
};

export const loginRoles = [
  { id: 'admin', icon: 'shield', title: 'Admin / HOI', pickerLabel: 'Admin / HOI',
    sub: 'প্রশাসন · Head of Institution & office',
    idLabel: 'Admin ID', idPlaceholder: 'e.g. HOI-001', submit: 'Log In as Admin' },
  { id: 'teacher', icon: 'book', title: 'Teacher', pickerLabel: 'Teacher',
    sub: 'শিক্ষক · Attendance, marks entry',
    idLabel: 'Teacher ID', idPlaceholder: 'e.g. T-0142', submit: 'Log In as Teacher' },
  { id: 'student', icon: 'graduation-cap', title: 'Student', pickerLabel: 'Student',
    sub: 'ছাত্রছাত্রী · Attendance, marks, fees',
    idLabel: 'Student ID / Roll', idPlaceholder: 'e.g. 2026-IX-A-17', submit: 'Log In as Student' },
];

/** Which role the mobile picker opens on. */
export const defaultLoginRole = 'student';

/* ══════════════════════════════════════════════════════════════════════════
   02 — About Us · From HM's Desk · Teachers · Students
   ══════════════════════════════════════════════════════════════════════════ */

export const about = {
  kicker: '01 · About the school',
  title: 'About Us',
  titleBn: 'আমাদের সম্পর্কে',
  /* Rich-text body, from the school's own account signed by the Headmaster.
     Each entry is a heading followed by its blocks, so the office can reorder
     or add a section without touching the template. */
  sections: [
    { heading: 'About the school', blocks: [
      { type: 'p', text: 'Purba Barasat Adarsha Bidyapith stands in a pleasant setting alongside Taki Road, about one kilometre east of the Champadali Crossing in Barasat town. The school was established in 1963, inspired by the dedicated efforts of education enthusiasts from Kalikapur and the neighbouring areas.' },
      { type: 'p', text: 'Through the vision of those local patrons of education and the teaching staff, the original tiled-roof building housing just two classes — Class V and Class VI — has grown step by step into a five-storey, multipurpose Higher Secondary school teaching Science, Commerce and Arts.' },
      { type: 'p', text: 'Those who inaugurated the school by sounding its very first bell, and all who remain associated with it today — giving themselves directly and indirectly to its teaching and its growth — deserve heartfelt congratulations. Those who gave generously in many ways and are no longer with us remain fondly remembered.' },
    ] },
    { heading: 'Recognition', blocks: [
      { type: 'p', text: 'The school received government recognition in its first phase in 1965, for Classes V and VI, and in 1974 for Classes VII to X. With the approval of the West Bengal Council of Higher Secondary Education it was recognised in 1989 as a Higher Secondary school offering the Arts and Science streams; the Commerce stream was approved from the 1989–90 academic session.' },
    ] },
    { heading: 'Vocational wing', blocks: [
      { type: 'p', text: 'In August 2007 a vocational wing was introduced, affiliated to the West Bengal State Council of Vocational Education and Training. Well-equipped laboratories for these disciplines have been built with government financial assistance. The wing offers training in:' },
      { type: 'ul', items: [
        'Computer Software and Computer Hardware',
        'Information Technology',
        'Telephone and Mobile Repairing',
        'Paramedical and Health Care',
      ] },
    ] },
    { heading: 'Results and standing', blocks: [
      { type: 'p', text: "Despite a very high student enrolment and the constraints of its infrastructure, the school's results in both the Madhyamik and the Higher Secondary examinations have been notably commendable, and it has been officially designated an ‘A’ Category school." },
      { type: 'p', text: 'Following the worldwide disruption of the COVID-19 pandemic through the 2020 and 2021 academic years — which cost our students irreparably — we hope that with the warm cooperation and devotion of guardians, well-wishers, teachers and non-teaching staff, those setbacks will be overcome through the all-round development of the school.' },
    ] },
  ],
  /* The account above is published over the Headmaster's signature. */
  signature: { name: 'Samir Acharya', post: 'Headmaster', date: '01 January 2026' },

  milestones: [
    { year: '1963', text: 'School founded — two classes in a tiled-roof building' },
    { year: '1965', text: 'Government recognition, Classes V–VI' },
    { year: '1974', text: 'Recognition extended to Classes VII–X' },
    { year: '1989', text: 'Higher Secondary — Arts and Science (WBCHSE)' },
    { year: '1989–90', text: 'Commerce stream approved' },
    { year: '2007', text: 'Vocational wing affiliated to WBSCVET' },
  ],
  /* Facts only — the enrolment and staff figures elsewhere on the site are
     still placeholders, so they are deliberately not repeated here. */
  glance: [
    ['Established', '1963'],
    ['Type', 'Govt.-sponsored, co-ed'],
    ['Classes', 'V – XII'],
    ['Streams', 'Science · Commerce · Arts'],
    ['Boards', 'WBBSE · WBCHSE'],
    ['Vocational', 'WBSCVET'],
    ['UDISE', '19112301305'],
    ['Medium', 'Bengali'],
    ['Category', '‘A’ Category school'],
  ],
  gallery: {
    note: '12 photos · managed from the CMS gallery',
    photos: [
      { caption: 'Main building', image: null },
      { caption: 'Science lab', image: null },
      { caption: 'Library', image: null },
      { caption: 'Playground', image: null },
      { caption: 'Saraswati Puja 2026', image: null },
      { caption: 'Computer lab', image: null },
    ],
  },
};

export const hmLetter = {
  kicker: '02 · Message',
  title: "From HM's Desk",
  titleBn: 'প্রধান শিক্ষকের কলম',
  photo: null,
  name: 'Samir Acharya',
  post: 'Headmaster (HM) · Chemistry',
  credentials: 'M.Sc. (Chemistry), B.Ed. (First Class)',
  meta: ['Message updated 12 Aug 2026', 'Session 2026–27'],
  /* The Headmaster has no separate email — write to the school office. The
     room number and parent-meeting hours that sat here were invented by the
     design and have been removed rather than left on a live page about a
     real person; add them back when the office confirms them. */
  details: [
    ['Email', '<a href="mailto:pbab.1963@gmail.com">pbab.1963@gmail.com</a> <span class="text-muted">(school office)</span>'],
    ['Phone', '<a href="tel:+913325522928">(033) 2552 2928</a>'],
  ],
  salutation: 'Dear parents, students and colleagues,',
  paragraphs: [
    "A new session is a chance to begin again. Last year our Madhyamik candidates recorded the school's best pass percentage in a decade, and our Higher Secondary science students earned places in engineering and nursing colleges across the state. I congratulate them — and their teachers, who stayed back for remedial classes long after the last bell.",
    'This year we have three priorities. First, regular attendance: a child who misses school on Mondays and Saturdays loses a fifth of the year. Second, reading in both Bengali and English every single day, at home as well as in class. Third, kindness — towards classmates, towards the staff who keep our campus clean, and towards ourselves when a result disappoints.',
    'I ask every guardian to keep the school informed of a change of phone number or address, to attend the parent–teacher meetings announced on the Notice page, and to speak to me directly on Saturday mornings if something is not right. My door is open.',
    'With warm regards,',
  ],
  signature: { name: 'Samir Acharya', post: 'Headmaster, Purba Barasat Adarsha Bidyapith' },
};

/**
 * The staff roster as the school office publishes it: every sanctioned post,
 * filled or vacant. Counts are derived from this list (see `staffCounts`), so
 * adding or filling a post updates the page's headline figures too.
 *
 * No telephone numbers or email addresses have been supplied for the staff, so
 * those columns do not appear; add `phone`/`tel`/`email` to a person and the
 * directory shows the contact column and the Call / Email buttons again.
 */
export const staff = [
  { sl: 1, name: 'Sri Samir Acharya', post: 'Headmaster', group: 'Headmaster', kind: 'teaching', qualification: 'M.Sc. (Chemistry), B.Ed. (First Class)', photo: null },
  { sl: 2, name: null, post: 'Assistant Headmaster', group: 'Assistant Headmaster', kind: 'teaching', qualification: null, vacant: true, photo: null },
  { sl: 3, name: 'Smt. Monika Roy', post: 'Assistant Teacher', group: 'Assistant Teacher', kind: 'teaching', qualification: 'M.A. (Geography), B.Ed. (First Class)', photo: null },
  { sl: 4, name: 'Smt. Reshma Khatun', post: 'Assistant Teacher', group: 'Assistant Teacher', kind: 'teaching', qualification: 'M.A. (Bengali), B.Ed.', photo: null },
  { sl: 5, name: 'Sri Trinath Mistry', post: 'Assistant Teacher', group: 'Assistant Teacher', kind: 'teaching', qualification: 'M.A. (Bengali), B.Ed.', photo: null },
  { sl: 6, name: 'Sri Sanjay Ghosh', post: 'Assistant Teacher', group: 'Assistant Teacher', kind: 'teaching', qualification: 'M.Com., B.Ed. (First Class), C.A., C.M.A.', photo: null },
  { sl: 7, name: 'Sri Dipnarayan Biswas', post: 'Assistant Teacher', group: 'Assistant Teacher', kind: 'teaching', qualification: 'B.Sc. (Hons.) (Physics), B.Ed.', photo: null },
  { sl: 8, name: 'Sri Biplab Haldar', post: 'Assistant Teacher', group: 'Assistant Teacher', kind: 'teaching', qualification: 'M.Sc. (Chemistry), B.Ed. (First Class)', photo: null },
  { sl: 9, name: 'Sri Debashis Sarkar', post: 'Assistant Teacher', group: 'Assistant Teacher', kind: 'teaching', qualification: 'M.A. (English), B.Ed. (First Class)', photo: null },
  { sl: 10, name: 'Smt. Chaitali Saha', post: 'Assistant Teacher', group: 'Assistant Teacher', kind: 'teaching', qualification: 'M.A. (Bengali), B.Ed. (First Class)', photo: null },
  { sl: 11, name: 'Sri Lakshman Haldar', post: 'Assistant Teacher', group: 'Assistant Teacher', kind: 'teaching', qualification: 'M.A. (English), B.Ed. (First Class)', photo: null },
  { sl: 12, name: 'Sri Nandalal Roy', post: 'Assistant Teacher', group: 'Assistant Teacher', kind: 'teaching', qualification: 'B.Com. (Hons.), B.P.Ed. (First Class)', photo: null },
  { sl: 13, name: 'Smt. Debadatta Mukherjee (Chakraborty)', post: 'Assistant Teacher', group: 'Assistant Teacher', kind: 'teaching', qualification: 'M.Sc. (First Class), B.Ed. (First Class)', photo: null },
  { sl: 14, name: 'Sri Anup Mondal', post: 'Assistant Teacher', group: 'Assistant Teacher', kind: 'teaching', qualification: 'B.A. (English), M.A. (History), B.Ed. (1st Class)', photo: null },
  { sl: 15, name: 'Sri Rabindranath Mondal', post: 'Assistant Teacher', group: 'Assistant Teacher', kind: 'teaching', qualification: 'M.A. (History), B.Ed. (First Class)', photo: null },
  { sl: 16, name: 'Sri Kallol Kanti Mondal', post: 'Assistant Teacher', group: 'Assistant Teacher', kind: 'teaching', qualification: 'M.A. (Education), B.Ed.', photo: null },
  { sl: 17, name: 'Sri Goutam Jana', post: 'Assistant Teacher', group: 'Assistant Teacher', kind: 'teaching', qualification: 'B.Sc. (Hons.) (Computer Science), M.C.A., B.Ed.', photo: null },
  { sl: 18, name: 'Sri Subal Sarkar', post: 'Assistant Teacher', group: 'Assistant Teacher', kind: 'teaching', qualification: 'M.A. (Political Science), B.Ed.', photo: null },
  { sl: 19, name: 'Smt. Shampa Das', post: 'Assistant Teacher', group: 'Assistant Teacher', kind: 'teaching', qualification: 'M.Sc. (Food & Nutrition) (1st Class), B.Ed. (1st Class)', photo: null },
  { sl: 20, name: 'Smt. Nabaneeta Hawlader', post: 'Assistant Teacher', group: 'Assistant Teacher', kind: 'teaching', qualification: 'M.Sc. (Human Development), B.Ed. (First Class)', photo: null },
  { sl: 21, name: 'Smt. Kumkum Basak', post: 'Assistant Teacher', group: 'Assistant Teacher', kind: 'teaching', qualification: 'M.Sc. (Economics) (1st Class), B.Ed. (First Class), M.Phil.', photo: null },
  { sl: 22, name: 'Sri Prashanta Mukha', post: 'Assistant Teacher', group: 'Assistant Teacher', kind: 'teaching', qualification: 'M.Sc. (Chemistry) (1st Class), M.A. (Education) (1st Class), B.Ed. (First Class)', photo: null },
  { sl: 23, name: 'Sri Sudarshan Pramanik', post: 'Assistant Teacher', group: 'Assistant Teacher', kind: 'teaching', qualification: 'M.A. (Bengali), B.Ed. (First Class)', photo: null },
  { sl: 24, name: 'Sri Rajat Subhra Karmakar', post: 'Assistant Teacher', group: 'Assistant Teacher', kind: 'teaching', qualification: 'M.Sc. (Mathematics) (1st Class), B.Ed. (First Class)', photo: null },
  { sl: 25, name: 'Sri Subhashis Ghorui', post: 'Assistant Teacher', group: 'Assistant Teacher', kind: 'teaching', qualification: 'B.Sc. (Pure Science), D.El.Ed. (1st Class)', photo: null },
  { sl: 26, name: 'Smt. Manami Dasgupta', post: 'Assistant Teacher', group: 'Assistant Teacher', kind: 'teaching', qualification: 'M.Sc. (Zoology) (1st Class), B.Ed. (1st Class)', photo: null },
  { sl: 27, name: 'Sri Debabrata Bhattacharya', post: 'Assistant Teacher', group: 'Assistant Teacher', kind: 'teaching', qualification: 'M.Sc. (Physics) (1st Class), B.Ed. (1st Class)', photo: null },
  { sl: 28, name: 'Sri Shyamal Kumar Mondal', post: 'Assistant Teacher', group: 'Assistant Teacher', kind: 'teaching', qualification: 'M.A. (Sanskrit), B.Ed. (1st Class)', photo: null },
  { sl: 29, name: 'Sri Pulak Nath', post: 'Assistant Teacher', group: 'Assistant Teacher', kind: 'teaching', qualification: 'M.A. (English) (1st Class), B.Ed. (1st Class)', photo: null },
  { sl: 30, name: 'Sri Tapan Sarkar', post: 'Assistant Teacher', group: 'Assistant Teacher', kind: 'teaching', qualification: 'M.A. (Geography), B.Ed.', photo: null },
  { sl: 31, name: 'Sri Piyali Basu', post: 'Assistant Teacher', group: 'Assistant Teacher', kind: 'teaching', qualification: 'M.Sc. (Agriculture), B.Ed. (First Class)', photo: null },
  { sl: 32, name: 'Smt. Shipra Sarkar', post: 'Assistant Teacher', group: 'Assistant Teacher', kind: 'teaching', qualification: 'B.Sc. (Pure Science), B.Ed. (First Class)', photo: null },
  { sl: 33, name: 'Sri Abhijit Haldar', post: 'Assistant Teacher', group: 'Assistant Teacher', kind: 'teaching', qualification: 'M.Sc. (Zoology) (1st Class), B.Ed. (1st Class)', photo: null },
  { sl: 34, name: 'Sri Ismail Mollick', post: 'Assistant Teacher', group: 'Assistant Teacher', kind: 'teaching', qualification: 'M.Sc. (Geography) (1st Class), B.Ed. (1st Class)', photo: null },
  { sl: 35, name: 'Smt. Sutapa Mitra', post: 'Assistant Teacher', group: 'Assistant Teacher', kind: 'teaching', qualification: 'M.A. (English), B.Ed. (1st Class)', photo: null },
  { sl: 36, name: 'Barnali Poddar', post: 'Assistant Teacher', group: 'Assistant Teacher', kind: 'teaching', qualification: 'M.A. (History), B.Ed. (1st Class)', photo: null },
  { sl: 37, name: 'Sri Ramkrishna Barui', post: 'Assistant Teacher', group: 'Assistant Teacher', kind: 'teaching', qualification: 'M.A. (Bengali), B.Ed. (1st Class)', photo: null },
  { sl: 38, name: 'Md. Moinur Islam', post: 'Assistant Teacher', group: 'Assistant Teacher', kind: 'teaching', qualification: 'M.Sc. (Mathematics) (1st Class), B.Ed. (1st Class)', photo: null },
  { sl: 39, name: 'Smt. Purnima Mondal', post: 'Assistant Teacher', group: 'Assistant Teacher', kind: 'teaching', qualification: 'B.A. (Sanskrit), M.A. (History), B.Ed. (1st Class)', photo: null },
  { sl: 40, name: 'Smt. Nandini Roy', post: 'Assistant Teacher', group: 'Assistant Teacher', kind: 'teaching', qualification: 'M.Sc. (Zoology) (1st Class), B.Ed. (1st Class)', photo: null },
  { sl: 41, name: 'Smt. Ayukta Sarkar', post: 'Assistant Teacher', group: 'Assistant Teacher', kind: 'teaching', qualification: 'M.Sc. (Zoology) (1st Class), B.Ed. (1st Class)', photo: null },
  { sl: 42, name: 'Sri Rajiv Das', post: 'Assistant Teacher', group: 'Assistant Teacher', kind: 'teaching', qualification: 'B.Sc. (Physics – Hons.), B.Ed. (1st Class)', photo: null },
  { sl: 43, name: 'Smt. Kalpana Roy', post: 'Assistant Teacher', group: 'Assistant Teacher', kind: 'teaching', qualification: 'M.A. (Music), B.Ed. (First Class)', photo: null },
  { sl: 44, name: 'Smt. Mousumi Chowdhury', post: 'Assistant Teacher', group: 'Assistant Teacher', kind: 'teaching', qualification: 'M.A. (Philosophy), B.Ed. (First Class)', photo: null },
  { sl: 45, name: null, post: 'Assistant Teacher', group: 'Assistant Teacher', kind: 'teaching', qualification: 'Hons. / PG — Mathematics', vacant: true, photo: null },
  { sl: 46, name: 'Sri Shuvendu Bikash Bhanga', post: 'Assistant Teacher', group: 'Assistant Teacher', kind: 'teaching', qualification: 'B.A. (Hons.) Bengali, B.Ed. (First Class)', photo: null },
  { sl: 47, name: null, post: 'Para Teacher', group: 'Para Teacher', kind: 'teaching', qualification: null, vacant: true, photo: null },
  { sl: 48, name: 'Sri Bidyasankar Roy', post: 'Librarian', group: 'Librarian', kind: 'nonTeaching', qualification: 'B.Sc. (Hons.) (Physics), B.Ed., B.Lib. & Information Science (First Class)', photo: null },
  { sl: 49, name: 'Smt. Trina Ghosh', post: 'Clerk', group: 'Clerk', kind: 'nonTeaching', qualification: 'M.A. (Environmental Studies)', photo: null },
  { sl: 50, name: null, post: 'Clerk', group: 'Clerk', kind: 'nonTeaching', qualification: null, vacant: true, photo: null },
  { sl: 51, name: 'Sri Ashok Kumar Roy', post: 'Group D Staff', group: 'Group D Staff', kind: 'nonTeaching', qualification: null, photo: null },
  { sl: 52, name: 'Sri Subrata Sardar', post: 'Group D Staff', group: 'Group D Staff', kind: 'nonTeaching', qualification: 'B.Com. (Hons.)', photo: null },
  { sl: 53, name: null, post: 'Group D Staff', group: 'Group D Staff', kind: 'nonTeaching', qualification: null, vacant: true, photo: null },
  { sl: 54, name: null, post: 'Group D Staff', group: 'Group D Staff', kind: 'nonTeaching', qualification: null, vacant: true, photo: null },
  { sl: 55, name: 'Sri Kaushik Konar', post: 'Computer Teacher', group: 'Computer Teacher', kind: 'teaching', qualification: 'B.Com. (Hons.), Computer ‘O’ Level', photo: null },
  { sl: 56, name: 'Sri Arnab Das', post: 'ICT Teacher', group: 'ICT Teacher', kind: 'teaching', qualification: 'B.C.A., M.Sc. (1st Class)', photo: null },
];

/** Which posts the filter offers, in the order the office lists them. */
export const staffPosts = [
  'Headmaster', 'Assistant Headmaster', 'Assistant Teacher', 'Para Teacher',
  'Computer Teacher', 'ICT Teacher', 'Librarian', 'Clerk', 'Group D Staff',
];

/* Headline figures, counted from the roster rather than typed in twice. */
const inPost = (kind) => staff.filter((p) => p.kind === kind && !p.vacant).length;
const sanctioned = (kind) => staff.filter((p) => p.kind === kind).length;

export const staffCounts = {
  teaching: inPost('teaching'),
  teachingSanctioned: sanctioned('teaching'),
  nonTeaching: inPost('nonTeaching'),
  nonTeachingSanctioned: sanctioned('nonTeaching'),
  updated: 'As published by the school office',
};

export const students = {
  kicker: '04 · Class-wise strength',
  title: 'Students',
  titleBn: 'ছাত্রছাত্রী',
  asOn: 'Session 2026–27 · as on 01 Jul 2026',
  privacyNote: 'Counts only — no personal data is published.',
  total: '1,104',
  summary: 'Classes V–XII · 22 sections · 38 teachers',
  sections: 22,
  classes: [
    { name: 'Class V',    sections: [['A', 48], ['B', 46], ['C', 45]] },
    { name: 'Class VI',   sections: [['A', 47], ['B', 44], ['C', 43]] },
    { name: 'Class VII',  sections: [['A', 45], ['B', 45], ['C', 41]] },
    { name: 'Class VIII', sections: [['A', 46], ['B', 44], ['C', 40]] },
    { name: 'Class IX',   sections: [['A', 50], ['B', 49], ['C', 47]] },
    { name: 'Class X',    sections: [['A', 52], ['B', 51], ['C', 48]] },
    { name: 'Class XI',   sections: [['A (Science)', 58], ['B (Arts)', 72]] },
    { name: 'Class XII',  sections: [['A (Science)', 54], ['B (Arts)', 69]] },
  ],
  streams: {
    Science: 'Physics, Chemistry, Mathematics, Biology, Computer Application',
    Arts: 'History, Geography, Political Science, Philosophy, Sanskrit, Education',
  },
};

/* ══════════════════════════════════════════════════════════════════════════
   03 — Admission
   ══════════════════════════════════════════════════════════════════════════ */

export const admission = {
  /* The single switch that turns the whole page between its two states. */
  open: true,
  kicker: '05 · Session 2027–28',
  kickerClosed: '05 · Session 2026–27',
  title: 'Admission',
  titleBn: 'ভর্তি',
  windowLabel: 'Admissions open · 5–25 Jan 2027',
  closedLabel: 'Admissions closed for 2026–27',
  closed: {
    heading: 'The admission window for 2026–27 has closed.',
    body: 'Applications for Session 2027–28 open on <strong>5 January 2027</strong>. The notice will be published here and on the Notice page. এই পাতায় ভর্তির বিজ্ঞপ্তি প্রকাশিত হবে।',
    cta: { label: 'Watch the Notice page', href: 'notice.html' },
    applyLabel: 'Apply Online — opens 5 Jan 2027',
  },
  blocks: [
    {
      id: 'A', kicker: 'Block A', title: 'Class V', open: true,
      sub: 'পঞ্চম শ্রেণি · Bengali medium · Age as on 1 Jan 2027',
      subClosed: 'Eligibility and documents stay published for reference',
      rules: [
        'Applicant must be 10 years or above as on 1 January 2027',
        'Selection by lottery where applications exceed seats (per state rules)',
        'Documents: birth certificate, Aadhaar, previous report card, 2 photos',
      ],
      notice: { title: 'Admission Notice — Class V', titleClosed: 'Admission Notice 2026–27 (archived)',
                meta: 'PDF · 240 KB · Published 20 Dec 2026', metaClosed: 'PDF · 240 KB', href: '#pdf' },
      apply: { label: 'Apply Online — Class V →', href: 'admission-form.html?block=A' },
    },
    {
      /* A block can be closed on its own while the page as a whole is open:
         the eligibility list gives way to a plain statement, and the apply
         button is disabled rather than removed. */
      id: 'B', kicker: 'Block B', title: 'Class XI', open: false,
      closedLine: 'Admission closed for 2026',
      closedApply: 'Applications closed',
      sub: 'একাদশ শ্রেণি · Science & Arts streams · WBCHSE',
      subClosed: 'Science & Arts streams · WBCHSE',
      rules: [
        'Madhyamik (or equivalent) pass, 2027 or 2026',
        'Science: minimum 60% aggregate, 65% in Mathematics & Physical Science',
        'Documents: Madhyamik admit & mark sheet, Aadhaar, 2 photos',
      ],
      notice: { title: 'Admission Notice — Class XI', titleClosed: 'Admission Notice 2026–27 (archived)',
                meta: 'PDF · 310 KB · Published 20 Dec 2026', metaClosed: 'PDF · 310 KB', href: '#pdf' },
      apply: { label: 'Apply Online — Class XI →', href: 'admission-form.html?block=B' },
    },
  ],
  notes: [
    { heading: 'How it works', text: 'Fill the online form and download the application PDF it produces. Print it and bring it to the office with the original documents on the verification date.' },
    { heading: 'Fees', text: 'No application fee. Admission fee as per Government of West Bengal norms — payable at the office after selection.' },
    { heading: 'Help', text: 'Office helpline (033) 2552 2928 / (033) 2584 4601, 10:30–16:30 Mon–Sat. Guardians without internet may fill the form at the school office.' },
  ],
};

/**
 * The online application, as a schema.
 *
 * One flat form in four groups. The form component, the validator and the
 * printed PDF all read this same list, so adding a question is one object in
 * one group — nothing else changes, and it appears on the printout and in the
 * Google Sheet automatically.
 *
 * field: { name, label, type, required, half, placeholder, options, value,
 *          readonly, inputmode, rule, requiredMessage, bengali, pdfSkip }
 *   rule     — names a check in services/admission.js
 *   bengali  — renders the input in the Bengali face
 *   pdfSkip  — kept on screen and in the sheet, left off the printed form
 *              (the PDF's built-in fonts cannot draw Bengali)
 */
export const admissionForm = {
  kicker: 'Admission · Session 2027–28',
  title: 'Online Application — Class V',
  titleBn: 'অনলাইন আবেদন',
  intro: 'Fill this form, then print the PDF it produces and bring it to the school office with the original documents.',
  requiredNote: 'Fields marked * are required. Write names exactly as on the birth certificate.',
  declaration: 'I declare that the information given above is true to the best of my knowledge. আমি ঘোষণা করছি যে উপরে প্রদত্ত তথ্য সত্য।',
  submitLabel: 'Submit & download form',
  /* Read by rules.age — the date the applicant's age is measured against. */
  ageCutoff: '2027-01-01',
  groups: [
    {
      id: 'applicant', title: 'Applicant', titleBn: 'আবেদনকারীর তথ্য',
      fields: [
        { name: 'class', label: 'Class applying for', pdfLabel: 'Class', type: 'select', required: true, half: true,
          options: ['Class V'], value: 'Class V' },
        { name: 'nameEn', label: 'Name of student (English)', pdfLabel: 'Name of student',
          type: 'text', required: true, half: true,
          placeholder: 'As on birth certificate', requiredMessage: "Enter the student's name." },
        { name: 'nameBn', label: 'নাম (বাংলায়)', type: 'text', half: true, bengali: true, pdfSkip: true,
          placeholder: 'জন্ম শংসাপত্র অনুসারে' },
        { name: 'dob', label: 'Date of birth', type: 'date', required: true, half: true, rule: 'age',
          requiredMessage: 'Enter the date of birth.' },
        { name: 'gender', label: 'Gender', type: 'radio', required: true, half: true,
          options: ['Male', 'Female', 'Other'], requiredMessage: 'Choose the gender.' },
        { name: 'category', label: 'Category', type: 'select', required: true, half: true,
          options: ['General', 'SC', 'ST', 'OBC', 'CWSN'] },
        { name: 'religion', label: 'Religion', type: 'text', required: true, half: true,
          requiredMessage: 'Enter the religion.' },
        { name: 'bloodGroup', label: 'Blood group', type: 'select', required: true, half: true,
          options: ['A+', 'B+', 'O+', 'AB+', 'A−', 'B−', 'O−', 'AB−', 'Not known'] },
        { name: 'bpl', label: 'BPL card holder', type: 'radio', required: true, half: true,
          options: ['No', 'Yes'], requiredMessage: 'State whether the family holds a BPL card.' },
        { name: 'aadhaar', label: 'Aadhaar number', type: 'text', required: true, half: true,
          inputmode: 'numeric', placeholder: '12 digits', rule: 'aadhaar',
          requiredMessage: 'Enter the 12-digit Aadhaar number.' },
        { name: 'pen', label: 'PEN (Permanent Education Number)', pdfLabel: 'PEN', type: 'text', half: true,
          inputmode: 'numeric', placeholder: 'If already issued' },
        { name: 'apaar', label: 'APAAR ID', type: 'text', half: true,
          inputmode: 'numeric', placeholder: 'If already issued', rule: 'apaar' },
      ],
    },
    {
      id: 'parents', title: 'Parents and guardian', titleBn: 'অভিভাবকের তথ্য',
      fields: [
        { name: 'father', label: "Father's name", type: 'text', required: true, half: true,
          requiredMessage: "Enter the father's name." },
        { name: 'fatherOccupation', label: "Father's occupation", type: 'text', required: true, half: true,
          requiredMessage: "Enter the father's occupation." },
        { name: 'mother', label: "Mother's name", type: 'text', required: true, half: true,
          requiredMessage: "Enter the mother's name." },
        { name: 'motherOccupation', label: "Mother's occupation", type: 'text', required: true, half: true,
          requiredMessage: "Enter the mother's occupation." },
        { name: 'guardian', label: "Guardian's name", type: 'text', required: true, half: true,
          placeholder: 'Repeat a parent if they are the guardian',
          requiredMessage: "Enter the guardian's name." },
        { name: 'guardianOccupation', label: "Guardian's occupation", type: 'text', required: true, half: true,
          requiredMessage: "Enter the guardian's occupation." },
      ],
    },
    {
      id: 'contact', title: 'Contact and address', titleBn: 'যোগাযোগ ও ঠিকানা',
      fields: [
        { name: 'phone', label: 'Contact number (as per Aadhaar)', pdfLabel: 'Contact number',
          type: 'tel', required: true, half: true,
          inputmode: 'numeric', placeholder: '10 digits', rule: 'mobile',
          requiredMessage: 'Enter the contact number registered with Aadhaar.' },
        { name: 'village', label: 'City / village', type: 'text', required: true, half: true,
          requiredMessage: 'Enter the city or village.' },
        { name: 'postOffice', label: 'Post office', type: 'text', required: true, half: true,
          requiredMessage: 'Enter the post office.' },
        { name: 'policeStation', label: 'Police station', type: 'text', required: true, half: true,
          requiredMessage: 'Enter the police station.' },
        { name: 'district', label: 'District', type: 'text', required: true, half: true,
          value: 'North 24 Parganas', requiredMessage: 'Enter the district.' },
        { name: 'pin', label: 'PIN code', type: 'text', required: true, half: true,
          inputmode: 'numeric', placeholder: '6 digits', rule: 'pin',
          requiredMessage: 'Enter the PIN code.' },
      ],
    },
    {
      id: 'school', title: 'Previous school', titleBn: 'পূর্ববর্তী বিদ্যালয়',
      fields: [
        { name: 'lastSchool', label: 'Name of last school attended', pdfLabel: 'Last school attended',
          type: 'text', required: true, half: true,
          requiredMessage: 'Enter the last school attended.' },
        { name: 'lastClass', label: 'Last class passed', type: 'select', required: true, half: true,
          options: ['Class IV'], value: 'Class IV' },
      ],
    },
    {
      id: 'bank', title: 'Bank account', titleBn: 'ব্যাঙ্ক অ্যাকাউন্ট',
      /* Collected for scholarship and direct-benefit payments. */
      note: "The student's own account, used for scholarship and Government benefit payments.",
      fields: [
        { name: 'bankAccount', label: 'Bank account number', type: 'text', required: true, half: true,
          inputmode: 'numeric', rule: 'bankAccount',
          requiredMessage: 'Enter the bank account number.' },
        { name: 'bankName', label: 'Bank name', type: 'text', required: true, half: true,
          requiredMessage: 'Enter the bank name.' },
        { name: 'branchName', label: 'Branch name', type: 'text', required: true, half: true,
          requiredMessage: 'Enter the branch name.' },
        { name: 'ifsc', label: 'IFSC code', type: 'text', required: true, half: true,
          placeholder: 'e.g. SBIN0001234', rule: 'ifsc',
          requiredMessage: 'Enter the IFSC code.' },
        { name: 'micr', label: 'MICR code', type: 'text', required: true, half: true,
          inputmode: 'numeric', placeholder: '9 digits', rule: 'micr',
          requiredMessage: 'Enter the MICR code.' },
      ],
    },
  ],
};

export const admissionConfirmation = {
  title: 'Application submitted',
  titleBn: 'আবেদন জমা হয়েছে · Session 2027–28',
  next: [
    { title: 'Print', text: 'Your application form has downloaded. Print it and sign it, and keep the reference number safe.' },
    { title: 'Verify', text: 'Bring the printout and original documents to the office on the verification date, announced on the Notice page by 28 Jan 2027.' },
    { title: 'Result', text: 'Selection results, and the lottery where one is needed, are published on the Notice page and on the school notice board.' },
  ],
};

/* ══════════════════════════════════════════════════════════════════════════
   04 — Academic Calendar: holidays, exam schedule, syllabus
   ══════════════════════════════════════════════════════════════════════════ */

export const calendar = {
  kicker: '06 · Academic year 2026',
  title: 'Academic Calendar',
  titleBn: 'শিক্ষাবর্ষ পঞ্জিকা',
  tabs: [
    { id: 'holidays', label: 'Holiday List',   bn: 'ছুটির তালিকা', short: 'Holidays' },
    { id: 'exams',    label: 'Exam Schedule',  bn: 'পরীক্ষার সূচি', short: 'Exams', feature: 'exams' },
    { id: 'syllabus', label: 'Syllabus',       bn: 'পাঠ্যসূচি',    short: 'Syllabus', feature: 'syllabus' },
  ],
};

export const holidays = {
  /* West Bengal schools run on the calendar year, so this is the list for
     academic year 2026 as published by the school. `days` counts school days,
     not calendar days — Sundays are excluded, which is why the Puja vacation
     spans 28 dates but counts 24. */
  year: '2026',
  totalDays: 65,
  pdf: { label: 'Holiday list PDF', href: '#pdf' },
  note: 'Holiday list for the academic year 2026, 65 days in all, including 3 at the discretion of the Head Teacher. Days are counted excluding Sundays. Changes are announced on the Notice page.',
  /* `date` is the machine-readable start, used to work out the next holiday.
     `end` marks a vacation that runs over several days. */
  list: [
    { date: '2026-01-01', label: '01 Jan 2026', day: 'Thursday',  name: 'English New Year', days: 1 },
    { date: '2026-01-12', label: '12 Jan 2026', day: 'Monday',    name: 'Swami Vivekananda Jayanti', days: 1 },
    { date: '2026-01-23', label: '23 Jan 2026', day: 'Friday',    name: 'Saraswati Puja & Netaji Subhas birth anniversary', days: 1, observed: true },
    { date: '2026-01-26', label: '26 Jan 2026', day: 'Monday',    name: 'Republic Day', days: 1, observed: true },
    { date: '2026-02-04', label: '04 Feb 2026', day: 'Wednesday', name: 'Shab-e-Barat', days: 1 },
    { date: '2026-02-14', label: '14 Feb 2026', day: 'Saturday',  name: "Thakur Panchanan Barma's birthday", days: 1 },
    { date: '2026-02-15', label: '15 Feb 2026', day: 'Sunday',    name: 'Shivratri', days: 0 },
    { date: '2026-03-03', label: '03 Mar 2026', day: 'Tuesday',   name: 'Dolyatra (Holi)', days: 1 },
    { date: '2026-03-17', label: '17 Mar 2026', day: 'Tuesday',   name: "Sri Sri Harichand Thakur's birthday", days: 1 },
    { date: '2026-03-20', label: '20 Mar 2026', day: 'Friday',    name: 'Day before Eid-ul-Fitr', days: 1 },
    { date: '2026-03-21', label: '21 Mar 2026', day: 'Saturday',  name: 'Eid-ul-Fitr', days: 1 },
    { date: '2026-03-26', label: '26 Mar 2026', day: 'Thursday',  name: 'Ram Navami', days: 1 },
    { date: '2026-03-31', label: '31 Mar 2026', day: 'Tuesday',   name: 'Mahavir Jayanti', days: 1 },
    { date: '2026-04-03', label: '03 Apr 2026', day: 'Friday',    name: 'Good Friday', days: 1 },
    { date: '2026-04-14', label: '14 Apr 2026', day: 'Tuesday',   name: "Dr. B. R. Ambedkar's birthday", days: 1 },
    { date: '2026-04-15', label: '15 Apr 2026', day: 'Wednesday', name: 'Bengali New Year (Poila Boishakh)', days: 1 },
    { date: '2026-05-01', label: '01 May 2026', day: 'Friday',    name: "May Day, Buddha Purnima & Raghunath Murmu's birthday", days: 1 },
    { date: '2026-05-09', label: '09 May 2026', day: 'Saturday',  name: 'Rabindra Jayanti', days: 1 },
    { date: '2026-05-11', end: '2026-05-16', label: '11 – 16 May 2026', day: 'Mon – Sat', name: 'Summer vacation', days: 6 },
    { date: '2026-05-26', label: '26 May 2026', day: 'Tuesday',   name: 'Day before Eid-ul-Adha (Bakrid)', days: 1 },
    { date: '2026-05-27', label: '27 May 2026', day: 'Wednesday', name: 'Eid-ul-Adha (Bakrid)', days: 1 },
    { date: '2026-06-26', label: '26 Jun 2026', day: 'Friday',    name: 'Muharram', days: 1 },
    { date: '2026-07-16', label: '16 Jul 2026', day: 'Thursday',  name: 'Rath Yatra', days: 1 },
    { date: '2026-08-15', label: '15 Aug 2026', day: 'Saturday',  name: 'Independence Day', days: 1, observed: true },
    { date: '2026-08-26', label: '26 Aug 2026', day: 'Wednesday', name: 'Fateha-i-Yajdaham', days: 1 },
    { date: '2026-09-04', label: '04 Sep 2026', day: 'Friday',    name: 'Janmashtami', days: 1 },
    { date: '2026-10-02', label: '02 Oct 2026', day: 'Friday',    name: 'Gandhi Jayanti', days: 1 },
    { date: '2026-10-10', label: '10 Oct 2026', day: 'Saturday',  name: 'Mahalaya', days: 1 },
    { date: '2026-10-16', end: '2026-11-12', label: '16 Oct – 12 Nov 2026', day: 'Fri – Thu',
      name: 'Puja vacation (Panchami to the day after Bhratridwitiya)', days: 24 },
    { date: '2026-11-15', label: '15 Nov 2026', day: 'Sunday',    name: "Birsa Munda's birthday & Chhath Puja", days: 0 },
    { date: '2026-11-24', label: '24 Nov 2026', day: 'Tuesday',   name: "Guru Nanak's birthday & Parshvanatha Rathayatra", days: 1 },
    { date: '2026-12-25', label: '25 Dec 2026', day: 'Friday',    name: 'Christmas', days: 1 },
    { date: '2026-12-28', end: '2026-12-31', label: '28 – 31 Dec 2026', day: 'Mon – Thu', name: 'Winter vacation', days: 4 },
    /* No fixed date: the Head Teacher sets these during the year. */
    { date: null, label: 'To be announced', day: '—',
      name: 'At the discretion of the Head Teacher', days: 3 },
  ],
};

export const exams = {
  legend: '<strong>F</strong> = Formative evaluation · <strong>S</strong> = Summative evaluation · Dates are inclusive; detailed subject routines are published as notices two weeks before each exam.',
  legendShort: 'F = Formative · S = Summative · Dates inclusive',
  pdf: { label: 'Download routine PDF', href: '#pdf' },
  columns: [
    { id: 'f1', label: 'F1', note: '· Formative 1' },
    { id: 's1', label: 'S1', note: '· Summative 1' },
    { id: 'f2', label: 'F2', note: '· Formative 2' },
    { id: 's2', label: 'S2', note: '· Summative 2' },
    { id: 's3', label: 'S3', note: '· Summative 3 / Annual' },
  ],
  /* A cell is either a plain string or { text, tag, tone }. */
  rows: [
    { klass: 'Class V',    f1: '20–24 Jun 2026', s1: '10–18 Aug 2026', f2: '21–25 Sep 2026', s2: '23 Nov – 2 Dec 2026', s3: '8–19 Mar 2027' },
    { klass: 'Class VI',   f1: '20–24 Jun 2026', s1: '10–18 Aug 2026', f2: '21–25 Sep 2026', s2: '23 Nov – 2 Dec 2026', s3: '8–19 Mar 2027' },
    { klass: 'Class VII',  f1: '20–24 Jun 2026', s1: '10–18 Aug 2026', f2: '21–25 Sep 2026', s2: '23 Nov – 2 Dec 2026', s3: '8–19 Mar 2027' },
    { klass: 'Class VIII', f1: '20–24 Jun 2026', s1: '10–18 Aug 2026', f2: '21–25 Sep 2026', s2: '23 Nov – 2 Dec 2026', s3: '8–19 Mar 2027' },
    { klass: 'Class IX',   f1: '22–26 Jun 2026', s1: '10–20 Aug 2026', f2: '21–25 Sep 2026', s2: '23 Nov – 4 Dec 2026', s3: '1–12 Mar 2027' },
    { klass: 'Class X',    f1: '22–26 Jun 2026', s1: '10–20 Aug 2026', f2: '—',
      s2: { text: '16–27 Nov 2026', tag: 'Test', tone: 'accent' }, s3: 'Madhyamik (WBBSE) Feb 2027' },
    { klass: 'Class XI',   f1: '—', s1: { text: '17–28 Aug 2026', tag: 'Sem 1', tone: 'neutral' }, f2: '—', s2: '—',
      s3: { text: '8–19 Mar 2027', tag: 'Sem 2', tone: 'neutral' } },
    { klass: 'Class XII',  f1: '—', s1: { text: '17–28 Aug 2026', tag: 'Sem 3', tone: 'neutral' }, f2: '—',
      s2: { text: '16–27 Nov 2026', tag: 'Test', tone: 'accent' },
      s3: { text: 'HS (WBCHSE) Mar 2027', tag: 'Sem 4', tone: 'neutral' } },
  ],
};

/** Syllabus, one accordion panel per class. `subjects: null` = not published yet. */
export const syllabus = [
  { klass: 'Class V',    meta: '8 subjects', subjects: null },
  { klass: 'Class VI',   meta: '8 subjects', subjects: null },
  { klass: 'Class VII',  meta: '8 subjects', subjects: null },
  { klass: 'Class VIII', meta: '8 subjects', subjects: null },
  { klass: 'Class IX',   meta: '7 subjects · WBBSE 2026–27', open: true, subjects: [
    { name: 'Bengali (1st language) · বাংলা', book: 'Sahitya Sanchayan, Vyakaran', updated: 'Apr 2026', pdf: 'PDF · 180 KB', href: '#pdf' },
    { name: 'English (2nd language)',        book: 'Bliss',                       updated: 'Apr 2026', pdf: 'PDF · 120 KB', href: '#pdf' },
    { name: 'Mathematics · গণিত',            book: 'Ganit Prakash IX',            updated: 'Apr 2026', pdf: 'PDF · 210 KB', href: '#pdf' },
    { name: 'Physical Science · ভৌতবিজ্ঞান',  book: 'Bhautabigyan IX',             updated: 'Apr 2026', pdf: 'PDF · 160 KB', href: '#pdf' },
    { name: 'Life Science · জীবনবিজ্ঞান',     book: 'Jibanbigyan IX',              updated: 'Apr 2026', pdf: 'PDF · 150 KB', href: '#pdf' },
    { name: 'History · ইতিহাস',              book: 'Itihas O Paribesh IX',        updated: 'May 2026', pdf: 'PDF · 140 KB', href: '#pdf' },
    { name: 'Geography · ভূগোল',             book: 'Bhugol O Paribesh IX',        updated: 'May 2026', pdf: 'PDF · 130 KB', href: '#pdf' },
  ] },
  { klass: 'Class X',   meta: '7 subjects · Madhyamik', subjects: null },
  { klass: 'Class XI',  meta: 'Science · Arts', subjects: null },
  { klass: 'Class XII', meta: 'Science · Arts', subjects: null },
];

/* ══════════════════════════════════════════════════════════════════════════
   05 — Results & Events · Notice board · Contact
   ══════════════════════════════════════════════════════════════════════════ */

export const results = {
  kicker: '07 · Board examinations',
  title: 'Results',
  titleBn: 'ফলাফল',
  source: 'Source: WBBSE published results. Individual mark sheets are available from the school office or the Student portal.',
  boards: [
    {
      id: 'mp', label: 'Madhyamik (MP)', bn: 'মাধ্যমিক',
      highlight: {
        kicker: 'Madhyamik 2026', figure: '96.6%',
        caption: 'pass percentage · best in a decade',
        detail: '143 of 148 candidates passed. 27 students scored 90% and above.',
        cta: { label: 'Merit list (PDF)', href: '#pdf' },
      },
      rows: [
        { year: '2026', topper: 'Ankita Roy',      marks: '672 / 700', appeared: 148, pass: '96.6%', tone: 'accent' },
        { year: '2025', topper: 'Sourav Mondal',   marks: '661 / 700', appeared: 142, pass: '94.4%', tone: 'accent' },
        { year: '2024', topper: 'Priyanka Biswas', marks: '655 / 700', appeared: 151, pass: '92.7%', tone: 'accent' },
        { year: '2023', topper: 'Arijit Saha',     marks: '648 / 700', appeared: 139, pass: '89.9%', tone: 'neutral' },
        { year: '2022', topper: 'Moumita Das',     marks: '640 / 700', appeared: 136, pass: '91.2%', tone: 'neutral' },
      ],
    },
    {
      id: 'hs', label: 'Higher Secondary (HS)', bn: 'উচ্চ মাধ্যমিক',
      /* Set `pending` on a board whose next result is not out yet; the table
         below keeps showing the years that are. */
      pending: {
        heading: 'Higher Secondary 2027 results are not published yet',
        text: 'WBCHSE publishes results in May. This table updates the same day. Earlier years remain below.',
      },
      highlight: {
        kicker: 'Higher Secondary 2026', figure: '94.1%',
        caption: 'pass percentage · Science & Arts',
        detail: '113 of 120 candidates passed. 19 students scored 90% and above.',
        cta: { label: 'Merit list (PDF)', href: '#pdf' },
      },
      rows: [
        { year: '2026', topper: 'Riya Chatterjee', marks: '478 / 500', appeared: 120, pass: '94.1%', tone: 'accent' },
        { year: '2025', topper: 'Sandip Ghosh',    marks: '471 / 500', appeared: 118, pass: '92.3%', tone: 'accent' },
        { year: '2024', topper: 'Nasreen Khatun',  marks: '466 / 500', appeared: 124, pass: '90.1%', tone: 'accent' },
        { year: '2023', topper: 'Abhijit Pal',     marks: '459 / 500', appeared: 121, pass: '88.4%', tone: 'neutral' },
        { year: '2022', topper: 'Sutapa Barman',   marks: '452 / 500', appeared: 115, pass: '89.7%', tone: 'neutral' },
      ],
    },
  ],
};

export const eventFilters = ['Upcoming & recent', '2025', 'Older'];

export const events = [
  {
    id: 'teachers-day-2026', date: '05 Sep 2026', day: 'Saturday', tag: 'Celebration', filter: 'Upcoming & recent',
    title: "Teachers' Day 2026", titleBn: 'শিক্ষক দিবস ২০২৬',
    summary: 'Class XII students ran the school for a day; a cultural programme followed in the assembly hall.',
    cover: { caption: 'Cover photo · Class XII teaching Class VI', image: null },
    posted: 'Posted 07 Sep 2026 by the school office · 18 photos',
    photoCount: 18,
    body: [
      "On Teachers' Day the senior-most class took charge of the school. Twenty-two students of Class XII taught Classes V to VIII for the first three periods, following lesson plans they had prepared with their subject teachers during the week.",
      'The cultural programme in the assembly hall opened with a Rabindrasangeet chorus from Class VII and closed with the annual felicitation of retiring staff. Headmaster Samir Acharya thanked the students for "a day when the school ran itself, and ran well".',
      'The Managing Committee announced that the computer lab will stay open until 16:30 on Saturdays from October.',
    ],
  },
  {
    id: 'independence-day-2026', date: '15 Aug 2026', day: 'Saturday', tag: 'National day', filter: 'Upcoming & recent',
    title: 'Independence Day', titleBn: 'স্বাধীনতা দিবস',
    summary: 'Flag hoisting by the Headmaster, march-past by the NCC unit and sweets for all classes.',
    cover: { caption: 'Cover photo · Flag hoisting', image: null },
    posted: 'Posted 16 Aug 2026 by the school office · 12 photos',
    photoCount: 12,
    body: [
      'The national flag was hoisted at 7:45 by the Headmaster, followed by the national anthem and a march-past by the school NCC unit.',
      'Students of Classes VIII to XII presented patriotic songs and a short play on the freedom movement in Bengal. Sweets were distributed to every class.',
    ],
  },
  {
    id: 'sports-day-2026', date: '24 Jan 2026', day: 'Saturday', tag: 'Sports', filter: 'Upcoming & recent',
    title: 'Annual Sports Day', titleBn: 'বার্ষিক ক্রীড়া প্রতিযোগিতা',
    summary: 'Track and field events at the Barasat Stadium; Class IX-B won the house championship.',
    cover: { caption: 'Cover photo · 100m final', image: null },
    posted: 'Posted 27 Jan 2026 by the school office · 24 photos',
    photoCount: 24,
    body: [
      'The annual sports were held at the Barasat Stadium with all four houses competing across track and field events.',
      'Class IX-B took the house championship. Prizes were given away by the President of the Managing Committee.',
    ],
  },
];

export const noticeBoard = {
  kicker: 'Notice board',
  title: 'Notice',
  titleBn: 'বিজ্ঞপ্তি',
  meta: 'Newest first · 46 notices in 2026|Each notice is a PDF signed by the Headmaster.',
  declaredTotal: 46,
  years: ['2026', '2025', '2024', '2023'],
  categories: ['Holiday', 'Exam', 'Admission', 'Office', 'Meeting'],
  list: [
    { date: '18 Sep 2026', year: '2026', category: 'Holiday', tone: 'accent',
      title: 'Puja vacation 2026 — school closed 14 Oct to 2 Nov',
      ref: 'Ref. PBAB/N/2026/46 · Classes resume Tuesday 3 Nov', pdf: 'PDF · 96 KB', href: '#pdf' },
    { date: '15 Sep 2026', year: '2026', category: 'Exam', tone: 'neutral',
      title: 'Second Summative Evaluation (S2) routine, Classes V–X',
      ref: 'Ref. PBAB/N/2026/45 · 23 Nov – 2 Dec', pdf: 'PDF · 210 KB', href: '#pdf' },
    { date: '09 Sep 2026', year: '2026', category: 'Office', tone: 'neutral',
      title: 'Class XI registration (WBCHSE) — forms due 20 Sep',
      ref: 'Ref. PBAB/N/2026/44 · Submit to the office with 2 photos', pdf: 'PDF · 88 KB', href: '#pdf' },
    { date: '02 Sep 2026', year: '2026', category: 'Meeting', tone: 'neutral',
      title: 'Parent–teacher meeting, Classes IX & X — Sat 12 Sep, 11:00',
      ref: 'Ref. PBAB/N/2026/43 · Assembly hall', pdf: 'PDF · 72 KB', href: '#pdf' },
    { date: '28 Aug 2026', year: '2026', category: 'Office', tone: 'neutral',
      title: 'Kanyashree K1/K2 renewal — document submission window',
      ref: 'Ref. PBAB/N/2026/42 · 1–15 Sep at the office', pdf: 'PDF · 64 KB', href: '#pdf' },
    { date: '20 Aug 2026', year: '2026', category: 'Exam', tone: 'neutral',
      title: 'Test examination routine — Class X and Class XII',
      ref: 'Ref. PBAB/N/2026/41 · 16–27 Nov', pdf: 'PDF · 180 KB', href: '#pdf' },
    { date: '12 Aug 2026', year: '2026', category: 'Office', tone: 'neutral',
      title: 'Independence Day programme — attendance compulsory for Classes VIII–XII',
      ref: 'Ref. PBAB/N/2026/40 · Report by 7:45', pdf: 'PDF · 58 KB', href: '#pdf' },
    { date: '01 Aug 2026', year: '2026', category: 'Office', tone: 'neutral',
      title: 'Sabooj Sathi cycle distribution — Class IX list',
      ref: 'Ref. PBAB/N/2026/39', pdf: 'PDF · 140 KB', href: '#pdf' },
  ],
};

export const contact = {
  kicker: '08 · Reach the school',
  title: 'Contact Us',
  titleBn: 'যোগাযোগ',
  details: [
    { icon: 'map-pin', term: 'Address · ঠিকানা',
      lines: ['Purba Barasat Adarsha Bidyapith', 'Taki Road, about 1 km east of Champadali Crossing',
              'Purba Barasat, P.O. Barasat, P.S. Barasat', 'North 24 Parganas, West Bengal 700124'] },
    { icon: 'phone', term: 'Phone · ফোন',
      lines: ['<a href="tel:+913325522928" style="font-size:18px">(033) 2552 2928</a>',
              '<a href="tel:+913325844601" style="font-size:18px">(033) 2584 4601</a>'] },
    { icon: 'mail', term: 'Email · ইমেল',
      lines: ['<a href="mailto:pbab.1963@gmail.com">pbab.1963@gmail.com</a>'] },
    { icon: 'clock', term: 'Office hours',
      lines: ['Monday–Saturday 10:30–16:30 · Closed Sundays and listed holidays',
              '<span class="text-muted">School hours 10:50–16:20 (morning section 6:30–10:30 for Classes V–VI)</span>'] },
  ],
  map: { label: 'Map embed · Purba Barasat', link: { label: 'Open in Google Maps →', href: '#maps' }, embed: null },
  enquiry: {
    title: 'Send an enquiry', titleBn: 'জিজ্ঞাসা পাঠান',
    intro: 'The office replies within 3 working days. For urgent matters, please call.',
    privacy: 'Your details are used only to reply to this enquiry.',
    submit: 'Send enquiry',
    fields: [
      { name: 'name', label: 'Your name', type: 'text', required: true, half: true,
        requiredMessage: 'Enter your name.' },
      { name: 'mobile', label: 'Mobile number', type: 'tel', required: true, half: true, rule: 'mobile',
        requiredMessage: 'Enter a mobile number we can reply on.' },
      { name: 'email', label: 'Email', type: 'email', half: true },
      { name: 'role', label: 'I am a', type: 'select', half: true,
        options: ['Parent / guardian', 'Student', 'Prospective applicant', 'Alumni', 'Other'] },
      { name: 'subject', label: 'Subject', type: 'select', required: true,
        options: ['Admission enquiry', 'Certificates / transfer certificate', 'Fees & scholarships', 'Attendance or results', 'Other'] },
      { name: 'message', label: 'Message', type: 'textarea', required: true,
        placeholder: 'Write in Bengali or English…', requiredMessage: 'Write your message.' },
    ],
  },
};
