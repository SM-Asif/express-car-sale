const express = require('express');
const { MongoClient } = require('mongodb');
require('dotenv').config();
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5000;
const ObjectId = require('mongodb').ObjectId;

//middleware
app.use(cors());
app.use(express.json());

//DB access
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.74f46.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
console.log(uri);
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

//api function
async function run() {
    try {
        await client.connect();
        const database = client.db("expressCarSale");
        const carsCollection = database.collection("cars");
        const ordersCollection = database.collection("orders");
        const reviewsCollection = database.collection("reviews");
        
        //get cars api
        app.get('/cars', async (req, res) => {
            const cursor = carsCollection.find({});
            const cars = await cursor.toArray();
            res.send(cars);
        });

        //get single car api
        app.get('/cars/:id', async (req, res) => {
            const id = req.params.id;
            const query = {_id: ObjectId(id)};
            const car = await carsCollection.findOne(query);
            res.json(car);
        });

        //orders post api
        app.post('/orders', async (req, res) => {
            const order = req.body;
            const result = await ordersCollection.insertOne(order);
            res.json(result);
        });

        //reviews post api
        app.post('/reviews', async (req, res) => {
            const review = req.body;
            const result = await reviewsCollection.insertOne(review);
            res.json(result);
        });

        //get reviews api
        app.get('/reviews', async (req, res) => {
            const cursor = reviewsCollection.find({});
            const reviews = await cursor.toArray();
            res.send(reviews);
        });

        //orders get api
        app.get('/orders', async (req, res) => {
            const cursor = ordersCollection.find({});
            const orders = await cursor.toArray();
            res.send(orders);
        });

        //ordered cars post api to get data
        app.post('/orders/orderId', async (req, res) => {
            const orderIds = req.body;
            const newOrderIds = [];
            orderIds.map(orderId => newOrderIds.push(ObjectId(orderId)));
            const query = {_id: {$in: newOrderIds}}
            const cars = await carsCollection.find(query).toArray();
            res.json(cars);
        });

        //delete api
        app.delete('/orders/:id', async (req, res) => {
            const id = req.params.id;
            const query = {orderId: id};
            const result = await ordersCollection.deleteMany(query);
            console.log('deleting order', result);
            res.json(result);
        });

    }
    finally {
        // await client.close();
    }

}

run().catch(console.dir);//call api function

//default route
app.get('/', (req, res) => {
    res.send('running Food Express server');
});
app.listen(port, () => {
    console.log('running Food Express server on port', port);
});