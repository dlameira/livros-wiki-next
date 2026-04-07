'use client'

import { useRef, useEffect, useState, useCallback } from 'react'
import * as d3 from 'd3'

/* ── Types ──────────────────────────────────────────────────────── */

type MonthlyPoint = { month: string; count: number }
type ScatterPoint = { name: string; catalogSize: number; followers: number }
type Particle = { id: number; editora: string }

type Props = {
  monthlyData: MonthlyPoint[]
  scatterData: ScatterPoint[]
  particles: Particle[]
  groupColor?: string
}

/* ── Helpers ─────────────────────────────────────────────────────── */

function getCSSVar(name: string): string {
  if (typeof window === 'undefined') return '#888'
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || '#888'
}

function formatK(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M'
  if (n >= 1_000) return (n / 1_000).toFixed(0) + 'K'
  return String(n)
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
    const height = 160
    const margin = { top: 12, right: 12, bottom: 24, left: 36 }
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

    // Grid lines
    g.append('g').attr('class', 'grid')
      .selectAll('line')
      .data(y.ticks(4))
      .join('line')
      .attr('x1', 0).attr('x2', w)
      .attr('y1', d => y(d)).attr('y2', d => y(d))
      .attr('stroke', border).attr('stroke-dasharray', '2,3')

    // Area
    const area = d3.area<typeof points[0]>()
      .x(d => x(d.date))
      .y0(h)
      .y1(d => y(d.count))
      .curve(d3.curveMonotoneX)

    g.append('path').datum(points)
      .attr('d', area)
      .attr('fill', color).attr('opacity', 0.1)

    // Line
    const line = d3.line<typeof points[0]>()
      .x(d => x(d.date))
      .y(d => y(d.count))
      .curve(d3.curveMonotoneX)

    g.append('path').datum(points)
      .attr('d', line)
      .attr('fill', 'none')
      .attr('stroke', color)
      .attr('stroke-width', 1.5)

    // X axis
    g.append('g').attr('transform', `translate(0,${h})`)
      .call(d3.axisBottom(x).ticks(5).tickFormat(d => d3.timeFormat('%Y')(d as Date)))
      .call(g => g.select('.domain').attr('stroke', border))
      .call(g => g.selectAll('.tick line').attr('stroke', border))
      .call(g => g.selectAll('.tick text').attr('fill', muted).attr('font-size', '0.6rem'))

    // Y axis
    g.append('g')
      .call(d3.axisLeft(y).ticks(4).tickFormat(d => String(d)))
      .call(g => g.select('.domain').remove())
      .call(g => g.selectAll('.tick line').remove())
      .call(g => g.selectAll('.tick text').attr('fill', muted).attr('font-size', '0.6rem'))

    // Tooltip overlay
    const tooltip = tooltipRef.current
    const bisect = d3.bisector<typeof points[0], Date>(d => d.date).left

    const overlay = g.append('rect')
      .attr('width', w).attr('height', h)
      .attr('fill', 'none').attr('pointer-events', 'all')

    const dot = g.append('circle').attr('r', 3).attr('fill', color).attr('opacity', 0)
    const vLine = g.append('line').attr('stroke', border).attr('stroke-dasharray', '3,3').attr('opacity', 0)

    overlay.on('mousemove', (event) => {
      const [mx] = d3.pointer(event)
      const date = x.invert(mx)
      const i = bisect(points, date, 1)
      const d0 = points[i - 1], d1 = points[i]
      if (!d0) return
      const d = d1 && (date.getTime() - d0.date.getTime()) > (d1.date.getTime() - date.getTime()) ? d1 : d0

      dot.attr('cx', x(d.date)).attr('cy', y(d.count)).attr('opacity', 1)
      vLine.attr('x1', x(d.date)).attr('x2', x(d.date)).attr('y1', 0).attr('y2', h).attr('opacity', 0.4)

      if (tooltip) {
        tooltip.style.opacity = '1'
        tooltip.style.left = `${x(d.date) + margin.left}px`
        tooltip.style.top = `${y(d.count) + margin.top - 32}px`
        tooltip.textContent = `${d3.timeFormat('%b %Y')(d.date)}: ${d.count}`
      }
    }).on('mouseleave', () => {
      dot.attr('opacity', 0)
      vLine.attr('opacity', 0)
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
    <div ref={containerRef} style={{ position: 'relative', width: '100%' }}>
      <div style={{ fontSize: '0.6rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 8 }}>
        publicações / mês — 5 anos
      </div>
      <svg ref={svgRef} style={{ display: 'block', width: '100%' }} />
      <div ref={tooltipRef} style={{
        position: 'absolute', pointerEvents: 'none', opacity: 0,
        background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 4,
        padding: '3px 8px', fontSize: '0.65rem', color: 'var(--text)', whiteSpace: 'nowrap',
        transform: 'translateX(-50%)', transition: 'opacity 0.15s',
      }} />
    </div>
  )
}

/* ── Chart 2: Catalog × Followers Scatter ───────────────────────── */

function CatalogScatter({ data }: { data: ScatterPoint[] }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)
  const tooltipRef = useRef<HTMLDivElement>(null)

  const draw = useCallback(() => {
    const container = containerRef.current
    const svg = d3.select(svgRef.current)
    if (!container || !svgRef.current || !data.length) return

    const width = container.clientWidth
    const height = 160
    const margin = { top: 12, right: 12, bottom: 28, left: 44 }
    const w = width - margin.left - margin.right
    const h = height - margin.top - margin.bottom

    svgRef.current.setAttribute('width', String(width))
    svgRef.current.setAttribute('height', String(height))
    svg.selectAll('*').remove()

    const muted = getCSSVar('--muted')
    const border = getCSSVar('--border')
    const accent = getCSSVar('--accent-fg')

    const x = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.catalogSize) || 1])
      .nice().range([0, w])

    const y = d3.scaleLog()
      .domain([d3.min(data, d => d.followers) || 1000, d3.max(data, d => d.followers) || 100000])
      .nice().range([h, 0])

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`)

    // Grid
    g.append('g').selectAll('line').data(y.ticks(3)).join('line')
      .attr('x1', 0).attr('x2', w).attr('y1', d => y(d)).attr('y2', d => y(d))
      .attr('stroke', border).attr('stroke-dasharray', '2,3')

    // X axis
    g.append('g').attr('transform', `translate(0,${h})`)
      .call(d3.axisBottom(x).ticks(4).tickFormat(d => String(d)))
      .call(g => g.select('.domain').attr('stroke', border))
      .call(g => g.selectAll('.tick line').attr('stroke', border))
      .call(g => g.selectAll('.tick text').attr('fill', muted).attr('font-size', '0.55rem'))

    // Y axis
    g.append('g')
      .call(d3.axisLeft(y).ticks(3).tickFormat(d => formatK(d as number)))
      .call(g => g.select('.domain').remove())
      .call(g => g.selectAll('.tick line').remove())
      .call(g => g.selectAll('.tick text').attr('fill', muted).attr('font-size', '0.55rem'))

    // Axis labels
    g.append('text')
      .attr('x', w / 2).attr('y', h + 24)
      .attr('text-anchor', 'middle').attr('fill', muted).attr('font-size', '0.5rem')
      .attr('letter-spacing', '0.08em')
      .text('CATÁLOGO')

    g.append('text')
      .attr('transform', `rotate(-90)`).attr('x', -h / 2).attr('y', -36)
      .attr('text-anchor', 'middle').attr('fill', muted).attr('font-size', '0.5rem')
      .attr('letter-spacing', '0.08em')
      .text('SEGUIDORES')

    const tooltip = tooltipRef.current

    // Dots
    g.selectAll('circle')
      .data(data)
      .join('circle')
      .attr('cx', d => x(d.catalogSize))
      .attr('cy', d => y(d.followers))
      .attr('r', 5)
      .attr('fill', accent)
      .attr('opacity', 0.7)
      .attr('cursor', 'pointer')
      .on('mouseenter', (event, d) => {
        d3.select(event.currentTarget).attr('r', 7).attr('opacity', 1)
        if (tooltip) {
          tooltip.style.opacity = '1'
          tooltip.innerHTML = `<strong>${d.name}</strong><br/>${d.catalogSize} livros · ${formatK(d.followers)} seg.`
          tooltip.style.left = `${x(d.catalogSize) + margin.left}px`
          tooltip.style.top = `${y(d.followers) + margin.top - 44}px`
        }
      })
      .on('mouseleave', (event) => {
        d3.select(event.currentTarget).attr('r', 5).attr('opacity', 0.7)
        if (tooltip) tooltip.style.opacity = '0'
      })

    // Labels (only on wider screens)
    if (w > 280) {
      g.selectAll('.label')
        .data(data)
        .join('text')
        .attr('class', 'label')
        .attr('x', d => x(d.catalogSize) + 8)
        .attr('y', d => y(d.followers) + 3)
        .attr('fill', muted)
        .attr('font-size', '0.5rem')
        .attr('opacity', 0.7)
        .text(d => d.name)
    }
  }, [data])

  useEffect(() => {
    draw()
    const ro = new ResizeObserver(draw)
    if (containerRef.current) ro.observe(containerRef.current)
    return () => ro.disconnect()
  }, [draw])

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%' }}>
      <div style={{ fontSize: '0.6rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 8 }}>
        catálogo × seguidores
      </div>
      <svg ref={svgRef} style={{ display: 'block', width: '100%' }} />
      <div ref={tooltipRef} style={{
        position: 'absolute', pointerEvents: 'none', opacity: 0,
        background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 4,
        padding: '4px 10px', fontSize: '0.62rem', color: 'var(--text)', whiteSpace: 'nowrap',
        transform: 'translateX(-50%)', transition: 'opacity 0.15s', lineHeight: 1.5,
      }} />
    </div>
  )
}

/* ── Chart 3: Book Particles ────────────────────────────────────── */

function BookParticles({ books }: { books: Particle[] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const animRef = useRef<number>(0)

  useEffect(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container || !books.length) return

    const width = container.clientWidth
    const height = 140
    canvas.width = width * 2
    canvas.height = height * 2
    canvas.style.width = `${width}px`
    canvas.style.height = `${height}px`
    const ctx = canvas.getContext('2d')!
    ctx.scale(2, 2)

    // Assign colors per editora
    const editoras = [...new Set(books.map(b => b.editora))]
    const colorScale = d3.scaleOrdinal(d3.schemeTableau10).domain(editoras)

    // Create cluster centers
    const clusterX: Record<string, number> = {}
    editoras.forEach((e, i) => {
      clusterX[e] = (i + 0.5) / editoras.length * width
    })

    // Initialize particles
    type Node = { x: number; y: number; vx: number; vy: number; targetX: number; targetY: number; color: string; r: number }
    const nodes: Node[] = books.map(b => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      targetX: clusterX[b.editora] + (Math.random() - 0.5) * 60,
      targetY: height / 2 + (Math.random() - 0.5) * 60,
      color: colorScale(b.editora),
      r: 2.5 + Math.random() * 1.5,
    }))

    let time = 0

    function tick() {
      time += 0.01
      ctx.clearRect(0, 0, width, height)

      for (const node of nodes) {
        // Gentle pull toward cluster center
        node.vx += (node.targetX - node.x) * 0.002
        node.vy += (node.targetY - node.y) * 0.002

        // Subtle drift
        node.vx += Math.sin(time + node.x * 0.01) * 0.02
        node.vy += Math.cos(time + node.y * 0.01) * 0.02

        // Damping
        node.vx *= 0.98
        node.vy *= 0.98

        node.x += node.vx
        node.y += node.vy

        // Boundary
        if (node.x < 0) node.x = 0
        if (node.x > width) node.x = width
        if (node.y < 0) node.y = 0
        if (node.y > height) node.y = height

        ctx.beginPath()
        ctx.arc(node.x, node.y, node.r, 0, Math.PI * 2)
        ctx.fillStyle = node.color
        ctx.globalAlpha = 0.6
        ctx.fill()
      }
      ctx.globalAlpha = 1

      animRef.current = requestAnimationFrame(tick)
    }

    tick()

    return () => cancelAnimationFrame(animRef.current)
  }, [books])

  return (
    <div ref={containerRef} style={{ width: '100%' }}>
      <div style={{ fontSize: '0.6rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 8 }}>
        livros recentes por selo
      </div>
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%', borderRadius: 4 }} />
    </div>
  )
}

/* ── Main Export ─────────────────────────────────────────────────── */

export default function GroupCharts({ monthlyData, scatterData, particles, groupColor }: Props) {
  const color = groupColor || '#c0392b'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%', maxWidth: '440px', flexShrink: 0 }}>
      <MonthlyLineChart data={monthlyData} color={color} />
      <CatalogScatter data={scatterData} />
      <BookParticles books={particles} />
    </div>
  )
}
