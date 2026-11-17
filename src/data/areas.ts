// Illustrative area snapshots for the demo. Figures are rounded examples, not live data.
export interface Area {
  id: string; name: string; district: string; img: string; credit: string
  typical: string; flat: string; toCentre: string; goodFor: string; line: string
  lat: number; lng: number
}

export const areas: Area[] = [
  { id: 'moseley', name: 'Moseley', district: 'B13', img: 'img/moseley-valentine.webp', credit: 'Richard Law, CC BY-SA 2.0',
    typical: '£315k', flat: '£175k', toCentre: '15 min', goodFor: 'Cafés, parks, Victorian terraces',
    line: 'Leafy, lively, and the village feel people move here for.', lat: 52.4452, lng: -1.8889 },
  { id: 'harborne', name: 'Harborne', district: 'B17', img: 'img/harborne-high.webp', credit: 'Stephen McKay, CC BY-SA 2.0',
    typical: '£340k', flat: '£190k', toCentre: '20 min', goodFor: 'High street, schools, hospitals',
    line: 'A proper high street, ten minutes from the QE and the university.', lat: 52.4597, lng: -1.9531 },
  { id: 'brindley', name: 'Brindleyplace', district: 'B1', img: 'img/brindley-pan.webp', credit: 'Tanya Dedyukhina, CC BY 3.0',
    typical: '£215k', flat: '£205k', toCentre: '10 min', goodFor: 'Flats, canals, short commutes',
    line: 'Canal-side flats a short walk from New Street and the library.', lat: 52.4786, lng: -1.9136 },
  { id: 'bournville', name: 'Bournville', district: 'B30', img: 'img/bournville.webp', credit: 'Hassocks5489, CC0',
    typical: '£295k', flat: '£160k', toCentre: '12 min', goodFor: 'Families, green space, quiet streets',
    line: 'The model village built by the Cadbury family. Calm and very green.', lat: 52.4283, lng: -1.9327 },
  { id: 'digbeth', name: 'Digbeth', district: 'B5', img: 'img/digbeth.webp', credit: 'P L Chadwick, CC BY-SA 2.0',
    typical: '£200k', flat: '£195k', toCentre: '5 min', goodFor: 'New builds, creative scene',
    line: 'Warehouses, street food and new flats as HS2 arrives next door.', lat: 52.4747, lng: -1.8829 },
]
