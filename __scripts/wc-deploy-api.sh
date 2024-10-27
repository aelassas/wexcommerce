#!/bin/bash

start_time=$(date +%s)
echo "Deploying wexCommerce API..."

cd /opt/wexcommerce/
git reset --hard
git pull
chmod +x -R /opt/wexcommerce/__scripts

cd /opt/wexcommerce/api

npm install
npm run build

sudo systemctl restart wexcommerce
sudo systemctl status wexcommerce --no-pager

finish_time=$(date +%s)
elapsed_time=$((finish_time - start_time))
((sec=elapsed_time%60, elapsed_time/=60, min=elapsed_time%60, hrs=elapsed_time/60))
timestamp=$(printf "wexCommerce API deployed in %d minutes and %d seconds." $min $sec)
echo $timestamp

#$SHEL
