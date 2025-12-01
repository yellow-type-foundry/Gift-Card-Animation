'use client'

import React from 'react'
import GiftCard from '@/components/GiftCard'
import SentCard from '@/components/SentCard'
import SentCard4 from '@/components/SentCard4'
import { LAYOUT_CONFIG } from '@/constants/sentCardConstants'

const GRID_GAP = '20px'

const CardGrid = ({
  activeTab,
  // Gift Received props
  cardStates,
  messages,
  boxPairs,
  cardHandlers,
  // Gift Sent props
  viewType,
  layoutNumber,
  useColoredBackground,
  animationType,
  enable3D,
  sentCards,
  mixedCardTypes,
  getSentCardProps,
  getSingle1Props,
  getSentCard4Props,
  layout2BoxType
}) => {
  if (activeTab === 'gift') {
    return (
      <div className="w-full">
        <div className="grid gift-card-grid" style={{ gap: GRID_GAP }}>
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
        <GiftCard
          state={cardStates.card2}
          from="Michael Chen"
          message={messages[1]}
          expiryText={cardStates.card2 === 'unopened' ? 'Expiring in 18 days' : undefined}
          giftTitle="Coffee Gift Set"
          giftSubtitle="Blue Bottle Coffee"
          boxImage={boxPairs[1].box1}
          box2Image={boxPairs[1].box2}
          onOpenGift={cardHandlers.card2}
        />
        <GiftCard
          state={cardStates.card3}
          from="Sarah Johnson"
          message={messages[2]}
          expiryText={cardStates.card3 === 'unopened' ? 'Expiring in 15 days' : undefined}
          giftTitle="Chocolate Box Collection"
          giftSubtitle="Godiva Chocolates"
          boxImage={boxPairs[2].box1}
          box2Image={boxPairs[2].box2}
          onOpenGift={cardHandlers.card3}
        />
        <GiftCard
          state={cardStates.card4}
          from="David Kim"
          message={messages[3]}
          expiryText={cardStates.card4 === 'unopened' ? 'Expiring in 30 days' : undefined}
          giftTitle="Gourmet Tea Selection"
          giftSubtitle="TWG Tea"
          boxImage={boxPairs[3].box1}
          box2Image={boxPairs[3].box2}
          onOpenGift={cardHandlers.card4}
        />
        <GiftCard
          state={cardStates.card5}
          from="Emily Rodriguez"
          message={messages[4]}
          expiryText={cardStates.card5 === 'unopened' ? 'Expiring in 12 days' : undefined}
          giftTitle="Artisan Cheese Board"
          giftSubtitle="Murray's Cheese"
          boxImage={boxPairs[4].box1}
          box2Image={boxPairs[4].box2}
          onOpenGift={cardHandlers.card5}
        />
        <GiftCard
          state={cardStates.card6}
          from="James Wilson"
          message={messages[5]}
          expiryText={cardStates.card6 === 'unopened' ? 'Expiring in 25 days' : undefined}
          giftTitle="Wine Collection"
          giftSubtitle="Napa Valley Wines"
          boxImage={boxPairs[5].box1}
          box2Image={boxPairs[5].box2}
          onOpenGift={cardHandlers.card6}
        />
        <GiftCard
          state={cardStates.card7}
          from="Olivia Martinez"
          message={messages[6]}
          expiryText={cardStates.card7 === 'unopened' ? 'Expiring in 7 days' : undefined}
          giftTitle="Spa Gift Certificate"
          giftSubtitle="Bliss Spa"
          boxImage={boxPairs[6].box1}
          box2Image={boxPairs[6].box2}
          onOpenGift={cardHandlers.card7}
        />
        <GiftCard
          state={cardStates.card8}
          from="Ryan Thompson"
          message={messages[7]}
          expiryText={cardStates.card8 === 'unopened' ? 'Expiring in 19 days' : undefined}
          giftTitle="Gourmet Chocolate Truffles"
          giftSubtitle="Vosges Haut-Chocolat"
          boxImage={boxPairs[7].box1}
          box2Image={boxPairs[7].box2}
          onOpenGift={cardHandlers.card8}
        />
        </div>
      </div>
    )
  }

  if (activeTab === 'sent') {
    return (
      <div className="w-full">
        <div className="grid gift-card-grid" style={{ gap: GRID_GAP }}>
          {viewType === 'mixed' && mixedCardTypes ? (
            // Mixed view: show both batch and single cards
            (() => {
              // Map layout number to single config key
              const singleConfigKey = `single${layoutNumber}`
              if (!LAYOUT_CONFIG[singleConfigKey]) {
                return (
                  <div className="col-span-full text-center text-[#525F7A] py-8">
                    No cards available for this layout
                  </div>
                )
              }
              return sentCards.map((card, index) => {
                const isBatch = mixedCardTypes[index]
                
                if (isBatch) {
                  return (
                    <SentCard
                      key={index}
                      {...getSentCardProps(card, layoutNumber, useColoredBackground, animationType, enable3D)}
                      layout2BoxType={layout2BoxType}
                    />
                  )
                } else {
                  // Single 1 uses SentCard (with gift container replacing envelope)
                  if (layoutNumber === '1') {
                    return (
                      <SentCard
                        key={index}
                        {...getSingle1Props(card, useColoredBackground, layoutNumber, animationType, enable3D)}
                      />
                    )
                  }
                  // Single 2 uses SentCard with envelope hidden (shows gift box)
                  if (layoutNumber === '2') {
                    return (
                      <SentCard
                        key={index}
                        {...getSentCardProps(card, layoutNumber, useColoredBackground, animationType, enable3D, true)}
                        hideEnvelope={true}
                        showGiftBoxWhenHidden={true}
                        layout2BoxType={layout2BoxType}
                      />
                    )
                  }
                  // Other single cards use SentCard4 (with gift container)
                  const props = getSentCard4Props(card, layoutNumber, useColoredBackground)
                  if (!props) return null
                  return (
                    <SentCard4
                      key={index}
                      {...props}
                    />
                  )
                }
              })
            })()
          ) : viewType === 'single' ? (
            // Single view: show only single cards
            (() => {
              // Single 2 (Layout 2) uses SentCard with single2 config (shows gift box)
              if (layoutNumber === '2') {
                return sentCards.map((card, index) => (
                  <SentCard
                    key={index}
                    {...getSentCardProps(card, layoutNumber, useColoredBackground, animationType, enable3D, true)}
                    hideEnvelope={true}
                    showGiftBoxWhenHidden={true}
                    layout2BoxType={layout2BoxType}
                  />
                ))
              }
              // Check if config exists for this layout
              const singleConfigKey = `single${layoutNumber}`
              if (!LAYOUT_CONFIG[singleConfigKey]) {
                return (
                  <div className="col-span-full text-center text-[#525F7A] py-8">
                    No cards available for this layout
                  </div>
                )
              }
              // Single 1 uses SentCard (with gift container replacing envelope)
              if (layoutNumber === '1') {
                return sentCards.map((card, index) => (
                  <SentCard
                    key={index}
                    {...getSingle1Props(card, useColoredBackground, layoutNumber)}
                  />
                ))
              }
              // Single 2 uses SentCard with envelope hidden (shows gift box)
              if (layoutNumber === '2') {
                return sentCards.map((card, index) => (
                  <SentCard
                    key={index}
                    {...getSentCardProps(card, layoutNumber, useColoredBackground, animationType, enable3D, true)}
                    hideEnvelope={true}
                    showGiftBoxWhenHidden={true}
                    layout2BoxType={layout2BoxType}
                  />
                ))
              }
              return sentCards.map((card, index) => {
                const props = getSentCard4Props(card, layoutNumber, useColoredBackground)
                if (!props) return null
                return (
                  <SentCard4
                    key={index}
                    {...props}
                  />
                )
              })
            })()
          ) : (
            // Batch view: show only batch cards
            sentCards.map((card, index) => (
              <SentCard
                key={index}
                {...getSentCardProps(card, layoutNumber, useColoredBackground, animationType)}
                layout2BoxType={layout2BoxType}
              />
            ))
          )}
        </div>
      </div>
    )
  }

  return null
}

export default React.memo(CardGrid)

