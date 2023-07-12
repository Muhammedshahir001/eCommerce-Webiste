const express = require("express");
const userRouter = express();
const userController = require("../controllers/userController");
const usersession = require("../middleware/userSession");
const blockfunction = require("../middleware/blockfind");
const orderController = require("../controllers/orderController")
const categorycontroller = require("../controllers/categoryController")
const auth = require('../middleware/userSession');
const nocache = require('nocache');
userRouter.use(nocache())

//get------------
userRouter.get("/login", auth.notLogged, userController.getLogin);
userRouter.get("/signup",userController.getsignup);
userRouter.get("/", userController.getHome);
userRouter.get("/Logout",auth.logged, nocache(), userController.getLogout);
userRouter.get("/verify",userController.verifymail);
userRouter.get("/block",userController.blockuser);
userRouter.get("/unblock", userController.unblockuser);
userRouter.get("/products",nocache(), userController.getproducts);
userRouter.get("/cart",auth.logged, nocache(), userController.getcart)
userRouter.get("/whishlist",auth.logged, nocache(), userController.getwhishlist)
userRouter.get("/singleproduct", nocache(), userController.getsingleproduct);
userRouter.get("/otp", userController.LoadOtp);
userRouter.get("/addtocart", auth.logged, nocache(), userController.addtocart);
userRouter.get("/addtowishlist", auth.logged, nocache(), userController.addtowishlist);
userRouter.get("/checkout", auth.logged, nocache(), userController.checkout)
userRouter.get("/resendotp", userController.resendotp);
userRouter.get("/getUserProfile", auth.logged, nocache(), userController.getUserProfile);
userRouter.get("/filter",userController.filtercategory)
userRouter.get("/forget", userController.forgotPasswordPage)
userRouter.get("/updatePassPage", userController.updatePassword)
userRouter.get("/singleOrder", auth.logged, nocache(), userController.singleOrder);
userRouter.get("/order", auth.logged, nocache(), userController.getOrder);
userRouter.get("/delete-address", userController.deleteAddress);
userRouter.get("/orderplaced", userController.confermation);
userRouter.get("/returnOrder", orderController.returnOrder)
userRouter.get('/cancelOrder', orderController.cancelOrder)
userRouter.get("/editadress",userController.editaddress)
userRouter.get("/shahir",userController.contacts)


//post-------------
userRouter.post("/login", blockfunction, userController.postlogin);
userRouter.post("/signup", userController.signupSubmit);
userRouter.post("/checkotp", userController.verifyOtp);
userRouter.post("/deleteCart",userController.deleteCart);
userRouter.post("/changeQty", userController.changeQty);
userRouter.post("/deletewish", userController.deletewish);
userRouter.post("/forgot", userController.forgotSubmit);
userRouter.post("/checkotpre", userController.passForgotOtp);
userRouter.post("/setpass", userController.updatePass);
userRouter.post("/updatePass", userController.forgotPass);
userRouter.post('/update-profile',userController.updateData)
userRouter.post("/posteditaddress",userController.editpostaddress)
userRouter.post("/addtocart", userController.addtocart);
userRouter.post("/addtowishlist", userController.addtowishlist);
userRouter.post("/posteditaddress", userController.editpostaddress)
userRouter.post('/update-profile', userController.updateData)
userRouter.post('/checkWallet', orderController.checkWallet)
userRouter.post('/applycoupon', userController.applycoupon)
userRouter.post("/verifyPayment", userController.verifyPayment);
userRouter.post("/place-order", userController.postPlaceOrder);
userRouter.post("/addAddress", userController.postAddress);



module.exports = userRouter;
