#!/usr/bin/env python
# -*- coding: utf-8 -*-

import urllib
import datetime
import os
import math
import random
import sys
from blackscholes import *

ativos = ['PETR4', 'VALE5', 'OGXP3', 'BVMF3', 'OIBR4']
meses = 2
r = float(open("taxajuros.txt").read()) / 100.0

if r > 0.35 or r < 0.05:
	print "Strange interest rate"
	sys.exit(1)


if len(sys.argv) < 2:
    print "Usage: prog folder"
    sys.exit(1)

strikes = {}
vencimentos = {}
volatilidades = {}

f = open('%s/volatimp.php.new' % sys.argv[1], 'w')
f2 = open('%s/opcoes.txt.new' % sys.argv[1], 'w')

def pr(txt):
    f.write(txt)
    f.write("\r\n")

def lg(codigo, tipo, premium, S, K, r, s, t, delta, gama, theta, vega, prob):
    l = "%s %d %.2f %.2f %.2f %f %f %f %f %f %f %f %f\n" \
        % (codigo, tipo, premium, S, K, r, s, t, delta, gama, theta, vega, prob)
    f2.write(l)

for l in open("volatilidades.txt").readlines():
    m = l.split(" ")
    volatilidades[m[0]] = [ float(m[1]), float(m[2]) ]

for l in open("cblc.txt").readlines():
    if l[0:2] != "01":
        continue
    vencto = datetime.date(int(l[205:209]), int(l[209:211]), int(l[211:213]))
    strikes[l[150:162].strip()] = ( int(l[187:200])/100.0, vencto)
    vencimentos[l[150:155]] = vencto

def get_volatility(symbol):
    res = [-1, -1]
    if symbol in volatilidades:
        res = volatilidades[symbol]
    return res

def get_quote(symbol):
    w = 0
    q = "http://www.bmfbovespa.com.br/Pregao-Online/ExecutaAcaoAjax.asp?CodigoPapel=%s&intEstado=1" % symbol
    try:
        s = urllib.urlopen(q).read()
    except:
        s = 'Ultimo="999999,99"'
    a = s.find('Ultimo="')
    if a >= 0:
        a += 2
    b = s.find('" ', a)
    if b >= 0:
        t = s[a:b].strip()
        u = "0"
        for caractere in t:
            if caractere >= '0' and caractere <= '9':
                u += caractere
        try:
            w = int(u)/100.0
        except ValueError:
            w = 0
    return w

today_dhms = datetime.datetime.today()
today_d = datetime.date.today()

def gera_series(prefixo, cotacao, put):
    mes1 = today_d.month - 1
    prefixoV0 = prefixo + chr(ord('A') + mes1)
    prefixoV1 = prefixo + chr(ord('A') + (mes1 + 1) % 12)

    if vencimentos.has_key(prefixoV0):
        vencto1 = vencimentos[prefixoV0]
    elif vencimentos.has_key(prefixoV1):
        vencto1 = vencimentos[prefixoV1]
    else:
        return []

    if vencto1 < today_d: # vencimento das opções deste mês já passou
        mes1 = mes1 + 1

    sbase = math.floor(cotacao)  # Arredonda para strike logo abaixo

    ss = []
    # Gera séries baseadas no mês atual
    for i in range(0, meses + 1):
         # opção de compra
        serie = [chr(ord('A') + (mes1 + i) % 12)]
        ss.append(serie)
        lower = -int(cotacao * 0.2)
        higher = int(cotacao * 0.2)
        for j in range(lower, higher + 1):
            strike = "%02d" % round(sbase + j)
            if strikes.has_key(prefixo + serie[0] + strike): # strike existe para o ativo
                serie.append(strike)

    if not put:
        return ss

    # Puts (opcoes de venda)
    for i in range(0, meses + 1):
        serie = [chr(ord('A') + 12 + (mes1 + i) % 12)]
        ss.append(serie)
        for j in range(-2, +3):
            strike = "%02d" % round(sbase + j)
            if strikes.has_key(prefixo + serie[0] + strike): # strike existe para o ativo
                serie.append(strike)

    return ss

pr('<? require "../lib.php"?> ')


pr('<?')
pr('$h = new Header(Header::NORM, "pt", "Volatilidades implícitas das principais opções BOVESPA");')
pr('$h->description("Volatilidades implícitas das principais opções da Bolsa de Valores de São Paulo (BOVESPA) recalculadas de hora em hora");')
pr('$h->keywords("opções bovespa volatilidade");')
pr('$h->head("<link rel=STYLESHEET href=\\"bs.css\\" type=\\"text/css\\"><SCRIPT SRC=\\"volatimp.js\\" TYPE=\\"text/javascript\\"></script><meta http-equiv=\\"refresh\\" content=\\"3600\\">");')
pr('$h->p();')
pr('?>')
pr('<p>Atualizado em %s EDT. Baseado em dados de fontes públicas e gratuitas: BOVESPA, Yahoo e CBLC. Não nos responsabilizamos pela exatidão das informações nem pelo uso delas em operações financeiras!' % today_dhms )
pr('<p>Taxa de juros empregada nos cálculos: %.2f%% ao ano.' % (r * 100));

