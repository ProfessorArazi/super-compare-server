const puppeteer = require("puppeteer");
const { updateMongo } = require("./updateMongo");
const { autoScroll, scrapeData } = require("./autoScroll");
const fs = require("fs");
const path = require("path");

// const updateShufersal = async () => {
//     let arr = [];
//     let urls = shufersalUrls;
//     let count = 0;

//     for (let i = 0; i < urls.length; i++) {
//         await axios(urls[i])
//             .then((res) => {
//                 const $ = cheerio.load(res.data);

//                 arr.push(
//                     ...$(
//                         "main > .wrapper > .gridCart > .mainTabSection > .paneList > #tabPane1 > .tileSection3 > .tileContainer > .SEARCH > .tile > .textContainer > .middleContainer > .line > .flex-right > .price > .number"
//                     )
//                         .text()
//                         .split("\n")
//                         .map((x) => +x)
//                         .filter((x) => x !== 0)
//                 );

//                 $(
//                     "main > .wrapper > .gridCart > .mainTabSection > .paneList > #tabPane1 > .tileSection3 > .tileContainer > .SEARCH > .tile > .textContainer > .middleContainer > .text"
//                 ).each((index, element) => {
//                     let obj = {};
//                     let priceObj = {};
//                     priceObj.price = arr[index + count];
//                     obj[$(element).text().trim()] = priceObj;
//                     arr[index + count] = obj;
//                 });
//                 count = arr.length;
//             })
//             .catch((err) => console.log(err));
//     }

//     updateMongo(arr, "shufersal");
// };

const scrape = async () => {
    const markets = ["carrefour", "ybitan", "quik"];
    const subjects = ["בשר", "חלב", "אטריות", "דגנים", "פירות", "ירקות"];

    const data = {
        carrefour: [],
        ybitan: [],
        quik: [],
        yuda: [],
        victoryonline: [],
    };

    const browser = await puppeteer.launch({ headless: false });

    const scrapeSubject = async (market, subject) => {
        const page = await browser.newPage();
        page.setDefaultNavigationTimeout(10000);

        try {
            await autoScroll(
                page,
                `https://www.${market}.co.il/search/${subject}`
            );
            const subjectData = await scrapeData(page);
            return subjectData;
        } catch (error) {
            console.error(
                `Error scraping ${market} for subject ${subject}:`,
                error
            );
            return [];
        } finally {
            await page.close();
        }
    };

    for (const market of markets) {
        for (const subject of subjects) {
            console.log(`Scraping ${market} for subject: ${subject}`);
            const subjectData = await scrapeSubject(market, subject);
            data[market].push(...subjectData);
            console.log(
                `Data length for ${market} after scraping ${subject}:`,
                data[market].length
            );
        }
    }

    fs.writeFileSync(
        path.join(__dirname, "../../../../auto-market", "productsData.json"),
        JSON.stringify(data, null, 2),
        "utf-8"
    );

    await browser.close();
};

// const matchProducts = (threshold = 0.6) => {
//     const markets = Object.keys(data); // Get the market names
//     const productMap = {}; // To hold matched products

//     // Loop through each market
//     markets.forEach((market, marketIndex) => {
//         const products = data[market][0]; // Get the products object for the market
//         const productNames = Object.keys(products); // Extract product names

//         // Create a Fuse instance for the current market
//         const fuse = new Fuse(productNames, {
//             includeScore: true,
//             threshold: 0.6, // Adjust threshold for matching
//         });

//         // Loop through each product in the current market
//         productNames.forEach((productName) => {
//             if (!productMap[productName]) {
//                 productMap[productName] = []; // Initialize array if not exists
//             }

//             // Compare with other markets
//             markets.forEach((otherMarket, otherMarketIndex) => {
//                 if (marketIndex === otherMarketIndex) return; // Skip the same market

//                 const otherProducts = data[otherMarket][0];
//                 const otherProductNames = Object.keys(otherProducts);

//                 // Find matches using Fuse.js
//                 const results = fuse.search(productName);
//                 results.forEach((result) => {
//                     if (result.score < 1 - threshold) {
//                         // Check if match is above threshold
//                         productMap[productName].push({
//                             market: otherMarket,
//                             ...otherProducts[result.item], // Spread the matched product details
//                         });
//                     }
//                 });
//             });
//         });
//     });

//     console.log(JSON.stringify(productMap, null, 2));
// };

module.exports = { scrape };
