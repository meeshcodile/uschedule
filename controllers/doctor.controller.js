const Doctor = require('../models/doctor.model')
const Patient = require('../models/patient.model')
const Hospital = require('../models/hospital.model')
const Appointment = require('../models/appointment.model')


module.exports ={
    doctorGet:(req, res)=>{
        res.json({code:1, msg:'doctor profile'})
    },

    patientAppointmentGet: async (req, res) => {
        const id  = req.body.patientId;
        const doctorId = req.params.id
        let idIntegers = id.slice(3, 7);
        let idPrime = id.slice(0, 3);
        let idPrime2 = idPrime.toUpperCase();
        let searchId = `${idPrime2}${idIntegers}`;

        const allPatientAppointment = await Promise.all([
          Patient.findOne({ patientId: searchId }) 
        ]);
    
        return res.json(allPatientAppointment)
      }
}