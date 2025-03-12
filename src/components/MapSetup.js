import React, { useState, useEffect } from 'react';

const BattleSetup = () => {
  // State for setup configuration
  const [setupMode, setSetupMode] = useState('preset'); // 'preset' or 'custom'
  const [escalation, setEscalation] = useState(1);
  const [influenceBalance, setInfluenceBalance] = useState(50); // 0-100 where 50 is equal
  const [selectedPreset, setSelectedPreset] = useState('');
  const [selectedTool, setSelectedTool] = useState(null);
  
  // Grid configuration - fixed to match game specs
  // 400ft width / 5ft = 80 squares width
  // 200ft height / 5ft = 40 squares height
  const gridWidth = 80; // 400ft / 5ft = 80 squares
  const gridHeight = 40; // 200ft / 5ft = 40 squares
  
  // Territory definitions
  // Attacker: left 100ft (20 columns)
  // Defender: right 100ft (20 columns)
  // No Man's Land: middle 200ft (40 columns)
  const attackerCols = 20; // 100ft / 5ft = 20 squares
  const defenderCols = 20; // 100ft / 5ft = 20 squares
  
  // State for grid tiles
  const [grid, setGrid] = useState([]);
  
  // Available terrain and strategic points
  const tools = {
    terrainTools: [
      { id: 'difficult', name: 'Difficult Terrain', color: '#007577', backgroundColor: '#4a94c3',
        backgroundImage: 'linear-gradient(135deg, rgba(74, 148, 195, 0.8) 0%, rgba(58, 125, 165, 0.9) 50%, rgba(74, 148, 195, 0.8) 100%)',
        border: '1px solid #3a7da5',
        opacity: 0.9 },
      { id: 'high', name: 'High Ground', color: '#a87e54' },
      { id: 'light-cover', name: 'Light Cover', color: '#568b22' },
      { id: 'full-cover', name: 'Full Cover', color: '#013220' },
    ],
    strategicTools: [
      { id: 'command', name: 'Command Point', color: '#d4af37', boxShadow: 'inset 0 0 3px #fff',
        border: '1px solid #a07c15',
        backgroundImage: 'radial-gradient(circle, #f6d365 0%, #d4af37 70%)' },
      { id: 'supply', name: 'Supply Line', color: '#3a9c35',boxShadow: 'inset 0 0 2px #fff',
        border: '1px solid #287525',
        backgroundImage: 'radial-gradient(circle, #5ac054 0%, #3a9c35 70%)' },
      { id: 'vantage', name: 'Vantage Point', color: '#3a78c6',boxShadow: 'inset 0 0 2px #fff',
        border: '1px solid #285896',
        backgroundImage: 'radial-gradient(circle, #609fea 0%, #3a78c6 70%)' },
    ],
    eraser: { id: 'eraser', name: 'Eraser', color: '#ffffff' }
  };

  // Preset maps
  const presetMaps = [
    { id: 'river-crossing', name: 'River Crossing' },
    { id: 'mountain-pass', name: 'Mountain Pass' },
    { id: 'forest-clearing', name: 'Forest Clearing' },
  ];

  // Initialize grid
  useEffect(() => {
    initializeGrid();
  }, []);

  const initializeGrid = () => {
    const newGrid = [];
    
    for (let y = 0; y < gridHeight; y++) {
      const row = [];
      for (let x = 0; x < gridWidth; x++) {
        // Determine zone based on column position
        let zone = 'neutral';
        
        if (x < attackerCols) {
          zone = 'attacker'; // Leftmost 20 columns (100ft) is attacker territory
        } else if (x >= gridWidth - defenderCols) {
          zone = 'defender'; // Rightmost 20 columns (100ft) is defender territory
        } else {
          zone = 'neutral'; // Middle 40 columns (200ft) is no man's land
        }
        
        row.push({
          x,
          y,
          zone,
          terrain: null,
          strategicPoint: null
        });
      }
      newGrid.push(row);
    }
    setGrid(newGrid);
  };

  // Load preset map
  const loadPresetMap = (presetId) => {
    setSelectedPreset(presetId);
    
    // Clear current grid
    const newGrid = [];
  
    for (let y = 0; y < gridHeight; y++) {
      const row = [];
      for (let x = 0; x < gridWidth; x++) {
        // Determine zone based on column position
        let zone = 'neutral';
        
        if (x < attackerCols) {
          zone = 'attacker'; // Leftmost 20 columns (100ft) is attacker territory
        } else if (x >= gridWidth - defenderCols) {
          zone = 'defender'; // Rightmost 20 columns (100ft) is defender territory
        } else {
          zone = 'neutral'; // Middle 40 columns (200ft) is no man's land
        }
        
        row.push({
          x,
          y,
          zone,
          terrain: null,
          strategicPoint: null
        });
      }
      newGrid.push(row);
    }
    
    if (presetId === 'river-crossing') {
        // Create a winding river across the map
        const riverPoints = [
          { x: 0, y: 25 },
          { x: 15, y: 22 },
          { x: 30, y: 20 },
          { x: 45, y: 18 },
          { x: 60, y: 22 },
          { x: 80, y: 24 }
        ];
        
        // Generate a path along the river course
        for (let i = 0; i < riverPoints.length - 1; i++) {
          const start = riverPoints[i];
          const end = riverPoints[i + 1];
          
          // Linear interpolation between points
          const distance = Math.max(
            Math.abs(end.x - start.x),
            Math.abs(end.y - start.y)
          );
          
          for (let step = 0; step <= distance; step++) {
            const x = Math.round(start.x + (end.x - start.x) * (step / distance));
            const y = Math.round(start.y + (end.y - start.y) * (step / distance));
            
            // Create river width (variable width for natural look)
            const width = 3 + Math.floor(Math.random() * 2); // 3-4 squares wide
            
            for (let w = -width; w <= width; w++) {
              const riverY = y + w;
              if (riverY >= 0 && riverY < gridHeight && x >= 0 && x < gridWidth) {
                newGrid[riverY][x].terrain = 'difficult';
              }
            }
          }
        }
        
        // Add a bridge across the river (around the middle)
        const bridgeX = 40;
        const bridgeY = 19;
        const bridgeWidth = 4;
        
        for (let x = bridgeX - 1; x <= bridgeX + 1; x++) {
          for (let y = bridgeY - bridgeWidth; y <= bridgeY + bridgeWidth; y++) {
            if (y >= 0 && y < gridHeight && x >= 0 && x < gridWidth) {
              newGrid[y][x].terrain = null;
            }
          }
        }
        
        // Add some light cover near the river banks
        for (let i = 0; i < riverPoints.length - 1; i++) {
          const start = riverPoints[i];
          const end = riverPoints[i + 1];
          
          const distance = Math.max(
            Math.abs(end.x - start.x),
            Math.abs(end.y - start.y)
          );
          
          for (let step = 0; step <= distance; step += 5) { // Scattered vegetation
            const x = Math.round(start.x + (end.x - start.x) * (step / distance));
            const y = Math.round(start.y + (end.y - start.y) * (step / distance));
            
            // Place vegetation along banks
            const bankWidth = 6;
            for (let w = -bankWidth; w <= bankWidth; w += 2) {
              if (Math.abs(w) > 4) { // Only on the outer banks
                const vegY = y + w;
                const vegX = x + Math.floor(Math.random() * 3) - 1;
                
                if (vegY >= 0 && vegY < gridHeight && vegX >= 0 && vegX < gridWidth && 
                    !newGrid[vegY][vegX].terrain) {
                  if (Math.random() < 0.4) {
                    newGrid[vegY][vegX].terrain = 'light-cover';
                  }
                }
              }
            }
          }
        }
        
        // Add strategic points
        // Command point on the bridge
        newGrid[bridgeY][bridgeX].strategicPoint = 'command';
        
        // Supply lines on either side
        newGrid[10][15].strategicPoint = 'supply';
        newGrid[30][15].strategicPoint = 'supply';
        newGrid[10][65].strategicPoint = 'supply';
        newGrid[30][65].strategicPoint = 'supply';
        
        // Vantage points overlooking the river
        const vantagePoints = [
          { x: 25, y: 10 },
          { x: 55, y: 10 },
          { x: 25, y: 30 },
          { x: 55, y: 30 }
        ];
        
        vantagePoints.forEach(point => {
          if (point.y >= 0 && point.y < gridHeight && point.x >= 0 && point.x < gridWidth) {
            newGrid[point.y][point.x].strategicPoint = 'vantage';
          }
        });
      }
      
      else if (presetId === 'mountain-pass') {
        // Create jagged mountain terrain on both sides with a valley in the middle
        
        // Helper function to create jagged mountain shapes
        const createMountains = (startX, endX, noiseLevel = 3) => {
          // Create the base mountain range
          for (let x = startX; x < endX; x++) {
            // Base mountain height (taller at edges, lower in middle)
            let baseHeight = 35;
            
            // Distance from center of mountain range
            const center = (startX + endX) / 2;
            const distFromCenter = Math.abs(x - center);
            const rangeWidth = (endX - startX) / 2;
            
            // Height varies based on position - taller at edges
            baseHeight -= Math.floor((rangeWidth - distFromCenter) / rangeWidth * 15);
            
            // Add jagged noise
            const noise = Math.floor(Math.random() * noiseLevel);
            baseHeight -= noise;
            
            for (let y = baseHeight; y < gridHeight; y++) {
              if (y >= 0 && y < gridHeight && x >= 0 && x < gridWidth) {
                newGrid[y][x].terrain = 'high';
              }
            }
          }
          
          // Add rocky outcroppings and variations
          for (let i = 0; i < 10; i++) {
            const outcroppingX = startX + Math.floor(Math.random() * (endX - startX));
            const outcroppingY = 10 + Math.floor(Math.random() * 20);
            const size = 1 + Math.floor(Math.random() * 3);
            
            for (let x = outcroppingX - size; x <= outcroppingX + size; x++) {
              for (let y = outcroppingY - size; y <= outcroppingY + size; y++) {
                // Use distance from center to create circular outcroppings
                const distance = Math.sqrt(
                  Math.pow(x - outcroppingX, 2) + Math.pow(y - outcroppingY, 2)
                );
                
                if (distance <= size && y >= 0 && y < gridHeight && x >= 0 && x < gridWidth) {
                  newGrid[y][x].terrain = 'high';
                }
              }
            }
          }
        };
        
        // Create mountains on left side
        createMountains(0, 15);
        
        // Create mountains on right side  
        createMountains(65, 80);
        
        // Add scattered rocky terrain in the valley
        for (let i = 0; i < 20; i++) {
          const rockX = 20 + Math.floor(Math.random() * 40);
          const rockY = 5 + Math.floor(Math.random() * 30);
          const size = Math.floor(Math.random() * 2);
          
          for (let x = rockX - size; x <= rockX + size; x++) {
            for (let y = rockY - size; y <= rockY + size; y++) {
              if (y >= 0 && y < gridHeight && x >= 0 && x < gridWidth && Math.random() < 0.7) {
                if (Math.random() < 0.6) {
                  newGrid[y][x].terrain = 'light-cover';
                } else {
                  newGrid[y][x].terrain = 'full-cover';
                }
              }
            }
          }
        }
        
        // Create a winding path through the valley
        const pathPoints = [
          { x: 25, y: 0 },
          { x: 30, y: 10 },
          { x: 40, y: 20 },
          { x: 50, y: 30 },
          { x: 55, y: 39 }
        ];
        
        for (let i = 0; i < pathPoints.length - 1; i++) {
          const start = pathPoints[i];
          const end = pathPoints[i + 1];
          
          const distance = Math.max(
            Math.abs(end.x - start.x),
            Math.abs(end.y - start.y)
          );
          
          for (let step = 0; step <= distance; step++) {
            const x = Math.round(start.x + (end.x - start.x) * (step / distance));
            const y = Math.round(start.y + (end.y - start.y) * (step / distance));
            
            // Create path width
            const width = 2;
            
            for (let w = -width; w <= width; w++) {
              for (let h = -width; h <= width; h++) {
                const pathY = y + h;
                const pathX = x + w;
                if (pathY >= 0 && pathY < gridHeight && pathX >= 0 && pathX < gridWidth) {
                  // Clear any terrain on the path
                  newGrid[pathY][pathX].terrain = null;
                }
              }
            }
          }
        }
        
        // Add strategic points
        // Command points along the path
        newGrid[10][30].strategicPoint = 'command';
        newGrid[30][40].strategicPoint = 'command';
        
        // Vantage points on mountains
        newGrid[5][10].strategicPoint = 'vantage';
        newGrid[5][70].strategicPoint = 'vantage';
        newGrid[25][10].strategicPoint = 'vantage';
        newGrid[25][70].strategicPoint = 'vantage';
        
        // Supply points at the ends of the valley
        newGrid[5][40].strategicPoint = 'supply';
        newGrid[35][40].strategicPoint = 'supply';
      }
      
      else if (presetId === 'forest-clearing') {
        // Create natural-looking forest with a clearing in the middle
        
        // Helper function to create forest patches
        const createForestPatch = (centerX, centerY, radius, density = 0.7) => {
          for (let x = centerX - radius; x <= centerX + radius; x++) {
            for (let y = centerY - radius; y <= centerY + radius; y++) {
              // Calculate distance from center
              const distance = Math.sqrt(
                Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2)
              );
              
              // Probability decreases as we move away from center
              const probability = density * (1 - distance / radius);
              
              if (distance <= radius && Math.random() < probability &&
                  y >= 0 && y < gridHeight && x >= 0 && x < gridWidth) {
                newGrid[y][x].terrain = 'light-cover';
              }
            }
          }
        };
        
        // Create several forest patches with different densities
        const forestPatches = [
          { x: 10, y: 10, radius: 12, density: 0.8 },  // Top left
          { x: 10, y: 30, radius: 12, density: 0.8 },  // Bottom left
          { x: 70, y: 10, radius: 12, density: 0.8 },  // Top right
          { x: 70, y: 30, radius: 12, density: 0.8 },  // Bottom right
          
          // Smaller patches extending into the clearing
          { x: 25, y: 15, radius: 8, density: 0.6 },
          { x: 25, y: 25, radius: 8, density: 0.6 },
          { x: 55, y: 15, radius: 8, density: 0.6 },
          { x: 55, y: 25, radius: 8, density: 0.6 },
          
          // Scattered trees in the clearing
          { x: 40, y: 20, radius: 15, density: 0.2 }
        ];
        
        forestPatches.forEach(patch => {
          createForestPatch(patch.x, patch.y, patch.radius, patch.density);
        });
        
        // Add some full cover (dense forest) patches
        const denseForestPatches = [
          { x: 5, y: 5, radius: 4 },
          { x: 5, y: 35, radius: 4 },
          { x: 75, y: 5, radius: 4 },
          { x: 75, y: 35, radius: 4 }
        ];
        
        denseForestPatches.forEach(patch => {
          for (let x = patch.x - patch.radius; x <= patch.x + patch.radius; x++) {
            for (let y = patch.y - patch.radius; y <= patch.y + patch.radius; y++) {
              const distance = Math.sqrt(
                Math.pow(x - patch.x, 2) + Math.pow(y - patch.y, 2)
              );
              
              if (distance <= patch.radius && 
                  y >= 0 && y < gridHeight && x >= 0 && x < gridWidth) {
                newGrid[y][x].terrain = 'full-cover';
              }
            }
          }
        });
        
        // Create a small stream or river in the clearing
        const streamPoints = [
          { x: 30, y: 5 },
          { x: 35, y: 15 },
          { x: 40, y: 20 },
          { x: 45, y: 25 },
          { x: 50, y: 35 }
        ];
        
        for (let i = 0; i < streamPoints.length - 1; i++) {
          const start = streamPoints[i];
          const end = streamPoints[i + 1];
          
          const distance = Math.max(
            Math.abs(end.x - start.x),
            Math.abs(end.y - start.y)
          );
          
          for (let step = 0; step <= distance; step++) {
            const x = Math.round(start.x + (end.x - start.x) * (step / distance));
            const y = Math.round(start.y + (end.y - start.y) * (step / distance));
            
            if (y >= 0 && y < gridHeight && x >= 0 && x < gridWidth) {
              newGrid[y][x].terrain = 'difficult';
            }
          }
        }
        
        // Add strategic points
        // Command point in center of clearing
        newGrid[20][40].strategicPoint = 'command';
        
        // Supply points at edges of clearing
        newGrid[15][30].strategicPoint = 'supply';
        newGrid[15][50].strategicPoint = 'supply';
        newGrid[25][30].strategicPoint = 'supply';
        newGrid[25][50].strategicPoint = 'supply';
        
        // Vantage points in tall trees
        newGrid[5][20].strategicPoint = 'vantage';
        newGrid[5][60].strategicPoint = 'vantage';
        newGrid[35][20].strategicPoint = 'vantage';
        newGrid[35][60].strategicPoint = 'vantage';
      }
      
      setGrid(newGrid);
    };

  // Handle tile click
  const handleTileClick = (x, y) => {
    if (!selectedTool) return;
    
    const newGrid = [...grid];
    
    if (selectedTool.id === 'eraser') {
      newGrid[y][x].terrain = null;
      newGrid[y][x].strategicPoint = null;
    } else if (tools.terrainTools.find(tool => tool.id === selectedTool.id)) {
      newGrid[y][x].terrain = selectedTool.id;
      newGrid[y][x].strategicPoint = null;
    } else if (tools.strategicTools.find(tool => tool.id === selectedTool.id)) {
      newGrid[y][x].strategicPoint = selectedTool.id;
      newGrid[y][x].terrain = null;
    }
    
    setGrid(newGrid);
  };

  // Calculate budgets based on influence
  const calculateBudgets = () => {
    // Map influence slider (0-100) to budget distribution (10000-30000)
    const influenceFactor = (influenceBalance - 50) / 50; // -1 to 1
    
    const attackerBudget = Math.round(20000 + (influenceFactor * 10000));
    const defenderBudget = Math.round(20000 - (influenceFactor * 10000));
    
    // Apply escalation
    const attackerTotal = Math.round(attackerBudget * escalation);
    const defenderTotal = Math.round(defenderBudget * escalation);
    
    return {
      attacker: attackerTotal,
      defender: defenderTotal,
      initialDeployment: Math.round(8000 * escalation)
    };
  };

  // Get color for a tile
  // Get color and styling for a tile
