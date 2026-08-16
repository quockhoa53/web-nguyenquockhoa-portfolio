import { useEffect, useState } from 'react'
import { getPortfolio } from '../../services/portfolioApi'

export function usePortfolio() {
  const [portfolio, setPortfolio] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true

    getPortfolio()
      .then((data) => active && setPortfolio(data))
      .catch((requestError) => active && setError(requestError.message))

    return () => { active = false }
  }, [])

  return { portfolio, error, isLoading: !portfolio && !error }
}
