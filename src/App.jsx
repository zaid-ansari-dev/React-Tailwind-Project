// src/App.jsx

import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient'; // We're using this!

// --- This Auth component is new ---
// It's the same login form from before, just moved into its own component
// to keep the App.jsx file cleaner.
function Auth() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignUp = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) {
      alert(error.message);
    } else {
      alert('Sign up successful! (Email verification is off)');
    }
    setLoading(false);
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      alert(error.message);
    }
    // No 'else' needed, the onAuthStateChange listener in App will handle it
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex items-center justify-center">
      <div className="w-full max-w-sm p-6 bg-gray-800 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold text-center text-blue-400 mb-6">
          Supabase Todos
        </h1>
        <p className="text-center text-gray-400 mb-4">
          Sign in or create an account
        </p>
        <form className="space-y-4">
          <input
            type="email"
            placeholder="Your email"
            className="w-full p-3 bg-gray-700 rounded-lg text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Your password"
            className="w-full p-3 bg-gray-700 rounded-lg text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <div className="flex gap-2">
            <button
              onClick={handleSignIn}
              disabled={loading}
              className="flex-1 bg-blue-600 text-white px-5 py-3 rounded-lg font-semibold hover:bg-blue-700 transition duration-200 disabled:bg-gray-600"
            >
              {loading ? 'Loading...' : 'Sign In'}
            </button>
            <button
              onClick={handleSignUp}
              disabled={loading}
              className="flex-1 bg-gray-600 text-white px-5 py-3 rounded-lg font-semibold hover:bg-gray-700 transition duration-200 disabled:bg-gray-600"
            >
              {loading ? 'Loading...' : 'Sign Up'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// --- This is the main App component ---
export default function App() {
  const [session, setSession] = useState(null);
  const [todos, setTodos] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [loading, setLoading] = useState(false); // A general loading state

  // --- AUTH + DATA FETCHING ---
  useEffect(() => {
    // Check for a session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
      }
    );

    // Cleanup
    return () => subscription.unsubscribe();
  }, []);

  // This new useEffect hook runs when the 'session' state changes.
  // If we have a session (user is logged in), it fetches their todos.
  useEffect(() => {
    if (session) {
      fetchTodos();
    }
  }, [session]); // Dependency array: runs when 'session' changes

  // --- REAL SUPABASE FUNCTIONS ---

  // 1. Fetch Todos (SELECT)
  const fetchTodos = async () => {
    setLoading(true);
    // Select all todos from the 'todos' table
    const { data, error } = await supabase
      .from('todos')
      .select('*')
      .order('created_at', { ascending: false }); // Show newest first

    if (error) {
      alert(error.message);
    } else {
      setTodos(data);
    }
    setLoading(false);
  };

  // 2. Add Todo (INSERT) - THIS IS THE CRITICAL FUNCTION
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newTask.trim() === '') return;

    // We no longer need user_id here because our
    // database column has the 'auth.uid()' default value!
    const newTodo = {
      text: newTask,
    };

    // This is the line that saves to the database
    const { data, error } = await supabase.from('todos').insert(newTodo).select();

    if (error) {
      alert(error.message);
    } else {
      // Add the new todo to the beginning of the local state
      // so we see it instantly
      setTodos([data[0], ...todos]);
      setNewTask(''); // Clear input
    }
  };

  // 3. Update Todo (UPDATE)
  const toggleComplete = async (id, is_completed) => {
    const { error } = await supabase
      .from('todos')
      .update({ is_completed: !is_completed }) // Flip the value
      .match({ id: id }); // ...for the specific todo ID

    if (error) {
      alert(error.message);
    } else {
      // Update the local state to match
      setTodos(
        todos.map((todo) =>
          todo.id === id ? { ...todo, is_completed: !is_completed } : todo
        )
      );
    }
  };

  // 4. Delete Todo (DELETE)
  const deleteTodo = async (id) => {
    const { error } = await supabase
      .from('todos')
      .delete()
      .match({ id: id }); // ...for the specific todo ID

    if (error) {
      alert(error.message);
    } else {
      // Update local state to match
      setTodos(todos.filter((todo) => todo.id !== id));
    }
  };

  // 5. Sign Out
  const handleSignOut = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signOut();
    if (error) alert(error.message);
    setLoading(false);
    setTodos([]); // Clear the todos on sign out
  };
  
  // --- RENDER ---
  // If no session, show the Auth component.
  if (!session) {
    return <Auth />;
  }

  // If there is a session, show the Todo List.
  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex items-center justify-center font-sans">
      <div className="w-full max-w-lg p-6 bg-gray-800 rounded-lg shadow-lg">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-blue-400">
            My Supabase Todo List
          </h1>
          <button
            onClick={handleSignOut}
            disabled={loading}
            className="bg-red-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-700 transition duration-200 disabled:bg-gray-600"
          >
            {loading ? '...' : 'Sign Out'}
          </button>
        </div>
        <p className="text-gray-400 mb-4">
          Welcome, {session.user.email}
        </p>

        {/* Add Task Form */}
        <form onSubmit={handleSubmit} className="flex gap-2 mb-6">
          <input
            type="text"
            placeholder="Add a new task..."
            className="flex-grow p-3 bg-gray-700 rounded-lg text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
          />
          <button
            type="submit"
            className="bg-blue-600 text-white px-5 py-3 rounded-lg font-semibold hover:bg-blue-700 transition duration-200"
          >
            Add
          </button>
        </form>

        {/* To-Do List */}
        <div className="space-y-3">
          {loading && <p className="text-center text-gray-400">Loading...</p>}
          
          {!loading && todos.map((todo) => (
            <div
              key={todo.id}
              className="flex items-center justify-between p-4 bg-gray-700 rounded-lg group"
            >
              <div className="flex items-center gap-3">
                <button
                  onClick={() => toggleComplete(todo.id, todo.is_completed)}
                  className={`w-6 h-6 rounded-full border-2 transition-all duration-200 ${
                    todo.is_completed
                      ? 'bg-green-500 border-green-500'
                      : 'border-gray-500 group-hover:border-green-500'
                  }`}
                >
                  {todo.is_completed && (
                    <svg xmlns="http://www.w.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-5 h-5 text-white">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  )}
                </button>
                <span className={`text-lg ${todo.is_completed ? 'line-through text-gray-500' : 'text-gray-100'}`}>
                  {todo.text}
                </span>
              </div>
              <button
                onClick={() => deleteTodo(todo.id)}
                className="text-gray-500 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all duration-200"
              >
                <svg xmlns="http://www.w.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12.54 0c-.27.042-.536.09-.798.147M5.7 5.79L5.7 5.79" />
                </svg>
              </button>
            </div>
          ))}
          
          {!loading && todos.length === 0 && (
            <p className="text-center text-gray-500 mt-6">
              You have no tasks. Add one above!
            </p>
          )}
        </div>
      </div>
    </div>
  );
}