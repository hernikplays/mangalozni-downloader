# mangalozni-downloader
Automates extracting canvas data to download comics from PIXIV COMIC / CLIP STUDIO READER

**Created for demonstration purposes and with a good heart, do not use to steal copyrighted work**
## Dependencies
- NodeJS
- TypeScript
- Puppeteer

## How it works
0. Install NodeJS and dependencies (`npm i`)
1. Copy example config
2. Set `url` to reader URL (ex. `api.distribution.mediadotech.com`)
3. Set `cookie` in format `cookiename=cookievalue` and `cookieDomain` to the cookie's set domain (without any `https://`)
4. Run with `npm start`