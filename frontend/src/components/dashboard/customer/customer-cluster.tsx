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
import { useEffect, useState } from 'react';
import { fontFamily } from '../../../styles/theme/typography';

export interface CustomerClusterProps {
  sx?: SxProps;
}
 
export function CustomerCluster({ sx }: CustomerClusterProps): React.JSX.Element {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    // Fetch the CSV data from the backend
    fetch('http://localhost:5000/csv/data?filename=customer_segmentation.csv')
      .then((response) => response.json()) 
      .then((data) => {
        // Parse the CSV string into an array of objects
        const parsedData = d3.csvParse(data.data);
        const clusterData = processClusterData(parsedData);
        setData(clusterData);
      })
      .catch((error) => {
        console.error('Error fetching CSV data:', error);
      });
  }, []);

  const processClusterData = (data: any[]) => {
    // Using d3.rollup to calculate count, average recency, frequency, and monetary values for each cluster
    const clusterMetrics = d3.rollup(
      data,
      (v) => {
        const count = v.length;
        const totalRecency = d3.sum(v, (d) => +d.Recency);
        const totalFrequency = d3.sum(v, (d) => +d.Frequency);
        const totalMonetary = d3.sum(v, (d) => +d.Monetary);

        return {
          count,
          avgRecency: totalRecency / count,
          avgFrequency: totalFrequency / count,
          avgMonetary: totalMonetary / count,
        };
      },
      (d) => d.Cluster
    );

    // Convert the result into an array
    return Array.from(clusterMetrics, ([Cluster, metrics]) => ({
      Cluster,
      count: metrics.count,
      avgRecency: metrics.avgRecency,
      avgFrequency: metrics.avgFrequency,
      avgMonetary: metrics.avgMonetary,
    }));
  };

  // Calculate total users for percentage calculation
  const totalUser = data.reduce((sum, d) => sum + d.count, 0);

  return (
    <Card sx={sx}>
      <CardHeader title="Customer Clusters"/>
      <CardContent sx={{pt: 1}}>
        <ClusterTypography data={data} totalUser={totalUser} />
      </CardContent>
    </Card>
  );
}

// Displaying clusters with all metrics
function ClusterTypography({ data, totalUser }: { data: { Cluster: string; count: number; avgRecency: number; avgFrequency: number; avgMonetary: number }[]; totalUser: number }) {
  // Define colors for each cluster
  const clusterColors: Record<string, string> = {
    'Loyal Customers': 'var(--mui-palette-primary-main)',
    'Casual Customers': 'var(--mui-palette-success-main)',
    'Lost Customers': 'var(--mui-palette-info-main)',
  };

  return (
    <Grid container spacing={2}>
      {data.map((item) => {
        const percentage = ((item.count / totalUser) * 100).toFixed(1);

        return (
          <Grid item xs={12} sm={4} key={item.Cluster}>
            <Card variant="outlined" sx={{ height: '100%'}}>
            <CardContent>
            <Typography variant="h5" fontWeight="bold" sx={{mb: 1, color: clusterColors[item.Cluster]}}>
              {item.Cluster}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {percentage}%
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Avg Recency: {item.avgRecency.toFixed(0)} days
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Avg Frequency: {item.avgFrequency.toFixed(0)} times
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Avg Monetary: ${item.avgMonetary.toFixed(2)}
            </Typography>
            </CardContent>
            </Card>
          </Grid>
        );
      })}
    </Grid>
  );
}
