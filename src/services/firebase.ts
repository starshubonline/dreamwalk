import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer, collection, query, orderBy, limit, onSnapshot, setDoc, serverTimestamp, updateDoc } from 'firebase/firestore';

// In AI Studio, the config is usually in firebase-applet-config.json
const firebaseConfig = {
  apiKey: "PLACEHOLDER",
  authDomain: "PLACEHOLDER",
  projectId: "PLACEHOLDER",
  storageBucket: "PLACEHOLDER",
  messagingSenderId: "PLACEHOLDER",
  appId: "PLACEHOLDER",
  firestoreDatabaseId: "(default)"
};

// Try to load from the generated config if it exists
let config = firebaseConfig;
// @ts-ignore
const modules = import.meta.glob('../../firebase-applet-config.json', { eager: true });
const configKey = Object.keys(modules)[0];
if (configKey) {
  config = (modules[configKey] as any).default;
}

const app = initializeApp(config);
export const db = getFirestore(app, config.firestoreDatabaseId);
export const auth = getAuth(app);

// Simulated Real-time for when Firebase is not configured
const mockLeaderboard = [
  { id: '1', name: 'Alex M.', steps: 124502, rank: 1, avatar: 'AM' },
  { id: '2', name: 'Sarah K.', steps: 98201, rank: 2, avatar: 'SK' },
  { id: '3', name: 'Mike J.', steps: 87442, rank: 3, avatar: 'MJ' },
  { id: '4', name: 'Elena R.', steps: 76551, rank: 4, avatar: 'ER' },
];

export async function createWithdrawal(userId: string, amount: number, address: string) {
  if (config.apiKey === "PLACEHOLDER") {
    console.log(`Mock Withdrawal: ${amount} SATS to ${address}`);
    return { success: true, txId: `mock-tx-${Date.now()}` };
  }

  const txRef = doc(collection(db, `users/${userId}/transactions`));
  const userRef = doc(db, 'users', userId);
  
  try {
    await setDoc(txRef, {
      userId,
      type: 'withdrawal',
      amount: -Math.abs(amount),
      status: 'pending',
      address,
      timestamp: serverTimestamp(),
      description: 'Bitcoin Withdrawal'
    });
    return { success: true, txId: txRef.id };
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `users/${userId}/transactions`);
    return { success: false };
  }
}

export function subscribeToLeaderboard(callback: (data: any[]) => void) {
  if (config.apiKey === "PLACEHOLDER") {
    const interval = setInterval(() => {
      const updated = mockLeaderboard.map(u => ({
        ...u,
        steps: u.steps + Math.floor(Math.random() * 50)
      })).sort((a, b) => b.steps - a.steps)
         .map((u, i) => ({ ...u, rank: i + 1 }));
      callback(updated);
    }, 3000);
    callback(mockLeaderboard);
    return () => clearInterval(interval);
  }

  const q = query(collection(db, "leaderboard"), orderBy("steps", "desc"), limit(10));
  return onSnapshot(q, (snapshot) => {
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(data);
  }, (error) => {
    handleFirestoreError(error, OperationType.GET, "leaderboard");
  });
}

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if(error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration. You are currently offline or config is invalid.");
    }
  }
}

if (config.apiKey !== "PLACEHOLDER") {
  testConnection();
}

export { OperationType };
