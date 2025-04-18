import { useEffect, useState } from 'react';
import {
  FlatList,
  TouchableOpacity,
  Modal,
  TextInput,
  StyleSheet,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { addTask, setTasks, updateTask, deleteTask } from '@/redux/slices/tasksSlice';
import { getItems, addItem, updateItem, deleteItem, init } from '@/store/tasksDb';
import { Task } from '@/types';
import { View, Text, useThemeColor } from '@/components/Themed';
import { View as RNView } from 'react-native';
import * as FileSystem from 'expo-file-system'; // для resetDB

export default function Diary() {
  const dispatch = useAppDispatch();
  const tasks = useAppSelector(state => state.tasks.tasks);

  const text = useThemeColor({}, 'text');
  const background = useThemeColor({}, 'background');

  const [modalVisible, setModalVisible] = useState(false);
  const [editing, setEditing] = useState<null | Task>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'low' | 'mid' | 'high'>('mid');
  const [status, setStatus] = useState<'in progress' | 'completed'>('in progress');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showDateModal, setShowDateModal] = useState(false);

  useEffect(() => {
    const load = async () => {
      await init();
      const data = await getItems();
      dispatch(setTasks(data));
    };
    load();
  }, []);

  const openModal = (task?: Task) => {
    setShowDatePicker(false);
    if (task) {
      setEditing(task);
      setTitle(task.title);
      setDescription(task.description || '');
      setPriority(task.priority);
      setStatus(task.status);
      setDate(new Date(task.date));
    } else {
      setEditing(null);
      setTitle('');
      setDescription('');
      setPriority('mid');
      setStatus('in progress');
      setDate(new Date());
    }
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!title.trim()) return;
    console.log('Saving...');

    if (editing) {
      const updated: Task = {
        ...editing,
        title,
        description,
        priority,
        status,
        date: date.toISOString(),
      };
      await updateItem(updated);
      dispatch(updateTask(updated));
      console.log('Updated:', updated);
    } else {
      const taskData = {
        title,
        description,
        date: date.toISOString(),
        priority,
        status,
      };
      try {
        const id = await addItem(taskData);
        console.log('Inserted ID:', id);
        dispatch(addTask({ id, ...taskData }));
        console.log('Added:', { id, ...taskData });
      } catch (e) {
        console.error('❌ addItem error:', e);
      }
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
      <Text style={[styles.heading, { color: text }]}>Всі події</Text>

      <FlatList
        data={tasks}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={{ paddingBottom: 100 }}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <RNView
              style={{
                backgroundColor: background,
                padding: 10,
                borderRadius: 8,
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <View>
                <Text style={[styles.title, { color: text }]}>{item.title}</Text>
                {item.description ? (
                  <Text style={[styles.description, { color: text }]}>{item.description}</Text>
                ) : null}
                <Text style={[styles.meta, { color: text }]}>
                  {new Date(item.date).toLocaleString()}
                </Text>
              </View>

              <TouchableOpacity onPress={() => openModal(item)}>
                <Ionicons name="create-outline" size={24} color="#007AFF" />
              </TouchableOpacity>
            </RNView>
          </View>
        )}
      />

      <TouchableOpacity style={styles.fab} onPress={() => openModal()}>
        <Ionicons name="add" size={32} color="#fff" />
      </TouchableOpacity>

      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: background }]}>
            <Text style={[styles.modalTitle, { color: text }]}>
              {editing ? 'Редагувати подію' : 'Нова подія'}
            </Text>

            <TextInput
              style={[styles.input, { backgroundColor: background, color: text }]}
              placeholder="Назва події"
              placeholderTextColor="#888"
              value={title}
              onChangeText={setTitle}
            />

            <TextInput
              style={[styles.input, { height: 80, backgroundColor: background, color: text }]}
              placeholder="Опис"
              placeholderTextColor="#888"
              value={description}
              onChangeText={setDescription}
              multiline
            />

            <Text style={[styles.label, { color: text }]}>Дата:</Text>

            <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.dateButton}>
              <Text style={{ color: text }}>
                {date.toLocaleDateString()} {date.toLocaleTimeString()}
              </Text>
            </TouchableOpacity>

            {showDatePicker && (
              <DateTimePicker
                value={date}
                mode="datetime"
                display={Platform.OS === 'ios' ? 'inline' : 'default'}
                onChange={(event, selectedDate) => {
                  setShowDatePicker(false);
                  if (selectedDate) setDate(selectedDate);  
                }}
              />
            )}


            <Text style={[styles.label, { color: text }]}>Пріоритет:</Text>
            <View style={styles.row}>
              {(['low', 'mid', 'high'] as const).map(p => (
                <TouchableOpacity
                  key={p}
                  style={[styles.tag, priority === p && styles.selected]}
                  onPress={() => setPriority(p)}
                >
                  <Text style={priority === p ? styles.selectedText : { color: text }}>
                    {p}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[styles.label, { color: text }]}>Статус:</Text>
            <View style={styles.row}>
              {(['in progress', 'completed'] as const).map(s => (
                <TouchableOpacity
                  key={s}
                  style={[styles.tag, status === s && styles.selected]}
                  onPress={() => setStatus(s)}
                >
                  <Text style={status === s ? styles.selectedText : { color: text }}>
                    {s}
                  </Text>
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
              <Text style={{ textAlign: 'center', marginTop: 10, color: '#888' }}>
                Скасувати
              </Text>
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
    padding: 16,
    borderRadius: 10,
    marginBottom: 10,
    elevation: 2,
  },
  title: { fontSize: 16, fontWeight: '600' },
  description: { fontSize: 14, marginTop: 4 },
  meta: { fontSize: 12, marginTop: 6 },
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
    borderRadius: 12,
    padding: 20,
  },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 12, textAlign: 'center' },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
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
  dateButton: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
  },
  dateModalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#00000066',
  },
  dateModalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    elevation: 10,
  },

});
