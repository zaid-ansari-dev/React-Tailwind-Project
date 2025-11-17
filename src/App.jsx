// src/App.jsx

import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient'; // Import our new supabase client

export default function App() {
  // --- AUTH STATE ---
  // This state will hold the user's session data if they are logged in
  const [session, setSession] = useState(null);
  // These states are for the login/signup form
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false); // To show a loading state

  // --- TODO LIST STATE (from before) ---
  const [todos, setTodos] = useState([]); // Start with an empty list
  const [newTask, setNewTask] = useState('');

  // This useEffect hook runs once when the component loads.
  // It checks if a user is already logged in.
  useEffect(() => {
    // Get the current session from Supabase
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    // This is the "magic" listener.
    // It listens for any changes in auth state (login, logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session); // Update the session state when auth changes
      }
    );

    // This cleanup function will unsubscribe from the listener when the component unmounts
    return () => subscription.unsubscribe();
  }, []); // The empty array [] means this effect runs only once

  
  // --- AUTH FUNCTIONS ---
  const handleSignUp = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) {
      alert(error.message); // Show a simple error message
    } else {
      alert('Sign up successful! Please check your email to verify.'); // Supabase sends a verification email
    }
    setLoading(false);
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      alert(error.message); // Show a simple error message
    }
    // No 'else' needed, the onAuthStateChange listener will set the session
    setLoading(false);
  };

  const handleSignOut = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signOut();
    if (error) alert(error.message);
    setLoading(false);
  };

  // --- TODO FUNCTIONS (Still fake for now) ---
  const handleSubmit = (e) => {
    e.preventDefault();
    if (newTask.trim() === '') return;
    console.log('Adding new task (still fake):', newTask);
    const fakeNewTodo = { id: Date.now(), text: newTask, is_completed: false };
    setTodos([...todos, fakeNewTodo]);
    setNewTask('');
  };

  const toggleComplete = (id) => {
    console.log(`Toggling complete for task ${id} (still fake)`);
    setTodos(
      todos.map((todo) =>
        todo.id === id ? { ...todo, is_completed: !todo.is_completed } : todo
      )
    );
  };

  const deleteTodo = (id) => {
    console.log(`Deleting task ${id} (still fake)`);
    setTodos(todos.filter((todo) => todo.id !== id));
  };

  // --- JSX RENDER ---
  // This is the most important part:
  // We check if the 'session' state is null.
  // If it IS null (user is logged out), show the Auth Form.
  // If it is NOT null (user is logged in), show the Todo List.
  if (!session) {
    // --- AUTH FORM (User is Logged Out) ---
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
  } else {
    // --- TODO LIST (User is Logged In) ---
    return (
      <div className="min-h-screen bg-gray-900 text-gray-100 flex items-center justify-center font-sans">
        <div className="w-full max-w-lg p-6 bg-gray-800 rounded-lg shadow-lg">
          
          {/* --- Header --- */}
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

          {/* --- Add Task Form --- */}
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

          {/* --- To-Do List --- */}
          <div className="space-y-3">
            {todos.map((todo) => (
              <div
                key={todo.id}
                className="flex items-center justify-between p-4 bg-gray-700 rounded-lg group"
              >
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => toggleComplete(todo.id)}
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
          </div>
          {todos.length === 0 && (
            <p className="text-center text-gray-500 mt-6">
              You have no tasks. Add one above!
            </p>
          )}
        </div>
      </div>
    );
  }
}