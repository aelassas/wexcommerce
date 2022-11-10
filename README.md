[![Backend](https://github.com/aelassas/weecommerce/actions/workflows/backend.yml/badge.svg)](https://github.com/aelassas/weecommerce/actions/workflows/backend.yml)
[![Frontend](https://github.com/aelassas/weecommerce/actions/workflows/frontend.yml/badge.svg)](https://github.com/aelassas/weecommerce/actions/workflows/frontend.yml)

![Logo](__content/logo.png)

weeCommerce is an eCommerce platform built on top of Next.js.

weeCommerce API is built with Node.js, Express and MongoDB.

weeCommerce backend and frontend are built with Node.js, Next.js and React.

# Features

* Stock management
* Order management
* Client management
* Multiple payment methods
* Multiple language support
* Responsive backend and frontend

<!--
# Installation

You can find installation instructions [here](https://github.com/aelassas/weecommerce/wiki/Installation).

# Run from code

You can find instructions to run weeCommerce from code [here](https://github.com/aelassas/weecommerce/wiki/Run-from-code).
-->

# Screenshots

## Frontend

![Frontend](__content/frontend-1.png)
![Frontend](__content/frontend-7-bis.png)
![Frontend](__content/frontend-8-bis.png)
![Frontend](__content/frontend-2.png)
![Frontend](__content/frontend-3.png)
![Frontend](__content/frontend-4.png)
![Frontend](__content/frontend-5.png)
![Frontend](__content/frontend-6.png)

## Backend

![Backend](__content/backend-1.png)
![Backend](__content/backend-2.png)
![Backend](__content/backend-3.png)
![Backend](__content/backend-4.png)
![Backend](__content/backend-5.png)
![Backend](__content/backend-6.png)
![Backend](__content/backend-7.png)

# Installation

Below are the installation instructions on Ubuntu Linux.

## Prerequisites

1. Install [git](https://github.com/git-guides/install-git), [Node.js](https://github.com/nodesource/distributions/blob/master/README.md#debinstall), [nginx](https://ubuntu.com/tutorials/install-and-configure-nginx#1-overview), [MongoDB](https://www.mongodb.com/docs/manual/tutorial/install-mongodb-on-ubuntu/) and [mongosh](https://www.mongodb.com/docs/mongodb-shell/install/).

2. Configure MongoDB:

```
mongosh
```

Create admin user:

```
db = db.getSiblingDB('admin')
db.createUser({ user: "admin" , pwd: "PASSWORD", roles: ["userAdminAnyDatabase", "dbAdminAnyDatabase", "readWriteAnyDatabase"]})
```

Replace PASSWORD with a strong password.

Secure MongoDB:

```
sudo nano /etc/mongod.conf
```

Change configuration as follows:

```
net:
  port: 27017
  bindIp: 0.0.0.0

security:
  authorization: enabled
```

Restart MongoDB service:

```
sudo systemctl restart mongod.service
sudo systemctl status mongod.service
```

## Instructions

1. Clone weeCommerce repo:
```
cd /opt
sudo git clone https://github.com/aelassas/weecommerce.git
```

2. Add permissions:
```
sudo chown -R $USER:$USER /opt/weecommerce
sudo chmod -R +x /opt/weecommerce/__scripts
```

3. Create deployment shortcut:
```
sudo ln -s /opt/weecommerce/__scripts/wc-deploy.sh /usr/local/bin/wc-deploy
```

4. Create weeCommerce services:
```
sudo cp /opt/weecommerce/__services/weecommerce.service /etc/systemd/system
sudo systemctl enable weecommerce.service

sudo cp /opt/weecommerce/__services/weecommerce-backend.service /etc/systemd/system
sudo systemctl enable weecommerce-backend.service

sudo cp /opt/weecommerce/__services/weecommerce-frontend.service /etc/systemd/system
sudo systemctl enable weecommerce-frontend.service
```

5. Add /opt/weecommerce/api/.env file:

```
NODE_ENV = production
WC_PORT = 4004
WC_HTTPS = false
WC_PRIVATE_KEY = /etc/ssl/weecommerce.key
WC_CERTIFICATE = /etc/ssl/weecommerce.crt
WC_DB_HOST = 127.0.0.1
WC_DB_PORT = 27017
WC_DB_SSL = false
WC_DB_SSL_KEY = C:\dev\weecommerce\ssl\weecommerce.key
WC_DB_SSL_CERT = C:\dev\weecommerce\ssl\weecommerce.crt
WC_DB_SSL_CA = C:\dev\weecommerce\ssl\weecommerce.ca.pem
WC_DB_DEBUG = true
WC_DB_APP_NAME = weecommerce
WC_DB_AUTH_SOURCE = admin
WC_DB_USERNAME = admin
WC_DB_PASSWORD = PASSWORD
WC_DB_NAME = weecommerce
WC_JWT_SECRET = PASSWORD
WC_JWT_EXPIRE_AT = 86400
WC_TOKEN_EXPIRE_AT = 86400
WC_SMTP_HOST = in-v3iljet.com
WC_SMTP_PORT = 587
WC_SMTP_USER = USER
WC_SMTP_PASS = PASSWORD
WC_SMTP_FROM = admin@weecommerce.com
WC_ADMIN_EMAIL = admin@weecommerce.com
WC_CDN_PRODUCTS = /var/www/cdn/weecommerce/products
WC_CDN_TEMP_PRODUCTS =  /var/www/cdn/weecommerce/temp/products
WC_BACKEND_HOST = http://localhost:8002/
WC_FRONTEND_HOST = http://localhost:8001/
WC_DEFAULT_LANGUAGE = en
WC_DEFAULT_CURRENCY = $
```

You must configure the following options:
```
WC_DB_PASSWORD
WC_SMTP_USER
WC_SMTP_PASS
WC_SMTP_FROM
WC_ADMIN_EMAIL
WC_BACKEND_HOST
WC_FRONTEND_HOST
```

If you want to enable SSL, You must configure the following options:
```
WC_HTTPS = true
WC_PRIVATE_KEY
WC_CERTIFICATE
```

6. Add /opt/weecommerce/backend/.env file:
```
NEXT_PUBLIC_WC_API_HOST = http://localhost:4004
NEXT_PUBLIC_WC_PAGE_SIZE = 30
NEXT_PUBLIC_WC_CDN_PRODUCTS = http://localhost/cdn/weecommerce/products
NEXT_PUBLIC_WC_CDN_TEMP_PRODUCTS = http://localhost/cdn/weecommerce/temp/products
NEXT_PUBLIC_WC_APP_TYPE = backend
```

You must configure the following options:
```
NEXT_PUBLIC_WC_API_HOST
NEXT_PUBLIC_WC_CDN_PRODUCTS
NEXT_PUBLIC_WC_CDN_TEMP_PRODUCTS
```


7. Add /opt/weecommerce/frontend/.env file:
```
NEXT_PUBLIC_WC_API_HOST = http://localhost:4004
NEXT_PUBLIC_WC_PAGE_SIZE = 30
NEXT_PUBLIC_WC_CDN_PRODUCTS = http://localhost/cdn/weecommerce/products
NEXT_PUBLIC_WC_CDN_TEMP_PRODUCTS = http://localhost/cdn/weecommerce/temp/products
NEXT_PUBLIC_WC_APP_TYPE = frontend
```

You must configure the following options:
```
NEXT_PUBLIC_WC_API_HOST
NEXT_PUBLIC_WC_CDN_PRODUCTS
NEXT_PUBLIC_WC_CDN_TEMP_PRODUCTS
```

8. Configure nginx:
```
sudo nano /etc/nginx/sites-available/default
```

Change the configuration as follows for the frontend:
```
server {
    #listen 443 http2 ssl default_server;
    listen 80 default_server;
    server_name _;
    
    #ssl_certificate_key /etc/ssl/weecommerce.key;
    #ssl_certificate /etc/ssl/weecommerce.pem;

    access_log /var/log/nginx/weecommerce.frontend.access.log;
    error_log /var/log/nginx/weecommerce.frontend.error.log;

    location / {
      # reverse proxy for next server
      proxy_pass http://localhost:8001;
      proxy_http_version 1.1;
      proxy_set_header Upgrade $http_upgrade;
      proxy_set_header Connection 'upgrade';
      proxy_set_header Host $host;
      proxy_cache_bypass $http_upgrade;
    }

    location /cdn {
      alias /var/www/cdn;
    }
}
```

If you want to enable SSL, uncomment these lines:
```
#listen 443 http2 ssl default_server;
#ssl_certificate_key /etc/ssl/weecommerce.key;
#ssl_certificate /etc/ssl/weecommerce.pem;
```

Change the configuration as follows for the backend:
```
server {
    #listen 3000 http2 ssl default_server;
    listen 3000 default_server;
    server_name _;

    #ssl_certificate_key /etc/ssl/weecommerce.key;
    #ssl_certificate /etc/ssl/weecommerce.pem;

    #error_page 497 301 =307 https://$host:$server_port$request_uri;

    access_log /var/log/nginx/weecommerce.backend.access.log;
    error_log /var/log/nginx/weecommerce.backend.error.log;

    location / {
      # reverse proxy for next server
      proxy_pass http://localhost:8002;
      proxy_http_version 1.1;
      proxy_set_header Upgrade $http_upgrade;
      proxy_set_header Connection 'upgrade';
      proxy_set_header Host $host;
      proxy_cache_bypass $http_upgrade;
    }
}
```

If you want to enable SSL, uncomment these lines:
```
#listen 3000 http2 ssl default_server;
#ssl_certificate_key /etc/ssl/weecommerce.key;
#ssl_certificate /etc/ssl/weecommerce.pem;
#error_page 497 301 =307 https://$host:$server_port$request_uri;
```

Then, check nginx configuration and start nginx service:
```
sudo nginx -t
sudo systemctl restart nginx.service
sudo systemctl status nginx.service
```

9. enable firewall and open weeCommerce ports:
```
sudo ufw enable
sudo ufw allow 4004/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 3000/tcp
```

10. Deploy weeCommerce:
```
wc-deploy all
```

weeCommerce backend is accessible on port 3000 and the frontend is accessible on port 80 or 443 if SSL is enabled.

11. Create an admin user by navigating to hostname:3000/sign-up

12. Open backend/pages/sign-up.js and uncomment this line to secure the backend:
```
if (process.env.NODE_ENV === 'production') return { notFound: true };
```

You can change language and currency from settings page from the backend.

# Run from Code

Below are the instructions to run weeCommerce from code.

## Prerequisites

Install git, Node.js, nginx on Linux or IIS on Windows, MongoDB and mongosh.

Configure MongoDB:
```
mongosh
```
Create admin user:
```
db = db.getSiblingDB('admin')
db.createUser({ user: "admin" , pwd: "PASSWORD", roles: ["userAdminAnyDatabase", "dbAdminAnyDatabase", "readWriteAnyDatabase"]})
```

Replace PASSWORD with a strong password.

Secure MongoDB by changing mongod.conf as follows:
```
net:
  port: 27017
  bindIp: 0.0.0.0

security:
  authorization: enabled
```

Restart MongoDB service.

## Instructions

1. Clone weeCommerce repo:
```
sudo git clone https://github.com/aelassas/weecommerce.git
```

2. Add api/.env file:

```
NODE_ENV = development
WC_PORT = 4004
WC_HTTPS = false
WC_PRIVATE_KEY = /etc/ssl/weecommerce.key
WC_CERTIFICATE = /etc/ssl/weecommerce.crt
WC_DB_HOST = 127.0.0.1
WC_DB_PORT = 27017
WC_DB_SSL = false
WC_DB_SSL_KEY = C:\dev\weecommerce\ssl\weecommerce.key
WC_DB_SSL_CERT = C:\dev\weecommerce\ssl\weecommerce.crt
WC_DB_SSL_CA = C:\dev\weecommerce\ssl\weecommerce.ca.pem
WC_DB_DEBUG = true
WC_DB_APP_NAME = weecommerce
WC_DB_AUTH_SOURCE = admin
WC_DB_USERNAME = admin
WC_DB_PASSWORD = PASSWORD
WC_DB_NAME = weecommerce
WC_JWT_SECRET = PASSWORD
WC_JWT_EXPIRE_AT = 86400
WC_TOKEN_EXPIRE_AT = 86400
WC_SMTP_HOST = in-v3iljet.com
WC_SMTP_PORT = 587
WC_SMTP_USER = USER
WC_SMTP_PASS = PASSWORD
WC_SMTP_FROM = admin@weecommerce.com
WC_ADMIN_EMAIL = admin@weecommerce.com
WC_CDN_PRODUCTS = /var/www/cdn/weecommerce/products
WC_CDN_TEMP_PRODUCTS =  /var/www/cdn/weecommerce/temp/products
WC_BACKEND_HOST = http://localhost:8002/
WC_FRONTEND_HOST = http://localhost:8001/
WC_DEFAULT_LANGUAGE = en
WC_DEFAULT_CURRENCY = $
```

You must configure the following options:
```
WC_DB_PASSWORD
WC_SMTP_USER
WC_SMTP_PASS
WC_SMTP_FROM
WC_ADMIN_EMAIL
WC_BACKEND_HOST
WC_FRONTEND_HOST
```

Install nodemon:
```
npm i -g nodemon
```

Run api:
```
cd ./api
npm install
npm run dev
```

3. Add backend/.env file:
```
NEXT_PUBLIC_WC_API_HOST = http://localhost:4004
NEXT_PUBLIC_WC_PAGE_SIZE = 30
NEXT_PUBLIC_WC_CDN_PRODUCTS = http://localhost/cdn/weecommerce/products
NEXT_PUBLIC_WC_CDN_TEMP_PRODUCTS = http://localhost/cdn/weecommerce/temp/products
NEXT_PUBLIC_WC_APP_TYPE = backend
```

You must configure the following options:
```
NEXT_PUBLIC_WC_API_HOST
NEXT_PUBLIC_WC_CDN_PRODUCTS
NEXT_PUBLIC_WC_CDN_TEMP_PRODUCTS
```

Run backend:
```
cd ./backend
npm install
npm run dev
```

4. Add frontend/.env file:
```
NEXT_PUBLIC_WC_API_HOST = http://localhost:4004
NEXT_PUBLIC_WC_PAGE_SIZE = 30
NEXT_PUBLIC_WC_CDN_PRODUCTS = http://localhost/cdn/weecommerce/products
NEXT_PUBLIC_WC_CDN_TEMP_PRODUCTS = http://localhost/cdn/weecommerce/temp/products
NEXT_PUBLIC_WC_APP_TYPE = frontend
```

You must configure the following options:
```
NEXT_PUBLIC_WC_API_HOST
NEXT_PUBLIC_WC_CDN_PRODUCTS
NEXT_PUBLIC_WC_CDN_TEMP_PRODUCTS
```

Run frontend:
```
cd ./frontend
npm install
npm run dev
```

5. Configure http://localhost/cdn

* On Windows, install IIS and create C:\inetpub\wwwroot\cdn folder.
* On Linux, install Nginx and add cdn folder by changing /etc/nginx/sites-available/default as follows:
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

6. Create an admin user from http://localhost:8002/sign-up

You can change language and currency from settings page in the backend.
