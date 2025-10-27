# BRD Phase 3 UI Completion Plan

## Overview

Complete the integration of BRD Phase 3 features into the admin UI, focusing on the Cases page.

## Step 1: Update Cases Page (`app/admin/cases/page.tsx`)

### 1.1 Import New Components

```typescript
import { PriorityBadge } from "@/components/ui/priority-badge";
import { CaseAssignmentSelect } from "@/components/ui/case-assignment-select";
import { LabelsInput } from "@/components/ui/labels-input";
```

### 1.2 Add State for Phase 3 Features

```typescript
const [admins, setAdmins] = useState<AdminUser[]>([]);
const [labels, setLabels] = useState<ReportLabel[]>([]);
const [loadingAssignment, setLoadingAssignment] = useState(false);
```

### 1.3 Load Admins and Labels

```typescript
useEffect(() => {
  loadAdmins();
}, []);

useEffect(() => {
  if (selectedCase) {
    loadLabels();
  }
}, [selectedCase]);

const loadAdmins = async () => {
  const { getAdminUsers } = await import("@/lib/services/reports");
  const adminsList = await getAdminUsers();
  setAdmins(adminsList);
};

const loadLabels = async () => {
  if (!selectedCase) return;
  const { getLabelsForReport } = await import("@/lib/services/labels");
  const labelsList = await getLabelsForReport(selectedCase.id);
  setLabels(labelsList);
};
```

### 1.4 Add Priority Column to Table

Add after Status column:

```typescript
<TableHead>Priority</TableHead>
```

And in the table body:

```typescript
<TableCell>
  <PriorityBadge priority={case_.priority} />
</TableCell>
```

### 1.5 Add Assignment Handler

```typescript
const handleAssign = async (adminId: string) => {
  if (!selectedCase) return;

  setLoadingAssignment(true);
  try {
    const { assignCase } = await import("@/lib/services/reports");
    const result = await assignCase(selectedCase.id, adminId);

    if (result.success) {
      // Refresh cases and selected case
      await loadCases();
      // Update selected case assignment
      setSelectedCase({ ...selectedCase, assigned_to: adminId });
    }
  } catch (error) {
    console.error("Error assigning case:", error);
    alert("Failed to assign case");
  } finally {
    setLoadingAssignment(false);
  }
};
```

### 1.6 Add Label Handlers

```typescript
const handleAddLabel = async (label: string, color: string) => {
  if (!selectedCase) return;

  const { addLabel } = await import("@/lib/services/labels");
  const result = await addLabel({
    report_id: selectedCase.id,
    label,
    color,
  });

  if (result.success) {
    await loadLabels();
  }
};

const handleRemoveLabel = async (labelId: string) => {
  const { removeLabel } = await import("@/lib/services/labels");
  const result = await removeLabel(labelId);

  if (result.success) {
    await loadLabels();
  }
};
```

### 1.7 Add Priority/Assignment/Labels Sections to Drawer

In the case details drawer, add new sections:

```typescript
{
  /* Assignment Section */
}
<Card>
  <CardHeader>
    <CardTitle className="text-sm">Assignment</CardTitle>
  </CardHeader>
  <CardContent>
    <CaseAssignmentSelect
      admins={admins}
      currentAssigneeId={selectedCase.assigned_to}
      onAssign={handleAssign}
      disabled={loadingAssignment}
    />
  </CardContent>
</Card>;

{
  /* Priority Section */
}
<Card>
  <CardHeader>
    <CardTitle className="text-sm">Priority</CardTitle>
  </CardHeader>
  <CardContent>
    <PriorityBadge priority={selectedCase.priority} />
    <p className="text-xs text-muted-foreground mt-2">
      {selectedCase.priority ? "Current priority level" : "No priority set"}
    </p>
  </CardContent>
</Card>;

{
  /* Labels Section */
}
<Card>
  <CardHeader>
    <CardTitle className="text-sm">Labels</CardTitle>
  </CardHeader>
  <CardContent>
    <LabelsInput
      labels={labels}
      onAdd={handleAddLabel}
      onRemove={handleRemoveLabel}
    />
  </CardContent>
</Card>;
```

### 1.8 Add Priority and Source Filter Dropdowns

In the filters section, add:

```typescript
<div className="w-[150px]">
  <Select value={priorityFilter} onValueChange={setPriorityFilter}>
    <SelectTrigger>
      <SelectValue placeholder="Priority" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="all">All Priorities</SelectItem>
      <SelectItem value="high">High</SelectItem>
      <SelectItem value="medium">Medium</SelectItem>
      <SelectItem value="low">Low</SelectItem>
    </SelectContent>
  </Select>
</div>
```

## Step 2: Update Track Page (if needed for encryption indicator)

Add a subtle indicator that messages are encrypted. This is already handled by the encryption service, but we could add a visual cue.

## Step 3: Create "Add Case" Component (Optional for Phase 3)

This can be a separate modal/form for creating offline cases. Currently not critical for basic functionality.

## Step 4: Testing Checklist

- [ ] Priority badges display in table
- [ ] Case assignment works
- [ ] Assignment persists after page refresh
- [ ] Labels can be added/removed
- [ ] Labels persist
- [ ] Filters work with priority
- [ ] All changes are reflected in real-time

## Implementation Order

1. First: Add priority badges and assignment to cases table
2. Second: Add to case details drawer
3. Third: Add labels functionality
4. Fourth: Add filters
5. Fifth: Test thoroughly

## Estimated Time: 2-3 hours
