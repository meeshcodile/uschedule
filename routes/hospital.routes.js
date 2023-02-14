const express = require('express')
const router = express.Router()
const hospitalController = require('../controllers/hospital.controller')
const auth = require('../config/customFunction')


router.route('/register')
    .get(hospitalController.registerGet)
    .post(hospitalController.registerPost)

router.route('/verifyHospital')
    .post(hospitalController.verifyAccountPost)


router.route('/profile')
    .get(hospitalController.profileGet)

router.route('/addDoctor/:id')
    .post(hospitalController.addDoctorPost)

router.route('/allDoctors/:id')
    .get(hospitalController.allDoctorsGet)

router.route('/patientAppointment/:id')
    .get(hospitalController.patientAppointmentGet)

router.route('/searchPatient/:id')
    .post(hospitalController.searchAllPatientAppointmentGet)

router.route('/deleteAppointment/:id')
    .delete(hospitalController.deleteAppointment)

router.route('/approveAppointment/:id')
    .get(hospitalController.approveAppointmentGet)

router.route('/declineAppointment/:id')
    .get(hospitalController.declineAppointmentGet)

router.route('/assignDoctor/:id')
    .post(hospitalController.assignDoctorPost)

router.route('/logout')
    .get(hospitalController.logoutGet)

    
module.exports = router