const { Schema, model } = require('mongoose');

const DatoSchema = Schema({
    id: { type: String, required: true },
    dato: { type: Object, required: true }
});

DatoSchema.method('toJSON', function() {
    const { __v, _id, ...object } = this.toObject();
    object.vid= _id;
    return object;
});

module.exports= model('Dato',DatoSchema);