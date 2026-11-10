import React, { useState } from "react";
import {
  Croissant, Milk, Egg, Fish, Pizza, Sandwich, IceCreamCone, CakeSlice, Beef, Soup,
  Apple, Banana, Cherry, Grape, Citrus, Carrot, Salad, Coffee, GlassWater, Wine,
  Cat, Dog, Bird, Rabbit, Squirrel, Turtle, Snail, Rat, Bug, Panda,
  Bed, Sofa, Lamp, DoorOpen, Bath, ShowerHead, Refrigerator, Tv, Armchair, Key,
  Car, Bus, TrainFront, Plane, Bike, Ship, Truck, TramFront, Motorbike, Ambulance,
  Sun, Cloud, CloudRain, CloudSnow, Wind, CloudLightning, Rainbow, CloudFog, Moon, Thermometer,
  Hospital, School, Store, Church, Building, Hotel, Castle, Factory, Fuel, Library,
  Book, Pencil, Ruler, Calculator, Eraser, Notebook, Pen, Scissors, Backpack, Presentation,
  Music, Guitar, Camera, Gamepad2, Dumbbell, Tent, Clapperboard, Palette, Volleyball, Piano,
  Eye, Ear, Hand, Heart, Brain, Bone, Footprints, Pill, Bandage, Syringe, ImageOff,
  Shirt, Glasses, Watch, Gem, Umbrella, Handbag, Ribbon, Waves, Stethoscope, ChefHat, HardHat, Wrench, Paintbrush, Gavel, Tractor, Mail, CookingPot, Microwave, Utensils, UtensilsCrossed, Flame, Timer, CupSoda, Luggage, Ticket, Map as MapIcon, BaggageClaim, Compass, PlaneTakeoff, Palmtree, Signpost, Binoculars, Flag, Mountain, Trees, Flower, Leaf, TreePine, Sprout, Star, ShoppingCart, ShoppingBag, CreditCard, Banknote, Coins, Receipt, Tag, PiggyBank, Wallet, Laptop, Smartphone, Tablet, Monitor, Keyboard, Mouse, Printer, Headphones, Battery, Plug,
} from "lucide-react";

/* Hình của từ vựng (10/11). Hai nguồn, theo thứ tự ưu tiên:
 *
 * 1. HINH_ICONS8: « từ tiếng Pháp » → id hình Icons8, bộ « color » (khoá ở icons8.json gốc dự án:
 *    MỘT bộ cho cả phần từ vựng, thêm từ thì tìm trong đúng bộ này). Id lấy từ công cụ tìm của
 *    Icons8 (10/11), đã soát bằng mắt trên bảng hình; không tự đặt id. Hình hiện qua
 *    img.icons8.com (CSP cho phép img https). Bản miễn phí của Icons8 đòi ghi link về icons8.com:
 *    dòng ghi nguồn nằm ở TuVung.jsx, `check:tuvung` canh nó còn đó.
 * 2. ICON: icon lucide-react, thư viện icon sẵn có của app, tra theo `tu.icon`.
 *
 * `check:tuvung` canh mọi `icon` trong content/tuVung đều có trong lucide-react. */
