#!/usr/bin/env python
# -*- coding: utf-8 -*-

import math

def d1(S, K, r, s, t):
    return (math.log(S/float(K)) + (r+(s*s)/2.0)*t) / (s*math.sqrt(t))

def d2(S, K, r, s, t):
    return d1(S, K, r, s, t) - s*math.sqrt(t)

def N(x):
    if x < 0:
        return 1.0 - N(-x)
    xp = x
    p = 1.0 + N.kd1 * xp
    xp *= x
    p += N.kd2 * xp
    xp *= x
    p += N.kd3 * xp
    xp *= x
    p += N.kd4 * xp
    xp *= x
    p += N.kd5 * xp
    xp *= x
    p += N.kd6 * xp
    p *= p                
    p *= p                
    p *= p                
    p *= p                
    return 1.0 - 0.5 * (1.0 / p)

N.kd1 = 0.0498673470
N.kd3 = 0.0032776263
N.kd5 = 0.0000488906
N.kd2 = 0.0211410061
N.kd4 = 0.0000380036
N.kd6 = 0.0000053830

def dN(x):
    n = math.exp(-(x*x/2.0))
    n /= math.sqrt(2*math.pi)
    return n

def Call(S, K, r, s, t):
    if t < 0.0000000001 or s < 0.00000000001:
        return max(S - K, 0.0)
    return S*N(d1(S, K, r, s, t)) - K*math.exp(-r*t)*N(d2(S, K, r, s, t))

def Put(S, K, r, s, t):
    if t < 0.0000000001 or s < 0.00000000001:
        return max(K - S, 0.0)
    return - S*N(-d1(S, K, r, s, t)) + K*math.exp(-r*t)*N(-d2(S, K, r, s, t))

def implied_volatility(type, premium, S, K, r, s_dummy, t):
    if S <= 0.000001 or K <= 0.000001 or t <= 0.000001 or premium <= 0.000001:
        return 0.0

    s = 0.35

    for cycle in range(0, 120):
        ext_premium = type(S, K, r, s, t)
        if abs(premium - ext_premium) < 0.005:
            return s
        ext_vega = type.vega(S, K, r, s, t)
        # print S, K, r, s, t, premium, ext_premium, ext_vega
        if ext_vega < 0.0000001:
            # Avoids zero division if stuck 
            ext_vega = 0.0000001

        s_new = s - (ext_premium - premium) / ext_vega
        if abs(s_new - s) > 1.00:
            # estimated s is too different from previous;
            # it is better to go linearly, since
            # vega is too small to give a good guess
            if s_new > s:
                s += 1.0
            else:
                s -= 1.0
        else:
            s = s_new

        if s < 0.0:
            # No volatility < 0%
            s = 0.0001
        if s > 99.99:
            # No point calculating volatilities > 9999%/year
            return 100.0

    return 0.0

def CallDelta(S, K, r, s, t):
    x = N(d1(S, K, r, s, t))
    return x

def PutDelta(S, K, r, s, t):
    x = N(d1(S, K, r, s, t)) - 1.0
    return x

def CallGamma(S, K, r, s, t):
    D1 = d1(S, K, r, s, t)
    x = dN(D1)
    x /= S * s * math.sqrt(t)
    return x

def PutGamma(S, K, r, s, t):
    D1 = d1(S, K, r, s, t)
    x = dN(D1)
    x /= S * s * math.sqrt(t)
    return x

def CallTheta(S, K, r, s, t):
    D1 = d1(S, K, r, s, t)
    D2 = d2(S, K, r, s, t)
    x = - S*dN(D1)*s
    x /= 2.0 * math.sqrt(t)
    x -= r*K*math.exp(-r*t)*N(D2)
    return x

def PutTheta(S, K, r, s, t):
    D1 = d1(S, K, r, s, t)
    D2 = d2(S, K, r, s, t)
    x = - S*dN(D1)*s
    x /= 2.0 * math.sqrt(t)
    x += r*K*math.exp(-r*t)*N(-D2)
    return x

def CallVega(S, K, r, s, t):
    D1 = d1(S, K, r, s, t)
    x = S*math.sqrt(t)*dN(D1)
    return x

def PutVega(S, K, r, s, t):
    D1 = d1(S, K, r, s, t)
    x = S*math.sqrt(t)*dN(D1)
    return x

def normal_strike(S, K, r, s, t):
    if s < 0.0000001:
        return 9999999999.9
    x = math.log(float(K)/S) - (r - (s*s)/2.0) * t
    x /= s * math.sqrt(t)
    return x

def stock_price_probability_below_K(S, K, r, s, t):
    t = max(t, 0.0001)
    s = max(s, 0.0001)
    K = max(K, 0.0001)
    return N(normal_strike(S, K, r, s, t))

def stock_price_dprobability_below_K(S, K, r, s, t):
    t = max(t, 0.0001)
    s = max(s, 0.0001)
    K = max(K, 0.0001)
    return dN(normal_strike(S, K, r, s, t))

