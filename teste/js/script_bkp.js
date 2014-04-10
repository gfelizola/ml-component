if (!String.prototype.format) {
    String.prototype.format = function() {
        var args = arguments;
        return this.replace(/{(\d+)}/g, function(match, number) {
            return typeof args[number] != 'undefined' ? args[number] : match;
        });
    };
}

$(function() {

    //Constantes
    var tplAlerta                = '<div class="alert alert-{1} alert-dismissable"><button type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;</button>{0}</div>';
    var tplLinhaEndereco         = '<tr><td>{0}</td><td align="right"><button type="button" ref="{1}" class="btn btn-default btn-sm"><span class="glyphicon glyphicon-trash"></span> Remover</button></td></tr>';

    var enderecoService          = new MWsAddressFinder();
    var rotaService              = new MWsRoute();

    //Objetos da tela
    var btnAddEndereco           = $("#btnAdicionar");
    var btnLimpar                = $("#btnLimpar");
    var btnCalcular              = $("#btnCalcular");
    var btnGravar                = $("#btnGravar");
    var btnCancelar              = $("#btnCancelar");

    var txtNome                  = $("#txtNome");
    var txtNumero                = $("#txtNumero");
    var txtCidade                = $("#txtCidade");
    var selEstado                = $("#selEstado");

    var formulario               = $("#formAdicionarEndereco");
    var tabela                   = $("#tabelaEnderecos");
    var alertas                  = $("#containerAlertas");
    var containerResultados      = $("#resultContainer");

    var listaEnderecos           = [];

    //Defaults
    var resultRange              = new MResultRange();
    resultRange.pageIndex        = 1;
    resultRange.recordsPerPage   = 10;

    var endOpcoes                = new MAddressOptions();
    endOpcoes.matchType          = 1;
    endOpcoes.searchType         = 2;
    endOpcoes.usePhonetic        = true;
    // endOpcoes.resultRange        = resultRange;

    var rotaDetalhes             = new MRouteDetails();
    rotaDetalhes.optimizeRoute   = true;
    rotaDetalhes.descriptionType = 0;
    rotaDetalhes.routeType       = 0; 
     
    var veiculo                  = new MVehicle();
    veiculo.tankCapacity         = 20;
    veiculo.averageConsumption   = 9;
    veiculo.fuelPrice            = 3;
    veiculo.averageSpeed         = 60;
    veiculo.tollFeeCat           = 2;

    var rotaOpcoes               = new MRouteOptions();
    rotaOpcoes.language          = "portugues";
    rotaOpcoes.routeDetails      = rotaDetalhes;
    rotaOpcoes.vehicle           = veiculo;

    //funcoes
    //funcão que atualiza a tabela de endereços
    function atualizarListaEnderecos () {
        tabela.empty();

        for (var i = 0; i < listaEnderecos.length; i++) {
            var endereco = listaEnderecos[i].addr;
            tabela.append( tplLinhaEndereco.format( enderecoParaString(endereco), i ) );
        };

        tabela.find('.btn').click(function(ev) {
            prevEvent(ev);

            var indice = $(this).attr('ref');
            listaEnderecos.splice(indice,1);
            atualizarListaEnderecos();
        });
    }

    //função helper para criar uma string a partir de um endereço
    function enderecoParaString (endereco) {
        return endereco.street + ", " + endereco.houseNumber + " - " + endereco.city.name + ", " + endereco.city.state;
    }

    //funcão para mostrar um alerta na página
    function mostrarAlerta (mensagem, sucesso) {
        $(".alert").remove();

        var texto = "<p><b>{0}</b> {1}</p>";
        texto = texto.format( sucesso ? "Sucesso!" : "Erro", mensagem );

        alertas.append( tplAlerta.format( texto, sucesso ? 'success' : 'danger' ) );
    }

    // função helper para prevenir funções de botões
    function prevEvent (ev) {
        ev = ev || event;
        if(ev) ev.preventDefault();
    }

    // função que realiza a busca de coordenadas de um endereço
    function buscarCoordenadas(endereco) {
        enderecoService.findAddress(endereco, endOpcoes, function(resposta) {
            if( resposta.recordCount <= 0 ){
                mostrarAlerta("O endereço não foi encontrado", false);
            } else if( resposta.recordCount > 1 ){
                mostrarAlerta("O endereço não foi encontrado", false);
            } else if( resposta.recordCount == 1 ){
                mostrarAlerta("Endereço adicionado com sucesso", true);

                listaEnderecos.push( {addr: endereco, coords: resposta.addressLocation[0].point } );
                atualizarListaEnderecos();

                formulario[0].reset();
                $("#loadingCoords").addClass('hidden');
            }
        });
    }

    //função para buscar as informações das rotas
    function buscarInfosRotas () {
        var rss = [];

        for (var i = 0; i < listaEnderecos.length; i++) {
            var rs = new MRouteStop();
            rs.description = enderecoParaString( listaEnderecos[i].addr )
            rs.point = new MPoint(listaEnderecos[i].coords.x, listaEnderecos[i].coords.y);
            rss.push(rs)
        };

        rotaOpcoes.routeDetails.routeType     = $("#formOpcoesBusca input[type='radio']:checked").val();
        rotaOpcoes.vehicle.averageConsumption = $("#txtConsumo").val();
        rotaOpcoes.vehicle.fuelPrice          = $("#txtPreco").val();

        rotaService.getRouteTotals(rss, rotaOpcoes, function(resposta) {
            console.log( resposta );
        })
    }

    //função para atualizar o painel de resultado
    function atualizarResultados () {
        
    }

    //Evento para limpar a tabela de endereços
    btnLimpar.click(function(ev) {
        prevEvent(ev);

        listaEnderecos = [];
        atualizarListaEnderecos();
    });

    //Evento para mostrar formulário para adicionar endereços
    btnAddEndereco.click(function(ev) {
        prevEvent(ev);
        formulario.removeClass('hidden');
    });

    //Evento para cancelar cadastro de endereço
    btnCancelar.click(function(ev) {
        prevEvent(ev);
        formulario.addClass('hidden');
    });

    //Evento para cadastrar endereço
    btnGravar.click(function(ev) {
        prevEvent(ev);

        var nome = txtNome.val();
        var numero = parseInt( txtNumero.val() );
        var cidade = txtCidade.val();
        var estado = selEstado.val();

        if( nome == "" || nome.length < 3 ){ mostrarAlerta("O campo Nome é obrigatório"); }
        else if( numero == "" || numero.length < 1 ){ mostrarAlerta("O campo Número é obrigatório"); }
        else if( numero < 0 || isNaN(numero) ){ mostrarAlerta("O campo Número deve conter um valor positivo e inteiro"); }
        else if( cidade == "" || cidade.length < 3 ){ mostrarAlerta("O campo Cidade é obrigatório"); }
        else if( estado == "" || estado.length < 2 || estado == "0" ){ mostrarAlerta("O campo Estado é obrigatório"); }
        else { 

            //tudo ok, adicionar valores
            var endereco = new MAddress();
            endereco.street = nome;
            endereco.houseNumber = numero;

            var city = new MCity();
            city.name = cidade;
            city.state = estado.toUpperCase();

            endereco.city = city;

            estado.toUpperCase()

            // listaEnderecos.push( endereco );
            // atualizarListaEnderecos();
            $("#loadingCoords").removeClass('hidden');
            buscarCoordenadas(endereco);
        }
    });

    btnCalcular.click(function(ev) {
        prevEvent(ev);

        formulario.addClass('hidden');
        containerResultados.empty();

        if( listaEnderecos.length < 1 ){
            mostrarAlerta("Informe os endereços para calcular a rota", false);
        } else {
            $("#loadingInfo").removeClass('hidden');
            buscarInfosRotas();
        }
    });

    //Usado para facilitar testes
    $("#btnRua1").click(function(ev) {
        prevEvent(ev);

        txtNome.val("Rua Luigi Galvani");
        txtNumero.val("70");
    });


    $("#btnRua2").click(function(ev) {
        prevEvent(ev);

        txtNome.val("Rua Cipriano Barata");
        txtNumero.val("900");
    });
});