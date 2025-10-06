# Hire Product Feature - Implementation Summary

## Overview
Implemented a comprehensive hire product feature that allows products to be available for daily rental. Each instance of a hire product is its own asset with a calendar of availability. Only one customer can hire an asset at a time.

## Changes Made

### 1. Data Model Updates (`src/types/index.ts`)

#### Product Type
- Added `product_type: 'sale' | 'hire'` to distinguish between sale and hire products
- Added `daily_hire_rate?: number` for hire products

#### SalesOrderLine Type
- Added `line_type?: 'sale' | 'hire'` to distinguish line types
- Added `asset_id?: number` to link hire lines to specific assets
- Added `hire_start_date?: string` and `hire_end_date?: string` for hire periods
- Note: For hire products, `quantity_ordered` represents the number of days

#### New Asset Types
- **Asset**: Represents a physical instance of a hire product with fields:
  - `asset_id`, `product_id`, `asset_tag`, `serial_number`
  - `status`: 'available' | 'on_hire' | 'maintenance' | 'retired'
  - `purchase_date`, `condition`: 'new' | 'good' | 'fair' | 'poor'

- **AssetAvailability**: Tracks asset availability per date
  - `asset_id`, `date`, `is_available`, `sales_order_id`

#### CartItem Updates
- Added `hire_start_date?: string`, `hire_end_date?: string`, `asset_id?: number`

### 2. Mock Data (`src/mocks/data/`)

#### Products (`products.ts`)
- Updated all existing products with `product_type: "sale"`
- Added three hire products:
  - Professional Projector (£75/day)
  - DSLR Camera Kit (£120/day)
  - Event Tent 6x6m (£200/day)

#### Assets (`assets.ts` - NEW)
- Created 8 mock assets across the three hire products
- Each asset has unique asset_tag, serial_number, and condition
- Includes mock availability data showing Asset 7 (TENT-001-B) on hire Oct 10-15, 2025

### 3. API Services

#### Assets API (`src/services/api/assets.ts` - NEW)
- `getByProductId(productId)` - Get all assets for a product
- `getById(assetId)` - Get specific asset
- `checkAvailability(productId, startDate, endDate)` - Find available assets for date range
- `getAssetAvailability(assetId, startDate, endDate)` - Get availability calendar for asset

#### Cart API (`src/services/api/cart.ts`)
- Updated `addToCart()` to accept hire-specific parameters: `hire_start_date`, `hire_end_date`, `asset_id`

### 4. MSW Mock Handlers (`src/mocks/handlers.ts`)

#### New Asset Endpoints
- `GET /api/assets?product_id=X` - Get assets by product
- `GET /api/assets/:id` - Get single asset
- `GET /api/assets/availability?product_id=X&start_date=Y&end_date=Z` - Check availability
- `GET /api/assets/:id/availability?start_date=Y&end_date=Z` - Get asset availability calendar

#### Updated Cart Endpoints
- Modified all cart endpoints to handle hire products correctly
- Cart total calculation now considers both sale prices and daily hire rates
- Hire products create separate cart items (no quantity merging)

### 5. User Interface

#### Hire Product Detail Page (`src/pages/HireProductDetail.tsx` - NEW)
- Dedicated page for hire products with route `/hire-products/:id`
- **Date Picker Integration**:
  - Uses `react-day-picker` for date range selection
  - Disables dates before tomorrow
  - Shows start date, end date, and calculated days
- **Real-time Availability Check**:
  - Automatically checks availability when dates selected
  - Shows available assets with their condition
  - Displays asset selection UI
- **Pricing Display**:
  - Shows daily hire rate
  - Calculates and displays total based on selected days
- **Actions**:
  - "Add to Cart" - Adds hire item to cart
  - "Book Now" - Adds to cart and navigates to cart page

#### Products Page (`src/pages/Products.tsx`)
- Updated to show different pricing display for hire products (£X/day)
- Shows "Book Now" button for hire products instead of "Add to Cart"
- Routes to appropriate detail page based on product type

