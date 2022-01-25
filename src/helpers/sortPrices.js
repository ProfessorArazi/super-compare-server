const sortPrices = (market) => {
  let onDiscount = market
    .filter((x) => Object.keys(x)[1].includes("מבצע"))
    .sort((a, b) => Object.values(a)[0] - Object.values(b)[0]);

  let noDiscount = market
    .filter((x) => !Object.keys(x)[1].includes("מבצע"))
    .sort((a, b) => Object.values(a)[0] - Object.values(b)[0]);
  return [...onDiscount, ...noDiscount];
};

module.exports = sortPrices;
