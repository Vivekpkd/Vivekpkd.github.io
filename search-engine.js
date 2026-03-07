/**
 * Optimized Search Engine for Autodevv
 * Loads search index from JSON file for faster lookups
 */

class SearchEngine {
  constructor() {
    this.searchIndex = null;
    this.isLoaded = false;
    this.loadSearchIndex();
  }

  /**
   * Load search index from JSON file
   */
  loadSearchIndex() {
    if (this.isLoaded) return;

    fetch('search-index.json')
      .then(response => response.json())
      .then(data => {
        this.searchIndex = data.articles;
        this.isLoaded = true;
        document.dispatchEvent(new CustomEvent('searchIndexLoaded'));
        console.log('Search index loaded:', this.searchIndex.length, 'articles');
      })
      .catch(error => {
        console.error('Failed to load search index:', error);
        // Fallback to articlesData if available
      });
  }

  /**
   * Wait for search index to be loaded
   */
  async waitForIndex() {
    if (this.isLoaded) return this.searchIndex;

    return new Promise((resolve) => {
      const checkInterval = setInterval(() => {
        if (this.isLoaded) {
          clearInterval(checkInterval);
          resolve(this.searchIndex);
        }
      }, 50);

      // Timeout after 5 seconds, fallback to articlesData
      setTimeout(() => {
        clearInterval(checkInterval);
        if (!this.isLoaded && typeof articlesData !== 'undefined') {
          this.searchIndex = articlesData;
          resolve(this.searchIndex);
        }
      }, 5000);
    });
  }

  /**
   * Search using multiple criteria
   * Supports: title, excerpt, tags, keywords, category
   */
  async search(term, options = {}) {
    const index = await this.waitForIndex();
    if (!index || index.length === 0) return [];

    const normalizedTerm = term.toLowerCase().trim();
    if (normalizedTerm.length < 2) return [];

    const results = index.filter(article => {
      const titleMatch = article.title.toLowerCase().includes(normalizedTerm);
      const excerptMatch = article.excerpt.toLowerCase().includes(normalizedTerm);
      const tagMatch = article.tags && article.tags.some(tag => 
        tag.toLowerCase().includes(normalizedTerm)
      );
      const keywordMatch = article.keywords && article.keywords.some(kw => 
        kw.toLowerCase().includes(normalizedTerm)
      );
      const categoryMatch = article.category.toLowerCase().includes(normalizedTerm);

      return titleMatch || excerptMatch || tagMatch || keywordMatch || categoryMatch;
    });

    // Apply filters if provided
    if (options.category && options.category !== 'all') {
      return results.filter(a => a.category === options.category);
    }

    if (options.tag && options.tag !== 'all') {
      return results.filter(a => a.tags.includes(options.tag));
    }

    if (options.year && options.year !== 'all') {
      return results.filter(a => a.year === parseInt(options.year));
    }

    return results;
  }

  /**
   * Advanced search with scoring
   */
  async advancedSearch(term) {
    const index = await this.waitForIndex();
    if (!index || index.length === 0) return [];

    const normalizedTerm = term.toLowerCase().trim();
    if (normalizedTerm.length < 2) return [];

    const results = index.map(article => {
      let score = 0;

      // Title match (highest priority)
      if (article.title.toLowerCase().includes(normalizedTerm)) {
        score += 10;
      }
      if (article.title.toLowerCase().startsWith(normalizedTerm)) {
        score += 5;
      }

      // Keyword match
      if (article.keywords && article.keywords.some(kw => kw.toLowerCase().includes(normalizedTerm))) {
        score += 8;
      }

      // Tag match
      if (article.tags && article.tags.some(tag => tag.toLowerCase().includes(normalizedTerm))) {
        score += 6;
      }

      // Excerpt match
      if (article.excerpt.toLowerCase().includes(normalizedTerm)) {
        score += 4;
      }

      // Category match
      if (article.category.toLowerCase().includes(normalizedTerm)) {
        score += 3;
      }

      return { ...article, score };
    }).filter(a => a.score > 0)
      .sort((a, b) => b.score - a.score);

    return results;
  }

  /**
   * Get articles by category
   */
  async getByCategory(category) {
    const index = await this.waitForIndex();
    return index.filter(a => a.category === category);
  }

  /**
   * Get articles by tag
   */
  async getByTag(tag) {
    const index = await this.waitForIndex();
    return index.filter(a => a.tags && a.tags.includes(tag));
  }

  /**
   * Get all unique tags
   */
  async getAllTags() {
    const index = await this.waitForIndex();
    const tags = new Set();
    index.forEach(a => {
      if (a.tags) {
        a.tags.forEach(tag => tags.add(tag));
      }
    });
    return Array.from(tags).sort();
  }

  /**
   * Get all unique categories
   */
  async getAllCategories() {
    const index = await this.waitForIndex();
    const categories = new Set();
    index.forEach(a => categories.add(a.category));
    return Array.from(categories).sort();
  }

  /**
   * Get articles by year
   */
  async getByYear(year) {
    const index = await this.waitForIndex();
    return index.filter(a => a.year === parseInt(year));
  }

  /**
   * Get all available years
   */
  async getAllYears() {
    const index = await this.waitForIndex();
    const years = new Set();
    index.forEach(a => years.add(a.year));
    return Array.from(years).sort((a, b) => b - a);
  }

  /**
   * Get random articles (for suggestions)
   */
  async getRandom(count = 3) {
    const index = await this.waitForIndex();
    const shuffled = [...index].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  }

  /**
   * Get similar articles based on tags
   */
  async getSimilar(articleId, count = 3) {
    const index = await this.waitForIndex();
    const article = index.find(a => a.id === articleId);
    if (!article || !article.tags) return [];

    const similar = index
      .filter(a => a.id !== articleId)
      .map(a => {
        let score = 0;
        const commonTags = a.tags ? a.tags.filter(tag => article.tags.includes(tag)).length : 0;
        score += commonTags * 2;
        if (a.category === article.category) score += 1;
        return { ...a, score };
      })
      .filter(a => a.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, count);

    return similar;
  }

  /**
   * Get total article count
   */
  async getCount() {
    const index = await this.waitForIndex();
    return index ? index.length : 0;
  }

  /**
   * Get all articles
   */
  async getAll() {
    return this.waitForIndex();
  }
}

// Create global instance
const searchEngine = new SearchEngine();
