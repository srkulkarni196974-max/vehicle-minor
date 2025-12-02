---
description: Deploy the Vehicle Management System
---

# Deployment Guide: Vehicle Management System

## 🎯 Deployment Strategy
- **Frontend**: Vercel (Free tier - easiest and fastest)
- **Backend**: Render (Free tier - already set up)
- **Database**: MongoDB Atlas (Free tier - already set up)
- **Auth**: Firebase (Free tier - already set up)

**Total Time**: ~15 minutes
**Total Cost**: $0/month

---

## 📋 Pre-Deployment Checklist

### 1. Verify Local Setup Works
```bash
# In backend terminal (should already be running)
cd backend
npm run dev

# In frontend terminal (should already be running)  
cd ..
npm run dev
```

✅ Make sure you can login and use all features locally first!

---

## 🔧 Step 1: Update Backend on Render (5 minutes)

### A. Check if Backend is Already Deployed
1. Go to [https://dashboard.render.com/](https://dashboard.render.com/)
2. Sign in with your account
3. Look for your existing backend service

### B. Update Backend Code (if needed)
1. In Render dashboard, click your backend service
2. Go to "Settings" → "Build & Deploy"
3. Click "Manual Deploy" → "Deploy latest commit"
4. Wait for deployment (2-3 minutes)

### C. Note Your Backend URL
- Example: `https://your-app-name.onrender.com`
- Copy this URL - you'll need it for frontend!

### D. Verify Backend Environment Variables
Make sure these are set in Render:
- `MONGODB_URI` - Your MongoDB connection string
- `JWT_SECRET` - Your JWT secret
- `FIREBASE_PROJECT_ID` - From Firebase
- `FIREBASE_CLIENT_EMAIL` - From Firebase
- `FIREBASE_PRIVATE_KEY` - From Firebase (escape newlines as `\\n`)
- `NODE_ENV` - Set to `production`

---

## 🌐 Step 2: Deploy Frontend to Vercel (10 minutes)

### A. Prepare Frontend for Deployment

1. **Update API URL**
   Open `.env.local` and update:
   ```env
   VITE_API_URL=https://your-backend-url.onrender.com
   ```
   Replace `your-backend-url` with your actual Render URL from Step 1C

2. **Test Build Locally**
   ```bash
   npm run build
   ```
   Make sure build succeeds with no errors!

### B. Deploy to Vercel

#### Option 1: Using Vercel CLI (Fastest)

// turbo
1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

// turbo
2. **Login to Vercel**
   ```bash
   vercel login
   ```
   Follow the prompts (use email or GitHub)

// turbo
3. **Deploy Frontend**
   ```bash
   cd c:\Users\sampa\OneDrive\Desktop\vehicle-minor
   vercel
   ```
   
   When prompted:
   - Set up and deploy? → **Yes**
   - Which scope? → **Your account**
   - Link to existing project? → **No**
   - Project name? → **vehicle-tracker** (or your choice)
   - Directory? → **./src** or **./** (press Enter for current)
   - Override settings? → **No**

// turbo
4. **Deploy to Production**
   ```bash
   vercel --prod
   ```

#### Option 2: Using Vercel Dashboard (Easier for first time)

1. **Go to Vercel**
   - Visit [https://vercel.com/](https://vercel.com/)
   - Click "Sign Up" (use GitHub for easiest)

2. **Import Project**
   - Click "Add New..." → "Project"
   - Click "Import Git Repository"
   - If you don't have Git repo, click "Import Third-Party Git Repository"
   - Or manually upload your project folder

3. **Configure Project**
   - Framework Preset: **Vite**
   - Root Directory: **./src** (or leave default if `package.json` is in root)
   - Build Command: `npm run build`
   - Output Directory: `dist`

4. **Add Environment Variables**
   Click "Environment Variables" and add:
   ```
   VITE_API_URL = https://your-backend-url.onrender.com
   VITE_FIREBASE_API_KEY = your_firebase_api_key
   VITE_FIREBASE_AUTH_DOMAIN = your_firebase_auth_domain
   VITE_FIREBASE_PROJECT_ID = your_firebase_project_id
   VITE_FIREBASE_STORAGE_BUCKET = your_firebase_storage_bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID = your_firebase_sender_id
   VITE_FIREBASE_APP_ID = your_firebase_app_id
   ```
   (Copy these from your `.env.local` file)

5. **Deploy**
   - Click "Deploy"
   - Wait 2-3 minutes
   - Done! 🎉

### C. Get Your Frontend URL
- Vercel will give you a URL like: `https://vehicle-tracker.vercel.app`
- Copy this URL

---

## ⚙️ Step 3: Update CORS in Backend

1. **Edit Backend CORS Settings**
   - Go to your backend code
   - Open `backend/middleware/cors.js` or `backend/server.js`
   - Add your Vercel URL to allowed origins:
   
   ```javascript
   const allowedOrigins = [
     'http://localhost:5173',
     'https://vehicle-tracker.vercel.app',  // Add your Vercel URL
     'https://your-custom-domain.com'  // If you have one
   ];
   ```

2. **Commit and Deploy Backend**
   - Push changes to GitHub (if using Git)
   - Or manually deploy in Render dashboard

---

## 🔒 Step 4: Update Firebase Configuration

1. **Go to Firebase Console**
   - Visit [https://console.firebase.google.com/](https://console.firebase.google.com/)

2. **Add Authorized Domain**
   - Go to **Authentication** → **Settings** → **Authorized domains**
   - Click "Add domain"
   - Add: `vehicle-tracker.vercel.app` (your Vercel domain)
   - Click "Add"

---

## ✅ Step 5: Test Your Deployment

1. **Visit Your Vercel URL**
   - Go to `https://vehicle-tracker.vercel.app`

2. **Test All Features**
   - [ ] Login with email/password
   - [ ] Login with Google
   - [ ] Add a vehicle
   - [ ] Check dashboard
   - [ ] Test reminders
   - [ ] Test expenses

3. **Check Browser Console**
   - Press F12
   - Look for any errors
   - All API calls should go to your Render backend

---

## 🐛 Troubleshooting

### Frontend can't connect to backend
- ✅ Check `VITE_API_URL` in Vercel environment variables
- ✅ Make sure backend is running on Render
- ✅ Check CORS settings in backend

### "Firebase: Error (auth/unauthorized-domain)"
- ✅ Add Vercel domain to Firebase authorized domains (Step 4)

### Backend keeps sleeping
- ✅ This is normal on Render free tier
- ✅ First request after 15 mins takes ~30 seconds
- ✅ Consider upgrading Render to paid tier ($7/month) for always-on

### Build fails on Vercel
- ✅ Check build logs in Vercel dashboard
- ✅ Make sure `npm run build` works locally
- ✅ Verify all dependencies are in `package.json`

---

## 📊 Post-Deployment Checklist

- [ ] Frontend deployed and accessible
- [ ] Backend deployed and responding
- [ ] Can login successfully
- [ ] All features work
- [ ] Firebase authentication works
- [ ] MongoDB connection works
- [ ] No console errors

---

## 🎉 You're Live!

Your app is now live at:
- **Frontend**: `https://vehicle-tracker.vercel.app`
- **Backend**: `https://your-app.onrender.com`

**Share your live URL and impress everyone!** 🚀

---

## 💰 Cost Breakdown

| Service | Tier | Cost | Limits |
|---------|------|------|--------|
| Vercel | Free | $0 | 100GB bandwidth/month |
| Render | Free | $0 | Sleeps after 15 min inactivity |
| MongoDB Atlas | Free | $0 | 512 MB storage |
| Firebase | Spark | $0 | 50K users/month |
| **TOTAL** | | **$0/month** | ✅ |

---

## 🔄 Future Updates

To deploy updates:

### Frontend (Vercel)
```bash
vercel --prod
```
Or push to GitHub if connected

### Backend (Render)
- Push to GitHub (if connected)
- Or use "Manual Deploy" in Render dashboard

---

**Need help? Contact support or refer to the documentation!**
