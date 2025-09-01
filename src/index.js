const path = require('path');
require('dotenv').config({path: path.join(__dirname, '../.env')});

const express = require('express');
const cors = require('cors');
const {connectDB} = require('./utils/db');
const { Component } = require('react');

const app = express();
app.use(cors({origin: 'http://localhost:5173',credentials: true}));
app.use(express,json());

app.use('/api/auth', require('./routes/auth'));

const PORT = process.env.PORT || 5000;

//값 검증 (비밀값은 노출하지 않음)
if (!process.env.MONGO_URI) {
    console.error('MONGO_URI is missing. check server/.env');
    process.exit(1)
};

(async ()=> {
    try {
        await connectDB(process.env.MONGO_URI);
        app.listen(PORT, () => console.log(`Server on hhtp://localhost:${PORT}`));
    }catch (e) {
        console.error('Failed to start server:',e.message);
        process.exit(1);
    }
})();