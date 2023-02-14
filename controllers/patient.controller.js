const express = require('express')
const bcrypt = require('bcryptjs')
const Hospital = require('../models/hospital.model')
const Patient = require('../models/patient.model')
const Doctor = require('../models/doctor.model')
const Appointment = require('../models/appointment.model')
const moment = require('moment')
const randomstring = require('randomstring')


// loading PatientRegistration Validations
let regex = new RegExp('[a-z0-9]+@[a-z]+\.[a-z]{2,3}');

module.exports = {

    registerGet: (req, res) => {
        res.send("patient registeration")
    },

    registerPost: (req, res) => {
        try {
            
            //================checking if email is valid ===================
            if (regex.test(req.body.email)) {
            
                // ==============find if the email already exist================
                Patient.findOne({ 'email': req.body.email }).then(patient => {

                    if (patient) {
                        return res.status(400).json({code:0,msg:'Email Already Exist'})
                    }else{

                        // ==========checking if password field is empty==================
                        if(req.body.password == null){
                            return res.status(400).json({code:0,msg:'password field cannot be empty'})
                        }

                        if(req.body.password == req.body.confirmPassword){
                        
                            // ================create patient_Id and verrification token================
                            const patientId = `US${randomstring.generate({ length: 4, charset: 'numeric' })}`
                            const verifyToken = randomstring.generate()

                            // ==========date format=============
                            const date = moment(Date.now()).format('YYYY-MM-DD, h:mm:ss a');
        
                            //==============creating a new instance of the patient=================
                            const newPatient = new Patient({
                                firstName: req.body.firstName,
                                lastName: req.body.lastName,
                                email: req.body.email,
                                phoneNumber: req.body.phoneNumber,
                                streetAddress:req.body.streetAddress,
                                city:req.body.city,
                                state:req.body.state,
                                bloodGroup: req.body.bloodGroup,
                                password: req.body.password,
                                confirmPassword: req.body.confirmPassword,
                                usertype: 'Patient',
                                patientId: patientId,
                                verifyToken: verifyToken,
                                date:date
                            });
        
                            //====================Hash the password and save user===================================
                            bcrypt.genSalt(10, (err, salt) => {
                                bcrypt.hash(newPatient.password, salt, async (err, hash) => {
                                    if (err) {
                                        throw err
                                    }
                                    newPatient.password = hash
                                    delete req.body.confirmPassword
                                    newPatient.active = false
        
                                    try {
                                        await newPatient.save()
                                        res.status(200).send(newPatient)
                                    } catch (e) {
        
                                        if (e.name === 'ValidationError') {
                                            let errors = {}
        
                                            Object.keys(e.errors).forEach((key) => {
                                                errors[key] = e.errors[key].message
                                            })
                                            return res.status(400).send(errors)
                                        }
                                        res.status(500).send('Something went wrong')
                                    }
        
                                })
                            })
                        }else{
                            res.json({code:0,msg:'password mismatch'})
                        }
                    }     
                  
                })
            }
            
            else {
                res.json({code:0,msg:"Wrong Email Address"})
            }
        }
        catch (error) {
            throw new Error(error)
        }

    },

    verifyAccountPost: async(req, res) => {

        try{
            let patientToken = req.body.verifyToken
            
            //===========checking if user token is save in the database==================
            const patientVerifyToken = await Patient.findOne({ verifyToken: patientToken})
        
            if (!patientVerifyToken) {
                res.status(400).json({code:0, msg:'Invalid Token'})
            }
            // ===============setting user active=true then save====================
            patientVerifyToken.active = true;
            patientVerifyToken.verifyToken = "";
            patientVerifyToken.save().then(() => {
                res.json({code:1, msg:'Patient Verified Successfully Proceed to login'})
            }).catch(err => {
                res.status(400).json({code:0, msg:err})
            })
        }catch(err) {
            throw new Error(err)
        }    
    },

    profileGet: (req, res) => {
        let patient = req.user
        Patient.findById(req.user._id).then(user => {
            Hospital.find().then(hospital => {
                res.render('patients/dashboard', { layout: 'patient', user, patient, hospital })

            })

        })
    },

    appointmentPost: async (req, res) => {
        try{
            let id = req.params.id
            await Patient.findById(id).then(async (patient) => {

                let selectedHospital = await Hospital.findOne({ hospitalName: req.body.hospital })

                if(selectedHospital == null){
                    return res.json({code:0, msg:'Sorry no such registered hospital'})

                }else{
                    //================formatting the date.now() method using moment===================
                    const date = moment(Date.now()).format('YYYY-MM-DD, h:mm:ss a');
                    const formatDate = moment(req.body.appointmentDate).format('YYYY-MM-DD')

    
                    let newAppointment = new Appointment({
                        hospital: req.body.hospital,
                        message: req.body.message,
                        ailment: req.body.ailment,
                        department: req.body.department,
                        patientId: patient.patientId,
                        hospitalId: selectedHospital.id,
                        date: date,
                        appointmentDate:formatDate,
                    })
                    
                   await newAppointment.save()
                    return res.json(newAppointment)                
                }
            })

            
        }catch (err){
            throw new Error(err)
        }
        
    }
}

