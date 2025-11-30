# 🚀 Quick Deployment Reference

## 📝 **3-Step Deployment**

### 1️⃣ Push to GitHub
```bash
git push origin main
```

### 2️⃣ Deploy Backend (Render)
- Go to https://render.com
- New Web Service → Connect repo
- Root Directory: `backend`
- Add environment variables from `backend/.env`
- Deploy!
- **Save backend URL**: `https://your-backend.onrender.com`

### 3️⃣ Deploy Frontend (Vercel)
- Go to https://vercel.com
- New Project → Import repo
- Framework: Vite
- Add env var: `VITE_API_URL=https://your-backend.onrender.com`
- Deploy!
- **Save frontend URL**: `https://your-frontend.vercel.app`

---

## 🔒 **Update CORS (Important!)**

After deployment, update `backend/server.js`:

```javascript
// Line 12-17: Express CORS
app.use(cors({
    origin: [
        'http://localhost:5173',
        'https://your-frontend.vercel.app',  // ← Add your Vercel URL
        'https://*.vercel.app'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Line 43-47: Socket.io CORS
const io = new Server(server, {
    cors: {
        origin: [
            'http://localhost:5173',
            'https://your-frontend.vercel.app',  // ← Add your Vercel URL
            'https://*.vercel.app'
        ],
        methods: ["GET", "POST"],
        credentials: true
    }
});
```

Then commit and push:
```bash
git add backend/server.js
git commit -m "Update CORS for production"
git push origin main
```

---

## 🧪 **Test Checklist**

- [ ] Frontend loads without errors
- [ ] Login works (Admin & Driver)
- [ ] Vehicle CRUD operations work
- [ ] Real-time tracking displays
- [ ] Email OTP sends
- [ ] File uploads work
- [ ] No CORS errors in console

---

## 🔧 **Quick Fixes**

### CORS Errors?
→ Update backend CORS with Vercel URL, commit & push

### API 404 Errors?
→ Check `VITE_API_URL` in Vercel environment variables

### MongoDB Connection Error?
→ MongoDB Atlas → Network Access → Add `0.0.0.0/0`

### Backend Not Responding?
→ Render free tier sleeps after 15 min (first request wakes it up)

---

## 🔄 **Update Deployment**

```bash
git add .
git commit -m "Update message"
git push origin main
```
**Both Render and Vercel auto-deploy on push!** 🎉

---

## 📋 **Environment Variables**

### Backend (Render):
```
PORT=5000
MONGO_URI=mongodb+srv://srkulkarni196974_db_user:passwordgotilla@cluster0.vkvkwrq.mongodb.net/vehicle_sampa?appName=Cluster0
JWT_SECRET=c96dd3de0c1ca4f5ffb9939b7478e591
EMAIL_USER=srkulkarni1969.74@gmail.com
EMAIL_PASS=dpqe afvn aemt qngc
NODE_ENV=production
```

### Frontend (Vercel):
```
VITE_API_URL=https://your-backend.onrender.com
```

---

## 📊 **Your URLs**

**Frontend**: `https://_____________________.vercel.app`

**Backend**: `https://_____________________.onrender.com`

---

## 📚 **Full Guide**

See `DEPLOYMENT_STEPS.md` for detailed instructions!
