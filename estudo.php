<? require "../lib.php"?>
<? aheader('Estudo gráfico de operações com opções', 1, '<link rel="stylesheet" type="text/css" href="estudo.css">'); ?>

<? 
$timespot = "current";
if ($_GET["p"]) {
    $timespot = $_GET["p"];
}
?>

<script>
var time_spot = "<? echo($timespot); ?>";
</script>

<!--[if IE]><script language="javascript" type="text/javascript" src="flot/excanvas.js"></script><![endif]-->
<script type="text/javascript" src="blackscholes.js"></script>
<script type="text/javascript" src="jquery.js"></script>
<script type="text/javascript" src="jquery.jstore-all.js"></script>
<script type="text/javascript" src="flot/jquery.flot.js"></script>
<script type="text/javascript" src="flot/jquery.flot.crosshair.js"></script>
<!-- <script type="text/javascript" src="flot/jquery.flot.navigate.js"></script> -->
<script type="text/javascript" src="estudo_common.js"></script>
<script type="text/javascript" src="estudo.js"></script>

<p>AVISO: este aplicativo é apenas um brinquedo, utiliza dados de fontes públicas e
gratuitas (Yahoo, CBLC e Bovespa), e executa grande parte da matemática no seu
navegador. Portanto, não nos responsabilizamos pela exatidão das informações,
nem pelo uso dos dados e gráficos em operações financeiras.

<div>
<table id='book'>
<tr>
<td><select class="acao" name="acao" id="acao" onchange="muda_acao();"></select></td>
<td><select class="serie" name="s1" id="s1" onchange="muda_serie(this);"></select></td>
<td><select class="strike" name="s1k" id="s1k" onchange="muda_strike(this);"></select></td>
<td><select class="qtde" name="s1kqtde" id="s1kqtde" onchange="muda_qtde(this);"></select></td>
<td><span id="s1kinfo">--</span></td>
</tr>
<tr>
<td rowspan=3 colspan=1>
<div id=throbber style="width: 32px; height: 32px;">
<img src="throbber.gif" alt="throbber">
</div>
</td>
<td><select class="serie" name="s2" id="s2" onchange="muda_serie(this);"></select></td>
<td><select class="strike" name="s2k" id="s2k" onchange="muda_strike(this);"></select></td>
<td><select class="qtde" name="s2kqtde" id="s2kqtde" onchange="muda_qtde(this);"></select></td>
<td><span id="s2kinfo">--</span></td>
</tr>
<tr>
<td><select class="serie" name="s3" id="s3" onchange="muda_serie(this);"></select></td>
<td><select class="strike" name="s3k" id="s3k" onchange="muda_strike(this);"></select></td>
<td><select class="qtde" name="s3kqtde" id="s3kqtde" onchange="muda_qtde(this);"></select></td>
<td><span id="s3kinfo">--</span></td>
</tr>
<tr>
<td><select class="serie" name="s4" id="s4" onchange="muda_serie(this);"></select></td>
<td><select class="strike" name="s4k" id="s4k" onchange="muda_strike(this);"></select></td>
<td><select class="qtde" name="s4kqtde" id="s4kqtde" onchange="muda_qtde(this);"></select></td>
<td><span id="s4kinfo">--</span></td>
</tr>
</table>
</div>
<br>
<div id="graph" style="margin-left: 6%; width: 85%;"></div>

<h3>Modo de usar</h3>

O estudo gráfico foi uma ferramenta desenvolvida para o livro "Ganhando 
dinheiro com opções" que escrevi em 2010. Uma explanação bastante completa
está no tópico 2.32 do livro. Vou copiá-la parcialmente aqui. A operação abaixo,
uma trava de alta, "fotografada" no final do dia 3/Jan/2013, será nossa cobaia:

<p style="text-align: center">
<img src="estudo_help.png" alt="Imagem de ajuda" style="width: 70%">

<p>
A trava de alta em estudo é PETRA20/PETRA22. Note como elas foram escolhidas nas
caixas de seleção (ação, série, strike). Como na trava de alta compramos
a opção baixa e vendemos a alta, escolhemos as proporções +1 e -1 respectivamente.
Numa trava de baixa PETRA20/22 apenas as proporções seriam invertidas, pois
venderíamos a baixa.

<p>
Também é possível estudar operações a seco, operações assimétricas, e mesmo
operações cobertas. A "série Z" na caixa de seleção é a ação subjacente.
Uma venda coberta ATM seria composta por PETRZ (na proporção +1) e PETRA20
(na proporção -1).

<p>
Ao lado de cada opção selecionada, são exibidos, nesta ordem: prêmio da opção
(o mais atual obtido pelo sistema), strike (K), volatilidade implícita (letra
grega sigma) e o prazo até o vencimento, em dias corridos.

<p>
O aspecto mais importante do gráfico é que ele mostra o <i>valor</i> da carteira.
A trava de alta custou 0,43 por opção para montar (0,51 da compra, menos 0,08 da venda).
Ganhamos dinheiro quando a operação <i>ganha valor</i>, de modo que possamos
desmontá-la com lucro.

