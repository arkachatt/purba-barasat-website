/**
 * <site-header active="Admission">
 *
 * The masthead. Navigation comes from data/site.js, so a new section is one
 * entry there — the desktop dropdown and the mobile drawer group both fall
 * out of the same `children` array.
 *
 * Attributes:
 *   active — label of the current section, to mark aria-current
 */
import { SiteComponent, define } from '../core/component.js';
import { html, raw, each, when, qsa } from '../core/dom.js';
import { icon } from '../core/icons.js';
import { school, headerStrip, navigation, features } from '../data/site.js';

/** Drop anything whose `feature` switch is off, at every level of the nav. */
const enabled = (item) => !item.feature || features[item.feature];
const visibleNav = navigation
  .filter(enabled)
  .map((item) => (item.children ? { ...item, children: item.children.filter(enabled) } : item))
  .map((item) => (item.children && !item.children.length ? { ...item, children: undefined } : item));

class SiteHeader extends SiteComponent {
  render() {
    const active = this.prop('active');
    const isActive = (item) => item.label === active;

    const brand = (size) => html`
      <a class="brand" href="index.html" aria-label="${school.name} — home">
        <span class="brand-mark blueprint">${
          school.logo ? raw(`<img src="${school.logo}" alt="">`) : 'LOGO'
        }</span>
        <span class="brand-text">
          <span class="brand-name">${school.name}</span>
          <span class="brand-sub">${
            size === 'lg' ? `${school.nameBn} · ${school.district}` : school.nameBn
          }</span>
        </span>
      </a>`;

    return html`
      <header class="site-header">
        <div class="header-strip">
          <span>${headerStrip.authority}</span>
          <span class="header-strip-meta">${each(headerStrip.meta, (m) => html`<span>${m}</span>`)}</span>
        </div>

        <div class="header-bar">
          ${raw(brand('lg'))}
          <nav class="primary-nav" aria-label="Primary">
            ${each(visibleNav, (item, i) => html`
              <div class="nav-item" data-index="${i}">
                <a class="nav-link" href="${item.href}"
                   ${raw(isActive(item) ? 'aria-current="page"' : '')}
                   ${raw(item.children ? `aria-expanded="false" aria-controls="dropdown-${i}"` : '')}>
                  ${item.label}${when(item.children, () => icon('chevron-down', 14))}
                </a>
                ${when(item.children, () => html`
                  <div class="nav-dropdown blueprint elev-md" id="dropdown-${i}" hidden>
                    <div class="dropdown-kicker">${item.label} · ${item.bn}</div>
                    ${each(item.children, (child) => html`
                      <a class="dropdown-link" href="${child.href}">
                        ${child.label}<span class="bn">${child.bn}</span>
                      </a>`)}
                  </div>`)}
              </div>`)}
          </nav>
          <div class="header-actions">
            <a class="btn btn-secondary btn-md" href="notice.html">${raw(icon('bell', 16))}Notice</a>
            ${when(features.login, () => html`
              <a class="btn btn-primary btn-md" href="login.html">${raw(icon('log-in', 16))}Log In</a>`)}
          </div>
        </div>

        <div class="header-mobile">
          <button type="button" class="btn btn-ghost btn-square" data-drawer-toggle
                  aria-label="Menu" aria-expanded="false" aria-controls="site-drawer">
            ${raw(icon('menu', 22))}
          </button>
          ${raw(brand('sm'))}
          <a class="btn btn-secondary btn-square" href="notice.html" aria-label="Notice">${raw(icon('bell', 18))}</a>
          ${when(features.login, () => html`
            <a class="btn btn-primary" href="login.html"
               style="height:44px;padding-inline:12px;flex:none;font-size:14px">Log In</a>`)}
        </div>

        <div class="drawer" id="site-drawer" hidden>
          <div class="drawer-head">
            <span class="drawer-title">Menu · মেনু</span>
            <button type="button" class="btn btn-ghost btn-square" data-drawer-close aria-label="Close">
              ${raw(icon('close', 20))}
            </button>
          </div>
          ${each(visibleNav, (item, i) => html`
            <div class="drawer-group">
              ${when(!item.children, () => html`
                <a class="drawer-link" href="${item.href}" ${raw(isActive(item) ? 'aria-current="page"' : '')}>
                  <span class="drawer-link-text"><span>${item.label}</span><span class="bn">${item.bn}</span></span>
                </a>`)}
              ${when(item.children, () => html`
                <button type="button" class="drawer-link" data-expand="${i}"
                        aria-expanded="false" aria-controls="drawer-children-${i}"
                        ${raw(isActive(item) ? 'aria-current="page"' : '')}>
                  <span class="drawer-link-text"><span>${item.label}</span><span class="bn">${item.bn}</span></span>
                  ${raw(icon('chevron-down', 18))}
                </button>
                <div class="drawer-children" id="drawer-children-${i}" hidden>
                  ${each(item.children, (child) => html`
                    <a class="drawer-child" href="${child.href}">${child.label}</a>`)}
                </div>`)}
            </div>`)}
          <div class="drawer-foot">Govt.-sponsored · School Education Dept., Govt. of West Bengal</div>
        </div>
      </header>`;
  }

  hydrate() {
    const drawer = this.querySelector('#site-drawer');
    const drawerToggle = this.querySelector('[data-drawer-toggle]');

    const setDrawer = (open) => {
      drawer.hidden = !open;
      drawerToggle.setAttribute('aria-expanded', String(open));
    };
    drawerToggle.addEventListener('click', () => setDrawer(drawer.hidden));
    this.querySelector('[data-drawer-close]').addEventListener('click', () => setDrawer(false));

    // Drawer sub-sections expand in place rather than pushing a new screen —
    // parents scanning for one date should never lose their position.
    qsa('[data-expand]', this).forEach((button) => {
      const panel = this.querySelector(`#drawer-children-${button.dataset.expand}`);
      button.addEventListener('click', () => {
        const open = panel.hidden;
        panel.hidden = !open;
        button.setAttribute('aria-expanded', String(open));
      });
    });

    // Desktop dropdowns: one open at a time, dismissed by Escape or a click out.
    const dropdownLinks = qsa('.nav-link[aria-controls]', this);
    const closeAll = () => dropdownLinks.forEach((link) => {
      link.setAttribute('aria-expanded', 'false');
      this.querySelector(`#${link.getAttribute('aria-controls')}`).hidden = true;
    });

    dropdownLinks.forEach((link) => {
      const panel = this.querySelector(`#${link.getAttribute('aria-controls')}`);
      link.addEventListener('click', (event) => {
        event.preventDefault();
        const open = panel.hidden;
        closeAll();
        if (open) {
          panel.hidden = false;
          link.setAttribute('aria-expanded', 'true');
        }
      });
    });

    document.addEventListener('click', (event) => {
      if (!this.contains(event.target)) closeAll();
    });
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') { closeAll(); setDrawer(false); }
    });
  }
}

define('site-header', SiteHeader);
