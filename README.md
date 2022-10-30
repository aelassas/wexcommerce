[![Backend](https://github.com/aelassas/weecommerce/actions/workflows/backend.yml/badge.svg)](https://github.com/aelassas/weecommerce/actions/workflows/backend.yml)
[![Frontend](https://github.com/aelassas/weecommerce/actions/workflows/frontend.yml/badge.svg)](https://github.com/aelassas/weecommerce/actions/workflows/frontend.yml)

# Prerequisites

## Windows (IIS)

Create theses directories:

```
C:\inetpub\wwwroot\cdn\weecommerce\products
C:\inetpub\wwwroot\cdn\weecommerce\temp\products
```

## Linux (NGINX)

Create theses directories:

```
/var/www/cdn/weecommerce/products
/var/www/cdn/weecommerce/temp/products
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
WC_PORT = 4004
WC_HTTPS = false
WC_PRIVATE_KEY = /etc/ssl/www.weecommerce.ma.key
WC_CERTIFICATE = /etc/ssl/www.weecommerce.ma.crt
WC_DB_HOST = 127.0.0.1
WC_DB_PORT = 27017
WC_DB_SSL = false
WC_DB_SSL_KEY = C:\dev\weecommerce.ma\ssl\www.weecommerce.ma.key
WC_DB_SSL_CERT = C:\dev\weecommerce.ma\ssl\www.weecommerce.ma.crt
WC_DB_SSL_CA = C:\dev\weecommerce.ma\ssl\www.weecommerce.ma.ca.pem
WC_DB_DEBUG = true
WC_DB_APP_NAME = weecommerce
WC_DB_AUTH_SOURCE = admin
WC_DB_USERNAME = admin
WC_DB_PASSWORD = PASSWORD
WC_DB_NAME = weecommerce
WC_JWT_SECRET = PASSWORD
WC_JWT_EXPIRE_AT = 86400
WC_TOKEN_EXPIRE_AT = 86400
WC_SMTP_HOST = in-v3.mailjet.com
WC_SMTP_PORT = 587
WC_SMTP_USER = USER
WC_SMTP_PASS = PASSWORD
WC_SMTP_FROM = poweredge-840@hotmail.com
WC_ADMIN_EMAIL = poweredge-840@hotmail.com
WC_CDN_PRODUCTS = C:\inetpub\wwwroot\cdn\weecommerce\products
WC_CDN_TEMP_PRODUCTS = C:\inetpub\wwwroot\cdn\weecommerce\temp\products
WC_DEFAULT_LANGUAGE = fr
WC_BACKEND_HOST = http://localhost:8002/
WC_FRONTEND_HOST = http://localhost:8001/
```

# backend/.env

```
NEXT_PUBLIC_WC_API_HOST = http://localhost:4004
NEXT_PUBLIC_WC_DEFAULT_LANGUAGE = fr
NEXT_PUBLIC_WC_PAGE_SIZE = 30
NEXT_PUBLIC_WC_CDN_PRODUCTS = http://localhost/cdn/weecommerce/products
NEXT_PUBLIC_WC_CDN_TEMP_PRODUCTS = http://localhost/cdn/weecommerce/temp/products
NEXT_PUBLIC_WC_APP_TYPE = backend
```

# frontend/.env

```
NEXT_PUBLIC_WC_API_HOST = http://localhost:4004
NEXT_PUBLIC_WC_DEFAULT_LANGUAGE = fr
NEXT_PUBLIC_WC_PAGE_SIZE = 30
NEXT_PUBLIC_WC_CDN_PRODUCTS = http://localhost/cdn/weecommerce/products
NEXT_PUBLIC_WC_CDN_TEMP_PRODUCTS = http://localhost/cdn/weecommerce/temp/products
NEXT_PUBLIC_WC_APP_TYPE = frontend
```
