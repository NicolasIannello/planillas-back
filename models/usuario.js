const { Schema, model } = require('mongoose');

const UsuarioSchema = Schema({
    mail: { type: String, required: true, unique: true },
    dni: { type: String, required: true },
    cuit: { type: String, required: true },
    nomapel: { type: String, required: true },
    pass: { type: String, required: true },
    dir: { type: String, required: true },
    estado: { type: Boolean, required: true },
    rol: { type: Number, }
});

UsuarioSchema.method('toJSON', function() {
    const { __v, _id,pass, ...object } = this.toObject();
    object.vid= _id;
    return object;
});

module.exports= model('Usuario',UsuarioSchema);