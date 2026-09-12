export const getPage = () =>
  window.location.pathname.replace(/\/$/, '') === '/jap' ? 'jap' : 'home'

export const goToJap = () => {
  if (getPage() === 'jap') return
  window.history.pushState({ naamJap: 'jap' }, '', '/jap')
  window.dispatchEvent(new PopStateEvent('popstate'))
}

export const goToHome = () => {
  if (getPage() !== 'jap') return
  if (window.history.state?.naamJap === 'jap') {
    window.history.back()
    return
  }
  window.history.replaceState({ naamJap: 'home' }, '', '/')
  window.dispatchEvent(new PopStateEvent('popstate'))
}
