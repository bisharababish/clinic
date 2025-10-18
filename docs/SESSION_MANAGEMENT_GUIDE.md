# Session Management Guide

## Overview
Your healthcare application now has a **20-minute session timeout** system that automatically manages user sessions and provides warnings before expiration.

## 🔧 How It Works

### **Session Timeout: 20 Minutes**
- Users are automatically logged out after 20 minutes of inactivity
- Warning appears 5 minutes before session expires
- Users can extend their session or logout manually

### **Automatic Features**
- ✅ **Session Tracking** - Monitors user activity
- ✅ **Auto-Expiry** - Logs out inactive users
- ✅ **Warning System** - Notifies users before expiry
- ✅ **Session Extension** - Users can extend their session
- ✅ **Activity Detection** - Tracks user interactions

## 📱 User Experience

### **Session Warning (5 minutes before expiry)**
```
🕐 Session Expiring Soon
Your session will expire in 4m 32s
[Extend] [Logout]
```

### **Session Expired**
- User is automatically redirected to login page
- All data is cleared from browser storage
- User must login again to continue

## ⚙️ Configuration

### **Change Session Duration**
Edit `src/lib/sessionManager.ts`:
```typescript
// Change from 20 minutes to your preferred duration
export const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes
```

### **Change Warning Time**
```typescript
// Change warning from 5 minutes to your preference
private warningTime = 10 * 60 * 1000; // 10 minutes before expiry
```

## 🛠️ Developer Usage

### **Check Session Status**
```typescript
import { useSessionManager } from '../lib/sessionManager';

const sessionManager = useSessionManager();

// Check if session is valid
if (!sessionManager.isSessionValid()) {
  // Redirect to login
}

// Check if session is expiring soon
if (sessionManager.isSessionExpiringSoon()) {
  // Show warning
}

// Get time remaining
const timeLeft = sessionManager.formatTimeRemaining();
console.log(`Session expires in: ${timeLeft}`);
```

### **Extend Session Programmatically**
```typescript
// Extend session by 20 minutes
sessionManager.extendSession();
```

### **Update Activity Tracking**
```typescript
// Call this on user interactions
sessionManager.updateActivity();
```

## 🔒 Security Features

### **Automatic Cleanup**
- Sessions are automatically cleared from localStorage
- No sensitive data remains after logout
- Prevents unauthorized access to expired sessions

### **Activity-Based Expiry**
- Session timer resets on user activity
- Prevents accidental logouts during active use
- Tracks real user engagement

## 📊 Session Data

### **Stored Information**
```typescript
interface SessionInfo {
  expiresAt: number;      // When session expires
  lastActivity: number;    // Last user activity
  userId: string;         // User ID
}
```

### **Storage Location**
- `bethlehem-session-info` in localStorage
- Automatically cleaned up on logout/expiry

## 🚨 Troubleshooting

### **Session Not Expiring**
1. Check browser console for errors
2. Verify localStorage is working
3. Check if user is actively using the app

### **Warning Not Showing**
1. Ensure SessionWarning component is added to App.tsx
2. Check if user has been active recently
3. Verify session manager is initialized

### **Session Expires Too Quickly**
1. Check if user is actually inactive
2. Verify session timeout settings
3. Check for browser tab switching issues

## 🎯 Best Practices

### **For Users**
- Click "Extend" when you see the warning
- Don't leave the app open unattended
- Logout manually when done

### **For Developers**
- Don't modify session data directly
- Use the provided session manager methods
- Test session expiry in development

## 🔄 Integration Points

### **Already Integrated**
- ✅ **Authentication** - useAuth hook
- ✅ **App Component** - SessionWarning component
- ✅ **Supabase** - Custom storage configuration
- ✅ **Logout** - Automatic session cleanup

### **Custom Integration**
```typescript
// Add to any component that needs session awareness
import { useSessionManager } from '../lib/sessionManager';

const MyComponent = () => {
  const sessionManager = useSessionManager();
  
  useEffect(() => {
    // Check session on component mount
    if (!sessionManager.isSessionValid()) {
      // Handle expired session
    }
  }, []);
  
  return <div>Your component</div>;
};
```

## 📈 Monitoring

### **Session Events**
- Session initialized on login
- Activity updated on user interaction
- Warning shown 5 minutes before expiry
- Session extended on user action
- Session cleared on logout/expiry

### **Debug Information**
In development mode, check browser console for:
- Session initialization logs
- Activity update logs
- Expiry warning logs
- Session cleanup logs

Your healthcare application now has robust session management! 🏥✨
