var faixa = 0.05;
var probal = true;
var ncurvas = 5;

function hex(dec_cor)
{
    var h = Math.max(0, Math.min(Math.round(dec_cor * 256), 255)).toString(16);
    while (h.length < 2) {
        h = "0" + h;
    }
    return h;
}

function rgb(cor)
{
    var res = "#" + hex(cor[0]) + hex(cor[1]) + hex(cor[2]);
    return res;
}

var cbase = [[0.00, [0.0, 0.00, 1.0]],
             [0.25, [0.0, 0.85, 0.85]],
             [0.50, [0.0, 0.65, 0.0]],
             [0.75, [1.0, 1.00, 0.0]],
             [1.001, [1.0, 0.00, 0.0]]];

function _interpolate(c1, c2, pos)
{
    return [c1[0] * (1.0 - pos) + c2[0] * pos,
            c1[1] * (1.0 - pos) + c2[1] * pos,
            c1[2] * (1.0 - pos) + c2[2] * pos];
}

function calc_dash(Tlist)
{
    dash = [];

    for (var i = Tlist.length - 1; i > 0; --i) {
        var sp = (i - 1) * 6 + 2;
        dash.push([sp, sp * 0.6]);
    }

    dash.push([1, 0]);

    return dash;
}

function mastigar(params)
{
    var graficos = [];

    var papeis = params.papeis;
    var qtdes = params.qtdes;

    if (papeis.length <= 0) {
        return graficos;
    }

    // pega opcao com menor numero de dias para vencimento
    var t = 99999;
    for(var pi = 0; pi < papeis.length; ++pi) {
        var papel = papeis[pi];
        var opcao = mapa[papel];
        t = Math.min(t, opcao.t_dias);
    }

    if (t > 3650) {
        t = 0;
    }

    var t_inicial = t;
    var Tlist = [];

    if (ncurvas > 1) {
        if (t > 3 * ncurvas) {
            step = Math.pow(2.0, (Math.log(t) / Math.log(2) / (ncurvas - 1)));
            step = Math.max(2.0, step);
            while (t > 2) {
                Tlist.push(t);
                t = t / step;
            }
        } else if (t > ncurvas) {
            step = t / ncurvas;
            while (t > 1) {
                Tlist.push(t);
                t = t - step;
            }
        } else if (t > 0) {
            Tlist.push(t);
        }
    }
    Tlist.push(0);

    Sorig = mapa[papeis[0]].Sorig;
    Smin = Sorig * (1 - faixa);
    Smax = Sorig * (1 + faixa);
    Vmin = 99999.0;
    Vmax = -99999.0;
    dash = calc_dash(Tlist);

    var grafico = [];
    Step = (Smax - Smin) / 40.0 - 0.00001;
    S = Smin;
    while (S < Smax) {
        var y = stock_price_probability(0, S, Sorig,
                                        mapa[papeis[0]].r,
                                        mapa[papeis[0]].s,
                                        mapa[papeis[0]].t) * 100;
        if (mapa[papeis[0]].tipo === 1) {
            y = 100 - y;
        }
        grafico.push([Math.round(S*100)/100, y]);
        S += Step;
    }

    if (probal) {
    graficos.push({"dashPattern": [1, 10], "data": grafico, "color": "#000000",
                   "yaxis": 2, "label": "p = 000.00%"});
    }

    var prazos = "";
    for(var ti = 0; ti < Tlist.length; ++ti) {
        var t = Tlist[ti];
        if (prazos.length > 0) {
            prazos += ", ";
        }
        prazos += "" + Math.round(t);
    }
    prazos += " dias até vencimento";

    $("#prazos").text(prazos);

    var i = 0;

    for(ti = 0; ti < Tlist.length; ++ti) {
        t = Tlist[ti];
        grafico = [];
        graficos.push({"color": "#000000",
                       "dashPattern": dash[i],
                       "label": Math.round(t) + "d = 000.00",
                       "data": grafico});
        i += 1;
        S = Smin;

        while (S < Smax) {
            var premio = 0;
            for (pi = 0; pi < papeis.length; ++pi) {
                papel = papeis[pi];
                opcao = mapa[papel];
                var t_dias = 0;
                if (papel.charAt(4) != 'Z') {
                    t_dias = opcao.t_dias - (t_inicial - t);
                }
                if (opcao.tipo === 1) {
                    premio += opremium(opcao.Sorig + (S - Sorig), opcao.K,
                                       opcao.r, to_years(t_dias), opcao.s) * qtdes[pi];
                } else {
                    premio += putzopremium(opcao.Sorig + (S - Sorig), opcao.K,
                                       opcao.r, to_years(t_dias), opcao.s) * qtdes[pi];
                }
            }

            grafico.push([Math.round(S*100)/100, Math.round(premio*100)/100]);
            S += Step;
            Vmax = Math.max(Vmax, premio);
            Vmin = Math.min(Vmin, premio);
        }
    }

    if (Vmin >= 0 && Vmin <= 1) {
        Vmin = -0.01;
    } if (Vmax <= 0 && Vmax >= -1) {
        Vmax = 0.01;
    }

    graficos.push({"data": [[Sorig, Vmin], [Sorig, Vmax]], "color": "#404040",
                     "label": "@000.00"});
    return graficos;
}

