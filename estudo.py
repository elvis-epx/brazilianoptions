#!/usr/bin/env python
import sys
import math
from blackscholes import *

debug = False

def le_arquivo_volatimp(time_spot):
    if time_spot == "current":
        time_spot = ""
    else:
        time_spot = "." + time_spot
    mapa = {}
    for linha in open("opcoes.txt" + time_spot).readlines():
        lista = linha.split(" ")
        if lista[0]:
            mapa[lista[0]] = lista
    return mapa


def classify(papel, dados):
    # codigo, tipo, premium, S, K, r, s, t, delta, gama, theta, vega, prob
    dados[1] = int(dados[1])
    for i in range(2, len(dados)):
        dados[i] = float(dados[i])
    obj = Opcao(papel, dados[1], dados[2:8])
    return obj


def classify_map(mapa):
    for papel in mapa.keys():
        mapa[papel] = classify(papel, mapa[papel])


def nome_acao(opcao):
    # nome falso para a acao
    return opcao[0:4]+"Z00"


def cria_acao_subjacente(nome, opcao):
    # modela acao subjacente como se fosse uma opcao de compra com K=0
    # premium, S, K, r, s, t
    dados = [opcao.S_orig(), opcao.S_orig(), 0, opcao.r(), 0, 9999]
    acao = Opcao(nome, 1, dados)
    return acao


def cria_acoes_subjacentes(mapa):
    for papel in mapa.keys():
        acao = nome_acao(papel)
        if acao not in mapa.keys():
            mapa[acao] = cria_acao_subjacente(acao, mapa[papel])

def Ditems(time_spot):
    global debug
    debug = True
    return items(time_spot)

def items(time_spot):
    result = {}
    mapa = le_arquivo_volatimp(time_spot)
    classify_map(mapa)
    cria_acoes_subjacentes(mapa)
    lista = mapa.keys()
    lista.sort()

    for papel in lista:
        if len(papel) != 7:
            continue
        acao = papel[0:4]
        serie = papel[4]
        strike = papel[5:7]
        opcao = mapa[papel]
        if not result.has_key(acao):
            result[acao] = {}
        if not result[acao].has_key(serie):
            result[acao][serie] = {}
            result[acao][serie]["data"] = {}
            result[acao][serie]["default_strike"] = strike
            result[acao][serie]["strike_value"] = 99999999999.0
        result[acao][serie]["data"][strike] = opcao.dvc()
        if opcao.S_orig() < opcao.K():
            if opcao.K() < result[acao][serie]["strike_value"]:
                result[acao][serie]["default_strike"] = strike
                result[acao][serie]["strike_value"] = opcao.K()

    return result


def rgb(cor):
    return '#%02x%02x%02x' % (cor[0] * 255, cor[1] * 255, cor[2] * 255)

cbase = ((0.0, (0.0, 0.0, 1.0)), (0.25, (0.0, 1.0, 1.0)), (0.5, (0.0, 0.25, 0.0)), (0.75, (1.0, 1.0, 0.0)), (1.001, (1.0, 0.0, 0.0)))

def _interpolate(c1, c2, pos):
    return (c1[0] * (1.0 - pos) + c2[0] * pos, \
            c1[1] * (1.0 - pos) + c2[1] * pos, \
            c1[2] * (1.0 - pos) + c2[2] * pos)

def color_interpolate(pos):
    i = 0
    while 1:
        c1 = cbase[i]
        c2 = cbase[i+1]
        if c1[0] >= pos or pos <= c2[0]:
            break
        i += 1
    pos = (pos - c1[0]) / (c2[0] - c1[0])
    return _interpolate(c1[1], c2[1], pos)


def calc_cores(Tlist):
    if len(Tlist) <= 1:
        return [ rgb(color_interpolate(1.0)) ]
    return [rgb(color_interpolate(float(i) / (len(Tlist) - 1))) for i in range(0, len(Tlist))]


def readargs(mapa, args):
    papeis = []
    qtdes = {}
    if len(args) % 2 != 0:
        raise Exception("Bad arguments: %s" % args)
    for i in range(0, len(args)-1, 2):
        papel = args[i]
        try:
            qtde = int(args[i+1])
        except ValueError:
            raise Exception("Bad arguments (i): %s" % args);
        if qtde == 0:
            continue
        if not mapa.has_key(papel):
            raise Exception("Papel nao existe %s" % papel)
        if qtdes.has_key(papel):
            qtdes[papel] += qtde
        else:
            papeis.append(papel)
            qtdes[papel] = qtde
    return (papeis, qtdes)

def Dcalc(time_spot):
    global debug
    debug = True
    return calc(time_spot)

def calc(time_spot):
    mapa = le_arquivo_volatimp(time_spot)
    classify_map(mapa)
    cria_acoes_subjacentes(mapa)
    papeis, qtdes = readargs(mapa, sys.argv[3:])
    if not papeis:
        return {"graph": [], "infos": []}

    infos = {}
    for papel in papeis:
        infos[papel] = mapa[papel].dvc()

    graficos = []
    # pega opcao com menor numero de dias para vencimento
    t = 99999
    for papel in papeis:
        opcao = mapa[papel]
        t = min(t, opcao.t_dias())
    
    if t > 3650:
        t = 0

    t_inicial = t

    Tlist = []
    step = 2.0
    if t > 1:
        step = 2.0 ** (math.log(t) / math.log(2) / 4)
    step = max(2.0, step)
    while t > 1:
        Tlist.append(t)
        t = t / step
    Tlist.append(0)

    Sorig = mapa[papeis[0]].S_orig()
    Smin = Sorig * 0.9
    Smax = Sorig * 1.1
    Vmin = 99999
    Vmax = -99999
    cor = calc_cores(Tlist)

    grafico = []
    Step = (Smax - Smin) / 40.0 - 0.00001
    S = Smin
    while S < Smax:
        y = mapa[papeis[0]].p_exercicio(Sorig, S) * 100.0
        grafico.append([round(S, 2), y])
        S += Step

    graficos.append({"data": grafico, "color": "#d0d0d0", "yaxis": 2, "label": "p = 000.00%"})

    i = 0
    for t in Tlist:
        grafico = []
        graficos.append({"color": cor[i], "label": "%dd = 000.00" % round(t), "data": grafico})
        i += 1
        S = Smin

        while S < Smax:
            premio = 0
            for papel in papeis:
                opcao = mapa[papel]
                opcao.push()
                if papel[4] != "Z":
                    # relativo pois alguma opcao pode ter vencimento mais
                    # longo que o intervalo analisado
                    opcao.set_t_dias(opcao.t_dias() - (t_inicial - t))
                # relativo pois a opcao pode ser sobre acao diferente
                premio += opcao.premio(opcao.S_orig() + (S - Sorig)) * qtdes[papel]
                opcao.pop()

            grafico.append([round(S,2), round(premio, 2)])
            S += Step
            Vmax = max(Vmax, premio)
            Vmin = min(Vmin, premio)

    graficos.append({"data": [[Sorig, Vmin], [Sorig, Vmax]], "color": "#404040",
                     "label": "@000.00"})
    return {"graph": graficos, "infos": infos}

handlers = {"items": items, "Ditems": Ditems}

def main():
    try:
        if len(sys.argv) < 3:
            raise Exception("Argument error")
        req = sys.argv[1]
        time_spot = sys.argv[2]
        handler = handlers[req]
        txt = handler(time_spot)
    except Exception, e:
	if debug:
            raise
        print "{'err': '%s %s'}" % (str(type(e)), str(e).replace("'", "\\'").replace('"', '\\"'))
	return

    try:
        print txt
    except:
        pass

main()
