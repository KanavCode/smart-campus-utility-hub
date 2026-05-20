# PR Descriptions

All pull requests from the smart-campus-utility-hub project.

---

# fix/duplicate-sendsuccess-event-creation

## Issue Description
The `createEvent` function in the campus events controller was making a duplicate call to `sendSuccess`, resulting in an extra response being sent to the client. This caused inconsistent API responses and potential issues with client-side request/response handling.

## Root Cause
A logic error in the `events.controller.js` file resulted in two consecutive `sendSuccess` calls at lines 90-94. The first call was intentional, but the second one at line 94 was mistakenly left in the code, causing duplicate responses.

## Fix Details
1. Identified the duplicate `sendSuccess` call in `smart-campus-backend/src/components/campus-events/events.controller.js`
2. Removed line 94 which contained the erroneous second `sendSuccess` invocation
3. Verified that only one `sendSuccess` call remains in the function flow

**Before:**
```javascript
// Line 90-94 (simplified)
sendSuccess(res, 201, 'Event created successfully', { event: createdEvent });
// ... some code ...
sendSuccess(res, 201, 'Event created successfully', { event: createdEvent }); // Duplicate
```

**After:**
```javascript
// Line 90-93 (simplified)
sendSuccess(res, 201, 'Event created successfully', { event: createdEvent });
```

## Testing
- Verified that creating an event now returns exactly one success response
- Confirmed the event creation flow completes without duplicate responses
- Client applications receive consistent single responses

## Labels
gsoc'26, level 3, intermediate

---

# fix/xss-email-template-sanitization

## Issue Description
A cross-site scripting (XSS) vulnerability existed in the password reset email template. User-controlled input (the reset link containing tokens) was being inserted into the HTML email body without proper sanitization, potentially allowing malicious scripts to execute in email clients.

## Root Cause
The `emailService.js` file was directly interpolating the `resetLink` parameter into the HTML email template without escaping HTML special characters. Since the reset link contains URL parameters with tokens, any malicious content injected into the token or URL could be rendered as executable HTML/JavaScript in email clients.

## Fix Details
1. Added an `escapeHtml` utility function to sanitize user-generated content before embedding in HTML templates
2. The function escapes the following characters: `<`, `>`, `&`, `"`, and `'`
3. Modified the password reset email template to use `escapeHtml(resetLink)` instead of raw string interpolation
4. Ensured all user-controlled values in email templates are sanitized before use

**Added utility function:**
```javascript
function escapeHtml(text) {
  if (!text) return text;
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}
```

**Updated email template usage:**
```javascript
const htmlContent = `
  <p>Click the following link to reset your password:</p>
  <a href="${escapeHtml(resetLink)}">Reset Password</a>
`;
```

## Testing
- Verified that HTML special characters in reset links are properly escaped
- Confirmed email templates render correctly with sanitized content
- Tested that actual reset links still function correctly after sanitization
- Validated that the escape function handles empty/undefined inputs gracefully

## Labels
gsoc'26, level 3, intermediate

---

# fix/sort-field-sql-injection-defense

## Issue Description
A SQL injection vulnerability existed in the timetable read service where the `sortField` parameter was used directly in SQL queries without proper validation. Attackers could potentially manipulate the sort field parameter to inject arbitrary SQL code.

## Root Cause
The `timetable.read.service.js` file accepted a `sortField` parameter and used it directly in ORDER BY clauses without validating that the value was an allowed sort field. SQL ORDER BY clauses cannot use parameterized queries in the same way as WHERE conditions, making this a high-risk injection point.

## Fix Details
1. Identified the vulnerable `sortField` parameter usage in the timetable read service
2. Implemented defense-in-depth validation using an `ALLOWED_SORT` mapping object keyed by table name
3. The validation checks if the provided `sortField` exists in the `ALLOWED_SORT[table]` whitelist
4. If the sort field is not in the whitelist, a validation error is thrown before any database query execution
5. Only fields explicitly listed in `ALLOWED_SORT` for the specific table are permitted

