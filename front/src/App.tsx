import React, { useState, useEffect } from 'react'
import firebase from 'firebase/app'
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
  token?: string
}

export default () => {
  const [auth, setAuthState] = useState<authInterface>({status: 'loading'})

  useEffect(() => {
    firebase.auth().onAuthStateChanged(async user => {
      if (user) {
        const token = await user.getIdToken()
        const idTokenResult = await user.getIdTokenResult()
        const hasuraClaim =
          idTokenResult.claims["https://hasura.io/jwt/claims"]

        if (hasuraClaim) {
          setAuthState({ status: "in", user, token })
        } else {
          const metadataRef = firebase
            .database()
            .ref("metadata/" + user.uid + "/refreshTime")

          metadataRef.on("value", async () => {
            const token = await user.getIdToken(true)
            setAuthState({ status: "in", user, token })
          })
        }
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
      break
    case 'in':
      content = (
        <div>
          <div>
            {(auth.user || {displayName: null}).displayName}
            <button onClick={handleSignOut}>SignOut</button>
          </div>
          <Communities token={auth.token || ""} />
        </div>
      )
      break
    default:
      content = <div><button onClick={handleSignIn}>SignIn</button></div>
      break
  }

  return (
    <div className="App">
      {content}
    </div>
  )
}
