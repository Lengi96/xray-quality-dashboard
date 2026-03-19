import { RawRequirement } from '../../types'

const EPIC_NAMES = [
  'User Authentication & Authorization',    // DEMO-1
  'Product Catalog Management',             // DEMO-2
  'Shopping Cart & Checkout',              // DEMO-3
  'Order Management',                      // DEMO-4
  'Payment Processing',                    // DEMO-5
  'Search & Filtering',                    // DEMO-6
  'Reviews & Ratings',                     // DEMO-7
  'User Profile Management',               // DEMO-8
  'Admin Dashboard',                       // DEMO-9
  'Notifications & Emails',               // DEMO-10
  'Inventory Management',                  // DEMO-11
  'Reporting & Analytics',                 // DEMO-12
  'Mobile App Support',                    // DEMO-13
  'Performance Optimization',              // DEMO-14
  'Security Hardening',                    // DEMO-15
  'API Integration Layer',                 // DEMO-16
  'Content Management',                    // DEMO-17
  'Customer Support',                      // DEMO-18
  'Promotions & Discounts',               // DEMO-19
  'Shipping & Delivery',                   // DEMO-20
]

const EPIC_STATUSES = [
  'In Progress', 'In Progress', 'In Progress', 'In Progress', 'In Progress',
  'In Progress', 'In Progress', 'In Progress', 'In Progress', 'In Progress',
  'Open', 'Open', 'Open', 'Open', 'Open',
  'Open', 'In Review', 'Open', 'In Progress', 'In Progress',
]

// 3 stories per epic = 60 stories (DEMO-21 to DEMO-80)
// epicIndex 0..19 → epicKey DEMO-1 .. DEMO-20
const STORY_TITLES: string[][] = [
  // Epic 1: User Auth
  [
    'As a user, I want to log in with email and password',
    'As a user, I want to reset my password via email',
    'As an admin, I want to manage user roles and permissions',
  ],
  // Epic 2: Product Catalog
  [
    'As a user, I want to browse products by category',
    'As a user, I want to view detailed product information',
    'As an admin, I want to add and edit product listings',
  ],
  // Epic 3: Shopping Cart
  [
    'As a user, I want to add items to my shopping cart',
    'As a user, I want to update item quantities in cart',
    'As a user, I want to proceed to checkout from cart',
  ],
  // Epic 4: Order Management
  [
    'As a user, I want to view my order history',
    'As a user, I want to track my current order status',
    'As an admin, I want to process and fulfill orders',
  ],
  // Epic 5: Payment Processing
  [
    'As a user, I want to pay with credit or debit card',
    'As a user, I want to save payment methods for future use',
    'As a user, I want to receive payment confirmation emails',
  ],
  // Epic 6: Search & Filtering
  [
    'As a user, I want to search products by keyword',
    'As a user, I want to filter search results by price range',
    'As a user, I want to sort search results by relevance',
  ],
  // Epic 7: Reviews & Ratings
  [
    'As a user, I want to leave a review on a purchased product',
    'As a user, I want to rate products with a star rating',
    'As a user, I want to read other customers\' reviews',
  ],
  // Epic 8: User Profile
  [
    'As a user, I want to update my personal information',
    'As a user, I want to manage my shipping addresses',
    'As a user, I want to view my wishlist',
  ],
  // Epic 9: Admin Dashboard
  [
    'As an admin, I want to view a sales overview dashboard',
    'As an admin, I want to manage customer accounts',
    'As an admin, I want to configure site settings',
  ],
  // Epic 10: Notifications
  [
    'As a user, I want to receive order status email notifications',
    'As a user, I want to opt in to promotional emails',
    'As an admin, I want to send bulk email campaigns',
  ],
  // Epic 11: Inventory
  [
    'As an admin, I want to track product stock levels',
    'As an admin, I want to receive low stock alerts',
    'As an admin, I want to manage product variants',
  ],
  // Epic 12: Reporting
  [
    'As an admin, I want to generate monthly sales reports',
    'As an admin, I want to export customer data to CSV',
    'As an admin, I want to view conversion funnel analytics',
  ],
  // Epic 13: Mobile App
  [
    'As a user, I want to use the mobile app on iOS',
    'As a user, I want to use the mobile app on Android',
    'As a user, I want push notifications on my mobile device',
  ],
  // Epic 14: Performance
  [
    'As a user, I want pages to load in under 2 seconds',
    'As a user, I want search results to appear instantly',
    'As an admin, I want to monitor site performance metrics',
  ],
  // Epic 15: Security
  [
    'As a user, I want my data encrypted at rest and in transit',
    'As an admin, I want to enforce two-factor authentication',
    'As an admin, I want to audit user login history',
  ],
  // Epic 16: API Integration (uncovered epics start here)
  [
    'As a developer, I want to integrate with third-party payment APIs',
    'As a developer, I want to consume the product catalog via REST API',
    'As a developer, I want OAuth2 authentication for API access',
  ],
  // Epic 17: Content Management
  [
    'As an admin, I want to manage homepage banner content',
    'As an admin, I want to publish and schedule blog posts',
    'As an admin, I want to manage static pages like About Us',
  ],
  // Epic 18: Customer Support
  [
    'As a user, I want to submit a support ticket',
    'As an admin, I want to respond to customer support tickets',
    'As a user, I want to access a help center knowledge base',
  ],
  // Epic 19: Promotions
  [
    'As an admin, I want to create discount coupon codes',
    'As a user, I want to apply a coupon code at checkout',
    'As an admin, I want to configure buy-one-get-one promotions',
  ],
  // Epic 20: Shipping
  [
    'As a user, I want to choose a shipping method at checkout',
    'As an admin, I want to configure shipping rates by region',
    'As a user, I want to track my shipment with a tracking number',
  ],
]

