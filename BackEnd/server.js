import express from "express";
import "dotenv/config";
import cors from "cors";
import path from "path";

import productRoutes from "./Routes/product.route.js";
import imageRoutes from "./Routes/image.route.js";
import categoriesRoutes from './Routes/categories.route.js'
import brandsRoutes from './Routes/brands.route.js'
import shippingRoutes from "./Routes/shipping.route.js";
import publicShippingRoutes from "./Routes/publicShipping.route.js";
import ordersRoutes from "./Routes/orders.route.js";
import customersRoutes  from "./Routes/customers.route.js"
import contentRoutes  from "./Routes/content.route.js"
import settingsRoutes from "./Routes/settings.route.js";

import authRoutes from './Routes/auth.route.js'

import dashboardAuthMiddleware from "./Middlewares/dashboardAuth.middleware.js";


const app = express();
const port = process.env.LISTEN_PORT || 3001;

app.use(cors());
app.use(express.json());
app.use("/api", dashboardAuthMiddleware);


// Serve uploaded images
app.use(
    "/uploads",
    express.static(path.resolve("uploads"))
);

// API routes
app.use("/api", productRoutes);
app.use("/api", imageRoutes);
app.use("/api", categoriesRoutes);
app.use("/api", brandsRoutes);
app.use("/api", shippingRoutes);
app.use("/api", publicShippingRoutes);
app.use("/api", ordersRoutes);
app.use("/api", customersRoutes );
app.use("/api", contentRoutes   );
app.use("/api", settingsRoutes   );
app.use("/api/auth", authRoutes   );

app.get("/", (req, res) => {
    res.send("<h1>THE BACKEND IS ALIVE !!!</h1>");
});

app.listen(port, () => {
    console.log(`The server is running on ${port}`);
});