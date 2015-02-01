#!/bin/sh

# cd /folder
killall volatimp.py >/dev/null 2>&1
sleep 1
STAMP=$(date '+%Y%m%d%H%M')
if ./volatimp.py .; then
    mv -f volatimp.php.new volatimp.php
    # cp volatimp.php volatimp.$STAMP.php
    mv -f opcoes.txt.new opcoes.txt
    # cp opcoes.txt opcoes.txt.$STAMP
fi
