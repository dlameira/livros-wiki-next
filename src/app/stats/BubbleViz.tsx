'use client'

import { useRef, useEffect, useState, useCallback } from 'react'
import * as d3 from 'd3'

type BubbleNode = { selo: string; grupo: string; count: number }
type Props = { data: BubbleNode[] }

type SimNode = d3.SimulationNodeDatum & BubbleNode & { r: number; color: string; isIndep: boolean }

const GROUP_COLORS: Record<string, string> = {
  'Companhia das Letras': '#c9a227',
  'Record':              '#c0392b',
  'Rocco':               '#2980b9',
  'Sextante':            '#27ae60',
  'Autêntica':           '#8e44ad',
  'Darkside':            '#34495e',
  'Todavia':             '#d35400',
  'Planeta':             '#16a085',
  'Globo':               '#2471a3',
  'Harper':              '#a93226',
  'Intrínseca':          '#6c3483',
  'Ediouro':             '#1a5276',
  'WMF':                 '#7d6608',
  'Independente':        '#8e8e8e',
  'Faro':                '#b7950b',
  'Aleph':               '#148f77',
  'Fósforo':             '#cb4335',
  'DBA':                 '#839192',
  'Arquipélago':         '#5d6d7e',
}

function getColor(grupo: string): string {
  return GROUP_COLORS[grupo] || d3.schemeTableau10[Math.abs(hash(grupo)) % 10]
}

function hash(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0
  return h
}

const INDEP = 'Independente'

// Convex hull with padding
function paddedHull(nodes: SimNode[], pad: number): string | null {
  if (nodes.length < 1) return null
  if (nodes.length === 1) {
    const n = nodes[0]
    const r = n.r + pad
    return `M${n.x! - r},${n.y!} A${r},${r} 0 1,0 ${n.x! + r},${n.y!} A${r},${r} 0 1,0 ${n.x! - r},${n.y!}`
  }
  const pts: [number, number][] = []
  const step = Math.PI / 6
  for (const n of nodes) {
    const r = n.r + pad
    for (let a = 0; a < Math.PI * 2; a += step) {
      pts.push([n.x! + Math.cos(a) * r, n.y! + Math.sin(a) * r])
    }
  }
  const hull = d3.polygonHull(pts)
  if (!hull) return null
  return d3.line().curve(d3.curveCatmullRomClosed.alpha(0.8))(hull)
}

