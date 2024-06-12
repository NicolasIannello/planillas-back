const { Router }=require('express');
const { check }=require('express-validator');
const { Cargar, Subir, CargarDatos, Llenar, Actualizar } = require('../controllers/excel');
const { validarCampos } = require('../middlewares/validar-campos');
//const expressFileUpload =require('express-fileupload');

const router=Router();

//router.use(expressFileUpload());

router.get('/',Cargar);

router.post('/',[
    check('nombre','el campo es obligatorio').not().isEmpty(),
    check('date').isDate(),
    check('fecha','el campo es obligatorio').not().isEmpty(),
    validarCampos
],Subir);

router.post('/datos',[
    check('id').isMongoId(),
    check('tipo','el campo es obligatorio').not().isEmpty(),
    validarCampos
],CargarDatos);

router.post('/llenar',[
    check('hoja','el campo es obligatorio').not().isEmpty(),
    check('id').isMongoId(),
    validarCampos
],Llenar);

router.post('/actualizar',[
    check('datos','el campo es obligatorio').not().isEmpty(),
    check('id').isMongoId(),
    validarCampos
],Actualizar);

module.exports=router;