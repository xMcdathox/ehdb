/*** Variables globales ***/

var indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB,
    dataBase = null,
    lastElement,
    udpVar = 1, myVar,
    mainColor = '#FF7D00';

/*** Document ready ***/

$(document).ready(function(){
    LOG.cargarBaseDeDatos();
});

/*** indexedDB ***/

/* Cargar la base de datos */

function startDB(){
    dataBase = indexedDB.open('newehdbtest45', 1);
    dataBase.onupgradeneeded = function(e){
        var active = dataBase.result;
        var object = active.createObjectStore('players', {keyPath: 'id', autoIncrement: true});
        object.createIndex('by_nick', 'nick', {unique: true}); //ehdb_b0.2
    };
    dataBase.onsuccess = function(e){
        log(true, '', 'La base de datos ha sido cargada correctamente', false);
        loadAll(false);
    };
    dataBase.onerror = function(e){
        log(true, '', 'Ha ocurrido un error al cargar la base de datos', true);
    };
}

/* Ingresar usuario */

function ingresarUsuario(){
    /*if(document.querySelector('#lb_content_agregar_input').value.length < 3){
        return log(true, '', 'El apodo del usuario debe tener 3 o más caracteres', true);
    }
    if(document.querySelector('#lb_content_agregar_input').value.length > 16){
        return log(true, '', 'El apodo del usuario debe tener como máximo 16 caracteres', true);
    }*/
    RIOT(document.querySelector('#lb_content_agregar_input').value);
    if(RiotApiConf.STATUS === false){
        log(true, '', 'Invocador no encontrado', true);
        return false;
    }
    /* Verificar que el usuario no este en la base de datos */
    var children = $('tr').children();
    for(var i = 0; i < children.length; i++){
        if(children[i].innerHTML === document.querySelector('#lb_content_agregar_input').value){
            var par = $(children[i]).parent();
            console.log(par.attr('id'));
            if(par.attr('id') === user.userSelectedId){ // Solo hacer el scroll
                $('html, body').animate({scrollTop: $('#' + user.userSelectedId).offset().top -30}, 1000);
            }
            else { // Hacer los cambios con una ID alternativa en caso de no ser el usuario previamente seleccionado
                var parentId = '#' + par.attr('id');
                var parentCh = $(parentId).children();
                $(parentCh).animate({color: mainColor}, 750);
                $(parentCh).animate({color: '#adafb2'}, 250);
                $('html, body').animate({scrollTop: $(parentId).offset().top -30}, 1000);
            }
            return log(true, '', 'El usuario ya se encuentra en la base de datos', true);
        }
    }
    /**/
    var active = dataBase.result;
    var data = active.transaction(['players'], 'readwrite');
    var object = data.objectStore('players');
    var request = object.put({
        nick: document.querySelector('#lb_content_agregar_input').value,
        reason: LMO.reason,
        fecha: obtenerFechaActual('fechayhora')
    });
    request.onerror = function(e){
        console.log(request.error.name + '\n\n' + request.error.message);
    };
    data.oncomplete = function(e){
        log(true, '', 'El usuario' + ' ' + "'" + document.querySelector('#lb_content_agregar_input').value + "'" + ' ' + 'ha sido agregado correctamente a la base de datos', false);
        document.querySelector('#lb_content_agregar_input').value = '';
        quitarLB();
        document.getElementById('lb_content_agregar_button').innerHTML = 'Ingresar otro usuario a la base de datos';
        loadAll(true);
    };
}

/* Buscar usuario */
function buscarUsuario(){
    if(document.querySelector('#lb_content_buscar_input').value.length < 3){
        return log(true, '', 'El apodo del usuario debe tener 3 o más caracteres', true);
    }
    if(document.querySelector('#lb_content_buscar_input').value.length > 16){
        return log(true, '', 'El apodo del usuario debe tener como máximo 16 caracteres', true);
    }
    var active = dataBase.result;
    var data = active.transaction(['players'], 'readonly');
    var object = data.objectStore('players');
    var elements = [];
    object.openCursor().onsuccess = function(e){
        var result = e.target.result;
        if(result === null){
            return;
        }
        elements.push(result.value);
        result.continue();
    };
    data.oncomplete = function(){
        for(var key in elements){
            if(document.querySelector('#lb_content_buscar_input').value === elements[key].nick){
                log(true, '', 'Se ha encontrado el usuario en la base de datos', false);
                location.href = '#b' + elements[key].id;
                quitarLB();
                user.seleccionarUsuario(elements[key].id, false, true);
                $('html, body').animate({scrollTop: $('#' + user.userSelectedId).offset().top -30}, 1000);
            return;
            }
            else {
                log(true, '', 'No se ha encontrado el usuario en la base de datos', true);
            }
        }
    }
}

