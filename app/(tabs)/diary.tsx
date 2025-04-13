import { useEffect, useState } from 'react';
import {
  FlatList,
  TouchableOpacity,
  Modal,
  TextInput,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { addTask, setTasks, updateTask, deleteTask } from '@/redux/slices/tasksSlice';
import { getItems, addItem, updateItem, deleteItem } from '@/store/tasksDb';
import { Task } from '@/types';
import { View, Text } from '@/components/Themed';


export default function Diary() {
  const dispatch = useAppDispatch();
  const tasks = useAppSelector(state => state.tasks.tasks);

  const [modalVisible, setModalVisible] = useState(false);
  const [editing, setEditing] = useState<null | Task>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'low' | 'mid' | 'high'>('mid');
  const [status, setStatus] = useState<'in progress' | 'completed'>('in progress');

  useEffect(() => {
    const load = async () => {
      const data = await getItems();
      dispatch(setTasks(data));
    };
    load();
  }, []);

  const openModal = (task?: Task) => {
    if (task) {
      setEditing(task);
      setTitle(task.title);
      setDescription(task.description || '');
      setPriority(task.priority);
      setStatus(task.status);
    } else {
      setEditing(null);
      setTitle('');
      setDescription('');
      setPriority('mid');
      setStatus('in progress');
    }
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!title.trim()) return;
    const now = new Date();

    if (editing) {
      const updated: Task = {
        ...editing,
        title,
        description,
        priority,
        status,
      };
      await updateItem(updated);
      dispatch(updateTask(updated));
    } else {
      const taskData = {
        title,
        description,
        date: now.toISOString(),
        priority,
        status,
      };
      await addItem(taskData);
      dispatch(addTask({ id: Date.now(), ...taskData }));
    }
    setModalVisible(false);
  };

  const handleDelete = async () => {
    if (!editing) return;
    await deleteItem(editing.id);
    dispatch(deleteTask(editing.id));
    setModalVisible(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Всі події</Text>

      <FlatList
        data={tasks}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={{ paddingBottom: 100 }}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} onPress={() => openModal(item)}>
            <Text style={styles.title}>{item.title}</Text>
            {item.description ? (
              <Text style={styles.description}>{item.description}</Text>
            ) : null}
            <Text style={styles.meta}>
              {new Date(item.date).toLocaleString()}
            </Text>
          </TouchableOpacity>
        )}
      />

      <TouchableOpacity style={styles.fab} onPress={() => openModal()}>
        <Ionicons name="add" size={32} color="#fff" />
      </TouchableOpacity>

      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {editing ? 'Редагувати подію' : 'Нова подія'}
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Назва події"
              value={title}
              onChangeText={setTitle}
            />

            <TextInput
              style={[styles.input, { height: 80 }]}
              placeholder="Опис"
              value={description}
              onChangeText={setDescription}
              multiline
            />

            <Text style={styles.label}>Пріоритет:</Text>
            <View style={styles.row}>
              {(['low', 'mid', 'high'] as const).map(p => (
                <TouchableOpacity
                  key={p}
                  style={[styles.tag, priority === p && styles.selected]}
                  onPress={() => setPriority(p)}
                >
                  <Text style={priority === p ? styles.selectedText : undefined}>{p}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Статус:</Text>
            <View style={styles.row}>
              {(['in progress', 'completed'] as const).map(s => (
                <TouchableOpacity
                  key={s}
                  style={[styles.tag, status === s && styles.selected]}
                  onPress={() => setStatus(s)}
                >
                  <Text style={status === s ? styles.selectedText : undefined}>{s}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.buttonText}>Зберегти</Text>
            </TouchableOpacity>

            {editing && (
              <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
                <Text style={styles.buttonText}>Видалити</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Text style={{ textAlign: 'center', marginTop: 10, color: '#888' }}>Скасувати</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 60, paddingHorizontal: 20 },
  heading: { fontSize: 26, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 10,
    marginBottom: 10,
    elevation: 2,
  },
  title: { fontSize: 16, fontWeight: '600' },
  description: { fontSize: 14, marginTop: 4 },
  meta: { fontSize: 12, color: '#666', marginTop: 6 },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 30,
    backgroundColor: '#007AFF',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: '#00000066',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
  },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 12, textAlign: 'center' },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
    backgroundColor: '#fff',
  },
  label: { fontWeight: 'bold', marginBottom: 4 },
  row: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  tag: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#eee',
  },
  selected: { backgroundColor: '#007AFF' },
  selectedText: { color: '#fff' },
  saveButton: { backgroundColor: '#007AFF', padding: 14, borderRadius: 8 },
  deleteButton: { backgroundColor: '#ff3b30', padding: 14, borderRadius: 8, marginTop: 10 },
  buttonText: { color: '#fff', fontWeight: 'bold', textAlign: 'center' },
});
