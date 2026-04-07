'use client'

import { useRef, useEffect, useState, useCallback } from 'react'
import * as d3 from 'd3'

type BubbleNode = { selo: string; grupo: string; count: number }
type Props = { data: BubbleNode[] }

// D3 simulation node
type SimNode = d3.SimulationNodeDatum & BubbleNode & { r: number; color: string }

const GROUP_COLORS: Record<string, string> = {
  'Companhia das Letras': '#e6b422',
  'Record':              '#c0392b',
  'Rocco':               '#2980b9',
  'Sextante':            '#27ae60',
  'Autêntica':           '#8e44ad',
  'Darkside':            '#2c3e50',
  'Todavia':             '#d35400',
  'Planeta':             '#16a085',
  'Globo':               '#2471a3',
  'Harper':              '#a93226',
  'Intrínseca':          '#6c3483',
  'Ediouro':             '#1a5276',
  'WMF':                 '#7d6608',
  'Independente':        '#566573',
  'Faro':                '#b7950b',
  'Aleph':               '#148f77',
  'Fósforo':             '#cb4335',
  'DBA':                 '#839192',
  'Arquipélago':         '#5d6d7e',
}

function getGroupColor(grupo: string): string {
  return GROUP_COLORS[grupo] || d3.schemeTableau10[Math.abs(hashStr(grupo)) % 10]
}

function hashStr(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0
  return h
}

