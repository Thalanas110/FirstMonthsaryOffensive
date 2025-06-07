// application of OOP principles as usual

class PoemUtils {
    static validatePoem(poem) {
        try {
            if (!poem || typeof poem !== 'object') {
                throw new Error('Invalid poem object');
            }
            
            const required = ['id', 'title', 'author', 'content', 'category'];
            return required.every(field => poem.hasOwnProperty(field) && poem[field]);
        } 
        catch (error) {
            console.error('Error validating poem:', error);
            return false;
        }
    }


    static getCategories(poems) {
        try {
            const categories = poems.map(poem => poem.category);
            return [...new Set(categories)].sort();
        }
        catch (error) {
            console.error('Error getting categories:', error);
            return [];
        }
    }

    static getAuthors(poems) {
        try {
            const authors = poems.map(poem => poem.author);
            return [...new Set(authors)].sort();
        }
        catch (error) {
            console.error('Error getting authors:', error);
            return [];
        }
    }

    static formatContent(content) {
        try {        
            return content
            .split('\n')
            .map(line => line.trim())
            .join('\n');
        }
        catch (error) {
            console.error('Error formatting content:', error);
            return content;
        }
    }

    static getReadingTime(content, wpm = 200) {
        try {
            const wordCount = content.split(/\s+/).length;
            const minutes = Math.ceil(wordCount / wpm);
            return minutes === 1 ? '1 minute' : `${minutes} minutes`;
        }
        catch (error) {
            console.error('Error calculating reading time:', error);
            return 0;
        }
    }

    static extractThemes(content) {
        try {
            const loveKeywords = [
                'love', 'heart', 'soul', 'kiss', 'embrace', 'beloved', 'darling',
                'passion', 'romance', 'affection', 'devotion', 'tender', 'sweet',
                'beauty', 'eyes', 'smile', 'touch', 'forever', 'eternal', 'divine'
            ];
            
            const words = content.toLowerCase().split(/\W+/);
            return loveKeywords.filter(keyword => words.includes(keyword));
        }
        catch (error) {
            console.error('Error extracting themes:', error);
            return [];
        }
    }

    static searchPoems(poems, query, options = {}) {
        try {
            if (!Array.isArray(poems)) {
                throw new Error('Input must be an array of poems');
            }
            
            if (!query || typeof query !== 'string') {
                return [];
            }

            const {
                searchFields = ['title', 'author', 'content'],
                caseSensitive = false,
                exactMatch = false
            } = options;

            const searchTerm = caseSensitive ? query : query.toLowerCase();
            
            return poems.filter(poem => {
                return searchFields.some(field => {
                    if (!poem[field]) return false;
                    
                    const fieldValue = caseSensitive ? 
                        String(poem[field]) : 
                        String(poem[field]).toLowerCase();
                    
                    if (exactMatch) {
                        return fieldValue === searchTerm;
                    } 
                    else {
                        return fieldValue.includes(searchTerm);
                    }
                });
            });
        } 
        catch (error) {
            console.error('Error searching poems:', error);
            return [];
        }
    }

    static sortPoems(poems, criteria) {
        try {
            const sortedPoems = [...poems];
            
            switch (criteria) {
                case 'title-asc':
                    return sortedPoems.sort((a, b) => a.title.localeCompare(b.title));
                case 'title-desc':
                    return sortedPoems.sort((a, b) => b.title.localeCompare(a.title));
                case 'author-asc':
                    return sortedPoems.sort((a, b) => a.author.localeCompare(b.author));
                case 'author-desc':
                    return sortedPoems.sort((a, b) => b.author.localeCompare(a.author));
                case 'category':
                    return sortedPoems.sort((a, b) => 
                        a.category.localeCompare(b.category) || a.title.localeCompare(b.title)
                    );
                case 'random':
                    return sortedPoems.sort(() => Math.random() - 0.5);
                default:
                    return sortedPoems;
            }
        } 
        catch (error) {
            console.error('Error sorting poems:', error);
            return [...poems]; // Return original array on error
        }
    }

    static getStatistics(poems) {
        try {
            if (!Array.isArray(poems)) {
                throw new Error('Input must be an array of poems');
            }
            
            if (poems.length === 0) {
                return {
                    total: 0,
                    categories: 0,
                    authors: 0,
                    averageLength: 0,
                    totalWords: 0
                };
            }
            
            return {
                total: poems.length,
                categories: this.getCategories(poems).length,
                authors: this.getAuthors(poems).length,
                averageLength: Math.round(
                    poems.reduce((sum, poem) => sum + (poem.content?.length || 0), 0) / poems.length
                ),
                totalWords: poems.reduce((sum, poem) => 
                    sum + (poem.content ? poem.content.split(/\s+/).length : 0), 0
                )
            };
        } 
        catch (error) {
            console.error('Error calculating poem statistics:', error);
            return {
                total: 0,
                categories: 0,
                authors: 0,
                averageLength: 0,
                totalWords: 0
            };
        }
    }
}

// other modules in the future
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PoemUtils;
}
