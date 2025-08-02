import { Player } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StarRating } from "./star-rating";
import { SkillRating } from "./skill-rating";
import { calculatePlayerPoints, getPositionColor, getPositionLabel, getStrongFootLabel } from "@/lib/points-calculator";
import { Edit, Trash2 } from "lucide-react";

interface PlayerCardProps {
  player: Player;
  onEdit: (player: Player) => void;
  onDelete: (playerId: string) => void;
  settings?: any;
}

export function PlayerCard({ player, onEdit, onDelete, settings }: PlayerCardProps) {
  const points = calculatePlayerPoints(player, settings);
  const positionColor = getPositionColor(player.preferredPosition);
  const positionLabel = getPositionLabel(player.preferredPosition);
  const strongFootLabel = getStrongFootLabel(player.strongFoot);

  return (
    <Card className="overflow-hidden hover:shadow-md transition-all duration-200">
      <div className="relative">
        <div className="w-full h-48 bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center">
          <div className="text-black text-6xl font-bold opacity-30">
            {player.firstName[0]}{player.lastName[0]}
          </div>
        </div>
        <div className={`absolute top-3 right-3 ${positionColor} text-white px-2 py-1 rounded-full text-xs font-medium`}>
          {positionLabel}
        </div>
      </div>
      
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="font-semibold text-gray-900">
              {player.firstName} {player.lastName}
            </h3>
            <p className="text-sm text-gray-500">{strongFootLabel}</p>
          </div>
          
          <div className="flex items-center space-x-2">
            <StarRating rating={player.overallRating} readonly size="sm" />
            <div className="bg-black text-yellow-400 px-2 py-1 rounded text-xs font-medium">
              {points} pts
            </div>
          </div>
        </div>

        <div className="space-y-2 mb-4">
          <SkillRating rating={player.speed} readonly label="Vitesse" />
          <SkillRating rating={player.endurance} readonly label="Endurance" />
          <SkillRating rating={player.technique} readonly label="Technique" />
          <SkillRating rating={player.heading} readonly label="Jeu de tête" />
          <SkillRating rating={player.physical} readonly label="Physique" />
        </div>

        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1"
            onClick={() => onEdit(player)}
          >
            <Edit className="w-3 h-3 mr-1" />
            Modifier
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50"
            onClick={() => onDelete(player.id)}
          >
            <Trash2 className="w-3 h-3 mr-1" />
            Supprimer
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
