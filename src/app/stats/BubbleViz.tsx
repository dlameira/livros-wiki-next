'use client'

import { useRef, useEffect, useState, useCallback } from 'react'
import * as d3 from 'd3'

type BubbleNode = { selo: string; grupo: string; count: number }
type Props = { data: BubbleNode[] }
type SimNode = d3.SimulationNodeDatum & BubbleNode & { r: number; color: string }

const GROUP_COLORS: Record<string, string> = {
  'Companhia das Letras': '#c9a227', 'Record': '#c0392b', 'Rocco': '#2980b9',
  'Sextante': '#27ae60', 'Autêntica': '#8e44ad', 'Darkside': '#34495e',
  'Todavia': '#d35400', 'Planeta': '#16a085', 'Globo': '#2471a3',
  'Harper': '#a93226', 'Intrínseca': '#6c3483', 'Ediouro': '#1a5276',
  'WMF': '#7d6608', 'Faro': '#b7950b', 'Aleph': '#148f77',
  'Fósforo': '#cb4335', 'DBA': '#839192', 'Arquipélago': '#5d6d7e',
  'Escotilha': '#6d4c41', 'Callis': '#5c6bc0', 'VR': '#00897b',
  'IBEP-Nacional': '#7e57c2', 'Universo dos Livros': '#2e7d32',
}
const INDEP_COLOR = '#9e9e9e'

