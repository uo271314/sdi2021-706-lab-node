module.exports = function(app, swig) {
    app.get("/autores", function(req, res) {
        let autores = [{
            "nombre": "Roberto Iniesta",
            "grupo": "Extremoduro",
            "rol": "Guitarrista"
        },{
            "nombre": "Claudio Parolari",
            "grupo": "Kamikazes",
            "rol": "Batería"
        },{
            "nombre": "Stevie Wonder",
            "grupo": "Stevie Wonder",
            "rol": "Teclista"
        }];

        let respuesta = swig.renderFile('views/autores.html', {autores: autores});

        res.send(respuesta);
    });

    app.get('/autores/agregar', function (req, res) {
        let respuesta = swig.renderFile('views/autores-agregar.html', {});
        res.send(respuesta);
    })

    app.get('/autores', function(req, res) {

    })

    app.post("/autor", function(req, res){
        let undef = "no enviado en la petición" + "<br>";
        let respuesta = "Autor agregado: ";

        if (req.body.nombre.trimEnd() != "")
            respuesta += req.body.nombre + "<br>";
        else
            respuesta += undef;
        respuesta += "Grupo: ";
        if (req.body.grupo.trimEnd() != "")
            respuesta += req.body.grupo + "<br>";
        else
            respuesta += undef;
        respuesta += "Rol: " + req.body.rol;
        res.send(respuesta);
    });

    app.get("/autores/*", function(req, res){
        res.redirect("/autores");
    });
}