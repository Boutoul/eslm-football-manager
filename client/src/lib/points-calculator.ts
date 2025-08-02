import { Player, Settings } from "@shared/schema";

export function calculatePlayerPoints(player: Player, settings?: Settings): number {
  if (!settings) {
    // Default points if no settings
    return (player.overallRating * 10) + 
           (player.strongFoot === 'left' ? 2 : player.strongFoot === 'right' ? 1 : 3) +
           (player.speed + player.endurance + player.technique + player.heading + player.physical);
  }

  const { pointsConfig, activitiesConfig } = settings as any;
  
  // Base points from stars
  let points = player.overallRating * (pointsConfig?.starValue || 10);
  
  // Points from strong foot
  points += (pointsConfig?.strongFoot?.[player.strongFoot] || 0);
  
  // Points from skills
  points += (player.speed + player.endurance + player.technique + player.heading + player.physical) * (pointsConfig?.skillValue || 1);
  
  // Points from activities
  Object.entries(player.activities || {}).forEach(([activity, isActive]) => {
    if (isActive && activitiesConfig?.[activity]) {
      points += activitiesConfig[activity].points;
    }
  });
  
  return points;
}

export function getPositionColor(position: string): string {
  switch (position) {
    case 'goalkeeper':
      return 'bg-orange-500';
    case 'defender':
      return 'bg-blue-500';
    case 'midfielder':
      return 'bg-green-500';
    case 'attacker':
      return 'bg-red-500';
    default:
      return 'bg-gray-500';
  }
}

export function getPositionLabel(position: string): string {
  switch (position) {
    case 'goalkeeper':
      return 'Gardien';
    case 'defender':
      return 'Défenseur';
    case 'midfielder':
      return 'Milieu';
    case 'attacker':
      return 'Attaquant';
    default:
      return position;
  }
}

export function getStrongFootLabel(foot: string): string {
  switch (foot) {
    case 'left':
      return 'Pied gauche';
    case 'right':
      return 'Pied droit';
    case 'both':
      return 'Les deux pieds';
    default:
      return foot;
  }
}
