'use client'

import { useEffect, useRef } from 'react'

interface TradingChartProps {
  symbol: string
  height?: number
}

export function TradingChart({ symbol, height = 300 }: TradingChartProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let cleanup: (() => void) | undefined

    async function render() {
      const { createChart, LineSeries } = await import('lightweight-charts')
      if (!ref.current) return

      const chart = createChart(ref.current, {
        height,
        layout: {
          background: { color: 'transparent' },
          textColor: '#71717a',
        },
        grid: {
          vertLines: { color: '#27272a' },
          horzLines: { color: '#27272a' },
        },
      })

      const series = chart.addSeries(LineSeries, { color: '#3b82f6' })
      series.setData([
        { time: '2024-01-01', value: 100 },
        { time: '2024-02-01', value: 120 },
        { time: '2024-03-01', value: 110 },
        { time: '2024-04-01', value: 140 },
      ])
      chart.timeScale().fitContent()
      cleanup = () => chart.remove()
    }

    render()
    return () => cleanup?.()
  }, [height])

  return (
    <div className="my-6">
      <p className="mb-2 text-sm text-zinc-500">{symbol}</p>
      <div ref={ref} />
    </div>
  )
}
