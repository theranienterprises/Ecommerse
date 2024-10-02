const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http').createServer(app);
const { Server } = require('socket.io');
const io = new Server(http, {
  cors: {
    origin: "*", // Be more specific in production
    methods: ["GET", "POST"]
  }
});
require('dotenv/config');


app.use(cors());
app.options('*', cors())

//middleware
app.use(bodyParser.json());
app.use(express.json());

//Routes
const userRoutes = require('./routes/user.js');
const categoryRoutes = require('./routes/categories');
const productRoutes = require('./routes/products');
const imageUploadRoutes = require('./helper/imageUpload.js');
const productWeightRoutes = require('./routes/productWeight.js');
const productRAMSRoutes = require('./routes/productRAMS.js');
const productSIZESRoutes = require('./routes/productSize.js');
const productReviews = require('./routes/productReviews.js');
const cartSchema = require('./routes/cart.js');
const myListSchema = require('./routes/myList.js');
const ordersSchema = require('./routes/orders.js');
const homeBannerSchema = require('./routes/homeBanner.js');
const searchRoutes = require('./routes/search.js');

app.use("/api/user",userRoutes);
app.use("/uploads",express.static("uploads"));
app.use(`/api/category`, categoryRoutes);
app.use(`/api/products`, productRoutes);
app.use(`/api/imageUpload`, imageUploadRoutes);
app.use(`/api/productWeight`, productWeightRoutes);
app.use(`/api/productRAMS`, productRAMSRoutes);
app.use(`/api/productSIZE`, productSIZESRoutes);
app.use(`/api/productReviews`, productReviews);
app.use(`/api/cart`, cartSchema);
app.use(`/api/my-list`, myListSchema);
app.use(`/api/orders`, ordersSchema);
app.use(`/api/homeBanner`, homeBannerSchema);
app.use(`/api/search`, searchRoutes);


io.on('connection', (socket) => {
    console.log('A user connected');
  
    socket.on('disconnect', () => {
      console.log('User disconnected');
    });
  });


//Database
mongoose.connect(process.env.CONNECTION_STRING, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => {
        console.log('Database Connection is ready...');
        //Server
        http.listen(process.env.PORT, () => {
            console.log(`server is running http://localhost:${process.env.PORT}`);
        })
    })
    .catch((err) => {
        console.log(err);
    })

// Add this function to emit new order events
function emitNewOrder(order) {
  io.emit('newOrder', order);
}

// Export the emitNewOrder function
// At the bottom of your index.js file
module.exports = { 
  emitNewOrder, 
  app,  // Add this line
  io    // Add this line
};