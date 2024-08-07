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
            const hoja = new Hoja({id: excel._id , hoja: req.body.nombres[i], vista: 0});
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
    const {id, tipo, user}=req.body;

    if(tipo=='hojas'){
        const userDB = await Usuario.findById(user);

        if(!userDB){
            return res.json({
                ok:false,
                msg:'Error al verificar user'
            });
        }

        const hojas = await Hoja.find({$and: [{ 'id': { $eq: id } }, { 'vista': { $lt: (userDB.rol+1) } }] })

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

        const userDB = await Usuario.findById(user);

        if(!userDB){
            return res.json({
                ok:false,
                msg:'Error al verificar user'
            });
        }

        for (let i = 0; i < dato[0].dato[2].length; i++) {
            if(dato[0].dato[2][i]==20){
                for (let j = 4; j < dato[0].dato.length; j++) {
                    if(dato[0].dato[j][i]!=''){
                        let date = new Date(dato[0].dato[j][i]);
                        if(dato[0].dato[2][i+1]==30){
                            let dosMeses = new Date();
                            dosMeses.setMonth(dosMeses.getMonth() - 2);
                            if(dosMeses>date) dato[0].dato[j][i+1]='Critico';
                        }
                        if(dato[0].dato[2][i+2]==40){
                            let tresMeses = new Date();
                            tresMeses.setMonth(tresMeses.getMonth() - 3);
                            if(tresMeses>date) dato[0].dato[j][i+2]='Vencido';
                        }
                    }
                }
            }
        }

        if(userDB.rol==0){
            for (let i = dato[0].dato[0].length-1; i > 0; i--) {
                if(dato[0].dato[0][i]==10){
                    for (let j = 0; j < dato[0].dato.length; j++) {
                        dato[0].dato[j].splice(i,1);                        
                    }
                }
            }
            dato[0].dato.splice(0,1);
        }

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
    const {id, user}=req.body;

    try {
        const datoDB= await Dato.find({ 'id': { $eq: id } });
        if(!datoDB){
            return res.status(404).json({
                ok:false,
                msg:'Ocurrio un error'
            });
        }

        const {datos, ...campos}=req.body;
        
        const userDB = await Usuario.findById(user);

        if(!userDB){
            return res.json({
                ok:false,
                msg:'Error al verificar usuario'
            });
        }

        if(userDB.rol==0){
            datos.unshift(datoDB[0].dato[0])
            for (let i = 0; i < datoDB[0].dato[0].length; i++) {
                if(datoDB[0].dato[0][i]==10){
                    for (let j = 1; j < datoDB[0].dato.length; j++) {
                        datos[j].splice(i, 0, datoDB[0].dato[j][i]);
                    }
                }
            }
        }

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

const ActualizarVistaHoja= async(req,res = response)=>{
    const {_id}=req.body;

    try {
        const HojaDB= await Hoja.findById(_id);
        if(!HojaDB){
            return res.status(404).json({
                ok:false,
                msg:'Ocurrio un error'
            });
        }

        const {vista, ...campos}=req.body;
        campos.vista=vista;

        await Hoja.findByIdAndUpdate(HojaDB._id, campos,{new:true});

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


module.exports={Cargar, Subir, CargarDatos, Llenar, Actualizar, Borrar, ActualizarVistaExcel, ActualizarVistaHoja}