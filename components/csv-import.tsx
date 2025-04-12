import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';

export function CSVImport() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const text = e.target?.result;
        if (typeof text !== 'string') return;

        const rows = text.split('\n').map(row => {
          const [name, surname, email, father_name, occupation, category, religion, subcast, image_url, github_url, twitter_url, linkedin_url, instagram_url] = row.split(',');
          return {
            name: name?.trim(),
            surname: surname?.trim(),
            email: email?.trim(),
            father_name: father_name?.trim(),
            occupation: occupation?.trim(),
            category: category?.trim(),
            religion: religion?.trim(),
            subcast: subcast?.trim(),
            image_url: image_url?.trim(),
            github_url: github_url?.trim(),
            twitter_url: twitter_url?.trim(),
            linkedin_url: linkedin_url?.trim(),
            instagram_url: instagram_url?.trim()
          };
        }).filter(row => row.name);

        const { error } = await supabase.from('student_data').insert(rows);
        
        if (error) throw error;

        toast({
          title: 'Success',
          description: 'CSV data imported successfully',
        });
      };

      reader.readAsText(file);
    } catch (error) {
      console.error('Error importing CSV:', error);
      toast({
        title: 'Error',
        description: 'Failed to import CSV data',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center p-4">
      <label className="relative">
        <input
          type="file"
          accept=".csv"
          onChange={handleFileUpload}
          className="hidden"
          disabled={isLoading}
        />
        <Button
          variant="outline"
          className="cursor-pointer"
          disabled={isLoading}
        >
          <Upload className="h-4 w-4 mr-2" />
          {isLoading ? 'Importing...' : 'Import CSV'}
        </Button>
      </label>
    </div>
  );
}