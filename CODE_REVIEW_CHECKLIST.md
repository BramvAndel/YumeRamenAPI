# Code Review Checklist - YumeRamen API

**Review Date:** December 8, 2025  
**Total Issues Found:** 46

---

## 🔴 CRITICAL ISSUES (5)

### Security Vulnerabilities

- [ ] **1.1** Fix password hashing on update in `src/controllers/userController.js` (lines 141-143)
  - Currently storing plain text passwords when updating
  - Must hash password with bcrypt before storing

- [ ] **1.2** Remove hardcoded cookie domain from `src/controllers/authController.js`
  - Remove `domain: "localhost"` from lines 59, 67, 117, 151, 157
  - Will break in production and with 127.0.0.1

- [ ] **1.3** Add environment variable validation in `config/config.js`
  - Validate JWT_SECRET and REFRESH_TOKEN_SECRET exist
  - Exit with error if critical variables are missing

- [ ] **1.4** Fix weak rate limiting for authentication
  - Fix typo: `autAmount` → `authAmount` in `config/config.js` line 24
  - Reduce auth attempts from 5 to 3 for better brute force protection

- [ ] **1.5** Add input validation across all controllers
  - Validate email format in user creation/updates
  - Validate phone numbers, price values, quantities
  - Prevent invalid data insertion into database

---

## 🟠 HIGH PRIORITY ISSUES (12)

### Configuration & Environment Issues

- [ ] **2.1** Fix inconsistent JWT secret usage in `src/middleware/authMiddleware.js` line 12
  - Remove redundant fallback: `process.env.JWT_SECRET || config.jwtSecret`
  - Use config consistently throughout codebase

- [ ] **2.2** Fix config structure inconsistency in `config/config.js`
  - Restructure: either use `config.jwt.jwtSecret` everywhere or flatten to `config.jwtSecret`
  - Update all references to match chosen structure

- [ ] **2.3** Fix unused JWT expiration time constants in `config/config.js`
  - Use `jwtAccessTokenExpoTime` and `jwtRefreshTokenExpoTime` or remove them
  - Fix typo: `jwtAccesTokenExpoTime` → `jwtAccessTokenExpoTime`

- [ ] **2.4** Add missing environment variables to `.env.example`
  - Add JWT_SECRET
  - Add REFRESH_TOKEN_SECRET
  - Add NODE_ENV

- [ ] **2.5** Fix rate limit config typo in `config/config.js` line 24
  - Change `autAmount: 5` to `authAmount: 5`

### Database & Data Integrity Issues

- [ ] **3.1** Fix connection release issue in `src/controllers/ordersController.js` line 226
  - Remove duplicate connection declaration
  - Ensure proper connection release in finally block

- [ ] **3.2** Add transaction handling for file deletions in `src/controllers/dishesController.js`
  - Delete file first, then database record
  - Or use transaction to ensure consistency

- [ ] **3.3** Add cascade delete handling
  - Check for related orders before deleting users
  - Check for related order_items before deleting dishes
  - Return appropriate error messages

- [ ] **3.4** Add dish existence validation in `src/controllers/ordersController.js` (createOrder)
  - Verify all dishIDs exist before creating order
  - Return error if dish not found

### Error Handling Issues

- [ ] **4.1** Fix inconsistent error logging in `src/middleware/authMiddleware.js` line 16
  - Replace `console.error` with `logger.error`
  - Maintain logging consistency

- [ ] **4.2** Improve error messages across controllers
  - Don't expose database errors to clients
  - Return generic "Internal server error" messages
  - Log detailed errors server-side only

- [ ] **4.3** Enhance logger with error context in `src/utils/logger.js`
  - Include stack traces in error logs
  - Add additional context (user ID, request ID, etc.)

---

## 🟡 MEDIUM PRIORITY ISSUES (14)

### Code Quality & Maintainability

- [ ] **5.1** Delete duplicate file `src/controllers/dishesController_new.js`
  - Determine which controller is active
  - Remove the unused duplicate

- [ ] **5.2** Standardize property naming conventions
  - Choose either PascalCase or snake_case consistently
  - Update database schema and API responses accordingly

- [ ] **5.3** Replace magic numbers with named constants
  - Define constants for time values (15 min, 7 days)
  - Define constants for file sizes (5MB)
  - Create a constants file

- [ ] **5.4** Add JSDoc comments to all functions
  - Document parameters, return types
  - Add usage examples where helpful

- [ ] **5.5** Implement service layer pattern
  - Create service files for business logic
  - Move database queries out of controllers
  - Improve testability and code reuse

### Swagger Documentation Issues

- [ ] **6.1** Fix auth routes Swagger documentation in `src/routes/auth.js`
  - Update docs to reflect cookie-based authentication
  - Remove `token` from request body schemas

- [ ] **6.2** Fix login response documentation in `src/routes/auth.js` (lines 40-45)
  - Remove `accessToken` and `refreshToken` from response schema
  - Document cookie-based response instead

- [ ] **6.3** Fix global security configuration in `src/app.js` (lines 81-85)
  - Remove global `bearerAuth` requirement
  - Add security per-endpoint instead

- [ ] **6.4** Add security overrides for public endpoints in `src/routes/auth.js`
  - Add `security: []` to login, logout, refresh endpoints
  - Add `security: []` to user creation endpoint

### Missing Features & Validations

- [ ] **7.1** Add email uniqueness check in `src/controllers/userController.js` (createUser)
  - Query database to check if email exists
  - Return user-friendly error message

