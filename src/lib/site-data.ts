import teacherAbdou from "@/assets/teacher-abdou.jpg";
import teacherAicha from "@/assets/teacher-aicha.jpg";
import teacherMoussa from "@/assets/teacher-moussa.jpg";

export type Teacher = {
  slug: string;
  name: string;
  photo: string;
  subjects: string;
  tags: string[];
  meta: string;
  city: string;
  rating: string;
  reviews: number;
  languages: string[];
  price: string;
  session: string;
  days: string;
  bio: string;
  levels: string[];
};

export const SUBJECTS = ["Coran", "Arabe", "Tajwid", "Hadith", "Fiqh"];

export const TEACHERS: Teacher[] = [
  {
    slug: "ustadh-abdou",
    name: "Ustadh Abdou",
    photo: teacherAbdou,
    subjects: "Arabe · Coran · Tajwid",
    tags: ["Arabe", "Coran", "Tajwid"],
    meta: "8 ans d'expérience · Dakar",
    city: "Dakar",
    rating: "4,9",
    reviews: 128,
    languages: ["Wolof", "Français", "العربية"],
    price: "5 000",
    session: "/ séance · 45 min",
    days: "Lun · Mer · Sam",
    levels: ["Débutant", "Intermédiaire"],
    bio: "Formé au dahra de Ndiassane puis diplômé en langue arabe, Ustadh Abdou accompagne enfants et adultes vers une lecture fluide du Coran, avec beaucoup de patience et une méthode progressive.",
  },
  {
    slug: "aicha-sarr",
    name: "Mme Aïcha Sarr",
    photo: teacherAicha,
    subjects: "Tajwid · Lecture du Coran",
    tags: ["Coran", "Tajwid"],
    meta: "6 ans d'expérience · Saint-Louis",
    city: "Saint-Louis",
    rating: "5,0",
    reviews: 94,
    languages: ["Wolof", "العربية"],
    price: "4 000",
    session: "/ séance · 40 min",
    days: "Mar · Jeu",
    levels: ["Débutant", "Enfant"],
    bio: "Spécialiste du tajwid pour les femmes et les enfants, Aïcha Sarr propose des séances courtes et régulières, centrées sur la prononciation et la mémorisation par petites unités.",
  },
  {
    slug: "cheikh-moussa",
    name: "Cheikh Moussa",
    photo: teacherMoussa,
    subjects: "Hadith · Fiqh · Sirah",
    tags: ["Hadith", "Fiqh"],
    meta: "11 ans d'expérience · Thiès",
    city: "Thiès",
    rating: "4,8",
    reviews: 211,
    languages: ["Français", "العربية"],
    price: "6 500",
    session: "/ séance · 60 min",
    days: "Sam · Dim",
    levels: ["Intermédiaire", "Avancé"],
    bio: "Enseignant en sciences islamiques, Cheikh Moussa aborde le fiqh et le hadith avec une approche comparative accessible, pensée pour les étudiants adultes de la diaspora.",
  },
];

export const SURAHS = [
  { n: 1, name: "Al-Fâtiha", ar: "الفاتحة", verses: 7, progress: 100 },
  { n: 2, name: "Al-Baqara", ar: "البقرة", verses: 286, progress: 24 },
  { n: 18, name: "Al-Kahf", ar: "الكهف", verses: 110, progress: 45 },
  { n: 36, name: "Yâ-Sîn", ar: "يس", verses: 83, progress: 80 },
  { n: 55, name: "Ar-Rahmân", ar: "الرحمن", verses: 78, progress: 60 },
  { n: 67, name: "Al-Mulk", ar: "الملك", verses: 30, progress: 100 },
  { n: 78, name: "An-Naba'", ar: "النبأ", verses: 40, progress: 35 },
  { n: 112, name: "Al-Ikhlâs", ar: "الإخلاص", verses: 4, progress: 100 },
];

export const BOOKS = [
  { title: "Introduction au Fiqh", author: "Dr. M. Diagne", cat: "Fiqh", progress: 63 },
  { title: "Les 40 hadiths an-Nawawî", author: "An-Nawawî", cat: "Hadith", progress: 28 },
  { title: "Grammaire arabe pas à pas", author: "S. Ba", cat: "Arabe", progress: 12 },
  { title: "Règles du tajwid illustrées", author: "A. Sarr", cat: "Tajwid", progress: 0 },
  { title: "La Sîrah pour les enfants", author: "F. Ndiaye", cat: "Sirah", progress: 47 },
  { title: "Adhkâr du matin et du soir", author: "Collectif", cat: "Invocations", progress: 90 },
];

export const PLANS = [
  {
    name: "Découverte",
    price: "0",
    unit: "FCFA / mois",
    tagline: "Pour commencer et prendre l'habitude.",
    features: [
      "Coran complet + audio",
      "Bibliothèque de base",
      "Rappels de prière",
      "1 séance d'essai offerte",
    ],
    cta: "Commencer gratuitement",
    highlight: false,
  },
  {
    name: "Dahara",
    price: "9 900",
    unit: "FCFA / mois",
    tagline: "Le parcours complet avec un professeur attitré.",
    features: [
      "4 séances individuelles / mois",
      "Parcours personnalisé",
      "Suivi de progression détaillé",
      "Bibliothèque complète",
      "Timer de mémorisation",
    ],
    cta: "Choisir Dahara",
    highlight: true,
  },
  {
    name: "Famille",
    price: "17 900",
    unit: "FCFA / mois",
    tagline: "Jusqu'à 4 apprenants, enfants et parents.",
    features: [
      "8 séances / mois à répartir",
      "4 profils d'apprenants",
      "Rapports aux parents",
      "Cours en groupe illimités",
    ],
    cta: "Choisir Famille",
    highlight: false,
  },
];
