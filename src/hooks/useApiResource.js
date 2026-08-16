import { useEffect, useState } from 'react'

export function useApiResource(loader, dependencyKey = 'default') {
  const [reloadKey, setReloadKey] = useState(0)
  const [state, setState] = useState({ data: null, error: '', isLoading: true })

  useEffect(() => {
    let active = true
    loader()
      .then((data) => active && setState({ data, error: '', isLoading: false }))
      .catch((error) => active && setState({ data: null, error: error.message, isLoading: true }))
    return () => { active = false }
    // loader is intentionally represented by dependencyKey to support inline parameterized loaders.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dependencyKey, reloadKey])

  function retry() {
    setState((current) => ({ ...current, error: '', isLoading: true }))
    setReloadKey((key) => key + 1)
  }

  return { ...state, retry }
}
