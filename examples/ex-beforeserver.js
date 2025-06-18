const express = require("express");
const cors = require("cors");
const multer = require("multer");
const Joi = require("joi");
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


let houses = [
    {
        "_id":0,
        "name": "Farm House",
        "size": 2000,
        "bedrooms": 3,
        "bathrooms": 2.5,
        "features": [
            "wrap around porch",
            "attached garage"
        ],
        "main_image": "farm.webp",
        "floor_plans": [
            {
                "name": "Main Level",
                "image": "farm-floor1.webp"
            },
            {
                "name": "Basement",
                "image": "farm-floor2.webp"
            }
        ]
    },
    {
        "_id":1,
        "name": "Mountain House",
        "size": 1700,
        "bedrooms": 3,
        "bathrooms": 2,
        "features": [
            "grand porch",
            "covered deck"
        ],
        "main_image": "mountain-house.webp",
        "floor_plans": [
            {
                "name": "Main Level",
                "image": "mountain-house1.webp"
            },
            {
                "name": "Optional Lower Level",
                "image": "mountain-house2.webp"
            },
            {
                "name": "Main Level Slab Option",
                "image": "mountain-house3.jpg"
            }
        ]
    },
    {
        "_id":2,
        "name": "Lake House",
        "size": 3000,
        "bedrooms": 4,
        "bathrooms": 3,
        "features": [
            "covered deck",
            "outdoor kitchen",
            "pool house"
        ],
        "main_image": "lake-house.jpg",
        "floor_plans": [
            {
                "name": "Main Level",
                "image": "lake-house1.webp"
            },
            {
                "name": "Lower Level",
                "image": "lake-house2.webp"
            }
        ]
    }
];

app.get("/api/houses",(req, res)=>{
    res.send(houses);
});

app.post("/api/houses", upload.single("img") , (req, res)=>{
    //console.log(req.body);
    const isValidHouse = validateHouse(req.body);

    if(isValidHouse.error){
        console.log("Invalid house");
        res.status(400).send(isValidHouse.error.details[0].message);
        return;
    }

    const house = {
        _id:houses.length,
        name:req.body.name,
        size:req.body.size,
        bedrooms:req.body.bedrooms,
        bathrooms:req.body.bathrooms
    }

    if(req.file){
        house.main_image = req.file.filename;
    }

    houses.push(house);
    res.status(200).send(house);
});

app.put("/api/houses/:id", upload.single("img"), (req, res)=>{
    //console.log(`You are trying to edit ${req.params.id}`);
    //console.log(req.body);

    const house = houses.find((h)=>h._id===parseInt(req.params.id));

    const isValidUpdate = validateHouse(req.body);

    if(isValidUpdate.error){
        console.log("Invalid Info");
        res.status(400).send(isValidUpdate.error.details[0].message);
        return;
    }

    house.name = req.body.name;
    house.description = req.body.description;
    house.size = req.body.size;
    house.bathrooms = req.body.bathrooms;
    house.bedrooms = req.body.bedrooms;

    if(req.file){
        house.main_image = req.file.filename;
    }

    res.status(200).send(house);

});

app.delete("/api/houses/:id", (req,res)=>{
    const house = houses.find((h)=>h._id===parseInt(req.params.id));
    
    if(!house) {
        res.status(404).send("The house you wanted to delete is unavailable");
        return;
    }

    const index = houses.indexOf(house);
    houses.splice(index, 1);
    res.status(200).send(house);
});


const validateHouse = (house) => {
    const schema = Joi.object({
        _id:Joi.allow(""),
        name:Joi.string().min(3).required(),
        size:Joi.number().required().min(0),
        bedrooms:Joi.number().required().min(0),
        bathrooms:Joi.number().required().min(0),
    });

    return schema.validate(house);
};

app.listen(3001, ()=>{
    console.log("I'm listening...");
});