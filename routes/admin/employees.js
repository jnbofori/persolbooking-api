const express = require('express');
const router = express.Router();
const assert = require('assert');
const bcrypt = require('bcryptjs');
const verify = require('../../verifyToken');
const Employee = require('../../models/Employee');
const { newEmployeeValidation, employeeValidation } = require('../../validation');
const { isAdmin } = require('../../verifyStatus');


//CREATE NEW EMPLOYEE
router.post('/', verify, isAdmin, async (req, res) => {
  try {
    //Validate employee data
    const { error } = newEmployeeValidation(req.body);
    if(error) return res.status(400).json({ message: error.details[0].message });

    //Check if email already exists
    const emailExists = await Employee.findOne({ email: req.body.email });
    if(emailExists) return res.status(400).json({ message: 'Email already exists' });

    //Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    //Create a new employee
    const employee = new Employee({
      firstname: req.body.firstname,
      lastname: req.body.lastname,
      email: req.body.email,
      department: req.body.department,
      password: hashedPassword,
      createdBy: req.user._id
    });
    const savedEmployee = await employee.save();
    res.send(savedEmployee);
  }catch (err) {
      res.status(400).json({ message: err.message });
  }
});


// UPDATE EMPLOYEE DATA
router.put('/:employeeId', verify, isAdmin, async (req, res) => {
  try {
    //Validate employee data
    const { error } = employeeValidation(req.body);
    if(error) return res.status(400).json({ message: error.details[0].message });

    const { employeeId } = req.params
    const { firstname, lastname, email, department } = req.body;

    //Check if email already exists
    const emailExists = await Employee.findOne({ email, _id: { $ne: employeeId } });
    if(emailExists) return res.status(400).json({ message: 'Email already exists' });

    const updateObject = {
      firstname,
      lastname,
      email,
      department,
      modifiedBy: req.user._id
    }
    Object.keys(updateObject).forEach(key => !updateObject[key] && delete updateObject[key])

    const updated = await Employee.findOneAndUpdate({ _id: employeeId }, updateObject);
    res.send(updated);
  } catch (err) {
    res.status(400).json({ message: err });
  }
});


//GET ALL EMPLOYEES
router.get('/', verify, isAdmin, async (req, res) => {
  try {
    const { search } = req.query;
    const query = { status: 'active' };

    if (search) {
      query.$text = {
        $search: search
      }
    }
    const employees = await Employee.find(query).sort({ modified: -1 });
    res.send(employees);
  }catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// GET A SINGLE EMPLOYEE
router.get('/:employeeId', verify, isAdmin, async (req, res) => {
  try {
    const { employeeId } = req.params;
    const employee = await Employee.findOne({ _id: employeeId, status: 'active' });
    assert(employee, 'Employee not found');

    res.send(employee);
  }catch (e) {
    res.status(400).json({ message: e.message })
  }
});


// DELETE EMPLOYEE
router.delete('/:employeeId', verify, isAdmin, async (req, res) =>{
  try {
    await Employee.updateOne({ _id: req.params.employeeId, status: 'active' },
      {
        status: 'deleted',
        modifiedBy: req.user._id
      }
    );
    res.send({ "Response sent": 'Employee deleted successfully'});
  }catch (e) {
    res.status(400).json({ message: e.message })
  }
})


module.exports = router;