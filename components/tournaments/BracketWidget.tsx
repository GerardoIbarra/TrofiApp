import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import { useTheme } from "@/context/ThemeContext";
import { useGetBracket } from "@/features/tournaments/services/playoffApi";
import { Trophy, ChevronRight, Settings } from "lucide-react-native";

interface Props {
  tournamentId: string;
  isAdmin?: boolean;
}

export function BracketWidget({ tournamentId, isAdmin }: Props) {
  const { theme, isDark } = useTheme();
  const styles = createStyles(theme, isDark);

  const { data: bracket, isLoading } = useGetBracket(tournamentId);
  const [stages, setStages] = useState<any[]>([]);

  useEffect(() => {
    if (bracket && bracket.slots) {
      // Group slots by stage
      const grouped = bracket.slots.reduce((acc: any, slot: any) => {
        if (!acc[slot.stage]) acc[slot.stage] = [];
        acc[slot.stage].push(slot);
        return acc;
      }, {});

      // Convert to array for rendering (usually order is qf -> sf -> f)
      const stageOrder = ['r16', 'qf', 'sf', '3rd', 'f'];
      const sortedStages = Object.keys(grouped)
        .sort((a, b) => stageOrder.indexOf(a) - stageOrder.indexOf(b))
        .map(key => ({
          name: key.toUpperCase(),
          slots: grouped[key]
        }));
      setStages(sortedStages);
    }
  }, [bracket]);

  if (isLoading) {
    return (
      <View style={styles.loadingBox}>
        <ActivityIndicator color={theme.primary} />
      </View>
    );
  }

  if (!bracket) {
    return (
      <View style={styles.emptyBox}>
        <Trophy size={40} color={theme.textSecondary} opacity={0.3} />
        <Text style={styles.emptyText}>El bracket aún no ha sido generado.</Text>
        {isAdmin && (
          <TouchableOpacity style={styles.generateBtn}>
            <Text style={styles.generateBtnText}>Generar Bracket</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.container}>
      {stages.map((stage, index) => (
        <View key={stage.name} style={styles.stageColumn}>
          <Text style={styles.stageTitle}>{stage.name}</Text>
          <View style={styles.slotsContainer}>
            {stage.slots.map((slot: any) => (
              <View key={slot.id || slot.slot_number} style={styles.slotBox}>
                <View style={[styles.teamRow, slot.winner === slot.home_team && styles.winnerRow]}>
                  <Text style={styles.teamName} numberOfLines={1}>{slot.home_team_name || "TBD"}</Text>
                  <Text style={styles.score}>{slot.match?.result?.home_score ?? "-"}</Text>
                </View>
                <View style={styles.divider} />
                <View style={[styles.teamRow, slot.winner === slot.away_team && styles.winnerRow]}>
                  <Text style={styles.teamName} numberOfLines={1}>{slot.away_team_name || "TBD"}</Text>
                  <Text style={styles.score}>{slot.match?.result?.away_score ?? "-"}</Text>
                </View>
                {isAdmin && (
                  <TouchableOpacity style={styles.adminAssignBtn}>
                    <Settings size={10} color={theme.primary} />
                    <Text style={styles.adminAssignText}>Editar Cruce</Text>
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const createStyles = (theme: any, isDark: boolean) => StyleSheet.create({
  container: { paddingVertical: 20, paddingHorizontal: 10, gap: 30 },
  loadingBox: { height: 200, justifyContent: 'center', alignItems: 'center' },
  emptyBox: { height: 200, justifyContent: 'center', alignItems: 'center', backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)', borderRadius: 16, borderWidth: 1, borderColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)', borderStyle: 'dashed', marginVertical: 20 },
  emptyText: { color: theme.textSecondary, fontSize: 13, marginTop: 10, marginBottom: 15 },
  generateBtn: { backgroundColor: theme.primary, paddingHorizontal: 15, paddingVertical: 8, borderRadius: 8 },
  generateBtnText: { color: '#001A2C', fontWeight: '800', fontSize: 12 },
  stageColumn: { width: 220, justifyContent: 'center' },
  stageTitle: { fontSize: 14, fontWeight: '900', color: theme.textSecondary, textAlign: 'center', marginBottom: 20, letterSpacing: 1 },
  slotsContainer: { gap: 20, justifyContent: 'space-around', flex: 1 },
  slotBox: { backgroundColor: theme.surface, borderRadius: 12, borderWidth: 1, borderColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)', overflow: 'hidden' },
  teamRow: { flexDirection: 'row', justifyContent: 'space-between', padding: 12, alignItems: 'center' },
  winnerRow: { backgroundColor: theme.primary + '10' },
  teamName: { fontSize: 12, fontWeight: '700', color: theme.text, flex: 1 },
  score: { fontSize: 14, fontWeight: '900', color: theme.textSecondary, width: 25, textAlign: 'right' },
  divider: { height: 1, backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' },
  adminAssignBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, paddingVertical: 6, backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)' },
  adminAssignText: { fontSize: 9, fontWeight: '800', color: theme.primary }
});
