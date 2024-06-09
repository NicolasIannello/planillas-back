const { response }=require('express');
const Excel = require('../models/excel');
const Dato = require('../models/dato');
const Hoja = require('../models/hoja');
//const fs=require('fs');
// const { v4: uuidv4 }=require('uuid');
// const path=require('path');
// var XLSX = require("xlsx");

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
        //-------------------------------------------------------------
        // if(!req.files || Object.keys(req.files).length===0){
        //     return res.status(400).json({
        //         ok:false,
        //         msg:'no se subieron archivos'
        //     })
        // }
    
        // // let file=[];
        // // let nombreCortado=[];
        // // let extensionArchivo=[];
        // // let nombreArchivo=[];
        // // let path=[];
    
        // // file=req.files.excel;
        // // nombreCortado=file.name.split('.');
        // // extensionArchivo=nombreCortado[nombreCortado.length-1];
        // // nombreArchivo= uuidv4()+'.'+extensionArchivo;
        // // path= './uploads/'+nombreArchivo;

        // // file.mv(path, (err)=>{
        // //     if(err){
        // //         console.log(err);
        // //         return res.status(500).json({
        // //             ok:false,
        // //             msg:'error en carga de excel (archivo: '+nombreCortado+')',
        // //         })
        // //     }
        // // })

        // // const excel = new Excel({nombre:nombreCortado[0] , excel:nombreArchivo , date: req.body.date, fecha:req.body.fecha });
        // // await excel.save();

        // // res.json({
        // //     ok:true,
        // // });
        
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
        let datos=[], cols=[]

        for (let i = 0; i < dato.length; i++) {
            if(dato[i].celda[0]=='A' && Number.isInteger(Number.parseInt(dato[i].celda[1]))){
                if(cols.length!=0){
                    datos.push(cols)
                    cols=[]
                }
            }
            //cols.push({dato: dato[i].dato, id: dato[i]._id})
            cols.push(dato[i])

            if(i==dato.length-1) datos.push(cols)
        }
        return res.json({
            ok:true,
            datos
        });
    }
    //-------------------------------------------
    // // const excel= await Excel.findById(id);

    // // const pathImg= path.join( __dirname, '../uploads/'+excel.excel);

    // // var workbook = XLSX.readFile(pathImg);

    // // res.json({
    // //     ok:true,
    // //     workbook
    // // }); 
    // console.log(pathImg);
    // if(fs.existsSync(pathImg)){
    //     res.sendFile(pathImg);
    // }else{
    //     res.json({
    //         ok:false,
    //     });    
    // }
    //--------------------------
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
                const dato = new Dato({id: existeHoja[0]._id , celda: req.body.hoja.datos[i].celda, dato: req.body.hoja.datos[i].dato});
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