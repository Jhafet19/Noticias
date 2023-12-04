const mysql=require('mysql2');
let conexion=mysql.createConnection({
    host:'localhost',
    password:'root',
    user:'root',
    database:'noticion'
})

conexion.connect((err)=>{
    if(err){
        console.log(err);
        return;
    }
    console.log("Conexion realizada correctamente");
})

module.exports=conexion;