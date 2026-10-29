/**
 * <offline-bar>
 *
 * Shown when the browser loses its connection. Guardians read this site on
 * patchy mobile data, so a dropped connection should explain what is on screen
 * — the last content this phone loaded — rather than letting the page look
 * broken or stale without saying so.
 *
 * Placed once in the page shell; it stays out of the flow until it is needed.
 */
import { SiteComponent, define } from '../core/component.js';
import { html } from '../core/dom.js';

class OfflineBar extends SiteComponent {
  render() {
    return html`
      <div class="offline-bar" data-bar hidden>
        <state-alert tone="status" row icon="wifi-off" heading="You are offline" action="Retry">
          Showing the last pages loaded on this device. The site will refresh when the
          connection returns.
        </state-alert>
      </div>`;
  }

  hydrate() {
    const bar = this.querySelector('[data-bar]');
    const sync = () => { bar.hidden = navigator.onLine; };

    window.addEventListener('online', sync);
    window.addEventListener('offline', sync);
    this.querySelector('state-alert')
      .addEventListener('alert-action', () => window.location.reload());
    sync();
  }
}

define('offline-bar', OfflineBar);
