// Optional JavaScript for your portfolio
// Currently minimal to keep site fast

// Smooth fade-in animation for content
window.addEventListener("load", () => {
  document.querySelectorAll('.content, .sidebar').forEach((el) => {
    el.style.opacity = 0;
    el.style.transition = "opacity 0.8s ease";
    setTimeout(() => {
      el.style.opacity = 1;
    }, 200);
  });
});