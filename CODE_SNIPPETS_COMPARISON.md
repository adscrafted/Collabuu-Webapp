# Code Snippets Comparison: iOS vs Webapp Campaign Edit

## 1. FORM FIELD VALIDATION

### iOS Validation (EditCampaignView.swift, lines 426-439)
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

### Webapp Validation (edit/page.tsx, lines 39-45)
```tsx
const editCampaignSchema = z.object({
  title: z.string().trim().min(1, 'Title is required'),
  description: z.string().trim().min(1, 'Description is required'),
  requirements: z.string().trim().min(1, 'Requirements are required'),
  startDate: z.string(),
  endDate: z.string(),
});
```

**Key Difference:** iOS validates THEN sends untrimmed. Webapp validates AND trims simultaneously.

---

## 2. API REQUEST CONSTRUCTION

### iOS Request (APIService.swift, lines 1711-1718)
```swift
func updateCampaign(campaignId: String, updates: CampaignUpdateRequest) async throws -> Campaign {
    let body: [String: Any] = [
        "title": updates.title,
        "description": updates.description,
        "requirements": updates.requirements,
        "period_start": updates.periodStart,
        "period_end": updates.periodEnd
    ]
    return try await put(endpoint: "business/campaigns/\(campaignId)", body: body, responseType: Campaign.self)
}

// CampaignUpdateRequest struct (lines 537-550)
struct CampaignUpdateRequest: Codable {
    let title: String
    let description: String
    let requirements: String
    let periodStart: String
    let periodEnd: String
    
    enum CodingKeys: String, CodingKey {
        case title
        case description
        case requirements
        case periodStart
        case periodEnd
    }
}
```

### Webapp Request (edit/page.tsx, lines 110-118)
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
```

**Key Difference:** 
- iOS: Creates explicit struct with CodingKeys
- Webapp: Sends object literal directly to hook mutation

---

## 3. DATE HANDLING ON SAVE

### iOS Date Send (EditCampaignView.swift, lines 453-457)
```swift
let updateRequest = CampaignUpdateRequest(
    title: title,
    description: description,
    requirements: requirements,
    periodStart: startDate.ISO8601Format(),
    periodEnd: endDate.ISO8601Format()
)
```

**Result:** `"2025-12-31T00:00:00Z"` (ISO8601)

### Webapp Date Send (edit/page.tsx, lines 116-117)
```tsx
period_start: data.startDate,  // from form field
period_end: data.endDate,      // from form field
```

Where form data comes from (lines 81-82):
```tsx
startDate: campaign.startDate?.split('T')[0] || ''
endDate: campaign.endDate?.split('T')[0] || ''
```

**Result:** `"2025-12-31"` (date only)

**Critical Difference:** Different formats sent to backend!

---

## 4. SUCCESS ALERT HANDLING

### iOS Success Flow (EditCampaignView.swift, lines 469-477)
```swift
await MainActor.run {
    self.isLoading = false
    self.showingSuccessAlert = true
    print("✅ Campaign updated successfully, showing alert")
    // Don't call onSuccess immediately - wait for user to dismiss alert
    self.updatedCampaignCache = updatedCampaign
}

// Then in alert (lines 115-123):
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

### Webapp Success Flow (edit/page.tsx, lines 120-125)
```tsx
toast({
  title: 'Campaign Updated',
  description: 'Your changes have been saved successfully',
});

router.push(`/campaigns/${campaignId}`);
```

**Critical Difference:** 
- iOS: Modal alert blocks until dismissed
- Webapp: Toast shown, immediate navigation

---

## 5. ERROR HANDLING

### iOS Error Handling (EditCampaignView.swift, lines 486-503)
```swift
if let apiError = error as? APIError {
    switch apiError {
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
    default:
        self.errorMessage = "Failed to update campaign: \(error.localizedDescription)"
    }
} else {
    self.errorMessage = "Failed to update campaign: \(error.localizedDescription)"
}
```

### Webapp Error Handling (edit/page.tsx, lines 126-147)
```tsx
let errorMessage = 'Failed to update campaign';

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

toast({
  title: 'Error',
  description: errorMessage,
  variant: 'destructive',
});
```

**Similarity:** Error messages are identical text. Different pattern matching approach.

---

## 6. DELETE CONFIRMATION

### iOS Delete Dialog (EditCampaignView.swift, lines 127-142)
```swift
.alert("Delete Campaign", isPresented: $showingDeleteConfirmation) {
    Button("Cancel", role: .cancel) {
        print("❌ Delete cancelled")
        showingDeleteConfirmation = false
    }
    Button("Delete", role: .destructive) {
        print("✅ Delete confirmed")
        viewModel.deleteCampaign { success in
            if success {
                dismiss()
            }
        }
    }
} message: {
    Text("Are you sure you want to delete this campaign? Your credits will be refunded to your account. This action cannot be undone.")
}
```

