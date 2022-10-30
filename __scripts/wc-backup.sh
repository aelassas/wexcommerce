#!/bin/bash

HOST="localhost"
PORT=27017
AUTH_DB="admin"
USERNAME="admin"
PASSWORD="PASSWORD"
echo "Host: ${HOST}"
DATABASE_NAME="weecommerce"
echo "Database: ${DATABASE_NAME}"
time=$(date '+%d-%m-%Y_%H-%M-%S');
BACKUP="/home/aelassas/weecommerce/db/${DATABASE_NAME}-${time}.gz"
CDN="/home/aelassas/weecommerce/db/cdn-${time}.zip"
echo "Backup: ${BACKUP}"
BACKUP_LATEST="/home/aelassas/weecommerce/db/${DATABASE_NAME}.gz"
CDN_LATEST="/home/aelassas/weecommerce/db/cdn.zip"
_PWD=$PWD
echo "Latest Backup: ${BACKUP_LATEST}"
echo "Backuping ${DATABASE_NAME} database..."
mongodump --verbose  --host=$HOST --port=$PORT --username=$USERNAME --password=$PASSWORD --authenticationDatabase=$AUTH_DB --db=$DATABASE_NAME --gzip --archive=$BACKUP
echo "Backup written in ${BACKUP}"

echo "Backuping cdn"
cd /var/www/cdn/weecommerce/
sudo zip -r $CDN .
cd $_PWD
echo "cdn copied in ${CDN}"

rm -f $BACKUP_LATEST
cp $BACKUP $BACKUP_LATEST
echo "Latest backup written in ${BACKUP_LATEST}"

rm -rf $CDN_LATEST
cp $CDN $CDN_LATEST
echo "Latest cdn written in ${CDN_LATEST}"
