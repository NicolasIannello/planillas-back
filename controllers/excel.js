const { response }=require('express');
const Excel = require('../models/excel');
const Dato = require('../models/dato');
const Hoja = require('../models/hoja');
const Usuario = require('../models/usuario');

const Cargar= async(req,res = response)=>{
    const desde= req.query.desde || 0;
    const id=req.query.id

    const UserDB= await Usuario.findById(id);
    [ excels, total ]= await Promise.all([
        Excel.find({ 'vista': { $lt: (UserDB.rol+1) } }).skip(desde).limit(25).sort({ date: -1 }),
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
    const {id, tipo}=req.body;

    if(tipo=='hojas'){
        const hojas = await Hoja.find({ 'id': { $eq: id }})

        if(!hojas){
            return res.json({
                ok:false,
                msg:'Error al traer los datos'
            });
        }

        return res.json({
            ok:true,
            hojas
        });
    }else{
        const dato = await Dato.find({ 'id': { $eq: id } });
        return res.json({
            ok:true,
            dato
        });
    }
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

        const dato = new Dato({id: existeHoja[0]._id, dato: req.body.hoja.datos});
        await dato.save();

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

const Actualizar= async(req,res = response)=>{
    const {id}=req.body;

    try {
        const datoDB= await Dato.find({ 'id': { $eq: id } });
        if(!datoDB){
            return res.status(404).json({
                ok:false,
                msg:'Ocurrio un error'
            });
        }

        const {datos, ...campos}=req.body;
        campos.dato=datos;

        await Dato.findByIdAndUpdate(datoDB[0]._id, campos,{new:true});

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
}

const ActualizarVistaExcel= async(req,res = response)=>{
    const {id}=req.body;

    try {
        const ExcelDB= await Excel.findById(id);
        if(!ExcelDB){
            return res.status(404).json({
                ok:false,
                msg:'Ocurrio un error'
            });
        }

        const {vista, ...campos}=req.body;
        campos.vista=vista;

        await Excel.findByIdAndUpdate(ExcelDB._id, campos,{new:true});

        res.json({
            ok:true,
            msg:'Vista actualizada'
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok:false,
            msg:'error'
        });
    }
}

const Borrar= async(req,res=response)=>{
    const {id}=req.body;

    try {
        const excelDB= await Excel.findById(id);
        const hojasDB= await Hoja.find({ 'id': { $eq: excelDB._id } },);

        if(!excelDB){
            return res.status(404).json({
                ok:false,
                msg:'error'
            });
        }

        hojasDB.forEach(async element => {
            await Dato.deleteMany({ 'id': { $eq: element._id } },)
            await Hoja.findByIdAndDelete(element._id)
        });

        await Excel.findByIdAndDelete(id);

        return res.json({
            ok:true,
            msg:'Excel eliminado',
        });   
    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok:false,
            msg:'error'
        });
    }
};


module.exports={Cargar, Subir, CargarDatos, Llenar, Actualizar, Borrar, ActualizarVistaExcel}