const { Schema, model } = require('mongoose');

const ExcelSchema = Schema({
    nombre: { type: String, required: true },
    date: { type: Date, required: true },
    fecha: { type: String, required: true }
});

ExcelSchema.method('toJSON', function() {
    const { __v, _id, ...object } = this.toObject();
    object.vid= _id;
    return object;
});

module.exports= model('Excel',ExcelSchema);