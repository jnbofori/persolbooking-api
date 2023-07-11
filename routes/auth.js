const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/Employee');
const { loginValidation } = require('../validation');


//REGISTER NEW USER
// router.post('/register', async (req, res) => {
//     //Validate user data
//     const { error } = registerValidation(req.body);
//     if(error) return res.status(400).send(error.details[0].message);

//     //Check if email already exists
//     const emailExists = await User.findOne({email: req.body.email});
//     if(emailExists) return res.status(400).send('Email already exists');

//     //Hash password
//     const salt = await bcrypt.genSalt(10);
//     const hashedPassword = await bcrypt.hash(req.body.password, salt);

//     //Create a new user
//     const user = new User({
//         firstname: req.body.firstname,
//         lastname: req.body.lastname,
//         email: req.body.email,
//         password: hashedPassword
//     });
//     try {
//         const savedUser = await user.save();
//         res.send({ user: user._id });
//     }catch (err) {
//         res.status(400).send(err);
//     }
// });


//LOG USER IN
router.post('/login', async (req, res) => {
    //Validate user data
    const { error } = loginValidation(req.body);
    if(error) return res.status(400).json({ message: error.details[0].message });

    //Check if email exists
    const user = await User.findOne({email: req.body.email, status: 'active'});
    if(!user) return res.status(400).json({ message: 'Email or password is wrong' });

    //Check if password is correct
    const validPass = await bcrypt.compare(req.body.password, user.password);
    if(!validPass) return res.status(400).json({ message: 'Invalid Password' });

    //Create and assign token
    const token = jwt.sign({_id: user._id, admin: false}, process.env.TOKEN_SECRET);
    res.header('auth-token', token).send({token, user});
});


module.exports = router;