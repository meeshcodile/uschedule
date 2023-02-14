const Patient = require("../models/patient.model");
const Hospital = require("../models/hospital.model");
const Admin = require("../models/admin.model");
const Appointment = require("../models/appointment.model");

module.exports = {
  profileGet: async (req, res) => {
    await Patient.countDocuments(async (err, totalPatients) => {
      await Hospital.countDocuments(async (err, totalHospitals) => {
        await Appointment.countDocuments(async (err, totalAppointments) => {
          await Admin.findOne({ fullName: "misheal" }, (err, admin) => {
            res.render("admin/dashboard", {
              layout: "admin",
              admin: admin,
              totalPatients,
              totalHospitals,
              totalAppointments
            });
          });
        });
      });
    });
  },

  allHospitalGet:async(req,res)=>{
    await Hospital.find().then(hospital=>{
        res.json(hospital)
    })
  },

  allPatientGet:async(req,res)=>{
    await Patient.find().then(patient=>{
        res.json(patient)
    })
  },

  allpatientAppointmentGet: async (req, res) => {
    await Appointment.find().then(patientAppointment => {
      res.json(patientAppointment)
    });
  },

  searchAllPatientAppointmentPost: async (req, res) => {
    const id  = req.body.patientId;
    let idIntegers = id.slice(3, 7);
    let idPrime = id.slice(0, 3);
    let idPrime2 = idPrime.toUpperCase();
    let searchId = `${idPrime2}${idIntegers}`;

    
    const allPatientAppointment = await Promise.all([
      Patient.findOne({ patientId: searchId }),
      Appointment.countDocuments({ patientId: searchId }),
    ]);

    return res.json(allPatientAppointment)
  },

  logoutGet: (req, res) => {
    req.logout();
    res.redirect("/");
  },  
  
};
