# PenghuRentalAdmin

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 22.0.6.

## Prerequisites

Angular CLI 22 requires **Node.js >= 22.22.3 or 24.x**. This project pins Node 24 via `.nvmrc`:

```bash
nvm use   # switches to Node 24 (from .nvmrc)
npm install
```

## Common commands

```bash
npm start        # dev server (ng serve), http://localhost:4200/
npm run build    # production build (ng build), output in dist/
npm test         # unit tests (vitest)
npm run deploy   # build + publish to GitHub Pages (gh-pages branch)
```

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

## Deploying to GitHub Pages

This app is hosted at https://fangjiehung.github.io/bbd-car-rental/. To deploy:

```bash
npm run deploy
```

This builds with the correct base href for the `/bbd-car-rental/` subpath and publishes
`dist/penghu-rental-admin/browser` to the `gh-pages` branch via `angular-cli-ghpages`.
Pages typically takes 1–2 minutes to update after the push completes.

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
