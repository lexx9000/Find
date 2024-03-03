$(document).ready(function () {
  // инициализируем DataTable
  $("#myTable").DataTable({
    // включаем автоматическую сортировку по столбцу цены (3 - индекс столбца, 0 - по возрастанию)
    // order: [[2, "asc"]],
    // включаем поиск
    searching: true,
    // добавляем плейсхолдер для поля поиска
    language: {
      searchPlaceholder: "Поиск...",
    },
  });
});

const searchValueEls = document.querySelectorAll(".searchValue");
const textFormEl = document.querySelector("#textForm");
const searchInputEl = document.querySelector(".search-input");

searchValueEls.forEach((searchValueEl) => {
  searchValueEl.addEventListener("click", () => {
    searchInputEl.value = searchValueEl.textContent.trim();
    textFormEl.submit();
  });
});
