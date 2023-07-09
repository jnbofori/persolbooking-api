const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Admin = require('../../models/Admin');
const verify = require('../../verifyToken');
const { isAdmin } = require('../../verifyStatus');
const { createAdminValidation, loginValidation } = require('../../validation');


//CREATE NEW ADMIN
router.post('/new', verify, isAdmin, async (req, res) => {
    //Validate admin data
    const { error } = createAdminValidation(req.body);
    if(error) return res.status(400).send(error.details[0].message);

    //Check if email already exists
    const emailExists = await Admin.findOne({email: req.body.email});
    if(emailExists) return res.status(400).send('Email already exists');

    //Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    //Create a new admin
    const admin = new Admin({
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        email: req.body.email,
        password: hashedPassword,
        specialty: req.body.specialty
    });
    try {
        const savedAdmin = await admin.save();
        res.send({ admin: savedAdmin._id });
    }catch (err) {
        res.status(400).send(err);
    }
});


//LOG ADMIN IN
router.post('/login', async (req, res) => {
    //Validate user data
    const { error } = loginValidation(req.body);
    if(error) return res.status(400).send(error.details[0].message);

    //Check if email exists
    const admin = await Admin.findOne({email: req.body.email});
    if(!admin) return res.status(400).send('Email or password is wrong');

    //Check if password is correct
    const validPass = await bcrypt.compare(req.body.password, admin.password);
    if(!validPass) return res.status(400).send('Invalid Password');

    //Create and assign token
    const token = jwt.sign({_id: admin._id, admin: true}, process.env.TOKEN_SECRET);
    res.header('auth-token', token).send(token);
});

module.exports = router;