export default function PromiseVerse({ compact = false }) {
  return (
    <figure className={`promise-verse${compact ? ' compact' : ''}`}>
      <p className="eyebrow">Bhagavad Gita 9.22</p>
      <blockquote>
        अनन्याश्चिन्तयन्तो मां ये जना: पर्युपासते ।
        <br />
        तेषां नित्याभियुक्तानां योगक्षेमं वहाम्यहम् ॥
      </blockquote>
      <figcaption>
        Jo ananya hokar sirf Naam jape, uska yog-kshem Main uthata hoon.
        <span>As Premanand Ji teaches this promise — you keep the Name, He keeps the worry.</span>
      </figcaption>
    </figure>
  )
}
