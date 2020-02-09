const mongoose = require('mongoose')
const Schema = mongoose.Schema


const doctorSchema = new Schema({
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  doctorID: {
    type: String,
    required: true
  },
  department: {
    type: String,
    required: true
  },
  hospitalId: {
    type: String,
    required: true
  }
});


const Doctor=mongoose.model('doctor', doctorSchema)

module.exports = Doctor