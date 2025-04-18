import AdmissionSearch from '@/components/admission-search';

export const metadata = {
  title: 'Admission Data Search',
  description: 'Search and view student admission data',
};

export default function AdmissionSearchPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Admission Data Search</h1>
      <p className="mb-6 text-muted-foreground">
        Search through the admission data to find information about students.
      </p>
      <AdmissionSearch />
    </div>
  );
} 