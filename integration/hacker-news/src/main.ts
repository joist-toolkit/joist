import { bootstrapEnvironment } from '@lit-kit/component';
import { withLitHtml } from '@lit-kit/component/lib/lit_html';

import './app/app.component';

bootstrapEnvironment([withLitHtml()]);

if (process.env.NODE_ENV === 'production') {
  navigator.serviceWorker.register('/service-worker.js').then(
    function (registration) {
      // Registration was successful
      console.log('ServiceWorker registration successful with scope: ', registration.scope);
    },
    function (err) {
      // registration failed :(
      console.log('ServiceWorker registration failed: ', err);
    }
  );
}
