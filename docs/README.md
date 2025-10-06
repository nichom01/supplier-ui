# Mock API Documentation

This folder contains comprehensive documentation for the centralized mock API system.

## 📚 Documentation Files

### 🚀 [QUICK_START.md](./QUICK_START.md)
**Start here!** Get up and running in 3 steps. Includes:
- How to verify the setup is working
- Your first API call
- Quick troubleshooting tips
- Pro tips for development

### 📖 [MOCK_API_SETUP.md](./MOCK_API_SETUP.md)
**Complete technical guide.** Everything you need to know:
- How MSW works
- Architecture overview
- Adding new endpoints
- Switching to real API
- Testing strategies
- Troubleshooting guide

### 🏗️ [ARCHITECTURE.md](./ARCHITECTURE.md)
**Visual architecture guide.** Understand the system:
- System flow diagrams
- Directory structure
- Data flow examples
- Component-service-mock integration
- Type safety flow

### 📊 [BEFORE_AFTER.md](./BEFORE_AFTER.md)
**See the transformation.** Compare old vs new:
- Code before centralization
- Code after centralization
- Benefits comparison table
- Migration path
- Real examples

### 📋 [SETUP_SUMMARY.md](./SETUP_SUMMARY.md)
**Implementation overview.** What was created:
- Files created
- Files modified
- Key features
- API endpoints available
- Benefits achieved

## 🎯 Quick Navigation

### I want to...

- **Get started quickly** → [QUICK_START.md](./QUICK_START.md)
- **Understand how it works** → [ARCHITECTURE.md](./ARCHITECTURE.md)
- **Add a new API endpoint** → [MOCK_API_SETUP.md](./MOCK_API_SETUP.md#adding-new-api-endpoints)
- **See what changed** → [BEFORE_AFTER.md](./BEFORE_AFTER.md)
- **Switch to real API** → [MOCK_API_SETUP.md](./MOCK_API_SETUP.md#switching-to-real-api)
- **Troubleshoot issues** → [QUICK_START.md](./QUICK_START.md#-troubleshooting)
- **See all features** → [SETUP_SUMMARY.md](./SETUP_SUMMARY.md)

## 🔑 Key Concepts

### What is MSW?
MSW (Mock Service Worker) intercepts HTTP requests at the network level in your browser. When enabled, all API calls are caught and responded to with mock data, making it feel like you're talking to a real backend.

### Why Centralized?
Instead of having mock data scattered across your components, everything lives in one place:
- `src/mocks/data/` - All mock data
- `src/mocks/handlers.ts` - API behavior
- `src/services/api/` - Clean API interface

### How to Toggle?
Simply set `VITE_USE_MOCK_API` in your `.env` file:
- `true` = Use mock API (development)
- `false` = Use real API (production)

## 🎓 Learning Path

1. **Day 1:** Read [QUICK_START.md](./QUICK_START.md) and get it running
2. **Day 2:** Study [ARCHITECTURE.md](./ARCHITECTURE.md) to understand the structure
3. **Day 3:** Review [BEFORE_AFTER.md](./BEFORE_AFTER.md) to see the benefits
4. **Day 4:** Deep dive into [MOCK_API_SETUP.md](./MOCK_API_SETUP.md) for advanced usage
5. **Reference:** Keep [SETUP_SUMMARY.md](./SETUP_SUMMARY.md) handy for quick lookups

## 💡 Common Tasks

### Add a New Entity (e.g., Customer)

1. Define type in `src/types/index.ts`
2. Create mock data in `src/mocks/data/customers.ts`
3. Add handlers in `src/mocks/handlers.ts`
4. Create service in `src/services/api/customers.ts`
5. Use in components: `import { customersApi } from "@/services/api"`

See [MOCK_API_SETUP.md](./MOCK_API_SETUP.md#adding-new-api-endpoints) for detailed instructions.

### Simulate Error Responses

```typescript
http.get('/api/products', () => {
  return new HttpResponse(null, { status: 500 })
})
```

### Add Network Delay

```typescript
http.get('/api/products', async () => {
  await delay(2000) // 2 seconds
  return HttpResponse.json({ products })
})
```

## 🔗 External Resources

- [MSW Official Docs](https://mswjs.io/docs/)
- [MSW Examples](https://github.com/mswjs/examples)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [React Query + MSW](https://tkdodo.eu/blog/testing-react-query#mock-service-worker)

## 📞 Need Help?

1. Check [QUICK_START.md](./QUICK_START.md#-troubleshooting)
2. Review [MOCK_API_SETUP.md](./MOCK_API_SETUP.md#troubleshooting)
3. Check browser console for MSW messages
4. Open Network tab in DevTools

## ✨ What's Next?

Once you're comfortable with the mock API:
- Add authentication simulation
- Create more complex API scenarios
- Add request/response validation
- Set up MSW for tests
- Gradually migrate to real backend

Happy coding! 🚀