/* Cargar todos los usuarios */

function loadAll(scroll){
    var active = dataBase.result;
    var data = active.transaction(['players'], 'readonly');
    var object = data.objectStore('players');
    var elements = [];
    object.openCursor().onsuccess = function(e){
        var result = e.target.result;
        if(result === null){
            return;
        }
        elements.push(result.value);
        result.continue();
    };
    data.oncomplete = function(){
        var outerHTML = '';
        for(var key in elements){
            outerHTML += '\n\<div class="dtrlink" onclick="user.seleccionarUsuario(' + elements[key].id + ', true, false)"><div class="dtr userConHover" id="userN' + elements[key].id + '">\n\<div style="width: 7.5% !important;" class="dtd" href="#b' + elements[key].id + '">' + elements[key].id + '</div>\n\<div style="width: 22.5% !important;" class="dtd tUserNick">' + elements[key].nick + '</div>\n\<div style="width: 50%; !important" class="dtd">' + elements[key].reason + '</div>\n\<div style="width: 18.5%; !important" class="dtd">' + elements[key].fecha + '</div>\n\</div></div>';
        }
        elements = [];
        document.querySelector('#elementsList').innerHTML = outerHTML;
        if(scroll){
            $("html, body").animate({scrollTop: $(document).height()}, 0);
        }
    };
}

/* Agregar usuarios de prueba */

function usuariosDePrueba(){
    if(udpVar < 50){
        myVar = setTimeout(function(){ usuariosDePrueba() }, 150);
    }
    var random = parseInt((Math.random() * LMO.reasons.length) + 1);
    var UDPreason = LMO.reasons[random-1];
    var UDP = 'UDP' + ' ' + udpVar.toString();
    var active = dataBase.result;
    var data = active.transaction(['players'], 'readwrite');
    var object = data.objectStore('players');
    var request = object.put({
        nick: UDP,
        reason: UDPreason,
        fecha: obtenerFechaActual('fechayhora')
    });
    request.onerror = function(e){
        console.log(request.error.name + '\n\n' + request.error.message);
    };
    data.oncomplete = function(e){
        log(true, '', 'Usuario de prueba número' + ' ' + udpVar + ' ' + ' agregado correctamente', false);
        udpVar = udpVar + 1;
        loadAll(true);
    };
}

/*** Mis funciones ***/

/* Obtener fecha */

function obtenerFechaActual(tipo){
    var d = new Date();
    var day = d.getDate();
    var month = d.getMonth()+1;
    var year = d.getFullYear();
    var hour = d.getHours();
    var minute = d.getMinutes();
    var second = d.getSeconds();
    var dayt, montht, minutet, secondt;
    if(day < 10){
        dayt = '0' + day.toString();
    }
    else {
        dayt = day;
    }
    if(month < 10){
        montht = '0' + month.toString();
    }
    else {
        montht = month;
    }
    if(minute < 10){
        minutet = '0' + minute.toString();
    }
    else {
        minutet = minute;
    }
    if(second < 10){
        secondt = '0' + second.toString();
    }
    else {
        secondt = second;
    }
    var fecha;
    if(tipo === 'fechayhora'){
        fecha = dayt + '-' + montht + '-' + year + ',' + ' ' + hour + ':' + minutet + ':' + secondt;
    }
    else if(tipo === 'fecha'){
        fecha = dayt + '-' + montht + '-' + year;
    }
    else if(tipo === 'hora'){
        fecha = hour + ':' + minutet + ':' + secondt;
    }
    return fecha;
}

/*** Funciones del menu lateral ***/

/* Objeto principal para estas funciones */

