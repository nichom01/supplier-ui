# Mock API Architecture

## System Flow

```
┌─────────────────────────────────────────────────────────────┐
│                         Browser                              │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │                React Components                         │ │
│  │                                                          │ │
│  │  ┌──────────────────┐      ┌───────────────────────┐  │ │
│  │  │ ProductMaintenance│      │      Chart.tsx        │  │ │
│  │  │      .tsx         │      │                       │  │ │
│  │  └─────────┬─────────┘      └──────────┬────────────┘  │ │
│  │            │                            │               │ │
│  │            └────────────┬───────────────┘               │ │
│  │                         │                               │ │
│  │                         ▼                               │ │
│  │            ┌────────────────────────┐                   │ │
│  │            │   API Service Layer    │                   │ │
│  │            │  src/services/api/     │                   │ │
│  │            │  - productsApi         │                   │ │
│  │            │  - chartsApi           │                   │ │
│  │            └────────────┬───────────┘                   │ │
│  │                         │                               │ │
│  │                         │ fetch('/api/...')             │ │
│  │                         ▼                               │ │
│  └────────────────────────────────────────────────────────┘ │
│                            │                                 │
│  ┌────────────────────────┼────────────────────────────────┐│
│  │         MSW Service Worker (if VITE_USE_MOCK_API=true)  ││
│  │                         │                                ││
│  │         ┌───────────────▼──────────────┐                ││
│  │         │  Request Interceptor         │                ││
│  │         │  src/mocks/handlers.ts       │                ││
│  │         └───────────────┬──────────────┘                ││
│  │                         │                                ││
│  │                         ▼                                ││
│  │         ┌──────────────────────────────┐                ││
│  │         │      Mock Data Store         │                ││
│  │         │   src/mocks/data/            │                ││
│  │         │   - products.ts              │                ││
│  │         │   - charts.ts                │                ││
│  │         └──────────────┬───────────────┘                ││
│  │                        │                                 ││
│  │                        │ Mock Response                   ││
│  │                        ▼                                 ││
│  │         ┌──────────────────────────────┐                ││
│  │         │    HTTP Response (JSON)      │                ││
│  │         └──────────────────────────────┘                ││
│  └─────────────────────────────────────────────────────────┘│
│                            │                                 │
│                            │ (Response back to fetch)        │
│                            ▼                                 │
│                    [Component receives data]                 │
└──────────────────────────────────────────────────────────────┘
```

## Directory Structure

```
src/
├── types/
│   └── index.ts                    # Centralized TypeScript types
│       ├── Product
│       ├── MonthlyChartData
│       ├── DailyChartData
│       ├── RadarChartData
│       ├── PieChartData
│       └── API Response types
│
├── mocks/
│   ├── browser.ts                  # MSW worker configuration
│   │   └── setupWorker(handlers)
│   │
│   ├── handlers.ts                 # API route handlers
│   │   ├── GET /api/products
│   │   ├── GET /api/products/:id
│   │   ├── POST /api/products
│   │   ├── PUT /api/products/:id
│   │   ├── DELETE /api/products/:id
│   │   └── GET /api/charts
│   │
│   └── data/
│       ├── products.ts             # Mock product data
│       │   └── mockProducts[]
│       │
│       └── charts.ts               # Mock chart data
│           ├── mockMonthlyChartData[]
│           ├── mockDailyChartData[]
│           ├── mockRadarChartData[]
│           └── mockPieChartData[]
│
├── services/
│   └── api/
│       ├── index.ts                # Export all API services
│       │
│       ├── products.ts             # Product API client
│       │   ├── getAll()
│       │   ├── getById(id)
│       │   ├── create(product)
│       │   ├── update(id, product)
│       │   └── delete(id)
│       │
│       └── charts.ts               # Charts API client
│           └── getChartData()
│
├── pages/
│   ├── ProductMaintenance.tsx      # Uses productsApi
│   │   ├── useEffect → productsApi.getAll()
│   │   ├── handleSubmit → productsApi.create/update()
│   │   └── handleDelete → productsApi.delete()
│   │
│   └── Chart.tsx                   # Uses chartsApi
│       └── useEffect → chartsApi.getChartData()
│
└── main.tsx                        # App entry point
    └── enableMocking()             # Start MSW if VITE_USE_MOCK_API=true
```

## Data Flow Example: Creating a Product

```
┌──────────────────────────────────────────────────────────────┐
│ 1. User fills form in ProductMaintenance.tsx                 │
│    and clicks "Create Product"                               │
└────────────────────────┬─────────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────────┐
│ 2. Component calls:                                           │
│    productsApi.create(formData)                              │
└────────────────────────┬─────────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────────┐
│ 3. Service makes HTTP request:                               │
│    fetch('/api/products', {                                  │
│      method: 'POST',                                          │
│      body: JSON.stringify(product)                           │
│    })                                                         │
└────────────────────────┬─────────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────────┐
│ 4. MSW intercepts request (if VITE_USE_MOCK_API=true)       │
│    http.post('/api/products', handler)                       │
└────────────────────────┬─────────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────────┐
│ 5. Handler:                                                   │
│    - Parses request body                                     │
│    - Generates product_id                                    │
│    - Adds to in-memory products array                        │
│    - Returns HttpResponse.json(newProduct, {status: 201})   │
└────────────────────────┬─────────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────────┐
│ 6. Service receives response and returns data                │
└────────────────────────┬─────────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────────┐
│ 7. Component updates state:                                  │
│    setProducts([...products, newProduct])                    │
└────────────────────────┬─────────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────────┐
│ 8. UI re-renders with new product in list                   │
└──────────────────────────────────────────────────────────────┘
```