export default function BubbleViz({ data }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)
  const tooltipRef = useRef<HTMLDivElement>(null)
  const [selectedGrupo, setSelectedGrupo] = useState<string | null>(null)
  const simRef = useRef<d3.Simulation<SimNode, undefined> | null>(null)
  const driftRef = useRef<number>(0)

  // Groups sorted by total, excluding Independente from cluster layout
  const clusteredGrupos = [...new Set(data.filter(d => d.grupo !== INDEP).map(d => d.grupo))].sort((a, b) => {
    const sumA = data.filter(d => d.grupo === a).reduce((s, d) => s + d.count, 0)
    const sumB = data.filter(d => d.grupo === b).reduce((s, d) => s + d.count, 0)
    return sumB - sumA
  })
  const allGrupos = [...clusteredGrupos, ...(data.some(d => d.grupo === INDEP) ? [INDEP] : [])]

  const draw = useCallback(() => {
    const container = containerRef.current
    const svgEl = svgRef.current
    if (!container || !svgEl || !data.length) return

    cancelAnimationFrame(driftRef.current)

    const width = container.clientWidth
    const height = Math.max(600, Math.min(850, window.innerHeight - 160))

    svgEl.setAttribute('width', String(width))
    svgEl.setAttribute('height', String(height))

    const svg = d3.select(svgEl)
    svg.selectAll('*').remove()

    const maxCount = d3.max(data, d => d.count) || 1
    const radiusScale = d3.scaleSqrt().domain([0, maxCount]).range([6, Math.min(width, height) * 0.065])

    const nodes: SimNode[] = data.map(d => ({
      ...d,
      r: radiusScale(d.count),
      color: getColor(d.grupo),
      isIndep: d.grupo === INDEP,
      x: width / 2 + (Math.random() - 0.5) * width * 0.5,
      y: height / 2 + (Math.random() - 0.5) * height * 0.5,
    }))

    // Cluster centers for non-independent groups
    const cols = Math.min(5, Math.ceil(Math.sqrt(clusteredGrupos.length * 1.4)))
    const rows = Math.ceil(clusteredGrupos.length / cols)
    const cellW = width / cols
    const cellH = height / rows
    const clusterCenters: Record<string, { x: number; y: number }> = {}
    clusteredGrupos.forEach((g, i) => {
      const col = i % cols
      const row = Math.floor(i / cols)
      clusterCenters[g] = {
        x: (col + 0.5) * cellW,
        y: (row + 0.5) * cellH,
      }
    })

    // Layers
    const hullLayer = svg.append('g').attr('class', 'hulls')
    const circleLayer = svg.append('g').attr('class', 'circles')
    const labelLayer = svg.append('g').attr('class', 'labels')
    const groupLabelLayer = svg.append('g').attr('class', 'group-labels')

    // Hull paths for clustered groups only
    const hullPaths: Record<string, d3.Selection<SVGPathElement, unknown, null, undefined>> = {}
    const groupLabels: Record<string, d3.Selection<SVGTextElement, unknown, null, undefined>> = {}

    clusteredGrupos.forEach(g => {
      hullPaths[g] = hullLayer.append('path')
        .attr('fill', getColor(g))
        .attr('opacity', 0.07)
        .attr('stroke', getColor(g))
        .attr('stroke-opacity', 0.4)
        .attr('stroke-width', 2)

      groupLabels[g] = groupLabelLayer.append('text')
        .attr('text-anchor', 'middle')
        .attr('fill', getColor(g))
        .attr('opacity', 0.6)
        .attr('font-size', '0.62rem')
        .attr('font-weight', 600)
        .attr('letter-spacing', '0.1em')
        .text(g.toUpperCase())
    })

    const tooltip = tooltipRef.current

    // Circles
    const circles = circleLayer.selectAll<SVGCircleElement, SimNode>('circle')
      .data(nodes)
      .join('circle')
      .attr('r', d => d.r)
      .attr('fill', d => d.color)
      .attr('opacity', d => d.isIndep ? 0.55 : 0.8)
      .attr('stroke', d => d.isIndep ? getColor(d.grupo) : '#fff')
      .attr('stroke-width', d => d.isIndep ? 1.5 : 1)
      .attr('stroke-dasharray', d => d.isIndep ? '3,2' : 'none')
      .attr('cursor', 'pointer')
      .on('mouseenter', (event, d) => {
        d3.select(event.currentTarget)
          .attr('opacity', 1)
          .attr('stroke', 'var(--text)')
          .attr('stroke-width', 2)
          .attr('stroke-dasharray', 'none')
          .raise()
        if (tooltip) {
          tooltip.style.opacity = '1'
          tooltip.innerHTML = `<strong>${d.selo}</strong><br/><span style="opacity:0.5">${d.grupo}</span><br/>${d.count.toLocaleString('pt-BR')} livros`
        }
      })
      .on('mousemove', (event) => {
        if (tooltip) {
          const rect = svgEl.getBoundingClientRect()
          tooltip.style.left = `${event.clientX - rect.left}px`
          tooltip.style.top = `${event.clientY - rect.top - 64}px`
        }
      })
      .on('mouseleave', (event, d) => {
        d3.select(event.currentTarget)
          .attr('opacity', selectedGrupo && d.grupo !== selectedGrupo ? 0.1 : (d.isIndep ? 0.55 : 0.8))
          .attr('stroke', d.isIndep ? getColor(d.grupo) : '#fff')
          .attr('stroke-width', d.isIndep ? 1.5 : 1)
          .attr('stroke-dasharray', d.isIndep ? '3,2' : 'none')
        if (tooltip) tooltip.style.opacity = '0'
      })

    // Labels inside big bubbles
    const bubbleLabels = labelLayer.selectAll<SVGTextElement, SimNode>('text')
      .data(nodes.filter(d => d.r > 18))
      .join('text')
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'central')
      .attr('fill', '#fff')
      .attr('font-size', d => Math.max(6.5, Math.min(11, d.r * 0.3)) + 'px')
      .attr('font-weight', 500)
      .attr('pointer-events', 'none')
      .attr('opacity', 0.9)
      .text(d => {
        const max = Math.floor(d.r / 3.5)
        return d.selo.length > max ? d.selo.substring(0, max) + '…' : d.selo
      })

    // Simulation
    // Independentes: no cluster force, just collide freely
    // Grouped: attract to cluster center
    const simulation = d3.forceSimulation<SimNode>(nodes)
      .force('x', d3.forceX<SimNode>(d => d.isIndep ? width / 2 : (clusterCenters[d.grupo]?.x || width / 2)).strength(d => d.isIndep ? 0.01 : 0.15))
      .force('y', d3.forceY<SimNode>(d => d.isIndep ? height / 2 : (clusterCenters[d.grupo]?.y || height / 2)).strength(d => d.isIndep ? 0.01 : 0.15))
      .force('collide', d3.forceCollide<SimNode>(d => d.r + 3).strength(1).iterations(4))
      .force('charge', d3.forceManyBody<SimNode>().strength(d => d.isIndep ? -8 : -1))
      .alphaDecay(0.015)
      .velocityDecay(0.35)

    simRef.current = simulation

    function updatePositions() {
      // Clamp to visible area
      nodes.forEach(n => {
        n.x = Math.max(n.r + 4, Math.min(width - n.r - 4, n.x!))
        n.y = Math.max(n.r + 20, Math.min(height - n.r - 4, n.y!))
      })
      circles.attr('cx', d => d.x!).attr('cy', d => d.y!)
      bubbleLabels.attr('x', d => d.x!).attr('y', d => d.y!)

      // Update hulls for clustered groups
      clusteredGrupos.forEach(g => {
        const groupNodes = nodes.filter(n => n.grupo === g)
        const path = paddedHull(groupNodes, 14)
        hullPaths[g].attr('d', path || '')

        if (groupNodes.length) {
          const minY = d3.min(groupNodes, n => n.y! - n.r) || 0
          const cx = d3.mean(groupNodes, n => n.x!) || 0
          groupLabels[g].attr('x', cx).attr('y', minY - 14)
        }
      })
    }

    simulation.on('tick', updatePositions)

    simulation.on('end', () => {
      let t = 0
      function drift() {
        t += 0.002
        nodes.forEach(n => {
          const speed = n.isIndep ? 0.4 : 0.06
          n.x! += Math.sin(t + n.count * 0.05) * speed
          n.y! += Math.cos(t * 0.7 + n.count * 0.03) * speed
        })
        updatePositions()
        driftRef.current = requestAnimationFrame(drift)
      }
      drift()
    })

  }, [data, clusteredGrupos, selectedGrupo])

  // Filter highlight
  useEffect(() => {
    if (!svgRef.current) return
    const svg = d3.select(svgRef.current)

    svg.selectAll<SVGCircleElement, SimNode>('.circles circle')
      .transition().duration(300)
      .attr('opacity', d => selectedGrupo && d.grupo !== selectedGrupo ? 0.08 : (d.isIndep ? 0.55 : 0.8))

    svg.selectAll<SVGPathElement, unknown>('.hulls path')
      .transition().duration(300)
      .attr('fill-opacity', function () {
        if (!selectedGrupo) return 0.07
        const stroke = d3.select(this).attr('stroke')
        return stroke === getColor(selectedGrupo) ? 0.14 : 0.02
      })
      .attr('stroke-opacity', function () {
        if (!selectedGrupo) return 0.4
        const stroke = d3.select(this).attr('stroke')
        return stroke === getColor(selectedGrupo) ? 0.7 : 0.08
      })

    svg.selectAll<SVGTextElement, unknown>('.group-labels text')
      .transition().duration(300)
      .attr('opacity', function () {
        if (!selectedGrupo) return 0.6
        const text = (d3.select(this).text() as string).toLowerCase()
        return text === selectedGrupo.toUpperCase() ? 0.9 : 0.12
      })
  }, [selectedGrupo])

  useEffect(() => {
    draw()
    const ro = new ResizeObserver(draw)
    if (containerRef.current) ro.observe(containerRef.current)
    return () => { ro.disconnect(); simRef.current?.stop(); cancelAnimationFrame(driftRef.current) }
  }, [draw])

  return (
    <div>
      {/* Filter chips */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, padding: '0 32px 20px', alignItems: 'center' }}>
        <button
          onClick={() => setSelectedGrupo(null)}
          style={{
            background: !selectedGrupo ? 'var(--text)' : 'transparent',
            color: !selectedGrupo ? 'var(--bg)' : 'var(--muted)',
            border: '1px solid var(--border)',
            borderRadius: 20, padding: '3px 12px', fontSize: '0.62rem',
            cursor: 'pointer', fontFamily: 'inherit', letterSpacing: '0.04em',
          }}
        >
          todos
        </button>
        {allGrupos.map(g => {
          const active = selectedGrupo === g
          const total = data.filter(d => d.grupo === g).reduce((s, d) => s + d.count, 0)
          return (
            <button
              key={g}
              onClick={() => setSelectedGrupo(active ? null : g)}
              style={{
                background: active ? getColor(g) : 'transparent',
                color: active ? '#fff' : 'var(--muted)',
                border: `1px solid ${active ? getColor(g) : 'var(--border)'}`,
                borderRadius: 20, padding: '3px 12px', fontSize: '0.62rem',
                cursor: 'pointer', fontFamily: 'inherit', letterSpacing: '0.04em',
              }}
            >
              <span style={{
                display: 'inline-block', width: 6, height: 6, borderRadius: '50%',
                background: getColor(g), marginRight: 5, verticalAlign: 'middle',
                border: g === INDEP ? '1px dashed var(--muted)' : 'none',
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
          lineHeight: 1.5, whiteSpace: 'nowrap',
          transform: 'translateX(-50%)', transition: 'opacity 0.12s',
          boxShadow: '0 4px 20px rgba(0,0,0,0.15)', zIndex: 10,
        }} />
      </div>
    </div>
  )
}
