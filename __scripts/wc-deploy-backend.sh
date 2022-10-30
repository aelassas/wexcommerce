#!/bin/bash

start_time=`date +%s`
echo "Deploying weeCommerce backend..."

cd /opt/weecommerce/
git reset --hard
git pull
sudo chmod +x -R /opt/weecommerce/__scripts

cd /opt/weecommerce/backend/
npm ci
npm run build

sudo systemctl restart weecommerce-backend
sudo systemctl status weecommerce-backend --no-pager

#sudo rm -rf /var/cache/nginx
#sudo systemctl restart nginx
#sudo systemctl status nginx --no-pager

finish_time=`date +%s`
elapsed_time=$((finish_time  - start_time))
((sec=elapsed_time%60, elapsed_time/=60, min=elapsed_time%60, hrs=elapsed_time/60))
timestamp=$(printf "weeCommerce backend deployed in %d minutes and %d seconds." $min $sec)
echo $timestamp

#$SHELL
