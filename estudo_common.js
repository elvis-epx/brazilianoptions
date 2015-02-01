var arvore = {};
var mapa = {};
var semaforo_calculo = 0;
var semaforo_throbber = 2;
var livro = null;
var infolivro = null;
var storage = null;
var nomes_opcoes = [];
var calc = null;
var ler_storage = null;
var gravar_storage = null;
var infos = null;
var RATIO = 5;

function suspende_calculo()
{
    ++semaforo_calculo;
}

suspende_calculo();

function libera_calculo()
{
    if (semaforo_calculo > 0) {
        --semaforo_calculo;
    }
}

function calculo_liberado()
{
    return semaforo_calculo <= 0;
}

function throbber(show)
{
    var semaforo_old = semaforo_throbber > 0;
    if (show) {
        ++semaforo_throbber;
        if (! semaforo_old) {
            $("#throbber").fadeIn();
        }
    } else if (semaforo_throbber > 0) {
        --semaforo_throbber;
        if (semaforo_old) {
            $("#throbber").fadeOut();
        }
    }
}

function muda_strike(sstrike)
{
    calc();
}

function muda_qtde(sqtde)
{
    calc();
}

function muda_serie(sserie)
{
    var serie = arvore[$(livro[0]).val()];
    if (! serie) {
        return;
    }
    var strikes = serie[$(sserie).val()];
    if (! strikes || ! strikes.data) {
        return;
    }

    suspende_calculo();

    var o = $("#"+$(sserie).attr('id')+"k").get(0);
    var old = $(o).val();
    if (! old) {
        old = strikes.default_strike;
    }

    $(o).children().remove().end();

    var listrikes = [];
    for(var val in strikes.data) {
        if (typeof val != "function") {
            listrikes.push("" + val);
        }
    }
    listrikes.sort();

    var i = 0;
    for (var j = 0; j < listrikes.length; ++j) {
        strike = listrikes[j];
        if (typeof strike != "function") {
            o.options[i++] = new Option(strike, strike);
            if (strike === old) {
                $(o.options[i-1]).attr('selected', 1);
            }
        }
    }
    muda_strike(o);

    libera_calculo();
    calc();
}

function muda_acao()
{
    var acao = $(livro[0]).val();
    var serie = arvore[acao];
    if (! serie) {
        return;
    }

    suspende_calculo();

    $(".strike").each(function() {
        $(this).children().remove().end();
    });

    $(".serie").each(function() {
        var o = this;
        var old = $(o).val();
        var i = 0;
        $(o).children().remove().end();
        liserie = [];
        for (var val in serie) {
            if (typeof val != "function") {
                liserie.push(val);
            }
        }
        liserie.sort();
        for (var j = 0; j < liserie.length; ++j) {
            val = liserie[j];
            o.options[i++] = new Option(val, val);
            if (val === old) {
                $(o.options[i-1]).attr('selected', 1);
            }
        }
        muda_serie(o);
    });

    libera_calculo();
    calc();
}

calc = function()
{
    if (! calculo_liberado()) {
        return;
    }

    compactar();

    var params = {};
    params.qtdes = [];
    params.papeis = [];
    for (var i = 0; i < infolivro.length; ++i) {
        if (! nomes_opcoes[i]) {
            continue;
        }
        var qtde = $("#s" + (i+1) + "kqtde");
        if (! qtde) {
            continue;
        }
        qtde = parseInt($(qtde).val(), 10);
        if (! qtde) {
            continue;
        }
        params.papeis.push(nomes_opcoes[i]);
        params.qtdes.push(qtde);
    }

    dados = mastigar(params);
    plota_graficos(dados);
    infos();
    gravar_storage();
    return true;
};

function init()
{
    livro = [$('#acao').get(0),
            $('#s1').get(0), $('#s1k').get(0), $('#s1kqtde').get(0),
            $('#s2').get(0), $('#s2k').get(0), $('#s2kqtde').get(0),
            $('#s3').get(0), $('#s3k').get(0), $('#s3kqtde').get(0),
            $('#s4').get(0), $('#s4k').get(0), $('#s4kqtde').get(0)];
    infolivro = [$('#s1kinfo').get(0), $('#s2kinfo').get(0),
                 $('#s3kinfo').get(0), $('#s4kinfo').get(0)];

    var n = 0;
    var i = 0;

    $('.qtde').each(function() {
        for(i = -RATIO; i <= RATIO; ++i) {
            var o = new Option(""+i, ""+i);
            if (i === 0) {
                $(o).attr('selected', 'true');
            }
            this.options[i+5] = o;
        }
    });

    i = 0;
    liacoes = [];
    for (var acao in arvore) {
        if (typeof acao != "function") {
            liacoes.push(acao);
            var Oacao = arvore[acao];
            for (var serie in Oacao) {
               if (typeof serie != "function") {
                   var Oserie = Oacao[serie].data;
                    for (var strike in Oserie) {
                        if (typeof strike != "function") {
                            mapa[acao + serie + strike] = Oserie[strike];
                        }
                    }
                }
            }
        }
    }
    liacoes.sort();
    for (var j = 0; j < liacoes.length; ++j) {
        nome = liacoes[j];
        livro[0].options[i++] = new Option(nome, nome);
    }

    muda_acao();
}

