'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import GiftCard from '@/components/GiftCard'
import SentCard from '@/components/SentCard'

// Static data moved outside component to avoid recreation on every render
const ALL_BOX_PAIRS = [
  { box1: '/assets/Box 1/Box 01.png', box2: '/assets/Box 2/Box2-01.png' },
  { box1: '/assets/Box 1/Box 02.png', box2: '/assets/Box 2/Box2-02.png' },
  { box1: '/assets/Box 1/Box 03.png', box2: '/assets/Box 2/Box2-03.png' },
  { box1: '/assets/Box 1/Box 04.png', box2: '/assets/Box 2/Box2-04.png' },
  { box1: '/assets/Box 1/Box 05.png', box2: '/assets/Box 2/Box2-05.png' },
  { box1: '/assets/Box 1/Box 06.png', box2: '/assets/Box 2/Box2-06.png' }
]

const ALL_MESSAGES = [
  // Short messages
  'Thank you!',
  'Thanks!',
  'Much appreciated!',
  'You\'re the best!',
  'Grateful!',
  // Medium messages
  'Thank you for being such a great mentor!',
  'I really appreciate all your help and guidance!',
  'Thanks for everything you\'ve done for me!',
  'Your mentorship has been invaluable to me!',
  'Thank you for your patience and support!',
  'I\'m so grateful for your guidance!',
  'Your advice has been life-changing!',
  'Thank you for being an amazing mentor!',
  // Long messages
  'Thank you so much for all the time and effort you\'ve put into helping me grow and develop my skills. Your mentorship has truly made a difference in my career!',
  'I wanted to express my deepest gratitude for your unwavering support and guidance throughout this journey. Your wisdom and patience have been invaluable to me.',
  'Thank you for being such an incredible mentor and for always taking the time to help me understand complex concepts. Your dedication to my growth means the world to me!',
  'I cannot thank you enough for all the valuable lessons you\'ve taught me and for always being there when I needed guidance. Your mentorship has been transformative!',
  'Thank you for your endless patience, your insightful advice, and for believing in me even when I doubted myself. You\'ve made such a positive impact on my life!',
  'I am so grateful for your mentorship and for all the opportunities you\'ve given me to learn and grow. Thank you for being such an amazing teacher and guide!',
  'Thank you for taking the time to mentor me and for sharing your knowledge and experience. Your guidance has been instrumental in helping me achieve my goals!',
  'I wanted to thank you for being such a wonderful mentor and for always pushing me to be my best. Your support and encouragement have meant everything to me!'
]

// All cover images
const ALL_COVERS = [
  '/assets/covers/Birthday01.png',
  '/assets/covers/Birthday02.png',
  '/assets/covers/Birthday03.png',
  '/assets/covers/Birthday04.png',
  '/assets/covers/Birthday05.png',
  '/assets/covers/Birthday06.png',
  '/assets/covers/Congratulations01.png',
  '/assets/covers/Congratulations02.png',
  '/assets/covers/Congratulations03.png',
  '/assets/covers/Congratulations04.png',
  '/assets/covers/Congratulations05.png',
  '/assets/covers/Congratulations06.png',
  '/assets/covers/Congratulations07.png',
  '/assets/covers/Congratulations08.png',
  '/assets/covers/Congratulations09.png',
  '/assets/covers/Congratulations10.png',
  '/assets/covers/Congratulations11.png',
  '/assets/covers/Congratulations12.png',
  '/assets/covers/Congratulations13.png',
  '/assets/covers/Holiday 01.png',
  '/assets/covers/Holiday 02.png',
  '/assets/covers/Holiday 03.png',
  '/assets/covers/Holiday 04.png',
  '/assets/covers/Holiday 05.png',
  '/assets/covers/Holiday 06.png',
  '/assets/covers/Holiday 7.png',
  '/assets/covers/Holiday 8.png',
  '/assets/covers/Onboarding 03.png',
  '/assets/covers/Onboarding 04.png',
  '/assets/covers/Onboarding 05.png',
  '/assets/covers/Onboarding 06.png',
  '/assets/covers/Onboarding 07.png',
  '/assets/covers/Onboarding 08.png',
  '/assets/covers/Sales & Marketing 01.png',
  '/assets/covers/Sales & Marketing 02.png',
  '/assets/covers/Sales & Marketing 03.png',
  '/assets/covers/Sales & Marketing 04.png',
  '/assets/covers/Sales & Marketing 05.png',
  '/assets/covers/Sales & Marketing 06.png',
  '/assets/covers/Sales & Marketing 07.png',
  '/assets/covers/Sales & Marketing 08.png',
  '/assets/covers/Sales & Marketing 09.png',
  '/assets/covers/Thank you 01.png',
  '/assets/covers/Thank you 02.png',
  '/assets/covers/Thank you 03.png',
  '/assets/covers/Thank you 04.png',
  '/assets/covers/Thank you 05.png',
  '/assets/covers/Thank you 06 1.png',
  '/assets/covers/Workiversary01.png',
  '/assets/covers/Workiversary02.png',
  '/assets/covers/Workiversary03.png',
  '/assets/covers/Workiversary04.png',
  '/assets/covers/Workiversary05.png',
  '/assets/covers/Workiversary06.png',
  '/assets/covers/Workiversary07.png'
]

