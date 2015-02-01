#!/usr/bin/env python
import sys
import math
from blackscholes import *

debug = False

def lista_opcoes():
    mapa = {}
    S = 50.00
    r = 0.09
    s = 0.30
    acao = "XPTO"

    for K in range(-2, +4, +2):
        K += S
        # data-base: 18/3. Venctos: 19/4 e 17/5
        for serie, t in [("D", 32), ("E", 60), ("O", 32), ("P", 60)]:
            tipo = serie >= "M" and 2 or 1
            tk = acao + serie + ("%2d" % K)
            mapa[tk] = [tk, tipo, None, S, K, r, s, t / 365.0]

    return mapa


def classify(papel, dados):
    # codigo, tipo, premium, S, K, r, s, t, delta, gama, theta, vega, prob
    # dados[1] = int(dados[1])
    # for i in range(2, len(dados)):
    #     dados[i] = float(dados[i])
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

def Ditems():
    global debug
    debug = True
    return items()

def items():
    result = {}
    mapa = lista_opcoes()
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

print items()
