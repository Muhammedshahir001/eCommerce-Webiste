const bcrypt = require("bcrypt");
const User = require("../models/usermodel");
const nodemailer = require("nodemailer");
const productcollection = require("../models/productModel");
const categorycollectons = require("../models/categoryModel");
const Cart = require('../models/cartModel')
const Order = require("../models/orderModel");
const Wish = require('../models/whishlistModel')
const Coupon = require("../models/couponmodel");
const Banner = require("../models/bannerModel");
const offerSchema = require('../models/offerModel');
const productOfferSchema = require('../models/product_offerModel');
const { otpGen } = require("../controllers/otpControllers");
require("dotenv").config();
const Razorpay = require('razorpay');
const { Console } = require("console");
const { query } = require("express");

const { ObjectId } = require("mongodb");
const { logger, log } = require("handlebars/runtime");
const { update_product_offer } = require("./offerController");

var instance = new Razorpay({
  key_id: process.env.SECRET_KEY_ID,
  key_secret: process.env.KEY_SECRET,
});


var username;
const sMail = (email, otp) => {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: "karmashopping14@gmail.com",
      pass: "aoqlrpekkzncmrsx",
    },
  });

  const mailOptions = {
    from: "karmashopping14@gmail.com",
    to: email,
    subject: "Your OTP",
    text: ` WELCOME  TO KARMA SHOPE HERE IS  Your OTP is \n ${otp}`,

  };

  // send the email-------------------

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log("Email sent:" + info.response);
    }
  });
};


const oneTimePin = otpGen();

let userdata; // Changed var to let for variable declaration

const signupSubmit = async (req, res) => {
  userdata = req.body;

  const isNewname = await User.isExistingUserName(req.body.name);
  if (!isNewname) return res.render('user/signup', { message: 'Existing UserName' });

  const isNewemail = await User.isExistingEmail(req.body.email);
  if (!isNewemail) return res.render('user/signup', { message: 'Email already used' });

  req.session.pass = oneTimePin;
  sMail(req.body.email, oneTimePin);
  res.redirect('/otp');
};




const verifyOtp = async (req, res) => {
  try {
    const { val1, val2, val3, val4, val5, val6 } = req.body;
    // console.log(req.body);
    const formOtp = Number(val1 + val2 + val3 + val4 + val5 + val6);
    // console.log(formOtp, oneTimePin);

    if (formOtp == oneTimePin) {
      const { name, email, number, password } = userdata;
      // console.log("userdata");
      const spassword = await securePassword(password);
      const user = new User({
        name: name,
        email: email,
        number: number,
        password: spassword,
      });
      const userData = await user.save();
      if (userData) {
        res.render('user/login', { message: 'Registration success' });
      }
    } else {
      res.render('user/signup', { message: 'Incorrect OTP' }); // Updated error message
    }
  } catch (error) {
    console.log('verifyOtp', error.message);
  }
};



//otp page-------------
const LoadOtp = (req, res) => {
  try {
    res.render("user/otp");
  } catch (error) {
    console.log(error.message);
  }
};

//resend otp----------
const resendotp = (req, res) => {
  // oneTimePin = otpGen();
  sMail(req.session.email, oneTimePin);
  res.redirect("/otp");
};

//password hashing-------------------------
const securePassword = async (password) => {
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    return hashedPassword;
  } catch (error) {
    console.log(error.message);
  }
};
//forget password

const forgotpassword = (email, otp) => {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: process.env.NODEMAILEREMAIL,
      pass: process.env.NODEMAILERPASS,
    },
  });

  const mailOptions = {
    from: "karmashopping14@gmail.com",
    to: email,
    subject: "Your OTP",
    text: `Your OTP is ${otp}`,
  };

  // send the email-------------------

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log("Email sent:" + info.response);
    }
  });
};


const forgotPasswordPage = (req, res) => {
  try {
    res.render("user/forget", { user: true });
  } catch (err) {
    console.log(err)
  }
};


const updatePassword = (req, res) => {
  try {
    const id = req.query.id;

    res.render("user/updatepass", { user: true, id });
  } catch (err) {
    console.log(err)
  }
};



const forgotPass = async (req, res) => {
  try {
    const userEmail = req.body.email;
    const oneTimePin = otpGen(); // Generate OTP
    req.session.userMail = userEmail;
    req.session.oneTimePin = oneTimePin; // Store OTP in session

    forgotpassword(userEmail, oneTimePin);
    res.render('user/fotp', { message: 'OTP sent successfully' }); // Updated success message
  } catch (err) {
    console.log(err);
  }
};


