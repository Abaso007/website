'use client'

import React from 'react'
import { CallToAction } from '@blocks/CallToAction/index.js'

import BreadcrumbsBar from '@components/Hero/BreadcrumbsBar/index.js'
import { DefaultHero } from '@components/Hero/Default/index.js'

export const ErrorMessage: React.FC<{ error?: string }> = ({ error }) => {
  return (
    <>
      <BreadcrumbsBar breadcrumbs={undefined} links={undefined} />
      <CallToAction
        blockType="cta"
        padding={{ top: 'large', bottom: 'large' }}
        ctaFields={{
          richText: [
            {
              children: [
                {
                  text: `${error || '404'}`,
                  underline: true,
                  forceDark: true,
                },
              ],
              type: 'h1',
            },
            {
              children: [
                {
                  text: 'Sorry, the page you requested cannot be found.',
                },
              ],
            },
          ],
          links: [
            {
              link: {
                reference: undefined,
                type: 'custom',
                url: '/',
                label: 'Back To Homepage',
              },
            },
          ],
        }}
      />
    </>
  )
}
