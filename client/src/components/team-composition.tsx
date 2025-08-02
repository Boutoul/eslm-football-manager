import { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Player } from "@shared/schema";
import { calculatePlayerPoints, getPositionLabel } from "@/lib/points-calculator";
import { useQuery } from "@tanstack/react-query";
import { Shuffle, Users, Trophy, UserCheck } from "lucide-react";

interface TeamCompositionProps {
  players: Player[];
}

interface Formation {
  [key: string]: { x: number; y: number; position: string }[];
}

const formations: Formation = {
  "4-4-2": [
    { x: 50, y: 10, position: "goalkeeper" },
    { x: 20, y: 25, position: "defender" },
    { x: 40, y: 25, position: "defender" },
    { x: 60, y: 25, position: "defender" },
    { x: 80, y: 25, position: "defender" },
    { x: 20, y: 50, position: "midfielder" },
    { x: 40, y: 50, position: "midfielder" },
    { x: 60, y: 50, position: "midfielder" },
    { x: 80, y: 50, position: "midfielder" },
    { x: 35, y: 75, position: "attacker" },
    { x: 65, y: 75, position: "attacker" },
  ],
  "4-3-3": [
    { x: 50, y: 10, position: "goalkeeper" },
    { x: 20, y: 25, position: "defender" },
    { x: 40, y: 25, position: "defender" },
    { x: 60, y: 25, position: "defender" },
    { x: 80, y: 25, position: "defender" },
    { x: 30, y: 50, position: "midfielder" },
    { x: 50, y: 50, position: "midfielder" },
    { x: 70, y: 50, position: "midfielder" },
    { x: 25, y: 75, position: "attacker" },
    { x: 50, y: 75, position: "attacker" },
    { x: 75, y: 75, position: "attacker" },
  ],
  "3-5-2": [
    { x: 50, y: 10, position: "goalkeeper" },
    { x: 30, y: 25, position: "defender" },
    { x: 50, y: 25, position: "defender" },
    { x: 70, y: 25, position: "defender" },
    { x: 15, y: 50, position: "midfielder" },
    { x: 35, y: 50, position: "midfielder" },
    { x: 50, y: 50, position: "midfielder" },
    { x: 65, y: 50, position: "midfielder" },
    { x: 85, y: 50, position: "midfielder" },
    { x: 40, y: 75, position: "attacker" },
    { x: 60, y: 75, position: "attacker" },
  ],
  "4-5-1": [
    { x: 50, y: 10, position: "goalkeeper" },
    { x: 20, y: 25, position: "defender" },
    { x: 40, y: 25, position: "defender" },
    { x: 60, y: 25, position: "defender" },
    { x: 80, y: 25, position: "defender" },
    { x: 15, y: 50, position: "midfielder" },
    { x: 30, y: 50, position: "midfielder" },
    { x: 50, y: 50, position: "midfielder" },
    { x: 70, y: 50, position: "midfielder" },
    { x: 85, y: 50, position: "midfielder" },
    { x: 50, y: 75, position: "attacker" },
  ],
};

interface TeamData {
  teamA: {
    starters: Player[];
    substitutes: Player[];
  };
  teamB: {
    starters: Player[];
    substitutes: Player[];
  };
}

