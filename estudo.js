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

function color_interpolate(pos)
{
    var i = 0;
    while (true) {
        c1 = cbase[i];
        c2 = cbase[i+1];
        if (c1[0] >= pos || pos <= c2[0]) {
            break;
        }
        i += 1;
    }
    pos = (pos - c1[0]) / (c2[0] - c1[0]);
    return _interpolate(c1[1], c2[1], pos);
}


function calc_cores(Tlist)
{
    if (Tlist.length <= 1) {
        return [ rgb(color_interpolate(1.0)) ];
    }

    cores = [];

    for (var i = 0; i < Tlist.length; ++i) {
        cores.push(rgb(color_interpolate(i / (Tlist.length - 1))));
    }

    return cores;
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
    var step = 2.0;
    if (t > 1) {
        step = Math.pow(2.0, (Math.log(t) / Math.log(2) / 3.75));
    }
    step = Math.max(2.0, step);
    while (t > 1) {
        Tlist.push(t);
        t = t / step;
    }
    Tlist.push(0);

    Sorig = mapa[papeis[0]].Sorig;
    Smin = Sorig * 0.9;
    Smax = Sorig * 1.1;
    Vmin = 99999.0;
    Vmax = -99999.0;
    cor = calc_cores(Tlist);

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

    graficos.push({"data": grafico, "color":"#d0d0d0",
                   "yaxis": 2, "label": "p = 000.00%"});

    var i = 0;

    for(var ti = 0; ti < Tlist.length; ++ti) {
        t = Tlist[ti];
        grafico = [];
        graficos.push({"color": cor[i],
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
}

function plota_graficos(dados)
{
    $('#graph').html("");

    if (dados.length <= 0) {
        return;
    }

    var cfg = {crosshair: { mode: "xy", color: "#c000c0" },
               grid: { hoverable: true, autoHighlight: false },
               zoom: {interactive: true},
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
