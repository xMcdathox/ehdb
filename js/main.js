/*** indexedDB ***/

/* Variables globales */

var indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
var dataBase = null;
var lastElement;
var udpVar = 1, myVar;

/* Cargar la base de datos */

function startDB(){
    dataBase = indexedDB.open('newehdbtest4', 1);
    dataBase.onupgradeneeded = function(e){
        var active = dataBase.result;
        var object = active.createObjectStore('players', {keyPath: 'id', autoIncrement: true});
        object.createIndex('by_nick', 'nick', {unique: false});
    };
    dataBase.onsuccess = function(e){
        document.getElementById('text_area').innerHTML = 'Base de datos cargada correctamente';
        loadAll();
    };
    dataBase.onerror = function(e){
        document.getElementById('text_area').innerHTML = 'Error al cargar la base de datos';
    };
}

/* Ingresar usuario */

function ingresarUsuario(){
    if(document.querySelector('#lb_content_agregar_input').value.length < 3){
        return document.getElementById('text_area').innerHTML = 'El nick del usuario debe tener 3 o mas caracteres';
    }
    if(document.querySelector('#lb_content_agregar_input').value.length > 16){
        return document.getElementById('text_area').innerHTML = 'El nick del usuario debe tener como maximo 16 caracteres';
    }
    var active = dataBase.result;
    var data = active.transaction(['players'], 'readwrite');
    var object = data.objectStore('players');
    var request = object.put({
        nick: document.querySelector('#lb_content_agregar_input').value,
        reason: LMO.reason,
        fecha: obtenerFechaActual()
    });
    request.onerror = function(e){
        alert(request.error.name + '\n\n' + request.error.message);
    };
    data.oncomplete = function(e){
        document.querySelector('#lb_content_agregar_input').value = '';
        LMO.reason = LMO.defaultReason;
        document.getElementById('text_area').innerHTML = 'Usuario agregado correctamente a la base de datos';
        document.getElementById('lb_content_agregar_button').innerHTML = 'Ingresar otro usuario a la base de datos';
        loadAll();
    };
}

/* Buscar usuario */
function buscarUsuario(){
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
                document.getElementById('text_area').innerHTML = 'Usuario encontrado en la base de datos';
                location.href = '#b' + elements[key].id;
                quitarLB();
                if(lastElement != undefined){
                    $(lastElement.children()).css({"color": "#adafb2"});
                }
                var elt = document.getElementsByTagName('td');
                for(var eln in elt){
                    if(parseInt(elt[eln].innerHTML) === elements[key].id){
                        var par = $(elt[eln]).parent();
                        lastElement = par;
                        $(par.children()).css({"color": "rgb(225,0,0)"});
                        elt[eln].scrollIntoView();
                    }
                }
            return;
            }
            else {
                document.getElementById('text_area').innerHTML = 'No se ha encontrado el usuario en la base de datos';
            }
        }
    }
}

/* Cargar todos los usuarios */

function loadAll(){
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
            outerHTML += '\n\<tr>\n\<td style="width: 5% !important;" href="#b' + elements[key].id + '">' + elements[key].id + '</td>\n\<td style="width: 25% !important;">' + elements[key].nick + '</td>\n\<td style="width: 50% !important;">' + elements[key].reason + '</td>\n\<td style="width: 20% !important;">' + elements[key].fecha + '</td>\n\</tr>';
        }
        elements = [];
        document.querySelector('#elementsList').innerHTML = outerHTML;
    };
}

/* Cargar todos por los usuarios en orden de nick (falta probar) */

function cargarTodosPorNick(){
    var active = dataBase.result;
    var data = active.transaction(['players'], 'readonly');
    var object = data.objectStore('players');
    var index = object.index('by_nick');
    var elements = [];
    index.openCursor().onsuccess = function(e){
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
            outerHTML += '\n\<tr>\n\<td style="width: 5% !important;" href="#b' + elements[key].id + '">' + elements[key].id + '</td>\n\<td style="width: 25% !important;">' + elements[key].nick + '</td>\n\<td style="width: 50% !important;">' + elements[key].reason + '</td>\n\<td style="width: 20% !important;">' + elements[key].fecha + '</td>\n\</tr>';
        }
        elements = [];
        document.querySelector('#elementsList').innerHTML = outerHTML;
    };
}

/* Agregar usuarios de prueba */

