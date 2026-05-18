import { isAuthenticated, logout, getUser } from './services/authService.js';
import { getProducts } from './services/productService.js';

function initAuthNav() {
  const authLink = document.getElementById('authLink');
  if (!authLink) return;

  function updateAuthLink() {
    if (isAuthenticated()) {
      const user = getUser();
      authLink.textContent = user?.fullname ? `Logout (${user.fullname.split(' ')[0]})` : 'Logout';
      authLink.href = '#';
      authLink.addEventListener('click', handleLogout);
    } else {
      authLink.textContent = 'Login';
      authLink.href = 'index.html';
    }
  }

  function handleLogout(event) {
    event.preventDefault();
    logout();
    globalThis.location.assign('index.html');
  }

  updateAuthLink();
}

function initSearchSuggestions() {
  const searchBar = document.querySelector('.search-bar');
  const searchInput = document.querySelector('.search-bar input');
  if (!searchBar || !searchInput) return;

  // Create suggestions container
  const suggestionsContainer = document.createElement('div');
  suggestionsContainer.className = 'search-suggestions';
  searchBar.appendChild(suggestionsContainer);

  let debounceTimer = null;

  searchInput.addEventListener('input', (e) => {
    const query = e.target.value.trim();
    clearTimeout(debounceTimer);

    if (!query) {
      suggestionsContainer.innerHTML = '';
      suggestionsContainer.classList.remove('active');
      return;
    }

    debounceTimer = setTimeout(async () => {
      try {
        const response = await getProducts({ search: query, limit: 5 });
        const items = response.products || [];
        
        if (items.length === 0) {
          suggestionsContainer.innerHTML = `
            <div style="padding: 14px; text-align: center; color: #94a3b8; font-size: 13px;">
              No matches found
            </div>
          `;
          suggestionsContainer.classList.add('active');
          return;
        }

        renderSuggestions(items, query);
      } catch (err) {
        console.error('Suggestions error:', err);
      }
    }, 250);
  });

  function renderSuggestions(items, query) {
    suggestionsContainer.innerHTML = '';
    
    items.forEach(item => {
      const el = document.createElement('div');
      el.className = 'suggestion-item';
      
      const regex = new RegExp(`(${escapeRegExp(query)})`, 'gi');
      const highlightedName = item.name.replace(regex, '<mark>$1</mark>');

      const fallbackImage = 'https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?w=600&auto=format&fit=crop&q=80';

      el.innerHTML = `
        <img src="${item.image || fallbackImage}" onerror="this.src='${fallbackImage}'" class="suggestion-img" alt="${item.name}">
        <div class="suggestion-info">
          <span class="suggestion-name">${highlightedName}</span>
          <span class="suggestion-category">${item.category}</span>
        </div>
      `;

      el.addEventListener('mousedown', (e) => {
        // Prevent trigger of blur before click action completes
        e.preventDefault();
        globalThis.location.assign(`product.html?id=${item._id || item.id}`);
      });

      suggestionsContainer.appendChild(el);
    });

    suggestionsContainer.classList.add('active');
  }

  // Handle Form Submit
  const form = searchBar.tagName === 'FORM' ? searchBar : searchBar.closest('form');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const query = searchInput.value.trim();
      if (query) {
        globalThis.location.assign(`search.html?q=${encodeURIComponent(query)}`);
      }
    });
  }

  // Hide suggestions on click outside
  document.addEventListener('click', (e) => {
    if (!searchBar.contains(e.target)) {
      suggestionsContainer.classList.remove('active');
    }
  });

  searchInput.addEventListener('focus', () => {
    if (suggestionsContainer.children.length > 0) {
      suggestionsContainer.classList.add('active');
    }
  });
}

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

initAuthNav();
initSearchSuggestions();
