const mongoose =require('mongoose')
const {Schema} = mongoose

const appointmentSchema = new Schema({
  message: {
    type: String,
    required: true
  },
  ailment:{
    type:String,
    enum:['headache', 'dysentry','fever','maleria','full medical check up'],
    required:true
  },
  hospitalId:{
    type:String,
    required: true
  },
  hospital: {
    type: String,
    required: true
  },
  patientId: {
    type: String,
    required: true
  },
  date: {
    type: String,
    required: true
  },
  department: {
    type: String,
    required: true
  },
  isApproved: {
    type: Boolean,
    default: false
  },
  isDeclined: {
    type: Boolean,
    default: false
  },
  appointmentDate:{
    type:String,
    required:true
  }
});

const Appointment = mongoose.model('appointment', appointmentSchema)
module.exports = Appointment