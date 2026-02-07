import { useEffect, useState } from 'react'
import { GITA_QUOTES } from '../data/quotes'

const ROTATE_EVERY_MS = 9000

export default function QuoteBanner() {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % GITA_QUOTES.length)
    }, ROTATE_EVERY_MS)
    return () => clearInterval(timer)
  }, [])

  const quote = GITA_QUOTES[index]

  return (
    <div className="quote-banner">
      <p className="quote-text">"{quote.text}"</p>
      <span className="quote-ref">{quote.reference}</span>
    </div>
  )
}
