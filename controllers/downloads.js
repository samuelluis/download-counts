var mysql = require('mysql')

/**
 * Valid periods: 2014-02-01, 2014-01-02:2014-01-04, last-day, last-week
 * @param periodString
 * @returns {*}
 */
var parsePeriod = function(periodString) {
  var dates = periodString.split(':')
  if (!dates[0]) {
    return false;
  }
  var start = dates[0]
  var end = null;
  if (dates[1]) {
    end = dates[1]
  }
  return {
    start: start,
    end: end
  }
}

exports.point = function (request, reply) {

  request.server.plugins['hapi-mysql'].pool.getConnection(function(err, connection) {

    console.log(request.params)

    var sql = 'SELECT package, downloads FROM downloads WHERE day >= ? and day <= ?'
    var bindValues = []

    var period = parsePeriod(request.params.period)

    var packageName = request.params.package
    if(packageName) {
      sql += ' AND package = ?'
      bindValues.push(packageName)
    }

    // Use the connection
    connection.query(
      sql,
      bindValues,
      function(err, rows) {

        if(err) {
          throw new Error(err)
        }

        // And done with the connection.
        connection.release();

        if (rows.length == 0) {
          reply({
            error: "no stats for this package for this period"
          })
        } else {
          var result = rows[0]

          reply({
            package: result.package,
            downloads: result.downloads
          });
        }

      }
    );
  });

}

exports.range = function(request, reply) {
  reply({
    error: "Not implemented"
  })
}