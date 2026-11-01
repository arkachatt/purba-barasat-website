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
  /* The site's own log-in gateway at login.html — the role picker that stood
     between a visitor and the management software. Off: the school's system
     has its own sign-in page, so a second one here would be a screen to get
     past rather than a way in. This hides the footer link, the Students →
     Student Portal entry and the portal button on the Students page, and
     closes login.html. The header's Log In button does not depend on it; see
     `portal` below, which sends people straight to the real thing. */
  login: false,

  /* Results & Events. Off until the board figures and event write-ups are
     real: hides the nav item, the footer and home-page links, and closes
     results.html and event.html. */
  results: false,

  /* The whole Academic Calendar. Off until the school's own almanac for the
     coming session is in: hides the nav item and its dropdown, the home-page
     tile, the footer's Holiday List link, and closes calendar.html. The
     holiday, exam and syllabus data below stays as it is. */
  calendar: false,

  /* The syllabus tab of the Academic Calendar. Off until the subject PDFs are
     uploaded: hides the tab and the header dropdown entry. Moot while
     `calendar` itself is off. */
  syllabus: false,

  /* The exam schedule. Off because the routine still carries the design's
     invented dates, which run Jun 2026 – Mar 2027 and so contradict the real
     holiday list beside them. On again once the school's routine is in. Moot
     while `calendar` itself is off. */
  exams: false,

  /* The "Send an enquiry" form on the Contact page. Off because nothing
     carries the enquiry away yet — `services/enquiry.js` has no adapter, so a
     guardian would fill it in and the office would never see it. The address,
     phone and map stay, and widen to fill the page. */
  enquiry: false,
};

/**
 * Where "Log In" goes: the school's management software, which lives on its
 * own domain and has its own sign-in page. The button is in the masthead
 * rather than the navigation because it leaves the website — the nav is for
 * pages of this site, and this is not one.
 *
 * Same tab on purpose. A new tab a guardian cannot easily close is worse on
 * a phone than a Back button that works.
 */
export const portal = {
  label: 'Log In',
  labelBn: 'লগ ইন',
  href: 'https://purba-barasat.chalked.in',
};

export const school = {
  name: 'Purba Barasat Adarsha Bidyapith',
  nameBn: 'পূর্ব বারাসাত আদর্শ বিদ্যাপীঠ',
  district: 'North 24 Parganas',
  established: 1963,
  /* The school's crest. `logo` is the masked PNG — everything outside the
     circle is transparent, so it sits on the header, the footer or any other
     surface without a white box around it. `logoFlat` is the same mark on
     opaque white, for the two places transparency is wrong: the iOS home
     screen icon, which fills transparency with black, and the application
     PDF, which prints on paper. Setting `logo` to null brings back the LOGO
     plate the design started with. */
  logo: 'assets/img/logo.png',
  logoFlat: 'assets/img/logo-flat.png',
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
  /* The crest already links home, but only someone who has met that
     convention knows it does. A named item costs one slot on the bar. */
  { label: 'Home',              bn: 'হোম',                  href: 'index.html' },
  { label: 'About Us',          bn: 'আমাদের সম্পর্কে',       href: 'about.html' },
  { label: "From HM's Desk",    bn: 'প্রধান শিক্ষকের কলম',    href: 'hm.html' },
  { label: 'Teachers',          bn: 'শিক্ষকমণ্ডলী',          href: 'teachers.html',
    children: [
      /* The hash picks the directory's teaching/non-teaching segment — see
         `kindFromHash` in components/staff-directory.js. Both carry one, so
         either item works from the teachers page itself, where a bare
         `teachers.html` link would do nothing at all. */
      { label: 'Teaching Staff',     bn: 'শিক্ষক',           href: 'teachers.html#teaching' },
      { label: 'Non-teaching Staff', bn: 'শিক্ষাকর্মী',       href: 'teachers.html#non-teaching' },
      { label: 'Casual Teaching',    bn: 'অস্থায়ী শিক্ষক',     href: 'teachers.html#casual-teaching' },
      { label: 'Casual Non-teaching', bn: 'অস্থায়ী কর্মী',     href: 'teachers.html#casual-non-teaching' },
    ] },
  { label: 'Students',          bn: 'ছাত্রছাত্রী',           href: 'students.html',
    children: [
      { label: 'Class-wise Strength', bn: 'শ্রেণিভিত্তিক',   href: 'students.html' },
      { label: 'Student Portal',      bn: 'পোর্টাল',          href: 'login.html', feature: 'login' },
    ] },
  { label: 'Admission',         bn: 'ভর্তি',                href: 'admission.html' },
  { label: 'Academic Calendar', bn: 'শিক্ষাবর্ষ পঞ্জিকা',     href: 'calendar.html',
    feature: 'calendar',
    children: [
      { label: 'Holiday List',  bn: 'ছুটির তালিকা',          href: 'calendar.html#holidays' },
      { label: 'Exam Schedule', bn: 'পরীক্ষার সূচি',          href: 'calendar.html#exams', feature: 'exams' },
      { label: 'Syllabus',      bn: 'পাঠ্যসূচি',             href: 'calendar.html#syllabus', feature: 'syllabus' },
    ] },
  { label: 'Results & Events',  bn: 'ফলাফল ও অনুষ্ঠান',      href: 'results.html', feature: 'results' },
  { label: 'Contact Us',        bn: 'যোগাযোগ',              href: 'contact.html' },
];

/** Carousel slides. Give a slide an `image` and the hatched plate steps aside. */
/* The hero. Only photographs the school has actually supplied go in here:
   an empty slide beside a real one reads as a gallery that failed to load,
   so the carousel hides its arrows and dots while there is a single slide
   rather than offering to page through nothing.

   `focus` is the image's object-position under `object-fit: cover`. The
   frame is wider than this photograph, so the overflow is vertical, and
   anchoring it to the bottom crops the sky rather than the signboard and
   the children. `duotone: true` would wash the photograph into the steel
   accent — the design system's treatment for content imagery, which the
   school's own photographs do not need. */
export const carouselSlides = [
  { caption: 'The school on Taki Road, and students with their drawings',
    image: 'assets/img/campus-banner.jpg',
    alt: 'Two photographs side by side: the frontage of Purba Barasat Adarsha Bidyapith on Taki Road with its name board, and students of the school holding up drawings they have made',
    focus: 'bottom',
    duotone: false },
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
  title: 'Admission open for Classes V–VIII — Session 2027',
  sub: 'ভর্তি চলছে · Bengali and English medium · Online forms 5–25 November 2026',
  cta: { label: 'Go to Admission', href: 'admission.html' },
};

