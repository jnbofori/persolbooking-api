const Employee = require('./models/Employee');
const Admin = require('./models/Admin');


//MIDDLEWARE TO MAKE SURE IT'S A USER REQUESTING
const isValidUser = async (req, res, next) => {
    try {
        const user = await Employee.findOne({ _id: req.user._id, status: 'active' });
        if(!user) return res.status(401).json({ message: 'Access Denied' });
        next();
    }catch (e) {
        res.status(400).json({ message: e.message });
    }
};


//MIDDLEWARE TO MAKE SURE IT'S AN ADMIN REQUESTING
let isAdmin = async (req, res, next) => {
    try {
        const admin = await Admin.findOne({_id: req.user._id});
        if(!admin) return res.status(401).json({ message: 'Access Denied' });
        next();
    }catch (e) {
        res.status(400).json({ message: e.message });
    }
};




module.exports.isValidUser = isValidUser;
module.exports.isAdmin = isAdmin;
