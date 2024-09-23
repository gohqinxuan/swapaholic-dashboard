'use client';

import * as React from 'react';
import * as d3 from 'd3';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
// import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
// import Divider from '@mui/material/Divider';
// import { alpha, useTheme } from '@mui/material/styles';
import type { SxProps } from '@mui/material/styles';
import { ArrowClockwise as ArrowClockwiseIcon } from '@phosphor-icons/react/dist/ssr/ArrowClockwise';
// import { ArrowRight as ArrowRightIcon } from '@phosphor-icons/react/dist/ssr/ArrowRight';
import { useEffect, useState } from 'react';
import { fontFamily } from '../../../styles/theme/typography';

export interface MonthlyRevenueProps {
  sx?: SxProps;
}

export function MonthlyRevenue({ sx }: MonthlyRevenueProps): React.JSX.Element {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    // Load and parse the CSV file
    d3.csv('/datasets/transactions_new.csv').then((data) => {
      data.forEach((d: any) => {
        d.total_amount = +d.total_amount;
        d.year = +d.year;
        d.month = +d.month;
      });

      // Find the latest year in the dataset
      const latestYear = d3.max(data, (d: any) => d.year);

      // Filter data for the latest year
      const filteredData = data
        .filter((d: any) => d.year === latestYear)
        .map((d: any) => ({
          ...d,
          total_amount: +Number(d.total_amount), // Ensure total_amount is a number
          month: +d.month, // Ensure month is a number
        }));

      // Group the data by month and sum the total_amount
      const monthlyRevenue = d3.rollup(
        filteredData,
        (v: any) => d3.sum(v, (d: any) => d.total_amount),
        (d: any) => d.month
      );

      const dataForChart = Array.from(monthlyRevenue, ([month, revenue]) => ({
        month,
        revenue,
      }));

      setData(dataForChart);
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
        title="Monthly Revenue"
      />
      <CardContent>
        {/* Pass data to D3 chart */}
        <BarChart data={data} />
      </CardContent>
    </Card>
  );
}

// D3.js BarChart Component
function BarChart({ data }: { data: { month: number; revenue: number }[] }) {
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
      .domain(data.map((d) => String(d.month)).sort((a, b) => +a - +b))
      .range([0, width])
      .padding(0.2);

    // Set up y scale
    const y = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => d.revenue) as number])
      .nice()
      .range([height, 0]);

    // Add x axis
    svg.append('g').attr('transform', `translate(0,${height})`).call(
      d3.axisBottom(x).tickFormat((d) => {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return months[+d - 1];
      })
    );

    // Add y axis
    svg.append('g').call(
      d3.axisLeft(y).tickFormat((d) => `$${d3.format('.2s')(d)}`)
    );

    // Add bars
    svg
      .selectAll('.bar')
      .data(data)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', (d) => String(x(String(d.month))))
      .attr('y', (d) => y(d.revenue))
      .attr('width', x.bandwidth())
      .attr('height', (d) => height - y(d.revenue))
      .attr('fill', '#69b3a2')
      .on('mouseover', function (event, d) {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        d3.select(this)
          .style("fill", "#4e8d7c");

        d3.select('#monthly-tooltip')
          .style('opacity', 0.9)
          .html(`${months[d.month - 1]}<br>$${d3.format('.2s')(d.revenue)}`)
          .style('left', `${event.pageX + 10}px`)
          .style('top', `${event.pageY - 28}px`);
      })
      .on('mouseout', function () {
        d3.select(this)
          .style("fill", "#69b3a2");

        d3.select('#monthly-tooltip').style('opacity', 0);  // Hide tooltip
      });

  }, [data]);

  return <svg id="monthly-graph"></svg>;
}


