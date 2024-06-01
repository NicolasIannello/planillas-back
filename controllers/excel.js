const { response }=require('express');

const getPDF= async(req,res = response)=>{

    res.json({
        ok:true,
    });
};

module.exports={getPDF}