### Webapp Delete Dialog (edit/page.tsx, lines 426-444)
```tsx
<AlertDialog open={showDeleteConfirmation} onOpenChange={setShowDeleteConfirmation}>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Delete Campaign</AlertDialogTitle>
      <AlertDialogDescription>
        Are you sure you want to delete this campaign? Your credits will be refunded to your account. This action cannot be undone.
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>Cancel</AlertDialogCancel>
      <AlertDialogAction
        onClick={handleDelete}
        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
      >
        Delete
      </AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
```

**Similarity:** Messages are identical.

---

## 7. DATE EDITABILITY LOGIC

### iOS (EditCampaignView.swift, lines 30-38)
```swift
private var canEditStartDate: Bool {
    return campaign.periodStart ?? Date() > Date()
}

private var canEditEndDate: Bool {
    return campaign.periodEnd ?? Date() > Date()
}
```

### Webapp (edit/page.tsx, lines 88-94)
```tsx
const canEditStartDate = campaign?.startDate
  ? new Date(campaign.startDate) > new Date()
  : true;

const canEditEndDate = campaign?.endDate
  ? new Date(campaign.endDate) > new Date()
  : true;
```

**Similarity:** Same comparison logic.

---

## 8. DELETE PERMISSION LOGIC

### iOS (EditCampaignView.swift, lines 41-60)
```swift
private var canDeleteCampaign: Bool {
    // Can delete if campaign hasn't started yet
    let hasNotStarted = (campaign.periodStart ?? Date()) > Date()
    
    // Check if there are no accepted influencers
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

### Webapp (edit/page.tsx, lines 97-108)
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

**Similarity:** Logic is identical, formatting is different.

---

## 9. INITIAL FORM POPULATION

### iOS (EditCampaignView.swift, lines 363-371)
```swift
private func setupInitialValues() {
    title = campaign.title
    description = campaign.description ?? ""
    requirements = campaign.requirements ?? ""
    startDate = campaign.periodStart ?? Date()
    endDate = campaign.periodEnd ?? Date()
    
    viewModel.setup(with: campaign)
}
```

Called in `.onAppear` (line 144).

### Webapp (edit/page.tsx, lines 75-85)
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

Called when `campaign` data loads.

**Key Difference:** Webapp extracts date portion only from ISO8601 string.

---

## 10. BACKEND ROUTE HANDLER EXCERPT

### Backend Campaign Update (business.ts, lines 2189-2368)
```typescript
private async updateCampaign(req: AuthenticatedRequest, res: Response) {
  try {
    const userId = req.user?.id;
    const campaignId = req.params.id;

    // ... ownership checks ...

    // Define which fields are safe to edit
    const alwaysEditableFields = [
      "description",
      "requirements", 
      "targetCustomers"
    ];
    
    const editableBeforeStartFields = [
      "title",
      "visibility",
      "influencerSpots",
      "periodStart",
      "periodEnd",
      "creditsPerAction", 
      "totalCredits",
      "imageUrl"
    ];

    // Campaign has started = only allow safe edits
    let allowedFields: string[] = [];
    
    if (!campaignHasStarted) {
      allowedFields = [...alwaysEditableFields, ...editableBeforeStartFields];
    } else {
      allowedFields = alwaysEditableFields;
    }

    // Check if user is trying to edit restricted fields
    const requestedFields = Object.keys(normalizedBody);
    const restrictedFields = requestedFields.filter(field => !allowedFields.includes(field));
    
    if (restrictedFields.length > 0) {
      return res.status(403).json({
        error: `Cannot edit these fields because ${statusMessage}`,
        restrictedFields,
        allowedFields,
        message: `You can only edit: ${allowedFields.join(', ')}`
      });
    }

    // Convert dates
    if (updates.periodStart)
      updates.periodStart = new Date(updates.periodStart);
    if (updates.periodEnd) 
      updates.periodEnd = new Date(updates.periodEnd);

    const updatedCampaign = await this.campaignService.updateCampaign(
      campaignId,
      updates,
    );

    res.status(200).json(updatedCampaign);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
}
```

**Critical Note:** Backend RESTRICTS which fields can be edited based on campaign state!

---

## Summary Table

| Aspect | iOS | Webapp | Status |
|--------|-----|--------|--------|
| Validation logic | Manual trim + check | Zod schema trim | Identical behavior |
| Data sent | Untrimmed | Trimmed | DIFFERENT |
| Date format | ISO8601 | YYYY-MM-DD | DIFFERENT |
| Success flow | Modal alert | Toast + nav | DIFFERENT |
| Error messages | Switch statement | If/else chain | Identical text |
| Delete confirmation | Native alert | AlertDialog | Identical text |
| Date comparison | > operator | > operator | Identical |
| Delete permissions | Computed properties | Const variables | Identical logic |
| Field labels | "Campaign Details" | "Description" | DIFFERENT |

