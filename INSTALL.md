# 🍹 Mocktail Installation Guide

## 📦 Prerequisites

- **Google Chrome** browser (version 88+ for Manifest V3 support)
- **Node.js** (optional, only needed for running tests)

## 🚀 Installation

### Method 1: Load Unpacked (Recommended for Development)

1. **Clone the repository**

```bash
git clone https://github.com/user/mocktail.git
cd mocktail
```

2. **Open Chrome Extensions page**
   - Open Chrome browser
   - Navigate to `chrome://extensions/`
   - Or go to Menu → More Tools → Extensions

3. **Enable Developer Mode**
   - Toggle the **Developer mode** switch in the top-right corner

4. **Load the extension**
   - Click the **Load unpacked** button
   - Select the `mocktail` folder (the root directory containing `manifest.json`)

5. **Installation complete!**
   - The 🍹 Mocktail icon will appear in the toolbar
   - Open DevTools (F12) and find the **Mocktail** tab

### Method 2: Package as .crx File

You can also package the extension as a `.crx` file for distribution:

1. Go to `chrome://extensions/`
2. Click **Pack extension**
3. Set the extension root directory to your `mocktail` folder
4. Click **Pack Extension**
5. Drag and drop the generated `.crx` file into Chrome

## ✅ Verifying Installation

1. Open any web page
2. Open Chrome DevTools (F12 or Cmd+Option+I on Mac)
3. Look for the **Mocktail** tab in the DevTools panel
4. You should see the project list screen — you're ready to go!

Alternatively:
1. Click the Mocktail icon in the Chrome toolbar
2. You should see the popup with the Mocktail logo and instructions

## 🧪 Setting Up for Development

If you want to run tests or contribute to the project:

```bash
# Install dependencies
npm install

# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Open test UI
npm run test:ui
```

## 🔧 Troubleshooting

### Extension icon not visible in toolbar

1. Click the **puzzle piece** icon (Extensions) in Chrome toolbar
2. Find **Mocktail** in the list
3. Click the **pin** icon to pin it to the toolbar

### "Manifest file is missing or unreadable" error

- Make sure you selected the correct folder containing `manifest.json`
- Check for JSON syntax errors in `manifest.json`
- Ensure the file is saved with UTF-8 encoding

### Mocktail tab not appearing in DevTools

1. Close and reopen DevTools
2. Go to `chrome://extensions/` and click the **reload** button (🔄) on Mocktail
3. If still not visible, check the DevTools console for errors

### Content script not intercepting requests

1. Reload the extension from `chrome://extensions/` (click 🔄)
2. Refresh the target web page
3. Check the browser console (F12 → Console) for Mocktail log messages:
   - You should see `🍹 Mocktail Content Script loaded`
   - And `🍹 Mocktail interceptor activated!`

### Background Service Worker errors

1. Go to `chrome://extensions/`
2. Click the **Service Worker** link under Mocktail
3. Check the console for error messages

### Extension not working on certain pages

Mocktail cannot intercept requests on:
- `chrome://` pages (Chrome internal pages)
- `chrome-extension://` pages (other extensions)
- Chrome Web Store pages

This is a Chrome security restriction for all extensions.

## 📝 Next Steps

Once installed, check out:
- [README.md](README.md) — Overview and feature description
- [EXAMPLES.md](EXAMPLES.md) — Detailed usage examples and mock templates

## 🆘 Need Help?

If you encounter any issues, please open an [issue on GitHub](https://github.com/user/mocktail/issues).
