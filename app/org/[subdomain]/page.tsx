import { notFound, redirect } from 'next/navigation';
import { isValidSubdomain } from '@/lib/utils/subdomain';

interface OrganizationPageProps {
  params: Promise<{ subdomain: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function OrganizationPage({ params, searchParams }: OrganizationPageProps) {
  const { subdomain } = await params;
  if (!isValidSubdomain(subdomain)) notFound();

  const query = new URLSearchParams();
  for (const [name, value] of Object.entries(await searchParams)) {
    for (const item of [value].flat()) {
      if (item !== undefined) query.append(name, item);
    }
  }

  const search = query.size ? `?${query.toString()}` : '';
  redirect(`/org/${subdomain}/login${search}`);
}