const passForgotOtp = async (req, res) => {
  try {
    const { val1, val2, val3, val4, val5, val6 } = req.body;
    const formOtp = Number(val1 + val2 + val3 + val4 + val5 + val6);
    const storedOtp = req.session.oneTimePin; // Access stored OTP from session

    if (formOtp == storedOtp) {
      res.render('user/updatepass', { message: 'OTP verified' });
    } else {
      res.render('user/fotp', { message: 'Incorrect OTP' });
    }
  } catch (error) {
    console.log('passForgotOtp', error.message);
  }
};

const updatePass = async (req, res) => {
  try {
    const email = req.session.userMail; // Get the email from session
    const password = req.body.password;
    const hashPass = await securePassword(password);
    await User.updateOne({ email: email }, { $set: { password: hashPass } }); // Use email from session
    res.redirect('/login');
  } catch (err) {
    console.log(err);
  }
};





const forgotSubmit = (req, res) => {
  const oneTimePin = otpGen();
  const { email } = req.body;
  forgotpassword(email, oneTimePin); // Pass email as a parameter
  req.session.pass = oneTimePin;
  res.render("user/fotp");
};




//login------------------------------------------------------
const getLogin = (req, res) => {
  try {
    res.render("user/login");
  } catch (error) {
    console.log(error.message);
  }
};

const postlogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({
      email: email,
    });
    if (user) {
      const passwordMatch = await bcrypt.compare(password, user.password);
      if (passwordMatch) {
        req.session.user = user._id;
        req.session.userIn = true;
        req.session.name = user.name;
        req.flash("success", "login successfully.");
        res.redirect("/");
      } else {
        res.render("user/login", { message: "Invalid username and password" });
      }
    } else {
      res.render("user/login", { message: "Invalid username and password" });
    }
  } catch (error) {
    console.log(error.message);
  }
};

//signup----------------------------------------
const getsignup = (req, res) => {
  try {
    res.render("user/signup");
  } catch (error) {
    console.log(error.message);
  }
};


const postsignup = async (req, res) => {
  try {
    const { name, email, number, password } = req.body;

    const data = new User({
      name: name,
      email: email,
      number: number,
      password: await securePassword(password),
    });
    req.session.email = email;
    req.session.name = name;
    req.session.number = number;
    req.session.password = password;
    const result = await data.save();
    if (result) {
      res.render("user/signup", { message: "registration successfully " });
    } else {
      res.render("user/signup", { message: "registration faild" });
    }

  } catch (error) {
    console.log(error.message);
  }
};



//block User---------------------------------------------------
const blockuser = async (req, res) => {
  try {
    const userData = await User.findOne({ _id: req.query.id });
    if (userData) {
      await User.updateOne({ _id: userData._id }, { $set: { status: true } });
      res.redirect("/admin/usermanage");
    }
  } catch (error) {
    console.log(error);
  }
};
//UnBlock user----------------------------------------------------
const unblockuser = async (req, res) => {
  try {
    const userData = await User.findOne({ _id: req.query.id });
    if (userData) {
      await User.updateOne({ _id: userData._id }, { $set: { status: false } });
      res.redirect("/admin/usermanage");
    }
  } catch (error) {
    console.log(error);
  }
};
// list category ------------


//home---------------------------------------------

const getHome = async (req, res) => {
  try {

    const data = await productcollection.find();
    const bannerData = await Banner.find();
    const offers = await offerSchema.find({ status: 'Active' })
      .populate('category.categoryId');
    const productOffer = await productOfferSchema.find({ status: 'Active' });

    if (req.session.user) {
      const countCart = await Cart.find({ user: req.session.userId });
      let cartCount = 0;

      if (countCart.length > 0) {
        const productscart = countCart[0].product;
        cartCount = productscart.length;
      }

      res.render("user/home", {
        user: req.session.name,
        products: data,
        banner: bannerData,
        cartCount,
      });
    } else {
      req.session.user = false;
      res.render("user/home", { products: data, banner: bannerData, offers, productOffer });
    }
  } catch (error) {
    console.log(error.message);
  }
};


//logout--------------------------------------------
const getLogout = async (req, res) => {
  try {
    req.session.destroy();
    res.redirect("login");
  } catch (error) {
    console.log(error.message);
  }
};

