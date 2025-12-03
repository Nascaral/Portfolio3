
const JSONBIN_BIN_ID = '692f9634d0ea881f400efcb6';
const JSONBIN_API_KEY = '$2a$10$LGoegXX/Glw4PQHPmcIz9eN7oF3CSziyLOcHW/ibfE5ZLWinlTGzG';
const LOCAL_STORAGE_KEY = 'portfolio_projects';


let form;
let projectIdInput;
let projectTitleInput;
let projectImageInput;
let projectImageAltInput;
let projectDescriptionInput;
let projectLinkInput;
let projectDateInput;
let projectTagsInput;
let btnCreate;
let btnUpdate;
let btnDelete;
let btnRefresh;
let crudStatus;
let projectsList;
let storageRadios;


document.addEventListener('DOMContentLoaded', function() {
  // Get DOM elements
  form = document.getElementById('project-form');
  projectIdInput = document.getElementById('project-id');
  projectTitleInput = document.getElementById('project-title');
  projectImageInput = document.getElementById('project-image');
  projectImageAltInput = document.getElementById('project-image-alt');
  projectDescriptionInput = document.getElementById('project-description');
  projectLinkInput = document.getElementById('project-link');
  projectDateInput = document.getElementById('project-date');
  projectTagsInput = document.getElementById('project-tags');
  btnCreate = document.getElementById('btn-create');
  btnUpdate = document.getElementById('btn-update');
  btnDelete = document.getElementById('btn-delete');
  btnRefresh = document.getElementById('btn-refresh');
  crudStatus = document.getElementById('crud-status');
  projectsList = document.getElementById('projects-list');
  storageRadios = document.querySelectorAll('input[name="storage"]');

  // Event Listeners
  if (btnCreate) btnCreate.addEventListener('click', handleCreate);
  if (btnUpdate) btnUpdate.addEventListener('click', handleUpdate);
  if (btnDelete) btnDelete.addEventListener('click', handleDelete);
  if (btnRefresh) btnRefresh.addEventListener('click', refreshProjectsList);
  
  storageRadios.forEach(function(radio) {
    radio.addEventListener('change', refreshProjectsList);
  });

  // Initialize
  initializeStorage();
});


async function initializeStorage() {
  const existingData = localStorage.getItem(LOCAL_STORAGE_KEY);
  
  if (!existingData) {
    try {
      const response = await fetch('data/projects.json');
      const defaultProjects = await response.json();
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(defaultProjects));
    } catch (error) {
      console.error('Failed to initialize localStorage:', error);
    }
  }
  
  refreshProjectsList();
}


function getSelectedStorage() {
  const selected = document.querySelector('input[name="storage"]:checked');
  return selected ? selected.value : 'local';
}

function showStatus(message, type) {
  if (!crudStatus) return;
  
  type = type || 'info';
  crudStatus.textContent = message;
  crudStatus.className = 'crud-status crud-status--' + type;
  crudStatus.style.display = 'block';
  
  if (type === 'success') {
    setTimeout(function() {
      crudStatus.style.display = 'none';
    }, 5000);
  }
}

function getFormData() {
  return {
    id: projectIdInput && projectIdInput.value ? parseInt(projectIdInput.value) : null,
    title: projectTitleInput ? projectTitleInput.value.trim() : '',
    image: projectImageInput ? projectImageInput.value.trim() : '',
    imageAlt: projectImageAltInput ? projectImageAltInput.value.trim() : '',
    description: projectDescriptionInput ? projectDescriptionInput.value.trim() : '',
    link: projectLinkInput ? projectLinkInput.value.trim() || '#' : '#',
    date: projectDateInput ? projectDateInput.value.trim() : '',
    tags: projectTagsInput ? projectTagsInput.value.trim() : ''
  };
}

function populateForm(project) {
  if (projectIdInput) projectIdInput.value = project.id || '';
  if (projectTitleInput) projectTitleInput.value = project.title || '';
  if (projectImageInput) projectImageInput.value = project.image || '';
  if (projectImageAltInput) projectImageAltInput.value = project.imageAlt || '';
  if (projectDescriptionInput) projectDescriptionInput.value = project.description || '';
  if (projectLinkInput) projectLinkInput.value = project.link || '';
  if (projectDateInput) projectDateInput.value = project.date || '';
  if (projectTagsInput) projectTagsInput.value = Array.isArray(project.tags) ? project.tags.join(', ') : (project.tags || '');
}

