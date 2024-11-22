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

export interface PastSalesProps {
  sx?: SxProps;
}

export function PastSales({ sx }: PastSalesProps): React.JSX.Element {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    // Fetch CSV data from the backend
    fetch('http://localhost:5000/csv/data?filename=customer_transaction_new.csv')
      .then((response) => response.json()) 
      .then((data) => {
        // Parse the CSV string into an array of objects
        const parsedData = d3.csvParse(data.data); 

        // Extract date parts as YYYY-MM-DD strings
        parsedData.forEach((d: any) => {
          d.date_only = d.transaction_date;
        });

        // Parse dates and sort data by date
        parsedData.forEach((d: any) => {
          d.date_only = d3.timeParse('%Y-%m-%d')(d.date_only);
        });

        // Sort data by date in descending order
        parsedData.sort((a: any, b: any) => b.date_only - a.date_only);

        // Find the latest date in the dataset
        const latestDate = d3.max(parsedData, (d: any) => d.date_only);

        // Filter for the past 7 days
        const sevenDaysAgo = d3.timeDay.offset(latestDate, -7);
        const past7DaysData = parsedData.filter((d: any) => d.date_only >= sevenDaysAgo);

        // Aggregate sales by date
        const aggregatedData = d3.rollups(
          past7DaysData,
          (v) => d3.sum(v, (d: any) => +d.total_amount),
          (d: any) => d.date_only
        ).map(([date, sales]) => ({ date, sales }));

        setData(aggregatedData);
      })
      .catch((error) => {
        console.error('Error fetching CSV data:', error);
      });
  }, []);

  return (
    <Card sx={sx}>
      <CardHeader title="Past 7 Days' Sales"/>
      <CardContent>
        {/* Pass data to D3 chart */}
        <LineChart data={data} />
      </CardContent>
    </Card>
  );
}

// D3.js LineChart Component
function LineChart({ data }: { data: { date: Date; sales: number }[] }) {
  useEffect(() => {

    // Append tooltip
    const tooltip = d3.select('#past-tooltip');
    if (tooltip.empty()) {
      d3.select('body')
        .append('div')
        .attr('id', 'past-tooltip')
    }

    // Style tooltip
    d3.select('#past-tooltip')
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
    d3.select('#past-graph').selectAll('*').remove();

    // make the chart responsive
    const svg = d3
      .select('#past-graph')
      .attr('viewBox', `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Apply font family to text elements
    svg.style('font-family', fontFamily);

    // Set up x scale
    const x = d3
      .scaleTime()
      .domain(d3.extent(data, (d) => d.date) as [Date, Date])
      .range([0, width]);

    // Set up y scale
    const y = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => d.sales) as number])
      .nice()
      .range([height, 0]);

    // Add x axis with dd-mm format
    svg.append('g').attr('transform', `translate(0,${height})`).call(
      d3.axisBottom(x).ticks(7).tickFormat((domainValue: Date | d3.NumberValue) => d3.timeFormat('%d-%m')(domainValue as Date))
    ).style('font-size', '15px');

    // Add y axis
    svg.append('g').call(
      d3.axisLeft(y).tickFormat((d) => `$${d3.format('.2s')(d)}`)
    ).style('font-size', '15px');

    // Create line generator
    const line = d3
      .line<{ date: Date; sales: number }>()
      .x((d) => x(d.date))
      .y((d) => y(d.sales))

    // Add the line path
    svg.append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', 'var(--mui-palette-success-main)')
      .attr('stroke-width', 3)
      .attr('d', line);

    // Add dots on the line
    svg.selectAll('.dot')
      .data(data)
      .enter()
      .append('circle')
      .attr('class', 'dot')
      .attr('cx', (d) => x(d.date))
      .attr('cy', (d) => y(d.sales))
      .attr('r', 8)
      .attr('fill', 'var(--mui-palette-success-main)')
      .on('mouseover', function (event, d) {
        d3.select(this).style('opacity', 0.7);

        d3.select('#past-tooltip')
          .style('opacity', 0.9)
          .html(`$${d3.format('.2s')(d.sales)}`)
          .style('left', `${event.pageX + 10}px`)
          .style('top', `${event.pageY - 28}px`);
      })
      .on('mouseout', function () {
        d3.select(this).style('opacity', 1);

        d3.select('#past-tooltip').style('opacity', 0);
      });  
  }, [data]);

  return <svg id="past-graph"></svg>;
}


