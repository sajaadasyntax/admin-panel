export interface User {
  id: string
  username: string
  createdAt: string
  updatedAt: string
}

export interface Neighborhood {
  id: string
  name: string
  createdAt: string
  updatedAt: string
  squares?: Square[]
}

export interface Square {
  id: string
  name: string
  neighborhoodId: string
  createdAt: string
  updatedAt: string
  neighborhood?: Neighborhood
  houses?: House[]
}

export interface House {
  id: string
  houseNumber: string
  ownerName: string
  ownerPhone: string
  isOccupied: boolean
  hasPaid: boolean
  paymentType: PaymentType
  requiredAmount?: number
  receiptImage?: string
  squareId: string
  createdAt: string
  updatedAt: string
  square?: Square
}

export enum PaymentType {
  SMALL_METER = 'SMALL_METER',
  MEDIUM_METER = 'MEDIUM_METER',
  LARGE_METER = 'LARGE_METER'
}

export interface PaymentTypeConfig {
  id: PaymentType
  name: string
  amount: number
  color: string
}

export const PAYMENT_TYPES: Record<PaymentType, PaymentTypeConfig> = {
  [PaymentType.SMALL_METER]: {
    id: PaymentType.SMALL_METER,
    name: 'عداد صغير',
    amount: 5000,
    color: '#4CAF50',
  },
  [PaymentType.MEDIUM_METER]: {
    id: PaymentType.MEDIUM_METER,
    name: 'عداد متوسط',
    amount: 10000,
    color: '#FF9800',
  },
  [PaymentType.LARGE_METER]: {
    id: PaymentType.LARGE_METER,
    name: 'عداد كبير',
    amount: 15000,
    color: '#F44336',
  },
}

export interface LoginCredentials {
  username: string
  password: string
}

export interface AuthResponse {
  token: string
  userId: string
  username: string
}
