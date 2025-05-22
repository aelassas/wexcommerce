#!/bin/bash

start_time=$(date +%s)
echo "Deploying wexCommerce API..."

cd /opt/wexcommerce/
git pull
chmod +x -R /opt/wexcommerce/__scripts

/bin/bash /opt/wexcommerce/__scripts/free-mem.sh

cd /opt/wexcommerce/api

npm install

sudo systemctl restart wexcommerce
sudo systemctl status wexcommerce --no-pager

/bin/bash /opt/wexcommerce/__scripts/free-mem.sh

finish_time=$(date +%s)
elapsed_time=$((finish_time - start_time))
((sec=elapsed_time%60, elapsed_time/=60, min=elapsed_time%60, hrs=elapsed_time/60))
timestamp=$(printf "wexCommerce API deployed in %d minutes and %d seconds." $min $sec)
echo $timestamp

#$SHEL
