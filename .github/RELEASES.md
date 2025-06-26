# Releases

## [wexCommerce 3.3](https://github.com/aelassas/wexcommerce/releases/tag/v3.3) – 2025-06-22

* fix(fetch): reduce default retries to 1 and improve error handling
* chore: update dependencies

**Full Changelog**: https://github.com/aelassas/wexcommerce/compare/v3.2...v3.3

### Assets
- [wexcommerce-db.zip](https://github.com/aelassas/wexcommerce/releases/download/v3.3/wexcommerce-db.zip) (5.84 MB)

### Source Code
- [Source code (zip)](https://api.github.com/repos/aelassas/wexcommerce/zipball/v3.3)
- [Source code (tar)](https://api.github.com/repos/aelassas/wexcommerce/tarball/v3.3)

## [wexCommerce 3.2](https://github.com/aelassas/wexcommerce/releases/tag/v3.2) – 2025-06-17

* fix(docker): update server API host references in environment files
* fix(docker): update nginx reverse proxy headers
* fix(auth): fetch issues in frontend and admin panel when user is no longer authenticated
* dev(eslint): update ESLint rules

**Full Changelog**: https://github.com/aelassas/wexcommerce/compare/v3.1...v3.2

### Assets
- [wexcommerce-db.zip](https://github.com/aelassas/wexcommerce/releases/download/v3.2/wexcommerce-db.zip) (5.84 MB)

### Source Code
- [Source code (zip)](https://api.github.com/repos/aelassas/wexcommerce/zipball/v3.2)
- [Source code (tar)](https://api.github.com/repos/aelassas/wexcommerce/tarball/v3.2)

## [wexCommerce 3.1](https://github.com/aelassas/wexcommerce/releases/tag/v3.1) – 2025-06-17

* refactor(admin): rename backend folder to admin for clarity
* refactor(backend): rename api folder to backend for clarity
* fix(backend): ensure globalAgent.maxSockets is set for HTTP server
* fix(admin): update metadata title and description for clarity
* chore: clarify project identities with consistent package.json names and descriptions
* chore: update dependencies

**Full Changelog**: https://github.com/aelassas/wexcommerce/compare/v3.0...v3.1

### Assets
- [wexcommerce-db.zip](https://github.com/aelassas/wexcommerce/releases/download/v3.1/wexcommerce-db.zip) (5.84 MB)

### Source Code
- [Source code (zip)](https://api.github.com/repos/aelassas/wexcommerce/zipball/v3.1)
- [Source code (tar)](https://api.github.com/repos/aelassas/wexcommerce/tarball/v3.1)

## [wexCommerce 3.0](https://github.com/aelassas/wexcommerce/releases/tag/v3.0) – 2025-06-12

* feat(database): implement multilingual Value synchronization and enhance database initialization tests
* fix(env): update CDN URLs to include port 4005 for backend and frontend environments
* fix(database): explicitly wait for database connection to be open
* fix(mail): add ethereal test transporter for CI environment
* fix(database): text indexes errors when adding new languages
* fix(logger): improve message formatting for VSCode terminal
* chore(index): update server startup logging for better visibility
* chore(tests): enhance database tests with additional scenarios and index handling
* chore: update dependencies
* refactor(database): enhance connection management and improve logging; refactor initialization functions for better clarity
* refactor(api): modularized server creation supporting HTTP/HTTPS with async file reads
* refactor(api): added detailed JSDoc comments for functions and constants
* refactor(api): added robust database connection and initialization checks before starting server
* refactor(api): introduced configurable shutdown timeout to force exit if shutdown hangs
* refactor(api): improved shutdown handler to log received signals and handle cleanup gracefully
* refactor(api): used process.once for signal handling to avoid multiple shutdowns
* refactor(api): improved code readability with consistent naming and minor cleanup
* docs: update self-hosted and run from source docs

**Full Changelog**: https://github.com/aelassas/wexcommerce/compare/v2.9...v3.0

### Assets
- [wexcommerce-db.zip](https://github.com/aelassas/wexcommerce/releases/download/v3.0/wexcommerce-db.zip) (5.84 MB)

### Source Code
- [Source code (zip)](https://api.github.com/repos/aelassas/wexcommerce/zipball/v3.0)
- [Source code (tar)](https://api.github.com/repos/aelassas/wexcommerce/tarball/v3.0)

## [wexCommerce 2.9](https://github.com/aelassas/wexcommerce/releases/tag/v2.9) – 2025-05-22

* dev(frontend,admin): enabled react-compiler rule in ESLint configuration
* dev(pre-commit): optimize pre-commit hook to lint and type-check only changed projects with Docker fallback
* refactor(package.json): reorganize type definitions and dependencies
* chore: update dependencies
* fix(pre-commit): update import paths to use `node:` prefix and improve file reading consistency
* fix(nginx.conf): include server port in `Host` and `X-Forwarded-Host` headers
* fix(pre-commit): exclude deleted files from ESLint check
* fix(deploy): update npm install command to include all dependencies

**Full Changelog**: https://github.com/aelassas/wexcommerce/compare/v2.8...v2.9

### Assets
- [wexcommerce-db.zip](https://github.com/aelassas/wexcommerce/releases/download/v2.9/wexcommerce-db.zip) (5.84 MB)

### Source Code
- [Source code (zip)](https://api.github.com/repos/aelassas/wexcommerce/zipball/v2.9)
- [Source code (tar)](https://api.github.com/repos/aelassas/wexcommerce/tarball/v2.9)

## [wexCommerce 2.8](https://github.com/aelassas/wexcommerce/releases/tag/v2.8) – 2025-04-23

* Feat: set up [Docker Development Environment](https://github.com/aelassas/wexcommerce/wiki/Run-from-Source-(Docker)) with CDN Integration and Data Persistence
* Feat: add `api_logs` volume to docker-compose files for logging
* Feat: add CDN middleware to API to serve static files
* Chore: update dependencies and fix `AdapterDateFns` import
* Fix: enable reCAPTCHA check based on environment configuration in sign-up and checkout pages
* Fix: wrong account validation links in Docker

**Full Changelog**: https://github.com/aelassas/wexcommerce/compare/v2.7...v2.8

### Assets
- [wexcommerce-db.zip](https://github.com/aelassas/wexcommerce/releases/download/v2.8/wexcommerce-db.zip) (5.84 MB)

### Source Code
- [Source code (zip)](https://api.github.com/repos/aelassas/wexcommerce/zipball/v2.8)
- [Source code (tar)](https://api.github.com/repos/aelassas/wexcommerce/tarball/v2.8)

## [wexCommerce 2.7](https://github.com/aelassas/wexcommerce/releases/tag/v2.7) – 2025-04-12

* Migrated to Express 5 for improved performance and future compatibility
* Fix: add setting to ensure final newline in files
* Fix: add custom indexes to multiple models and handle sync errors
* Fix: handle undefined request body in `getProduct`
* Fix: sign in link not redericting back to checkout from checkout page
* Fix: add social login to checkout and forgot password pages
* Upgrade to Next.js 15.3
* Updated dependencies

**Full Changelog**: https://github.com/aelassas/wexcommerce/compare/v2.6...v2.7

### Assets
- [wexcommerce-db.zip](https://github.com/aelassas/wexcommerce/releases/download/v2.7/wexcommerce-db.zip) (5.84 MB)

### Source Code
- [Source code (zip)](https://api.github.com/repos/aelassas/wexcommerce/zipball/v2.7)
- [Source code (tar)](https://api.github.com/repos/aelassas/wexcommerce/tarball/v2.7)

## [wexCommerce 2.6](https://github.com/aelassas/wexcommerce/releases/tag/v2.6) – 2025-03-30

* Upgrade to react 19.1 and mui 7.0
* Fix: checkout options are still enabled after PayPal is loaded
* Updated dependencies

### Assets
- [wexcommerce-db.zip](https://github.com/aelassas/wexcommerce/releases/download/v2.6/wexcommerce-db.zip) (5.84 MB)

### Source Code
- [Source code (zip)](https://api.github.com/repos/aelassas/wexcommerce/zipball/v2.6)
- [Source code (tar)](https://api.github.com/repos/aelassas/wexcommerce/tarball/v2.6)

## [wexCommerce 2.5](https://github.com/aelassas/wexcommerce/releases/tag/v2.5) – 2025-03-26

* Fix: reduce default retry attempts in fetchWithRetry function to improve performance
* Fix: remove unnecessary trailing spaces in multiple components for consistency
* Fix: adjust footer payment height for better layout
* Updated dependencies

**Full Changelog**: https://github.com/aelassas/wexcommerce/compare/v2.4...v2.5

### Assets
- [wexcommerce-db.zip](https://github.com/aelassas/wexcommerce/releases/download/v2.5/wexcommerce-db.zip) (5.84 MB)

### Source Code
- [Source code (zip)](https://api.github.com/repos/aelassas/wexcommerce/zipball/v2.5)
- [Source code (tar)](https://api.github.com/repos/aelassas/wexcommerce/tarball/v2.5)

## [wexCommerce 2.4](https://github.com/aelassas/wexcommerce/releases/tag/v2.4) – 2025-03-09

* Fix: add ScrollToTop component to multiple pages
* Fix: update default server port from 4004 to 4005
* Fix: add `fetchWithRetry` function for improved error handling in API requests
* Fix: ensure window object is defined before accessing properties in environment configuration
* Fix: standardize quote usage in TSX and update package.json scripts for linting
* Fix: remove trailing spaces in API endpoint URLs for consistency
* Fix: correct error messages in sign-in localization for consistency and clarity

**Full Changelog**: https://github.com/aelassas/wexcommerce/compare/v2.3...v2.4

### Assets
- [wexcommerce-db.zip](https://github.com/aelassas/wexcommerce/releases/download/v2.4/wexcommerce-db.zip) (5.84 MB)

### Source Code
- [Source code (zip)](https://api.github.com/repos/aelassas/wexcommerce/zipball/v2.4)
- [Source code (tar)](https://api.github.com/repos/aelassas/wexcommerce/tarball/v2.4)

## [wexCommerce 2.3](https://github.com/aelassas/wexcommerce/releases/tag/v2.3) – 2025-03-08

* Enabled React Compiler
* Upgrade to ESLint 9
* Updated dependencies
* Fix: update ncu and eslint commands in package.json

**Full Changelog**: https://github.com/aelassas/wexcommerce/compare/v2.2...v2.3

### Assets
- [wexcommerce-db.zip](https://github.com/aelassas/wexcommerce/releases/download/v2.3/wexcommerce-db.zip) (5.84 MB)

### Source Code
- [Source code (zip)](https://api.github.com/repos/aelassas/wexcommerce/zipball/v2.3)
- [Source code (tar)](https://api.github.com/repos/aelassas/wexcommerce/tarball/v2.3)

## [wexCommerce 2.2](https://github.com/aelassas/wexcommerce/releases/tag/v2.2) – 2025-03-02

* Upgrade to Next.js 15.2.0
* Fix: optimize NotificationList state updates
* Fix: update error logging to use console.log
* Fix: update dependencies and ncu command for better compatibility
* Fix: change ToastContainer position from top-right to bottom-left in admin dashboard

**Full Changelog**: https://github.com/aelassas/wexcommerce/compare/v2.1...v2.2

### Assets
- [wexcommerce-db.zip](https://github.com/aelassas/wexcommerce/releases/download/v2.2/wexcommerce-db.zip) (5.84 MB)

### Source Code
- [Source code (zip)](https://api.github.com/repos/aelassas/wexcommerce/zipball/v2.2)
- [Source code (tar)](https://api.github.com/repos/aelassas/wexcommerce/tarball/v2.2)

## [wexCommerce 2.1](https://github.com/aelassas/wexcommerce/releases/tag/v2.1) – 2025-02-25

* Added PayPal debug environment variable to frontend
* Fix: update PayPal order status check from 'APPROVED' to 'COMPLETED' and capture order on approval
* Fix: handle PayPal cancellation and error by resetting processing state
* Fix: update logging configuration to disable fetch URL in production
* Fix: update NotificationList to use index for state updates and improve readability
* Updated dependencies

**Full Changelog**: https://github.com/aelassas/wexcommerce/compare/v2.0...v2.1

### Assets
- [wexcommerce-db.zip](https://github.com/aelassas/wexcommerce/releases/download/v2.1/wexcommerce-db.zip) (5.84 MB)

### Source Code
- [Source code (zip)](https://api.github.com/repos/aelassas/wexcommerce/zipball/v2.1)
- [Source code (tar)](https://api.github.com/repos/aelassas/wexcommerce/tarball/v2.1)

## [wexCommerce 2.0](https://github.com/aelassas/wexcommerce/releases/tag/v2.0) – 2025-02-20

* Fix: update footer component to replace secure payment image with dynamic Stripe/PayPal powered by image
* Updated dependencies

**Full Changelog**: https://github.com/aelassas/wexcommerce/compare/v1.9...v2.0

### Assets
- [wexcommerce-db.zip](https://github.com/aelassas/wexcommerce/releases/download/v2.0/wexcommerce-db.zip) (5.84 MB)

### Source Code
- [Source code (zip)](https://api.github.com/repos/aelassas/wexcommerce/zipball/v2.0)
- [Source code (tar)](https://api.github.com/repos/aelassas/wexcommerce/tarball/v2.0)

## [wexCommerce 1.9](https://github.com/aelassas/wexcommerce/releases/tag/v1.9) – 2025-02-13

* Added IPInfo integration for country code retrieval
* Added [update-version.ps1](https://github.com/aelassas/wexcommerce/blob/main/__scripts/update-version.ps1) for updating versions
* Enhanced PayPal order creation by refining payer and application context settings for improved payment flow
* Fix: async condition handling in api
* Updated dependencies

**Full Changelog**: https://github.com/aelassas/wexcommerce/compare/v1.8...v1.9

### Assets
- [wexcommerce-db.zip](https://github.com/aelassas/wexcommerce/releases/download/v1.9/wexcommerce-db.zip) (5.84 MB)

### Source Code
- [Source code (zip)](https://api.github.com/repos/aelassas/wexcommerce/zipball/v1.9)
- [Source code (tar)](https://api.github.com/repos/aelassas/wexcommerce/tarball/v1.9)

## [wexCommerce 1.8](https://github.com/aelassas/wexcommerce/releases/tag/v1.8) – 2025-02-08

* Fix: PayPal order name and description violate PayPal's max length resulting in error 400
* Fix: Stripe product name and description violate Stripe's max length resulting in error 400
* Fix: update SMTP password and MongoDB URI formats in environment configuration files
* Updated dependencies

**Full Changelog**: https://github.com/aelassas/wexcommerce/compare/v1.7...v1.8

### Assets
- [wexcommerce-db.zip](https://github.com/aelassas/wexcommerce/releases/download/v1.8/wexcommerce-db.zip) (5.84 MB)

### Source Code
- [Source code (zip)](https://api.github.com/repos/aelassas/wexcommerce/zipball/v1.8)
- [Source code (tar)](https://api.github.com/repos/aelassas/wexcommerce/tarball/v1.8)

## [wexCommerce 1.7](https://github.com/aelassas/wexcommerce/releases/tag/v1.7) – 2025-02-02

* [Integrated PayPal Payment Gateway](https://github.com/aelassas/wexcommerce/wiki/Payment-Gateways)
* Added Website name setting to api and frontend
* Added Terms of Service, Privacy Policy and Cookie Policy pages
* Bump date-fns to 4.1.0
* Updated dependencies
* Fix: product page does not scroll to top on product click
* Fix: Update api deployment script to omit dev dependencies
* Fix: Update api service execution command to use npm command instead of node

**Full Changelog**: https://github.com/aelassas/wexcommerce/compare/v1.6...v1.7

### Assets
- [wexcommerce-db.zip](https://github.com/aelassas/wexcommerce/releases/download/v1.7/wexcommerce-db.zip) (5.84 MB)

### Source Code
- [Source code (zip)](https://api.github.com/repos/aelassas/wexcommerce/zipball/v1.7)
- [Source code (tar)](https://api.github.com/repos/aelassas/wexcommerce/tarball/v1.7)

## [wexCommerce 1.6](https://github.com/aelassas/wexcommerce/releases/tag/v1.6) – 2025-01-01

* Fix: react-localization causing conflicting peer dependency with react 19
* Fix: reactjs-social-login causing conflicting peer dependency with react 19
* Updated dependencies

**Full Changelog**: https://github.com/aelassas/wexcommerce/compare/v1.5...v1.6

### Assets
- [wexcommerce-db.zip](https://github.com/aelassas/wexcommerce/releases/download/v1.6/wexcommerce-db.zip) (5.84 MB)

### Source Code
- [Source code (zip)](https://api.github.com/repos/aelassas/wexcommerce/zipball/v1.6)
- [Source code (tar)](https://api.github.com/repos/aelassas/wexcommerce/tarball/v1.6)

## [wexCommerce 1.5](https://github.com/aelassas/wexcommerce/releases/tag/v1.5) – 2024-12-25

* Refactor order display styles and enhance toast notification layout
* Updated secondary button color
* Fix: Frontend development server not starting
* Fix: Localization not working properly in the frontend and the admin dashboard

**Full Changelog**: https://github.com/aelassas/wexcommerce/compare/v1.4...v1.5

### Assets
- [wexcommerce-db.zip](https://github.com/aelassas/wexcommerce/releases/download/v1.5/wexcommerce-db.zip) (5.84 MB)

### Source Code
- [Source code (zip)](https://api.github.com/repos/aelassas/wexcommerce/zipball/v1.5)
- [Source code (tar)](https://api.github.com/repos/aelassas/wexcommerce/tarball/v1.5)

## [wexCommerce 1.4](https://github.com/aelassas/wexcommerce/releases/tag/v1.4) – 2024-12-24

* Upgrade to React 19 stable
* Added React Compiler ESLint rules
* Optimized reCAPTCHA and Google Analytics
* Updated dependencies
* Fix: Public pages not working properly for unverified users
* Fix: Wrong redirect in forgot password page when user is already logged in
* Fix: Login pages are loaded even if user is already logged in
* Fix: Unit tests issues

**Full Changelog**: https://github.com/aelassas/wexcommerce/compare/v1.3...v1.4

### Assets
- [wexcommerce-db.zip](https://github.com/aelassas/wexcommerce/releases/download/v1.4/wexcommerce-db.zip) (5.84 MB)

### Source Code
- [Source code (zip)](https://api.github.com/repos/aelassas/wexcommerce/zipball/v1.4)
- [Source code (tar)](https://api.github.com/repos/aelassas/wexcommerce/tarball/v1.4)

## [wexCommerce 1.3](https://github.com/aelassas/wexcommerce/releases/tag/v1.3) – 2024-11-25

* Added reCAPTCHA
* Added sort products by date
* Added unit tests
* Updated dependencies
* Fixed some issues related to orders

**Full Changelog**: https://github.com/aelassas/wexcommerce/compare/v1.2...v1.3

### Assets
- [wexcommerce-db.zip](https://github.com/aelassas/wexcommerce/releases/download/v1.3/wexcommerce-db.zip) (5.84 MB)

### Source Code
- [Source code (zip)](https://api.github.com/repos/aelassas/wexcommerce/zipball/v1.3)
- [Source code (tar)](https://api.github.com/repos/aelassas/wexcommerce/tarball/v1.3)

## [wexCommerce 1.2](https://github.com/aelassas/wexcommerce/releases/tag/v1.2) – 2024-10-29

* Upgrade to Next.js 15 stable
* Added streaming to pages
* Updated dependencies
* Fixed waterfall in homepage
* Fixed checkout issues
* Fixed image issues
* Fixed wysiwyg issues
* Fixed cart issues
* Fixed wishlist issues

**Full Changelog**: https://github.com/aelassas/wexcommerce/compare/v1.1...v1.2

### Assets
- [wexcommerce-db.zip](https://github.com/aelassas/wexcommerce/releases/download/v1.2/wexcommerce-db.zip) (5.84 MB)

### Source Code
- [Source code (zip)](https://api.github.com/repos/aelassas/wexcommerce/zipball/v1.2)
- [Source code (tar)](https://api.github.com/repos/aelassas/wexcommerce/tarball/v1.2)

## [wexCommerce 1.1](https://github.com/aelassas/wexcommerce/releases/tag/v1.1) – 2024-10-18

* Added Wishlist
* Added product name slug
* Added row count and sort by to search
* Added row count and sort by to orders
* Updated Docker and NGINX configurations
* Fixed authentication issues
* Fixed cart issues
* Fixed carrousel swiping issues
* Fixed orders issues
* Fixed checkout issues
* Fixed ui/ux issues

**Full Changelog**: https://github.com/aelassas/wexcommerce/compare/v1.0...v1.1

### Assets
- [wexcommerce-db.zip](https://github.com/aelassas/wexcommerce/releases/download/v1.1/wexcommerce-db.zip) (5.84 MB)

### Source Code
- [Source code (zip)](https://api.github.com/repos/aelassas/wexcommerce/zipball/v1.1)
- [Source code (tar)](https://api.github.com/repos/aelassas/wexcommerce/tarball/v1.1)

## [wexCommerce 1.0](https://github.com/aelassas/wexcommerce/releases/tag/v1.0) – 2024-10-09

Initial release

### Assets
- [wexcommerce-db.zip](https://github.com/aelassas/wexcommerce/releases/download/v1.0/wexcommerce-db.zip) (5.84 MB)

### Source Code
- [Source code (zip)](https://api.github.com/repos/aelassas/wexcommerce/zipball/v1.0)
- [Source code (tar)](https://api.github.com/repos/aelassas/wexcommerce/tarball/v1.0)
