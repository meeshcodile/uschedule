const express = require('express')
const router = express.Router()
const Hospital = require('../models/hospital.model')
const mailer = require('../misc/mailer')
const Admin = require('../models/admin.model')
const Patient = require('../models/patient.model')
const Doctor = require('../models/doctor.model')
const Appointment = require('../models/appointment.model')
const auth = require('../config/customFunction')
const randomstring = require('randomstring')
const bcrypt = require('bcryptjs')
const moment = require('moment')


//=============regular expression for checking the emails===================
let regex = new RegExp('[a-z0-9]+@[a-z]+\.[a-z]{2,3}');

module.exports ={
    registerGet:(req, res)=>{
        res.send('Hello this is hospital registration')
    },
    registerPost: async (req, res, next) => {
        try {
              //================checking if email is valid ===================
              if (regex.test(req.body.email)) {
            
                // ==============find if the email already exist================
                Hospital.findOne({ 'email': req.body.email }).then(hospital => {

                    if (hospital) {
                        return res.status(400).json({code:0,msg:'Email Already Exist'})
                    }else{

                        // ==========checking if password field is empty==================
                        if(req.body.password == null){
                            return res.status(400).json({code:0,msg:'password field cannot be empty'})
                        }

                        if(req.body.password == req.body.confirmPassword){
                        
                            // ================create hospital verrification token================
                            const verifyToken = randomstring.generate()

                            // ========date format=====================
                            const date = moment(Date.now()).format('MMMM Do YYYY, h:mm:ss a');
        
                            //==============creating a new instance of the hospital=================
                            const newHospital = new Hospital({
                                hospitalName:req.body.hospitalName,
                                email:req.body.email,
                                registerationNumber:req.body.registerationNumber,
                                phoneNumber:req.body.phoneNumber,
                                streetAddress:req.body.streetAddress,
                                city:req.body.city,
                                state:req.body.state,
                                password:req.body.password,
                                usertype:'Hospital',
                                facilityCode:req.body.facilityCode,
                                facilityUID:req.body.facilityUID,
                                verifyToken:verifyToken,
                                password:req.body.password,
                                date:date
                            
                            });
        
                            //====================Hash the password and save user===================================
                            bcrypt.genSalt(10, (err, salt) => {
                                bcrypt.hash(newHospital.password, salt, async (err, hash) => {
                                    if (err) {
                                        throw err
                                    }
                                    newHospital.password = hash
                                    delete req.body.confirmPassword
                                    newHospital.active = false
        
                                    try {
                                        await newHospital.save()
                                        res.status(200).send(newHospital)
                                    } catch (e) {
        
                                        if (e.name === 'ValidationError') {
                                            let errors = {}
        
                                            Object.keys(e.errors).forEach((key) => {
                                                errors[key] = e.errors[key].message
                                            })
                                            return res.status(400).send(errors)
                                        }
                                        res.status(500).json({code: 0, msg:'Something went wrong'})
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
            next(error)
        }

    },

    verifyAccountPost: async(req, res) => {

        try{
            let hospitalToken = req.body.verifyToken
            
            //===========checking if user token is save in the database==================
            const hospitalVerifyToken = await Hospital.findOne({ verifyToken: hospitalToken })


            if (!hospitalVerifyToken) {
                res.status(400).json({code:0, msg:'Invalid Token'})
            }
            // ===============setting user active=true then save====================
            hospitalVerifyToken.active = true;
            hospitalVerifyToken.verifyToken = "";
            hospitalVerifyToken.save().then(() => {
                res.json({code:1, msg:'Hospital Verified Successfully Proceed to login'})
            }).catch(err => {
                res.status(400).json({code:0, msg:err})
            })
        }catch(err) {
            throw new Error(err)
        }    
    },

    profileGet:(req,res)=>{
        Hospital.findById(req.user.id).then(hospital =>{
            res.render('hospitals/dashboard', { layout: 'hospital',hospital:hospital })

        })
    },

    addDoctorPost:async(req, res)=>{
        try{
            let id = req.params.id
            
            if(regex.test(req.body.email)){

                await Hospital.findById(id).then(async(hospital)=>{
               
                    // ===========checking if email doctor email exits=============
                    const doctorEmail = await Doctor.findOne({ 'email': req.body.email });
        
                    // =====generate password for doctor=============
                    const docPassword = randomstring.generate({length:7})
                    
                
                    if(doctorEmail){
                        return res.status(400).json({code:0, msg:'Doctor email already registered'})
                    }else{
                            const newDoctor = new Doctor({
                              firstName: req.body.firstName,
                              lastName: req.body.lastName,
                              email: req.body.email,
                              department: req.body.department,
                              doctorID: req.body.doctorID,
                              hospitalId: hospital.id,
                              password: docPassword
                            });
        
                            bcrypt.genSalt(10, (err, salt) => {
                                bcrypt.hash(newDoctor.password, salt, async (err, hash) => {
                                    if (err) {
                                        throw err
                                    }
                                    newDoctor.password = hash
                                    try {
                                        await newDoctor.save()
                                        res.status(200).send(newDoctor)
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
                    }      
                })
            }else{
                res.json({code:0, msg:'invalid Doctor Email'})
            }
            
        }catch (err){
            throw new Error(err)
        }
    },

    allDoctorsGet:async(req, res)=>{
        let hospitalId = req.params.id
        const allDoctor = await Promise.all([
            Doctor.find({'hospitalId':hospitalId}),
            Doctor.countDocuments({'hospitalId':hospitalId})
    ]) 
        return res.json(allDoctor)
    },

    patientAppointmentGet:async(req, res)=>{
        let hospitalId = req.params.id

        const allPatientAppointment = await Promise.all([
            Appointment.find({'hospitalId':hospitalId}),
            Appointment.countDocuments({'hospitalId':hospitalId})
        ])
        
        res.json(allPatientAppointment)
    },
    searchAllPatientAppointmentGet: async (req, res) => {
        const id  = req.body.patientId;
        const hospitalId = req.params.id
        let idIntegers = id.slice(3, 7);
        let idPrime = id.slice(0, 3);
        let idPrime2 = idPrime.toUpperCase();
        let searchId = `${idPrime2}${idIntegers}`;


        const allPatientAppointment = await Promise.all([
          Patient.findOne({ patientId: searchId }),
          Appointment.find({"hospitalId":hospitalId, patientId:searchId}),
          Appointment.countDocuments({ "hospitalId":hospitalId, patientId:searchId })
          
        ]);
    
        return res.json(allPatientAppointment)
      },

    deleteAppointment:async(req, res)=>{
        await Appointment.findByIdAndDelete(req.params.id)
                .then(deleteAppointment =>{
                    res.status(200).json({code:1, msg:'appointment deleted'})
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
                    res.status(400).json({code:0, msg:'Appointment already approved'})
                    
                }else{
                    patientAppointment.isApproved = true;
                    patientAppointment.save().then(patientAppointment => {
                        res.status(200).json({code:1, msg:'appointment approved successfully'})
                    }).catch(err => {
                        console.log(err)
                    })
                }
            }).catch(err => {
                console.log(err)
                res.status(400).json({code:0, msg:'something went wrong'})
            })
    },

    declineAppointmentGet: async (req, res) => {
        await Appointment.findById(req.params.id)
            .then(patientAppointment => {
                if (patientAppointment.isDeclined == true) {
                    res.status(400).json({code:0, msg:'Appointment already declined'})
                }else{
                    patientAppointment.isDeclined = true;
                    patientAppointment.save().then(patientAppointment => {
                        res.status(200).json({code:1, msg:'appointment declined successfully'})
                    }).catch(err => {
                        console.log(err)
                    })
                }
            }).catch(err => {
                console.log(err)
                res.status(400).json({code:0, msg:'something went wrong'})
            })
    },

    assignDoctorPost:async(req, res) =>{
        let id = req.params.id

    },


logoutGet:(req, res)=>{
    req.logout();
    res.redirect('/')
},
}