const getTileColor = (tile) => {
    if (tile.strategicPoint) {
      const tool = tools.strategicTools.find(t => t.id === tile.strategicPoint);
      let styleObj = {
        backgroundColor: tool ? tool.color : '#ffffff',
        backgroundImage: 'none',
        border: '1px solid #666',
        zIndex: 2
      };
      
      // Enhanced styling for strategic points
      switch(tile.strategicPoint) {
        case 'command':
          styleObj = {
            ...styleObj,
            boxShadow: 'inset 0 0 3px #fff',
            border: '1px solid #a07c15',
            backgroundImage: 'radial-gradient(circle, #f6d365 0%, #d4af37 70%)'
          };
          break;
        case 'supply':
          styleObj = {
            ...styleObj,
            boxShadow: 'inset 0 0 2px #fff',
            border: '1px solid #287525',
            backgroundImage: 'radial-gradient(circle, #5ac054 0%, #3a9c35 70%)'
          };
          break;
        case 'vantage':
          styleObj = {
            ...styleObj,
            boxShadow: 'inset 0 0 2px #fff',
            border: '1px solid #285896',
            backgroundImage: 'radial-gradient(circle, #609fea 0%, #3a78c6 70%)'
          };
          break;
      }
      
      return styleObj;
    }
    
    if (tile.terrain) {
      const tool = tools.terrainTools.find(t => t.id === tile.terrain);
      switch(tile.terrain) {
        case 'difficult':
          return {
            backgroundColor: '#4a94c3',
            backgroundImage: 'linear-gradient(135deg, rgba(74, 148, 195, 0.8) 0%, rgba(58, 125, 165, 0.9) 50%, rgba(74, 148, 195, 0.8) 100%)',
            border: '1px solid #3a7da5',
            opacity: 0.9
          };
        case 'high':
          return {
            backgroundColor: '#a87e54',
            backgroundImage: 'linear-gradient(to bottom, #c09972 0%, #a87e54 60%, #866842 100%)',
            border: '1px solid #786032',
            boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.4)'
          };
        case 'light-cover':
          return {
            backgroundColor: '#2e8a2e',
            backgroundImage: 'radial-gradient(circle at center, #3aa53a 0%, #2e8a2e 100%)',
            border: '1px solid #1d6e1d',
            boxShadow: 'inset 0 0 2px rgba(255,255,255,0.3)'
          };
        case 'full-cover':
          return {
            backgroundColor: '#1f601f',
            backgroundImage: 'radial-gradient(circle at center, #267326 0%, #1f601f 100%)',
            border: '1px solid #164616',
            boxShadow: 'inset 0 0 1px rgba(255,255,255,0.2)'
          };
        default:
          return {
            backgroundColor: tool ? tool.color : '#ffffff',
            backgroundImage: 'none',
            border: '1px solid #ddd'
          };
      }
    }
    
    // Zone colors (light background)
    if (tile.zone === 'attacker') {
      return {
        backgroundColor: '#ffe6e6',
        backgroundImage: 'none',
        border: '1px solid #ffcccc'
      };
    } else if (tile.zone === 'defender') {
      return {
        backgroundColor: '#e6f2ff',
        backgroundImage: 'none',
        border: '1px solid #cce6ff'
      };
    }
    
    return {
      backgroundColor: '#f5f5f5',
      backgroundImage: 'none',
      border: '1px solid #ddd'
    }; // neutral
  };
  
  // Get icon for a strategic point
  const getStrategicPointIcon = (pointType) => {
    switch (pointType) {
      case 'command':
        return '⚑'; // flag symbol for command
      case 'supply':
        return '⚛'; // atom symbol for supply
      case 'vantage':
        return '★'; // star symbol for vantage
      default:
        return '';
    }
  };

  const budgets = calculateBudgets();

  return (
    <div className="flex flex-col w-full max-w-6xl mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-bold">Battle Setup</h1>
      
      {/* Setup Mode Selection */}
      <div className="flex space-x-4">
        <button 
          className={`px-4 py-2 rounded ${setupMode === 'preset' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          onClick={() => setSetupMode('preset')}
        >
          Preset Map
        </button>
        <button 
          className={`px-4 py-2 rounded ${setupMode === 'custom' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
          onClick={() => setSetupMode('custom')}
        >
          Custom Map
        </button>
      </div>
      
      {/* Battle Parameters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-gray-100 rounded">
        <div>
          <h2 className="text-lg font-semibold mb-2">Battle Parameters</h2>
          
          <div className="mb-4">
            <label className="block mb-1">Escalation ({escalation}x)</label>
            <div className="flex items-center space-x-2">
              <span>0.5x</span>
              <input 
                type="range" 
                min="0.5" 
                max="2" 
                step="0.1"
                value={escalation}
                onChange={(e) => setEscalation(parseFloat(e.target.value))}
                className="flex-grow"
              />
              <span>2.0x</span>
            </div>
          </div>
          
          <div className="mb-4">
            <label className="block mb-1">Faction Influence</label>
            <div className="flex items-center space-x-2">
              <span className="w-16 text-red-600">Attacker</span>
              <input 
                type="range" 
                min="0" 
                max="100"
                value={influenceBalance}
                onChange={(e) => setInfluenceBalance(parseInt(e.target.value))}
                className="flex-grow"
              />
              <span className="w-16 text-blue-600">Defender</span>
            </div>
          </div>
        </div>
        
        <div>
          <h2 className="text-lg font-semibold mb-2">Budget Allocation</h2>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-red-600">Attacker Total Reserve:</span>
              <span>{budgets.attacker.toLocaleString()} GP</span>
            </div>
            <div className="flex justify-between">
              <span className="text-blue-600">Defender Total Reserve:</span>
              <span>{budgets.defender.toLocaleString()} GP</span>
            </div>
            <div className="flex justify-between font-semibold">
              <span>Initial Deployment Limit:</span>
              <span>{budgets.initialDeployment.toLocaleString()} GP</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Preset Map Selection */}
      {setupMode === 'preset' && (
        <div className="p-4 bg-gray-100 rounded">
          <h2 className="text-lg font-semibold mb-2">Select Preset Map</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {presetMaps.map(preset => (
              <div 
                key={preset.id}
                className={`border p-4 rounded cursor-pointer ${selectedPreset === preset.id ? 'border-blue-600 bg-blue-50' : 'border-gray-300'}`}
                onClick={() => loadPresetMap(preset.id)}
              >
                <h3 className="font-medium">{preset.name}</h3>
                <p className="text-sm text-gray-600">Click to load this preset</p>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Custom Map Tools */}
      {setupMode === 'custom' && (
        <div className="p-4 bg-gray-100 rounded">
          <h2 className="text-lg font-semibold mb-2">Map Editor Tools</h2>
          
          <div className="mb-4">
            <h3 className="font-medium mb-1">Terrain:</h3>
            <div className="flex flex-wrap gap-2">
              {tools.terrainTools.map(tool => (
                <button
                  key={tool.id}
                  className={`px-3 py-1 rounded text-sm ${selectedTool?.id === tool.id ? 'ring-2 ring-blue-600' : 'bg-gray-200'}`}
                  style={{ backgroundColor: selectedTool?.id === tool.id ? tool.color : undefined }}
                  onClick={() => setSelectedTool(tool)}
                >
                  {tool.name}
                </button>
              ))}
            </div>
          </div>
          
          <div className="mb-4">
            <h3 className="font-medium mb-1">Strategic Points:</h3>
            <div className="flex flex-wrap gap-2">
              {tools.strategicTools.map(tool => (
                <button
                  key={tool.id}
                  className={`px-3 py-1 rounded text-sm ${selectedTool?.id === tool.id ? 'ring-2 ring-blue-600' : 'bg-gray-200'}`}
                  style={{ backgroundColor: selectedTool?.id === tool.id ? tool.color : undefined }}
                  onClick={() => setSelectedTool(tool)}
                >
                  {tool.name}
                </button>
              ))}
            </div>
          </div>
          
          <button
            className={`px-3 py-1 rounded text-sm ${selectedTool?.id === 'eraser' ? 'ring-2 ring-blue-600 bg-white' : 'bg-gray-200'}`}
            onClick={() => setSelectedTool(tools.eraser)}
          >
            Eraser
          </button>
        </div>
      )}
      
      {/* Battle Map Grid */}
      <div className="overflow-auto bg-gray-100 p-2 rounded border border-gray-300">
        <div className="grid-container" style={{ position: 'relative', width: `${gridWidth * 12}px`, height: `${gridHeight * 12}px` }}>
          {/* Render territory dividers for reference */}
          <div 
            style={{ 
              position: 'absolute', 
              left: `${attackerCols * 12}px`,
              top: 0,
              width: '2px',
              height: '100%',
              backgroundColor: 'rgba(255,0,0,0.3)',
              zIndex: 1
            }}
          />
          <div 
            style={{ 
              position: 'absolute', 
              left: `${(gridWidth - defenderCols) * 12}px`,
              top: 0,
              width: '2px',
              height: '100%',
              backgroundColor: 'rgba(0,0,255,0.3)',
              zIndex: 1
            }}
          />
          
          {/* Grid tiles */}
          {grid.map((row, y) => (
  row.map((tile, x) => {
    const tileStyle = getTileColor(tile);
    return (
      <div
        key={`${x}-${y}`}
        style={{
          position: 'absolute',
          left: `${x * 12}px`,
          top: `${y * 12}px`,
          width: '12px',
          height: '12px',
          ...tileStyle,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '8px',
          cursor: setupMode === 'custom' ? 'pointer' : 'default'
        }}
        onClick={() => setupMode === 'custom' && handleTileClick(x, y)}
      >
        {tile.strategicPoint && getStrategicPointIcon(tile.strategicPoint)}
      </div>
    );
  })
))}
          
          {/* Labels */}
          <div style={{ position: 'absolute', left: '5px', top: '5px', fontSize: '12px', fontWeight: 'bold', color: 'rgba(255,0,0,0.7)' }}>
            Attacker Base Line
          </div>
          <div style={{ position: 'absolute', right: '5px', top: '5px', fontSize: '12px', fontWeight: 'bold', color: 'rgba(0,0,255,0.7)' }}>
            Defender Base Line
          </div>
          <div style={{ position: 'absolute', left: `${attackerCols * 12 - 80}px`, top: '5px', fontSize: '12px', fontWeight: 'bold', color: 'rgba(255,0,0,0.7)' }}>
            Attacker Front
          </div>
          <div style={{ position: 'absolute', right: `${defenderCols * 12 - 80}px`, top: '5px', fontSize: '12px', fontWeight: 'bold', color: 'rgba(0,0,255,0.7)' }}>
            Defender Front
          </div>
          <div style={{ position: 'absolute', left: '50%', top: '5px', transform: 'translateX(-50%)', fontSize: '12px', fontWeight: 'bold' }}>
            No Man's Land
          </div>
        </div>
      </div>
      
      
      {/* Legend */}
      <div className="p-4 bg-gray-100 rounded">
        <h2 className="text-lg font-semibold mb-2">Legend</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="font-medium mb-1">Terrain Types:</h3>
            <ul className="space-y-1">
              {tools.terrainTools.map(tool => (
                <li key={tool.id} className="flex items-center">
                  <div style={{ width: '16px', height: '16px', backgroundColor: tool.color, marginRight: '8px' }}></div>
                  <span>{tool.name}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-medium mb-1">Strategic Points:</h3>
            <ul className="space-y-1">
              {tools.strategicTools.map(tool => (
                <li key={tool.id} className="flex items-center">
                  <div style={{ 
                    width: '16px', 
                    height: '16px', 
                    backgroundColor: tool.color, 
                    marginRight: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '10px'
                  }}>
                    {getStrategicPointIcon(tool.id)}
                  </div>
                  <span>{tool.name}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
      
      {/* Save Button */}
      <button className="bg-green-600 text-white px-4 py-2 rounded font-medium">
        Save Battle Setup
      </button>
    </div>
  );
};

export default BattleSetup;