const productscollection = require("../models/productModel");
const categorycollectons = require("../models/categoryModel"); 
const upload = require("../middleware/multer")

// get products page
const getaddproducts = async (req, res) => {
  try {
    const category = await categorycollectons.find().populate("category").lean();
    res.render("admin/addproducts", { category: category });
  } catch (error) {
    console.log(error);
  }
};

// post add products
const postproduct = async (req, res) => {
  try {
    console.log('object');
    console.log(req.body);
    console.log(req.files)

     const { productname, brand, price, description, quantity, category } = req.body;

    // Validate price and quantity
    

    
    const img = req.files.map((image) => image.filename);
    const products = new productscollection({
      productname: req.body.productname,
      brand: req.body.brand,
      price: req.body.price,
      description: req.body.description,
      quantity: req.body.quantity,
      category: req.body.category,
      image: img,
    });

    const productdata = await products.save();
    console.log("🚀 ~ file: productController.js:32 ~ postproduct ~ productdata:", productdata);

    if (productdata) {
      res.redirect("/admin/products");
    }
  } catch (error) {
    console.log(error);
  }
};

const editproducts = async (req, res) => {
  try {
    const categoryData = await categorycollectons.find().lean();
    const id = req.query.id;
    const productData = await productscollection.findOne({ _id: id }).lean();
    
    if (productData) {
      res.render("admin/editproducts", {
        user: productData,
        category: categoryData,
        
      });
    } else {
      res.redirect("/editproduct");
    }
  } catch (error) {
    console.log(error.message);
  }
};


// post edit products
const editpostproduct = async (req, res) => {
  try {
    console.log(req.body);

    if (req.files) {
      const existingProduct = await productscollection.findById(req.query.id);
      let images = existingProduct.image;
      req.files.forEach((file) => {
        images.push(file.filename);
      });
      var img = images;
    }

    await productscollection.updateOne(
      { _id: req.query.id },
      {
        $set: {
          productname: req.body.productname,
          brand: req.body.brand,
          price: req.body.price,
          description: req.body.description,
          quantity: req.body.quantity,
          category: req.body.categoryId, // Use the correct field name for category ID
          image: img,
        },
      }
    );
    res.redirect("/admin/products");
  } catch (error) {
    console.log(error.message);
  }
};

const unlistproduct = async (req, res) => {
  const id = req.query.id;
  const data = await productscollection.findById({ _id: id });

  if (data.status == true) {
    await productscollection.findOneAndUpdate(
      { _id: id },
      { $set: { status: false } }
    );
  } else {
    await productscollection.findOneAndUpdate(
      { _id: id },
      { $set: { status: true } }
    );
  }
  res.redirect("/admin/products");
};

// remove products
const removeimage = async (req, res) => {
  try {
    let id = req.body.id;
    let position = req.body.position;
    let productImg = await productscollection.findById(id);
    let image = productImg.image[position];
    await productscollection.updateOne({ _id: id }, { $pullAll: { image: [image] } });
    res.json({ remove: true });
  } catch (error) {
    res.render("admin/500");
    console.log(error);
  }
};

module.exports = {
  getaddproducts,
  postproduct,
  editproducts,
  editpostproduct,
  // deleteproduct,
  unlistproduct,
  removeimage,
};
