# EXTREMELY THOROUGH ANALYSIS: iOS Campaign Edit Implementation vs Webapp

**Date:** October 23, 2025
**Files Analyzed:**
- iOS: `/Users/anthony/Documents/Projects/Collabuu/Business/Pages/Campaigns/Views/EditCampaignView.swift`
- Webapp: `/Users/anthony/Documents/Projects/Collabuu-Webapp/app/(app)/campaigns/[id]/edit/page.tsx`
- Backend: `/Users/anthony/Documents/Projects/Collabuu/src/api/routes/business.ts` (updateCampaign function lines 2189-2373)
- Backend: `/Users/anthony/Documents/Projects/Collabuu/src/api/routes/business.ts` (deleteCampaign function lines 2375-2524)

---

## 1. EXACT TEXT STRINGS

### Button Labels

**iOS Implementation (EditCampaignView.swift):**
- Line 82: "Back" (navigation back button)
- Line 90: "Save" (save button in toolbar)
- Line 128: "Cancel" (delete confirmation dialog)
- Line 132: "Delete" (destructive delete confirmation button)
- Line 246: "(Cannot edit - date has passed)" (read-only date note)
- Line 291: "(Cannot edit - date has passed)" (read-only date note for end date)
- Line 305: "Delete Campaign" (section title)
- Line 333: "Delete Campaign" (button text)

**Webapp Implementation (edit/page.tsx):**
- Line 206: "Back to Campaigns" (button with icon)
- Line 224: "Edit Campaign" (page title)
- Line 415: "Discard Changes"
- Line 419: "Save Changes" / "Saving..."
- Line 395: "Delete Campaign"
- Line 390: "Deleting..."
- Line 431: "Delete" (in alert footer)
- Line 435: "Cancel" (in alert footer)
- Line 321: "Cannot edit - date has passed"
- Line 340: "Cannot edit - date has passed"

**DIFFERENCE FOUND:** iOS says "Back" while webapp says "Back to Campaigns". iOS uses "Delete Campaign" for both section title and button, while webapp distinguishes with button text having full context.

### Form Field Labels

**iOS:**
- Line 156: "Campaign Title"
- Line 165: "Campaign Details" (not "Description")
- Line 176: "Requirements"
- Line 213: "Start Date"
- Line 258: "End Date"

**Webapp:**
- Line 255: "Campaign Title"
- Line 269: "Description" (not "Campaign Details")
- Line 287: "Requirements"
- Line 315: "Start Date"
- Line 335: "End Date"

**DIFFERENCE FOUND:** iOS labels the description field as "Campaign Details" but webapp uses "Description". This is a CRITICAL DIFFERENCE in labeling.

### Placeholder Text

**iOS (StandardizedFormField defaults):**
- Line 158: "Enter campaign title"
- Line 167: "Describe your campaign"
- Line 178: "What are the requirements for influencers?"

**Webapp:**
- Line 257: "Enter campaign title"
- Line 272: "Describe your campaign"
- Line 290: "What are the requirements for influencers?"

**RESULT:** Placeholders are IDENTICAL between iOS and webapp.

### Alert & Dialog Messages

**iOS Delete Confirmation Dialog (lines 127-142):**
```swift
.alert("Delete Campaign", isPresented: $showingDeleteConfirmation) {
    Button("Cancel", role: .cancel) { ... }
    Button("Delete", role: .destructive) { ... }
} message: {
    Text("Are you sure you want to delete this campaign? Your credits will be refunded to your account. This action cannot be undone.")
}
```

**Exact text:** "Are you sure you want to delete this campaign? Your credits will be refunded to your account. This action cannot be undone."

**Webapp Delete Confirmation Dialog (lines 426-444):**
```tsx
<AlertDialogTitle>Delete Campaign</AlertDialogTitle>
<AlertDialogDescription>
  Are you sure you want to delete this campaign? Your credits will be refunded to your account. This action cannot be undone.
</AlertDialogDescription>
```

**Exact text:** "Are you sure you want to delete this campaign? Your credits will be refunded to your account. This action cannot be undone."

**RESULT:** Delete confirmation messages are IDENTICAL.

### Success Messages

**iOS (lines 112-126):**
```swift
.standardizedAlert(
    isPresented: $viewModel.showingSuccessAlert,
    config: StandardizedAlertConfig(
        title: "Success",
        message: "Campaign updated successfully",
        ...
    )
)
```

**Exact text:** "Success" title, "Campaign updated successfully" message

**Webapp (lines 120-123):**
```tsx
toast({
  title: 'Campaign Updated',
  description: 'Your changes have been saved successfully',
});
```

**Exact text:** "Campaign Updated" title, "Your changes have been saved successfully" message

**DIFFERENCE FOUND:** Success message differs:
- iOS: "Campaign updated successfully"
- Webapp: "Your changes have been saved successfully"

### Error Messages

**iOS (lines 486-503 in viewModel):**
```swift
case .unauthorized:
    self.errorMessage = "You don't have permission to edit this campaign. The campaign may have already started or you may not be the owner."
case .notFound:
    self.errorMessage = "Campaign not found. It may have been deleted."
case .clientError(let statusCode):
    self.errorMessage = "Failed to update campaign (Error \(statusCode)). Please check your input and try again."
case .serverError(let statusCode):
    self.errorMessage = "Server error (\(statusCode)). Please try again later."
case .networkError:
    self.errorMessage = "Network error. Please check your connection and try again."
```

