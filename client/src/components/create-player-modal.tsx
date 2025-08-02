import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertPlayerSchema, type InsertPlayer } from "@shared/schema";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { StarRating } from "./star-rating";
import { SkillRating } from "./skill-rating";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface CreatePlayerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreatePlayerModal({ open, onOpenChange }: CreatePlayerModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [overallRating, setOverallRating] = useState(1);
  const [skills, setSkills] = useState({
    speed: 1,
    endurance: 1,
    technique: 1,
    heading: 1,
    physical: 1
  });

  const { data: settings } = useQuery({
    queryKey: ["/api/settings"],
  });

  const form = useForm<InsertPlayer>({
    resolver: zodResolver(insertPlayerSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      preferredPosition: "midfielder",
      strongFoot: "right",
      overallRating: 1,
      speed: 1,
      endurance: 1,
      technique: 1,
      heading: 1,
      physical: 1,
      activities: {}
    }
  });

  const createMutation = useMutation({
    mutationFn: async (data: InsertPlayer) => {
      const response = await apiRequest("POST", "/api/players", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/players"] });
      toast({
        title: "Joueur créé",
        description: "Le joueur a été ajouté avec succès.",
      });
      onOpenChange(false);
      form.reset();
      setOverallRating(1);
      setSkills({ speed: 1, endurance: 1, technique: 1, heading: 1, physical: 1 });
    },
    onError: (error) => {
      console.error("Creation error:", error);
      toast({
        title: "Erreur",
        description: "Impossible de créer le joueur.",
        variant: "destructive",
      });
    }
  });

  const onSubmit = (data: InsertPlayer) => {
    console.log("=== FORM SUBMISSION START ===");
    console.log("Form data:", data);
    console.log("Overall rating:", overallRating);
    console.log("Skills:", skills);
    console.log("Form errors:", form.formState.errors);
    console.log("Form is valid:", form.formState.isValid);
    
    const playerData = {
      firstName: data.firstName,
      lastName: data.lastName,
      preferredPosition: data.preferredPosition,
      strongFoot: data.strongFoot,
      overallRating,
      speed: skills.speed,
      endurance: skills.endurance,
      technique: skills.technique,
      heading: skills.heading,
      physical: skills.physical,
      activities: data.activities || {}
    };
    
    console.log("Complete player data:", playerData);
    console.log("=== CALLING MUTATION ===");
    createMutation.mutate(playerData);
  };

  const handleSkillChange = (skill: keyof typeof skills, value: number) => {
    setSkills(prev => ({ ...prev, [skill]: value }));
  };

  const activitiesConfig = (settings as any)?.activitiesConfig || {};

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nouveau Joueur</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground mb-4">
          Créez un nouveau joueur en remplissant ses informations personnelles, position et compétences.
        </p>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            
            {/* Personal Information */}
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">Informations personnelles</h4>
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Prénom *</FormLabel>
                      <FormControl>
                        <Input placeholder="Christophe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nom *</FormLabel>
                      <FormControl>
                        <Input placeholder="Chanal" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Position and Preferences */}
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">Position et préférences</h4>
              
              <FormField
                control={form.control}
                name="preferredPosition"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Position préférée *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner une position" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="goalkeeper">Gardien</SelectItem>
                        <SelectItem value="defender">Défenseur</SelectItem>
                        <SelectItem value="midfielder">Milieu</SelectItem>
                        <SelectItem value="attacker">Attaquant</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="strongFoot"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pied fort *</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex space-x-4"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="left" id="left" />
                          <label htmlFor="left" className="text-sm">Gauche</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="right" id="right" />
                          <label htmlFor="right" className="text-sm">Droit</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="both" id="both" />
                          <label htmlFor="both" className="text-sm">Les deux</label>
                        </div>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Overall Rating */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Note générale</label>
              <div className="flex items-center space-x-4">
                <StarRating 
                  rating={overallRating} 
                  onChange={setOverallRating}
                  size="lg"
                />
                <span className="text-sm text-gray-600">
                  {overallRating === 1 && "Débutant"}
                  {overallRating === 2 && "Intermédiaire"}
                  {overallRating === 3 && "Avancé"}
                </span>
              </div>
            </div>

            {/* Skills Rating */}
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">Compétences (sur 3 points)</h4>
              
              <SkillRating 
                rating={skills.speed} 
                onChange={(value) => handleSkillChange('speed', value)}
                label="Vitesse"
              />
              <SkillRating 
                rating={skills.endurance} 
                onChange={(value) => handleSkillChange('endurance', value)}
                label="Endurance"
              />
              <SkillRating 
                rating={skills.technique} 
                onChange={(value) => handleSkillChange('technique', value)}
                label="Technique"
              />
              <SkillRating 
                rating={skills.heading} 
                onChange={(value) => handleSkillChange('heading', value)}
                label="Jeu de tête"
              />
              <SkillRating 
                rating={skills.physical} 
                onChange={(value) => handleSkillChange('physical', value)}
                label="Physique"
              />
            </div>

            {/* Club Activities */}
            <div className="space-y-3">
              <h4 className="font-medium text-gray-900">Activités du club</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-48 overflow-y-auto">
                {/* Positions acceptées */}
                <div className="space-y-2">
                  <h5 className="text-sm font-medium text-gray-700">Positions acceptées</h5>
                  {Object.entries(activitiesConfig).filter(([key, config]) => (config as any).category === 'position').map(([key, config]) => (
                    <FormField
                      key={key}
                      control={form.control}
                      name={`activities.${key}` as keyof InsertPlayer}
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={Boolean(field.value)}
                              onCheckedChange={(checked) => {
                                field.onChange(checked ? true : undefined);
                              }}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <label className="text-sm font-normal">
                              {(config as any).label} ({(config as any).points > 0 ? '+' : ''}{(config as any).points} pts)
                            </label>
                          </div>
                        </FormItem>
                      )}
                    />
                  ))}
                </div>

                {/* Arbitrage */}
                <div className="space-y-2">
                  <h5 className="text-sm font-medium text-gray-700">Arbitrage</h5>
                  {Object.entries(activitiesConfig).filter(([key, config]) => (config as any).category === 'arbitrage').map(([key, config]) => (
                    <FormField
                      key={key}
                      control={form.control}
                      name={`activities.${key}` as keyof InsertPlayer}
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={Boolean(field.value)}
                              onCheckedChange={(checked) => {
                                field.onChange(checked ? true : undefined);
                              }}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <label className="text-sm font-normal">
                              {(config as any).label} ({(config as any).points > 0 ? '+' : ''}{(config as any).points} pts)
                            </label>
                          </div>
                        </FormItem>
                      )}
                    />
                  ))}
                </div>

                {/* Services */}
                <div className="space-y-2">
                  <h5 className="text-sm font-medium text-gray-700">Services</h5>
                  {Object.entries(activitiesConfig).filter(([key, config]) => ['service', 'tasks'].includes((config as any).category)).map(([key, config]) => (
                    <FormField
                      key={key}
                      control={form.control}
                      name={`activities.${key}` as keyof InsertPlayer}
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={Boolean(field.value)}
                              onCheckedChange={(checked) => {
                                field.onChange(checked ? true : undefined);
                              }}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <label className="text-sm font-normal">
                              {(config as any).label} ({(config as any).points > 0 ? '+' : ''}{(config as any).points} pts)
                            </label>
                          </div>
                        </FormItem>
                      )}
                    />
                  ))}
                </div>

                {/* Bonus & Pénalités */}
                <div className="space-y-2">
                  <h5 className="text-sm font-medium text-gray-700">Bonus & Pénalités</h5>
                  {Object.entries(activitiesConfig).filter(([key, config]) => ['bonus', 'penalty', 'negative', 'attendance'].includes((config as any).category)).map(([key, config]) => (
                    <FormField
                      key={key}
                      control={form.control}
                      name={`activities.${key}` as keyof InsertPlayer}
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={Boolean(field.value)}
                              onCheckedChange={(checked) => {
                                field.onChange(checked ? true : undefined);
                              }}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <label className="text-sm font-normal">
                              {(config as any).label} ({(config as any).points > 0 ? '+' : ''}{(config as any).points} pts)
                            </label>
                          </div>
                        </FormItem>
                      )}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                className="flex-1"
                onClick={() => onOpenChange(false)}
              >
                Annuler
              </Button>
              <Button 
                type="submit" 
                className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-black"
                disabled={createMutation.isPending}
              >
                {createMutation.isPending ? "Création..." : "Créer le joueur"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
