document.addEventListener('DOMContentLoaded', function() {
    const allButtons = document.querySelectorAll('.searchBtn');
    const searchbar = document.querySelector('.searchBar');
    const searchInput = document.getElementById('searchInput');
    const searchCloseBtn = document.getElementById('searchClose');

    for (let i = 0; i < allButtons.length; i++) {
        allButtons[i].addEventListener('click', function () {
            searchbar.style.visibility = 'visible';
            searchbar.classList.add('open');
            this.setAttribute('aria-expanded', 'true');
            searchInput.focus();
        })
    }

    searchCloseBtn.addEventListener('click', function () {
        searchbar.style.visibility = 'hidden';
        searchbar.classList.remove('open');
        this.setAttribute('aria-expanded', 'false');
    })
});