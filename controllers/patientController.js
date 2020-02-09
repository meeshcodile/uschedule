const express = require('express')
const router = express.Router()
const Patient = require('../models/patient')
const Admin = require('../models/admin')
const mailer = require('../misc/mailer')
const Hospital = require('../models/hospital')
const Appointment = require('../models/appointment')
const Joi = require('joi')
const moment = require('moment')
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

            //================checking if email already exist===================
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

            // ==============sending mail================
            const html = ` your unique patient identity number is <strong>${patientId}</strong> you however are encouraged to keep it with you
            at all times has it will be your identity in the hub
            <br>
            <br>
            
            <strong> thanks and best regards<br>
            nhub foundation</strong>`

            await mailer.sendEmail('uschedule.info@gmail.com', result.value.email, 'patient ID', html)


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
                patientId:patientId,
            });
            await newPatient.save();
            console.log(`${newPatient} created successfully.`);

        
            req.flash('success', `Patient successfully created Your Patient ID has been sent to ${result.value.email}`)
            return res.redirect('/login')

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
    appointmentPost:async(req, res)=>{
        const id = req.params.id
        console.log(id)
        await Patient.findById(id).then(async(patient) => {
                await Hospital.findOne({HospitalName:req.body.hospital}).then(async(hospital)=>{

                     //================formatting the date.now() method using moment===================
                    const date = moment(Date.now()).format('MMMM Do YYYY, h:mm:ss a');
                    console.log(date);
                    
                    let appointDate =req.body.appointmentDate
                    let appointmentFormat = moment(appointDate).format('MMMM Do YYYY')
                    console.log(appointmentFormat)

                    let newAppointment = new Appointment({
                        hospital: req.body.hospital,
                        message: req.body.message,
                        appointmentDate: appointmentFormat,
                        appointmentTime: req.body.appointmentTime,
                        department: req.body.department,
                        fullName: patient.firstName + ' ' + patient.lastName,
                        email: patient.email,
                        patientId: patient.patientId,
                        hospitalId:hospital.id,
                        date:date
                    })
                 await newAppointment.save().then(newAppointment => {
                     console.log('Appointment savedd successfully', newAppointment)
                     req.flash('success', 'Your Appointment has been booked please await further instructions')
                     return res.redirect('back')
                })

               
            }).catch(err => {
                console.log(err)
                req.flash('error', 'Something Went Wrong Please Try Again')
                return res.redirect('back')
            })
        })
    }
}

