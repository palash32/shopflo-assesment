export const USERS = {
  STANDARD:           { username: 'standard_user',          password: 'secret_sauce' },
  LOCKED_OUT:         { username: 'locked_out_user',         password: 'secret_sauce' },
  PROBLEM:            { username: 'problem_user',             password: 'secret_sauce' },
  PERFORMANCE_GLITCH: { username: 'performance_glitch_user', password: 'secret_sauce' },
  ERROR_USER:         { username: 'error_user',               password: 'secret_sauce' },
  VISUAL:             { username: 'visual_user',              password: 'secret_sauce' },
} as const;

export const INVALID_CREDS = {
  WRONG_PASSWORD:   { username: 'standard_user',  password: 'wrong_password' },
  WRONG_USERNAME:   { username: 'ghost_user',      password: 'secret_sauce'  },
  EMPTY_BOTH:       { username: '',                password: ''              },
  EMPTY_USERNAME:   { username: '',                password: 'secret_sauce'  },
  EMPTY_PASSWORD:   { username: 'standard_user',   password: ''              },
} as const;

export const ERROR_MSGS = {
  LOCKED_OUT:    'Epic sadface: Sorry, this user has been locked out.',
  USERNAME_REQ:  'Epic sadface: Username is required',
  PASSWORD_REQ:  'Epic sadface: Password is required',
  MISMATCH:      'Epic sadface: Username and password do not match any user in this service',
  INVENTORY_BYPASS: "Epic sadface: You can only access '/inventory.html' when you are logged in.",
} as const;

export const CHECKOUT = {
  VALID:   { firstName: 'Test', lastName: 'User',  postalCode: '12345' },
  INVALID: {
    EMPTY_FIRST:  { firstName: '',    lastName: 'User',  postalCode: '12345' },
    EMPTY_LAST:   { firstName: 'Test', lastName: '',      postalCode: '12345' },
    EMPTY_ZIP:    { firstName: 'Test', lastName: 'User',  postalCode: ''      },
    ALL_EMPTY:    { firstName: '',    lastName: '',      postalCode: ''      },
  },
} as const;

export const CHECKOUT_ERRORS = {
  FIRST_NAME:   'Error: First Name is required',
  LAST_NAME:    'Error: Last Name is required',
  POSTAL_CODE:  'Error: Postal Code is required',
} as const;

export const PRODUCTS = {
  BACKPACK:       { name: 'Sauce Labs Backpack',             price: 29.99 },
  BIKE_LIGHT:     { name: 'Sauce Labs Bike Light',           price: 9.99  },
  BOLT_T_SHIRT:   { name: 'Sauce Labs Bolt T-Shirt',         price: 15.99 },
  FLEECE_JACKET:  { name: 'Sauce Labs Fleece Jacket',        price: 49.99 },
  ONESIE:         { name: 'Sauce Labs Onesie',               price: 7.99  },
  RED_T_SHIRT:    { name: 'Test.allTheThings() T-Shirt (Red)', price: 15.99 },
} as const;

export const URLS = {
  BASE:              'https://www.saucedemo.com',
  INVENTORY:         '/inventory.html',
  CART:              '/cart.html',
  CHECKOUT_STEP_ONE: '/checkout-step-one.html',
  CHECKOUT_STEP_TWO: '/checkout-step-two.html',
  CHECKOUT_COMPLETE: '/checkout-complete.html',
} as const;
