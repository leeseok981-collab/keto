import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithCredential, signOut } from 'firebase/auth';
import { initializeFirestore } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const db = initializeFirestore(app, { experimentalForceLongPolling: true }, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();


let loginInProgress = false;

export const loginWithGSI = async (credential: string) => {
  if (loginInProgress) return null;
  loginInProgress = true;
  try {
    const cred = GoogleAuthProvider.credential(credential);
    const result = await signInWithCredential(auth, cred);
    return result.user;
  } catch (error) {
    console.error("GSI Login failed", error);
    throw error;
  } finally {
    loginInProgress = false;
  }
};

export const loginWithGoogle = async () => {
  if (loginInProgress) {
    console.warn("Google login is already in progress, ignoring concurrent request.");
    return null;
  }

  loginInProgress = true;
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error: any) {
    const code = error?.code || '';
    const message = error?.message || '';
    if (
      code === 'auth/cancelled-popup-request' ||
      code === 'auth/popup-closed-by-user' ||
      code === 'auth/popup-blocked' ||
      code === 'auth/user-cancelled' ||
      message.includes('cancelled-popup-request') ||
      message.includes('popup-closed-by-user') ||
      message.includes('popup-blocked')
    ) {
      console.warn("Google login popup was closed or request cancelled by user.");
      return null;
    }
    console.error("Login failed", error);
    throw error;
  } finally {
    loginInProgress = false;
  }
};

export const logout = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Logout failed", error);
  }
};
