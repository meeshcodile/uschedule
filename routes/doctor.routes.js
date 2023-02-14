const express = require('express')
const router = express.Router()
const doctorController = require('../controllers/doctor.controller')


router.route('/doctor')
    .get(doctorController.doctorGet)

router.route('/patientAppointment/:id')
    .post(doctorController.patientAppointmentGet)



module.exports = router