<p>
O eixo horizontal (X) é o valor da ação subjacente (PETR4 no caso). Quando o gráfico
foi fotografado ela valia em torno de 19,80.

<p>
O eixo vertical (Y) é o valor da carteira estudada (trava de alta). A curva azul-escura
mostra o valor da carteira <i>no dia de hoje</i> em função de PETR4.

<p>
Exatamente no meio do gráfico, há uma linha vertical preta; é o valor de PETR4 no
momento da fotografia. O cruzamento desta linha com a curva azul-escura representa o
valor da carteira no mesmo momento: 0,43.

<p>
As demais curvas coloridas mostram o valor da carteira em momentos futuros, até chegar
ao vencimento (curva vermelha). A legenda na direita informa o número de dias correspondente
a cada cor (19 dias para azul-escuro, 4 dias para verde, e assim por diante). No vencimento
o valor da carteira é meramente a soma dos valores subjacentes das opções.

<p>Como pode ser visto, se PETR4 ficar abaixo de 20,00 a trava de alta não valerá nada
(e portanto os 0,43 gastos na montagem serão integralmente perdidos). PETR4 tem de
subir até perto de 20,50 para a trava apenas empatar no vencimento.

<p>
Por outro lado, se o objetivo do operador é desfazer a operação quando seu valor
atingir 0,65 (lucro de 50%), não é preciso esperar até o vencimento. Se PETR4
atingir 20,50 a 9 dias do vencimento, a curva azul-clara mostra que a operação
atingiria um valor aproximado de 0,65. Neste ponto o operador deveria desfazer,
porque se ele esperar até o vencimento, e PETR4 estagnar, o valor vai caindo
para abaixo de 0,60 (linha verde) até chegar em 0,50 (linha vermelha).

<p>
O gráfico não prevê o futuro, naturalmente. A ação subjacente (PETR4) vai oscilar
ao sabor do mercado, percorrendo um "caminho" dentro do gráfico, que vai se cruzando
em diferentes pontos com as diversas curvas de valor. Um "caminho" hipotético
está ilustrado na figura abaixo:

<p style="text-align: center">
<img src="estudo_help2.png" alt="Imagem de ajuda" style="width: 70%">

<p>
Neste "caminho" fantasioso, PETR4 oscilou muito pouco em 19 dias, subindo, descendo e
finalmente subindo a 20,00 no dia do vencimento. Infelizmente para o operador,
este caminho foi cruzando com valores cada vez menores, até chegar a zero.

<p>
As linhas violeta cruzadas são uma "mira" que segue o ponteiro do mouse. São úteis
para verificar um valor numérico exato. Conforme se move o ponteiro, os valores das
legendas no canto direito superior são atualizados. Na verdade, apenas a posição
horizontal é que importa.

<p>No exemplo acima, a "mira" está na posição horizontal correspondente à PETR4 valendo
19,15. Quando a ação subjacente apresenta este valor, o valor da operação será de:
0,23 a dezenove dias do vencimento; 0,10 a nove dias; 0,04 a 4 dias; 0,01 a dois dias
do vencimento, e vira pó no vencimento.

<p>
A curva cinza-clara que cruza o gráfico do canto esquerdo superior até o canto direito
inferior expressa a probabilidade da ação subjacente ficar acima de determinado valor.
Sua legenda é o eixo Y, lado direito, e vai de 0% a 100%.

<p>
Por exemplo, com a "mira" violeta em PETR4=19,15, a legenda da probabilidade mostra
um valor p=67,68%. Isto significa que a chance de PETR4 ficar <i>acima de 19,15 até
o vencimento</i> é de 67,68%. E portanto, a chance dela ficar <i>abaixo</i> de 19,15
até o vencimento é de 32,32%. (A soma das duas é, naturalmente, de 100%.)

<p>
Outro exemplo: vemos que a curva de probabilidade fica pouco acima de 10% para um valor
de 21,50 no eixo X. Isto significa que a chance de PETR4 fechar <i>acima de 21,50 no
vencimento</i> é de pouco mais de 10%. É a chance que a nossa trava de alta tem de
apresentar lucro realmente grande...

<p>
O principal aspecto deste gráfico, que nunca deve ser perdido de vista, é que ele
mostra <i>valor</i>, não lucratividade. A lucratividade aparece quando compramos
uma operação por um valor baixo e vendemos por um valor alto. Não necessariamente
nesta ordem.

<p>
Operações "vendidas" como trava de baixa apresentarão valores negativos. Isto é
normal. O valor negativo significa que recebemos dinheiro ao montar, mas pagamos
para sair. O melhor cenário de uma trava de baixa é a operação acabar com valor
zero, ou seja, as opções viram pó.

<p>
As curvas também permitem algumas inferências a respeito das "gregas". Numa
operação com theta negativo, como a trava de alta das ilustrações, as curvas
mais próximas ao vencimento ficam por baixo (ou seja, com valores progressivamente
menores). Curvas inclinadas para cima significam delta positivo. Curvas com
concavidade para cima (como uma bacia) significam gama positivo.

<? footer("/opc", "en"); ?>
