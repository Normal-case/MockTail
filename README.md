# 🍹 Mocktail

**A Chrome DevTools extension for intercepting and modifying API responses**

Mocktail lets developers create and manage mock API responses without touching the backend. It intercepts both Fetch API and XMLHttpRequest calls directly in the browser, allowing you to replace, merge, or modify response data on the fly.

## ✨ Key Features

- **Project-based organization**: Group your API mocks into projects for better management
- **Fetch & XHR interception**: Intercepts both `fetch()` and `XMLHttpRequest` at the browser level
- **Flexible response handling**: Replace entire responses, merge additional fields, or modify specific properties
- **URL pattern matching**: Match URLs by exact match, contains, startsWith, or regex patterns
- **Custom status codes**: Override HTTP status codes (e.g., force 404, 500 errors)
- **Enable/Disable toggle**: Quickly toggle individual API mocks on and off
- **Import/Export**: Share project configurations as JSON with your team
- **DevTools integration**: Accessible directly from Chrome DevTools panel
- **Real-time badge**: Shows the count of intercepted requests on the extension icon

## 🚀 Quick Start

### Installation

1. Clone or download this repository:

```bash
git clone https://github.com/user/mocktail.git
cd mocktail
```

2. Open Chrome and navigate to `chrome://extensions/`
3. Enable **Developer mode** (toggle in the top-right corner)
4. Click **Load unpacked** and select the `mocktail` folder
5. Open DevTools and find the **Mocktail** tab

> For detailed installation instructions, see [INSTALL.md](INSTALL.md).

### Basic Usage

1. Open Chrome DevTools and navigate to the **Mocktail** tab
2. Create a new project by clicking the **+** button
3. Add an API mock with:
   - **HTTP Method**: GET, POST, PUT, PATCH, or DELETE
   - **API URL**: The endpoint to intercept (e.g., `https://api.example.com/users`)
   - **Mock Response**: JSON data to return
4. The mock is immediately active — refresh the page to see intercepted responses

> For more detailed examples, see [EXAMPLES.md](EXAMPLES.md).

## 🎯 Use Cases

### Frontend Development

- Develop UI components before the backend API is ready
- Test various response scenarios (success, error, edge cases)

### QA Testing

- Reproduce specific error conditions
- Test edge cases and boundary values

### Debugging

- Override API responses to isolate frontend issues
- Monitor which requests are being intercepted

### Demos & Presentations

- Create stable demo environments with predictable data
- Showcase features without depending on live APIs

## 🛠️ Tech Stack

- **Manifest V3**: Latest Chrome extension standard
- **Fetch & XHR Interception**: Native API overrides via content script (MAIN world)
- **Chrome Storage API**: Persistent data storage for projects and mocks
- **Service Worker**: Background processing for messaging and badge updates
- **Vanilla JS**: No framework dependencies — lightweight and fast
- **Vitest**: Unit testing framework with happy-dom

## 📁 Project Structure

```
mocktail/
├── manifest.json                     # Chrome extension manifest (V3)
├── devtools.html / devtools.js       # DevTools panel registration
├── panel.html                        # DevTools panel UI entry point
├── scripts/
│   ├── background.js                 # Service worker (messaging, badge, logs)
│   └── content.js                    # Fetch & XHR interceptor (MAIN world)
├── src/
│   ├── panel.js                      # Panel app initialization & routing
│   ├── core/
│   │   ├── router.js                 # SPA router for view navigation
│   │   ├── storage.js                # Chrome Storage API wrapper
│   │   └── view.js                   # Base View class with lifecycle
│   ├── views/
│   │   ├── project-list/             # Project list screen
│   │   ├── project-detail/           # Project detail & API list screen
│   │   └── api-form/                 # Add/Edit API mock screen
│   ├── components/                   # Shared component styles
│   └── styles/                       # Global styles & CSS variables
├── icons/
│   └── icon.svg                      # Extension icon
├── test/                             # Vitest unit tests
├── INSTALL.md                        # Detailed installation guide
├── EXAMPLES.md                       # Usage examples
└── README.md                         # This file
```

## 🧪 Testing

```bash
# Install dev dependencies
npm install

# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

## 🔒 Security & Privacy

- Mocktail only operates based on the rules you configure
- All data is stored locally in Chrome Storage — nothing is sent to external servers
- The content script runs in the MAIN world to intercept network calls, but only modifies responses matching your rules
- Fully open-source for transparency

## 📄 License

MIT License — free to use, modify, and distribute.

---

**Made with 💜 by developers, for developers**

🍹 Cheers to better development!
