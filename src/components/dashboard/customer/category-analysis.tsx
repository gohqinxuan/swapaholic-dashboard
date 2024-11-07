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
import { Select, MenuItem, FormControl, InputLabel, SelectChangeEvent } from '@mui/material';
import { Typography } from '@mui/material';
import Divider from '@mui/material/Divider';
import type { SxProps } from '@mui/material/styles';
import { useEffect, useState } from 'react';
import { Icon } from '@mui/material';
import { Box } from '@mui/material';
import { fontFamily } from '../../../styles/theme/typography';
import { ThumbsUp as ThumbsUpIcon } from '@phosphor-icons/react/dist/ssr/ThumbsUp';
import { ThumbsDown as ThumbsDownIcon } from '@phosphor-icons/react/dist/ssr/ThumbsDown'; 

export interface CategoryAnalysisProps {
  sx?: SxProps;
}
 
export function CategoryAnalysis({ sx }: CategoryAnalysisProps): React.JSX.Element {
  const [data, setData] = useState<any[]>([]);
  const [selectedCluster, setSelectedCluster] = useState<string | null>(null);

  useEffect(() => {
    // Load and parse the CSV file
    d3.csv('/datasets/customer_segmentation_most_least_category.csv').then((data) => {
        const processedData = data.map((d) => ({
            Cluster: d.Cluster,
            MostPopular: d.Most_Popular_Category,
            LeastPopular: d.Least_Popular_Category,
          }));
        setData(processedData);

        // Set the first cluster as the default selected cluster
      if (processedData.length > 0) {
        setSelectedCluster(processedData[0].Cluster);
      }
    });
  }, []);

  // Handler to set the selected cluster
  const handleClusterSelect = (event: SelectChangeEvent<string>) => {
    setSelectedCluster(event.target.value);
  };

  // Filtered data based on selected cluster
  const filteredData = selectedCluster ? data.filter(item => item.Cluster === selectedCluster) : data;

  return (
    <Card sx={sx}>
      <CardHeader title="Category Analysis"
      action={
        <FormControl variant="outlined" sx={{ minWidth: 120 }}>
          <InputLabel id="cluster-select-label">Select Cluster</InputLabel>
          <Select
            labelId="cluster-select-label"
            value={selectedCluster || ""}
            onChange={handleClusterSelect}
            label="Select Cluster"
          >
            {Array.from(new Set(data.map(item => item.Cluster))).map(cluster => (
              <MenuItem key={cluster} value={cluster}>
                {cluster}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      }
      />
      <CardContent sx={{pt: 1}}>
        <ClusterCatTypography data={filteredData} />
      </CardContent>
    </Card>
  );
}

// Displaying clusters with all metrics
function ClusterCatTypography({ data }: { data: { Cluster: string; MostPopular: string; LeastPopular: string }[] }) {
  return (
    <Grid>
      {data.map((item) => {
        return (
            <Card sx={{ height: '100%'}}>
            <CardContent>
            <Typography variant="body1" fontWeight="bold" color="text.secondary" sx={{mb: 2}}>
                {item.Cluster}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Icon color="primary" component={ThumbsUpIcon} sx={{mr: 1}}/>
            <Typography variant="h6" color="text.secondary">
                Most Popular Category
            </Typography>
            </Box>
            <Typography variant="h4" fontWeight="bold" color="primary" sx={{mb: 2}}>
                {item.MostPopular}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Icon color="primary" component={ThumbsDownIcon} sx={{mr: 1}}/>
            <Typography variant="h6" color="text.secondary">
                Least Popular Category
            </Typography>
            </Box>
            <Typography variant="h4" fontWeight="bold" color="primary">
                {item.LeastPopular}
            </Typography>
            </CardContent>
            </Card>
        );
      })}
    </Grid>
  );
}
