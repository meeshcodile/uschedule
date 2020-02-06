const express = require('express')
const router = express.Router()
const Patient = require('../models/patient')
const Admin = require('../models/admin')
const mailer = require('../misc/mailer')
const Hospital = require('../models/hospital')
const Appointment = require('../models/appointment')
const Joi = require('joi')
const randomstring = require('randomstring')
const auth = require('../config/customFunction')
const isPatient = auth.isPatient


const patientSchema = Joi.object().keys({
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    email: Joi.string().email().required(),
    bloodGroup: Joi.string().required(),
    phoneNumber: Joi.string().required(),
    // patientId:Joi.string().required(),
    usertype: Joi.string().required(),
    fullAddress: Joi.string().required(),
    password: Joi.string().regex(/^[a-zA-Z0-9]{3,30}$/).required(),
    confirmPassword: Joi.any().valid(Joi.ref('password')).required(),
})


module.exports ={
    registerGet:(req, res)=>{
        res.render('patients/register')
    },
    registerPost: async (req, res, next) => {
        try {
            const result = Joi.validate(req.body, patientSchema);

            // checking if email already exist

            const patient = await Patient.findOne({ 'email': req.body.email })
            if (patient) {
                req.flash('error', 'Email already in use')
                return res.redirect('/patient/register')
            }

            const hospital = await Hospital.findOne({ 'email': req.body.email })
            if (hospital) {
                req.flash('error', 'Email already in use')
                return res.redirect('/patient/register')
            }

            const admin = await Admin.findOne({ 'email': req.body.email })
            if (admin) {
                req.flash('error', 'Email already in use')
                return res.redirect('/patient/register')
            }

            // Comparison of passwords
            if (req.body.password !== req.body.confirmPassword) {
                req.flash('error', 'Passwords mismatch.');
                res.redirect('back');
                return;
            }

            // Hash the password
            const hash = await Patient.hashPassword(result.value.password);
            result.value.password = hash;
            delete result.value.confirmPassword;

            const patientId =`US${randomstring.generate({ length: 4, charset: 'numeric' })}`
            // var patientId = 0
            // patientId++
            
            // function Counter(initialValue) {
            //     patientId = initialValue;
            // }
            // Counter.prototype.addWithOr = function addWithOr(incrVal) {
            //     patientId += incrVal || 1;
            // }


            const html = ` your unique patient identity number is <strong>${patientId}</strong> you however are encouraged to keep it with you
            at all times has it will be your identity in the hub
            <br>
            <br>
            
            <strong> thanks and best regards<br>
            nhub foundation</strong>`

            await mailer.sendEmail('uschedule.info@gmail.com', result.value.email, 'patient ID', html)




            // Setting store's act to be inactive
            // result.value.active = false;

            // Saving store to database
            const newPatient = await new Patient({
                firstName : result.value.firstName,
                lastName: result.value.lastName,
                email: result.value.email,
                phoneNumber: result.value.phoneNumber,
                fullAddress:result.value.fullAddress,
                bloodGroup:result.value.bloodGroup,
                password:result.value.password,
                usertype:'Patient',
                patientId:patientId
            });
            await newPatient.save();
            console.log(`${newPatient} created successfully.`);

            


            req.flash('success', `Patient successfully created Your Patient ID has been sent to ${result.value.email}`)
            res.redirect('/login')


        }
        catch (error) {
            next(error)
        }

    },
    profileGet:(req, res)=>{
        let patient = req.user
        Patient.findById(req.user._id).then(user =>{
            Hospital.find().then(hospital=>{
                res.render('patients/dashboard', { layout: 'patient', user, patient, hospital })

            })
            
        })
    },
    logoutGet: (req, res) => {
        req.logout();
        req.flash('success', 'see you later')
        res.redirect('/')
    },
    appointmentPost:(req, res)=>{
        const id = req.params.id
        console.log(id)
        Patient.findById(id).then(patient => {
            let newAppointment = new Appointment({
                hospital: req.body.hospital,
                message: req.body.message,
                appointmentDate: req.body.appointmentDate,
                department:req.body.department,
                fullName: patient.firstName + ' ' + patient.lastName,
                email: patient.email,
                patientId: patient.patientId
            })
            newAppointment.save().then(newAppointment => {
                console.log('Appointment savedd successfully', newAppointment)
                req.flash('success', 'Your Appointment has been booked please await further instructions')
                res.redirect('back')
            }).catch(err => {
                console.log(err)
                req.flash('error', 'Something Went Wrong Please Try Again')
                return res.redirect('back')
            })
        })
    }
}