const STORY_PRIORITIES = ['Critical', 'High', 'High', 'Medium', 'Medium', 'Medium', 'Low']
const STORY_STATUSES = ['In Progress', 'Open', 'Done', 'In Review', 'Open', 'In Progress', 'Done']
const ASSIGNEES = ['alice@demo.com', 'bob@demo.com', 'carol@demo.com', 'dave@demo.com', 'eve@demo.com']
const COMPONENTS = [
  ['frontend', 'auth'],
  ['backend', 'catalog'],
  ['frontend', 'cart'],
  ['backend', 'orders'],
  ['backend', 'payments'],
  ['frontend', 'search'],
  ['frontend', 'reviews'],
  ['frontend', 'profile'],
  ['backend', 'admin'],
  ['backend', 'notifications'],
]

function epicKey(epicIndex: number): string {
  return `DEMO-${epicIndex + 1}`
}

function storyKey(epicIndex: number, storyIndex: number): string {
  // Stories start at DEMO-21; 3 per epic
  return `DEMO-${21 + epicIndex * 3 + storyIndex}`
}

function isoDate(daysAgo: number): string {
  const d = new Date()
  d.setDate(d.getDate() - daysAgo)
  return d.toISOString()
}

// Build epics: DEMO-1 to DEMO-20
const epics: RawRequirement[] = EPIC_NAMES.map((name, i) => ({
  externalId: epicKey(i),
  title: name,
  type: 'EPIC',
  status: EPIC_STATUSES[i],
  priority: i < 10 ? 'High' : 'Medium',
  assignee: ASSIGNEES[i % ASSIGNEES.length],
  labels: ['epic'],
  components: COMPONENTS[i % COMPONENTS.length],
  updatedAt: isoDate(i * 2),
}))

// Build stories: DEMO-21 to DEMO-80
const stories: RawRequirement[] = []
for (let epicIndex = 0; epicIndex < 20; epicIndex++) {
  for (let storyIndex = 0; storyIndex < 3; storyIndex++) {
    const globalStoryIndex = epicIndex * 3 + storyIndex
    stories.push({
      externalId: storyKey(epicIndex, storyIndex),
      title: STORY_TITLES[epicIndex][storyIndex],
      type: 'STORY',
      status: STORY_STATUSES[globalStoryIndex % STORY_STATUSES.length],
      priority: STORY_PRIORITIES[globalStoryIndex % STORY_PRIORITIES.length],
      epicKey: epicKey(epicIndex),
      assignee: ASSIGNEES[globalStoryIndex % ASSIGNEES.length],
      labels: ['story'],
      components: COMPONENTS[epicIndex % COMPONENTS.length],
      updatedAt: isoDate(globalStoryIndex),
    })
  }
}

export const MOCK_REQUIREMENTS: RawRequirement[] = [...epics, ...stories]
