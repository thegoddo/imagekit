document.addEventListener("DOMContentLoaded", () => {
  const searchInput = document.getElementById("toolSearch");
  const toolCards = document.querySelectorAll(".tool-card");

  searchInput.addEventListener("input", (e) => {
    const searchTerm = e.target.value.toLowerCase().trim();

    toolCards.forEach((card) => {
      const text = card.innerText.toLowerCase();
      const tags = card.getAttribute("data-tags") || "";

      if (text.includes(searchTerm) || tags.includes(searchTerm)) {
        card.classList.remove("hidden");
      } else {
        card.classList.add("hidden");
      }
    });
  });
});
