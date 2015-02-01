#!/bin/sh

# cd /folder
STAMP=$(date '+%Y%m%d')

# Calculate historical volatility 
./calcvol.py > volatilidades.txt
# cp volatilidades.txt volatilidades.txt.$STAMP

./taxajuros.py
# cp taxajuros.txt taxajuros.txt.$STAMP

# Get options database
rm -f SEDE9999.txt
if wget http://www.cblc.com.br/cblc/consultas/Arquivos/SEDE9999.txt >/dev/null 2>&1; then
	mv -f SEDE9999.txt cblc.txt
	# cp cblc.txt cblc.txt.$STAMP
else
	echo "Could not download option database from CBLC"
fi