- [ ] **7.2** Add order authorization checks in `src/controllers/ordersController.js`
  - Users should only view/modify their own orders
  - Admins can view/modify all orders

- [ ] **7.3** Add order status validation in `src/controllers/ordersController.js` (updateOrder)
  - Define valid status transitions
  - Prevent invalid state changes (e.g., completed → ordered)

- [ ] **7.4** Add old image deletion on update in `src/controllers/dishesController.js` (updateDish)
  - Delete old image file when new image uploaded
  - Prevent orphaned files

- [ ] **7.5** Add price validation in `src/controllers/dishesController.js`
  - Ensure price is positive number
  - Validate numeric format

---

## 🔵 LOW PRIORITY ISSUES (15)

### Code Style & Conventions

- [ ] **8.1** Standardize string quote usage
  - Choose single or double quotes
  - Apply consistently throughout codebase

- [ ] **8.2** Fix missing trailing semicolons
  - Add semicolon to `src/utils/logger.js` line 9
  - Check for other missing semicolons

- [ ] **8.3** Move TODO comments to issue tracker
  - Create issue for websockets implementation from `index.js` line 21
  - Remove TODO from code

- [ ] **8.4** Remove unused imports
  - Review all imports for usage
  - Remove unused `path` imports where applicable

### Documentation Issues

- [ ] **9.1** Update README.md
  - Add JWT_SECRET and REFRESH_TOKEN_SECRET to env setup section
  - Add authentication flow documentation
  - Document refresh token mechanism
  - Remove reference to non-existent `PATCH /orders/:id/status` endpoint

- [ ] **9.2** Add API request/response examples
  - Add example requests for complex operations (order creation)
  - Add example responses with all fields
  - Include error response examples

### Performance & Optimization

- [ ] **10.1** Optimize N+1 queries in `src/controllers/ordersController.js` (getAllOrders)
  - Review JOIN queries for efficiency
  - Consider eager loading strategies

- [ ] **10.2** Add database indexing guidance
  - Document recommended indexes in migration files
  - Add indexes for foreign keys (UserID, DishID)
  - Add indexes for frequently queried fields (email, Status)

- [ ] **10.3** Add pagination to all `getAll*` endpoints
  - Implement limit and offset parameters
  - Add pagination metadata to responses (total, page, per_page)
  - Default to reasonable page size (e.g., 50)

- [ ] **10.4** Review connection pool settings in `src/db.js` line 14
  - Increase `connectionLimit` for production (consider 50-100)
  - Make configurable via environment variable

### DevOps & Production Readiness

- [ ] **11.1** Enhance health check endpoint in `src/app.js` line 99
  - Add database connectivity check
  - Return detailed status (DB status, uptime, etc.)
  - Use proper HTTP status codes

- [ ] **11.2** Add graceful shutdown handling in `index.js`
  - Add SIGTERM handler to close DB pool
  - Add SIGINT handler for development
  - Ensure all connections close properly

- [ ] **11.3** Make CORS configuration environment-based in `src/app.js`
  - Move allowed origins to environment variables
  - Support comma-separated list of origins
  - Document in .env.example

- [ ] **11.4** Add HTTP request logging middleware
  - Install and configure morgan or similar
  - Log requests in production-friendly format
  - Include request ID for tracking

- [ ] **11.5** Fix uploads directory in `.gitignore`
  - Change `uploads/` to `uploads/*`
  - Add `!uploads/.gitkeep` to preserve directory structure
  - Ensure directory exists in fresh clones

---

## 📊 SUMMARY

| Priority | Count | Status |
|----------|-------|--------|
| 🔴 Critical | 5 | ⬜️ 0% Complete |
| 🟠 High | 12 | ⬜️ 0% Complete |
| 🟡 Medium | 14 | ⬜️ 0% Complete |
| 🔵 Low | 15 | ⬜️ 0% Complete |
| **TOTAL** | **46** | **⬜️ 0% Complete** |

---

## 🎯 RECOMMENDED IMPLEMENTATION ORDER

### Phase 1 - Immediate (Security Critical)
**Goal:** Fix all critical security vulnerabilities

1. Fix password hashing on update (1.1)
2. Remove hardcoded cookie domain (1.2)
3. Add environment variable validation (1.3)
4. Fix auth rate limiting (1.4)
5. Add input validation (1.5)

### Phase 2 - High Priority
**Goal:** Fix configuration and data integrity issues

1. Fix config structure inconsistencies (2.1, 2.2, 2.3)
2. Update .env.example (2.4)
3. Fix connection release bugs (3.1)
4. Add order authorization checks (7.2)
5. Fix Swagger documentation (6.1, 6.2)

### Phase 3 - Code Quality
**Goal:** Improve maintainability and documentation

1. Delete duplicate controller (5.1)
2. Implement service layer (5.5)
3. Add comprehensive input validation (7.1, 7.3, 7.5)
4. Fix error logging consistency (4.1, 4.2)
5. Add JSDoc comments (5.4)

### Phase 4 - Production Readiness
**Goal:** Prepare for production deployment

1. Add pagination (10.3)
2. Implement graceful shutdown (11.2)
3. Add request logging (11.4)
4. Enhance health check (11.1)
5. Add database indexes (10.2)

---

## Notes

- Items can be checked off as completed: `- [x]`
- Priority indicated by color emoji (🔴🟠🟡🔵)
- Each item includes file location for easy navigation
- Review and update progress regularly
