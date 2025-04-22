[![build](https://github.com/aelassas/wexcommerce/actions/workflows/build.yml/badge.svg)](https://github.com/aelassas/wexcommerce/actions/workflows/build.yml) [![test](https://github.com/aelassas/wexcommerce/actions/workflows/test.yml/badge.svg)](https://github.com/aelassas/wexcommerce/actions/workflows/test.yml) [![coveralls](https://coveralls.io/repos/github/aelassas/wexcommerce/badge.svg?branch=main)](https://coveralls.io/github/aelassas/wexcommerce?branch=main) [![loc](https://raw.githubusercontent.com/aelassas/wexcommerce/refs/heads/loc/badge.svg)](https://github.com/aelassas/wexcommerce/actions/workflows/loc.yml) [![docs](https://img.shields.io/badge/docs-wiki-brightgreen)](https://github.com/aelassas/wexcommerce/wiki) [![live demo](https://img.shields.io/badge/live-demo-brightgreen)](https://wexcommerce.dynv6.net:8002/)
<!--
[![tested with jest](https://img.shields.io/badge/tested_with-jest-brightgreen?logo=jest)](https://github.com/jestjs/jest)
[![docs](https://img.shields.io/badge/docs-wiki-brightgreen)](https://github.com/aelassas/wexcommerce/wiki)
[![live demo](https://img.shields.io/badge/live-demo-brightgreen)](https://wexcommerce.dynv6.net:8002/)
[![loc](https://raw.githubusercontent.com/aelassas/wexcommerce/refs/heads/loc/badge.svg)](https://github.com/aelassas/wexcommerce/actions/workflows/loc.yml)
[![PRs welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/aelassas/wexcommerce/pulls)
[![codecov](https://codecov.io/gh/aelassas/wexcommerce/graph/badge.svg?token=ZNW4QHSFPH)](https://codecov.io/gh/aelassas/wexcommerce)
[![codecov](https://img.shields.io/codecov/c/github/aelassas/wexcommerce?logo=codecov)](https://codecov.io/gh/aelassas/wexcommerce)
[![coveralls](https://coveralls.io/repos/github/aelassas/wexcommerce/badge.svg?branch=main)](https://coveralls.io/github/aelassas/wexcommerce?branch=main)

https://github.com/user-attachments/assets/1a4841cb-8e70-4ac2-974e-64774eb17371
-->

[![](https://wexcommerce.github.io/content/frontend-0-tiny.png)](https://wexcommerce.dynv6.net:8002/home)

wexCommerce is a sleek and powerful ecommerce platform built on Next.js for its powerful rendering capabilities, MongoDB for flexible data modeling, Stripe and PayPal for secure payment processing.

<!--
For developers who value creative freedom and technical control, traditional ecommerce platforms like Shopify can feel restrictive. While Shopify's templates offer quick setup, and their Storefront API provides some flexibility, neither solution delivers the complete architectural freedom that modern developers crave.

This project emerged from a desire to build without boundaries – a fully customizable ecommerce solution where every aspect is within your control. This open-source platform empowers developers to:

- **Own the UI/UX**: Design unique customer experiences without fighting against template limitations
- **Control the Backend**: Implement custom business logic and data structures that perfectly match your requirements
- **Master DevOps**: Deploy, scale, and monitor your application with your preferred tools and workflows
- **Extend Freely**: Add new features and integrations without platform constraints or additional fees

By choosing this stack, you're not just building a store – you're investing in a foundation that can evolve with your needs, backed by robust open-source technologies and a growing developer community.
-->

wexCommerce integrates Stripe and PayPal [payment gateways](https://github.com/aelassas/wexcommerce/wiki/Payment-Gateways). If [Stripe](https://stripe.com/global) isn't available in your country, simply check if [PayPal](https://www.paypal.com/us/webapps/mpp/country-worldwide) is supported and use it as an alternative for smooth and secure payments.

With wexCommerce, you can deploy your own customizable ecommerce marketplace at minimal cost using the [Docker-based setup](https://github.com/aelassas/wexcommerce/wiki/Installing-(Docker)). The platform integrates Stripe and PayPal for secure payments, is optimized for SEO and can be efficiently hosted on a 1GB RAM droplet, making it an ideal choice for ecommerce operations looking for a scalable and cost-effective solution. You can deploy it for under $5/month using cloud providers like [Hetzner](https://www.hetzner.com/cloud/) or [DigitalOcean](https://www.digitalocean.com/pricing/droplets).
<!--
wexCommerce is free and open source. You can customize it as you want and deploy it yourself by following the [documentation](https://github.com/aelassas/wexcommerce/wiki). If you want me to customize it and deploy it for you, contact me by email. You can find my email in my [GitHub profile page](https://github.com/aelassas). You need to be logged in to GitHub to view my email. I can deploy the platform to the cloud for you, configure your DNS, emailing, webmail and all related tasks.
-->
wexCommerce is composed of a frontend and an admin dashboard. From the frontend, customers can search for the products they want, add them to their cart and checkout. Customers can sign up with Google, Facebook, Apple or Email, and pay with Credit Card, Cash On Delivery, Wire Transfer, PayPal, Google Pay, Apple Pay, Link or other Stripe payment methods. Once logged in, they can have access to the history of their purshases and follow their orders. From the admin dashboard, admins can manage orders, payments, products, categories, customers and general settings such as the default language, the currency, delivery, shipping and payment methods accepted.

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

* Stock management
* Order management
* Payment management
* Customer management
* Multiple payment options (Credit Card, Cash On Delivery, Wire Transfer, PayPal, Google Pay, Apple Pay, Link)
* Multiple delivery options (Home delivery, Store withdrawal)
* Multiple language support (English, French)
* Multiple login options (Google, Facebook, Apple, Email)
* [Multiple Payment Gateways supported (Stripe, PayPal)](https://github.com/aelassas/wexcommerce/wiki/Payment-Gateways)
* Responsive frontend and admin dashboard

## Live Demo

* https://wexcommerce.dynv6.net:8002/

## Documentation

1. [Overview](https://github.com/aelassas/wexcommerce/wiki/Overview)
2. [Why Use wexCommerce](https://github.com/aelassas/wexcommerce/wiki/Why-Use-wexCommerce)
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

## Support

If you find this project helpful, consider buying me a coffee.

<a href="https://www.buymeacoffee.com/aelassas" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png" alt="Buy Me A Coffee" style="height: 60px !important;width: 217px !important;" ></a>

## License

wexCommerce is [MIT licensed](https://github.com/aelassas/wexcommerce/blob/main/LICENSE).
