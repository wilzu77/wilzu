let cart = [];

function addToCart(name, price) {
  cart.push({ name, price });
  renderCart();
}

function renderCart() {
  const cartList = document.getElementById("cart");
  cartList.innerHTML = "";
  
  cart.forEach((item, index) => {
    let li = document.createElement("li");
    li.textContent = `${item.name} - Rp${item.price}`;
    
    let removeBtn = document.createElement("button");
    removeBtn.textContent = "🐲";
    removeBtn.style.marginLeft = "10px";
    removeBtn.onclick = () => removeFromCart(index);
    
    li.appendChild(removeBtn);
    cartList.appendChild(li);
  });
}

function removeFromCart(index) {
  cart.splice(index, 1);
  renderCart();
}