// SentCard data
const ALL_SENDERS = [
  'Jim Pfiffer', 'Sarah Johnson', 'Michael Chen', 'Emily Rodriguez',
  'David Kim', 'Olivia Martinez', 'James Wilson', 'Lisa Tran',
  'Ryan Thompson', 'Jessica Brown', 'Daniel Lee', 'Amanda White'
]

const ALL_TITLES = [
  'New Hires Onboarding', 'Birthday Celebration', 'Thank You', 'Workiversary Milestone',
  'Sales Achievement', 'Team Recognition', 'Congratulations', 'Holiday Greetings',
  'Project Success', 'Anniversary Special', 'Welcome Aboard', 'Appreciation Day'
]

const ALL_GIFT_TITLES = [
  "Holiday's sparkles", "Birthday Bundle", "Appreciation Gift", "Anniversary Special",
  "Thank You Collection", "Celebration Box", "Recognition Gift", "Welcome Package",
  "Achievement Award", "Milestone Gift", "Success Collection", "Gratitude Box"
]

const ALL_GIFT_SUBTITLES = [
  'Collection by Goody', 'Celebration Collection', 'Thank You Collection', 'Milestone Collection',
  'Recognition Series', 'Appreciation Line', 'Success Series', 'Welcome Collection',
  'Achievement Set', 'Holiday Collection', 'Gratitude Series', 'Special Edition'
]

const ALL_SENT_DATES = [
  '1 day ago', '2 days ago', '3 days ago', '4 days ago', '5 days ago',
  '1 week ago', '2 weeks ago', '3 weeks ago', '1 month ago'
]