/** Notices, newest first. `tone` picks the chip: 'accent' highlights, 'neutral' files.
 *
 * Only notices the school has actually issued belong here. Each row links
 * straight to its PDF rather than to an anchor on notice.html — a guardian on
 * a phone should reach the document in one tap. The same two notices make up
 * `noticeBoard.list` below, so the home strip and the notice page cannot drift
 * apart.
 */
export const notices = [
  { id: 'adm-2027-bengali', day: '01 Nov', year: '2026', tag: 'Admission', tone: 'accent',
    href: 'assets/pdf/admission-notice-2027-bengali-medium.pdf',
    text: 'Admission Notice 2027 — Bengali medium, Class V. Online form 5–25 November 2026.' },
  { id: 'adm-2027-english', day: '01 Nov', year: '2026', tag: 'Admission', tone: 'accent',
    href: 'assets/pdf/admission-notice-2027-english-medium.pdf',
    text: 'Admission Notice 2027 — English medium, Classes V–VIII. Online form 5–25 November 2026.' },
];

export const headmaster = {
  kicker: "From the HM's Desk · প্রধান শিক্ষকের কলম",
  kickerShort: "From the HM's Desk",
  name: 'Samir Acharya',
  post: 'Headmaster (HM) · M.Sc. (Chemistry), B.Ed. (First Class)',
  postShort: 'Headmaster · M.Sc. (Chemistry), B.Ed. (First Class)',
  /* The office's photograph, cropped to the 5:6 both photo boxes use. */
  photo: 'assets/img/headmaster.jpg',
  excerpt: "Purba Barasat Adarsha Bidyapith has stood beside Taki Road since 1963, when a few determined people of Kalikapur began a school with two classes under a tiled roof. What has not changed is who the school is for\u2026",
  href: 'hm.html',
};

export const quickLinks = [
  { icon: 'bell',     title: 'Notice',            shortTitle: 'Notice',   bn: 'বিজ্ঞপ্তি', sub: 'All circulars & PDFs',        href: 'notice.html' },
  { icon: 'trophy',   title: 'Results',           shortTitle: 'Results',  bn: 'ফলাফল',    sub: 'Madhyamik & HS',              href: 'results.html', feature: 'results' },
  { icon: 'calendar', title: 'Academic Calendar', shortTitle: 'Calendar', bn: 'পঞ্জিকা',   sub: features.syllabus ? 'Holidays, exams, syllabus' : 'Holidays and exam schedule',
    href: 'calendar.html', feature: 'calendar' },
  { icon: 'map-pin',  title: 'Contact',           shortTitle: 'Contact',  bn: 'যোগাযোগ',   sub: 'Address, phone, map',         href: 'contact.html' },
];

export const footerLinks = [
  { label: 'Notice',       href: 'notice.html' },
  { label: 'Admission',    href: 'admission.html' },
  { label: 'Results',      href: 'results.html', feature: 'results' },
  { label: 'Holiday List', href: 'calendar.html#holidays', feature: 'calendar' },
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
  photo: 'assets/img/headmaster.jpg',
  name: 'Samir Acharya',
  post: 'Headmaster (HM) · Chemistry',
  credentials: 'M.Sc. (Chemistry), B.Ed. (First Class)',
  meta: ['Message updated 01 Nov 2026', 'Session 2026–27'],
  /* The Headmaster has no separate email — write to the school office. The
     room number and parent-meeting hours that sat here were invented by the
     design and have been removed rather than left on a live page about a
     real person; add them back when the office confirms them. */
  details: [
    ['Email', '<a href="mailto:pbab.1963@gmail.com">pbab.1963@gmail.com</a> <span class="text-muted">(school office)</span>'],
    ['Phone', '<a href="tel:+913325522928">(033) 2552 2928</a>'],
  ],
  salutation: 'Dear parents, students and colleagues,',
  /* Written for the Headmaster to read over and change as he wishes, and
     deliberately free of any claim this site cannot stand behind — no pass
     percentages, no college placements, no awards. Everything it states is
     already published elsewhere on the site: the founding, the streams, the
     enrolment, the two admission notices. Replace it with his own words
     whenever he sends them. */
  paragraphs: [
    "Purba Barasat Adarsha Bidyapith has stood beside Taki Road since 1963, when a few determined people of Kalikapur began a school with two classes under a tiled roof. It now teaches more than two and a half thousand students from Class V upward, in Bengali, with Science, Commerce and Arts at the Higher Secondary stage and a vocational wing besides. The building has grown to five storeys. What has not changed is who the school is for: the children of the families around it.",
    "Much of what a school achieves is settled by small, ordinary habits. Come every day — a child who is absent on Mondays and Saturdays loses a fifth of the year, and no amount of extra class makes that up afterwards. Read every day, in Bengali and in English both, at home as well as in class. And be kind: to classmates, to the staff who keep this campus clean, and to yourself on the day a result disappoints.",
    "For the coming session the school is calling applications for Class V in the Bengali medium, and for Classes V to VIII in a dedicated English section. Both notices are published on this site with the dates, the age limits and the papers to bring. I would ask every guardian to read the notice itself rather than rely on what is said at the school gate, and to come to the office if anything in it is unclear.",
    "This website is new and still filling up; until it is complete the office remains the authority on anything you read here. Please tell us when a telephone number or an address changes, come to the parent-teacher meetings when they are announced, and if something is wrong, say so — to the class teacher first, and to me if it is not put right. The door of this room is not closed to any guardian.",
    'With warm regards,',
  ],
  signature: { name: 'Samir Acharya', post: 'Headmaster, Purba Barasat Adarsha Bidyapith' },
};

/**
 * The staff roster as the school office publishes it: every sanctioned post,
 * filled or vacant. Counts are derived from this list (see `staffCounts`), so
 * adding or filling a post updates the page's headline figures too.
 *
 * Photographs, telephone numbers and email addresses come from the school's
 * own consent form, and only where that person ticked yes to that particular
 * item: 21 photographs, 16 email addresses, 7 mobile numbers. Two more
 * portraits — Sri Prasanta Mridha's and Sri Sanjay Ghosh's — came to the
 * office separately and have no row in that form. Several people
 * sent a photograph while refusing one or both of the contact details, and
 * their row shows a dash — that is the answer they gave, not missing data.
 * Nobody who did not fill the form in appears here with anything.
 *
 * The contact columns appear as soon as anyone has a `phone` or an `email`,
 * so removing the last of them takes the columns away again — which is what
 * to do if someone withdraws their consent.
 */
