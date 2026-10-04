export interface BannerSlide {
  id: string
  title: string
  subtitle: string
  ctaLabel: string
  ctaHref: string
  imageUrl: string
  imageAlt: string
}

export const bannerSlides: BannerSlide[] = [
  {
    id: 'tanjore',
    title: 'Tanjore Paintings',
    subtitle: 'Rich pigments, sacred motifs, and gold foil that catches every ray of light.',
    ctaLabel: 'Explore Tanjore',
    ctaHref: '/products?product_type=TANJORE_PAINTING',
    imageUrl: '/banners/category-tanjore-paintings.jpg',
    imageAlt: 'Tanjore painting with gold foil detail',
  },
  {
    id: 'watercolor',
    title: 'Watercolor Art',
    subtitle: 'Soft washes, bold blooms — art that breathes on your walls.',
    ctaLabel: 'Shop Watercolor',
    ctaHref: '/products?product_type=WATERCOLOR_ART',
    imageUrl: '/banners/category-watercolor-art.jpg',
    imageAlt: 'Watercolor art with brushes and palette',
  },
  {
    id: 'pencil',
    title: 'Pencil Art',
    subtitle: 'Graphite whispers and sharp contrast — drama in every line.',
    ctaLabel: 'View Pencil Art',
    ctaHref: '/products?product_type=PENCIL_ART',
    imageUrl: '/banners/category-pencil-art.jpg',
    imageAlt: 'Detailed pencil art sketch with drawing tools',
  },
  {
    id: 'materials',
    title: 'Painting Raw Materials',
    subtitle: 'Brushes, pigments, and canvases built for artists who mean business.',
    ctaLabel: 'Browse Materials',
    ctaHref: '/products?product_type=PAINTING_MATERIALS',
    imageUrl: '/banners/category-painting-raw-materials.jpg',
    imageAlt: 'Painting raw materials and art supplies flat lay',
  },
]