var LMO = {
    lb_type: -1,
    lb_open: function(lb){
        this.lb_type = lb;
        return this.lb_render();
    },
    lb_render: function(){
        switch(this.lb_type){
            case 01: {
                /* None */
                $('#lb_content_buscar').css({'display': 'none'});
                /* Block */
                $('#lb_content_agregar').css({'display': 'block'});
                /* Texto del LB Title */
                document.getElementById('lb_title').innerHTML = 'INGRESAR UN USUARIO A LA BASE DE DATOS';
                break;
            }
            case 02: {
                /* None */
                $('#lb_content_agregar').css({'display': 'none'});
                /* Block */
                $('#lb_content_buscar').css({'display': 'block'});
                /* Texto del LB Title */
                document.getElementById('lb_title').innerHTML = 'BUSCAR UN USUARIO EN LA BASE DE DATOS';
                break;
            }
        }
    },
    reasons: [
        'Abandono / Inactividad',
        'Acoso: Abuso verbal',
        'Acoso: Lenguaje ofensivo',
        'Actitud negativa',
        'Jugador sin habilidad',
        'Molestia: Ayudar al equipo enemigo',
        'Molestia: Perder apropósito',
        'Negarse a mantener comunicación con el equipo'
    ],
    aplicarOpciones: function(){
        var target = $('.lb_razon_option');
        for(var i = 0; i< target.length; i++){
            var it = i + 1;
            target[i].innerHTML = this.reasons[i] + '<div id="lb_razon_a_0' + it.toString() + '_status" class="lb_razon_option_status"></div>';
        }
    },
    defaultReason: 'Sin especificar',
    reason: 'Sin especificar',
    reasonElementSelectedId: '',
    lastReasonElementSelectedId: '',
    reasonSelect: function(reason){
        var targetId = '#lb_razon_a_0' + reason.toString();
        this.reasonElementSelectedId = targetId.substring(1, targetId.length);
        var lastTextT;
        var textT = $(targetId).children();
        var lastDivT;
        var divT = $(textT).children();
        if(this.lastReasonElementSelectedId === targetId.substring(1, targetId.length)){
            return false;
        }
        if(this.lastReasonElementSelectedId != -1){
            lastTextT = $('#' + this.lastReasonElementSelectedId).children();
            lastDivT = $(lastTextT).children();
            $(lastTextT).animate({color: '#adafb2'}, 250); // Color
            $(lastDivT).animate({backgroundColor: '#adafb2'}, 250); // bgColor
            $('#' + this.lastReasonElementSelectedId).removeClass('selectedReason');
            $('#' + this.lastReasonElementSelectedId).addClass('unselectedReason');
        }
        $(textT).css('color', mainColor);
        $(divT).css('background-color', mainColor);
        $(targetId).removeClass('unselectedReason');
        $(targetId).addClass('selectedReason');
        this.reason = this.reasons[reason-1];
        this.lastReasonElementSelectedId = targetId.substring(1, targetId.length);
    },
    restablecerValores: function(){
        RiotApiConf.STATUS = false; // RIOT
        document.querySelector('#lb_content_agregar_input').value = '';
        document.querySelector('#lb_content_buscar_input').value = '';
        this.reason = this.defaultReason;
        $('#' + this.reasonElementSelectedId).children().animate({color: '#adafb2'}, 250); // Color
        $('#' + this.reasonElementSelectedId).children().children().animate({backgroundColor: '#adafb2'}, 250); // bgColor
        $('#' + this.reasonElementSelectedId).removeClass('selectedReason');
        $('#' + this.reasonElementSelectedId).addClass('unselectedReason');
        this.reasonElementSelectedId = '';
        this.lastReasonElementSelectedId = '';
    },
    defaultUserTitle: 'SELECCIONA UN USUARIO',
    userTitle: ''
};

/* ML_01 */

$('#ml_01').click(function(){
    usuariosDePrueba();
    return;
});

/* ML_02 */

$('#ml_02').click(function(){
    LMO.lb_open(01);
    $('#lb_container').css({'margin-top': -$('#lb_container').height() / 2});
    $('#lb_container').css({'margin-left': -$('#lb_container').width() / 2});
    fadeLb('in');
    LMO.aplicarOpciones();
    return;
});

/* ML_03 */

$('#ml_03').click(function(){
    LMO.lb_open(02);
    $('#lb_container').css({'margin-top': -$('#lb_container').height() / 2});
    $('#lb_container').css({'margin-left': -$('#lb_container').width() / 2});
    fadeLb('in');
    return;
});

/* ML_04 */

$('#ml_05').click(function(){
    user.deseleccionarUsuario();
    return;
});

/* Quitar LB */

$('#lb_background').click(function(){
    LMO.restablecerValores();
    fadeLb('out');
    return;
});

function quitarLB(){
    LMO.restablecerValores();
    fadeLb('out');
    return;
}

/* FadeIn / FadeOut */

