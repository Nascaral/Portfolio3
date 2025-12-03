
const JSONBIN_BIN_ID = '692f9634d0ea881f400efcb6';
const JSONBIN_API_KEY = '$2a$10$LGoegXX/Glw4PQHPmcIz9eN7oF3CSziyLOcHW/ibfE5ZLWinlTGzG';


const REMOTE_SERVICE = 'jsonbin';

// Local Storage Key
const LOCAL_STORAGE_KEY = 'portfolio_projects';


let loadLocalBtn;
let loadRemoteBtn;
let clearCardsBtn;
let cardsContainer;
let dataStatus;


document.addEventListener('DOMContentLoaded', function() {
  loadLocalBtn = document.getElementById('load-local-btn');
  loadRemoteBtn = document.getElementById('load-remote-btn');
  clearCardsBtn = document.getElementById('clear-cards-btn');
  cardsContainer = document.getElementById('cards-container');
  dataStatus = document.getElementById('data-status');

  // Event Listeners
  if (loadLocalBtn) loadLocalBtn.addEventListener('click', loadFromLocalStorage);
  if (loadRemoteBtn) loadRemoteBtn.addEventListener('click', loadFromRemote);
  if (clearCardsBtn) clearCardsBtn.addEventListener('click', clearCards);

  // Event delegation for card interactions
  if (cardsContainer) {
    cardsContainer.addEventListener('click', function(e) {
      const card = e.target.closest('project-card');
      if (card) {
        console.log('Card clicked:', card.dataset.id);
      }
    });
  }

  // Initialize localStorage
  initializeLocalStorage();
});


async function initializeLocalStorage() {
  const existingData = localStorage.getItem(LOCAL_STORAGE_KEY);
  
  if (!existingData) {
    try {
      const response = await fetch('data/projects.json');
      const defaultProjects = await response.json();
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(defaultProjects));
      console.log('Initialized localStorage with default project data');
    } catch (error) {
      console.error('Failed to initialize localStorage:', error);
      const fallbackData = [
        {
          id: 1,
          title: "Sample Project",
          image: "",
          imageAlt: "Sample project image",
          description: "This is a sample project loaded from localStorage.",
          link: "#",
          date: "2024",
          tags: ["Sample", "Demo"]
        }
      ];
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(fallbackData));
    }
  }
}


function loadFromLocalStorage() {
  updateStatus('Loading from localStorage...', 'loading');
  
  try {
    const data = localStorage.getItem(LOCAL_STORAGE_KEY);
    
    if (!data) {
      updateStatus('No data found in localStorage. Initializing...', 'warning');
      initializeLocalStorage().then(function() {
        loadFromLocalStorage();
      });
      return;
    }
    
    const projects = JSON.parse(data);
    renderCards(projects);
    updateStatus('Loaded ' + projects.length + ' projects from localStorage', 'success');
    
  } catch (error) {
    console.error('Error loading from localStorage:', error);
    updateStatus('Error loading from localStorage: ' + error.message, 'error');
  }
}


async function loadFromRemote() {
  updateStatus('Loading from remote server...', 'loading');
  
  try {
    let url;
    let headers = {};
    
    if (REMOTE_SERVICE === 'jsonbin') {
      url = 'https://api.jsonbin.io/v3/b/' + JSONBIN_BIN_ID + '/latest';
      headers = {
        'X-Master-Key': JSONBIN_API_KEY,
        'X-Access-Key': JSONBIN_API_KEY
      };
    } else {
      url = MY_JSON_SERVER_URL;
    }
    
    const response = await fetch(url, { headers: headers });
    
    if (!response.ok) {
      throw new Error('HTTP error! status: ' + response.status);
    }
    
    let projects;
    const data = await response.json();
    
    if (REMOTE_SERVICE === 'jsonbin') {
      projects = data.record;
    } else {
      projects = data;
    }
    
    renderCards(projects);
    updateStatus('Loaded ' + projects.length + ' projects from remote server', 'success');
    
  } catch (error) {
    console.error('Error loading from remote:', error);
    updateStatus('Error loading from remote: ' + error.message, 'error');
  }
}


function renderCards(projects) {
  if (!cardsContainer) return;
  
  cardsContainer.innerHTML = '';
  
  if (!projects || projects.length === 0) {
    cardsContainer.innerHTML = '<p class="empty-state">No projects found.</p>';
    return;
  }
  
  projects.forEach(function(project, index) {
    const card = document.createElement('project-card');
    
    card.setAttribute('title', project.title || 'Untitled');
    card.setAttribute('image', project.image || '');
    card.setAttribute('image-alt', project.imageAlt || project.title || 'Project image');
    card.setAttribute('description', project.description || '');
    card.setAttribute('link', project.link || '#');
    card.setAttribute('date', project.date || '');
    card.setAttribute('tags', Array.isArray(project.tags) ? project.tags.join(', ') : (project.tags || ''));
    
    card.dataset.id = project.id || index;
    card.style.animationDelay = (index * 0.1) + 's';
    
    cardsContainer.appendChild(card);
  });
}


function clearCards() {
  if (!cardsContainer) return;
  cardsContainer.innerHTML = '<p class="empty-state" id="empty-state">Click "Load Local" or "Load Remote" to display project cards.</p>';
  updateStatus('Cards cleared', 'info');
}

function updateStatus(message, type) {
  if (!dataStatus) return;
  
  type = type || 'info';
  dataStatus.textContent = message;
  dataStatus.className = 'data-status data-status--' + type;
  
  if (type === 'success' || type === 'info') {
    setTimeout(function() {
      dataStatus.textContent = '';
      dataStatus.className = 'data-status';
    }, 5000);
  }
}