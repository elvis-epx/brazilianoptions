#!/usr/bin/env python
# -*- coding: utf-8 -*-

import urllib
import sys
import re

try:
	s = urllib.urlopen("http://www.bcb.gov.br/?COPOMJUROS").read()
except:
	print "Nao pude ler pagina juros do BCB"
	sys.exit(1)

exp = re.compile("[0-9][0-9]/[0-9][0-9]/[0-9][0-9][0-9][0-9] *- *</[Tt][Dd]>")

res = exp.search(s)

if not res:
	print "Nao achei data corrente"
	sys.exit(1)

s = s[res.end(0):res.end(0) + 200]

exp = re.compile("([0-9]+,[0-9]+) *</[Tt][Dd]>")

res = exp.search(s)

if not res:
	print "Nao achei taxa"
	sys.exit(1)

taxa = float(s[res.start(1):res.end(1)].replace(",", "."))

if taxa > 30 or taxa < 5:
	print "Taxa estranha %f - nao usando" % taxa
	sys.exit(1)

open("taxajuros.txt", "w").write("%f" % taxa)
