# 🎨 Theme Color Management System

A comprehensive theme color management system for Tripesa Safari with Firebase storage, version history, and rollback capabilities.

## ✨ Features

### 🎯 Core Features

- **Dual Mode Support**: Light and dark mode themes
- **Real-time Preview**: Live preview of color changes
- **Version History**: Complete audit trail of all changes
- **User Tracking**: Track who made changes and when
- **Rollback System**: Easy rollback to previous versions
- **Firebase Integration**: Secure storage with authentication
- **Preset Themes**: Quick application of predefined themes

### 🔐 Security & Tracking

- **Authentication Required**: Only authenticated admin users can make changes
- **Change Descriptions**: Optional descriptions for each change
- **User Attribution**: Track which admin made each change
- **Timestamp Tracking**: Full audit trail with timestamps
- **Version Control**: Automatic version numbering

## 🏗️ Architecture

### Database Structure

#### Theme Configuration (`site-config/theme-config`)

```typescript
interface ThemeConfig {
  light: ThemeColors;
  dark: ThemeColors;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  version: number;
}
```

#### Version History (`theme-versions`)

```typescript
interface ThemeVersion {
  id: string;
  light: ThemeColors;
  dark: ThemeColors;
  createdAt: Date;
  createdBy: string;
  createdByName: string;
  version: number;
  description?: string;
  isActive: boolean;
}
```

#### Color Schema

```typescript
interface ThemeColors {
  primary: string; // Main brand color
  secondary: string; // Secondary brand color
  accent: string; // Accent color
  background: string; // Background color
  text: string; // Text color
  muted: string; // Muted text color
}
```

### File Structure

```
components/
├── admin/
│   └── ThemeColorManager.tsx    # Main theme management UI
├── common/
│   ├── ThemeProvider.tsx        # Global theme context
│   └── ThemeToggle.tsx          # Theme mode toggle
hooks/
└── useThemeColors.ts            # Theme management hook
lib/firebase/
└── config-service.ts            # Firebase theme operations
```

## 🚀 Usage

### For Administrators

#### Accessing Theme Management

1. Navigate to `/admin/theme`
2. Authenticate with admin credentials
3. Use the comprehensive theme management interface

#### Making Changes

1. **Select Mode**: Choose between Light or Dark mode
2. **Adjust Colors**: Use color pickers or hex input
3. **Add Description**: Optionally describe your changes
4. **Preview**: Use live preview to see changes
5. **Save**: Save changes to create a new version

#### Version Management

- **View History**: Click "Show History" to see all versions
- **Rollback**: Click "Rollback" on any previous version
- **Track Changes**: See who made changes and when

### For Developers

#### Using Theme Colors in Components

```typescript
import { useTheme } from "@/components/common/ThemeProvider";

function MyComponent() {
  const { mode, config } = useTheme();

  return (
    <div
      style={{
        backgroundColor: config?.light.background,
        color: config?.light.text,
      }}
    >
      Content
    </div>
  );
}
```

#### Adding Theme Toggle

```typescript
import ThemeToggle from "@/components/common/ThemeToggle";

function Header() {
  return (
    <header>
      <ThemeToggle showLabel={true} />
    </header>
  );
}
```

#### CSS Custom Properties

The system automatically applies CSS custom properties:

```css
:root {
  --primary: #f97316;
  --secondary: #64748b;
  --accent: #8b5cf6;
  --background: #ffffff;
  --text: #1f2937;
  --muted: #6b7280;
}
```

## 🔧 Configuration

### Default Themes

#### Safari Orange (Default)

```typescript
// Light Mode
{
  primary: "#f97316",
  secondary: "#64748b",
  accent: "#8b5cf6",
  background: "#ffffff",
  text: "#1f2937",
  muted: "#6b7280"
}

// Dark Mode
{
  primary: "#f97316",
  secondary: "#94a3b8",
  accent: "#a78bfa",
  background: "#0f172a",
  text: "#f1f5f9",
  muted: "#64748b"
}
```

#### Forest Green

```typescript
// Light Mode
{
  primary: "#059669",
  secondary: "#475569",
  accent: "#7c3aed",
  background: "#ffffff",
  text: "#1f2937",
  muted: "#6b7280"
}

// Dark Mode
{
  primary: "#10b981",
  secondary: "#64748b",
  accent: "#8b5cf6",
  background: "#0f172a",
  text: "#f1f5f9",
  muted: "#64748b"
}
```

#### Sunset Red

```typescript
// Light Mode
{
  primary: "#dc2626",
  secondary: "#374151",
  accent: "#9333ea",
  background: "#ffffff",
  text: "#1f2937",
  muted: "#6b7280"
}

// Dark Mode
{
  primary: "#ef4444",
  secondary: "#6b7280",
  accent: "#a855f7",
  background: "#0f172a",
  text: "#f1f5f9",
  muted: "#64748b"
}
```

## 🔒 Security

### Firebase Security Rules

```javascript
// Theme versions - only authenticated admin users can read/write
match /theme-versions/{document=**} {
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

- All theme changes are logged to Firebase Analytics
- Version history provides complete audit trail
- User attribution for all changes

### Performance

- Theme colors are cached locally
- CSS custom properties for optimal performance
- Minimal re-renders with React context

## 🛠️ Development

### Adding New Color Properties

1. Update `ThemeColors` interface in `config-service.ts`
2. Add color field to `ThemeColorManager.tsx`
3. Update default themes
4. Add CSS custom property in `useThemeColors.ts`

### Custom Preset Themes

1. Add new preset to `ThemeColorManager.tsx`
2. Define both light and dark variants
3. Update documentation

### Extending Version History

1. Modify `ThemeVersion` interface
2. Update Firebase operations
3. Enhance UI to display new fields

## 🚨 Troubleshooting

### Common Issues

#### Theme Not Loading

- Check Firebase connection
- Verify authentication status
- Check browser console for errors

#### Changes Not Saving

- Ensure user is authenticated as admin
- Check Firebase security rules
- Verify network connectivity

#### Version History Empty

- Check if versions collection exists
- Verify user permissions
- Check Firebase rules

### Debug Mode

Enable debug logging:

```javascript
localStorage.setItem("debug", "theme:*");
```

## 📈 Future Enhancements

### Planned Features

- **Theme Templates**: Pre-built theme collections
- **Color Palette Generator**: AI-powered color suggestions
- **Export/Import**: Theme backup and restore
- **Scheduled Changes**: Time-based theme switching
- **A/B Testing**: Theme performance analytics

### API Endpoints

- `GET /api/theme/current` - Get current theme
- `POST /api/theme/update` - Update theme (admin only)
- `GET /api/theme/history` - Get version history
- `POST /api/theme/rollback` - Rollback to version

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
