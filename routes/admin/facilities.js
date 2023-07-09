const express = require('express');
const assert = require('assert');
const router = express.Router();
const Facility = require('../../models/Facility');
const { facilityValidation } = require('../../validation');
const { isAdmin } = require('../../verifyStatus');
const verify = require('../../verifyToken');

//GET ALL FACILITY
router.get('/', verify, isAdmin, async (req, res) => {
  try {
    const { search } = req.query;
    const query = { status: 'active' };
    if (search) {
      query.$text = {
        $search: search
      }
    }
    const facility = await Facility.find(query).sort({ modified: -1 });
    res.send(facility);
  } catch (e) {
    res.status(400).send(e.message);
  }
});


//CREATE A NEW FACILITY
router.post('/', verify, isAdmin, async (req, res) => {
  try {
    //Validate data
    const { error } = facilityValidation(req.body);
    if(error) return res.status(400).send(error.details[0].message);

    const { name, description, facilityType } = req.body;
    const facility = new Facility({
      name,
      description,
      facilityType,
      createdBy: req.user._id
    });

    const saved = await facility.save();
    res.send(saved);
  }catch (e) {
    res.status(400).send(e.message)
  }
});


// UPDATE A FACILITY
router.put('/:facilityId', verify, isAdmin, async (req, res) => {
  try {
    const { facilityId } = req.params;

    const { name, description, facilityType } = req.body

    const facility = await Facility.findOne({_id: facilityId, status: 'active'});
    assert(facility, 'Facility not found')

    const updateObject = {
      name,
      description,
      facilityType,
      modifiedBy: req.user._id
    }
    Object.keys(updateObject).forEach(key => !updateObject[key] && delete updateObject[key])

    const updated = await Facility.findOneAndUpdate({_id: facilityId}, updateObject);
    res.send(updated);
  }catch (e) {
    console.log(e)
    res.status(400).send(e.message);
  }
});


// GET SINGLE FACILITY
router.get('/:facilityId', verify, isAdmin, async (req, res) => {
  try {
    const { facilityId } = req.params;
    const facility = await Facility.findOne({_id: facilityId, status: 'active'});
    assert(facility, 'Facility not found');

    res.send(facility);
  }catch (e) {
    res.status(400).send(e.message)
  }
});

// DELETE A FACILITY
router.delete('/:facilityId', verify, isAdmin, async (req, res) =>{
  try {
    await Facility.findOneAndUpdate({_id: req.params.facilityId, status: 'active'},
      {
        status: 'deleted',
        modifiedBy: req.user._id
      }
    );
    res.send({ "Response sent": 'Facility deleted successfully'});
  }catch (e) {
    res.status(400).send(e.message)
  }
})

module.exports = router;