function init3()
{
    libera_calculo();
    libera_calculo();

    jQuery.extend(jQuery.jStore.defaults,
              {project: 'estudoopcoes',
               flash: 'jStore.Flash.html'});
    jQuery.jStore.load();
}

infos = function()
{
    for (var i = 0; i < infolivro.length; ++i) {
        $(infolivro[i]).html("");
    }

    for (i = 0; i < infolivro.length; ++i) {
        var codigo = nomes_opcoes[i];
        if (! codigo) {
            continue;
        }
        var info = mapa[codigo];
        if (! info) {
            continue;
        }
        $(infolivro[i]).html("$" + info.premio.toFixed(2) + "&nbsp;&nbsp;&nbsp;" + 
                             "K=" + info.K.toFixed(2) + "&nbsp;&nbsp;&nbsp;σ=" +
                             (info.s * 100.0).toFixed(1) + "%&nbsp;&nbsp;&nbsp;" +
                             info.t_dias.toFixed(0) + "d");
    }
};

ler_storage = function(engine)
{
    if (! engine) {
        return;
    }

    storage = engine;

    var dados = storage.get("opcoes");
    if (! dados) {
        return;
    }
    if (dados.length != livro.length) {
        return;
    }

    suspende_calculo();

    $(livro[0]).val(dados[0]);
    muda_acao();
    for(var i = 1; i < livro.length; i += 3) {
        $(livro[i]).val(dados[i]);
        muda_serie(livro[i]);
        $(livro[i+1]).val(dados[i+1]);
        muda_strike(livro[i+1]);
        $(livro[i+2]).val(dados[i+2]);
        muda_qtde(livro[i+2]);
    }

    libera_calculo();
    calc();
};


gravar_storage = function()
{
    if (! calculo_liberado()) {
        return;
    }

    if (! storage) {
        return;
    }

    var dados = [];

    for (item in livro) {
        if (typeof item != "function") {
            var s = livro[item];
            dados.push($(s).val());
        }
    }

    storage.set("opcoes", $.toJSON(dados));
};

function calcula_nomes_opcoes(zeros)
{
    var acao = $(livro[0]).val();

    // guardar nomes para referencia qdo voltar os infos da opcao
    nomes_opcoes = [];

    var params = "";
    for (var i = 0; i < infolivro.length; ++i) {
        nomes_opcoes[i] = "";
        if (! acao || acao.length != 4) {
            continue;
        }
        var serie = $("#s" + (i+1)).val();
        if (! serie || serie.length != 1) {
            continue;
        }
        var strike = $("#s" + (i+1) + "k").val();
        if (! strike || strike.length != 2) {
            continue;
        }
        if (! zeros) {
            var qtde = parseInt($("#s" + (i+1) + "kqtde").val(), 10);
            if (! qtde) {
                continue;
            }
        }
        var nome = acao + serie + strike;
        nomes_opcoes[i] = nome;
    }
}

// FIXME: compactar valores que não são relativamente primos

function compactar2()
{
    calcula_nomes_opcoes(true);

    for (var i = infolivro.length - 1; i >= 0; --i) {
        var alto = nomes_opcoes[i];
        for (var j = i - 1; j >= 0; --j) {
            var baixo = nomes_opcoes[j];

            if (baixo === alto) {
                // coincidentes; compactar
                var qalto = $("#s" + (i+1) + "kqtde");
                var qbaixo = $("#s" + (j+1) + "kqtde");
                var qtdenova = parseInt(qalto.val(), 10) +
                               parseInt(qbaixo.val(), 10);
                if (qtdenova >= -RATIO && qtdenova <= RATIO) {
                    qbaixo.val("" + qtdenova);
                }
                qalto.val("0");
                nomes_opcoes[i] = "VOID!";
                alto = "VOID!";
                break;
            }
        }
    }

    calcula_nomes_opcoes(false);
}

function compactar()
{
    compactar2();
}

$(document).ready(function() {
    redimensionado();
    window.onresize = redimensionado;
    var url = "estudo3.php";
    if (time_spot) {
        url += "?p=" + time_spot;
    }
    $.getJSON(url, function (dados) {
        if (dados.err) {
            alert(dados.err);
        } else {
            arvore = dados;
            init();
            init2();
            init3();
        }
        throbber(false);
    });
});

jQuery.jStore.ready(function(engine) {
    jQuery.jStore.flashReady(function(){
        engine.ready(function() {
            ler_storage(this);
            throbber(false);
        });
    });
    engine.ready(function() {
        ler_storage(this);
        throbber(false);
    });
});