var plot = null;
var updateLegendTimeout = null;
var latestPosition = null;
var legends = null;

function cleanLegend()
{
    if (! updateLegendTimeout && plot) {
        var dataset = plot.getData();
        for (var i = 0; i < legends.length; ++i) {
            var series = dataset[i];
            legends.eq(i).text(series.label.replace("= 000.00", "").replace("000.00", ""));
        }
    }
}

function prepara_legendas()
{
    legends = $("#graph .legendLabel");
    legends.each(function () {
        // fix the widths so they don't jump around
        $(this).css('width', $(this).width());
    });

    updateLegendTimeout = null;
    latestPosition = null;
    setTimeout(cleanLegend, 10);
}

function updateLegend()
{
    updateLegendTimeout = null;

    if (! plot) {
        return;
    }

    var pos = latestPosition;

    if (! pos) {
        return;
    }

    var axes = plot.getAxes();
    if (pos.x < axes.xaxis.min || pos.x > axes.xaxis.max || pos.y <
        axes.yaxis.min || pos.y > axes.yaxis.max) {
        return;
    }

    var i, j, dataset = plot.getData();
    for (i = 0; i < dataset.length - 1; ++i) {
        var series = dataset[i];

        // find the nearest points, x-wise
        for (j = 1; j < series.data.length; ++j) {
            if (series.data[j][0] > pos.x) {
                break;
            }
        }

        // now interpolate
        var y, p1 = series.data[j - 1], p2 = series.data[j];
        if (p1 === null) {
            y = p2[1];
        } else if (p2 === null) {
            y = p1[1];
        } else {
            y = p1[1] + (p2[1] - p1[1]) * (pos.x - p1[0]) / (p2[0] - p1[0]);
        }

        legends.eq(i).text(series.label.replace("000.00", y.toFixed(2)));
    }
    i = dataset.length - 1;
    var se = dataset[i];
    legends.eq(i).text(se.label.replace("000.00", pos.x.toFixed(2)));
}

function init2()
{
    $("#graph").bind("plothover", function (event, pos, item) {
       latestPosition = pos;
       if (! updateLegendTimeout) {
          updateLegendTimeout = setTimeout(updateLegend, 50);
       }
    });

    $("#graph").bind("plotpan", function (event, plot) {
        prepara_legendas();
    });

    $("#graph").bind("plotzoom", function (event, plot) {
        prepara_legendas();
    });

    var dat = "";
    if (time_spot && time_spot !== "current") {
        var hora = parseInt(time_spot.substr(8, 2), 10);
        var dia = parseInt(time_spot.substr(6, 2), 10);
        var mes = parseInt(time_spot.substr(4, 2), 10);
        if (mes > 2 || (mes == 2 && dia > 20)) {
            fuso = -3;
        } else {
            fuso = -2;
        }
        hora += fuso;
        dat = "Snapshot " + time_spot.substr(6, 2) + "/" +
            time_spot.substr(4, 2) + "/" + time_spot.substr(2, 2) + " aprox. " +
            hora.toFixed(0) + ":" + time_spot.substr(10, 2);
    }
    $("#data").text(dat);
}

function plota_graficos(dados)
{
    $('#graph').html("");

    if (dados.length <= 0) {
        return;
    }

    var cfg = {crosshair: { mode: "xy", color: "#c000c0" },
               grid: { hoverable: true, autoHighlight: false, color: "#000000",
                      tickColor: "#000000"},
               zoom: {interactive: true},
               lines: {lineWidth: 4}, 
               legend: {show: false, backgroundColor: "#ffffff", backgroundOpacity: 1.0},
               pan: {interactive: true},
               y2axis: {min: 0.0}};

    plot = $.plot($("#graph"), dados, cfg);

    prepara_legendas();
}

function redimensionado()
{
    $('#graph').html("");
    $('#graph').height($('#graph').width() / 16 * 10);
    calc();
}

function muda_faixa(sfaixa)
{
    var f = $(sfaixa).val();
    faixa = f / 100.0;
    calc();
}

function muda_probal(sprobal)
{
    var f = $(sprobal).val();
    probal = f == 1;
    calc();
}

function muda_nrcurvas(scurvas)
{
    var f = $(scurvas).val();
    ncurvas = f;
    calc();
}

