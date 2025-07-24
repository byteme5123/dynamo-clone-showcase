import planCardImage from '@/assets/dynamo-plan-card.png';
import elSalvadorCard from '@/assets/el-salvador-plan-card.png';
import guatemalaCard from '@/assets/guatemala-plan-card.png';
import hondurasCard from '@/assets/honduras-plan-card.png';

export interface Plan {
  id: string;
  slug: string;
  image: string;
  title: string;
  description: string;
  price: number;
  originalPrice?: number;
  data: string;
  features: string[];
  detailedFeatures: string[];
  sku: string;
  category: string;
  type: 'domestic' | 'special';
  country?: string;
  hasDiscount?: boolean;
  discountText?: string;
}

export const domesticPlans: Plan[] = [
  {
    id: '1',
    slug: '2gb-plan',
    image: planCardImage,
    title: '2GB Plan',
    description: 'UNLIMITED Talk & Text + 2GB Data',
    price: 25,
    originalPrice: 35,
    data: '2GB',
    features: [
      '2GB of 5G • 4G LTE Data',
      'Unlimited calls/texts to US/Mexico/Canada',
      'Mobile Hotspot Capable',
      'No Annual Contract'
    ],
    detailedFeatures: [
      'High-speed 5G and 4G LTE data connectivity',
      'Unlimited domestic calls and text messages',
      'International calling to Mexico and Canada included',
      'Mobile hotspot functionality for connecting other devices',
      'No long-term contracts or commitments required',
      '5G/4G LTE service availability varies by location'
    ],
    sku: 'DYN-2GB-001',
    category: 'Domestic Plans',
    type: 'domestic',
    hasDiscount: true,
    discountText: 'Save $10/month with 3-month plan'
  },
  {
    id: '2',
    slug: '5gb-plan',
    image: planCardImage,
    title: '5GB Plan',
    description: 'UNLIMITED Talk & Text + 5GB Data',
    price: 35,
    originalPrice: 45,
    data: '5GB',
    features: [
      '5GB of 5G • 4G LTE Data',
      'Unlimited calls/texts to US/Mexico/Canada',
      'Mobile Hotspot Capable',
      'No Annual Contract'
    ],
    detailedFeatures: [
      'High-speed 5G and 4G LTE data connectivity with 5GB allowance',
      'Unlimited domestic calls and text messages',
      'International calling to Mexico and Canada included',
      'Mobile hotspot functionality for connecting multiple devices',
      'No long-term contracts or commitments required',
      'Perfect for moderate data users',
      '5G/4G LTE service availability varies by location'
    ],
    sku: 'DYN-5GB-001',
    category: 'Domestic Plans',
    type: 'domestic',
    hasDiscount: true,
    discountText: 'Save $10/month with 3-month plan'
  },
  {
    id: '3',
    slug: '10gb-plan',
    image: planCardImage,
    title: '10GB Plan',
    description: 'UNLIMITED Talk & Text + 10GB Data',
    price: 45,
    originalPrice: 55,
    data: '10GB',
    features: [
      '10GB of 5G • 4G LTE Data',
      'Unlimited calls/texts to US/Mexico/Canada',
      'Mobile Hotspot Capable',
      'No Annual Contract'
    ],
    detailedFeatures: [
      'High-speed 5G and 4G LTE data connectivity with 10GB allowance',
      'Unlimited domestic calls and text messages',
      'International calling to Mexico and Canada included',
      'Mobile hotspot functionality for connecting multiple devices',
      'No long-term contracts or commitments required',
      'Ideal for heavy data users and streaming',
      '5G/4G LTE service availability varies by location'
    ],
    sku: 'DYN-10GB-001',
    category: 'Domestic Plans',
    type: 'domestic',
    hasDiscount: true,
    discountText: 'Save $10/month with 3-month plan'
  },
  {
    id: '4',
    slug: 'unlimited-plan',
    image: planCardImage,
    title: 'Unlimited Plan',
    description: 'UNLIMITED Talk & Text + UNLIMITED Data',
    price: 55,
    originalPrice: 65,
    data: 'Unlimited',
    features: [
      'UNLIMITED 5G • 4G LTE Data',
      'Unlimited calls/texts to US/Mexico/Canada',
      'Mobile Hotspot Capable',
      'No Annual Contract'
    ],
    detailedFeatures: [
      'Truly unlimited 5G and 4G LTE data connectivity',
      'Unlimited domestic calls and text messages',
      'International calling to Mexico and Canada included',
      'Mobile hotspot functionality for connecting multiple devices',
      'No long-term contracts or commitments required',
      'Perfect for power users and families',
      'Premium network priority access',
      '5G/4G LTE service availability varies by location'
    ],
    sku: 'DYN-UNL-001',
    category: 'Domestic Plans',
    type: 'domestic',
    hasDiscount: true,
    discountText: 'Save $10/month with 3-month plan'
  }
];

