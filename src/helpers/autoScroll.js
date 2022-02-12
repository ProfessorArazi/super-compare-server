async function autoScroll(page, url) {
  await page.goto(url, {
    waitUntil: "networkidle0",
  });

  await page.setViewport({
    width: 1200,
    height: 800,
  });

  await page.evaluate(async () => {
    await new Promise((resolve, reject) => {
      let totalHeight = 0;
      let distance = 100;
      let timer = setInterval(() => {
        let scrollHeight = document.body.scrollHeight;
        window.scrollBy(0, distance);
        totalHeight += distance;

        if (totalHeight >= scrollHeight) {
          clearInterval(timer);
          resolve();
        }
      }, 100);
    });
  });
}

async function scrapeData(page) {
  const data = await page.evaluate(() => {
    let items = Array.from(document.querySelectorAll("div.clickable"));
    items = items
      .map((item) => item.innerHTML)
      .filter((item) => item.includes("₪"));
    let prices = items
      .map((item) => item.match(/[0-9.ב -]*₪[0-9.ב -]*/g))
      .map((price) => {
        if (price.length > 2 && !price[2].includes("ב")) {
          return [price[0]];
        }
        return price;
      });

    let names = items.map((item) =>
      item
        .match(/title=".+"/g)[0]
        .slice(7, item.match(/title=".+"/g)[0].indexOf(">"))
    );

    names.forEach((name, index) => {
      let obj = {};
      let priceObj = {};
      priceObj.price = +prices[index][0].slice(1);
      if (prices[index].length < 3) {
        priceObj.discount = 0;
        priceObj.discountPrice = 0;
      } else {
        priceObj.discount = +prices[index][2].match(/[0-9]+/g)[0];
        priceObj.discountPrice = +prices[index][2].match(/[0-9]+/g)[1];
      }
      obj[name.replace(/"/g, "")] = priceObj;
      names[index] = obj;
    });
    return names;
  });
  return data;
}

module.exports = { autoScroll, scrapeData };
