const calculate = (prices) => {
  return prices.map((x) => Object.values(x)[0]).reduce((a, b) => a + b);
};
module.exports = calculate;
