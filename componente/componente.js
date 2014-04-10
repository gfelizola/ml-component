
    /**
    * Classe que utiliza os serviços do MapLink JS API.
    * @class
    */
    function RouterInformer () {
        /**
        * Serviço fornecido pelo MapLink JS API. 
        * É utilizada para consumir o serviço SOAP “AddressFinder”
        * @property {MWsAddressFinder}
        */
        this.wsEndereco     = new MWsAddressFinder();

        /**
        * Serviço fornecido pelo MapLink JS API. 
        * É utilizada para consumir o serviço SOAP “Route”
        * @property {MWsRoute}
        */
        this.wsRota         = new MWsRoute();

        /**
        * Objejo fornecido pelo MapLink JS API, para utilizar no serviço de endereço (MWsAddressFinder). 
        * @property {MAddressOptions}
        */
        this.endOpcoes      = new MAddressOptions();

        /**
        * Objejo fornecido pelo MapLink JS API, para utilizar no serviço de rota (MWsRoute). 
        * @property {MVehicle}
        */
        this.veiculo        = new MVehicle();

        /**
        * Objejo fornecido pelo MapLink JS API, para utilizar no serviço de rota (MWsRoute). 
        * @property {MRouteDetails}
        */
        this.rotaDetalhes   = new MRouteDetails();

        /**
        * Objejo fornecido pelo MapLink JS API, para utilizar no serviço de rota (MWsRoute). 
        * @property {MRouteOptions}
        */
        this.rotaOpcoes     = new MRouteOptions();

        /**
        * Lista dos endereços armazenados para uso nos métodos do RouterInformer
        * @property {Array}
        */
        this.listaEnderecos = [];

        //configura padroes
        this.configurarVeiculo();
        this.configurarRotaDetalhes();
        this.configurarRotaOpcoes();
        this.configurarEnderecoOpcoes(true);
    }

    /*===== Getters / Setters =====*/

    /**
    * Método para trocar o veículo utilizado
    * @param {MVehicle} [pVeiculo]
    */
    RouterInformer.prototype.setVeiculo = function(pVeiculo) { this.veiculo = pVeiculo; };

    /**
    * Método que retorna o veículo utilizado
    * @return {MVehicle} veículo utilizado na rota
    */
    RouterInformer.prototype.getVeiculo = function() { return this.veiculo; };

    /**
    * Método para trocar o objeto de detalhes de rota
    * @param {MRouteDetails} [pRotaDetalhes]
    */
    RouterInformer.prototype.setRotaDetalhes = function(pRotaDetalhes) { this.rotaDetalhes = pRotaDetalhes; };

    /**
    * Método que retorna os detalhes de rota
    * @return {MRouteDetails} objeto de detalhes de rota
    */
    RouterInformer.prototype.getRotaDetalhes = function() { return this.rotaDetalhes; };

    /**
    * Método para trocar o objeto de opções de rota
    * @param {MRouteOptions} [pRotaOpcoes]
    */
    RouterInformer.prototype.setRotaOpcoes = function(pRotaOpcoes) { this.rotaOpcoes = pRotaOpcoes; };

    /**
    * Método que retorna as opções de rota
    * @return {MRouteOptions} objeto de opções de rota
    */
    RouterInformer.prototype.getRotaOpcoes = function() { return this.rotaOpcoes; };

    /**
    * Método para trocar o objeto de opções de endereço
    * @param {MAddressOptions} [pEnderecoOpcoes]
    */
    RouterInformer.prototype.setEnderecoOpcoes = function(pEnderecoOpcoes) { this.endOpcoes = pEnderecoOpcoes; };

    /**
    * Método que retorna as opções de endereço
    * @return {MAddressOptions} objeto de opções de endereço
    */
    RouterInformer.prototype.getEnderecoOpcoes = function() { return this.endOpcoes; };

    /**
    * Método que retorna a lista de endereços
    * @return {Array} lista de endereços
    */
    RouterInformer.prototype.getEnderecos = function() { return this.listaEnderecos; };

    /**
    * Função para configurar Veiculo
    * @param {number} [capacidadeTanque=20] Capacidade do tanque do veículo
    * @param {number} [consumoMedio=9] Consumo médio do veículo
    * @param {number} [precoCombustivel=3] Preço do litro de combustível
    * @param {number} [velocidadeMedia=60] Velocidade do veículo
    * @param {number} [categoriaPedagio=2] Categoria de pedágio usada no cálculo de rota
    */
    RouterInformer.prototype.configurarVeiculo = function(capacidadeTanque, consumoMedio, precoCombustivel, velocidadeMedia, categoriaPedagio) {
        this.veiculo.tankCapacity       = capacidadeTanque  || 20;
        this.veiculo.averageConsumption = consumoMedio      || 9;
        this.veiculo.fuelPrice          = precoCombustivel  || 3;
        this.veiculo.averageSpeed       = velocidadeMedia   || 60;
        this.veiculo.tollFeeCat         = categoriaPedagio  || 2;
    };

    /** Função para configurar detalhes da Rota 
    * @param {boolean} [otimizarRota=true] Otimizar a rota
    * @param {number} [tipoRota=0] Tipo de rota utilizada
    * @param {number} [tipoDescricao=0] Tipo de descrição
    */
    RouterInformer.prototype.configurarRotaDetalhes = function(otimizarRota, tipoRota, tipoDescricao) {
        this.rotaDetalhes.optimizeRoute   = !!otimizarRota;
        this.rotaDetalhes.descriptionType = tipoDescricao   || 0;
        this.rotaDetalhes.routeType       = tipoRota        || 0;
    };

    /** Função para configurar Opções da Rota
    * @param {string} [lingua=portugues] lingua utilizada no retorno
    * @param {MRouteOptions} [pRotaDetalhes=this.rotaDetalhes] Tipo de rota utilizada
    * @param {nMVehicle} [pVeiculo=this.veiculo] Tipo de descrição
    */
    RouterInformer.prototype.configurarRotaOpcoes = function(lingua, pRotaDetalhes, pVeiculo) {
        this.rotaOpcoes.language     = lingua || "portugues";
        this.rotaOpcoes.routeDetails = pRotaDetalhes || this.rotaDetalhes;
        this.rotaOpcoes.vehicle      = pVeiculo || this.veiculo;
    };

    /** Função para configurar Opções de Endereço
    * @param {boolean} [usarFonetica=true] Otimizar a rota
    * @param {number} [tipoBusca=2] Tipo de busca utilizada
    * @param {number} [tipoAcerto=1] Tipo de Match utilizado na busca
    */
    RouterInformer.prototype.configurarEnderecoOpcoes = function(usarFonetica, tipoBusca, tipoAcerto) {
        this.endOpcoes.matchType   = tipoAcerto || 1;
        this.endOpcoes.searchType  = tipoBusca || 2;
        this.endOpcoes.usePhonetic = !!usarFonetica;
    };

    /** Função Helper para transformar objeto MAddress em um formato legível e humano
    * @param {MAddress} objeto de endereço que será tratado
    * @return {string} string com endereço em formato legível e humano
    */
    RouterInformer.prototype.humanizarEndereco = function(endereco) {
        return endereco.street + ", " + endereco.houseNumber + " - " + endereco.city.name + ", " + endereco.city.state;
    };

    /** Função Helper para juntar parametros em um objeto MAddress
    * @param {string} [rua] Nome da rua ou avenida
    * @param {string|number} [numero] Número ou altura da rua
    * @param {string} [cidade] Nome da cidade
    * @param {string} [estado] Estado da União
    * @return {MAddress} objeto de endereço
    */
    RouterInformer.prototype.formatarEndereco = function(rua, numero, cidade, estado) {
        var endereco = new MAddress();
        endereco.street = rua;
        endereco.houseNumber = numero;

        var city = new MCity();
        city.name = cidade;
        city.state = estado.toUpperCase();

        endereco.city = city;
        return endereco;
    };

    /** Função para adicionar um endereco na lista que será usada nas infos de rota
    * @param {MAddress} [pEndereco] Objeto de endereço
    * @param {MPoint} [pCoordenadas] Objeto de endereço
    */
    RouterInformer.prototype.adicionarEndereco = function(pEndereco, pCoordenadas) {
        this.listaEnderecos.push( {addr: pEndereco, coords: pCoordenadas } );
    };

    /** Função para remover um endereco da lista que será usada nas infos de rota
    * @param {number} [indice] indice do objeto na lista
    */
    RouterInformer.prototype.removerEndereco = function(indice) {
        this.listaEnderecos.splice(indice,1);
    };

    /** Função que realiza busca das informações do endereco
    * @param {MAddress} [mEndereco] endereço que será buscado
    * @callback funcaoRetorno
    */
    RouterInformer.prototype.buscarEndereco = function(mEndereco, funcaoRetorno) {
        var ri = this;
        this.wsEndereco.findAddress(mEndereco, this.endOpcoes, function(resposta) {
            funcaoRetorno.apply(ri, [resposta]);
        });
    };

    /** Função que realiza busca nas informoções da rota
    * @callback funcaoRetorno
    */
    RouterInformer.prototype.buscarInfosRotas = function(funcaoRetorno) {
        var ri = this;

        if( this.listaEnderecos.length == 0 ){
            throw new Error("A lista de endereços tem que possuir itens antes de realizar a busca");
        } else {
            var rss = [];

            for (var i = 0; i < this.listaEnderecos.length; i++) {
                var rs = new MRouteStop();
                rs.description = this.humanizarEndereco( this.listaEnderecos[i].addr )
                rs.point = new MPoint( this.listaEnderecos[i].coords.x, this.listaEnderecos[i].coords.y );
                rss.push(rs)
            };

            this.wsRota.getRouteTotals(rss, this.rotaOpcoes, function(resposta) {
                funcaoRetorno.apply(ri, [resposta]);
            });
        }

        
    };

    