# 🎨 Banner Management System

A comprehensive banner/hero section management system for Tripesa Safari with dynamic content, image management, and version control.

## ✨ Features

### 🎯 Core Features

- **Dynamic Text Content**: Customize main title, subtitle, and description
- **Image Management**: Upload to Firebase Storage or add external links
- **Advanced Settings**: Control autoplay, transition duration, indicators, arrows
- **Version History**: Complete audit trail with rollback capabilities
- **Live Preview**: Real-time preview of changes before saving
- **User Tracking**: Track who made changes and when
- **Firebase Integration**: Secure storage with authentication

### 🔐 Security & Tracking

- **Authentication Required**: Only authenticated admin users can make changes
- **Change Descriptions**: Optional descriptions for each change
- **User Attribution**: Track which admin made each change
- **Timestamp Tracking**: Full audit trail with timestamps
- **Version Control**: Automatic version numbering

## 🏗️ Architecture

### Database Structure

#### Banner Configuration (`site-config/banner-config`)

```typescript
interface BannerConfig {
  images: BannerImage[];
  text: BannerText;
  settings: BannerSettings;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  version: number;
}
```

#### Banner Version History (`banner-versions`)

```typescript
interface BannerVersion {
  id: string;
  images: BannerImage[];
  text: BannerText;
  settings: BannerSettings;
  createdAt: Date;
  createdBy: string;
  createdByName: string;
  version: number;
  description?: string;
  isActive: boolean;
}
```

#### Image Management

```typescript
interface BannerImage {
  id: string;
  url: string;
  alt: string;
  title?: string;
  description?: string;
  order: number;
  createdAt: Date;
  isUploaded?: boolean; // true for Firebase Storage, false for external links
  storagePath?: string; // Firebase Storage path for uploaded images
}
```

#### Text Content

```typescript
interface BannerText {
  mainTitle: string;
  subtitle: string;
  description: string;
}
```

#### Banner Settings

```typescript
interface BannerSettings {
  transitionDuration: number; // in seconds
  autoplay: boolean;
  autoplayInterval: number; // in seconds
  showIndicators: boolean;
  showArrows: boolean;
}
```

### File Structure

```
components/
├── admin/
│   └── BannerManager.tsx    # Main banner management UI
├── home/
│   └── HeroSection.tsx      # Updated to use banner config
lib/firebase/
└── config-service.ts        # Enhanced with banner operations
app/
├── api/banner/
│   ├── current/route.ts     # Get current banner config
│   └── history/route.ts     # Get version history
└── banner-demo/page.tsx     # Demo page
```

## 🚀 Usage

### For Administrators

#### Accessing Banner Management

1. Navigate to `/admin/banner`
2. Authenticate with admin credentials
3. Use the comprehensive banner management interface

#### Managing Content

1. **Images Tab**:

   - Upload images to Firebase Storage
   - Add external image links
   - Edit image metadata (alt text, title, description)
   - Reorder images
   - Delete images

2. **Text Tab**:

   - Edit main title
   - Edit subtitle
   - Edit description

3. **Settings Tab**:
   - Control autoplay settings
   - Adjust transition duration
   - Toggle indicators and arrows
   - Set autoplay interval

#### Version Management

- **View History**: Click "Show History" to see all versions
- **Rollback**: Click "Rollback" on any previous version
- **Track Changes**: See who made changes and when

### For Developers

#### Using Banner Config in Components

```typescript
import { getBannerConfig } from "@/lib/firebase/config-service";

function MyComponent() {
  const [bannerConfig, setBannerConfig] = useState(null);

  useEffect(() => {
    const loadConfig = async () => {
      const config = await getBannerConfig();
      setBannerConfig(config);
    };
    loadConfig();
  }, []);

  return (
    <div>
      <h1>
        {bannerConfig?.text.mainTitle} {bannerConfig?.text.subtitle}
      </h1>
      <p>{bannerConfig?.text.description}</p>
    </div>
  );
}
```

#### API Endpoints

```typescript
// Get current banner configuration
GET /api/banner/current

// Get version history
GET /api/banner/history?limit=10
```

## 🔧 Configuration

### Default Banner Configuration

```typescript
{
  images: [
    {
      id: "1",
      url: "https://ik.imagekit.io/54hg3nvcfg/zdenek-machacek-UxHol6SwLyM-unsplash.jpg",
      alt: "Safari landscape",
      title: "Discover Africa's Greatest Adventures",
      description: "AI-powered safari discovery that connects you to unforgettable experiences",
      order: 1,
      isUploaded: false,
    },
    // ... more images
  ],
  text: {
    mainTitle: "Discover Africa's",
    subtitle: "Greatest Adventures",
    description: "AI-powered safari discovery that connects you to unforgettable experiences across the African continent",
  },
  settings: {
    transitionDuration: 5,
    autoplay: true,
    autoplayInterval: 5,
    showIndicators: true,
    showArrows: true,
  }
}
```

## 🔒 Security

### Firebase Security Rules

```javascript
// Banner versions - only authenticated admin users can read/write
match /banner-versions/{document=**} {
  allow read, write: if request.auth != null &&
    exists(/databases/$(database)/documents/admin-users/$(request.auth.uid)) &&
    get(/databases/$(database)/documents/admin-users/$(request.auth.uid)).data.isActive == true;
}
```

### Authentication Requirements

- Must be authenticated as admin user
- User must be active in admin system
- All changes are tracked with user attribution

## 📊 Analytics & Monitoring

### Change Tracking

- All banner changes are logged to Firebase Analytics
- Version history provides complete audit trail
- User attribution for all changes

### Performance

- Images are optimized for web delivery
- Firebase Storage provides CDN benefits
- Minimal re-renders with React state management

## 🛠️ Development

### Adding New Image Types

1. Update `BannerImage` interface
2. Add upload/processing logic in `config-service.ts`
3. Update UI components to handle new image types

### Custom Banner Settings

1. Extend `BannerSettings` interface
2. Add UI controls in `BannerManager.tsx`
3. Update preview logic

### Extending Version History

1. Modify `BannerVersion` interface
2. Update Firebase operations
3. Enhance UI to display new fields

## 🚨 Troubleshooting

### Common Issues

#### Banner Not Loading

- Check Firebase connection
- Verify authentication status
- Check browser console for errors

#### Images Not Uploading

- Ensure Firebase Storage is configured
- Check storage security rules
- Verify file size limits

#### Changes Not Saving

- Ensure user is authenticated as admin
- Check Firebase security rules
- Verify network connectivity

### Debug Mode

Enable debug logging:

```javascript
localStorage.setItem("debug", "banner:*");
```

## 📈 Future Enhancements

### Planned Features

- **Image Optimization**: Automatic image compression and optimization
- **A/B Testing**: Banner performance analytics
- **Scheduled Changes**: Time-based banner switching
- **Template System**: Pre-built banner templates
- **Export/Import**: Banner backup and restore

### API Endpoints

- `GET /api/banner/current` - Get current banner
- `POST /api/banner/update` - Update banner (admin only)
- `GET /api/banner/history` - Get version history
- `POST /api/banner/rollback` - Rollback to version

## 📞 Support

For issues or questions:

1. Check Firebase Console for errors
2. Review authentication logs
3. Verify security rules
4. Contact development team

---

**Last Updated**: December 2024
**Version**: 1.0.0
**Maintainer**: Tripesa Development Team
