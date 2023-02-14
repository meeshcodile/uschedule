const express = require('express')
const router = express.Router()
const patientController= require('../controllers/patient.controller')
const auth = require('../config/customFunction')
const isPatient = auth.isPatient
    
router.route('/register')
    .get(patientController.registerGet)
    .post(patientController.registerPost)

router.route('/verifyPatient')
    .post(patientController.verifyAccountPost)

router.route('/profile')
    .get(patientController.profileGet)

router.route('/bookAppointment/:id')
    .post(patientController.appointmentPost)



module.exports = router