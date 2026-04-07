'use client'

import { useRef, useEffect, useState, useCallback } from 'react'
import * as d3 from 'd3'

type BubbleNode = { selo: string; grupo: string; count: number }
type Props = { data: BubbleNode[] }
type SimNode = d3.SimulationNodeDatum & BubbleNode & { r: number; color: string; indep: boolean }

const GROUP_COLORS: Record<string, string> = {
  'Companhia das Letras': '#c9a227', 'Record': '#c0392b', 'Rocco': '#2980b9',
  'Sextante': '#27ae60', 'Autêntica': '#8e44ad', 'Darkside': '#34495e',
  'Todavia': '#d35400', 'Planeta': '#16a085', 'Globo': '#2471a3',
  'Harper': '#a93226', 'Intrínseca': '#6c3483', 'Ediouro': '#1a5276',
  'WMF': '#7d6608', 'Independente': '#78909c', 'Faro': '#b7950b',
  'Aleph': '#148f77', 'Fósforo': '#cb4335', 'DBA': '#839192',
  'Arquipélago': '#5d6d7e', 'Escotilha': '#6d4c41', 'Callis': '#5c6bc0',
  'VR': '#00897b', 'IBEP-Nacional': '#7e57c2', 'Universo dos Livros': '#2e7d32',
}
const INDEP_COLOR = '#9e9e9e'

function getColor(g: string): string {
  if (!g) return INDEP_COLOR
  return GROUP_COLORS[g] || d3.schemeTableau10[Math.abs(hash(g)) % 10]
}

function hash(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0
  return h
}

function paddedHull(nodes: SimNode[], pad: number): string | null {
  if (!nodes.length) return null
  if (nodes.length === 1) {
    const n = nodes[0], r = n.r + pad
    return `M${n.x! - r},${n.y!} A${r},${r} 0 1,0 ${n.x! + r},${n.y!} A${r},${r} 0 1,0 ${n.x! - r},${n.y!}`
  }
  const pts: [number, number][] = []
  for (const n of nodes) {
    const r = n.r + pad
    for (let a = 0; a < Math.PI * 2; a += Math.PI / 8)
      pts.push([n.x! + Math.cos(a) * r, n.y! + Math.sin(a) * r])
  }
  const hull = d3.polygonHull(pts)
  return hull ? d3.line().curve(d3.curveCatmullRomClosed.alpha(0.7))(hull) : null
}

