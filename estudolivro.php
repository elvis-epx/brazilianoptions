<? require "../lib.php"?>
<? aheader('', 3, '<link rel="stylesheet" type="text/css" href="estudolivro.css">'); ?>

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
<script type="text/javascript" src="estudo_common.js"></script>
<script type="text/javascript" src="estudolivro.js"></script>

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
<img id=throbber src="throbber.gif">
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
<div id="graph" style="width: 100%;"></div>
<div id="legarea" style="width: 100%;"></div>
<div style="position: absolute; top: 2em; left: 80%;">
<select name="faixa" id="faixa" onchange="muda_faixa(this);">
<option value="2" selected>±2%</option>
<option value="5" selected>±5%</option>
<option value="10">±10%</option>
<option value="15">±15%</option>
</select>
</div>
<div style="position: absolute; top: 3.5em; left: 80%;">
<select name="curvas" id="curvas" onchange="muda_nrcurvas(this);">
<option value="1">1 curva</option>
<option value="2">2 curvas</option>
<option value="3">3 curvas</option>
<option value="4">4 curvas</option>
<option value="5" selected>5 curvas</option>
<option value="6">6 curvas</option>
</select>
</div>
<div style="position: absolute; top: 5em; left: 80%;">
<select name="probal" id="probal" onchange="muda_probal(this);">
<option value="1" selected>Com probabilidade</option>
<option value="0">Sem probabilidade</option>
</select>
</div>
<div style="position: absolute; top: 8.2em; left: 65%;">
<span id="prazos" style="font-size: 88%">prazos</span>
</div>
<div style="position: absolute; top: 6.7em; left: 65%;">
<span id="data" style="font-size: 88%">data</span>
</div>


<? footer("/opc", "en"); ?>
