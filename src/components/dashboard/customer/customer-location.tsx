'use client';

import * as React from 'react';
import * as d3 from 'd3';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import { useEffect, useState } from 'react';
import type { SxProps } from '@mui/material/styles';
import { ArrowClockwise as ArrowClockwiseIcon } from '@phosphor-icons/react/dist/ssr/ArrowClockwise';

export interface CustomerLocationProps {
  sx?: SxProps;
}

export function CustomerLocation({ sx }: CustomerLocationProps): React.JSX.Element {
  const [geoData, setGeoData] = useState<any>(null);
  const [customerData, setCustomerData] = useState<any[]>([]); // Updated to an array of objects

  useEffect(() => {
    // Fetch GeoJSON (map boundary data)
    const geoJSONPromise = fetch('/datasets/singapore_region.geojson')
      .then((response) => response.json());

    // Fetch customer data CSV
    const customerDataPromise = d3.csv('/datasets/region.csv', (d: any) => ({
      district: d.district.trim(),
      count: +d.count,
    }));

    Promise.all([geoJSONPromise, customerDataPromise]).then(([geo, customers]) => {
      setGeoData(geo);
      setCustomerData(customers);
    });
  }, []);

  useEffect(() => {
    if (geoData && customerData.length > 0) {
      drawMap(geoData, customerData); // Pass both geoData and customerData to drawMap
    }
  }, [geoData, customerData]);

  const drawMap = (singaporeGeoJSON: any, data: any[]) => { // Accept data as a parameter
    const features = singaporeGeoJSON.features;

    if (!features || features.length === 0) {
      console.error('Invalid GeoJSON data:', singaporeGeoJSON);
      return;
    }

    // Remove previous map content
    d3.select('#map').selectAll('*').remove();

    // Set up width and height
    const margin = { top: 20, right: 30, bottom: 50, left: 80 };
    const width = 800 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    // Manually set the scale and center for Singapore
    const projection = d3
      .geoMercator()
      .scale(63000)
      .center([103.8198, 1.3521])
      .translate([width / 2, height / 2]);

    const path = d3.geoPath().projection(projection);

    // Create color scale based on customer count
    const colorScale = d3.scaleThreshold<number, string>()
      .domain([9000, 10000, 15000, 20000, 25000, 30000, 35000])
      .range(d3.schemeBlues[7]);

    // Append tooltip
    const tooltip = d3.select('#region-tooltip');
    if (tooltip.empty()) {
      d3.select('body')
        .append('div')
        .attr('id', 'region-tooltip')
    }

    // Style tooltip
    d3.select('#region-tooltip')
      .style('opacity', 0)
      .style('position', 'absolute')
      .style('color', '#fff')
      .style('background', 'rgba(0, 0, 0, 0.8)')
      .style('padding', '8px')
      .style('border-radius', '4px')
      .style('pointer-events', 'none')
      .style('box-shadow', '0px 4px 8px rgba(0, 0, 0, 0.1)')
      .style('transition', 'opacity 0.2s ease-in-out');

    // Create SVG
    const svg = d3
      .select('#map')
      .attr('viewBox', `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`);

    // Append GeoJSON (Singapore map) and fill based on customer density
    svg.append('g')
      .selectAll('path')
      .data(features)
      .enter()
      .append('path')
      .attr('d', (d: any) => path(d) as string)
      .attr('fill', (d: any) => {
        const regionName = d.properties.district.trim();  // Access district from GeoJSON properties
        const regionData = data.find((item) => item.district === regionName);
        const customerCount = regionData ? regionData.count : 0;
        return colorScale(customerCount);  // Apply color based on customer count
      })
      .attr('stroke', '#333')
      .attr('stroke-width', '1px')
      .attr('class', 'region')
      .style('opacity', .8)
      .on('mouseover', function (event, d) {
        const regionName = (d as any).properties.district.trim();
        const regionData = data.find((item) => item.district === regionName);
        const customerCount = regionData ? regionData.count : 0;

        d3.select(this).style('opacity', 0.7);

        d3.select('#region-tooltip')
          .style('opacity', 0.9)
          .html(`${regionName}<br>${customerCount}`)
          .style('left', `${event.pageX + 10}px`)
          .style('top', `${event.pageY - 28}px`);
      })
      // .on('mousemove', function (event) {
      //   tooltip.style('left', (event.pageX + 5) + 'px')
      //     .style('top', (event.pageY - 28) + 'px');
      // })
      .on('mouseout', function () {
        d3.select(this).style('opacity', 1);

        d3.select('#region-tooltip').style('opacity', 0);
      });
  };

  return (
    <Card sx={sx}>
      <CardHeader title="Customer Locations in Singapore"/>
      <CardContent>
        <svg id="map"></svg>
      </CardContent>
    </Card>
  );
}
