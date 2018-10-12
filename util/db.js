/*
create table m_symbol
(
  id     int         not null primary key,
  symbol varchar(16) not null,
  name   varchar(16)
)

create table m_prices
(
  rate_USD  float,
  rate_EUR  float,
  rate_RUR  float,
  date      int,
  symbol_id int
    constraint m_prices_m_symbol_id_fk
    references m_symbol
)
*/
const mssql = require('mssql')

const config = {
    user: '',
    password: '',
    server: '',
    database: '',
    options: {
        encrypt: true
    }
};

let connected = false
module.exports = async (sql) => {
    try {
        if (!connected) {
            await mssql.connect(config)
            connected = true
        }

        return await mssql.query(sql)
    } catch (err) {
        console.log(err)
        process.exit()
    }
}