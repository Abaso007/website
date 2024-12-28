import { Footer } from '@components/Footer/index.js'
import { Header } from '@components/Header/index.js'
import { fetchGlobals } from '@data/index.js'
import { unstable_cache } from 'next/cache'
import { draftMode } from 'next/headers.js'
import React from 'react'

export const dynamic = 'auto'

export default async function Layout({ children }: { children: React.ReactNode }) {
  const { isEnabled: draft } = await draftMode()
  const getGlobals = draft
    ? fetchGlobals
    : unstable_cache(fetchGlobals, ['globals', 'mainMenu', 'footer'])

  const { footer, mainMenu } = await getGlobals()

  return (
    <React.Fragment>
      <Header {...mainMenu} />
      <div>
        {children}
        <div id="docsearch" />
        <Footer {...footer} />
      </div>
    </React.Fragment>
  )
}