export const staff = [
  { sl: 1, name: 'Sri Samir Acharya', post: 'Headmaster', group: 'Headmaster', kind: 'teaching', qualification: 'M.Sc. (Chemistry), B.Ed. (First Class)', photo: 'assets/img/headmaster.jpg' },
  { sl: 2, name: null, post: 'Assistant Headmaster', group: 'Assistant Headmaster', kind: 'teaching', qualification: null, vacant: true, photo: null },
  { sl: 3, name: 'Smt. Manika Roy', post: 'Assistant Teacher', group: 'Assistant Teacher', kind: 'teaching', qualification: 'M.A. (Geography), B.Ed. (First Class)', photo: null },
  { sl: 4, name: 'Smt. Reshma Khatun', post: 'Assistant Teacher', group: 'Assistant Teacher', kind: 'teaching', qualification: 'M.A. (Bengali), B.Ed.', phone: '80170 43291', tel: '+918017043291', email: 'reshma2uin@gmail.com', photo: 'assets/img/staff/reshma-khatun.jpg' },
  { sl: 5, name: 'Sri Trinath Mistri', post: 'Assistant Teacher', group: 'Assistant Teacher', kind: 'teaching', qualification: 'M.A. (Bengali), B.Ed.', photo: null },
  { sl: 6, name: 'Sri Sanjay Ghosh', post: 'Assistant Teacher', group: 'Assistant Teacher', kind: 'teaching', qualification: 'M.Com., B.Ed. (First Class), C.A., C.M.A.', photo: 'assets/img/staff/sanjay-ghosh.jpg' },
  { sl: 7, name: 'Sri Dipnarayan Biswas', post: 'Assistant Teacher', group: 'Assistant Teacher', kind: 'teaching', qualification: 'B.Sc. (Hons.) (Physics), B.Ed.', photo: null },
  { sl: 8, name: 'Sri Biplab Haldar', post: 'Assistant Teacher', group: 'Assistant Teacher', kind: 'teaching', qualification: 'M.Sc. (Chemistry), B.Ed. (First Class)', photo: null },
  { sl: 9, name: 'Sri Debashis Sarkar', post: 'Assistant Teacher', group: 'Assistant Teacher', kind: 'teaching', qualification: 'M.A. (English), B.Ed. (First Class)', email: 'debashis2uin@gmail.com', photo: 'assets/img/staff/debashis-sarkar.jpg' },
  { sl: 10, name: 'Smt. Chaitali Saha', post: 'Assistant Teacher', group: 'Assistant Teacher', kind: 'teaching', qualification: 'M.A. (Bengali), B.Ed. (First Class)', photo: null },
  { sl: 11, name: 'Sri Lakshman Halder', post: 'Assistant Teacher', group: 'Assistant Teacher', kind: 'teaching', qualification: 'M.A. (English), B.Ed. (First Class)', photo: null },
  { sl: 12, name: 'Sri Nandalal Roy', post: 'Assistant Teacher', group: 'Assistant Teacher', kind: 'teaching', qualification: 'B.Com. (Hons.), B.P.Ed. (First Class)', photo: null },
  { sl: 13, name: 'Smt. Debdutta Mukherjee (Chakraborty)', post: 'Assistant Teacher', group: 'Assistant Teacher', kind: 'teaching', qualification: 'M.Sc. (First Class), B.Ed. (First Class)', email: 'dmc.pbab.07@gmail.com', photo: 'assets/img/staff/debdutta-mukherjee.jpg' },
  { sl: 14, name: 'Sri Anup Mondal', post: 'Assistant Teacher', group: 'Assistant Teacher', kind: 'teaching', qualification: 'B.A. (English), M.A. (History), B.Ed. (1st Class)', phone: '70037 65660', tel: '+917003765660', photo: 'assets/img/staff/anup-mondal.jpg' },
  { sl: 15, name: 'Sri Rabindranath Mandal', post: 'Assistant Teacher', group: 'Assistant Teacher', kind: 'teaching', qualification: 'M.A. (History), B.Ed. (First Class)', photo: null },
  { sl: 16, name: 'Sri Kallol Kanti Mondal', post: 'Assistant Teacher', group: 'Assistant Teacher', kind: 'teaching', qualification: 'M.A. (Education), B.Ed.', photo: null },
  { sl: 17, name: 'Sri Goutam Jana', post: 'Assistant Teacher', group: 'Assistant Teacher', kind: 'teaching', qualification: 'B.Sc. (Hons.) (Computer Science), M.C.A., B.Ed.', photo: null },
  { sl: 18, name: 'Sri Subal Sarkar', post: 'Assistant Teacher', group: 'Assistant Teacher', kind: 'teaching', qualification: 'M.A. (Political Science), B.Ed.', photo: null },
  { sl: 19, name: 'Smt. Shampa Das', post: 'Assistant Teacher', group: 'Assistant Teacher', kind: 'teaching', qualification: 'M.Sc. (Food & Nutrition) (1st Class), B.Ed. (1st Class)', photo: 'assets/img/staff/shampa-das.jpg' },
  { sl: 20, name: 'Smt. Nabomita Howlader', post: 'Assistant Teacher', group: 'Assistant Teacher', kind: 'teaching', qualification: 'M.Sc. (Human Development), B.Ed. (First Class)', email: 'mitanabo84@gmail.com', photo: 'assets/img/staff/nabomita-howlader.jpg' },
  { sl: 21, name: 'Smt. Kumkum Mandal Basak', post: 'Assistant Teacher', group: 'Assistant Teacher', kind: 'teaching', qualification: 'M.Sc. (Economics) (1st Class), B.Ed. (First Class), M.Phil.', photo: null },
  { sl: 22, name: 'Sri Prasanta Mridha', post: 'Assistant Teacher', group: 'Assistant Teacher', kind: 'teaching', qualification: 'M.Sc. (Chemistry) (1st Class), M.A. (Education) (1st Class), B.Ed. (First Class)', photo: 'assets/img/staff/prasanta-mridha.jpg' },
  { sl: 23, name: 'Sri Sudarsan Pramanik', post: 'Assistant Teacher', group: 'Assistant Teacher', kind: 'teaching', qualification: 'M.A. (Bengali), B.Ed. (First Class)', photo: null },
  { sl: 24, name: 'Sri Rajat Subhra Karmakar', post: 'Assistant Teacher', group: 'Assistant Teacher', kind: 'teaching', qualification: 'M.Sc. (Mathematics) (1st Class), B.Ed. (First Class)', photo: null },
  { sl: 25, name: 'Sri Subhashis Ghorui', post: 'Assistant Teacher', group: 'Assistant Teacher', kind: 'teaching', qualification: 'B.Sc. (Pure Science), D.El.Ed. (1st Class)', photo: null },
  { sl: 26, name: 'Smt. Manami Dasgupta', post: 'Assistant Teacher', group: 'Assistant Teacher', kind: 'teaching', qualification: 'M.Sc. (Zoology) (1st Class), B.Ed. (1st Class)', email: 'manamidasgupta@gmail.com', photo: 'assets/img/staff/manami-dasgupta.jpg' },
  { sl: 27, name: 'Sri Debal Deb Bhattacharjee', post: 'Assistant Teacher', group: 'Assistant Teacher', kind: 'teaching', qualification: 'M.Sc. (Physics) (1st Class), B.Ed. (1st Class)', email: 'debaldeb@gmail.com', photo: 'assets/img/staff/debal-bhattacharjee.jpg' },
  { sl: 28, name: 'Sri Shyamal Kumar Mandal', post: 'Assistant Teacher', group: 'Assistant Teacher', kind: 'teaching', qualification: 'M.A. (Sanskrit), B.Ed. (1st Class)', photo: 'assets/img/staff/shyamal-mandal.jpg' },
  { sl: 29, name: 'Sri Pulak Nath', post: 'Assistant Teacher', group: 'Assistant Teacher', kind: 'teaching', qualification: 'M.A. (English) (1st Class), B.Ed. (1st Class)', email: 'pulak.nath2009@gmail.com', photo: 'assets/img/staff/pulak-nath.jpg' },
  { sl: 30, name: 'Sri Tapan Sarkar', post: 'Assistant Teacher', group: 'Assistant Teacher', kind: 'teaching', qualification: 'M.A. (Geography), B.Ed.', phone: '97339 91299', tel: '+919733991299', email: 'tapan.sbi1977@gmail.com', photo: 'assets/img/staff/tapan-sarkar.jpg' },
  { sl: 31, name: 'Sri Piyali Basu', post: 'Assistant Teacher', group: 'Assistant Teacher', kind: 'teaching', qualification: 'M.Sc. (Agriculture), B.Ed. (First Class)', photo: null },
  { sl: 32, name: 'Smt. Shipra Sarkar (Biswas)', post: 'Assistant Teacher', group: 'Assistant Teacher', kind: 'teaching', qualification: 'B.Sc. (Pure Science), B.Ed. (First Class)', photo: 'assets/img/staff/shipra-sarkar.jpg' },
  { sl: 33, name: 'Sri Avijit Halder', post: 'Assistant Teacher', group: 'Assistant Teacher', kind: 'teaching', qualification: 'M.Sc. (Zoology) (1st Class), B.Ed. (1st Class)', photo: 'assets/img/staff/avijit-halder.jpg' },
  { sl: 34, name: 'Sri Ismail Mollick', post: 'Assistant Teacher', group: 'Assistant Teacher', kind: 'teaching', qualification: 'M.Sc. (Geography) (1st Class), B.Ed. (1st Class)', photo: null },
  { sl: 35, name: 'Smt. Sutapa Mitra', post: 'Assistant Teacher', group: 'Assistant Teacher', kind: 'teaching', qualification: 'M.A. (English), B.Ed. (1st Class)', email: 'mitrasutapa1982@gmail.com', photo: 'assets/img/staff/sutapa-mitra.jpg' },
  { sl: 36, name: 'Barnali Podder', post: 'Assistant Teacher', group: 'Assistant Teacher', kind: 'teaching', qualification: 'M.A. (History), B.Ed. (1st Class)', photo: null },
  { sl: 37, name: 'Sri Ram Krishna Barui', post: 'Assistant Teacher', group: 'Assistant Teacher', kind: 'teaching', qualification: 'M.A. (Bengali), B.Ed. (1st Class)', photo: null },
  { sl: 38, name: 'Md. Mainur Islam', post: 'Assistant Teacher', group: 'Assistant Teacher', kind: 'teaching', qualification: 'M.Sc. (Mathematics) (1st Class), B.Ed. (1st Class)', photo: null },
  { sl: 39, name: 'Smt. Purnima Mondal', post: 'Assistant Teacher', group: 'Assistant Teacher', kind: 'teaching', qualification: 'B.A. (Sanskrit), M.A. (History), B.Ed. (1st Class)', photo: null },
  { sl: 40, name: 'Smt. Nandini Ray', post: 'Assistant Teacher', group: 'Assistant Teacher', kind: 'teaching', qualification: 'M.Sc. (Zoology) (1st Class), B.Ed. (1st Class)', photo: null },
  { sl: 41, name: 'Smt. Ajukta Sarker', post: 'Assistant Teacher', group: 'Assistant Teacher', kind: 'teaching', qualification: 'M.Sc. (Zoology) (1st Class), B.Ed. (1st Class)', phone: '99337 91666', tel: '+919933791666', email: 'ajuktasarker@gmail.com', photo: 'assets/img/staff/ajukta-sarker.jpg' },
  { sl: 42, name: 'Sri Rajib Das', post: 'Assistant Teacher', group: 'Assistant Teacher', kind: 'teaching', qualification: 'B.Sc. (Physics – Hons.), B.Ed. (1st Class)', phone: '74320 96178', tel: '+917432096178', email: 'mastermindrajib@gmail.com', photo: 'assets/img/staff/rajib-das.jpg' },
  { sl: 43, name: 'Smt. Kalpana Roy', post: 'Assistant Teacher', group: 'Assistant Teacher', kind: 'teaching', qualification: 'M.A. (Music), B.Ed. (First Class)', photo: null },
  { sl: 44, name: 'Smt. Mousumi Chowdhury', post: 'Assistant Teacher', group: 'Assistant Teacher', kind: 'teaching', qualification: 'M.A. (Philosophy), B.Ed. (First Class)', email: 'chowdhurymousumi438@gmail.com', photo: 'assets/img/staff/mousumi-chowdhury.jpg' },
  { sl: 45, name: null, post: 'Assistant Teacher', group: 'Assistant Teacher', kind: 'teaching', qualification: 'Hons. / PG — Mathematics', vacant: true, photo: null },
  { sl: 46, name: 'Sri Subhendu Bikash Bhanja', post: 'Assistant Teacher', group: 'Assistant Teacher', kind: 'teaching', qualification: 'B.A. (Hons.) Bengali, B.Ed. (First Class)', email: 'subhendubikashbhanja@gmail.com', photo: 'assets/img/staff/subhendu-bhanja.jpg' },
  { sl: 47, name: null, post: 'Para Teacher', group: 'Para Teacher', kind: 'teaching', qualification: null, vacant: true, photo: null },
  { sl: 48, name: 'Sri Bidya Sankar Ray', post: 'Librarian', group: 'Librarian', kind: 'nonTeaching', qualification: 'B.Sc. (Hons.) (Physics), B.Ed., B.Lib. & Information Science (First Class)', photo: null },
  { sl: 49, name: 'Smt. Trina Ghosh', post: 'Clerk', group: 'Clerk', kind: 'nonTeaching', qualification: 'M.A. (Environmental Studies)', photo: null },
  { sl: 50, name: null, post: 'Clerk', group: 'Clerk', kind: 'nonTeaching', qualification: null, vacant: true, photo: null },
  { sl: 51, name: 'Sri Ashok Kumar Roy', post: 'Group D Staff', group: 'Group D Staff', kind: 'nonTeaching', qualification: null, photo: null },
  { sl: 52, name: 'Sri Subrata Sardar', post: 'Group D Staff', group: 'Group D Staff', kind: 'nonTeaching', qualification: 'B.Com. (Hons.)', photo: null },
  { sl: 53, name: null, post: 'Group D Staff', group: 'Group D Staff', kind: 'nonTeaching', qualification: null, vacant: true, photo: null },
  { sl: 54, name: null, post: 'Group D Staff', group: 'Group D Staff', kind: 'nonTeaching', qualification: null, vacant: true, photo: null },
  { sl: 55, name: 'Sri Kausik Kumar Konar', post: 'Computer Teacher', group: 'Computer Teacher', kind: 'teaching', qualification: 'B.Com. (Hons.), Computer ‘O’ Level', phone: '92318 40176', tel: '+919231840176', email: 'kausikkonar@gmail.com', photo: 'assets/img/staff/kausik-konar.jpg' },
  { sl: 56, name: 'Sri Arnab Das', post: 'ICT Teacher', group: 'ICT Teacher', kind: 'teaching', qualification: 'B.C.A., M.Sc. (1st Class)', email: 'adarnabd11@gmail.com', photo: 'assets/img/staff/arnab-das.jpg' },
  /* Filed a form response but was not on the roster the office published. */
  { sl: 57, name: 'Sri Subhadeep Basu', post: 'Computer Teacher', group: 'Computer Teacher', kind: 'teaching', qualification: 'B.C.A.', phone: '99038 14352', tel: '+919903814352', email: 'subhadeepbasu007@gmail.com', photo: 'assets/img/staff/subhadeep-basu.jpg' },
];

