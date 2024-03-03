const { Router } = require("express");
const router = Router();
const axios = require("axios");
const cheerio = require("cheerio");
// const { Words, Minus } = require("../models/findWords");

const axiosConfig = {
  maxContentLength: 10 * 1024 * 1024, // 10 MB
};

const sites = [
  {
    name: "kimbrer.com",
    url: "https://www.kimbrer.com/catalogsearch/result/?q=",
    selector: ".product-item",
    title: ".product-item-link",
    link: ".product-item-link",
    price: ".price",
    available: ".product-item-stock",
    countToShow: 1,
  },
  {
    name: "vibrant.com",
    url: "https://www.vibrant.com/store/Search.aspx?SearchTerms=",
    selector: ".category-product",
    title: "a.h5.color-inherit",
    link: "a.h5.color-inherit",
    price: ".CategoryProductPrice",
    countToShow: 1,
  },
  {
    name: "core4solutions.com",
    url: "https://www.core4solutions.com/catalogsearch/result/?q=",
    selector: ".category-products",
    title: "h2.product-name",
    link: ".product-image",
    price: ".price",
    available: ".availability.in-stock",
    countToShow: 1,
  },
];

router.get("/", async (req, res) => {
  res.render("index", {
    title: "Index",
  });
});

router.post("/", async (req, res) => {
  const queries = req.body.query.split("\n").map((query) => query.trim()); // Разбиваем текст на массив строк

  const outputArr = [];

  for (const query of queries) {
    const queryResults = await Promise.all(
      sites.map((site) => getDataFromSite(site, query))
    );

    outputArr.push(
      ...queryResults.reduce((acc, { site, results }) => {
        return [...acc, ...results.map((result) => ({ site, ...result }))];
      }, [])
    );
  }

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
    let matchingResultsCount = 0; // Счетчик совпадающих результатов

    // Функция для обработки элемента и добавления его в результаты
    async function processElement(el, title, link, price) {
      const available = await fetchAvailable(link, site.available);
      results.push({ title, link, price, available });
    }

    // Обработка элементов
    const elements = $(site.selector);
    for (let i = 0; i < elements.length; i++) {
      const el = elements[i];
      const title = $(el).find(site.title).text().trim();
      const link = new URL($(el).find(site.link).attr("href"), site.url).href;
      const price = $(el).find(site.price).text().trim();

      if (!title) {
        results.push({
          title: "Default Title",
          link: "#",
          price: "Default Price",
          available: "Default Available",
        });
        break;
      }

      // Проверяем, что заголовок содержит строку запроса
      if (title.toLowerCase().includes(query.toLowerCase())) {
        await processElement(el, title, link, price);
        matchingResultsCount++;
        if (matchingResultsCount >= site.countToShow) {
          // Если достигнуто количество для отображения, завершаем цикл
          break;
        }
      }
    }

    // Если счетчик совпадающих результатов равен нулю, добавляем первые 5 результатов
    if (matchingResultsCount === 0) {
      const elementsToProcess = $(site.selector).slice(0, site.countToShow);
      for (let i = 0; i < elementsToProcess.length; i++) {
        const el = elementsToProcess[i];
        const title = $(el).find(site.title).text().trim();
        const link = new URL($(el).find(site.link).attr("href"), site.url).href;
        const price = $(el).find(site.price).text().trim();
        await processElement(el, title, link, price);
      }
    }

    return { site: site.name, results };
  } catch (error) {
    console.log(error);
    return { site: site.name, results: [] };
  }
}

module.exports = router;

// Функция для получения данных о количестве доступного товара по ссылке
async function fetchAvailable(link, siteAvailableClass) {
  try {
    const responseLink = await axios.get(link, axiosConfig);
    const $link = cheerio.load(responseLink.data);
    return $link(siteAvailableClass).text().trim();
  } catch (error) {
    console.log(error);
    return "";
  }
}