function fadeLb(action){
    if(action === 'in'){
        /* Restablecer el texto de los botones */
        document.getElementById('lb_content_agregar_button').innerHTML = 'Ingresar usuario a la base de datos';
        /**/
        $('#lb_background').fadeIn();
        $('#lb_container').fadeIn();
    }
    else if(action === 'out'){
        $('#lb_background').fadeOut();
        $('#lb_container').fadeOut();
    }
}

/*** Log ***/

/* Objeto principal para esta funcion */

var LOG = {
    cargarBaseDeDatos: function(){
        startDB();
        document.getElementById('ml_userTitle').innerHTML = LMO.defaultUserTitle;
    },
    log_activo: false,
    log_cin: '01',
    log_cout: '02',
    log_cambiarContenido: function(){
        var temp = this.log_cin;
        this.log_cin = this.log_cout;
        this.log_cout = temp;
        this.log_fade(this.log_cin, this.log_cout);
    },
    log_fade: function(cin, cout){
        var fadeInTarget = '#log_item_' + cin;
        var fadeOutTarget = '#log_item_' + cout;
        $(fadeOutTarget).fadeOut(250);
        setTimeout(function(){
            $(fadeInTarget).fadeIn(250);
        }, 250);
    },
    log_textoRegistrado: 'No hay registro de eventos',
    log_horaRegistrada: 'Null',
    log_cambiarTexto: function(t, h, hr, ie){
        this.log_textoRegistrado = t;
        if(hr === false){
            this.log_horaRegistrada = h;
        }
        if(ie){
            document.getElementById('log_item_02').style.color = mainColor;
        }
        else {
            document.getElementById('log_item_02').style.color = '#adafb2';
        }
        document.getElementById('log_item_02').innerHTML = '[' + h + ']:' + ' ' + t;
    },
    log_mostrarLog: function(){
        log(true, 'horaregistrada', this.log_textoRegistrado, false);
    }
};

/* Timeout */

var logTVar;

function log(action, hora, text, isError){
    var hrs = false;
    if(hora === 'horaregistrada'){
        hrs = true;
        if(LOG.log_horaRegistrada != 'Null'){
            hora = LOG.log_horaRegistrada;
        }
        else {
            hora = obtenerFechaActual('hora');
            LOG.log_horaRegistrada = hora;
        }
    }
    else {
        hora = obtenerFechaActual('hora');
    }
    if(action === true){
        if(LOG.log_activo === true){
            clearTimeout(logTVar);
            logTVar = setTimeout(function(){ log(false, hora, text, isError) }, 5000);
        }
        else {
            LOG.log_activo = true;
            LOG.log_cambiarContenido();
            logTVar = setTimeout(function(){ log(false, hora, text, isError) }, 5000);
        }
        LOG.log_cambiarTexto(text, hora, hrs, isError);
    }
    else {
        clearTimeout(logTVar);
        LOG.log_activo = false;
        LOG.log_cambiarContenido();
    }
}

/*** Click ***/

/* onclick en JS para evitar que la pagina envie al top con el href # y agregar return false en onclick del documento */

$('#href_ingresarusuario').click(function(){
    ingresarUsuario();
});

$('#href_buscarusuario').click(function(){
    buscarUsuario();
});

$('#lb_razon_a_01').click(function(){
    LMO.reasonSelect(1);
});

$('#lb_razon_a_02').click(function(){
    LMO.reasonSelect(2);
});

$('#lb_razon_a_03').click(function(){
    LMO.reasonSelect(3);
});

$('#lb_razon_a_04').click(function(){
    LMO.reasonSelect(4);
});

$('#lb_razon_a_05').click(function(){
    LMO.reasonSelect(5);
});

$('#lb_razon_a_06').click(function(){
    LMO.reasonSelect(6);
});

$('#lb_razon_a_07').click(function(){
    LMO.reasonSelect(7);
});

$('#lb_razon_a_08').click(function(){
    LMO.reasonSelect(8);
});

$('#log_item_01').click(function(){
    LOG.log_mostrarLog();
});

/* Botones para subir y bajar */

var TopBottomStatus = true;

$('#log_item_subir').click(function(){
    if(TopBottomStatus){
        $("html, body").animate({scrollTop: $(document).height() - $(document).height()}, 1000);
        $('#log_item_subir').addClass('log_item_subir_activado');
        $('#log_item_bajar').addClass('log_item_bajar_activado');
        TopBottomStatus = false;
        setTimeout(function(){ 
            $('#log_item_subir').removeClass('log_item_subir_activado');
            $('#log_item_bajar').removeClass('log_item_bajar_activado');
            TopBottomStatus = true; 
        }, 1015);
    }
});

