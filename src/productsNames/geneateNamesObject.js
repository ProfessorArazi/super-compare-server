const Mega = require("../Models/mega");
const {
  shufersalProductsNames,
  megaProductsNames,
  bitanProductsNames,
} = require("./productsNamesData");

const dataBaseProductsNames = async () => {
  const productsNames = (await Mega.find({}, "name -_id")).map(
    (obj) => obj.name
  );
  return productsNames;
};

const generateShufersalObject = async (market) => {
  let marketNames;
  switch (market) {
    case "shufersal":
      marketNames = shufersalProductsNames;
      break;
    case "mega":
      marketNames = megaProductsNames;
      break;
    default:
      marketNames = bitanProductsNames;
  }

  let productsNames = await dataBaseProductsNames();
  productsNames = productsNames.map((product, i) => [marketNames[i], product]);
  const namesObject = Object.fromEntries(productsNames);

  return namesObject;
};

module.exports = { generateShufersalObject };
