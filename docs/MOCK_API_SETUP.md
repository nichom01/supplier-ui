# Mock API Setup Documentation

This document explains the centralized mock API system implemented using MSW (Mock Service Worker).

## Overview

The application now uses a single centralized location for all mock data and API mocking, eliminating the need for mock data scattered across individual pages.

## Architecture

```
src/
├── types/
│   └── index.ts                    # TypeScript type definitions
├── mocks/
│   ├── browser.ts                  # MSW browser worker setup
│   ├── handlers.ts                 # API endpoint handlers
│   └── data/
│       ├── products.ts             # Mock product data
│       └── charts.ts               # Mock chart data
├── services/
│   └── api/
│       ├── index.ts                # API services export
│       ├── products.ts             # Product API service
│       └── charts.ts               # Chart API service
└── pages/
    ├── ProductMaintenance.tsx      # Uses productsApi
    └── Chart.tsx                   # Uses chartsApi
```

## How It Works

### 1. Mock Service Worker (MSW)

MSW intercepts HTTP requests at the network level in the browser. When `VITE_USE_MOCK_API=true`, all API calls are intercepted and responded to with mock data.

**Benefits:**
- No changes needed to your API calling code
- Works with any HTTP client (fetch, axios, etc.)
- Realistic network delays can be simulated
- Easy to toggle on/off

### 2. Centralized Mock Data

All mock data lives in `src/mocks/data/`:
- `products.ts` - Product catalog mock data
- `charts.ts` - Chart data for visualizations

### 3. API Handlers

`src/mocks/handlers.ts` defines all API endpoints:
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product
- `GET /api/charts` - Get chart data

### 4. API Service Layer

`src/services/api/` contains typed API client functions:
- `productsApi.getAll()` - Fetch all products
- `productsApi.getById(id)` - Fetch single product
- `productsApi.create(product)` - Create new product
- `productsApi.update(id, product)` - Update product
- `productsApi.delete(id)` - Delete product
- `chartsApi.getChartData()` - Fetch chart data

## Configuration

### Enable/Disable Mock API

Set the environment variable in `.env`:

```bash
# Enable mock API (development mode)
VITE_USE_MOCK_API=true

# Disable mock API (use real backend)
VITE_USE_MOCK_API=false
```

### Network Delays

MSW handlers include realistic network delays:
- GET requests: 200-500ms
- POST/PUT/DELETE: 300-400ms

Adjust these in `src/mocks/handlers.ts`:

```typescript
await delay(300) // milliseconds
```

## Usage in Components

### Example: Fetching Products

```typescript
import { productsApi } from "@/services/api"
import { Product } from "@/types"

function MyComponent() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await productsApi.getAll()
        setProducts(data)
      } catch (error) {
        console.error('Failed to fetch products:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [])

  // ... rest of component
}
```

### Example: Creating a Product

```typescript
const handleCreate = async (formData: Omit<Product, 'product_id'>) => {
  try {
    const newProduct = await productsApi.create(formData)
    setProducts([...products, newProduct])
  } catch (error) {
    console.error('Failed to create product:', error)
  }
}
```

## Adding New API Endpoints

### 1. Define Types

Add types to `src/types/index.ts`:

```typescript
export type MyEntity = {
  id: number
  name: string
}
```

### 2. Create Mock Data

Create `src/mocks/data/myentity.ts`:

```typescript
import { MyEntity } from "@/types"

export const mockMyEntities: MyEntity[] = [
  { id: 1, name: "Entity 1" },
  { id: 2, name: "Entity 2" },
]
```

### 3. Add Handler

Add to `src/mocks/handlers.ts`:

```typescript
import { mockMyEntities } from './data/myentity'

export const handlers = [
  // ... existing handlers

  http.get('/api/myentities', async () => {
    await delay(300)
    return HttpResponse.json({ entities: mockMyEntities })
  }),
]
```

### 4. Create API Service

Create `src/services/api/myentity.ts`:

```typescript
import { MyEntity } from "@/types"

const API_BASE_URL = '/api'

export const myEntityApi = {
  async getAll(): Promise<MyEntity[]> {
    const response = await fetch(`${API_BASE_URL}/myentities`)
    if (!response.ok) {
      throw new Error('Failed to fetch entities')
    }
    const data = await response.json()
    return data.entities
  },
}
```

### 5. Export from Index

Add to `src/services/api/index.ts`:

```typescript
export { myEntityApi } from './myentity'
```

## Switching to Real API

When you're ready to connect to a real backend:

1. Update `.env`:
   ```bash
   VITE_USE_MOCK_API=false
   ```

2. Update `src/services/api/*.ts` to point to real API base URL:
   ```typescript
   const API_BASE_URL = import.meta.env.VITE_API_URL || '/api'
   ```

3. Add authentication headers if needed:
   ```typescript
   const response = await fetch(`${API_BASE_URL}/products`, {
     headers: {
       'Authorization': `Bearer ${token}`,
       'Content-Type': 'application/json',
     }
   })
   ```

## Testing with MSW

MSW works in both browser and Node.js, making it perfect for testing:

```typescript
// test setup
import { setupServer } from 'msw/node'
import { handlers } from '@/mocks/handlers'

const server = setupServer(...handlers)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())
```

## Troubleshooting

### MSW Not Intercepting Requests

1. Check browser console for `[MSW] Mocking enabled` message
2. Verify `VITE_USE_MOCK_API=true` in `.env`
3. Ensure `public/mockServiceWorker.js` exists
4. Clear browser cache and reload

### TypeScript Errors

1. Ensure all imports use `@/` path alias
2. Check that types are exported from `src/types/index.ts`
3. Verify `tsconfig.json` includes path mapping

### API Calls Failing

1. Check Network tab in browser DevTools
2. Verify endpoint paths match handlers in `src/mocks/handlers.ts`
3. Look for error messages in console

## Additional Resources

- [MSW Documentation](https://mswjs.io/docs/)
- [MSW Examples](https://github.com/mswjs/examples)
- [TypeScript Best Practices](https://www.typescriptlang.org/docs/handbook/declaration-files/do-s-and-don-ts.html)
