import type { Action, Field, Fields } from '../types'

// no declaration file for flatley, and no @types either, so require instead of import
// eslint-disable-next-line
const flatley = require('flatley')

const { flatten, unflatten } = flatley

const flattenFilters = [
  {
    test: (_: Fields, value: Field) => {
      const hasValidProperty = Object.prototype.hasOwnProperty.call(value, 'valid')
      const hasValueProperty = Object.prototype.hasOwnProperty.call(value, 'value')

      return hasValidProperty && hasValueProperty
    },
  },
]

const unflattenRowsFromState = (
  state: Fields,
  path: string,
): {
  remainingFlattenedState: Fields
  unflattenedRows: Fields[]
} => {
  // Take a copy of state
  const remainingFlattenedState = { ...state }

  const rowsFromStateObject: Fields = {}

  const pathPrefixToRemove = path.substring(0, path.lastIndexOf('.') + 1)

  // Loop over all keys from state
  // If the key begins with the name of the parent field,
  // Add value to rowsFromStateObject and delete it from remaining state
  Object.keys(state).forEach((key) => {
    if (key.indexOf(`${path}.`) === 0) {
      const name = key.replace(pathPrefixToRemove, '')
      rowsFromStateObject[name] = state[key]
      rowsFromStateObject[name].initialValue = rowsFromStateObject[name].value

      delete remainingFlattenedState[key]
    }
  })

  const unflattenedRows = unflatten(rowsFromStateObject)

  return {
    remainingFlattenedState,
    unflattenedRows: unflattenedRows[path.replace(pathPrefixToRemove, '')] || [],
  }
}

function fieldReducer(state: Fields, action: Action): Fields {
  switch (action.type) {
    case 'REMOVE': {
      const newState = { ...state }
      delete newState[action.path]
      return newState
    }

    case 'REMOVE_ROW': {
      const { path, rowIndex } = action
      const { remainingFlattenedState, unflattenedRows } = unflattenRowsFromState(state, path)

      unflattenedRows.splice(rowIndex, 1)

      const flattenedRowState =
        unflattenedRows.length > 0
          ? flatten({ [path]: unflattenedRows }, { filters: flattenFilters })
          : {}

      return {
        ...remainingFlattenedState,
        ...flattenedRowState,
      }
    }

    case 'RESET': {
      return action.payload || {}
    }

    // send either a single `Field` or an array of `Field[]` to have it/them either added or replaced in `state`
    case 'UPDATE': {
      const { payload } = action
      const fields = Array.isArray(payload) ? payload : [payload]

      const newState = { ...state }

      fields.forEach((field) => {
        newState[field.path] = {
          ...(newState[field.path] || {}),
          errorMessage: field.errorMessage,
          initialValue: field.initialValue,
          valid: field.valid,
          value: field.value,
        }
      })

      return newState
    }

    default: {
      return state
    }
  }
}

export default fieldReducer
