const express = require('express');
const session = require('express-session');
const app = express();
const bodyParser = require('body-parser')
const path = require('path');
require('dotenv').config()
const mongoose = require('mongoose');
const handlebars = require('handlebars')
const helpers = require('./public/js/pagination')



handlebars.registerHelper("inc", function (value, options) {
  return parseInt(value) + 1
})

handlebars.registerHelper('eq', function (a, b) {
  return a == b;
})
// mongoose.connect("mongodb+srv://Shahir:karmaecommerce@cluster0.kt0gapo.mongodb.net/UserManage").then(() => {
//   console.log(" port connected");
// });

mongoose.set('strictQuery', false)


mongoose.connect(process.env.DATABASE) .then(() => {
    console.log('port connected')
  })
  .catch((err) => {
    console.log('error' + err)
  })

const flash = require('express-flash');

const upload = require('./middleware/multer')

const fs = require("fs")
const nocache = require('nocache');


// app.use(upload.single("image"));


app.use(session({
    secret:process.env.SESSION_SCRKEY,
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 6000000 }
}));
app.use(express.static(path.join(__dirname, 'public')));

app.use(flash());

app.use(express.json());
app.use(bodyParser.json())
app.use(express.static(__dirname + "/public"));
app.use(express.urlencoded({ extended: true }));
app.use(nocache())

//cookies
app.use((req, res, next) => {
  res.set("Cache-control", "no-store,no-cashe");
  next();
});

//view engine
app.set("view engine", "ejs");
// app.set('views', path.join(__dirname, 'views'));
// app.use(fileUpload())



//User router
const userRoute = require("./routes/userRoute");
app.use("/", userRoute);

//adminRoute
const adminRoute = require("./routes/adminRoute");
app.use("/admin", adminRoute);


app.use((req,res) => {
  try {
      res.status(404).render('404')
  } catch (error) {
      res.status(500).render('500')
  }
})


app.listen(3000, () => {
  console.log("server is running");
});