$('#log_item_bajar').click(function(){
    if(TopBottomStatus){
        $("html, body").animate({scrollTop: $(document).height() - $(document).height() / 3}, 1000);
        $('#log_item_subir').addClass('log_item_subir_activado');
        $('#log_item_bajar').addClass('log_item_bajar_activado');
        TopBottomStatus = false;
        setTimeout(function(){ 
            $('#log_item_subir').removeClass('log_item_subir_activado');
            $('#log_item_bajar').removeClass('log_item_bajar_activado');
            TopBottomStatus = true; 
        }, 1015);
    }
});

/*** Usuarios ***/

var user = {
    userSelectedId: '',
    ultimoUsuarioSeleccionado: -1,
    seleccionarUsuario: function(iId, oncompleteMsg, onerrorMsg){
        if(this.userSelectedId != 'userN' + iId.toString()){
            //
            this.userSelectedId = 'userN' + iId.toString();
            if(this.ultimoUsuarioSeleccionado != -1){
                $('#' + this.ultimoUsuarioSeleccionado).children().animate({color: '#adafb2'}, 250); // Color
                document.getElementById(this.ultimoUsuarioSeleccionado).classList.remove('userSinHover');
                document.getElementById(this.ultimoUsuarioSeleccionado).classList.add('userConHover');
            }
            //
            var logelement = $('#' + this.userSelectedId).children();
            $(logelement).css('color', mainColor);
            document.getElementById(this.userSelectedId).classList.remove('userConHover');
            document.getElementById(this.userSelectedId).classList.add('userSinHover');
            for(var i = 0; i < logelement.length; i++){
                if($(logelement[i]).hasClass('tUserNick')){
                    if(oncompleteMsg){
                        log(true, '', 'Usuario seleccionado' + ' ' + '(' + logelement[i].innerHTML + ')', false);
                    }
                    LMO.userTitle = logelement[i].innerHTML;
                    document.getElementById('ml_userTitle').innerHTML = LMO.userTitle;
                    $('#ml_04').children().removeClass('main_nav_link_bloqueado');
                    $('#ml_05').children().removeClass('main_nav_link_bloqueado');
                }
            }
            this.ultimoUsuarioSeleccionado = 'userN' + iId.toString();
        }
        else {
            if(onerrorMsg){
                log(true, '', 'Usuario previamente seleccionado', true);
            }
        }
        return false;
    },
    deseleccionarUsuario: function(){
        var lastUser = $('#' + this.ultimoUsuarioSeleccionado);
        $(lastUser).children().animate({color: '#adafb2'}, 250); // Color
        document.getElementById(this.ultimoUsuarioSeleccionado).classList.remove('userSinHover');
        document.getElementById(this.ultimoUsuarioSeleccionado).classList.add('userConHover');
        $('#ml_04').children().addClass('main_nav_link_bloqueado');
        $('#ml_05').children().addClass('main_nav_link_bloqueado');
        document.getElementById('ml_userTitle').innerHTML = LMO.defaultUserTitle;
        log(true, '', 'Usuario deseleccionado', false);
        this.userSelectedId = '';
        this.ultimoUsuarioSeleccionado = -1;
    }
};

/* TEST RIOT GAMES API */

var RiotApiConf = {
    REGION: 'na',
    API_KEY: '93ad4cc0-b04d-4dee-b2c2-a1fe49d63d85',
    STATUS: false
};

function RIOT(SummonerName){
    $.ajax({
        url: 'https://na.api.pvp.net/api/lol/' + RiotApiConf.REGION + '/v1.4/summoner/by-name/' + SummonerName + '?api_key=' + RiotApiConf.API_KEY,
        type: 'GET',
        dataType: 'json',
        data: {},
        success: function (json){
            var SUMMONER_NAME_NOSPACES = SummonerName.replace(" ", "");
            SUMMONER_NAME_NOSPACES = SUMMONER_NAME_NOSPACES.toLowerCase().trim();
            console.log('Riot: true');
            return RiotApiConf.STATUS = true;
        },
        error: function (XMLHttpRequest, textStatus, errorThrown){
            console.log('Riot: false');
            return RiotApiConf.STATUS = false;
        }
    });
}