const express = require('express')
const router = express.Router()
const adminController = require('../controllers/admin.controller')
const auth = require('../config/customFunction')
const isAdmin = auth.isAdmin


router.route('/allHospital/')
    .get(adminController.allHospitalGet)

router.route('/allPatient')
    .get(adminController.allPatientGet)

router.route('/profile')
    .get(adminController.profileGet)

router.route('/allAppointment')
    .get(adminController.allpatientAppointmentGet)

router.route('/findPatient')
    .post(adminController.searchAllPatientAppointmentPost)

router.route('/logout')
    .get(adminController.logoutGet)


module.exports = router