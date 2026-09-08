import { withNativeFederation, shareAll } from '@angular-architects/native-federation/config';

// Dynamic-host Shell only. Future remotes (master-data, finance, inventory,
// purchasing, sales, reports) are documented in public/federation.manifest.example.json.
export default withNativeFederation({
  name: 'shell',

  shared: {
    ...shareAll(
      {
        singleton: true,
        strictVersion: true,
        requiredVersion: 'auto',
        build: 'package',
      },
      {
        overrides: {
          '@angular/core': {
            singleton: true,
            strictVersion: true,
            requiredVersion: 'auto',
            build: 'package',
            includeSecondaries: { keepAll: true },
          },
        },
      },
    ),
  },

  skip: [
    'rxjs/ajax',
    'rxjs/fetch',
    'rxjs/testing',
    'rxjs/webSocket',
  ],

  features: {
    denseChunking: true,
  },
});
