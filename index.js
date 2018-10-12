const dbQuery = require("./util/db")
const got = require("got")

let symbols = {}
const limit = 1 // increase if historical data is needed (days)
async function initial() {
    // fetch symbols from db
    symbols = (await dbQuery("SELECT * FROM m_symbol")).recordset

    iterate()

    // start iterations
    setInterval(
        iterate,
        1000 * 60 * 60 * 6
    )
}

async function iterate() {
    await Object.values(symbols).map(async(e) => {
        const rub = (await got(`https://min-api.cryptocompare.com/data/histoday?fsym=${e.symbol}&tsym=RUB&limit=${limit}&toTs=${Math.floor((new Date().getTime())/1000)}`, {
            json: true
        })).body

        const eur = (await got(`https://min-api.cryptocompare.com/data/histoday?fsym=${e.symbol}&tsym=EUR&limit=${limit}&toTs=${Math.floor((new Date().getTime())/1000)}`, {
            json: true
        })).body

        const usd = (await got(`https://min-api.cryptocompare.com/data/histoday?fsym=${e.symbol}&tsym=USD&limit=${limit}&toTs=${Math.floor((new Date().getTime())/1000)}`, {
            json: true
        })).body

        let f = {}
        if (limit === 1) {
            usd.Data = [usd.Data[1]]
            rub.Data = [rub.Data[1]]
            eur.Data = [eur.Data[1]]
        }
        usd.Data.map((e) => {
            const date = new Date(e.time*1000);
            f[e.time] = {time: (date.getFullYear()+'-'+(date.getMonth()+1)+'-'+date.getDate())}
            f[e.time].usd = e.close
        })

        eur.Data.map((e) => {
            f[e.time].eur = e.close
        })

        rub.Data.map((e) => {
            f[e.time].rub = e.close
        })

        let str = []
        Object.values(f).map(async(a) => {
            str.push(`(${a.usd}, ${a.eur}, ${a.rub}, '${a.time}', ${e.id}, ${Math.floor((new Date().getTime())/1000)}, '${(new Date().getHours()+':'+new Date().getMinutes())}')`)
        })

        dbQuery(`INSERT INTO m_prices(rate_USD, rate_EUR, rate_RUR, date, symbol_id, created_at, daytime) VALUES${str.join(',')};`)

        console.log("Synchronized")
    })
}

initial()