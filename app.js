const express = require("express") ;
const { MongoClient, ObjectId } = require('mongodb');
const bodyParser = require('body-parser');
const path = require('path');
const { log } = require("console");

const app = express() ;
const port = 3000 ;


app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static('public'));
app.set('view engine', 'ejs') ;

// mongo connection

const url = 'mongodb://127.0.0.1:27017';
const client = new MongoClient(url);
let db;

async function connectDB() {
    try{
        await client.connect();
        db = client.db('myapp');
        console.log('connected to mongoDB');
    }catch(err){
        console.log('failed to connect err => ' + err);
    }
}


// routes 

app.get('/', (req,res) => {
    res.sendFile(path.join(__dirname, 'public' , 'welcome.html')) ;
});


app.get('/create', (req,res) => {
    res.sendFile(path.join(__dirname, 'public' , 'create.html')) ;
});

// handel create POST 

app.post('/create' , async (req,res) => {
    const record = {name : req.body.name} ;
    await db.collection('records').insertOne(record);
    res.redirect('/');
});

app.get('/admin' , (req,res) => {
    res.send(`
    <h1>Enter Admin Password</h1>
    <form action="/admin/authenticate" method="POST">
        <input type="password" name="password" placeholder="Enter password" required>
        <input type="submit" value="Enter">
    </form>
    <a href="/">Back to Home</a>
    `);
});

app.post('/admin/authenticate', async (req, res) => {
    const password = req.body.password;
    if (password === '4488') {
        const records = await db.collection('records').find().toArray();
        res.render('admin', { records });
    } else {
        res.send('Incorrect password');
    }
});

app.post('/delete/:id' , async (req,res) => {
    const id = req.params.id;
    await db.collection('records').deleteOne({ _id: new ObjectId(id) });
    res.redirect('/admin');
});

app.listen(port , async () => {
    await connectDB() ;
    console.log(`server is listening at ${port}`);
});
