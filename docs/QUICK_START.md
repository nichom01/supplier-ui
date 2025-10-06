# Quick Start Guide - Mock API

## 🚀 Get Started in 3 Steps

### 1. Install Dependencies (if not already done)
```bash
npm install
```

### 2. Start Development Server
```bash
npm run dev
```

### 3. Open Browser
Navigate to `http://localhost:5173` (or the port shown in terminal)

You should see the message in browser console:
```
[MSW] Mocking enabled.
```

## ✅ Verify It's Working

### Test Product Management
1. Go to **Product Maintenance** page
2. You should see 3 sample products loaded from mock API
3. Try creating a new product
4. Try editing an existing product
5. Try deleting a product
6. Check Network tab - you'll see requests to `/api/products`

### Test Charts
1. Go to **Charting Page**
2. You should see various charts with data
3. Check Network tab - you'll see request to `/api/charts`

## 🎯 Make Your First API Call

### In a New Component

```typescript
import { useState, useEffect } from "react"
import { productsApi } from "@/services/api"
import { Product } from "@/types"

export default function MyComponent() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await productsApi.getAll()
        setProducts(data)
      } catch (error) {
        console.error('Failed to fetch:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) return <div>Loading...</div>

  return (
    <div>
      {products.map(product => (
        <div key={product.product_id}>{product.name}</div>
      ))}
    </div>
  )
}
```

## 🔧 Toggle Mock API On/Off

### Enable Mock API (Development)
Edit `.env`:
```bash
VITE_USE_MOCK_API=true
```

### Disable Mock API (Production)
Edit `.env`:
```bash
VITE_USE_MOCK_API=false
```

**Note:** After changing `.env`, restart the dev server.

## 📝 Add Your Own Mock Data

### 1. Define Type
Edit `src/types/index.ts`:
```typescript
export type Customer = {
  id: number
  name: string
  email: string
}
```

### 2. Create Mock Data
Create `src/mocks/data/customers.ts`:
```typescript
import { Customer } from "@/types"

export const mockCustomers: Customer[] = [
  { id: 1, name: "John Doe", email: "john@example.com" },
  { id: 2, name: "Jane Smith", email: "jane@example.com" },
]
```

### 3. Add Handler
Edit `src/mocks/handlers.ts`:
```typescript
import { mockCustomers } from './data/customers'

export const handlers = [
  // ... existing handlers

  http.get('/api/customers', async () => {
    await delay(300)
    return HttpResponse.json({ customers: mockCustomers })
  }),
]
```

### 4. Create API Service
Create `src/services/api/customers.ts`:
```typescript
import { Customer } from "@/types"

const API_BASE_URL = '/api'

export const customersApi = {
  async getAll(): Promise<Customer[]> {
    const response = await fetch(`${API_BASE_URL}/customers`)
    if (!response.ok) throw new Error('Failed to fetch')
    const data = await response.json()
    return data.customers
  },
}
```

### 5. Export Service
Edit `src/services/api/index.ts`:
```typescript
export { customersApi } from './customers'
```

### 6. Use in Component
```typescript
import { customersApi } from "@/services/api"

const customers = await customersApi.getAll()
```

## 🐛 Troubleshooting

### MSW Not Working?

**Check 1:** Is `VITE_USE_MOCK_API=true` in `.env`?
```bash
cat .env | grep VITE_USE_MOCK_API
```

**Check 2:** Is service worker file present?
```bash
ls -la public/mockServiceWorker.js
```

**Check 3:** Browser console shows MSW message?
Open DevTools → Console → Look for `[MSW] Mocking enabled`

**Check 4:** Restart dev server
```bash
# Stop current server (Ctrl+C)
npm run dev
```

### API Calls Not Being Intercepted?

**Check Network Tab:**
- Open DevTools → Network
- Look for requests to `/api/*`
- If they show 404, MSW might not be running
- If they show 200 with mock data, it's working!

**Check Handler Path:**
Make sure your handler path matches your API call:
```typescript
// Handler
http.get('/api/products', ...)

// Must match API call
fetch('/api/products')
```

### TypeScript Errors?

**Run type check:**
```bash
npm run build
```

**Common fixes:**
- Import types: `import { Product } from "@/types"`
- Export types: `export type Product = { ... }`
- Check API response types match defined types

## 📚 Next Steps

1. **Read full documentation:** `MOCK_API_SETUP.md`
2. **Understand architecture:** `ARCHITECTURE.md`
3. **See setup details:** `SETUP_SUMMARY.md`

## 💡 Pro Tips

### 1. Simulate Errors
```typescript
http.get('/api/products', async () => {
  // Simulate 500 error
  return new HttpResponse(null, { status: 500 })
})
```

### 2. Add Network Delay
```typescript
http.get('/api/products', async () => {
  await delay(2000) // 2 second delay
  return HttpResponse.json({ products })
})
```

### 3. Dynamic Responses
```typescript
let products = [...mockProducts]

http.post('/api/products', async ({ request }) => {
  const newProduct = await request.json()
  products.push(newProduct)
  return HttpResponse.json(newProduct, { status: 201 })
})
```

### 4. Use Browser DevTools
- **Network tab:** See all API calls
- **Console:** Check for MSW messages
- **Application → Service Workers:** Verify MSW is running

## 🎉 You're Ready!

Your application now has:
- ✅ Centralized mock data
- ✅ Type-safe API layer
- ✅ Realistic network simulation
- ✅ Easy toggle between mock/real API
- ✅ Maintainable code structure

Happy coding! 🚀