//verifiymail---------------------------------------
const verifymail = async (req, res) => {
  try {
    res.render("admin/verifyEmail.ejs");
  } catch (error) {
    console.log(error.massage);
  }
};

const getproducts = async (req, res) => {
  try {
    const baseCategory = await categorycollectons.find()



    let search = req.query.search || "";
    let filter2 = req.query.filter || "ALL";
    let categoryId = req.query.categoryId;

    var minPrice = 0
    var maxPrice = 100000
    var sortValue = 1




    if (req.query.minPrice) {
      minPrice = req.query.minPrice
    }

    if (req.query.maxPrice) {
      maxPrice = req.query.maxPrice
    }

    var sortValue = 1;
    if (req.query.sortValue) {
      sortValue = req.query.sortValue
    }





    if (categoryId) {
      query.category = categoryId

    }

    let sort = req.query.sort || "0";
    const pageNO = parseInt(req.query.page) || 1;
    const perpage = 6;
    const skip = perpage * (pageNO - 1);
    const catData = await categorycollectons.find({ status: false });
    let cat = catData.map((category) => category._id);

    let filter = filter2 === "ALL" ? [...cat] : req.query.filter.split(",");
    if (filter2 !== "ALL") {
      filter = filter.map((filterItem) => new ObjectId(filterItem));
    }
    sort = req.query.sort == "High" ? -1 : 1;

    minPrice = Number(minPrice)
    maxPrice = Number(maxPrice)
    const data = await productcollection.aggregate([
      {
        $match:
        {
          productname: { $regex: search, $options: "i" },
          category: { $in: filter },
          price: { $gte: minPrice, $lt: maxPrice },
          status: false
        }
      },
      { $sort: { price: sort } },
      { $skip: skip },
      { $limit: perpage },
    ]);

    const productCount = await productcollection.find({ productname: { $regex: search, $options: "i" }, category: { $in: filter }, price: { $gte: minPrice, $lt: maxPrice } }).countDocuments();

    const totalPage = Math.ceil(productCount / perpage);

    let cartCount = 0;
    if (req.session.user) {
      const countCart = await Cart.findOne({ user: req.session.userId });
      if (countCart && countCart.product) {
        cartCount = countCart.product.length;
      }
    }
    const productOffer = await productOfferSchema.find({ status: 'Active', productname: data._id, endDate: { $gte: new Date() }, startDate: { $lte: new Date() } }).sort({ discountPercentage: 1 });

    const offers = await offerSchema.find({ status: 'Active', baseCategory: data._id, endDate: { $gte: new Date() }, startDate: { $lte: new Date() } }).populate('category').sort({ discountPercentage: 1 })
   



    res.render("user/products", {
      user: data,
      data2: catData,
      total: totalPage,
      filter: filter,
      sort: sort,
      search: search,
      cartCount: cartCount,
      categoryId: categoryId,
      baseCategory,
      minPrice,
      maxPrice,
      sortValue,
      offers,
      productOffer,

    });
  } catch (error) {
    console.log(error);
  }
};









//cart page------------------------

const getcart = async (req, res) => {
  try {

    if (req.session.user) {
      const user = await User.findOne({ _id: req.session.user });
      const id = user._id;


      const cart = await Cart.findOne({ user: id });
      if (cart) {
        const cartData = await Cart.findOne({ user: id })
          .populate("product.productId")
          .lean();
        if (cartData) {
          let total = 0;
          if (cartData.product.length) {
            for (let i = 0; i < cartData.product.length; i++) {
              const offers = await offerSchema.find({ status: 'Active', category: cartData.product[i].productId.category, endDate: { $gte: new Date() }, startDate: { $lte: new Date() } })
             
              const proOffers = await productOfferSchema.find({ status: 'Active', product_name: cartData.product[i].productId._id, endDate: { $gte: new Date() }, startDate: { $lte: new Date() } })
              if (offers.length && proOffers.length) {

                const res = Math.round(cartData.product[i].productId.price * (offers[0].discountPercentage + proOffers[0].discountPercentage) / 100)
                total = total + cartData.product[i].quantity * (cartData.product[i].productId.price - res)

              }
              else if (offers.length) {
                const res = Math.round(cartData.product[i].productId.price * offers[0].discountPercentage / 100)
                total = total + cartData.product[i].quantity * (cartData.product[i].productId.price - res)
              }
              else if (proOffers.length) {
                const res = Math.round(cartData.product[i].productId.price * proOffers[0].discountPercentage / 100)
                total = total + cartData.product[i].quantity * (cartData.product[i].productId.price - res)
              }else{
                total = total + cartData.product[i].quantity * (cartData.product[i].productId.price)
              }
            }
            // const total = await Cart.aggregate([
            //   {
            //     $match: { user: id },
            //   },
            //   {
            //     $unwind: "$product",
            //   },
            //   {
            //     $project: {
            //       price: "$product.price",
            //       quantity: "$product.quantity",
            //       image: "$product.image",
            //     },
            //   },
            //   {
            //     $group: {
            //       _id: null,
            //       total: {
            //         $sum: {
            //           $multiply: ["$quantity", "$price"],
            //         },
            //       },
            //     },
            //   },
            // ]).exec();
            const Total = total

            cartData.product.forEach((element) => { });
            res.render("user/cart", {
              user: req.session.name,
              data: cartData.product,
              userId: id,
              total: Total,
              // cartData: cartData,
            });
          } else {
            res.render("user/cart", { user: req.session.name, data2: "hi" });
          }
        } else {
          res.render("user/cart", { user: req.session.name, data2: "hi" });
        }
      } else {
        res.render("user/cart", {
          user: req.session.name,
          data2: "hi",
        });
      }
    } else {
      res.redirect("/login");
    }
  } catch (error) {
    console.log(error);
  }
};










