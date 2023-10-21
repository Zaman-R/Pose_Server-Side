const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;


// middleware
app.use(cors());
app.use(express.json());

// create a post method for the server  



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.xe22blt.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const productsCollection = client.db('productDB').collection('product');
    const userCollection = client.db('productDB').collection('user');

    app.get('/products', async(req, res) => {
      const cursor = productsCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    })

    app.get('/products/:id', async(req, res) =>{
      const id = req.params.id;
      const query = {_id: new ObjectId(id)};
      console.log("BUG",query);
      const result = await productsCollection.findOne(query);
      res.send(result);
    })
     

    app.put('/products/:id', async(req,res)=>{
      const id = req.params.id;
      const filter = {_id: new ObjectId(id)};
      const options = {upsert : true};
      const updateProduct = req.body;
      const product ={
          $set: {
              Name : updateProduct.Name, 
              Brand_Name : updateProduct.Brand_Name, 
              image : updateProduct.image, 
              Type : updateProduct.Type, 
              Price : updateProduct.Price, 
              Rating : updateProduct.Rating, 
              Short_description : updateProduct.Short_description,
          }
      }
      const result = await productsCollection.updateOne(filter, product, options);
      res.send(result);

   })


    app.post('/products',async(req,res)=>{
        const newProduct = req.body;
        console.log(newProduct);
        const result = await productsCollection.insertOne(newProduct);
        res.send(result);
    })



    app.delete('/products/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await productsCollection.deleteOne(query);
      res.send(result);
  })

   // get user data from database
   app.get('/user', async(req, res)=>{ // getting all data from database
    const cursor = userCollection.find();
    const result = await cursor.toArray();
    res.send(result);
})

app.post('/user', async(req, res)=>{
    const user = req.body;
    console.log(user);
    const result = await userCollection.insertOne(user);
    res.send(result);
})

app.get('/user/:email', async(req, res)=>{
    const email = req.params.email;
    const query = {email: email};
    const result = await userCollection.findOne(query);
    res.send(result);
})


app.put('/user/:email', async(req, res)=>{ // updating data into database
    const email = req.params.email;
    const filter = {email: email};
    const options = {upsert : true};
    const updateUser = req.body;
    const user ={
        $set: {
            myCart : updateUser.myCart, 
        }
    }
    const result = await userCollection.updateOne(filter, user, options);
    res.send(result);
})





// Send a ping to confirm a successful connection
await client.db("admin").command({ ping: 1 });
console.log("Pinged your deployment. You successfully connected to MongoDB!");
} finally {
// Ensures that the client will close when you finish/error
// await client.close();
}
}
run().catch(console.dir);


app.get('/',(req,res)=>{
    res.send("Server Running");
})


app.listen(port, ()=>{
    console.log(`Server is running,${port}`);
})
