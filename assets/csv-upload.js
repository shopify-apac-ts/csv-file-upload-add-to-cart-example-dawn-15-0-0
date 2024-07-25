console.log('Javascript is Running')

document.getElementById('csvInput').addEventListener('change', function(event){
  console.log('File input changed');
  Papa.parse(event.target.files[0], {
    complete: function(results) {
      console.log('results', results)
      populateTable(results.data);
    },
    header: true //csv will have headers
  });
});

function populateTable(data) {
  console.log(data);
  const tableBody = document.getElementById('csvTable').querySelector('tbody');
  tableBody.innerHTML=''; // this will clear the table
  data.forEach(item => {
    const row = `<tr>
                  <td>${item.title}</td>
                  <td>${item.sku}</td>
                  <td>${item.part_number}</td>
                  <td><input type="number" class="quantity-input" value="${item.quantity}" placeholder="${item.quantity}"></td>
                  <td><button class="add-to-cart button button--secondary" data-sku="${item.sku}" data-quantity="${item.quantity}">Add to Cart</button></td> 
                </tr>`;
    tableBody.innerHTML += row;
  });
}

document.getElementById('csvTable').addEventListener('click', function(event) {
  if (event.target.matches('.add-to-cart')) {
    addToCart(event);
  }
});

document.querySelector('#addAllToCart').addEventListener('click', addAllToCart);

document.getElementById('csvTable').addEventListener('change', function(event) {
  if (event.target.matches('.quantity-input')) {
    updateQuantity(event);
  }
});

function updateQuantity(event) {
  const input = event.target;
  const quantity = input.value;
  const row = input.parentNode.parentNode;
  const sku = row.querySelector('.add-to-cart').getAttribute('data-sku');
  row.querySelector('.add-to-cart').setAttribute('data-quantity', quantity);
}

function addToCart(event) { 
  const button = event.target;
  const sku = button.getAttribute('data-sku'); 
  const quantity = button.getAttribute('data-quantity'); 
  addToCartAPI([{ sku, quantity }], button); 
}

function addAllToCart() { 
  const buttons = Array.from(document.querySelectorAll('.add-to-cart'));
/*
  buttons.forEach(button => {
    const sku = button.getAttribute('data-sku'); 
    const quantity = button.getAttribute('data-quantity');
    addToCartAPI([{ sku, quantity }], button);
  });
*/
  let items = [];
  buttons.forEach(button => {
    let element = {}; 
    element.sku =button.getAttribute('data-sku'); 
    element.quantity = button.getAttribute('data-quantity');
    items.push(element);
  });
  console.log("items ", items);
  const button = document.querySelector('#addAllToCart');
  addToCartAPI(items, button);
}

function addToCartAPI(items, button) { 
  const formData = {
    items: items.map(item => ({
      id: item.sku,
      quantity: item.quantity
    }))
  };
  console.log("formData ", formData);
  console.log("button", button);
  
  fetch(window.Shopify.routes.root + 'cart/add.js', { 
    method: 'POST', 
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(formData)
  }) 
    .then(response => {
      if (response.ok) {
        console.log("response ", response);
        return response.json();
      } else {
        return response.json().then(data => {
          throw new Error(data.description || 'Error adding items to cart');
          //button.textContent = 'Error adding items to cart';
        });
      }
    }) 
    .then(data => { 
      console.log('Items added:', data); 
      // Handle any additional logic after adding to cart 
      button.textContent = 'Added to Cart';
      button.disabled = true;
    }) 
    .catch((error) => { 
      console.error('Error:', error.message); 
      displayPopup(error.message);
    }); 
}

function displayPopup(message) {
  // Replace this code with your own popup implementation
  alert(message);
}