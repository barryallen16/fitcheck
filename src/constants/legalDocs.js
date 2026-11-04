// Core Legal & Compliance Documents for FitCheck

export const LEGAL_DOCS = {
  privacy: {
    title: 'PRIVACY POLICY',
    lastUpdated: 'November 2026',
    sections: [
      {
        heading: '1. Information We Collect',
        body: `FitCheck collects garment photographs and wardrobe metadata that you choose to upload.
All photos and garment details are stored locally on your device within the app sandbox.
Optional location permissions are used solely to fetch current ambient weather conditions for temperature-appropriate outfit suggestions.
We do not collect personal names, email addresses, phone numbers, or account credentials.`
      },
      {
        heading: '2. Artificial Intelligence Processing',
        body: `When you analyze a garment or request an outfit recommendation, image data is processed by vision-language models.
Inference runs either on our hosted Hugging Face Space endpoint or on your own local LM Studio instance.
Images processed through the cloud endpoint are handled ephemerally in memory to extract attributes and compute compatibility scores.
We do not store your uploaded clothing photos on remote servers, and we do not use your images to train public machine learning models.`
      },
      {
        heading: '3. Device Permissions',
        body: `Camera access is requested only when you choose to photograph garments directly within the app.
Photo library access is used only when you select existing images from your gallery to catalog.
Location access is optional and is never tracked continuously or shared with third parties.`
      },
      {
        heading: '4. Data Retention & Control',
        body: `You have full control over your data.
You can delete individual garments at any time or clear your entire wardrobe from the Profile screen.
Deleting the application removes all locally stored images, personas, and outfit history from your device.`
      }
    ]
  },
  terms: {
    title: 'TERMS OF SERVICE',
    lastUpdated: 'November 2026',
    sections: [
      {
        heading: '1. Use of Service',
        body: `FitCheck provides wardrobe cataloging and AI-assisted outfit recommendations for personal, non-commercial use.
Outfit suggestions and compatibility scores are generated algorithmically for style inspiration and organization.
Recommendations do not constitute professional fashion styling advice or commercial guarantees.`
      },
      {
        heading: '2. User Ownership & Content',
        body: `You retain all rights and ownership of the photographs and wardrobe items you catalog in FitCheck.
You agree not to upload harmful, offensive, or unlawful content to the application or through connected inference endpoints.`
      },
      {
        heading: '3. AI Endpoints & Availability',
        body: `FitCheck offers connectivity to hosted Hugging Face Spaces and local inference servers.
Hosted cloud endpoints are provided on a best-effort basis and may experience latency, rate limits, or maintenance windows.
You may configure your own local LM Studio server at any time to run inference completely offline on your local network.`
      },
      {
        heading: '4. Disclaimer of Warranty',
        body: `FitCheck is provided as-is without warranties of any kind, either express or implied.
The developers are not liable for any discrepancies, device storage issues, or decisions made based on algorithmic outfit suggestions.`
      }
    ]
  },
  compliance: {
    title: 'AI TRANSPARENCY & COMPLIANCE',
    lastUpdated: 'November 2026',
    sections: [
      {
        heading: '1. Model Architecture Disclosure',
        body: `FitCheck utilizes fine-tuned weights derived from the Qwen3-VL-2B vision-language model.
The model performs two primary tasks: Task A extracts garment category, cut, color, and attributes.
Task B evaluates pairwise outfit compatibility and color harmony between selected wardrobe pieces.`
      },
      {
        heading: '2. Non-Biometric Processing',
        body: `FitCheck does not perform facial recognition, identity profiling, or biometric data extraction.
The vision encoder strictly analyzes fabric textures, silhouettes, garment cuts, and clothing patterns.
Full-body reference photos are used solely to assist styling proportionality on your local device.`
      },
      {
        heading: '3. Academic Foundation & Open Standards',
        body: `The dataset distillation methods, compatibility scoring algorithms, and evaluation frameworks behind FitCheck are published in IEEE research.
Users are free to inspect the connected inference server code, evaluate model weights, and run alternative backends.`
      }
    ]
  }
};