## Type Safety Flow

```
┌─────────────────────────────────────────────────────────┐
│                    src/types/index.ts                    │
│                                                          │
│  export type Product = {                                │
│    product_id?: number                                  │
│    sku: string                                          │
│    name: string                                         │
│    ...                                                  │
│  }                                                      │
└───────────────┬─────────────────────────────────────────┘
                │
                ├──────────────────────────────────────┐
                │                                      │
                ▼                                      ▼
┌──────────────────────────┐         ┌──────────────────────────┐
│   Mock Data (typed)      │         │   API Service (typed)    │
│   src/mocks/data/        │         │   src/services/api/      │
│                          │         │                          │
│   mockProducts: Product[]│         │   async getAll():        │
│                          │         │     Promise<Product[]>   │
└────────────┬─────────────┘         └────────────┬─────────────┘
             │                                    │
             │                                    │
             └────────────┬───────────────────────┘
                          │
                          ▼
                ┌──────────────────────┐
                │  Components (typed)  │
                │  src/pages/          │
                │                      │
                │  const [products,    │
                │    setProducts]      │
                │      = useState<     │
                │        Product[]>([])│
                └──────────────────────┘
```

## Environment-Based Routing

```
                    App Startup
                        │
                        ▼
        ┌───────────────────────────────┐
        │  Check VITE_USE_MOCK_API      │
        └───────────────┬───────────────┘
                        │
        ┌───────────────┴───────────────┐
        │                               │
        ▼                               ▼
   [true]                           [false]
        │                               │
        ▼                               ▼
┌───────────────┐              ┌────────────────┐
│  Start MSW    │              │  Skip MSW      │
│  Worker       │              │  Initialization│
└───────┬───────┘              └────────┬───────┘
        │                               │
        ▼                               ▼
┌───────────────┐              ┌────────────────┐
│ API calls     │              │ API calls      │
│ intercepted   │              │ go to real     │
│ by MSW        │              │ backend        │
│               │              │                │
│ Mock data     │              │ Real data      │
│ returned      │              │ returned       │
└───────────────┘              └────────────────┘
```

## Component-Service-Mock Integration

```
┌─────────────────────────────────────────────────────────┐
│              ProductMaintenance.tsx                      │
│                                                          │
│  useEffect(() => {                                      │
│    const fetchProducts = async () => {                 │
│      const data = await productsApi.getAll()           │
│      setProducts(data)                                 │
│    }                                                    │
│    fetchProducts()                                     │
│  }, [])                                                │
└──────────────────────┬──────────────────────────────────┘
                       │
                       │ Async call
                       ▼
┌─────────────────────────────────────────────────────────┐
│           src/services/api/products.ts                  │
│                                                          │
│  export const productsApi = {                          │
│    async getAll(): Promise<Product[]> {                │
│      const response = await fetch('/api/products')    │
│      const data = await response.json()                │
│      return data.products                              │
│    }                                                    │
│  }                                                      │
└──────────────────────┬──────────────────────────────────┘
                       │
                       │ HTTP Request
                       ▼
┌─────────────────────────────────────────────────────────┐
│              MSW Handler Intercepts                     │
│           src/mocks/handlers.ts                         │
│                                                          │
│  http.get('/api/products', async () => {               │
│    await delay(300)  // Simulate network               │
│    return HttpResponse.json({ products })              │
│  })                                                     │
└──────────────────────┬──────────────────────────────────┘
                       │
                       │ Returns mock data
                       ▼
┌─────────────────────────────────────────────────────────┐
│              src/mocks/data/products.ts                 │
│                                                          │
│  export const mockProducts: Product[] = [              │
│    { product_id: 1, sku: "ELEC-001", ... },           │
│    { product_id: 2, sku: "FURN-045", ... },           │
│    { product_id: 3, sku: "CLTH-102", ... }            │
│  ]                                                      │
└─────────────────────────────────────────────────────────┘
```

## Key Advantages

### 1. Separation of Concerns
- **Types**: Define data structure
- **Mock Data**: Provide test data
- **Handlers**: Define API behavior
- **Services**: Provide clean API interface
- **Components**: Use data without knowing source

### 2. Type Safety
- TypeScript enforces types throughout
- Compile-time errors for type mismatches
- IntelliSense for all API calls

### 3. Maintainability
- Change mock data in one place
- Update API interface in service layer
- Components remain unchanged

### 4. Testability
- MSW works in tests
- Same handlers for dev and test
- Predictable data responses

### 5. Flexibility
- Toggle between mock and real API
- Add new endpoints easily
- Simulate network delays and errors
