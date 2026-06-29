import React, { useState, useEffect, useMemo } from 'react';
import {
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  View,
  ActivityIndicator,
  FlatList,
  Animated,
  Platform,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { Calendar, MapPin, Clock, Trophy, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing, Colors } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useMatches } from '@/hooks/use-matches';
import { Match, MatchEvent } from '@/services/api';

// Helper to format date explicitly to Eastern Time (EST/EDT)
const formatToET = (dateInput: string | Date) => {
  const date = new Date(dateInput);
  return date.toLocaleTimeString('en-US', {
    timeZone: 'America/New_York',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }) + ' ET';
};

// Generate a list of dates around June 28, 2026 for the calendar bar
const AVAILABLE_DATES = [
  { day: 'Thu', date: '25', full: '2026-06-25' },
  { day: 'Fri', date: '26', full: '2026-06-26' },
  { day: 'Sat', date: '27', full: '2026-06-27' },
  { day: 'Sun', date: '28', full: '2026-06-28', isToday: true },
  { day: 'Mon', date: '29', full: '2026-06-29' },
  { day: 'Tue', date: '30', full: '2026-06-30' },
  { day: 'Wed', date: '01', full: '2026-07-01' },
];

export default function HomeScreen() {
  const theme = useTheme();
  const [selectedDate, setSelectedDate] = useState('2026-06-28');
  const { matches, featuredMatch, isLoading, error, refetchAll } = useMatches(selectedDate);
  const [expandedMatchId, setExpandedMatchId] = useState<number | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Pulse animation for the LIVE badge
  const pulseAnim = useMemo(() => new Animated.Value(0.3), []);

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.3,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [pulseAnim]);

  const onRefresh = async () => {
    setRefreshing(true);
    await refetchAll();
    setRefreshing(false);
  };

  const toggleExpandMatch = (id: number) => {
    setExpandedMatchId(expandedMatchId === id ? null : id);
  };

  // Helper to format event icon/text
  const renderEventRow = (event: MatchEvent, homeTeamId: number) => {
    const isHomeEvent = event.teamId === homeTeamId;
    let icon = '⚽';
    if (event.type === 'YELLOW_CARD') icon = '🟨';
    if (event.type === 'RED_CARD') icon = '🟥';
    if (event.type === 'SUB') icon = '🔄';

    return (
      <View
        key={event.id}
        style={[
          styles.eventRow,
          isHomeEvent ? styles.eventRowHome : styles.eventRowAway,
        ]}
        accessible={true}
        accessibilityLabel={`${event.playerName}, ${event.type.toLowerCase().replace('_', ' ')} in the ${event.minute} minute`}
      >
        <ThemedText type="small" style={styles.eventText}>
          {icon} {event.minute}' {event.playerName}
        </ThemedText>
      </View>
    );
  };

  // Build screen reader announcements for the featured match
  const getFeaturedMatchAccessibilityLabel = (match: Match) => {
    const statusText = match.status === 'LIVE' ? `Live, ${match.minute} minutes played.` : match.status;
    const scoreText = `${match.homeTeam.name} ${match.homeScore}, ${match.awayTeam.name} ${match.awayScore}.`;
    const eventsText = match.events && match.events.length > 0
      ? `Events: ${match.events.map(e => `${e.playerName} scored a ${e.type.replace('_', ' ')} at ${e.minute} minutes`).join(', ')}`
      : 'No goals or cards yet.';
    return `Featured Match: ${scoreText} Status: ${statusText} Venue: ${match.venue}. ${eventsText}`;
  };

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <Trophy size={28} color="#D4AF37" style={styles.headerIcon} />
          <ThemedText type="subtitle" style={styles.headerTitle}>
            FIFA 2026 TRACKER
          </ThemedText>
        </View>

        {/* Date Navigation Bar */}
        <View style={styles.dateBarContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.dateBar}
          >
            {AVAILABLE_DATES.map((d) => {
              const isSelected = selectedDate === d.full;
              return (
                <TouchableOpacity
                  key={d.full}
                  style={[
                    styles.dateCard,
                    isSelected && { backgroundColor: theme.backgroundSelected },
                    d.isToday && styles.todayCard,
                  ]}
                  onPress={() => setSelectedDate(d.full)}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel={`${d.day} June ${d.date}${d.isToday ? ', Today' : ''}`}
                  accessibilityState={{ selected: isSelected }}
                >
                  <ThemedText
                    type="small"
                    style={[
                      styles.dateDay,
                      isSelected && styles.selectedText,
                      d.isToday && { color: '#D4AF37' },
                    ]}
                  >
                    {d.day}
                  </ThemedText>
                  <ThemedText
                    type="default"
                    style={[
                      styles.dateNumber,
                      isSelected && styles.selectedText,
                      d.isToday && { color: '#D4AF37', fontWeight: 'bold' },
                    ]}
                  >
                    {d.date}
                  </ThemedText>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Main Content */}
        <ScrollView
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.text} />
          }
          contentContainerStyle={styles.scrollContent}
        >
          {/* Featured Game Section */}
          {featuredMatch && (
            <View style={styles.featuredContainer}>
              <ThemedText type="smallBold" style={styles.sectionTitle}>
                FEATURED MATCH
              </ThemedText>
              
              <TouchableOpacity
                activeOpacity={0.9}
                style={[styles.featuredCard, { backgroundColor: theme.backgroundElement }]}
                accessible={true}
                accessibilityLabel={getFeaturedMatchAccessibilityLabel(featuredMatch)}
                accessibilityHint="Double tap to view match details"
              >
                {/* Live Badge & Venue */}
                <View style={styles.featuredHeader}>
                  {featuredMatch.status === 'LIVE' ? (
                    <View style={styles.liveBadgeContainer}>
                      <Animated.View style={[styles.liveDot, { opacity: pulseAnim }]} />
                      <ThemedText type="smallBold" style={styles.liveText}>
                        LIVE - {featuredMatch.minute}'
                      </ThemedText>
                    </View>
                  ) : (
                    <ThemedText type="smallBold" style={styles.statusBadge}>
                      {featuredMatch.status === 'UPCOMING'
                        ? `UPCOMING - ${formatToET(featuredMatch.kickoffTime)}`
                        : featuredMatch.status}
                    </ThemedText>
                  )}
                  <View style={styles.venueContainer}>
                    <MapPin size={12} color={theme.textSecondary} />
                    <ThemedText type="small" style={styles.venueText} numberOfLines={1}>
                      {featuredMatch.venue}
                    </ThemedText>
                  </View>
                </View>

                {/* Scoreboard */}
                <View style={styles.scoreboard}>
                  {/* Home Team */}
                  <View style={styles.teamContainer}>
                    <Image
                      source={{ uri: featuredMatch.homeTeam.flagUrl }}
                      style={styles.largeFlag}
                      contentFit="cover"
                      transition={300}
                    />
                    <ThemedText type="default" style={styles.teamName}>
                      {featuredMatch.homeTeam.name}
                    </ThemedText>
                    <ThemedText type="small" style={styles.teamCode}>
                      {featuredMatch.homeTeam.code}
                    </ThemedText>
                  </View>

                  {/* Score */}
                  <View style={styles.scoreContainer}>
                    <ThemedText type="subtitle" style={styles.scoreText}>
                      {featuredMatch.homeScore} - {featuredMatch.awayScore}
                    </ThemedText>
                    <ThemedText type="small" style={styles.vsText}>
                      VS
                    </ThemedText>
                  </View>

                  {/* Away Team */}
                  <View style={styles.teamContainer}>
                    <Image
                      source={{ uri: featuredMatch.awayTeam.flagUrl }}
                      style={styles.largeFlag}
                      contentFit="cover"
                      transition={300}
                    />
                    <ThemedText type="default" style={styles.teamName}>
                      {featuredMatch.awayTeam.name}
                    </ThemedText>
                    <ThemedText type="small" style={styles.teamCode}>
                      {featuredMatch.awayTeam.code}
                    </ThemedText>
                  </View>
                </View>

                {/* Featured Match Events */}
                {featuredMatch.events && featuredMatch.events.length > 0 && (
                  <View style={styles.featuredEvents}>
                    <View style={styles.divider} />
                    <ThemedText type="smallBold" style={styles.eventsTitle}>
                      MATCH EVENTS
                    </ThemedText>
                    <View style={styles.eventsList}>
                      {featuredMatch.events.map((e) => renderEventRow(e, featuredMatch.homeTeamId))}
                    </View>
                  </View>
                )}
              </TouchableOpacity>
            </View>
          )}

          {/* Daily Games List */}
          <View style={styles.listContainer}>
            <ThemedText type="smallBold" style={styles.sectionTitle}>
              ALL GAMES ON THIS DAY
            </ThemedText>

            {isLoading ? (
              <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color={theme.text} />
                <ThemedText type="small" style={styles.loadingText}>
                  Loading games...
                </ThemedText>
              </View>
            ) : error ? (
              <View style={styles.errorContainer}>
                <AlertCircle size={32} color="#FF3B30" />
                <ThemedText type="default" style={styles.errorText}>
                  Could not load games. Please check your connection.
                </ThemedText>
              </View>
            ) : matches.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Calendar size={48} color={theme.textSecondary} />
                <ThemedText type="default" style={styles.emptyText}>
                  No games scheduled for this date.
                </ThemedText>
              </View>
            ) : (
              matches.map((match) => {
                const isExpanded = expandedMatchId === match.id;
                const localTimeStr = formatToET(match.kickoffTime);

                return (
                  <TouchableOpacity
                    key={match.id}
                    activeOpacity={0.8}
                    style={[styles.matchCard, { backgroundColor: theme.backgroundElement }]}
                    onPress={() => toggleExpandMatch(match.id)}
                    accessible={true}
                    accessibilityRole="button"
                    accessibilityLabel={`${match.homeTeam.name} versus ${match.awayTeam.name}. Score: ${match.homeScore} to ${match.awayScore}. Status: ${match.status}. Venue: ${match.venue}.`}
                    accessibilityHint="Double tap to expand or collapse match events."
                  >
                    <View style={styles.matchMain}>
                      {/* Left: Time / Status */}
                      <View style={styles.matchTimeContainer}>
                        {match.status === 'LIVE' ? (
                          <View style={styles.liveBadgeMini}>
                            <Animated.View style={[styles.liveDot, { opacity: pulseAnim }]} />
                            <ThemedText type="smallBold" style={styles.liveTextMini}>
                              {match.minute}'
                            </ThemedText>
                          </View>
                        ) : match.status === 'FINISHED' ? (
                          <ThemedText type="smallBold" style={styles.finishedText}>
                            FT
                          </ThemedText>
                        ) : (
                          <View style={styles.upcomingTime}>
                            <Clock size={12} color={theme.textSecondary} />
                            <ThemedText type="smallBold" style={styles.timeText}>
                              {localTimeStr}
                            </ThemedText>
                          </View>
                        )}
                      </View>

                      {/* Center: Teams & Scores */}
                      <View style={styles.matchTeamsContainer}>
                        {/* Home */}
                        <View style={styles.matchTeamRow}>
                          <Image
                            source={{ uri: match.homeTeam.flagUrl }}
                            style={styles.miniFlag}
                            contentFit="cover"
                            transition={200}
                          />
                          <ThemedText type="default" style={styles.matchTeamName} numberOfLines={1}>
                            {match.homeTeam.name}
                          </ThemedText>
                          {(match.status === 'LIVE' || match.status === 'FINISHED') && (
                            <ThemedText type="default" style={styles.matchScore}>
                              {match.homeScore}
                            </ThemedText>
                          )}
                        </View>

                        {/* Away */}
                        <View style={styles.matchTeamRow}>
                          <Image
                            source={{ uri: match.awayTeam.flagUrl }}
                            style={styles.miniFlag}
                            contentFit="cover"
                            transition={200}
                          />
                          <ThemedText type="default" style={styles.matchTeamName} numberOfLines={1}>
                            {match.awayTeam.name}
                          </ThemedText>
                          {(match.status === 'LIVE' || match.status === 'FINISHED') && (
                            <ThemedText type="default" style={styles.matchScore}>
                              {match.awayScore}
                            </ThemedText>
                          )}
                        </View>
                      </View>

                      {/* Right: Expand Arrow */}
                      <View style={styles.expandIconContainer}>
                        {isExpanded ? (
                          <ChevronUp size={20} color={theme.textSecondary} />
                        ) : (
                          <ChevronDown size={20} color={theme.textSecondary} />
                        )}
                      </View>
                    </View>

                    {/* Collapsible Match Events */}
                    {isExpanded && (
                      <View style={styles.expandedContent}>
                        <View style={styles.cardDivider} />
                        <View style={styles.venueRow}>
                          <MapPin size={12} color={theme.textSecondary} />
                          <ThemedText type="small" style={styles.venueTextMini}>
                            {match.venue}
                          </ThemedText>
                        </View>

                        {match.events && match.events.length > 0 ? (
                          <View style={styles.expandedEventsList}>
                            {match.events.map((e) => renderEventRow(e, match.homeTeamId))}
                          </View>
                        ) : (
                          <ThemedText type="small" style={styles.noEventsText}>
                            No match events recorded.
                          </ThemedText>
                        )}
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.three,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  headerIcon: {
    marginRight: Spacing.two,
  },
  headerTitle: {
    letterSpacing: 2,
    fontWeight: 'bold',
    fontSize: 20,
  },
  dateBarContainer: {
    paddingVertical: Spacing.two,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  dateBar: {
    paddingHorizontal: Spacing.three,
    gap: Spacing.two,
  },
  dateCard: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
    borderRadius: Spacing.two,
    minWidth: 55,
  },
  todayCard: {
    borderWidth: 1,
    borderColor: '#D4AF37',
  },
  dateDay: {
    fontSize: 12,
    textTransform: 'uppercase',
    opacity: 0.6,
  },
  dateNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 2,
  },
  selectedText: {
    fontWeight: 'bold',
  },
  scrollContent: {
    padding: Spacing.three,
    paddingBottom: Spacing.six,
  },
  sectionTitle: {
    fontSize: 12,
    letterSpacing: 1.5,
    opacity: 0.7,
    marginBottom: Spacing.two,
  },
  featuredContainer: {
    marginBottom: Spacing.four,
  },
  featuredCard: {
    borderRadius: Spacing.three,
    padding: Spacing.three,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
  },
  featuredHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.three,
  },
  liveBadgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 59, 48, 0.15)',
    paddingVertical: 4,
    paddingHorizontal: Spacing.two,
    borderRadius: 4,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF3B30',
    marginRight: 6,
  },
  liveText: {
    color: '#FF3B30',
    fontSize: 11,
  },
  statusBadge: {
    fontSize: 11,
    opacity: 0.8,
    backgroundColor: '#333',
    paddingVertical: 4,
    paddingHorizontal: Spacing.two,
    borderRadius: 4,
  },
  venueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    maxWidth: '60%',
    gap: 4,
  },
  venueText: {
    fontSize: 12,
    opacity: 0.8,
  },
  scoreboard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: Spacing.two,
  },
  teamContainer: {
    alignItems: 'center',
    width: '35%',
  },
  largeFlag: {
    width: 60,
    height: 40,
    borderRadius: 6,
    marginBottom: Spacing.two,
    backgroundColor: '#333',
  },
  teamName: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  teamCode: {
    fontSize: 11,
    opacity: 0.6,
    marginTop: 2,
  },
  scoreContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '30%',
  },
  scoreText: {
    fontSize: 32,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  vsText: {
    fontSize: 10,
    opacity: 0.4,
    marginTop: Spacing.one,
    fontWeight: 'bold',
  },
  divider: {
    height: 1,
    backgroundColor: '#333',
    marginVertical: Spacing.three,
  },
  featuredEvents: {
    marginTop: Spacing.one,
  },
  eventsTitle: {
    fontSize: 11,
    letterSpacing: 1,
    opacity: 0.5,
    marginBottom: Spacing.two,
  },
  eventsList: {
    gap: 8,
  },
  eventRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 2,
  },
  eventRowHome: {
    justifyContent: 'flex-start',
  },
  eventRowAway: {
    justifyContent: 'flex-end',
  },
  eventText: {
    fontSize: 13,
  },
  listContainer: {
    marginTop: Spacing.two,
  },
  centerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.five,
  },
  loadingText: {
    marginTop: Spacing.two,
    opacity: 0.6,
  },
  errorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.five,
    gap: Spacing.two,
  },
  errorText: {
    color: '#FF3B30',
    textAlign: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.five,
    opacity: 0.5,
    gap: Spacing.two,
  },
  emptyText: {
    textAlign: 'center',
  },
  matchCard: {
    borderRadius: Spacing.two,
    marginBottom: Spacing.two,
    overflow: 'hidden',
    borderWidth: Platform.select({ web: 1 }) ? 1 : 0,
    borderColor: '#333',
  },
  matchMain: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.three,
  },
  matchTimeContainer: {
    width: 60,
    alignItems: 'flex-start',
  },
  liveBadgeMini: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 59, 48, 0.15)',
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 4,
  },
  liveTextMini: {
    color: '#FF3B30',
    fontSize: 10,
  },
  finishedText: {
    color: '#4CD964',
    fontSize: 12,
    backgroundColor: 'rgba(76, 217, 100, 0.15)',
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 4,
  },
  upcomingTime: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timeText: {
    fontSize: 12,
  },
  matchTeamsContainer: {
    flex: 1,
    gap: Spacing.one,
  },
  matchTeamRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  miniFlag: {
    width: 24,
    height: 16,
    borderRadius: 2,
    marginRight: Spacing.two,
    backgroundColor: '#333',
  },
  matchTeamName: {
    fontSize: 14,
    flex: 1,
  },
  matchScore: {
    fontSize: 15,
    fontWeight: 'bold',
    paddingHorizontal: Spacing.two,
  },
  expandIconContainer: {
    paddingLeft: Spacing.two,
  },
  expandedContent: {
    paddingHorizontal: Spacing.three,
    paddingBottom: Spacing.three,
  },
  cardDivider: {
    height: 1,
    backgroundColor: '#2A2B2E',
    marginBottom: Spacing.two,
  },
  venueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: Spacing.two,
  },
  venueTextMini: {
    fontSize: 11,
    opacity: 0.6,
  },
  expandedEventsList: {
    gap: 6,
  },
  noEventsText: {
    fontSize: 12,
    opacity: 0.4,
    fontStyle: 'italic',
});
