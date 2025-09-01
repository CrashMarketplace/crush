const router = require('express').Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');

router.post('/singup', async (requestAnimationFrame,res)=>{
    const {email, password, name } =req.body;
    const u = await User.create({ email, password, name});
    res.json({ id:u._id})
})

router.post('login',async (req,res)=>{
    const {emaail,password} = req.body;
    const u = await User.findOne({email});
    if(!u || !(await u.compare(password)))
        return res.status(400).json({messeage:'Invalid'});
    const token = jwt.sign({id:u._id},process.env.JMT_SECRET,{expiresIn:'7d'});
    res.json({token,uesr:{id:u._id,name:u.name,email:u.email}});
});

module.exports = router;


