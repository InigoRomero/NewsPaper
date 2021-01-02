
var database = require('./../database');
var bodyParser = require('body-parser');
var express = require('express');
var session = require('express-session');
var charts = require('chart.js');

var router = express.Router();

var username;
var typouser;


var LoadArticulos = async function(){
  let arts = await database.articulos();
  return arts;
}

router.get('/',async function(req, res, next) {
  //Comprobar si hay sesión iniciada y que tipo de sesión
  let arts = await LoadArticulos();
  let users = await database.getUsers();
  if(session.user){
   
    typouser = session.typouser;
    if(session.typouser == "Escritor"){
      username = session.user;
      res.render('index',{username : username, typouser: "Escritor", vista: "home", arts: arts});
    }else if(session.typouser == "admin"){
      username = session.user;
      res.render('index',{username : username, typouser: "admin", vista: "backendHome", users:users});
    }
  }else{
    res.render('index',{username : undefined, typouser: "Lector", vista: "home", arts: arts});
  }
});

//cargar vista contact ----------------------------------------------------------------
router.get("/contact", function(req, res) {
  if(session.user){
    username = session.user;
    res.render(__dirname + "/../views/index.ejs", {username : username, typouser: session.typouser, vista: "contact"});
  }else{
    res.render(__dirname + "/../views/index.ejs", {username : undefined, typouser: "Lector", vista: "contact"});
  }
});

//cargar vista home ----------------------------------------------------------------
router.get("/home", async function(req, res) {
  let arts = await LoadArticulos();
  if(session.user){
      
    typouser = session.typouser;
    username = session.user;
    res.render(__dirname + "/../views/index.ejs", {username : username, typouser: session.typouser, vista: "home", arts:arts});
  }else{
    res.render(__dirname + "/../views/index.ejs", {username : undefined, typouser: "Lector", vista: "home", arts:arts});
  }
});
//cargar vista Poema ----------------------------------------------------------------
router.get("/poemas", async function(req, res) {
  let arts = await database.articulosPoema();
  if(session.user){
    username = session.user;
    res.render(__dirname + "/../views/index.ejs", {username : username, typouser: session.typouser, vista: "home", arts:arts});
  }else{
    res.render(__dirname + "/../views/index.ejs", {username : undefined, typouser: "Lector", vista: "home", arts:arts});
  }
});
//cargar vista Cuento ----------------------------------------------------------------
router.get("/cuentos", async function(req, res) {
  let arts = await database.articulosCuento();
  if(session.user){
    username = session.user;
    
    res.render(__dirname + "/../views/index.ejs", {username : username, typouser: session.typouser, vista: "home", arts:arts});
  }else{
    res.render(__dirname + "/../views/index.ejs", {username : undefined, typouser: "Lector", vista: "home", arts:arts});
  }
});
//cargar vista Relatos Largos ----------------------------------------------------------------
router.get("/relatos", async function(req, res) {
  let arts = await database.articulosRelatos();
  if(session.user){
    username = session.user;
    res.render(__dirname + "/../views/index.ejs", {username : username, typouser: session.typouser, vista: "home", arts:arts});
  }else{
    res.render(__dirname + "/../views/index.ejs", {username : undefined, typouser: "Lector", vista: "home", arts:arts});
  }
});
//cargar vista Relatos Micro Relatos ----------------------------------------------------------------
router.get("/microrelatos", async function(req, res) {
  let arts = await database.articulosMicro();
  if(session.user){
    username = session.user;
    res.render(__dirname + "/../views/index.ejs", {username : username, typouser: session.typouser, vista: "home", arts:arts});
  }else{
    res.render(__dirname + "/../views/index.ejs", {username : undefined, typouser: "Lector", vista: "home", arts:arts});
  }
});
//cargar vista  Escribe ----------------------------------------------------------------
router.get("/escribe", function(req, res) {
  if(session.user){
    username = session.user;
    res.render(__dirname + "/../views/index.ejs", {username : username, typouser: session.typouser, vista: "escribe"});
  }else{
    res.render(__dirname + "/../views/index.ejs", {username : undefined, typouser: "Lector", vista: "escribe"});
  }
});
/*BACKEND*/
router.get("/homeB", async function(req, res){
  username = session.user;
  let arts = await LoadArticulos();
  let users = await database.getUsers();
  if (username){
    res.render(__dirname + "/../views/index.ejs", {username : username, typouser: "admin", vista: "backendHome", arts: arts, users: users});
  }else{
    res.render(__dirname + "/../views/index.ejs", {username : undefined, typouser: "Lector", vista: "home", arts: arts, users: users});
  }
});
router.get("/usuariosB", async function(req, res){
  let users = await database.getUsers();
  username = session.user;
  if (session.user){
    res.render(__dirname + "/../views/index.ejs", {username : username, typouser: "admin", vista: "backendUsers", users: users});
}else{
    let arts  =  await LoadArticulos();
    res.render(__dirname + "/../views/index.ejs", {username : undefined, typouser: "Lector", vista: "home", arts: arts});
}
});
router.get("/artsB", async function(req, res){
  let arts = await LoadArticulos();
  if (session.user){
    username = session.user;
    res.render(__dirname + "/../views/index.ejs", {username : username, typouser: "admin", vista: "backendArts", arts: arts});
  }else{
    res.render(__dirname + "/../views/index.ejs", {username : undefined, typouser: "Lector", vista: "home", arts: arts});
  }
});

//cerrarSesionr
router.get("/CerrarSesion", async function(req, res, next) {
  session.user = undefined;
  session.typouser = undefined;
  let arts = await LoadArticulos();
  username = null;
  res.render('index',{username : undefined, typouser: "Lector", vista: "home", arts: arts});
});
router.post("/articuloUnico", async function(req, res) {

  let arts  =  await database.articuloUnico(req.body.arttitulo);

  if(session.user){
    username = session.user;
    res.render(__dirname + "/../views/index.ejs", {username : username, typouser: session.typouser, vista: "articulounico",arts: arts});
  }else{
    res.render(__dirname + "/../views/index.ejs", {username : undefined, typouser: "Lector", vista: "articulounico",arts: arts});
  }
});

module.exports = router;



