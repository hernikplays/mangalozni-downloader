import puppeteer from 'puppeteer';
import fs from "fs";
import path from "path";
/*
Copyright (c) 2022 Matyáš Caras

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

*/
(async () => {
    if (!fs.existsSync(path.join(__dirname, "config.json"))) {
        console.log("config.json not found");
        process.exit(1);
    }
    const config = JSON.parse(fs.readFileSync(path.join(__dirname, "config.json"), "utf8"));
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    const cookie = config["cookie"].split("=")
    await page.setCookie({ name: cookie[0], value: cookie[1], domain: config["cookieDomain"] });
    await page.goto(config["url"]);
    await page.waitForNetworkIdle({ idleTime: 10000, timeout: 30000 })
    const total = await page.evaluate(() => {
        return document.querySelector("#menu_nombre_total")?.innerHTML; // get total pages
    });
    if (!total) {
        console.log("! Cannot load page, check config URL and cookie.")
    }
    if (!fs.existsSync(`${__dirname}/out`)) {
        fs.mkdirSync(`${__dirname}/out`)
    }
    for (let index = 0; index < parseInt(total ?? "0"); index++) { // run through all pages
        const current = await page.evaluate(() => {
            return document.querySelector("span#menu_nombre_current")?.innerHTML;
        });
        if (!current) {
            console.error("! Error while getting current page number, check network and cookie validity")
            process.exit(1)
        }
        console.log(`> Downloading page ${current}/${total}`);
        const data = await page.evaluate(() => {
            return document.querySelector('canvas')?.toDataURL(); // get image data from canvas
        });
        if (!data) {
            if (config["stopOnError"]) {
                console.log(`! No canvas data found, stopping`)
                break
            }
            else {
                console.log(`! No canvas data found, moving to next page`)
                continue
            }
        }
        fs.writeFile(`${__dirname}/out/${(index < 10)?`0${index}`:index}.png`, data.replace(/^data:image\/png;base64,/, ""), 'base64', function (err) {
            if (err) {
                console.log(`! Error while saving ${current}: ${err}`);
                if (config["stopOnError"]) {
                    process.exit(1)
                }
            }
        });
        await page.mouse.click(132, 103, { button: 'left' }) // proceed to next page
        await sleep(config["timeout"]*1000)
        index += 1;
    }
    await browser.close()
})();

function sleep(ms: number) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}