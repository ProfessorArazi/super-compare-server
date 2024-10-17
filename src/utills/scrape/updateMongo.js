// require("../../src/db/mongoose");
// const Mega = require("../../src/Models/mega");
// const Shufersal = require("../../src/Models/shufersal");
// const Bitan = require("../../src/Models/bitan");
// const {
//     generateShufersalObject,
// } = require("../productsNames/geneateNamesObject");

// const updateMongo = async (arr, market) => {
//     let names = await generateShufersalObject(market);

//     let model;
//     switch (market) {
//         case "shufersal":
//             model = Shufersal;
//             break;
//         case "mega":
//             model = Mega;
//             break;
//         default:
//             model = Bitan;
//     }

//     for (let i = 0; i < arr.length; i++) {
//         let obj = {};
//         obj[names[Object.keys(arr[i])]] = arr[i][Object.keys(arr[i])];
//         if (Object.keys(obj)[0] !== "undefined") {
//             await model.findOneAndUpdate(
//                 { name: Object.keys(obj)[0] },
//                 Object.values(obj)[0]
//             );
//         }
//     }
// };

// module.exports = { updateMongo };