insert_banner = 0
midd = False

for i in range(0, len(ativos)):
    acao = ativos[i]
    S = get_quote(acao)
    V1, V2 = get_volatility(acao)
    
    series = gera_series(acao[0:4], S, True)
    if S == 999999:
        pr("<h3>%s - impossível obter cotação</h3>" % acao)
        continue

    pr("<h2>%s - R$ %.2f</h2>" % (acao, S))
    if V1 >= 0:
        pr("<h4>Volatilidade últimos 21 dias úteis: %.1f%% (diária) %.1f%% (método val. extremos)</h4>" % (V1, V2))

    for serie in series:
        insert_banner += 1
        codigo_serie = acao[0:4] + serie[0]
        printed_header = False
        s = 0

        for opcao in serie[1:]:

            err2 = err = ""
            delta = gama = theta = vega = prob = 0
            # s is not zeroed since we keep the previous volatility as good initial estimate for the next
            codigo = codigo_serie + opcao
            K = strikes[codigo][0]

            premium = get_quote(codigo)

            if premium < 0.005:
                err = "Não negociada"
                premium = 0
            if premium == 999999:
                err = "Impossível obter cotação"
                premium = 0

            tdays = (strikes[codigo][1] - today_d).days
            t = tdays / 365.0
            if serie[0] >= 'A' and serie[0] <= 'L':
                type = Call
		intrinsic = S - K
            else:
                type = Put
		intrinsic = K - S

            trclass = "otm"
            if abs(intrinsic / S) <= 0.05:
		trclass = "atm"
	    elif intrinsic > 0:
		trclass = "itm"

            if not err:
                s = implied_volatility(type, premium, S, K, r, s, t)
                if s >= 100.0:
                    s = 0.0
                    err2 = "Impossível determinar volat. implícita"
                elif s > 0.00001:
                    delta = type.delta(S, K, r, s, t)
                    gama = type.gamma(S, K, r, s, t)
                    theta = type.theta(S, K, r, s, t)
                    vega = type.vega(S, K, r, s, t)
                    prob = type.prob(S, K, r, s, t)
                else:
                    s = 0.0
                    err2 = "Volatilidade implícita menor que zero"

            if not printed_header:
                pr("<div class='fincalc'><table class='book'>")
                pr("<tr>")
                pr("<th>Código</th>")
                pr("<th>Prazo<br>dias</th>")
                pr("<th class=rho>Strike</th>")
                pr("<th class=intrinseco>Valor<br>intrínseco</th>")
                pr("<th class=premium>Prêmio</th>")
                pr("<th class=intrinsic>Volat.<br>implícita</th>")
                pr("<th class=delta>Delta</th>")
                pr("<th class=gamma>Gama</th>")
                pr("<th class=theta>Theta<br>/dia</th>")
                pr("<th class=vega>Vega</th>")
                pr("<th class=intrinsic>Prob.<br>exercício</th>")
                pr("<th></th>")
                pr("</tr>")
                printed_header = True

            pr("<tr class=%s>" % trclass)

            pr("<td>%s</td>" % codigo)
            pr("<td>%d</td>" % tdays)
            pr("<td>%.2f</td>" % K)
	    if intrinsic <= 0:
		pr("<td>-</td>")
	    else:
               	pr("<td>%.2f</td>" % intrinsic) 

            if err:
                pr("<td colspan=7>%s</td>" % err)
                pr("<td></td>")
            elif err2:
                pr("<td>%.2f</td>" % premium)
                pr("<td colspan=6>%s</td>" % err2)
                pr("<td></td>")
            else:
                pr("<td>%.2f</td>" % premium)
                pr("<td>%.1f%%</td>" % (s * 100.0))
                pr("<td>%.1f%%</td>" % (delta * 100.0))
                pr("<td>%.1f%%</td>" % (gama * 100.0))
                pr("<td>%.2f</td>" % (theta / 365.0))
                pr("<td>%.2f</td>" % vega)
                pr("<td>%.1f%%</td>" % (prob * 100))
                pr("<td><a href='#' onclick='export_calc(%f, %f, %f, %f, %f, %f, %f); return false;'>calc</a></td>" % (K, 2, S, t, s, r, S))
                ntype = 1
                if type != Call:
                    ntype = 2
                lg(codigo, ntype, premium, S, K, r, s, t, delta, gama, theta, vega, prob)
            pr("</tr>")

        if printed_header:
            pr("</table></div><div>&nbsp;</div>")

    if i >= 1 and not midd:
        pr('<? include "../google_hbanner_middle.php" ?>');
        midd = True

pr('<? footer("/opc", "en", 1, 1); ?>')

