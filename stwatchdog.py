#!/usr/bin/python
# -*- coding: utf-8 -*-

import ystockquote
import smtplib
import time
import email
from email.mime.text import MIMEText

# TODO: detect and notify problems in Yahoo
# TODO: keep tickets and ranges in separate file, detect change

UNKNOWN = 0
BETWEEN = 1
ABOVE = 2
BELOW = 3

SECONDS = 1
MINUTES = 60*SECONDS
HOURS = 60*MINUTES
DAYS = 24*HOURS

symbols = {"PETR4.SA": [39.40, 41.40]}
status = {}

for symbol in symbols.keys():
    status[symbol] = UNKNOWN

FROM = "email@email.com"
TO = ["email@email.com"]

def send_warning(txt):
    print " Sending message: ", txt

    msg = MIMEText('$')
    msg['Subject'] = txt
    msg['From'] = FROM
    msg['To'] = ", ".join(TO)
    
    try:
        server = smtplib.SMTP("localhost")
        server.sendmail(FROM, TO, msg.as_string())
        server.quit()
        print "  Message sent"
    except Exception, e:
        print "  Message not sent"
	print "  ", e

def handle_symbol(symbol, low, high):
    try:
        current = float(ystockquote.get_price(symbol))
    except Exception, e:
        print e
        current = 0.00

    if current <= 0.00:
        return

    print "Symbol %s = %.2f" % (symbol, current)

    if (current <= low) and (status[symbol] != BELOW):
        status[symbol] = BELOW
        send_warning("%s down to %.2f" % (symbol, current))
    elif (current >= high) and (status[symbol] != ABOVE):
        status[symbol] = ABOVE
        send_warning("%s up to %.2f" % (symbol, current))


print "Starting"
send_warning("Watchdog up")
uptime = 0
freq = 15 * MINUTES

# we die at 23:00 to be resurrected at 00:00
while time.localtime(time.time())[3] != 23:
    print "Ping", time.ctime(time.time())
    for symbol in symbols.keys():
        handle_symbol(symbol, *symbols[symbol])
    time.sleep(freq)
    uptime += freq
    now = time.gmtime(time.time())
    if uptime > 24 * HOURS and now[3] >= 15 and now[6] <= 4:
        uptime = 0
        send_warning("Watchdog ping")
