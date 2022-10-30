#!/bin/bash

start_time=`date +%s`
echo "Deploying weeCommerce frontend..."

cd /opt/weecommerce/
git reset --hard
git pull
sudo chmod +x -R /opt/weecommerce/__scripts

cd /opt/weecommerce/frontend
npm ci
npm run build

sudo systemctl restart weecommerce-frontend
sudo systemctl status weecommerce-frontend --no-pager

#sudo rm -rf /var/cache/nginx
#sudo systemctl restart nginx
#sudo systemctl status nginx --no-pager

finish_time=`date +%s`
elapsed_time=$((finish_time  - start_time))
((sec=elapsed_time%60, elapsed_time/=60, min=elapsed_time%60, hrs=elapsed_time/60))
timestamp=$(printf "weeCommerce frontend deployed in %d minutes and %d seconds." $min $sec)
echo $timestamp

#$SHELL
