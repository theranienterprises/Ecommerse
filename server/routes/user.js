const { User } = require('../models/user');
const { ImageUpload } = require('../models/imageUpload');
const { Cart } = require('../models/cart');

const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");

const multer = require('multer');
const fs = require("fs");

const cloudinary = require('cloudinary').v2;

cloudinary.config({
    cloud_name: process.env.cloudinary_Config_Cloud_Name,
    api_key: process.env.cloudinary_Config_api_key,
    api_secret: process.env.cloudinary_Config_api_secret,
    secure: true,
  });
  
  var imagesArr = [];
  
  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "uploads");
    },
    filename: function (req, file, cb) {
      cb(null, `${Date.now()}_${file.originalname}`);
      //imagesArr.push(`${Date.now()}_${file.originalname}`)
    },
  });
  
  const upload = multer({ storage: storage });
  
  router.post(`/upload`, upload.array("images"), async (req, res) => {
    imagesArr = [];
  
    try {
      for (let i = 0; i < req?.files?.length; i++) {
        const options = {
          use_filename: true,
          unique_filename: false,
          overwrite: false,
        };
  
        const img = await cloudinary.uploader.upload(
          req.files[i].path,
          options,
          function (error, result) {
            imagesArr.push(result.secure_url);
            fs.unlinkSync(`uploads/${req.files[i].filename}`);
          }
        );
      }
  
      let imagesUploaded = new ImageUpload({
        images: imagesArr,
      });
  
      imagesUploaded = await imagesUploaded.save();
      return res.status(200).json(imagesArr);
    } catch (error) {
      console.log(error);
    }
  });
  



router.post(`/signup`, async (req, res) => {
    const { name, phone, email, password, isAdmin } = req.body;

    try {

        const existingUser = await User.findOne({ email: email });
        const existingUserByPh = await User.findOne({ phone: phone });

        if (existingUser && existingUserByPh) {
            res.status(400).json({error:true, msg: "user already exist!" })
        }

        const hashPassword = await bcrypt.hash(password,10);

        const result = await User.create({
            name:name,
            phone:phone,
            email:email,
            password:hashPassword,
            isAdmin:isAdmin
        });

        const token = jwt.sign({email:result.email, id: result._id}, process.env.JSON_WEB_TOKEN_SECRET_KEY);

        res.status(200).json({
            user:result,
            token:token
        })

    } catch (error) {
        console.log(error);
        res.status(500).json({error:true, msg:"something went wrong"});
    }
})


router.post('/signin', async (req, res) => {
    const { email, password, tempUserId } = req.body;
  
    try {
      const existingUser = await User.findOne({ email: email });
      if (!existingUser) {
        res.status(404).json({ error: true, msg: 'User not found!' });
      }
  
      const matchPassword = await bcrypt.compare(password, existingUser.password);
      if (!matchPassword) {
        return res.status(400).json({ error: true, msg: 'Password wrong' });
      }
  
      const token = jwt.sign({ email: existingUser.email, id: existingUser._id }, process.env.JSON_WEB_TOKEN_SECRET_KEY);
  
      // Update the user's cart items if they had a temporary user ID
      if (tempUserId) {
        await Cart.updateMany({ userId: tempUserId }, { userId: existingUser._id });
      
      }
  
      return res.status(200).send({
        user: existingUser,
        token: token,
        msg: 'User Login Successfully!',
      });
    } catch (error) {
      res.status(500).json({ error: true, msg: 'something went wrong' });
    }
  });


  router.post('/authWithGoogle', async (req, res) => {
    const { name, phone, email, password, images, isAdmin, tempUserId } = req.body;

    try {
        // Generate a random 10-digit phone number if phone is null or undefined
        const generatedPhone = phone || Math.floor(1000000000 + Math.random() * 9000000000).toString();

        const existingUser = await User.findOne({ email: email });

        if (!existingUser) {
            const result = await User.create({
                name: name,
                phone: generatedPhone, // Use the generated phone number
                email: email,
                password: password,
                images: images,
                isAdmin: isAdmin,
            });

            const token = jwt.sign({ email: result.email, id: result._id }, process.env.JSON_WEB_TOKEN_SECRET_KEY);

            // Update the user's cart items if they had a temporary user ID
            if (tempUserId) {
                await Cart.updateMany({ userId: tempUserId }, { userId: result._id });
            }

            return res.status(200).send({
                user: result,
                token: token,
                msg: 'User Login Successfully!',
            });
        } else {
            const token = jwt.sign({ email: existingUser.email, id: existingUser._id }, process.env.JSON_WEB_TOKEN_SECRET_KEY);

            // Update the user's cart items if they had a temporary user ID
            if (tempUserId) {
                await Cart.updateMany({ userId: tempUserId }, { userId: existingUser._id });
            }

            return res.status(200).send({
                user: existingUser,
                token: token,
                msg: 'User Login Successfully!',
            });
        }
    } catch (error) {
        console.log(error);
        return res.status(500).send({ msg: 'An error occurred during authentication.' });
    }
});