/**
 * Casual staff — appointed by the school rather than against a sanctioned
 * post, so they are a register of their own: their own serial numbers (C1
 * upward, as the office's own list runs), no vacancies to show, and they are
 * left out of the sanctioned-post counts above.
 *
 * They are in the same array so that one search box, one post filter and one
 * table serve the whole staff; the `kind` is what keeps the two registers
 * apart. No honorifics here: the office's list gives none, and Sri or Smt. is
 * not something to guess at for a real person.
 */
const casualStaff = [
  { sl: 'C1',  name: 'Sankar Biswas',          post: 'Office Staff',  group: 'Office Staff',  kind: 'casualNonTeaching', qualification: null, photo: null },
  { sl: 'C2',  name: 'Chandrani Mitra',        post: 'Office Staff',  group: 'Office Staff',  kind: 'casualNonTeaching', qualification: null, photo: null },
  { sl: 'C3',  name: 'Biswajit Mondal',        post: 'Office Staff',  group: 'Office Staff',  kind: 'casualNonTeaching', qualification: null, photo: null },
  { sl: 'C4',  name: 'Viswadeb Chatterjee',     post: 'Office Staff',  group: 'Office Staff',  kind: 'casualNonTeaching', qualification: null, photo: null },
  { sl: 'C5',  name: 'Pradip Saha (Soumen)',   post: 'Office Staff',  group: 'Office Staff',  kind: 'casualNonTeaching', qualification: null, photo: null },
  { sl: 'C6',  name: 'Swapan Das',             post: 'Group D Staff', group: 'Group D Staff', kind: 'casualNonTeaching', qualification: null, photo: null },
  { sl: 'C7',  name: 'Pradip Paul',            post: 'Group D Staff', group: 'Group D Staff', kind: 'casualNonTeaching', qualification: null, photo: null },
  { sl: 'C8',  name: 'Soma Bhowmik',           post: 'Group D Staff', group: 'Group D Staff', kind: 'casualNonTeaching', qualification: null, photo: null },
  { sl: 'C9',  name: 'Subal Paul',             post: 'Teacher',       group: 'Teacher',       kind: 'casualTeaching',    qualification: 'M.Com., B.Ed.', photo: null },
  { sl: 'C10', name: 'Ankita Chowdhury',       post: 'Teacher',       group: 'Teacher',       kind: 'casualTeaching',    qualification: 'M.A. (Journalism and Mass Communication), B.Ed.', photo: null },
  { sl: 'C11', name: 'Rinki Biswas',           post: 'Teacher',       group: 'Teacher',       kind: 'casualTeaching',    qualification: 'M.A. (Sanskrit), B.Ed.', photo: null },
];

