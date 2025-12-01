# 🎯 NETLIFY - Quick Deploy Reference

## ✅ **Your Backend URL (Already Working):**
```
https://vehicle-management-backend-ap3f.onrender.com
```

---

## 📋 **NETLIFY CONFIGURATION**

### **Build Settings:**
```
Branch: main
Build command: npm run build
Publish directory: dist
```

### **Environment Variable:**
```
Key: VITE_API_URL
Value: https://vehicle-management-backend-ap3f.onrender.com
```

---

## 🚀 **QUICK STEPS:**

1. **Sign in with GitHub** at https://app.netlify.com
2. **Click "Add new site"** → "Import from Git"
3. **Select GitHub** → Find `vehicle-minor`
4. **Build settings:** (auto-detected)
   - Build command: `npm run build`
   - Publish directory: `dist`
5. **Click "Show advanced"** → Add environment variable:
   - `VITE_API_URL` = `https://vehicle-management-backend-ap3f.onrender.com`
6. **Click "Deploy site"**
7. **Wait 2-3 minutes**
8. **Copy your Netlify URL**

---

## ✅ **CHECKLIST:**

- [ ] Signed into Netlify with GitHub
- [ ] Clicked "Add new site"
- [ ] Selected `vehicle-minor` repository
- [ ] Verified build command: `npm run build`
- [ ] Verified publish directory: `dist`
- [ ] Added environment variable `VITE_API_URL`
- [ ] Clicked "Deploy site"
- [ ] Deployment successful
- [ ] Frontend URL copied

---

## 📝 **SAVE YOUR FRONTEND URL:**

```
Frontend URL: https://________________________________.netlify.app
```

---

## 🎉 **Why This Will Work:**

- ✅ Netlify has no permission issues with Vite
- ✅ Better build environment
- ✅ Same features as Vercel (free, auto-deploy, SSL)
- ✅ Often faster builds

---

**Netlify is open in your browser. Start deploying!** 🚀
