/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom';

// Mock firebase/auth and related before importing components
jest.mock('firebase/app', () => ({ initializeApp: jest.fn(), getApps: () => [], getApp: jest.fn() }));
jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(),
  createUserWithEmailAndPassword: jest.fn(),
  signInWithEmailAndPassword: jest.fn(),
  signOut: jest.fn(),
  onAuthStateChanged: jest.fn(() => () => undefined),
}));
jest.mock('firebase/firestore', () => ({ getFirestore: jest.fn() }));

const mockSignIn = jest.fn();
const mockSignUp = jest.fn();

jest.mock('@/components/auth/AuthProvider', () => ({
  useAuthContext: () => ({
    user: null,
    loading: false,
    firebaseReady: true,
    signIn: mockSignIn,
    signUp: mockSignUp,
    signOut: jest.fn(),
  }),
}));

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { LoginDialog } from '@/components/auth/LoginDialog';

describe('LoginDialog', () => {
  beforeEach(() => {
    mockSignIn.mockReset();
    mockSignUp.mockReset();
  });

  it('renders Login/SignUp tabs', () => {
    render(<LoginDialog open={true} onClose={() => {}} />);
    // 'Login' appears twice: tab + button
    expect(screen.getAllByText('Login').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Sign Up')).toBeInTheDocument();
  });

  it('shows Email and Password fields', () => {
    render(<LoginDialog open={true} onClose={() => {}} />);
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
  });

  it('submit button disabled when fields empty', () => {
    render(<LoginDialog open={true} onClose={() => {}} />);
    const buttons = screen.getAllByText('Login');
    // Last 'Login' is the submit button
    const submitBtn = buttons[buttons.length - 1].closest('button');
    expect(submitBtn).toBeDisabled();
  });

  it('calls signIn with email+password on submit', async () => {
    mockSignIn.mockResolvedValue({ uid: 'test' });
    const onClose = jest.fn();
    render(<LoginDialog open={true} onClose={onClose} />);
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'a@b.c' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'pass123' } });
    const loginButtons = screen.getAllByText('Login');
    // Click the last one (the button, not the tab)
    fireEvent.click(loginButtons[loginButtons.length - 1]);
    await waitFor(() => expect(mockSignIn).toHaveBeenCalledWith('a@b.c', 'pass123'));
    await waitFor(() => expect(onClose).toHaveBeenCalled());
  });

  it('switches to signup tab and shows Create Account', () => {
    render(<LoginDialog open={true} onClose={() => {}} />);
    fireEvent.click(screen.getByText('Sign Up'));
    expect(screen.getByText('Create Account')).toBeInTheDocument();
  });

  it('calls signUp on signup tab submit', async () => {
    mockSignUp.mockResolvedValue({ uid: 'new' });
    render(<LoginDialog open={true} onClose={() => {}} />);
    fireEvent.click(screen.getByText('Sign Up'));
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'new@b.c' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'pass123' } });
    fireEvent.click(screen.getByText('Create Account'));
    await waitFor(() => expect(mockSignUp).toHaveBeenCalledWith('new@b.c', 'pass123'));
  });

  it('displays auth error with Firebase prefix stripped', async () => {
    mockSignIn.mockRejectedValue(new Error('Firebase: Invalid credentials'));
    render(<LoginDialog open={true} onClose={() => {}} />);
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'a@b.c' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'wrong' } });
    const loginButtons = screen.getAllByText('Login');
    fireEvent.click(loginButtons[loginButtons.length - 1]);
    await waitFor(() => {
      expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
    });
  });

  it('clears error when switching tabs', async () => {
    mockSignIn.mockRejectedValue(new Error('Firebase: bad'));
    render(<LoginDialog open={true} onClose={() => {}} />);
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'a@b.c' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'bad' } });
    const loginButtons = screen.getAllByText('Login');
    fireEvent.click(loginButtons[loginButtons.length - 1]);
    await waitFor(() => expect(screen.getByText('bad')).toBeInTheDocument());
    fireEvent.click(screen.getByText('Sign Up'));
    expect(screen.queryByText('bad')).not.toBeInTheDocument();
  });

  it('Cancel button calls onClose', () => {
    const onClose = jest.fn();
    render(<LoginDialog open={true} onClose={onClose} />);
    fireEvent.click(screen.getByText('Cancel'));
    expect(onClose).toHaveBeenCalled();
  });
});