export default function BubbleViz({ data }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)
  const tooltipRef = useRef<HTMLDivElement>(null)
  const [selectedGrupo, setSelectedGrupo] = useState<string | null>(null)
  const simRef = useRef<d3.Simulation<SimNode, undefined> | null>(null)

  const grupos = [...new Set(data.map(d => d.grupo))].sort((a, b) => {
    const sumA = data.filter(d => d.grupo === a).reduce((s, d) => s + d.count, 0)
    const sumB = data.filter(d => d.grupo === b).reduce((s, d) => s + d.count, 0)
    return sumB - sumA
  })

  const draw = useCallback(() => {
    const container = containerRef.current
    const svgEl = svgRef.current
    if (!container || !svgEl || !data.length) return

    const width = container.clientWidth
    const height = Math.max(500, Math.min(700, window.innerHeight - 200))

    svgEl.setAttribute('width', String(width))
    svgEl.setAttribute('height', String(height))

    const svg = d3.select(svgEl)
    svg.selectAll('*').remove()

    const maxCount = d3.max(data, d => d.count) || 1
    const radiusScale = d3.scaleSqrt().domain([0, maxCount]).range([4, Math.min(width, height) * 0.09])

    const nodes: SimNode[] = data.map(d => ({
      ...d,
      r: radiusScale(d.count),
      color: getGroupColor(d.grupo),
      x: width / 2 + (Math.random() - 0.5) * width * 0.4,
      y: height / 2 + (Math.random() - 0.5) * height * 0.4,
    }))

    // Cluster centers — spread groups in a grid
    const cols = Math.ceil(Math.sqrt(grupos.length))
    const clusterCenters: Record<string, { x: number; y: number }> = {}
    grupos.forEach((g, i) => {
      const col = i % cols
      const row = Math.floor(i / cols)
      clusterCenters[g] = {
        x: (col + 0.5) / cols * width * 0.85 + width * 0.075,
        y: (row + 0.5) / Math.ceil(grupos.length / cols) * height * 0.85 + height * 0.075,
      }
    })

    const g = svg.append('g')

    // Simulation
    const simulation = d3.forceSimulation<SimNode>(nodes)
      .force('x', d3.forceX<SimNode>(d => clusterCenters[d.grupo]?.x || width / 2).strength(0.12))
      .force('y', d3.forceY<SimNode>(d => clusterCenters[d.grupo]?.y || height / 2).strength(0.12))
      .force('collide', d3.forceCollide<SimNode>(d => d.r + 1.5).strength(0.8).iterations(3))
      .force('charge', d3.forceManyBody().strength(-2))
      .alphaDecay(0.02)
      .velocityDecay(0.3)

    simRef.current = simulation

    const tooltip = tooltipRef.current

    // Draw circles
    const circles = g.selectAll<SVGCircleElement, SimNode>('circle')
      .data(nodes)
      .join('circle')
      .attr('r', d => d.r)
      .attr('fill', d => d.color)
      .attr('opacity', 0.75)
      .attr('stroke', 'none')
      .attr('cursor', 'pointer')
      .on('mouseenter', (event, d) => {
        d3.select(event.currentTarget)
          .attr('opacity', 1)
          .attr('stroke', 'var(--text)')
          .attr('stroke-width', 1.5)
        if (tooltip) {
          tooltip.style.opacity = '1'
          tooltip.innerHTML = `<strong>${d.selo}</strong><br/><span style="opacity:0.6">${d.grupo}</span><br/>${d.count.toLocaleString('pt-BR')} livros`
        }
      })
      .on('mousemove', (event) => {
        if (tooltip) {
          const rect = svgEl.getBoundingClientRect()
          tooltip.style.left = `${event.clientX - rect.left}px`
          tooltip.style.top = `${event.clientY - rect.top - 60}px`
        }
      })
      .on('mouseleave', (event) => {
        d3.select(event.currentTarget)
          .attr('opacity', d => selectedGrupo && d.grupo !== selectedGrupo ? 0.15 : 0.75)
          .attr('stroke', 'none')
        if (tooltip) tooltip.style.opacity = '0'
      })

    // Labels for large bubbles
    const labels = g.selectAll<SVGTextElement, SimNode>('text')
      .data(nodes.filter(d => d.r > 22))
      .join('text')
      .attr('text-anchor', 'middle')
      .attr('dominant-baseline', 'central')
      .attr('fill', '#fff')
      .attr('font-size', d => Math.max(7, Math.min(12, d.r * 0.35)) + 'px')
      .attr('font-weight', 500)
      .attr('letter-spacing', '0.02em')
      .attr('pointer-events', 'none')
      .text(d => d.selo.length > d.r / 4 ? d.selo.substring(0, Math.floor(d.r / 4)) + '…' : d.selo)

    simulation.on('tick', () => {
      circles
        .attr('cx', d => d.x!)
        .attr('cy', d => d.y!)
      labels
        .attr('x', d => d.x!)
        .attr('y', d => d.y!)
    })

    // Gentle continuous motion after settle
    simulation.on('end', () => {
      let t = 0
      function drift() {
        t += 0.003
        nodes.forEach(n => {
          n.x! += Math.sin(t + n.count * 0.1) * 0.15
          n.y! += Math.cos(t + n.count * 0.07) * 0.12
        })
        circles.attr('cx', d => d.x!).attr('cy', d => d.y!)
        labels.attr('x', d => d.x!).attr('y', d => d.y!)
        requestAnimationFrame(drift)
      }
      drift()
    })

  }, [data, grupos, selectedGrupo])

  // Filter effect
  useEffect(() => {
    if (!svgRef.current) return
    const svg = d3.select(svgRef.current)
    svg.selectAll<SVGCircleElement, SimNode>('circle')
      .transition().duration(300)
      .attr('opacity', d => selectedGrupo && d.grupo !== selectedGrupo ? 0.08 : 0.75)
      .attr('r', d => selectedGrupo && d.grupo !== selectedGrupo ? d.r * 0.6 : d.r)
  }, [selectedGrupo])

  useEffect(() => {
    draw()
    const ro = new ResizeObserver(draw)
    if (containerRef.current) ro.observe(containerRef.current)
    return () => { ro.disconnect(); simRef.current?.stop() }
  }, [draw])

  return (
    <div>
      {/* Legend / filter chips */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, padding: '0 32px 16px', alignItems: 'center' }}>
        <button
          onClick={() => setSelectedGrupo(null)}
          style={{
            background: !selectedGrupo ? 'var(--text)' : 'transparent',
            color: !selectedGrupo ? 'var(--bg)' : 'var(--muted)',
            border: '1px solid var(--border)',
            borderRadius: 20, padding: '3px 12px', fontSize: '0.65rem',
            cursor: 'pointer', fontFamily: 'inherit', letterSpacing: '0.04em',
            transition: 'all 0.15s',
          }}
        >
          todos
        </button>
        {grupos.map(g => {
          const active = selectedGrupo === g
          return (
            <button
              key={g}
              onClick={() => setSelectedGrupo(active ? null : g)}
              style={{
                background: active ? getGroupColor(g) : 'transparent',
                color: active ? '#fff' : 'var(--muted)',
                border: `1px solid ${active ? getGroupColor(g) : 'var(--border)'}`,
                borderRadius: 20, padding: '3px 12px', fontSize: '0.65rem',
                cursor: 'pointer', fontFamily: 'inherit', letterSpacing: '0.04em',
                transition: 'all 0.15s',
              }}
            >
              <span style={{
                display: 'inline-block', width: 6, height: 6, borderRadius: '50%',
                background: getGroupColor(g), marginRight: 5, verticalAlign: 'middle',
              }} />
              {g}
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
