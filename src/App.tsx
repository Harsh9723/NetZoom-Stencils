import React, { useEffect, useState } from 'react';
import MainPage from './Pages/MainPage';
import PreloadPage from './Components/PreloadPage';
import axios from 'axios';
import BASE_URL, { SESSION_URL } from './Config/Config';
import { error } from 'console';

declare global {
  interface Window {
    Office: any;
  }
}

const App: React.FC = () => {
  const [showMainPage, setShowMainPage] = useState<boolean>(false);
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowMainPage(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (window.Office) {
      window.Office.initialize = function () {
        console.log('Office is ready.');
      };
    }
  }, []);

  useEffect(() => {
    if (window.Office) {
      window.Office.onReady((info: { host: string }) => {
        if (info.host === window.Office.HostType.Word) {
          console.log('Word is ready');
        }
      });
    }
  }, []);


  const createsession = async () => {

    try {
      const session = await axios.post(`${SESSION_URL}create_session`);
      const data = session.data.data;
      const newSessionID = data.newSessionID;

      if (newSessionID) {
        sessionStorage.setItem('sessionID', newSessionID);
        sessionStorage.setItem('session variable', data.jsonSessionOutput)
        console.log("Session ID stored in sessionStorage:", newSessionID);
      }
    } catch (error) {
      console.error("Error creating session:", error);
    }
  }

  useEffect(() => {
    let session = sessionStorage.getItem("sessionID")
    if (session) {
      const CheckOpensession = async () => {
        let response = await axios.post(`${SESSION_URL}is_session_open`, {
          sessionId: session
        })
        if (response && response.data) {
          let isOpen = response.data.data.isOpen ? response.data.data.isOpen :false
          if (!isOpen) {
            createsession()
          }
        } else {
          createsession()
        }
      }
      CheckOpensession()
    } else if (!session){
      createsession()
    }
  }, [])


  return (
    <div className='App'>
      {showMainPage ? <MainPage /> : <PreloadPage />}

    </div>
  );
}

export default App;
