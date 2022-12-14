import type { DocumentReference } from 'firebase/firestore'
import type { Chat } from '~/types/firebase'

import { doc } from 'firebase/firestore'
import { onSnapshot } from 'firebase/firestore'
import { useEffect, useState } from 'react'

import { CHATS_COLLECTION } from '~/firebase/constants'
import { useFirebase } from '~/providers/FirebaseProvider'

export function useGetChatSubscription({ initialChat }: { initialChat: Chat }) {
  const firebaseContext = useFirebase()
  const [chat, setChat] = useState(initialChat)

  useEffect(() => {
    if (firebaseContext?.firebaseDb) {
      const chatDocRef = doc(
        firebaseContext?.firebaseDb,
        `${CHATS_COLLECTION}/${initialChat.id}`
      ) as DocumentReference<Chat>

      const unSubscribe = onSnapshot(chatDocRef, (chatSnapshot) => {
        const newChat = chatSnapshot.data()
        if (newChat) {
          setChat(newChat)
        }
      })

      return () => {
        unSubscribe()
      }
    }
  }, [firebaseContext?.firebaseDb, initialChat.id])

  return { chat, setChat }
}
