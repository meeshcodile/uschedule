const express = require('express')
const router = express.Router()
const adminController = require('../controllers/adminController')
const auth = require('../config/customFunction')
const isAdmin = auth.isAdmin



router.route('/profile')
    .get(isAdmin,adminController.profileGet)

router.route('/logout')
    .get(adminController.logoutGet)

router.route('/patient')
    .get(isAdmin,adminController.patientGet)

router.route('/sendAppointment/:id')
    .get(isAdmin,adminController.sendAppointmentGet)

router.route('/allHospital')
    .get(isAdmin,adminController.allHospitalGet)


module.exports = router