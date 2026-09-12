import { useState } from 'react'
import WeeklySummary from './WeeklySummary'
import MonthlyInsights from './MonthlyInsights'
import YearlyTotals from './YearlyTotals'

const TABS = [
  { id: 'week', label: 'This week' },
  { id: 'month', label: 'This month' },
  { id: 'year', label: 'This year' },
]

export default function InsightsPanel({
  weeklySummary,
  monthlySummary,
  monthlySeries,
  yearlyTotals,
  yearLabel,
  profiles,
  selectedDate,
  onSelectDate,
}) {
  const [tab, setTab] = useState('week')

  return (
    <section className="panel insights-panel reveal" style={{ '--reveal-delay': '0.28s' }}>
      <div className="panel-header insights-header">
        <div>
          <p className="eyebrow">Insights</p>
          <h3>How the naam is growing</h3>
        </div>
        <div className="insight-tabs" role="tablist">
          {TABS.map((item) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={tab === item.id}
              className={tab === item.id ? 'active' : ''}
              onClick={() => setTab(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="insight-pane" key={tab}>
        {tab === 'week' ? (
          <WeeklySummary
            summary={weeklySummary}
            profiles={profiles}
            selectedDate={selectedDate}
            onSelectDate={onSelectDate}
          />
        ) : null}
        {tab === 'month' ? (
          <MonthlyInsights
            monthKey={monthlySummary.currentMonth}
            prevMonthKey={monthlySummary.prevMonth}
            currentTotals={monthlySummary.currentTotals}
            prevTotals={monthlySummary.prevTotals}
            trendSeries={monthlySeries}
            profiles={profiles}
          />
        ) : null}
        {tab === 'year' ? (
          <YearlyTotals
            totals={yearlyTotals}
            yearLabel={yearLabel}
            profiles={profiles}
          />
        ) : null}
      </div>
    </section>
  )
}
