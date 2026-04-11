// components/decisions/PrLinkModal.tsx
'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import toast from 'react-hot-toast';
import { addPrLink, PrLink } from '@/lib/api';

interface PrLinkModalProps {
  decisionId: string;
  repoFullName: string;
  onClose: () => void;
  onLinked: (link: PrLink) => void;
}

export default function PrLinkModal({ decisionId, repoFullName, onClose, onLinked }: PrLinkModalProps) {
  const [prNumber, setPrNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!prNumber.trim()) {
      setError('PR number is required');
      return;
    }

    const num = parseInt(prNumber, 10);
    if (isNaN(num) || num <= 0) {
      setError('Please enter a valid PR number');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const link = await addPrLink(decisionId, {
        prNumber: num,
        prRepoFullName: repoFullName,
      });
      
      onLinked(link);
      toast.success('PR linked successfully!');
      onClose();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to link PR';
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Link a Pull Request</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Repository
            </label>
            <input
              type="text"
              value={repoFullName}
              readOnly
              className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md text-gray-600"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              PR Number *
            </label>
            <input
              type="number"
              value={prNumber}
              onChange={(e) => setPrNumber(e.target.value)}
              placeholder="e.g., 123"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              min="1"
            />
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Linking...' : 'Link PR'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
