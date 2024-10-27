#!/bin/bash

start_time=$(date +%s)
echo "Deploying wexCommerce backend..."

cd /opt/wexcommerce/
git pull
sudo chmod +x -R /opt/wexcommerce/__scripts

cd /opt/wexcommerce/backend/
npm install --force
sudo rm -rf .next
npm run build

sudo systemctl restart wexcommerce-backend
sudo systemctl status wexcommerce-backend --no-pager

#sudo rm -rf /var/cache/nginx
#sudo systemctl restart nginx
#sudo systemctl status nginx --no-pager

finish_time=$(date +%s)
elapsed_time=$((finish_time - start_time))
((sec=elapsed_time%60, elapsed_time/=60, min=elapsed_time%60, hrs=elapsed_time/60))
timestamp=$(printf "wexCommerce backend deployed in %d minutes and %d seconds." $min $sec)
echo $timestamp

#$SHELL
