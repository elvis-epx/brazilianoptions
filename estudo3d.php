<? require "../lib.php"?>
<? aheader('Graphical 3D study of Brazilian options', 3, '<link rel="stylesheet" type="text/css" href="estudo.css">'); ?>

<? 
$timespot = "current";
if ($_GET["p"]) {
    $timespot = $_GET["p"];
}
?>

<script>
var time_spot = "<? echo($timespot); ?>";
</script>

<script type="text/javascript" src="blackscholes.js"></script>
<script type="text/javascript" src="jquery.js"></script>
<script type="text/javascript" src="jquery.jstore-all.js"></script>
<script type="text/javascript" src="sylvester.js"></script>
<script type="text/javascript" src="glCompat.js"></script>
<script type="text/javascript" src="glUtils.js"></script>

<script type="text/javascript" src="estudo_common.js"></script>
<script type="text/javascript" src="estudo3d.js"></script>

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
<canvas id="arena" style="border: none;" width="800" height="500"></canvas>
<button name="Back" type=submit onClick="resetCamera();">Reset camera</button>
<br>
Choose a non-zero quantity for at least one option, at rightmost combo,
in order to plot the graph.
Use the arrows and PgUp/PgDn to navigate. The 3D code is based on
"Learning WebGL" examples at
<a href="http://learningwebgl.com/blog/">http://learningwebgl.com/blog/</a>.

<? footer("/opc", "en"); ?>
