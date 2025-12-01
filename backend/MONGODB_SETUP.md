# MongoDB Connection Setup Guide

## Current Issue
Your backend cannot connect to MongoDB. This guide will help you fix it.

## Quick Fix Options

### Option 1: MongoDB Atlas (Cloud - Recommended)

1. **Create/Login to MongoDB Atlas Account**
   - Go to https://cloud.mongodb.com/
   - Sign up or log in

2. **Create a Cluster** (if you don't have one)
   - Click "Build a Database"
   - Choose FREE tier (M0)
   - Select a region close to you
   - Click "Create"

3. **Create Database User**
   - Go to "Database Access" in left sidebar
   - Click "Add New Database User"
   - Choose "Password" authentication
   - Username: `vehicleadmin` (or your choice)
   - Password: Generate a secure password (SAVE THIS!)
   - Database User Privileges: "Atlas admin"
   - Click "Add User"

4. **Whitelist Your IP Address**
   - Go to "Network Access" in left sidebar
   - Click "Add IP Address"
   - Click "Allow Access from Anywhere" (for development)
   - Or click "Add Current IP Address" (more secure)
   - Click "Confirm"

5. **Get Connection String**
   - Go to "Database" in left sidebar
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string
   - It looks like: `mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority`

6. **Update Your .env File**
   ```env
   MONGO_URI=mongodb+srv://vehicleadmin:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/vehicle_db?retryWrites=true&w=majority
   ```
   
   **IMPORTANT:**
   - Replace `<username>` with your database username
   - Replace `<password>` with your database password
   - Replace `cluster0.xxxxx` with your actual cluster address
   - Add `/vehicle_db` before the `?` to specify database name
   - If password has special characters (@, :, /, etc.), URL-encode them:
     - @ → %40
     - : → %3A
     - / → %2F
     - Use this tool: https://www.urlencoder.org/

### Option 2: Local MongoDB (For Development)

1. **Install MongoDB Community Edition**
   - Download from: https://www.mongodb.com/try/download/community
   - Run the installer
   - Choose "Complete" installation
   - Install MongoDB as a Service

2. **Update Your .env File**
   ```env
   MONGO_URI=mongodb://localhost:27017/vehicle_db
   ```

3. **Start MongoDB Service**
   ```powershell
   net start MongoDB
   ```

## Verify Connection

After updating your .env file, test the connection:

```bash
cd backend
node test_mongo_connection.js
```

You should see: ✅ SUCCESS: MongoDB Connected!

## Restart Your Backend Server

After fixing the MongoDB connection:

1. Stop the current backend server (Ctrl+C in the terminal)
2. Start it again:
   ```bash
   npm run dev
   ```

You should see:
```
Server running on port 5000
MongoDB Connected
```

## Common Errors & Solutions

### Error: "MONGO_URI is not defined"
**Solution:** Add MONGO_URI to your `.env` file

### Error: "Authentication failed"
**Solution:** Check username and password in MONGO_URI

### Error: "ENOTFOUND" or "ETIMEDOUT"
**Solution:** 
- Check your internet connection
- Whitelist your IP in MongoDB Atlas Network Access
- Verify the cluster hostname is correct

### Error: "bad auth"
**Solution:** 
- Password might contain special characters - URL encode them
- Verify credentials in MongoDB Atlas

## Need Help?

If you're still having issues, please share:
1. The error message you see when running `node test_mongo_connection.js`
2. Whether you're using MongoDB Atlas or local MongoDB
3. Any error messages from the backend server
