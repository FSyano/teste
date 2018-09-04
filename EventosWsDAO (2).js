var dao = require('./GenericDAO');
var logger = require('../../logger');

function EventosWsDAO() {
    this.error = {};
}

EventosWsDAO.prototype.isWeekend = function(diaCorrente, qtdDias, id_posto, res) {
    loop(1, qtdDias, diaCorrente, id_posto, res);
}

EventosWsDAO.prototype.verificarFeriado = function(id_posto, data, res, next) {
    verificarFeriado(id_posto, data, res);
}

function loop(total, qtdDias, diaCorrente, id_posto, res) {
    var total = total;
    var diaTeste;
    var feriado = 0;

    var dataInicio = new Date(diaCorrente);
    diaTeste = new Date(dataInicio.setDate(dataInicio.getDate() + total));

    getEventoToWs(`${diaTeste.getFullYear()}-${diaTeste.getMonth() + 1}-${diaTeste.getDate()}`, total, qtdDias, diaCorrente, id_posto, function(total, qtdDias, diaTeste, err) {
        try {
            if (err) {
                logger.error("result error, EventosWsDAO.prototype.isWeekend ------ " + err.message);
                res.status(500).send(err.message);
            } else {
                if (total <= qtdDias) {
                    loop(total, qtdDias, diaCorrente, id_posto, res);
                } else {
                    var diaTesteDate = new Date(diaTeste);
                    var json = {
                        data: `${diaTesteDate.getDate()}/${diaTesteDate.getMonth() + 1}/${diaTesteDate.getFullYear()}`
                    }
                    res.status(200).json(json);
                }
            }
        } catch (erro) {
            logger.error("result catch error, EventosWsDAO.prototype.isWeekend ------ " + erro);
            res.status(500).send(err);
        }
    });
}

function getEventoToWs(data, total, qtdDias, diaCorrente, id_posto, callback) {
    var dataInicio = new Date(diaCorrente);
    diaTeste = new Date(dataInicio.setDate(dataInicio.getDate() + total));
    var value = {};

    var query = "SELECT COUNT(*) AS TOTAL FROM TBL_CALEND_EVENTO E";

    if (id_posto != '') {
        query += " FULL JOIN TBL_CALEND_EVENTO_LOCAL LE ON  LE.ID_EVENTO = E.ID" +
            " FULL JOIN TBL_LOCAL L ON L.ID_LOCAL = LE.ID_LOCAL" +
            " WHERE E.DT_INICIO = TO_DATE('" + data + "', 'YYYY/MM/DD') " +
            " AND (E.ID_CATEGORIA IN (1, 3) OR E.ID_CATEGORIA IN (2, 11) AND (L.CD_POSTO = '" + id_posto + "' OR LE.ID_LOCAL = '999999'))"
    } else {
        query += " WHERE E.ID_CATEGORIA IN (1, 3) AND E.DT_INICIO = TO_DATE('" + data + "', 'YYYY/MM/DD')";
    }

    if (diaTeste.getDay() == '0' || diaTeste.getDay() == '6') {
        qtdDias += 1;
        total += 1;
        callback(total, qtdDias, diaTeste, null);
    } else {
        dao.execute('getEventoToWs', query, value, function(err, result) {
            if (err) {
                logger.error("result error, EventosWsDAO.prototype.getEventoToWs ------ " + err);
                callback(total, qtdDias, diaTeste, err);
            } else {
                if (result.rows[0].TOTAL > 0) {
                    qtdDias += 1;
                }
                total += 1;
                callback(total, qtdDias, diaTeste, null);
            }
        });
    }
}

function verificarFeriado(id_posto, data, res, next) {
    return new Promise((resolve, reject) => {
        var value = {};

        var query = "SELECT E.ID_CATEGORIA AS CATEGORIA, E.DS_TITULO, E.DS_DESCRICAO FROM TBL_CALEND_EVENTO E" +
            " FULL JOIN TBL_CALEND_EVENTO_LOCAL LE ON  LE.ID_EVENTO = E.ID" +
            " FULL JOIN TBL_LOCAL L ON L.ID_LOCAL = LE.ID_LOCAL" +
            " WHERE E.DT_INICIO = TO_DATE('" + data + "', 'DD/MM/YYYY') " +
            " AND (E.ID_CATEGORIA IN (1, 3) OR E.ID_CATEGORIA IN (2, 11) AND (L.CD_POSTO = '" + id_posto + "' OR LE.ID_LOCAL = '999999'))"

        dao.execute('verificarFeriado', query, value, function(err, result) {
            if (err) {
                logger.error("result error, EventosWsDAO.prototype.verificarFeriado ------ " + err);
                res.send(err)
            } else {
                if (result.rows.length > 0) {
                    res.send(result.rows)
                } else {
                    res.sendStatus(404)
                }
            }
        });
    })
}
  
module.exports = function() {
    return EventosWsDAO;
}