export const specialPlans: Plan[] = [
  {
    id: '5',
    slug: 'el-salvador-plan',
    image: elSalvadorCard,
    title: 'El Salvador Plan',
    description: 'El Salvador - UNLIMITED Talk & Text + 100 minutes',
    price: 60,
    data: '100 minutes',
    features: [
      'Unlimited Talk & Text within El Salvador',
      '100 international minutes to US/Canada',
      '4G LTE Network Coverage',
      'No Annual Contract'
    ],
    detailedFeatures: [
      'Unlimited domestic calls and text messages within El Salvador',
      '100 minutes of international calling to US and Canada',
      'Reliable 4G LTE network coverage throughout El Salvador',
      'No long-term contracts or commitments required',
      'Perfect for staying connected with family abroad',
      'Service availability varies by location within El Salvador'
    ],
    sku: 'DYN-SV-001',
    category: 'International Plans',
    type: 'special',
    country: 'El Salvador'
  },
  {
    id: '6',
    slug: 'guatemala-plan',
    image: guatemalaCard,
    title: 'Guatemala Plan',
    description: 'Guatemala - UNLIMITED Talk & Text + 100 minutes',
    price: 60,
    data: '100 minutes',
    features: [
      'Unlimited Talk & Text within Guatemala',
      '100 international minutes to US/Canada',
      '4G LTE Network Coverage',
      'No Annual Contract'
    ],
    detailedFeatures: [
      'Unlimited domestic calls and text messages within Guatemala',
      '100 minutes of international calling to US and Canada',
      'Reliable 4G LTE network coverage throughout Guatemala',
      'No long-term contracts or commitments required',
      'Perfect for staying connected with family abroad',
      'Service availability varies by location within Guatemala'
    ],
    sku: 'DYN-GT-001',
    category: 'International Plans',
    type: 'special',
    country: 'Guatemala'
  },
  {
    id: '7',
    slug: 'honduras-plan',
    image: hondurasCard,
    title: 'Honduras Plan',
    description: 'Honduras - UNLIMITED Talk & Text + 100 minutes',
    price: 60,
    data: '100 minutes',
    features: [
      'Unlimited Talk & Text within Honduras',
      '100 international minutes to US/Canada',
      '4G LTE Network Coverage',
      'No Annual Contract'
    ],
    detailedFeatures: [
      'Unlimited domestic calls and text messages within Honduras',
      '100 minutes of international calling to US and Canada',
      'Reliable 4G LTE network coverage throughout Honduras',
      'No long-term contracts or commitments required',
      'Perfect for staying connected with family abroad',
      'Service availability varies by location within Honduras'
    ],
    sku: 'DYN-HN-001',
    category: 'International Plans',
    type: 'special',
    country: 'Honduras'
  }
];

export const allPlans = [...domesticPlans, ...specialPlans];

export const getPlanBySlug = (slug: string): Plan | undefined => {
  return allPlans.find(plan => plan.slug === slug);
};

export const getRelatedPlans = (currentPlanId: string, count: number = 4): Plan[] => {
  return allPlans.filter(plan => plan.id !== currentPlanId).slice(0, count);
};