# Recipe Keeper

A React Native (Expo) app for saving, sharing, and cooking recipes with your family.

## Features

- Sign up / log in with email and password
- Add recipes with photos (stored on Cloudinary)
- Browse, search, and filter recipes
- Create or join a family to share recipes with each other
- Favorite recipes and add them to a cart
- Edit or delete your own recipes
- Change your username or password

## Tech stack

- **App:** Expo SDK 57, React Native, Expo Router
- **Server:** Node.js, Express, Mongoose
- **Database:** MongoDB Atlas
- **Image storage:** Cloudinary

## Project structure

```
app/            Screens and routes (Expo Router)
  (tabs)/       Bottom tab screens: home, personal, add, cart, profile
components/     Shared UI (recipe, family, navigation)
config/api.js   API base URL used by the app
server/         Express API
  models/       Mongoose models (User, Recipe, Family)
```

## Getting started

### Prerequisites

- Node.js 20+
- A MongoDB Atlas cluster
- A Cloudinary account
- Xcode (iOS) or Android Studio (Android) to run the build

### 1. Install dependencies

```bash
npm install
cd server && npm install
```

### 2. Configure the server

Create `server/.env` (it is gitignored, so never commit it):

```
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster-host>/cookingApp?retryWrites=true&w=majority
PORT=6767
CLOUDINARY_CLOUD_NAME=<your-cloud-name>
CLOUDINARY_API_KEY=<your-api-key>
CLOUDINARY_API_SECRET=<your-api-secret>
```

In Atlas, make sure your IP address is allowed under **Network Access**.

### 3. Start the server

```bash
cd server
npm start
```

The API runs on `http://localhost:6767` by default.

### 4. Start the app

```bash
npm run ios      # or: npm run android
```

The app talks to `http://localhost:6767` by default. When you test on a physical
phone, point it at your computer's local IP address instead:

```bash
EXPO_PUBLIC_API_BASE_URL=http://<your-computer-ip>:6767 npm start
```
