'use client'

import type { ChangeEvent } from 'react'

import React, { forwardRef, useCallback, useEffect, useReducer, useRef, useState } from 'react'

import type { Data, Field, IFormContext, InitialState, OnSubmit } from '../types'

import {
  FieldContext,
  FormContext,
  FormSubmittedContext,
  ModifiedContext,
  ProcessingContext,
} from './context'
import initialContext from './initialContext'
import { reduceFieldsToValues } from './reduceFieldsToValues'
import reducer from './reducer'

const defaultInitialState = {}

export type FormProps = {
  action?: string
  children: ((context: IFormContext) => React.ReactNode) | React.ReactNode
  className?: string
  errors?: {
    field: string
    message: string
  }[]
  formId?: string
  initialState?: InitialState
  method?: 'GET' | 'POST'
  onSubmit?: OnSubmit
}

const Form = ({ ref, ...props }: { ref?: React.RefObject<HTMLFormElement | null> } & FormProps) => {
  const {
    action,
    children,
    className,
    errors: errorsFromProps,
    formId,
    initialState = defaultInitialState,
    method,
    onSubmit,
  } = props

  const [fields, dispatchFields] = useReducer(reducer, initialState)
  const [isModified, setIsModified] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [hasSubmitted, setHasSubmitted] = useState(false)
  const [errorFromSubmit, setErrorFromSubmit] = useState<string>()

  const contextRef = useRef<IFormContext>(initialContext)

  contextRef.current.initialState = initialState
  contextRef.current.fields = fields

  const handleSubmit = useCallback(
    async (e: ChangeEvent<HTMLFormElement>) => {
      e.preventDefault()
      e.stopPropagation()
      setHasSubmitted(true)
      setErrorFromSubmit(undefined)

      const formIsValid = contextRef.current.validateForm()

      if (formIsValid) {
        setIsProcessing(true)
      }

      if (!formIsValid) {
        e.preventDefault()
        setIsProcessing(false)
        setErrorFromSubmit('Please fix the errors below and try again.')
        return false
      }

      if (typeof onSubmit === 'function') {
        try {
          await onSubmit({
            data: reduceFieldsToValues(fields, false),
            dispatchFields: contextRef.current.dispatchFields,
            unflattenedData: reduceFieldsToValues(fields, true),
          })
          setHasSubmitted(false)
          setIsModified(false)
          setIsProcessing(false)
        } catch (err: unknown) {
          const message = err instanceof Error ? err.message : 'Unknown error'
          console.error(message) // eslint-disable-line no-console
          setIsProcessing(false)
          setErrorFromSubmit(message)
        }
      }

      return false
    },
    [onSubmit, setHasSubmitted, setIsProcessing, setIsModified, fields],
  )

  const getFields = useCallback(() => contextRef.current.fields, [contextRef])

  const getField = useCallback(
    (path: string): Field | undefined => {
      return path ? contextRef.current.fields[path] : undefined
    },
    [contextRef],
  )

  const getFormData = useCallback((): Data => {
    return reduceFieldsToValues(contextRef.current.fields, true)
  }, [contextRef])

  const validateForm = useCallback((): boolean => {
    return !Object.values(contextRef.current.fields).some((field): boolean => field.valid === false)
  }, [contextRef])

  contextRef.current.dispatchFields = dispatchFields
  contextRef.current.handleSubmit = handleSubmit
  contextRef.current.getFields = getFields
  contextRef.current.getField = getField
  contextRef.current.getFormData = getFormData
  contextRef.current.validateForm = validateForm
  contextRef.current.setIsModified = setIsModified
  contextRef.current.setIsProcessing = setIsProcessing
  contextRef.current.setHasSubmitted = setHasSubmitted

  useEffect(() => {
    contextRef.current = { ...initialContext }
    dispatchFields({
      type: 'RESET',
      payload: initialState,
    })
  }, [initialState])

  return (
    <form
      action={action}
      className={className}
      id={formId}
      method={method}
      noValidate
      onSubmit={contextRef.current.handleSubmit}
      ref={ref}
    >
      <FormContext
        value={{
          ...contextRef.current,
          apiErrors: errorsFromProps,
          submissionError: errorFromSubmit,
        }}
      >
        <FieldContext value={contextRef.current}>
          <FormSubmittedContext value={hasSubmitted}>
            <ProcessingContext value={isProcessing}>
              <ModifiedContext value={isModified}>
                {typeof children === 'function' ? children(contextRef.current) : children}
              </ModifiedContext>
            </ProcessingContext>
          </FormSubmittedContext>
        </FieldContext>
      </FormContext>
    </form>
  )
}

export default Form
