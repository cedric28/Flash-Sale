# Flash Sale Frontend

## Project Structure

```
frontend-sale-app/
  src/
    App.tsx
    services/
      FlashSaleService.ts
    utils/
      prettifySaleStatus.ts
    locale/
      en.ts
  public/
    index.html
  package.json
  README.md
  tsconfig.json
```

## Setup & Running

1. **Install dependencies:**
   ```bash
   npm install
   ```
2. **Start frontend app:**
   ```bash
   npm start
   ```
   The app will open at [http://localhost:3000](http://localhost:3000)

## Features

- Material UI for modern, responsive design
- SOLID-compliant: API calls in service, UI logic in components
- Locale folder for all UI text (easy to update or localize)
- User can check sale status, enter ID, buy, and check purchase

## System Diagram

See root README.md for system diagram and architecture overview.
