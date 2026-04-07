'use client'

import { useRef, useEffect, useCallback } from 'react'
import * as d3 from 'd3'

/* ── Types ──────────────────────────────────────────────────────── */

type MonthlyPoint = { month: string; count: number }
type TimelineBook = { id: number; titulo: string; editora: string; data: string }

type Props = {
  monthlyData: MonthlyPoint[]
  timelineData: TimelineBook[]
  groupColor?: string
}

/* ── Helpers ─────────────────────────────────────────────────────── */

function getCSSVar(name: string): string {
  if (typeof window === 'undefined') return '#888'
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || '#888'
}

/* ── Chart 1: Monthly Line ──────────────────────────────────────── */

function MonthlyLineChart({ data, color }: { data: MonthlyPoint[]; color: string }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)
  const tooltipRef = useRef<HTMLDivElement>(null)

  const draw = useCallback(() => {
    const container = containerRef.current
    const svg = d3.select(svgRef.current)
    if (!container || !svgRef.current || !data.length) return

    const width = container.clientWidth
    const height = 140
    const margin = { top: 8, right: 8, bottom: 22, left: 32 }
    const w = width - margin.left - margin.right
    const h = height - margin.top - margin.bottom

    svgRef.current.setAttribute('width', String(width))
    svgRef.current.setAttribute('height', String(height))
    svg.selectAll('*').remove()

    const muted = getCSSVar('--muted')
    const border = getCSSVar('--border')

    const parseMonth = d3.timeParse('%Y-%m')
    const points = data.map(d => ({ date: parseMonth(d.month)!, count: d.count })).filter(d => d.date)

    const x = d3.scaleTime().domain(d3.extent(points, d => d.date) as [Date, Date]).range([0, w])
    const y = d3.scaleLinear().domain([0, d3.max(points, d => d.count) || 1]).nice().range([h, 0])

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`)

    // Grid
    g.selectAll('.grid-line').data(y.ticks(3)).join('line')
      .attr('x1', 0).attr('x2', w).attr('y1', d => y(d)).attr('y2', d => y(d))
      .attr('stroke', border).attr('stroke-dasharray', '2,3')

    // Area
    g.append('path').datum(points)
      .attr('d', d3.area<typeof points[0]>().x(d => x(d.date)).y0(h).y1(d => y(d.count)).curve(d3.curveMonotoneX))
      .attr('fill', color).attr('opacity', 0.08)

    // Line
    g.append('path').datum(points)
      .attr('d', d3.line<typeof points[0]>().x(d => x(d.date)).y(d => y(d.count)).curve(d3.curveMonotoneX))
      .attr('fill', 'none').attr('stroke', color).attr('stroke-width', 1.5)

    // X axis
    g.append('g').attr('transform', `translate(0,${h})`)
      .call(d3.axisBottom(x).ticks(5).tickFormat(d => d3.timeFormat('%Y')(d as Date)))
      .call(g => g.select('.domain').attr('stroke', border))
      .call(g => g.selectAll('.tick line').attr('stroke', border))
      .call(g => g.selectAll('.tick text').attr('fill', muted).attr('font-size', '0.55rem'))

    // Y axis
    g.append('g')
      .call(d3.axisLeft(y).ticks(3).tickFormat(d => String(d)))
      .call(g => g.select('.domain').remove())
      .call(g => g.selectAll('.tick line').remove())
      .call(g => g.selectAll('.tick text').attr('fill', muted).attr('font-size', '0.55rem'))

    // Tooltip
    const tooltip = tooltipRef.current
    const bisect = d3.bisector<typeof points[0], Date>(d => d.date).left
    const dot = g.append('circle').attr('r', 3).attr('fill', color).attr('opacity', 0)

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
          tooltip.style.top = `${y(d.count) + margin.top - 28}px`
          tooltip.textContent = `${d3.timeFormat('%b %Y')(d.date)}: ${d.count}`
        }
      })
      .on('mouseleave', () => {
        dot.attr('opacity', 0)
        if (tooltip) tooltip.style.opacity = '0'
      })
  }, [data, color])

  useEffect(() => {
    draw()
    const ro = new ResizeObserver(draw)
    if (containerRef.current) ro.observe(containerRef.current)
    return () => ro.disconnect()
  }, [draw])

  return (
    <div ref={containerRef} style={{ position: 'relative', flex: '1 1 0', minWidth: 200 }}>
      <div style={{ fontSize: '0.58rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 6 }}>
        publicações / mês — 5 anos
      </div>
      <svg ref={svgRef} style={{ display: 'block', width: '100%' }} />
      <div ref={tooltipRef} style={{
        position: 'absolute', pointerEvents: 'none', opacity: 0,
        background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 4,
        padding: '3px 8px', fontSize: '0.6rem', color: 'var(--text)', whiteSpace: 'nowrap',
        transform: 'translateX(-50%)', transition: 'opacity 0.12s',
      }} />
    </div>
  )
}

/* ── Chart 2: Book Timeline (year, chronological) ───────────────── */

function BookTimeline({ data, color }: { data: TimelineBook[]; color: string }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)
  const tooltipRef = useRef<HTMLDivElement>(null)

  const draw = useCallback(() => {
    const container = containerRef.current
    const svg = d3.select(svgRef.current)
    if (!container || !svgRef.current || !data.length) return

    const width = container.clientWidth
    const height = 140
    const margin = { top: 8, right: 8, bottom: 22, left: 8 }
    const w = width - margin.left - margin.right
    const h = height - margin.top - margin.bottom

    svgRef.current.setAttribute('width', String(width))
    svgRef.current.setAttribute('height', String(height))
    svg.selectAll('*').remove()

    const muted = getCSSVar('--muted')
    const border = getCSSVar('--border')

    // Parse dates and assign colors per editora
    const editoras = [...new Set(data.map(d => d.editora))]
    const colorScale = d3.scaleOrdinal(d3.schemeTableau10).domain(editoras)

    type BookNode = TimelineBook & { date: Date }
    const books: BookNode[] = data
      .map(d => ({ ...d, date: new Date(d.data + 'T12:00:00') }))
      .filter(d => !isNaN(d.date.getTime()))
      .sort((a, b) => a.date.getTime() - b.date.getTime())

    if (!books.length) return

    const now = new Date()
    const yearStart = new Date(now.getFullYear(), 0, 1)
    const yearEnd = new Date(now.getFullYear(), 11, 31)

    const x = d3.scaleTime().domain([yearStart, yearEnd]).range([0, w])

    // Spread books vertically with jitter to avoid overlap
    // Group by week, then distribute vertically within each week
    const weekBuckets = new Map<number, BookNode[]>()
    books.forEach(b => {
      const week = Math.floor((b.date.getTime() - yearStart.getTime()) / (7 * 24 * 60 * 60 * 1000))
      if (!weekBuckets.has(week)) weekBuckets.set(week, [])
      weekBuckets.get(week)!.push(b)
    })

    type PlotNode = BookNode & { px: number; py: number; r: number }
    const plotNodes: PlotNode[] = []
    weekBuckets.forEach((bucket) => {
      bucket.forEach((b, i) => {
        plotNodes.push({
          ...b,
          px: x(b.date),
          py: h / 2 + (i - (bucket.length - 1) / 2) * 7,
          r: 3,
        })
      })
    })

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`)

    // Today marker
    if (now >= yearStart && now <= yearEnd) {
      const todayX = x(now)
      g.append('line')
        .attr('x1', todayX).attr('x2', todayX).attr('y1', 0).attr('y2', h)
        .attr('stroke', color).attr('stroke-dasharray', '3,3').attr('opacity', 0.4)
      g.append('text')
        .attr('x', todayX).attr('y', -2).attr('text-anchor', 'middle')
        .attr('fill', muted).attr('font-size', '0.45rem').attr('letter-spacing', '0.06em')
        .text('HOJE')
    }

    // X axis (months)
    g.append('g').attr('transform', `translate(0,${h})`)
      .call(d3.axisBottom(x).ticks(d3.timeMonth.every(1)).tickFormat(d => d3.timeFormat('%b')(d as Date)))
      .call(g => g.select('.domain').attr('stroke', border))
      .call(g => g.selectAll('.tick line').attr('stroke', border))
      .call(g => g.selectAll('.tick text').attr('fill', muted).attr('font-size', '0.5rem'))

    const tooltip = tooltipRef.current

    // Book dots
    g.selectAll('circle')
      .data(plotNodes)
      .join('circle')
      .attr('cx', d => d.px)
      .attr('cy', d => Math.max(d.r, Math.min(h - d.r, d.py)))
      .attr('r', d => d.r)
      .attr('fill', d => colorScale(d.editora))
      .attr('opacity', 0.6)
      .attr('cursor', 'pointer')
      .on('mouseenter', (event, d) => {
        d3.select(event.currentTarget).attr('r', 5).attr('opacity', 1)
        if (tooltip) {
          const dateStr = d3.timeFormat('%d %b')(d.date)
          tooltip.innerHTML = `<strong style="display:block;margin-bottom:2px">${d.titulo}</strong><span style="opacity:0.6">${d.editora} · ${dateStr}</span>`
          tooltip.style.opacity = '1'
          tooltip.style.left = `${d.px + margin.left}px`
          tooltip.style.top = `${Math.max(d.r, Math.min(h - d.r, d.py)) + margin.top - 48}px`
        }
      })
      .on('mouseleave', (event) => {
        d3.select(event.currentTarget).attr('r', 3).attr('opacity', 0.6)
        if (tooltip) tooltip.style.opacity = '0'
      })
  }, [data, color])

  useEffect(() => {
    draw()
    const ro = new ResizeObserver(draw)
    if (containerRef.current) ro.observe(containerRef.current)
    return () => ro.disconnect()
  }, [draw])

  return (
    <div ref={containerRef} style={{ position: 'relative', flex: '1 1 0', minWidth: 200 }}>
      <div style={{ fontSize: '0.58rem', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 6 }}>
        livros {new Date().getFullYear()} — por selo
      </div>
      <svg ref={svgRef} style={{ display: 'block', width: '100%' }} />
      <div ref={tooltipRef} style={{
        position: 'absolute', pointerEvents: 'none', opacity: 0,
        background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 4,
        padding: '5px 10px', fontSize: '0.6rem', color: 'var(--text)', whiteSpace: 'nowrap',
        transform: 'translateX(-50%)', transition: 'opacity 0.12s', lineHeight: 1.4,
        maxWidth: 220,
      }} />
    </div>
  )
}

/* ── Main Export ─────────────────────────────────────────────────── */

export default function GroupCharts({ monthlyData, timelineData, groupColor }: Props) {
  const color = groupColor || '#c0392b'

  if (!monthlyData.length && !timelineData.length) return null

  return (
    <div style={{ display: 'flex', gap: '32px', marginTop: '32px', flexWrap: 'wrap' }}>
      {monthlyData.length > 0 && <MonthlyLineChart data={monthlyData} color={color} />}
      {timelineData.length > 0 && <BookTimeline data={timelineData} color={color} />}
    </div>
  )
}
