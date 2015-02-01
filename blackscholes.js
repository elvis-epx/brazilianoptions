// ## -*- coding: utf-8 -*-

/*jslint browser:true, sub:true, white:false */

// Taken from book "Black Scholes and Beyond"

var kd1 = 0.0498673470;
var kd3 = 0.0032776263;
var kd5 = 0.0000488906;
var kd2 = 0.0211410061;
var kd4 = 0.0000380036;
var kd6 = 0.0000053830;

function normdistacum(x)
{
    if (x < 0) {
        return 1 - normdistacum(-x);
    }
    var n = 1.0 - 0.5*Math.pow(1 + kd1*x + kd2*Math.pow(x,2) + kd3*Math.pow(x,3) + kd4*Math.pow(x,4) + kd5*Math.pow(x,5) + kd6*Math.pow(x,6),-16);
    return n;
}

function normdist(x)
{
    var n = Math.exp(-(Math.pow(x,2)/2));
    n /= Math.pow((2*Math.PI),0.5);
    return n;
}

function d1(spot, strike, interest, time, volatility)
{
    if (volatility < 0.0000001) {
        return 9999999999.9;
    }
    var x = Math.log(spot/strike) + (interest + Math.pow(volatility,2)/2) * time;
    x /= volatility * Math.pow(time, 0.5);
    return x;
}

function d2(spot, strike, interest, time, volatility)
{
    var x = d1(spot, strike, interest, time, volatility) - volatility*Math.pow(time,0.5);
    return x;
}

function opremium(spot, strike, interest, time, volatility)
{
    if (time < 0.1 / 365) {
        return Math.max(spot - strike, 0);
    }
    var D1 = d1(spot, strike, interest, time, volatility);
    var nd1 = normdistacum(D1);
    var D2 = d2(spot, strike, interest, time, volatility);
    var nd2 = normdistacum(D2);
    return nd1*spot - Math.exp(-interest*time)*nd2*strike;
}

function putzopremium(spot, strike, interest, time, volatility)
{
    if (time < 0.1 / 365) {
        return Math.max(strike - spot, 0);
    }
    var D1 = d1(spot, strike, interest, time, volatility);
    var nd1 = normdistacum(-D1);
    var D2 = d2(spot, strike, interest, time, volatility);
    var nd2 = normdistacum(-D2);
    return -nd1*spot + Math.exp(-interest*time)*nd2*strike;
}


function odelta(spot, strike, interest, time, volatility)
{
    var x = normdistacum(d1(spot, strike, interest, time, volatility));
    return x;
}

function putzodelta(spot, strike, interest, time, volatility)
{
    var x = normdistacum(d1(spot, strike, interest, time, volatility)) - 1;
    return x;
}

function ogamma(spot, strike, interest, time, volatility)
{
    var D1 = d1(spot, strike, interest, time, volatility);
    var x = (D1);
    x /= spot * volatility * Math.pow(time, 0.5);
    return x;
}

function putzogamma(spot, strike, interest, time, volatility)
{
    var D1 = d1(spot, strike, interest, time, volatility);
    var x = normdist(D1);
    x /= spot * volatility * Math.pow(time, 0.5);
    return x;
}

function otheta(spot, strike, interest, time, volatility)
{
    var D1 = d1(spot, strike, interest, time, volatility);
    var D2 = d2(spot, strike, interest, time, volatility);
    var x = - spot*normdist(D1)*volatility;
    x /= 2*Math.pow(time, 0.5);
    x -= interest*strike*Math.exp(-interest*time)*normdistacum(D2);
    return x;
}

function putzotheta(spot, strike, interest, time, volatility)
{
    var D1 = d1(spot, strike, interest, time, volatility);
    var D2 = d2(spot, strike, interest, time, volatility);
    var x = - spot*normdist(D1)*volatility;
    x /= 2*Math.pow(time, 0.5);
    x += interest*strike*Math.exp(-interest*time)*normdistacum(-D2);
    return x;
}

function ovega(spot, strike, interest, time, volatility)
{
    var D1 = d1(spot, strike, interest, time, volatility);
    var x = spot*Math.sqrt(time)*normdist(D1);
    return x;
}

function putzovega(spot, strike, interest, time, volatility)
{
    var D1 = d1(spot, strike, interest, time, volatility);
    var x = spot*Math.sqrt(time)*normdist(D1);
    return x;
}

function orho(spot, strike, interest, time, volatility)
{
    var D2 = d2(spot, strike, interest, time, volatility);
    var x = strike*time*Math.exp(-interest*time)*normdistacum(D2);
    return x;
}

function putzorho(spot, strike, interest, time, volatility)
{
    var D2 = d2(spot, strike, interest, time, volatility);
    var x = -strike*time*Math.exp(-interest*time)*normdistacum(-D2);
    return x;
}


function normal_strike(spot, strike, interest, time, volatility)
{
    // Returns a normalized strike price, with average=0 and standard dev=1
    if (volatility < 0.0000001) {
        return 9999999999.9;
    }
    var x = Math.log(strike/spot) - (interest - Math.pow(volatility,2)/2) * time;
    x /= volatility*Math.pow(time,0.5);
    return x;
}

function stock_price_probability(strike1, strike2, spot, interest, volatility, time)
{
    time = Math.max(time, 0.0001);
    volatility = Math.max(volatility, 0.001);
    strike1 = Math.max(strike1, 0.01);
    strike2 = Math.max(strike2, 0.01);
    var prob1 = normdistacum(normal_strike(spot, strike1, interest, time, volatility));
    var prob2 = normdistacum(normal_strike(spot, strike2, interest, time, volatility));
    return prob2 - prob1;
}

function stock_price_probability_max(spread, spot, interest, volatility, time)
{
    // Determines the maximum probability that stock_price_probability() will return,
    // given a spread between strike prices (strike1 and strike2)

    // strike = average of expected future price
    var strike = spot*Math.exp((interest - Math.pow(volatility,2)/2)*time);
    var p = stock_price_probability(strike-spread, strike+spread, spot, interest, volatility, time);
    return p;
}

function to_days(r)
{
    return r * 365.0;
}

function to_years(r_days)
{
    return r_days / 365.0;
}
