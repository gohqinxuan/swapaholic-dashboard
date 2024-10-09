'use client';

import * as React from 'react';
import * as d3 from 'd3';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import { Typography } from '@mui/material';
import Divider from '@mui/material/Divider';
import { alpha, useTheme } from '@mui/material/styles';
import type { SxProps } from '@mui/material/styles';
import { ArrowClockwise as ArrowClockwiseIcon } from '@phosphor-icons/react/dist/ssr/ArrowClockwise';
import { ArrowRight as ArrowRightIcon } from '@phosphor-icons/react/dist/ssr/ArrowRight';
import { useEffect, useState } from 'react';
import { fontFamily } from '../../../styles/theme/typography';

export interface YearlySalesProps {
  sx?: SxProps;
}

export function YearlySales({ sx }: YearlySalesProps): React.JSX.Element {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    // Load and parse the CSV file
    d3.csv('/datasets/transactions_new.csv').then((data) => {
      // Group data by year and calculate total sales for each year
      const salesByYear = d3.rollup(data, v => d3.sum(v, d => +d.total_amount), d => d.year);

      // Convert data to a suitable format for the bar chart
      const yearlySalesData = Array.from(salesByYear, ([year, total]) => ({ year, total }));

      // Sort the data by year in ascending order
      yearlySalesData.sort((a, b) => d3.ascending(a.year, b.year));

      setData(yearlySalesData);
    });
  }, []);

  return (
    <Card sx={sx}>
      <CardHeader
        action={
          <Button color="inherit" size="small" startIcon={<ArrowClockwiseIcon fontSize="var(--icon-fontSize-md)" />}>
            Sync
          </Button>
        }
        title="Yearly Sales"
      />
      <CardContent>
        {/* Pass data to D3 chart */}
        <BarChart data={data} />
      </CardContent>
    </Card>
  );
}

// D3.js BarChart Component
function BarChart({ data }: { data: { year: number; total: number }[] }) {
  useEffect(() => {

    // Append tooltip
    const tooltip = d3.select('#yearly-tooltip');
    if (tooltip.empty()) {
      d3.select('body')
        .append('div')
        .attr('id', 'yearly-tooltip')
    }

    // Style tooltip
    d3.select('#yearly-tooltip')
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
    const width = 900 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    // Remove any previous chart content
    d3.select('#yearly-graph').selectAll('*').remove();

    const svg = d3
      .select('#yearly-graph')
      .attr('viewBox', `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
      // .attr('width', width + margin.left + margin.right)
      // .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Apply font family to text elements
    svg.style('font-family', fontFamily);

    // Set up x scale
    const x = d3
      .scaleBand()
      .domain(data.map((d) => String(d.year)))
      .range([0, width])
      .padding(0.2);

    // Set up y scale
    const y = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => d.total) as number])
      .nice()
      .range([height, 0]);

    // Add x axis
    svg.append('g').attr('transform', `translate(0,${height})`).call(
      d3.axisBottom(x).tickFormat((d) => { return d; })
    );

    // Add y axis
    svg.append('g').call(
      d3.axisLeft(y).tickFormat((d) => `$${d3.format('.2s')(d)}`)
    );

    // Add bars
    svg.selectAll('.bar')
      .data(data)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', d => x(String(d.year)) || 0)
      .attr('y', d => y(d.total))
      .attr('width', x.bandwidth())
      .attr('height', (d) => height - y(d.total))
      .attr('fill', '#69b3a2')
      .on('mouseover', function (event, d) {
        d3.select(this)
          .style("fill", "#4e8d7c");

        d3.select('#yearly-tooltip')
          .style('opacity', 0.9)
          .html(`${d.year}<br>$${d3.format('.2s')(d.total)}`) 
          .style('left', `${event.pageX + 10}px`)
          .style('top', `${event.pageY - 28}px`);
      })
      .on('mouseout', function () {
        d3.select(this)
          .style("fill", "#69b3a2");

        d3.select('#yearly-tooltip').style('opacity', 0);  // Hide tooltip
      });

  }, [data]);

  return <svg id="yearly-graph"></svg>;
}