export const HINH_ICONS8 = {
  "le croissant": "36769", "le lait": "12866", "l'œuf": "hcrmiShXkMs2", "le poisson": "16040", "la pizza": "12867",
  "le sandwich": "42626", "la glace": "13303", "le gâteau": "107438", "la viande": "13306", "la soupe": "0Gi7r8YcXKVU",
  "la pomme": "13304", "la banane": "18957", "la cerise": "19527", "le raisin": "18051", "le citron": "18044",
  "la carotte": "12865", "la salade": "zphNWHGZfV0i", "le café": "30001", "l'eau": "QhMOaO418ONR", "le vin": "12885",
  "le chat": "16017", "le chien": "16018", "l'oiseau": "16023", "le lapin": "16082", "l'écureuil": "95006",
  "la tortue": "16106", "l'escargot": "16117", "le rat": "95005", "l'insecte": "16044", "le panda": "16093",
  "le lit": "12839", "le canapé": "12830", "la lampe": "12287", "la porte": "12061", "la baignoire": "12829",
  "la douche": "12851", "le réfrigérateur": "12822", "la télévision": "12844", "le fauteuil": "12840", "la clé": "12279",
  "la voiture": "15126", "le bus": "15137", "le train": "15200", "l'avion": "21023", "le vélo": "15128",
  "le bateau": "15135", "le camion": "15196", "le tramway": "15198", "la moto": "15130", "l'ambulance": "14739",
  "le soleil": "15352", "le nuage": "11871", "la pluie": "15360", "la neige": "15356", "le vent": "pLiaaoa41R9n",
  "l'orage": "15346", "l'arc-en-ciel": "35175", "le brouillard": "15347", "la lune": "13477", "la température": "15350",
  "l'hôpital": "14865", "l'école": "40734", "le magasin": "13010", "l'église": "17331", "l'immeuble": "13246",
  "l'hôtel": "12350", "le château": "2dHAlXzCRQRl", "l'usine": "12129", "la station-service": "11930", "la bibliothèque": "fLcGCYSAd69t",
  "le livre": "16369", "le crayon": "18709", "la règle": "13117", "la calculatrice": "12780", "la gomme": "12115",
  "le cahier": "66646", "le stylo": "VCkCNw5MSACD", "les ciseaux": "14890", "le sac à dos": "45390", "le tableau": "13191",
  "la musique": "12783", "la guitare": "12203", "l'appareil photo": "13075", "le jeu vidéo": "11907", "le sport": "SMjRXXIK5MOb",
  "le camping": "17576", "le cinéma": "CEik28xST8XJ", "la peinture": "13369", "le volley-ball": "16960", "le piano": "12789",
  "l'œil": "13758", "l'oreille": "14818", "la main": "17678", "le cœur": "16424", "le cerveau": "14748",
  "l'os": "20727", "le pied": "1TZ8k82dTTXe", "le médicament": "14844", "le pansement": "14743", "la piqûre": "14871",
  /* A2 (11/11) */
  "la chemise": "16596", "les lunettes": "16606", "la montre": "37749", "la bague": "17341", "le parapluie": "16597",
  "le sac à main": "37706", "les chaussures": "17618", "la cravate": "20576", "l'écharpe": "16587", "le maillot de bain": "122961",
  "le médecin": "14857", "le cuisinier": "23288", "l'ouvrier": "23340", "le mécanicien": "111638", "le peintre": "9fS8epYOUvtK",
  "le coiffeur": "qGrhqZVFf9Lv", "le juge": "17877", "l'agriculteur": "23295", "le pilote": "J2HcqQ3sPh4v", "le facteur": "kVzqFZ8zS2MB",
  "la casserole": "v5qj37MWkW09", "le micro-ondes": "12846", "la tasse": "84298", "la fourchette": "12856", "le couteau": "12902",
  "le bol": "79UtsTJ0BaNF", "le verre": "1ftVn8GOXtit", "la poêle": "BeDidZchwnxG", "le minuteur": "63256", "la bouteille": "13322",
  "la valise": "17622", "le billet": "13032", "la carte": "13781", "le passeport": "17608", "la boussole": "13730",
  "l'aéroport": "qerRQWBCmFLD", "la plage": "17569", "le panneau": "13788", "les jumelles": "13120", "le drapeau": "3muzEmi4dpD5",
  "la montagne": "110283", "la forêt": "17593", "la fleur": "18050", "la feuille": "18066", "la mer": "17617",
  "l'arbre": "18047", "le cactus": "18043", "l'île": "NUROCLcGlkBS", "l'étoile": "19295", "le désert": "DLRlgKnyxMZE",
  "le chariot": "13014", "le sac": "13022", "la carte bancaire": "22188", "le billet de banque": "13008", "la pièce": "13009",
  "le ticket de caisse": "13225", "l'étiquette": "12028", "la tirelire": "13005", "le portefeuille": "13016", "la cabine d'essayage": "dXeKGA4gQciN",
  "l'ordinateur portable": "102552", "le téléphone portable": "13616", "la tablette": "13618", "l'écran": "13352", "le clavier": "12280",
  "la souris": "13347", "l'imprimante": "12785", "le casque": "20747", "la batterie": "4MWKIlEI1k82", "le chargeur": "gZYWoCrsvoFU",
};