staff.push(...casualStaff);

/** Which posts the filter offers, in the order the office lists them. */
export const staffPosts = [
  'Headmaster', 'Assistant Headmaster', 'Assistant Teacher', 'Para Teacher',
  'Computer Teacher', 'ICT Teacher', 'Librarian', 'Clerk', 'Group D Staff',
  'Teacher', 'Office Staff',
];

/* Headline figures, counted from the roster rather than typed in twice. */
const inPost = (kind) => staff.filter((p) => p.kind === kind && !p.vacant).length;
const sanctioned = (kind) => staff.filter((p) => p.kind === kind).length;

export const staffCounts = {
  teaching: inPost('teaching'),
  teachingSanctioned: sanctioned('teaching'),
  nonTeaching: inPost('nonTeaching'),
  nonTeachingSanctioned: sanctioned('nonTeaching'),
  /* Casual appointments are not sanctioned posts, so they are counted apart
     and never folded into the figures above. */
  casualTeaching: inPost('casualTeaching'),
  casualNonTeaching: inPost('casualNonTeaching'),
  updated: 'As published by the school office',
};

/* Class-wise enrolment, from the office's own student list in Chalked
   (admin.chalked.in), pulled class by class on 1 November 2026. Sections the
   list carries but has no students in — 9-D, 9-E, and all three of Class XII
   — are left out rather than printed as zeroes.

   The totals below are counted from this table, not typed beside it, and the
   teacher figure comes from the staff roster. A number published twice is a
   number that will disagree with itself eventually. */
