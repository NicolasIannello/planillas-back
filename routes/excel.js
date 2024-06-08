const { Router }=require('express');
const { check }=require('express-validator');
const { Cargar, Subir, CargarDatos, Llenar } = require('../controllers/excel');
const { validarCampos } = require('../middlewares/validar-campos');

const router=Router();

router.get('/',Cargar);

router.post('/',[
    check('nombre','el campo es obligatorio').not().isEmpty(),
    check('date').isDate(),
    check('fecha','el campo es obligatorio').not().isEmpty(),
    validarCampos
],Subir);

router.post('/datos',[
    check('id').isMongoId(),
    validarCampos
],CargarDatos);

router.post('/llenar',[
    check('hoja','el campo es obligatorio').not().isEmpty(),
    check('id').isMongoId(),
    validarCampos
],Llenar);

module.exports=router;