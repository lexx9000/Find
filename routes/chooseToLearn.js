const { Router } = require("express");
const router = Router();

router.get("/chooseToLearn", (req, res) => {
  res.render("chooseToLearn", {
    title: "Choose to Learn",
    isChoose: true,
  });
});

module.exports = router;
