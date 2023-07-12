const express = require("express");
const adminRouter = express();
const adminConroller = require("../controllers/adminController");
const categorycontroller = require("../controllers/categoryController");
const productcontroller = require("../controllers/productController");
const ordercontroller = require("../controllers/orderController");
const upload = require("../middleware/multer");
const couponcontroller =require("../controllers/couponController")
const bannerController = require("../controllers/bannerController")
const offerController = require('../controllers/offerController')

const session = require("../middleware/adminSession")

//get-----------------------
adminRouter.get("/",session.notLogged,adminConroller.getLogin);
adminRouter.get("/home",session.logged,adminConroller.gethome);
adminRouter.get("/usermanage",session.logged, adminConroller.getusermanage);
adminRouter.get("/category",session.logged, adminConroller.getcategory);
adminRouter.get("/products",session.logged, adminConroller.getproducts);
adminRouter.get("/logout",session.logged, adminConroller.getlogout);
adminRouter.get("/addcategory", session.logged, categorycontroller.getAddCategory);
adminRouter.get("/editCategory/:id", session.logged, categorycontroller.editCategory);
adminRouter.get("/addproducts", session.logged, productcontroller.getaddproducts);
adminRouter.get("/editproducts", session.logged, productcontroller.editproducts);
// adminRouter.get("/deleteproducts", session.logged, productcontroller.deleteproduct);
adminRouter.get('/order', session.logged, ordercontroller.getOrder);
adminRouter.get('/singleOrder', session.logged, ordercontroller.viewOrder);
adminRouter.get("/coupon", session.logged, couponcontroller.getCoupon);
adminRouter.get("/addCoupon", session.logged, couponcontroller.getaddcoupon);
adminRouter.post("/removeimage", session.logged, productcontroller.removeimage)
adminRouter.get("/report", session.logged, ordercontroller.report);
adminRouter.get('/sales', session.logged, ordercontroller.sales)
adminRouter.get('/show-category', session.logged, categorycontroller.unlistCategory)
adminRouter.get("/banner", session.logged, bannerController.getBanner);
adminRouter.get('/addBanner', session.logged, bannerController.getAddBanner)
adminRouter.get('/showBanner', session.logged, bannerController.unlistBanner)
adminRouter.get("/deletebanner", session.logged, bannerController.deletebanner);
adminRouter.get('/show-products', session.logged, productcontroller.unlistproduct)
adminRouter.get("/salesReport", adminConroller.getSalesReport)
adminRouter.get("/deleteCoupon", session.logged, couponcontroller.deleteCoupon);

//category offer....

adminRouter.get('/offer_managemnet', session.logged, offerController.offer_managemnet);
adminRouter.get('/add_offer', session.logged, offerController.add);
adminRouter.post('/add_offers', session.logged, offerController.get_Data);
adminRouter.get('/edit/:id', session.logged, offerController.edit);
adminRouter.post('/edit',offerController.update);

//product offer.....
adminRouter.get('/product_offer_management', session.logged, offerController.productOffer_management)
adminRouter.get('/add_product_offer', session.logged, offerController.add_product_offer)
adminRouter.post('/add_product_offer', session.logged, upload.single('image'), offerController.get_product_offer)
adminRouter.get('/edit_product_offer/:id', session.logged, offerController.edit_product_offer)
adminRouter.post('/edit_product_offer', offerController.update_product_offer)


//post----------------------1
adminRouter.post("/", adminConroller.postLogin);
adminRouter.post("/addcategory", session.logged, categorycontroller.postAddCategory);
adminRouter.post("/saveCategory/:id", session.logged, categorycontroller.editPostCategory);
adminRouter.post("/addproducts", session.logged, upload.array("image",3), productcontroller.postproduct);
adminRouter.post("/editproducts", session.logged, upload.array("image", 3), productcontroller.editpostproduct);
adminRouter.post("/updateStatus", session.logged, ordercontroller.updatestatus)
adminRouter.post("/addCoupon", session.logged, couponcontroller.postaddcoupon);
adminRouter.post('/addBanner', session.logged, upload.single('image'), bannerController.postAddBanner)




module.exports = adminRouter;
