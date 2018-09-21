const path = require('path')
const express = require('express')
const zipdb = require('zippity-do-dah')
const ForecastIo = require('forecastio')

const app = express()
const weather = new ForecastIo("e0abee69e3809814c27d15814c3a6876") // creamos un objeto de tipo forecastio con la key que nos da la pagina

app.use(express.static(path.resolve(__dirname, 'public'))); // Sirve documentos estaticos en public

app.set('views', path.resolve(__dirname, 'views')) // le decimos donde estan las vistas
app.set('view engine', 'ejs') // les decimos que engine vamos a usar

app.get('/', (req, res) => {
    res.render('index');
})

app.get(/^\/(\d{5})$/, (req, res, next) => {
    var zipcode = req.params[0] // captura el codigo postal y lo pasa como req.params
    var location = zipdb.zipcode(zipcode) // graba los datos de la locacion
    if (!location.zipcode) { // Return cuando no encuentra resultado. 
        next() // Continua si es distinto de vacio
        return
    }

    var latitude = location.latitude
    var longitude = location.longitude

    weather.forecast(latitude, longitude, (err, data) => {
        if (err) {
            next()
            return
        }

        res.json({ // Envia este objeto json con un metodo de express
            zipcode: zipcode,
            temperature: data.currently.temperature
        })
    })
});

app.use((req, res) => { // Renderizamos la pagina 404 si se apunta a cualquier ruta
    res.status(404).render('404')
});

app.listen(3000, () => {
    console.log('Server started on port 3000')
})