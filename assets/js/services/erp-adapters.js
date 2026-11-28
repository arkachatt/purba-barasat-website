/**
 * erp-adapters.js — switches the site over to the school's ERP.
 *
 * WHY THIS IS AN IMPORT AND NOT A FUNCTION CALL
 *
 * It has to run before any custom element upgrades. Static imports are hoisted
 * and evaluated before the importing module's own statements, so a call at the
 * top of main.js's body would run AFTER every `import './components/…'` line
 * has already executed — and `customElements.define()` upgrades matching
 * elements already in the document synchronously, which runs `hydrate()`,
 * which calls `load()`. By then the default adapter has already answered.
 *
 * So: a module whose body installs, imported first in main.js. Moving this
 * line down the import list silently reverts the site to local content, with
 * nothing to show for it but pages that never reach the CMS.
 */
import { features } from '../data/site.js';
import { installErpContent } from './erp-content.js';
import { installErpSubmit } from './erp-admission.js';
import { installErpEnquiry } from './erp-enquiry.js';

if (features.erp) {
  installErpContent();
  installErpSubmit();
  installErpEnquiry();
}
