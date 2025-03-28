document.addEventListener("DOMContentLoaded", () => {
    showSection("home");
    setupEventListeners();
    fetchProducts();
});

function showSection(sectionId) {
    document.querySelectorAll(".section").forEach(section => {
        section.style.display = "none";
    });
    document.getElementById(sectionId).style.display = "block";
}

function setupEventListeners() {
    const viewProductsBtn = document.getElementById("view-products-btn");
    const searchInput = document.getElementById("search");
    const closeModalBtn = document.querySelector(".close");
    const submitReviewBtn = document.getElementById("submit-review-btn");

    if (viewProductsBtn) viewProductsBtn.addEventListener("click", handleViewProducts);
    if (searchInput) searchInput.addEventListener("input", handleSearch);
    if (closeModalBtn) closeModalBtn.addEventListener("click", closeModal);
    if (submitReviewBtn) submitReviewBtn.addEventListener("click", submitReview);
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
            <img src="assets/${product.image}" alt="${product.title}">
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
}

function handleRateProduct(event) {
    const productDiv = event.target.closest(".product");
    const productName = productDiv.querySelector("h3").textContent;
    openRatingModal(productName);
}

function filterProducts(searchTerm) {
    document.querySelectorAll(".product").forEach(product => {
        const title = product.querySelector("h3").textContent.toLowerCase();
        product.style.display = title.includes(searchTerm) ? "block" : "none";
    });
}

function openRatingModal(productName) {
    const modal = document.getElementById("review-modal");
    if (modal) {
        document.getElementById("reviewer-name").value = "";
        document.getElementById("review-text").value = "";
        modal.style.display = "block";
        modal.dataset.productName = productName;
        highlightStars(0);
    }
}

function highlightStars(value) {
    document.querySelectorAll(".star").forEach(star => {
        star.style.color = star.dataset.value <= value ? "gold" : "#ccc";
        star.classList.toggle("active", star.dataset.value <= value);
    });
    document.getElementById("review-modal").dataset.rating = value;
}

document.querySelectorAll(".star").forEach(star => {
    star.addEventListener("click", event => {
        highlightStars(event.target.dataset.value);
    });
});

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
                updateReviewSection(product);
                updateRatingChart(products);
            });
        })
        .catch(error => console.error("Error submitting review:", error));
}

function updateReviewSection(product) {
    const reviewContainer = document.getElementById("customer-reviews");
    reviewContainer.innerHTML = "";
    product.reviews.forEach(review => {
        const reviewDiv = document.createElement("div");
        reviewDiv.innerHTML = `<p><strong>${review.name}:</strong> ${review.text} (${review.rating} ⭐)</p>`;
        reviewContainer.appendChild(reviewDiv);
    });
}

function updateRatingChart(products) {
    const ratingCounts = Array(5).fill(0);
    products.forEach(product => {
        product.reviews.forEach(review => {
            ratingCounts[review.rating - 1]++;
        });
    });

    console.log("Rating counts:", ratingCounts);

}
