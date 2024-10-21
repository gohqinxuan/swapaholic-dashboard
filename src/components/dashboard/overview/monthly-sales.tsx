'use client';

import * as React from 'react';
import * as d3 from 'd3';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import type { SxProps } from '@mui/material/styles';
import { useEffect, useState } from 'react';
import { fontFamily } from '../../../styles/theme/typography';

export interface MonthlySalesProps {
  sx?: SxProps;
}

export function MonthlySales({ sx }: MonthlySalesProps): React.JSX.Element {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    // Load and parse the CSV file
    d3.csv('/datasets/monthly_sales.csv').then((data) => {
      data.forEach((d: any) => {
        d.total_amount = +d.total_amount;
        d.month = d.month;
        d.type = d.type;
      });

      setData(data);
    });
  }, []);

  return (
    <Card sx={sx}>
      <CardHeader title="Monthly Sales" />
      <CardContent>
        {/* Pass data to D3 chart */}
        <BarChart data={data} />
      </CardContent>
    </Card>
  );
}

// D3.js BarChart Component
function BarChart({ data }: { data: { month: string; total_amount: number; type: string }[] }) {
  useEffect(() => {

    // Append tooltip
    const tooltip = d3.select('#monthly-tooltip');
    if (tooltip.empty()) {
      d3.select('body')
        .append('div')
        .attr('id', 'monthly-tooltip')
    }

    // Style tooltip
    d3.select('#monthly-tooltip')
      .style('opacity', 0)
      .style('position', 'absolute')
      .style('color', '#fff')
      .style('background', 'rgba(0, 0, 0, 0.8)')
      .style('padding', '8px')
      .style('border-radius', '4px')
      .style('pointer-events', 'none')
      .style('box-shadow', '0px 4px 8px rgba(0, 0, 0, 0.1)')
      .style('transition', 'opacity 0.2s ease-in-out');

    if (data.length === 0) return;

    // Set up chart dimensions
    const margin = { top: 20, right: 30, bottom: 50, left: 80 };
    const width = 800 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    // Remove any previous chart content
    d3.select('#monthly-graph').selectAll('*').remove();

    // make the chart responsive
    const svg = d3
      .select('#monthly-graph')
      .attr('viewBox', `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // const svg = d3
    //   .select('#monthly-graph')
    //   .attr('width', width + margin.left + margin.right)
    //   .attr('height', height + margin.top + margin.bottom)
    //   .append('g')
    //   .attr('transform', `translate(${margin.left},${margin.top})`);

    // Apply font family to text elements
    svg.style('font-family', fontFamily);

    // Set up x scale
    const x = d3
      .scaleBand()
      .domain(data.map((d) => d.month))
      .range([0, width])
      .padding(0.2);

    // Set up y scale
    const y = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => d.total_amount) as number])
      .nice()
      .range([height, 0]);

    // Add x axis
    svg.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x))
      .selectAll('text')
      .style('font-size', '15px');

    // Add y axis
    svg.append('g')
      .call(d3.axisLeft(y).tickFormat((d) => `$${d3.format('.2s')(d)}`))
      .style('font-size', '15px');

    // Add bars
    svg.selectAll('.bar')
      .data(data)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', (d) => x(d.month) as number)
      .attr('y', (d) => y(d.total_amount))
      .attr('width', x.bandwidth())
      .attr('height', (d) => height - y(d.total_amount))
      .attr('fill', (d) => (d.type === 'forecast' ? '#d8d6ff' : 'var(--mui-palette-primary-main)'))
      .on('mouseover', function (event, d) {
        d3.select(this)
          .style('opacity', 0.7);

        d3.select('#monthly-tooltip')
          .style('opacity', 0.9)
          .html(`${d.month}<br>$${d3.format('.2s')(d.total_amount)}`)
          .style('left', `${event.pageX + 10}px`)
          .style('top', `${event.pageY - 28}px`);
      })
      .on('mouseout', function (event, d) {
        d3.select(this).style('opacity', 1);

        d3.select('#monthly-tooltip').style('opacity', 0);  // Hide tooltip
      });

    interface LegendItem {
      color: string;
      label: string;
    }
    // Add legend
    const legendData: LegendItem[] = [
      { color: 'var(--mui-palette-primary-main)', label: 'Actual Sales' },
      { color: '#d8d6ff', label: 'Forecast Sales' }
    ];

    const legend = svg.append('g')
      .attr('transform', `translate(${width - 120}, -20)`); // Position legend at the top right

    legend.selectAll('.legend-item')
      .data(legendData)
      .enter()
      .append('g')
      .attr('class', 'legend-item')
      .attr('transform', (d, i) => `translate(0, ${i * 20})`); // Stack items vertically

    legend.selectAll('.legend-item')
      .append('rect')
      .attr('width', 15)
      .attr('height', 15)
      .attr('fill', (d) => (d as LegendItem).color);

    legend.selectAll('.legend-item')
      .append('text')
      .attr('x', 20)
      .attr('y', 12)
      .text((d) => (d as LegendItem).label)
      .style('font-size', '14px');


  }, [data]);

  return <svg id="monthly-graph"></svg>;
}


