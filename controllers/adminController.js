const User = require("../models/usermodel");
const categorycollection = require("../models/categoryModel");
const productModel = require("../models/productModel");
const Order = require("../models/orderModel");

//Login----------------------------------------------------
const getLogin = (req, res) => {
  res.render("admin/adminlogin");
};

const postLogin = (req, res) => {
  try {
    const { email, password } = req.body;
    if (email === process.env.AEMAIL && password === process.env.APASSWORD) {
      req.session.login = true;
      res.redirect("/admin/home");
    } else {
      res.redirect("/admin");
    }
  } catch (error) {
    console.log(error.message);
  }
};

//home----------------------------------------------------
const gethome = async (req, res) => {
  const orderData = await Order.find({ status: { $ne: "cancelled" } });
  let SubTotal = 0;
  orderData.forEach(function (value) {
    SubTotal = SubTotal + value.totalAmount;
  });
  const cod = await Order.find({ paymentMethod: "cod" }).count();
  const online = await Order.find({ paymentMethod: "online" }).count();
  const totalOrder = await Order.find({ status: { $ne: "cancelled" } }).count();
  const totalUser = await User.find().count();
  const totalProducts = await productModel.find().count();
  const date = new Date();
  const year = date.getFullYear();
  const currentYear = new Date(year, 0, 1);
  const salesByYear = await Order.aggregate([
    {
      $match: {
        createdAt: { $gte: currentYear },
        status: { $ne: "cancelled" },
      },
    },
    {
      $group: {
        _id: { $dateToString: { format: "%m", date: "$createdAt" } },
        total: { $sum: "$totalAmount" },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  let sales = [];
  for (i = 1; i < 13; i++) {
    let result = true;
    for (j = 0; j < salesByYear.length; j++) {
      result = false;
      if (salesByYear[j]._id == i) {
        sales.push(salesByYear[j]);
        break;
      } else {
        result = true;
      }
    }
    if (result) {
      sales.push({ _id: i, total: 0, count: 0 });
    }
  }

  let yearChart = [];
  for (let i = 0; i < sales.length; i++) {
    yearChart.push(sales[i].total);
  }

  res.render("admin/home", {
    data: orderData,
    total: SubTotal,
    cod,
    online,
    totalOrder,
    totalUser,
    totalProducts,
    yearChart,
  });
};



//usermanage-----------------------------------------------
const getusermanage = async (req, res) => {
  try {
    const data = await User.find({});
    res.render("admin/usermanage", { user: data });
  } catch (error) {
    console.log(error.message);
  }
};

//category-------------------------------------------------
const getcategory = async (req, res) => {
  try {
    const data1 = await categorycollection.find();
    res.render("admin/category", { data: data1 });
  } catch (error) {
    console.log(error.message);
  }
};
//products-------------------------------------------------
const getproducts = async (req, res) => {
  try {
    const data = await productModel.find().populate("category");
    res.render("admin/products", { products: data });
  } catch (error) {
    console.log(error.message);
  }
};

//Logout---------------------------------------------------
const getlogout = async (req, res) => {
  req.session.login = false;
  res.redirect("/admin");
};
//getSales Report
const getSalesReport = async (req, res) => {
  try {
    let start;
    let end;
    req.query.start ? (start = new Date(req.query.start)) : (start = "ALL");
    req.query.end ? (end = new Date(req.query.end)) : (end = "ALL");
    if (start != "ALL" && end != "ALL") {
      const data = await Order.aggregate([
        {
          $match: {
            $and: [
              { Date: { $gte: start } },
              { Date: { $lte: end } },
              { status: { $eq: "Delivered" } },
            ],
          },
        },
      ]);
      let SubTotal = 0;
      data.forEach(function (value) {
        SubTotal = SubTotal + value.totalAmount;
      });
      res.render("admin/salesReport", { data, total: SubTotal });
    } else {
      const orderData = await Order.find({ status: { $eq: "Delivered" } });
      let SubTotal = 0;
      orderData.forEach(function (value) {
        SubTotal = SubTotal + value.totalAmount;
      });
      res.render("admin/salesReport", { data: orderData, total: SubTotal });
    }
  } catch (error) {
    res.redirect("/serverERR", { message: error.message });
    console.log(error.message);
  }
};




module.exports = {
  getLogin,
  gethome,
  getusermanage,
  getcategory,
  getproducts,
  postLogin,
  getlogout,
  getSalesReport,
};

