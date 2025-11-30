# 🚀 Vehicle Management System - Deployment Steps

## ✅ Pre-Deployment Checklist (COMPLETED)

- [x] Updated `src/config.ts` to use environment variables
- [x] Git repository initialized
- [x] Code committed to Git
- [ ] Code pushed to GitHub/GitLab
- [ ] Backend deployed to Render
- [ ] Frontend deployed to Vercel
- [ ] CORS updated with production URLs
- [ ] Tested all features in production

---

## 📦 **Step 1: Push to GitHub** (If Not Already Done)

### Option A: If you already have a GitHub repository

```bash
git push origin main
```

### Option B: If you need to create a new GitHub repository

1. Go to https://github.com and create a new repository
2. Copy the repository URL (e.g., `https://github.com/yourusername/vehicle-management.git`)
3. Run these commands:

```bash
git remote add origin https://github.com/yourusername/vehicle-management.git
git branch -M main
git push -u origin main
```

---

## 🖥️ **Step 2: Deploy Backend to Render**

### 2.1 Create Render Account
1. Go to https://render.com
2. Sign up with GitHub (recommended for easier deployment)

### 2.2 Deploy Backend Web Service

1. **Click "New +"** → **"Web Service"**

2. **Connect your GitHub repository**
   - Authorize Render to access your GitHub
   - Select your vehicle management repository

3. **Configure the service:**
   ```
   Name: vehicle-management-backend
   Region: Choose closest to you (e.g., Singapore, Oregon)
   Branch: main
   Root Directory: backend
   Environment: Node
   Build Command: npm install
   Start Command: npm start
   ```

4. **Select Free Plan** (or paid if you prefer)

5. **Add Environment Variables** (Click "Advanced" → "Add Environment Variable"):
   
   Copy these from your `backend/.env` file:
   
   ```
   PORT=5000
   MONGO_URI=mongodb+srv://srkulkarni196974_db_user:passwordgotilla@cluster0.vkvkwrq.mongodb.net/vehicle_sampa?appName=Cluster0
   JWT_SECRET=c96dd3de0c1ca4f5ffb9939b7478e591
   EMAIL_USER=srkulkarni1969.74@gmail.com
   EMAIL_PASS=dpqe afvn aemt qngc
   NODE_ENV=production
   ```

6. **Click "Create Web Service"**

7. **Wait for deployment** (2-5 minutes)
   - Watch the logs for any errors
   - Once complete, you'll see "Your service is live 🎉"

8. **📝 IMPORTANT: Copy your backend URL**
   - It will look like: `https://vehicle-management-backend-xxxx.onrender.com`
   - **Save this URL** - you'll need it for the frontend!

### 2.3 Test Backend

Open your backend URL in a browser. You should see:
```
Vehicle Management System API is running
```

Test the health endpoint:
```
https://your-backend-url.onrender.com/api/health
```

---

## 🌐 **Step 3: Deploy Frontend to Vercel**

### 3.1 Create Vercel Account
1. Go to https://vercel.com
2. Sign up with GitHub (recommended)

### 3.2 Deploy Frontend

1. **Click "Add New..."** → **"Project"**

2. **Import your Git repository**
   - Select your vehicle management repository

3. **Configure the project:**
   ```
   Framework Preset: Vite
   Root Directory: ./
   Build Command: npm run build
   Output Directory: dist
   Install Command: npm install
   ```

4. **Add Environment Variable:**
   - Click **"Environment Variables"**
   - Add the following:
   
   ```
   Name: VITE_API_URL
   Value: https://vehicle-management-backend-xxxx.onrender.com
   ```
   
   ⚠️ **IMPORTANT**: Replace with your actual Render backend URL from Step 2.8

5. **Click "Deploy"**

6. **Wait for deployment** (1-2 minutes)

7. **📝 Copy your frontend URL**
   - It will look like: `https://vehicle-management-xxxx.vercel.app`
   - **Save this URL** - you'll need it for CORS!

---

## 🔒 **Step 4: Update CORS Configuration**

Now that you have your Vercel URL, you need to update the backend to allow requests from it.

### 4.1 Update `backend/server.js`

Replace the CORS configuration (around line 12-17) with:

```javascript
app.use(cors({
    origin: [
        'http://localhost:5173',  // Local development
        'https://your-vercel-url.vercel.app',  // Replace with your actual Vercel URL
        'https://*.vercel.app'  // Allow all Vercel preview deployments
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
```

Also update Socket.io CORS (around line 43-47):

```javascript
const io = new Server(server, {
    cors: {
        origin: [
            'http://localhost:5173',
            'https://your-vercel-url.vercel.app',  // Replace with your actual Vercel URL
            'https://*.vercel.app'
        ],
        methods: ["GET", "POST"],
        credentials: true
    }
});
```

### 4.2 Commit and Push Changes

```bash
git add backend/server.js
git commit -m "Update CORS for production deployment"
git push origin main
```

Render will automatically redeploy your backend with the new CORS settings!

---

## 🧪 **Step 5: Test Your Deployment**

### 5.1 Open Your Frontend URL
Visit your Vercel URL: `https://your-vercel-url.vercel.app`

### 5.2 Test Core Features

- [ ] **Login Page loads** without errors
- [ ] **Admin Login** works (check browser console for errors)
- [ ] **Driver Login** works
- [ ] **Vehicle Management** (Create, Read, Update, Delete)
- [ ] **Real-time Tracking** displays on map
- [ ] **Email OTP** sends successfully
- [ ] **File Uploads** work (vehicle documents)
- [ ] **Trip Logging** works
- [ ] **Expense Tracking** works
- [ ] **Dashboard** displays data correctly

