const { User } = require("../models/userModel");
const { Product } = require("../models/productModel");
const { Order } = require("../models/orderModel");
const { uploadOnClouinary } = require("../Utils/Cloudnary");

module.exports.adminDetails=async(req,res)=>{
        const admin = await User.findById(req.admin._id);
        if(!admin){
            return res.status(404).json({ message: "Admin not found", success: false });
        }
        // const adminName=admin.username;

    return res.status(200).json({ message: "Admin details fetched successfully", data: req.admin, userName:req.admin.username,success: true });
}

// ----------------- get all users  -------------------
module.exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find()
        const userCount = await User.countDocuments()
        console.log("users : ", userCount)
        return res
            .status(200)
            .json({ message: "Users fetched successfully", count: userCount, data: users, success: true });
    } catch (error) {
        throw new ApiError(500, error?.message || "Something went wrong while fetching users");
    }
}


// module.exports.getAllUsersOrderSummary = async (req, res) => {
//     try {
//       // Step 1: Get all orders
//       const orders = await Order.find();
  
//       // Step 2: Group orders by userId
//       const userMap = new Map();
  
//       for (const order of orders) {
//         const userId = order.userId.toString();
//         if (!userMap.has(userId)) {
//           userMap.set(userId, {
//             totalOrders: 1,
//             totalSpent: order.totalPrice
//           });
//         } else {
//           const existing = userMap.get(userId);
//           existing.totalOrders += 1;
//           existing.totalSpent += order.totalPrice;
//           userMap.set(userId, existing);
//         }
//       }
  
//       // Step 3: Fetch user details
//       const userIds = Array.from(userMap.keys());
//       const users = await User.find({ _id: { $in: userIds } }).select('username email');
  
//       // Step 4: Combine user info with order summary
//       const result = users.map(user => {
//         const summary = userMap.get(user._id.toString());
//         return {
//           username: user.username,
//           email: user.email,
//           totalOrders: summary.totalOrders,
//           totalSpent: summary.totalSpent
//         };
//       });
  
//       res.json(result);
  
//     } catch (err) {
//       console.error('Error fetching user order summary:', err);
//       res.status(500).json({ message: 'Internal server error' });
//     }
//   };
  

// ----------------- get one user  -------------------
module.exports.getAllUsersOrderSummary = async (req, res) => {
    try {
      // Step 1: Get all orders
      const orders = await Order.find();
  
      // Step 2: Summarize orders by userId
      const orderSummary = {};
      for (const order of orders) {
        const userId = order.userId.toString();
        if (!orderSummary[userId]) {
          orderSummary[userId] = {
            userId,
            totalOrders: 1,
            totalSpent: order.totalPrice,
           
          };
        } else {
          orderSummary[userId].userId = userId;
          orderSummary[userId].totalOrders += 1;
          orderSummary[userId].totalSpent += order.totalPrice;
           
        }
      }
  
      // Step 3: Get all users except admins
      const users = await User.find({ role: { $ne: 'admin' } }).select('username email');
  
      // Step 4: Merge user info with order summary (default to 0)
      const result = users.map(user => {
        const summary = orderSummary[user._id.toString()] || {
            userId: user._id.toString(),
          totalOrders: 0,
          totalSpent: 0,
        };
  
        return {
            userId: summary.userId,
          username: user.username,
          email: user.email,
          totalOrders: summary.totalOrders,
          totalSpent: summary.totalSpent,
        };
      });
      result.sort((a, b) => b.totalSpent - a.totalSpent);
  
     

  
      res.json({data:result, message: "Users order summary fetched successfully", success: true});
    } catch (err) {
      console.error('Error fetching user summary:', err);
      res.status(500).json({ message: 'Internal server error', success: false });
    }
  };


module.exports.getOneUser=async(req,res)=>{
    try {
        const userId=req.params.id;
        const user=await User.findById(userId);
        if(!user){
            return res.status(404).json({ message: "User not found aginst this id", success: false });
        }else{
            return res.status(200).json({ message: "User fetched successfully", data: user, success: true });
        }
    } catch (error) {
        console.log("error in getting user : ",error)
        res.status(500).json({ message: "Error while getting user", error, success: false });
    }
}

// ----------------- delete user  -------------------
module.exports.deleteUser = async (req, res) => {
    try {
        const { userId } = req.params;
        if (!userId) {
            return res
                .status(400)
                .json({ message: "User id is required", success: false });
        }
        const user = await User.findByIdAndDelete(userId);
        if (!user) {
            return res
                .status(404)
                .json({ message: "User not found aginst this id", success: false });
        }
        return res
            .status(200)
            .json({ message: "User deleted successfully", success: true });

    } catch (error) {
        console.log("error in delete user", error)
        return res
            .status(500)
            .json({ message: "Error while deleting user", error, success: false });
    }
}