**Webapp (lines 128-140):**
```tsx
if (error?.response?.status === 401 || error?.response?.status === 403) {
    errorMessage = "You don't have permission to edit this campaign. The campaign may have already started or you may not be the owner.";
} else if (error?.response?.status === 404) {
    errorMessage = "Campaign not found. It may have been deleted.";
} else if (error?.response?.status >= 400 && error?.response?.status < 500) {
    errorMessage = `Failed to update campaign (Error ${error.response.status}). Please check your input and try again.`;
} else if (error?.response?.status >= 500 && error?.response?.status < 600) {
    errorMessage = `Server error (${error.response.status}). Please try again later.`;
} else if (error?.message === 'Network Error' || !error?.response) {
    errorMessage = "Network error. Please check your connection and try again.";
}
```

**RESULT:** Error messages are IDENTICAL between iOS and webapp.

### Delete Refund Messages

**iOS (line 344):**
"Deleting this campaign will refund the credits to your account."

**Webapp (line 400):**
"Deleting this campaign will refund the credits to your account."

**RESULT:** Messages are IDENTICAL.

### Section Descriptions

**iOS:**
- None for basic form fields (just floating labels)
- Line 246-249: "(Cannot edit - date has passed)" helper text on read-only dates

**Webapp:**
- Line 247: "Update your campaign's basic details" (subtitle under "Basic Information" card title)
- Line 306: "Set the start and end dates for your campaign" (subtitle under "Campaign Duration" card title)
- Line 357: "Permanently delete this campaign and refund credits" (subtitle under delete section)
- Line 321, 340: "Cannot edit - date has passed" (helper text on read-only dates)

**DIFFERENCE FOUND:** Webapp has CardDescription subtitles that provide additional context. iOS has no equivalent text descriptions in the form structure.

---

## 2. FORM BEHAVIOR EDGE CASES

### Empty Field Validation

**iOS Validation (lines 426-439):**
```swift
if title.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty {
    titleError = "Title is required"
    hasError = true
}

if description.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty {
    descriptionError = "Description is required"
    hasError = true
}

if requirements.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty {
    requirementsError = "Requirements are required"
    hasError = true
}

if hasError {
    return
}
```

**Key Detail:** iOS TRIMS the text BEFORE checking for isEmpty. This means:
- " " (space only) = fails validation
- "\n" (newline only) = fails validation
- "  text  " = passes validation

**Webapp Validation (lines 40-42):**
```tsx
const editCampaignSchema = z.object({
  title: z.string().trim().min(1, 'Title is required'),
  description: z.string().trim().min(1, 'Description is required'),
  requirements: z.string().trim().min(1, 'Requirements are required'),
  startDate: z.string(),
  endDate: z.string(),
});
```

**Key Detail:** Webapp ALSO trims before validating with min(1). The trimming is done by the zod schema.

**RESULT:** Empty field validation is FUNCTIONALLY IDENTICAL - both trim whitespace and require at least 1 character.

### Validation Timing

**iOS:**
- Validation happens ONLY on form submission (line 373: `saveChanges()` calls `viewModel.updateCampaign`)
- No field-level validation triggered
- Field-level errors are set in the viewModel (lines 397-399) and displayed by StandardizedFormField
- Errors are shown INLINE next to each field (StandardizedFormField lines 198-200 display errorMessage)

**Webapp:**
- Validation happens on form submission (line 110: `onSubmit`)
- Uses react-hook-form with zod resolver for schema validation (lines 63-72)
- Form has field-level error display via FormMessage component (lines 259, 277, 295, 324, 343)
- Errors are triggered by form submission, not on blur or change

**RESULT:** Both use ON-SUBMIT validation, not real-time. Both display field-level errors inline.

### Validation Error Message Texts

**iOS (lines 427, 432, 437):**
- "Title is required"
- "Description is required"
- "Requirements are required"

**Webapp (lines 40-42):**
- "Title is required"
- "Description is required"
- "Requirements are required"

**RESULT:** Validation error messages are IDENTICAL.

### Untrimmed Values Sent to API

**iOS Request (lines 452-458):**
```swift
let updateRequest = CampaignUpdateRequest(
    title: title,
    description: description,
    requirements: requirements,
    periodStart: startDate.ISO8601Format(),
    periodEnd: endDate.ISO8601Format()
)
```

**CRITICAL FINDING:** iOS sends the UNTRIMMED `title`, `description`, and `requirements` values directly to the API. The trimming was ONLY for validation checking, not for sending.

**Webapp Request (lines 112-118):**
```tsx
await updateCampaign.mutateAsync({
  title: data.title,
  description: data.description,
  requirements: data.requirements,
  period_start: data.startDate,
  period_end: data.endDate,
});
```

**Note:** The zod schema has `.trim()` defined on the fields (line 40-42). This means the data coming from react-hook-form AFTER zod validation may have been trimmed. Let me verify this understanding...

Actually, looking at zod documentation: `z.string().trim()` modifies the value during parsing. So `data.title`, `data.description`, and `data.requirements` will be TRIMMED values.

**CRITICAL DIFFERENCE FOUND:** 
- **iOS sends UNTRIMMED values** to the API
- **Webapp sends TRIMMED values** to the API

This could cause a subtle bug if the backend has strict whitespace handling!

