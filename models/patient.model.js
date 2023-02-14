const mongoose = require('mongoose')
const {Schema} = mongoose


const patientSchema = new Schema({
    firstName :{
        type:String,
        required: true
    },
    lastName:{
        type:String,
        required:true,
    },
    usertype:{
        type:String,
        required:true
    },
    phoneNumber:{
        type:Number,
        required:true,
        
    },
    streetAddress: {
        type: String,
        required: true
    },
    state:{
        type:String,
        required: true
    },
    city:{
        type:String,
        required:true
    },
    email:{
        type:String,
        unique: true,
        required:true
    },
    bloodGroup:{
        type:String,
        required:true
    },
    patientId:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    verifyToken:{
        type:String,
        trim: true
    },
    date:String,
    active:Boolean,

})

const Patient = mongoose.model('patient', patientSchema)
module.exports = Patient