// addToCart....................................

const addtocart = async (req, res) => {
  try {
    if (req.session.user) {
      const productId = req.query.id;
      const userName = req.session.user;
      const userdata = await User.findOne({ _id: userName });
      const userId = userdata._id;
      const productData = await productcollection.findById({
        _id: productId,
      });
      const userCart = await Cart.findOne({ user: userId });
      if (userCart) {
        const productExist = await userCart.product.findIndex(
          (product) => product.productId == productId
        );
        if (productExist != -1) {
          await Cart.findOneAndUpdate(
            { user: userId, "product.productId": productId },
            { $inc: { "product.$.quantity": 1 } }
          ).then((value) => {
            res.json({ success: true });
          });
        } else {
          await Cart.findOneAndUpdate(
            { user: userId },
            {
              $push: {
                product: {
                  productId: productId,
                  price: productData.price,
                },
              },
            }
          );
          res.json({ success: true });

        }
      } else {
        const data = new Cart({
          user: userId,
          product: [
            {
              productId: productId,
              price: productData.price,
            },
          ],
        });
        await data.save();
        res.json({ success: true });
      }
    } else {
      res.json({ success: false });
    }
  } catch (error) {
    console.log(error.message);
  }
};
//get checkout
const checkout = async (req, res) => {
  try {

    if (req.session.user) {
      const Id = req.query.id;
      const data = await productcollection.findById(Id)

      const user = await User.findOne({ _id: req.session.user });
      console.log(req.body.subto);
      const id = user._id;

      const cartData = await Cart.findOne({ user: id }).populate(
        "product.productId"
      );
      if (cartData.product != 0) {
        let total = 0;
        if (cartData.product.length) {
          for (let i = 0; i < cartData.product.length; i++) {
            const offers = await offerSchema.find({ status: 'Active', category: cartData.product[i].productId.category, endDate: { $gte: new Date() }, startDate: { $lte: new Date() } })
            const proOffers = await productOfferSchema.find({ status: 'Active', product_name: cartData.product[i].productId._id, endDate: { $gte: new Date() }, startDate: { $lte: new Date() } })
            if (offers.length && proOffers.length) {

              const res = Math.round(cartData.product[i].productId.price * (offers[0].discountPercentage + proOffers[0].discountPercentage) / 100)
              total = total + cartData.product[i].quantity * (cartData.product[i].productId.price - res)

            }
            else if (offers.length) {
              const res = Math.round(cartData.product[i].productId.price * offers[0].discountPercentage / 100)
              total = total + cartData.product[i].quantity * (cartData.product[i].productId.price - res)
            }
            else if (proOffers.length) {
              const res = Math.round(cartData.product[i].productId.price * proOffers[0].discountPercentage / 100)
              total = total + cartData.product[i].quantity * (cartData.product[i].productId.price - res)
            }
            else if (!offers.length && !proOffers.length) {
              total = total + cartData.product[i].quantity * cartData.product[i].productId.price;
            }

          }
       
          // const total = await Cart.aggregate([
          //   {
          //     $match: { user: id },
          //   },
          //   {
          //     $unwind: "$product",
          //   },
          //   {
          //     $project: {
          //       price: "$product.price",
          //       quantity: "$product.quantity",
          //       image: "$product.image",
          //     },
          //   },
          //   {
          //     $group: {
          //       _id: null,
          //       total: {
          //         $sum: {
          //           $multiply: ["$quantity", "$price"],
          //         },
          //       },
          //     },
          //   },
          // ]).exec();
          const Total = total
          // const total = await Cart.aggregate([
          //   {
          //     $match: { user: user._id },
          //   },
          //   {
          //     $unwind: "$product",
          //   },
          //   {
          //     $project: {
          //       price: "$product.price",
          //       quantity: "$product.quantity",
          //     },
          //   },
          //   {
          //     $group: {
          //       _id: null,
          //       total: {
          //         $sum: {
          //           $multiply: ["$quantity", "$price"],
          //         },
          //       },
          //     },
          //   },
          // ]).exec();
          req.session.total = Total
          //pass the data to front
          const data = await User.findOne({
            name: req.session.name,
          });
          res.render("user/checkout", {
            address: data.address,
            total: Total,
            wallet: data.wallet
          });
        }
      }
    } else {
      res.redirect("/");
    }
  } catch (error) {
    console.log(error.message);
  }
};

