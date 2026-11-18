# SchoolLibraryClient

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 22.1.3.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Vitest](https://vitest.dev/) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.

## API environments

Use Node 24 LTS (at least 24.15.0) and npm 11. The checked-in lockfile currently
has ngx-toastr 20 / Angular 22 peer incompatibility. Until a compatible toast
release is adopted, install explicitly with `npm ci --legacy-peer-deps`; normal
`npm ci` reports ERESOLVE. No global npm configuration or framework upgrade is
required. This compatibility exception needs follow-up dependency review.

The existing API_CONFIG reads Angular's build environment:

- `npm start` / development build: `https://localhost:7028/api`.
- `npm run build` / production: `/api` on the frontend origin. Configure the
  hosting web server to route `/api` to the backend. This change does not add
  or configure that infrastructure.
- For an existing separate-host deployment, set `apiBaseUrl` in
  `src/environments/environment.ts` to the backend HTTPS URL ending in `/api`
  before building. Add the frontend's exact origin to backend
  `Cors:AllowedOrigins` and set `Email:FrontendBaseUrl` to the frontend URL.

Angular's development file replacement is configured in angular.json. Browser
configuration is public: never put API keys, passwords, R2 credentials or Resend
tokens in either environment file. API requests retain the existing cookie
interceptor; cross-origin hosting requires HTTPS and credentialed CORS. Browsers
may block third-party cookies across unrelated sites; prefer same-site hosting.

Checks: `npm test -- --watch=false` and `npm run build`. Serve development with
`npm start`; trust the backend's development HTTPS certificate on your machine.
