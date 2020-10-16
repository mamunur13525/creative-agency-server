const express = require('express')
const app = express()
const port = 5000
const cors = require('cors')
const bodyParser = require('body-parser')
const {  ObjectId } = require('mongodb')
const fileUpload = require('express-fileupload');

require('dotenv').config()

const MongoClient = require('mongodb').MongoClient;
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.mde5k.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;



app.use(cors())
app.use(bodyParser.json())
// Enable file upload using express-fileupload
app.use(fileUpload({
    createParentPath: true
  }));
  




const client = new MongoClient(uri, { useNewUrlParser: true,useUnifiedTopology: true  });

client.connect(err => {
  const servicesCollection = client.db("creativeAgencyss").collection("services");
  const worksCollection = client.db("creativeAgencyss").collection("works");
  const clientCollection = client.db("creativeAgencyss").collection("client");
  const orderedCollection = client.db("creativeAgencyss").collection("ordered");
  const adminlogin = client.db("creativeAgencyss").collection("admin");
    
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

            app.post('/client',(req, res)=>{
                const reviews = req.body;
                clientCollection.insertOne(reviews)
                .then(result=> {
                    res.send(result.insertedCount> 0)
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
                servicesCollection.find({_id: ObjectId(id)})
                .toArray((err,document)=>{
                    res.send(document[0])
                })
            })
    
            /* Order collection */
        app.post('/ordered',(req, res)=>{
            const order = req.body;
    
            orderedCollection.insertOne(order)
            .then(result => {
                res.send(result.insertedCount>0)
            })
        })
        app.get('/admin/allservices',(req, res)=>{
            orderedCollection.find({})
            .toArray((err, documents)=>{
                res.send(documents)
            })
        })

        app.patch('/id',(req, res)=>{
            const id = req.query.id;
            const body = req.body;
            const {status} = body;
            orderedCollection.updateOne(
                { _id: ObjectId(id) },
                {
                  $set: { status: status},
                }
            )
            .then(result => console.log(result))
        })


        app.get('/servicelist',(req, res)=>{
            const email = req.query.email;
            orderedCollection.find({email: email})
            .toArray((err,documents)=>{
                res.send(documents)
            })
        })

        app.post('/addAService',(req, res)=>{
            const file = req.files.file
            const title = req.body.title
            const description = req.body.description
            const fileName = file.name;
      
            servicesCollection.insertOne({fileName,title,description})
            file.mv(`${__dirname}/agency/${file.name}`,err=>{
                if(err){
                    console.log(err)
                    return res.status(500).send({msg:'failed to upload '})
                }
               return res.send({name:file.name, path:`/${file.name}`})
            })

        }) 

        app.post('/adminlogin',(req, res)=>{
          adminlogin.insertOne(req.body)
          .then(result =>{
              res.send(result.insertedCount>0)
          })
        })

        app.get('/getAdmin',(req, res)=>{
            const email = req.query.email;
          
            adminlogin.find({adminEmail: email})
            .toArray((err,documents)=>{
                if(documents.length>0){
                    res.send(true)
                }
                else{
                    res.send(false)
                }
            })
        })
     
      

});





app.get('/', (req, res) => {
  res.send('Hello World!')
})



app.listen(process.env.PORT || port)