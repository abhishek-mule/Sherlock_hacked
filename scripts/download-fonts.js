const fs = require('fs');
const path = require('path');
const https = require('https');

// Font URLs
const FONT_URLS = {
  inter: {
    'inter-regular.woff2': 'https://fonts.gstatic.com/s/inter/v13/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7.woff2',
    'inter-medium.woff2': 'https://fonts.gstatic.com/s/inter/v13/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7.woff2',
    'inter-semibold.woff2': 'https://fonts.gstatic.com/s/inter/v13/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7.woff2',
    'inter-bold.woff2': 'https://fonts.gstatic.com/s/inter/v13/UcC73FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7.woff2',
  },
  poppins: {
    'poppins-regular.woff2': 'https://fonts.gstatic.com/s/poppins/v20/pxiEyp8kv8JHgFVrJJfecnFHGPc.woff2',
    'poppins-medium.woff2': 'https://fonts.gstatic.com/s/poppins/v20/pxiByp8kv8JHgFVrLGT9Z1xlFd2JQEk.woff2',
    'poppins-semibold.woff2': 'https://fonts.gstatic.com/s/poppins/v20/pxiByp8kv8JHgFVrLEj6Z1xlFd2JQEk.woff2',
    'poppins-bold.woff2': 'https://fonts.gstatic.com/s/poppins/v20/pxiByp8kv8JHgFVrLCz7Z1xlFd2JQEk.woff2',
  }
};

// Create directories if they don't exist
const BASE_FONT_DIR = path.join(__dirname, '../public/fonts');

Object.keys(FONT_URLS).forEach(fontFamily => {
  const fontDir = path.join(BASE_FONT_DIR, fontFamily);
  if (!fs.existsSync(fontDir)) {
    fs.mkdirSync(fontDir, { recursive: true });
    console.log(`Created directory: ${fontDir}`);
  }
});

// Download function
function downloadFont(url, destination) {
  return new Promise((resolve, reject) => {
    console.log(`Downloading from ${url} to ${destination}...`);
    
    // Create a write stream to save the file
    const file = fs.createWriteStream(destination);
    
    // Make an HTTP GET request
    https.get(url, (response) => {
      // Check if the response is successful
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download file: ${response.statusCode} ${response.statusMessage}`));
        return;
      }
      
      // Pipe the response to the file
      response.pipe(file);
      
      // Handle completion of the download
      file.on('finish', () => {
        file.close();
        console.log(`Successfully downloaded: ${destination}`);
        resolve();
      });
    }).on('error', (err) => {
      // Handle errors in the HTTP request
      fs.unlink(destination, () => {}); // Delete the file if there was an error
      console.error(`Error downloading ${url}: ${err.message}`);
      reject(err);
    });
    
    // Handle errors in writing to the file
    file.on('error', (err) => {
      fs.unlink(destination, () => {}); // Delete the file if there was an error
      console.error(`Error writing to ${destination}: ${err.message}`);
      reject(err);
    });
  });
}

// Download all fonts
async function downloadAllFonts() {
  console.log('Starting font downloads...');
  
  const downloads = [];
  
  for (const [fontFamily, fonts] of Object.entries(FONT_URLS)) {
    for (const [fileName, url] of Object.entries(fonts)) {
      const destinationPath = path.join(BASE_FONT_DIR, fontFamily, fileName);
      downloads.push(downloadFont(url, destinationPath));
    }
  }
  
  try {
    await Promise.all(downloads);
    console.log('All fonts downloaded successfully!');
  } catch (error) {
    console.error('An error occurred while downloading fonts:', error);
    process.exit(1);
  }
}

// Run the download function
downloadAllFonts(); 