export default function BubbleViz({ data }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)
  const tooltipRef = useRef<HTMLDivElement>(null)
  const [selected, setSelected] = useState<string | null>(null)
  const simRef = useRef<d3.Simulation<SimNode, undefined> | null>(null)

  // Named groups sorted by size, plus "independentes" label
  const namedGrupos = [...new Set(data.filter(d => d.grupo).map(d => d.grupo))].sort((a, b) => {
    const sa = data.filter(d => d.grupo === a).reduce((s, d) => s + d.count, 0)
    const sb = data.filter(d => d.grupo === b).reduce((s, d) => s + d.count, 0)
    return sb - sa
  })
  const hasIndep = data.some(d => !d.grupo)
  const chipList = [...namedGrupos, ...(hasIndep ? ['independentes'] : [])]

  const draw = useCallback(() => {
    const container = containerRef.current
    const svgEl = svgRef.current
    if (!container || !svgEl || !data.length) return
    simRef.current?.stop()

    const width = container.clientWidth
    // Height will be set after layout calculation
    let height = 600
    svgEl.setAttribute('width', String(width))
    const svg = d3.select(svgEl)
    svg.selectAll('*').remove()

    const maxCount = d3.max(data, d => d.count) || 1
    const rScale = d3.scaleSqrt().domain([0, maxCount]).range([3, Math.min(width, height) * 0.038])

    const nodes: SimNode[] = data.map(d => ({
      ...d,
      r: rScale(d.count),
      color: getColor(d.grupo),
      indep: !d.grupo,
      x: width / 2 + (Math.random() - 0.5) * width * 0.6,
      y: height / 2 + (Math.random() - 0.5) * height * 0.6,
    }))

    // Cluster centers — estimate actual space each group needs
    // based on the sum of circle areas, then lay out in rows
    const groupSizes = namedGrupos.map(g => {
      const gn = nodes.filter(d => d.grupo === g)
      // Estimate diameter of a packed circle cluster
      const totalArea = gn.reduce((s, d) => s + Math.PI * d.r * d.r, 0)
      const clusterR = Math.sqrt(totalArea / Math.PI) * 1.6 + 20 // ~radius of cluster
      return { name: g, clusterR }
    })

    const margin = 40
    const gap = 20
    const clusterCenters: Record<string, { x: number; y: number }> = {}
    let cx = margin, cy = margin + 30, rowH = 0

    for (const gs of groupSizes) {
      const diam = gs.clusterR * 2
      if (cx + diam > width - margin && cx > margin) {
        cx = margin; cy += rowH + gap; rowH = 0
      }
      clusterCenters[gs.name] = { x: cx + gs.clusterR, y: cy + gs.clusterR }
      cx += diam + gap
      rowH = Math.max(rowH, diam)
    }

    // Fit height to content + space for independents below
    const indepCount = nodes.filter(n => n.indep).length
    const indepRows = Math.ceil(indepCount / 12)
    const indepSpace = indepRows * 40 + 40
    const totalH = cy + rowH + margin + (indepCount > 0 ? indepSpace : 0)
    height = Math.max(400, Math.min(totalH, 1000))
    svgEl.setAttribute('height', String(height))

    // Layers
    const hullLayer = svg.append('g').attr('class', 'hulls')
    const circleLayer = svg.append('g').attr('class', 'circles')
    const labelLayer = svg.append('g').attr('class', 'labels')
    const gLabelLayer = svg.append('g').attr('class', 'group-labels')

    const hullPaths: Record<string, d3.Selection<SVGPathElement, unknown, null, undefined>> = {}
    const gLabels: Record<string, d3.Selection<SVGTextElement, unknown, null, undefined>> = {}
    namedGrupos.forEach(g => {
      hullPaths[g] = hullLayer.append('path')
        .attr('fill', getColor(g)).attr('fill-opacity', 0.06)
        .attr('stroke', getColor(g)).attr('stroke-opacity', 0.3)
        .attr('stroke-width', 1.5)
      gLabels[g] = gLabelLayer.append('text')
        .attr('text-anchor', 'middle')
        .attr('fill', getColor(g)).attr('opacity', 0.5)
        .attr('font-size', '0.55rem').attr('font-weight', 600)
        .attr('letter-spacing', '0.08em')
        .text(g.toUpperCase())
    })

    const tooltip = tooltipRef.current

    const circles = circleLayer.selectAll<SVGCircleElement, SimNode>('circle')
      .data(nodes).join('circle')
      .attr('r', d => d.r)
      .attr('fill', d => d.color)
      .attr('opacity', d => d.indep ? 0.5 : 0.82)
      .attr('stroke', d => d.indep ? INDEP_COLOR : '#fff')
      .attr('stroke-width', 1)
      .attr('stroke-dasharray', d => d.indep ? '2,2' : 'none')
      .attr('cursor', 'pointer')
      .on('mouseenter', (event, d) => {
        d3.select(event.currentTarget).attr('opacity', 1).attr('stroke', 'var(--text)').attr('stroke-width', 2).attr('stroke-dasharray', 'none').raise()
        if (tooltip) {
          tooltip.style.opacity = '1'
          tooltip.innerHTML = `<strong>${d.selo}</strong>${d.grupo ? `<br/><span style="opacity:0.5">${d.grupo}</span>` : '<br/><span style="opacity:0.4">independente</span>'}<br/>${d.count.toLocaleString('pt-BR')} livros`
        }
      })
      .on('mousemove', (event) => {
        if (tooltip) {
          const rect = svgEl.getBoundingClientRect()
          tooltip.style.left = `${event.clientX - rect.left}px`
          tooltip.style.top = `${event.clientY - rect.top - 60}px`
        }
      })
      .on('mouseleave', (event, d) => {
        const dim = selected && ((selected === 'independentes' && !d.indep) || (selected !== 'independentes' && d.grupo !== selected))
        d3.select(event.currentTarget)
          .attr('opacity', dim ? 0.08 : (d.indep ? 0.5 : 0.82))
          .attr('stroke', d.indep ? INDEP_COLOR : '#fff')
          .attr('stroke-width', 1)
          .attr('stroke-dasharray', d.indep ? '2,2' : 'none')
        if (tooltip) tooltip.style.opacity = '0'
      })

    const bLabels = labelLayer.selectAll<SVGTextElement, SimNode>('text')
      .data(nodes.filter(d => d.r > 16 && !d.indep)).join('text')
      .attr('text-anchor', 'middle').attr('dominant-baseline', 'central')
      .attr('fill', '#fff').attr('pointer-events', 'none').attr('opacity', 0.9)
      .attr('font-size', d => Math.max(6, Math.min(10, d.r * 0.28)) + 'px')
      .attr('font-weight', 500)
      .text(d => { const m = Math.floor(d.r / 3.2); return d.selo.length > m ? d.selo.substring(0, m) + '…' : d.selo })

    // Simulation
    // Grouped: strong pull to cluster. Independents: weak pull to center, spread out.
    // Custom wiggle force — injects tiny velocity each tick for gentle motion
    // Collide stays active because simulation never stops
    let tick = 0
    function wiggleForce() {
      return () => {
        tick++
        for (const n of nodes) {
          const t = tick * 0.008
          const speed = n.indep ? 0.08 : 0.02
          n.vx! += Math.sin(t + n.count * 0.04 + (n.index || 0) * 0.5) * speed
          n.vy! += Math.cos(t * 0.7 + n.count * 0.03 + (n.index || 0) * 0.3) * speed
        }
      }
    }

    const sim = d3.forceSimulation<SimNode>(nodes)
      .force('x', d3.forceX<SimNode>(d => d.indep ? width / 2 : (clusterCenters[d.grupo]?.x || width / 2)).strength(d => d.indep ? 0.012 : 0.35))
      .force('y', d3.forceY<SimNode>(d => d.indep ? height / 2 : (clusterCenters[d.grupo]?.y || height / 2)).strength(d => d.indep ? 0.012 : 0.35))
      .force('collide', d3.forceCollide<SimNode>(d => d.r + 1.5).strength(1).iterations(8))
      .force('charge', d3.forceManyBody<SimNode>().strength(d => d.indep ? -2 : 0))
      .force('wiggle', wiggleForce())
      .alphaTarget(0.02) // never fully stops — keeps collide active
      .alphaDecay(0)
      .velocityDecay(0.45)

    simRef.current = sim

    function update() {
      for (const n of nodes) {
        n.x = Math.max(n.r + 2, Math.min(width - n.r - 2, n.x!))
        n.y = Math.max(n.r + 16, Math.min(height - n.r - 2, n.y!))
      }
      circles.attr('cx', d => d.x!).attr('cy', d => d.y!)
      bLabels.attr('x', d => d.x!).attr('y', d => d.y!)
      namedGrupos.forEach(g => {
        const gn = nodes.filter(n => n.grupo === g)
        hullPaths[g].attr('d', paddedHull(gn, 10) || '')
        if (gn.length) {
          gLabels[g].attr('x', d3.mean(gn, n => n.x!) || 0).attr('y', (d3.min(gn, n => n.y! - n.r) || 0) - 10)
        }
      })
    }

    sim.on('tick', update)
  }, [data, namedGrupos, hasIndep, selected])

  // Highlight
  useEffect(() => {
    if (!svgRef.current) return
    const svg = d3.select(svgRef.current)
    svg.selectAll<SVGCircleElement, SimNode>('.circles circle')
      .transition().duration(250)
      .attr('opacity', d => {
        if (!selected) return d.indep ? 0.5 : 0.82
        if (selected === 'independentes') return d.indep ? 0.7 : 0.08
        return d.grupo === selected ? 0.82 : 0.08
      })
    svg.selectAll('.hulls path').each(function () {
      const el = d3.select(this)
      const match = !selected || selected === 'independentes' || el.attr('stroke') === getColor(selected)
      el.transition().duration(250)
        .attr('fill-opacity', match && selected !== 'independentes' ? 0.06 : 0.01)
        .attr('stroke-opacity', match && selected !== 'independentes' ? 0.3 : 0.04)
    })
    svg.selectAll('.group-labels text').each(function () {
      const el = d3.select(this)
      const match = !selected || el.text() === (selected === 'independentes' ? '' : selected.toUpperCase())
      el.transition().duration(250).attr('opacity', !selected ? 0.5 : (match ? 0.5 : 0.08))
    })
  }, [selected])

  useEffect(() => {
    draw()
    const ro = new ResizeObserver(draw)
    if (containerRef.current) ro.observe(containerRef.current)
    return () => { ro.disconnect(); simRef.current?.stop() }
  }, [draw])

  return (
    <div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, padding: '0 32px 20px', alignItems: 'center' }}>
        <button onClick={() => setSelected(null)} style={{
          background: !selected ? 'var(--text)' : 'transparent',
          color: !selected ? 'var(--bg)' : 'var(--muted)',
          border: '1px solid var(--border)', borderRadius: 20, padding: '3px 12px',
          fontSize: '0.62rem', cursor: 'pointer', fontFamily: 'inherit',
        }}>todos</button>
        {chipList.map(g => {
          const active = selected === g
          const isIndepChip = g === 'independentes'
          const total = isIndepChip
            ? data.filter(d => !d.grupo).reduce((s, d) => s + d.count, 0)
            : data.filter(d => d.grupo === g).reduce((s, d) => s + d.count, 0)
          const color = isIndepChip ? INDEP_COLOR : getColor(g)
          return (
            <button key={g} onClick={() => setSelected(active ? null : g)} style={{
              background: active ? color : 'transparent',
              color: active ? '#fff' : 'var(--muted)',
              border: `1px solid ${active ? color : 'var(--border)'}`,
              borderRadius: 20, padding: '3px 12px', fontSize: '0.62rem',
              cursor: 'pointer', fontFamily: 'inherit',
            }}>
              <span style={{
                display: 'inline-block', width: 6, height: 6, borderRadius: '50%',
                background: color, marginRight: 5, verticalAlign: 'middle',
                border: isIndepChip ? '1px dashed var(--muted)' : 'none',
              }} />
              {g}
              <span style={{ marginLeft: 4, opacity: 0.5 }}>{total.toLocaleString('pt-BR')}</span>
            </button>
          )
        })}
      </div>
      <div ref={containerRef} style={{ position: 'relative', width: '100%' }}>
        <svg ref={svgRef} style={{ display: 'block', width: '100%' }} />
        <div ref={tooltipRef} style={{
          position: 'absolute', pointerEvents: 'none', opacity: 0,
          background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 6,
          padding: '8px 14px', fontSize: '0.7rem', color: 'var(--text)',
          lineHeight: 1.5, whiteSpace: 'nowrap', transform: 'translateX(-50%)',
          transition: 'opacity 0.12s', boxShadow: '0 4px 20px rgba(0,0,0,0.15)', zIndex: 10,
        }} />
      </div>
    </div>
  )
}
