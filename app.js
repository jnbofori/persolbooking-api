const express = require("express");
const app = express();
const mongoose = require('mongoose');
// const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv/config');


//MIDDLEWARE
// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json());
app.use(cors());


//IMPORT ROUTES
const authRouter = require('./routes/auth');
const bookingsRouter = require('./routes/bookings');

const adminAuthRouter = require('./routes/admin/auth');
const adminEmployeesRouter = require('./routes/admin/employees');
const adminFacilitiesRouter = require('./routes/admin/facilities');
const adminFacilityTypesRouter = require('./routes/admin/facilityTypes');

mongoose.set('useCreateIndex', true);
mongoose.set('useFindAndModify', false);

//CONNECT TO DB
mongoose.connect(
    process.env.DATABASE_URL,
    { useNewUrlParser: true, useUnifiedTopology: true },
    () => console.log('Connected to DB!')
);


//USE ROUTES
app.use('/auth', authRouter);
app.use('/booking', bookingsRouter);

app.use('/admin/auth', adminAuthRouter);
app.use('/admin/employee', adminEmployeesRouter);
app.use('/admin/facility', adminFacilitiesRouter);
app.use('/admin/facility-type', adminFacilityTypesRouter);


//LISTEN ON PORT 3000
app.listen(3000);