// ----------------- get all products  -------------------
module.exports.getAllProducts = async (req, res) => {
    try {
        console.log("product controller")
        const products = await Product.find()
        const productCount = await Product.countDocuments()
        console.log("products : ", productCount)
        return res
            .status(200)
            .json({ message: "Products fetched successfully", count: productCount, data: products, success: true });
    } catch (error) {
        console.log("error in fetching products : ", error)
        res.status(500).json({ message: "Error while fetching products", error, success: false });
    }
}

// ------------------   get one product  ---------------- 
module.exports.getOneProduct=async(req,res)=>{
    try {
        const productId=req.params.id;
        const product=await Product.findById(productId);
        if(!product){
            return res.status(404).json({ message: "Product not found aginst this id", success: false });
        }else{
            return res.status(200).json({ message: "Product fetched successfully", data: product, success: true });
        }

    } catch (error) {
        console.log("error in getting product : ",error)
        res.status(500).json({ message: "Error while getting product", error, success: false });
    }
}

// ----------------- delete product  -------------------
module.exports.deleteProducts = async (req, res) => {
    try {
        const  productId  = req.params.id;
        if (!productId) {
            return res.status(400).json({ message: "Product id is required", success: false });
        }
        const product = await Product.findByIdAndDelete(productId);
        if (!product) {
            return res.status(404).json({ message: "Product not found aginst this id", success: false });
        }
        return res.status(200).json({ message: "Product deleted successfully", success: true });
    } catch (error) {
        console.log("error in delete product", error)
        res.status(500).json({ message: "Error while deleting product", error, success: false });
    }
}

// ----------------- create product  -------------------
// module.exports.createProduct=async(req,res)=>{
//     try {
//         const {title,price,rating,description,category,gender,variants}=req.body;
//         console.log("title",title);
//         console.log("price",price);
//         // console.log("stock",stock);
//         console.log("rating",rating);
//         console.log("description",description);
//         console.log("file",req.file);
//         console.log("category",category);
//         console.log("gender",gender);
//         // console.log("size",size);
//         console.log("variants",variants);
//         console.log("file path",req.file.path);

        
//         if(!title || !price  || !description,!category, !gender,!variants){
//         return res.status(400).json({ message: "Please fill all the fields", success: false });
//         }
//         const file = req.file.path;
//         console.log("file path :",file);
//         const imageUrl = await uploadOnClouinary(file);
//         if(!imageUrl){
//             return res.status(400).json({ message: "Error while uploading image", success: false });
//         }
//         let parsedVariants = Array.isArray(variants) ? variants : JSON.parse(variants);

//         console.log("image url : ",imageUrl.url);
//         const newProduct=new Product({
//             title,
//             product_image:imageUrl?.url || "",
//             price,
//             rating,
//             category,
//             gender,
//             description,
//             variants:parsedVariants,
//         });
//         const product = await newProduct.save();
//         return res
//         .status(200)
//         .json({ message: "Product created successfully", success: true ,data:product});
//     } catch (error) {
//         console.log("error in create product",error)
//         return res.status(500).json({ message: "Error while creating product", error, success: false });
//     }
// }


module.exports.createProduct = async (req, res) => {
  try {
    const { title, price, rating, category, gender, description, variants, product_image } = req.body;

    let finalImageUrl = "";

    // Case 1: If image is uploaded by user (multer file)
    if (req.file) {
      const cloudinaryResponse = await uploadOnClouinary(req.file.path);
      if (!cloudinaryResponse) {
        return res.status(500).json({ message: "Image Upload Failed" });
      }
      finalImageUrl = cloudinaryResponse.url;
    }

    // Case 2: If user provided image URL directly
    else if (product_image) {
      finalImageUrl = product_image;
    } else {
      return res.status(400).json({ message: "Image is required (either file or link)" });
    }
    const parsedVariants = Array.isArray(variants) ? variants : JSON.parse(variants);
    const product = await Product.create({
      title,
      price,
      category,
      gender,
      description,
      variants: parsedVariants,
      product_image: finalImageUrl
    });

    return res.status(201).json({
      success: true,
      message: "Product Created Successfully",
      product
    });

  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}






// ----------------- update product  -------------------
module.exports.updateProduct=async(req,res)=>{
    try {
        const productId  = req.params.id;
        const variants = req.body?.variants;
        if(!productId){
            return res.status(400).json({ message: "Product id is required", success: false });}
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: "Product not found aginst this id", success: false });
        }
            if (variants) {
                variants.forEach((variant) => {
                    const existingVariant = product.variants.find(v => v.size === variant.size);
                    if (existingVariant) {
                        existingVariant.quantity = variant.quantity;
                    } else {
                        product.variants.push(variant);
                    }
                });
            }
            
            const updatedProduct=await Product.findOneAndUpdate(
                {_id:productId},
                req.body,
                {new:true}
            )
            return res
            .status(200)
            .json({ message: "Product updated successfully", success: true ,data:updatedProduct});


    } catch (error) {
        console.log("error in update product",error)
        return res.status(500).json({ message: "Error while updating product", error, success: false });
    }
}






