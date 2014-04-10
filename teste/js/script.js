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

    //Componente
    var rtInformer = new RouterInformer();

    //funcoes
    //funcão que atualiza a tabela de endereços
    function atualizarListaEnderecos () {
        tabela.empty();

        var lista = rtInformer.getEnderecos();

        for (var i = 0; i < lista.length; i++) {
            var endereco = lista[i].addr;
            tabela.append( tplLinhaEndereco.format( rtInformer.humanizarEndereco( endereco ), i ) );
        };

        tabela.find('.btn').click(function(ev) {
            prevEvent(ev);

            var indice = $(this).attr('ref');
            rtInformer.removerEndereco(indice);
            atualizarListaEnderecos();
        });
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

    //Evento para limpar a tabela de endereços
    btnLimpar.click(function(ev) {
        prevEvent(ev);

        rtInformer.listaEnderecos = [];
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
            $("#loadingCoords").removeClass('hidden');

            var endereco = rtInformer.formatarEndereco( nome, numero, cidade, estado );

            //buscar informações do endereço
            rtInformer.buscarEndereco( endereco, function( resposta ) {
                if( resposta.recordCount <= 0 ){
                    mostrarAlerta("O endereço não foi encontrado", false);
                } else {
                    mostrarAlerta("Endereço adicionado com sucesso", true);

                    rtInformer.adicionarEndereco( endereco, resposta.addressLocation[0].point );
                    atualizarListaEnderecos();

                    formulario[0].reset();
                    $("#loadingCoords").addClass('hidden');
                }
            });
        }
    });

    btnCalcular.click(function(ev) {
        prevEvent(ev);

        formulario.addClass('hidden');
        $("#loadingInfo").removeClass('hidden');
        containerResultados.empty();

        rtInformer.configurarRotaDetalhes( true, $("#formOpcoesBusca input[type='radio']:checked").val() );
        rtInformer.configurarVeiculo( null, $("#txtConsumo").val(), $("#txtPreco").val() );

        rtInformer.buscarInfosRotas(function(resposta) {
            $("#loadingInfo").addClass('hidden');
            console.log( "rtInformer.buscarInfosRotas", resposta );
            atualizarResultados( resposta.totalTime, resposta.totalDistance, resposta.totalfuelCost, resposta.totaltollFeeCost );
        });
    });

    //função para atualizar o painel de resultado
    function atualizarResultados(tempoTotal, distanciaTotal, custoCombustivel, custoPedagio) {
        var tempo = new Date(tempoTotal);
        console.log(tempo);

        containerResultados.append('<p><b>Tempo total da rota:</b> ' + tempoTotal + '</p>');
        containerResultados.append('<p><b>Distância total:</b> ' + distanciaTotal + '</p>');
        containerResultados.append('<p><b>Custo de combustível:</b> ' + custoCombustivel + '</p>');
        containerResultados.append('<p><b>Custo total considerando pedágio:</b> ' + custoPedagio + '</p>');
    }

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