function clearForm() {
  if (form) form.reset();
}


function getLocalProjects() {
  const data = localStorage.getItem(LOCAL_STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}

function saveLocalProjects(projects) {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(projects));
}

function createLocalProject(projectData) {
  const projects = getLocalProjects();
  
  const maxId = projects.reduce(function(max, p) {
    return Math.max(max, p.id || 0);
  }, 0);
  projectData.id = maxId + 1;
  
  if (typeof projectData.tags === 'string') {
    projectData.tags = projectData.tags.split(',').map(function(t) {
      return t.trim();
    }).filter(function(t) {
      return t;
    });
  }
  
  projects.push(projectData);
  saveLocalProjects(projects);
  
  return projectData;
}

function updateLocalProject(projectData) {
  const projects = getLocalProjects();
  const index = projects.findIndex(function(p) {
    return p.id === projectData.id;
  });
  
  if (index === -1) {
    throw new Error('Project with ID ' + projectData.id + ' not found');
  }
  
  if (typeof projectData.tags === 'string') {
    projectData.tags = projectData.tags.split(',').map(function(t) {
      return t.trim();
    }).filter(function(t) {
      return t;
    });
  }
  
  projects[index] = Object.assign({}, projects[index], projectData);
  saveLocalProjects(projects);
  
  return projects[index];
}

function deleteLocalProject(id) {
  const projects = getLocalProjects();
  const index = projects.findIndex(function(p) {
    return p.id === id;
  });
  
  if (index === -1) {
    throw new Error('Project with ID ' + id + ' not found');
  }
  
  const deleted = projects.splice(index, 1)[0];
  saveLocalProjects(projects);
  
  return deleted;
}


async function getRemoteProjects() {
  const response = await fetch('https://api.jsonbin.io/v3/b/' + JSONBIN_BIN_ID + '/latest', {
    headers: {
      'X-Master-Key': JSONBIN_API_KEY
    }
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch: ' + response.status);
  }
  
  const data = await response.json();
  return data.record || [];
}

async function saveRemoteProjects(projects) {
  const response = await fetch('https://api.jsonbin.io/v3/b/' + JSONBIN_BIN_ID, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'X-Master-Key': JSONBIN_API_KEY
    },
    body: JSON.stringify(projects)
  });
  
  if (!response.ok) {
    throw new Error('Failed to save: ' + response.status);
  }
  
  return await response.json();
}

async function createRemoteProject(projectData) {
  const projects = await getRemoteProjects();
  
  const maxId = projects.reduce(function(max, p) {
    return Math.max(max, p.id || 0);
  }, 0);
  projectData.id = maxId + 1;
  
  if (typeof projectData.tags === 'string') {
    projectData.tags = projectData.tags.split(',').map(function(t) {
      return t.trim();
    }).filter(function(t) {
      return t;
    });
  }
  
  projects.push(projectData);
  await saveRemoteProjects(projects);
  
  return projectData;
}

async function updateRemoteProject(projectData) {
  const projects = await getRemoteProjects();
  const index = projects.findIndex(function(p) {
    return p.id === projectData.id;
  });
  
  if (index === -1) {
    throw new Error('Project with ID ' + projectData.id + ' not found');
  }
  
  if (typeof projectData.tags === 'string') {
    projectData.tags = projectData.tags.split(',').map(function(t) {
      return t.trim();
    }).filter(function(t) {
      return t;
    });
  }
  
  projects[index] = Object.assign({}, projects[index], projectData);
  await saveRemoteProjects(projects);
  
  return projects[index];
}

async function deleteRemoteProject(id) {
  const projects = await getRemoteProjects();
  const index = projects.findIndex(function(p) {
    return p.id === id;
  });
  
  if (index === -1) {
    throw new Error('Project with ID ' + id + ' not found');
  }
  
  const deleted = projects.splice(index, 1)[0];
  await saveRemoteProjects(projects);
  
  return deleted;
}

