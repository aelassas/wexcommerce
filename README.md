[![Backend](https://github.com/aelassas/shopping-cart/actions/workflows/backend.yml/badge.svg)](https://github.com/aelassas/shopping-cart/actions/workflows/backend.yml)
[![Frontend](https://github.com/aelassas/shopping-cart/actions/workflows/frontend.yml/badge.svg)](https://github.com/aelassas/shopping-cart/actions/workflows/frontend.yml)

# Prerequisites

## Windows (IIS)

Create theses directories:

```
C:\inetpub\wwwroot\cdn\shopping-cart\products
C:\inetpub\wwwroot\cdn\shopping-cart\temp\products
```

## Linux (NGINX)

Create theses directories:

```
/var/www/cdn/shopping-cart/products
/var/www/cdn/shopping-cart/temp/products
```

Update NGINX config (/etc/nginx/sites-available/default):

```
server {
    listen 80 default_server;
    server_name _;
    
    ...
    
    location /cdn {
      alias /var/www/cdn;
    }
}
```

# api/.env

```
NODE_ENV = development
SC_PORT = 4004
SC_HTTPS = false
SC_PRIVATE_KEY = /etc/ssl/www.shopping-cart.ma.key
SC_CERTIFICATE = /etc/ssl/www.shopping-cart.ma.crt
SC_DB_HOST = 127.0.0.1
SC_DB_PORT = 27017
SC_DB_SSL = false
SC_DB_SSL_KEY = C:\dev\shopping-cart.ma\ssl\www.shopping-cart.ma.key
SC_DB_SSL_CERT = C:\dev\shopping-cart.ma\ssl\www.shopping-cart.ma.crt
SC_DB_SSL_CA = C:\dev\shopping-cart.ma\ssl\www.shopping-cart.ma.ca.pem
SC_DB_DEBUG = true
SC_DB_APP_NAME = shopping-cart
SC_DB_AUTH_SOURCE = admin
SC_DB_USERNAME = admin
SC_DB_PASSWORD = PASSWORD
SC_DB_NAME = shopping-cart
SC_JWT_SECRET = PASSWORD
SC_JWT_EXPIRE_AT = 86400
SC_TOKEN_EXPIRE_AT = 86400
SC_SMTP_HOST = in-v3.mailjet.com
SC_SMTP_PORT = 587
SC_SMTP_USER = USER
SC_SMTP_PASS = PASSWORD
SC_SMTP_FROM = poweredge-840@hotmail.com
SC_ADMIN_EMAIL = poweredge-840@hotmail.com
SC_CDN_PRODUCTS = C:\inetpub\wwwroot\cdn\shopping-cart\products
SC_CDN_TEMP_PRODUCTS = C:\inetpub\wwwroot\cdn\shopping-cart\temp\products
SC_DEFAULT_LANGUAGE = fr
SC_BACKEND_HOST = http://localhost:5001/
SC_FRONTEND_HOST = http://localhost:5000/
```

# backend/.env

```
NEXT_PUBLIC_SC_API_HOST = http://localhost:4004
NEXT_PUBLIC_SC_DEFAULT_LANGUAGE = fr
NEXT_PUBLIC_SC_PAGE_SIZE = 30
NEXT_PUBLIC_SC_CDN_PRODUCTS = http://localhost/cdn/shopping-cart/products
NEXT_PUBLIC_SC_CDN_TEMP_PRODUCTS = http://localhost/cdn/shopping-cart/temp/products
NEXT_PUBLIC_SC_APP_TYPE = backend
```

# frontend/.env

```
NEXT_PUBLIC_SC_API_HOST = http://localhost:4004
NEXT_PUBLIC_SC_DEFAULT_LANGUAGE = fr
NEXT_PUBLIC_SC_PAGE_SIZE = 30
NEXT_PUBLIC_SC_CDN_PRODUCTS = http://localhost/cdn/shopping-cart/products
NEXT_PUBLIC_SC_CDN_TEMP_PRODUCTS = http://localhost/cdn/shopping-cart/temp/products
NEXT_PUBLIC_SC_APP_TYPE = frontend
```