//confermation after checkout
const confermation = async (req, res) => {
  try {
    const orderData = await Order.findOne().sort({ Date: -1 }).limit(1).populate('product.productId');

    const userId = orderData.user;


    res.render("user/order_placed", { user: orderData });

  } catch (error) {
    console.log(error.message);
  }
};
//Chnage quty........................
const changeQty = async (req, res) => {
  try {
    const userId = req.body.user;
    const productId = req.body.product;
    const value = Number(req.body.value);


    const stockAvailable = await productcollection.findById(productId);

    const productOffer = await productOfferSchema.find({ status: 'Active', product_name: stockAvailable._id }).sort({ discountPercentage: 1 });

    const offers = await offerSchema.find({ status: 'Active', category: stockAvailable.category._id }).populate('category').sort({ discountPercentage: 1 })
  
    if (stockAvailable.quantity >= value) {

      await Cart.updateOne(
        {
          user: userId,
          "product.productId": productId,
        },
        {
          $set: { "product.$.quantity": value },
        }
      );
      res.json({ success: true });

    } else {
      res.json({ success: false });
    }
  } catch (error) {
    console.log(error.message);
  }
};

//detete cart
const deleteCart = async (req, res) => {
  try {
    const id = req.body.id;
    const data = await Cart.findOneAndUpdate(
      { "product.productId": id },
      { $pull: { product: { productId: id } } }
    );
    if (data) {
      res.json({ success: true });
    }
  } catch (error) {
    console.log(error.message);
  }
};

//Whishlist...........................

const getwhishlist = async (req, res) => {
  try {
    if (req.session.user) {
      const user = await User.findOne({ _id: req.session.user });
      const id = user._id;
      const wish = await Wish.findOne({ user: id });
      if (wish) {
        // const userData = await User.findOne({ _id: req.session.user });
        const wishData = await Wish.findOne({ user: id })
          .populate("product.productId")
          .lean();
        if (wishData) {
          // console.log(cartData);
          let total;
          if (wishData.product.length) {
            const total = await Wish.aggregate([
              {
                $match: { user: id },
              },
              {
                $unwind: "$product",
              },
              {
                $project: {
                  price: "$product.price",
                  quantity: "$product.quantity",
                  image: "$product.image",
                },
              },
              {
                $group: {
                  _id: null,
                  total: {
                    $sum: {
                      $multiply: ["$quantity", "$price"],
                    },
                  },
                },
              },
            ]).exec();
            // console.log(total);
            const Total = total[0].total;
            wishData.product.forEach((element) => { });
            res.render("user/whishlist", {
              user: req.session.name,
              data: wishData.product,
              userId: id,
              total: Total,
              // cartData: cartData,
            });
          } else {
            res.render("user/whishlist", { user: req.session.name, data2: "hi" });
          }
        } else {
          res.render("user/whishlist", { user: req.session.name, data2: "hi" });
        }
      } else {
        res.render("user/whishlist", {
          user: req.session.name,
          data2: "hi",
        });
      }
    } else {
      res.redirect("/login");
    }
  } catch (error) {
    console.log(error);
  }
};

