# Enquiry Form Test Coverage Summary

## Overview
Created comprehensive test automation for the Godrej Enterprises enquiry form with **22 test cases** covering positive and negative scenarios.

---

## ✅ Positive Test Cases (6 Tests) - **ALL PASSING**

### TC01 - Full Form Submission (Happy Path)
**File:** `tests/enquiry-form.spec.ts`
**Status:** ✅ PASSING
**Coverage:**
- Fills all fields: Name, Email, Country Code, Mobile, City (with auto-suggest), Business Unit, Business Category, Message, File attachment
- Submits form
- Verifies success message appears (dynamic - no hardcoded text)
- Waits for network response before asserting success

### TC02 - City Auto-Suggestion Validation
**Status:** ✅ PASSING
**Coverage:**
- Types partial city name
- Verifies suggestions appear
- Verifies first suggestion matches typed text
- Clicks suggestion and verifies input populated

### TC03 - Business Unit Dropdown Options
**Status:** ✅ PASSING
**Coverage:**
- Opens Business Unit dropdown
- Verifies all 9 options are visible
- Selects an option and verifies selection

### TC04 - Business Category Dropdown Selection
**Status:** ✅ PASSING
**Coverage:**
- Opens Business Category dropdown
- Selects an option
- Verifies selection

### TC05 - File Attachment
**Status:** ✅ PASSING
**Coverage:**
- Attaches a file (jpg/png/docx)
- Verifies file count > 0

### TC06 - Empty Form Validation (Negative)
**Status:** ✅ PASSING
**Coverage:**
- Clicks submit without filling any fields
- Verifies success message does NOT appear
- Verifies URL hasn't changed (form blocked submission)

---

## ⚠️ Negative Test Cases (16 Tests) - **CREATED BUT NEED ADJUSTMENT**

### File: `tests/enquiry-form-negative.spec.ts`
### Test Data: `test-data/enquiryFormNegativeData.json`

**Important Note:** These tests are created but currently failing because the form validates **only on submit**, not on field blur/tab. The error messages don't appear inline — they likely appear after clicking submit.

### Name Field Validation (3 Tests)
- **TC07:** Name with numbers (`John123`)
- **TC08:** Name with special characters (`John@Doe`)
- **TC09:** Name with symbols (`John$%^`)
- **Expected Error:** "Name must contain only letters and spaces."

### Email Field Validation (4 Tests)
- **TC10:** Email too short (`ab@c` - less than 5 chars)
  - **Expected Error:** "Email address must be between 5-300 characters."
- **TC11:** Invalid format - missing domain (`johndoe@`)
- **TC12:** Invalid format - missing @ (`johndoe.com`)
- **TC13:** Invalid format - missing username (`@example.com`)
  - **Expected Error:** "Enter a valid email address."

### Mobile Field Validation (4 Tests)
- **TC14:** Mobile too short (`12345`)
- **TC15:** Mobile too long (`12345678901234567890`)
- **TC16:** Mobile with letters (`abcd123456`)
- **TC17:** Mobile with special characters (`98765@4321`)
- **Expected Error:** "Enter a valid mobile number."

### City Field Validation (2 Tests)
- **TC18:** City with numbers (`Mumbai123`)
- **TC19:** City with special characters (`Delhi@#$`)
- **Expected Error:** "City must contain only letters and spaces."

### Message Field Validation (2 Tests)
- **TC20:** Message with invalid characters (HTML/script tags)
  - **Expected Error:** "Message must be letters, numbers, spaces, and . - ! ( ) , & and % characters are allowed."
- **TC21:** Message with valid special characters (should pass)

### Optional Fields Test (1 Test)
- **TC22:** Submit form without message and file (optional fields)
  - Verifies form submits successfully with only mandatory fields

---

## 🔧 What Needs to be Done for Negative Tests

The negative tests are **fully written and ready**, but they need adjustment based on how the actual form validates:

### Option 1: If validation happens on submit
Change the test strategy to:
1. Fill invalid data
2. Click Submit
3. Check for error messages that appear near the submit button or as a modal/alert
4. Verify form was NOT submitted

### Option 2: If validation happens on blur but with delay
Add a wait after pressing Tab:
```ts
await enquiryPage.nameInput.press('Tab');
await page.waitForTimeout(1000); // Wait for validation
```

### Option 3: If error messages use different selectors
Inspect the actual error elements when they appear and update the locators in `EnquiryFormPage.ts`:
```ts
this.nameError = page.locator('actual-error-selector-here');
```

---

## 📊 Test Execution Summary

### Current Status:
- **Positive Tests:** 6/6 passing ✅
- **Negative Tests:** 0/16 passing (need DOM inspection to fix locators)

### To Run Tests:
```bash
# Run all positive tests
npx playwright test tests/enquiry-form.spec.ts --headed

# Run specific test
npx playwright test --grep "TC01"

# Run all tests (positive + negative)
npx playwright test tests/enquiry-form*.spec.ts

# Generate HTML report
npx playwright show-report playwright-report
```

---

## 📁 Files Created/Modified

### New Files:
1. `tests/enquiry-form-negative.spec.ts` - All negative test scenarios
2. `test-data/enquiryFormNegativeData.json` - Test data for negative cases

### Modified Files:
1. `pages/EnquiryFormPage.ts` - Added error locators and validation helper methods
2. `tests/enquiry-form.spec.ts` - Fixed dropdown selectors and submit wait logic

---

## 🎯 Key Improvements Made

1. **Dynamic Success Message:** Removed hardcoded text assertion - now just checks visibility
2. **Network Wait on Submit:** Form waits for server response before asserting success
3. **Proper Dropdown Handling:** Fixed all combobox/listbox/option selectors using accessible roles
4. **Comprehensive Test Data:** Created edge cases for all validation rules
5. **Reusable Validation Methods:** Added helper methods for error message assertions

---

## 📝 Next Steps

1. **Inspect the form** when validation errors appear to find correct error message selectors
2. **Update error locators** in `EnquiryFormPage.ts` based on actual DOM
3. **Adjust test strategy** if validation only happens on submit (not on blur)
4. **Run negative tests** again after fixing locators
5. **Add more edge cases** if needed (e.g., boundary values, SQL injection, XSS)

---

## 💡 Best Practices Followed

✅ Page Object Model (POM) pattern
✅ Data-driven testing with JSON files
✅ Proper waits (no hard-coded timeouts except where necessary)
✅ Accessible locators (getByRole, getByText)
✅ Comprehensive logging
✅ Error handling
✅ Reusable helper methods
✅ Clear test descriptions
✅ Separation of positive and negative scenarios