function getColor(g: string): string {
  if (!g) return INDEP_COLOR
  return GROUP_COLORS[g] || d3.schemeTableau10[Math.abs(hash(g)) % 10]
}
function hash(s: string): number {
  let h = 0; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0; return h
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
    const height = Math.max(200, Math.min(350, (window.innerHeight - 180) / 2))
    svgEl.setAttribute('width', String(width))
    svgEl.setAttribute('height', String(height))
    const svg = d3.select(svgEl)
    svg.selectAll('*').remove()

    const pad = 16 // inner padding of the box

    // Outer box
    svg.append('rect')
      .attr('x', 1).attr('y', 1)
      .attr('width', width - 2).attr('height', height - 2)
      .attr('rx', 8).attr('ry', 8)
      .attr('fill', 'none')
      .attr('stroke', 'var(--border)')
      .attr('stroke-width', 1)

    const maxCount = d3.max(data, d => d.count) || 1
    const rScale = d3.scaleSqrt().domain([0, maxCount]).range([2, Math.min(width, height) * 0.06])

    const nodes: SimNode[] = data.map(d => ({
      ...d,
      r: rScale(d.count),
      color: getColor(d.grupo),
      x: pad + Math.random() * (width - pad * 2),
      y: pad + Math.random() * (height - pad * 2),
    }))

    // Cluster centers for named groups — spread evenly inside the box
    const clusterCenters: Record<string, { x: number; y: number }> = {}
    const cols = Math.min(5, Math.ceil(Math.sqrt(namedGrupos.length)))
    const rows = Math.ceil(namedGrupos.length / cols)
    namedGrupos.forEach((g, i) => {
      const col = i % cols
      const row = Math.floor(i / cols)
      clusterCenters[g] = {
        x: pad + (col + 0.5) / cols * (width - pad * 2),
        y: pad + (row + 0.5) / rows * (height - pad * 2),
      }
    })

    // Layers
    const hullLayer = svg.append('g').attr('class', 'hulls')
    const circleLayer = svg.append('g').attr('class', 'circles')
    const labelLayer = svg.append('g').attr('class', 'labels')
    const gLabelLayer = svg.append('g').attr('class', 'group-labels')

    // Hull paths per named group
    const hullPaths: Record<string, d3.Selection<SVGPathElement, unknown, null, undefined>> = {}
    const gLabels: Record<string, d3.Selection<SVGTextElement, unknown, null, undefined>> = {}
    namedGrupos.forEach(g => {
      hullPaths[g] = hullLayer.append('path')
        .attr('fill', getColor(g)).attr('fill-opacity', 0.06)
        .attr('stroke', getColor(g)).attr('stroke-opacity', 0.25)
        .attr('stroke-width', 1.5)
      gLabels[g] = gLabelLayer.append('text')
        .attr('text-anchor', 'middle')
        .attr('fill', getColor(g)).attr('opacity', 0.45)
        .attr('font-size', '0.52rem').attr('font-weight', 600)
        .attr('letter-spacing', '0.08em')
        .text(g.toUpperCase())
    })

    const tooltip = tooltipRef.current

    const circles = circleLayer.selectAll<SVGCircleElement, SimNode>('circle')
      .data(nodes).join('circle')
      .attr('r', d => d.r)
      .attr('fill', d => d.color).attr('opacity', 0.8)
      .attr('stroke', '#fff').attr('stroke-width', 0.8)
      .attr('cursor', 'pointer')
      .on('mouseenter', (event, d) => {
        d3.select(event.currentTarget).attr('opacity', 1).attr('stroke', 'var(--text)').attr('stroke-width', 2).raise()
        if (tooltip) {
          tooltip.style.opacity = '1'
          tooltip.innerHTML = `<strong>${d.selo}</strong><br/><span style="opacity:0.5">${d.grupo || 'independente'}</span><br/>${d.count.toLocaleString('pt-BR')} livros`
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
        const vizG = d.grupo || 'independentes'
        d3.select(event.currentTarget)
          .attr('opacity', selected && selected !== vizG ? 0.08 : 0.8)
          .attr('stroke', '#fff').attr('stroke-width', 0.8)
        if (tooltip) tooltip.style.opacity = '0'
      })

    const bLabels = labelLayer.selectAll<SVGTextElement, SimNode>('text')
      .data(nodes.filter(d => d.r > 14)).join('text')
      .attr('text-anchor', 'middle').attr('dominant-baseline', 'central')
      .attr('fill', '#fff').attr('pointer-events', 'none').attr('opacity', 0.9)
      .attr('font-size', d => Math.max(5.5, Math.min(9, d.r * 0.26)) + 'px')
      .attr('font-weight', 500)
      .text(d => { const m = Math.floor(d.r / 3); return d.selo.length > m ? d.selo.substring(0, m) + '…' : d.selo })

    // Wiggle force
    let tick = 0
    function wiggleForce() {
      return () => {
        tick++
        const t = tick * 0.005
        for (const n of nodes) {
          n.vx! += Math.sin(t + (n.index || 0) * 0.4) * 0.012
          n.vy! += Math.cos(t * 0.6 + (n.index || 0) * 0.3) * 0.01
        }
      }
    }

    // Simulation: grouped nodes pull toward cluster, independents just collide
    const sim = d3.forceSimulation<SimNode>(nodes)
      .force('x', d3.forceX<SimNode>(d => d.grupo ? (clusterCenters[d.grupo]?.x || width / 2) : width / 2).strength(d => d.grupo ? 0.25 : 0.005))
      .force('y', d3.forceY<SimNode>(d => d.grupo ? (clusterCenters[d.grupo]?.y || height / 2) : height / 2).strength(d => d.grupo ? 0.25 : 0.005))
      .force('collide', d3.forceCollide<SimNode>(d => d.r + 1.5).strength(1).iterations(8))
      .force('wiggle', wiggleForce())
      .alphaTarget(0.012)
      .alphaDecay(0)
      .velocityDecay(0.45)

    simRef.current = sim

    function update() {
      // Clamp to box
      for (const n of nodes) {
        n.x = Math.max(pad + n.r, Math.min(width - pad - n.r, n.x!))
        n.y = Math.max(pad + n.r, Math.min(height - pad - n.r, n.y!))
      }
      circles.attr('cx', d => d.x!).attr('cy', d => d.y!)
      bLabels.attr('x', d => d.x!).attr('y', d => d.y!)
      namedGrupos.forEach(g => {
        const gn = nodes.filter(n => n.grupo === g)
        hullPaths[g].attr('d', paddedHull(gn, 8) || '')
        if (gn.length) {
          gLabels[g].attr('x', d3.mean(gn, n => n.x!) || 0).attr('y', (d3.min(gn, n => n.y! - n.r) || 0) - 8)
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
        if (!selected) return 0.8
        const vizG = d.grupo || 'independentes'
        return vizG === selected ? 0.9 : 0.06
      })
    svg.selectAll('.hulls path').each(function () {
      const el = d3.select(this)
      const match = !selected || el.attr('stroke') === getColor(selected)
      el.transition().duration(250)
        .attr('fill-opacity', match ? 0.06 : 0.01)
        .attr('stroke-opacity', match ? 0.25 : 0.03)
    })
    svg.selectAll('.group-labels text').each(function () {
      const el = d3.select(this)
      const match = !selected || el.text() === selected.toUpperCase()
      el.transition().duration(250).attr('opacity', match ? 0.45 : 0.06)
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
          const isIndep = g === 'independentes'
          const total = isIndep
            ? data.filter(d => !d.grupo).reduce((s, d) => s + d.count, 0)
            : data.filter(d => d.grupo === g).reduce((s, d) => s + d.count, 0)
          const color = isIndep ? INDEP_COLOR : getColor(g)
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
