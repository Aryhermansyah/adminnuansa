/**
 * Tipe khusus untuk Next.js 15.3 yang kompatibel dengan versi TypeScript yang digunakan
 */

export interface SearchParams {
  [key: string]: string | string[] | undefined;
}

export interface NextParams {
  [key: string]: string;
}

export interface PageProps {
  params: NextParams;
  searchParams?: SearchParams;
}

export type SimplePageProps = {
  params: Record<string, string>;
} 