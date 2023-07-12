const express = require('express');
const assert = require('assert');
const router = express.Router();
const Facility = require('../../models/Facility');
const FacilityType = require('../../models/FacilityType');
const { facilityTypeValidation } = require('../../validation');
const { isAdmin } = require('../../verifyStatus');
const verify = require('../../verifyToken');

//GET ALL FACILITY TYPES
router.get('/', verify, isAdmin, async (req, res) => {
  try {
    const { search } = req.query;
    const query = { status: 'active' };
    if (search) {
      query.$text = {
        $search: search
      }
    }
    const facilityTypes = await FacilityType.find(query).sort({ modified: -1 });
    res.send(facilityTypes);
  } catch (e) {
    res.status(400).json({ message: e.message });
  }
});


//CREATE A NEW FACILITY TYPE
router.post('/', verify, isAdmin, async (req, res) => {
  try {
    //Validate data
    const { error } = facilityTypeValidation(req.body);
    if(error) return res.status(400).json({ message: error.details[0].message });

    const { name, description } = req.body;
    const facilityType = new FacilityType({
      name,
      description,
      createdBy: req.user._id
    });

    const saved = await facilityType.save();
    res.send(saved);
  }catch (e) {
    res.status(400).json({ message: e.message })
  }
});

// UPDATE A FACILITY TYPE
router.put('/:facilityTypeId', verify, isAdmin, async (req, res) => {
  try {
    const facilityTypeId = req.params.facilityTypeId;

    const { name, description } = req.body

    const facilityType = await FacilityType.findOne({_id: facilityTypeId, status: 'active'});
    assert(facilityType, 'Facility Type not found')

    const updateObject = {
      name,
      description,
      modifiedBy: req.user._id
    }
    Object.keys(updateObject).forEach(key => !updateObject[key] && delete updateObject[key])

    const updated = await FacilityType.findOneAndUpdate({_id: facilityTypeId}, updateObject);
    res.send(updated);
  }catch (e) {
    console.log(e)
    res.status(400).json({ message: e.message });
  }
});


// GET SINGLE FACILITY TYPE
router.get('/:facilityTypeId', verify, isAdmin, async (req, res) => {
  try {
    const { facilityTypeId } = req.params;
    const facilityType = await FacilityType.findOne({_id: facilityTypeId, status: 'active'});
    assert(facilityType, 'Facility type not found');

    res.send(facilityType);
  }catch (e) {
    res.status(400).json({ message: e.message })
  }
});

// DELETE A FACILITY TYPE
router.delete('/:facilityTypeId', verify, isAdmin, async (req, res) =>{
  try {
    const { facilityTypeId } = req.params;

    const facility = await Facility.exists({facilityType: facilityTypeId, status: 'active'});
    if(facility) return res.status(400).json({ message: 'Failed to delete. Facility type has active facilities' });

    await FacilityType.findOneAndUpdate({_id: facilityTypeId, status: 'active'},
      {
        status: 'deleted',
        modifiedBy: req.user._id
      }
    );
    res.send({ "Response sent": 'Facility Type deleted successfully'});
  }catch (e) {
    res.status(400).json({ message: e.message })
  }
})

module.exports = router;