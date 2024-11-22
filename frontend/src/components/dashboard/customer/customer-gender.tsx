'use client';

import * as React from 'react';
import * as d3 from 'd3';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Stack from '@mui/material/Stack';
import { Typography } from '@mui/material';
import type { SxProps } from '@mui/material/styles';
import type { Icon } from '@phosphor-icons/react/dist/lib/types';
import { GenderMale as GenderMaleIcon } from '@phosphor-icons/react/dist/ssr/GenderMale';
import { GenderFemale as GenderFemaleIcon } from '@phosphor-icons/react/dist/ssr/GenderFemale';
import { useEffect, useState } from 'react';
import { fontFamily } from '../../../styles/theme/typography';

const iconMapping = { Male: GenderMaleIcon, Female: GenderFemaleIcon } as Record<string, Icon>;

export interface CustomerGenderProps {
  sx?: SxProps;
}

export function CustomerGender({ sx }: CustomerGenderProps): React.JSX.Element {
  const [data, setData] = useState<any[]>([]);
  useEffect(() => {
    // Fetch the CSV data from the backend
    fetch('http://localhost:5000/csv/data?filename=customer_transaction_new.csv')
    .then((response) => response.json())
    .then((data) => {
      // Parse the CSV string into an array of objects
      const parsedData = d3.csvParse(data.data);

      // Process the data to get counts of Male and Female
      const genderCounts = d3.rollup(parsedData, v => v.length, d => d.gender);

      // Convert the data into a format suitable for a pie chart
      const genderData = Array.from(genderCounts, ([key, value]) => ({ gender: key, count: value }));

      setData(genderData); // Update the state with the processed gender data
    })
    .catch((error) => {
      console.error('Error fetching CSV data:', error);
    });
}, []);

  // Calculate total sales for percentage calculation
  const totalUser = data.reduce((sum, d) => sum + d.count, 0);

  return (
    <Card sx={sx}>
      <CardHeader title="Gender" />
      <CardContent>
        {/* Pass data to D3 chart */}
        <DoughnutChart data={data} />
        {/* Display labels and percentages under the chart */}
        <Stack direction="row" spacing={2} sx={{ alignItems: 'center', justifyContent: 'center', mt: 2 }}>
          {data.map((item, index) => {
            const percentage = ((item.count / totalUser) * 100).toFixed(1); // Calculate percentage
            const genderLabel = item.gender;
            const Icon = iconMapping[genderLabel];

            // Conditional color assignment based on gender
            const percentageColor = genderLabel === 'Female' ? "var(--mui-palette-success-main)" : "#11927f";

            return (
              <Stack key={genderLabel} spacing={1} sx={{ alignItems: 'center' }}>
                {Icon ? <Icon fontSize="var(--icon-fontSize-lg)" /> : null}
                <Typography variant="h6">{genderLabel}</Typography>
                <Typography variant="h5" fontWeight="bold" sx={{ color: percentageColor }} >
                  {percentage}%
                </Typography>
              </Stack>
            );
          })}
        </Stack>
      </CardContent>
    </Card>
  );
}

// D3.js DoughnutChart Component
function DoughnutChart({ data }: { data: { gender: string; count: number }[] }) {
  useEffect(() => {

    // Append tooltip
    const tooltip = d3.select('#gender-tooltip');
    if (tooltip.empty()) {
      d3.select('body')
        .append('div')
        .attr('id', 'gender-tooltip')
    }

    // Style tooltip
    d3.select('#gender-tooltip')
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
    d3.select('#gender-graph').selectAll('*').remove();

    const svg = d3
      .select('#gender-graph')
      .attr('viewBox', `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
      // .attr('width', width + margin.left + margin.right)
      // .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${width / 2 + margin.left},${height / 2 + margin.top})`);

    // Apply font family to text elements
    svg.style('font-family', fontFamily);

    // Define the color scale
    const color = d3.scaleOrdinal()
      .domain(data.map(d => d.gender))
      .range(["var(--mui-palette-success-main)", "#11927f"]);

    // Create a pie layout
    const pie = d3.pie<{ gender: string; count: number }>()
      .value(d => d.count)
      .sort(null);

    // Create an arc generator
    const arc = d3.arc<d3.PieArcDatum<{ gender: string; count: number }>>()
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
      .attr('fill', d => color(d.data.gender) as string)
      .on('mouseover', function (event, d) {
        d3.select(this).style('opacity', 0.7);

        d3.select('#gender-tooltip')
          .style('opacity', 0.9)
          .html(`${d.data.gender}<br>${d.data.count}`)
          .style('left', `${event.pageX + 10}px`)
          .style('top', `${event.pageY - 28}px`);
      })
      .on('mouseout', function () {
        d3.select(this).style('opacity', 1);

        d3.select('#gender-tooltip').style('opacity', 0);
      });

  }, [data]);

  return <svg id="gender-graph"></svg>;
}


