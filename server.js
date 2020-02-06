require("dotenv").config("./.env");

const express = require("express");
const logger = require("morgan");
const passport = require("passport");
const expresshandlebars = require("express-handlebars");
const path = require("path");
const bodyParser = require("body-parser");
const session = require("express-session");
const app = express();
const methodOverride = require("method-override");
const flash = require("connect-flash");
const mongoose = require("mongoose");
const mongoStore = require("connect-mongo")(session);
const MONGO_URL = require("./config/db").MONGOURL;
const port = process.env.PORT || 4000;

// ========================database connections===========================
mongoose.Promise = global.Promise;
mongoose
  .connect(MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log(`database connected successfully`);
  })
  .catch(err => {
    console.log(`database not connected successfully ${err}`);
  });
// =============setting up morgan=============
app.use(logger("dev"));
// ==============template engine==============
app.engine(
  ".hbs",
  expresshandlebars({ defaultLayout: "layout", extname: ".hbs" })
);
app.set("view engine", ".hbs");

app.use(express.static(path.join(__dirname, "public")));

// ===================method override middleware==================
app.use(methodOverride("newMethod"));

// ==============setting up body-parser================
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
  session({
    cookie: {

      maxAge: 180 * 60 * 1000
    },
    secret: "hospital management system",
    resave: false,
    saveUninitialized: false,
    store: new mongoStore({ mongooseConnection: mongoose.connection })
  })
);

//===============================initialize passport===========================
app.use(passport.initialize());
app.use(passport.session());
// ==========setting up flash/Environmental variables and middlewares
app.use(flash());
app.use((req, res, next) => {
  res.locals.success_messages = req.flash("success");
  res.locals.error_messages = req.flash("error");
  res.locals.user = req.user ? true : false;
  res.locals.session = req.session;
  next();
});

//==============route grouping=================
const defaultRoutes = require("./routes/defaultRoutes");
const adminRoutes = require("./routes/adminRoutes");
const hospitalRoutes = require("./routes/hospitalRoutes");
const patientRoutes = require("./routes/patientRoutes");
const userRoutes = require("./routes/userRoutes");

app.use("/", defaultRoutes);
app.use("/patient", patientRoutes);
app.use("/hospital", hospitalRoutes);
app.use("/user", userRoutes);
app.use("/admin", adminRoutes);

// ======error page=================
app.use((req, res, next) => {
  res.render("default/error404");
});

//===============server listenning==============
app.listen(port, (req, res) => {
  console.log(`server started at port ${port}`);
});
