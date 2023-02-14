const mongoose = require('mongoose')
const { Schema } = mongoose

const hospitalSchema = new Schema({
    hospitalName: {
        type: String,
        required: true
    },
    usertype:{
        type:String,
        required:true
    },
    phoneNumber: {
        required: true,
        type: String
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
    email: {
        type: String,
        required: true
        
    },
    registerationNumber:{
        type:String,
        required:true
    },
    facilityUID:{
        type:Number,
        requrired:true
    },
    facilityCode:{
        type:String,
        required:true
    },
    verifyToken:{
        type:String,
        trim: true
    },
    date:String,
    password: String,
    confirmPassword:String,
    active: Boolean,

})

const Hospital = mongoose.model('hospital', hospitalSchema)
module.exports = Hospital