// add to whish list
const addtowishlist = async (req, res) => {
  try {
    if (req.session.user) {
      const productId = req.query.id;
      const userName = req.session.user;
      const userdata = await User.findOne({ _id: userName });
      const userId = userdata._id;
      const productData = await productcollection.findById(productId);
      const userwish = await Wish.findOne({ user: userId });

      if (userwish) {
        const productExist = userwish.product.findIndex(
          (product) => product.productId == productId
        );

        if (productExist !== -1) {
          await Wish.findOneAndUpdate(
            { user: userId, "product.productId": productId },
            { $inc: { "product.$.quantity": 1 } }
          );
          res.json({ success: true });
        } else {
          await Wish.findOneAndUpdate(
            { user: userId },
            {
              $push: {
                product: {
                  productId: productId,
                  price: productData.price,
                },
              },
            }
          );
          res.json({ status: true });
        }
      } else {
        const data = new Wish({
          user: userId,
          product: [
            {
              productId: productId,
              price: productData.price,
            },
          ],
        });
        await data.save();
        res.json({ status: true });
      }
    } else {
      res.json({ status: false });
    }
  } catch (error) {
    console.log(error.message);
    res.json({ status: false, error: error.message });
  }
};

const deletewish = async (req, res) => {
  try {
    const id = req.body.id;
    const data = await Wish.findOneAndUpdate(
      { "product.productId": id },
      { $pull: { product: { productId: id } } }
    );
    if (data) {
      res.json({ success: true });
    }
  } catch (error) {
    console.log(error.message);
  }
};

const getsingleproduct = async (req, res) => {
  try {
    const id = req.query.id;
    const data = await productcollection.findById(id).populate("category");


    if (data) {
      const productOffer = await productOfferSchema.find({ status: 'Active', product_name: data._id, endDate: { $gte: new Date() }, startDate: { $lte: new Date() } }).sort({ discountPercentage: 1 });
      const offers = await offerSchema.find({ status: 'Active', category: data.category._id, endDate: { $gte: new Date() }, startDate: { $lte: new Date() } })
        .populate('category').sort({ discountPercentage: 1 })
      res.render("user/singleproduct", { product: data, productOffer, offers });
    }
  } catch (error) {
    console.log(error);
  }
}




//filter category-----------------
const filtercategory = async (req, res) => {
  try {
    let search = "";
    if (req.query.search) {
      search = req.query.search;
    }
    const categoryId = req.query.id;
    const data2 = await categorycollectons.find().lean();
    const data = await productcollection
      .find({ category: categoryId })
      .populate("category");
    const pageNO = req.query.page;
    const count = await productcollection
      .find(
        { category: categoryId },
        {
          $or: [
            { productname: { $regex: ".*" + search + ".*", $options: "i" } },
            { brand: { $regex: ".*" + search + ".*", $options: "i" } },
          ],
        }
      )
      .countDocuments();
    const perpage = 6;
    const totalpage = Math.ceil(count / perpage);
    let a = [];
    let i = 0;
    for (var j = 1; j <= totalpage; j++) {
      a[i] = j;
      i++;
    }

    //  const data = findproducts.filter((value)=>value.category._id==categoryId)
    res.render("user/products", { user: data, data2, total: a });
  } catch (error) {
    console.log(error.message);
  }
};

// update User data
const updateData = async (req, res) => {
  try {
    const name = req.body.name;
    const email = req.body.email;
    const mobile = req.body.mobile;
    const id = req.body.id;

    const data = await User.findByIdAndUpdate(id, {
      $set: { name: name, email: email, number: mobile },
    });
    if (data) {
      res.redirect("/getUserProfile");
    }
  } catch (error) {
    console.log(error.message);
  }
};
//postAdrress
const postAddress = async (req, res) => {
  try {
    if (req.session.user) {
      const { name, country, town, district, postcode, phone } = req.body;
      const id = req.session.user;
      const data = await User.findOneAndUpdate(
        { _id: id },
        {
          $push: {
            address: {
              name: name,
              country: country,
              town: town,
              district: district,
              postcode: postcode,
              phone: phone,
            },
          },
        },
        { new: true }
      );
      res.redirect("/checkout");
    } else {
      res.redirect("/");
    }
  } catch (error) {
    console.log(error.message);
  }
};

//getUserProfile
const getUserProfile = async (req, res) => {
  try {
    if (req.session.user) {
      let userData = await User.findOne({ _id: req.session.user });
      let datawallet = await User.find({ _id: req.session.user })
      const [{ wallehistory }] = datawallet
      res.render("user/userprofile", { data: userData, wallet: wallehistory });
    } else {
      res.redirect("/login");
    }
  } catch (error) {
    console.log(error.message);
  }
};