#### Router (`src/Router.tsx`)
- Added new route: `/hire-products/:id` → `HireProductDetail`

#### Product Maintenance (`src/pages/ProductMaintenance.tsx`)
- Updated form to include `product_type: "sale"` by default

### 6. Context Updates

#### CartContext (`src/contexts/CartContext.tsx`)
- Updated `addToCart()` signature to accept hire parameters
- Maintains backward compatibility for sale products

### 7. Dependencies
Added packages:
- `react-day-picker` - Date picker component
- `date-fns` - Date manipulation utilities

## Technical Decisions

### Asset-per-Instance Model
Each hire product has multiple assets, each representing a physical instance. This allows:
- Tracking individual item condition and maintenance
- Asset-specific availability calendars
- Proper booking management (one asset = one customer at a time)

### Date Range as Quantity
For hire products, `quantity_ordered` represents the number of days hired. This simplifies:
- Pricing calculations (days × daily_hire_rate)
- Order line interpretation
- Integration with existing sales order structure

### Separate Routes
Hire products use a dedicated route (`/hire-products/:id`) and component. This:
- Keeps the hire booking UI specialized without cluttering the sale product page
- Makes it clear to users they're booking a hire product
- Allows independent evolution of sale vs hire UX

### Real-time Availability
Availability is checked immediately when dates are selected, providing:
- Instant feedback to users
- Prevention of overbooking
- Clear asset selection with condition information

## Testing the Feature

1. Start dev server: `npm run dev`
2. Navigate to Products page
3. Look for hire products (they show "£X / day" pricing)
4. Click "Book Now" or "View Details" on a hire product
5. Select date range using the calendar
6. System automatically checks availability
7. Select an available asset
8. Click "Add to Cart" or "Book Now"
9. Verify cart shows hire item with dates and days

## Update: Visual Availability Calendar (v2)

### Enhanced Features Added

1. **Visual Availability Display**:
   - Unavailable dates are highlighted in red on the calendar
   - Legend shows available vs unavailable dates
   - Users can see at a glance which dates are already booked
   - Shows 2 months at once for better planning

2. **Asset-First Selection**:
   - Users first select which asset they want to hire
   - Each asset shows its status and condition
   - Unavailable assets (on_hire, maintenance) are clearly marked
   - Calendar loads showing that specific asset's availability

3. **Double-Booking Prevention**:
   - Unavailable dates are disabled in the calendar picker
   - If user somehow selects overlapping dates, validation prevents booking
   - Cart API checks for conflicts with existing cart items
   - Server-side validation prevents the same asset being booked twice for overlapping dates
   - Clear error messages guide users to select different dates

4. **Real-time Availability Updates**:
   - When a booking is added to cart, availability automatically updates
   - Booked dates immediately show as unavailable on the calendar
   - Calendar refreshes after adding to cart to reflect new bookings
   - Date selection is cleared after successful booking

### Implementation Details

#### Calendar Modifiers
Uses `react-day-picker` modifiers and styles to visually mark unavailable dates:
```typescript
modifiers={{ booked: unavailableDates }}
modifiersStyles={{
    booked: {
        backgroundColor: '#fecaca',
        color: '#991b1b',
        fontWeight: 'bold'
    }
}}
```

#### Availability Validation
Three layers of validation:
1. **Calendar Level**: Unavailable dates are disabled
2. **UI Level**: `isDateRangeValid()` checks for any unavailable dates in range
3. **API Level**: Server checks for cart conflicts and existing bookings

#### Dynamic Availability Updates
When items are added to cart, the MSW handler automatically:
- Updates `assetAvailability` array with new unavailable dates
- Marks each day in the hire period as unavailable for that asset
- Prevents conflicting bookings in the cart

## Update: Order Confirmation Fixes (v3)

### Fixed Hire Product Pricing in Orders

**Issue**: Hire products were appearing in orders with a cost of zero.

