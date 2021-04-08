module.exports = function(app, swig, mcomentarios) {
    app.post('/comentarios/:cancion_id', function (req,res) {
        let cancion_id = mcomentarios.mongo.ObjectId(req.params.cancion_id);
        let autor = req.session.usuario;
        if (autor == null)
            autor = "Usuario no registrado";

        let comentario = {
            autor: autor,
            texto: req.body.texto,
            cancion_id: cancion_id
        }

        mcomentarios.insertarComentario(comentario, function(result){
            if (result == null)
                res.send("Error al insertar comentario");
            else
                res.redirect('/cancion/' + req.params.cancion_id);
        });
    });
}