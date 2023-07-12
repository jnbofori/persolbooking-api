const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

const Admin = require('../models/Admin');

async function createAdmin () {
  try {
    mongoose.connect(process.env.DATABASE_URL || "", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
      useFindAndModify: false,
      numberOfRetries: 10,
      poolSize: 10
    });

    const email = 'super@admin.com'
    const emailExists = await Admin.findOne({email});
    if(emailExists) throw new Error('Admin with this email already exists');

    //Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(process.env.DEFAULT_ADMIN_PASS, salt);

    //Create a new admin
    const admin = new Admin({
        firstname: 'Super',
        lastname: 'Admin',
        email: email,
        password: hashedPassword
    });
    const savedAdmin = await admin.save();

    console.log("ADMIN CREATED SUCCESSFULLY", savedAdmin);
  } catch(error) {
    console.log("ERROR OCCURRED ADMIN CREATION", error);
  } finally {
    mongoose.connection.close();
    console.log('DONE');
  } 
}

createAdmin();