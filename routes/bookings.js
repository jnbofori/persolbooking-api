const express = require('express');
const router = express.Router();
const assert = require('assert');
const verify = require('../verifyToken');
const Booking = require('../models/Booking');
const { bookingValidation, bookingQueryValidation } = require('../validation');
const { isValidUser } = require('../verifyStatus');


//GET ALL BOOKINGS
router.get('/', verify, async (req, res) => {
  try {
    const { error } = bookingQueryValidation(req.query)
    if(error) return res.status(400).json({ message: error.details[0].message });

    const query = { status: 'active', ...req.query };

    const bookings = await Booking.find(query).sort({ startTime: -1 }).populate('bookedBy facility');
    res.send(bookings);
  }catch (err) {
    res.status(400).json({ message: err.message });
  }
});


//CREATE A NEW BOOKING
router.post('/', verify, isValidUser, async (req, res) => {
  try {
    //Validate data
    const { error } = bookingValidation(req.body);
    if(error) return res.status(400).json({ message: error.details[0].message });

    const { startTime, endTime, facility } = req.body

    const overlappingBooking = await Booking.findOne({
      status: 'active',
      facility,
      $or: [
        { 
          startTime: {
            "$gte": new Date(startTime),
            "$lte": new Date(endTime)
          }
        },
        {
          endTime: {
            "$gte": new Date(startTime),
            "$lte": new Date(endTime)
          }
        },
        {
          startTime: { "$lte": new Date(startTime) },
          endTime: { "$gte": new Date(endTime) }
        }
      ]
    });
    if(overlappingBooking) return res.status(400).json({ message: 'Time overlap with existing booking' })

    //Create booking
    const booking = new Booking({
      startTime,
      endTime,
      facility,
      bookedBy: req.user._id,
      department: req.user.department
    });

    const savedBooking = await booking.save();
    res.send(savedBooking);
  }catch (err) {
    res.status(400).json({ message: err.message })
  }
});

// UPDATE A BOOKING
router.put('/:bookingId', verify, async (req, res) => {
  try {
    const { bookingId } = req.params;

    const { startTime, endTime, facility } = req.body

    const booking = await Booking.findOne({ _id: bookingId, status: 'active' });
    if (!booking) throw new Error('Booking not found')

    if (req.user._id.toString() !== booking.bookedBy.toString() && !req.user.admin) {
      return res.status(400).json({ message: 'You do not have permission to this resource' });
    }

    const overlappingBooking = await Booking.findOne({
      status: 'active',
      facility,
      $or: [
        { 
          startTime: {
            "$gte": new Date(startTime),
            "$lte": new Date(endTime)
          }
        },
        {
          endTime: {
            "$gte": new Date(startTime),
            "$lte": new Date(endTime)
          }
        },
        {
          startTime: { "$lte": new Date(startTime) },
          endTime: { "$gte": new Date(endTime) }
        }
      ]
    });
    if(overlappingBooking) return res.status(400).json({ message: 'Time overlap with existing booking' })

    const updateObject = {
      startTime,
      endTime,
      facility
    }
    Object.keys(updateObject).forEach(key => !updateObject[key] && delete updateObject[key])

    const update = await Booking.findOneAndUpdate({ _id: bookingId }, updateObject, { new: true });
    res.send(update);
  }catch (e) {
    console.log(e)
    res.status(400).json({ message: e.message });
  }
});


// GET A SINGLE BOOKING
router.get('/:bookingId', verify, isValidUser, async (req, res) => {
  try {
    const { bookingId } = req.params;
    const booking = await Booking.findOne({ _id: bookingId, status: 'active' }).populate('bookedBy facility').exec();
    res.send(booking);
  }catch (e) {
    res.status(400).json({ message: e.message })
  }
});


// DELETE A BOOKING
router.delete('/:bookingId', verify, async (req, res) => {
  try {
    const { bookingId } = req.params;

    const booking = await Booking.findOne({ _id: bookingId, status: 'active' });
    assert(booking, 'Booking not found')

    if (req.user._id.toString() !== booking.bookedBy.toString() && !req.user.admin) {
      return res.status(400).json({ message: 'You do not have permission to this resource' });
    }
    
    await Booking.findOneAndUpdate({ _id: bookingId },
      {
        status: 'deleted'
      }
    );
    res.send({ "Response sent": 'Booking deleted successfully'});
  }catch (e) {
    res.status(400).json({ message: e.message })
  }
})


module.exports = router;