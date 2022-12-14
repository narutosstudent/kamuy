import type { DataFunctionArgs, LinksFunction } from '@remix-run/node'
import type { Chat, User } from '~/types/firebase'

import { redirect } from '@remix-run/node'
import { json } from '@remix-run/node'
import {
  Form,
  Link,
  Outlet,
  useLoaderData,
  useParams,
  useTransition,
} from '@remix-run/react'
import { useEffect } from 'react'
import { useState } from 'react'

import { ChatDetailPlaceholder } from './chats.$chatId'
import chatIdStyles from './chats.$chatId.css'
import chatsStyles from './chats.css'

import { Image } from '~/components'
import {
  getChatsForUserWithUid,
  getUserWithUid,
  createChatForUserWithId,
} from '~/firebase'
import { getServerFirebase } from '~/firebase/firebase.server'
import { useGetChatsForUserSubscription } from '~/hooks'
import { Plus, Search } from '~/icons'
import { authGetSession } from '~/sessions/auth.server'
import { ACCESS_TOKEN, INTENT } from '~/types'
import { getCookie } from '~/utils/getCookie'

export const links: LinksFunction = () => {
  return [
    { rel: 'stylesheet', href: chatsStyles },
    { rel: 'stylesheet', href: chatIdStyles },
  ]
}

const CREATE_NEW_CHAT = 'Create new chat'
export const IS_NEWLY_CREATED = 'isNewlyCreated'

export const loader = async ({ request }: DataFunctionArgs) => {
  const { firebaseAdminAuth } = getServerFirebase()

  const authSession = await authGetSession(getCookie(request))
  const token = authSession.get(ACCESS_TOKEN)

  try {
    const { uid } = await firebaseAdminAuth.verifySessionCookie(token)

    const [user, initialUserChats] = await Promise.all([
      getUserWithUid(uid),
      getChatsForUserWithUid(uid),
    ])

    return json({ user, initialUserChats })
  } catch (error) {
    throw json({ error: 'You are unauthenticated.' }, { status: 401 })
  }
}

export default function Chats() {
  const { user, initialUserChats } = useLoaderData<typeof loader>()
  const transition = useTransition()
  const { chatId } = useParams<{ chatId: string }>()

  const { userChats } = useGetChatsForUserSubscription({
    user: user as User,
    initialUserChats,
  })

  const [filteredValue, setFilteredValue] = useState('')
  const [filteredUserChats, setFilteredUserChats] =
    useState<Array<Chat>>(userChats)

  const isRedirectingAfterSubmission =
    transition.state === 'loading' &&
    transition.submission?.action === '/chats' &&
    transition.type === 'actionRedirect'

  const isSubmittingANewChat =
    transition.state === 'submitting' &&
    transition.submission.formData.get(INTENT) === CREATE_NEW_CHAT

  const shouldShowChatPlaceholder =
    isSubmittingANewChat || isRedirectingAfterSubmission

  useEffect(() => {
    if (filteredValue === '') {
      setFilteredUserChats(userChats)
      return
    }

    const filteredChats = userChats.filter((chat) =>
      chat.name.toLowerCase().includes(filteredValue.toLowerCase())
    )

    setFilteredUserChats(filteredChats)
  }, [filteredValue, userChats])

  return (
    <main className="chats">
      <div className="chats__items">
        <div className="chats__items-user">
          <h2>{user.username}</h2>
          <Form method="post">
            <button
              type="submit"
              aria-label="Create new chat"
              name={INTENT}
              value={CREATE_NEW_CHAT}
            >
              <Plus />
            </button>
          </Form>
        </div>

        <div className="chats__items-search">
          <Search />
          <input
            type="text"
            placeholder="Search for chats"
            aria-label="Search for chats"
            value={filteredValue}
            onChange={(event) => setFilteredValue(event.target.value)}
          />
        </div>

        <div className="chats__items-chats">
          {filteredUserChats.length > 0 ? (
            filteredUserChats.map((chat) => (
              <Link
                key={chat.id}
                to={`/chats/${chat.id}`}
                aria-label={`${chat.name} chat`}
                prefetch="intent"
                className={chatId === chat.id ? 'active' : ''}
              >
                <Image
                  chat={chat}
                  placeholderClassName="chats__items-chat-img-placeholder"
                />
                <p>{chat.name}</p>
              </Link>
            ))
          ) : (
            <p className="chats__items-chats-none">No chats yet.</p>
          )}
        </div>
      </div>

      <div className="chats__outlet-wrapper">
        {shouldShowChatPlaceholder ? <ChatDetailPlaceholder /> : <Outlet />}
      </div>
    </main>
  )
}

export const action = async ({ request }: DataFunctionArgs) => {
  const { firebaseAdminAuth } = getServerFirebase()

  const authSession = await authGetSession(getCookie(request))

  const token = authSession.get(ACCESS_TOKEN)

  try {
    const { uid } = await firebaseAdminAuth.verifySessionCookie(token)
    const chat = await createChatForUserWithId(uid)

    return redirect(`/chats/${chat.id}?${IS_NEWLY_CREATED}=true`)
  } catch (error) {
    throw json({ error: 'You are unauthenticated.' }, { status: 401 })
  }
}