//get edit address page
const editaddress = async (req, res) => {
  try {
    if (req.session.user) {
      const data = await User.findOne({
        _id: req.session.user,
        "address._id": req.query.id,
      }).lean();
      res.render("user/editaddress", { user: data.address });
    }
  } catch (error) {
    console.log(error);
  }
};

// post add address
const editpostaddress = async (req, res) => {
  try {
    if (req.session.user) {
      const addressId = req.body.id;
      console.log("🚀 ~ file: userController.js:963 ~ editpostaddress ~ addressId:", addressId)
      const userId = req.session.user;

      const x = await User.findOne({ _id: userId, " address._id": req.body.id })
      console.log("🚀 ~ file: userController.js:966 ~ editpostaddress ~ x:", x)

      await User.updateOne(
        { _id: userId, " address._id": addressId },

        {
          $set: {
            "address.$.name": req.body.name,
            "address.$.town": req.body.town,
            "address.$.street": req.body.street,
            "address.$.postcode": req.body.postcode,
            "address.$.phone": req.body.phone,
          },
        },
      );
      res.redirect("/checkout");
    }
  } catch (error) {
    console.log(error.message);
  }
};
//deleteAddress
const deleteAddress = async (req, res) => {
  try {
    if (req.session.user) {
      const userName = req.session.name;
      const id = req.query.id;
      await User.updateOne(
        { name: userName },
        {
          $pull: {
            address: {
              _id: id,
            },
          },
        }
      );
      res.redirect("/checkout");
    } else {
      res.redirect("/");
    }
  } catch (error) {
    console.log(error.message);
  }
};
//cash on deivery--------
const postPlaceOrder = async (req, res) => {
  try {
    if (req.session.user) {
      const { address, payment, wallet, totalBefore } = req.body;
      const total = req.session.total
      const user = await User.findOne({
        name: req.session.name,
      });
      if (address === null) {
        res.json({ codFailed: true });
      }
      const cartData = await Cart.findOne({ user: user._id });
      const product = cartData.product;
      const status = payment == "cod" ? "placed" : "pending";
      const orderNew = new Order({
        deliveryDetails: address,
        totalAmount: total,
        status: status,
        user: user._id,
        paymentMethod: payment,
        product: product,
        wallet: wallet,
        totalBefore: totalBefore,
        discount: 0,
        Date: new Date(),
        couponCode: "",
      });
      await orderNew.save();
      let orderId = orderNew._id;
      if (orderNew.status == "placed") {
        const couponData = await Coupon.findById(req.session.couponId);
        if (couponData) {
          let newLimit = couponData.limit - 1;
          await Coupon.findByIdAndUpdate(couponData._id, {
            limit: newLimit,
          });
        }

        const result = await User.updateOne({ _id: user._id }, { $inc: { wallet: -total } })
        console.log(result);
        await Cart.deleteOne({ user: user._id });
        for (i = 0; i < product.length; i++) {
          const productId = product[i].productId;
          const quantity = Number(product[i].quantity);
          await productcollection.findByIdAndUpdate(productId, {
            $inc: { quantity: -quantity },
          });
        }


        res.json({ codSuccess: true });
      } else {
        var options = {
          amount: total * 100, // amount in the smallest currency unit
          currency: "INR",
          receipt: "" + orderId,
        };

        instance.orders.create(options, function (err, order) {
          console.log(order);
          if (err) {
            console.log(err);
          }
          res.json({ order });
        });
      }
    } else {
      res.redirect("/");
    }
  } catch (error) {
    console.log(error.message);
  }
};

