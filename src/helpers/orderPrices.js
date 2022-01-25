const orderPrices = (market, marketPrices) => {
  for (let i = 0; i < market.length; i++) {
    let obj = {};

    obj[Object.keys(market[i])[1]] = Object.values(market[i])[1];
    marketPrices.push(obj);
  }
};
module.exports = orderPrices;
