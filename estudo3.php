<?
header('Content-type: text/x-json');
$time_spot = "";
if ($_GET['p']) {
    $time_spot = $_GET['p'];
    $time_spot = preg_replace("/[^0-9]/", "", $time_spot);
}
if ($time_spot === "") {
    $time_spot = "current";
}
$handle = popen('./estudo.py items ' . $time_spot, 'r');
while ($read = fread($handle, 100000)) {
    echo $read;
}
echo $read;
pclose($handle);
?>
