const findDuplicates = (prices) => {
  for (let i = 0; i < prices.length; i++) {
    let duplicates = prices.filter((x) => x.name === prices[i].name);
    if (duplicates.length > 1) {
      prices = prices.filter((x) => x.name !== prices[i].name);

      let obj = { group: duplicates[0].group };
      obj["x" + duplicates.length + " " + duplicates[0].name] =
        duplicates[0].price * duplicates.length;
      prices.unshift(obj);
    } else {
      let obj = { group: prices[i].group };
      obj[prices[i].name] = prices[i].price;
      prices[i] = obj;
    }
  }
  return prices;
};
module.exports = findDuplicates;
