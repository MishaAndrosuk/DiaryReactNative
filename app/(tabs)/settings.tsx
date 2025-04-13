import { StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { View, Text } from '@/components/Themed';

export default function Settings() {
  const { theme, toggleTheme } = useTheme();

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Налаштування</Text>

      <TouchableOpacity style={styles.button} onPress={toggleTheme}>
        <Text style={styles.buttonText}>
          Змінити тему: {theme === 'light' ? 'Світла' : 'Темна'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: 'center' },
  heading: { fontSize: 24, fontWeight: 'bold', marginBottom: 24, textAlign: 'center' },
  button: {
    backgroundColor: '#007AFF',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: { color: '#fff', fontWeight: 'bold' },
});
