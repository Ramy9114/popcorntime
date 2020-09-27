require('dotenv').config()

const session_storage = require('sessionstorage')
if(session_storage.length > 0){
    session_storage.removeItem('username')
}


const path = require('path')
const express = require('express');
const morgan = require('morgan')
const bodyParser = require('body-parser')
const exphbs = require('express-handlebars')
const mongoose = require('mongoose')
const session = require('express-session');
const flash = require('connect-flash')

//passport config
const passport = require('passport')
require('./routes/web/passport-config')(passport)

const moment = require('moment')

const movieRouter = require('./routes/web/mvs')
const movieApiRouter = require('./routes/api/mvs')

const authRouter = require('./routes/web/auth')


const connectMongoDB = require('./middlewares/mongodb')
connectMongoDB.connect()

const mySQL_Connection = require('./middlewares/mysql-connection')

const Handlebars = require("handlebars")




const app = express()


app.use(morgan('dev'))
app.use(bodyParser.json())
app.use(express.urlencoded({ extended: false }))

//express session
app.use(session({
    secret: "secret",
    resave: true,
    saveUninitialized: true
}));

//passport middleware
app.use(passport.initialize())
app.use(passport.session())

//connect flash
app.use(flash())




app.engine('.hbs', exphbs({
    extname: '.hbs',
    defaultLayout: 'main',
    helpers: {
        formatDate: function (date, format) {
            return moment(date, "YYYYMMDD").fromNow();
        },
        isEmpty: (value) => {
            return value === '';
        },
        isNotEmpty: (value) => {
            return value !== '';
        },
    }
}));
app.set('view engine', '.hbs')

app.use(express.static(path.join(__dirname, 'public')))
app.use(express.static(__dirname + '/node_modules/jquery/dist'));
app.use(express.static(__dirname + '/node_modules/bootstrap/dist'));
app.use(express.static(__dirname + '/node_modules/@fortawesome/fontawesome-free'));



//routers concerning movies
app.use('/mvs', movieRouter)
app.use('/api/mvs', movieApiRouter)

//routers concerning authentication
app.use('/auth', authRouter)

app.get('/', function (req, res) {
    res.send('It Works!')
})

// app.use((req, res, next) => {
//     // const error = new Error("Not Found!")
//     // error.status = 404
//     // next(error)
// })

app.listen(process.env.PORT, function () {
    console.log('Server is listening on localhost:3000')
})



// greater than
Handlebars.registerHelper('ge', function (a, b, options) {
    'use strict';
       if (a >= b) {
         return options.fn(this);
      }
      return options.inverse(this);
    });


// connectDB.close()