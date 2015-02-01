Instruções resumidas - gerador de volatilidades implícitas de opções
--------------------------------------------------------------------


FUNCIONAMENTO BASICO
--------------------

O gerador é um conjunto de scripts que pega dados de diversas fontes,
e gera uma página Web com diversos dados a respeito de opções, inclusive
suas volatilidades implícitas.

Uma vez configurado o ambiente, o gerador é bastante auto-suficiente, ele
foi desenvolvido para funcionar sem necessidade de intervenção. Apenas
mudanças no rol de opções exigem alterações nos scripts.

O uso 'normal' do gerador consiste simplesmente em rodar o script
volatimp_cblc.sh uma vez por dia, e depois rodar o script volatimp.sh
periodicamente, para atualizar a página Web (volatimp.php) com as
cotações mais recentes.

O script volatimp_cblc.sh, como o nome sugere, obtém um arquivo da CBLC
que contém alguns dados das séries de opções autorizadas (strike,
data de vencimento, ticket, entre outras). Ele também roda o programa
calcvol.py, que obtém a série histórica das ações subjacentes via
Yahoo, com o objetivo de calcular a volatilidade histórica.

O script volatimp.sh não faz muito mais que invocar o programa volatimp.py,
que por sua vez obtém as cotações mais recentes das opções (via site
Bovespa) e gera a página 'volatimp.php', além de um arquivo-texto com os
mesmos dados.


FONTES DE INFORMAÇÃO
--------------------

Conforme foi dito, são utilizadas as seguintes fontes: CBLC, Yahoo e
site Bovespa. Das três, a única "oficial" e confiável é a CBLC. As
outras duas são serviços livres, com atraso variável e que podem sair
do ar a qualquer momento.

Em particular a obtenção de cotações de opções via site Bovespa é um
truque "sujo", e que falha bastante. O ideal para um uso "sério" deste
gerador seria utilizar uma fonte de dados mais confiável (provavelmente
paga). Isto implicaria em modificar os programas calcvol.py e volatimp.py.


COMO CONFIGURAR AS OPÇÕES/SÉRIES QUE VÃO PARA A PÁGINA
------------------------------------------------------

É preciso modificar os scripts calcvol.py e volatimp.py. Ambos têm uma
tabela de ações subjacentes (e.g. PETR4, VALE5). As opções destas ações
é que vão aparecer na página final.

Por padrão, 2 séries de opções (deste mês e do próximo) são exibidas.
O dia do vencimento é determinado automaticamente. Se quiser mais
séries futuras, mude a variável 'meses', logo no início do programa
calcvol.py


TAXA DE JUROS
-------------

A taxa de juros também é obtida automaticamente do site do Banco central
pelo script taxajuros.py, e armazenada no arquivo taxajuros.txt. Caso haja
problemas com o script, a última taxa contida em taxajuros.txt é
utilizada.


ESTUDO GRÁFICO
--------------

Além das volatilidades implícitas, há uma página de estudo gráfico das opções,
que mostra como o valor do prêmio vai comportar-se conforme vai chegando o
vencimento. Permite também 'montar' operações com diversas opções e ver
o comportamento do conjunto todo.

Este estudo (página estudo.php) depende do arquivo-texto 'opcoes.txt', que
também é gerado pelo programa 'volatimp.py'.

Os scripts volatimp_cblc.sh e volatimp.sh também encarregam-se de salvar versões
antigas de todos os arquivos gerados, de forma a ser possível analisar cenários
passados.

Se o gerador de volatilidades implícitas estiver funcionando bem, o estudo também
deverá funcionar ok.

Há diversas versões do estudo gráfico:

estudo.php: padrão.

estudolivro.php: permite passar um parâmetro que lê versões antigas do arquivo
opcoes.txt. Isto é interessante quando é necessário gerar sempre o mesmo
gráfico de forma estável, ou quando quisermos consultar um estudo passado
(ou seja, baseado numa situação de mercado passada).

Como o próprio nome sugere, utilizei esta versão para gerar os gráficos contidos
em meu livro "Ganhando dinheiro com opções".

estudo3d.php: tentativa de fazer o gráfico em 3D em vez de usar diversas linhas

estudovenda.php: estudo com opções de venda simuladas.


TECNOLOGIA
----------

Todo o gerador foi escrito utilizando linguagens interpretadas. Ao todo,
quatro linguagens foram usadas: Python, PHP, Javascript e Shell;
cada uma onde mais bem desempenha seu papel.