function usuariosDePrueba(){
    if(udpVar < 100){
        myVar = setTimeout(function(){ usuariosDePrueba() }, 250);
    }
    /*var random = parseInt((Math.random() * 6) + 1);
    switch(random){
        case 1: document.querySelector('#select_agregar').value = 'Sin especificar'; break;
        case 2: document.querySelector('#select_agregar').value = 'Abandono/Inactividad'; break;
        case 3: document.querySelector('#select_agregar').value = 'Negarse a mantener comunicacion con el equipo'; break;
        case 4: document.querySelector('#select_agregar').value = 'Jugador sin habilidad'; break;
        case 5: document.querySelector('#select_agregar').value = 'Lenguaje ofensivo'; break;
        case 6: document.querySelector('#select_agregar').value = 'Ayudar al equipo enemigo'; break;
    }
    document.getElementById('player_nick_1').value = 'Usuario de prueba' + ' ' + udpVar.toString();*/
    var active = dataBase.result;
    var data = active.transaction(['players'], 'readwrite');
    var object = data.objectStore('players');
    var request = object.put({
        nick: 'Usuario de prueba',/*document.querySelector('#player_nick_1').value,*/
        reason: 'Esta es una razón de prueba',/*document.querySelector('#select_agregar').value*/
        fecha: obtenerFechaActual()
    });
    request.onerror = function(e){
        alert(request.error.name + '\n\n' + request.error.message);
    };
    data.oncomplete = function(e){
        /*document.querySelector('#player_nick_1').value = '';
        document.querySelector('#select_agregar').value = '';*/
        /*document.getElementById('text_area').innerHTML = 'Usuario de prueba numero' + ' ' + udpVar + ' ' + 'agregado correctamente a la base de datos';*/
        udpVar = udpVar + 1;
        /**/
        /*document.getElementById('options_table').scrollIntoView();*/
        /**/
        loadAll();
    };
}

/*** Mis funciones ***/

/* Obtener fecha */

function obtenerFechaActual(){
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
    var fecha = dayt + '-' + montht + '-' + year + ',' + ' ' + hour + ':' + minutet + ':' + secondt;
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
        'Reason 01',
        'Reason 02',
        'Reason 03',
        'Reason 04',
        'Reason 05',
        'Reason 06',
        'Reason 07',
        'Reason 08'
    ],
    aplicarOpciones: function(){
        var children = $('.lb_razon_option').children();
        for(var i = 0; i< children.length; i++){
            console.log(i);
            var it = i + 1;
            console.log(it);
            children[i].innerHTML = this.reasons[i] + '<div id="lb_razon_a_0' + it.toString() + '_status" class="lb_razon_option_status"></div>';
        }
    },
    defaultReason: 'Sin especificar',
    reason: 'Sin especificar',
    reasonElementSelectedId: '',
    reasonSelect: function(reason){
        var targetId = '#lb_razon_a_0' + reason.toString() + '_status';
        var targetIdinnerHTML ='#ingresar_reason_0' + reason.toString();
        console.log(targetIdinnerHTML);
        var children = $('.lb_razon_option').children();
        for(var i = 0; i < children.length; i++){
            if('#' + children[i].id != targetId){
                children[i].style.backgroundColor = '#adafb2';
            }
        }
        $(targetId).css({'background-color': 'red'});
        this.reason = $(targetIdinnerHTML).innerHTML;
        this.reasonElementSelectedId = targetId.substring(1,targetId.length);
        console.log(this.reasonElementSelectedId);
    }
};

/* ML_01 */

$('#ml_01').click(function(){
    LMO.lb_open(01);
    $('#lb_container').css({'margin-top': -$('#lb_container').height() / 2});
    $('#lb_container').css({'margin-left': -$('#lb_container').width() / 2});
    fadeLb('in');
    LMO.aplicarOpciones();
    return;
});

/* ML_02 */

$('#ml_02').click(function(){
    LMO.lb_open(02);
    $('#lb_container').css({'margin-top': -$('#lb_container').height() / 2});
    $('#lb_container').css({'margin-left': -$('#lb_container').width() / 2});
    fadeLb('in');
    return;
});

/* Quitar LB */

$('#lb_background').click(function(){
    fadeLb('out');
    return;
});

function quitarLB(){
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
        $('#lb_background').fadeIn("slow");
        $('#lb_background').fadeIn(3000);
        $('#lb_container').fadeIn();
        $('#lb_container').fadeIn('slow');
        $('#lb_container').fadeIn(3000);
    }
    else if(action === 'out'){
        $('#lb_background').fadeOut();
        $('#lb_background').fadeOut('slow');
        $('#lb_background').fadeOut(3000);
        $('#lb_cointainer').fadeOut();
        $('#lb_container').fadeOut("slow");
        $('#lb_container').fadeOut(3000);
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
});