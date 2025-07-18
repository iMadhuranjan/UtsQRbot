const { Telegraf } = require('telegraf');
const fs = require('fs');
const Fuse = require('fuse.js');

// Load station data from JSON
const stations = JSON.parse(fs.readFileSync('./station.json', 'utf8'));

// Prepare fuse.js for fuzzy searching
const stationNames = Object.keys(stations);
const fuse = new Fuse(stationNames, {
    threshold: 0.4, // lower = stricter, higher = looser match
});

// Initialize bot
const bot = new Telegraf('8005376738:AAHhA-8DmddO-TPlwQaxmLJAuDBqDFF0Wmg');

bot.start((ctx) => {
    const name = ctx.from.first_name?.replace(/[_*[\]()~`>#+=|{}.!-]/g, '\\$&') || "there";

    ctx.replyWithMarkdownV2(
        `👋 *Welcome, ${name}*\\

 Welcome to *UTS QR Code Bot*\\. This bot helps you quickly get the UTS QR code for your desired railway station\\.

 *Made by* [UTS Station QR Code](https://utsstationqrcode.com)\
  `,
        { disable_web_page_preview: true }
    );
});



bot.on('text', (ctx) => {
    const userInput = ctx.message.text.toLowerCase().trim();

    // Direct match
    if (stations[userInput]) {
        return ctx.reply(`UTS QR code for *${userInput.toUpperCase()}*: ⏬⏬ \n\n ${stations[userInput]}`, { parse_mode: 'Markdown' });
    }

    // Skip fuzzy if too short
    if (userInput.length < 3) {
        return ctx.reply("Please enter a valid station name.");
    }

    // Fuzzy match with stricter score
    const result = fuse.search(userInput);

    if (result.length > 0) {
        const bestMatch = result[0];
        const matchedStation = bestMatch.item;

        // Only accept match if score is low and first letter matches
        if (bestMatch.score <= 0.3 && matchedStation[0] === userInput[0]) {
            const qrLink = stations[matchedStation];
            return ctx.reply(`Did you mean *${matchedStation.toUpperCase()}*?\nHere is the QR code:\n${qrLink}`, { parse_mode: 'Markdown' });
        }
    }

    // Otherwise, not found
    ctx.replyWithMarkdownV2(
        "🚫 Station not found\\. Please check the spelling or Type only Station Name or Staion Code and try again\\. \n\ Or Visit Our Website to find Your Station UTS QR Code [UTS Station QR Code](https://utsstationqrcode\\.com/) 😊\\."
      );
      
});


bot.launch();
console.log('🤖 Bot running with fuzzy search...');
