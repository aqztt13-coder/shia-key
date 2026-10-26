<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/5725db85-8939-454f-972f-4441527e9c3d

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`


## Quran reader

The app includes an Arabic Quran reader with surah selection, in-surah verse search, adjustable font size, copy-verse controls, and local bookmarks. Quran JSON metadata and the selected surah text are fetched from the upstream GitHub raw files when the Quran tab is opened, so an internet connection is required to load Quran text. The upstream dataset is identified in the reader UI.
