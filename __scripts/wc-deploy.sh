#!/usr/bin/env bash

if [ "$1" == "all" ]; then
  /bin/bash /opt/wexcommerce/__scripts/wc-deploy-api.sh
  /bin/bash /opt/wexcommerce/__scripts/wc-deploy-backend.sh
  /bin/bash /opt/wexcommerce/__scripts/wc-deploy-frontend.sh
elif [ "$1" == "api" ]; then
  /bin/bash /opt/wexcommerce/__scripts/wc-deploy-api.sh
elif [ "$1" == "backend" ]; then
  /bin/bash /opt/wexcommerce/__scripts/wc-deploy-backend.sh
elif [ "$1" == "frontend" ]; then
  /bin/bash /opt/wexcommerce/__scripts/wc-deploy-frontend.sh
else
  echo "Usage: wc-deploy all|api|backend|frontend"
fi
