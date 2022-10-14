#!/usr/bin/env bash

if [ "$1" == "all" ]; then
  /bin/bash /opt/shopping-cart/__scripts/sc-deploy-api.sh
  /bin/bash /opt/shopping-cart/__scripts/sc-deploy-backend.sh
  /bin/bash /opt/shopping-cart/__scripts/sc-deploy-frontend.sh
elif [ "$1" == "api" ]; then
  /bin/bash /opt/shopping-cart/__scripts/sc-deploy-api.sh
elif [ "$1" == "backend" ]; then
  /bin/bash /opt/shopping-cart/__scripts/sc-deploy-backend.sh
elif [ "$1" == "frontend" ]; then
  /bin/bash /opt/shopping-cart/__scripts/sc-deploy-frontend.sh
else
  echo "Usage: sc-deploy all|api|backend|frontend"
fi
