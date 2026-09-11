import express from 'express'
import 'dotenv/config';
import cors from 'cors';

//Routes : 
import productRoutes from './Routes/product.route.js';

const app = express();
const port = process.env.LISTEN_PORT || 3001;

//MidleWares : 
//--Global Middlewares--
app.use(cors());
app.use(express.json())

//API Routes : 
app.use('/api',productRoutes);


app.get('/',(req,res) => {
    res.send('<h1>THE BACKEND IS ALIVE !!!</h1>')
})

app.listen(port,() => {
    console.log(`The server is running on ${port}`)
})