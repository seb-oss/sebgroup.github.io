const hamburgerMenu = document.getElementById('hamburger-wrapper')
hamburgerMenu.addEventListener("click", () => {
    document.getElementById('mobile-menu').classList.toggle("menu-open")
})