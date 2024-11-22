'use client';

import * as React from 'react';
import * as d3 from 'd3';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import { useEffect, useState } from 'react';
import type { SxProps } from '@mui/material/styles';

export interface CustomerLocationProps {
  sx?: SxProps;
}

export function CustomerLocation({ sx }: CustomerLocationProps): React.JSX.Element {
  const [geoData, setGeoData] = useState<any>(null);
  const [customerData, setCustomerData] = useState<any[]>([]);

  useEffect(() => {
    // Fetch GeoJSON (map boundary data)
    const geoJSONPromise = fetch('http://localhost:5000/geojson/data?filename=singapore_region.geojson')
      .then((response) => response.json())
      .then((geo) => {
        // Validate the GeoJSON structure
        if (!geo || !geo.features) {
          console.error('Invalid GeoJSON data:', geo);
          throw new Error('GeoJSON data is invalid');
        }
        return geo;
      })
      .catch((error) => {
        console.error('Error fetching GeoJSON:', error);
      });

    // Fetch customer data CSV from backend
    const customerDataPromise = fetch('http://localhost:5000/csv/data?filename=customer_transaction_new.csv')
      .then((response) => response.json())
      .then((data) => {
        // Parse the CSV data
        const parsedData = d3.csvParse(data.data, (d: any) => ({
          customer_id: d.customer_id.trim(),
          district: d.district.trim(),
        }));

        // Create a map to store unique customer counts per district
        const districtCounts = d3.rollups(
          parsedData,
          // Calculate the number of unique customers per district
          (v) => new Set(v.map((d) => d.customer_id)).size,
          (d) => d.district
        );

        // Convert the district counts to an array of objects
        const districtCountsArray = districtCounts.map(([district, count]) => ({
          district,
          count,
        }));

        return districtCountsArray;
      });

    Promise.all([geoJSONPromise, customerDataPromise]).then(([geo, customers]) => {
      setGeoData(geo);
      setCustomerData(customers);
    });
  }, []); // Empty dependency array ensures the fetch only runs once

  useEffect(() => {
    if (geoData && customerData.length > 0) {
      drawMap(geoData, customerData); // Pass both geoData and customerData to drawMap
    }
  }, [geoData, customerData]);

  const drawMap = (singaporeGeoJSON: any, data: any[]) => {
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
      .range(d3.schemePurples[7]);

    // Append tooltip
    const tooltip = d3.select('#region-tooltip');
    if (tooltip.empty()) {
      d3.select('body')
        .append('div')
        .attr('id', 'region-tooltip');
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
      .attr('class', 'region')
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
      .on('mouseout', function () {
        d3.select(this).style('opacity', 1);

        d3.select('#region-tooltip').style('opacity', 0);
      });

    // Append legend
    const legend = svg.append('g')
      .attr('class', 'legend')
      .attr('transform', `translate(${width + 10}, ${margin.top})`);

    const legendValues = colorScale.domain();

    // Add legend items
    legend.selectAll('rect')
      .data(legendValues)
      .enter()
      .append('rect')
      .attr('x', 0)
      .attr('y', (d, i) => i * 25)  // Spacing between legend items
      .attr('width', 20)
      .attr('height', 20)
      .attr('fill', d => colorScale(d));

    // Add legend labels
    legend.selectAll('text')
      .data(legendValues)
      .enter()
      .append('text')
      .attr('x', 30)  // Position text next to the legend color box
      .attr('y', (d, i) => i * 25 + 15)  // Align text vertically with color box
      .text(d => `≥ ${d}`)
      .style('font-size', '10px');
  };

  return (
    <Card sx={sx}>
      <CardHeader title="Customer Locations in Singapore" />
      <CardContent>
        <svg id="map"></svg>
      </CardContent>
    </Card>
  );
}