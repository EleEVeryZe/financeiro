// src/App.tsx
import { gapi } from "gapi-script";
import React, { useEffect, useState } from "react";
import MainPage from "./components/MainPage";
import { AuthProvider } from "./context/AuthContext";
import {
  API_KEY,
  CLIENT_ID,
  DISCOVERY_DOCS,
  SCOPES,
} from "./services/googleApi";

const App: React.FC = () => {
  const [gapiInitialized, setGapiInitialized] = useState<boolean>(false);

  useEffect(() => {
    const initClient = () => {
      gapi.client
        .init({
          apiKey: API_KEY,
          clientId: CLIENT_ID,
          discoveryDocs: DISCOVERY_DOCS,
          scope: SCOPES,
        })
        .then(
          () => {
            console.log("GAPI client initialized.");
            setGapiInitialized(true);
          },
          (error) => {
            console.error("Error initializing GAPI client:", error);
          }
        );
    };

    gapi.load("client:auth2", initClient);
  }, []);

  if (!gapiInitialized) {
    return <div>Loading...</div>;
  }

  return (
    <AuthProvider>
      <MainPage />
    </AuthProvider>
  );
};

export default App;
