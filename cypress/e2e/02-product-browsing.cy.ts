describe('Product Browsing', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  describe('Home Page', () => {
    it('should display the home page with products', () => {
      cy.get('h1').should('contain', 'ModernStore')
      cy.get('[data-testid="search-input"]').should('be.visible')
      cy.get('[data-testid="product-grid"]').should('be.visible')
    })

    it('should display product cards with correct information', () => {
      cy.get('[data-testid="product-card"]').first().within(() => {
        cy.get('[data-testid="product-image"]').should('be.visible')
        cy.get('[data-testid="product-title"]').should('be.visible')
        cy.get('[data-testid="product-price"]').should('be.visible')
        cy.get('[data-testid="product-category"]').should('be.visible')
        cy.get('[data-testid="add-to-cart-button"]').should('be.visible')
      })
    })

    it('should display multiple products', () => {
      cy.get('[data-testid="product-card"]').should('have.length.greaterThan', 0)
    })

    it('should show product details when clicking on a product', () => {
      cy.get('[data-testid="product-card"]').first().click()
      cy.url().should('include', '/product/')
      cy.get('[data-testid="product-detail-title"]').should('be.visible')
      cy.get('[data-testid="product-detail-price"]').should('be.visible')
      cy.get('[data-testid="product-detail-description"]').should('be.visible')
    })
  })

  describe('Product Search - Positive Paths', () => {
    it('should search for products by title', () => {
      cy.get('[data-testid="search-input"]').type('headphones')
      cy.get('[data-testid="product-card"]').should('have.length.greaterThan', 0)
      cy.get('[data-testid="product-title"]').first().should('contain', 'headphones')
    })

    it('should search for products by description', () => {
      cy.get('[data-testid="search-input"]').type('wireless')
      cy.get('[data-testid="product-card"]').should('have.length.greaterThan', 0)
    })

    it('should show all products when search is cleared', () => {
      cy.get('[data-testid="search-input"]').type('headphones')
      cy.get('[data-testid="search-input"]').clear()
      cy.get('[data-testid="product-card"]').should('have.length.greaterThan', 0)
    })

    it('should search case-insensitive', () => {
      cy.get('[data-testid="search-input"]').type('HEADPHONES')
      cy.get('[data-testid="product-card"]').should('have.length.greaterThan', 0)
    })
  })

  describe('Product Search - Negative Paths', () => {
    it('should show no results for non-existent product', () => {
      cy.get('[data-testid="search-input"]').type('nonexistentproduct123')
      cy.get('[data-testid="product-card"]').should('have.length', 0)
      cy.get('[data-testid="no-results-message"]').should('be.visible')
    })

    it('should show no results for empty search with special characters', () => {
      cy.get('[data-testid="search-input"]').type('!@#$%^&*()')
      cy.get('[data-testid="product-card"]').should('have.length', 0)
    })

    it('should handle very long search terms', () => {
      const longSearch = 'a'.repeat(1000)
      cy.get('[data-testid="search-input"]').type(longSearch)
      cy.get('[data-testid="product-card"]').should('have.length', 0)
    })
  })

  describe('Product Filtering', () => {
    it('should filter products by category', () => {
      // Open the category filter dropdown
      cy.get('[data-testid="category-filter"]').click()
      // Select electronics category
      cy.get('[role="option"]').contains('Electronics').click()
      cy.get('[data-testid="product-card"]').each(($card) => {
        cy.wrap($card).find('[data-testid="product-category"]').should('contain', 'electronics')
      })
    })

    it('should show all products when "all" category is selected', () => {
      // Open the category filter dropdown
      cy.get('[data-testid="category-filter"]').click()
      // Select all categories
      cy.get('[role="option"]').contains('All Categories').click()
      cy.get('[data-testid="product-card"]').should('have.length.greaterThan', 0)
    })

    it('should combine search and category filtering', () => {
      // Open the category filter dropdown
      cy.get('[data-testid="category-filter"]').click()
      // Select electronics category
      cy.get('[role="option"]').contains('Electronics').click()
      cy.get('[data-testid="search-input"]').type('wireless')
      cy.get('[data-testid="product-card"]').should('have.length.greaterThan', 0)
    })
  })

  describe('Product Detail Page', () => {
    beforeEach(() => {
      cy.get('[data-testid="product-card"]').first().click()
    })

    it('should display complete product information', () => {
      cy.get('[data-testid="product-detail-title"]').should('be.visible')
      cy.get('[data-testid="product-detail-price"]').should('be.visible')
      cy.get('[data-testid="product-detail-description"]').should('be.visible')
      cy.get('[data-testid="product-detail-image"]').should('be.visible')
      cy.get('[data-testid="product-detail-category"]').should('be.visible')
      cy.get('[data-testid="product-detail-stock"]').should('be.visible')
    })

    it('should show add to cart button', () => {
      cy.get('[data-testid="add-to-cart-button"]').should('be.visible')
      cy.get('[data-testid="add-to-cart-button"]').should('contain', 'Add to Cart')
    })

    it('should show quantity selector', () => {
      cy.get('[data-testid="quantity-selector"]').should('be.visible')
      cy.get('[data-testid="quantity-decrease"]').should('be.visible')
      cy.get('[data-testid="quantity-increase"]').should('be.visible')
    })

    it('should allow quantity adjustment', () => {
      cy.get('[data-testid="quantity-display"]').should('contain', '1')
      cy.get('[data-testid="quantity-increase"]').click()
      cy.get('[data-testid="quantity-display"]').should('contain', '2')
      cy.get('[data-testid="quantity-decrease"]').click()
      cy.get('[data-testid="quantity-display"]').should('contain', '1')
    })

    it('should not allow quantity below 1', () => {
      cy.get('[data-testid="quantity-display"]').should('contain', '1')
      cy.get('[data-testid="quantity-decrease"]').click()
      cy.get('[data-testid="quantity-display"]').should('contain', '1')
    })

    it('should show back to products link', () => {
      cy.get('[data-testid="back-to-products"]').should('be.visible')
      cy.get('[data-testid="back-to-products"]').click()
      cy.url().should('eq', Cypress.config().baseUrl + '/')
    })
  })

  describe('Product Detail - Negative Paths', () => {
    it('should show error for invalid product ID', () => {
      cy.visit('/product/invalid-id')
      cy.get('[data-testid="error-message"]').should('be.visible')
      cy.get('[data-testid="error-message"]').should('contain', 'Product not found')
    })

    it('should show error for non-existent product ID', () => {
      cy.visit('/product/00000000-0000-0000-0000-000000000000')
      cy.get('[data-testid="error-message"]').should('be.visible')
    })

    it('should handle out of stock products', () => {
      // This test assumes there's a product with 0 stock
      cy.get('[data-testid="product-card"]').each(($card) => {
        cy.wrap($card).find('[data-testid="product-stock"]').then(($stock) => {
          if ($stock.text().includes('0')) {
            cy.wrap($card).click()
            cy.get('[data-testid="add-to-cart-button"]').should('be.disabled')
            cy.get('[data-testid="out-of-stock-message"]').should('be.visible')
          }
        })
      })
    })
  })

  describe('Responsive Design', () => {
    it('should display correctly on mobile viewport', () => {
      cy.viewport('iphone-x')
      cy.get('[data-testid="product-grid"]').should('be.visible')
      cy.get('[data-testid="product-card"]').should('be.visible')
    })

    it('should display correctly on tablet viewport', () => {
      cy.viewport('ipad-2')
      cy.get('[data-testid="product-grid"]').should('be.visible')
      cy.get('[data-testid="product-card"]').should('be.visible')
    })

    it('should hide search bar on mobile', () => {
      cy.viewport('iphone-x')
      cy.get('[data-testid="search-input"]').should('not.be.visible')
    })
  })

  describe('Loading States', () => {
    it('should show loading state while fetching products', () => {
      // This would require intercepting the API call
      cy.intercept('GET', '/api/products', { delay: 1000 }).as('getProducts')
      cy.visit('/')
      cy.get('[data-testid="loading-spinner"]').should('be.visible')
      cy.wait('@getProducts')
      cy.get('[data-testid="loading-spinner"]').should('not.exist')
    })

    it('should show loading state while fetching product details', () => {
      cy.intercept('GET', '/api/products/*', { delay: 1000 }).as('getProduct')
      cy.get('[data-testid="product-card"]').first().click()
      cy.wait('@getProduct')
      cy.get('[data-testid="loading-spinner"]').should('be.visible')
      cy.wait('@getProduct')
      cy.get('[data-testid="loading-spinner"]').should('not.exist')
    })
  })

  describe('Error Handling', () => {
    it('should show error message when products fail to load', () => {
      cy.intercept('GET', '/api/products', { statusCode: 500 }).as('getProductsError')
      cy.visit('/')
      cy.wait('@getProductsError')
      cy.get('[data-testid="error-message"]').should('be.visible')
      cy.get('[data-testid="retry-button"]').should('be.visible')
    })

    it('should show error message when product details fail to load', () => {
      cy.intercept('GET', '/api/products/*', { statusCode: 500 }).as('getProductError')
      cy.get('[data-testid="product-card"]').first().click()
      cy.wait('@getProductError')
      cy.get('[data-testid="error-message"]').should('be.visible')
    })

    it('should retry loading products when retry button is clicked', () => {
      cy.intercept('GET', '/api/products', { statusCode: 500 }).as('getProductsError')
      cy.visit('/')
      cy.wait('@getProductsError')
      cy.get('[data-testid="retry-button"]').click()
      cy.get('[data-testid="product-grid"]').should('be.visible')
    })
  })
})
