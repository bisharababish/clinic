# Sentry Error Monitoring Setup Guide

## 🎯 **Overview**

Sentry provides comprehensive error monitoring and performance tracking for your Bethlehem Medical Center application. This setup includes both frontend (React) and backend (Node.js) monitoring.

## 🚀 **Quick Setup Steps**

### **Step 1: Create Sentry Account**

1. Go to [https://sentry.io](https://sentry.io)
2. Sign up for a free account
3. Create a new project:
   - **Platform**: React (for frontend)
   - **Platform**: Node.js (for backend)

### **Step 2: Get Your DSN Keys**

After creating projects, you'll get DSN keys like:
```
https://abc123@o123456.ingest.sentry.io/123456
```

### **Step 3: Add Environment Variables**

#### **Frontend (Render)**
Add to your frontend service environment variables:
```
VITE_SENTRY_DSN=https://your-frontend-dsn@sentry.io/project-id
```

#### **Backend (Render)**
Add to your backend service environment variables:
```
SENTRY_DSN=https://your-backend-dsn@sentry.io/project-id
```

## 📊 **What Sentry Monitors**

### **Frontend Monitoring**
- ✅ **JavaScript Errors** - Crashes, exceptions, unhandled promises
- ✅ **Performance** - Page load times, API response times
- ✅ **User Sessions** - Track user journeys and errors
- ✅ **Browser Compatibility** - Cross-browser error tracking

### **Backend Monitoring**
- ✅ **Server Errors** - Unhandled exceptions, crashes
- ✅ **API Performance** - Request/response times, slow queries
- ✅ **Database Issues** - Connection errors, query failures
- ✅ **Memory/CPU Usage** - Performance bottlenecks

## 🎛️ **Sentry Dashboard Features**

### **Real-time Alerts**
- Email notifications when errors occur
- Slack/Discord integration available
- Custom alert rules

### **Error Tracking**
- Stack traces with source code
- User context and browser info
- Error frequency and trends

### **Performance Monitoring**
- Page load performance
- API endpoint performance
- Database query performance

## 🔧 **Configuration Details**

### **Frontend Configuration**
- **Error Filtering**: Filters out browser extension errors
- **Performance Sampling**: 10% in production, 100% in development
- **Session Replay**: Records user sessions for debugging

### **Backend Configuration**
- **Error Filtering**: Ignores 4xx client errors and health checks
- **Performance Sampling**: 10% in production, 100% in development
- **HTTP Tracing**: Tracks all API requests

## 🚨 **Free Tier Limits**

### **Sentry Free Tier Includes:**
- ✅ **5,000 errors/month** - Perfect for medical center
- ✅ **1 user** - You can monitor everything
- ✅ **30-day error history**
- ✅ **Real-time alerts**
- ✅ **Performance monitoring**

## 📱 **Mobile App Support**

If you decide to create mobile apps later, Sentry supports:
- React Native
- iOS (Swift/Objective-C)
- Android (Java/Kotlin)

## 🎯 **Next Steps After Setup**

1. **Deploy your application** with Sentry environment variables
2. **Test error reporting** by intentionally causing an error
3. **Set up alerts** in Sentry dashboard
4. **Monitor performance** and optimize slow queries
5. **Review error trends** weekly

## 🔍 **Testing Sentry Integration**

### **Test Frontend Error Reporting:**
```javascript
// Add this to any component to test
const testError = () => {
  throw new Error('Test error for Sentry');
};
```

### **Test Backend Error Reporting:**
```javascript
// Add this to any API endpoint to test
app.get('/test-error', (req, res) => {
  throw new Error('Test backend error for Sentry');
});
```

## 📈 **Benefits for Medical Center**

- **Patient Data Safety** - Know immediately if data is lost
- **System Reliability** - Proactive error detection
- **Performance Optimization** - Identify slow operations
- **Compliance** - Error logging for medical software audits
- **User Experience** - Fix issues before patients notice

## 🆘 **Troubleshooting**

### **Common Issues:**

1. **DSN Not Working**
   - Check environment variables are set correctly
   - Verify DSN format is correct
   - Ensure project is active in Sentry

2. **No Errors Showing**
   - Check network connectivity
   - Verify Sentry project settings
   - Test with intentional error

3. **Too Many Errors**
   - Adjust error filtering rules
   - Reduce sampling rates
   - Add more specific error handling

## 📞 **Support**

- **Sentry Documentation**: [https://docs.sentry.io](https://docs.sentry.io)
- **Sentry Community**: [https://forum.sentry.io](https://forum.sentry.io)
- **Free Support**: Available for free tier users

---

**Your Bethlehem Medical Center application now has enterprise-level error monitoring!** 🎉
