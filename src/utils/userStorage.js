const USERS_KEY = 'smart_chore_roster_users_db';
const ACTIVE_USER_KEY = 'smart_chore_roster_active_user';

export function getUsers() {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error('Error reading users from localStorage:', error);
    return [];
  }
}

export function saveUsers(users) {
  try {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  } catch (error) {
    console.error('Error saving users to localStorage:', error);
  }
}

export function getCurrentUser() {
  try {
    const raw = localStorage.getItem(ACTIVE_USER_KEY);
    if (!raw) return null;

    return JSON.parse(raw);
  } catch (error) {
    console.error('Error reading active user from localStorage:', error);
    return null;
  }
}

export function setCurrentUser(user) {
  try {
    if (!user) {
      localStorage.removeItem(ACTIVE_USER_KEY);
      return;
    }

    localStorage.setItem(ACTIVE_USER_KEY, JSON.stringify(user));
  } catch (error) {
    console.error('Error saving active user to localStorage:', error);
  }
}

export function clearCurrentUser() {
  localStorage.removeItem(ACTIVE_USER_KEY);
}

export function registerUser({ name, email, password }) {
  const trimmedName = name?.trim();
  const trimmedEmail = email?.trim().toLowerCase();
  const trimmedPassword = password?.trim();

  if (!trimmedName || !trimmedEmail || !trimmedPassword) {
    return { error: 'Please complete all fields.' };
  }

  if (trimmedPassword.length < 6) {
    return { error: 'Password must be at least 6 characters long.' };
  }

  const users = getUsers();
  const emailExists = users.some(user => user.email === trimmedEmail);
  if (emailExists) {
    return { error: 'An account with this email already exists.' };
  }

  const newUser = {
    id: `user-${Date.now().toString(36)}`,
    name: trimmedName,
    email: trimmedEmail,
    password: trimmedPassword,
    createdAt: new Date().toISOString()
  };

  saveUsers([...users, newUser]);
  setCurrentUser(newUser);

  return { user: newUser };
}

export function authenticateUser({ email, password }) {
  const trimmedEmail = email?.trim().toLowerCase();
  const trimmedPassword = password?.trim();

  if (!trimmedEmail || !trimmedPassword) {
    return { error: 'Email and password are required.' };
  }

  const user = getUsers().find(
    storedUser => storedUser.email === trimmedEmail && storedUser.password === trimmedPassword
  );

  if (!user) {
    return { error: 'Invalid email or password.' };
  }

  const safeUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    createdAt: user.createdAt
  };

  setCurrentUser(safeUser);
  return { user: safeUser };
}