---

## 3. DATE HANDLING SPECIFICS

### Date Format Sent to API

**iOS (line 456-457):**
```swift
periodStart: startDate.ISO8601Format(),
periodEnd: endDate.ISO8601Format()
```

**Date format:** ISO8601 format (e.g., "2025-12-31T00:00:00Z" or similar)

**Webapp (lines 116-117):**
```tsx
period_start: data.startDate,
period_end: data.endDate,
```

But the data comes from form field of type "date" (lines 317, 336):
```tsx
<Input type="date" {...field} disabled={!canEditStartDate} />
```

**Date format:** HTML input type="date" returns "YYYY-MM-DD" format (e.g., "2025-12-31")

**CRITICAL DIFFERENCE FOUND:** 
- **iOS sends ISO8601 full datetime** (e.g., "2025-12-31T00:00:00Z")
- **Webapp sends date-only string** (e.g., "2025-12-31")

The backend needs to handle both formats!

### Nil/Missing Date Handling

**iOS (lines 367-368 in setupInitialValues):**
```swift
startDate = campaign.periodStart ?? Date()
endDate = campaign.periodEnd ?? Date()
```

**Behavior:** If periodStart is nil, uses current Date(). Same for periodEnd.

**Webapp (lines 81-82):**
```tsx
startDate: campaign.startDate?.split('T')[0] || '',
endDate: campaign.endDate?.split('T')[0] || '',
```

**Behavior:** If startDate is nil, uses empty string. Same for endDate.

**DIFFERENCE FOUND:**
- **iOS defaults to current date (Date())**
- **Webapp defaults to empty string ('')**

### Date Comparison Logic

**iOS (lines 30-38):**
```swift
private var canEditStartDate: Bool {
    return campaign.periodStart ?? Date() > Date()
}

private var canEditEndDate: Bool {
    return campaign.periodEnd ?? Date() > Date()
}
```

**Comparison:** Uses `>` (greater than). This means:
- If start date is TODAY at current time, it's NOT editable (because today is NOT > today)
- Only FUTURE dates (after today) are editable

**Webapp (lines 88-94):**
```tsx
const canEditStartDate = campaign?.startDate
  ? new Date(campaign.startDate) > new Date()
  : true;

const canEditEndDate = campaign?.endDate
  ? new Date(campaign.endDate) > new Date()
  : true;
```

**Comparison:** Uses `>` (greater than). Same logic.

**RESULT:** Date comparison logic is IDENTICAL - both use `> new Date()` / `> Date()`.

### Delete Permission - Date Check

**iOS (line 32 in canDeleteCampaign, line 43):**
```swift
let hasNotStarted = (campaign.periodStart ?? Date()) > Date()
```

**Uses:** `>` operator

**Webapp (line 98):**
```tsx
(campaign.startDate ? new Date(campaign.startDate) > new Date() : true)
```

**Uses:** `>` operator

**RESULT:** Both use `>` consistently.

**Backend (line 2253-2254 in updateCampaign):**
```tsx
const campaignHasStarted = existingCampaign.periodStart && 
  new Date(existingCampaign.periodStart) <= new Date();
```

**Uses:** `<=` operator (opposite logic - campaign HAS started if period start <= now)

### Disabled State Messages for Dates

**iOS (line 246, 291):**
```swift
Text("(Cannot edit - date has passed)")
    .font(.system(size: 12))
    .foregroundColor(AppColors.textTertiary)
```

**Message text:** "(Cannot edit - date has passed)"

**Webapp (line 320-322, 338-341):**
```tsx
{!canEditStartDate && (
    <p className="text-sm text-muted-foreground">
        Cannot edit - date has passed
    </p>
)}
```

**Message text:** "Cannot edit - date has passed" (no parentheses)

**DIFFERENCE FOUND:** iOS wraps message in parentheses, webapp doesn't.

---

## 4. API REQUEST CONSTRUCTION

### Request Body Structure

**iOS Request Body (lines 1711-1717 in APIService.swift updateCampaign):**
```swift
let body: [String: Any] = [
    "title": updates.title,
    "description": updates.description,
    "requirements": updates.requirements,
    "period_start": updates.periodStart,
    "period_end": updates.periodEnd
]
```

**Field names sent to API:**
- "title" (camelCase? No, actually snake_case with period_ prefix)
- "description"
- "requirements"
- "period_start" (snake_case)
- "period_end" (snake_case)

**Webapp Request Body (lines 112-118):**
```tsx
await updateCampaign.mutateAsync({
  title: data.title,
  description: data.description,
  requirements: data.requirements,
  period_start: data.startDate,
  period_end: data.endDate,
});
```

**Field names sent to API:**
- "title"
- "description"
- "requirements"
- "period_start" (snake_case)
- "period_end" (snake_case)

**RESULT:** Both send IDENTICAL field names to the API.

### Optional Fields Handling

**iOS:**
- Creates a `CampaignUpdateRequest` struct (lines 537-550) with all fields as required `String`
- Always includes all 5 fields in the request body
- All fields are non-optional in the struct definition

**Webapp:**
- Always includes all 5 fields in the request
- All fields come from form data
- Form uses zod schema with `.trim()` but no optional handling

**RESULT:** Both always include all fields. Neither omits optional fields.

### Date Value Formats in Request

