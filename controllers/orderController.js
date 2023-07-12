const Order = require("../models/orderModel");
const User = require("../models/usermodel");
const productModel = require("../models/productModel");

const getOrder = async (req, res) => {
    try {
        const orderData = await Order.find();
        res.render("admin/order", { data: orderData });
    } catch (error) {
        console.log(error.message);
    }
};

// view orders
const viewOrder = async (req, res) => {
    try {
        const orderId = req.query.id;
        const orderData = await Order.findById(orderId).populate(
            "product.productId"
        );
        const userId = orderData.user;
        const userData = await User.findById(userId);
        res.render("admin/single_order", { orderData, userData });
    } catch (error) {
        console.log(error.message);
    }
};
//order status update------------------------------
const updatestatus = async (req, res) => {
    try {
        const status = req.body.status;
        const orderId = req.body.orderId;
        await Order.findByIdAndUpdate(orderId, { status: status });
        res.redirect("/admin/order");
    } catch (error) {
        console.log(error.message);
    }
};
//cancel order---------------------------------
const cancelOrder = async (req, res) => {
    try {
        if (req.session.user) {
            console.log(req.session.user);
            const id = req.query.id;
            const idLength = id.length;
            if (idLength != 24) {
                res.redirect("/IdMismatch");
            } else {
                const orderData = await Order.findById(id);
                if (orderData == null) {
                    res.redirect("/IdMismatch");
                } else {
                    if (orderData.paymentMethod == "online") {
                        console.log(orderData);
                        await User.findOneAndUpdate(
                            { name: req.session.name },
                            {
                                $inc: { wallet: orderData.totalAmount }
                            }
                        );
                        const date = new Date()
                        const y = await User.findOneAndUpdate(
                            { name: req.session.name },
                            {
                                $push: { wallehistory: { peramount: orderData.totalAmount, date: date } }
                            }
                        );
                        console.log("🚀 ~ file: orderController.js:68 ~ cancelOrder ~ y:", y)

                        const orderDataa = await Order.findByIdAndUpdate(id, {
                            status: "cancelled",
                        });

                        if (orderDataa) {
                            res.redirect("/order");
                        }
                    }
                }
            }
        } else {
            res.redirect("/Login");
        }
    } catch (error) {
        res.redirect("/serverERR", { message: error.message });
        console.log(error.message);
    }
};

//rerturn order
const returnOrder = async (req, res) => {
    try {
        if (req.session.user) {
            const id = req.query.id;
            const orderData = await Order.findById(id);
            const amount = await User.findOne({ name: req.session.name });
            const total = amount.wallet + orderData.totalAmount;

            // Check if the order was placed within the last 2 weeks
            const twoWeeksAgo = new Date();
            twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
            const orderDate = new Date(orderData.Date);
            if (orderDate < twoWeeksAgo) {
                throw new Error("Cannot return order after 2 weeks.");
            }

            if (
                orderData.paymentMethod == "cod" ||
                orderData.paymentMethod == "online"
            ) {
                // Add the order total back to the user's wallet
                await User.findOneAndUpdate(
                    { name: req.session.name },
                    {
                        $set: { wallet: total },
                    }
                ).then((value) => {
                    console.log(value);
                });

                // Set the order status to "returned" and reset the wallet field to 0
                const orderDataa = await Order.findByIdAndUpdate(id, {
                    status: "returned",
                    wallet: 0,
                });

                if (orderDataa) {
                    res.redirect("/order");
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


//checkWallet
const checkWallet = async (req, res) => {
    try {
        if (req.session.user) {

            // const Total = 
            // console.log();
            const userData = await User.findOne({ name: req.session.name });
            const walleta = userData.wallet;
            console.log(walleta);
            if (walleta > 0) {
                res.json({ success: true, walleta });
            }
        } else {
            res.redirect("/login");
        }
    } catch (error) {
        res.redirect("/serverERR", { message: error.message });
        console.log(error.message);
    }
};
//report downlod---------------------------
const report = async (req, res) => {
    try {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        await page.goto("http://localhost:3000/salesReport", {
            waitUntil: "networkidle2",
        });
        await page.setViewport({ width: 1680, height: 1050 });
        const todayDate = new Date();
        const pdfn = await page.pdf({
            path: `${path.join(
                __dirname,
                "../public/files",
                todayDate.getTime() + ".pdf"
            )}`,
            format: "A4",
        });
        await browser.close();
        const pdfUrl = path.join(
            __dirname,
            "../public/files",
            todayDate.getTime() + ".pdf"
        );
        res.set({
            "Content-Type": "application/pdf",
            "Content-Length": pdfn.length,
        });
        res.sendFile(pdfUrl);
    } catch (error) {
        console.log(error.message);
    }
};

//sales report----------------
const sales = async (req, res) => {
    try {
        const { from, to } = req.query;
        let orderData = await Order.find();
        let SubTotal = 0;

        // calculate subtotal of all orders
        orderData.forEach(function (value) {
            SubTotal = SubTotal + value.totalAmount;
        });

        // filter orders by date range
        if (from && to) {
            orderData = await Order.find({
                Date: { $gte: new Date(from), $lte: new Date(to) },
            });
        }

        const status = await Order.find({ "product.status": { $exists: true } });
        const value = req.query.value || "ALL";

        if (value == "cod") {
            const data = await Order.find({ paymentMethod: "cod" });
            res.render("admin/sales", { data, message: "COD", status, value });
        } else if (value == "online") {
            const data = await Order.find({ paymentMethod: "online" });
            res.render("admin/sales", { data, message: "Online", status, value });
        } else {
            const data = orderData;
            res.render("admin/sales", { data, status, value, total: SubTotal });
        }
    } catch (error) {
        console.log(error.message);
    }
}






module.exports = {
    getOrder,
    viewOrder,
    updatestatus,
    cancelOrder,
    returnOrder,
    checkWallet,
    report,
    sales,
   
};
