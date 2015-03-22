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


























