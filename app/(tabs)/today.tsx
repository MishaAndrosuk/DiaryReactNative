import { useEffect, useState } from 'react';
import {
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { setTasks, updateTask, markTaskCompleted } from '@/redux/slices/tasksSlice';
import { getItems, updateItem } from '@/store/tasksDb';
import type { Task } from '@/types';
import { View, Text, useThemeColor } from '@/components/Themed';
import {View as RNView} from 'react-native';

export default function Today() {
  const dispatch = useAppDispatch();
  const tasks = useAppSelector((state) => state.tasks.tasks);
  const today = new Date().toISOString().split('T')[0];
  const todayTasks = tasks.filter((task) => task.date.startsWith(today));

  const [modalVisible, setModalVisible] = useState(false);
  const [editedTask, setEditedTask] = useState<Task | null>(null);

  const bg = useThemeColor({}, 'background');
  const text = useThemeColor({}, 'text');
  const blockBg = useThemeColor({ light: '#f2f2f2', dark: '#2a2a2a' }, 'card');

  useEffect(() => {
    const load = async () => {
      const data = await getItems();
      dispatch(setTasks(data));
    };
    load();
  }, []);

  const handleOpenEdit = (task: Task) => {
    setEditedTask(task);
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!editedTask) return;
    await updateItem(editedTask);
    dispatch(updateTask(editedTask));
    setModalVisible(false);
  };

  const handleMarkCompleted = async () => {
    if (!editedTask) return;
    const updated = { ...editedTask, status: 'completed' as const };
    await updateItem(updated);
    dispatch(markTaskCompleted(updated.id));
    setModalVisible(false);
  };

  return (
    <View style={[styles.container, { backgroundColor: bg }]}>
      <Text style={[styles.heading, { color: text }]}>Сьогодні</Text>

      {todayTasks.length === 0 ? (
        <Text style={styles.empty}>Немає задач на сьогодні</Text>
      ) : (
        <FlatList
          data={todayTasks}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View
                style={{
                  flex: 1,
                  backgroundColor: blockBg,
                  padding: 10,
                  borderRadius: 8,
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',

                }}
              >

                <RNView>
                  <Text style={[styles.title, { color: text }]}>{item.title}</Text>
                  <Text style={[styles.date, { color: text }]}>Пріоритет: {item.priority}</Text>
                </RNView>


                {item.status === 'completed' ? (
                  <Ionicons name="checkmark-done-circle" size={24} color="#28a745" />
                ) : (
                  <TouchableOpacity onPress={() => handleOpenEdit(item)}>
                    <Ionicons name="create-outline" size={24} color="#007AFF" />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )}
        />
      )}

      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: bg }]}>
            <Text style={[styles.modalTitle, { color: text }]}>Редагувати задачу</Text>

            <TextInput
              style={[styles.input, { color: text, backgroundColor: bg }]}
              placeholder="Назва"
              placeholderTextColor="#888"
              value={editedTask?.title}
              onChangeText={(text) =>
                setEditedTask((prev) => prev && { ...prev, title: text })
              }
            />

            <Text style={[styles.label, { color: text }]}>Пріоритет:</Text>
            <View style={styles.priorityRow}>
              {(['low', 'mid', 'high'] as const).map((p) => (
                <TouchableOpacity
                  key={p}
                  style={[
                    styles.priorityButton,
                    editedTask?.priority === p && styles.prioritySelected,
                    { backgroundColor: editedTask?.priority === p ? '#007AFF' : 'transparent' },
                    { borderWidth: 1, borderColor: '#ccc' },
                  ]}
                  onPress={() =>
                    setEditedTask((prev) => prev && { ...prev, priority: p })
                  }
                >
                  <Text style={{ color: editedTask?.priority === p ? '#fff' : text }}>{p}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveText}>Зберегти</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.completeButton} onPress={handleMarkCompleted}>
              <Text style={styles.saveText}>Позначити як виконано</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Text style={{ textAlign: 'center', marginTop: 10, color: '#888' }}>
                Закрити
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  heading: { fontSize: 24, fontWeight: 'bold', marginBottom: 16 },
  empty: { color: '#777', textAlign: 'center' },
  card: {
    padding: 0,
    borderRadius: 10,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: { fontSize: 16, fontWeight: '500' },
  date: { fontSize: 14 },

  modalOverlay: {
    flex: 1,
    backgroundColor: '#00000066',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    borderRadius: 10,
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  input: {
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
  },
  label: { fontWeight: 'bold', marginTop: 10 },
  priorityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 10,
  },
  priorityButton: {
    padding: 10,
    borderRadius: 8,
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  prioritySelected: {},
  saveButton: {
    backgroundColor: '#007AFF',
    padding: 14,
    borderRadius: 8,
    marginTop: 10,
  },
  completeButton: {
    backgroundColor: '#28a745',
    padding: 14,
    borderRadius: 8,
    marginTop: 10,
  },
  saveText: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
