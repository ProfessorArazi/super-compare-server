async function autoScroll(page, url) {
    try {
        await page.setViewport({
            width: 1200,
            height: 800,
        });

        await page.goto(url, {
            waitUntil: "networkidle2",
            timeout: 10000,
        });

        await page.evaluate(async () => {
            const distance = 100;
            const delay = 200;
            let totalHeight = 0;
            let scrollHeight = document.body.scrollHeight;

            while (true) {
                window.scrollBy(0, distance);
                totalHeight += distance;

                await new Promise((resolve) => setTimeout(resolve, delay));

                scrollHeight = document.body.scrollHeight;
                if (totalHeight >= scrollHeight) {
                    break;
                }
            }
        });
    } catch (error) {
        console.error("Error during auto scroll: ", error);
        console.error("url: " + url);
    }
}

async function scrapeData(page) {
    const data = await page.evaluate(() => {
        let items = Array.from(document.querySelectorAll("div.clickable"));
        items = items
            .map((item) => item.innerHTML)
            .filter((item) => item.includes("₪"));

        let prices = items
            .map((item) =>
                item.match(
                    /₪(\d+(\.\d+)?)|(\d+)\s?(?:ק\"ג)?\s?ב-\s?₪(\d+(\.\d+)?)/g
                )
            )
            .map((price) => {
                if (price.length > 2 && !price[2].includes("ב")) {
                    return [price[0]];
                }
                return price;
            });

        let names = items.map((item) =>
            item
                .match(/title=".+"/g)[0]
                .slice(7, item.match(/title=".+"/g)[0].indexOf(" aria-hidden"))
        );

        let images = items.map((item) => {
            const match = item.match(/&quot;(.*?)&quot;/);
            return match ? match[1] : null;
        });

        names.forEach((name, index) => {
            let obj = {};
            let priceObj = {};
            priceObj.price = +prices[index][0].slice(1);
            priceObj.img = images[index];
            if (prices[index].length < 3) {
                priceObj.discount = 0;
                priceObj.discountPrice = 0;
            } else {
                priceObj.discount = +prices[index][2].match(/[0-9]+/g)[0];
                priceObj.discountPrice =
                    +prices[index][2].match(/\d+(\.\d+)?/g)[1];
            }
            obj[name.replace(/"/g, "")] = priceObj;
            names[index] = obj;
        });
        return names;
    });

    return data;
}

module.exports = { autoScroll, scrapeData };
