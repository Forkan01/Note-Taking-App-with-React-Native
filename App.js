import React, { useState, useEffect } from 'react';
import { SafeAreaView, TextInput, Button, FlatList, Text, View, StyleSheet, TouchableOpacity } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { createClient } from '@supabase/supabase-js';

// Superbase client configuration
const supabaseUrl = 'https://itiyvielwymysiipvbxm.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml0aXl2aWVsd3lteXNpaXB2YnhtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTE1NDYyMiwiZXhwIjoyMDY2NzMwNjIyfQ.QNzdye2x2IK_R8zwh8yIyCmFLdFrCYzo0stDRDvg_1s';
const supabase = createClient(supabaseUrl, supabaseKey);

// Authentication screen for sign-in & sigh-up
function AuthScreen({ setAuthenticated, setUserId }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Function to handle user sign-in
  const signIn = async () => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (!error) {
      setAuthenticated(true);
      setUserId(data.user.id); // Save user ID after successful sign-in
    } else alert('Sign In Failed');
  };

  // Function to handle user sign-up
  const signUp = async () => {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (!error) alert('Sign Up Successful');
    else alert('Sign Up Failed');
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Welcome</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        secureTextEntry
        onChangeText={setPassword}
      />
      <Button title="Sign In" onPress={signIn} />
      <Button title="Sign Up" onPress={signUp} />
    </SafeAreaView>
  );
}

// Note screen to display & manage user notes
function NotesScreen({ userId, setAuthenticated }) {
  const [note, setNote] = useState('');
  const [notes, setNotes] = useState([]);
  
  // Fetch notes for the authenticated user on component mount
  useEffect(() => {
    const fetchNotes = async () => {
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .eq('user_id', userId);

      if (!error) setNotes(data); // Set fetched note to state
    };

    fetchNotes();
  }, [userId]);

  // Function to add a new note
  const addNote = async () => {
    if (note.trim()) {
      const newNote = { text: note, user_id: userId }; // Prepare note object
      const { data, error } = await supabase
        .from('notes')
        .insert(newNote)
        .select();

      if (!error) setNotes([...notes, data[0]]); // Update notes list
      setNote(''); // Clear input field
    }
  };

  // Function to delete a note by ID
  const deleteNote = async (id) => {
    const { error } = await supabase
      .from('notes')
      .delete()
      .eq('id', id);

    if (!error) setNotes(notes.filter((item) => item.id !== id)); // Remove deleted note from state
  };

  // Function to sign out the user
  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) setAuthenticated(false); // Reset authentication state
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="auto" />
      <View style={[styles.headerContainer, { marginTop: 20 }]}>
        <Text style={styles.header}>Notes</Text>
        <TouchableOpacity style={styles.logoutButton} onPress={signOut}>
          <Text style={styles.logoutButtonText}>Log Out</Text>
        </TouchableOpacity>
      </View>
      <TextInput
        style={styles.input}
        placeholder="Type your note here..."
        value={note}
        onChangeText={setNote}
      />
      <Button title="Add Note" onPress={addNote} />
      <FlatList
        data={notes}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.noteContainer}>
            <Text style={styles.noteText}>{item.text}</Text>
            <Button title="Delete" color="red" onPress={() => deleteNote(item.id)} />
          </View>
        )}
      />
    </SafeAreaView>
  );
}

// Main app component to manage authentication state
export default function App() {
  const [authenticated, setAuthenticated] = useState(false); // Authentication state
  const [userId, setUserId] = useState(null); // User ID state

  return authenticated ? (
    <NotesScreen userId={userId} setAuthenticated={setAuthenticated} />
  ) : (
    <AuthScreen setAuthenticated={setAuthenticated} setUserId={setUserId} />
  );
}

// Styles for the application
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  logoutButton: {
    backgroundColor: 'red',
    padding: 8,
    borderRadius: 8,
  },
  logoutButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    backgroundColor: '#fff',
  },
  noteContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 10,
  },
  noteText: {
    flex: 1,
    fontSize: 16,
  },
});
