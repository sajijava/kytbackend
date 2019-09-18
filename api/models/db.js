'user strict';

const mysql = require('mysql');

const node_chef_config = {
  host: 'mysql-kytbackend-8050.nodechef.com:2419',
  user: 'ncuser_13537',
  password: 'Mpafth59MSf82WtHnVTlaxpFBUXxuM',
  database: 'kytbackend',
  port:2419,
  connectionLimit:10

}

const config = {
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'knowyourtown',
    connectionLimit:10
};

const pool = mysql.createPool(node_chef_config);


pool.getConnection((err, connection) => {
    if (err) {
        if (err.code === 'PROTOCOL_CONNECTION_LOST') {
            console.error('Database connection was closed.')
        }
        if (err.code === 'ER_CON_COUNT_ERROR') {
            console.error('Database has too many connections.')
        }
        if (err.code === 'ECONNREFUSED') {
            console.error('Database connection was refused.')
        }
    }
    if (connection) connection.release()
    return
})


module.exports = pool;
