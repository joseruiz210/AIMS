import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, TextInput, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { fichasService } from '../../services/fichasService';

const NAVY = '#0F1026';
const GOLD = '#D4AF37';
const BG_PAGE = '#F8FAFC';

interface Apprentice {
  id: string;
  name: string;
  initials: string;
  doc: string;
  ficha: string;
  nota: number;
  asistencia: number;
  status: string;
  telefono: string;
  correo: string;
}

export default function AprendicesScreenPremium() {
  const [loading, setLoading] = useState(true);
  const [aprendices, setAprendices] = useState<Apprentice[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedApprentice, setSelectedApprentice] = useState<Apprentice | null>(null);

  useEffect(() => {
    loadAprendices();
  }, []);

  const loadAprendices = async () => {
    setLoading(true);
    try {
      const fichas = await fichasService.getFichas();
      const list: Apprentice[] = [];

      for (const f of fichas) {
        const detail = await fichasService.getFichaById(f.id);
        if (detail && detail.matriculas) {
          for (const m of detail.matriculas) {
            if (m.aprendiz) {
              const a = m.aprendiz;
              const fullName = `${a.firstName} ${a.lastName || ''}`.trim();
              const initials = `${a.firstName?.[0] || 'A'}${a.lastName?.[0] || 'P'}`.toUpperCase();
              list.push({
                id: a.id,
                name: fullName,
                initials,
                doc: a.phone || a.id.slice(0, 8),
                ficha: f.numero,
                nota: 4.5,
                asistencia: 90,
                status: a.estadoAcademico === 'EN_RIESGO' ? 'En Riesgo' : 'En Formación',
                telefono: a.phone || '311-000-0000',
                correo: a.email,
              });
            }
          }
        }
      }

      setAprendices(list);
      if (list.length > 0) {
        setSelectedApprentice(list[0]);
      }
    } catch (err) {
      console.error('Error cargando aprendices desde BD:', err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = aprendices.filter(item => {
    const q = searchQuery.toLowerCase();
    return item.name.toLowerCase().includes(q) ||
           item.correo.toLowerCase().includes(q) ||
           item.doc.includes(q);
  });

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
      {/* Title */}
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.pageTitle}>Directorio de Aprendices</Text>
          <Text style={styles.pageSubtitle}>
            {aprendices.length} aprendices matriculados en tus fichas de formación
          </Text>
        </View>

        {/* Buscador */}
        <View style={styles.searchWrap}>
          <Ionicons name="search-outline" size={18} color="#94A3B8" style={{ marginRight: 8 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar por nombre, correo o documento..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery ? (
            <Pressable onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={16} color="#94A3B8" />
            </Pressable>
          ) : null}
        </View>
      </View>

      {loading ? (
        <View style={{ padding: 40, alignItems: 'center' }}>
          <ActivityIndicator size="large" color={GOLD} />
          <Text style={{ marginTop: 12, color: '#64748B', fontWeight: '600' }}>
            Consultando aprendices en PostgreSQL...
          </Text>
        </View>
      ) : filtered.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="people-outline" size={48} color="#94A3B8" />
          <Text style={styles.emptyTitle}>No se encontraron aprendices</Text>
          <Text style={styles.emptySubtitle}>No hay coincidencias para el criterio de búsqueda ingresado.</Text>
        </View>
      ) : (
        <View style={styles.contentLayout}>
          {/* List of Apprentice Cards */}
          <View style={styles.listContainer}>
            {filtered.map((item) => {
              const isSelected = selectedApprentice?.id === item.id;
              return (
                <Pressable
                  key={item.id}
                  style={[styles.card, isSelected && styles.cardSelected]}
                  onPress={() => setSelectedApprentice(item)}
                >
                  <View style={styles.cardLeft}>
                    <View style={styles.avatarCircle}>
                      <Text style={styles.avatarText}>{item.initials}</Text>
                    </View>
                    <View style={styles.infoGroup}>
                      <Text style={styles.nameText}>{item.name}</Text>
                      <Text style={styles.docText}>
                        Doc: {item.doc} • Ficha: {item.ficha}
                      </Text>
                      <Text style={styles.emailText}>{item.correo}</Text>
                    </View>
                  </View>

                  <View style={styles.cardRight}>
                    <View style={styles.statsGroup}>
                      <Text style={styles.notaText}>{item.nota.toFixed(1)}</Text>
                      <Text style={styles.asistenciaText}>{item.asistencia}% asist.</Text>
                    </View>
                    <View style={styles.statusBadge}>
                      <View style={styles.statusDot} />
                      <Text style={styles.statusText}>{item.status}</Text>
                    </View>
                  </View>
                </Pressable>
              );
            })}
          </View>

          {/* Selected Apprentice Detail Card */}
          {selectedApprentice && (
            <View style={styles.detailCard}>
              <View style={styles.detailAvatarCircle}>
                <Text style={styles.detailAvatarText}>{selectedApprentice.initials}</Text>
              </View>

              <Text style={styles.detailName}>{selectedApprentice.name}</Text>
              
              <View style={styles.detailStatusBadge}>
                <Text style={styles.detailStatusText}>{selectedApprentice.status}</Text>
              </View>

              <View style={styles.detailFieldsGroup}>
                <View style={styles.fieldItem}>
                  <Text style={styles.fieldLabel}>Documento</Text>
                  <Text style={styles.fieldValue}>{selectedApprentice.doc}</Text>
                </View>

                <View style={styles.fieldItem}>
                  <Text style={styles.fieldLabel}>Ficha</Text>
                  <Text style={styles.fieldValue}>{selectedApprentice.ficha}</Text>
                </View>

                <View style={styles.fieldItem}>
                  <Text style={styles.fieldLabel}>Teléfono</Text>
                  <Text style={styles.fieldValue}>{selectedApprentice.telefono}</Text>
                </View>

                <View style={styles.fieldItem}>
                  <Text style={styles.fieldLabel}>Correo SENA</Text>
                  <Text style={styles.fieldValue}>{selectedApprentice.correo}</Text>
                </View>
              </View>

              {/* Stats bottom row */}
              <View style={styles.detailBottomRow}>
                <View style={styles.detailMetricsGroup}>
                  <View style={styles.metricItem}>
                    <Text style={styles.metricValue}>{selectedApprentice.nota.toFixed(1)}</Text>
                    <Text style={styles.metricLabel}>Promedio</Text>
                  </View>
                  <View style={styles.metricItem}>
                    <Text style={styles.metricValue}>{selectedApprentice.asistencia}%</Text>
                    <Text style={styles.metricLabel}>Asistencia</Text>
                  </View>
                </View>
              </View>
            </View>
          )}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG_PAGE,
  },
  contentContainer: {
    paddingHorizontal: 28,
    paddingVertical: 24,
    paddingBottom: 40,
  },
  headerRow: {
    marginBottom: 24,
    gap: 14,
  },
  pageTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: '#0F172A',
  },
  pageSubtitle: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
    maxWidth: 480,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#0F172A',
    outlineStyle: 'none' as any,
  },
  contentLayout: {
    flexDirection: 'row',
    gap: 20,
    alignItems: 'flex-start',
    flexWrap: 'wrap',
  },
  listContainer: {
    flex: 1.2,
    minWidth: 320,
    gap: 12,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#334155',
    marginTop: 10,
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 4,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
    gap: 10,
  },
  cardSelected: {
    borderColor: GOLD,
    backgroundColor: 'rgba(212, 175, 55, 0.04)',
  },
  cardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(15, 16, 38, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 15,
    fontWeight: '700',
    color: NAVY,
  },
  infoGroup: {
    flex: 1,
  },
  nameText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  docText: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  emailText: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 1,
  },
  cardRight: {
    alignItems: 'flex-end',
    gap: 6,
  },
  statsGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  notaText: {
    fontSize: 15,
    fontWeight: '700',
    color: GOLD,
  },
  asistenciaText: {
    fontSize: 12,
    color: '#64748B',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    gap: 5,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#16A34A',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#15803D',
  },
  detailCard: {
    flex: 0.8,
    minWidth: 280,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 22,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
  detailAvatarCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailAvatarText: {
    fontSize: 22,
    fontWeight: '800',
    color: GOLD,
  },
  detailName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
    marginBottom: 6,
  },
  detailStatusBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 18,
  },
  detailStatusText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#15803D',
  },
  detailFieldsGroup: {
    width: '100%',
    gap: 10,
    marginBottom: 20,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  fieldItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  fieldLabel: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  fieldValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0F172A',
  },
  detailBottomRow: {
    width: '100%',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 16,
  },
  detailMetricsGroup: {
    flexDirection: 'row',
    gap: 24,
  },
  metricItem: {
    alignItems: 'center',
  },
  metricValue: {
    fontSize: 18,
    fontWeight: '800',
    color: NAVY,
  },
  metricLabel: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
});
