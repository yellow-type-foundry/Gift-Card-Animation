/**
 * Utility functions for generating random card data
 */

/**
 * Shuffle an array using Fisher-Yates algorithm
 * @param {Array} array - Array to shuffle
 * @returns {Array} Shuffled array
 */
export function shuffleArray(array) {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

/**
 * Generate randomized SentCard data
 * @param {Object} options - Configuration options
 * @param {Array} options.covers - Array of cover image paths
 * @param {Array} options.senders - Array of sender names
 * @param {Array} options.titles - Array of card titles
 * @param {Array} options.giftTitles - Array of gift titles
 * @param {Array} options.giftSubtitles - Array of gift subtitles
 * @param {Array} options.dates - Array of sent dates
 * @param {number} options.count - Number of cards to generate (default: 8)
 * @param {number} options.minDoneCards - Minimum number of "Done" cards (default: 2)
 * @returns {Array} Array of randomized card data objects
 */
export function generateRandomSentCardData({
  covers,
  senders,
  titles,
  giftTitles,
  giftSubtitles,
  dates,
  count = 8,
  minDoneCards = 2
}) {
  const shuffledCovers = shuffleArray(covers)
  const shuffledSenders = shuffleArray(senders)
  const shuffledTitles = shuffleArray(titles)
  const shuffledGiftTitles = shuffleArray(giftTitles)
  const shuffledGiftSubtitles = shuffleArray(giftSubtitles)
  const shuffledDates = shuffleArray(dates)
  
  // Track used covers to avoid duplicates
  const usedCovers = []
  
  // If count is 8, ensure exactly 4 done and 4 undone cards
  const randomized = Array(count).fill(null).map((_, index) => {
    const isDone = count === 8 ? index < 4 : false // First 4 are done when count is 8
    
    // Select a cover that hasn't been used yet in this batch
    let selectedCover
    // Find covers that haven't been used yet
    const availableCovers = shuffledCovers.filter(c => !usedCovers.includes(c))
    
    if (availableCovers.length > 0) {
      // Pick randomly from available covers
      selectedCover = availableCovers[Math.floor(Math.random() * availableCovers.length)]
    } else {
      // If all covers have been used (shouldn't happen with 8 cards and multiple covers, but handle it)
      // Reset and pick from all covers
      usedCovers.length = 0
      selectedCover = shuffledCovers[Math.floor(Math.random() * shuffledCovers.length)]
    }
    
    usedCovers.push(selectedCover)
    
    return {
      from: shuffledSenders[Math.floor(Math.random() * shuffledSenders.length)],
      title: shuffledTitles[Math.floor(Math.random() * shuffledTitles.length)],
      boxImage: selectedCover,
      giftTitle: shuffledGiftTitles[Math.floor(Math.random() * shuffledGiftTitles.length)],
      giftSubtitle: shuffledGiftSubtitles[Math.floor(Math.random() * shuffledGiftSubtitles.length)],
      progress: (() => {
        if (isDone) {
          // Done card: current === total
          const total = Math.floor(Math.random() * 40) + 1
          return { current: total, total }
        } else {
          // Undone card: current < total
          const total = Math.floor(Math.random() * 40) + 1
          const current = Math.floor(Math.random() * (total - 1)) + 1 // Ensure current < total
          return { current, total }
        }
      })(),
      sentDate: shuffledDates[Math.floor(Math.random() * shuffledDates.length)]
    }
  })
  
  // If count is not 8, use the old logic to ensure at least minDoneCards "Done" cards
  if (count !== 8) {
    let doneCount = randomized.filter(c => c.progress.current === c.progress.total).length
    let i = 0
    while (doneCount < minDoneCards && i < randomized.length) {
      const total = randomized[i].progress.total
      randomized[i].progress.current = total
      doneCount++
      i++
    }
  }
  
  // Shuffle the array to randomize the order
  return shuffleArray(randomized)
}

