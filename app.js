const express = require("express");
require("./src/db/mongoose");
const cors = require("cors");
const Mega = require("./src/Models/mega");
const Shufersal = require("./src/Models/shufersal");
const Rami = require("./src/Models/rami");
const calculate = require("./src/helpers/calculate");
const findDiscount = require("./src/helpers/findDiscount");
const sortPrices = require("./src/helpers/sortPrices");
const orderPrices = require("./src/helpers/orderPrices");
const findDuplicates = require("./src/helpers/findDuplicats");
const app = express();
app.use(express.json());
app.use(cors({ origin: "*" }));

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  next();
});

app.get("/", (req, res) => {
  res.send({ message: "working" });
});

app.post("/add_shufersal", async (request, response) => {
  const shufersal = new Shufersal(request.body);

  try {
    await shufersal.save();
    response.send(shufersal);
  } catch (error) {
    response.status(500).send(error);
  }
});

app.post("/compare", async (req, res) => {
  const data = req.body;
  let duplicates = data.filter((x) => data.indexOf(x) !== data.lastIndexOf(x));
  duplicates = duplicates.filter((x, i) => i !== duplicates.lastIndexOf(x));
  let mega;
  let rami;
  let shufersal;
  let megaPrices = [];
  let shufersalPrices = [];
  let ramiPrices = [];

  mega = await Mega.find({ name: data });
  rami = await Rami.find({ name: data });
  shufersal = await Shufersal.find({ name: data });

  for (let i = 0; i < duplicates.length; i++) {
    mega.push(mega.find((x) => x.name === duplicates[i]));
    rami.push(rami.find((x) => x.name === duplicates[i]));
    shufersal.push(shufersal.find((x) => x.name === duplicates[i]));
  }

  findDiscount(mega);
  findDiscount(rami);
  findDiscount(shufersal);

  mega = findDuplicates(mega);
  shufersal = findDuplicates(shufersal);
  rami = findDuplicates(rami);

  mega = sortPrices(mega);
  shufersal = sortPrices(shufersal);
  rami = sortPrices(rami);

  orderPrices(mega, megaPrices);
  orderPrices(shufersal, shufersalPrices);
  orderPrices(rami, ramiPrices);

  let megaPrice = calculate(megaPrices);

  let shufersalPrice = calculate(shufersalPrices);

  let ramiPrice = calculate(ramiPrices);

  const prices = [
    ["מגה", megaPrice, megaPrices],
    ["שופרסל", shufersalPrice, shufersalPrices],
    ["רמי לוי", ramiPrice, ramiPrices],
  ].sort((a, b) => a[1] - b[1]);
  res.send(prices);
});

// app.post("/mega", async (request, response) => {
//   const mega = await Mega.find({ name: request.body.name });

//   try {
//     response.send(mega);
//   } catch (error) {
//     response.status(500).send(error);
//   }
// });

const PORT = process.env.PORT || 8080;

app.listen(PORT, console.log(`Server started on port ${PORT}`));
