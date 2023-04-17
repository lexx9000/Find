const { Router } = require("express");
const router = Router();
const axios = require("axios");
const cheerio = require("cheerio");
// const { Words, Minus } = require("../models/findWords");

const axiosConfig = {
  maxContentLength: 1 * 1024 * 1024, // 10 MB
};

const sites = [
  {
    name: "cbm.company",
    url: "https://cbm.company/search/catalog/?q=",
    selector: ".catalog-item",
    title: ".name-element",
    link: ".name-element",
    price: ".price-value",
  },
  {
    name: "bs-opt.ru",
    url: "https://bs-opt.ru/search/?q=",
    selector: ".catalog-item",
    title: ".catalog-item-title",
    link: ".catalog-item-title a",
    price: ".catalog-item-price",
  },
];

router.get("/", async (req, res) => {
  res.render("index", {
    title: "Index",
  });
});

router.post("/", async (req, res) => {
  //   let query = req.body.query;
  let query = req.body.query;
  const allResults = await Promise.all(
    sites.map((site) => getDataFromSite(site, query))
  );
  const outputArr = allResults.reduce((acc, { site, results }) => {
    return [...acc, ...results.map((result) => ({ site, ...result }))];
  }, []);
  //   console.log(outputArr);
  res.render("index", {
    title: "Index",
    outputArr: outputArr,
  });
});

// поиск по сайту
async function getDataFromSite(site, query) {
  try {
    const response = await axios.get(site.url + query, axiosConfig);
    const $ = cheerio.load(response.data);
    const results = [];

    $(site.selector)
      .slice(0, 20) // выбрать только первые 10 элементов
      .each((i, el) => {
        const title = $(el).find(site.title).text().trim();
        const link = new URL($(el).find(site.link).attr("href"), site.url).href;
        const price = $(el).find(site.price).text().trim();
        results.push({ title, link, price });
      });

    return { site: site.name, results };
  } catch (error) {
    console.log(error);
  }
}

module.exports = router;
