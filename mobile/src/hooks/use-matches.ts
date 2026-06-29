import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchMatchesByDate, fetchFeaturedMatch, socket, Match } from '../services/api';

export function useMatches(dateStr: string) {
  const queryClient = useQueryClient();

  // Query for daily matches
  const {
    data: matches = [],
    isLoading: isLoadingMatches,
    error: matchesError,
    refetch: refetchMatches,
  } = useQuery<Match[]>({
    queryKey: ['matches', dateStr],
    queryFn: () => fetchMatchesByDate(dateStr),
    staleTime: 30000, // 30 seconds
  });

  // Query for the featured match
  const {
    data: featuredMatch,
    isLoading: isLoadingFeatured,
    error: featuredError,
    refetch: refetchFeatured,
  } = useQuery<Match>({
    queryKey: ['featuredMatch'],
    queryFn: fetchFeaturedMatch,
    staleTime: 30000,
  });

  // Listen for real-time WebSocket updates
  useEffect(() => {
    const handleMatchUpdate = (updatedMatch: Match) => {
      console.log(`[Socket] Received update for match ${updatedMatch.id}`);

      // 1. Update the featured match query if this is the featured match
      queryClient.setQueryData<Match>(['featuredMatch'], (oldFeatured) => {
        if (oldFeatured && oldFeatured.id === updatedMatch.id) {
          return updatedMatch;
        }
        // If the updated match is now marked as featured, update it
        if (updatedMatch.isFeatured) {
          return updatedMatch;
        }
        return oldFeatured;
      });

      // 2. Update the daily matches list if the match belongs to the currently selected date
      // We check if the kickoff time matches the current date string (YYYY-MM-DD)
      const matchDateStr = new Date(updatedMatch.kickoffTime).toISOString().split('T')[0];
      if (matchDateStr === dateStr) {
        queryClient.setQueryData<Match[]>(['matches', dateStr], (oldMatches = []) => {
          const exists = oldMatches.some((m) => m.id === updatedMatch.id);
          if (exists) {
            return oldMatches.map((m) => (m.id === updatedMatch.id ? updatedMatch : m));
          } else {
            // Insert and sort by kickoff time
            const newMatches = [...oldMatches, updatedMatch];
            return newMatches.sort(
              (a, b) => new Date(a.kickoffTime).getTime() - new Date(b.kickoffTime).getTime()
            );
          }
        });
      }
    };

    socket.on('matchUpdate', handleMatchUpdate);

    return () => {
      socket.off('matchUpdate', handleMatchUpdate);
    };
  }, [dateStr, queryClient]);

  return {
    matches,
    featuredMatch,
    isLoading: isLoadingMatches || isLoadingFeatured,
    error: matchesError || featuredError,
    refetchAll: () => {
      refetchMatches();
      refetchFeatured();
    },
  };
}
