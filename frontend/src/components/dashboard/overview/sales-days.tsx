'use client';

import * as React from 'react';
import * as d3 from 'd3';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Stack from '@mui/material/Stack';
import { Grid } from '@mui/material';
import { Typography } from '@mui/material';
import Divider from '@mui/material/Divider';
import { alpha, useTheme } from '@mui/material/styles';
import type { SxProps } from '@mui/material/styles';
import { ArrowClockwise as ArrowClockwiseIcon } from '@phosphor-icons/react/dist/ssr/ArrowClockwise';
import { ArrowRight as ArrowRightIcon } from '@phosphor-icons/react/dist/ssr/ArrowRight';
import { useEffect, useState } from 'react';
import { fontFamily } from '../../../styles/theme/typography';

export interface SalesDaysProps {
  sx?: SxProps;
}

export function SalesDays({ sx }: SalesDaysProps): React.JSX.Element {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    // Fetch CSV data from the backend
    fetch('http://localhost:5000/csv/data?filename=customer_transaction_new.csv')
      .then((response) => response.json())
      .then((data) => {
        // Parse the CSV string into an array of objects
        const parsedData = d3.csvParse(data.data); 

        // Ensure numeric values for 'total_amount' and 'year'
        parsedData.forEach((d: any) => {
          d.total_amount = +d.total_amount;
          d.year = +d.year;
        });

        // Find the latest year in the dataset
        const latestYear = d3.max(parsedData, (d: any) => d.year);

        // Filter data for the latest year
        const filteredData = parsedData
          .filter((d: any) => d.year === latestYear)
          .map((d: any) => ({
            ...d,
            total_amount: +d.total_amount, // Ensure total_amount is a number
          }));

        // Group data by day and calculate total sales for each day
        const salesByDay = d3.rollup(filteredData, v => d3.sum(v, d => +d.total_amount), d => d.day);

        // Convert data to a suitable format for the bar chart
        const daySalesData = Array.from(salesByDay, ([day, total]) => ({ day, total }));

        // Define the order of days
        const daysOrder = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

        // Sort the data by the defined order of days
        daySalesData.sort((a, b) => daysOrder.indexOf(a.day) - daysOrder.indexOf(b.day));

        setData(daySalesData);
      })
      .catch((error) => {
        console.error('Error fetching CSV data:', error);
      });
  }, []);

  // Calculate total sales for percentage calculation
  const totalSales = data.reduce((sum, d) => sum + d.total, 0);

  return (
    <Card sx={sx}>
      <CardHeader title="Sales by Days" />
      <CardContent>
        {/* Pass data to D3 chart */}
        <DoughnutChart data={data} />
        {/* Display labels and percentages under the chart */}
        <Stack direction="row" spacing={2} sx={{ alignItems: 'center', justifyContent: 'center', mt: 2, flexWrap: 'wrap' }}>
          {data.map((item, index) => {
            const percentage = ((item.total / totalSales) * 100).toFixed(2); // Calculate percentage
            const dayLabel = item.day;

            return (
              // <Stack key={dayLabel} spacing={1} sx={{ alignItems: 'center' }}>
              //   <Typography variant="h6">{dayLabel}</Typography>
              //   <Typography color="text.secondary" variant="subtitle2">
              //     {percentage}%
              //   </Typography>
              // </Stack>
              // wrap the day labels and percentages in a Grid component
              <Grid key={dayLabel} container direction="column" spacing={1} sx={{ alignItems: 'center', maxWidth: '60px' }}>
                <Grid item sx={{ paddingRight: '8px' }}>
                  <Typography variant="h6" noWrap align="center">{dayLabel}</Typography>
                </Grid>
                <Grid item sx={{ paddingRight: '8px' }}>
                  <Typography color="text.secondary" variant="subtitle2" noWrap align="center">
                    {percentage}%
                  </Typography>
                </Grid>
              </Grid>
            );
          })}
        </Stack>
      </CardContent>
    </Card>
  );
}

// D3.js DoughnutChart Component
function DoughnutChart({ data }: { data: { day: string; total: number }[] }) {
  useEffect(() => {

    // Append tooltip
    const tooltip = d3.select('#days-tooltip');
    if (tooltip.empty()) {
      d3.select('body')
        .append('div')
        .attr('id', 'days-tooltip')
    }

    // Style tooltip
    d3.select('#days-tooltip')
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
    const margin = { top: 10, right: 10, bottom: 10, left: 10 };
    const width = 350 - margin.left - margin.right;
    const height = 350 - margin.top - margin.bottom;
    const radius = Math.min(width, height) / 2;

    // Remove any previous chart content
    d3.select('#days-graph').selectAll('*').remove();

    const svg = d3
      .select('#days-graph')
      .attr('viewBox', `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
      // .attr('width', width + margin.left + margin.right)
      // .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${width / 2 + margin.left},${height / 2 + margin.top})`);

    // Apply font family to text elements
    svg.style('font-family', fontFamily);

    // Define the color scale
    const color = d3.scaleOrdinal()
      .domain(data.map(d => d.day))
      .range(["#2A265F", "#3C3D99", "#5455a8", "#5752D1", "#8481DD", "#B2B0EA", "#d8d6ff"]);;


    // Create a pie layout
    const pie = d3.pie<{ day: string; total: number }>()
      .value(d => d.total)
      .sort(null);

    // Create an arc generator
    const arc = d3.arc<d3.PieArcDatum<{ day: string; total: number }>>()
      .outerRadius(radius - 10)
      .innerRadius(radius - 70);

    // Create a pie chart
    const arcData = pie(data);
    svg.selectAll('.arc')
      .data(arcData)
      .enter()
      .append('path')
      .attr('class', 'arc')
      .attr('d', arc)
      .attr('fill', d => color(d.data.day) as string)
      .on('mouseover', function (event, d) {
        d3.select(this).style('opacity', 0.7);

        d3.select('#days-tooltip')
          .style('opacity', 0.9)
          .html(`${d.data.day}<br>$${d3.format('.2s')(d.data.total)}`)
          .style('left', `${event.pageX + 10}px`)
          .style('top', `${event.pageY - 28}px`);
      })
      .on('mouseout', function () {
        d3.select(this).style('opacity', 1);

        d3.select('#days-tooltip').style('opacity', 0);
      });

  }, [data]);

  return <svg id="days-graph"></svg>;
}


