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
import type { SxProps } from '@mui/material/styles';
import { useEffect, useState } from 'react';
import { fontFamily } from '../../../styles/theme/typography';

export interface CustomerAgeProps {
  sx?: SxProps;
}

export function CustomerAge({ sx }: CustomerAgeProps): React.JSX.Element {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    // Load and parse the CSV file
    d3.csv('/datasets/customer_new.csv').then((data) => {
      // Process the data to group ages
      const ageGroups = d3.rollups(data, v => v.length, d => {
        const age = +d.age;
        if (age >= 20 && age <= 24) return '20-24';
        if (age >= 25 && age <= 29) return '25-29';
        if (age >= 30 && age <= 34) return '30-34';
        if (age >= 35 && age <= 39) return '35-39';
        if (age >= 40 && age <= 44) return '40-44';
        if (age >= 45 && age <= 49) return '45-49';
        return '50+';
      });

      const ageData = Array.from(ageGroups, ([key, value]) => ({ ageRange: key, count: value }));

      // Define the order of age groups
      const ageOrder = ['20-24', '25-29', '30-34', '35-39', '40-44', '45-49', '50+'];

      // Sort the data by the defined order of age groups
      ageData.sort((a, b) => ageOrder.indexOf(a.ageRange) - ageOrder.indexOf(b.ageRange));

      setData(ageData);
    });
  }, []);

  // Calculate total sales for percentage calculation
  const totalUser = data.reduce((sum, d) => sum + d.count, 0);

  return (
    <Card sx={sx}>
      <CardHeader title="Age Group" />
      <CardContent>
        {/* Pass data to D3 chart */}
        <BarChart data={data} totalUser={totalUser} />
      </CardContent>
    </Card>
  );
}

// D3.js BarChart Component
function BarChart({ data, totalUser }: { data: { ageRange: string; count: number }[], totalUser: number }) {
  useEffect(() => {

    // Append tooltip
    const tooltip = d3.select('#age-tooltip');
    if (tooltip.empty()) {
      d3.select('body')
        .append('div')
        .attr('id', 'age-tooltip')
    }

    // Style tooltip
    d3.select('#age-tooltip')
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
    const margin = { top: 30, right: 20, bottom: 40, left: 40 };
    const width = 800 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    // Remove any previous chart content
    d3.select('#age-graph').selectAll('*').remove();

    const svg = d3
      .select('#age-graph')
      .attr('viewBox', `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Apply font family to text elements
    svg.style('font-family', fontFamily);

    // X scale (age groups)
    const x = d3.scaleBand()
      .domain(data.map(d => d.ageRange))
      .range([0, width])
      .padding(0.1);

    // Y scale (percentage)
    const y = d3.scaleLinear()
      .domain([0, d3.max(data, d => (d.count / totalUser) * 100)!])
      .range([height, 0]);

    // X Axis
    svg.append('g')
      .attr('transform', `translate(0, ${height})`)
      .call(d3.axisBottom(x))
      .style('font-size', '15px');

    // // Y Axis
    // svg.append('g')
    //   .call(d3.axisLeft(y).ticks(5).tickFormat(d => `${d}%`));

    // Bars
    svg.selectAll('.bar')
      .data(data)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', d => x(d.ageRange)!)
      .attr('y', d => y((d.count / totalUser) * 100))
      .attr('width', x.bandwidth())
      .attr('height', d => height - y((d.count / totalUser) * 100))
      .attr('fill', 'var(--mui-palette-primary-main)')
      .on('mouseover', function (event, d) {
        d3.select(this)
          .style('opacity', 0.7);

        d3.select('#age-tooltip')
          .style('opacity', 0.9)
          .html(`${d.ageRange}<br>${d3.format('.2s')(d.count)}`)
          .style('left', `${event.pageX + 10}px`)
          .style('top', `${event.pageY - 28}px`);
      })
      .on('mouseout', function (event, d) {
        d3.select(this).style('opacity', 1);

        d3.select('#age-tooltip').style('opacity', 0);  // Hide tooltip
      });

    // Add percentage labels on top of each bar
    svg.selectAll('.label')
      .data(data)
      .enter()
      .append('text')
      .attr('class', 'label')
      .attr('x', d => x(d.ageRange)! + x.bandwidth() / 2)
      .attr('y', d => y((d.count / totalUser) * 100) - 5)
      .attr('text-anchor', 'middle')
      .style('fill', '#000')
      .style('font-family', fontFamily)
      .text(d => `${((d.count / totalUser) * 100).toFixed(2)}%`);

  }, [data, totalUser]);

  return <svg id="age-graph"></svg>;
}


