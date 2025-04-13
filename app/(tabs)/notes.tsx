import { useEffect, useState } from 'react';
import {
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { View, Text, useThemeColor } from '@/components/Themed';
import { initNotes, getNotes, addNote, updateNote } from '@/store/notesDb';
import type { Note } from '@/store/notesDb';

export default function Notes() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [noteText, setNoteText] = useState('');

  const bg = useThemeColor({}, 'background');
  const text = useThemeColor({}, 'text');
  const card = useThemeColor({}, 'card');

  useEffect(() => {
    (async () => {
      await initNotes();
      const data = await getNotes();
      setNotes(data);
    })();
  }, []);

  const openEdit = (note: Note) => {
    setSelectedNote(note);
    setNoteText(note.text);
    setModalVisible(true);
  };

  const openNew = () => {
    setSelectedNote(null);
    setNoteText('');
    setModalVisible(true);
  };

  const saveNote = async () => {
    if (noteText.trim() === '') return;

    if (selectedNote) {
      await updateNote(selectedNote.id, noteText.trim());
    } else {
      await addNote(noteText.trim());
    }

    const data = await getNotes();
    setNotes(data);
    setModalVisible(false);
    setNoteText('');
    setSelectedNote(null);
  };

  return (
    <View style={[styles.container, { backgroundColor: bg }]}> 
      <Text style={[styles.heading, { color: text }]}>Мої думки ✨</Text>

      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        {notes.map((note) => (
          <TouchableOpacity key={note.id} onPress={() => openEdit(note)}>
            <View style={[styles.noteCard, { backgroundColor: card }]}>
              <Text style={[styles.noteText, { color: text }]}>{note.text}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <TouchableOpacity style={styles.fab} onPress={openNew}>
        <Ionicons name="add" size={32} color="#fff" />
      </TouchableOpacity>

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: card }]}>
            <Text style={[styles.modalTitle, { color: text }]}> 
              {selectedNote ? 'Редагувати думку' : 'Нова думка'}
            </Text>

            <TextInput
              value={noteText}
              onChangeText={setNoteText}
              placeholder="Введи свою думку..."
              placeholderTextColor="#888"
              multiline
              style={[styles.input, { color: text, backgroundColor: bg, borderColor: '#ccc' }]}
            />

            <TouchableOpacity style={styles.saveButton} onPress={saveNote}>
              <Text style={styles.buttonText}>Зберегти</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setModalVisible(false)} style={{ marginTop: 10 }}>
              <Text style={{ textAlign: 'center', color: '#888' }}>Скасувати</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  heading: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  noteCard: {
    padding: 14,
    borderRadius: 8,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#FF8C00',
  },
  noteText: {
    fontSize: 16,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 30,
    backgroundColor: '#007AFF',
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 3 },
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: '#00000066',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    padding: 24,
    borderRadius: 12,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 14,
    minHeight: 100,
    textAlignVertical: 'top',
    marginBottom: 16,
  },
  saveButton: {
    backgroundColor: '#007AFF',
    padding: 14,
    borderRadius: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
