const { response }=require('express');
const Excel = require('../models/excel');
const Dato = require('../models/dato');
const Hoja = require('../models/hoja');

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

        for (let i = 0; i < req.body.nombres.length; i++) {
            const hoja = new Hoja({id: excel._id , hoja: req.body.nombres[i]});
            await hoja.save();
        }

        res.json({
            ok:true,
            excel
        });
        
    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok:false,
            msg:'error'
        });
    }
};

const CargarDatos= async(req,res = response)=>{
    // const {id}=req.body;
    
    // const dato = await Dato.find({ 'id': { $eq: id } }, { celda: 1, dato : 1 });
    // let datos=[], cols=[]

    // for (let i = 0; i < dato.length; i++) {
    //     if(dato[i].celda[0]=='A'){
    //         if(cols.length!=0){
    //             datos.push(cols)
    //             cols=[]
    //         }
    //     }
    //     cols.push({dato: dato[i].dato, id: dato[i]._id})

    //     if(i==dato.length-1) datos.push(cols)
    // }

    res.json({
        ok:true,
        datos
    });
};

const Llenar= async(req,res = response)=>{
    const {id}=req.body;

    try {
        const existeHoja= await Hoja.find({$and: [{ 'id': { $eq: id } }, { 'hoja': { $eq: req.body.hoja.name } }] });
        if(!existeHoja){
            return res.json({
                ok:false,
                msg:'Ocurrio un error en la carga de datos'
            });
        }

        for (let i = 0; i < req.body.hoja.datos.length; i++) {
            if(req.body.hoja.datos[i].dato!=undefined){
                const dato = new Dato({id: id , celda: req.body.hoja.datos[i].celda, dato: req.body.hoja.datos[i].dato});
                await dato.save();
            }
        }

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

module.exports={Cargar, Subir, CargarDatos, Llenar}