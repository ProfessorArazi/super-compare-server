const express = require("express");
require("dotenv").config({ path: __dirname + "/.env" });
require("./src/db/mongoose");
const cors = require("cors");
const Mega = require("./src/Models/mega");
const Shufersal = require("./src/Models/shufersal");
const Bitan = require("./src/Models/bitan");
const calculate = require("./src/helpers/calculate");
const findDiscount = require("./src/helpers/findDiscount");
const sortPrices = require("./src/helpers/sortPrices");
const orderPrices = require("./src/helpers/orderPrices");
const findDuplicates = require("./src/helpers/findDuplicats");
const {
  updateShufersal,
  updateMegaAndBitan,
} = require("./src/helpers/updateData");

const app = express();
app.use(express.json());
app.use(cors({ origin: "*" }));

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  next();
});

setInterval(() => {
  updateShufersal();
  updateMegaAndBitan();
}, 86400000);

app.get("/", (req, res) => {
  console.log("working");
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
  let bitan;
  let shufersal;
  let megaPrices = [];
  let shufersalPrices = [];
  let bitanPrices = [];

  mega = await Mega.find({ name: data });
  bitan = await Bitan.find({ name: data });
  shufersal = await Shufersal.find({ name: data });

  for (let i = 0; i < duplicates.length; i++) {
    mega.push(mega.find((x) => x.name === duplicates[i]));
    bitan.push(bitan.find((x) => x.name === duplicates[i]));
    shufersal.push(shufersal.find((x) => x.name === duplicates[i]));
  }

  findDiscount(mega);
  findDiscount(bitan);
  findDiscount(shufersal);

  mega = findDuplicates(mega);
  shufersal = findDuplicates(shufersal);
  bitan = findDuplicates(bitan);

  mega = sortPrices(mega);
  shufersal = sortPrices(shufersal);
  bitan = sortPrices(bitan);

  orderPrices(mega, megaPrices);
  orderPrices(shufersal, shufersalPrices);
  orderPrices(bitan, bitanPrices);

  let megaPrice = calculate(megaPrices);

  let shufersalPrice = calculate(shufersalPrices);

  let bitanPrice = calculate(bitanPrices);

  const prices = [
    ["מגה", megaPrice, megaPrices],
    ["שופרסל", shufersalPrice, shufersalPrices],
    ["יינות ביתן", bitanPrice, bitanPrices],
  ].sort((a, b) => a[1] - b[1]);
  res.send(prices);
});

const PORT = process.env.PORT || 8080;

app.listen(PORT, console.log(`Server started on port ${PORT}`));

module.exports = app;