**iOS sends:**
```
"period_start": "2025-12-31T00:00:00Z"  (or similar ISO8601)
"period_end": "2025-12-31T23:59:59Z"    (or similar ISO8601)
```

**Webapp sends:**
```
"period_start": "2025-12-31"
"period_end": "2025-12-31"
```

**Backend processing (lines 2355-2357):**
```tsx
if (updates.periodStart)
  updates.periodStart = new Date(updates.periodStart);
if (updates.periodEnd) 
  updates.periodEnd = new Date(updates.periodEnd);
```

The backend converts both formats to Date objects using JavaScript's `new Date()` constructor, which handles both formats.

---

## 5. SUCCESS/ERROR FLOW DETAILS

### Success Flow - iOS

**Line 373-384 (saveChanges function):**
```swift
private func saveChanges() {
    print("🔄 Save button pressed - starting campaign update")
    viewModel.updateCampaign(
        title: title,
        description: description,
        requirements: requirements,
        startDate: canEditStartDate ? startDate : campaign.periodStart ?? Date(),
        endDate: canEditEndDate ? endDate : campaign.periodEnd ?? Date(),
        onSuccess: { updatedCampaign in
            onSave(updatedCampaign)
        }
    )
}
```

**Line 469-477 (success in updateCampaign viewModel):**
```swift
await MainActor.run {
    self.isLoading = false
    self.showingSuccessAlert = true
    print("✅ Campaign updated successfully, showing alert")
    // Don't call onSuccess immediately - wait for user to dismiss alert
    self.updatedCampaignCache = updatedCampaign
}
```

**Line 115-123 (success alert handler):**
```swift
primaryButton: StandardizedAlertConfig.AlertButton(
    title: "OK",
    action: {
        viewModel.showingSuccessAlert = false
        if let updatedCampaign = viewModel.updatedCampaignCache {
            onSave(updatedCampaign)
        }
        dismiss()
    }
)
```

**iOS Success Flow:**
1. Save button clicked
2. Validation happens
3. API call made (isLoading = true, overlay ProgressView shown)
4. Success response received
5. isLoading = false
6. showingSuccessAlert = true (alert appears)
7. User taps "OK"
8. onSave callback called
9. dismiss() called (navigates back)

**CRITICAL DETAIL:** Success alert is shown BEFORE navigation.

### Success Flow - Webapp

**Line 110-125 (onSubmit):**
```tsx
const onSubmit = async (data: EditCampaignFormData) => {
  try {
    await updateCampaign.mutateAsync({
      title: data.title,
      description: data.description,
      requirements: data.requirements,
      period_start: data.startDate,
      period_end: data.endDate,
    });

    toast({
      title: 'Campaign Updated',
      description: 'Your changes have been saved successfully',
    });

    router.push(`/campaigns/${campaignId}`);
```

**Webapp Success Flow:**
1. Save button clicked
2. Validation happens
3. API call made (updateCampaign.isPending = true, button shows "Saving...")
4. Success response received
5. Toast notification shown
6. router.push executed (navigates back)

**CRITICAL DIFFERENCE:** 
- **iOS shows a modal alert and waits for user to dismiss it before navigating**
- **Webapp shows a toast notification and immediately navigates**

The toast in webapp might not be visible long enough if navigation is immediate!

### Error Flow - iOS

**Lines 478-507 (error handling in updateCampaign):**
```swift
catch {
    print("❌ Campaign update failed: \(error)")
    print("❌ Error localized description: \(error.localizedDescription)")
    
    await MainActor.run {
        self.isLoading = false
        
        if let apiError = error as? APIError {
            switch apiError {
            case .unauthorized:
                self.errorMessage = "You don't have permission..."
            case .notFound:
                self.errorMessage = "Campaign not found..."
            case .clientError(let statusCode):
                self.errorMessage = "Failed to update campaign (Error \(statusCode))..."
            case .serverError(let statusCode):
                self.errorMessage = "Server error (\(statusCode))..."
            case .networkError:
                self.errorMessage = "Network error..."
            default:
                self.errorMessage = "Failed to update campaign: \(error.localizedDescription)"
            }
        } else {
            self.errorMessage = "Failed to update campaign: \(error.localizedDescription)"
        }
        
        print("🚨 Setting error message: \(self.errorMessage ?? "nil")")
    }
}
```

**iOS Error Flow:**
1. API call fails
2. isLoading = false (overlay disappears)
3. errorMessage is set based on error type
4. Error alert is shown (via standardizedAlert binding at line 101-109)
5. User can dismiss and retry

**CRITICAL DETAIL:** iOS uses a nested if-let pattern to check error types.

### Error Flow - Webapp

**Lines 126-147 (error handling in onSubmit):**
```tsx
} catch (error: any) {
  let errorMessage = 'Failed to update campaign';

  if (error?.response?.status === 401 || error?.response?.status === 403) {
    errorMessage = "You don't have permission...";
  } else if (error?.response?.status === 404) {
    errorMessage = "Campaign not found...";
  } else if (error?.response?.status >= 400 && error?.response?.status < 500) {
    errorMessage = `Failed to update campaign (Error ${error.response.status})...`;
  } else if (error?.response?.status >= 500 && error?.response?.status < 600) {
    errorMessage = `Server error (${error.response.status})...`;
  } else if (error?.message === 'Network Error' || !error?.response) {
    errorMessage = "Network error...";
  }

  toast({
    title: 'Error',
    description: errorMessage,
    variant: 'destructive',
  });
}
```

