# Wellborn Physio - User React Frontend

## Run
```bash
npm install
npm run dev
```

The dev server is configured for LAN/mobile testing:
```bash
npm run dev
```
Then open the URL shown by Vite on your PC and use the same PC IP on the phone, for example `http://192.168.1.10:5173`.

## Backend
The existing Spring Boot API is preserved at port `8080`. The React API client uses the current browser hostname, so desktop and LAN/mobile requests target the same machine automatically.

For mobile testing, the Spring Boot server must be reachable from the phone (bind to the LAN interface and allow CORS/firewall access if your backend requires it).

## Structure
- `src/pages` - separate React pages
- `src/components` - responsive navigation/theme wrappers
- `src/services/api.js` - existing backend endpoints
- `src/assets` - supplied Wellborn Physio logo
