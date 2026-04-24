# CivicRoad

## Project Overview

CivicRoad is a platform where citizens can report civic issues and municipality staff can manage, review, and resolve them.

- Citizens use the mobile app to log in, submit reports, attach photos, and pin locations on a map.
- Municipality staff use the web dashboard to review incoming reports and update their status.
- The backend stores users, reports, categories, and uploaded images in a local SQLite database.

## Tech Stack

### `civicroad-api`

- Node.js
- Express
- SQLite

### `civicroad-web`

- React.js

### `civicroad-mobile`

- React Native
- Expo

## Installed Packages

### `civicroad-api`

- `express`
- `cors`
- `multer`
- `sqlite`
- `sqlite3`

### `civicroad-web`

- `react`
- `react-dom`
- `react-router-dom`
- `axios`
- `leaflet`
- `react-scripts`
- `@testing-library/react`
- `@testing-library/jest-dom`
- `@testing-library/user-event`
- `web-vitals`

### `civicroad-mobile`

- `expo`
- `react`
- `react-native`
- `axios`
- `@react-navigation/native`
- `@react-navigation/native-stack`
- `@react-navigation/drawer`
- `@expo/vector-icons`
- `expo-image-picker`
- `react-native-maps`
- `expo-notifications`
- `react-native-gesture-handler`
- `react-native-safe-area-context`
- `react-native-screens`
- `react-native-reanimated`

## How To Run The Project

### 1. Start the API

```powershell
cd civicroad-api
npm install
npm start
```

The API runs locally on:

- `http://localhost:4000`

Database file:

- `civicroad-api/data/civicroad.sqlite`

Default seeded admin account:

- Email: `admin@example.com`
- Password: `admin123`

### 2. Start the Web Dashboard

```powershell
cd civicroad-web
npm install
npm start
```

### 3. Start the Mobile App

```powershell
cd civicroad-mobile
npm install
setx EXPO_PUBLIC_API_URL "http://YOUR_IP_ADDRESS:4000"
npx expo start
```

Then:

- Open the Expo Go app on your phone
- Scan the QR code from the Expo terminal
- Make sure the phone and computer can both reach the same local network address

Note:

- After running `setx`, open a new terminal before starting Expo so the updated environment variable is available.

## Project Structure

- `civicroad-api` -> Backend server, SQLite database setup, API routes, file uploads
- `civicroad-web` -> Municipality dashboard for viewing and managing reports
- `civicroad-mobile` -> Citizen mobile app for login, creating reports, and tracking submissions

## Notes

- All services run locally for MVP/demo purposes only.
- Main local API base URL: `http://localhost:4000`
- For Expo Go on a physical device, use your computer's LAN IP instead of `localhost`.
- Uploaded images are stored locally in `civicroad-api/uploads/`
- Report and user data are stored locally in `civicroad-api/data/civicroad.sqlite`
