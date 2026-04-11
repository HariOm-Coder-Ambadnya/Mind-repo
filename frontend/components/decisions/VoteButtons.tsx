// components/decisions/VoteButtons.tsx
'use client';

import { useState, useCallback } from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';
import toast from 'react-hot-toast';
import { vote } from '@/lib/api';

interface VoteButtonsProps {
  decisionId: string;
  score: number;
  userVote: number | null;
}

export default function VoteButtons({ decisionId, score, userVote }: VoteButtonsProps) {
  const [optimisticScore, setOptimisticScore] = useState(score);
  const [optimisticUserVote, setOptimisticUserVote] = useState<number | null>(userVote);

  const handleVote = useCallback(async (voteValue: 1 | -1) => {
    const newVote = optimisticUserVote === voteValue ? 0 : voteValue;
    
    // Calculate new score
    let scoreDelta = 0;
    if (optimisticUserVote === null || optimisticUserVote === 0) {
      scoreDelta = newVote;
    } else if (optimisticUserVote === voteValue) {
      scoreDelta = -optimisticUserVote;
    } else {
      scoreDelta = newVote * 2;
    }
    
    // Optimistic update
    setOptimisticScore(optimisticScore + scoreDelta);
    setOptimisticUserVote(newVote);

    try {
      const result = await vote(decisionId, newVote as -1 | 0 | 1);
      
      // Sync with actual server response
      setOptimisticScore(result.newScore);
      setOptimisticUserVote(result.userVote);
    } catch (error) {
      // Revert on error
      setOptimisticScore(score);
      setOptimisticUserVote(userVote);
      toast.error('Failed to vote. Please try again.');
    }
  }, [decisionId, optimisticScore, optimisticUserVote, score, userVote]);

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => handleVote(1)}
        className={`p-1 rounded hover:bg-gray-100 transition-colors ${
          optimisticUserVote === 1 ? 'text-green-600' : 'text-gray-500'
        }`}
        aria-label="Upvote"
      >
        <ArrowUp className={`h-5 w-5 ${optimisticUserVote === 1 ? 'fill-current' : ''}`} />
      </button>
      
      <span className={`font-medium min-w-[1.5rem] text-center ${
        optimisticScore > 0 ? 'text-green-600' : 
        optimisticScore < 0 ? 'text-red-600' : 'text-gray-600'
      }`}>
        {optimisticScore}
      </span>
      
      <button
        onClick={() => handleVote(-1)}
        className={`p-1 rounded hover:bg-gray-100 transition-colors ${
          optimisticUserVote === -1 ? 'text-red-600' : 'text-gray-500'
        }`}
        aria-label="Downvote"
      >
        <ArrowDown className={`h-5 w-5 ${optimisticUserVote === -1 ? 'fill-current' : ''}`} />
      </button>
    </div>
  );
}
