document.addEventListener("DOMContentLoaded", function () {
    const sections = document.querySelectorAll(".section");
    const viewProductsBtn = document.getElementById("view-products-btn");
    const productsSection = document.getElementById("products");
    const homeSection = document.getElementById("home");
    const ratingSection = document.getElementById("ratings");
    const ratingForm = document.getElementById("rating-form");
    const productNameInput = document.getElementById("product-name");
    const stars = document.querySelectorAll(".star");
    const ratingInput = document.getElementById("rating");

    sections.forEach(section => section.style.display = "none");
    homeSection.style.display = "block";

    function showSection(sectionId) {
        sections.forEach(section => section.style.display = "none");
        document.getElementById(sectionId).style.display = "block";
    }

    viewProductsBtn.addEventListener("click", function () {
        showSection("products");
    });

    document.querySelectorAll(".product").forEach(product => {
        product.addEventListener("mouseover", () => {
            product.style.transform = "scale(1.1)";
        });
        product.addEventListener("mouseout", () => {
            product.style.transform = "scale(1)";
        });
    });

    document.querySelectorAll(".rate-product-btn").forEach(button => {
        button.addEventListener("click", function () {
            const productName = this.parentElement.querySelector("h3").innerText;
            productNameInput.value = productName;
            showSection("ratings");
        });
    });

    stars.forEach(star => {
        star.addEventListener("click", function () {
            let value = this.getAttribute("data-value");
            ratingInput.value = value;

            stars.forEach(s => s.classList.remove("active"));

            for (let i = 0; i < value; i++) {
                stars[i].classList.add("active");
            }
        });
    });

    ratingForm.addEventListener("submit", function (event) {
        event.preventDefault();
        alert("Rating submitted successfully!");
        showSection("products");
    });
});
