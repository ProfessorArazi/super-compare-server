const cheerio = require("cheerio");
const axios = require("axios");
const puppeteer = require("puppeteer");
const { updateMongo } = require("./updateMongo");
const { autoScroll, scrapeData } = require("./autoScroll");
const {
  shufersalUrls,
  megaUrls,
  bitanUrls,
} = require("../productsNames/productsUrls");

const updateShufersal = async () => {
  let arr = [];
  let urls = shufersalUrls;
  let count = 0;

  for (let i = 0; i < urls.length; i++) {
    await axios(urls[i])
      .then((res) => {
        const $ = cheerio.load(res.data);

        arr.push(
          ...$(
            "main > .wrapper > .gridCart > .mainTabSection > .paneList > #tabPane1 > .tileSection3 > .tileContainer > .SEARCH > .tile > .textContainer > .middleContainer > .line > .price > .number"
          )
            .text()
            .split("\n")
            .map((x) => +x)
            .filter((x) => x !== 0)
        );

        $(
          "main > .wrapper > .gridCart > .mainTabSection > .paneList > #tabPane1 > .tileSection3 > .tileContainer > .SEARCH > .tile > .textContainer > .middleContainer > .text"
        ).each((index, element) => {
          let obj = {};
          let priceObj = {};
          priceObj.price = arr[index + count];
          obj[$(element).text().trim()] = priceObj;
          arr[index + count] = obj;
        });
        count = arr.length;
      })
      .catch((err) => console.log(err));
  }
  updateMongo(arr, "shufersal");
};

const updateMegaAndBitan = async () => {
  const browser = await puppeteer.launch({
    headless: false,
  });
  const page = await browser.newPage();

  await page.setDefaultNavigationTimeout(0);

  let megaArr = [];
  let bitanArr = [];

  for (let i = 0; i < megaUrls.length; i++) {
    await autoScroll(page, megaUrls[i]);
    const data = await scrapeData(page);
    megaArr.push(...data);
  }

  updateMongo(megaArr, "mega");

  for (let i = 0; i < bitanUrls.length; i++) {
    await autoScroll(page, bitanUrls[i]);
    const data = await scrapeData(page);
    bitanArr.push(...data);
  }

  updateMongo(bitanArr, "bitan");

  await browser.close();
};

module.exports = { updateShufersal, updateMegaAndBitan };