Os scripts volatimp_cblc.sh e volatimp.sh são escritos em Shell, e foram
feitos para serem executados periodicamente (crontab). Se você quiser
portar o gerador para Windows, deverá traduzir estes scripts para alguma
tecnologia de scripting do Windows (que eu não conheço, mas existe).


VERSÕES ANTIGAS
---------------

Como já foi dito, os scripts Shell salvam versões antigas de todos os
arquivos gerados, para consulta posterior.

Para que não haja conflitos, cada arquivo "velho" tem um nome único,
baseado na data e hora.

Por exemplo, o arquivo 'opcoes.txt' gerado no dia 30/09/2011 às 15:13
é copiado para opcoes.txt.201109301513.

Desde que o script 'volatimp.sh' não seja rodado mais que uma vez por
minuto, o esquema guarda toda a informação antiga. (E se for necessário
rodá-lo mais que uma vez por minuto, é fácil modificar o script para
que ele guarde arquivos com precisão de segundo ou centésimo.)

Os arquivos gerados pelo script volatimp_cblc.sh levam apenas a data,
não a hora, porque são gerados apenas uma vez por dia, e (presumo)
seus dados nunca mudam durante o dia.



LISTA DE ARQUIVOS
-----------------

volatimp_cblc.sh	Script que obtém o arquivo CBLC e chama calcvol.py (volatilidades opções)
			e também obtém a taxa de juros
calcvol.py		Programa que calcula volatilidades das ações
volatilidades.txt	Volatilidades das ações, calculadas por calcvol.py
volatilidades.txt.*	Versões antigas do arquivo acima
cblc.txt		Arquivo com dados das opções, obtido da CBLC
cblc.txt.*		Versões antigas do arquivo CBLC
taxajuros.txt		Taxa-base de juros
taxajuros.txt.*		Versões antigas do arquivo de juros

volatimp.sh		Script que chama volatimp.py (volatilidades implícitas)
volatimp.py		Programa que calcula volatilidades implícitas das opções
			e gera a página 'volatimp.php'

taxajuros.py		Script que obtém a taxa de juros e preenche taxajuros.txt.

blackscholes.py		Módulo auxiliar aos programas acima (Black-Scholes)
ystockquote.py		Idem (Serve para obter série histórica das ações via Yahoo!)
volatimp.js		Script auxiliar da página volatimp.php

volatimp.php		A página de volatilidades implícitas de opções

volatimp.*.php		Cópias antigas da página acima. O script volatimp.sh
			guarda um arquivo com data/hora de cada página gerada.

opcoes.txt		Arquivo com dados (gregas etc.) das opções. Este arquivo
			é gerado para alimentar o estudo gráfico (visto mais abaixo)

opcoes.txt.*		Cópias antigas do arquivo opcoes.txt. Serve para o estudo
			gráfico e também pode servir para análise posterior dos dados
			(algotrading etc.)

*.pyc			Tipo de arquivo gerado ao executar um programa .py
			(pode ser ignorado ou apagado)

arp.css			Arquivo auxiliar da página volatimp.php
bs.css			Idem
lib.php			Idem

Daqui para frente, os arquivos não têm mais relação direta com a página
de volatilidades implícitas.

estudo.php		Página de estudo gráfico de opções
			Faz uso dos dados de 'opcoes.txt', gerados pelo
			script volatimp.py.

estudo_common.js	Arquivo auxiliar da página estudo.php
estudo.js		Idem
estudo.css		Idem
estudo.py		Invocado para obter os dados de 'opcoes.txt'
estudo3.php		Trampolim PHP para invocar estudo.py

blackscholes.js		Arquivo auxiliar da página estudo.php
throbber.gif		Idem
jquery.js		Biblioteca jQuery
jquery.jstore-all.js	Plug-in jStore para jQuery
flot			Plug-in flot para jQuery (gerador de gráficos)

estudo3d.php		Estudo gráfico em 3D (ou pelo menos uma tentativa)
estudo3d.fshader	Arquivo auxiliar do estudo 3D
estudo3d.js		Idem
estudo3d.vshader	Idem
estudo3d.wad		Idem

estudolivro.php		Estudo gráfico, pode ler versões antigas dos arquivos
			de modo a obter sempre o mesmo gráfico (já que o
			arquivo mais atual está sempre sendo atualizado)
estudolivro.js		Arquivo auxiliar do estudo acima

estudovenda.php		Estudo gráfico para opções de venda
estudovenda.js		Arquivo auxiliar do estudo acima
estudovenda.py		Idem
estudovenda3.php	Idem
estudovenda_common.js	Idem

stwatchdog.py		Protótipo de robô para monitorar 'stops'
