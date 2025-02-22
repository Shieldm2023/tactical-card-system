import React, { useState, useEffect } from 'react';

const CardDrawingSystem = () => {
  const [cards, setCards] = useState([]);
  const [cardName, setCardName] = useState('');
  const [cardEffect, setCardEffect] = useState('');
  const [cardPrimaryEffect, setCardPrimaryEffect] = useState('');
  const [cardSecondaryEffect, setCardSecondaryEffect] = useState('');
  const [cardCount, setCardCount] = useState(1);
  const [deck, setDeck] = useState([]);
  const [hand, setHand] = useState([]);
  const [discardPile, setDiscardPile] = useState([]);
  const [drawnCard, setDrawnCard] = useState(null);
  const [drawHistory, setDrawHistory] = useState([]);

  // Default cards
  const defaultCards = [
    { name: "Vanguard Advance", count: 3, primaryEffect: "Units within 50ft of your front line can act", secondaryEffect: "If no units qualify, your furthest advanced unit(s) activates" },
    { name: "Rear Guard Maneuver", count: 3, primaryEffect: "Units at least 50ft from your front line can act", secondaryEffect: "If no units qualify, your unit(s) furthest from the front can activate" },
    { name: "Flanking Strike", count: 3, primaryEffect: "Units within 50 ft of either board edge can act", secondaryEffect: "If no units qualify, unit(s) with the lowest UC can act" },
    { name: "Central Command", count: 2, primaryEffect: "Units in the middle 100ft of your territory can act", secondaryEffect: "If no units qualify, your highest GP cost unit(s) can act" },
    { name: "Heavy Assault", count: 3, primaryEffect: "Units with melee attacks (WS) can act", secondaryEffect: "If no units qualify, your unit(s) with the highest AS skill can act" },
    { name: "Ranged Suppression", count: 3, primaryEffect: "Units with ranged attacks (BS) or (MS) can act", secondaryEffect: "If no units qualify, your unit(s) furthest from the enemy front can act" },
    { name: "Engaged Forces", count: 3, primaryEffect: "Units within 20ft of enemy units can act", secondaryEffect: "If no units qualify, unit(s) with highest TN can act" },
    { name: "Reserve Strike", count: 2, primaryEffect: "Units that did not attack last turn can act", secondaryEffect: "If all units attacked, unit(s) that have least wounds can act" },
    { name: "Wounded Response", count: 3, primaryEffect: "Units that were wounded last turn can act", secondaryEffect: "If no units qualify, unit(s) which were wounded last can act" },
    { name: "Forward Scouts", count: 2, primaryEffect: "Units that moved last turn can act", secondaryEffect: "If no units qualify, unit(s) with highest movement can act" },
    { name: "Defensive Formation", count: 3, primaryEffect: "Units in cover or adjacent to terrain features can act", secondaryEffect: "If no units qualify, unit(s) with highest AS can act" },
    { name: "Desperate Maneuver", count: 3, primaryEffect: "Units below 50% of their starting HP can act", secondaryEffect: "If no units qualify, unit(s) with the lowest HP can act" },
    { name: "Flexible Response", count: 3, primaryEffect: "Units that have not acted in your previous action can act", secondaryEffect: "If no units qualify, any two units of your choice can act" },
    { name: "Elite Operations", count: 2, primaryEffect: "Your three highest GP cost units can act", secondaryEffect: "If you have fewer than three units, all your units can act" },
    { name: "Rank and File", count: 2, primaryEffect: "All Tier 0 or Tier 1 units can act", secondaryEffect: "If no units qualify, your lowest GP cost unit(s) act" },
  ];

  // Initialize with default cards
  useEffect(() => {
    setCards(defaultCards);
  }, []);

  // Generate the full deck based on card definitions and counts
  useEffect(() => {
    let newDeck = [];
    cards.forEach(card => {
      for (let i = 0; i < card.count; i++) {
        newDeck.push({
          id: `${card.name}-${i}`,
          name: card.name,
          primaryEffect: card.primaryEffect || card.effect,
          secondaryEffect: card.secondaryEffect
        });
      }
    });
    setDeck(newDeck);
  }, [cards]);

  const addCard = () => {
    if (!cardName) return;
    
    setCards([
      ...cards,
      {
        name: cardName,
        effect: cardEffect,
        primaryEffect: cardPrimaryEffect || cardEffect,
        secondaryEffect: cardSecondaryEffect,
        count: parseInt(cardCount) || 1
      }
    ]);
    
    // Reset form
    setCardName('');
    setCardEffect('');
    setCardPrimaryEffect('');
    setCardSecondaryEffect('');
    setCardCount(1);
  };

  const removeCard = (index) => {
    const newCards = [...cards];
    newCards.splice(index, 1);
    setCards(newCards);
  };

  const shuffleDeck = () => {
    const shuffled = [...deck];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    setDeck(shuffled);
  };

  const drawCard = () => {
    if (deck.length === 0) {
      alert("The deck is empty. Add cards, reshuffle discarded cards, or reset the deck.");
      return;
    }
    
    const drawnCardIndex = Math.floor(Math.random() * deck.length);
    const drawn = deck[drawnCardIndex];
    
    // Remove the card from the deck
    const newDeck = [...deck];
    newDeck.splice(drawnCardIndex, 1);
    setDeck(newDeck);
    
    // Add card to hand
    setHand([...hand, drawn]);
    
    // Set the drawn card and add to history
    setDrawnCard(drawn);
    setDrawHistory([drawn, ...drawHistory]);
  };

  const playCard = (cardIndex) => {
    const playedCard = hand[cardIndex];
    
    // Remove from hand
    const newHand = [...hand];
    newHand.splice(cardIndex, 1);
    setHand(newHand);
    
    // Add to discard pile
    setDiscardPile([...discardPile, playedCard]);
  };

  const reshuffleDiscards = () => {
    if (discardPile.length === 0) {
      alert("No cards in discard pile to reshuffle.");
      return;
    }
    
    // Add discard pile back to deck and shuffle
    const newDeck = [...deck, ...discardPile];
    setDeck(newDeck);
    setDiscardPile([]);
    
    // Now shuffle
    const shuffled = [...newDeck];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    setDeck(shuffled);
  };

  const resetDeck = () => {
    // Rebuild the deck from card definitions
    let newDeck = [];
    cards.forEach(card => {
      for (let i = 0; i < card.count; i++) {
        newDeck.push({
          id: `${card.name}-${i}`,
          name: card.name,
          primaryEffect: card.primaryEffect || card.effect,
          secondaryEffect: card.secondaryEffect
        });
      }
    });
    setDeck(newDeck);
    setHand([]);
    setDiscardPile([]);
    setDrawnCard(null);
    setDrawHistory([]);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto bg-gray-50 rounded-lg shadow">
      <h1 className="text-2xl font-bold mb-6 text-center">Tactical Card System</h1>
      
      {/* Card Creation Form */}
      <div className="bg-white p-4 rounded-md shadow mb-6">
        <h2 className="text-lg font-medium mb-3">Add New Card</h2>
        <div className="flex flex-col md:flex-row gap-3 mb-3">
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1">Card Name</label>
            <input 
              type="text" 
              value={cardName} 
              onChange={(e) => setCardName(e.target.value)}
              className="w-full p-2 border rounded" 
              placeholder="Enter card name"
            />
          </div>
          <div className="w-20">
            <label className="block text-sm font-medium mb-1">Count</label>
            <input 
              type="number" 
              min="1"
              value={cardCount} 
              onChange={(e) => setCardCount(e.target.value)}
              className="w-full p-2 border rounded" 
            />
          </div>
        </div>
        <div className="mb-3">
          <label className="block text-sm font-medium mb-1">Primary Effect</label>
          <textarea 
            value={cardPrimaryEffect} 
            onChange={(e) => setCardPrimaryEffect(e.target.value)}
            className="w-full p-2 border rounded" 
            placeholder="Primary effect"
            rows="2"
          />
        </div>
        <div className="mb-3">
          <label className="block text-sm font-medium mb-1">Secondary Effect</label>
          <textarea 
            value={cardSecondaryEffect} 
            onChange={(e) => setCardSecondaryEffect(e.target.value)}
            className="w-full p-2 border rounded" 
            placeholder="Secondary effect"
            rows="2"
          />
        </div>
        <button 
          onClick={addCard}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Add Card
        </button>
      </div>
      
      {/* Game State Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-3 rounded-md shadow">
          <h3 className="font-medium mb-2">Deck</h3>
          <div className="text-2xl font-bold">{deck.length} cards</div>
        </div>
        <div className="bg-white p-3 rounded-md shadow">
          <h3 className="font-medium mb-2">Hand</h3>
          <div className="text-2xl font-bold">{hand.length} cards</div>
        </div>
        <div className="bg-white p-3 rounded-md shadow">
          <h3 className="font-medium mb-2">Discard Pile</h3>
          <div className="text-2xl font-bold">{discardPile.length} cards</div>
        </div>
      </div>
      
      {/* Deck Controls */}
      <div className="bg-white p-4 rounded-md shadow mb-6">
        <h2 className="text-lg font-medium mb-3">Deck Controls</h2>
        <div className="flex flex-wrap gap-3 mb-2">
          <button 
            onClick={shuffleDeck}
            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
            disabled={deck.length === 0}
          >
            Shuffle Deck
          </button>
          <button 
            onClick={drawCard}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            disabled={deck.length === 0}
          >
            Draw Card
          </button>
          <button 
            onClick={reshuffleDiscards}
            className="px-4 py-2 bg-amber-600 text-white rounded hover:bg-amber-700"
            disabled={discardPile.length === 0}
          >
            Reshuffle Discards
          </button>
          <button 
            onClick={resetDeck}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            Reset All
          </button>
        </div>
      </div>
      
      {/* Hand Display */}
      <div className="bg-white p-4 rounded-md shadow mb-6">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-lg font-medium">Your Hand</h2>
          <div className="text-sm text-gray-600">
            {hand.length} card{hand.length !== 1 ? 's' : ''} in hand
          </div>
        </div>
        
        {hand.length === 0 ? (
          <p className="text-gray-500 italic">Your hand is empty. Draw some cards!</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {hand.map((card, index) => (
              <div key={index} className="border rounded-md p-3 bg-gray-50 relative">
                <div className="font-bold text-lg mb-2">{card.name}</div>
                <div className="text-sm mb-2">
                  <div className="font-medium text-blue-700">Primary:</div>
                  <div>{card.primaryEffect}</div>
                </div>
                {card.secondaryEffect && (
                  <div className="text-sm mb-4">
                    <div className="font-medium text-blue-700">Secondary:</div>
                    <div>{card.secondaryEffect}</div>
                  </div>
                )}
                <button 
                  onClick={() => playCard(index)}
                  className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 mt-2"
                >
                  Play Card
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Discard Pile */}
      {discardPile.length > 0 && (
        <div className="bg-white p-4 rounded-md shadow mb-6">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-medium">Discard Pile</h2>
            <button 
              onClick={reshuffleDiscards}
              className="px-3 py-1 bg-amber-600 text-white text-sm rounded hover:bg-amber-700"
            >
              Reshuffle Into Deck
            </button>
          </div>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {discardPile.map((card, index) => (
              <div key={index} className="p-2 bg-gray-50 rounded border">
                <div className="font-medium">{card.name}</div>
                <div className="text-sm text-gray-600">
                  <span className="text-blue-600">Primary:</span> {card.primaryEffect}
                </div>
                {card.secondaryEffect && (
                  <div className="text-sm text-gray-600">
                    <span className="text-blue-600">Secondary:</span> {card.secondaryEffect}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Last Drawn Card */}
      {drawnCard && (
        <div className="bg-white p-4 rounded-md shadow mb-6 border-2 border-green-500">
          <h2 className="text-lg font-medium mb-3">Last Drawn Card</h2>
          <div className="p-4 bg-gray-100 rounded">
            <div className="font-bold text-xl mb-2">{drawnCard.name}</div>
            <div className="text-sm mb-2">
              <div className="font-medium text-blue-700">Primary:</div>
              <div className="text-gray-700">{drawnCard.primaryEffect}</div>
            </div>
            {drawnCard.secondaryEffect && (
              <div className="text-sm">
                <div className="font-medium text-blue-700">Secondary:</div>
                <div className="text-gray-700">{drawnCard.secondaryEffect}</div>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Card Library */}
      <div className="bg-white p-4 rounded-md shadow mb-6">
        <h2 className="text-lg font-medium mb-3">Card Library</h2>
        {cards.length === 0 ? (
          <p className="text-gray-500 italic">No cards defined yet</p>
        ) : (
          <div className="space-y-3">
            {cards.map((card, index) => (
              <div key={index} className="flex justify-between items-start border-b pb-2">
                <div>
                  <div className="font-medium">{card.name} <span className="text-sm text-gray-500">({card.count})</span></div>
                  <div className="text-sm text-gray-600">
                    <span className="text-blue-600">Primary:</span> {card.primaryEffect || card.effect}
                  </div>
                  {card.secondaryEffect && (
                    <div className="text-sm text-gray-600">
                      <span className="text-blue-600">Secondary:</span> {card.secondaryEffect}
                    </div>
                  )}
                </div>
                <button 
                  onClick={() => removeCard(index)}
                  className="text-red-600 hover:text-red-800"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Draw History */}
      {drawHistory.length > 0 && (
        <div className="bg-white p-4 rounded-md shadow">
          <h2 className="text-lg font-medium mb-3">Draw History</h2>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {drawHistory.map((card, index) => (
              <div key={index} className="p-2 bg-gray-50 rounded border">
                <div className="font-medium">{card.name}</div>
                <div className="text-sm text-gray-600">
                  <span className="text-blue-600">Primary:</span> {card.primaryEffect}
                </div>
                {card.secondaryEffect && (
                  <div className="text-sm text-gray-600">
                    <span className="text-blue-600">Secondary:</span> {card.secondaryEffect}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CardDrawingSystem;