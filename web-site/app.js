const express = require('express');
const database = require('./database');
const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
var bodyParser = require('body-parser');
const path = require('path');
var session = require('express-session');
const app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var jwt = require('jsonwebtoken');

var sessionMiddleware = session({
    secret: "keyboard cat"
  });

//configuración para enviar mails
var nodemailer = require('nodemailer');
let transporter = nodemailer.createTransport({
  service: 'gmail',
  secure: false,
  port: 25,
  auth: {
    user: 'emailpruebasegoi@gmail.com',
    pass: '2DAW31819'
  },
  tls: {
    rejectUnauthorized: false
  }
});

database.initializeMongo();

server.listen(3000, function(){
    console.log("Servidor corriendo en http://192.168.1.38:3000");
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));
// Session ---------------------------
app.use(session({secret: '123456', resave: true, saveUninitialized: true}));

app.get('/miBBDD', function(req, res){
    database.Usuario.find(function (err, kittens){
        if (err) return res.error(err);
        console.log(kittens);
        res.json(kittens);
    });
});

app.use('/', indexRouter);
app.use('/users', usersRouter);

// LOGIN *******************************************************

var router = express.Router();

router.get("/", function(req, res, next) {
    res.render("login", {
    });
});
var users = []; 
let namespace = null;
let ns = io.of(namespace || "/");
//WEBSOCKET
ns.on('connection', function(socket){

    socket.on('conection', (userName) => {
        users.push({
            id : socket.id,
            userName : userName
        });

        let len = users.length;
        len--;

        ns.emit('userList',users,users[len].id);
    });
    //disconect
    socket.on('disconnect',()=>{
        for(let i=0; i < users.length; i++){

            if(users[i].id === socket.id){
                users.splice(i,1);
            }
        }
        ns.emit('exit',users);
    });

    socket.on('activacion', async function(data){
        await database.activarUsuario(data);
        //enviar la respuesta de que se ha actualizado el usuario
        enviarMail(data, "Activación cuenta", "Se ha activado el usuario satisfactoriamente");
        ns.emit('activacionCorrecta', data);
    });
    socket.on('ComprobarLogin', async function(data){
        var user = data.user;
        var pw = data.pass;
        //los enviamos a una función del modelo BBDD
        let logged = await database.login(user, pw);
        let i = 0;
        while( i < users.length)
        {
            if(users[i].userName == data.userName)
                break ;
            i++;
        }
        if (!logged)
        {
            ns.to(users[i].id).emit('FailedLogin');
        }
        else{
            session.user=user;
            session.typouser=logged;

            var sesion={
                tipo: logged,
                user: user
            }
            ns.to(users[i].id).emit('LoginComprobado', sesion);
        }
    });

    socket.on('registrarUser', async function(data){
        var newUser={
            TipoUsuario: data.tipousuario,
            Correo: data.mail,
            Nombre: data.name,
            Apellidos: data.surname,
            username: data.user,
            password: data.pwCheck,
            Activado: false
        }
        //registramos el nuevo usuario
        await database.register(newUser);
        //enviamos la notificación
        console.log(users);
        let i = 0;
        while( i < users.length)
        {
            if(users[i].userName == data.userName)
                break ;
            i++;
        }
        ns.to(users[i].id).emit('registroCorrecto', data);
    });

    //eliminar usuario
    socket.on('eliminarUser', async function(data){
        await database.eliminarUsuario(data);
        //enviar la respuesta de que se ha eliminado el usuario
        let i = 0;
        while( i < users.length)
        {
            if(users[i].userName == data.userName)
                break ;
            i++;
        }
        ns.to(users[i].id).emit('eliminacionCorrecta', data);
    });

    socket.on('eliminarArt', async function(data){
        await database.eliminarArticulo(data);
        //enviar la respuesta de que se ha eliminado el artículo
        let i = 0;
        while( i < users.length)
        {
            if(users[i].userName == data.userName)
                break ;
            i++;
        }
        ns.to(users[i].id).emit('eliminacionArtCorrecta', data);
    });

    socket.on('ComentarArticulo', function(data){
        data.OrigenComentario=session.user;
        
        database.ComentarArticulo(data);
        console.log("Se ha enviado el comentario");
        //enviar la respuesta de que se ha enviado el comentario
        ns.emit('ArticuloComentado', data.ArticuloTitulo);
    });
       //añadir articulo
       socket.on('registrarArticulo', async function(data){
        var newArt={ 
            titulo: data.titulo,
            TipoArticulo: data.tipoArt,
            imagen: "9.jpg",
            autor: data.autor,
            Descripción: data.descrip,
            Contenido: data.art
        }
        //registramos el nuevo usuario
         await  database.registrarArticulo(newArt);
        //enviamos la notificaciónS
        let i = 0;
        console.log(users);
        while( i < users.length)
        {
            if(users[i].userName == data.userName)
                break ;
            i++;
        }
        ns.to(users[i].id).emit('ArticuloEnviado');
    });
});

 

function enviarMail(destino, asunto, mensaje){
    let HelperOptions = {
        from: '"Iñigo" <noreply@Amalgama.com',
        to: destino,
        subject: asunto,
        html: mensaje
      };
      
      transporter.sendMail(HelperOptions, (error, info) => {
        if (error) {
            return console.log(error);
        }
        console.log("The message was sent!");
        console.log(info);
    });
}

module.exports = router;
module.exports = app;