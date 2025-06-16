RetroShare

RetroShare is a minimalist, Firebase-powered file-sharing web application. Registered users can upload files up to 100GB directly via the website. Uploaded files are stored securely in Firebase Cloud Storage and automatically deleted after 24 hours.

Visit the live site → https://retro-share.vercel.app/

---

Features

- User registration and login via Firebase Authentication
- Direct file uploads (up to 100GB) to Firebase Cloud Storage
- Automatic deletion of files 24 hours after upload using Firebase Cloud Functions
- User dashboard displaying uploaded files with direct download links
- Simple, retro 1990s-style HTML frontend
- Backend implemented with Node.js and Firebase Functions

---

Technology Stack

Component         Technology
----------------  -----------------------------
Frontend          HTML (no frameworks)
Backend           Node.js with Firebase Functions
Authentication    Firebase Authentication
Database          Firebase Firestore
File Storage      Firebase Cloud Storage
Scheduled Tasks   Firebase Cloud Functions
Hosting           Vercel (frontend)

---


---

Setup Instructions

1. Firebase Project Setup

- Create a Firebase project at https://firebase.google.com
- Enable:
  - Firebase Authentication (Email/Password)
  - Cloud Firestore
  - Cloud Storage
  - Cloud Functions

2. Clone the Repository

git clone https://github.com/yourusername/retroshare.git
cd retroshare

3. Backend Setup and Deployment

- Navigate to the functions directory:

cd functions
npm install

- Deploy Firebase Functions including scheduled file deletion:

firebase deploy --only functions

4. Frontend Deployment (Vercel)

- Deploy the frontend folder to Vercel or any static hosting provider:

vercel --prod

---

Important Notes

- Currently, only direct file uploads are supported. Remote uploads via URL or torrent links are not implemented.
- Files are automatically deleted 24 hours after upload by a scheduled Firebase Cloud Function.
- The frontend uses basic HTML with a retro 90s style—no modern frontend frameworks or libraries are used.

---

License

This project is licensed under the MIT License.

---

Contact

Please open an issue or submit a pull request for bug reports, feature requests, or contributions.
