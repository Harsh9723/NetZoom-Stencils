import React, { useEffect, useState } from 'react';
import MainPage from './Pages/MainPage';
import PreloadPage from './Components/PreloadPage';
import axios from 'axios';
import  BASE_URL, { SESSION_URL } from './Config/Config';

declare global {
  interface Window {
    Office: any;
  }
}

const App: React.FC = () => {
  const [showMainPage, setShowMainPage] = useState<boolean>(false);
  const [isOpen,setIsOpen] = useState<boolean>(false)
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
const sessionOpen = async () =>{
  try {
    const response = await axios.post(`${SESSION_URL}is_session_open`,{
      sessionId: sessionStorage.getItem('sessionID')
    })
    console.log('response', response)
  } catch (error) {
    
  }
}
sessionOpen()

useEffect(() =>{
if(!isOpen){

  const CreateSession = async () => {
    try {
      const session = await axios.post(`${SESSION_URL}create_session`);      
      const data = session.data.data;
      const newSessionID = data.newSessionID;
      
      if (newSessionID) {
        sessionStorage.setItem('sessionID', newSessionID);
        sessionStorage.setItem('session variable', data.jsonSessionOutput)
        console.log("Session ID stored in sessionStorage:", newSessionID);
      } else {
        console.error("newSessionID not found in the response.");
      }
    } catch (error) {
      console.error("Error creating session:", error);
    }
  }
CreateSession();
} else {

const updatesession = async () =>{
  let session = sessionStorage.getItem("sessionID")
  let sessionVariable = sessionStorage.getItem("session variable")
  try {
    const update = await axios.post(`${SESSION_URL}update_session`,{
      jsonSession:sessionVariable,
      sessionId:session
    })

    let data = update.data
    console.log("updatedsession", data)
  } catch (error) {
    
  }
}
updatesession()
}

},[isOpen])

  useEffect(() =>{
   let session = sessionStorage.getItem("sessionID")
   
   if(session){
    setIsOpen(true)
   }else {
    setIsOpen(false)
   }
  },)
 
  useEffect(() => {
console.log("123", isOpen)
  },[isOpen])

  return (
    <div className='App'>
       {showMainPage ? <MainPage /> : <PreloadPage />}   
     
    </div>
  );
};

export default App;
