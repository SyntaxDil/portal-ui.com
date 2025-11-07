# Temple DJ Spot - Multi-Stage Implementation Guide

## ✅ COMPLETED

### 1. Extended Schedule (2 Days)
**Status:** DONE ✅  
**Details:** Schedule now runs from Jan 31 00:00 to Feb 1 16:00 (40 hours total)
- Updated `buildTempleBaseSchedule()` function to accept stage name parameter
- Time slots now include day prefix (Jan 31 / Feb 1)
- 160 total time slots (40 hours × 4 slots per hour)

### 2. Multi-Stage Infrastructure
**Status:** DONE ✅  
**Details:** Added support for 3 stages
- Added state for `dubPubSchedule` and `technoHubSchedule`
- Created `setupStageListener()` helper function
- All 3 stages load from Firestore: `schedule/mainStage`, `schedule/dubPub`, `schedule/technoHub`
- Each stage gets its own base schedule on creation

### 3. Block Merging Logic
**Status:** DONE ✅  
**Details:** Core functions for merging/unmerging slots
- `handleToggleSelectionMode()` - Toggle selection mode on/off
- `handleSlotSelection()` - Track which slots are selected
- `handleMergeSlots()` - Merge adjacent selected slots into larger blocks
- `handleUnmergeSlot()` - Break merged blocks back into 15-min slots
- Updated TimeSlot interface with merge properties: `isMergedStart`, `mergedCount`, `mergedWith`

## 🚧 IN PROGRESS / TODO

### 4. Update TimeSlot Component Rendering
**What's needed:**
```typescript
// In TimeSlot component (line ~1376):
// - Add these props: isSelected, onSlotClick, selectionMode, onUnmerge
// - Skip rendering if slot.mergedWith !== undefined (continuation slots)
// - Show artist photo next to time
// - Display merged block info (X slots, Y minutes)
// - Add unmerge button for merged blocks
// - Highlight selected slots in yellow
// - Show purple border for merged blocks
```

**Implementation:**
The TimeSlot component needs to be updated to pass the following props:
- `isSelected={selectedSlots.includes(index)}`
- `onSlotClick={handleSlotSelection}`
- `selectionMode={selectionMode}`
- `onUnmerge={handleUnmergeSlot}`

### 5. Update ScheduleBoard Component
**What's needed:**
```typescript
// In ScheduleBoard component (line ~1310):
// - Add merge/unmerge related props to function signature
// - Add "Merge Blocks" button in header
// - Add "Merge (X slots)" button when slots selected
// - Pass new props down to TimeSlot components
```

**Buttons to add:**
```tsx
<button onClick={onToggleSelectionMode}>
  {selectionMode ? 'Cancel Selection' : 'Merge Blocks'}
</button>
{selectionMode && selectedSlots.length > 1 && (
  <button onClick={onMergeSlots}>Merge ({selectedSlots.length} slots)</button>
)}
```

### 6. Add Stage Switcher UI
**What's needed:**
```tsx
// Add above ScheduleBoard (in main render):
<div className="flex gap-4 mb-4">
  <button 
    onClick={() => setViewMode('single')} 
    className={viewMode === 'single' ? 'active' : ''}
  >
    Single Stage
  </button>
  <button 
    onClick={() => setViewMode('multi')} 
    className={viewMode === 'multi' ? 'active' : ''}
  >
    All Stages
  </button>
</div>

{viewMode === 'single' && (
  <div className="flex gap-2 mb-4">
    <button onClick={() => setCurrentStage('mainStage')}>Main Stage</button>
    <button onClick={() => setCurrentStage('dubPub')}>Dub Pub</button>
    <button onClick={() => setCurrentStage('technoHub')}>Techno Hub</button>
  </div>
)}
```

### 7. Multi-Stage View Layout
**What's needed:**
```tsx
{viewMode === 'multi' ? (
  <div className="grid grid-cols-3 gap-4">
    <ScheduleBoard schedule={schedule} {...props} />
    <ScheduleBoard schedule={dubPubSchedule} {...props} />
    <ScheduleBoard schedule={technoHubSchedule} {...props} />
  </div>
) : (
  <ScheduleBoard schedule={getCurrentSchedule()} {...props} />
)}
```

### 8. Artist Logo Display
**Status:** Partially implemented in TimeSlot component
**What's needed:**
```tsx
// In TimeSlot render (already added):
{dj && dj.photoUrl && (
  <div className="mr-3">
    <img 
      src={dj.photoUrl} 
      className="w-12 h-12 rounded-full border-2 border-blue-400"
    />
  </div>
)}
```

