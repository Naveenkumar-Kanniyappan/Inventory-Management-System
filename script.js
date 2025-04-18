let productApi = "http://localhost:3000/products";
let categoriesApi = "http://localhost:3000/categories";

let container = document.getElementsByClassName("show-table")[0];
let formContainer = document.getElementById("form-container");
let closeButton = document.getElementById("icone");
let addBtn = document.getElementById("add-Button");

let productName = document.getElementById("name");
let quantity = document.getElementById("quantity");
let price = document.getElementById("price");
let image = document.getElementById("image");
let filter = document.getElementById("filter");
let searchInput = document.getElementById("search");
let fronteFilter = document.getElementById("filter-Categoeries");

let inputForm = document.querySelector("form");

let editingProductId = null;
let allProducts = [];
let allCategories = [];

function loadDataManager() {
  Promise.all([
    fetch(productApi).then((res) => res.json()),
    fetch(categoriesApi).then((res) => res.json()),
  ]).then((data) => {
    let products = data[0];
    let categories = data[1];

    allProducts = products;
    allCategories = categories;

    showProduct(products, categories);
    populateCategoryFilters(categories);
    showCategorySummary(products, categories);
  });
}

function showProduct(products, categories) {
  container.innerHTML = "";

  let totalValue = 0;
  let lowStock = 0;
  let noStock = 0;

  let table = document.createElement("table");
  table.id = "table";

  let tableHead = document.createElement("thead");
  tableHead.id = "thead";

  let tableBody = document.createElement("tbody");

  let headers = ["Image", "Name", "Qty", "Price", "Category", "Actions"];
  let headerRow = document.createElement("tr");

  for (let i = 0; i < headers.length; i++) {
    let th = document.createElement("th");
    th.id = "th";
    th.textContent = headers[i];
    headerRow.appendChild(th);
  }

  tableHead.appendChild(headerRow);

  for (let j = 0; j < products.length; j++) {
    let product = products[j];
    totalValue += product.quantity * product.price;

    if (product.quantity <= 5 && product.quantity > 0) {
      lowStock++;
    }
    if (product.quantity === 0) {
      noStock++;
    }

    let row = document.createElement("tr");

    row.innerHTML = `<td><img src="${product.image}" width="50" height="50" />
      </td> + <td>${product.name}</td><td>${product.quantity}</td>
      <td>${product.price}</td><td>${getCategoryName(
      product.categoryId,
      categories
    )}</td><td>
        <button class="edit-btn" data-id="${
          product.id
        }"><i class="fa-solid fa-pen-to-square"></i></button>
        <button class="delete-btn" data-id="${
          product.id
        }"><i class="fa-solid fa-trash"></i></button>
      </td>`;

    tableBody.appendChild(row);
  }

  table.appendChild(tableHead);
  table.appendChild(tableBody);
  container.appendChild(table);

  document.getElementById("totalPrice").textContent =
    "₹" + totalValue.toFixed(2);
  document.getElementById("low-item").textContent = lowStock;
  document.getElementById("no-stock").textContent = noStock;

  dataDelete();
}

function getCategoryName(categoryId, categories) {
  for (let i = 0; i < categories.length; i++) {
    if (categories[i].id === categoryId) {
      return categories[i].name;
    }
  }
  return "No Category";
}

function populateCategoryFilters(categories) {
  let filters = [filter, fronteFilter];

  for (let i = 0; i < filters.length; i++) {
    let select = filters[i];
    select.innerHTML = '<option value="all">All Categories</option>';

    for (let j = 0; j < categories.length; j++) {
      let option = document.createElement("option");
      option.value = categories[j].id;
      option.textContent = categories[j].name;
      select.appendChild(option);
    }
  }
}

addBtn.addEventListener("click", function () {
  formContainer.style.display = "block";
  inputForm.reset();
  editingProductId = null;
});

closeButton.addEventListener("click", function () {
  formContainer.style.display = "none";
  editingProductId = null;
});

