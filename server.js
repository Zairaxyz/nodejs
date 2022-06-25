const express = require('express');
const path = require('path');
const mysql = require('mysql');
const dotenv = require('dotenv');
const cookieparser = require('cookie-parser');

dotenv.config({ path:'./.env'});

const app = express();

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

const db = mysql.createConnection({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE
});

const publicDirectory = path.join(__dirname, './public');
app.use(express.static(publicDirectory));

app.use(express.urlencoded({ extended: false }));

app.use(express.json());
app.use(cookieparser());

db.connect( (error) => {
    if(error) {
        console.log('connect error mysql')
    } else {
        console.log('Mysql Connected ....')
    }
});

app.use('/', require('./routes/pages'));
app.use('/auth', require('./routes/auth'));


app.listen(3000, (req, res) => {
    console.log('Server Connected port 3000 ....')
});