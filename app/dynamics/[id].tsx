import Ionicons from '@expo/vector-icons/Ionicons';
import * as Linking from 'expo-linking';
import { Link, useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ApiError } from '../../src/api/client';
import { PrimaryButton } from '../../src/components/PrimaryButton';
import { ScreenHeader } from '../../src/components/ScreenHeader';
import { useAuth } from '../../src/features/auth/AuthProvider';
import { getFirebaseSecurityTokens } from '../../src/features/auth/firebase';
import { useContentVersion } from '../../src/features/content/ContentVersionProvider';
import {
  DynamicCampaign,
  ParticipationStatusResponse,
  getDynamic,
  getParticipationStatus,
} from '../../src/features/dynamics/api';
import { dynamicDeadline } from '../../src/features/dynamics/presentation';
import { useLanguage } from '../../src/i18n/LanguageProvider';
import { useAppTheme } from '../../src/theme/ThemeProvider';
import { fonts, radii, spacing } from '../../src/theme/tokens';

export default function DynamicDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { colors } = useAppTheme();
  const { language } = useLanguage();
  const english = language === 'en';
  const { isAuthenticated } = useAuth();
  const { releaseId, refresh: refreshContentVersion } = useContentVersion();
  const [campaign, setCampaign] = useState<DynamicCampaign | null>(null);
  const [participationStatus, setParticipationStatus] =
    useState<ParticipationStatusResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const errorCopy = useCallback(
    (requestError: unknown) => {
      if (requestError instanceof ApiError && requestError.status === 404) {
        return english
          ? 'This dynamic is no longer available in the current release.'
          : 'Esta dinámica ya no está disponible en la publicación actual.';
      }
      return english ? 'We could not load this dynamic.' : 'No pudimos cargar esta dinámica.';
    },
    [english],
  );

  const load = useCallback(
    async (requestedReleaseId?: string | null) => {
      if (!id) {
        setError(english ? 'The dynamic identifier is missing.' : 'Falta el identificador de la dinámica.');
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const result = await getDynamic(id, requestedReleaseId ?? undefined);
        setCampaign(result.item);

        if (
          result.item.participation.type === 'form' &&
          result.item.participation.requiresAuth &&
          isAuthenticated
        ) {
          try {
            const security = await getFirebaseSecurityTokens(true);
            setParticipationStatus(
              await getParticipationStatus(result.item.id, security),
            );
          } catch {
            setParticipationStatus(null);
          }
        } else {
          setParticipationStatus(null);
        }
      } catch (requestError) {
        setCampaign(null);
        setParticipationStatus(null);
        setError(errorCopy(requestError));
      } finally {
        setLoading(false);
      }
    },
    [english, errorCopy, id, isAuthenticated],
  );

  useFocusEffect(
    useCallback(() => {
      let active = true;
      void (async () => {
        const latest = await refreshContentVersion();
        if (active) await load(latest?.releaseId ?? releaseId);
      })();
      return () => { active = false; };
    }, [load, refreshContentVersion, releaseId]),
  );

  const handlePrimaryAction = () => {
    if (!campaign || campaign.status !== 'active') return;

    if (campaign.participation.type === 'form') {
      if (participationStatus?.participated) {
        router.push('/dynamics/participations');
        return;
      }

      if (campaign.participation.requiresAuth && !isAuthenticated) {
        router.push('/auth');
        return;
      }

      router.push({
        pathname: '/dynamics/[id]/participate',
        params: { id: campaign.id },
      });
      return;
    }

    if (campaign.participation.url) {
      void Linking.openURL(campaign.participation.url);
    }
  };

  return (
    <SafeAreaView edges={['top']} style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <ScreenHeader title={english ? 'Dynamic' : 'Dinámica'} />

        {loading ? (
          <View style={styles.state}>
            <ActivityIndicator color={colors.red} />
            <Text style={[styles.stateText, { color: colors.muted }]}>{english ? 'Loading dynamic…' : 'Cargando dinámica…'}</Text>
          </View>
        ) : null}

        {!loading && error ? (
          <View style={[styles.errorCard, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}>
            <Ionicons color={colors.red} name="alert-circle-outline" size={32} />
            <Text style={[styles.errorText, { color: colors.white }]}>{error}</Text>
            <PrimaryButton label={english ? 'Retry' : 'Reintentar'} onPress={() => void load(releaseId)} secondary />
          </View>
        ) : null}

        {!loading && campaign ? (
          <>
            <View style={[styles.hero, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Image resizeMode="cover" source={{ uri: campaign.imageUrl }} style={styles.heroImage} />
              <View style={styles.heroScrim} />
              <Text style={[styles.artLabel, { color: colors.red }]}>{campaign.artworkLabel}</Text>
              <Text style={styles.heroTitle}>{campaign.title}</Text>
              <Text style={styles.brand}>{campaign.context}</Text>
            </View>

            <Text style={[styles.title, { color: colors.white }]}>{campaign.title}</Text>
            <Text style={[styles.deadline, { color: colors.red }]}>{dynamicDeadline(campaign.endsAt, campaign.timezone, language)}</Text>
            <Text style={[styles.description, { color: colors.muted }]}>{campaign.description}</Text>

            <View style={styles.metaRow}>
              <View style={styles.meta}>
                <Ionicons color={colors.red} name="radio-outline" size={22} />
                <View style={styles.metaCopy}>
                  <Text style={[styles.metaLabel, { color: colors.muted }]}>{english ? 'Context' : 'Contexto'}</Text>
                  <Text style={[styles.metaValue, { color: colors.white }]}>{campaign.context}</Text>
                </View>
              </View>
              <View style={styles.meta}>
                <Ionicons color={colors.red} name={campaign.participation.type === 'external_url' ? 'open-outline' : 'document-text-outline'} size={22} />
                <View style={styles.metaCopy}>
                  <Text style={[styles.metaLabel, { color: colors.muted }]}>{english ? 'Participation' : 'Participación'}</Text>
                  <Text style={[styles.metaValue, { color: colors.white }]}>
                    {campaign.participation.type === 'external_url'
                      ? english ? 'External URL' : 'URL externa'
                      : english ? 'Form' : 'Formulario'}
                  </Text>
                </View>
              </View>
            </View>

            <View style={[styles.instructions, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}>
              <Text style={[styles.sectionTitle, { color: colors.white }]}>{english ? 'How to participate' : 'Cómo participar'}</Text>
              <Text style={[styles.body, { color: colors.muted }]}>{campaign.instructions}</Text>
            </View>

            {campaign.status !== 'active' ? (
              <View style={[styles.closedCard, { backgroundColor: colors.surfaceElevated, borderColor: colors.border }]}>
                <Ionicons color={colors.red} name="lock-closed-outline" size={22} />
                <Text style={[styles.closedText, { color: colors.white }]}>
                  {english ? 'This dynamic is closed or has not opened yet.' : 'Esta dinámica está cerrada o todavía no abre.'}
                </Text>
              </View>
            ) : null}

            {campaign.participation.type === 'form' &&
            participationStatus?.participated ? (
              <View
                style={[
                  styles.participatingCard,
                  {
                    backgroundColor: colors.surfaceElevated,
                    borderColor: colors.border,
                  },
                ]}
              >
                <Ionicons
                  color="#56C985"
                  name="checkmark-circle-outline"
                  size={25}
                />
                <View style={styles.participatingCopy}>
                  <Text
                    style={[styles.participatingTitle, { color: colors.white }]}
                  >
                    {english
                      ? 'You are already participating'
                      : 'Ya estás participando'}
                  </Text>
                  <Text
                    style={[styles.participatingBody, { color: colors.muted }]}
                  >
                    {english
                      ? 'Wait for campaign updates through the email registered to your LA Z account and, if enabled, app notifications.'
                      : 'Espera los resultados o avisos en el correo registrado en tu cuenta LA Z y, si están habilitadas, mediante notificaciones de la app.'}
                  </Text>
                </View>
              </View>
            ) : null}

            <PrimaryButton
              disabled={campaign.status !== 'active' || (campaign.participation.type === 'external_url' && !campaign.participation.url)}
              label={campaign.status !== 'active'
                ? english ? 'Dynamic closed' : 'Dinámica cerrada'
                : campaign.participation.type === 'external_url'
                  ? english ? 'Open link' : 'Abrir enlace'
                  : participationStatus?.participated
                    ? english ? 'My participations' : 'Mis participaciones'
                    : campaign.participation.requiresAuth && !isAuthenticated
                      ? english ? 'Sign in to participate' : 'Inicia sesión para participar'
                      : english ? 'Participate' : 'Participar'}
              onPress={handlePrimaryAction}
            />

            <View style={styles.legalRow}>
              <Pressable onPress={() => void Linking.openURL(campaign.termsUrl)}><Text style={[styles.legal, { color: colors.red }]}>{english ? 'Terms & conditions' : 'Bases y condiciones'}</Text></Pressable>
              <Pressable onPress={() => void Linking.openURL(campaign.privacyUrl)}><Text style={[styles.legal, { color: colors.red }]}>{english ? 'Privacy' : 'Privacidad'}</Text></Pressable>
            </View>

            <Link href="/dynamics" asChild>
              <Pressable style={styles.backToList}>
                <Text style={[styles.backToListText, { color: colors.red }]}>{english ? 'View all dynamics' : 'Ver todas las dinámicas'}</Text>
              </Pressable>
            </Link>
          </>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { gap: 14, paddingBottom: 120, paddingHorizontal: spacing.md },
  state: { alignItems: 'center', gap: 12, paddingVertical: 100 },
  stateText: { fontFamily: fonts.body, fontSize: 12 },
  errorCard: { borderRadius: radii.lg, borderWidth: 1, gap: 14, marginTop: spacing.lg, padding: spacing.lg },
  errorText: { fontFamily: fonts.body, fontSize: 13, lineHeight: 20 },
  hero: { aspectRatio: 1, borderRadius: radii.lg, borderWidth: 1, marginTop: 8, overflow: 'hidden', padding: spacing.lg, width: '100%' },
  heroImage: { bottom: 0, left: 0, position: 'absolute', right: 0, top: 0 },
  heroScrim: { bottom: 0, left: 0, position: 'absolute', right: 0, top: 0, backgroundColor: 'rgba(5,1,1,0.62)' },
  artLabel: { fontFamily: fonts.bodyBold, fontSize: 10, letterSpacing: 1.2 },
  heroTitle: { bottom: 56, color: '#FEFEFE', fontFamily: fonts.displayBlack, fontSize: 46, left: 24, lineHeight: 44, position: 'absolute', right: 24 },
  brand: { bottom: 24, color: '#FEFEFE', fontFamily: fonts.displayBold, fontSize: 18, left: 24, position: 'absolute' },
  title: { fontFamily: fonts.displayExtraBold, fontSize: 32, lineHeight: 34 },
  deadline: { fontFamily: fonts.bodySemiBold, fontSize: 14 },
  description: { fontFamily: fonts.body, fontSize: 13, lineHeight: 19 },
  metaRow: { flexDirection: 'row', gap: 12 },
  meta: { alignItems: 'center', flex: 1, flexDirection: 'row' },
  metaCopy: { marginLeft: 8 },
  metaLabel: { fontFamily: fonts.body, fontSize: 9 },
  metaValue: { fontFamily: fonts.bodySemiBold, fontSize: 12, marginTop: 2 },
  instructions: { borderRadius: radii.md, borderWidth: 1, padding: spacing.md },
  sectionTitle: { fontFamily: fonts.displayExtraBold, fontSize: 24 },
  body: { fontFamily: fonts.body, fontSize: 13, lineHeight: 19, marginTop: 5 },
  closedCard: { alignItems: 'center', borderRadius: radii.md, borderWidth: 1, flexDirection: 'row', gap: 10, padding: spacing.md },
  closedText: { flex: 1, fontFamily: fonts.bodyMedium, fontSize: 12 },
  participatingCard: { alignItems: 'flex-start', borderRadius: radii.md, borderWidth: 1, flexDirection: 'row', gap: 10, padding: spacing.md },
  participatingCopy: { flex: 1 },
  participatingTitle: { fontFamily: fonts.bodyBold, fontSize: 13 },
  participatingBody: { fontFamily: fonts.body, fontSize: 10, lineHeight: 15, marginTop: 3 },
  legalRow: { flexDirection: 'row', justifyContent: 'center', gap: 20 },
  legal: { fontFamily: fonts.bodySemiBold, fontSize: 10 },
  backToList: { alignItems: 'center', paddingVertical: 10 },
  backToListText: { fontFamily: fonts.bodySemiBold, fontSize: 12 },
});
