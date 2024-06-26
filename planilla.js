const express =require('express');
require('dotenv').config();
const cors=require('cors');
const {dbConnection} = require('./database/config');
const bodyParser = require('body-parser');

const app=express();

app.use(cors());

app.use(bodyParser.json({ limit: '20mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '20mb' }));

dbConnection();

app.use('/planilla/excel', require('./routes/excel'));
app.use('/planilla/user', require('./routes/usuarios'));

app.listen( process.env.PORT, () =>{
    console.log('Iniciando');
});