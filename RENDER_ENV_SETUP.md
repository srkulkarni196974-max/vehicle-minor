# Render Backend Environment Setup

The "500 Internal Server Error" you are seeing is likely because your deployed backend on Render is missing the necessary environment variables (secrets) that are present in your local `.env` file.

## How to Fix

1.  **Go to your Render Dashboard**: [https://dashboard.render.com/](https://dashboard.render.com/)
2.  Select your **Backend Web Service**.
3.  Click on the **"Environment"** tab on the left sidebar.
4.  Click **"Add Environment Variable"** for each of the following keys. You can copy the values from your local `backend/.env` file.

### Required Variables

| Key | Value Description |
| :--- | :--- |
| `MONGO_URI` | Your MongoDB Connection String (from MongoDB Atlas) |
| `JWT_SECRET` | A secret string for security (e.g., `mysecretkey123`) |
| `EMAIL_USER` | Your Gmail address (e.g., `yourname@gmail.com`) |
| `EMAIL_PASS` | Your Gmail **App Password** (NOT your login password) |

> **Note on Gmail App Password**: If you are using Gmail, you must generate an "App Password" if you have 2-Step Verification enabled. Go to [Google Account Security](https://myaccount.google.com/security) > 2-Step Verification > App Passwords.

### After Adding Variables
Render will automatically restart your server. Once it redeploys (usually takes 1-2 minutes), try the action again on your frontend.

## Frontend Update
I have also updated your frontend code to fix the "Mixed Content" error. You need to **redeploy your frontend to Netlify** for these changes to take effect.

1.  Commit the changes:
    ```bash
    git add .
    git commit -m "Fix mixed content error and update API config"
    git push origin main
    ```
2.  Netlify will automatically redeploy.
