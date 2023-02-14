
const nodemailer =require('nodemailer')

module.exports = {
  index: (req, res) => {
    res.render("default/index");
    // res.sendStatus(200)
  },
  aboutGet: (req, res) => {
    res.render("default/about");
    // res.sendStatus(200)
  },
  contactGet: (req, res) => {
    res.render("default/contact");
    // res.sendStatus(200)
  },
  loginGet: (req, res) => {
    res.render("default/login");
    // res.sendStatus(200)
  },
  departmentGet: (req, res) => {
    res.render("default/department");
    // res.sendStatus(200)
  },
  
  logoutGet: (req, res) => {
    req.logout();
    res.json({code:1, msg:'logout successful'})
  },
  contactGet: (req, res) => {
    res.render("default/contact");
  },
  contactPost: (req, res) => {

    var mailOptions, smtpTrans

    smtpTrans = nodemailer.createTransport({
      service:'Gmail',
      auth:{
        user: process.env.Gmail,
        pass:process.env.password
      },
      tls:{
        rejectUnauthorized:false
      }
    })

    // =====mail options=======
    mailOptions = {
      from:req.body.email,
      to:process.env.Gmail,
      subject:req.body.subject,
      text:req.body.text
    };

    smtpTrans.sendMail(mailOptions, function(error, response){
      if(error){
        req.flash('error','mail not sent')
        console.log('failingifbd+==============================')
        return res.redirect('/contact')
      }else{
        console.log('success_--------------------------------------------')
        req.flash('success','mail sent successfully')
        res.redirect('/contact')
      }
      smtpTrans.close()
    })
  }
}

