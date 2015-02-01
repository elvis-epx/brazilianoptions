<?
header('Content-type: text/x-json');
$handle = popen('./estudovenda.py', 'r');
while ($read = fread($handle, 100000)) {
    echo $read;
}
echo $read;
pclose($handle);
?>
