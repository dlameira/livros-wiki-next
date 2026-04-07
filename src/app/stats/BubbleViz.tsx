'use client'

import { useRef, useEffect, useState, useCallback } from 'react'
import * as d3 from 'd3'

type BubbleNode = { selo: string; grupo: string; count: number }
type Props = { data: BubbleNode[] }
type SimNode = d3.SimulationNodeDatum & BubbleNode & { r: number; color: string }

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
  'Independente':        '#78909c',
  'Faro':                '#b7950b',
  'Aleph':               '#148f77',
  'Fósforo':             '#cb4335',
  'DBA':                 '#839192',
  'Arquipélago':         '#5d6d7e',
}

function getColor(g: string): string {
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
    for (let a = 0; a < Math.PI * 2; a += Math.PI / 6) {
      pts.push([n.x! + Math.cos(a) * r, n.y! + Math.sin(a) * r])
    }
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
  const driftRef = useRef<number>(0)

  const grupos = [...new Set(data.map(d => d.grupo))].sort((a, b) => {
    const sa = data.filter(d => d.grupo === a).reduce((s, d) => s + d.count, 0)
    const sb = data.filter(d => d.grupo === b).reduce((s, d) => s + d.count, 0)
    return sb - sa
  })

  const draw = useCallback(() => {
    const container = containerRef.current
    const svgEl = svgRef.current
    if (!container || !svgEl || !data.length) return
    cancelAnimationFrame(driftRef.current)

    const width = container.clientWidth
    const height = Math.max(550, Math.min(780, window.innerHeight - 180))
    svgEl.setAttribute('width', String(width))
    svgEl.setAttribute('height', String(height))
    const svg = d3.select(svgEl)
    svg.selectAll('*').remove()

    const maxCount = d3.max(data, d => d.count) || 1
    const rScale = d3.scaleSqrt().domain([0, maxCount]).range([5, Math.min(width, height) * 0.06])

    const nodes: SimNode[] = data.map(d => ({
      ...d,
      r: rScale(d.count),
      color: getColor(d.grupo),
      x: width / 2 + (Math.random() - 0.5) * width * 0.6,
      y: height / 2 + (Math.random() - 0.5) * height * 0.6,
    }))

    // Pack-based cluster centers — use d3.pack to compute ideal group positions
    // so larger groups get more space and distribution is even
    const groupTotals = grupos.map(g => ({
      name: g,
      total: data.filter(d => d.grupo === g).reduce((s, d) => s + d.count, 0),
    }))

    const packRoot = d3.hierarchy({ children: groupTotals } as unknown)
      .sum((d: unknown) => (d as { total?: number }).total || 0)

    const pack = d3.pack<unknown>()
      .size([width * 0.88, height * 0.88])
      .padding(40)

    const packed = pack(packRoot)
    const clusterCenters: Record<string, { x: number; y: number }> = {}
    packed.children?.forEach((child) => {
      const g = (child.data as { name: string }).name
      clusterCenters[g] = { x: child.x + width * 0.06, y: child.y + height * 0.06 }
    })

    // Layers
    const hullLayer = svg.append('g').attr('class', 'hulls')
    const circleLayer = svg.append('g').attr('class', 'circles')
    const labelLayer = svg.append('g').attr('class', 'labels')
    const gLabelLayer = svg.append('g').attr('class', 'group-labels')

    // Hulls
    const hullPaths: Record<string, d3.Selection<SVGPathElement, unknown, null, undefined>> = {}
    const gLabels: Record<string, d3.Selection<SVGTextElement, unknown, null, undefined>> = {}
    grupos.forEach(g => {
      hullPaths[g] = hullLayer.append('path')
        .attr('fill', getColor(g)).attr('fill-opacity', 0.06)
        .attr('stroke', getColor(g)).attr('stroke-opacity', 0.35)
        .attr('stroke-width', 2)
      gLabels[g] = gLabelLayer.append('text')
        .attr('text-anchor', 'middle')
        .attr('fill', getColor(g)).attr('opacity', 0.55)
        .attr('font-size', '0.58rem').attr('font-weight', 600)
        .attr('letter-spacing', '0.1em')
        .text(g.toUpperCase())
    })

    const tooltip = tooltipRef.current

    // Circles
    const circles = circleLayer.selectAll<SVGCircleElement, SimNode>('circle')
      .data(nodes).join('circle')
      .attr('r', d => d.r)
      .attr('fill', d => d.color).attr('opacity', 0.82)
      .attr('stroke', '#fff').attr('stroke-width', 1)
      .attr('cursor', 'pointer')
      .on('mouseenter', (event, d) => {
        d3.select(event.currentTarget).attr('opacity', 1).attr('stroke', 'var(--text)').attr('stroke-width', 2).raise()
        if (tooltip) {
          tooltip.style.opacity = '1'
          tooltip.innerHTML = `<strong>${d.selo}</strong><br/><span style="opacity:0.5">${d.grupo}</span><br/>${d.count.toLocaleString('pt-BR')} livros`
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
        d3.select(event.currentTarget)
          .attr('opacity', selected && d.grupo !== selected ? 0.1 : 0.82)
          .attr('stroke', '#fff').attr('stroke-width', 1)
        if (tooltip) tooltip.style.opacity = '0'
      })

    // Bubble labels
    const bLabels = labelLayer.selectAll<SVGTextElement, SimNode>('text')
      .data(nodes.filter(d => d.r > 18)).join('text')
      .attr('text-anchor', 'middle').attr('dominant-baseline', 'central')
      .attr('fill', '#fff').attr('pointer-events', 'none').attr('opacity', 0.9)
      .attr('font-size', d => Math.max(6, Math.min(11, d.r * 0.28)) + 'px')
      .attr('font-weight', 500)
      .text(d => {
        const max = Math.floor(d.r / 3.2)
        return d.selo.length > max ? d.selo.substring(0, max) + '…' : d.selo
      })

    // Simulation
    const sim = d3.forceSimulation<SimNode>(nodes)
      .force('x', d3.forceX<SimNode>(d => clusterCenters[d.grupo]?.x || width / 2).strength(0.18))
      .force('y', d3.forceY<SimNode>(d => clusterCenters[d.grupo]?.y || height / 2).strength(0.18))
      .force('collide', d3.forceCollide<SimNode>(d => d.r + 2.5).strength(1).iterations(5))
      .alphaDecay(0.018)
      .velocityDecay(0.38)

    simRef.current = sim

    function update() {
      // Clamp to bounds
      for (const n of nodes) {
        n.x = Math.max(n.r + 2, Math.min(width - n.r - 2, n.x!))
        n.y = Math.max(n.r + 18, Math.min(height - n.r - 2, n.y!))
      }
      circles.attr('cx', d => d.x!).attr('cy', d => d.y!)
      bLabels.attr('x', d => d.x!).attr('y', d => d.y!)

      grupos.forEach(g => {
        const gn = nodes.filter(n => n.grupo === g)
        hullPaths[g].attr('d', paddedHull(gn, 12) || '')
        if (gn.length) {
          const minY = d3.min(gn, n => n.y! - n.r) || 0
          gLabels[g].attr('x', d3.mean(gn, n => n.x!) || 0).attr('y', minY - 12)
        }
      })
    }

    sim.on('tick', update)

    sim.on('end', () => {
      let t = 0
      function drift() {
        t += 0.0015
        for (const n of nodes) {
          n.x! += Math.sin(t * 1.1 + n.count * 0.04) * 0.05
          n.y! += Math.cos(t * 0.8 + n.count * 0.03) * 0.04
        }
        update()
        driftRef.current = requestAnimationFrame(drift)
      }
      drift()
    })
  }, [data, grupos, selected])

  // Highlight filter
  useEffect(() => {
    if (!svgRef.current) return
    const svg = d3.select(svgRef.current)
    svg.selectAll<SVGCircleElement, SimNode>('.circles circle')
      .transition().duration(250)
      .attr('opacity', d => selected && d.grupo !== selected ? 0.08 : 0.82)
    svg.selectAll('.hulls path').each(function () {
      const el = d3.select(this)
      const isMatch = !selected || el.attr('stroke') === getColor(selected)
      el.transition().duration(250)
        .attr('fill-opacity', isMatch ? 0.06 : 0.01)
        .attr('stroke-opacity', isMatch ? 0.35 : 0.05)
    })
    svg.selectAll('.group-labels text').each(function () {
      const el = d3.select(this)
      const isMatch = !selected || el.text() === selected.toUpperCase()
      el.transition().duration(250).attr('opacity', isMatch ? 0.55 : 0.1)
    })
  }, [selected])

  useEffect(() => {
    draw()
    const ro = new ResizeObserver(draw)
    if (containerRef.current) ro.observe(containerRef.current)
    return () => { ro.disconnect(); simRef.current?.stop(); cancelAnimationFrame(driftRef.current) }
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
        {grupos.map(g => {
          const active = selected === g
          const total = data.filter(d => d.grupo === g).reduce((s, d) => s + d.count, 0)
          return (
            <button key={g} onClick={() => setSelected(active ? null : g)} style={{
              background: active ? getColor(g) : 'transparent',
              color: active ? '#fff' : 'var(--muted)',
              border: `1px solid ${active ? getColor(g) : 'var(--border)'}`,
              borderRadius: 20, padding: '3px 12px', fontSize: '0.62rem',
              cursor: 'pointer', fontFamily: 'inherit',
            }}>
              <span style={{
                display: 'inline-block', width: 6, height: 6, borderRadius: '50%',
                background: getColor(g), marginRight: 5, verticalAlign: 'middle',
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
