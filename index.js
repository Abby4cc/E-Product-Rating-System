document.addEventListener("DOMContentLoaded", () => {
    showSection("home"); 
    setupEventListeners();
});

function showSection(sectionId) {
    document.querySelectorAll(".section").forEach(section => {
        section.style.display = "none";
    });
    document.getElementById(sectionId).style.display = "block";
}

function setupEventListeners() {
    document.getElementById("view-products-btn").addEventListener("click", handleViewProducts);
    document.getElementById("search").addEventListener("input", handleSearch);
    document.querySelector(".close").addEventListener("click", closeModal);
    document.getElementById("submit-review-btn").addEventListener("click", submitReview);
}

function handleViewProducts() {
    showSection("products");
    fetchProducts();
}

function handleSearch(event) {
    const searchTerm = event.target.value.trim().toLowerCase();
    filterProducts(searchTerm);
}

function closeModal() {
    document.getElementById("review-modal").style.display = "none";
}

function fetchProducts() {
    fetch("http://localhost:3000/products")
        .then(response => response.json())
        .then(products => displayProducts(products))
        .catch(error => console.error("Error fetching products:", error));
}

function displayProducts(products) {
    const container = document.getElementById("products-container");
    container.innerHTML = ""; 

    products.forEach(product => {
        const productDiv = document.createElement("div");
        productDiv.classList.add("product");
        productDiv.dataset.id = product.id;
        productDiv.innerHTML = `
            <img src="${product.image}" alt="${product.title}">
            <h3>${product.title}</h3>
            <p>Price: $${product.price.toFixed(2)}</p>
            <p>${product.rating} ⭐ (${product.reviews.length} reviews)</p>
            <button class="rate-product-btn">Rate Product</button>
        `;
        container.appendChild(productDiv);
    });

    document.querySelectorAll(".rate-product-btn").forEach(button => {
        button.addEventListener("click", handleRateProduct);
    });

    document.querySelectorAll(".product img").forEach(img => {
        img.addEventListener("mouseover", handleHoverEffect);
        img.addEventListener("mouseout", removeHoverEffect);
    });
}

function handleRateProduct(event) {
    const productDiv = event.target.closest(".product");
    const productName = productDiv.querySelector("h3").textContent;
    openRatingModal(productName);
}

function handleHoverEffect(event) {
    event.target.style.transform = "scale(1.1)";
    event.target.style.transition = "transform 0.3s ease";
}

function removeHoverEffect(event) {
    event.target.style.transform = "scale(1)";
}

function filterProducts(searchTerm) {
    document.querySelectorAll(".product").forEach(product => {
        const title = product.querySelector("h3").textContent.toLowerCase();
        product.style.display = title.includes(searchTerm) ? "block" : "none";
    });
}

function openRatingModal(productName) {
    document.getElementById("reviewer-name").value = "";
    document.getElementById("review-text").value = "";
    document.getElementById("review-modal").style.display = "block";
    document.getElementById("review-modal").dataset.productName = productName;
    highlightStars(0);
}

function highlightStars(value) {
    document.querySelectorAll(".star").forEach(star => {
        star.style.color = star.dataset.value <= value ? "gold" : "#ccc";
        star.classList.toggle("active", star.dataset.value <= value);
    });
    document.getElementById("review-modal").dataset.rating = value;
}

function submitReview() {
    const reviewerName = document.getElementById("reviewer-name").value.trim();
    const reviewText = document.getElementById("review-text").value.trim();
    const ratingValue = parseInt(document.getElementById("review-modal").dataset.rating);
    const productName = document.getElementById("review-modal").dataset.productName;

    if (!reviewerName || !reviewText || ratingValue === 0) {
        alert("Please complete all fields.");
        return;
    }

    fetch("http://localhost:3000/products")
        .then(response => response.json())
        .then(products => {
            const product = products.find(p => p.title === productName);
            if (!product) {
                alert("Product not found!");
                return;
            }

            const newReview = { name: reviewerName, text: reviewText, rating: ratingValue };
            product.reviews.push(newReview);

            let totalRatings = product.reviews.reduce((sum, review) => sum + review.rating, 0);
            product.rating = (totalRatings / product.reviews.length).toFixed(1);

            return fetch(`http://localhost:3000/products/${product.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ rating: product.rating, reviews: product.reviews })
            }).then(() => {
                alert("Review submitted successfully!");
                document.getElementById("review-modal").style.display = "none";
                updateReviewSection();
            });
        })
        .catch(error => console.error("Error submitting review:", error));
}