router.put(`/changePassword/:id`, async (req, res) => {
   
    const { name, phone, email, password, newPass, images } = req.body;

   // console.log(req.body)

    const existingUser = await User.findOne({ email: email });
    if(!existingUser){
        res.status(404).json({error:true, msg:"User not found!"})
    }

    const matchPassword = await bcrypt.compare(password, existingUser.password);

    if(!matchPassword){
        res.send({error:true,msg:"current password wrong"})
    }else{

        let newPassword

        if(newPass) {
            newPassword = bcrypt.hashSync(newPass, 10)
        } else {
            newPassword = existingUser.passwordHash;
        }
    
        
        const user = await User.findByIdAndUpdate(
            req.params.id,
            {
                name:name,
                phone:phone,
                email:email,
                password:newPassword,
                images: images,
            },
            { new: true}
        )
    
        if(!user)
        return res.status(400).send('the user cannot be Updated!')
    
        res.send(user);
    }



})



router.get(`/`, async (req, res) =>{
    const userList = await User.find();

    if(!userList) {
        res.status(500).json({success: false})
    } 
    res.send(userList);
})

router.get('/:id', async(req,res)=>{
    const user = await User.findById(req.params.id);

    if(!user) {
        res.status(500).json({message: 'The user with the given ID was not found.'})
    } 
    res.status(200).send(user);
})


router.delete('/:id', (req, res)=>{
    User.findByIdAndDelete(req.params.id).then(user =>{
        if(user) {
            return res.status(200).json({success: true, message: 'the user is deleted!'})
        } else {
            return res.status(404).json({success: false , message: "user not found!"})
        }
    }).catch(err=>{
       return res.status(500).json({success: false, error: err}) 
    })
})




router.get(`/get/count`, async (req, res) =>{
    const userCount = await User.countDocuments()

    if(!userCount) {
        res.status(500).json({success: false})
    } 
    res.send({
        userCount: userCount
    });
})



router.put('/:id',async (req, res)=> {

    const { name, phone, email } = req.body;

    const userExist = await User.findById(req.params.id);

    if(req.body.password) {
        newPassword = bcrypt.hashSync(req.body.password, 10)
    } else {
        newPassword = userExist.passwordHash;
    }

    const user = await User.findByIdAndUpdate(
        req.params.id,
        {
            name:name,
            phone:phone,
            email:email,
            password:newPassword,
            images: imagesArr,
        },
        { new: true}
    )

    if(!user)
    return res.status(400).send('the user cannot be Updated!')

    res.send(user);
})

router.get('/:userId/image', async (req, res) => {
    try {
        const user = await User.findById(req.params.userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        // Assuming the first image in the array is the profile picture
        const image = user.images.length > 0 ? user.images[0] : null;
        
        res.json({ image });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching user image', error: error.message });
    }
});


// router.put('/:id',async (req, res)=> {

//     const { name, phone, email, password } = req.body;

//     const userExist = await User.findById(req.params.id);

//     let newPassword
    
//     if(req.body.password) {
//         newPassword = bcrypt.hashSync(req.body.password, 10)
//     } else {
//         newPassword = userExist.passwordHash;
//     }

//     const user = await User.findByIdAndUpdate(
//         req.params.id,
//         {
//             name:name,
//             phone:phone,
//             email:email,
//             password:newPassword,
//             images: imagesArr,
//         },
//         { new: true}
//     )

//     if(!user)
//     return res.status(400).send('the user cannot be Updated!')

//     res.send(user);
// })



router.delete('/deleteImage', async (req, res) => {
    const imgUrl = req.query.img;

   // console.log(imgUrl)

    const urlArr = imgUrl.split('/');
    const image =  urlArr[urlArr.length-1];
  
    const imageName = image.split('.')[0];

    const response = await cloudinary.uploader.destroy(imageName, (error,result)=>{
       // console.log(error, res)
    })

    if(response){
        res.status(200).send(response);
    }
      
});


module.exports = router;