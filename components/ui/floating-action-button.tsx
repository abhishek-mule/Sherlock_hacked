'use client';

import React from 'react';
import { PlusIcon } from 'lucide-react';
import { AddStudentDialog } from './add-student-dialog';

interface FloatingActionButtonProps {
  onSuccess?: () => void;
}

export function FloatingActionButton({ onSuccess }: FloatingActionButtonProps) {
  return (
    <div className="fixed bottom-6 right-6">
      <AddStudentDialog 
        onSuccess={onSuccess}
        trigger={
          <button 
            className="flex items-center justify-center h-14 w-14 rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 transition-colors"
            aria-label="Add student"
          >
            <PlusIcon className="h-6 w-6" />
          </button>
        }
      />
    </div>
  );
} 