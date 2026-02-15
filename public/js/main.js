document.addEventListener("DOMContentLoaded", () => {
  const searchInput = document.getElementById("toolSearch");
  const toolCards = document.querySelectorAll(".tool-card");

  searchInput.addEventListener("input", (e) => {
    const searchTerm = e.target.value.toLowerCase().trim();

    toolCards.forEach((card) => {
      // Get the visible text and the hidden tags
      const text = card.innerText.toLowerCase();
      const tags = card.getAttribute("data-tags") || "";

      // Check if search term matches
      if (text.includes(searchTerm) || tags.includes(searchTerm)) {
        card.classList.remove("hidden");
      } else {
        card.classList.add("hidden");
      }
    });
  });
});