**Webapp Error Flow:**
1. API call fails
2. Error status is checked
3. errorMessage is set based on status code
4. Error toast is shown
5. Form remains on page (user can retry)

**DIFFERENCE:** iOS uses error.response?.status while webapp checks error.response?.status. Both are valid axios/fetch error handling patterns.

### Delete Success Flow - iOS

**Lines 134-138 (delete button action):**
```swift
Button("Delete", role: .destructive) {
    print("✅ Delete confirmed")
    viewModel.deleteCampaign { success in
        if success {
            dismiss()
        }
    }
}
```

**Lines 521-523 (delete success in viewModel):**
```swift
await MainActor.run {
    self.isDeleting = false
    onSuccess(true)
}
```

**iOS Delete Flow:**
1. Delete button clicked in confirmation dialog
2. API call made (isDeleting = true, button shows loading state)
3. Delete success
4. isDeleting = false
5. onSuccess(true) callback executed
6. dismiss() called (navigates back)
7. No confirmation alert shown

**CRITICAL DETAIL:** Delete does NOT show a success alert, it immediately navigates.

### Delete Success Flow - Webapp

**Lines 160-178 (delete handler):**
```tsx
const handleDelete = async () => {
  try {
    await deleteCampaign.mutateAsync(campaignId);

    toast({
      title: 'Campaign Deleted',
      description: 'Your credits have been refunded to your account.',
    });

    router.push('/campaigns');
  } catch (error) {
    toast({
      title: 'Error',
      description: 'Failed to delete campaign',
      variant: 'destructive',
    });
  }
  setShowDeleteConfirmation(false);
};
```

**Webapp Delete Flow:**
1. Delete button in alert clicked
2. API call made (deleteCampaign.isPending = true, delete button shows "Deleting...")
3. Delete success
4. Success toast shown
5. router.push executed
6. Alert is dismissed
7. Navigation happens

**DIFFERENCE:**
- **iOS navigates immediately after delete success**
- **Webapp shows a success toast then navigates**

---

## 6. VALIDATION TIMING

### When is Validation Triggered?

**iOS:**
- **Triggered:** Only on Save button click (form submission)
- **Location:** Lines 426-443 in `updateCampaign` function
- **Scope:** Form-level validation (all required fields checked before API call)

```swift
if title.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty {
    titleError = "Title is required"
    hasError = true
}
// ... similar for description and requirements
if hasError {
    return  // Exit without calling API
}
```

**Webapp:**
- **Triggered:** Only on Save button click (form submission)
- **Location:** Lines 63-72 (zod schema), lines 110+ (onSubmit handler)
- **Scope:** Form-level validation via zod resolver

```tsx
const form = useForm<EditCampaignFormData>({
  resolver: zodResolver(editCampaignSchema),
  ...
});
```

**RESULT:** Both use ON-SUBMIT validation only. NO on-blur, on-change, or real-time validation.

### Field-Level Error Display

**iOS (StandardizedFormField component):**
```swift
// Error Message (lines 198-200 of StandardizedFormComponents.swift)
if let errorMessage = errorMessage {
    Text(errorMessage)
        .font(.system(size: 12))
        // ...
}
```

The errorMessage is passed as a prop and displayed inline below the field.

**Webapp (FormField component):**
```tsx
<FormField
  control={form.control}
  name="title"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Campaign Title</FormLabel>
      <FormControl>
        <Input placeholder="Enter campaign title" {...field} />
      </FormControl>
      <FormMessage />  // Shows field validation errors
    </FormItem>
  )}
/>
```

FormMessage component displays errors from the form's validation state.

**RESULT:** Both display field-level errors inline next to the field.

### Form-Level vs Field-Level

**iOS:**
- Sets individual field errors: titleError, descriptionError, requirementsError
- Errors are stored in viewModel as separate @Published properties
- Each field independently renders its error message

**Webapp:**
- Uses zod schema for centralized validation
- react-hook-form manages validation state
- FormMessage component displays errors from form state

**RESULT:** Different architecture but same user experience - errors shown inline per field.

---

## 7. READ-ONLY DATE FIELDS

### When Dates Become Read-Only

**iOS (lines 30-38, 211-217, 256-261):**
```swift
private var canEditStartDate: Bool {
    return campaign.periodStart ?? Date() > Date()
}

private var canEditEndDate: Bool {
    return campaign.periodEnd ?? Date() > Date()
}
```

Then conditionally renders:
```swift
if canEditStartDate {
    DropdownDatePicker(...)
} else {
    // Read-only date display
    ZStack(alignment: .topLeading) {
        HStack { Text(dateFormatter.string(from: startDate)) ... }
        .background(AppColors.backgroundSecondary)
        // Floating label
        Text("Start Date")
    }
    Text("(Cannot edit - date has passed)")
}
```

**Webapp (lines 88-94, 317, 336):**
```tsx
const canEditStartDate = campaign?.startDate
  ? new Date(campaign.startDate) > new Date()
  : true;

// Then:
<Input type="date" {...field} disabled={!canEditStartDate} />
{!canEditStartDate && (
    <p className="text-sm text-muted-foreground">
        Cannot edit - date has passed
    </p>
)}
```

**Difference:**
- **iOS completely replaces the input with a read-only display**
- **Webapp disables the input and shows a helper message**

