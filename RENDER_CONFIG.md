# 🎯 RENDER DEPLOYMENT - Quick Copy-Paste Guide

## ✅ STATUS: Code pushed to GitHub ✓

**Repository:** https://github.com/srkulkarni196974-max/vehicle-minor

---

## 📋 RENDER CONFIGURATION (Copy these values)

### Basic Settings:
```
Name: vehicle-management-backend
Region: Singapore
Branch: main
Root Directory: backend
Runtime: Node
Build Command: npm install
Start Command: npm start
Instance Type: Free
```

---

## 🔑 ENVIRONMENT VARIABLES (Copy-paste each pair)

### 1. PORT
```
5000
```

### 2. MONGO_URI
```
mongodb+srv://srkulkarni196974_db_user:passwordgotilla@cluster0.vkvkwrq.mongodb.net/vehicle_sampa?appName=Cluster0
```

### 3. JWT_SECRET
```
c96dd3de0c1ca4f5ffb9939b7478e591
```

### 4. EMAIL_USER
```
srkulkarni1969.74@gmail.com
```

### 5. EMAIL_PASS
```
dpqe afvn aemt qngc
```

### 6. NODE_ENV
```
production
```

---

## 📝 AFTER DEPLOYMENT

**Save your backend URL here:**
```
https://________________________________.onrender.com
```

**Test it:** Open the URL - should show "Vehicle Management System API is running"

---

## ⚠️ IF MONGODB CONNECTION FAILS

1. Go to: https://cloud.mongodb.com
2. Network Access → Add IP Address
3. Allow Access from Anywhere: `0.0.0.0/0`
4. Confirm and redeploy on Render

---

## ✅ CHECKLIST

- [ ] Signed into Render
- [ ] Created Web Service
- [ ] Connected GitHub repository
- [ ] Set Root Directory to `backend`
- [ ] Added all 6 environment variables
- [ ] Clicked "Create Web Service"
- [ ] Deployment successful
- [ ] Backend URL saved
- [ ] Tested backend URL

---

**Next:** Once backend is deployed, tell me your backend URL and I'll help deploy the frontend! 🚀
