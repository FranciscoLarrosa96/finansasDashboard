export interface Environment {
  production: boolean;
  firebaseConfig: {
    apiKey: string;
    authDomain: string;
    projectId: string;
    storageBucket: string;
    messagingSenderId: string;
    appId: string;
  };
}

export const environment: Environment = {
    production: false,
    firebaseConfig: {
        apiKey: "AIzaSyDikPuo8FKl3QnBbuxB39HCexZhTbli4oo",
        authDomain: "finanzas-dashboard-9a0e6.firebaseapp.com",
        projectId: "finanzas-dashboard-9a0e6",
        storageBucket: "finanzas-dashboard-9a0e6.firebasestorage.app",
        messagingSenderId: "1044784431774",
        appId: "1:1044784431774:web:7ecab65cb4aa53d302718f"
    }
};