const studentClasses = [
  { name: 'Class V',    sections: [['A', 126], ['B', 125], ['C', 124], ['D', 42]] },
  { name: 'Class VI',   sections: [['A', 133], ['B', 130], ['C', 124], ['D', 40]] },
  { name: 'Class VII',  sections: [['A', 130], ['B', 128], ['C', 131], ['D', 37], ['E', 37]] },
  { name: 'Class VIII', sections: [['A', 116], ['B', 112], ['C', 115], ['D', 6], ['E', 10]] },
  { name: 'Class IX',   sections: [['A', 128], ['B', 128], ['C', 132]] },
  { name: 'Class X',    sections: [['A', 102], ['B', 100], ['C', 100]] },
  { name: 'Class XI',   sections: [['Arts', 162], ['Commerce', 126], ['Science', 131]] },
];

const sectionCount = studentClasses.reduce((n, klass) => n + klass.sections.length, 0);
const studentCount = studentClasses.reduce(
  (n, klass) => n + klass.sections.reduce((sum, [, count]) => sum + count, 0), 0);
const asOnShort = 'as on 01 Nov 2026';

export const students = {
  kicker: '04 · Class-wise strength',
  title: 'Students',
  titleBn: 'ছাত্রছাত্রী',
  asOnShort,
  asOn: `Session 2026–27 · ${asOnShort}`,
  privacyNote: 'Counts only — no personal data is published.',
  total: studentCount.toLocaleString('en-IN'),
  summary: `Classes V–XI · ${sectionCount} sections · ${staffCounts.teaching} teachers`,
  /* Said plainly rather than left as a gap between "V–XII" everywhere else
     on the site and "V–XI" here. */
  note: 'Class XII is not counted here. The office\'s list for this session ' +
    'carries its Arts, Commerce and Science sections but has no students in them.',
  sections: sectionCount,
  classes: studentClasses,
};

/* ══════════════════════════════════════════════════════════════════════════
   03 — Admission
   ══════════════════════════════════════════════════════════════════════════ */

/**
 * Classes that have a rule and a row in the form but are not admitted this
 * session. They appear greyed and unselectable in the class dropdown, are
 * refused on submit, and are left out of the eligibility line published on
 * the admission page. The year the school opens one, delete it from here and
 * nothing else needs touching.
 */
export const admissionClosedClasses = ['Class IX'];

/**
 * When the online form accepts a submission, from the notice: the form opens
 * on 5 November 2026 and closes at midnight at the end of 25 November 2026,
 * both days included, exactly as the notice prints the dates.
 *
 * The offsets are written out, so the deadline is the school office's own
 * clock rather than whatever clock the applicant's device is set to. A
 * guardian applying from abroad, or from a phone with the wrong time zone,
 * gets the same closing moment as one standing outside the office.
 *
 * Outside the window the form is shown but frozen — every field disabled and
 * a panel saying when it opens — rather than hidden, so a guardian can read
 * what will be asked and come back prepared.
 */
export const admissionWindow = {
  opens: '2026-11-05T00:00:00+05:30',
  /* Midnight at the END of the 25th: the whole of the last day counts. */
  closes: '2026-11-26T00:00:00+05:30',
  opensLabel: '5 November 2026',
  closesLabel: '25 November 2026',
  /* What the office still accepts once the online form has closed. */
  counterLabel: '13 to 28 November 2026, 11:30–13:00',
};

/**
 * The window of birth dates each class accepts, as the school's two notices
 * publish them. Both ends are inclusive.
 *
 * It is a twelve-month window, not an age in years: a child who repeated a
 * year falls outside it, and that is the office's call to make on paper, not
 * the form's to wave through.
 *
 * Classes V–VII are printed in the English-medium notice (and Class V again
 * in the Bengali one, identically). Class VIII continues the step both
 * notices set — each class one year earlier, 02/01 to 01/01 — and is printed
 * in the published English notice too. Class IX is not admitted this
 * session; its row is only here so the window is ready when it is, which is
 * what `provisional` marks.
 *
 * Dates are ISO so the validator can compare them as plain strings; that
 * also keeps time zones out of it entirely.
 */
export const admissionDobRanges = {
  'Class V':    { from: '2016-01-02', to: '2017-01-01' },
  'Class VI':   { from: '2015-01-02', to: '2016-01-01' },
  'Class VII':  { from: '2014-01-02', to: '2015-01-01' },
  'Class VIII': { from: '2013-01-02', to: '2014-01-01' },
  'Class IX':   { from: '2012-01-02', to: '2013-01-01', provisional: true },
};

/** ISO to the day/month/year the notice itself prints. */
export const dmy = (iso) => iso.split('-').reverse().join('/');

/* The eligibility bullet is built from the table above, so the page cannot
   promise a window the form would then refuse. */
const dobEligibilityLine = 'Date of birth, both days included — ' +
  Object.keys(admissionDobRanges)
    .filter((klass) => !admissionClosedClasses.includes(klass))
    .map((klass) => `${klass.replace('Class ', '')}: ` +
      `${dmy(admissionDobRanges[klass].from)} to ${dmy(admissionDobRanges[klass].to)}`)
    .join(' · ');