**Root Cause**: The sales order creation handler was only using `item.product.price`, which is undefined for hire products that use `daily_hire_rate` instead.

**Fixes Applied**:

1. **Sales Order Total Calculation** (handlers.ts:375):
   ```typescript
   const total = cart.reduce((sum, item) => {
       if (item.product.product_type === 'hire') {
           return sum + (item.product.daily_hire_rate || 0) * item.quantity
       } else {
           return sum + (item.product.price || 0) * item.quantity
       }
   }, 0)
   ```

2. **Sales Order Line Creation** (handlers.ts:405):
   ```typescript
   unit_price: item.product.product_type === 'hire'
       ? (item.product.daily_hire_rate || 0)
       : (item.product.price || 0),
   line_type: item.product.product_type,
   asset_id: item.asset_id,
   hire_start_date: item.hire_start_date,
   hire_end_date: item.hire_end_date
   ```

3. **Order Confirmation Display** (OrderConfirmation.tsx):
   - Loads product details to display names instead of IDs
   - Shows "Hire Period: X days" for hire products
   - Displays hire date range (start - end dates)
   - Shows asset ID for hire bookings
   - Displays "per day" vs "each" for unit prices
   - Highlights hire information in blue

### Order Display Enhancements

The order confirmation page now properly displays:
- ✅ Product names and SKUs (not just IDs)
- ✅ Correct pricing for hire products (daily_hire_rate × days)
- ✅ Hire period duration in days
- ✅ Hire start and end dates
- ✅ Asset ID assigned to the hire
- ✅ Visual distinction between sale and hire line items

## Update: Cart Display Enhancements (v4)

### Fixed Cart Page Display for Hire Products

**Issue**: Cart page showed "$0.00" for hire product line items (though total was correct).

**Fixes Applied**:

1. **Line Item Pricing** (Cart.tsx:186-204):
   - Now checks `product_type` and uses `daily_hire_rate` for hire products
   - Shows "per day" vs "each" for unit prices
   - Correctly calculates line total: `daily_hire_rate × days`

2. **Visual Hire Indicators**:
   - Blue "Hire" badge next to product name
   - Displays hire date range (start - end)
   - Shows assigned asset ID
   - Displays "{X} days" instead of quantity controls

3. **Quantity Controls**:
   - Hire products show read-only days (can't change quantity in cart)
   - Sale products still have +/- quantity controls
   - Prevents accidental modification of hire bookings

### Cart Display Now Shows:

✅ Correct pricing: **$200/day × 3 days = $600**
✅ Hire badge and date range
✅ Asset ID information
✅ Read-only days display for hire products
✅ Proper distinction between hire and sale items

## Update: Checkout Page Fixes (v5)

### Fixed Checkout Order Summary Display

**Issue**: Checkout page order summary showed "$0.00" for hire product line items.

**Fix Applied** (Checkout.tsx:304-327):
- Uses `daily_hire_rate` for hire products instead of `price`
- Shows "(Hire)" badge next to hire product names
- Displays "x3 days" instead of just "x3" for hire items
- Correctly calculates line total: `daily_hire_rate × days`

### Complete Flow Now Working:

✅ **Product Page** → Shows hire products with daily rates
✅ **Booking Page** → Visual calendar with availability, asset selection
✅ **Cart** → Correct pricing, hire dates, asset info
✅ **Checkout** → Proper line item display with hire indicators
✅ **Order Confirmation** → Full hire details with dates and assets

All hire product pricing issues are now resolved across the entire shopping flow!

## Future Enhancements

1. **Asset Management Page**: Admin interface for managing assets
2. **Return Management**: Track returns and update asset availability
4. **Pricing Rules**: Support for multi-day discounts, peak pricing, etc.
5. **Asset Condition Tracking**: Record condition changes and maintenance history
6. **Multi-Asset Booking**: Allow hiring multiple quantities of same product (different assets)
7. **Order Fulfillment**: Integrate with warehouse to track asset pickup/return