export function TeamComposition({ players }: TeamCompositionProps) {
  const [selectedFormation, setSelectedFormation] = useState("4-4-2");
  const [presentPlayers, setPresentPlayers] = useState<Set<string>>(new Set());
  const [positionColumns, setPositionColumns] = useState<{
    goalkeeper: Player[];
    defenders: Player[];
    midfielders: Player[];
    attackers: Player[];
    excluded: Player[];
  }>({
    goalkeeper: [],
    defenders: [],
    midfielders: [],
    attackers: [],
    excluded: []
  });
  const [generatedTeams, setGeneratedTeams] = useState<TeamData | null>(null);

  const { data: settings } = useQuery({
    queryKey: ["/api/settings"],
  });

  const currentFormation = formations[selectedFormation] || formations["4-4-2"];

  const togglePlayerPresence = useCallback((playerId: string) => {
    const player = players.find(p => p.id === playerId);
    if (!player) return;

    setPresentPlayers(prev => {
      const newSet = new Set(prev);
      if (newSet.has(playerId)) {
        newSet.delete(playerId);
        // Remove from position columns
        setPositionColumns(prev => ({
          goalkeeper: prev.goalkeeper.filter(p => p.id !== playerId),
          defenders: prev.defenders.filter(p => p.id !== playerId),
          midfielders: prev.midfielders.filter(p => p.id !== playerId),
          attackers: prev.attackers.filter(p => p.id !== playerId),
          excluded: prev.excluded.filter(p => p.id !== playerId)
        }));
      } else {
        newSet.add(playerId);
        // Automatically move to preferred position column
        setPositionColumns(prev => {
          const newColumns = { ...prev };
          const targetColumn = player.preferredPosition === 'goalkeeper' ? 'goalkeeper' :
                             player.preferredPosition === 'defender' ? 'defenders' :
                             player.preferredPosition === 'midfielder' ? 'midfielders' :
                             player.preferredPosition === 'attacker' ? 'attackers' : 'excluded';
          
          newColumns[targetColumn].push(player);
          return newColumns;
        });
      }
      return newSet;
    });
  }, [players]);

  const movePlayerToPosition = useCallback((player: Player, targetPosition: keyof typeof positionColumns) => {
    setPositionColumns(prev => {
      // Remove player from all positions
      const newColumns = {
        goalkeeper: prev.goalkeeper.filter(p => p.id !== player.id),
        defenders: prev.defenders.filter(p => p.id !== player.id),
        midfielders: prev.midfielders.filter(p => p.id !== player.id),
        attackers: prev.attackers.filter(p => p.id !== player.id),
        excluded: prev.excluded.filter(p => p.id !== player.id)
      };
      
      // Add to target position
      newColumns[targetPosition].push(player);
      
      return newColumns;
    });
  }, []);

  const calculateAdjustedPoints = (player: Player, currentPosition: string) => {
    const basePoints = calculatePlayerPoints(player, settings as any);
    
    // Goalkeeper priority: if player is not a goalkeeper but playing as one, heavy penalty
    if (currentPosition === 'goalkeeper' && player.preferredPosition !== 'goalkeeper') {
      return basePoints - 20; // Heavy penalty for non-goalkeepers
    }
    
    // Position penalty: -10 points if not playing preferred position
    const positionMap: { [key: string]: string } = {
      'goalkeeper': 'goalkeeper',
      'defenders': 'defender', 
      'midfielders': 'midfielder',
      'attackers': 'attacker'
    };
    
    if (positionMap[currentPosition] !== player.preferredPosition) {
      return basePoints - 10;
    }
    
    return basePoints;
  };

  const generateTeams = useCallback(() => {
    // Get all present players sorted by preferred position and adjusted points
    const allPresentPlayers = Array.from(presentPlayers)
      .map(id => players.find(p => p.id === id))
      .filter(Boolean) as Player[];

    // Create optimal team by position priority
    const createOptimalTeam = (availablePlayers: Player[]) => {
      const team: Player[] = [];
      const remaining = [...availablePlayers];

      // Position requirements for formation
      const positionNeeds = {
        goalkeeper: 1,
        defender: 4, 
        midfielder: 4,
        attacker: 2
      };

      // Fill each position with best available players in their preferred position
      Object.entries(positionNeeds).forEach(([position, count]) => {
        const preferredPlayers = remaining
          .filter(p => p.preferredPosition === position)
          .sort((a, b) => calculatePlayerPoints(b, settings as any) - calculatePlayerPoints(a, settings as any));
        
        const selected = preferredPlayers.slice(0, count);
        team.push(...selected);
        
        // Remove selected players from remaining
        selected.forEach(player => {
          const index = remaining.findIndex(p => p.id === player.id);
          if (index > -1) remaining.splice(index, 1);
        });
      });

      // Fill remaining spots with best available players (with position penalties)
      while (team.length < 11 && remaining.length > 0) {
        const bestPlayer = remaining.reduce((best, current) => {
          const bestPoints = calculatePlayerPoints(best, settings as any);
          const currentPoints = calculatePlayerPoints(current, settings as any);
          return currentPoints > bestPoints ? current : best;
        });
        
        team.push(bestPlayer);
        const index = remaining.findIndex(p => p.id === bestPlayer.id);
        remaining.splice(index, 1);
      }

      // Add substitutes
      const substitutes = remaining.slice(0, 3);
      
      return { starters: team, substitutes, excluded: remaining.slice(3) };
    };

    if (allPresentPlayers.length >= 20) {
      // Two balanced teams
      const sortedPlayers = allPresentPlayers.sort((a, b) => 
        calculatePlayerPoints(b, settings as any) - calculatePlayerPoints(a, settings as any)
      );
      
      // Distribute players alternately for balance
      const teamAPlayers: Player[] = [];
      const teamBPlayers: Player[] = [];
      
      sortedPlayers.forEach((player, index) => {
        if (index % 2 === 0) {
          teamAPlayers.push(player);
        } else {
          teamBPlayers.push(player);
        }
      });

      const teamA = createOptimalTeam(teamAPlayers);
      const teamB = createOptimalTeam(teamBPlayers);
      
      // Move excluded players to excluded column
      const allExcluded = [...teamA.excluded, ...teamB.excluded];
      setPositionColumns(prev => ({
        ...prev,
        excluded: [...prev.excluded, ...allExcluded]
      }));

      setGeneratedTeams({
        teamA: { starters: teamA.starters, substitutes: teamA.substitutes },
        teamB: { starters: teamB.starters, substitutes: teamB.substitutes }
      });
    } else {
      // One team only
      const teamA = createOptimalTeam(allPresentPlayers);
      
      // Move excluded players to excluded column
      setPositionColumns(prev => ({
        ...prev,
        excluded: [...prev.excluded, ...teamA.excluded]
      }));

      setGeneratedTeams({
        teamA: { starters: teamA.starters, substitutes: teamA.substitutes },
        teamB: { starters: [], substitutes: [] }
      });
    }
  }, [presentPlayers, players, settings]);

  const presentPlayersList = Array.from(presentPlayers)
    .map(id => players.find(p => p.id === id))
    .filter(Boolean) as Player[];

  // Show repositioning controls for positioned players
  const repositionPlayer = (playerId: string, newPosition: keyof typeof positionColumns) => {
    const player = [...Object.values(positionColumns)].flat().find(p => p.id === playerId);
    if (player) {
      movePlayerToPosition(player, newPosition);
    }
  };

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-wrap gap-4 items-center justify-between">
        <div className="flex items-center space-x-4">
          <Select value={selectedFormation} onValueChange={setSelectedFormation}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="4-4-2">4-4-2</SelectItem>
              <SelectItem value="4-3-3">4-3-3</SelectItem>
              <SelectItem value="3-5-2">3-5-2</SelectItem>
              <SelectItem value="4-5-1">4-5-1</SelectItem>
            </SelectContent>
          </Select>
          
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-yellow-100 text-black">
              <UserCheck className="w-3 h-3 mr-1" />
              {presentPlayersList.length} présents
            </Badge>
            <Badge variant="outline">
              {Object.values(positionColumns).flat().length} positionnés
            </Badge>
          </div>
        </div>

        <Button 
          onClick={generateTeams}
          disabled={presentPlayersList.length < 11}
          className="bg-yellow-500 hover:bg-yellow-600 text-black"
        >
          <Shuffle className="w-4 h-4 mr-2" />
          Générer les équipes
        </Button>
      </div>

      {/* Player Management */}
      <div className="grid grid-cols-1 lg:grid-cols-6 gap-4">
        {/* Available Players Column */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">
              Sélection des Présents ({presentPlayersList.length}/{players.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {/* Quick selection buttons */}
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    const allIds = new Set(players.map(p => p.id));
                    setPresentPlayers(allIds);
                    // Auto-position all players
                    setPositionColumns({
                      goalkeeper: players.filter(p => p.preferredPosition === 'goalkeeper'),
                      defenders: players.filter(p => p.preferredPosition === 'defender'),
                      midfielders: players.filter(p => p.preferredPosition === 'midfielder'),
                      attackers: players.filter(p => p.preferredPosition === 'attacker'),
                      excluded: []
                    });
                  }}
                  className="text-xs"
                >
                  Tous présents
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setPresentPlayers(new Set());
                    setPositionColumns({
                      goalkeeper: [],
                      defenders: [],
                      midfielders: [],
                      attackers: [],
                      excluded: []
                    });
                  }}
                  className="text-xs"
                >
                  Tout décocher
                </Button>
              </div>

              {/* Players grouped by position */}
              {(['goalkeeper', 'defender', 'midfielder', 'attacker'] as const).map((position) => {
                const positionPlayers = players
                  .filter(p => p.preferredPosition === position)
                  .sort((a, b) => calculatePlayerPoints(b, settings as any) - calculatePlayerPoints(a, settings as any));

                return (
                  <div key={position} className="space-y-1">
                    <h4 className="text-xs font-medium text-gray-700 uppercase tracking-wide">
                      {position === 'goalkeeper' && 'Gardiens'}
                      {position === 'defender' && 'Défenseurs'}
                      {position === 'midfielder' && 'Milieux'}
                      {position === 'attacker' && 'Attaquants'}
                    </h4>
                    
                    <div className="space-y-1 max-h-32 overflow-y-auto">
                      {positionPlayers.map((player) => (
                        <div
                          key={player.id}
                          className={`flex items-center justify-between p-2 border rounded transition-colors ${
                            presentPlayers.has(player.id) 
                              ? 'bg-yellow-50 border-yellow-300' 
                              : 'bg-gray-50 border-gray-200'
                          }`}
                        >
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-xs text-gray-900 truncate">
                              {player.firstName} {player.lastName}
                            </p>
                            <p className="text-xs text-gray-500">
                              {calculatePlayerPoints(player, settings as any)} pts
                            </p>
                          </div>
                          <input
                            type="checkbox"
                            checked={presentPlayers.has(player.id)}
                            onChange={() => togglePlayerPresence(player.id)}
                            className="w-3 h-3 text-yellow-600 bg-gray-100 border-gray-300 rounded focus:ring-yellow-500 focus:ring-1"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Position Columns */}
        {(['goalkeeper', 'defenders', 'midfielders', 'attackers', 'excluded'] as const).map((position) => (
          <Card key={position} className="lg:col-span-1">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">
                {position === 'goalkeeper' && 'Gardiens'}
                {position === 'defenders' && 'Défenseurs'}
                {position === 'midfielders' && 'Milieux'}
                {position === 'attackers' && 'Attaquants'}
                {position === 'excluded' && 'Écartés'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 min-h-40">
                {/* Players in this position */}
                {positionColumns[position].map((player) => {
                  const basePoints = calculatePlayerPoints(player, settings as any);
                  const adjustedPoints = calculateAdjustedPoints(player, position);
                  const isPenalized = basePoints !== adjustedPoints;
                  
                  return (
                    <div key={player.id} className="p-2 bg-gray-100 rounded-lg group">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <p className="font-medium text-sm text-gray-900">
                            {player.firstName} {player.lastName}
                          </p>
                          <p className="text-xs text-gray-500">
                            {isPenalized ? (
                              <>
                                <span className="line-through">{basePoints}</span>{' '}
                                <span className="text-red-600">{adjustedPoints} pts</span>
                                {player.preferredPosition !== 'goalkeeper' && position === 'goalkeeper' && (
                                  <span className="text-red-500 ml-1">(non-gardien)</span>
                                )}
                                {position !== 'goalkeeper' && (
                                  <span className="text-orange-500 ml-1">(hors poste)</span>
                                )}
                              </>
                            ) : (
                              `${basePoints} pts`
                            )}
                          </p>
                        </div>
                        
                        {/* Repositioning buttons */}
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <select
                            className="text-xs border rounded px-1 py-0.5"
                            value={position}
                            onChange={(e) => repositionPlayer(player.id, e.target.value as keyof typeof positionColumns)}
                          >
                            <option value="goalkeeper">Gardien</option>
                            <option value="defenders">Défenseur</option>
                            <option value="midfielders">Milieu</option>
                            <option value="attackers">Attaquant</option>
                            <option value="excluded">Écarté</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  );
                })}
                
                {/* Drop zone for repositioning */}
                {positionColumns[position].length === 0 && (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center text-gray-500 text-sm">
                    Aucun joueur dans cette position
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Generated Teams Display */}
      {generatedTeams && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Team A */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-500" />
                Équipe A
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Formation Display */}
              <div className="relative w-full h-64 bg-green-100 rounded-lg mb-4 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-green-200 to-green-300">
                  {/* Field lines */}
                  <div className="absolute inset-x-0 top-1/2 h-px bg-white"></div>
                  <div className="absolute left-1/2 top-0 bottom-0 w-px bg-white"></div>
                  <div className="absolute left-1/2 top-1/2 w-16 h-16 border border-white rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>
                </div>
                
                {currentFormation.map((position, index) => {
                  const assignedPlayer = generatedTeams.teamA.starters[index];
                  return (
                    <div
                      key={index}
                      className="absolute w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center text-black text-xs font-bold border-2 border-white transform -translate-x-1/2 -translate-y-1/2"
                      style={{ left: `${position.x}%`, top: `${position.y}%` }}
                    >
                      {assignedPlayer ? (
                        <div className="text-center">
                          <div className="text-xs font-bold">
                            {assignedPlayer.firstName[0]}{assignedPlayer.lastName[0]}
                          </div>
                        </div>
                      ) : (
                        <span className="text-xs font-bold">
                          {position.position === 'goalkeeper' && 'G'}
                          {position.position === 'defender' && 'D'}
                          {position.position === 'midfielder' && 'M'}
                          {position.position === 'attacker' && 'A'}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
              
              {/* Substitutes */}
              <div>
                <h4 className="font-medium mb-2">Remplaçants</h4>
                <div className="space-y-1">
                  {generatedTeams.teamA.substitutes.map((player) => (
                    <div key={player.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <span className="text-sm">{player.firstName} {player.lastName}</span>
                      <span className="text-xs text-gray-500">{calculatePlayerPoints(player, settings as any)} pts</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Team B */}
          {generatedTeams.teamB.starters.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-500" />
                  Équipe B
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* Formation Display */}
                <div className="relative w-full h-64 bg-green-100 rounded-lg mb-4 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-b from-green-200 to-green-300">
                    {/* Field lines */}
                    <div className="absolute inset-x-0 top-1/2 h-px bg-white"></div>
                    <div className="absolute left-1/2 top-0 bottom-0 w-px bg-white"></div>
                    <div className="absolute left-1/2 top-1/2 w-16 h-16 border border-white rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>
                  </div>
                  
                  {currentFormation.map((position, index) => {
                    const assignedPlayer = generatedTeams.teamB.starters[index];
                    return (
                      <div
                        key={index}
                        className="absolute w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold border-2 border-white transform -translate-x-1/2 -translate-y-1/2"
                        style={{ left: `${position.x}%`, top: `${position.y}%` }}
                      >
                        {assignedPlayer ? (
                          <div className="text-center">
                            <div className="text-xs font-bold">
                              {assignedPlayer.firstName[0]}{assignedPlayer.lastName[0]}
                            </div>
                          </div>
                        ) : (
                          <span className="text-xs font-bold">
                            {position.position === 'goalkeeper' && 'G'}
                            {position.position === 'defender' && 'D'}
                            {position.position === 'midfielder' && 'M'}
                            {position.position === 'attacker' && 'A'}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
                
                {/* Substitutes */}
                <div>
                  <h4 className="font-medium mb-2">Remplaçants</h4>
                  <div className="space-y-1">
                    {generatedTeams.teamB.substitutes.map((player) => (
                      <div key={player.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <span className="text-sm">{player.firstName} {player.lastName}</span>
                        <span className="text-xs text-gray-500">{calculatePlayerPoints(player, settings as any)} pts</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}