# Epic M-04: Camera, Photos & Upload Pipeline

| Field | Value |
|-------|-------|
| **Epic ID** | M-04 |
| **Title** | Camera, Photos & Upload Pipeline |
| **Description** | Implement the full photo documentation workflow for field crews: camera capture with metadata, gallery selection, categorization, compressed upload with retry, gallery viewing, and annotation tools. Photos are critical evidence for job completion, dispute resolution, and quality assurance. |
| **Priority** | P0 — Required for job documentation and completion gating |
| **Phase** | Phase 1 (Sprint 2) |
| **Screens** | 4 — Camera Capture, Photo Preview/Categorize, Photo Gallery, Annotation Canvas |
| **Total Stories** | 6 |

> **Source**: CleanerHQ-Mobile-App-PRD-v3.md Section 5.4

---

## Stories

### S1: Camera capture

**Description**: Field crews need to photograph job sites before, during, and after cleaning. The camera screen must automatically embed a timestamp overlay and capture GPS coordinates so photos serve as verifiable documentation. Both front and rear cameras must be supported for flexibility.

**Screen(s)**: Camera Capture

**API Dependencies**: None (capture is local; upload handled in S4)

**Key Components**: `CameraScreen`, `TimestampOverlay`, `CameraControls` (flash toggle, camera flip button), `PermissionPrompt`

**UI Specifications**:
- **Viewfinder**: Full-screen camera preview, no status bar (immersive), aspect ratio maintained
- **Category Selector**: Horizontal scroll strip above shutter, 48px from bottom safe-area. Pill chips: rounded-full, bg `rgba(0,0,0,0.5)`, text white 13px/500, active: bg `#B7F0AD` text `#1F2937`. Categories: "Before", "After", "Damage", "Detail"
- **Shutter Button**: Centered bottom, w-20 h-20 (80px), outer ring 80px white border-4, inner circle 64px bg white. Press state: inner circle scale-[0.9] 0.1s, capture flash overlay (white, opacity 0→0.5→0, 0.2s)
- **Secondary Controls**: Left of shutter: last photo thumbnail (48px rounded-xl, border-2 white), tap opens gallery. Right of shutter: flip camera icon (`fa-camera-rotate` 24px white)
- **Top Bar**: `fa-xmark` close button top-left (44px tap target), flash toggle top-right (`fa-bolt`/`fa-bolt-slash` 20px white)
- **Photo Count Badge**: Above shutter, centered, bg `rgba(0,0,0,0.6)` rounded-full, "3 of 10" text 12px/500 white

**Acceptance Criteria**:
- [ ] Photo captured using expo-camera with EXIF-style timestamp overlay (format: YYYY-MM-DD HH:mm:ss)
- [ ] GPS coordinates (latitude/longitude) captured via expo-location and attached to photo metadata
- [ ] Front and rear cameras both functional with smooth flip animation
- [ ] Flash toggle cycles through off/on/auto modes with corresponding icon
- [ ] Camera and location permission prompts shown on first use with clear rationale text
- [ ] Permission denied state shows settings deep-link button
- [ ] Shutter button provides haptic feedback on press
- [ ] Captured photo transitions to preview/categorize screen (S3)
- [ ] Full-screen viewfinder with immersive mode (no status bar)
- [ ] Shutter button is 80px with white border ring and 64px inner circle, scale feedback on press
- [ ] Category selector strip above shutter with pill chips (Before/After/Damage/Detail)
- [ ] Capture triggers white flash overlay animation (0.2s)
- [ ] Last photo thumbnail shown left of shutter for quick gallery access

**Dependencies**: M-00-S4 (API client for later upload)

**Estimate**: M

**Technical Notes**:
- Use `expo-camera` v15+ with the new Camera API
- Use `expo-location` for GPS; request `foregroundPermissions` only
- Timestamp overlay should be rendered on the image itself (not just UI) using canvas manipulation before save
- Store captured photos in app temp directory until upload completes
- Consider `expo-haptics` for shutter feedback

---

### S2: Gallery picker

**Description**: Crews may have already taken photos with their native camera app before opening CleanerHQ. The gallery picker allows selecting existing photos from the device library, with multi-select support and a preview grid before proceeding to categorization.

**Screen(s)**: Photo Preview/Categorize (shared with S1 output)

**API Dependencies**: None (selection is local)

**Key Components**: `GalleryPickerButton`, `PhotoPreviewGrid`, `SelectedPhotoThumbnail`

