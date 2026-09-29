export const isMockMode =
  process.env.NEXT_PUBLIC_USE_MOCK === 'true' ||
  !process.env.NEXT_PUBLIC_API_URL ||
  process.env.NEXT_PUBLIC_USE_MOCK === undefined;
