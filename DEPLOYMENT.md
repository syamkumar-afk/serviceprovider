# 🚀 Free Deployment Guide: Vercel + Neon (Zero Cost)

The best way to host this marketplace for **free** without breaking anything is using **Vercel** (for your code) and **Neon** (for your database). 

### 1. 🏗️ Setup your Database (Free Postgres)
Vercel's free tier resets files, so we cannot use the local `dev.db` file. Instead, we use a free hosted database.
1.  Go to **[Neon.tech](https://neon.tech/)** and create a free account.
2.  Create a new project named `marketplace`.
3.  Copy the **Connection String** (it starts with `postgresql://...`).
4.  Save this string! You will need it in Step 3.

### 2. 🛡️ Update Google OAuth (Critical)
Google will block your login unless you authorize your live URL.
1.  Go to the [Google Cloud Console](https://console.cloud.google.com/).
2.  Go to **APIs & Services > Credentials** and edit your OAuth Client.
3.  Add your production URL (e.g., `https://my-marketplace.vercel.app`) to **Authorized JavaScript origins**.
4.  Add the callback to **Authorized redirect URIs**:
    `https://my-marketplace.vercel.app/api/auth/callback/google`

### 3. 🚢 Deploy to Vercel
1.  Push your code to **GitHub**.
2.  Import the repository into **[Vercel](https://vercel.com/)**.
3.  In the **Environment Variables** section on Vercel, add these:

| Key | Value |
| :-- | :-- |
| `DATABASE_URL` | *Paste your Neon string from Step 1* |
| `NEXTAUTH_SECRET` | *Type any random unique words* |
| `NEXTAUTH_URL` | `https://my-marketplace.vercel.app` |
| `GOOGLE_CLIENT_ID` | `Your client ID here` |
| `GOOGLE_CLIENT_SECRET` | `Your secret here` |

### 4. ⚙️ Build Settings
Vercel should automatically detect Next.js. Just ensure the **Install Command** includes generating the database client:
`npx prisma generate && npx prisma db push && next build`

### 🏁 Why this works:
*   **Vercel** is the fastest free host for Next.js.
*   **Neon** gives you a real database that won't reset (unlike our local SQLite file).
*   **Zero Cost**: Both have forever-free tiers for small projects.

---
**Need help with GitHub?** Just ask, and I can tell you exactly how to push your code there!

---
**💡 Need help with a specific platform?** 
Tell me which one you want to use (Vercel, Railway, etc.) and I can generate the exact configuration for you!
