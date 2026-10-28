import { STORAGE_KEYS } from '@/lib/constants';
import { storage } from '@/lib/storage';
import { uid } from '@/lib/format';

const hash = (s) => btoa(unescape(encodeURIComponent(s)));

export function getUsers() {
  let users = storage.get(STORAGE_KEYS.USERS, []);
  
  // AUTO-CREATE DEMO USER KUNG WALA PA
  if (users.length === 0 || !users.find(u => u.email === 'demo@paytrack.app')) {
    const demoUser = {
      id: 'demo-123',
      name: 'Demo User',
      email: 'demo@paytrack.app',
      passwordHash: hash('demo1234'),
      createdAt: new Date().toISOString()
    };
    // Idagdag sa listahan
    users = [...users, demoUser];
    saveUsers(users);
  }
  
  return users;
}

export function saveUsers(users) {
  storage.set(STORAGE_KEYS.USERS, users);
}

export function getSession() {
  return storage.get(STORAGE_KEYS.SESSION, null);
}

export function saveSession(user) {
  storage.set(STORAGE_KEYS.SESSION, user);
}

export function clearSession() {
  storage.remove(STORAGE_KEYS.SESSION);
}

export function signup(name, email, password) {
  const users = getUsers();
  if (users.find((u) => u.email.toLowerCase() === email.toLowerCase())) {
    throw new Error('Email already registered');
  }
  const user = {
    id: uid(),
    name,
    email: email.toLowerCase(),
    passwordHash: hash(password),
    createdAt: new Date().toISOString(),
  };
  saveUsers([...users, user]);
  const { passwordHash, ...safeUser } = user;
  saveSession(safeUser);
  return safeUser;
}

export function login(email, password) {
  const users = getUsers();
  const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (!user) throw new Error('User not found');
  if (user.passwordHash !== hash(password)) throw new Error('Incorrect password');
  const { passwordHash, ...safeUser } = user;
  saveSession(safeUser);
  return safeUser;
}

export function logout() {
  clearSession();
}