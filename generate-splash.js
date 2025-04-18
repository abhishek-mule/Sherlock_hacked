const fs = require('fs');
const path = require('path');

// Create a basic HTML splash screen that we'll convert to PNG later
const splashHTML = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Splash Screen</title>
  <style>
    body, html {
      margin: 0;
      padding: 0;
      width: 100%;
      height: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
      background: linear-gradient(45deg, #0284c7, #0ea5e9);
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
      color: white;
      overflow: hidden;
    }
    .splash-container {
      text-align: center;
      padding: 2rem;
    }
    .logo {
      width: 180px;
      height: 180px;
      margin-bottom: 2rem;
      background: white;
      border-radius: 50%;
      display: flex;
      justify-content: center;
      align-items: center;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
      margin: 0 auto 2rem;
    }
    .logo-inner {
      font-size: 64px;
      font-weight: bold;
      color: #0284c7;
    }
    h1 {
      font-size: 36px;
      font-weight: bold;
      margin-bottom: 1rem;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
    p {
      font-size: 18px;
      opacity: 0.9;
    }
  </style>
</head>
<body>
  <div class="splash-container">
    <div class="logo">
      <div class="logo-inner">SH</div>
    </div>
    <h1>Sherlock Student Database</h1>
    <p>Intelligent Student Management</p>
  </div>
</body>
</html>
`;

// Save the HTML file that we'll convert to PNG manually
fs.writeFileSync(path.join(__dirname, 'splash.html'), splashHTML);

console.log('Splash HTML generated at "splash.html"');
console.log('Next step: Open this HTML file in a browser and take a screenshot.');
console.log('Save the screenshot as "assets/splash.png", "assets/icon.png", and "assets/adaptive-icon.png"'); 