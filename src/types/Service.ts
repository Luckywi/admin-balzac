// src/types/Service.ts

export interface ServiceSection {
    id: string;
    title: string; // Titre de la section, ex : "Coupes femmes"
  }
  
  export interface Service {
    id: string;
    title: string;
  description: string;
  duration: string; // au lieu de number
  price: string;    // aussi string si tu veux l’éditer en mode formulaire
  sectionId?: string;
  }
  