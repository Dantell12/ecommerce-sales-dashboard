import type { TopProduct } from '../../../domain/analytics';

export interface TopProductsBothResponseDto {
  byGmv: TopProduct[];
  byRevenue: TopProduct[];
}

export type TopProductsResponseDto = TopProduct[] | TopProductsBothResponseDto;
