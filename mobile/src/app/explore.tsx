import React from 'react';
import { Platform, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MapPin, Globe, Trophy, Calendar } from 'lucide-react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Collapsible } from '@/components/ui/collapsible';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export default function ExploreScreen() {
  const safeAreaInsets = useSafeAreaInsets();
  const insets = {
    ...safeAreaInsets,
    bottom: safeAreaInsets.bottom + BottomTabInset + Spacing.three,
  };
  const theme = useTheme();

  const contentPlatformStyle = Platform.select({
    android: {
      paddingTop: insets.top,
      paddingLeft: insets.left,
      paddingRight: insets.right,
      paddingBottom: insets.bottom,
    },
    web: {
      paddingTop: Spacing.six,
      paddingBottom: Spacing.four,
    },
  });

  return (
    <ScrollView
      style={[styles.scrollView, { backgroundColor: theme.background }]}
      contentInset={insets}
      contentContainerStyle={[styles.contentContainer, contentPlatformStyle]}
    >
      <ThemedView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Trophy size={40} color="#D4AF37" style={styles.headerIcon} />
          <ThemedText type="subtitle" style={styles.headerTitle}>
            Tournament Guide
          </ThemedText>
          <ThemedText style={styles.subtitleText} themeColor="textSecondary">
            Explore 2026 World Cup Groups, Venues, and Format.
          </ThemedText>
        </View>

        <View style={styles.sectionsWrapper}>
          {/* Section 1: Tournament Groups */}
          <Collapsible title="🏆 Tournament Groups">
            <View style={styles.groupContainer}>
              <View style={styles.groupCard}>
                <ThemedText type="smallBold" style={styles.groupTitle}>Group A</ThemedText>
                <ThemedText type="small">🇺🇸 United States</ThemedText>
                <ThemedText type="small">🇲🇽 Mexico</ThemedText>
                <ThemedText type="small">🇨🇦 Canada</ThemedText>
                <ThemedText type="small" style={styles.teamPlaceholder}>TBD</ThemedText>
              </View>

              <View style={styles.groupCard}>
                <ThemedText type="smallBold" style={styles.groupTitle}>Group B</ThemedText>
                <ThemedText type="small">🏴󠁧󠁢󠁥󠁮󠁧󠁿 England</ThemedText>
                <ThemedText type="small">🇧🇷 Brazil</ThemedText>
                <ThemedText type="small" style={styles.teamPlaceholder}>TBD</ThemedText>
                <ThemedText type="small" style={styles.teamPlaceholder}>TBD</ThemedText>
              </View>

              <View style={styles.groupCard}>
                <ThemedText type="smallBold" style={styles.groupTitle}>Group C</ThemedText>
                <ThemedText type="small">🇦🇷 Argentina</ThemedText>
                <ThemedText type="small">🇫🇷 France</ThemedText>
                <ThemedText type="small" style={styles.teamPlaceholder}>TBD</ThemedText>
                <ThemedText type="small" style={styles.teamPlaceholder}>TBD</ThemedText>
              </View>

              <View style={styles.groupCard}>
                <ThemedText type="smallBold" style={styles.groupTitle}>Group D</ThemedText>
                <ThemedText type="small">🇩🇪 Germany</ThemedText>
                <ThemedText type="small">🇪🇸 Spain</ThemedText>
                <ThemedText type="small" style={styles.teamPlaceholder}>TBD</ThemedText>
                <ThemedText type="small" style={styles.teamPlaceholder}>TBD</ThemedText>
              </View>

              <View style={styles.groupCard}>
                <ThemedText type="smallBold" style={styles.groupTitle}>Group E</ThemedText>
                <ThemedText type="small">🇮🇹 Italy</ThemedText>
                <ThemedText type="small">🇯🇵 Japan</ThemedText>
                <ThemedText type="small" style={styles.teamPlaceholder}>TBD</ThemedText>
                <ThemedText type="small" style={styles.teamPlaceholder}>TBD</ThemedText>
              </View>

              <View style={styles.groupCard}>
                <ThemedText type="smallBold" style={styles.groupTitle}>Group F</ThemedText>
                <ThemedText type="small">🇸🇳 Senegal</ThemedText>
                <ThemedText type="small" style={styles.teamPlaceholder}>TBD</ThemedText>
                <ThemedText type="small" style={styles.teamPlaceholder}>TBD</ThemedText>
                <ThemedText type="small" style={styles.teamPlaceholder}>TBD</ThemedText>
              </View>
            </View>
          </Collapsible>

          {/* Section 2: Host Cities & Stadiums */}
          <Collapsible title="📍 Host Cities & Stadiums">
            <View style={styles.stadiumsContainer}>
              <ThemedText type="smallBold" style={styles.regionTitle}>🇺🇸 United States</ThemedText>
              <View style={styles.stadiumRow}>
                <MapPin size={14} color="#D4AF37" />
                <ThemedText type="small">MetLife Stadium (East Rutherford, NJ)</ThemedText>
              </View>
              <View style={styles.stadiumRow}>
                <MapPin size={14} color="#D4AF37" />
                <ThemedText type="small">SoFi Stadium (Los Angeles, CA)</ThemedText>
              </View>
              <View style={styles.stadiumRow}>
                <MapPin size={14} color="#D4AF37" />
                <ThemedText type="small">AT&T Stadium (Arlington, TX)</ThemedText>
              </View>
              <View style={styles.stadiumRow}>
                <MapPin size={14} color="#D4AF37" />
                <ThemedText type="small">Hard Rock Stadium (Miami, FL)</ThemedText>
              </View>
              <View style={styles.stadiumRow}>
                <MapPin size={14} color="#D4AF37" />
                <ThemedText type="small">Lumen Field (Seattle, WA)</ThemedText>
              </View>

              <ThemedText type="smallBold" style={[styles.regionTitle, { marginTop: Spacing.two }]}>🇲🇽 Mexico</ThemedText>
              <View style={styles.stadiumRow}>
                <MapPin size={14} color="#D4AF37" />
                <ThemedText type="small">Estadio Azteca (Mexico City)</ThemedText>
              </View>
              <View style={styles.stadiumRow}>
                <MapPin size={14} color="#D4AF37" />
                <ThemedText type="small">Estadio BBVA (Monterrey)</ThemedText>
              </View>
              <View style={styles.stadiumRow}>
                <MapPin size={14} color="#D4AF37" />
                <ThemedText type="small">Estadio Akron (Guadalajara)</ThemedText>
              </View>

              <ThemedText type="smallBold" style={[styles.regionTitle, { marginTop: Spacing.two }]}>🇨🇦 Canada</ThemedText>
              <View style={styles.stadiumRow}>
                <MapPin size={14} color="#D4AF37" />
                <ThemedText type="small">BC Place (Vancouver)</ThemedText>
              </View>
              <View style={styles.stadiumRow}>
                <MapPin size={14} color="#D4AF37" />
                <ThemedText type="small">BMO Field (Toronto)</ThemedText>
              </View>
            </View>
          </Collapsible>

          {/* Section 3: Tournament Format */}
          <Collapsible title="ℹ️ Tournament Format">
            <View style={styles.formatContainer}>
              <View style={styles.infoRow}>
                <Globe size={16} color={theme.text} />
                <ThemedText type="small">
                  The 2026 World Cup will be the first to feature <ThemedText type="smallBold">48 teams</ThemedText> (up from 32).
                </ThemedText>
              </View>
              <View style={styles.infoRow}>
                <Calendar size={16} color={theme.text} />
                <ThemedText type="small">
                  Teams will be divided into <ThemedText type="smallBold">12 groups of 4</ThemedText>.
                </ThemedText>
              </View>
              <View style={styles.infoRow}>
                <Trophy size={16} color={theme.text} />
                <ThemedText type="small">
                  The top 2 from each group plus the 8 best 3rd-place teams will advance to a new <ThemedText type="smallBold">Round of 32</ThemedText>.
                </ThemedText>
              </View>
            </View>
          </Collapsible>
        </View>
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  container: {
    maxWidth: MaxContentWidth,
    flexGrow: 1,
    paddingBottom: Spacing.four,
  },
  header: {
    alignItems: 'center',
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.six,
    paddingBottom: Spacing.four,
    gap: Spacing.two,
  },
  headerIcon: {
    marginBottom: Spacing.one,
  },
  headerTitle: {
    fontWeight: 'bold',
    fontSize: 24,
  },
  subtitleText: {
    textAlign: 'center',
    fontSize: 14,
  },
  sectionsWrapper: {
    gap: Spacing.four,
    paddingHorizontal: Spacing.four,
  },
  groupContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: Spacing.two,
    paddingVertical: Spacing.two,
  },
  groupCard: {
    width: '48%',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: Spacing.two,
    padding: Spacing.three,
    gap: 4,
  },
  groupTitle: {
    fontSize: 13,
    color: '#D4AF37',
    marginBottom: 4,
  },
  teamPlaceholder: {
    opacity: 0.3,
  },
  stadiumsContainer: {
    paddingVertical: Spacing.two,
    gap: 8,
  },
  regionTitle: {
    fontSize: 13,
    opacity: 0.8,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
    paddingBottom: 4,
    marginBottom: 4,
  },
  stadiumRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingLeft: Spacing.one,
  },
  formatContainer: {
    paddingVertical: Spacing.two,
    gap: Spacing.three,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.two,
  },
});
