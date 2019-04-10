import React, { useState, useEffect } from 'react'
import firebase from 'firebase'
import 'firebase/auth'
import 'firebase/database'
import './App.css'

interface authInterface {
  status: 'loading' | 'in' | 'out'
  user?: firebase.User
}

export default () => {
  const [auth, setAuthState] = useState<authInterface>({status: 'loading'})

  useEffect(() => {
    setAuthState({status: 'out'})
  }, [])

  let content
  switch (auth.status) {
    case 'loading':
      content = <>loading...</>
      break;
    case 'in':
      content = <div>{(auth.user || {displayName: null}).displayName}</div>
      break;
    default:
      content = <div><button>SignIn</button></div>
      break;
  }

  return (
    <div className="App">
      {content}
    </div>
  )
}
