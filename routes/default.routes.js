const express = require('express')
const router = express.Router()
const defaultController = require('../controllers/default.controller')
const Patient = require('../models/patient.model')
const Hospital = require('../models/hospital.model')
const Admin = require('../models/admin.model')
const bcrypt = require("bcryptjs");
const Doctor = require('../models/doctor.model');


router.route('/')
    .get(defaultController.index)

router.route('/contact')
    .get(defaultController.contactGet)  
    .post(defaultController.contactPost)

router.route('/department')
    .get(defaultController.departmentGet)

router.route('/about')
    .get(defaultController.aboutGet)

router.route('/login')
    .get(defaultController.loginGet)


router.post('/login', async (req, res) => {
    
    let user = await Patient.findOne({ email: req.body.email })
    if (user == null) {
        user = await Hospital.findOne({ email: req.body.email })
        if (user == null) {
            user = await Doctor.findOne({ email: req.body.email })
            if (user == null) {
                user = await Admin.findOne({ email: req.body.email })
                if (user == null) {
                    res.json({ code: 0, msg: 'user does not exist' })
                } else {
                    bcrypt.compare(req.body.password, user.password, (err, passwordMatched) => {
                        if (err) {
                            console.log(err)
                            return err;
                        }
                        if (!passwordMatched) {
                            return res.json({code:0, msg:'password mismatch'});
                        }
                        return res.json({code:1,user, msg:'Login Successful'});
                    });
                }
            } else {
                bcrypt.compare(req.body.password, user.password, (err, passwordMatched) => {
                    if (err) {
                        console.log(err)
                        return err;
                    }
                    if (!passwordMatched) {
                        return res.json({code:0, msg:'password mismatch'});
                    }
                    return res.json({code:1,user, msg:'Login Successful'});
                });

            }
        }else{
            bcrypt.compare(req.body.password, user.password, (err, passwordMatched) => {
                if (err) {
                    console.log(err)
                    return err;
                }
                if (!passwordMatched) {
                    return res.json({code:0, msg:'password mismatch'});
                }
                return res.json({code:1,user, msg:'Login Successful'});
            });

        }
    }else{
        bcrypt.compare(req.body.password, user.password, (err, passwordMatched) => {
            if (err) {
                console.log(err)
                return err;
            }
            if (!passwordMatched) {
                return res.json({code:0, msg:'password mismatch'});
            }
            return res.json({code:1,user, msg:'Login Successful'});
        });
    }

})


module.exports = router