// Helper function to shuffle array
const shuffleArray = (array) => {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

export default function Home() {
  const [activeTab, setActiveTab] = useState('gift') // 'gift' | 'sent'
  const [cardStates, setCardStates] = useState({
    card1: 'unopened',
    card2: 'unopened',
    card3: 'unopened',
    card4: 'unopened',
    card5: 'unopened',
    card6: 'unopened',
    card7: 'unopened',
    card8: 'unopened'
  })
  
  // Randomize box assignments on client-side only to avoid hydration mismatch
  // Start with default values to ensure server/client match, then randomize in useEffect
  const [boxPairs, setBoxPairs] = useState(() => {
    // Return default order for initial render (server and client will match)
    const selected = []
    for (let i = 0; i < 8; i++) {
      selected.push(ALL_BOX_PAIRS[i % ALL_BOX_PAIRS.length])
    }
    return selected
  })
  
  // Randomize messages with varying lengths
  const [messages, setMessages] = useState(() => {
    // Return first 8 messages for initial render (server and client will match)
    return ALL_MESSAGES.slice(0, 8)
  })
  
  // SentCard data state
  const [sentCards, setSentCards] = useState(() => {
    // Return default values for initial render (server and client will match)
    return Array(8).fill(null).map((_, i) => ({
      from: ALL_SENDERS[i % ALL_SENDERS.length],
      title: ALL_TITLES[i % ALL_TITLES.length],
      boxImage: ALL_COVERS[i % ALL_COVERS.length],
      giftTitle: ALL_GIFT_TITLES[i % ALL_GIFT_TITLES.length],
      giftSubtitle: ALL_GIFT_SUBTITLES[i % ALL_GIFT_SUBTITLES.length],
      progress: { current: (i % 3) + 1, total: (i % 3) + 4 },
      sentDate: ALL_SENT_DATES[i % ALL_SENT_DATES.length]
    }))
  })
  
  // Randomize data only on client side after hydration
  useEffect(() => {
    const shuffled = shuffleArray(ALL_BOX_PAIRS)
    const selected = []
    for (let i = 0; i < 8; i++) {
      selected.push(shuffled[i % shuffled.length])
    }
    setBoxPairs(shuffleArray(selected))
    setMessages(shuffleArray(ALL_MESSAGES).slice(0, 8))
    
    // Shuffle SentCard data
    const shuffledCovers = shuffleArray(ALL_COVERS)
    const shuffledSenders = shuffleArray(ALL_SENDERS)
    const shuffledTitles = shuffleArray(ALL_TITLES)
    const shuffledGiftTitles = shuffleArray(ALL_GIFT_TITLES)
    const shuffledGiftSubtitles = shuffleArray(ALL_GIFT_SUBTITLES)
    const shuffledDates = shuffleArray(ALL_SENT_DATES)
    
    const randomized = Array(8).fill(null).map(() => ({
        from: shuffledSenders[Math.floor(Math.random() * shuffledSenders.length)],
        title: shuffledTitles[Math.floor(Math.random() * shuffledTitles.length)],
        boxImage: shuffledCovers[Math.floor(Math.random() * shuffledCovers.length)],
        giftTitle: shuffledGiftTitles[Math.floor(Math.random() * shuffledGiftTitles.length)],
        giftSubtitle: shuffledGiftSubtitles[Math.floor(Math.random() * shuffledGiftSubtitles.length)],
        progress: (() => {
          const total = Math.floor(Math.random() * 40) + 1
          const current = Math.floor(Math.random() * total) + 1
          return { current, total }
        })(),
        sentDate: shuffledDates[Math.floor(Math.random() * shuffledDates.length)]
      }))
    // Ensure at least 2 "Done" cards (current === total)
    let doneCount = randomized.filter(c => c.progress.current === c.progress.total).length
    let i = 0
    while (doneCount < 2 && i < randomized.length) {
      const total = randomized[i].progress.total
      randomized[i].progress.current = total
      doneCount++
      i++
    }
    setSentCards(randomized)
  }, [])
  
  const handleOpenGift = useCallback((cardId) => {
    setCardStates(prev => ({
      ...prev,
      [cardId]: 'opening'
    }))
  }, [])
  
  // Memoize handlers for each card to prevent unnecessary re-renders
  const cardHandlers = useMemo(() => ({
    card1: () => handleOpenGift('card1'),
    card2: () => handleOpenGift('card2'),
    card3: () => handleOpenGift('card3'),
    card4: () => handleOpenGift('card4'),
    card5: () => handleOpenGift('card5'),
    card6: () => handleOpenGift('card6'),
    card7: () => handleOpenGift('card7'),
    card8: () => handleOpenGift('card8'),
  }), [handleOpenGift])
  
  return (
    <div className="min-h-screen bg-[#f0f1f5] flex items-start">
      <div 
        className="w-full px-[60px] md:px-[240px] py-10"
      >
        {/* Tabs */}
        <div className="w-full flex items-center justify-center gap-2 mb-6">
          <button
            onClick={() => setActiveTab('gift')}
            className={`px-3 py-1.5 rounded-[12px] outline outline-1 outline-offset-[-1px] ${activeTab==='gift' ? 'bg-white outline-zinc-300 text-black' : 'bg-[#f0f1f5] outline-zinc-200 text-[#525F7A]'}`}
          >
            Gift Card
          </button>
          <button
            onClick={() => setActiveTab('sent')}
            className={`px-3 py-1.5 rounded-[12px] outline outline-1 outline-offset-[-1px] ${activeTab==='sent' ? 'bg-white outline-zinc-300 text-black' : 'bg-[#f0f1f5] outline-zinc-200 text-[#525F7A]'}`}
          >
            Sent Card
          </button>
        </div>
        {/* Content */}
        {activeTab === 'gift' ? (
          <div className="grid gift-card-grid gap-[24px]">
            {/* Card 1 - Original */}
            <GiftCard
              state={cardStates.card1}
              from="Lisa Tran"
              message={messages[0]}
              expiryText={cardStates.card1 === 'unopened' ? 'Expiring in 21 days' : undefined}
              giftTitle="24 Pack of Cookies"
              giftSubtitle="Levain Cookies"
              boxImage={boxPairs[0].box1}
              box2Image={boxPairs[0].box2}
              onOpenGift={cardHandlers.card1}
            />
            {/* Card 2 */}
            <GiftCard state={cardStates.card2} from="Michael Chen" message={messages[1]} expiryText={cardStates.card2 === 'unopened' ? 'Expiring in 18 days' : undefined} giftTitle="Coffee Gift Set" giftSubtitle="Blue Bottle Coffee" boxImage={boxPairs[1].box1} box2Image={boxPairs[1].box2} onOpenGift={cardHandlers.card2} />
            {/* Card 3 */}
            <GiftCard state={cardStates.card3} from="Sarah Johnson" message={messages[2]} expiryText={cardStates.card3 === 'unopened' ? 'Expiring in 15 days' : undefined} giftTitle="Chocolate Box Collection" giftSubtitle="Godiva Chocolates" boxImage={boxPairs[2].box1} box2Image={boxPairs[2].box2} onOpenGift={cardHandlers.card3} />
            {/* Card 4 */}
            <GiftCard state={cardStates.card4} from="David Kim" message={messages[3]} expiryText={cardStates.card4 === 'unopened' ? 'Expiring in 30 days' : undefined} giftTitle="Gourmet Tea Selection" giftSubtitle="TWG Tea" boxImage={boxPairs[3].box1} box2Image={boxPairs[3].box2} onOpenGift={cardHandlers.card4} />
            {/* Card 5 */}
            <GiftCard state={cardStates.card5} from="Emily Rodriguez" message={messages[4]} expiryText={cardStates.card5 === 'unopened' ? 'Expiring in 12 days' : undefined} giftTitle="Artisan Cheese Board" giftSubtitle="Murray's Cheese" boxImage={boxPairs[4].box1} box2Image={boxPairs[4].box2} onOpenGift={cardHandlers.card5} />
            {/* Card 6 */}
            <GiftCard state={cardStates.card6} from="James Wilson" message={messages[5]} expiryText={cardStates.card6 === 'unopened' ? 'Expiring in 25 days' : undefined} giftTitle="Wine Collection" giftSubtitle="Napa Valley Wines" boxImage={boxPairs[5].box1} box2Image={boxPairs[5].box2} onOpenGift={cardHandlers.card6} />
            {/* Card 7 */}
            <GiftCard state={cardStates.card7} from="Olivia Martinez" message={messages[6]} expiryText={cardStates.card7 === 'unopened' ? 'Expiring in 7 days' : undefined} giftTitle="Spa Gift Certificate" giftSubtitle="Bliss Spa" boxImage={boxPairs[6].box1} box2Image={boxPairs[6].box2} onOpenGift={cardHandlers.card7} />
            {/* Card 8 */}
            <GiftCard state={cardStates.card8} from="Ryan Thompson" message={messages[7]} expiryText={cardStates.card8 === 'unopened' ? 'Expiring in 19 days' : undefined} giftTitle="Gourmet Chocolate Truffles" giftSubtitle="Vosges Haut-Chocolat" boxImage={boxPairs[7].box1} box2Image={boxPairs[7].box2} onOpenGift={cardHandlers.card8} />
          </div>
        ) : (
          <div className="grid gift-card-grid gap-[24px]">
            {sentCards.map((card, index) => (
              <SentCard
                key={index}
                from={card.from}
                title={card.title}
                boxImage={card.boxImage}
                giftTitle={card.giftTitle}
                giftSubtitle={card.giftSubtitle}
                progress={card.progress}
                sentDate={card.sentDate}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

