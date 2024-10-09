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

export interface PastRevenueProps {
  sx?: SxProps;
}

export function PastRevenue({ sx }: PastRevenueProps): React.JSX.Element {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    // Load and parse the CSV file
    d3.csv('/datasets/transactions_new.csv').then((data) => {
      // Extract date parts as YYYY-MM-DD strings
      data.forEach((d: any) => {
        d.date_only = d.created_at.split(' ')[0];
      });

      // Parse dates and sort data by date
      data.forEach((d: any) => {
        d.date_only = d3.timeParse('%Y-%m-%d')(d.date_only);
      });

      // Sort data by date in descending order
      data.sort((a: any, b: any) => b.date_only - a.date_only);

      // Find the latest date string in the dataset
      const latestDate = d3.max(data, (d: any) => d.date_only);

      // Filter for the past 7 days
      const sevenDaysAgo = d3.timeDay.offset(latestDate, -7);
      const past7DaysData = data.filter((d: any) => d.date_only >= sevenDaysAgo);

      // Aggregate revenue by date
      const aggregatedData = d3.rollups(
        past7DaysData,
        (v) => d3.sum(v, (d: any) => +d.total_amount),
        (d: any) => d.date_only
      ).map(([date, revenue]) => ({ date, revenue }));

      setData(aggregatedData);
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
        title="Past 7 Days Revenue"
      />
      <CardContent>
        {/* Pass data to D3 chart */}
        <LineChart data={data} />
      </CardContent>
    </Card>
  );
}

// D3.js LineChart Component
function LineChart({ data }: { data: { date: Date; revenue: number }[] }) {
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
      .domain([0, d3.max(data, (d) => d.revenue) as number])
      .nice()
      .range([height, 0]);

    // Add x axis with dd-mm format
    svg.append('g').attr('transform', `translate(0,${height})`).call(
      d3.axisBottom(x).ticks(7).tickFormat((domainValue: Date | d3.NumberValue) => d3.timeFormat('%d-%m')(domainValue as Date))
    ).style('font-size', '12px');

    // Add y axis
    svg.append('g').call(
      d3.axisLeft(y).tickFormat((d) => `$${d3.format('.2s')(d)}`)
    ).style('font-size', '12px');

    // Create line generator
    const line = d3
      .line<{ date: Date; revenue: number }>()
      .x((d) => x(d.date))
      .y((d) => y(d.revenue))

    // Add the line path
    svg.append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', '#69b3a2')
      .attr('stroke-width', 3)
      .attr('d', line);

    // Add dots on the line
    svg.selectAll('.dot')
      .data(data)
      .enter()
      .append('circle')
      .attr('class', 'dot')
      .attr('cx', (d) => x(d.date))
      .attr('cy', (d) => y(d.revenue))
      .attr('r', 8)
      .attr('fill', '#69b3a2')
      .on('mouseover', function (event, d) {
        d3.select(this).style('opacity', 0.7);

        d3.select('#past-tooltip')
          .style('opacity', 0.9)
          .html(`$${d3.format('.2s')(d.revenue)}`)
          .style('left', `${event.pageX + 10}px`)
          .style('top', `${event.pageY - 28}px`);
      })
      .on('mouseout', function () {
        d3.select(this).style('opacity', 1);

        d3.select('#past-tooltip').style('opacity', 0);
      });

    // Tooltip and point for hovering
    // const focus = svg.append('g').style('display', 'none');

    // // Add a circle (point) on hover
    // focus.append('circle')
    //   .attr('r', 5)
    //   .attr('fill', 'blue');

    // Add mouseover event
    // svg.append('rect')
    //   .attr('width', width)
    //   .attr('height', height)
    //   .style('fill', 'none')
    //   .style('pointer-events', 'all')
    //   .on('mouseover', function () {
    //     focus.style('display', null);
    //     d3.select('#past-tooltip').style('opacity', 0.9);
    //   })
    //   .on('mouseout', function () {
    //     focus.style('display', 'none');
    //     d3.select('#past-tooltip').style('opacity', 0);
    //   })
      // .on('mousemove', function (event) {
      //   const bisectDate = d3.bisector((d: { date: Date }) => d.date).left;
      //   const x0 = x.invert(d3.pointer(event)[0]);
      //   const i = bisectDate(data, x0, 1);
      //   const d0 = data[i - 1];
      //   const d1 = data[i]|| d0;
      //   const d = (x0.valueOf() - d0.date.valueOf()) > (d1.date.valueOf() - x0.valueOf()) ? d1 : d0;
      //   focus.attr('transform', `translate(${x(d.date)},${y(d.revenue)})`);
      //   d3.select('#past-tooltip')
      //     .html(`$${d3.format('.2s')(d.revenue)}`)
      //     .style('left', `${event.pageX + 10}px`)
      //     .style('top', `${event.pageY - 28}px`)
      //     .style('opacity', 1);
      // });    

  }, [data]);

  return <svg id="past-graph"></svg>;
}


