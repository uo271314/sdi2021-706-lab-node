module.exports = function(app, gestorBD) {

    app.get("/api/cancion", function(req, res) {
        gestorBD.obtenerCanciones( {} , function(canciones) {
            if (canciones == null) {
                res.status(500);
                res.json({
                    error : "se ha producido un error"
                })
            } else {
                res.status(200);
                res.send( JSON.stringify(canciones) );
            }
        });
    });

    app.get("/api/cancion/:id", function(req, res) {
        let criterio = { "_id" : gestorBD.mongo.ObjectID(req.params.id)};

        gestorBD.obtenerCanciones(criterio,function(canciones){
            if ( canciones == null ){
                res.status(500);
                res.json({
                    error : "se ha producido un error"
                })
            } else {
                res.status(200);
                res.send( JSON.stringify(canciones[0]) );
            }
        });
    });

    app.delete("/api/cancion/:id", function(req, res) {
        let criterio = {"_id": gestorBD.mongo.ObjectID(req.params.id)};
        let cancion_id = gestorBD.mongo.ObjectID(req.params.id);
        let usuario = res.usuario;
        var errors = new Array();

        usuarioEsAutor(usuario, cancion_id, function (isAutor) {
            if (isAutor) {
                        gestorBD.eliminarCancion(criterio, function (canciones) {
                            if (canciones == null) {
                                errors.push("Se ha producido un error al borrar la canción");
                                res.status(500);
                                res.json({
                                    errores: errors
                                })
                            } else {
                                res.status(200);
                                res.json({
                                    mensaje: "Canción eliminada correctamente",
                                    _id: req.params.id
                                })
                            }
                        });
            } else {
                errors.push("El usuario no está autorizado para eliminar la canción.")
                res.status(500);
                res.json({
                    errores: errors
                })
            }
        });
    });

    app.post("/api/cancion", function(req, res) {
        var cancion = {
            nombre: req.body.nombre,
            genero: req.body.genero,
            precio: req.body.precio,
            autor: res.usuario
        }

        validadorNuevaCancion(cancion, function (errors) {
            if (errors !== null && errors.length > 0) {
                res.status(403);
                res.json({
                    errores: errors
                })
            } else {
                gestorBD.insertarCancion(cancion, function (id) {
                    if (id == null) {
                        errors.push("Se ha producido un error");
                        res.status(500);
                        res.json({
                            errores: errors
                        })
                    } else {
                        res.status(201);
                        res.json({
                            mensaje: "Canción insertada correctamente",
                            _id: id
                        })
                    }
                })
            }
        });
    });

    app.post("/api/cancion", function(req, res) {
        let cancion = {
            nombre : req.body.nombre,
            genero : req.body.genero,
            precio : req.body.precio,
        }
        // ¿Validar nombre, genero, precio?

        gestorBD.insertarCancion(cancion, function(id){
            if (id == null) {
                res.status(500);
                res.json({
                    error : "se ha producido un error"
                })
            } else {
                res.status(201);
                res.json({
                    mensaje : "canción insertada",
                    _id : id
                })
            }
        });

    });

    app.put("/api/cancion/:id", function(req, res) {
        cancion_id = gestorBD.mongo.ObjectID(res,params,id);
        usuario = res.usuario;
        let criterio = { "_id" : gestorBD.mongo.ObjectID(req.params.id) };

        let cancion = {}; // Solo los atributos a modificar
        if ( req.body.nombre != null)
            cancion.nombre = req.body.nombre;
        if ( req.body.genero != null)
            cancion.genero = req.body.genero;
        if ( req.body.precio != null)
            cancion.precio = req.body.precio;

        var errors = new Array();
        usuarioEsAutorCancion(usuario, cancion_id, function (isAutor){
          if (isAutor){
              validadorActualizarCancion(cancion,function (errors){
                  if (errors !== null && errors.length > 0){
                      res.status(403);
                      res.json({
                          errores: errors
                      })
                  } else {
                      gestorBD.modificarCancion(criterio, cancion, function(result) {
                          if (result == null) {
                              res.status(500);
                              res.json({
                                  error : "Se ha producido un error al modificar la canción."
                              })
                          } else {
                              res.status(200);
                              res.json({
                                  mensaje : "canción modificada",
                                  _id : req.params.id
                              })
                          }
                      });
                  }
              });
          } else {
              errors.push("Usuario no autorizado para modificar el contenido");
              res.status(500);
              res.json({
                  errores: errors
              })
          }
        });
    });

    app.post('/api/autenticar', function(req, res){
        let seguro = app.get("crypto").createHmac('sha256', app.get('clave'))
            .update(req.body.password).digest('hex');

        let criterio = {
            email : req.body.email,
            password : seguro
        }

        gestorBD.obtenerUsuarios(criterio, function(usuarios){
            if (usuarios == null || usuarios.length == 0){
                res.status(401); //Unauthorized
                res.json({
                    autenticado :false
                })
            }
            else{
                let token = app.get('jwt').sign(
                    {usuario: criterio.email , tiempo: Date.now()/1000},
                    "secreto");
                res.status(200);
                res.json({
                    token : token
                })
            }
        })
    })

    function validadorNuevaCancion(cancion, functionCallback){
        let errors = new Array();
        if (cancion.nombre === null || typeof cancion.nombre === 'undefined' || cancion.nombre === "")
            errors.push("El nombre de la canción no puede estar vacío.");
        if (cancion.nombre.length < 2 || cancion.nombre.length > 10)
            errors.push("El nombre de la canción debe tener entre (2-10) caracteres.")
        if (cancion.genero === null || typeof cancion.genero === 'undefined' || cancion.genero === "")
            errors.push("El género de la canción no puede estar vacío.")
        if (cancion.precio === null || typeof cancion.precio === 'undefined' || cancion.genero === "")
            errors.push("El precio de la canción no puede estar vacío.");
        if (cancion.precio < 0)
            errors.push("El precio de la canción no puede ser negativo.");

        if (errors.length <= 0)
            functionCallback(null);
        else
            functionCallback(errors);

    }

    function validadorActualizarCancion(usuario, functionCallback){
        let errors = new Array();
        if (cancion.nombre === null || typeof cancion.nombre === 'undefined' || cancion.nombre === "")
            errors.push("El nombre de la canción no puede estar vacío.");
        if (cancion.nombre.length < 2 || cancion.nombre.length > 10)
            errors.push("El nombre de la canción debe tener entre (2-10) caracteres.")
        if (cancion.genero === null || typeof cancion.genero === 'undefined' || cancion.genero === "")
            errors.push("El género de la canción no puede estar vacío.")
        if (cancion.precio === null || typeof cancion.precio === 'undefined' || cancion.genero === "")
            errors.push("El precio de la canción no puede estar vacío.");
        if (cancion.precio < 0)
            errors.push("El precio de la canción no puede ser negativo.");

        if (errors.length <= 0)
            functionCallback(null);
        else
            functionCallback(errors);
    }

    function usuarioEsAutor(usuario, cancionId, functionCallback){

        let criterio = { "_id" : cancionId };
        gestorBD.obtenerCanciones(criterio,function(canciones){
           if (canciones[0].autor === usuario)
               functionCallback(true);
           else
               functionCallback(false);
        });
    }

}