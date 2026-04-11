# 🚀 100% Free Deployment Guide for Positron Vivek

I've selected the best **free** platforms to host your website without spending a single rupee. Follow these steps to go live!

---

## 🛠️ Step 1: Get a Free MySQL Database (Aiven)

We'll use **Aiven** because they offer a generous free tier for MySQL that never expires.

1.  Go to [Aiven.io](https://aiven.io/free-mysql-database) and sign up for a free account.
2.  Create a new **MySQL** service.
3.  Select the **Free Plan**.
4.  Once the service is running, copy the **Service URI** (it looks like `mysql://user:password@host:port/defaultdb`).
5.  **Save this URI!** This is your `DATABASE_URL`.

---

## 🛠️ Step 2: Set Up Free App Hosting (Render)

**Render** is perfect for hosting your Node.js/Express backend and React frontend together for free.

1.  Go to [Render.com](https://render.com/) and sign up (connect your GitHub account for the easiest setup).
2.  Create a **New Web Service**.
3.  Connect your GitHub repository (upload the updated project I gave you to a new GitHub repo first).
4.  **Settings:**
    *   **Name:** `positron-vivek`
    *   **Environment:** `Docker` (I've already created the `Dockerfile` for you!)
    *   **Plan:** `Free`
5.  **Environment Variables:** Click "Advanced" and add these:
    *   `NODE_ENV`: `production`
    *   `DATABASE_URL`: (The URI you copied from Aiven)
    *   `JWT_SECRET`: (Generate a random long string, e.g., `my_super_secret_key_12345`)
    *   `SMTP_HOST`: `smtp.gmail.com` (If using Gmail)
    *   `SMTP_PORT`: `587`
    *   `SMTP_USER`: `your-email@gmail.com`
    *   `SMTP_PASS`: `your-gmail-app-password` (See Step 3)
    *   `EMAIL_FROM`: `your-email@gmail.com`
    *   `APP_NAME`: `Positron Vivek`

---

## 🛠️ Step 3: Set Up Free Email (Gmail App Password)

To make the OTP work for free, use your Gmail account:

1.  Go to your [Google Account Settings](https://myaccount.google.com/security).
2.  Enable **2-Step Verification**.
3.  Search for **"App Passwords"** in the search bar.
4.  Create a new app password (select "Mail" and "Other").
5.  Copy the **16-character code** and use it as your `SMTP_PASS` in Render.

---

## 🛠️ Step 4: Finalize & Go Live!

1.  Click **Create Web Service** on Render.
2.  Render will build your app using the `Dockerfile` I provided.
3.  Once the build is finished, Render will give you a URL like `https://positron-vivek.onrender.com`.
4.  **Your website is now permanent and live for free!** 🎉

---

## 💡 Pro Tips for Free Hosting:
*   **Spin-up Time:** On the Render Free plan, the website might take 30-60 seconds to "wake up" if no one has visited it for a while. This is normal for free hosting.
*   **Database Size:** Aiven's free plan is plenty for starting out. If you get thousands of students, you can upgrade later.
*   **Custom Domain:** You can connect a custom domain (like `.com` or `.in`) to Render for free if you buy one later!

---

**Need help with any step? Just ask me, bro!**
