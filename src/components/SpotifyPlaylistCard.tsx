import FontAwesome from '@expo/vector-icons/FontAwesome';
import {
  Image,
  Linking,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { fonts, radii } from '../theme/tokens';

const PLAYLIST_URL =
  'https://open.spotify.com/playlist/7l53GfUvbplByqPit2RmGx?si=hfQ_ppaMQtGiZAwsp6D0LA';

export function SpotifyPlaylistCard() {
  return (
    <Pressable
      accessibilityHint="Opens the LA Z 1310 playlist in Spotify"
      accessibilityLabel="Escucha nuestra playlist en Spotify"
      accessibilityRole="link"
      onPress={() => void Linking.openURL(PLAYLIST_URL)}
      style={({ pressed }) => [
        styles.card,
        { opacity: pressed ? 0.9 : 1 },
      ]}
    >
      <Image
        accessibilityIgnoresInvertColors
        resizeMode="contain"
        source={require('../../assets/brand/La Z Icon.webp')}
        style={styles.brandIcon}
      />

      <View style={styles.copy}>
        <Text style={styles.listen}>ESCUCHA</Text>
        <Text style={styles.playlist}>NUESTRA PLAYLIST</Text>

        <View style={styles.spotifyRow}>
          <Text style={styles.inText}>EN</Text>
          <FontAwesome color="#F51B1B" name="spotify" size={33} />
          <Text style={styles.spotifyText}>Spotify</Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    backgroundColor: '#FEFEFE',
    borderRadius: radii.lg,
    flexDirection: 'row',
    gap: 14,
    minHeight: 164,
    overflow: 'hidden',
    paddingHorizontal: 16,
    paddingVertical: 14,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.14,
    shadowRadius: 16,
    elevation: 5,
  },
  brandIcon: {
    aspectRatio: 1,
    borderRadius: 20,
    flexShrink: 0,
    width: '42%',
  },
  copy: {
    flex: 1,
    minWidth: 0,
  },
  listen: {
    color: '#E72828',
    fontFamily: fonts.displayExtraBold,
    fontSize: 27,
    lineHeight: 30,
  },
  playlist: {
    color: '#050101',
    fontFamily: fonts.displayExtraBold,
    fontSize: 19,
    lineHeight: 22,
    marginTop: 2,
  },
  spotifyRow: {
    alignItems: 'center',
    flexDirection: 'row',
    marginTop: 10,
  },
  inText: {
    color: '#050101',
    fontFamily: fonts.displayExtraBold,
    fontSize: 18,
    marginRight: 8,
  },
  spotifyText: {
    color: '#F51B1B',
    fontFamily: fonts.displayExtraBold,
    fontSize: 24,
    marginLeft: 6,
  },
});
