// Classic OOP principles applied

class PoetrySunsetApp {
    constructor() {
        this.poems = [];
        this.filteredPoems = [];
        this.currentSort = 'title-asc';
        this.currentCategory = 'all';
        this.searchQuery = '';
        
        this.init();
    }

    async init() {
        await this.loadPoems();
        this.setupEventListeners();
        this.loadUserPreferences();
        this.renderPoems();
        this.updateResultsCount();
    }

    async loadPoems() {
        try {
            const response = await fetch('DiscreteStructures1/DiscreteStructures2/contents.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            this.poems = await response.json();
            this.filteredPoems = [...this.poems];
        } 
        catch (error) {
            console.error('Error loading poems:', error);
            this.showError('Failed to load poems. Please try refreshing the page.');
        }
    }

    setupEventListeners() {
        // light or dark mode
        const themeToggle = document.getElementById('themeToggle');
        themeToggle.addEventListener('click', () => this.toggleTheme());

        // searching the poems
        const searchInput = document.getElementById('searchInput');
        const clearSearch = document.getElementById('clearSearch');
        
        searchInput.addEventListener('input', (e) => this.handleSearch(e.target.value));
        clearSearch.addEventListener('click', () => this.clearSearch());

        // sorting
        const sortSelect = document.getElementById('sortBy');
        const filterSelect = document.getElementById('filterCategory');
        
        sortSelect.addEventListener('change', (e) => this.handleSort(e.target.value));
        filterSelect.addEventListener('change', (e) => this.handleFilter(e.target.value));

        // modals
        const modalOverlay = document.getElementById('modalOverlay');
        const closeModal = document.getElementById('closeModal');
        const printPoem = document.getElementById('printPoem');
        
        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) this.closeModal();
        });
        closeModal.addEventListener('click', () => this.closeModal());
        printPoem.addEventListener('click', () => this.printCurrentPoem());

        // keyboard nav
        document.addEventListener('keydown', (e) => this.handleKeydown(e));
    }

    handleKeydown(e) {
        if (e.key === 'Escape') {
            this.closeModal();
        }
    }

    toggleTheme() {
        try {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('poetry-theme', newTheme);
        } 
        catch (error) {
            console.error('Error toggling theme:', error);
            // Attempt to continue with theme change even if storage fails
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            document.documentElement.setAttribute('data-theme', newTheme);
        }
    }

    loadUserPreferences() {
        try {
            const savedTheme = localStorage.getItem('poetry-theme');
            if (savedTheme) {
                document.documentElement.setAttribute('data-theme', savedTheme);
            } 
            else {
                // Default to light theme
                document.documentElement.setAttribute('data-theme', 'light');
            }
        } 
        catch (error) {
            console.error('Error loading theme preference:', error);
            // Default to light theme if there's an error
            document.documentElement.setAttribute('data-theme', 'light');
        }

        try {
            const savedSort = localStorage.getItem('poetry-sort');
            if (savedSort) {
                this.currentSort = savedSort;
                document.getElementById('sortBy').value = savedSort;
            }
        } 
        catch (error) {
            console.error('Error loading sort preference:', error);
            // Continue with default sort if there's an error
        }
    }

    handleSearch(query) {
        try {
            this.searchQuery = query ? query.toLowerCase().trim() : '';
            
            const clearButton = document.getElementById('clearSearch');
            if (clearButton) {
                clearButton.classList.toggle('visible', this.searchQuery.length > 0);
            } 
            else {
                console.warn('Clear search button not found in DOM');
            }
            
            this.applyFilters();
        } 
        catch (error) {
            console.error('Error in search functionality:', error);
            this.searchQuery = '';
            this.applyFilters();
        }
    }

    clearSearch() {
        try {
            const searchInput = document.getElementById('searchInput');
            if (!searchInput) {
                throw new Error('Search input element not found');
            }
            
            searchInput.value = '';
            this.searchQuery = '';
            
            const clearButton = document.getElementById('clearSearch');
            if (clearButton) {
                clearButton.classList.remove('visible');
            } 
            else {
                console.warn('Clear button element not found');
            }
            
            this.applyFilters();
            searchInput.focus();
        } 
        catch (error) {
            console.error('Error clearing search:', error);
            // reset even if an error happens
            this.searchQuery = '';
            this.applyFilters();
        }
    }

    handleSort(sortValue) {
        this.currentSort = sortValue;
        localStorage.setItem('poetry-sort', sortValue);
        this.applyFilters();
    }

    handleFilter(category) {
        this.currentCategory = category;
        this.applyFilters();
    }

    applyFilters() {
        let filtered = [...this.poems];

        // search filters
        if (this.searchQuery) {
            filtered = filtered.filter(poem => 
                poem.title.toLowerCase().includes(this.searchQuery) ||
                poem.author.toLowerCase().includes(this.searchQuery) ||
                poem.content.toLowerCase().includes(this.searchQuery) ||
                poem.category.toLowerCase().includes(this.searchQuery)
            );
        }

        // category filter
        if (this.currentCategory !== 'all') {
            filtered = filtered.filter(poem => poem.category === this.currentCategory);
        }

        // sortings
        try {
            filtered.sort((a, b) => {
                switch (this.currentSort) {
                    case 'title-asc':
                        return a.title.localeCompare(b.title);
                    case 'title-desc':
                        return b.title.localeCompare(a.title);
                    case 'author-asc':
                        return a.author.localeCompare(b.author);
                    case 'author-desc':
                        return b.author.localeCompare(a.author);
                    case 'category':
                        return a.category.localeCompare(b.category) || a.title.localeCompare(b.title);
                    default:
                        return 0;
                }
            });
        }
        catch (error) {
            console.error('Error sorting poems:', error);
            // Fallback to unsorted if sorting fails
            filtered = filtered || [];
        }

        this.filteredPoems = filtered;
        this.renderPoems();
        this.updateResultsCount();
    }
    // renders filtered poems into the grid
    renderPoems() {
        try {
            const poemsGrid = document.getElementById('poemsGrid');
            const noResults = document.getElementById('noResults');
            
            if (this.filteredPoems.length === 0) {
                poemsGrid.style.display = 'none';
                noResults.style.display = 'block';
                return;
            }
            
            poemsGrid.style.display = 'grid';
            noResults.style.display = 'none';
            
            poemsGrid.innerHTML = this.filteredPoems.map(poem => this.createPoemCard(poem)).join('');

            poemsGrid.querySelectorAll('.poem-card').forEach((card, index) => {
                try {
                    card.addEventListener('click', () => {
                        try {
                            this.openPoemModal(this.filteredPoems[index]);
                        } 
                        catch (error) {
                            console.error('Error opening poem modal:', error);
                        }
                    });
                    
                    card.addEventListener('keydown', (e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            try {
                                this.openPoemModal(this.filteredPoems[index]);
                            } 
                            catch (error) {
                                console.error('Error opening poem modal:', error);
                            }
                        }
                    });
                } 
                catch (error) {
                    console.error('Error setting up event listeners for poem card:', error);
                }
            });
        }
        catch (error) {
            console.error('Error rendering poems:', error);
            this.showError('Failed to display poems. Please try refreshing the page.');
        }
    }

    /**
     * Create HTML for a poem card
     */
    createPoemCard(poem) {
        const preview = this.getPreview(poem.content, 100);
        
        return `
            <article class="poem-card" tabindex="0" role="button" aria-label="Read ${poem.title} by ${poem.author}">
                <header class="poem-header">
                    <h3 class="poem-title">${this.escapeHtml(poem.title)}</h3>
                </header>
                <div class="poem-meta">
                    <span class="poem-author">by ${this.escapeHtml(poem.author)}</span>
                    <span class="poem-category">${this.escapeHtml(poem.category)}</span>
                </div>
                <div class="poem-preview">${this.escapeHtml(preview)}</div>
                <div class="read-more">
                    Read full poem <i class="fas fa-arrow-right"></i>
                </div>
            </article>
        `;
    }

    /**
     * Get a preview of the poem content
     */
    getPreview(content, maxLength = 100) {
        if (content.length <= maxLength) return content;
        
        const trimmed = content.substring(0, maxLength);
        const lastSpace = trimmed.lastIndexOf(' ');
        
        return lastSpace > 0 ? trimmed.substring(0, lastSpace) + '...' : trimmed + '...';
    }

    /**
     * Open poem in modal
     */
    openPoemModal(poem) {
        const modal = document.getElementById('modalOverlay');
        const title = document.getElementById('modalTitle');
        const author = document.getElementById('modalAuthor');
        const category = document.getElementById('modalCategory');
        const content = document.getElementById('modalContent');
        
        title.textContent = poem.title;
        author.textContent = `by ${poem.author}`;
        category.textContent = poem.category;
        content.textContent = poem.content;
        
        // Store current poem for printing
        this.currentPoem = poem;
        
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        // Focus on close button for accessibility
        setTimeout(() => {
            document.getElementById('closeModal').focus();
        }, 300);
    }

    // closes the modal when x is selected or when clicked outside the modal itself
    closeModal() {
        try {
            const modal = document.getElementById('modalOverlay');
            modal.classList.remove('active');
            document.body.style.overflow = '';
        } 
        catch (error) {
            console.error('Error closing modal:', error);
            //=reset poem even if an eror happens
            const modal = document.getElementById('modalOverlay');
            if (modal) modal.classList.remove('active');
            document.body.style.overflow = '';
        }
        finally {
            this.currentPoem = null;
        }
    }
    printCurrentPoem() {
        if (!this.currentPoem) return;
        
        const poem = this.currentPoem;
        
        // Create a new window for printing
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Print: ${this.escapeHtml(poem.title)}</title>
                <style>
                    body {
                        font-family: 'Crimson Text', Georgia, serif;
                        max-width: 600px;
                        margin: 40px auto;
                        padding: 20px;
                        line-height: 1.6;
                        color: #333;
                    }
                    .print-poem-title {
                        font-size: 28px;
                        font-weight: 600;
                        margin-bottom: 10px;
                        color: #2C5F5D;
                        text-align: center;
                    }
                    .print-poem-author {
                        font-style: italic;
                        font-size: 18px;
                        margin-bottom: 30px;
                        color: #666;
                        text-align: center;
                    }
                    .print-poem-category {
                        background: #FFD23F;
                        color: #2C5F5D;
                        padding: 4px 12px;
                        border-radius: 15px;
                        font-size: 12px;
                        font-weight: 500;
                        text-transform: uppercase;
                        letter-spacing: 0.5px;
                        display: inline-block;
                        margin-bottom: 20px;
                    }
                    .print-poem-text {
                        font-size: 16px;
                        line-height: 1.8;
                        white-space: pre-line;
                        margin-top: 20px;
                    }
                    .print-footer {
                        margin-top: 40px;
                        padding-top: 20px;
                        border-top: 1px solid #eee;
                        font-size: 12px;
                        color: #999;
                        text-align: center;
                    }
                    @media print {
                        body { margin: 0; }
                        .print-footer { page-break-inside: avoid; }
                    }
                </style>
            </head>
            <body>
                <div class="print-poem">
                    <h1 class="print-poem-title">${this.escapeHtml(poem.title)}</h1>
                    <p class="print-poem-author">by ${this.escapeHtml(poem.author)}</p>
                    <div class="print-poem-category">${this.escapeHtml(poem.category)}</div>
                    <div class="print-poem-text">${this.escapeHtml(poem.content)}</div>
                    <div class="print-footer">
                        First Monthsary Offensive<br>
                        Printed on ${new Date().toLocaleString()}
                    </div>
                </div>
            </body>
            </html>
        `);
        
        printWindow.document.close();
        
        // Wait for content to load, then print
        printWindow.onload = function() {
            printWindow.print();
            printWindow.close();
        };
    }

    updateResultsCount() {
        try {
            const resultsCount = document.getElementById('resultsCount');
            if (!resultsCount) {
                throw new Error('Results count element not found');
            }
            
            const count = this.filteredPoems.length;
            const total = this.poems.length;
            
            if (count === total) {
                resultsCount.textContent = `${count} poems`;
            } 
            else {
                resultsCount.textContent = `${count} of ${total} poems`;
            }
        } 
        catch (error) {
            console.error('Error updating results count:', error);
            // update attempt
            try {
                const resultsCount = document.getElementById('resultsCount');
                if (resultsCount) {
                    resultsCount.textContent = 'Poems available';
                }
            } 
            catch (e) {
                console.error('Error updating results count fallback:', e);
            }
        }
    }

    showError(message) {
        try {
            const poemsGrid = document.getElementById('poemsGrid');
            if (!poemsGrid) {
                throw new Error('Error: poemsGrid element not found');
            }
            
            poemsGrid.innerHTML = `
                <div class="error-message">
                    <i class="fas fa-exclamation-triangle"></i>
                    <h3>Error</h3>
                    <p>${this.escapeHtml(messaISSAge || 'An unknown error occurred')}</p>
                </div>
            `;
        } 
        catch (error) {
            console.error('Failed to display error message:', error);
            // imagine if this happens
            try {
                alert('Error: ' + (message || 'An unknown error occurred'));
            } 
            catch (e) {
                console.error('Critical error in error handler:', e);
            }
        }
    }

    escapeHtml(unsafe) {
        try {
            return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
        }
        catch (error) {
            console.error('Error escaping HTML:', error);
            // fallback mechanism for failure
            return unsafe || '';
        }
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new PoetrySunsetApp();
});

// internal smooth scrolling
document.addEventListener('click', (e) => {
    try {
        if (e.target.matches('a[href^="#"]')) {
            e.preventDefault();
            const targetId = e.target.getAttribute('href');
            const target = document.querySelector(targetId);
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
            } 
            else {
                console.warn(`Smooth scroll target not found: ${targetId}`);
            }
        }
    } 
    catch (error) {
        console.error('Error during smooth scrolling:', error);
    }
});
