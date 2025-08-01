import React, { useState } from 'react'
import { Route,Routes } from 'react-router-dom'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import SettingsPage from './pages/SettingsPage'
import ProfilePage from './pages/ProfilePage'
import SignUpPage from './pages/SignUpPage'
import {Loader} from "lucide-react"
import { useAuthStore } from './store/useAuthStore'
import { useEffect } from 'react'
import Navbar from './components/Navbar'
import { Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useThemeStore } from './store/useThemeStore'



const App = () => {
const {theme}=useThemeStore();

const {authUser,checkAuth,isCheckingAuth}=useAuthStore()

useEffect(() => {
  
checkAuth()
  
}, [checkAuth])

if(isCheckingAuth && !authUser)
  return (
  <div className='flex items-center justify-center h-screen'>
    <Loader className="size-10 animate-spin"/>
  </div>
);

  return (
    <div data-theme={theme}>
    <Navbar/>

<Routes>
  <Route path='/' element={authUser?<HomePage/>: <Navigate to={'/login'} />}/>
  <Route path='/signup' element={!authUser ? <SignUpPage /> : <Navigate to="/" />} />
  <Route path='/login' element={!authUser?<LoginPage/>:<Navigate to={'/'}/>}/>
  <Route path='/settings' element={<SettingsPage/>}/>
  <Route path='/profile' element={authUser?<ProfilePage/>:<Navigate to={"/login"}/>}/>
  
</Routes>

<Toaster/>

    </div>
  )
}

export default App
