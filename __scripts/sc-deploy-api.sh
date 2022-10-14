#!/bin/bash

start_time=`date +%s`
echo "Deploying ShoppingCart API..."

cd /opt/shopping-cart/
git reset --hard
git pull
chmod +x -R /opt/shopping-cart/__scripts

cd /opt/shopping-cart/api

npm ci

sudo systemctl restart shopping-cart
sudo systemctl status shopping-cart --no-pager

finish_time=`date +%s`
elapsed_time=$((finish_time  - start_time))
((sec=elapsed_time%60, elapsed_time/=60, min=elapsed_time%60, hrs=elapsed_time/60))
timestamp=$(printf "ShoppingCart API deployed in %d minutes and %d seconds." $min $sec)
echo $timestamp

#$SHEL
