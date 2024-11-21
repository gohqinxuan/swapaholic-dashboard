'use client';

import * as React from 'react';
import * as d3 from 'd3';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import { Icon } from '@mui/material';
import { Select, MenuItem, FormControl, InputLabel, SelectChangeEvent } from '@mui/material';
import { Typography } from '@mui/material';
import type { SxProps } from '@mui/material/styles';
import { useEffect, useState } from 'react';
import { fontFamily } from '../../../styles/theme/typography';
import { Eye as EyeIcon } from '@phosphor-icons/react/dist/ssr/Eye';
import { Clock as ClockIcon } from '@phosphor-icons/react/dist/ssr/Clock';

export interface WebAnalysisProps {
  sx?: SxProps;
}
 
export function WebAnalysis({ sx }: WebAnalysisProps): React.JSX.Element {
  const [data, setData] = useState<any[]>([]);
  const [selectedCluster, setSelectedCluster] = useState<string | null>(null);

  useEffect(() => {
    // Fetch CSV data from the backend
    fetch('http://localhost:5000/csv/data?filename=avg_web_session_customer.csv')
      .then((response) => response.json()) 
      .then((data) => {
        // Parse the CSV string into an array of objects
        const parsedData = d3.csvParse(data.data); // 'data.data' assumes the backend sends CSV in the 'data' field of the response
        
        // Process the data to map it into the desired format
        const processedData = parsedData.map((d: any) => ({
          Cluster: d.Cluster,
          PageView: +d.page_view_count, // Ensure it's treated as a number
          SessionLength: +d.session_length_in_sec, // Ensure it's treated as a number
        }));

        setData(processedData);

        // Set the first cluster as the default selected cluster
        if (processedData.length > 0) {
          setSelectedCluster(processedData[0].Cluster);
        }
      })
      .catch((error) => {
        console.error('Error fetching CSV data:', error);
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
      <CardHeader title="Web Analysis"
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
        <ClusterWebTypography data={filteredData} />
      </CardContent>
    </Card>
  );
}

// Displaying clusters with all metrics
function ClusterWebTypography({ data }: { data: { Cluster: string; PageView: number; SessionLength: number }[] }) {
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
            <Icon color="primary" component={EyeIcon} sx={{mr: 1}}/>
            <Typography variant="body1" color="text.secondary">Pages Viewed</Typography>
            </Box>
            <Typography variant="h4" fontWeight="bold" color="primary" sx={{mb: 2}}>
                {item.PageView} 
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Icon color="primary" component={ClockIcon} sx={{mr: 1}}/>
            <Typography variant="body1" color="text.secondary">Time Spent</Typography>
            </Box>
            <Typography variant="h4" fontWeight="bold" color="primary">
                {item.SessionLength} seconds
            </Typography>
            </CardContent>
            </Card>
        );
      })}
    </Grid>
  );
}
