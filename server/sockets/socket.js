const { io } = require('../server');
const { Ususarios } = require('../classes/usuarios');
const { crearMensaje } = require('../utilidades/utilidades')

const usuarios = new Ususarios();

io.on('connection', (client) => {

    client.on('entrarChat', (data, callback) => {

        //console.log(data);

        if (!data.nombre || !data.sala) {
            return callback({
                err: true,
                mensaje: 'El nombre/Sala es necesario'
            })
        }

        client.join(data.sala);

        usuarios.agregarPersona(client.id, data.nombre, data.sala);

        client.broadcast.to(data.sala).emit('listaPersona', usuarios.getPersonasPorSalas(data.sala));

        callback(usuarios.getPersonasPorSalas(data.sala));
    });

    client.on('crearMensaje', (data) => {

        let persona = usuarios.getPersona(client.id);

        let mensaje = crearMensaje(persona.nombre, data.mensaje);
        client.broadcast.to(persona.sala).emit('crearMensaje', mensaje);

    });

    client.on('disconnect', () => {

        let personaborrada = usuarios.borrarPersona(client.id);

        client.broadcast.to(personaborrada.sala).emit('crearMensaje', crearMensaje('Administrador', `${ personaborrada.nombre} Salio`));
        client.broadcast.to(personaborrada.sala).emit('listaPersona', usuarios.getPersonasPorSalas(personaborrada.sala));

    });

    //Mensajes privados
    client.on('mensajePrivado', data => {
        let persona = usuarios.getPersona(client.id);
        client.broadcast.to(data.para).emit('mensajePrivado', crearMensaje(persona.nombre, data.nombre));
    })


});