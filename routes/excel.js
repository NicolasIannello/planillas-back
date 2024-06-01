const { Router }=require('express');
const { getPDF } = require('../controllers/excel');

const router=Router();

router.get('/pdf',getPDF);

module.exports=router;