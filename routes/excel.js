const { Router }=require('express');
const { check }=require('express-validator');
const { Cargar, Subir } = require('../controllers/excel');
const { validarCampos } = require('../middlewares/validar-campos');

const router=Router();

router.get('/',Cargar);

router.post('/',[
    check('nombre','el campo es obligatorio').not().isEmpty(),
    check('date').isDate(),
    check('fecha','el campo es obligatorio').not().isEmpty(),
    validarCampos
],Subir);


module.exports=router;