const { response }=require('express');
const Excel = require('../models/excel');

const Cargar= async(req,res = response)=>{
    const desde= req.query.desde || 0;

    [ excels, total ]= await Promise.all([
        Excel.find().skip(desde).limit(25).sort({ date: -1 }),
        Excel.countDocuments()
    ]);

    res.json({
        ok:true,
        excels,
        total
    });
};

const Subir= async(req,res = response)=>{
    const {nombre}=req.body;

    try {
        const existeExcel= await Excel.findOne({nombre});
        if(existeExcel){
            return res.json({
                ok:false,
                msg:'Ya existe un excel con el mismo nombre'
            });
        }

        const excel = new Excel(req.body);
        await excel.save();

        res.json({
            ok:true,
        });
        
    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok:false,
            msg:'error'
        });
    }
};

module.exports={Cargar, Subir}