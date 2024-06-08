const { Schema, model } = require('mongoose');

const HojaSchema = Schema({
    id: { type: String, required: true },
    hoja: { type: String, required: true }
});

HojaSchema.method('toJSON', function() {
    const { __v, _id, ...object } = this.toObject();
    object.vid= _id;
    return object;
});

module.exports= model('Hoja',HojaSchema);