### How Disabled Dates Are Handled on Save

**iOS (lines 379-380):**
```swift
startDate: canEditStartDate ? startDate : campaign.periodStart ?? Date(),
endDate: canEditEndDate ? endDate : campaign.periodEnd ?? Date(),
```

**Critical behavior:** If a date field is NOT editable:
- The ORIGINAL campaign date is sent to API
- Not the current UI state value

**Webapp (lines 116-117):**
```tsx
period_start: data.startDate,
period_end: data.endDate,
```

The disabled input still has its value in the form data. Since it's disabled, users can't change it, but the value comes from the initial form population (lines 81-82):
```tsx
startDate: campaign.startDate?.split('T')[0] || '',
endDate: campaign.endDate?.split('T')[0] || '',
```

**RESULT:** Both send the original unchanged date value for read-only fields.

---

## 8. LOADING AND DISABLED STATES

### Save Button Disabled State

**iOS (lines 95):**
```swift
.disabled(viewModel.isLoading)
```

Button is disabled when isLoading = true.

**Webapp (line 417):**
```tsx
<Button type="submit" disabled={updateCampaign.isPending}>
```

Button is disabled when isPending = true.

**Result:** Both disable the save button during API call.

### Delete Button Disabled State

**iOS (line 342):**
```swift
.disabled(!canDeleteCampaign || viewModel.isDeleting)
```

Button is disabled if:
1. Campaign cannot be deleted (hasStarted OR hasAcceptedInfluencers)
2. Delete operation is in progress

**Webapp (line 384):**
```tsx
disabled={!canDeleteCampaign || deleteCampaign.isPending}
```

Same logic.

**Result:** Same disabled state logic.

### Visual Loading Indicator

**iOS (lines 328-332):**
```swift
if viewModel.isDeleting {
    ProgressView()
        .progressViewStyle(CircularProgressViewStyle(tint: .white))
        .scaleEffect(0.8)
}
Text("Delete Campaign")
```

Shows a spinner inside the delete button during deletion.

**Webapp (lines 387-391):**
```tsx
{deleteCampaign.isPending ? (
    <>
        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
        Deleting...
    </>
) : (
    <>
        <Trash2 className="mr-2 h-4 w-4" />
        Delete Campaign
    </>
)}
```

Shows a spinner and changes text to "Deleting..." during deletion.

**DIFFERENCE:**
- **iOS shows spinner + original button text "Delete Campaign"**
- **Webapp shows spinner + changed text "Deleting..."**

---

## 9. NAVIGATION AND CLEANUP

### After Successful Save

**iOS (lines 117-123):**
```swift
action: {
    viewModel.showingSuccessAlert = false
    if let updatedCampaign = viewModel.updatedCampaignCache {
        onSave(updatedCampaign)
    }
    dismiss()
}
```

1. Success alert dismissed
2. onSave callback invoked with updated campaign
3. View is dismissed (pops navigation stack)

**Webapp (lines 120-125):**
```tsx
toast({
  title: 'Campaign Updated',
  description: 'Your changes have been saved successfully',
});

router.push(`/campaigns/${campaignId}`);
```

1. Toast shown
2. Navigation to campaign detail page

**Note:** The URLs are different:
- iOS: Dismisses and returns to previous screen
- Webapp: Navigates to `/campaigns/{id}` (detail page)

### After Successful Delete

**iOS (lines 134-138):**
```swift
viewModel.deleteCampaign { success in
    if success {
        dismiss()
    }
}
```

Immediately dismisses on success (no alert).

**Webapp (lines 162-169):**
```tsx
await deleteCampaign.mutateAsync(campaignId);

toast({
  title: 'Campaign Deleted',
  description: 'Your credits have been refunded to your account.',
});

router.push('/campaigns');
```

Shows success toast then navigates to campaigns list.

**Difference:**
- **iOS uses dismiss() (pops to previous screen)**
- **Webapp uses router.push('/campaigns') (always goes to list)**

---

## 10. BACKEND API EXPECTATIONS

### updateCampaign Endpoint

**Endpoint:** `PUT /business/campaigns/{campaignId}`

**Request Body (from iOS/webapp):**
```json
{
  "title": "string",
  "description": "string",
  "requirements": "string",
  "period_start": "2025-12-31" OR "2025-12-31T00:00:00Z",
  "period_end": "2025-12-31" OR "2025-12-31T00:00:00Z"
}
```

**Backend Processing (lines 2302-2356 in business.ts):**
1. Converts snake_case to camelCase (lines 2304-2320)
2. Validates which fields can be edited based on campaign state (lines 2253-2298)
3. Converts date strings to Date objects (lines 2355-2357)
4. Calls campaignService.updateCampaign

**Allowed fields to edit (lines 2271-2286):**
- Always editable: "description", "requirements", "targetCustomers"
- Editable before start: "title", "visibility", "influencerSpots", "periodStart", "periodEnd", "creditsPerAction", "totalCredits", "imageUrl"
- After start: Only description, requirements, targetCustomers

**CRITICAL FINDING:** Backend restricts which fields can be edited based on campaign state!
- iOS and webapp both send all 5 fields (title, description, requirements, period_start, period_end)
- Backend will REJECT the update if trying to edit title or dates AFTER campaign has started
- The error will be 403 Forbidden with message: "Cannot edit these fields because campaign has already started"

