settings {
  logfile = "/var/log/lsyncd/lsyncd.log",
  statusFile = "/var/log/lsyncd/lsyncd.status",
  statusInterval = 20,
  nodaemon   = false
}

sync {
  default.rsync,
  source = "/opt/wexcommerce",
  target = "/mnt/sdb/wexcommerce"
}

sync {
  default.rsync,
  source = "/home/aelassas/wexcommerce",
  target = "/mnt/sdb/__wexcommerce__"
 }
 
sync {
  default.rsync,
  source = "/opt/bookcars",
  target = "/mnt/sdb/bookcars"
}

sync {
 default.rsync,
 source = "/home/aelassas/bookcars",
 target = "/mnt/sdb/__bookcars__"
}