const path = require("path");
const express = require("express");
// const mongoose = require("mongoose");
const exphbs = require("express-handlebars");
const search = require("./routes/search");

const PORT = process.env.PORT || 80;

// EXPRESS
const app = express();
const hbs = exphbs.create({
  defaultLayout: "main",
  extname: "hbs",
});

// корневая папка
app.use(express.static(path.join(__dirname, "public")));

app.engine("hbs", hbs.engine);
app.set("view engine", "hbs");
app.set("views", "views");

// используем обработчик для всех форм
// ПРОПИСАТЬ СТРОГО ДО ИСПОЛЬЗОВАНИЯ РОУТОВ!
app.use(express.urlencoded({ extended: true }));

// РОУТЫ
app.use(search);

async function start() {
  try {
    // await mongoose.connect(
    //   "mongodb+srv://English:Words@words.7k5uv1s.mongodb.net/words",
    //   {
    //     useNewUrlParser: true,
    //     // useFindAndModify: false,
    //   }
    // );
    app.listen(PORT, () => {
      console.log("Server has been started...");
    });
  } catch (error) {
    console.log(error);
  }
}

start();
