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
      <CardHeader
        action={
          <Button color="inherit" size="small" startIcon={<ArrowClockwiseIcon fontSize="var(--icon-fontSize-md)" />}>
            Sync
          </Button>
        }
        title="Age Group"
      />
      <CardContent>
        {/* Pass data to D3 chart */}
        <DoughnutChart data={data} />
        {/* Display labels and percentages under the chart */}
        <Stack direction="row" spacing={2} sx={{ alignItems: 'center', justifyContent: 'center', mt: 2, flexWrap: 'wrap' }}>
          {data.map((item, index) => {
            const percentage = ((item.count / totalUser) * 100).toFixed(2); // Calculate percentage
            const ageLabel = item.ageRange;

            return (
              // <Stack key={ageLabel} spacing={1} sx={{ alignItems: 'center' }}>
              //   <Typography variant="h6">{ageLabel}</Typography>
              //   <Typography color="text.secondary" variant="subtitle2">
              //     {percentage}%
              //   </Typography>
              // </Stack>
              <Grid key={ageLabel} container spacing={1} sx={{ alignItems: 'center', maxWidth: '60px', flexWrap: 'wrap'  }}>
                <Grid item>
                  <Typography variant="h6" noWrap>{ageLabel}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography color="text.secondary" variant="subtitle2" noWrap>
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
function DoughnutChart({ data }: { data: { ageRange: string; count: number }[] }) {
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
    const margin = { top: 10, right: 10, bottom: 10, left: 10 };
    const width = 350 - margin.left - margin.right;
    const height = 350 - margin.top - margin.bottom;
    const radius = Math.min(width, height) / 2;

    // Remove any previous chart content
    d3.select('#age-graph').selectAll('*').remove();

    const svg = d3
      .select('#age-graph')
      .attr('viewBox', `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
      // .attr('width', width + margin.left + margin.right)
      // .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${width / 2 + margin.left},${height / 2 + margin.top})`);

    // Apply font family to text elements
    svg.style('font-family', fontFamily);

    // Define the color scale
    const color = d3.scaleOrdinal(d3.schemePurples[7]);

    // Create a pie layout
    const pie = d3.pie<{ ageRange: string; count: number }>()
      .value(d => d.count)
      .sort(null);

    // Create an arc generator
    const arc = d3.arc<d3.PieArcDatum<{ ageRange: string; count: number }>>()
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
      .attr('fill', d => color(d.data.ageRange))
      .on('mouseover', function (event, d) {
        d3.select(this).style('opacity', 0.7);

        d3.select('#age-tooltip')
          .style('opacity', 0.9)
          .html(`${d.data.ageRange} years old<br>${d.data.count}`)
          .style('left', `${event.pageX + 10}px`)
          .style('top', `${event.pageY - 28}px`);
      })
      .on('mouseout', function () {
        d3.select(this).style('opacity', 1);

        d3.select('#age-tooltip').style('opacity', 0);
      });

  }, [data]);

  return <svg id="age-graph"></svg>;
}


