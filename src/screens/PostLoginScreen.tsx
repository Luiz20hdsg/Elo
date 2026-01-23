import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  TextInput,
  Dimensions,
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import StyledButton from '../components/StyledButton';

type RootStackParamList = {
  PostLogin: undefined;
  Initial: undefined;
  Summary: undefined;
};

type PostLoginScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'PostLogin'
>;

// --- Visual mais "fino" ---
const { width } = Dimensions.get('window');
const RULER_TICK_WIDTH = 14;
const MIN_HEIGHT = 100;
const MAX_HEIGHT = 250;
const INITIAL_HEIGHT = 170;

const PostLoginScreen = ({
  navigation,
}: {
  navigation: PostLoginScreenNavigationProp;
}) => {
  const { colors, theme, toggleTheme } = useTheme();
  const [age, setAge] = useState('');
  const [height, setHeight] = useState(INITIAL_HEIGHT);
  const [gender, setGender] = useState('');
  const scrollRef = useRef<ScrollView>(null);

  // Cor base para a régua (adapta ao tema)
  const rulerColor = theme === 'dark' ? '#FFFFFF' : '#000000';

  const handleLogout = () => {
    navigation.navigate('Initial');
  };

  useEffect(() => {
    if (scrollRef.current) {
      setTimeout(() => {
        const initialOffset = (INITIAL_HEIGHT - MIN_HEIGHT) * RULER_TICK_WIDTH;
        scrollRef.current?.scrollTo({ x: initialOffset, animated: false });
      }, 100);
    }
  }, []);

  const renderRuler = () => {
    const ruler = [];
    for (let i = MIN_HEIGHT; i <= MAX_HEIGHT; i++) {
      const isTen = i % 10 === 0;
      const isFive = i % 5 === 0;

      ruler.push(
        <View key={i} style={[styles.rulerTick, { width: RULER_TICK_WIDTH }]}>
          <View
            style={[
              styles.rulerLine,
              {
                backgroundColor: rulerColor,
                opacity: isTen ? 1 : isFive ? 0.6 : 0.2,

                height: isTen ? 40 : isFive ? 25 : 12,
                width: isTen ? 2 : 1.5, // Traços levemente arredondados
                borderRadius: 2,
              },
            ]}
          />
          {isTen && (
            // Texto do número um pouco menor e mais sutil
            <Text
              style={[styles.rulerText, { color: colors.text, opacity: 0.8 }]}
            >
              {i}
            </Text>
          )}
        </View>,
      );
    }
    return ruler;
  };

  const handleScroll = (event: {
    nativeEvent: { contentOffset: { x: number } };
  }) => {
    const position = event.nativeEvent.contentOffset.x;
    const index = Math.round(position / RULER_TICK_WIDTH);
    const newHeight = MIN_HEIGHT + index;

    if (newHeight >= MIN_HEIGHT && newHeight <= MAX_HEIGHT) {
      setHeight(newHeight);
    }
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <StatusBar
        barStyle={theme === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
      />
      <View style={styles.header}>
        <View>
          <Text style={[styles.title, { color: colors.text }]}>Quase lá!</Text>
        </View>
        <View style={{ flexDirection: 'row' }}>
          <TouchableOpacity onPress={toggleTheme} style={{ padding: 10 }}>
            <Ionicons
              name={theme === 'dark' ? 'sunny' : 'moon'}
              size={24}
              color={colors.text}
            />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleLogout} style={{ padding: 10 }}>
            <Icon name="logout" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.content}>
        <Text style={[styles.question, { color: colors.text }]}>
          Qual a sua idade?
        </Text>
        <TextInput
          style={[
            styles.input,
            {
              color: colors.text,
              borderColor: colors.primary,
              backgroundColor: colors.inputBackground,
            },
          ]}
          placeholder="Sua idade"
          placeholderTextColor={colors.placeholder}
          keyboardType="numeric"
          onChangeText={setAge}
          value={age}
        />

        <Text style={[styles.question, { color: colors.text, marginTop: 40 }]}>
          Você é:
        </Text>
        <View style={styles.genderContainer}>
          <TouchableOpacity
            style={[
              styles.genderButton,
              gender === 'homem'
                ? { backgroundColor: colors.primary }
                : { backgroundColor: colors.inputBackground },
            ]}
            onPress={() => setGender('homem')}
          >
            <Text
              style={[
                styles.genderButtonText,
                gender === 'homem'
                  ? { color: colors.background }
                  : { color: colors.text },
              ]}
            >
              Homem
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.genderButton,
              gender === 'mulher'
                ? { backgroundColor: colors.primary }
                : { backgroundColor: colors.inputBackground },
            ]}
            onPress={() => setGender('mulher')}
          >
            <Text
              style={[
                styles.genderButtonText,
                gender === 'mulher'
                  ? { color: colors.background }
                  : { color: colors.text },
              ]}
            >
              Mulher
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={[styles.question, { color: colors.text, marginTop: 40 }]}>
          Qual a sua altura?
        </Text>

        <View style={styles.rulerContainer}>
          {/* Número Grande em Destaque */}
          <Text style={[styles.heightText, { color: colors.primary }]}>
            {height}{' '}
            <Text style={{ fontSize: 20, fontWeight: 'normal' }}>cm</Text>
          </Text>

          <View style={styles.rulerWrapper}>
            <View style={styles.indicatorWrapper}>
              <Ionicons
                name="caret-down"
                size={24}
                color={colors.primary}
                style={{ marginTop: -18 }}
              />
              <View
                style={[
                  styles.indicatorLine,
                  { backgroundColor: colors.primary },
                ]}
              />
            </View>

            <View
              style={[
                styles.fade,
                styles.fadeLeft,
                { backgroundColor: colors.background },
              ]}
              pointerEvents="none"
            />
            <View
              style={[
                styles.fade,
                styles.fadeRight,
                { backgroundColor: colors.background },
              ]}
              pointerEvents="none"
            />

            <ScrollView
              ref={scrollRef}
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.ruler}
              contentContainerStyle={{
                paddingHorizontal: width / 2 - RULER_TICK_WIDTH / 2,
                alignItems: 'flex-end',
              }}
              onScroll={handleScroll}
              scrollEventThrottle={16}
              snapToInterval={RULER_TICK_WIDTH}
              decelerationRate="fast"
              bounces={false}
            >
              {renderRuler()}
            </ScrollView>
          </View>
        </View>

        <View style={{flex: 1, justifyContent: 'flex-end'}}>
          <StyledButton title="Avançar" onPress={() => navigation.navigate('Summary')} />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  question: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 20,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    fontSize: 16,
    marginBottom: 20,
  },
  rulerContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  heightText: {
    fontSize: 56, // Aumentei para destaque
    fontWeight: 'bold',
    marginBottom: 20,
    letterSpacing: -1,
  },
  rulerWrapper: {
    height: 100,
    width: '100%',
    justifyContent: 'center',
    position: 'relative',
    // Linhas sutis para delimitar a área
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: 'rgba(150,150,150,0.1)',
  },
  ruler: {
    height: 100,
  },
  rulerTick: {
    justifyContent: 'flex-end',
    alignItems: 'center',
    height: 60,
  },
  rulerLine: {
    marginBottom: 25, // Afastei um pouco do número
  },
  rulerText: {
    position: 'absolute',
    bottom: 0,
    fontSize: 12,
    fontWeight: '600',
  },
  // --- Novos Estilos do Marcador ---
  indicatorWrapper: {
    position: 'absolute',
    left: '50%',
    top: 0,
    bottom: 0,
    marginLeft: -12, // Centraliza o ícone (24/2)
    width: 24,
    alignItems: 'center',
    zIndex: 10,
    justifyContent: 'flex-start', // Começa do topo
  },
  indicatorLine: {
    width: 3,
    height: 45,
    borderRadius: 2,
    marginTop: -5, // Conecta com a ponta da seta
  },
  // --- Novos Estilos de Fade ---
  fade: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 60,
    zIndex: 5,
    opacity: 0.9, // Aumentar para esconder mais os cantos
  },
  fadeLeft: { left: 0 },
  fadeRight: { right: 0 },

  genderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 40,
  },
  genderButton: {
    paddingVertical: 15,
    paddingHorizontal: 50,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  genderButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default PostLoginScreen;
