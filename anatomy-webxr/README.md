# WebXR Human Anatomy Explorer

An interactive 3D human anatomy viewer built using React, Vite, Three.js, `@react-three/fiber`, and `@react-three/xr` v6. This project is configured to run on HTTPS and expose itself over the local network so you can test WebXR hit-testing directly on your mobile device.

---

## Technical Stack & Configuration

- **React + Vite**: Fast HMR and lightweight bundles.
- **Three.js & Fiber**: 3D scene engine and React bindings.
- **`@react-three/xr` v6**: State management via `createXRStore` and plane hit-testing using `useXRHitTest`.
- **`@vitejs/plugin-basic-ssl`**: Automatically generates a self-signed SSL certificate so that the dev server can run over secure HTTPS (which is a **hard requirement** for mobile WebXR).
- **Network Exposing**: Vite is configured with `host: true` to bind to `0.0.0.0`, allowing other devices on your local network to connect.

---

## Getting Started

### 1. Install Dependencies
If you haven't already, install the project's dependencies:
```bash
npm install
```

### 2. Start the Dev Server
Run the development command:
```bash
npm run dev
```

The output will display local and network URLs:
```text
  VITE v8.1.0  ready in 320 ms

  ➜  Local:   https://localhost:5173/
  ➜  Network: https://192.168.1.15:5173/
  ➜  press h + enter to show help
```

---

## Local Network Testing Guide

To experience the WebXR hit-testing and place models in your physical room, follow these step-by-step instructions to connect your mobile device:

### Step 1: Connect to the Same Wi-Fi
Ensure that both your development computer and your mobile phone are connected to the **same Wi-Fi network**.

### Step 2: Retrieve your Local Host IP
If the network URL is not shown in the Vite console output, you can find it manually:
- **Windows**: Open Command Prompt/PowerShell and run `ipconfig`. Look for the `IPv4 Address` under your active Wi-Fi adapter (e.g., `192.168.x.x`).
- **macOS / Linux**: Open Terminal and run `ifconfig` or `ip a`. Look for the `inet` address under the active interface (typically `en0` or `wlan0`).

### Step 3: Access the Server on Mobile
Open your mobile browser and navigate to the network URL shown in your Vite terminal:
```text
https://<your-computer-ip>:5173
```
*Note: Make sure to include the `https://` prefix! WebXR session requests will be rejected by the browser on unsecure `http://` networks.*

### Step 4: Bypass the SSL Certificate Warning
Because Vite uses a local self-signed SSL certificate (`@vitejs/plugin-basic-ssl`), your mobile browser will display a warning:
- **Google Chrome (Android)**: Tap **Advanced**, then tap **Proceed to <your-ip> (unsafe)**.
- **Safari / WebXR Viewer (iOS)**: Tap **Show Details**, then tap **visit this website** or **Proceed**.

---

## WebXR Mobile Device Compatibility

### Android (Chrome) - Native Support
1. Ensure **Google Play Services for AR (ARCore)** is installed on your device from the Play Store.
2. Open the page in **Google Chrome**.
3. Click the **Enter AR Mode** button.
4. Grant camera permissions when prompted.

### iOS (iPhone/iPad) - WebXR Viewer App
Since iOS Safari does not natively support WebXR AR sessions yet, you need to use a browser shell that does:
1. Download the free **WebXR Viewer** app by Mozilla from the App Store.
2. Open the **WebXR Viewer** app.
3. Type the network URL (`https://<your-computer-ip>:5173`) into the address bar.
4. Click **Enter AR Mode** and grant camera permissions.

---

## Interactive AR Walkthrough

1. **Enter AR**: Tap the **Enter AR Mode** button on the home screen.
2. **Scan the Surface**: Slowy move your phone side to side, pointing the camera at the floor or a flat tabletop.
3. **Reticle targeting**: Once a surface is detected, a blue targeting reticle (sci-fi ring outline with guide markings) will lock onto the plane.
4. **Spawn the Torso**: Tap anywhere on your phone screen to spawn a 3D glassmorphic human anatomy torso at the reticle's location. You can spawn multiple torsos on the surface!
5. **Inspect Organs**: Tap on the color-coded interactive organ meshes:
   - **Heart** (Red, Beating Animation): Reveals the Cardiovascular System card.
   - **Lungs** (Orange, Breathing Animation): Reveals the Respiratory System card.
   - **Brain** (Purple, Cognitive Pulsing Animation): Reveals the Nervous System card.
6. **Read Educational Overlay**: The flat, minimalist glassmorphic info panel will display at the bottom of your screen, showing key stats, chambers, breathing rate, etc.
7. **Close Panel**: Tap the close cross (✕) or tap anywhere on the background to hide the info panel.
