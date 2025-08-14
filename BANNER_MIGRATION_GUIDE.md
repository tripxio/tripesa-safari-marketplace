# Banner System Migration Guide

## Overview

The banner system has been completely refactored to be fully dynamic, removing all hardcoded fallbacks and making it robust for all scenarios including image deletions and reordering.

## Changes Made

### 1. Migration Script

- **File**: `scripts/migrate-banner-data.js`
- **Purpose**: Migrates hardcoded banner data to Firebase
- **Usage**: `npm run migrate-banner`

### 2. Enhanced Image Management

- **Robust ordering**: Images are automatically reordered when deleted
- **Move controls**: Up/Down buttons for easy reordering
- **Order validation**: Ensures continuous ordering (1, 2, 3...)

### 3. Removed Hardcoded Fallbacks

- **HeroSection.tsx**: No longer uses hardcoded images/text
- **Error states**: Proper loading and error handling
- **Dynamic content**: Everything loads from Firebase

### 4. Improved Admin Interface

- **Move buttons**: Reorder images with up/down arrows
- **Better feedback**: Clear success/error states
- **Order display**: Shows current image order
- **Robust deletion**: Properly reorders remaining images

## Key Features

### Robust Image Ordering

- Images are automatically reordered when one is deleted
- No gaps in ordering (always 1, 2, 3, 4...)
- Move up/down buttons maintain order integrity

### Error Handling

- **Loading states**: Shows spinner while loading
- **No config**: Clear error message with retry option
- **No images**: Prompts to configure banner in admin
- **Failed loads**: Graceful error handling

### Dynamic Content

- All text content (title, subtitle, description) from Firebase
- All images from Firebase (no hardcoded fallbacks)
- Settings (autoplay, intervals) from Firebase

## Usage

### Running the Migration

```bash
npm run migrate-banner
```

### Managing Banner Content

1. Go to `/admin/banner`
2. Use the **Images** tab to:
   - Upload new images
   - Add external image links
   - Reorder images with up/down buttons
   - Delete images (automatically reorders remaining)
3. Use the **Text** tab to edit title, subtitle, description
4. Use the **Settings** tab to configure autoplay, transitions

### Error Recovery

If banner config is missing:

1. Run migration script: `npm run migrate-banner`
2. Or manually create configuration in admin panel

## Technical Details

### Image Ordering Algorithm

```typescript
const reorderImages = (images: BannerImage[]): BannerImage[] => {
  return images
    .sort((a, b) => a.order - b.order)
    .map((img, index) => ({
      ...img,
      order: index + 1,
    }));
};
```

### Deletion Handling

When an image is deleted:

1. Remove the target image
2. Sort remaining images by order
3. Reassign orders starting from 1
4. Update configuration

### Move Handling

When moving an image:

1. Sort images by current order
2. Swap positions in array
3. Reorder entire array
4. Ensure continuous numbering

## Migration Details

The migration script:

1. **Clears** all existing banner data
2. **Saves** hardcoded data to Firebase with proper structure
3. **Creates** version history entry
4. **Verifies** successful migration

### Data Structure

```typescript
interface BannerConfig {
  images: BannerImage[]; // Ordered images
  text: BannerText; // Title, subtitle, description
  settings: BannerSettings; // Autoplay, intervals, etc.
  version: number; // Version tracking
  isActive: boolean; // Active status
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}
```

## Testing

After migration, test:

1. **Home page loads** correctly with dynamic content
2. **Admin panel** shows all images and text
3. **Image reordering** works with up/down buttons
4. **Image deletion** properly reorders remaining images
5. **Adding images** assigns correct order numbers
6. **Error states** show when config is missing

## Rollback

If issues occur:

1. Re-run migration: `npm run migrate-banner`
2. Check Firebase console for banner-config collection
3. Verify admin user permissions

## Files Modified

- `scripts/migrate-banner-data.js` (new)
- `components/home/HeroSection.tsx` (updated)
- `components/admin/BannerManager.tsx` (enhanced)
- `package.json` (added script)
- `BANNER_MIGRATION_GUIDE.md` (new)

## Summary

The banner system is now fully dynamic and robust, handling all edge cases gracefully:

- ✅ No hardcoded fallbacks
- ✅ Proper image ordering
- ✅ Robust deletion handling
- ✅ Easy reordering with UI controls
- ✅ Comprehensive error handling
- ✅ Migration script for data transition
