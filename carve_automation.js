const puppeteer = require('puppeteer');
const fs = require('fs').promises;
const path = require('path');

/**
 * Remove background using carve.photos automation
 * @param {string} inputPath - Path to input image
 * @param {string} outputPath - Path to save output image
 * @returns {Promise<boolean>} - Success status
 */
async function removeBackgroundWithCarve(inputPath, outputPath) {
    let browser;
    try {
        console.log('🚀 Launching browser for carve.photos automation...');

        browser = await puppeteer.launch({
            headless: true,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-gpu'
            ]
        });

        const page = await browser.newPage();

        // Navigate to carve.photos
        console.log('📡 Navigating to carve.photos...');
        await page.goto('https://www.carve.photos/', {
            waitUntil: 'networkidle2',
            timeout: 30000
        });

        // Wait for file input
        console.log('📤 Uploading image...');
        const fileInput = await page.$('input[type="file"]');

        if (!fileInput) {
            throw new Error('File input not found on carve.photos');
        }

        await fileInput.uploadFile(inputPath);

        // Wait for processing
        console.log('⏳ Waiting for background removal...');
        await page.waitForTimeout(10000); // Wait 10 seconds for processing

        // Try to find and click download button
        console.log('💾 Downloading result...');

        // Look for download button/link
        const downloadButton = await page.$('a[download], button:has-text("Download")');

        if (downloadButton) {
            // Set download path
            const client = await page.target().createCDPSession();
            await client.send('Page.setDownloadBehavior', {
                behavior: 'allow',
                downloadPath: path.dirname(outputPath)
            });

            await downloadButton.click();
            await page.waitForTimeout(5000);

            console.log('✅ Background removed successfully');
            return true;
        } else {
            console.log('⚠️ Download button not found, trying alternative method...');
            return false;
        }

    } catch (error) {
        console.error('❌ Error in carve automation:', error.message);
        return false;
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}

module.exports = { removeBackgroundWithCarve };
