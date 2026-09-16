/* =====================================================================
   config.js  —  the little settings of our page
   Change anything here, save, and refresh the page.
   ===================================================================== */

const CONFIG = {

  // Left side of the page
  partner1: {
    name: "Uncertainty",
    photoFolder: "images/partner1/"
  },

  // Right side of the page
  partner2: {
    name: "Tessa",
    photoFolder: "images/partner2/"
  },

  // How long one lovely sentence stays on screen before a new random one appears.
  // (Clicking on a writing panel shows a new one immediately.)
  wordsIntervalMinutes: 5,

  // How long each photo stays before sliding to the next one.
  // (Clicking on a photo panel goes to the next photo immediately.)
  photoIntervalSeconds: 12,

  // Photos are found automatically if they are named 1.jpg, 2.jpg, 3.png, ...
  // (any of these extensions: jpg, jpeg, png, webp, gif, svg — upper or lower case).
  // The page stops looking at the first missing number, so keep the numbers continuous.
  // You can ALSO list any file names by hand in js/images.js — both ways work together.
  autoDiscoverPhotos: true,
  maxAutoDiscoverPhotos: 100,

  // The heart that is drawn where you click
  clickHeart: {
    drawSeconds: 2.4,      // how slowly the heart is drawn
    holdSeconds: 1.8,      // how long it stays after it is complete
    fadeSeconds: 1.6,      // how long it takes to float away
    neonChance: 0.22,      // 22% of clicks -> white neon heart with colourful layered glow
    rainbowChance: 0.18    // 18% of clicks -> rainbow heart (the rest are random solid colours)
  },

  // The surprise when you click the big heart in the middle
  // (it cannot be started again until it has completely finished)
  surprise: {
    durationSeconds: 20,        // length of the animation itself
    messageSeconds: 5,          // how long the message stays on top of the page afterwards
    kaleidoscopeChance: 0.5,    // 50% -> spinning kaleidoscope hearts + giant heart explosion
                                // 50% -> the page slowly fills with kisses & hearts, centre to corners
    // Use \n where you want a new line.
    message: "Our Love Is Infinite & Let's Build a Bright Future Together Darling~\nFeel Me In Your Heart~"
  }
};
