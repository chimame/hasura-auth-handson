import React, { useState, useEffect } from 'react'
import firebase from 'firebase'
import 'firebase/auth'
import 'firebase/database'
import './App.css'
import config from './config'
import Communities from './Communities'

firebase.initializeApp(config)
const provider = new firebase.auth.GoogleAuthProvider()

interface authInterface {
  status: 'loading' | 'in' | 'out'
  user?: firebase.User
}

export default () => {
  const [auth, setAuthState] = useState<authInterface>({status: 'loading'})

  useEffect(() => {
    firebase.auth().onAuthStateChanged(user => {
      if (user) {
        setAuthState({status: 'in', user})
      } else {
        setAuthState({status: 'out'})
      }
    })
  }, [])

  const handleSignIn = async () => {
    try {
      await firebase.auth().signInWithPopup(provider)
    } catch (e) {
      console.log(e.message)
    }
  }
  
  const handleSignOut = async () => {
    try {
      setAuthState({status: 'loading'})
      await firebase.auth().signOut()
      setAuthState({status: 'out'})
    } catch (e) {
      console.log(e.message)
    }
  }
  
  let content
  switch (auth.status) {
    case 'loading':
      content = <>loading...</>
      break;
    case 'in':
      content = (
        <div>
          <div>
            {(auth.user || {displayName: null}).displayName}
            <button onClick={handleSignOut}>SignOut</button>
          </div>
          <Communities />
        </div>
      )
      break;
    default:
      content = <div><button onClick={handleSignIn}>SignIn</button></div>
      break;
  }

  return (
    <div className="App">
      {content}
    </div>
  )
}