### 5.3 Check for Common Issues

**Open Browser Console (F12):**
- ❌ CORS errors? → Update backend CORS with correct Vercel URL
- ❌ API 404 errors? → Check `VITE_API_URL` in Vercel settings
- ❌ Network errors? → Verify backend is running on Render

**Check Render Logs:**
- Go to Render Dashboard → Your Service → Logs
- Look for MongoDB connection errors
- Check for any runtime errors

---

## 🔧 **Troubleshooting**

### Issue: CORS Errors in Browser Console

**Solution:**
1. Verify you updated `backend/server.js` with your Vercel URL
2. Make sure you committed and pushed the changes
3. Wait for Render to redeploy (check logs)
4. Hard refresh your Vercel site (Ctrl+Shift+R)

### Issue: API Calls Return 404

**Solution:**
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Verify `VITE_API_URL` is set correctly
3. Click "Redeploy" in Vercel

### Issue: MongoDB Connection Errors

**Solution:**
1. Go to MongoDB Atlas → Network Access
2. Click "Add IP Address"
3. Add `0.0.0.0/0` (allow from anywhere)
4. Restart Render service

### Issue: Real-time Tracking Not Working

**Solution:**
1. Check Socket.io CORS is updated in `backend/server.js`
2. Verify WebSocket connections in browser DevTools → Network → WS
3. Check Render logs for Socket.io connection errors

### Issue: Email OTP Not Sending

**Solution:**
1. Verify `EMAIL_USER` and `EMAIL_PASS` are set in Render environment variables
2. Check if Gmail app password is still valid
3. Review Render logs for email errors

---

## 🔄 **Updating Your Deployment**

### For Code Changes:

```bash
git add .
git commit -m "Your update message"
git push origin main
```

Both Render and Vercel will **automatically redeploy**! 🎉

### For Environment Variable Changes:

**Render:**
1. Dashboard → Your Service → Environment
2. Add/Edit variables
3. Click "Save" (triggers automatic redeploy)

**Vercel:**
1. Dashboard → Your Project → Settings → Environment Variables
2. Add/Edit variables
3. Go to Deployments → Click "..." → "Redeploy"

---

## 📊 **Post-Deployment Monitoring**

### Monitor Backend (Render)
- **Logs**: Render Dashboard → Your Service → Logs
- **Metrics**: Check CPU, Memory usage
- **Uptime**: Free tier sleeps after 15 min inactivity

### Monitor Frontend (Vercel)
- **Analytics**: Vercel Dashboard → Your Project → Analytics
- **Logs**: Check function logs for errors
- **Performance**: Use Lighthouse in Chrome DevTools

### Monitor Database (MongoDB Atlas)
- **Connections**: Atlas Dashboard → Metrics
- **Storage**: Check you're within 512MB free tier limit
- **Queries**: Monitor slow queries

---

## 💰 **Cost Breakdown**

### Current Setup (FREE):
- ✅ **Render Free Tier**: 750 hours/month
- ✅ **Vercel Free Tier**: Unlimited deployments
- ✅ **MongoDB Atlas M0**: 512MB storage
- ⚠️ **Limitation**: Backend sleeps after 15 min inactivity (cold starts)

### To Avoid Cold Starts ($7/month):
- Upgrade Render to Starter plan
- Backend stays always-on
- Faster response times

---

## 🎯 **Next Steps**

### Optional Enhancements:

1. **Custom Domain** (Optional)
   - Buy domain from Namecheap/GoDaddy
   - Add to Vercel: Settings → Domains
   - Add to Render: Settings → Custom Domain

2. **SSL Certificate** (Automatic)
   - Both Render and Vercel provide free SSL
   - Your site will automatically use HTTPS

3. **Monitoring & Alerts**
   - Set up UptimeRobot for backend monitoring
   - Configure email alerts for downtime

4. **Performance Optimization**
   - Enable Vercel Analytics
   - Add caching headers
   - Optimize images

5. **Security Hardening**
   - Change JWT_SECRET to a new random value
   - Use environment-specific secrets
   - Enable rate limiting
   - Add helmet.js for security headers

---

## 📚 **Additional Resources**

- **Render Docs**: https://render.com/docs
- **Vercel Docs**: https://vercel.com/docs
- **MongoDB Atlas**: https://docs.atlas.mongodb.com
- **Socket.io Deployment**: https://socket.io/docs/v4/

---

## ✅ **Final Checklist**

- [ ] Backend deployed to Render
- [ ] Frontend deployed to Vercel
- [ ] Environment variables configured
- [ ] CORS updated with production URLs
- [ ] All features tested and working
- [ ] MongoDB Atlas allows connections from 0.0.0.0/0
- [ ] URLs saved for future reference
- [ ] Auto-deploy working on Git push

---

## 🎉 **Your Deployed URLs**

**Frontend (Vercel)**: `https://_____________________.vercel.app`

**Backend (Render)**: `https://_____________________.onrender.com`

**MongoDB Atlas**: `cluster0.vkvkwrq.mongodb.net`

---

## 🆘 **Need Help?**

If you encounter any issues:
1. Check the troubleshooting section above
2. Review Render and Vercel logs
3. Test API endpoints with Postman
4. Check browser console for frontend errors

**Common Commands:**
```bash
# Check Git status
git status

# View recent commits
git log --oneline -5

# Force redeploy (if needed)
git commit --allow-empty -m "Trigger redeploy"
git push origin main
```

---

**Good luck with your deployment! 🚀**
