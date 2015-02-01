var calcwin = null;
var sd = null;

function export_calc(K, spread, S, t, s, r, cost)
{
    var tt = new Date();
    tt.setTime(tt.getTime() + t*365*24*60*60*1000);
    sd = [K, spread, S, tt, s*100.0, r*100.0, cost];
    if (! calcwin) {
        calcwin = window.open("https://epx.com.br/ctb/bscalc.php", target="_blank");
    } else {
        calc_senddata();
    }
    return false;
}

function calc_senddata()
{
    if (calcwin && calcwin.set_defaults && sd) {
        calcwin.set_defaults(sd[0], sd[1], sd[2], sd[3], sd[4], sd[5], sd[6], true);
    }
    sd = null;
}

function calc_closed()
{
    calcwin = null;
    sd = null;
}

function calc_opened()
{
    if (sd) {
        calc_senddata();
    }
}
