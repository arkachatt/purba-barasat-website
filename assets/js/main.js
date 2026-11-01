/**
 * main.js — the site entry point.
 *
 * Importing a component module registers its custom element, so a page only
 * ever writes the tag. Adding a component to the site is: one module here, one
 * stylesheet in css/blocks/, one entry in css/site.css.
 */

import './components/site-header.js';
import './components/site-footer.js';
import './components/photo-carousel.js';
import './components/admission-banner.js';
import './components/notice-list.js';
import './components/hm-desk.js';
import './components/quick-links.js';
import './components/login-gateway.js';

import './components/page-header.js';
import './components/photo-gallery.js';
import './components/about-page.js';
import './components/hm-letter.js';
import './components/staff-directory.js';
import './components/student-strength.js';
import './components/admission-page.js';
import './components/admission-form.js';
import './components/admission-confirmation.js';
import './components/academic-calendar.js';
import './components/administration-bodies.js';
import './components/board-results.js';
import './components/event-list.js';
import './components/event-detail.js';
import './components/notice-board.js';
import './components/contact-page.js';

/* Cross-cutting states: available to every page, used where they apply. */
import './components/empty-state.js';
import './components/state-alert.js';
import './components/skeleton-rows.js';
import './components/offline-bar.js';
