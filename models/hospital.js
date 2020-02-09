const mongoose = require('mongoose')
const { Schema } = mongoose
const bcrypt = require('bcryptjs')
const passportLocalMongoose = require('passport-local-mongoose')

const hospitalSchema = new Schema({
    HospitalName: {
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
    fullAddress: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    RegNumber:{
        type:String,
        required:true
    },
    appointment:{
        type:Object
    },
    password: String,
    active: Boolean,

})


hospitalSchema.plugin(passportLocalMongoose);
const Hospital = mongoose.model('hospital', hospitalSchema)
module.exports = Hospital

module.exports.hashPassword = async (password) => {
    try {
        const salt = await bcrypt.genSalt(10);
        return await bcrypt.hash(password, salt)
    } catch (error) {
        throw new Error('hashing failed', error)
    }
}
module.exports.comparePasswords = async (password, hashPassword) => {
    try {
        return await bcrypt.compare(password, hashPassword)
    } catch (error) {
        throw new Error("comparing failed", error)
    }
}
