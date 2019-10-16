const express = require('express')
const router = express.Router()
const Hospital = require('../models/hospital')
const mailer = require('../misc/mailer')
const Admin = require('../models/admin')
const Patient = require('../models/patient')
const Doctor = require('../models/doctors')
const Joi = require('joi')
const Appointment = require('../models/appointment')
const auth = require('../config/customFunction')
const isHospital = auth.isHospital


const hospitalSchema = Joi.object().keys({
    HospitalName: Joi.string().required(),
    email: Joi.string().email().required(),
    RegNumber: Joi.string().required(),
    phoneNumber: Joi.string().required(),
    fullAddress: Joi.string().required(),
    usertype: Joi.string().required(),
    password: Joi.string().regex(/^[a-zA-Z0-9]{3,30}$/).required(),
    confirmPassword: Joi.any().valid(Joi.ref('password')).required(),
})


module.exports ={
    registerGet:(req, res)=>{
        res.render('hospitals/register')
    },
    registerPost: async (req, res, next) => {
        try {
            const result = Joi.validate(req.body, hospitalSchema);

            // checking if email already exist
            Patient.findOne({ 'email': req.body.email }, (err, patient) => {
                Hospital.findOne({ 'email': req.body.email }, (err, hospital) => {
                    Admin.findOne({ 'email': req.body.email }, (err, admin) => {
                        if (admin) {
                            req.flash('error', 'email already in use')
                            return res.redirect('back')
                        }
                        if (err) {
                            console.log(err)
                            req.flash('error', 'Something Went Wrong, Please Try Again')
                            return res.redirect('back')
                        }

                    })
                    if (hospital) {
                        req.flash('error', 'E Please Try Again With A Different Email')
                        return res.redirect('back')
                    }
                    if (err) {
                        console.log(err)
                        req.flash('error', 'Something Went Wrong, Please Try Again')
                        return res.redirect('back')
                    }

                })
                if (patient) {
                    req.flash('error', 'Email already in use')
                    return res.redirect('back')
                }
                if (err) {
                    console.log(err)
                    req.flash('error', 'Something Went Wrong, Please Try Again')
                    return res.redirect('back')
                }
            })

            // Comparison of passwords
            if (req.body.password !== req.body.confirmPassword) {
                req.flash('error', 'Passwords mismatch.');
                res.redirect('back');
                return;
            }

            // Hash the password
            const hash = await Hospital.hashPassword(result.value.password);
            result.value.password = hash;
            delete result.value.confirmPassword;



            // Setting store's acct to be inactive
            // result.value.active = false;

            // Saving store to database
            const newHospital = await new Hospital({
                HospitalName:result.value.HospitalName,
                email:result.value.email,
                RegNumber:result.value.RegNumber,
                phoneNumber:result.value.phoneNumber,
                fullAddress:result.value.fullAddress,
                password:result.value.password,
                usertype:'Hospital'
            });
            await newHospital.save();
            console.log(`${newHospital} created successfully.`);

            req.flash('success', 'Hospital successfully created')
            res.redirect('/login')


        }
        catch (error) {
            next(error)
        }

    },

    profileGet:(req,res)=>{
        Hospital.findById(req.user.id).then(hospital =>{
            res.render('hospitals/dashboard', { layout: 'hospital',hospital:hospital })

        })
    },
    logoutGet:(req, res)=>{
        req.logout();
        req.flash('success', 'see you later')
        res.redirect('back')
    },
    patientAppointmentGet:(req, res)=>{
        Appointment.find().then(patientAppointment =>{
            res.render('hospitals/patientAppointment', { layout: 'hospital', patientAppointment })

        })
    },
    deleteAppointment:(req, res)=>{
        Appointment.findByIdAndDelete(req.params.id)
            .then(deletedintern => {
                req.flash('success', 'Patient Appointment Successfully Deleted ')
                res.redirect('/hospital/patientAppointment')
                return
            })
            .catch(err => {
                console.log(err)
            })
    },
    approveAppointmentGet:async(req, res)=>{
        await Appointment.findById(req.params.id)
            .then(patientAppointment => {
                console.log('consoling found Application', patientAppointment)
                if (patientAppointment.isApproved == true) {
                    req.flash('error', 'application already approved')
                    res.redirect('back')
                }

                //==========sending the confirmation email to the patient================
                const html = `Hello <strong> ${patientAppointment.email}</strong>,
                Your Booking of appointment to <strong>${patientAppointment.hospital} </strong> Hospital
                on <strong>${patientAppointment.appointmentDate}</strong> has been approved please come to the hospital
                on the supposed day and meet an available doctor
                <br>
                <br>
        
                <strong>Thanks and Best Regards</strong>
      `
                // Sending the mail
                 mailer.sendEmail('ezekielmisheal4@gmail.com', patientAppointment.email, 'Appointment Approved', html);

                patientAppointment.isApproved = true;
                patientAppointment.save().then(patientAppointment => {
                    req.flash('success', 'Patient Application Approved')
                    res.redirect('back')
                }).catch(err => {
                    console.log(err)
                })

            }).catch(err => {
                console.log(err)
                req.flash('error', 'Approving unsuccessfull')
                res.redirect('back')
            })
    },
    doctorsGet:(req, res)=>{
        Doctor.find().then(doctor=>{
            res.render('hospitals/doctors', { layout: 'hospital', doctor })

        })
    },
    doctorsPost:async(req, res,next)=>{
        console.log(req.body)
        try{
            const newDoctor = new Doctor({
                firstName : req.body.firstName,
                lastName: req.body.lastName,
                email:req.body.email,
                specialty:req.body.specialty,
                doctorID:req.body.doctorID
            })
            
            await newDoctor.save().then(()=>{
                console.log(`${newDoctor} saved successfully`)
                req.flash('success', 'New Doctor has been Added')
                res.redirect('/hospital/profile')
                return
            }).catch(err=>{
                console.log(err)
            })
        }
        catch(err){
            next(err)
        }

    },
    declineAppointmentGet: async (req, res) => {
        await Appointment.findById(req.params.id)
            .then(patientAppointment => {
                console.log('consoling found Application', patientAppointment)
                if (patientAppointment.isDeclined == true) {
                    req.flash('error', 'application already Declined')
                    res.redirect('back')
                }

                //==========sending the confirmation email to the patient================
                const html = `Hello <strong> ${patientAppointment.email}</strong>,
                Your Booking of appointment to <strong>${patientAppointment.hospital} </strong> Hospital
                on <strong>${patientAppointment.appointmentDate}</strong> has been decline please make sure to book an appointment for another day
                
                <br>
                <br>
        
                <strong>Thanks and Best Regards</strong>
      `
                // Sending the mail
                mailer.sendEmail('ezekielmisheal4@gmail.com', patientAppointment.email, 'Appointment Decline', html);

                patientAppointment.isDeclined = true;
                patientAppointment.save().then(patientAppointment => {
                    req.flash('success', 'Patient Application Declined')
                    res.redirect('back')
                }).catch(err => {
                    console.log(err)
                })

            }).catch(err => {
                console.log(err)
                req.flash('error', 'Approving unsuccessfull')
                res.redirect('back')
            })
}
}
