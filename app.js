require('dotenv').config();

const express = require('express');
const expressLayout = require('express-ejs-layouts');
const methodOverride = require('method-override');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const mongoose = require('mongoose');
const cors = require('cors');

// const connectDB = require('./server/config/db');
const { isActiveRoute } = require('./server/helpers/routerHelpers');

const app = express();
const port = process.env.PORT || 3000;

// Connect to database
// connectDB();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(methodOverride('_method'));
app.use(cors({
    origin: [process.env.CORS_JAVAJITSU, process.env.CORS_LOCALHOST]
}));

app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({
        mongoUrl: process.env.MONGO_URL
    })
}))

app.use(express.static('public'));

// Templating engine
app.use(expressLayout);
app.set('layout', './layouts/main');
app.set('view engine', 'ejs');

app.locals.isActiveRoute = isActiveRoute;

app.use('/', require('./server/routes/main'));
app.use('/', require('./server/routes/admin'));

// app.listen(port, "0.0.0.0", () => {
//     console.log(`App listening on port: ${port}`);
// });

mongoose.connect(process.env.MONGO_URL)
    .then(() => app.listen(port, () => console.log(`Listening on port ${port}`)))
    .catch((err) => console.log('Something went wrong, when connecting to Mongo: ' + err));