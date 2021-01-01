const mongoose = require('mongoose');
const DATABASE_CONNECTION = 'mongodb://mongo/miBBDD';
var UserSchema = mongoose.Schema({
    //usuarios
    TipoUsuario: String,
    Correo: String,
    Nombre: String,
    Apellidos: String,
    username: String,
    password: String,
    Activado: Boolean,
    //articulos
    titulo: String,
    TipoArticulo: String,
    imagen: String,
    autor: String,
    Descripcion: String,
    Contenido: String,
    //Comentarios
    Comentario: String,
    ArticuloTitulo: String,
    PropietarioArticulo: String,
    OrigenComentario: String
});

Usuario = exports.Usuario = mongoose.model('usuarios', UserSchema);
var userModel = mongoose.model('usuarios',UserSchema);
var db = mongoose.connection;
exports.initializeMongo = async function(){
    mongoose.connect(DATABASE_CONNECTION, {useNewUrlParser: true});
    console.log('Trying to connect to ' + DATABASE_CONNECTION);
    db.createCollection("usuarios");
    //Create ADMIN USER IF is first time launching APP
    await userModel.findOne({username: "Sapo"}, function(err, c) { // el wait es necesario, ya que si no se ejecuta despues.
        if(c!=null){
            console.log("Bienvenido de Vuelta");
        }else{
            adminUser = {    
                TipoUsuario: "admin",
                Correo: "iromero-@student.42madrid.com",
                Nombre: "Iñigo",
                Apellidos: "Romero",
                username: "Sapo",
                password: "admin",
                Activado: true
            };
            userModel.insertMany(adminUser, function(err, result) {
                if (err) {
                  console.log(err);
                } else {
                  console.log("Administrador creado");
                }
              });
        }
     });
    db = mongoose.connection;
    db.on('error', console.error.bind(console, 'Connection error: We might not be as connected as I thought'));
    db.once('open', function(){
        console.log('Estamos conectados a la base de datos!');
    });
}

var add= false;
//Funcion para el login LOGIN----------------------------------------------------
exports.login =async function(user, pws){

      await userModel.findOne({username: user, password: pws}, function(err, c) { // el wait es necesario, ya que si no se ejecuta despues.
          if(c!=null){
              if (c.Activado){
                add=c.TipoUsuario;
              }else{
                add= false;
              }
          }else{
            add= false;
          }
          
       });
       return add;
}

// Registro -----------------------------------------------------------------------
exports.register =function(user){
    db.collection("usuarios").bulkWrite( [
        { insertOne : user }
     ] );
}

// Devuelve los últimos articulos
exports.articulos = async function(){
    return await userModel.find({TipoArticulo: {$ne: undefined}});
}
// Devuelve los últimos articulos POEMA
exports.articulosPoema = async function(){
    return await userModel.find({TipoArticulo:"Poema"});
}
// Devuelve los últimos articulos CUENTO
exports.articulosCuento = async function(){
    return await userModel.find({TipoArticulo:"Cuento"});
}
// Devuelve los últimos articulos RELATOS LARGOS
exports.articulosRelatos = async function(){
    return await userModel.find({TipoArticulo:"Relato Largo"});
}
// Devuelve los últimos articulos MICRORELATO
exports.articulosMicro = async function(){
    return await userModel.find({TipoArticulo:"Microrelato"});
}
//Nuevo Articulo
exports.registrarArticulo =function(art){
    addNewArt(art);
}
function addNewArt(art){
    db.collection("usuarios").insertOne(art);
}
 // Devuelve articulo unico
 exports.articuloUnico = async function(art){
    
    return await userModel.findOne( {titulo: art});
}
//BACKEND

exports.getUsers =async function(){
   return await userModel.find({TipoUsuario: {$ne: "admin"}, Nombre: {$ne: undefined}});
}

exports.activarUsuario =async function(correo){
    await userModel.updateOne(
        {Correo: correo},
        {Activado: true}
    );
 }

 exports.eliminarUsuario =async function(correo){
    await userModel.deleteOne(
        {Correo: correo}
    );
 }
 exports.eliminarArticulo =async function(dato){
    await userModel.deleteOne(
        {titulo: dato}
    );
 }

 exports.ComentarArticulo =function(comentario){
    userModel.create(comentario);
 }
 