async function refreshProjectsList() {
  if (!projectsList) return;
  
  const storage = getSelectedStorage();
  projectsList.innerHTML = '<p class="loading">Loading projects...</p>';
  
  try {
    let projects;
    
    if (storage === 'local') {
      projects = getLocalProjects();
    } else {
      projects = await getRemoteProjects();
    }
    
    if (!projects || projects.length === 0) {
      projectsList.innerHTML = '<p class="empty">No projects found. Create one above!</p>';
      return;
    }
    
    let html = '';
    projects.forEach(function(project) {
      const tagsHtml = Array.isArray(project.tags) 
        ? project.tags.map(function(t) { return '<span class="tag">' + t + '</span>'; }).join('') 
        : '';
      
      html += '<div class="project-item" data-id="' + project.id + '">' +
        '<div class="project-item__info">' +
          '<strong class="project-item__title">' + project.title + '</strong>' +
          '<span class="project-item__id">ID: ' + project.id + '</span>' +
        '</div>' +
        '<p class="project-item__description">' + (project.description ? project.description.substring(0, 100) + '...' : 'No description') + '</p>' +
        '<div class="project-item__tags">' + tagsHtml + '</div>' +
      '</div>';
    });
    
    projectsList.innerHTML = html;
    
    // Add click handlers using event delegation
    const items = projectsList.querySelectorAll('.project-item');
    items.forEach(function(item) {
      item.addEventListener('click', function() {
        const id = parseInt(item.dataset.id);
        const project = projects.find(function(p) { return p.id === id; });
        if (project) {
          populateForm(project);
          showStatus('Project "' + project.title + '" loaded into form', 'info');
        }
      });
    });
    
  } catch (error) {
    projectsList.innerHTML = '<p class="error">Error loading projects: ' + error.message + '</p>';
  }
}

async function handleCreate() {
  const data = getFormData();
  
  if (!data.title || !data.description) {
    showStatus('Title and Description are required', 'error');
    return;
  }
  
  delete data.id;
  
  const storage = getSelectedStorage();
  showStatus('Creating project...', 'loading');
  
  try {
    let result;
    
    if (storage === 'local') {
      result = createLocalProject(data);
    } else {
      result = await createRemoteProject(data);
    }
    
    showStatus('Project "' + result.title + '" created successfully! (ID: ' + result.id + ')', 'success');
    clearForm();
    refreshProjectsList();
    
  } catch (error) {
    showStatus('Error creating project: ' + error.message, 'error');
  }
}

async function handleUpdate() {
  const data = getFormData();
  
  if (!data.id) {
    showStatus('Please enter a Project ID to update', 'error');
    return;
  }
  
  if (!data.title || !data.description) {
    showStatus('Title and Description are required', 'error');
    return;
  }
  
  const storage = getSelectedStorage();
  showStatus('Updating project...', 'loading');
  
  try {
    let result;
    
    if (storage === 'local') {
      result = updateLocalProject(data);
    } else {
      result = await updateRemoteProject(data);
    }
    
    showStatus('Project "' + result.title + '" updated successfully!', 'success');
    refreshProjectsList();
    
  } catch (error) {
    showStatus('Error updating project: ' + error.message, 'error');
  }
}

async function handleDelete() {
  const data = getFormData();
  
  if (!data.id) {
    showStatus('Please enter a Project ID to delete', 'error');
    return;
  }
  
  if (!confirm('Are you sure you want to delete project ID ' + data.id + '?')) {
    return;
  }
  
  const storage = getSelectedStorage();
  showStatus('Deleting project...', 'loading');
  
  try {
    let result;
    
    if (storage === 'local') {
      result = deleteLocalProject(data.id);
    } else {
      result = await deleteRemoteProject(data.id);
    }
    
    showStatus('Project "' + result.title + '" deleted successfully!', 'success');
    clearForm();
    refreshProjectsList();
    
  } catch (error) {
    showStatus('Error deleting project: ' + error.message, 'error');
  }
}