// verify online payment
const verifyPayment = async (req, res) => {
  try {
    if (req.session.user) {
      let userData = await User.findOne({ name: req.session.name });
      const cartData = await Cart.findOne({ user: userData._id });
      const product = cartData.product;
      const details = req.body;
      const crypto = require("crypto");
      let hmac1 = crypto.createHmac("sha256", "DPNoVTA7Zo3qbQTofjBhW4qA");
      console.log(hmac1);
      hmac1.update(
        details.payment.razorpay_order_id +
        "|" +
        details.payment.razorpay_payment_id
      );
      hmac1 = hmac1.digest("hex");
      if (hmac1 == details.payment.razorpay_signature) {
        let orderReceipt = details.order.receipt;
        const newOrder = await Order.find().sort({ date: -1 }).limit(1);
        const hai = newOrder.map((value) => {
          return value._id;
        });

        let test1 = await Order.findByIdAndUpdate(
          { _id: hai },
          { $set: { paymentId: details.payment.razorpay_payment_id } }
        ).then((value) => {
          console.log(value);
        });

        let test2 = await Order.findByIdAndUpdate(orderReceipt, {
          $set: { status: "placed" },
        });
        await Cart.deleteOne({ user: userData._id });
        for (i = 0; i < product.length; i++) {
          const productId = product[i].productId;
          const quantity = Number(product[i].quantity);
          await productcollection.findByIdAndUpdate(productId, {
            $inc: { stock: -quantity },
          });
        }
        res.json({ success: true });
      } else {
        await Order.deleteOne({ _id: details.order.receipt });
        res.json({ onlineSuccess: true });
      }
    } else {
      res.redirect("/login");
    }
  } catch (error) {
    res.redirect("/serverERR", { message: error.message });
    console.log(error.message);
  }
};

// getordr....................................................

const getOrder = async (req, res) => {
  try {
    if (req.session.user) {
      const userData = await User.findOne({ name: req.session.name });
      const orderData = await Order.find({ user: userData._id });
      res.render("user/order", { user: req.session.name, data: orderData });
    } else {
      res.redirect("/login");
    }
  } catch (error) {
    console.log(error.message);
  }
};

//signleorder..............................................

const singleOrder = async (req, res) => {
  try {
    if (req.session.user) {
      const id = req.query.id;
      const idLength = id.length;
      if (idLength != 24) {
        res.redirect("/IdMismatch");
      } else {
        const orderData = await Order.findById(id).populate(
          "product.productId"
        );
        if (orderData == null) {
          res.redirect("/IdMismatch");
        } else {
          res.render("user/single_order", {
            data: orderData.product,
            orderData,
          });
        }
      }
    } else {
      res.redirect("/login");
    }
  } catch (error) {
    res.redirect("/serverERR", { message: error.message });
    console.log(error.message);
  }
};
// applya coupon//..........................................

const applycoupon = async (req, res) => {
  try {
    let code = req.body.code;
    let amount = req.body.amount;
    let userData = await User.find({ name: req.session.name });
    let userexist = await Coupon.findOne({
      couponcode: code,
      used: { $in: [userData._id] },
    });
    if (userexist) {
      const couponData = await Coupon.findOne({ couponcode: code });
      if (couponData) {
        if (couponData.expiredate >= new Date()) {
          if (couponData.limit != 0) {
            if (couponData.mincartamount <= amount) {
              let discountvalue1 = couponData.couponamount;
              let distotal = Math.round(amount - discountvalue1);
              let percentagevalue = (discountvalue1 / amount) * 100;
              const discountvalue = parseFloat(percentagevalue.toFixed(2));
              let couponId = couponData._id;
              req.session.couponId = couponId;
              res.json({
                couponokey: true,
                distotal,
                discountvalue,
                code,
              });
            } else {
              res.json({ cartamount: true });
            }
          } else {
            res.json({ limit: true });
          }
        } else {
          res.json({ expire: true });
        }
      } else {
        res.json({ invalid: true });
      }
    } else {
      res.json({ user: true });
    }
  } catch (error) {
    console.log(error.message);
  }
};



//contacts----------
const contacts = (req, res) => {
  try {
    res.render("user/contact");
  } catch (error) {
    console.log(error.message);
  }
};

module.exports = {
  getHome,
  getLogin,
  postsignup,
  getsignup,
  postlogin,
  getLogout,
  verifymail,
  blockuser,
  unblockuser,
  getproducts,
  getsingleproduct,
  signupSubmit,
  verifyOtp,
  LoadOtp,
  resendotp,
  getUserProfile,
  filtercategory,
  updateData,
  postAddress,
  editaddress,
  editpostaddress,
  deleteAddress,
  contacts,
  forgotPasswordPage,
  updatePassword,
  forgotPass,
  updatePass,
  forgotSubmit,
  passForgotOtp,
  getcart,
  addtocart,
  checkout,
  deleteCart,
  getwhishlist,
  addtowishlist,
  deletewish,
  changeQty,
  postPlaceOrder,
  verifyPayment,
  getOrder,
  singleOrder,
  applycoupon,
  confermation,
};

