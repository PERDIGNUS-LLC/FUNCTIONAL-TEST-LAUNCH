// This script fetches and injects the header and footer
document.addEventListener("DOMContentLoaded", function() {
    fetch("header.html")
        .then(response => response.text())
        .then(data => {
            const headerPlaceholder = document.getElementById("header-placeholder");
            if (headerPlaceholder) {
                headerPlaceholder.innerHTML = data;
            }
        });

    fetch("footer.html")
        .then(response => response.text())
        .then(data => {
            const footerPlaceholder = document.getElementById("footer-placeholder");
            if (footerPlaceholder) {
                footerPlaceholder.innerHTML = data;
            }
        });
});
