const categoryCollection = require("../models/categoryModel");
const productController = require('../models/productModel');




// Render add category form
const getAddCategory = async (req, res) => {
  try {
    res.render("admin/addcategory");
  } catch (error) {
    console.log(error.message);
  }
};

// Add new category
const postAddCategory = async (req, res) => {
  try {
    const category = req.body.category;
    const existingCategory = await categoryCollection.findOne({
      category: { $regex: category, $options: "i" },
    });

    if (existingCategory) {
      res.render("admin/addcategory", { message: "Category already exists" });
    } else {
      const result = await categoryCollection.create({ category: category });

      if (result) {
        res.redirect("/admin/addcategory");
      } else {
        res.redirect("/admin/addcategory");
      }
    }
  } catch (error) {
    console.log(error.message);
  }
};


// Render edit category form
const editCategory = async (req, res) => {
  const categoryId = req.params.id;
  try {
    const category = await categoryCollection.findById(categoryId);
    console.log(category);
    res.render("admin/editCategory", { category, id: categoryId });
  } catch (error) {
    console.log(error.message);
  }
};

// Update category
const editPostCategory = async (req, res) => {
  const categoryId = req.params.id;
  const category = req.body.category;
  try {
    const updatedCategory = await categoryCollection.findByIdAndUpdate(
      categoryId,
      { category: category },
      { new: true }
    );

    const categories = await categoryCollection.find();
    res.render("admin/category", { data: categories });
  } catch (error) {
    console.log(error.message);
  }
};

// Delete Category
// const deleteCategory = async (req, res) => {
//   const categoryId = req.query.id;

//   try {
//     await categoryCollection.findByIdAndDelete(categoryId);
//     res.redirect("/admin/category");
//   } catch (error) {
//     console.log(error.message);
//   }
// };
const unlistCategory = async (req, res) => {
  const id = req.query.id;
  const data = await categoryCollection.findOne({ _id: id });
  if (data.status == false) {
    await categoryCollection.findOneAndUpdate(
      { _id: id },
      { $set: { status: true } }
    );
  } else {
    await categoryCollection.findOneAndUpdate(
      { _id: id },
      { $set: { status: false } }
    );
  }
  res.redirect("/admin/category");
};

module.exports = {
 
  getAddCategory,
  postAddCategory,
  editCategory,
  editPostCategory,
  // deleteCategory,
  unlistCategory
};
