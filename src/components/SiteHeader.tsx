type Props = { mode: 'dark' | 'light'; onToggleMode: () => void }

export default function SiteHeader({ mode, onToggleMode }: Props) {
  return (
    <header className="appearance-header fixed right-4 top-5 z-50">
      <button
        type="button"
        onClick={onToggleMode}
        aria-pressed={mode === 'light'}
        className="theme-control"
        aria-label={mode === 'dark' ? 'Switch to light appearance' : 'Switch to dark appearance'}
        title={mode === 'dark' ? 'Switch to light appearance' : 'Switch to dark appearance'}
      >
        <span className="theme-control-icon" aria-hidden="true">{mode === 'dark' ? '☼' : '☾'}</span>
        <span className="text-xs font-medium">{mode === 'dark' ? 'Light mode' : 'Dark mode'}</span>
        <span className={mode === 'light' ? 'theme-track is-on' : 'theme-track'} aria-hidden="true"><span /></span>
      </button>
    </header>
  )
}
