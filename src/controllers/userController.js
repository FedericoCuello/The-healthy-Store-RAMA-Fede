const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');
let usuarios = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../data/usuarios.json')));

const userController = {
        
    login: function (req, res) {

        res.render(path.resolve(__dirname, '..', 'views','user', 'login'));
    },
    index: function (req, res) {

        res.render(path.resolve(__dirname, '..', 'views', 'user', 'index'),{usuarios});
    },
    registro: function (req, res) {
        res.render(path.resolve(__dirname, '..', 'views','user', 'registro'));
    },
    show: function (req, res) {
        let usuarioId = req.params.id;
        const usuarioShow = usuarios.find(u => u.id == usuarioId);
        res.render(path.resolve(__dirname, '..', 'views', 'user', 'detail'), {
            usuarioShow
        });
    },

    create: function (req, res) {
            let errors=validationResult(req);
         if(errors.isEmpty()){
            let usuarios = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../data/usuarios.json')));
            let usuariosTotales = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../data/usuarios.json')));
            let ultimoUsuario = usuariosTotales.pop();

            let nuevoUsuario = {
                id: ultimoUsuario.id + 1,
                nombre: req.body.nombre,
                email: req.body.email,
                telefono: Number(req.body.telefono),
                contraseña:  bcrypt.hashSync(req.body.password, 10),
                imagen: req.file ? req.file.filename : ""
            
            }
            usuarios.push(nuevoUsuario);
            usuariosJSON = JSON.stringify(usuarios, null, 2);
            fs.writeFileSync(path.resolve(__dirname, '../data/usuarios.json'), usuariosJSON);
            res.redirect('/login');
         }else{
            return res.render(path.resolve(__dirname, '../views/user/registro'), {
                errors: errors.errors, old: req.body
              });
         }    
    },
     edit: function (req, res) {
         let usuarioId = req.params.id;
         const usuarioEdit = usuarios.find(u => u.id == usuarioId);
         res.render(path.resolve(__dirname, '..', 'views', 'user', 'edit'), {
             usuarioEdit
         });
     },
      update: function (req, res) {

              let usuarios = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../data/usuarios.json')));
              req.body.id = req.params.id;
              let usuariosUpdate = usuarios.map(u => {
                  if (u.id == req.body.id) {

                          u.nombre = req.body.nombre,
                          u.email = req.body.email,
                          u.telefono = Number(req.body.telefono),
                          u.contraseña = req.body.contraseña,
                          u.imagen = req.file ? req.file.filename : ""
                  }
                  return u;
              });
              usuariosJSON = JSON.stringify(usuariosUpdate, null, 2);
              fs.writeFileSync(path.resolve(__dirname, '../data/usuarios.json'), usuariosJSON);
              res.redirect('/usuarios');
          },
          delete: function (req, res) {
              let usuarioId = req.params.id;
              const usuarioDelete = usuarios.find(u => u.id == usuarioId);
              res.render(path.resolve(__dirname, '..', 'views', 'user', 'delete'), {
                  usuarioDelete
              });
          },
          destroy: function (req, res) {
              let usuarios = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../data/usuarios.json')));
              const usuarioId = req.params.id;
              const usuarioDestroy = usuarios.filter(u => u.id != usuarioId);
              usuariosJSON = JSON.stringify(usuarioDestroy, null, 2);
              fs.writeFileSync(path.resolve(__dirname, '../data/usuarios.json'), usuariosJSON);
              res.redirect('/usuarios');
          },
          ingresar: function(req,res){
            const errors = validationResult(req); 
            if(errors.isEmpty()){
                let usuarios = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../data/usuarios.json')));
                let usuarioLogueado = usuarios.find(u => u.email == req.body.email)
                delete usuarioLogueado.contraseña;
                req.session.usuario = usuarioLogueado;
                if(req.body.recordarme){
                    res.cookie('email',usuarioLogueado.email,{maxAge: 1000 * 60 * 60 * 24})
                  }
                  return res.redirect('/');
                }else{
                    res.render(path.resolve(__dirname, '../views/user/login'),{errors:errors.mapped(),old:req.body});  
                }
          },
          logout: function(req,res){
            req.session.destroy();
            res.cookie('email',null,{maxAge: -1});
            res.redirect('/')
          }
}

module.exports = userController;
