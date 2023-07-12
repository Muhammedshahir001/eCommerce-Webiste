const Coupon = require("../models/couponmodel");

//getcoupen----------
const getCoupon = async (req, res) => {
    try {
        const coupon = await Coupon.find();
        res.render("admin/coupon", { data: coupon });
    } catch (error) {
        console.log(error.message);
    }
};

//get addcoupen-----------
const getaddcoupon = async (req, res) => {
    try {
        res.render("admin/addcoupon");
    } catch (error) {
        console.log(error.message);
    }
};
//postaddcoupon--------------
const postaddcoupon = async (req, res) => {
    try {
        let coupons = Coupon({
            couponcode: req.body.name,
            couponamounttype: req.body.coupontype,
            couponamount: req.body.amount,
            mincartamount: req.body.mincart,
            maxredeemamount: req.body.maxredeem,
            expiredate: req.body.date,
            limit: req.body.limit,
        });
        await coupons.save();
        res.redirect("/admin/coupon");
    } catch (error) {
        console.log(error.message);
    }
};

//detete coupen-------
const deleteCoupon = async (req, res) => {
    try {
        const code = req.query.code;
        await Coupon.findOneAndDelete({ couponcode: code });
        res.redirect("/admin/coupon");
    } catch (error) {
        console.log(error.message);
    }
};

module.exports = {
    getCoupon,
    getaddcoupon,
    postaddcoupon,
    deleteCoupon,
};