## 🔧 INTEGRATION STEPS

### Step 1: Update Main Render to Pass New Props
Find where `<ScheduleBoard` is called (around line 738) and add:
```tsx
<ScheduleBoard
  // ... existing props ...
  selectionMode={selectionMode}
  selectedSlots={selectedSlots}
  onSlotClick={handleSlotSelection}
  onToggleSelectionMode={handleToggleSelectionMode}
  onMergeSlots={handleMergeSlots}
  onUnmerge={handleUnmergeSlot}
/>
```

### Step 2: Update Schedule Board Signature
In ScheduleBoard function (line ~1313), add these params:
```typescript
selectionMode: boolean;
selectedSlots: number[];
onSlotClick: (index: number) => void;
onToggleSelectionMode: () => void;
onMergeSlots: () => void;
onUnmerge: (index: number) => void;
```

### Step 3: Update TimeSlot Calls in ScheduleBoard
In the map where TimeSlot is rendered (line ~1350), add:
```tsx
<TimeSlot
  // ... existing props ...
  isSelected={selectedSlots.includes(index)}
  onSlotClick={onSlotClick}
  selectionMode={selectionMode}
  onUnmerge={onUnmerge}
/>
```

### Step 4: Add Stage Selector UI
Before the `<ScheduleBoard` section in main render, add stage selection buttons and view mode toggle.

### Step 5: Test Each Feature
1. **Extended Schedule:** Check that slots show "Jan 31" and "Feb 1" prefixes
2. **Selection Mode:** Click "Merge Blocks" button, select 2-3 adjacent slots, click "Merge"
3. **Unmerge:** Click "Unmerge" button on a merged block
4. **Artist Logos:** Assign DJ with photo URL, verify image shows next to time
5. **Multi-Stage:** Switch between stages, verify each loads independently
6. **Global View:** Toggle "All Stages" view, see 3 columns side-by-side

## 📦 STATE VARIABLES ADDED

```typescript
// Multi-stage support
const [dubPubSchedule, setDubPubSchedule] = useState<Schedule | null>(null);
const [technoHubSchedule, setTechnoHubSchedule] = useState<Schedule | null>(null);
const [currentStage, setCurrentStage] = useState<StageType>('mainStage');
const [viewMode, setViewMode] = useState<'single' | 'multi'>('single');

// Block merging
const [selectionMode, setSelectionMode] = useState(false);
const [selectedSlots, setSelectedSlots] = useState<number[]>([]);
```

## 🎨 STYLING NOTES

- **Selected Slots:** Yellow ring (`ring-yellow-500`)
- **Merged Blocks:** Purple left border (`border-l-4 border-purple-500`)
- **Merged Info:** Purple text showing slot count
- **Artist Photo:** 48x48px rounded, blue border
- **Selection Mode:** Cursor pointer, hover highlight

## 🔥 FIRESTORE STRUCTURE

```
apps/temple-djs/
  ├── djs/ (collection)
  ├── schedule/
  │   ├── mainStage (document)
  │   ├── dubPub (document)
  │   └── technoHub (document)
  ├── chat/
  └── ops/
```

## ⚠️ IMPORTANT NOTES

1. **Merged Slot Rendering:** Slots with `mergedWith` property should return `null` (skip rendering)
2. **Adjacent Validation:** Only allow merging adjacent slots (no gaps)
3. **Stage Updates:** Use `updateSchedule()` helper to write to correct stage path
4. **Selection Clear:** Clear `selectedSlots` after merge and when exiting selection mode
5. **DJ Assignment to Merged Blocks:** When assigning DJ to a merged block, apply to start slot only

## 🚀 BUILD & DEPLOY

```bash
cd Sites/TempleDjSpot
npm run build
git add .
git commit -m "feat: Multi-stage support with block merging and 2-day schedule"
git push origin main
```

## 📝 TESTING CHECKLIST

- [ ] Create a DJ with photo URL
- [ ] Assign DJ to slot, verify logo appears
- [ ] Enter selection mode
- [ ] Select 3 adjacent slots
- [ ] Click "Merge" button
- [ ] Verify merged block shows total time
- [ ] Click "Unmerge" button
- [ ] Verify slots separate
- [ ] Switch to "Dub Pub" stage
- [ ] Assign different DJs
- [ ] Switch to "All Stages" view
- [ ] Verify 3 columns display
- [ ] Test drag-drop still works
- [ ] Test extend handles still work
- [ ] Verify invite system works with 2-day schedule
