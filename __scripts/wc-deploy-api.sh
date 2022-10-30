#!/bin/bash

start_time=`date +%s`
echo "Deploying weeCommerce API..."

cd /opt/weecommerce/
git reset --hard
git pull
chmod +x -R /opt/weecommerce/__scripts

cd /opt/weecommerce/api

npm ci

sudo systemctl restart weecommerce
sudo systemctl status weecommerce --no-pager

finish_time=`date +%s`
elapsed_time=$((finish_time  - start_time))
((sec=elapsed_time%60, elapsed_time/=60, min=elapsed_time%60, hrs=elapsed_time/60))
timestamp=$(printf "weeCommerce API deployed in %d minutes and %d seconds." $min $sec)
echo $timestamp

#$SHEL
