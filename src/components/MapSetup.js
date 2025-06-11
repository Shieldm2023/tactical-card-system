import React, { useState, useCallback, useEffect } from 'react';
import { ChevronRight, Sword, Shield, Target, Users, Zap, Move, Plus, Play, RotateCcw } from 'lucide-react';

const SquadTacticsGame = () => {
  // Game state
  const [gamePhase, setGamePhase] = useState('setup'); // setup, deployment, battle
  const [currentPlayer, setCurrentPlayer] = useState(1);
  const [turn, setTurn] = useState(1);
  const [actionCount, setActionCount] = useState(0);
  const [selectedSquad, setSelectedSquad] = useState(null);
  const [selectedTile, setSelectedTile] = useState(null);
  const [actionMode, setActionMode] = useState('move'); // move, attack, recruit
  
  // Board setup - 40x80 grid
  const BOARD_WIDTH = 40;
  const BOARD_HEIGHT = 20; // Reduced for better display
  
  // Game configuration
  const [gameConfig, setGameConfig] = useState({
    influence: 0, // -10 to +10
    escalation: 1.0, // 0.5x to 2x
    totalBudget: 20000,
    deploymentBudget: 8000
  });
  
  // Player data
  const [players, setPlayers] = useState({
    1: {
      name: 'Player 1',
      territory: 'bottom',
      squads: [],
      reserves: [],
      budget: 8000,
      activationCards: 5,
      isDefender: false
    },
    2: {
      name: 'Player 2', 
      territory: 'top',
      squads: [],
      reserves: [],
      budget: 8000,
      activationCards: 5,
      isDefender: true
    }
  });
  
  // Squad templates
  const squadTemplates = {
    infantry: {
      name: 'Infantry Squad',
      cost: 1500,
      uc: 6, // Unit Count
      str: 2, // Strength
      tn: 4, // Toughness Number
      ap: 1, // Armor Points
      will: 3, // Will Save
      acr: null, // Accuracy (null for melee)
      movement: 3,
      range: 1,
      type: 'melee'
    },
    rangers: {
      name: 'Rangers',
      cost: 2000,
      uc: 4,
      str: 1,
      tn: 3,
      ap: 0,
      will: 4,
      acr: 4,
      movement: 4,
      range: 6,
      type: 'ranged'
    },
    heavyInfantry: {
      name: 'Heavy Infantry',
      cost: 2500,
      uc: 4,
      str: 3,
      tn: 5,
      ap: 2,
      will: 4,
      movement: 2,
      range: 1,
      type: 'melee'
    }
  };
  
  // Initialize board
  const [board, setBoard] = useState(() => {
    const newBoard = Array(BOARD_HEIGHT).fill(null).map(() => Array(BOARD_WIDTH).fill(null));
    return newBoard;
  });
  
  // Helper functions
  const getTileOwner = (row, col) => {
    if (row < BOARD_HEIGHT / 3) return 2; // Top third - Player 2
    if (row > (2 * BOARD_HEIGHT) / 3) return 1; // Bottom third - Player 1
    return 0; // Middle - No Man's Land
  };
  
  const isValidDeployment = (row, col, player) => {
    const owner = getTileOwner(row, col);
    if (owner !== player) return false;
    
    // Check minimum distance from front
    if (gamePhase === 'deployment') {
      if (player === 1 && row < BOARD_HEIGHT - 7) return false; // Bottom 7 rows
      if (player === 2 && row > 6) return false; // Top 7 rows
    }
    
    return !board[row][col]; // Must be empty
  };
  
  const isValidMove = (fromRow, fromCol, toRow, toCol, squad) => {
    if (!squad) return false;
    const distance = Math.abs(toRow - fromRow) + Math.abs(toCol - fromCol);
    return distance <= squad.movement && !board[toRow][toCol];
  };
  
  const calculateAttackDice = (uc) => {
    return Math.min(4, Math.max(1, Math.ceil(uc / 2)));
  };
  
  const rollDice = (count) => {
    return Array(count).fill(0).map(() => Math.floor(Math.random() * 6) + 1);
  };
  
  // Squad management
  const deploySquad = (template, row, col) => {
    if (!isValidDeployment(row, col, currentPlayer)) return false;
    
    const newSquad = {
      ...template,
      id: Date.now() + Math.random(),
      player: currentPlayer,
      row,
      col,
      currentUC: template.uc,
      currentAP: template.ap,
      currentSTR: template.str,
      activated: false
    };
    
    const newBoard = [...board];
    newBoard[row][col] = newSquad;
    setBoard(newBoard);
    
    setPlayers(prev => ({
      ...prev,
      [currentPlayer]: {
        ...prev[currentPlayer],
        squads: [...prev[currentPlayer].squads, newSquad],
        budget: prev[currentPlayer].budget - template.cost
      }
    }));
    
    return true;
  };
  
  const moveSquad = (squad, toRow, toCol) => {
    if (!isValidMove(squad.row, squad.col, toRow, toCol, squad)) return false;
    
    const newBoard = [...board];
    newBoard[squad.row][squad.col] = null;
    newBoard[toRow][toCol] = { ...squad, row: toRow, col: toCol };
    setBoard(newBoard);
    
    setPlayers(prev => ({
      ...prev,
      [squad.player]: {
        ...prev[squad.player],
        squads: prev[squad.player].squads.map(s => 
          s.id === squad.id ? { ...s, row: toRow, col: toCol } : s
        )
      }
    }));
    
    return true;
  };
  
  // Combat system
  const resolveCombat = (attacker, defender) => {
    const attackerDice = calculateAttackDice(attacker.currentUC);
    const defenderDice = calculateAttackDice(defender.currentUC);
    
    const attackRolls = rollDice(attackerDice);
    const defenderRolls = rollDice(defenderDice);
    
    // Apply STR bonus to attacker
    let attackHits = 0;
    attackRolls.forEach(roll => {
      const modifiedRoll = roll + attacker.currentSTR;
      if (modifiedRoll >= defender.tn) {
        attackHits += modifiedRoll >= defender.tn * 2 ? 2 : 1;
      }
    });
    
    // Apply AP defense
    const finalAttackHits = Math.max(0, attackHits - defender.currentAP);
    
    // Defender counter-attack
    let defenderHits = 0;
    defenderRolls.forEach(roll => {
      if (roll >= attacker.tn) {
        defenderHits += roll >= attacker.tn * 2 ? 2 : 1;
      }
    });
    
    const finalDefenderHits = Math.max(0, defenderHits - attacker.currentAP);
    
    return {
      attackerHits: finalAttackHits,
      defenderHits: finalDefenderHits,
      attackRolls,
      defenderRolls
    };
  };
  
  // Event handlers
  const handleTileClick = (row, col) => {
    const tile = board[row][col];
    
    if (gamePhase === 'deployment') {
      if (selectedSquad && !tile) {
        deploySquad(selectedSquad, row, col);
        setSelectedSquad(null);
      }
    } else if (gamePhase === 'battle') {
      if (!selectedSquad && tile && tile.player === currentPlayer) {
        setSelectedSquad(tile);
        setSelectedTile({ row, col });
      } else if (selectedSquad && selectedTile) {
        if (actionMode === 'move' && !tile) {
          moveSquad(selectedSquad, row, col);
          setSelectedSquad(null);
          setSelectedTile(null);
        } else if (actionMode === 'attack' && tile && tile.player !== currentPlayer) {
          // Handle attack
          const combat = resolveCombat(selectedSquad, tile);
          console.log('Combat result:', combat);
          setSelectedSquad(null);
          setSelectedTile(null);
        }
      }
    }
  };
  
  const nextTurn = () => {
    if (actionCount >= 2) {
      setCurrentPlayer(currentPlayer === 1 ? 2 : 1);
      setActionCount(0);
      if (currentPlayer === 2) {
        setTurn(turn + 1);
      }
    } else {
      setActionCount(actionCount + 1);
    }
  };
  
  const startBattle = () => {
    setGamePhase('battle');
    setCurrentPlayer(players[1].isDefender ? 2 : 1);
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-4">
      {/* Header */}
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 mb-6 border border-slate-700">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Squad Tactics
          </h1>
          <div className="flex items-center gap-4">
            <div className="text-sm bg-slate-700 px-3 py-1 rounded-full">
              Phase: <span className="capitalize font-semibold">{gamePhase}</span>
            </div>
            <div className="text-sm bg-slate-700 px-3 py-1 rounded-full">
              Turn: {turn}
            </div>
            <div className="text-sm bg-slate-700 px-3 py-1 rounded-full">
              Actions: {actionCount}/3
            </div>
          </div>
        </div>
        
        {/* Player Status */}
        <div className="grid grid-cols-2 gap-4">
          {Object.entries(players).map(([id, player]) => (
            <div 
              key={id}
              className={`p-4 rounded-lg border-2 transition-all ${
                currentPlayer == id 
                  ? 'border-blue-400 bg-blue-400/10' 
                  : 'border-slate-600 bg-slate-700/30'
              }`}
            >
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-semibold">{player.name}</h3>
                <div className="flex gap-2">
                  {player.isDefender && <Shield className="w-4 h-4 text-green-400" />}
                  <Users className="w-4 h-4" />
                  <span className="text-sm">{player.squads.length}</span>
                </div>
              </div>
              <div className="text-sm text-slate-300">
                Budget: {player.budget}GP | Cards: {player.activationCards}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="flex gap-6">
        {/* Game Board */}
        <div className="flex-1">
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
            <div className="grid gap-1 p-4 bg-slate-900/50 rounded-lg" 
                 style={{ gridTemplateColumns: `repeat(${BOARD_WIDTH}, 1fr)` }}>
              {Array(BOARD_HEIGHT).fill(null).map((_, row) =>
                Array(BOARD_WIDTH).fill(null).map((_, col) => {
                  const tile = board[row][col];
                  const owner = getTileOwner(row, col);
                  const isSelected = selectedTile?.row === row && selectedTile?.col === col;
                  
                  return (
                    <div
                      key={`${row}-${col}`}
                      className={`w-4 h-4 border border-slate-600 cursor-pointer transition-all hover:scale-110 ${
                        owner === 1 ? 'bg-blue-900/30' :
                        owner === 2 ? 'bg-red-900/30' :
                        'bg-slate-700/30'
                      } ${
                        tile ? 'bg-yellow-500' : ''
                      } ${
                        isSelected ? 'ring-2 ring-blue-400' : ''
                      }`}
                      onClick={() => handleTileClick(row, col)}
                      title={tile ? `${tile.name} (${tile.currentUC}/${tile.uc})` : `${row},${col}`}
                    />
                  );
                })
              )}
            </div>
          </div>
        </div>
        
        {/* Side Panel */}
        <div className="w-80 space-y-6">
          {/* Squad Templates */}
          {gamePhase === 'deployment' && (
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
              <h3 className="text-xl font-semibold mb-4">Deploy Squads</h3>
              <div className="space-y-3">
                {Object.entries(squadTemplates).map(([key, template]) => (
                  <div
                    key={key}
                    className={`p-3 rounded-lg border cursor-pointer transition-all ${
                      selectedSquad?.name === template.name
                        ? 'border-blue-400 bg-blue-400/10'
                        : 'border-slate-600 bg-slate-700/30 hover:bg-slate-600/50'
                    }`}
                    onClick={() => setSelectedSquad(template)}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-medium">{template.name}</h4>
                      <span className="text-sm text-yellow-400">{template.cost}GP</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-xs text-slate-300">
                      <div>UC: {template.uc}</div>
                      <div>STR: {template.str}</div>
                      <div>TN: {template.tn}+</div>
                      <div>AP: {template.ap}</div>
                      <div>Will: {template.will}+</div>
                      <div>Move: {template.movement}</div>
                    </div>
                  </div>
                ))}
              </div>
              
              {gamePhase === 'deployment' && (
                <button
                  onClick={startBattle}
                  className="w-full mt-4 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 px-4 py-2 rounded-lg font-semibold transition-all flex items-center justify-center gap-2"
                >
                  <Play className="w-4 h-4" />
                  Start Battle
                </button>
              )}
            </div>
          )}
          
          {/* Battle Actions */}
          {gamePhase === 'battle' && (
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
              <h3 className="text-xl font-semibold mb-4">Actions</h3>
              <div className="space-y-3">
                <button
                  onClick={() => setActionMode('move')}
                  className={`w-full p-3 rounded-lg border transition-all flex items-center gap-3 ${
                    actionMode === 'move'
                      ? 'border-blue-400 bg-blue-400/10'
                      : 'border-slate-600 bg-slate-700/30 hover:bg-slate-600/50'
                  }`}
                >
                  <Move className="w-5 h-5" />
                  Position
                </button>
                <button
                  onClick={() => setActionMode('attack')}
                  className={`w-full p-3 rounded-lg border transition-all flex items-center gap-3 ${
                    actionMode === 'attack'
                      ? 'border-red-400 bg-red-400/10'
                      : 'border-slate-600 bg-slate-700/30 hover:bg-slate-600/50'
                  }`}
                >
                  <Sword className="w-5 h-5" />
                  Attack
                </button>
                <button
                  onClick={() => setActionMode('recruit')}
                  className={`w-full p-3 rounded-lg border transition-all flex items-center gap-3 ${
                    actionMode === 'recruit'
                      ? 'border-green-400 bg-green-400/10'
                      : 'border-slate-600 bg-slate-700/30 hover:bg-slate-600/50'
                  }`}
                >
                  <Plus className="w-5 h-5" />
                  Recruit
                </button>
              </div>
              
              <button
                onClick={nextTurn}
                className="w-full mt-4 bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 px-4 py-2 rounded-lg font-semibold transition-all flex items-center justify-center gap-2"
              >
                <ChevronRight className="w-4 h-4" />
                Next Action
              </button>
            </div>
          )}
          
          {/* Selected Squad Info */}
          {selectedSquad && (
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
              <h3 className="text-xl font-semibold mb-4">Squad Details</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Name:</span>
                  <span className="font-semibold">{selectedSquad.name}</span>
                </div>
                <div className="flex justify-between">
                  <span>Units:</span>
                  <span>{selectedSquad.currentUC || selectedSquad.uc}/{selectedSquad.uc}</span>
                </div>
                <div className="flex justify-between">
                  <span>Strength:</span>
                  <span>+{selectedSquad.currentSTR || selectedSquad.str}</span>
                </div>
                <div className="flex justify-between">
                  <span>Toughness:</span>
                  <span>{selectedSquad.tn}+</span>
                </div>
                <div className="flex justify-between">
                  <span>Armor:</span>
                  <span>{selectedSquad.currentAP || selectedSquad.ap}</span>
                </div>
                <div className="flex justify-between">
                  <span>Movement:</span>
                  <span>{selectedSquad.movement}</span>
                </div>
                <div className="flex justify-between">
                  <span>Range:</span>
                  <span>{selectedSquad.range}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SquadTacticsGame;