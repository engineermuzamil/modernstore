// Test script to verify admin user restrictions
import fetch from 'node-fetch';

async function testAdminRestrictions() {
  const baseUrl = 'http://localhost:5000';
  
  console.log('Testing admin user restrictions...\n');

  // 1. Login as admin user
  console.log('1. Logging in as admin user...');
  const loginResponse = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: 'admin@modernstore.com',
      password: 'admin123'
    })
  });

  if (!loginResponse.ok) {
    console.error('Failed to login as admin user');
    return;
  }

  const loginData = await loginResponse.json();
  const adminToken = loginData.token;
  console.log('✓ Admin login successful');

  // 2. Try to access cart (should be restricted)
  console.log('\n2. Testing cart access...');
  const cartResponse = await fetch(`${baseUrl}/api/cart`, {
    headers: {
      'Authorization': `Bearer ${adminToken}`
    }
  });

  if (cartResponse.status === 403) {
    const errorData = await cartResponse.json();
    console.log('✓ Cart access correctly restricted:', errorData.message);
  } else {
    console.error('✗ Cart access should be restricted for admin users');
  }

  // 3. Try to add item to cart (should be restricted)
  console.log('\n3. Testing add to cart...');
  const addToCartResponse = await fetch(`${baseUrl}/api/cart`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${adminToken}`
    },
    body: JSON.stringify({
      productId: 'test-product-id',
      quantity: 1
    })
  });

  if (addToCartResponse.status === 403) {
    const errorData = await addToCartResponse.json();
    console.log('✓ Add to cart correctly restricted:', errorData.message);
  } else {
    console.error('✗ Add to cart should be restricted for admin users');
  }

  // 4. Try to access orders (should be restricted)
  console.log('\n4. Testing orders access...');
  const ordersResponse = await fetch(`${baseUrl}/api/orders`, {
    headers: {
      'Authorization': `Bearer ${adminToken}`
    }
  });

  if (ordersResponse.status === 403) {
    const errorData = await ordersResponse.json();
    console.log('✓ Orders access correctly restricted:', errorData.message);
  } else {
    console.error('✗ Orders access should be restricted for admin users');
  }

  // 5. Try to place an order (should be restricted)
  console.log('\n5. Testing order placement...');
  const orderResponse = await fetch(`${baseUrl}/api/orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${adminToken}`
    },
    body: JSON.stringify({
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@modernstore.com',
      address: '123 Admin St',
      city: 'Admin City',
      state: 'AS',
      zipCode: '12345'
    })
  });

  if (orderResponse.status === 403) {
    const errorData = await orderResponse.json();
    console.log('✓ Order placement correctly restricted:', errorData.message);
  } else {
    console.error('✗ Order placement should be restricted for admin users');
  }

  console.log('\n✅ All admin restrictions tests completed!');
}

testAdminRestrictions().catch(console.error);