inputForm.addEventListener("submit", function (e) {
  e.preventDefault();

  if (
    productName.value &&
    quantity.value &&
    price.value &&
    image.value &&
    filter.value
  ) {
    let productData = {
      name: productName.value,
      quantity: parseInt(quantity.value),
      price: parseFloat(price.value),
      image: image.value,
      categoryId: parseInt(filter.value),
    };

    let method = editingProductId ? "PUT" : "POST";
    let url = editingProductId
      ? `${productApi}/${editingProductId}`
      : productApi;

    fetch(url, {
      method: method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(productData),
    }).then(() => {
      formContainer.style.display = "none";
      inputForm.reset();
      editingProductId = null;
      loadDataManager();
    });
  }
});

function dataDelete() {
  let deleteBtns = document.querySelectorAll(".delete-btn");
  let editBtns = document.querySelectorAll(".edit-btn");

  for (let i = 0; i < deleteBtns.length; i++) {
    deleteBtns[i].addEventListener("click", function () {
      let id = this.getAttribute("data-id");
      fetch(`${productApi}/${id}`, { method: "DELETE" }).then(() => {
        loadDataManager();
      });
    });
  }

  for (let j = 0; j < editBtns.length; j++) {
    editBtns[j].addEventListener("click", function () {
      let id = this.getAttribute("data-id");
      fetch(`${productApi}/${id}`)
        .then((res) => res.json())
        .then((product) => {
          productName.value = product.name;
          quantity.value = product.quantity;
          price.value = product.price;
          image.value = product.image;
          filter.value = product.categoryId;

          editingProductId = product.id;
          formContainer.style.display = "block";
        });
    });
  }
}

fronteFilter.addEventListener("change", function () {
  let selected = this.value;
  if (selected === "all") {
    showProduct(allProducts, allCategories);
  } else {
    let filtered = allProducts.filter(
      (p) => p.categoryId === parseInt(selected)
    );
    showProduct(filtered, allCategories);
  }
});

searchInput.addEventListener("input", function () {
  let keyword = this.value.trim().toLowerCase();

  if (keyword === "") {
    showProduct(allProducts, allCategories);
  } else {
    let filtered = allProducts.filter((p) =>
      p.name.toLowerCase().includes(keyword)
    );
    showProduct(filtered, allCategories);
  }
});

function showCategorySummary(products, categories) {
  let summaryContainer = document.getElementById("summary-table");
  summaryContainer.innerHTML = "";

  let table = document.createElement("table");
  table.id = "table";

  let thead = document.createElement("thead");
  thead.id = "thead";

  let tbody = document.createElement("tbody");

  let headings = [
    "Category",
    "Total Products",
    "Total Quantity",
    "Total Value (₹)",
  ];
  let headerRow = document.createElement("tr");

  for (let i = 0; i < headings.length; i++) {
    let th = document.createElement("th");
    th.id = "th";
    th.textContent = headings[i];
    headerRow.appendChild(th);
  }

  thead.appendChild(headerRow);

  for (let j = 0; j < categories.length; j++) {
    let cat = categories[j];
    let categoryProducts = products.filter((p) => p.categoryId === cat.id);

    if (categoryProducts.length === 0) continue;

    let totalQty = 0;
    let totalVal = 0;

    for (let k = 0; k < categoryProducts.length; k++) {
      totalQty += categoryProducts[k].quantity;
      totalVal += categoryProducts[k].quantity * categoryProducts[k].price;
    }

    let row = document.createElement("tr");
    row.innerHTML =
      `<td>${cat.name}</td>
      <td>${categoryProducts.length}</td>
      <td>${totalQty}</td>
      <td>₹${totalVal.toFixed(2)}</td>`;

    tbody.appendChild(row);
  }

  table.appendChild(thead);
  table.appendChild(tbody);
  summaryContainer.appendChild(table);
}

loadDataManager();
