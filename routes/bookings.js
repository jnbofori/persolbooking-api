const express = require('express');
const router = express.Router();
const verify = require('../verifyToken');
const Booking = require('../models/Booking');
const { bookingValidation, bookingQueryValidation } = require('../validation');
const { isValidUser } = require('../verifyStatus');


//GET ALL BOOKINGS BY EMPLOYEE
router.get('/', verify, isValidUser, async (req, res) => {
  try {
    const { error } = bookingQueryValidation(req.query)
    if(error) return res.status(400).send(error.details[0].message);

    const query = { status: 'active', ...req.query };

    const bookings = await Booking.find(query).sort({ modified: -1 });
    res.send(bookings);
  }catch (err) {
    res.status(400).send(err);
  }
});


//CREATE A NEW BOOKING
router.post('/', verify, isValidUser, async (req, res) => {
  //Validate data
  const { error } = bookingValidation(req.body);
  if(error) return res.status(400).send(error.details[0].message);

  const { startTime, endTime, facility } = req.body

  //Create booking
  const booking = new Booking({
    startTime,
    endTime,
    facility,
    bookedBy: req.user._id,
    department: req.user.department
  });
  try {
    const savedBooking = await booking.save();
    res.send(savedBooking);
  }catch (err) {
    res.status(400).send(err)
  }
});

// UPDATE A BOOKING
router.put('/:bookingId', verify, isValidUser, async (req, res) => {
  try {
    const { bookingId } = req.params;

    const { startTime, endTime, facility } = req.body

    const booking = await Booking.findOne({ _id: bookingId, status: 'active' });
    assert(booking, 'Booking not found')

    if (!req.user._id.equals(booking.bookedBy)) return res.status(400).send('You do not have permission to this resource');

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
    res.status(400).send(e.message);
  }
});


// GET A SINGLE BOOKING
router.get('/:bookingId', verify, isValidUser, async (req, res) => {
  try {
    const { bookingId } = req.params;
    const booking = await Booking.findOne({ _id: bookingId, status: 'active' }).populate('bookedBy facility').exec();
    res.send(booking);
  }catch (e) {
    res.status(400).send(e)
  }
});


// DELETE A BOOKING
router.delete('/:bookingId', verify, isValidUser, async (req, res) => {
  try {
    const { bookingId } = req.params;

    const booking = await Booking.findOne({ _id: bookingId, status: 'active' });
    assert(booking, 'Booking not found')

    if (!req.user._id.equals(booking.bookedBy)) return res.status(400).send('You do not have permission to this resource');
    
    await Booking.findOneAndUpdate({ _id: bookingId },
      {
        status: 'deleted'
      }
    );
    res.send({ "Response sent": 'Booking deleted successfully'});
  }catch (e) {
    res.status(400).send(e.message)
  }
})


module.exports = router;