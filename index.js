const express = require("express");
const app = express();
const port = 5000;
const cors = require("cors");
const bodyParser = require("body-parser");
const { ObjectId } = require("mongodb");
const fileUpload = require("express-fileupload");

require("dotenv").config();

const MongoClient = require("mongodb").MongoClient;
const uri =
  `mongodb+srv://creativeAgencyUser:${process.env.DB_USER}@${process.env.DB_PASS}.vucvc.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static("agency"));
// Enable file upload using express-fileupload
app.use(
  fileUpload({
    createParentPath: true,
  })
);

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

client.connect((err) => {
  const servicesCollection = client.db("creativeagency").collection("services");
  const worksCollection = client.db("creativeagency").collection("ourWorks");
  const clientReviews = client.db("creativeagency").collection("reviews");
  const orderedCollection = client.db("creativeagency").collection("userOrder");
  const adminloginCollection = client.db("creativeagency").collection("admin");

  app.get("/services", (req, res) => {
    servicesCollection.find({}).toArray((err, documents) => {
      if (err === null) {
        res.send({
          status: "success",
          result: documents,
        });
      } else {
        res.send({
          status: "failed",
          result: err,
        });
      }
    });
  });
  app.delete("/delete_service/:id", (req, res) => {
  
    servicesCollection.deleteOne(
      { _id: ObjectId(req.params.id) },
      function (err, result) {
        if (result.deletedCount > 0) {
          res.send({ status: true, message: "Successfully Delete One" });
        } else {
          res.send({ status: false, message: err });
        }
      }
    );
  });

  app.get("/works", (req, res) => {
    worksCollection.find({}).toArray((err, documents) => {
      
      res.send({status:'success',result:documents});
    });
  });

  app.post("/add-works", (req, res) => {
    const file = req.files.file;
    const fileName = file.name;
   
    worksCollection.insertOne({ fileName });
    file.mv(`${__dirname}/agency/${file.name}`, (err) => {
      if (err) {
        return res.status(500).send({ msg: "failed to upload " });
      }
      return res.send({ name: fileName, path: `/${file.name}` });
    });
  });

  
  app.delete("/delete_work/:id", (req, res) => {
    worksCollection.deleteOne(
      { _id: ObjectId(req.params.id) },
      function (err, result) {
        if (result.deletedCount > 0) {
          res.send({ status: true, message: "Successfully Delete One" });
        } else {
          res.send({ status: false, message: err });
        }
      }
    );
  });

  app.post("/client", (req, res) => {
    const reviews = req.body;
    clientReviews.insertOne(reviews).then((result) => {
      res.send(result.insertedCount > 0);
    });
  });

  app.get("/clientFeedback", (req, res) => {
    clientReviews.find({}).toArray((err, documents) => {
      res.send(documents);
    });
  });

  app.delete("/delete_client_review/:id", (req, res) => {
    clientReviews.deleteOne(
      { _id: ObjectId(req.params.id) },
      function (err, result) {
        if (result.deletedCount > 0) {
          res.send({ status: true, message: "Successfully Delete One" });
        } else {
          res.send({ status: false, message: err });
        }
      }
    );
  });

  app.get("/orderList/:id", (req, res) => {
    const id = req.params.id;
    orderedCollection.find({ _id: ObjectId(id) }).toArray((err, document) => {
      res.send(document[0]);
    });
  });

  /* Order collection */
  app.post("/ordered", (req, res) => {
    const order = req.body;

    orderedCollection.insertOne(order).then((result) => {
      res.send(result.insertedCount > 0);
    });
  });
  app.get("/admin/allservices", (req, res) => {
    orderedCollection.find({}).toArray((err, documents) => {
      res.send(documents);
    });
  });

  app.patch("/order", (req, res) => {
    const id = req.query.id;
    const body = req.body;
    const { status } = body;
    orderedCollection.updateOne({ _id: ObjectId(id) },
        {
          $set: { status: status },
        }
      )
      .then((result) => {
        if(result.modifiedCount> 0){
          res.send({success:true,message:'Order has been Changed'})
        }else{
          res.send({success:false,message:'Failed To Chaned'})

        }
      });
  });

  app.get("/servicelist", (req, res) => {
    const email = req.query.email;
    orderedCollection.find({ email: email }).toArray((err, documents) => {
      res.send(documents);
    });
  });

  app.post("/addAService", (req, res) => {
    const file = req.files.file;
    const title = req.body.title;
    const description = req.body.description;
    const fileName = file.name;

    servicesCollection.insertOne({ fileName, title, description });
    file.mv(`${__dirname}/agency/${file.name}`, (err) => {
      if (err) {
       
        return res.status(500).send({ msg: "failed to upload " });
      }
      return res.send({ name: file.name, path: `/${file.name}` });
    });
  });

  app.delete("/delete_admin/:id", (req, res) => {
   
    adminloginCollection.deleteOne(
      { _id: ObjectId(req.params.id) },
      function (err, result) {
        if (result.deletedCount > 0) {
          res.send({ status: true, message: "Successfully Delete One" });
        } else {
          res.send({ status: false, message: err });
        }
      }
    );
  });
  app.post("/adminlogin", (req, res) => {
   
    adminloginCollection
      .find({ adminEmail: req.body.adminEmail })
      .toArray((err, documents) => {
        if (JSON.stringify(documents) === "[]") {
          adminloginCollection.insertOne(req.body).then((result) => {
            res.send({ success: true, message: "Create Admin Email" });
          });
        } else {
          res.send({ success: false, message: "Email already exist!" });
        }
      });
  });

  app.get("/getAdmin", (req, res) => {
    const email = req.query.email;
    adminloginCollection
      .find({ adminEmail: email })
      .toArray((err, documents) => {
        if (documents.length > 0) {
          res.send(true);
        } else {
          res.send(false);
        }
      });
  });
  app.get("/all-admin", (req, res) => {
   
    adminloginCollection.find({}).toArray((err, documents) => {
      if (err === null) {
        res.send({
          status: "success",
          result: documents,
        });
      } else {
        res.send({
          status: "failed",
          result: err,
        });
      }
    });
  });
});

app.get("/", (req, res) => {
  res.send("Hello world It's working");
});

app.listen(process.env.PORT || port, () =>
  console.log(`Server running ${process.env.PORT || port}`)
);