### deleteCampaign Endpoint

**Endpoint:** `DELETE /business/campaigns/{campaignId}`

**Checks (lines 2428-2462):**
1. Campaign ownership verification
2. Campaign hasn't started (unless it's a loyalty_reward campaign)
3. No accepted influencers
4. Refunds credits before deletion

**Error Responses:**
- 400: "Cannot delete campaign that has already started"
- 400: "Cannot delete campaign with accepted influencers"

---

## 11. BUSINESS LOGIC DIFFERENCES

### Delete Permission Logic

**iOS Computed Properties (lines 41-60):**
```swift
private var canDeleteCampaign: Bool {
    let hasNotStarted = (campaign.periodStart ?? Date()) > Date()
    let hasNoAcceptedInfluencers = (campaign.influencerCount ?? 0) == 0
    return hasNotStarted && hasNoAcceptedInfluencers
}

private var deleteDisabledReason: String? {
    if (campaign.periodStart ?? Date()) <= Date() {
        return "Cannot delete campaign that has already started"
    }
    if (campaign.influencerCount ?? 0) > 0 {
        return "Cannot delete campaign with accepted influencers"
    }
    return nil
}
```

**Decision Points:**
1. Check if campaign has started: periodStart > Date()
2. Check if has accepted influencers: influencerCount == 0
3. If not both conditions, show reason why

**Webapp Logic (lines 97-108):**
```tsx
const canDeleteCampaign = campaign
  ? (campaign.startDate ? new Date(campaign.startDate) > new Date() : true) &&
    (campaign.influencerCount ?? 0) === 0
  : false;

const deleteDisabledReason = campaign
  ? !canDeleteCampaign
    ? campaign.startDate && new Date(campaign.startDate) <= new Date()
      ? "Cannot delete campaign that has already started"
      : "Cannot delete campaign with accepted influencers"
    : undefined
  : undefined;
```

**Decision Points:** Same as iOS.

**RESULT:** Delete permission logic is IDENTICAL between iOS and webapp.

---

## 12. FORM FIELD INITIALIZATION

### Initial State - iOS

**Lines 11-15:**
```swift
@State private var title: String = ""
@State private var description: String = ""
@State private var requirements: String = ""
@State private var startDate: Date = Date()
@State private var endDate: Date = Date()
```

Initialized to empty strings and current date.

**Lines 363-371 (setupInitialValues on appear):**
```swift
func setupInitialValues() {
    title = campaign.title
    description = campaign.description ?? ""
    requirements = campaign.requirements ?? ""
    startDate = campaign.periodStart ?? Date()
    endDate = campaign.periodEnd ?? Date()
    
    viewModel.setup(with: campaign)
}
```

Populates from campaign data on view appear.

### Initial State - Webapp

**Lines 65-72:**
```tsx
const form = useForm<EditCampaignFormData>({
  resolver: zodResolver(editCampaignSchema),
  defaultValues: {
    title: '',
    description: '',
    requirements: '',
    startDate: '',
    endDate: '',
  },
});
```

Default values are empty strings.

**Lines 75-85 (useEffect when campaign loads):**
```tsx
useEffect(() => {
  if (campaign) {
    form.reset({
      title: campaign.title || '',
      description: campaign.description || '',
      requirements: campaign.requirements || '',
      startDate: campaign.startDate?.split('T')[0] || '',
      endDate: campaign.endDate?.split('T')[0] || '',
    });
  }
}, [campaign, form]);
```

Populates form when campaign data is loaded.

**RESULT:** Both populate from campaign data, but:
- iOS uses Date objects for dates
- Webapp uses date strings (YYYY-MM-DD format)

---

## 13. HIDDEN SUBTLETIES AND EDGE CASES

### Whitespace in Titles

**Scenario:** User enters " Product Launch "

**iOS:**
- Validation checks: ` Product Launch `.trimmed = "Product Launch" ✓ passes
- Sent to API: " Product Launch " (with spaces!)
- API receives untrimmed value

**Webapp:**
- Validation checks: ` Product Launch `.trim() = "Product Launch" ✓ passes
- Sent to API: "Product Launch" (spaces trimmed)
- API receives trimmed value

**SUBTLETY:** Different whitespace handling could cause inconsistency in API behavior.

### Newlines in Description

**Scenario:** User pastes text with \n characters

**iOS:**
- Validation: Checks if `trimmed.isEmpty` (removes leading/trailing newlines)
- Sent to API: Original text with newlines
- Could send a description that is only "\n\n\n" before trimming

**Webapp:**
- Validation: Zod `.trim()` removes leading/trailing whitespace including newlines
- Sent to API: Trimmed version
- Will fail validation if only whitespace remains

**SUBTLETY:** If iOS receives text that is "   \n\n   ", it will pass validation and be sent to API with all the whitespace.

### Date at Exact Midnight Boundary

**Scenario:** Campaign starts today at 00:00:00 UTC

**iOS Code (line 32):**
```swift
return campaign.periodStart ?? Date() > Date()
```

If periodStart = "2025-10-23T00:00:00Z" and current time is "2025-10-23T14:00:00Z", then:
- periodStart (2025-10-23 00:00) > now (2025-10-23 14:00) = FALSE
- Date is NOT editable (correct)

