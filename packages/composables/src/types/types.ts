import { AgnosticAttribute } from '@vue-storefront/core';
import { ProductCollection, CollectionResult, FacetValueResult, SearchResult } from '@vue-storefront/vendure-api';

export type TODO = any;

export type UseBillingAddParams = TODO;

export type UseCategorySearchParams = TODO;

export type UseFacetSearchParams = TODO;

export type UseProductSearchParams = TODO;

export type UseReviewSearchParams = TODO;

export type UseReviewAddParams = TODO;

export type UseShippingAddParams = TODO;

export type UseUserUpdateParams = TODO;

export type UseUserRegisterParams = TODO;

export type useUserOrderSearchParams = TODO;

export type AgnosticProductVariant = {
  _id: string,
  _variantId?: string,
  _description: string,
  _categoriesRef: string[],
  name: string,
  sku: string,
  slug: string,
  images: string [],
  collections?: ProductCollection[],
  price: {
    original: number,
    current: number
  },
};

export type AgnosticProductOptions = {
  id?: string,
  value?: string;
  label?: string;
  options?: AgnosticAttribute[] & {
    id?: string
  };
  __typename?: string;
}

export type AgnosticSearchResult = {
  products: SearchResult[];
  categories: CollectionResult[];
  facets: FacetValueResult[];
  total: number;
  perPageOptions: number[];
  itemsPerPage: number;
}

export type AgnosticCategoryNavigation = {
  name: string;
  link: string;
}

export type SearchResultValue<SEARCH_DATA, SEARCH_INPUT> = {
  data?: SEARCH_DATA;
  input?: SEARCH_INPUT;
}

// TODO: Replace later with types from vendure-api after implementing api-client functions
export interface ForgotPasswordResult {
  resetPasswordResult: any;
  setNewPasswordResult: any;
}

export interface Error {
  name: string;
  message: string;
  stack?: string;
}

export { OrderAddress, Order, Address } from '@vue-storefront/vendure-api';
