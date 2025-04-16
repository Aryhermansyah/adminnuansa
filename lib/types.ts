/**
 * Tipe untuk parameter pada halaman Next.js 15.3+
 */
export interface PageProps {
  params: Record<string, string>;
  searchParams?: Record<string, string | string[] | undefined>;
} 