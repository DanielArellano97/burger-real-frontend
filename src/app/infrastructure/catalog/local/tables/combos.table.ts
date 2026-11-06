import { ComboRecord } from '../../catalog.records';

/**
 * Tabla `combos`. El precio NO se guarda: se calcula desde sus detalles.
 */
export const COMBOS: readonly ComboRecord[] = [
  {
    id: 1,
    nombre: 'Clásico',
    descripcion: 'Cheese Burger + Papas 100g + Aritos de Cebolla (x5) + Bebida a elección',
    disponible: true,
    imagenUrl: 'https://res.cloudinary.com/zas3mkmm/image/upload/w_600,f_auto,q_auto/v1793733771/Gemini_Generated_Image_65saco65saco65sa.jpg',
  },
  {
    id: 2,
    nombre: 'Sabroso',
    descripcion: 'Onion Caramel Bacon + Papas 100g + Aritos de Cebolla (x5) + Bebida a elección',
    disponible: true,
    imagenUrl: 'https://res.cloudinary.com/zas3mkmm/image/upload/w_600,f_auto,q_auto/v1793733896/Gemini_Generated_Image_9xugv79xugv79xug.jpg',
  },
  {
    id: 3,
    nombre: 'Crunchy',
    descripcion: 'Onion Ring Bacon + Papas 100g + Aritos de Cebolla (x5) + Bebida a elección',
    disponible: true,
    imagenUrl: 'https://res.cloudinary.com/zas3mkmm/image/upload/w_600,f_auto,q_auto/v1793734041/Gemini_Generated_Image_vuwz7pvuwz7pvuwz.jpg',
  },
  {
    id: 4,
    nombre: 'Real',
    descripcion: 'Real + Papas 100g + Aritos de Cebolla (x10) + Bebida a elección',
    disponible: true,
    imagenUrl: 'https://res.cloudinary.com/zas3mkmm/image/upload/w_600,f_auto,q_auto/v1793734388/Gemini_Generated_Image_noldthnoldthnold_1.jpg',
  },
  {
    id: 5,
    nombre: 'Doble Bacon',
    descripcion: '2 x Cheese Bacon + 2 x Papas 100g + Aritos de Cebolla (x10) + 2 x Bebidas a elección',
    disponible: true,
    imagenUrl: 'https://res.cloudinary.com/zas3mkmm/image/upload/w_600,f_auto,q_auto/v1793734551/Gemini_Generated_Image_w5nma3w5nma3w5nm.jpg',
  },
  {
    id: 6,
    nombre: 'Real Real',
    descripcion: '2 x Real + 2 x Papas 100g + 2 x Bebidas a elección',
    disponible: true,
    imagenUrl: 'https://res.cloudinary.com/zas3mkmm/image/upload/w_600,f_auto,q_auto/v1793734829/Gemini_Generated_Image_v849q9v849q9v849.jpg',
  },
  {
    id: 7,
    nombre: 'Pollo Real',
    descripcion: 'Real + Papas 100g + Deditos de Pollo (x3) + Bebida a elección',
    disponible: true,
    imagenUrl: 'https://res.cloudinary.com/zas3mkmm/image/upload/w_600,f_auto,q_auto/v1793735080/Gemini_Generated_Image_heeq5oheeq5oheeq.jpg',
  },
];
