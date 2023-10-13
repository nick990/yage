# init
```bash
npm init -y
npm install electron-prebuilt -D
```
Replace `package.json` with:
```json
{
  "name": "yage",
  "version": "1.0.0",
  "description": "",
  "main": "src/main.js",
  "scripts": {
    "start": "electron ."
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "devDependencies": {
    "electron-prebuilt": "^1.4.13"
  }
}
```
Run
```bash
npm start
```