#!/usr/bin/env python
# -*- coding: utf-8 -*-

import ystockquote
import datetime
import math
import time

symbols = ["VALE5", "PETR4", "OIBR4", "BVMF3", "OGXP3"]
now = datetime.date.today() - datetime.timedelta(1)
then = now - datetime.timedelta(75)
now = "%04d%02d%02d" % (now.year, now.month, now.day)
then = "%04d%02d%02d" % (then.year, then.month, then.day)

def average(li):
    return sum(li) / len(li)

for symbol in symbols:
    for retries in range(1, 5):
        book = ystockquote.get_historical_prices(symbol+".SA", then, now)

        # Detect vectors of interesting columns
        try:
            High = book[0].index('High')
            Low = book[0].index('Low')
            Close = book[0].index('Close')
            Volume = book[0].index('Volume')
            break
        except ValueError:
            pass
        time.sleep(retries)
    else:
        continue
        

    # Remove header
    del book[0]

    # removes all days with zero volume
    while True:
        for row in book:
            if int(row[Volume]) <= 0:
                book.remove(row)
                # List iterator invalidated, restart
                break
        else:
            # no removal, task done
            break

    # Sort by date, ascendng
    book.sort(lambda a, b: cmp(a[0], b[0]))

    # Leaves 22 latest rows
    del book[0:-22]

    highest = 0.01
    lowest = 99999999999999999.0
    earnings = []
    earnings2 = []
    
    for i in range(1, len(book)):
        day_high = float(book[i][High])
        day_low = float(book[i][Low])
        day_close = float(book[i][Close])
        day_ant_close = float(book[i-1][Close])
        
        highest = max(highest, day_high)
        lowest = min(lowest, day_low)
        day_earnings = math.log(day_close / day_ant_close)
        earnings.append(day_earnings)
        earnings2.append(day_earnings ** 2)

    n = len(earnings)
    
    earnings_average =  average(earnings) 
    earnings2_average = average(earnings2)

    if n <= 1:
        continue

    # Volatily calculated as the standard deviation of earnings
    vol1 = math.sqrt(n * (earnings2_average - earnings_average ** 2) / (n - 1)) 
    vol1 *= math.sqrt(252)

    # Double-check of standard deviation calculation
    vol11 = math.sqrt(sum((earning - earnings_average) ** 2 for earning in earnings) / (n - 1))
    vol11 *= math.sqrt(252)

    if abs(vol1 - vol11) > 0.0001:
        continue

    # Volatility calculated by the extreme value method
    vol2 = math.log(highest / lowest) * 0.601 
    vol2 *= math.sqrt(12.0)

    print "%s %.2f %.2f" % (symbol, vol1*100, vol2*100)

