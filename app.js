var express = require("express");
var exphbs = require("express-handlebars");
var port = process.env.PORT || 3000;

const mercadopago = require("mercadopago");

mercadopago.configure({
  access_token:
    "APP_USR-6317427424180639-042414-47e969706991d3a442922b0702a0da44-469485398",
  integrator_id: "dev_24c65fb163bf11ea96500242ac130004",
});

var app = express();

app.engine("handlebars", exphbs());
app.set("view engine", "handlebars");

app.use(express.static("assets"));

app.use("/assets", express.static(__dirname + "/assets"));
app.use(express.urlencoded({ extended: false }));

app.get("/", function (req, res) {
  res.render("home");
});

app.get("/detail", function (req, res) {
  res.render("detail", req.query);
});

app.post("/buy", function (req, res) {
  const host = req.protocol + "://" + req.get("host");

  let preference = {
    payment_methods: {
      installments: 6,
      excluded_payment_methods: [
        {
          id: "amex",
        },
      ],
      excluded_payment_types: [
        {
          id: "atm",
        },
      ],
    },
    payer: {
      name: "Lalo",
      surname: "Landa",
      email: "test_user_63274575@testuser.com",
      phone: {
        area_code: "11",
        number: 22223333,
      },
      address: {
        street_name: "False",
        street_number: 123,
        zip_code: "1111",
      },
    },
    items: [
      {
        id: 1234,
        title: req.body.title,
        description: "Dispositivo móvil de Tienda e-commerce",
        picture_url: host + req.body.img,
        quantity: 1,
        unit_price: Number(req.body.price),
      },
    ],
    external_reference: "menaericdaniel@gmail.com",
    back_urls: {
      success : host + '/success',
      pending : host + '/pending',
      failure : host + '/failure'
    },
    notification_url: host + '/notifications',
    auto_return : 'approved',
  };

  mercadopago.preferences
    .create(preference)
    .then(function (response) {
      global.id = response.body.id;
      global.init_point = response.body.init_point;
      //console.log(response);
      return res.render("confirm", {
        init_point: response.body.init_point,
      });
    })
    .catch((error) => console.log(error));
});


app.get('/success', (req,res)=>{
  res.render('success')
});
app.get('/pending', (req,res)=>{
  res.render('pending')
});
app.get('/failure', (req,res)=>{
  res.render('failure')
});

app.post('/notifications',(req,res)=> {
  console.log(req.body)
  res.status(200).end('Ok')
})

app.listen(port);
