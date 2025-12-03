
class ProjectCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  static get observedAttributes() {
    return ['title', 'image', 'image-alt', 'description', 'link', 'date', 'tags'];
  }

  get title() {
    return this.getAttribute('title') || 'Untitled Project';
  }
  set title(val) {
    this.setAttribute('title', val);
  }

  get image() {
    return this.getAttribute('image') || '';
  }
  set image(val) {
    this.setAttribute('image', val);
  }

  get imageAlt() {
    return this.getAttribute('image-alt') || 'Project image';
  }
  set imageAlt(val) {
    this.setAttribute('image-alt', val);
  }

  get description() {
    return this.getAttribute('description') || '';
  }
  set description(val) {
    this.setAttribute('description', val);
  }

  get link() {
    return this.getAttribute('link') || '#';
  }
  set link(val) {
    this.setAttribute('link', val);
  }

  get date() {
    return this.getAttribute('date') || '';
  }
  set date(val) {
    this.setAttribute('date', val);
  }

  get tags() {
    return this.getAttribute('tags') || '';
  }
  set tags(val) {
    this.setAttribute('tags', val);
  }

  connectedCallback() {
    this.render();
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue !== newValue) {
      this.render();
    }
  }

  render() {
    const tagsArray = this.tags ? this.tags.split(',').map(t => t.trim()) : [];
    
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          --card-bg: var(--surface, #151938);
          --card-border: var(--border, rgba(167, 139, 250, 0.15));
          --card-radius: var(--radius, 1.25rem);
          --card-padding: var(--spacing-lg, 1.5rem);
          --text-primary: var(--ink, #e7ebf1);
          --text-secondary: var(--muted, #a0a8c5);
          --accent-primary: var(--accent-purple, #a78bfa);
          --accent-secondary: var(--accent-cyan, #22d3ee);
          --transition-speed: 0.35s;
        }

        .card {
          background: var(--card-bg);
          border: 1px solid var(--card-border);
          border-radius: var(--card-radius);
          overflow: hidden;
          transition: all var(--transition-speed) ease;
          height: 100%;
          display: flex;
          flex-direction: column;
        }

        .card:hover {
          transform: translateY(-8px);
          border-color: var(--accent-primary);
          box-shadow: 0 20px 40px rgba(167, 139, 250, 0.2);
        }

        .card__image-container {
          position: relative;
          overflow: hidden;
          aspect-ratio: 16 / 9;
        }

        .card__image-container picture {
          display: block;
          width: 100%;
          height: 100%;
        }

        .card__image-container img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform var(--transition-speed) ease;
        }

        .card:hover .card__image-container img {
          transform: scale(1.05);
        }

        .card__content {
          padding: var(--card-padding);
          display: flex;
          flex-direction: column;
          flex-grow: 1;
          gap: 0.75rem;
        }

        .card__header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 1rem;
        }

        .card__title {
          margin: 0;
          font-size: 1.35rem;
          font-weight: 800;
          background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          line-height: 1.3;
        }

        .card__date {
          font-size: 0.75rem;
          color: var(--text-secondary);
          white-space: nowrap;
          padding: 0.25rem 0.5rem;
          background: rgba(167, 139, 250, 0.1);
          border-radius: 0.5rem;
        }

        .card__description {
          color: var(--text-secondary);
          font-size: 0.95rem;
          line-height: 1.7;
          margin: 0;
          flex-grow: 1;
        }

        .card__tags {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          margin-top: 0.5rem;
        }

        .card__tag {
          font-size: 0.75rem;
          padding: 0.25rem 0.75rem;
          background: linear-gradient(135deg, rgba(167, 139, 250, 0.15), rgba(34, 211, 238, 0.15));
          border: 1px solid rgba(167, 139, 250, 0.3);
          border-radius: 1rem;
          color: var(--accent-primary);
          font-weight: 600;
        }

        .card__link {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          margin-top: auto;
          padding-top: 1rem;
          color: var(--accent-primary);
          text-decoration: none;
          font-weight: 700;
          font-size: 0.95rem;
          transition: all 0.2s ease;
        }

        .card__link:hover {
          color: var(--accent-secondary);
        }

        .card__link::after {
          content: '→';
          transition: transform 0.2s ease;
        }

        .card__link:hover::after {
          transform: translateX(4px);
        }

        .card__placeholder {
          width: 100%;
          height: 100%;
          background: linear-gradient(135deg, rgba(167, 139, 250, 0.2), rgba(34, 211, 238, 0.2));
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 3rem;
          color: var(--accent-primary);
        }

        @media (max-width: 480px) {
          .card__content {
            padding: 1rem;
          }
          .card__title {
            font-size: 1.15rem;
          }
        }
      </style>

      <article class="card">
        <div class="card__image-container">
          ${this.image ? `
            <picture>
              <source srcset="${this.image}" type="image/webp">
              <source srcset="${this.image}" type="image/png">
              <img src="${this.image}" alt="${this.imageAlt}" loading="lazy">
            </picture>
          ` : `
            <div class="card__placeholder">📁</div>
          `}
        </div>
        <div class="card__content">
          <header class="card__header">
            <h2 class="card__title">${this.title}</h2>
            ${this.date ? `<span class="card__date">${this.date}</span>` : ''}
          </header>
          <p class="card__description">${this.description}</p>
          ${tagsArray.length > 0 ? `
            <div class="card__tags">
              ${tagsArray.map(tag => `<span class="card__tag">${tag}</span>`).join('')}
            </div>
          ` : ''}
          <a href="${this.link}" class="card__link" target="_blank" rel="noopener noreferrer">
            Learn more
          </a>
        </div>
      </article>
    `;
  }
}

customElements.define('project-card', ProjectCard);

export default ProjectCard;