describe('Shopping Cart', () => {
  beforeEach(() => {
    cy.visit('/')
    // Login before each test
    cy.visit('/login')
    cy.get('[data-testid="login-email"]').type('admin@modernstore.com')
    cy.get('[data-testid="login-password"]').type('admin123')
    cy.get('[data-testid="login-submit"]').click()
    cy.url().should('eq', Cypress.config().baseUrl + '/')
  })

  describe('Add to Cart - Positive Paths', () => {
    it('should add a product to cart from product list', () => {
      cy.get('[data-testid="product-card"]').first().within(() => {
        cy.get('[data-testid="add-to-cart-button"]').click()
      })
      
      // Cart count should increase
      cy.get('[data-testid="cart-button"]').should('contain', '1')
      
      // Should show success message
      cy.get('[data-testid="toast-success"]').should('be.visible')
      cy.get('[data-testid="toast-success"]').should('contain', 'Added to cart')
    })

    it('should add a product to cart from product detail page', () => {
      cy.get('[data-testid="product-card"]').first().click()
      cy.get('[data-testid="add-to-cart-button"]').click()
      
      // Cart count should increase
      cy.get('[data-testid="cart-button"]').should('contain', '1')
      
      // Should show success message
      cy.get('[data-testid="toast-success"]').should('be.visible')
    })

    it('should add multiple quantities of the same product', () => {
      cy.get('[data-testid="product-card"]').first().click()
      cy.get('[data-testid="quantity-increase"]').click()
      cy.get('[data-testid="quantity-display"]').should('contain', '2')
      cy.get('[data-testid="add-to-cart-button"]').click()
      
      // Cart count should show 2
      cy.get('[data-testid="cart-button"]').should('contain', '2')
    })

    it('should add different products to cart', () => {
      // Add first product
      cy.get('[data-testid="product-card"]').first().within(() => {
        cy.get('[data-testid="add-to-cart-button"]').click()
      })
      
      // Add second product
      cy.get('[data-testid="product-card"]').eq(1).within(() => {
        cy.get('[data-testid="add-to-cart-button"]').click()
      })
      
      // Cart count should show 2
      cy.get('[data-testid="cart-button"]').should('contain', '2')
    })

    it('should update existing item quantity when adding same product again', () => {
      // Add product first time
      cy.get('[data-testid="product-card"]').first().within(() => {
        cy.get('[data-testid="add-to-cart-button"]').click()
      })
      
      // Add same product again
      cy.get('[data-testid="product-card"]').first().within(() => {
        cy.get('[data-testid="add-to-cart-button"]').click()
      })
      
      // Cart count should show 2
      cy.get('[data-testid="cart-button"]').should('contain', '2')
    })
  })

  describe('Add to Cart - Negative Paths', () => {
    it('should not add out of stock products to cart', () => {
      // Find a product with 0 stock
      cy.get('[data-testid="product-card"]').each(($card) => {
        cy.wrap($card).find('[data-testid="product-stock"]').then(($stock) => {
          if ($stock.text().includes('0')) {
            cy.wrap($card).within(() => {
              cy.get('[data-testid="add-to-cart-button"]').should('be.disabled')
            })
          }
        })
      })
    })

    it('should not add products when exceeding available stock', () => {
      cy.get('[data-testid="product-card"]').first().click()
      
      // Try to set quantity higher than stock
      cy.get('[data-testid="product-detail-stock"]').then(($stock) => {
        const stockNumber = parseInt($stock.text().match(/\d+/)[0])
        for (let i = 1; i < stockNumber + 2; i++) {
          cy.get('[data-testid="quantity-increase"]').click()
        }
        
        // Should show error message
        cy.get('[data-testid="error-message"]').should('be.visible')
        cy.get('[data-testid="error-message"]').should('contain', 'Insufficient stock')
      })
    })

    it('should not add products when not authenticated', () => {
      // Logout first
      cy.get('[data-testid="logout-button"]').click()
      
      cy.get('[data-testid="product-card"]').first().within(() => {
        cy.get('[data-testid="add-to-cart-button"]').click()
      })
      
      // Should redirect to login page
      cy.url().should('include', '/login')
    })
  })

  describe('Cart Page - Positive Paths', () => {
    beforeEach(() => {
      // Add items to cart first
      cy.get('[data-testid="product-card"]').first().within(() => {
        cy.get('[data-testid="add-to-cart-button"]').click()
      })
      cy.get('[data-testid="cart-button"]').click()
    })

    it('should display cart page with added items', () => {
      cy.get('[data-testid="cart-page"]').should('be.visible')
      cy.get('[data-testid="cart-item"]').should('have.length', 1)
    })

    it('should display correct item information in cart', () => {
      cy.get('[data-testid="cart-item"]').first().within(() => {
        cy.get('[data-testid="cart-item-image"]').should('be.visible')
        cy.get('[data-testid="cart-item-title"]').should('be.visible')
        cy.get('[data-testid="cart-item-price"]').should('be.visible')
        cy.get('[data-testid="cart-item-quantity"]').should('be.visible')
      })
    })

    it('should calculate correct total price', () => {
      cy.get('[data-testid="cart-subtotal"]').should('be.visible')
      cy.get('[data-testid="cart-shipping"]').should('be.visible')
      cy.get('[data-testid="cart-total"]').should('be.visible')
      
      // Total should be subtotal + shipping
      cy.get('[data-testid="cart-subtotal"]').then(($subtotal) => {
        const subtotal = parseFloat($subtotal.text().replace('$', ''))
        cy.get('[data-testid="cart-shipping"]').then(($shipping) => {
          const shipping = parseFloat($shipping.text().replace('$', ''))
          cy.get('[data-testid="cart-total"]').should('contain', (subtotal + shipping).toFixed(2))
        })
      })
    })

    it('should update quantity in cart', () => {
      cy.get('[data-testid="cart-item"]').first().within(() => {
        cy.get('[data-testid="quantity-increase"]').click()
        cy.get('[data-testid="cart-item-quantity"]').should('contain', '2')
      })
      
      // Total should update
      cy.get('[data-testid="cart-total"]').should('not.contain', '0.00')
    })

    it('should remove item from cart', () => {
      cy.get('[data-testid="cart-item"]').first().within(() => {
        cy.get('[data-testid="remove-item-button"]').click()
      })
      
      // Item should be removed
      cy.get('[data-testid="cart-item"]').should('have.length', 0)
      cy.get('[data-testid="empty-cart-message"]').should('be.visible')
    })

    it('should navigate to checkout', () => {
      cy.get('[data-testid="checkout-button"]').click()
      cy.url().should('include', '/checkout')
    })

    it('should continue shopping', () => {
      cy.get('[data-testid="continue-shopping-button"]').click()
      cy.url().should('eq', Cypress.config().baseUrl + '/')
    })
  })

  describe('Cart Page - Negative Paths', () => {
    it('should show empty cart message when no items', () => {
      cy.get('[data-testid="cart-button"]').click()
      cy.get('[data-testid="empty-cart-message"]').should('be.visible')
      cy.get('[data-testid="empty-cart-message"]').should('contain', 'Your cart is empty')
    })

    it('should not allow quantity below 1', () => {
      // Add item to cart
      cy.get('[data-testid="product-card"]').first().within(() => {
        cy.get('[data-testid="add-to-cart-button"]').click()
      })
      cy.get('[data-testid="cart-button"]').click()
      
      cy.get('[data-testid="cart-item"]').first().within(() => {
        cy.get('[data-testid="quantity-decrease"]').click()
        cy.get('[data-testid="cart-item-quantity"]').should('contain', '1')
      })
    })

    it('should not allow quantity above available stock', () => {
      // Add item to cart
      cy.get('[data-testid="product-card"]').first().within(() => {
        cy.get('[data-testid="add-to-cart-button"]').click()
      })
      cy.get('[data-testid="cart-button"]').click()
      
      cy.get('[data-testid="cart-item"]').first().within(() => {
        // Try to increase quantity beyond stock
        for (let i = 0; i < 10; i++) {
          cy.get('[data-testid="quantity-increase"]').click()
        }
        
        // Should show error message
        cy.get('[data-testid="error-message"]').should('be.visible')
        cy.get('[data-testid="error-message"]').should('contain', 'Insufficient stock')
      })
    })

    it('should redirect to login when accessing cart without authentication', () => {
      // Logout first
      cy.get('[data-testid="logout-button"]').click()
      
      cy.visit('/cart')
      cy.url().should('include', '/login')
    })
  })

  describe('Cart Persistence', () => {
    it('should persist cart items after page refresh', () => {
      // Add item to cart
      cy.get('[data-testid="product-card"]').first().within(() => {
        cy.get('[data-testid="add-to-cart-button"]').click()
      })
      
      // Refresh page
      cy.reload()
      
      // Cart count should still show 1
      cy.get('[data-testid="cart-button"]').should('contain', '1')
    })

    it('should persist cart items after navigation', () => {
      // Add item to cart
      cy.get('[data-testid="product-card"]').first().within(() => {
        cy.get('[data-testid="add-to-cart-button"]').click()
      })
      
      // Navigate to different page
      cy.visit('/orders')
      
      // Navigate back to home
      cy.visit('/')
      
      // Cart count should still show 1
      cy.get('[data-testid="cart-button"]').should('contain', '1')
    })
  })

  describe('Cart Responsive Design', () => {
    beforeEach(() => {
      // Add item to cart first
      cy.get('[data-testid="product-card"]').first().within(() => {
        cy.get('[data-testid="add-to-cart-button"]').click()
      })
      cy.get('[data-testid="cart-button"]').click()
    })

    it('should display correctly on mobile viewport', () => {
      cy.viewport('iphone-x')
      cy.get('[data-testid="cart-page"]').should('be.visible')
      cy.get('[data-testid="cart-item"]').should('be.visible')
    })

    it('should display correctly on tablet viewport', () => {
      cy.viewport('ipad-2')
      cy.get('[data-testid="cart-page"]').should('be.visible')
      cy.get('[data-testid="cart-item"]').should('be.visible')
    })
  })

  describe('Cart Loading States', () => {
    it('should show loading state while fetching cart', () => {
      cy.intercept('GET', '/api/cart', { delay: 1000 }).as('getCart')
      cy.get('[data-testid="cart-button"]').click()
      cy.get('[data-testid="loading-spinner"]').should('be.visible')
      cy.wait('@getCart')
      cy.get('[data-testid="loading-spinner"]').should('not.exist')
    })

    it('should show loading state while updating cart', () => {
      // Add item to cart
      cy.get('[data-testid="product-card"]').first().within(() => {
        cy.get('[data-testid="add-to-cart-button"]').click()
      })
      cy.get('[data-testid="cart-button"]').click()
      
      cy.intercept('PUT', '/api/cart/*', { delay: 1000 }).as('updateCart')
      cy.get('[data-testid="cart-item"]').first().within(() => {
        cy.get('[data-testid="quantity-increase"]').click()
      })
      cy.get('[data-testid="loading-spinner"]').should('be.visible')
      cy.wait('@updateCart')
      cy.get('[data-testid="loading-spinner"]').should('not.exist')
    })
  })

  describe('Cart Error Handling', () => {
    it('should show error message when cart fails to load', () => {
      cy.intercept('GET', '/api/cart', { statusCode: 500 }).as('getCartError')
      cy.get('[data-testid="cart-button"]').click()
      cy.wait('@getCartError')
      cy.get('[data-testid="error-message"]').should('be.visible')
    })

    it('should show error message when cart update fails', () => {
      // Add item to cart
      cy.get('[data-testid="product-card"]').first().within(() => {
        cy.get('[data-testid="add-to-cart-button"]').click()
      })
      cy.get('[data-testid="cart-button"]').click()
      
      cy.intercept('PUT', '/api/cart/*', { statusCode: 500 }).as('updateCartError')
      cy.get('[data-testid="cart-item"]').first().within(() => {
        cy.get('[data-testid="quantity-increase"]').click()
      })
      cy.wait('@updateCartError')
      cy.get('[data-testid="error-message"]').should('be.visible')
    })
  })
})
