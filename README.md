[![build](https://github.com/aelassas/wexcommerce/actions/workflows/build.yml/badge.svg)](https://github.com/aelassas/wexcommerce/actions/workflows/build.yml) [![test](https://github.com/aelassas/wexcommerce/actions/workflows/test.yml/badge.svg)](https://github.com/aelassas/wexcommerce/actions/workflows/test.yml) [![coveralls](https://coveralls.io/repos/github/aelassas/wexcommerce/badge.svg?branch=main)](https://coveralls.io/github/aelassas/wexcommerce?branch=main) [![loc](https://raw.githubusercontent.com/aelassas/wexcommerce/refs/heads/loc/badge.svg)](https://github.com/aelassas/wexcommerce/actions/workflows/loc.yml) [![docs](https://img.shields.io/badge/docs-wiki-brightgreen)](https://github.com/aelassas/wexcommerce/wiki) [![live demo](https://img.shields.io/badge/live-demo-brightgreen)](https://wexcommerce.dynv6.net:8002/) [![open-vscode](https://img.shields.io/badge/open-vscode-1f425f.svg)](https://vscode.dev/github/aelassas/wexcommerce/)

<!--
[![tested with jest](https://img.shields.io/badge/tested_with-jest-brightgreen?logo=jest)](https://github.com/jestjs/jest)
[![docs](https://img.shields.io/badge/docs-wiki-brightgreen)](https://github.com/aelassas/wexcommerce/wiki)
[![live demo](https://img.shields.io/badge/live-demo-brightgreen)](https://wexcommerce.dynv6.net:8002/)
[![loc](https://raw.githubusercontent.com/aelassas/wexcommerce/refs/heads/loc/badge.svg)](https://github.com/aelassas/wexcommerce/actions/workflows/loc.yml)
[![PRs welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/aelassas/wexcommerce/pulls)
[![codecov](https://codecov.io/gh/aelassas/wexcommerce/graph/badge.svg?token=ZNW4QHSFPH)](https://codecov.io/gh/aelassas/wexcommerce)
[![codecov](https://img.shields.io/codecov/c/github/aelassas/wexcommerce?logo=codecov)](https://codecov.io/gh/aelassas/wexcommerce)
[![coveralls](https://coveralls.io/repos/github/aelassas/wexcommerce/badge.svg?branch=main)](https://coveralls.io/github/aelassas/wexcommerce?branch=main)
[![live demo](https://img.shields.io/badge/live-demo-brightgreen)](https://wexcommerce.dynv6.net:8002/)
[![open-vscode](https://img.shields.io/badge/open-vscode-1f425f.svg)](https://vscode.dev/github/aelassas/wexcommerce/)

https://github.com/user-attachments/assets/1a4841cb-8e70-4ac2-974e-64774eb17371
-->

[![](https://wexcommerce.github.io/content/frontend-0-tiny.png)](https://wexcommerce.dynv6.net:8002/home)

## wexCommerce

wexCommerce is a sleek and powerful open-source single-vendor eCommerce platform built with Next.js for high-performance rendering, MongoDB for flexible data modeling, and Stripe and PayPal for secure and global payment processing.

It integrates [Stripe](https://stripe.com/global) and [PayPal](https://www.paypal.com/us/webapps/mpp/country-worldwide) [payment gateways](https://github.com/aelassas/wexcommerce/wiki/Payment-Gateways), allowing you to choose the most suitable option for your region. If Stripe isn't available in your country, PayPal offers a reliable alternative for smooth transactions.

You can deploy your own customizable eCommerce marketplace at minimal cost using the [Docker-based setup](https://github.com/aelassas/wexcommerce/wiki/Installing-(Docker)). Optimized for SEO and efficient performance, wexCommerce can run on a lightweight 1GB RAM droplet—ideal for cost-conscious businesses. Hosting starts at just $5/month with providers like [Hetzner](https://www.hetzner.com/cloud/) or [DigitalOcean](https://www.digitalocean.com/pricing/droplets).

From the frontend, customers can browse products, add them to their cart, and complete purchases with various payment methods including Credit Card, PayPal, Google Pay, Apple Pay, Link, Cash on Delivery, and Wire Transfer. They can register or log in using Google, Facebook, Apple, or Email, and view their order history and track their deliveries.

From the admin panel, admins can manage products, categories, orders, payments, customers, and general store settings such as default language, currency, delivery and shipping options, and accepted payment methods.

wexCommerce is free and open source. You can customize and deploy it yourself by following the [documentation](https://github.com/aelassas/wexcommerce/wiki). If you’d like assistance with customization or deployment, feel free to [contact me](https://github.com/aelassas). My email is listed on my GitHub profile (GitHub login required).

<!--
## Why Next.js?

Building a marketplace with Next.js provides a solid foundation for scaling your business. Focus on performance, security, and user experience while maintaining code quality and documentation. Regular updates and monitoring will ensure your platform remains competitive and reliable.

Next.js stands out as an excellent choice for marketplace development due to its:

- **Superior Performance**: Built-in optimizations for fast page loads and seamless user experiences
- **SEO Advantages**: Server-side rendering capabilities that ensure your products are discoverable
- **Scalability**: Enterprise-ready architecture that grows with your business
- **Rich Ecosystem**: Vast collection of libraries and tools for rapid development
- **Developer Experience**: Intuitive development workflow with hot reloading and automatic routing
-->

## Features

### 🛒 Commerce Management
* Stock management
* Order management
* Payment management
* Customer management

### 💳 Flexible Payments
* [Multiple payment gateways supported (Stripe, PayPal)](https://github.com/aelassas/wexcommerce/wiki/Payment-Gateways)
* Multiple payment methods: Credit Card, Cash on Delivery, Wire Transfer, PayPal, Google Pay, Apple Pay, Link

### 🚚 Delivery Options
* Home delivery
* Store withdrawal

### 🌍 Internationalization & Access
* Multiple language support: English, French
* Multiple login options: Google, Facebook, Apple, Email

### 🛡️ Security & Performance
* Secure against XSS, XST, CSRF, MITM, and DDoS attacks
* Responsive admin panel and frontend
* SEO-compliant: product pages are indexable by search engines for better visibility
* [Docker](https://www.docker.com/) support for easy deployment and a better developer experience

### 🖥️ Supported Platforms
* Web
* Docker

## Support

If this project helped you, saved you time, or inspired you in any way, please consider supporting its future growth and maintenance. You can show your support by starring the repository (it helps increase visibility and shows your appreciation), sharing the project (recommend it to colleagues, communities, or on social media), or making a donation (if you'd like to financially support the development) via [GitHub Sponsors](https://github.com/sponsors/aelassas) (one-time or monthly), [PayPal](https://www.paypal.me/aelassaspp), or [Buy Me a Coffee](https://www.buymeacoffee.com/aelassas). Open-source software requires time, effort, and resources to maintain—your support helps keep this project alive, up-to-date, and accessible to everyone. Every contribution, big or small, makes a difference and motivates continued work on features, bug fixes, and new ideas.

<!--<a href="https://github.com/sponsors/aelassas"><img src="https://aelassas.github.io/content/github-sponsor-button.png" alt="GitHub" width="210"></a>-->
<a href="https://www.paypal.me/aelassaspp"><img src="https://aelassas.github.io/content/paypal-button-v2.png" alt="PayPal" width="208"></a>
<a href="https://www.buymeacoffee.com/aelassas"><img src="https://aelassas.github.io/content/bmc-button.png" alt="Buy Me A Coffee" height="38"></a>

## Live Demo

* https://wexcommerce.dynv6.net:8002/

## Documentation

1. [Overview](https://github.com/aelassas/wexcommerce/wiki/Overview)
   1. [Frontend](https://github.com/aelassas/wexcommerce/wiki/Overview#frontend)
   2. [Admin Panel](https://github.com/aelassas/wexcommerce/wiki/Overview#admin-panel)
2. [Why Use wexCommerce](https://github.com/aelassas/wexcommerce/wiki/Why-Use-wexCommerce)
3. [Software Architecture](https://github.com/aelassas/wexcommerce/wiki/Architecture)
   1. [Technologies Overview](https://github.com/aelassas/wexcommerce/wiki/Architecture#technologies-overview)
   2. [Platform Highlights](https://github.com/aelassas/wexcommerce/wiki/Architecture#platform-highlights)
   2. [TypeScript Across the Stack](https://github.com/aelassas/wexcommerce/wiki/Architecture#typescript-across-the-stack)
   3. [Backend](https://github.com/aelassas/wexcommerce/wiki/Architecture#backend)
   4. [Frontend](https://github.com/aelassas/wexcommerce/wiki/Architecture#frontend)
   5. [Admin Panel](https://github.com/aelassas/wexcommerce/wiki/Architecture#admin-panel)
   6. [Shared Packages](https://github.com/aelassas/wexcommerce/wiki/Architecture#shared-packages)
   7. [Architecture Principles](https://github.com/aelassas/wexcommerce/wiki/Architecture#architecture-principles)
   9. [Docker & Development Environment](https://github.com/aelassas/wexcommerce/wiki/Architecture#docker--development-environment)
   10. [Codebase Overview](https://github.com/aelassas/wexcommerce/wiki/Architecture#codebase-overview)
   10. [Git Pre-commit Checks with Husky](https://github.com/aelassas/wexcommerce/wiki/Architecture#git-pre-commit-checks-with-husky)
   11. [Continuous Integration (CI)](https://github.com/aelassas/wexcommerce/wiki/Architecture#continuous-integration-ci)
2. [Installing (Self-hosted)](https://github.com/aelassas/wexcommerce/wiki/Installing-(Self%E2%80%90hosted))
2. [Installing (Docker)](https://github.com/aelassas/wexcommerce/wiki/Installing-(Docker))
   1. [Docker Image](https://github.com/aelassas/wexcommerce/wiki/Installing-(Docker)#docker-image)
   2. [SSL](https://github.com/aelassas/wexcommerce/wiki/Installing-(Docker)#ssl)
3. [Payment Gateways](https://github.com/aelassas/wexcommerce/wiki/Payment-Gateways)
3. [Setup Stripe](https://github.com/aelassas/wexcommerce/wiki/Setup-Stripe)
4. [Run from Source](https://github.com/aelassas/wexcommerce/wiki/Run-from-Source)
5. [Run from Source (Docker)](https://github.com/aelassas/wexcommerce/wiki/Run-from-Source-(Docker))
5. [Demo Database](https://github.com/aelassas/wexcommerce/wiki/Demo-Database)
   1. [Windows, Linux and macOS](https://github.com/aelassas/wexcommerce/wiki/Demo-Database#windows-linux-and-macos)
   2. [Docker](https://github.com/aelassas/wexcommerce/wiki/Demo-Database#docker)
6. [Change Language and Currency](https://github.com/aelassas/wexcommerce/wiki/Change-Language-and-Currency)
7. [Add New Language](https://github.com/aelassas/wexcommerce/wiki/Add-New-Language)
8. [Unit Tests and Coverage](https://github.com/aelassas/wexcommerce/wiki/Unit-Tests-and-Coverage)
9. [Logs](https://github.com/aelassas/wexcommerce/wiki/Logs)
10. [FAQ](https://github.com/aelassas/wexcommerce/wiki/FAQ)

## License

wexCommerce is [MIT licensed](https://github.com/aelassas/wexcommerce/blob/main/LICENSE).
