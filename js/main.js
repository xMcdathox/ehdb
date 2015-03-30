/*** Variables globales ***/

var indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB,
    dataBase = null,
    lastElement,
    udpVar = 1, myVar,
    mainColor = '#FF7D00';

/*** indexedDB ***/

/* Cargar la base de datos */

function startDB(){
    dataBase = indexedDB.open('newehdbtest28', 1);
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
    if(document.querySelector('#lb_content_agregar_input').value.length < 3){
        return log(true, '', 'El apodo del usuario debe tener 3 o más caracteres', true);
    }
    if(document.querySelector('#lb_content_agregar_input').value.length > 16){
        return log(true, '', 'El apodo del usuario debe tener como máximo 16 caracteres', true);
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
                $(parentCh).animate({color: '#adafb2'}, 750);
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
        LMO.reason = LMO.defaultReason;
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
                if(lastElement != undefined){
                    $(lastElement.children()).animate({color: "#adafb2"}, 750); // ehdb_b0.2
                }
                var elt = document.getElementsByTagName('td');
                for(var eln in elt){
                    if(parseInt(elt[eln].innerHTML) === elements[key].id){
                        var par = $(elt[eln]).parent();
                        lastElement = par;
                        $(par.children()).animate({color: mainColor}, 750); // ehdb_b0.2
                        user.userSelectedId = par.attr('id');
                        $('html, body').animate({scrollTop: $('#' + user.userSelectedId).offset().top -30}, 1000); // ehdb_b0.2
                    }
                }
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
            outerHTML += '\n\<tr id=' + 'userN' + elements[key].id + ' ' + 'class="tbodyTr">\n\<td style="width: 5% !important;" href="#b' + elements[key].id + '">' + elements[key].id + '</td>\n\<td style="width: 25% !important;">' + elements[key].nick + '</td>\n\<td style="width: 50% !important;">' + elements[key].reason + '</td>\n\<td style="width: 20% !important;">' + elements[key].fecha + '</td>\n\</tr>';
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
    /**/
    if(udpVar < 100){
        myVar = setTimeout(function(){ usuariosDePrueba() }, 125);
    }
    var random = parseInt((Math.random() * LMO.reasons.length) + 1);
    LMO.reasonSelect(random);
    var UDP = 'UDP' + udpVar.toString();
    /**/
    var active = dataBase.result;
    var data = active.transaction(['players'], 'readwrite');
    var object = data.objectStore('players');
    var request = object.put({
        nick: UDP,
        reason: LMO.reason,
        fecha: obtenerFechaActual('fechayhora')
    });
    request.onerror = function(e){
        console.log(request.error.name + '\n\n' + request.error.message);
    };
    data.oncomplete = function(e){
        log(true, '', 'Usuario de prueba número' + ' ' + udpVar + ' ' + ' agregado', false);
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
                document.getElementById('lb_title').innerHTML = 'Ingresar un usuario a la base de datos';
                break;
            }
            case 02: {
                /* None */
                $('#lb_content_agregar').css({'display': 'none'});
                /* Block */
                $('#lb_content_buscar').css({'display': 'block'});
                /* Texto del LB Title */
                document.getElementById('lb_title').innerHTML = 'Buscar un usuario en la base de datos';
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
    reasonSelect: function(reason){
        var targetId = '#lb_razon_a_0' + reason.toString() + '_status';
        var children = $('.lb_razon_option').children();
        for(var i = 0; i < children.length; i++){
            if('#' + children[i].id != targetId){
                children[i].style.backgroundColor = '#adafb2';
            }
        }
        $(targetId).css({'background-color': mainColor});
        this.reason = this.reasons[reason-1];
        this.reasonElementSelectedId = targetId.substring(1,targetId.length);
    },
    restablecerValores: function(){ // Restablecer los valores al cerrar el LB
        this.reason = this.defaultReason;
        this.reasonElementSelectedId = '';
    }
};

/* ML_01 */

$('#ml_01').click(function(){
    usuariosDePrueba();//
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

/* Cambiar el color del status de los botones de la funcion razon */
$(document).ready(function(){
    //
    var helements = [
        '#lb_razon_a_01',
        '#lb_razon_a_02',
        '#lb_razon_a_03',
        '#lb_razon_a_04',
        '#lb_razon_a_05',
        '#lb_razon_a_06',
        '#lb_razon_a_07',
        '#lb_razon_a_08'
    ];
    //
    var telements = [
        '#lb_razon_a_01_status',
        '#lb_razon_a_02_status',
        '#lb_razon_a_03_status',
        '#lb_razon_a_04_status',
        '#lb_razon_a_05_status',
        '#lb_razon_a_06_status',
        '#lb_razon_a_07_status',
        '#lb_razon_a_08_status'
    ];
    //
    var moverc = 'white', moutc = '#adafb2';
    // mouseover
    $(helements[0]).mouseover(function(){
        if(telements[0].substring(1,telements[0].length) != LMO.reasonElementSelectedId){
            $(telements[0]).css('background-color', moverc);
        }
    });
    $(helements[1]).mouseover(function(){
        if(telements[1].substring(1,telements[1].length) != LMO.reasonElementSelectedId){
            $(telements[1]).css('background-color', moverc);
        }
    });
    $(helements[2]).mouseover(function(){
        if(telements[2].substring(1,telements[2].length) != LMO.reasonElementSelectedId){
            $(telements[2]).css('background-color', moverc);
        }
    });
    $(helements[3]).mouseover(function(){
        if(telements[3].substring(1,telements[3].length) != LMO.reasonElementSelectedId){
            $(telements[3]).css('background-color', moverc);
        }
    });
    $(helements[4]).mouseover(function(){
        if(telements[4].substring(1,telements[4].length) != LMO.reasonElementSelectedId){
            $(telements[4]).css('background-color', moverc);
        }
    });
    $(helements[5]).mouseover(function(){
        if(telements[5].substring(1,telements[5].length) != LMO.reasonElementSelectedId){
            $(telements[5]).css('background-color', moverc);
        }
    });
    $(helements[6]).mouseover(function(){
        if(telements[6].substring(1,telements[6].length) != LMO.reasonElementSelectedId){
            $(telements[6]).css('background-color', moverc);
        }
    });
    $(helements[7]).mouseover(function(){
        if(telements[7].substring(1,telements[7].length) != LMO.reasonElementSelectedId){
            $(telements[7]).css('background-color', moverc);
        }
    });
    // mouseout
    $(helements[0]).mouseout(function(){
        if(telements[0].substring(1,telements[0].length) != LMO.reasonElementSelectedId){
            $(telements[0]).css('background-color', moutc);
        }
    });
    $(helements[1]).mouseout(function(){
        if(telements[1].substring(1,telements[1].length) != LMO.reasonElementSelectedId){
            $(telements[1]).css('background-color', moutc);
        }
    });
    $(helements[2]).mouseout(function(){
        if(telements[2].substring(1,telements[2].length) != LMO.reasonElementSelectedId){
            $(telements[2]).css('background-color', moutc);
        }
    });
    $(helements[3]).mouseout(function(){
        if(telements[3].substring(1,telements[3].length) != LMO.reasonElementSelectedId){
            $(telements[3]).css('background-color', moutc);
        }
    });
    $(helements[4]).mouseout(function(){
        if(telements[4].substring(1,telements[4].length) != LMO.reasonElementSelectedId){
            $(telements[4]).css('background-color', moutc);
        }
    });
    $(helements[5]).mouseout(function(){
        if(telements[5].substring(1,telements[5].length) != LMO.reasonElementSelectedId){
            $(telements[5]).css('background-color', moutc);
        }
    });
    $(helements[6]).mouseout(function(){
        if(telements[6].substring(1,telements[6].length) != LMO.reasonElementSelectedId){
            $(telements[6]).css('background-color', moutc);
        }
    });
    $(helements[7]).mouseout(function(){
        if(telements[7].substring(1,telements[7].length) != LMO.reasonElementSelectedId){
            $(telements[7]).css('background-color', moutc);
        }
    });
    /* Consola */
    LOG.cargarBaseDeDatos();
});

/*** Log ***/

/* Objeto principal para esta funcion */

var LOG = {
    cargarBaseDeDatos: function(){
        startDB();
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

$('#irArriba').click(function(){
    $("html, body").animate({scrollTop: $(document).height() - $(document).height()}, 1000);
});

/*** Usuarios ***/

var user = {
    userSelectedId: ''
};