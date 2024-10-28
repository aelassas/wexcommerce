[![build](https://github.com/aelassas/wexcommerce/actions/workflows/build.yml/badge.svg)](https://github.com/aelassas/wexcommerce/actions/workflows/build.yml) [![](https://img.shields.io/badge/docs-wiki-brightgreen)](https://github.com/aelassas/wexcommerce/wiki) [![](https://img.shields.io/badge/live-demo-brightgreen)](https://wexcommerce.dynv6.net:8002/) [![](https://raw.githubusercontent.com/aelassas/wexcommerce/loc/badge.svg)](https://github.com/aelassas/wexcommerce/actions/workflows/loc.yml)

![](https://wexcommerce.github.io/content/frontend-0-tiny.png)

wexCommerce is a minimalistic and powerful eCommerce platform built with Next.js using SSR, MongoDB and Stripe for payments.

Deploy your own customizable eCommerce solution at minimal cost using the [Docker-based setup](https://github.com/aelassas/wexcommerce/wiki/Installing-(Docker)). The platform integrates Stripe for secure payments, is optimized for SEO and can be efficiently hosted on a 1GB RAM droplet, making it an ideal choice for eCommerce operations looking for a scalable and cost-effective solution. You can deploy this solution for under $5 monthly using cloud providers like [Hetzner](https://www.hetzner.com/cloud/) or [DigitalOcean](https://www.digitalocean.com/pricing/droplets).

wexCommerce is composed of a frontend and an admin dashboard. From the frontend, customers can search for the products they want, add them to their cart and checkout. Customers can sign up with Google, Facebook, Apple or Email, and pay with Credit Card, Cash On Delivery, Wire Transfer, PayPal, Google Pay, Apple Pay, Link or other Stripe payment methods. Once logged in, they can have access to the history of their purshases and follow their orders. From the admin dashboard, admins can manage orders, payments, products, categories, customers and general settings such as the default language, the currency, delivery, shipping and payment methods accepted.

A key design decision was made to use TypeScript instead of JavaScript due to its numerous advantages. TypeScript offers strong typing, tooling, and integration, resulting in high-quality, scalable, more readable and maintainable code that is easy to debug and test.

## Features

* Stock management
* Order management
* Payment management
* Customer management
* Multiple payment options (Credit Card, Cash On Delivery, Wire Transfer, PayPal, Google Pay, Apple Pay, Link)
* Operational Stripe Payment Gateway
* Multiple delivery options (Home delivery, Store withdrawal)
* Multiple language support (English, French)
* Multiple login options (Google, Facebook, Apple, Email)
* Responsive backend and frontend

## Live Demo

* URL: https://wexcommerce.dynv6.net:8002/
* Login: jdoe@wexcommerce.com
* Password: sh0ppingC4rt

## Resources

1. [Overview](https://github.com/aelassas/wexcommerce/wiki/Overview)
2. [Installing (Self-hosted)](https://github.com/aelassas/wexcommerce/wiki/Installing-(Self%E2%80%90hosted))
2. [Installing (Docker)](https://github.com/aelassas/wexcommerce/wiki/Installing-(Docker))
   1. [Docker Image](https://github.com/aelassas/wexcommerce/wiki/Installing-(Docker)#docker-image)
   2. [SSL](https://github.com/aelassas/wexcommerce/wiki/Installing-(Docker)#ssl)
3. [Setup Stripe](https://github.com/aelassas/wexcommerce/wiki/Setup-Stripe)
4. [Run from Source](https://github.com/aelassas/wexcommerce/wiki/Run-from-Source)
5. [Demo Database](https://github.com/aelassas/wexcommerce/wiki/Demo-Database)
   1. [Windows, Linux and macOS](https://github.com/aelassas/wexcommerce/wiki/Demo-Database#windows-linux-and-macos)
   2. [Docker](https://github.com/aelassas/wexcommerce/wiki/Demo-Database#docker)
6. [Change Language and Currency](https://github.com/aelassas/wexcommerce/wiki/Change-Language-and-Currency)
7. [Add New Language](https://github.com/aelassas/wexcommerce/wiki/Add-New-Language)
8. [Logs](https://github.com/aelassas/wexcommerce/wiki/Logs)

## License
wexCommerce is [MIT licensed](https://github.com/aelassas/wexcommerce/blob/main/LICENSE).
