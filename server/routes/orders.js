const { Orders } = require('../models/orders');
const express = require('express');
const cors = require("cors");
const crypto = require("crypto");
const axios = require("axios");
const bodyParser = require("body-parser");
const multer = require("multer");
const fs = require('fs');
const path = require('path');
const router = express.Router();
const cloudinary = require('cloudinary').v2;
const pdf = require('html-pdf');
const nodemailer = require('nodemailer');
const { emitNewOrder, io } = require('../index');  // Adjust the path as necessary

router.use(express.urlencoded({ extended: false }));
router.use(bodyParser.urlencoded({ extended: false }));

cloudinary.config({
    cloud_name: process.env.cloudinary_Config_Cloud_Name,
    api_key: process.env.cloudinary_Config_api_key,
    api_secret: process.env.cloudinary_Config_api_secret,
    secure: true
});

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, "../uploads"));  // Save to `uploads` directory one level up
    },
    filename: function (req, file, cb) {
        cb(null, `${Date.now()}_${file.originalname}`);
    }
});

const upload = multer({ storage: storage });

const transporter = nodemailer.createTransport({
    host: "smtp.hostinger.com",
    port: 465,
    secure: true, // Use true for port 465, false for all other ports
    auth: {
        user: "contact@ranienterprisesballia.com",
        pass: "RaniEnter4567@&%^",
    },
});

router.get(`/`, async (req, res) => {
    try {
        const ordersList = await Orders.find(req.query);
        if (!ordersList) {
            res.status(500).json({ success: false });
        }
        return res.status(200).json(ordersList);
    } catch (error) {
        res.status(500).json({ success: false });
    }
});


router.get('/:id', async (req, res) => {
    const order = await Orders.findById(req.params.id);
    if (!order) {
        res.status(500).json({ message: 'The order with the given ID was not found.' });
    }
    return res.status(200).send(order);
});

router.get(`/get/count`, async (req, res) => {
    const orderCount = await Orders.countDocuments();
    if (!orderCount) {
        res.status(500).json({ success: false });
    } else {
        res.send({ orderCount: orderCount });
    }
});

router.get(`/get/count2`, async (req, res) => {
    const merchantTransactionId = req.query.id;
    const merchantId = process.env.PHONE_PE_MID;
    const keyIndex = 1;
    const string = `/pg/v1/status/${merchantId}/${merchantTransactionId}` + salt_key;
    const sha256 = crypto.createHash('sha256').update(string).digest('hex');
    const checksum = sha256 + "###" + keyIndex;

    const options = {
        method: 'GET',
        url: `${process.env.PHONE_PE_STATUS_URL}/${merchantId}/${merchantTransactionId}`,
        headers: {
            accept: 'application/json',
            'Content-Type': 'application/json',
            'X-VERIFY': checksum,
            'X-MERCHANT-ID': `${merchantId}`
        }
    };

    // CHECK PAYMENT STATUS
    axios.request(options).then(async (response) => {
        if (response.data.success === true) {
            res.redirect(`${process.env.CLIENT_BASE_URL}/#payment-status`);
        } else {
            res.redirect(`${process.env.CLIENT_BASE_URL}/#payment-failed`);
        }
    })
    .catch((error) => {
        console.error(error);
        res.redirect(`${process.env.CLIENT_BASE_URL}/payment-error`);
    });
});