const ICON = {
  Croissant, Milk, Egg, Fish, Pizza, Sandwich, IceCreamCone, CakeSlice, Beef, Soup,
  Apple, Banana, Cherry, Grape, Citrus, Carrot, Salad, Coffee, GlassWater, Wine,
  Cat, Dog, Bird, Rabbit, Squirrel, Turtle, Snail, Rat, Bug, Panda,
  Bed, Sofa, Lamp, DoorOpen, Bath, ShowerHead, Refrigerator, Tv, Armchair, Key,
  Car, Bus, TrainFront, Plane, Bike, Ship, Truck, TramFront, Motorbike, Ambulance,
  Sun, Cloud, CloudRain, CloudSnow, Wind, CloudLightning, Rainbow, CloudFog, Moon, Thermometer,
  Hospital, School, Store, Church, Building, Hotel, Castle, Factory, Fuel, Library,
  Book, Pencil, Ruler, Calculator, Eraser, Notebook, Pen, Scissors, Backpack, Presentation,
  Music, Guitar, Camera, Gamepad2, Dumbbell, Tent, Clapperboard, Palette, Volleyball, Piano,
  Eye, Ear, Hand, Heart, Brain, Bone, Footprints, Pill, Bandage, Syringe,
  Shirt, Glasses, Watch, Gem, Umbrella, Handbag, Ribbon, Waves, Stethoscope, ChefHat, HardHat, Wrench, Paintbrush, Gavel, Tractor, Mail, CookingPot, Microwave, Utensils, UtensilsCrossed, Flame, Timer, CupSoda, Luggage, Ticket, Map: MapIcon, BaggageClaim, Compass, PlaneTakeoff, Palmtree, Signpost, Binoculars, Flag, Mountain, Trees, Flower, Leaf, TreePine, Sprout, Star, ShoppingCart, ShoppingBag, CreditCard, Banknote, Coins, Receipt, Tag, PiggyBank, Wallet, Laptop, Smartphone, Tablet, Monitor, Keyboard, Mouse, Printer, Headphones, Battery, Plug,
};
export const TEN_ICON = Object.keys(ICON);

/* Dòng ghi nguồn hình: bản miễn phí của Icons8 yêu cầu link về icons8.com. Đặt ở cuối mọi trang
   từ vựng có hình. */
export function GhiNguonHinh({ nhan }) {
  return (
    <p className="m-0 mt-8 text-center text-xs text-soft">
      {nhan} <a href="https://icons8.com" target="_blank" rel="noopener noreferrer" className="font-bold text-primary no-underline hover:underline">Icons8</a>
    </p>
  );
}

/* Hình của một từ. `alt` là nghĩa tiếng Việt: hình vốn đã nói nghĩa, còn từ tiếng Pháp là thứ
   bài tập đang hỏi nên không được lộ qua alt. */
export function HinhTu({ tu, size = 56, className = "" }) {
  const id = HINH_ICONS8[tu.fr];
  /* Hình Icons8 không tải được (mất mạng, bị chặn) thì lùi về icon lucide, không để ô trống. */
  const [hong, setHong] = useState(false);
  if (id && !hong) {
    return <img src={`https://img.icons8.com/?id=${id}&format=png&size=${size * 2}`} width={size} height={size} alt={tu.vi}
      loading="lazy" draggable={false} onError={() => setHong(true)} className={`select-none object-contain ${className}`} />;
  }
  const I = ICON[tu.icon] ?? ImageOff;
  return <I size={size} strokeWidth={1.5} role="img" aria-label={tu.vi} className={className} />;
}
