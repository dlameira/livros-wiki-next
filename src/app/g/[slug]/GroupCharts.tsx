'use client'

import { useRef, useEffect, useCallback } from 'react'
import * as d3 from 'd3'

type MonthlyPoint = { month: string; count: number }

type Props = {
  monthlyData: MonthlyPoint[]
  groupColor?: string
}

function getCSSVar(name: string): string {
  if (typeof window === 'undefined') return '#888'
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || '#888'
}

export default function GroupCharts({ monthlyData, groupColor }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)
  const tooltipRef = useRef<HTMLDivElement>(null)
  const color = groupColor || '#c0392b'

  const draw = useCallback(() => {
    const container = containerRef.current
    const svg = d3.select(svgRef.current)
    if (!container || !svgRef.current || !monthlyData.length) return

    const width = container.clientWidth
    const height = 80
    const margin = { top: 4, right: 4, bottom: 16, left: 28 }
    const w = width - margin.left - margin.right
    const h = height - margin.top - margin.bottom

    svgRef.current.setAttribute('width', String(width))
    svgRef.current.setAttribute('height', String(height))
    svg.selectAll('*').remove()

    const muted = getCSSVar('--muted')
    const border = getCSSVar('--border')

    const parseMonth = d3.timeParse('%Y-%m')
    const points = monthlyData.map(d => ({ date: parseMonth(d.month)!, count: d.count })).filter(d => d.date)
    if (!points.length) return

    const x = d3.scaleTime().domain(d3.extent(points, d => d.date) as [Date, Date]).range([0, w])
    const y = d3.scaleLinear().domain([0, d3.max(points, d => d.count) || 1]).nice().range([h, 0])

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`)

    // Subtle grid
    g.selectAll('.grid').data(y.ticks(2)).join('line')
      .attr('x1', 0).attr('x2', w).attr('y1', d => y(d)).attr('y2', d => y(d))
      .attr('stroke', border).attr('stroke-dasharray', '2,3').attr('opacity', 0.5)

    // Area fill
    g.append('path').datum(points)
      .attr('d', d3.area<typeof points[0]>().x(d => x(d.date)).y0(h).y1(d => y(d.count)).curve(d3.curveMonotoneX))
      .attr('fill', color).attr('opacity', 0.07)

    // Line
    g.append('path').datum(points)
      .attr('d', d3.line<typeof points[0]>().x(d => x(d.date)).y(d => y(d.count)).curve(d3.curveMonotoneX))
      .attr('fill', 'none').attr('stroke', color).attr('stroke-width', 1.2)

    // X axis — years only
    g.append('g').attr('transform', `translate(0,${h})`)
      .call(d3.axisBottom(x).ticks(4).tickFormat(d => d3.timeFormat("'%y")(d as Date)))
      .call(g => g.select('.domain').attr('stroke', border))
      .call(g => g.selectAll('.tick line').attr('stroke', border).attr('stroke-opacity', 0.4))
      .call(g => g.selectAll('.tick text').attr('fill', muted).attr('font-size', '0.5rem'))

    // Y axis — minimal
    g.append('g')
      .call(d3.axisLeft(y).ticks(2).tickFormat(d => String(d)))
      .call(g => g.select('.domain').remove())
      .call(g => g.selectAll('.tick line').remove())
      .call(g => g.selectAll('.tick text').attr('fill', muted).attr('font-size', '0.5rem'))

    // Hover
    const tooltip = tooltipRef.current
    const bisect = d3.bisector<typeof points[0], Date>(d => d.date).left
    const dot = g.append('circle').attr('r', 2.5).attr('fill', color).attr('opacity', 0)

    g.append('rect').attr('width', w).attr('height', h).attr('fill', 'none').attr('pointer-events', 'all')
      .on('mousemove', (event) => {
        const [mx] = d3.pointer(event)
        const date = x.invert(mx)
        const i = bisect(points, date, 1)
        const d0 = points[i - 1], d1 = points[i]
        if (!d0) return
        const d = d1 && (date.getTime() - d0.date.getTime()) > (d1.date.getTime() - date.getTime()) ? d1 : d0
        dot.attr('cx', x(d.date)).attr('cy', y(d.count)).attr('opacity', 1)
        if (tooltip) {
          tooltip.style.opacity = '1'
          tooltip.style.left = `${x(d.date) + margin.left}px`
          tooltip.style.top = `${y(d.count) + margin.top - 24}px`
          tooltip.textContent = `${d3.timeFormat('%b %Y')(d.date)}: ${d.count}`
        }
      })
      .on('mouseleave', () => {
        dot.attr('opacity', 0)
        if (tooltip) tooltip.style.opacity = '0'
      })
  }, [monthlyData, color])

  useEffect(() => {
    draw()
    const ro = new ResizeObserver(draw)
    if (containerRef.current) ro.observe(containerRef.current)
    return () => ro.disconnect()
  }, [draw])

  if (!monthlyData.length) return null

  return (
    <div ref={containerRef} style={{ position: 'relative', width: 260, flexShrink: 0 }}>
      <div style={{ fontSize: '0.5rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 4 }}>
        publicações / mês
      </div>
      <svg ref={svgRef} style={{ display: 'block', width: '100%' }} />
      <div ref={tooltipRef} style={{
        position: 'absolute', pointerEvents: 'none', opacity: 0,
        background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 3,
        padding: '2px 6px', fontSize: '0.55rem', color: 'var(--text)', whiteSpace: 'nowrap',
        transform: 'translateX(-50%)', transition: 'opacity 0.1s',
      }} />
    </div>
  )
}
