/**
 * This script fixes Material UI imports in the OSINTDashboard.js file
 * by replacing the direct imports with re-exported components.
 */
const fs = require('fs');
const path = require('path');

console.log('🔄 Fixing Material UI imports...');

// First, let's create a helper file that re-exports MUI components
const muiHelperContent = `
// This file re-exports Material UI components to avoid import conflicts
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import CircularProgress from '@mui/material/CircularProgress';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Divider from '@mui/material/Divider';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';
import Chip from '@mui/material/Chip';
import Alert from '@mui/material/Alert';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Avatar from '@mui/material/Avatar';
import IconButton from '@mui/material/IconButton';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';

// Re-export all components
export {
  Box,
  Container,
  TextField,
  Button,
  Typography,
  Paper,
  Tabs,
  Tab,
  CircularProgress,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Avatar,
  IconButton,
  useMediaQuery,
  useTheme
};
`;

// Create the mui-components.js helper file
try {
  console.log('📝 Creating MUI helper file...');
  fs.writeFileSync(path.join(__dirname, 'components', 'mui-components.js'), muiHelperContent);
  console.log('✅ MUI helper file created successfully!');
} catch (error) {
  console.error('❌ Error creating MUI helper file:', error.message);
  process.exit(1);
}

// Now, let's modify the OSINTDashboard.js file to use our helper
try {
  const osintDashboardPath = path.join(__dirname, 'components', 'OSINTDashboard.js');
  console.log('🔄 Reading OSINTDashboard.js...');
  let content = fs.readFileSync(osintDashboardPath, 'utf8');
  
  // Replace individual imports with imports from our helper
  console.log('🔄 Replacing MUI imports...');
  const importRegex = /import ([\w]+) from '@mui\/material\/([\w]+)';/g;
  
  // Count individual import statements
  const importMatches = content.match(importRegex) || [];
  console.log(`🔍 Found ${importMatches.length} individual MUI imports to replace`);
  
  // Start of imports
  const startIndex = content.indexOf('import React');
  // Find the end of import section
  const endIndex = content.indexOf('// Export function') > 0 ? 
                   content.indexOf('// Export function') : 
                   content.indexOf('export const performOSINTLookup');
  
  if (startIndex >= 0 && endIndex > startIndex) {
    // Extract the import section
    const importSection = content.substring(startIndex, endIndex);
    
    // Extract icon imports separately (we'll keep these)
    const iconImportStart = importSection.indexOf('import {');
    const iconImportEnd = importSection.indexOf('} from \'@mui/icons-material\';');
    const iconImports = iconImportStart >= 0 && iconImportEnd > iconImportStart ? 
                        importSection.substring(iconImportStart, iconImportEnd + 30) : 
                        '';
    
    // Create new import section
    const newImportSection = `import React, { useState } from 'react';
import {
  Box,
  Container,
  TextField,
  Button,
  Typography,
  Paper,
  Tabs,
  Tab,
  CircularProgress,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Avatar,
  IconButton,
  useMediaQuery,
  useTheme
} from './mui-components';
${iconImports}
import { PieChart } from 'react-minimal-pie-chart';
`;
    
    // Replace the import section
    const newContent = content.substring(0, startIndex) + newImportSection + content.substring(endIndex);
    
    // Write the modified file
    console.log('📝 Writing modified OSINTDashboard.js...');
    fs.writeFileSync(osintDashboardPath, newContent);
    console.log('✅ OSINTDashboard.js modified successfully!');
  } else {
    console.error('❌ Could not identify import section in OSINTDashboard.js');
  }
} catch (error) {
  console.error('❌ Error modifying OSINTDashboard.js:', error.message);
  process.exit(1);
}

console.log('✅ MUI import fix complete!');
console.log('');
console.log('Next steps:');
console.log('1. Run `npm run dev` to verify the changes');
console.log('2. If you still see errors, run `npm run setup` to reinstall dependencies'); 