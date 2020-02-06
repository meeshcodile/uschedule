const express = require('express')
const router = express.Router()
const hospitalController = require('../controllers/hospitalController')
const auth = require('../config/customFunction')
const isHospital = auth.isHospital

router.route('/register')
    .get(hospitalController.registerGet)
    .post(hospitalController.registerPost)

    
router.route('/profile')
    .get(isHospital, hospitalController.profileGet)

router.route('/patientAppointment')
    .get(isHospital,hospitalController.patientAppointmentGet)

router.route('/deleteAppointment/:id')
    .delete(isHospital,hospitalController.deleteAppointment)

router.route('/approveAppointment/:id')
    .get(isHospital,hospitalController.approveAppointmentGet)

router.route('/declineAppointment/:id')
    .get(isHospital,hospitalController.declineAppointmentGet)

router.route('/Doctors')
    .get(isHospital, hospitalController.doctorsGet)

router.route('/Doctor')
    .post(isHospital,hospitalController.doctorsPost)


router.route('/logout')
    .get(hospitalController.logoutGet)

    
module.exports = router