**Implementation:**
```javascript
const ALLOWED_SORT = {
  timetable: ['created_at', 'updated_at', 'day_of_week', 'period'],
  // ... other tables
};

function validateSortField(sortField, table) {
  const allowed = ALLOWED_SORT[table];
  if (!allowed || !allowed.includes(sortField)) {
    throw new ValidationError(`Invalid sort field for ${table}`);
  }
  return sortField;
}
```

## Testing
- Confirmed that valid sort fields work correctly
- Verified that invalid/malicious sort field values are rejected at the service layer
- Tested SQL injection attempts are blocked before reaching the database
- Validated that the error response is user-friendly and doesn't expose system details

## Labels
gsoc'26, level 3, intermediate

---

# fix/fail-fast-jwt-secret-validation

## Issue Description
The application was starting successfully even when required JWT secrets (`JWT_SECRET` and `JWT_REFRESH_SECRET`) were not configured in the environment. The server would only fail when attempting to generate or validate tokens at runtime, resulting in confusing errors and potential security issues where unauthenticated requests might be processed.

## Root Cause
The `app.js` file did not perform early validation of required environment variables. Since JWT secrets are critical security components, the application should fail immediately at startup if they are missing, rather than allowing the server to start in an insecure or broken state.

## Fix Details
1. Added startup validation in `smart-campus-backend/src/app.js` before the server begins accepting connections
2. Checks for the presence of `JWT_SECRET` and `JWT_REFRESH_SECRET` environment variables
3. If either secret is missing or empty, the application logs a descriptive error and exits immediately with process.exit(1)
4. Validation occurs after dotenv loading but before any routes or middleware are registered
5. Provides clear error messages indicating which secret is missing

**Implementation:**
```javascript
function validateJwtSecrets() {
  const jwtSecret = process.env.JWT_SECRET;
  const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET;

  if (!jwtSecret) {
    console.error('FATAL: JWT_SECRET environment variable is not set');
    process.exit(1);
  }

  if (!jwtRefreshSecret) {
    console.error('FATAL: JWT_REFRESH_SECRET environment variable is not set');
    process.exit(1);
  }
}

// Call validation before app initialization
validateJwtSecrets();
```

## Testing
- Verified application fails immediately when `JWT_SECRET` is not set
- Verified application fails immediately when `JWT_REFRESH_SECRET` is not set
- Confirmed that when both secrets are properly configured, the application starts normally
- Tested that error messages are clear and indicate the exact missing variable

## Labels
gsoc'26, level 3, intermediate

---

# fix/add-missing-backend-tests

## Issue Description
The backend codebase lacked sufficient test coverage for critical services. Three important components - email service, electives service, and search functionality - had no test coverage, creating risk of undetected regressions and bugs.

## Root Cause
Test files were not created during initial implementation of the email service, electives service, and search functionality. This gaps in test coverage made it difficult to safely refactor or modify these services without risking breakage.

## Fix Details
Created comprehensive test files for the three missing areas:

### 1. smart-campus-backend/__tests__/emailService.test.js
- Tests for email template rendering with various parameters
- Tests for HTML sanitization in email content
- Tests for sendSuccess and sendError callback functions
- Tests for edge cases (empty parameters, special characters)
- Mocked nodemailer to avoid actual email sends during tests

### 2. smart-campus-backend/__tests__/electives.test.js
- Tests for electives retrieval and filtering
- Tests for semester and department-based queries
- Tests for error handling with invalid parameters
- Tests for empty result sets
- Mocked database responses for isolated unit testing

### 3. smart-campus-backend/__tests__/search.test.js
- Tests for search query building and execution
- Tests for search result pagination
- Tests for sanitizing user search input
- Tests for search across multiple entities
- Tests for handling special characters and SQL injection attempts

## Testing
- All new test files pass successfully with `npm test`
- Coverage reports show significant improvement in backend coverage metrics
- Tests are integrated into the existing test runner configuration
- Confirmed tests run independently and in isolation with proper mocking
- Verified that tests correctly assert both success and failure scenarios

## Labels
gsoc'26, level 3, intermediate

---

*Generated for smart-campus-utility-hub project*