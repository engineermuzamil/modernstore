describe('Authentication', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  describe('Navigation', () => {
    it('should show login and register buttons when not authenticated', () => {
      cy.get('[data-testid="login-button"]').should('be.visible')
      cy.get('[data-testid="register-button"]').should('be.visible')
    })

    it('should navigate to login page when login button is clicked', () => {
      cy.get('[data-testid="login-button"]').click()
      cy.url().should('include', '/login')
      cy.get('h2').should('contain', 'Sign in to your account')
    })

    it('should navigate to register page when register button is clicked', () => {
      cy.get('[data-testid="register-button"]').click()
      cy.url().should('include', '/login?mode=register')
      cy.get('h2').should('contain', 'Create your account')
    })
  })

  describe('Login - Positive Paths', () => {
    it('should successfully login with valid credentials', () => {
      cy.visit('/login')
      cy.get('[data-testid="login-email"]').type('admin@modernstore.com')
      cy.get('[data-testid="login-password"]').type('admin123')
      cy.get('[data-testid="login-submit"]').click()

      // Should redirect to home page
      cy.url().should('eq', Cypress.config().baseUrl + '/')

      // Should show user name in navbar
      cy.get('span').should('contain', 'Hello, Admin')

      // Should show logout button
      cy.get('[data-testid="logout-button"]').should('be.visible')
    })

    it('should show user menu after successful login', () => {
      cy.login('admin@modernstore.com', 'admin123')

      // Should show cart and orders buttons
      cy.get('[data-testid="cart-button"]').should('be.visible')
      cy.get('[data-testid="orders-button"]').should('be.visible')

      // Should not show login/register buttons
      cy.get('[data-testid="login-button"]').should('not.exist')
      cy.get('[data-testid="register-button"]').should('not.exist')
    })
  })

  describe('Login - Negative Paths', () => {
    beforeEach(() => {
      cy.visit('/login')
    })

    it('should show error for invalid email format', () => {
      cy.get('[data-testid="login-email"]').type('invalid-email')
      cy.get('[data-testid="login-password"]').type('password')
      cy.get('[data-testid="login-submit"]').click()

      // Should show validation error
      cy.get('[data-testid="login-email"]').should('have.attr', 'aria-invalid', 'true')
    })

    it('should show error for empty email', () => {
      cy.get('[data-testid="login-password"]').type('password')
      cy.get('[data-testid="login-submit"]').click()

      // Should show required field error
      cy.get('[data-testid="login-email"]').should('have.attr', 'required')
    })

    it('should show error for empty password', () => {
      cy.get('[data-testid="login-email"]').type('test@example.com')
      cy.get('[data-testid="login-submit"]').click()

      // Should show required field error
      cy.get('[data-testid="login-password"]').should('have.attr', 'required')
    })

    it('should show error for invalid credentials', () => {
      cy.get('[data-testid="login-email"]').type('wrong@example.com')
      cy.get('[data-testid="login-password"]').type('wrongpassword')
      cy.get('[data-testid="login-submit"]').click()

      // Should show error message
      cy.get('[data-testid="error-message"]').should('be.visible')
      cy.get('[data-testid="error-message"]').should('contain', 'Invalid credentials')

      // Should stay on login page
      cy.url().should('include', '/login')
    })

    it('should show error for non-existent user', () => {
      cy.get('[data-testid="login-email"]').type('nonexistent@example.com')
      cy.get('[data-testid="login-password"]').type('password123')
      cy.get('[data-testid="login-submit"]').click()

      // Should show error message
      cy.get('[data-testid="error-message"]').should('be.visible')
      cy.get('[data-testid="error-message"]').should('contain', 'Invalid credentials')
    })
  })

  describe('Registration - Positive Paths', () => {
    it('should successfully register a new user', () => {
      const email = `test${Date.now()}@example.com`
      const password = 'TestPassword123!'

      cy.visit('/login?mode=register')
      cy.get('[data-testid="register-first-name"]').type('John')
      cy.get('[data-testid="register-last-name"]').type('Doe')
      cy.get('[data-testid="register-email"]').type(email)
      cy.get('[data-testid="register-password"]').type(password)
      cy.get('[data-testid="register-submit"]').click()

      // Should redirect to home page
      cy.url().should('eq', Cypress.config().baseUrl + '/')

      // Should show user name in navbar
      cy.get('span').should('contain', 'Hello, John')
    })

    it('should show success message after registration', () => {
      const email = `test${Date.now()}@example.com`
      const password = 'TestPassword123!'

      cy.visit('/login?mode=register')
      cy.get('[data-testid="register-first-name"]').type('Jane')
      cy.get('[data-testid="register-last-name"]').type('Smith')
      cy.get('[data-testid="register-email"]').type(email)
      cy.get('[data-testid="register-password"]').type(password)
      cy.get('[data-testid="register-submit"]').click()

      // Should show success toast
      cy.get('[data-testid="toast-success"]').should('be.visible')
      cy.get('[data-testid="toast-success"]').should('contain', 'Account created successfully')
    })
  })

  describe('Registration - Negative Paths', () => {
    beforeEach(() => {
      cy.visit('/login?mode=register')
    })

    it('should show error for existing email', () => {
      cy.get('[data-testid="register-first-name"]').type('Test')
      cy.get('[data-testid="register-last-name"]').type('User')
      cy.get('[data-testid="register-email"]').type('admin@modernstore.com')
      cy.get('[data-testid="register-password"]').type('password123')
      cy.get('[data-testid="register-submit"]').click()

      // Should show error message
      cy.get('[data-testid="error-message"]').should('be.visible')
      cy.get('[data-testid="error-message"]').should('contain', 'User already exists')
    })

    it('should show error for invalid email format', () => {
      cy.get('[data-testid="register-first-name"]').type('Test')
      cy.get('[data-testid="register-last-name"]').type('User')
      cy.get('[data-testid="register-email"]').type('invalid-email')
      cy.get('[data-testid="register-password"]').type('password123')
      cy.get('[data-testid="register-submit"]').click()

      // Should show validation error
      cy.get('[data-testid="register-email"]').should('have.attr', 'aria-invalid', 'true')
    })

    it('should show error for weak password', () => {
      cy.get('[data-testid="register-first-name"]').type('Test')
      cy.get('[data-testid="register-last-name"]').type('User')
      cy.get('[data-testid="register-email"]').type('test@example.com')
      cy.get('[data-testid="register-password"]').type('123')
      cy.get('[data-testid="register-submit"]').click()

      // Should show password validation error
      cy.get('[data-testid="register-password"]').should('have.attr', 'aria-invalid', 'true')
    })

    it('should show error for empty required fields', () => {
      cy.get('[data-testid="register-submit"]').click()

      // Should show required field errors
      cy.get('[data-testid="register-first-name"]').should('have.attr', 'required')
      cy.get('[data-testid="register-last-name"]').should('have.attr', 'required')
      cy.get('[data-testid="register-email"]').should('have.attr', 'required')
      cy.get('[data-testid="register-password"]').should('have.attr', 'required')
    })
  })

  describe('Logout', () => {
    it('should successfully logout user', () => {
      cy.login('admin@modernstore.com', 'admin123')

      // Click logout button
      cy.get('[data-testid="logout-button"]').click()

      // Should redirect to home page
      cy.url().should('eq', Cypress.config().baseUrl + '/')

      // Should show login/register buttons
      cy.get('[data-testid="login-button"]').should('be.visible')
      cy.get('[data-testid="register-button"]').should('be.visible')

      // Should not show user menu
      cy.get('[data-testid="cart-button"]').should('not.exist')
      cy.get('[data-testid="orders-button"]').should('not.exist')
    })
  })

  describe('Protected Routes', () => {
    it('should show login message when accessing cart without authentication', () => {
      cy.visit('/cart')
      cy.get('h1').should('contain', 'Please Log In')
      cy.get('p').should('contain', 'You need to be logged in to view your cart')
    })

    it('should show login message when accessing checkout without authentication', () => {
      cy.visit('/checkout')
      cy.get('h1').should('contain', 'Please Log In')
      cy.get('p').should('contain', 'You need to be logged in to checkout')
    })

    it('should show login message when accessing orders without authentication', () => {
      cy.visit('/orders')
      cy.get('h1').should('contain', 'Please Log In')
      cy.get('p').should('contain', 'You need to be logged in to view your orders')
    })

    it('should allow access to protected routes after login', () => {
      cy.login('admin@modernstore.com', 'admin123')

      cy.visit('/cart')
      cy.url().should('include', '/cart')

      cy.visit('/orders')
      cy.url().should('include', '/orders')
    })
  })
})