export const admission = {
  /* The single switch that turns the whole page between its two states. */
  open: true,
  kicker: '05 · Session 2027',
  kickerClosed: '05 · Session 2026–27',
  title: 'Admission',
  titleBn: 'ভর্তি',
  windowLabel: 'Online forms · 5–25 Nov 2026',
  closedLabel: 'Admissions closed for 2026–27',
  closed: {
    heading: 'The admission window for 2026–27 has closed.',
    body: 'Applications for Session 2027 open on <strong>5 November 2026</strong>. The notice will be published here and on the Notice page. এই পাতায় ভর্তির বিজ্ঞপ্তি প্রকাশিত হবে।',
    cta: { label: 'Watch the Notice page', href: 'notice.html' },
    applyLabel: 'Apply Online — opens 5 Nov 2026',
  },
  blocks: [
    {
      /* Two mediums share one block: the eligibility, the documents and the
         lottery are the same for both, so saying them twice would only be two
         places to keep in step. What differs — the classes on offer, the
         notice and the form it opens — hangs off `streams`. */
      id: 'A', kicker: 'Block A', title: 'Classes V–VIII', open: true,
      sub: 'পঞ্চম থেকে অষ্টম শ্রেণি · Bengali and English medium · Session 2027',
      subClosed: 'Eligibility and documents stay published for reference',
      /* Every line comes from the school's own notice, the lottery one
         included — the notice now carries a selection section of its own. */
      rules: [
        'Online form 5–25 November 2026 · printed form and documents at the office 13–28 November 2026, 11:30–13:00',
        dobEligibilityLine,
        'Application fee ₹100 — a processing charge, paid at the school office counter when the printed form is submitted, and not refundable',
        'Documents (photocopies): the printed application with a recent passport photo, Aadhaar of student and guardian (self-attested), digital birth certificate, caste certificate if SC/ST/OBC, and the first page of the bank passbook showing the account number and IFSC',
        'Bring the original documents for verification. Incomplete or late applications are not accepted',
        'Where applications exceed seats, selection is by lottery. The dates of the lottery, of its result and of the final admission process are announced in due course',
      ],
      streams: [
        {
          id: 'bengali', title: 'Bengali Medium · Class V',
          /* The school's own notice, converted from the office's .docx. A
             notice whose href is still '#pdf' has no file behind it yet and
             the button does not offer to save it. */
          notice: { title: 'Admission Notice — Bengali Medium', titleClosed: 'Bengali Medium Notice 2026–27 (archived)',
                    meta: 'PDF · 266 KB · Published 1 Nov 2026', metaClosed: 'PDF · 266 KB',
                    href: 'assets/pdf/admission-notice-2027-bengali-medium.pdf' },
          apply: { label: 'Apply Online — Bengali Medium →', href: 'admission-form.html?medium=bengali' },
        },
        {
          id: 'english', title: 'English Medium · Classes V–VIII',
          notice: { title: 'Admission Notice — English Medium', titleClosed: 'English Medium Notice 2026–27 (archived)',
                    meta: 'PDF · 219 KB · Published 1 Nov 2026', metaClosed: 'PDF · 219 KB',
                    href: 'assets/pdf/admission-notice-2027-english-medium.pdf' },
          apply: { label: 'Apply Online — English Medium →', href: 'admission-form.html?medium=english' },
        },
      ],
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
      apply: { label: 'Apply Online — Class XI →', href: 'admission-form.html?medium=bengali' },
    },
  ],
  notes: [
    { heading: 'How it works', text: 'Fill the online form between 5 and 25 November 2026 and download the application PDF it produces. Print it, sign it, and bring it to the office between 13 and 28 November 2026, 11:30–13:00, with the original documents.' },
    { heading: 'Fees', text: 'Application fee ₹100 — a processing charge, paid at the school office counter when the printed form is submitted. It is not refundable. Admission fee as per Government of West Bengal norms — payable after selection.' },
    { heading: 'Help', text: 'Office helpline (033) 2552 2928 / (033) 2584 4601, 10:30–16:30 Mon–Sat. Guardians without internet may fill the form at the school office.' },
  ],
};

/**
 * The two admission streams.
 *
 * Bengali and English medium differ in three things and no more: the classes
 * on offer, the classes that can precede them, and the words at the top of
 * the form. Everything else — all thirty-one questions, the declaration, the
 * printed layout — is shared, so the schema below stays single and `formFor`
 * specialises it.
 *
 * `letter` is the segment the reference number carries — the B in
 * PBAB/27/B/V/00001 —
 * and must match the same field in integrations/admission-sheet/Code.gs.
 */
