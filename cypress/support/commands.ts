/// <reference types="cypress" />

// Custom commands for ShopSphere application

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Custom command to login a user
       * @example cy.login('user@example.com', 'password')
       */
      login(email: string, password: string): Chainable<void>
      
      /**
       * Custom command to register a new user
       * @example cy.register('user@example.com', 'password', 'John', 'Doe')
       */
      register(email: string, password: string, firstName: string, lastName: string): Chainable<void>
      
      /**
       * Custom command to add a product to cart
       * @example cy.addToCart('product-id')
       */
      addToCart(productId: string): Chainable<void>
      
      /**
       * Custom command to clear cart
       * @example cy.clearCart()
       */
      clearCart(): Chainable<void>
      
      /**
       * Custom command to wait for page load
       * @example cy.waitForPageLoad()
       */
      waitForPageLoad(): Chainable<void>
    }
  }
}

// Login command
Cypress.Commands.add('login', (email: string, password: string) => {
  cy.visit('/login')
  cy.get('[data-testid="login-email"]').type(email)
  cy.get('[data-testid="login-password"]').type(password)
  cy.get('[data-testid="login-submit"]').click()
  cy.url().should('not.include', '/login')
})

// Register command
Cypress.Commands.add('register', (email: string, password: string, firstName: string, lastName: string) => {
  cy.visit('/login?mode=register')
  cy.get('[data-testid="register-first-name"]').type(firstName)
  cy.get('[data-testid="register-last-name"]').type(lastName)
  cy.get('[data-testid="register-email"]').type(email)
  cy.get('[data-testid="register-password"]').type(password)
  cy.get('[data-testid="register-submit"]').click()
  cy.url().should('not.include', '/login')
})

// Add to cart command
Cypress.Commands.add('addToCart', (productId: string) => {
  cy.visit(`/product/${productId}`)
  cy.get('[data-testid="add-to-cart-button"]').click()
  cy.get('[data-testid="cart-button"]').should('contain', '1')
})

// Clear cart command
Cypress.Commands.add('clearCart', () => {
  cy.visit('/cart')
  cy.get('[data-testid="clear-cart-button"]').click()
  cy.get('[data-testid="cart-button"]').should('not.contain', '1')
})

// Wait for page load command
Cypress.Commands.add('waitForPageLoad', () => {
  cy.get('body').should('be.visible')
  cy.get('[data-testid="loading"]').should('not.exist')
})
