const express = require("express");
const cors = require("cors");
const multer = require("multer");
const Joi = require("joi");
const mongoose = require("mongoose");
const app = express();
app.use(express.static("public"));
app.use(express.json());
app.use(cors());

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./public/images/");
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage: storage });


mongoose
  .connect(
    "mongodb+srv://chasemccracken:WEhHGbHH1BMDTyJl@emberestates.8ip0faq.mongodb.net/?retryWrites=true&w=majority&appName=EmberEstates"
  )
  .then(() => {
    console.log("connected to mongodb");
  })
  .catch((error) => {
    console.log("couldn't connect to mongodb", error);
  });


const listingSchema = new mongoose.Schema({
  title: String,
  price: String,
  address: String,
  bedrooms: Number,
  bathrooms: Number,
  square_feet: Number,
  property_type: String,
  year_built: Number,
  features: [String],
  img_name: String,
  description: String,
});

const Listing = mongoose.model("Listing", listingSchema);

app.get("/api/listings", async (req, res) => {
  const listings = await Listing.find();
  res.send(listings);
});


app.post("/api/listings", upload.single("img"), async (req, res) => {
  const isValidListing = validateListing(req.body);
  if (isValidListing.error) {
    console.log("Invalid listing");
    res.status(400).send(isValidListing.error.details[0].message);
    return;
  }
  const listing = new Listing({
    title: req.body.title,
    price: req.body.price,
    address: req.body.address,
    bedrooms: req.body.bedrooms,
    bathrooms: req.body.bathrooms,
    square_feet: req.body.square_feet,
    property_type: req.body.property_type,
    year_built: req.body.year_built,
    features: req.body.features ? JSON.parse(req.body.features) : [],
    description: req.body.description,
  });
  if (req.file) {
    listing.img_name = req.file.filename;
  }
  const newListing = await listing.save();
  res.status(200).send(newListing);
});


app.put("/api/listings/:id", upload.single("img"), async (req, res) => {
  const isValidUpdate = validateListing(req.body);
  if (isValidUpdate.error) {
    console.log("Invalid Info");
    res.status(400).send(isValidUpdate.error.details[0].message);
    return;
  }
  const fieldsToUpdate = {
    title: req.body.title,
    price: req.body.price,
    address: req.body.address,
    bedrooms: req.body.bedrooms,
    bathrooms: req.body.bathrooms,
    square_feet: req.body.square_feet,
    property_type: req.body.property_type,
    year_built: req.body.year_built,
    features: req.body.features ? JSON.parse(req.body.features) : [],
    description: req.body.description,
  };
  if (req.file) {
    fieldsToUpdate.img_name = req.file.filename;
  }
  const success = await Listing.updateOne({ _id: req.params.id }, fieldsToUpdate);
  if (!success) {
    res.status(404).send("The listing you wanted to edit is unavailable");
    return;
  }
  const updatedListing = await Listing.findById(req.params.id);
  res.status(200).send(updatedListing);
});


app.delete("/api/listings/:id", async (req, res) => {
  const listing = await Listing.findByIdAndDelete(req.params.id);
  if (!listing) {
    res.status(404).send("The listing you wanted to delete is unavailable");
    return;
  }
  res.status(200).send(listing);
});

const validateListing = (listing) => {
  const schema = Joi.object({
    _id: Joi.allow(""),
    title: Joi.string().min(3).required(),
    price: Joi.string().required(),
    address: Joi.string().required(),
    bedrooms: Joi.number().required().min(0),
    bathrooms: Joi.number().required().min(0),
    square_feet: Joi.number().required().min(0),
    property_type: Joi.string().required(),
    year_built: Joi.number().required().min(1900),
    features: Joi.allow(""),
    description: Joi.string().required(),
  });
  return schema.validate(listing);
};

app.listen(3001, () => {
  console.log("I'm listening...");
});
