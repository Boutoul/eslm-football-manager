import { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Player } from "@shared/schema";
import { calculatePlayerPoints, getPositionLabel } from "@/lib/points-calculator";
import { useQuery } from "@tanstack/react-query";

interface TeamFormationProps {
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

export function TeamFormation({ players }: TeamFormationProps) {
  const [selectedFormation, setSelectedFormation] = useState("4-4-2");
  const [selectedPlayers, setSelectedPlayers] = useState<{ [position: number]: Player | null }>({});

  const { data: settings } = useQuery({
    queryKey: ["/api/settings"],
  });

  const currentFormation = formations[selectedFormation] || formations["4-4-2"];

  const handlePlayerDrop = useCallback((positionIndex: number, player: Player) => {
    setSelectedPlayers(prev => ({
      ...prev,
      [positionIndex]: player
    }));
  }, []);

  const handlePlayerRemove = useCallback((positionIndex: number) => {
    setSelectedPlayers(prev => {
      const newSelected = { ...prev };
      delete newSelected[positionIndex];
      return newSelected;
    });
  }, []);

  const availablePlayers = players.filter(player => 
    !Object.values(selectedPlayers).find(selected => selected?.id === player.id)
  );

  const selectedPlayersArray = Object.values(selectedPlayers).filter(Boolean) as Player[];
  const averageRating = selectedPlayersArray.length > 0 
    ? selectedPlayersArray.reduce((sum, player) => sum + player.overallRating, 0) / selectedPlayersArray.length 
    : 0;

  const totalPoints = selectedPlayersArray.reduce((sum, player) => 
    sum + calculatePlayerPoints(player, settings as any), 0
  );

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      
      {/* Team Formation Area */}
      <div className="lg:w-2/3">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Formation d'Équipe</CardTitle>
              <div className="flex space-x-2">
                <Select value={selectedFormation} onValueChange={setSelectedFormation}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="4-4-2">4-4-2</SelectItem>
                    <SelectItem value="4-3-3">4-3-3</SelectItem>
                    <SelectItem value="3-5-2">3-5-2</SelectItem>
                  </SelectContent>
                </Select>
                <Button className="bg-green-500 hover:bg-green-600">
                  Sauvegarder
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Soccer Field */}
            <div 
              className="relative w-full h-[500px] rounded-xl overflow-hidden bg-gradient-to-b from-green-400 to-green-600"
              style={{
                backgroundImage: `
                  radial-gradient(circle at 50% 50%, rgba(255,255,255,0.1) 60px, transparent 60px),
                  linear-gradient(to bottom, rgba(255,255,255,0.1) 1px, transparent 1px),
                  linear-gradient(to right, rgba(255,255,255,0.1) 1px, transparent 1px)
                `,
                backgroundSize: "120px 120px, 100% 50%, 50% 100%",
                backgroundPosition: "50% 50%, 0 50%, 50% 0"
              }}
            >
              
              {/* Field lines */}
              <div className="absolute inset-0 opacity-30">
                {/* Center circle */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-20 h-20 border-2 border-white rounded-full"></div>
                {/* Center line */}
                <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-white transform -translate-x-1/2"></div>
                {/* Penalty areas */}
                <div className="absolute top-4 left-1/2 transform -translate-x-1/2 w-24 h-16 border-2 border-white border-b-0 rounded-t-lg"></div>
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-24 h-16 border-2 border-white border-t-0 rounded-b-lg"></div>
              </div>

              {/* Player Positions */}
              {currentFormation.map((position, index) => {
                const assignedPlayer = selectedPlayers[index];
                
                return (
                  <div
                    key={index}
                    className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer"
                    style={{
                      left: `${position.x}%`,
                      top: `${position.y}%`
                    }}
                    onClick={() => {
                      if (assignedPlayer) {
                        handlePlayerRemove(index);
                      }
                    }}
                  >
                    <div className={`
                      w-12 h-12 rounded-full border-2 flex items-center justify-center shadow-lg transition-all
                      ${assignedPlayer 
                        ? 'bg-white border-blue-500 hover:bg-blue-50' 
                        : 'bg-white/80 border-gray-300 hover:bg-white hover:border-blue-400'
                      }
                    `}>
                      {assignedPlayer ? (
                        <div className="text-center">
                          <div className="text-xs font-bold text-gray-800">
                            {assignedPlayer.firstName[0]}{assignedPlayer.lastName[0]}
                          </div>
                        </div>
                      ) : (
                        <span className="text-xs font-bold text-gray-600">
                          {position.position === 'goalkeeper' && 'GK'}
                          {position.position === 'defender' && 'DF'}
                          {position.position === 'midfielder' && 'MF'}
                          {position.position === 'attacker' && 'AT'}
                        </span>
                      )}
                    </div>
                    
                    {assignedPlayer && (
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1">
                        <Badge variant="secondary" className="text-xs whitespace-nowrap">
                          {assignedPlayer.firstName} {assignedPlayer.lastName}
                        </Badge>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Player Selection Sidebar */}
      <div className="lg:w-1/3">
        <Card>
          <CardHeader>
            <CardTitle>Joueurs Disponibles</CardTitle>
          </CardHeader>
          <CardContent>
            
            {/* Available Players List */}
            <div className="space-y-3 max-h-80 overflow-y-auto mb-6">
              {availablePlayers.map((player) => (
                <div
                  key={player.id}
                  className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => {
                    // Find first available position for this player's preferred position
                    const preferredPositionIndex = currentFormation.findIndex((pos, index) => 
                      pos.position === player.preferredPosition && !selectedPlayers[index]
                    );
                    
                    if (preferredPositionIndex !== -1) {
                      handlePlayerDrop(preferredPositionIndex, player);
                    } else {
                      // Find any available position
                      const availableIndex = currentFormation.findIndex((pos, index) => !selectedPlayers[index]);
                      if (availableIndex !== -1) {
                        handlePlayerDrop(availableIndex, player);
                      }
                    }
                  }}
                >
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                    <span className="text-xs font-bold text-gray-600">
                      {player.firstName[0]}{player.lastName[0]}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 text-sm">
                      {player.firstName} {player.lastName}
                    </p>
                    <p className="text-xs text-gray-500">
                      {getPositionLabel(player.preferredPosition)} • {'⭐'.repeat(player.overallRating)} • {calculatePlayerPoints(player, settings as any)} pts
                    </p>
                  </div>
                  <div className="flex items-center">
                    <input 
                      type="checkbox" 
                      className="w-4 h-4 text-yellow-600 bg-gray-100 border-gray-300 rounded focus:ring-yellow-500 focus:ring-2"
                      title="Présent"
                    />
                    <label className="ml-2 text-xs text-gray-600">Présent</label>
                  </div>
                </div>
              ))}
              
              {availablePlayers.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <p className="text-sm">Tous les joueurs sont assignés</p>
                </div>
              )}
            </div>

            {/* Team Stats */}
            <div className="pt-4 border-t border-gray-200">
              <h4 className="font-medium text-gray-900 mb-3">Statistiques d'Équipe</h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Joueurs sélectionnés</span>
                  <span className="font-medium">{selectedPlayersArray.length}/11</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Note moyenne</span>
                  <span className="font-medium">
                    {averageRating.toFixed(1)} ⭐
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Points totaux</span>
                  <span className="font-medium">{totalPoints} pts</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Formation</span>
                  <span className="font-medium">{selectedFormation}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
