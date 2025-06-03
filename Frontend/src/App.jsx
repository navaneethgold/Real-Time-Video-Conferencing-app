import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Signup from './pages/signup';
import Home from './pages/home';
import Login from './pages/login';
import Chatting from './pages/chatting';
import MeetVideo from './pages/videoConference';
import TopBar from './boilerPlate/topBar';
import History from './pages/history';
function App() {
  return (
    <BrowserRouter>
      <Routes>
          <Route path="/signup" element={<Signup />} />
          <Route path='/login' element={<Login/>}/>
          <Route path='/history' element={<History/>}/>
          <Route path="/home" element={<Home />} />
          <Route path='/chatting' element={<Chatting/>}/>
          <Route path='/videoConference' element={<MeetVideo/>}/>
      </Routes>
    </BrowserRouter>
  )
}

export default App
