import React from "react";
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
} from "lucide-react";

/* Hình của từ vựng (10/11). Hai nguồn, theo thứ tự ưu tiên:
 *
 * 1. HINH_ICONS8: « từ tiếng Pháp » → id hình Icons8. Đang RỖNG: kết nối Icons8 (plugin cài
 *    10/11) chưa đăng nhập, mà id phải lấy từ công cụ tìm của Icons8, không được tự đặt. Khi có
 *    id thì điền vào đây, hình hiện qua img.icons8.com (CSP đã cho phép img https). Bản miễn phí
 *    của Icons8 đòi ghi link về icons8.com: điền hình vào thì phải thêm dòng ghi nguồn ở TuVung.jsx.
 * 2. ICON: icon lucide-react, thư viện icon sẵn có của app, tra theo `tu.icon`.
 *
 * `check:tuvung` canh mọi `icon` trong content/tuVung đều có trong lucide-react. */
export const HINH_ICONS8 = {};

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
};
export const TEN_ICON = Object.keys(ICON);

/* Hình của một từ. `alt` là nghĩa tiếng Việt: hình vốn đã nói nghĩa, còn từ tiếng Pháp là thứ
   bài tập đang hỏi nên không được lộ qua alt. */
export function HinhTu({ tu, size = 56, className = "" }) {
  const id = HINH_ICONS8[tu.fr];
  if (id) {
    return <img src={`https://img.icons8.com/?id=${id}&format=png&size=${size * 2}`} width={size} height={size} alt={tu.vi}
      loading="lazy" draggable={false} className={`select-none object-contain ${className}`} />;
  }
  const I = ICON[tu.icon] ?? ImageOff;
  return <I size={size} strokeWidth={1.5} role="img" aria-label={tu.vi} className={className} />;
}
