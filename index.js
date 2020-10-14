const express = require('express')
const app = express()
const port = 5000
const cors = require('cors')
const bodyParser = require('body-parser')
const {  ObjectId } = require('mongodb')

require('dotenv').config()

const MongoClient = require('mongodb').MongoClient;
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.mde5k.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;



app.use(cors())
app.use(bodyParser.json())


const client = new MongoClient(uri, { useNewUrlParser: true,useUnifiedTopology: true  });

client.connect(err => {
  const servicesCollection = client.db("creativeAgencyss").collection("services");
  const worksCollection = client.db("creativeAgencyss").collection("works");
  const clientCollection = client.db("creativeAgencyss").collection("client");
    
    app.get('/services',(req, res)=>{
       
        servicesCollection.find({})
        .toArray((err, documents)=>{
            res.send(documents)
        })

    })
    app.get('/works',(req, res)=>{
    worksCollection.find({})
    .toArray((err, documents)=>{
        res.send(documents)
    })
            })

            app.get('/clientFeedback',(req, res)=>{
             
                clientCollection.find({})
                .toArray((err, documents)=>{
                    res.send(documents)
                })
            })

            app.get('/id',(req, res)=>{
                const id = req.query.id;
                console.log(id)
                servicesCollection.find({_id: ObjectId(id)})
                .toArray((err,document)=>{
                    res.send(document[0])
                })
            })

});





app.get('/', (req, res) => {
  res.send('Hello World!')
})



app.listen(process.env.port || port)