const { response }=require('express');
const Usuario = require('../models/usuario');
const bcrypt=require('bcryptjs');
const { generarJWT } = require('../helpers/jwt');

const getUser= async(req,res=response) =>{
    const desde= req.query.desde || 0;
    const limit= req.query.limit || 25;

    const [ users, total ]= await Promise.all([
        Usuario.find().skip(desde).limit(limit),
        Usuario.countDocuments()
    ]);

    res.json({
        ok:true,
        users,
        total
    });
}

const actualizarUsuario= async(req,res=response)=>{
    const {id}=req.body;
    
    try {
        const usuarioDB= await Usuario.findById(id);

        if(!usuarioDB){
            return res.status(404).json({
                ok:false,
                msg:'no existe ese usuario id'
            });
        }

        const {estado, ...campos}=req.body;
        
        campos.estado=estado;

        await Usuario.findByIdAndUpdate(id, campos,{new:true});

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

const crearUsuario= async(req,res = response) =>{
    const {mail,pass,user}=req.body;

    try {
        const existeEmail= await Usuario.findOne({mail});
        if(existeEmail){
            return res.status(400).json({
                ok:false,
                msg:'Ya existe una cuenta con ese e-mail'
            });
        }

        const usuario= new Usuario(req.body);
        usuario.rol=0;
        
        const salt=bcrypt.genSaltSync();
        usuario.pass=bcrypt.hashSync(pass,salt);

        await usuario.save();
        const token= await generarJWT(usuario._id);

        res.json({
            ok:true,
            usuario,
            token
        });
        
    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok:false,
            msg:'error'
        });
    }
};

const login=async(req,res=response)=>{
    const { mail, pass }= req.body;

    try {
        const usuarioDB= await Usuario.findOne({ mail });
        if(!usuarioDB){
            return res.status(404).json({
                ok:false,
                msg:'No se encontro un usuario con ese e-mail'
            })
        }

        const validPassword=bcrypt.compareSync(pass,usuarioDB.pass);
        if(!validPassword){
            return res.status(400).json({
                ok:false,
                msg:'Contraseña incorrecta'
            })
        }

        const token= await generarJWT(usuarioDB.id);
        res.json({
            ok:true,
            token,
            user: usuarioDB.user
        })
    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok:false,
            msg:'error login'
        });
    }
}

const renewToken= async(req,res=response)=>{
    const {_id }=req.body//req.header('_id');
    const token= await generarJWT(_id);
    const usuarioDB= await Usuario.find({ user: _id })

    if(usuarioDB.length==0){
        res.json({
            ok:false
        })
    }else{
        res.json({
            ok:true,
            token,
            usuarioDB
        })
    }
}

module.exports={crearUsuario,login,renewToken, getUser, actualizarUsuario}