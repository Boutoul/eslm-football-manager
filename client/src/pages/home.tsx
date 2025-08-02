import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { PlayerCard } from "@/components/player-card";
import { CreatePlayerModal } from "@/components/create-player-modal";
import { EditPlayerModal } from "@/components/edit-player-modal";
import { TeamComposition } from "@/components/team-composition";
import { Player } from "@shared/schema";
import { Search, Plus, Users, Settings } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function Home() {
  const [activeTab, setActiveTab] = useState("inventory");
  const [searchQuery, setSearchQuery] = useState("");
  const [positionFilter, setPositionFilter] = useState("");
  const [ratingFilter, setRatingFilter] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [playerToDelete, setPlayerToDelete] = useState<string | null>(null);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: players = [], isLoading } = useQuery<Player[]>({
    queryKey: ["/api/players"],
  });

  const { data: settings } = useQuery({
    queryKey: ["/api/settings"],
  });

  const deleteMutation = useMutation({
    mutationFn: async (playerId: string) => {
      await apiRequest("DELETE", `/api/players/${playerId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/players"] });
      toast({
        title: "Joueur supprimé",
        description: "Le joueur a été supprimé avec succès.",
      });
      setPlayerToDelete(null);
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le joueur.",
        variant: "destructive",
      });
    }
  });

  const filteredPlayers = players.filter((player: Player) => {
    const matchesSearch = !searchQuery || 
      `${player.firstName} ${player.lastName}`.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPosition = !positionFilter || positionFilter === "all" || player.preferredPosition === positionFilter;
    const matchesRating = !ratingFilter || ratingFilter === "all" || player.overallRating >= parseInt(ratingFilter);
    
    return matchesSearch && matchesPosition && matchesRating;
  });

  const handleEditPlayer = (player: Player) => {
    setEditingPlayer(player);
    setShowEditModal(true);
  };

  const handleDeletePlayer = (playerId: string) => {
    setPlayerToDelete(playerId);
  };

  const confirmDelete = () => {
    if (playerToDelete) {
      deleteMutation.mutate(playerToDelete);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Header */}
      <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo and Brand */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-yellow-500 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-black" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">ESLM</h1>
                <p className="text-xs text-gray-500">Club Privé Football</p>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="hidden md:flex space-x-8">
              <button
                onClick={() => setActiveTab("inventory")}
                className={`px-3 py-2 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === "inventory"
                    ? "text-yellow-600 border-yellow-500"
                    : "text-gray-500 border-transparent hover:text-gray-700"
                }`}
              >
                Inventaire Joueurs
              </button>
              <button
                onClick={() => setActiveTab("teams")}
                className={`px-3 py-2 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === "teams"
                    ? "text-yellow-600 border-yellow-500"
                    : "text-gray-500 border-transparent hover:text-gray-700"
                }`}
              >
                Composition Équipes
              </button>
            </div>

            {/* Mobile Menu Button */}
            <Button variant="ghost" size="sm" className="md:hidden">
              <Settings className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden border-t border-gray-200 bg-gray-50">
          <div className="px-4 py-3 space-y-1">
            <button
              onClick={() => setActiveTab("inventory")}
              className={`block w-full text-left px-3 py-2 text-base font-medium rounded-md transition-colors ${
                activeTab === "inventory"
                  ? "text-yellow-600 bg-yellow-50"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
              }`}
            >
              Inventaire Joueurs
            </button>
            <button
              onClick={() => setActiveTab("teams")}
              className={`block w-full text-left px-3 py-2 text-base font-medium rounded-md transition-colors ${
                activeTab === "teams"
                  ? "text-yellow-600 bg-yellow-50"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
              }`}
            >
              Composition Équipes
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Player Inventory Tab */}
        {activeTab === "inventory" && (
          <div>
            {/* Header with Actions */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 space-y-4 sm:space-y-0">
              <div>
                <h2 className="text-3xl font-bold text-gray-900">Inventaire des Joueurs</h2>
                <p className="text-gray-600 mt-1">Gérez vos joueurs et leurs statistiques</p>
              </div>
              
              <Button 
                onClick={() => setShowCreateModal(true)}
                className="bg-green-500 hover:bg-green-600 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Nouveau Joueur
              </Button>
            </div>

            {/* Search and Filter Bar */}
            <Card className="mb-6">
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Recherche</label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        placeholder="Nom du joueur..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Position</label>
                    <Select value={positionFilter} onValueChange={setPositionFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="Toutes les positions" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Toutes les positions</SelectItem>
                        <SelectItem value="goalkeeper">Gardien</SelectItem>
                        <SelectItem value="defender">Défenseur</SelectItem>
                        <SelectItem value="midfielder">Milieu</SelectItem>
                        <SelectItem value="attacker">Attaquant</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Note minimum</label>
                    <Select value={ratingFilter} onValueChange={setRatingFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="Toutes les notes" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Toutes les notes</SelectItem>
                        <SelectItem value="3">3 étoiles</SelectItem>
                        <SelectItem value="2">2 étoiles et +</SelectItem>
                        <SelectItem value="1">1 étoile et +</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-end">
                    <Button 
                      className="w-full bg-blue-500 hover:bg-blue-600"
                      onClick={() => {
                        // Filters are already applied automatically
                      }}
                    >
                      Filtrer
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Player Cards Grid */}
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[...Array(8)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <div className="w-full h-48 bg-gray-200 rounded-t-xl"></div>
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                        <div className="space-y-2">
                          <div className="h-2 bg-gray-200 rounded"></div>
                          <div className="h-2 bg-gray-200 rounded"></div>
                          <div className="h-2 bg-gray-200 rounded"></div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredPlayers.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredPlayers.map((player: Player) => (
                  <PlayerCard
                    key={player.id}
                    player={player}
                    onEdit={handleEditPlayer}
                    onDelete={handleDeletePlayer}
                    settings={settings}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="max-w-sm mx-auto">
                  <div className="w-32 h-32 bg-gray-100 rounded-xl mx-auto mb-4 flex items-center justify-center">
                    <Users className="w-16 h-16 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun joueur trouvé</h3>
                  <p className="text-gray-500 mb-6">
                    {searchQuery || positionFilter || ratingFilter 
                      ? "Aucun joueur ne correspond à vos critères de recherche."
                      : "Commencez par ajouter votre premier joueur à l'équipe."
                    }
                  </p>
                  <Button 
                    onClick={() => setShowCreateModal(true)}
                    className="bg-yellow-500 hover:bg-yellow-600 text-black"
                  >
                    Ajouter un joueur
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Team Composition Tab */}
        {activeTab === "teams" && (
          <div>
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900">Composition des Équipes</h2>
              <p className="text-gray-600 mt-1">Organisez vos joueurs en formation tactique</p>
            </div>
            <TeamComposition players={players} />
          </div>
        )}

      </main>

      {/* Modals */}
      <CreatePlayerModal 
        open={showCreateModal} 
        onOpenChange={setShowCreateModal}
      />
      
      <EditPlayerModal 
        open={showEditModal} 
        onOpenChange={setShowEditModal}
        player={editingPlayer}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!playerToDelete} onOpenChange={() => setPlayerToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer ce joueur ? Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              className="bg-red-500 hover:bg-red-600"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
