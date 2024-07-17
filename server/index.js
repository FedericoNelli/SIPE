const express = require("express");
const app =  express();
const mysql = require("mysql");

const dbSIPE = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "sipe",
});

app.listen(3001, () =>{
    console.log("Corriendo en puerto 3001")
})