router.post('/create', async (req, res) => {
    try {
        // Create the order document
        let order = new Orders({
            name: req.body.name,
            phoneNumber: req.body.phoneNumber,
            address: req.body.address,
            pincode: req.body.pincode,
            amount: req.body.amount,
            paymentId: req.body.paymentId,
            email: req.body.email,
            userid: req.body.userid,
            products: req.body.products,
        });

        // Generate the HTML content for the PDF
        const pdfContent = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Order Invoice</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        padding: 20px;
                    }
                    .invoice {
                        border: 1px solid #ddd;
                        padding: 20px;
                        margin: 20px;
                        position: relative;
                    }
                    .invoice-header {
                        text-align: center;
                        margin-bottom: 20px;
                    }
                    .invoice-header h1 {
                        margin: 0;
                        font-size: 24px;
                    }
                    .invoice-header img {
                        max-width: 100px;
                        margin-bottom: 10px;
                    }
                    .invoice-header p {
                        margin: 0;
                        font-size: 14px;
                    }
                    .invoice-details {
                        margin-top: 20px;
                    }
                    .invoice-details table {
                        width: 100%;
                        border-collapse: collapse;
                    }
                    .invoice-details th, .invoice-details td {
                        border: 1px solid #ddd;
                        padding: 8px;
                        text-align: left;
                    }
                    .invoice-details th {
                        background-color: #f2f2f2;
                    }
                    .signature {
                        text-align: right;
                        margin-top: 50px;
                    }
                    .signature img {
                        max-width: 150px;
                    }
                </style>
            </head>
            <body>
                <div class="invoice">
                    <div class="invoice-header">
                        <img src="https://raw.githubusercontent.com/vishalp743/ranienterprisesballia/master/client/src/assets/images/Mainlogo.png" alt="Rani Enterprises Logo">
                        <h1>Rani Enterprises</h1>
                        <p>GST Number: 1234567890ABCD</p>
                        <h2>Order Invoice</h2>
                    </div>
                    <div class="invoice-details">
                        <p><strong>Order ID:</strong> ${order.paymentId}</p>
                        <p><strong>Name:</strong> ${order.name}</p>
                        <p><strong>Phone:</strong> ${order.phoneNumber}</p>
                        <p><strong>Address:</strong> ${order.address}</p>
                        <p><strong>Pincode:</strong> ${order.pincode}</p>
                        <p><strong>Total Amount:</strong> ₹${order.amount}</p>
                        <p><strong>User ID:</strong> ${order.userid}</p>
                        <p><strong>Order Date:</strong> ${new Date(order.date).toLocaleDateString()}</p>

                        <table>
                            <thead>
                                <tr>
                                    <th>Product ID</th>
                                    <th>Product Title</th>
                                    <th>Quantity</th>
                                    <th>Price</th>
                                    <th>Subtotal</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${order.products.map(item => `
                                    <tr>
                                        <td>${item.productId}</td>
                                        <td>${item.productTitle}</td>
                                        <td>${item.quantity}</td>
                                        <td>₹${item.price}</td>
                                        <td>₹${item.subTotal}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                    <div class="signature">
                        <p>Authorized Signature:</p>
                        <img src="https://raw.githubusercontent.com/vishalp743/ranienterprisesballia/master/client/src/assets/images/Mainlogo.png" alt="Signature">
                    </div>
                </div>
            </body>
            </html>
        `;

        // PDF options
        const pdfOptions = {
            format: 'A4',
            childProcessOptions: {
                env: {
                    OPENSSL_CONF: '/dev/null'
                }
            }
        };

        // Save the PDF to the `uploads` directory
        const pdfFilePath = path.join(__dirname, "../uploads", `order_${order.paymentId}.pdf`);
        pdf.create(pdfContent, pdfOptions).toFile(pdfFilePath, async (err, result) => {
            if (err) {
                console.error('Error creating PDF:', err);
                return res.status(500).json({ success: false, error: 'Error creating PDF' });
            }
            else{
                console.log('PDF created successfully');
            }

            // Store the relative path in the order document
            order.billPdf = `uploads/order_${order.paymentId}.pdf`;

            // Save the order document to the database
            order = await order.save();

            const customerMailOptions = {
                from: 'contact@ranienterprisesballia.com',
                to: order.email,
                subject: 'Your Order Confirmation',
                text: `Dear ${order.name},\n\nThank you for your order. Your order has been successfully placed.\n\nOrder Details:\nOrder ID: ${order.paymentId}\nTotal Amount: ₹${order.amount}\n\nPlease find attached the invoice for your purchase.\n\nBest regards,\nRani Enterprises`,
                attachments: [
                    {
                        filename: `order_${order.paymentId}.pdf`,
                        path: pdfFilePath,
                        contentType: 'application/pdf'
                    }
                ]
            };

            
            // Send email to customer
            transporter.sendMail(customerMailOptions, (err, info) => {
                if (err) {
                    console.error('Error sending email to customer:', err);
                }
                else {
                    console.log('Email sent to customer');
                }
            });

            

            // io.emit('newOrder', order);


            res.status(201).json({
                success: true,
                order: order
            });
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({
            error: err.message,
            success: false
        });
    }
});



router.delete('/:id', async (req, res) => {

    const deletedOrder = await Orders.findByIdAndDelete(req.params.id);

    if (!deletedOrder) {
        res.status(404).json({
            message: 'Order not found!',
            success: false
        })
    }

    res.status(200).json({
        success: true,
        message: 'Order Deleted!'
    })
});


router.put('/:id', async (req, res) => {

    const order = await Orders.findByIdAndUpdate(
        req.params.id,
        {
            name: req.body.name,
            phoneNumber: req.body.phoneNumber,
            address: req.body.address,
            pincode: req.body.pincode,
            amount: req.body.amount,
            paymentId: req.body.paymentId,
            email: req.body.email,
            userid: req.body.userid,
            products: req.body.products,
            status:req.body.status
        },
        { new: true }
    )



    if (!order) {
        return res.status(500).json({
            message: 'Order cannot be updated!',
            success: false
        })
    }

    res.send(order);

})

let salt_key = process.env.PHONE_PE_SALT;
let merchant_id = process.env.PHONE_PE_MID;

router.post("/order", async (req, res) => {
    try {
        console.log(req.body);
        const merchantTransactionId = req.body.transactionId;
        const data = {
            merchantId: merchant_id,
            merchantTransactionId: merchantTransactionId,
            merchantUserId: req.body.MUID,
            name: req.body.name,
            amount: req.body.amount * 100,
            redirectUrl: `${process.env.SERVER_BASE_URL}/api/orders/get/count2/?id=${merchantTransactionId}`,
            redirectMode: 'REDIRECT',
            mobileNumber: req.body.number,
            paymentInstrument: {
                type: 'PAY_PAGE'
            }
        };

        const payload = JSON.stringify(data);
        const payloadMain = Buffer.from(payload).toString('base64');
        const keyIndex = 1;
        const string = payloadMain + '/pg/v1/pay' + salt_key;
        const sha256 = crypto.createHash('sha256').update(string).digest('hex');
        const checksum = sha256 + '###' + keyIndex;

        
        const prod_URL = process.env.PHONE_PE_HOST_URL;

        const options = {
            method: 'POST',
            url: prod_URL,
            headers: {
                accept: 'application/json',
                'Content-Type': 'application/json',
                'X-VERIFY': checksum
            },
            data: {
                request: payloadMain
            }
        };

        axios.request(options).then(function (response) {
                console.log(response.data.data.instrumentResponse.redirectInfo.url)

                res.json({ redirectUrl: response.data.data.instrumentResponse.redirectInfo.url });
                // res.send(response.data)
            })
            .catch(function (error) {
                console.error(error);
            });

    } catch (error) {
        res.status(500).send({
            message: error.message,
            success: false
        })
    }
});


router.post("/insert-order", async (req, res) => {
    try {
        let order = new Orders({
            name: req.body.name,
            phoneNumber: req.body.phoneNumber,
            address: req.body.address,
            pincode: req.body.pincode,
            amount: req.body.amount,
            paymentId: req.body.paymentId,
            email: req.body.email,
            userid: req.body.userid,
            products: req.body.products,
        });

        if (!order) {
            return res.status(400).json({
                error: "Invalid order data",
                success: false
            });
        }

        order = await order.save();

        // Generate the PDF bill
        
    } catch (error) {
        console.error("Error inserting order:", error);
        res.status(500).json({
            error: error.message,
            success: false
        });
    }
});

router.put('/editorder/:id', async (req, res) => {
    try {
        const orderId = req.params.id;
        const updatedData = req.body; // Extract data from the request body

        // Find the order by ID and update it
        const updatedOrder = await Orders.findByIdAndUpdate(orderId, updatedData, {
            new: true, // Return the updated document
            runValidators: true // Ensure the updated document passes schema validation
        });

        if (!updatedOrder) {
            return res.status(404).json({ message: 'Order not found' });
        }

        res.json(updatedOrder);
    } catch (error) {
        console.error('Error updating order:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});




module.exports = router;

