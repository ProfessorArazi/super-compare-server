require("../../src/db/mongoose");
const Mega = require("../../src/Models/mega");
const Shufersal = require("../../src/Models/shufersal");
const Bitan = require("../../src/Models/bitan");
const {
  generateShufersalObject,
} = require("../productsNames/geneateNamesObject");

const updateMongo = async (arr, market) => {
  let count = 0;
  let names = await generateShufersalObject(market);
  let model;
  switch (market) {
    case "shufersal":
      model = Shufersal;
      break;
    case "mega":
      model = Mega;
      break;
    default:
      model = Bitan;
  }
  for (let i = 0; i < arr.length; i++) {
    let obj = {};
    obj[names[Object.keys(arr[i])]] = arr[i][Object.keys(arr[i])];
    if (Object.keys(obj)[0] !== "undefined") {
      // count++;
      console.log(obj);
      await model.findOneAndUpdate(
        { name: Object.keys(obj)[0] },
        Object.values(obj)[0]
      );
    }
  }
  // console.log(count);
};

module.exports = { updateMongo };
