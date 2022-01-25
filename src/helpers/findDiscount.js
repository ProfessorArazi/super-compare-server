const findDiscount = (market) => {
  for (let i = 0; i < market.length; i++) {
    if (market[i].discount) {
      if (market[i].discount <= market.filter((x) => x === market[i]).length) {
        for (let j = 0; j < market[i].discount - 1; j++) {
          market.splice(market.lastIndexOf(market[i]), 1);
        }
        let obj = {
          name: `מבצע! ${market[i].discount} ${market[i].name}`,
          discount: 0,
          price: market[i].discountPrice,
          group: market[i].group,
        };
        market[i] = obj;
      }
    }
  }
};

module.exports = findDiscount;