def stock_price_dprobability_above_K(S, K, r, s, t):
    t = max(t, 0.0001)
    s = max(s, 0.0001)
    K = max(K, 0.0001)
    return dN(-normal_strike(S, K, r, s, t))

def CallProb(S, K, r, s, t):
    return 1.0 - stock_price_probability_below_K(S, K, r, s, t)

def CalldProb(S, K, r, s, t):
    return stock_price_dprobability_above_K(S, K, r, s, t)

def PutProb(S, K, r, s, t):
    return stock_price_probability_below_K(S, K, r, s, t)

def PutdProb(S, K, r, s, t):
    return stock_price_dprobability_below_K(S, K, r, s, t)

Call.delta = CallDelta
Call.gamma = CallGamma
Call.theta = CallTheta
Call.vega  = CallVega
Call.prob = CallProb
Call.dprob = CalldProb

Put.delta = PutDelta
Put.gamma = PutGamma
Put.theta = PutTheta
Put.vega  = PutVega
Put.prob = PutProb
Put.dprob = PutdProb

class Opcao(object):
    def __init__(this, papel, tipo, data):
        this.papel = papel
        this.tipo = {1: Call, 2: Put}[tipo]
        this.Spremio = data[0]
        this.SS = data[1]
        this.data = data[2:]
        this.originaldata = data[3:]
        this.stack = []
        old_s = this.s()
        this.update_volatility()
        if old_s != 0 and abs(this.s() - old_s) > 0.01:
            raise Exception("Informed implied volatility too different: %f x %f" % (old_s, this.s()))

    def dvc(this):
        tipo = 1
        if this.is_put():
            tipo = 2
        return {"K": this.K(), "s": this.s(), "r": this.r(), "t": this.t(), \
                "t_dias": this.t_dias(), "Sorig": this.S_orig(), "tipo": tipo,
                "premio": this.Spremio}

    def update_volatility(this):
        this.set_s(implied_volatility(this.tipo, this.Spremio, this.SS, *this.data))

    def premio(this, S=0):
        if S == 0:
            S = this.SS
        return this.tipo(S, *this.data)

    def premio_orig(this):
        return this.Spremio

    def delta(this, S=0):
        if S == 0:
            S = this.SS
        return tipo.delta(S, *this.data)

    def gamma(this, S=0):
        if S == 0:
            S = this.SS
        return tipo.gamma(S, *this.data)

    def theta(this, S=0):
        if S == 0:
            S = this.SS
        return tipo.theta(S, *this.data)

    def vega(this, S=0):
        if S == 0:
            S = this.SS
        return tipo.vega(S, *this.data)

    def p_exercicio(this, S, K):
        return this.tipo.prob(S, K, this.r(), this.s(), this.t())

    def dp_exercicio(this, S, K):
        return this.tipo.dprob(S, K, this.r(), this.s(), this.t())

    def S_orig(this):
        return this.SS

    def K(this):
        return this.data[0]

    def r(this):
        return this.data[1]

    def s(this):
        return this.data[2]

    def t(this):
        return this.data[3]

    def t_dias(this):
        return this.para_dia(this.t())

    def push(this):
        this.stack.append(this.data[:])

    def pop(this):
        this.data = this.stack.pop()

    def set_K(this, v):
        this.data[0] = v

    def set_r(this, v):
        this.data[1] = v

    def set_s(this, v):
        this.data[2] = v

    def set_t(this, v):
        this.data[3] = v

    def set_t_dias(this, v):
        this.set_t(this.para_ano(v))

    def para_dia(this, v):
        return v * 365.0

    def para_ano(this, v):
        return v / 365.0

    def is_put(this):
        return this.tipo is Put

    def is_call(this):
        return this.tipo is Call

testes = (
         (950.0, 1000.0, 0.09, 0.30, 30.0 / 365.0, 16.25, 58.88),
         (1000.0, 1000.0, 0.09, 0.30, 30.0 / 365.0, 37.99, 30.62),
         (1100.0, 1000.0, 0.09, 0.30, 30.0 / 365.0, 112.47, 5.10),
         (1100.0, 1000.0, 0.09, 0.30, 0.0 / 365.0, 100.0, 0.00),
         (900.0, 1000.0, 0.09, 0.30, 0.0 / 365.0, 0.0, 100.00),
         (1000.0, 1000.0, 0.09, 0.30, 0.0 / 365.0, 0.0, 0.00),
         )

for teste in testes:
    c = Call(*(teste[0:5]))
    p = Put(*(teste[0:5]))
    assert(abs(c - teste[5]) < 0.005)
    assert(abs(p - teste[6]) < 0.005)

def patch_for_fast():
    global Call, Put, N, d1, d2, dN
    import bsfast
    teste = testes[0][0:5]
    assert(abs(Call(*teste) - bsfast.Call(*teste)) < 0.000000001)
    assert(abs(Put(*teste) - bsfast.Put(*teste)) < 0.000000001)
    Call = bsfast.Call
    Put = bsfast.Put
    N = bsfast.N
    d1 = bsfast.d1
    d2 = bsfast.d2
    dN = bsfast.dN
