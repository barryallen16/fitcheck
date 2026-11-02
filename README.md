# FitCheck

FitCheck is a React Native mobile application for organizing your wardrobe, generating outfit recommendations, and previewing virtual try-ons.
It is built with Expo.

<img width="1920" height="1080" alt="demo-ss" src="https://github.com/user-attachments/assets/a79deedb-1230-4669-9938-63c6c4e30b6b" />

## Research paper

The architecture and dataset distillation methods behind FitCheck are published in IEEE:

* IEEE Xplore: [IEEE Publication (Document 11681836)](https://ieeexplore.ieee.org/document/11681836/)
* Open-access PDF: [fitcheck-journal-paper.pdf](https://jayadithya.is-a.dev/fitcheck-journal-paper.pdf)

## Ecosystem and architecture

FitCheck spans mobile, web, and hosted inference:

* **Mobile App (React Native)**: This repository contains the Expo-based mobile client with local persistence and offline wardrobe storage.
* **Web Platform**: FitCheck Web provides the browser-based desktop interface.
* **Cloud Inference API**: A 24/7 inference backend hosted on Hugging Face Spaces at [barryallen16/fitcheck](https://huggingface.co/spaces/barryallen16/fitcheck), serving OpenAI-compatible completion endpoints.
* **Edge / Local Model**: Quantized [Qwen3-VL-2B-Instruct GGUF](https://huggingface.co/barryallen16/FitCheck-Qwen3-VL-Stylist-GGUF) for on-device or local network inference via LM Studio.
* **Hugging Face Collection**: Training datasets, fine-tuned weights, and spaces are indexed in the [FitCheck collection](https://huggingface.co/collections/barryallen16/fitcheck).

## How it works

The app catalogs garment photos and tags attributes such as color, category, style, and occasion using vision-language models.
Outfit generation combines these tags with real-time local weather fetched from Open-Meteo.
Recommendations run against the hosted Hugging Face Space API by default.
You can switch to a local LM Studio instance running on your machine whenever you want an offline or self-hosted setup.
Virtual try-on requests dispatch to Hugging Face Spaces using image generation models.
Wardrobe items, outfits, style personas, and image caches remain on your device using AsyncStorage and local filesystem storage.

## Project structure

```text
FitCheck/
├── App.js
├── app.json
├── package.json
├── assets/
└── src/
    ├── components/
    ├── config/
    ├── constants/
    ├── context/
    ├── navigation/
    ├── screens/
    ├── services/
    └── utils/
```

## Running the app

### Prerequisites

* Node.js (v18 or newer recommended) and npm.
* Expo Go installed on an Android or iOS phone, or a configured Android/iOS simulator.
* A Hugging Face user token with read permissions if you plan to use virtual try-on.
* (Optional) LM Studio with the Qwen3-VL-2B GGUF model loaded if you prefer running inference locally.

### Installation

Clone the repository and install dependencies:

```bash
cd fitcheck-rn
npm install
```

### Configuration

Copy the example configuration file:

```bash
cp src/config/example.keys.js src/config/keys.js
```

Edit `src/config/keys.js` with your parameters:

* `LMS_API_URL`: Optional remote OpenAI-compatible endpoint.
Leave empty to use the default endpoints.
* `LMS_KEYS`: API keys for your remote endpoint, if authentication is required.
* `LMS_MODEL`: Model identifier expected by your remote endpoint.
* `HF_TOKEN`: Hugging Face API tokens used for virtual try-on requests.

`src/config/keys.js` is ignored by git to prevent committing secrets.

### Backend connection modes

The mobile app supports two inference modes:

1. **Default Cloud API**:
The app defaults to `https://barryallen16-fitcheck.hf.space`.
No local GPU or desktop server setup is needed for outfit recommendations.

2. **Local LM Studio**:
Download the [Qwen3-VL-2B GGUF weights](https://huggingface.co/barryallen16/FitCheck-Qwen3-VL-Stylist-GGUF).
Start the local server in LM Studio on port `1234`.
When testing on a physical phone via Expo Go, set the server URL in app settings to your computer's local network IP address (such as `http://192.168.1.x:1234`) instead of `localhost`.

### Start the development server

```bash
npx expo start
```

Press `a` to open in Android emulator, `i` to open in iOS simulator, or scan the terminal QR code with Expo Go.

The app prompts for camera and photo gallery permissions to add garments, and location permissions to retrieve local weather data.
