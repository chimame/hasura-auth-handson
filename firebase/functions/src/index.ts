import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin'
admin.initializeApp(functions.config().firebase)

exports.processSignUp = functions.auth.user().onCreate(user => {
  const customeClaims = {
    "https://hasura.io/jwt/claims": {
      "x-hasura-default-role": "user",
      "x-hasura-allowed-roles": ["user"],
      "x-hasura-user-id": user.uid
    }
  }

  return admin.auth().setCustomUserClaims(user.uid, customeClaims).then(() => {
    const metaRef = admin.database().ref(`metadata/${user.uid}`)
    return metaRef.set({ refreshTime: new Date().getTime() })
  })
})
