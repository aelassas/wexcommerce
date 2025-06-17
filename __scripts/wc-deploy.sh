#!/usr/bin/env bash

if [ "$1" == "all" ]; then
  /bin/bash /opt/wexcommerce/__scripts/wc-deploy-api.sh
  /bin/bash /opt/wexcommerce/__scripts/wc-deploy-admin.sh
  /bin/bash /opt/wexcommerce/__scripts/wc-deploy-frontend.sh
elif [ "$1" == "ui" ]; then
  /bin/bash /opt/wexcommerce/__scripts/wc-deploy-admin.sh
  /bin/bash /opt/wexcommerce/__scripts/wc-deploy-frontend.sh
elif [ "$1" == "api" ]; then
  /bin/bash /opt/wexcommerce/__scripts/wc-deploy-api.sh
elif [ "$1" == "admin" ]; then
  /bin/bash /opt/wexcommerce/__scripts/wc-deploy-admin.sh
elif [ "$1" == "frontend" ]; then
  /bin/bash /opt/wexcommerce/__scripts/wc-deploy-frontend.sh
else
  echo "Usage: wc-deploy all|ui|api|admin|frontend"
fi