export const admissionStreams = {
  bengali: {
    id: 'bengali', letter: 'B',
    label: 'Bengali Medium', labelBn: 'বাংলা মাধ্যম',
    kicker: 'Admission · Bengali medium · Session 2027',
    title: 'Online Application — Bengali Medium',
    classes: ['Class V'],
    lastClasses: ['Class IV'],
  },
  english: {
    id: 'english', letter: 'E',
    label: 'English Medium', labelBn: 'ইংরেজি মাধ্যম',
    kicker: 'Admission · English medium · Session 2027',
    title: 'Online Application — English Medium',
    /* Class IX stays in the list, greyed, rather than being removed: the
       school means to admit to it, and `admissionClosedClasses` is the one
       place that says not yet. The two arrays stay index-aligned, which is
       how `rules.lastClass` pairs them. */
    classes: ['Class V', 'Class VI', 'Class VII', 'Class VIII', 'Class IX'],
    lastClasses: ['Class IV', 'Class V', 'Class VI', 'Class VII', 'Class VIII'],
    notYet: admissionClosedClasses,
    /* The English-medium register is kept in English, so the Bengali
       spelling of the name has nothing to be written into. The field is
       dropped from this stream's form rather than left blank — see
       `omit` in formFor(). The column stays in the spreadsheet so both
       mediums' rows line up under the same headers. */
    omit: ['nameBn'],
  },
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
  kicker: 'Admission · Session 2027',
  title: 'Online Application — Class V',
  titleBn: 'অনলাইন আবেদন',
  intro: 'Fill this form, then print the PDF it produces and bring it to the school office with the original documents.',
  requiredNote: 'Fields marked * are required; those marked (optional) may be left empty. Write names exactly as on the birth certificate.',
  declaration: 'I declare that the information given above is true to the best of my knowledge. আমি ঘোষণা করছি যে উপরে প্রদত্ত তথ্য সত্য।',
  submitLabel: 'Submit & download form',
  /* Read by rules.dob — the birth-date window each class accepts. */
  dobRanges: admissionDobRanges,
  groups: [
    {
      id: 'applicant', title: 'Applicant', titleBn: 'আবেদনকারীর তথ্য',
      fields: [
        /* `options` for this field and for lastClass are filled in by
           formFor() — they are the only part of the schema a stream changes. */
        { name: 'class', label: 'Class applying for', pdfLabel: 'Class', type: 'select', required: true, half: true,
          rule: 'classOffered' },
        { name: 'nameEn', label: 'Name of student (English)', pdfLabel: 'Name of student',
          type: 'text', required: true, half: true,
          placeholder: 'As on birth certificate', requiredMessage: "Enter the student's name." },
        { name: 'nameBn', label: 'নাম (বাংলায়)', type: 'text', half: true, bengali: true, pdfSkip: true,
          placeholder: 'জন্ম শংসাপত্র অনুসারে' },
        { name: 'dob', label: 'Date of birth', type: 'date', required: true, half: true, rule: 'dob',
          requiredMessage: 'Enter the date of birth.' },
        { name: 'gender', label: 'Gender', type: 'radio', required: true, half: true,
          options: ['Male', 'Female', 'Other'], requiredMessage: 'Choose the gender.' },
        { name: 'category', label: 'Category', type: 'select', required: true, half: true,
          options: ['General', 'SC', 'ST', 'OBC', 'CWSN'] },
        /* A list rather than a free-text box, so the register does not end
           up holding six spellings of the same answer. The first option is
           blank on purpose: a select seeds itself to its first option, and
           nothing should quietly answer this question for a child. */
        { name: 'religion', label: 'Religion', type: 'select', required: true, half: true,
          options: ['', 'Hindu', 'Muslim', 'Christian', 'Sikh', 'Buddhist', 'Jain', 'Other'],
          requiredMessage: 'Choose the religion.' },
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
        { name: 'fatherOccupation', label: "Father's occupation", type: 'text', half: true },
        { name: 'mother', label: "Mother's name", type: 'text', required: true, half: true,
          requiredMessage: "Enter the mother's name." },
        { name: 'motherOccupation', label: "Mother's occupation", type: 'text', half: true },
        /* Optional: for most applicants the guardian is a parent already
           named above, so the office treats a blank here as "the parents". */
        { name: 'guardian', label: "Guardian's name", type: 'text', half: true,
          placeholder: 'Only if someone other than a parent' },
        { name: 'guardianOccupation', label: "Guardian's occupation", type: 'text', half: true },
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
          rule: 'lastClass' },
      ],
    },
    {
      id: 'bank', title: 'Bank account', titleBn: 'ব্যাঙ্ক অ্যাকাউন্ট',
      /* Collected for scholarship and direct-benefit payments, and optional
         throughout: a child who has not yet been taken to open an account
         should not be stopped from applying for a school place over it. The
         office can take the passbook at the counter. Each rule below still
         runs on anything that is filled in, so a wrong IFSC is caught even
         though a missing one is allowed. */
      note: "The student's own account, used for scholarship and Government benefit payments. " +
        'Leave this group empty if the account is not open yet and bring the passbook to the office later.',
      fields: [
        { name: 'bankAccount', label: 'Bank account number', type: 'text', half: true,
          inputmode: 'numeric', rule: 'bankAccount' },
        { name: 'bankName', label: 'Bank name', type: 'text', half: true },
        { name: 'branchName', label: 'Branch name', type: 'text', half: true },
        { name: 'ifsc', label: 'IFSC code', type: 'text', half: true,
          placeholder: 'e.g. SBIN0001234', rule: 'ifsc' },
        { name: 'micr', label: 'MICR code', type: 'text', half: true,
          inputmode: 'numeric', placeholder: '9 digits, if printed in the passbook', rule: 'micr' },
      ],
    },
  ],
};

/**
 * The schema as one stream sees it.
 *
 * Duplicating thirty-one fields to vary two option lists would mean every
 * future question had to be added twice; this keeps one copy and patches the
 * two fields that differ. An unknown stream falls back to Bengali so a
 * mistyped URL cannot produce a form with an empty class list — though the
 * form component refuses to render at all in that case, and should.
 */
export function formFor(streamId) {
  const stream = admissionStreams[streamId] || admissionStreams.bengali;
  return {
    ...admissionForm,
    stream,
    kicker: stream.kicker,
    title: stream.title,
    groups: admissionForm.groups.map((group) => ({
      ...group,
      fields: group.fields
        .filter((field) => !(stream.omit || []).includes(field.name))
        .map((field) => {
          if (field.name === 'class') {
            /* `disabledOptions` greys a class the school is not admitting to
               this session; the default is the first class it IS admitting. */
            const notYet = stream.notYet || [];
            const open = stream.classes.filter((klass) => !notYet.includes(klass));
            return { ...field, options: stream.classes, disabledOptions: notYet, value: open[0] };
          }
          if (field.name === 'lastClass') return { ...field, options: stream.lastClasses };
          return field;
        }),
    })),
  };
}

export const admissionConfirmation = {
  title: 'Application submitted',
  titleBn: 'আবেদন জমা হয়েছে · Session 2027',
  next: [
    { title: 'Print', text: 'Your application form has downloaded. Print it and sign it, and keep the reference number safe.' },
    { title: 'Verify', text: 'Bring the printout, the ₹100 application fee and the original documents to the office between 13 and 28 November 2026, 11:30–13:00.' },
    { title: 'Result', text: 'Where applications exceed seats, selection is by lottery. Its date, its result and the final admission dates are announced in due course, on the Notice page and on the school notice board.' },
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
  meta: 'Newest first · 2 notices in 2026|Each notice is a PDF signed by the Headmaster.',
  /* The count the page prints beside the rows. It is declared rather than
     derived because the office's older circulars are not on the site yet;
     when they are loaded it should simply equal `list.length`. */
  declaredTotal: 2,
  years: ['2026'],
  categories: ['Admission'],
  /* The school's real notices. The two admission notices are the only ones
     published so far; the home-page strip above shows the same pair. */
  list: [
    { date: '01 Nov 2026', year: '2026', category: 'Admission', tone: 'accent',
      title: 'Admission Notice 2027 — Bengali Medium, Class V',
      ref: 'Ref. PBAB/BMU/ADM2027/01 · Online form 5–25 Nov · office counter 13–28 Nov',
      pdf: 'PDF · 266 KB', href: 'assets/pdf/admission-notice-2027-bengali-medium.pdf' },
    { date: '01 Nov 2026', year: '2026', category: 'Admission', tone: 'accent',
      title: 'Admission Notice 2027 — English Medium, Classes V–VIII',
      ref: 'Ref. PBAB/EMU/ADM2027/01 · Online form 5–25 Nov · office counter 13–28 Nov',
      pdf: 'PDF · 219 KB', href: 'assets/pdf/admission-notice-2027-english-medium.pdf' },
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
