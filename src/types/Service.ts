// src/types/Service.ts

export interface ServiceSection {
    id: string;
    title: string; // Titre de la section, ex : "Coupes femmes"
  }
  
  export interface Service {
    id: string;
    title: string; // Nom du service, ex : "Balayage"
    description?: string; // Description optionnelle
    duration: number; // en minutes
    price: number; // en euros
    section: ServiceSection; // catégorie du service
  }
  