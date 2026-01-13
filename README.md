# 📱 Gym Member App (React Native)

This project is a **React Native mobile application** designed to work with the **Gym Management API (FastAPI)**.
It provides gym members with a simple and reliable way to view membership status, attendance history, and account-related information through a mobile interface.

The app focuses on real-world gym usage rather than UI-heavy showcase features, and is intended for production integration with an existing gym management backend.

---

## ✨ Features

* Member authentication (JWT-based)
* View membership and subscription status
* Attendance and usage history
* Account and profile information
* API-driven architecture
* Cross-platform support (iOS / Android)

---

## 🧱 Tech Stack

* **React Native**
* JavaScript / TypeScript
* REST API integration (FastAPI backend)
* JWT Authentication
* React Navigation
* Fetch API

---

## 📱 ScreenShot

![앱 화면](screenshot/screenshot1.jpg)
![앱 화면](screenshot/screenshot2.jpg)
![앱 화면](screenshot/screenshot3.jpg)


---


## 🚀 Getting Started

아래는 개발 환경 기준 설치 및 실행 방법입니다.

### 1. Clone the repository

```bash
git clone https://github.com/humake-dev/app.git
cd app
```

---

### 2. Install dependencies

```bash
npm install
```

또는

```bash
yarn install
```

---

### 3. Configure environment variables

```bash
cp .env.example .env
```

FastAPI 서버 주소 및 API 키 정보를 설정하세요.

---

### 4. Run the app

```bash
npx react-native run-android
npx react-native run-ios
```

> Android Emulator 또는 iOS Simulator가 필요합니다.

---

## 🔗 Backend Integration

This app communicates with the **Gym Management API (FastAPI)** for all business logic:

* Authentication and authorization
* Membership and payment data
* Attendance tracking

The backend API repository:

> [https://github.com/yourname/gym-management-api](https://github.com/yourname/gym-management-api)

---

## 🛠️ Development Notes

* API communication 
* Screens are separated by feature for maintainability
* Designed to work with real production gym data

---

## 📄 License

MIT License