**Acceptance Criteria**:
- [ ] Gallery opens correctly on both iOS and Android via expo-image-picker
- [ ] Multi-select mode allows selecting up to 10 photos at once
- [ ] Selected photos displayed in a scrollable preview grid with remove (X) button per photo
- [ ] Photo count indicator shows "N selected" badge on gallery button
- [ ] Large files (>10MB) show warning before proceeding
- [ ] Picker respects media library permissions with appropriate prompt

**Dependencies**: None

**Estimate**: S

**Technical Notes**:
- Use `expo-image-picker` with `allowsMultipleSelection: true`
- Set `mediaTypes` to images only (no video)
- Preview grid should use 3-column layout matching the gallery view (S5)
- Consider `quality: 0.8` on selection to reduce initial file size

---

### S3: Photo categorization

**Description**: Every job photo must be categorized to support before/after comparisons, progress documentation, and issue reporting. The category selector appears after capture or gallery selection, before upload begins. Issue-category photos receive distinct visual treatment to draw attention during review.

**Screen(s)**: Photo Preview/Categorize

**API Dependencies**: `POST /jobs/{id}/photos` (category field in payload)

**Key Components**: `CategorySelector`, `CategoryChip`, `IssueBadge`

**Acceptance Criteria**:
- [ ] Category selector appears after photo capture (S1) or gallery selection (S2)
- [ ] Four categories available: Before, During, After, Issue
- [ ] Default category is "During" (pre-selected)
- [ ] Issue category chip has red border accent (#EF4444) and warning icon
- [ ] Category selection is per-photo when multiple photos are selected (batch default + individual override)
- [ ] Selected category is included in the upload payload sent to the API
- [ ] Category can be changed before upload is triggered

**Dependencies**: M-04-S1, M-04-S2

**Estimate**: S

**Technical Notes**:
- Use horizontal chip row for category selection (similar to filter tabs)
- Issue category should use `borderColor: '#EF4444'` and `backgroundColor: '#FEF2F2'`
- Store category in local photo metadata object alongside GPS and timestamp data

---

### S4: Photo upload pipeline

**Description**: The upload pipeline handles compression, progress tracking, retry logic, and batch queuing. Photos larger than 2MB are auto-compressed before upload. The pipeline must be resilient to network interruptions and support linking photos to specific checklist items.

**Screen(s)**: Photo Preview/Categorize (upload triggered from here), Job Detail (progress visible)

**API Dependencies**: `POST /jobs/{id}/photos` — multipart form upload, max 10MB, accepts JPEG/PNG/WebP

**Key Components**: `UploadQueue`, `UploadProgressBar`, `RetryBanner`, `CompressionService`

**Acceptance Criteria**:
- [ ] Photos exceeding 2MB are auto-compressed to 1920x1080 resolution at 0.8 quality before upload
- [ ] Upload progress indicator shows percentage per photo and overall batch progress
- [ ] Failed uploads retry automatically up to 3 times with exponential backoff (1s, 2s, 4s)
- [ ] Maximum file size of 10MB enforced with user-friendly error if compression cannot reduce below limit
- [ ] `checklist_item_id` linkage supported when photo is triggered from a checklist item (M-05-S3)
- [ ] Batch upload queue processes photos sequentially to avoid overwhelming the network
- [ ] Upload continues in background when navigating away from photo screen
- [ ] Upload queue persists across app backgrounding (short-duration)

**Dependencies**: M-04-S1, M-04-S2, M-04-S3, M-00-S4 (API client)

**Estimate**: L

**Technical Notes**:
- Use `expo-image-manipulator` for compression/resize
- Multipart form data: fields `photo` (file), `category`, `latitude`, `longitude`, `timestamp`, `checklist_item_id` (optional)
- Implement upload queue as a Zustand store with persistence via AsyncStorage
- Consider `expo-file-system` uploadAsync for background-capable uploads
- Content-Type must be `multipart/form-data` with proper boundary

---

### S5: Photo gallery view

**Description**: After photos are uploaded, crews and managers need to review them organized by category. The gallery provides a filterable grid view with full-screen viewing capability including pinch-to-zoom for inspecting details.

**Screen(s)**: Photo Gallery

**API Dependencies**: `GET /jobs/{id}/photos` — returns photo array with category filter support

**Key Components**: `PhotoGalleryGrid`, `CategoryFilterTabs`, `FullScreenViewer`, `PhotoCountBadge`

**UI Specifications**:
- **Grid Layout**: 3-column grid (`grid-cols-3`), gap-1 (4px), items aspect-square, rounded-lg overflow hidden
- **Category Filter Chips**: Horizontal scroll row at top, sticky below header. Same pill style: rounded-full, bg `#F0FAF4` border 1px `#B7F0AD` text `#2A5B4F` 13px/500, active: bg `#2A5B4F` text white. "All" chip first, then category-specific chips
- **Photo Thumbnail**: Aspect-square, object-cover, rounded-lg. Long-press: scale-[1.05] with shadow-floating + selection checkbox top-right (24px circle, mint fill, `fa-check` white)
- **Lightbox**: Full-screen black bg, pinch-to-zoom, swipe horizontal to navigate, close `fa-xmark` top-right white, photo counter bottom-center "2 / 8" 14px white
- **Count Badge on Tab**: Red `#EF4444` circle (min-w-5 h-5) on the Photos tab, text 11px/700 white, positioned top-right of tab icon
- **Empty State**: Centered `fa-camera` icon 48px `#D1D5DB`, "No photos yet" 16px/500 `#6B7280`, "Take Photo" mint button below

**Acceptance Criteria**:
- [ ] 3-column grid displays job photos as square thumbnails with consistent spacing
- [ ] Category filter tabs (All / Before / During / After / Issue) filter photos in real-time
- [ ] Active filter tab count shows number of photos in that category
- [ ] Tapping a thumbnail opens full-screen viewer with pinch-to-zoom (min 1x, max 5x)
- [ ] Full-screen viewer supports horizontal swipe to navigate between photos
- [ ] Photo count display shows "N photos" in section header
- [ ] Empty state shown when no photos exist for selected category
- [ ] Pull-to-refresh reloads photos from API
- [ ] 3-column grid with 4px gap and square aspect ratio thumbnails
- [ ] Category filter chips sticky below header with "All" as default
- [ ] Long-press on thumbnail activates selection mode with mint checkbox
- [ ] Lightbox supports pinch-to-zoom and horizontal swipe navigation
- [ ] Photo count badge renders on the Photos tab icon

**Dependencies**: M-03-S1 (job detail screen provides photo section entry point)

**Estimate**: M

**Technical Notes**:
- Use `react-native-reanimated` + `react-native-gesture-handler` for smooth pinch-to-zoom
- Consider `FlashList` or `FlatList` with `numColumns={3}` for the grid
- Thumbnail dimensions: `(screenWidth - 4 * spacing) / 3` for consistent squares
- Full-screen viewer can use `react-native-image-zoom-viewer` or custom gesture implementation
- Cache thumbnails locally for performance

---

### S6: Annotation tools

**Description**: Before uploading issue or documentation photos, crews can annotate them with arrows, circles, and text labels to highlight specific areas of concern. This is particularly valuable for damage documentation and communicating issues to office staff.

**Screen(s)**: Annotation Canvas

**API Dependencies**: None (annotations are burned into the image before upload via S4)

**Key Components**: `AnnotationCanvas`, `DrawingToolbar`, `ArrowTool`, `CircleTool`, `TextLabelTool`, `UndoButton`, `ClearButton`

**Acceptance Criteria**:
- [ ] Drawing tools available: arrow, circle/ellipse, text label
- [ ] Arrow tool allows drag to draw directional arrows with arrowhead
- [ ] Circle tool allows drag to draw circles/ellipses of variable size
- [ ] Text tool opens keyboard input then places text at tapped location
- [ ] Tool selection UI shows active tool with highlight state
- [ ] Color picker offers at least 4 colors: red (default), yellow, white, blue
- [ ] Undo button removes last annotation; clear button removes all with confirmation
- [ ] Annotations are burned/flattened into the image before proceeding to upload
- [ ] Drawing works correctly on both iOS and Android with finger input
- [ ] Canvas supports both portrait and landscape photo orientations

**Dependencies**: M-04-S1, M-04-S2

**Estimate**: L

**Technical Notes**:
- Use `react-native-skia` or `expo-canvas` for high-performance drawing
- Store annotations as a layer array (type, coordinates, color, text) for undo support
- Flatten annotations onto image using canvas `toImage()` before passing to upload pipeline
- Arrow rendering: draw line with rotation-calculated arrowhead triangle at endpoint
- Text labels should have semi-transparent background for readability
- Consider limiting annotation canvas to a maximum of 20 annotations per photo for performance
