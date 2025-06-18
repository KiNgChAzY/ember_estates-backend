const express = require("express");
const cors = require("cors");
const multer = require("multer");
const Joi = require("joi");
// const mongoose = require("mongoose");
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

/*
mongoose
    .connect("mongodb+srv://chasemccracken:WEhHGbHH1BMDTyJl@emberestates.8ip0faq.mongodb.net/?retryWrites=true&w=majority&appName=EmberEstates")
    .then(() => {
        console.log("connected to mongodb");
    })
    .catch((error) => {
        console.log("couldn't connect to mongodb", error);
    });
*/

let listings = [
  {
    _id: 0,
    title: "Luxury Downtown Condo",
    price: "$575,000",
    address: "124 Main Street, Downtown",
    bedrooms: 3,
    bathrooms: 2,
    square_feet: 2000,
    property_type: "Condo",
    year_built: 2020,
    features: ["Pool", "Gym", "Parking", "Rooftop Deck"],
    img_name: "images/Luxury Downtown Condo.jpg",
    description:
      "Stunning downtown condo with modern amenities and city views.",
  },
  {
    _id: 1,
    title: "Waterfront Estate",
    price: "$1,250,000",
    address: "456 Harbor View Drive",
    bedrooms: 4,
    bathrooms: 3.5,
    square_feet: 3500,
    property_type: "Single Family",
    year_built: 2018,
    features: ["Private Dock", "Wine Cellar", "Smart Home", "Ocean View"],
    img_name: "images/Waterfront Estate.jpg",
    description:
      "Exclusive waterfront property with private dock and panoramic ocean views.",
  },
  {
    _id: 2,
    title: "Modern Office Space",
    price: "$850,000",
    address: "789 Business Park Avenue",
    bedrooms: 0,
    bathrooms: 4,
    square_feet: 5000,
    property_type: "Commercial",
    year_built: 2022,
    features: [
      "Conference Rooms",
      "High-Speed Internet",
      "Security System",
      "Parking",
    ],
    img_name: "images/Modern Office Space.webp",
    description: "State-of-the-art office space in prime business district.",
  },
  {
    _id: 3,
    title: "Suburban Family Home",
    price: "$425,000",
    address: "321 Oak Tree Lane",
    bedrooms: 4,
    bathrooms: 2.5,
    square_feet: 2800,
    property_type: "Single Family",
    year_built: 2015,
    features: ["Large Backyard", "Garage", "Fireplace", "Updated Kitchen"],
    img_name: "images/Suburban Family Home.jpeg",
    description: "Spacious family home in quiet suburban neighborhood.",
  },
  {
    _id: 4,
    title: "Urban Loft",
    price: "$325,000",
    address: "567 Industrial Way",
    bedrooms: 1,
    bathrooms: 1,
    square_feet: 1200,
    property_type: "Loft",
    year_built: 2019,
    features: [
      "High Ceilings",
      "Exposed Brick",
      "Modern Appliances",
      "City Views",
    ],
    img_name: "images/Urban Loft.jpg",
    description: "Contemporary loft in historic industrial building.",
  },
  {
    _id: 5,
    title: "Luxury Penthouse",
    price: "$2,100,000",
    address: "890 Skyline Tower",
    bedrooms: 3,
    bathrooms: 3.5,
    square_feet: 4000,
    property_type: "Penthouse",
    year_built: 2021,
    features: ["Private Elevator", "360° Views", "Wine Room", "Smart Home"],
    img_name: "images/Luxury Penthouse.jpg",
    description: "Exclusive penthouse with panoramic city views.",
  },
  {
    _id: 6,
    title: "Investment Property",
    price: "$750,000",
    address: "123 Rental Row",
    bedrooms: 8,
    bathrooms: 4,
    square_feet: 4800,
    property_type: "Multi-Family",
    year_built: 2017,
    features: ["Separate Units", "Laundry Room", "Storage", "High ROI"],
    img_name: "images/Investment Property.webp",
    description: "Prime investment property with multiple rental units.",
  },
  {
    _id: 7,
    title: "Eco-Friendly Home",
    price: "$495,000",
    address: "456 Green Street",
    bedrooms: 3,
    bathrooms: 2,
    square_feet: 2200,
    property_type: "Single Family",
    year_built: 2023,
    features: [
      "Solar Panels",
      "Rainwater Collection",
      "Energy Efficient",
      "Garden",
    ],
    img_name: "images/Eco-Friendly Home.jpeg",
    description: "Modern eco-friendly home with sustainable features.",
  },
];

/*
const listingSchema = new mongoose.Schema({
    title: String,
    price: Number,
    address: String,
    bedrooms: Number,
    bathrooms: Number,
    square_feet: Number,
    property_type: String,
    year_built: Number,
    features: String,
    img_name: String,
    description: String,
});

const Listing = mongoose.model("Listing", listingSchema);
*/

app.get("/api/listings", (req, res) => {
  res.send(listings);
});

app.post("/api/listings", upload.single("img"), (req, res) => {
  //console.log(req.body);
  const isValidListing = validateListing(req.body);

  if (isValidListing.error) {
    console.log("Invalid listing");
    res.status(400).send(isValidListing.error.details[0].message);
    return;
  }

  const listing = {
    _id: listings.length,
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
    listing.img_name = req.file.filename;
  }

  listings.push(listing);
  res.status(200).send(listing);
});

app.put("/api/listings/:id", upload.single("img"), (req, res) => {
  const listing = listings.find((l) => l._id === parseInt(req.params.id));

  if (!listing) {
    res.status(404).send("The listing you wanted to edit is unavailable");
    return;
  }

  const isValidUpdate = validateListing(req.body);

  if (isValidUpdate.error) {
    console.log("Invalid Info");
    res.status(400).send(isValidUpdate.error.details[0].message);
    return;
  }

  listing.title = req.body.title;
  listing.price = req.body.price;
  listing.address = req.body.address;
  listing.bedrooms = req.body.bedrooms;
  listing.bathrooms = req.body.bathrooms;
  listing.square_feet = req.body.square_feet;
  listing.property_type = req.body.property_type;
  listing.year_built = req.body.year_built;
  listing.features = req.body.features ? JSON.parse(req.body.features) : [];
  listing.description = req.body.description;

  if (req.file) {
    listing.img_name = req.file.filename;
  }

  res.status(200).send(listing);
});

app.delete("/api/listings/:id", (req, res) => {
  const listing = listings.find((l) => l._id === parseInt(req.params.id));

  if (!listing) {
    res.status(404).send("The listing you wanted to delete is unavailable");
    return;
  }

  const index = listings.indexOf(listing);
  listings.splice(index, 1);
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
