const Joi = require('joi');

//Create Employee Validation
const newEmployeeValidation =  data => {
    const schema = Joi.object({
        firstname: Joi.string().min(2).required(),
        lastname: Joi.string().min(2).required(),
        email: Joi.string().required().email(),
        password: Joi.string().required().pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\\$%\\^&\\*])(?=.{8,})')),
        department: Joi.string().required(),
    });
    return schema.validate(data);
};

const employeeValidation =  data => {
    const schema = Joi.object({
        firstname: Joi.string().min(2).required(),
        lastname: Joi.string().min(2).required(),
        email: Joi.string().required().email(),
        department: Joi.string().required(),
    });
    return schema.validate(data);
};

//Login Validation
const loginValidation =  data => {
    const schema = Joi.object({
        email: Joi.string().min(8).required().email(),
        password: Joi.string().min(6).required()
    });
    return schema.validate(data);
};

//Booking Validation
const bookingValidation =  data => {
    const schema = Joi.object({
        startTime: Joi.date().required(),
        endTime: Joi.date().required(),
        facility: Joi.string().required(),
    });
    return schema.validate(data);
};

const facilityTypeValidation =  data => {
    const schema = Joi.object({
        name: Joi.string().required(),
        description: Joi.string(),
    });
    return schema.validate(data);
};

const facilityValidation =  data => {
    const schema = Joi.object({
        name: Joi.string().required(),
        description: Joi.string().required(),
        facilityType: Joi.string().required(),
    });
    return schema.validate(data);
};

const bookingQueryValidation = data => {
    const schema = Joi.object({
        startTime: Joi.date(),
        endTime: Joi.date(),
        bookedBy: Joi.string(),
        department: Joi.string(),
        facility: Joi.string()
    });
    return schema.validate(data);
  };


//New Admin Validation
const createAdminValidation =  data => {
    const schema = Joi.object({
        firstname: Joi.string().min(2).required(),
        lastname: Joi.string().min(3).required(),
        email: Joi.string().min(8).required().email(),
        password: Joi.string().min(6).required(),
    });
    return schema.validate(data);
};


module.exports.newEmployeeValidation = newEmployeeValidation;
module.exports.employeeValidation = employeeValidation;
module.exports.loginValidation = loginValidation;
module.exports.bookingValidation = bookingValidation;
module.exports.createAdminValidation = createAdminValidation;
module.exports.facilityTypeValidation = facilityTypeValidation;
module.exports.facilityValidation = facilityValidation;
module.exports.bookingQueryValidation = bookingQueryValidation;

