# Video URL Feature Implementation Guide

## Overview
Added "Color Video URL" field to the "Design Specific Galleries" section in the Product Edit/Create form. This allows storing optional video URLs for each color-specific gallery.

## Changes Made

### Frontend (admin_panel)

#### 1. **ProductForm.jsx** - Updated with:
   - Added `Video` icon import from lucide-react
   - New state: `designVideoInput` to track the video URL input field
   - New input field: "COLOR VIDEO URL" (optional) below the Image URLs textarea
   - Updated `handleSaveDesignGallery()` to include `video_url` in the payload
   - Added conditional "View Video" link in the Added Galleries preview section
     - Shows a small video icon with text "View Video"
     - Opens video in a new tab when clicked
     - Only appears if a video URL was saved for that gallery
   - Consistent styling with other fields (border, padding, rounded corners)

### Backend (backend)

#### 1. **designGalleryController.js** - Updated with:
   - `upsertDesignGallery()` now accepts `video_url` from request body
   - Validates and trims video URL (null if empty)
   - Stores video_url when inserting new galleries: 
     ```sql
     INSERT INTO product_design_gallery (product_id, color_name, images, video_url)
     ```
   - Updates video_url when updating existing galleries:
     ```sql
     UPDATE product_design_gallery SET color_name = $1, images = $2, video_url = $3 WHERE id = $4
     ```

#### 2. **Database Schema** - Requires migration:
   - New column: `video_url` (TEXT, NULL) in `product_design_gallery` table
   - Migration file created: `backend/migrations/add_video_url_to_design_gallery.sql`

## Next Steps

### 1. Apply Database Migration
You must run this SQL migration on your Supabase database:

**Option A: Using Supabase SQL Editor**
1. Go to your Supabase project dashboard
2. Navigate to "SQL Editor"
3. Create a new query and paste the following:
   ```sql
   ALTER TABLE product_design_gallery
   ADD COLUMN IF NOT EXISTS video_url TEXT DEFAULT NULL;
   
   CREATE INDEX IF NOT EXISTS idx_product_design_gallery_video_url 
   ON product_design_gallery(video_url);
   ```
4. Click "Execute" or "Run"

**Option B: Using Command Line** (if you have direct DB access)
```bash
psql [your-database-connection-string] -f backend/migrations/add_video_url_to_design_gallery.sql
```

### 2. Test the Feature
1. Start the backend server: `npm start` (in backend/)
2. Start the admin panel: `npm run dev` (in admin_panel/)
3. Navigate to "Edit Product" or "Add New Product"
4. Go to the "Galleries" tab
5. Fill in:
   - Color Name: e.g., "Blue"
   - Image URLs: Add some image URLs
   - **NEW** Color Video URL: Paste a Cloudinary video URL (e.g., `.mp4`)
6. Click "Save Gallery"
7. Verify the "View Video" link appears in the Added Galleries preview

### 3. Expected Behavior

**Input Form:**
- Color Name input (existing)
- Image URLs textarea (existing)
- Color Video URL input **(NEW)** - optional field with placeholder "https://res.cloudinary.com/.../video.mp4"

**Added Galleries Preview:**
- Color name displayed
- "View Video" link appears next to color name if video URL was provided
- "View Video" link includes a video icon and opens the video in a new tab
- Delete button remains functional

## Data Structure

Each design gallery object now contains:
```json
{
  "id": "uuid",
  "product_id": "uuid",
  "color_name": "string",
  "images": ["url1", "url2", ...],
  "video_url": "string or null",  // NEW FIELD
  "created_at": "timestamp",
  "updated_at": "timestamp"
}
```

## API Changes

### POST /api/design-gallery
**Request body now includes:**
```json
{
  "product_id": "uuid",
  "color_name": "string",
  "images": ["url1", "url2", ...],
  "video_url": "string (optional) or null"
}
```

**Response includes:**
```json
{
  "id": "uuid",
  "product_id": "uuid",
  "color_name": "string",
  "images": [...],
  "video_url": "string or null",
  "created_at": "timestamp",
  "updated_at": "timestamp"
}
```

## Styling Details
- Video URL input uses same styling as Color Name and Image URLs fields
- Border: `#a0a0a0`
- Padding: `10px 14px`
- Border radius: `12px`
- "View Video" link styling:
  - Background: `#f0f0f0` → `#e8e8e8` on hover
  - Color: `#555` → `#333` on hover
  - Rounded corners with small padding
  - Displays video icon + text

## Notes
- Video URL is completely optional
- Field accepts empty/null values
- Only videos with supported formats (mp4, webm, mov, etc.) will play in browsers
- Recommended: Use Cloudinary for video hosting (same as main product video)
- If no video URL is provided, no "View Video" link will appear
- Existing galleries without video URLs will continue to work

## File Locations
- Frontend form: `admin_panel/src/pages/ProductForm.jsx`
- Frontend service: `admin_panel/src/services/productService.js` (no changes needed - already generic)
- Backend controller: `backend/controllers/designGalleryController.js`
- Database migration: `backend/migrations/add_video_url_to_design_gallery.sql`
