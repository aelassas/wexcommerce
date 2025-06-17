#!/bin/bash

start_time=$(date +%s)
echo "Deploying wexCommerce admin..."

cd /opt/wexcommerce/
git pull
sudo chmod +x -R /opt/wexcommerce/__scripts

/bin/bash /opt/wexcommerce/__scripts/free-mem.sh

cd /opt/wexcommerce/admin/
npm install --force
sudo rm -rf .next
npm run build

sudo systemctl restart wexcommerce-admin
sudo systemctl status wexcommerce-admin --no-pager

/bin/bash /opt/wexcommerce/__scripts/free-mem.sh

#sudo rm -rf /var/cache/nginx
#sudo systemctl restart nginx
#sudo systemctl status nginx --no-pager

finish_time=$(date +%s)
elapsed_time=$((finish_time - start_time))
((sec=elapsed_time%60, elapsed_time/=60, min=elapsed_time%60, hrs=elapsed_time/60))
timestamp=$(printf "wexCommerce admin deployed in %d minutes and %d seconds." $min $sec)
echo $timestamp

#$SHELL