But if periodStart = "2025-10-23T23:59:59Z" and current is "2025-10-23T14:00:00Z":
- periodStart (2025-10-23 23:59) > now (2025-10-23 14:00) = TRUE
- Date IS editable (correct)

**SUBTLETY:** The exact time comparison matters. If campaign periodStart is in the future, even by 1 second, it's editable.

### Timezone Implications

**iOS:** Uses `Date()` which is in local timezone
**Webapp:** HTML input type="date" is user's local timezone
**Backend:** Converts ISO8601 strings which include timezone info

**SUBTLETY:** Timezone mismatches could cause dates to be interpreted differently.

### Campaign with NULL Dates

**iOS:**
```swift
startDate = campaign.periodStart ?? Date()  // Falls back to current date
```

If campaign has NULL periodStart, iOS initializes to TODAY.

**Webapp:**
```tsx
startDate: campaign.startDate?.split('T')[0] || ''  // Falls back to empty string
```

If campaign has NULL startDate, webapp initializes to empty string.

**On Save - iOS:**
```swift
startDate: canEditStartDate ? startDate : campaign.periodStart ?? Date()
```

If campaign.periodStart is nil, saves current Date() to API.

**On Save - Webapp:**
The form has empty string, but input is disabled/enabled based on canEditStartDate logic.

**SUBTLETY:** iOS will CHANGE null dates to today when saving, webapp will keep them empty.

---

## 14. EXACT LINE NUMBERS - CRITICAL SECTIONS

### Validation Entry Point
- **iOS:** Line 373-384 (saveChanges function)
- **Webapp:** Line 110 (onSubmit function)

### Validation Logic
- **iOS:** Lines 426-439 (updateCampaign in viewModel)
- **Webapp:** Lines 39-45 (editCampaignSchema zod definition)

### API Request Construction
- **iOS:** Lines 452-458 (CampaignUpdateRequest creation)
- **Webapp:** Lines 112-118 (updateCampaign.mutateAsync call)

### Success Handling
- **iOS:** Lines 469-477 (updateCampaign success)
- **Webapp:** Lines 120-125 (onSubmit success)

### Error Handling
- **iOS:** Lines 486-503 (updateCampaign error)
- **Webapp:** Lines 126-140 (onSubmit error)

### Delete Success
- **iOS:** Lines 521-523 (deleteCampaign success) + Lines 117-123 (success alert)
- **Webapp:** Lines 162-169 (handleDelete success)

### Delete Confirmation
- **iOS:** Lines 127-142 (alert dialog)
- **Webapp:** Lines 426-444 (AlertDialog component)

---

## 15. SUMMARY OF CRITICAL DIFFERENCES

| Feature | iOS | Webapp | Impact |
|---------|-----|--------|--------|
| Description label | "Campaign Details" | "Description" | Minor UX difference |
| Whitespace handling | UNTRIMMED values sent | TRIMMED values sent | API receives different values |
| Date format | ISO8601 full datetime | Date-only (YYYY-MM-DD) | Backend must handle both |
| Disabled date UI | Completely replaced | Input disabled + helper text | Different visual appearance |
| Success notification | Modal alert + navigation | Toast + immediate navigation | Different UX flow |
| Delete notification | No notification + navigation | Toast notification + navigation | Different UX flow |
| Delete button text | "Delete Campaign" | "Delete..." (during loading) | Different loading state text |
| Read-only date message | With parentheses: "(Cannot edit...)" | No parentheses: "Cannot edit..." | Minor text difference |

---

## 16. VALIDATION RULES COMPARISON

Both iOS and webapp enforce:
1. Title required (non-empty after trim)
2. Description required (non-empty after trim)
3. Requirements required (non-empty after trim)
4. Dates optional (can be empty or any value)
5. No date range validation (end date can be before start date)

**MISSING:** Neither iOS nor webapp validates that end date > start date.

---

## 17. CRITICAL FINDINGS FOR WEBAPP COMPATIBILITY

1. **Whitespace Handling Mismatch**: iOS sends untrimmed values while webapp sends trimmed values. Backend must accept both.

2. **Date Format Difference**: iOS sends ISO8601 (datetime) format while webapp sends date-only format. Backend accepts both via JavaScript Date constructor.

3. **Success Flow Timing**: iOS shows alert before navigation, webapp navigates immediately. Both acceptable but different UX.

4. **Field Label Inconsistency**: iOS calls it "Campaign Details" while webapp calls it "Description". Should standardize.

5. **Null Date Handling**: iOS defaults to today, webapp defaults to empty. Could cause data inconsistencies.

6. **No End Date Validation**: Both platforms allow end date to be before start date. This is likely a bug.

7. **Backend Field Restrictions**: Backend only allows certain fields to be edited after campaign starts. Neither iOS nor webapp is aware of these restrictions and will attempt to update all fields.

8. **Missing Error Handling**: Neither platform indicates which specific fields were rejected by the backend. Generic error message only.

---

## 18. RECOMMENDATIONS FOR CONSISTENCY

1. Standardize date label: Use "Description" on both platforms (not "Campaign Details")
2. Implement consistent whitespace handling: Both should trim values before sending
3. Add date range validation: End date must be >= start date
4. Standardize success flow: Either both show alert or both show toast
5. Handle backend field restriction errors: Parse error response to inform user which fields can't be edited
6. Standardize null date handling: Both should handle missing dates the same way
7. Add loading state consistency: Delete button text should be consistent or show identical spinner

