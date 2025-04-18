import React, { useState } from 'react';
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
} from '@mui/material';
import {
  Search as SearchIcon,
  LinkedIn as LinkedInIcon,
  GitHub as GitHubIcon,
  Twitter as TwitterIcon,
  Business as BusinessIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Language as LanguageIcon,
  Work as WorkIcon,
  Close as CloseIcon,
  LocationOn as LocationIcon,
  Visibility as VisibilityIcon,
  Public as PublicIcon,
  Assignment as AssignmentIcon
} from '@mui/icons-material';
import { PieChart } from 'react-minimal-pie-chart';

// Export function to delete
export const performOSINTLookup = async (studentEmail) => {
  if (!studentEmail) {
    return { error: 'No email provided for OSINT lookup' };
  }

  try {
    // Try actual API call
    try {
      const response = await fetch(`/api/osint/enrichment?email=${encodeURIComponent(studentEmail)}`);
      
      if (response.ok) {
        const data = await response.json();
        return data;
      }
    } catch (err) {
      console.warn('API call failed:', err);
    }
    
    // For backward compatibility - return stub data
    const [username, domain] = studentEmail.split('@');
    const name = username.replace(/[._-]/g, ' ').split(' ').map(
      word => word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
    
    return {
      success: true,
      email: studentEmail,
      data: {
        full_name: name,
        first_name: name.split(' ')[0],
        last_name: name.split(' ').length > 1 ? name.split(' ')[1] : '',
        email: studentEmail,
        linkedin_url: `https://linkedin.com/in/${username}`,
        github_url: `https://github.com/${username}`,
        twitter_url: `https://twitter.com/${username}`,
        work: [
          {
            company: {
              name: domain.split('.')[0].charAt(0).toUpperCase() + domain.split('.')[0].slice(1),
              size: '51-200',
              industry: 'Technology'
            },
            title: 'Student',
            start_date: '2021-01',
            end_date: null,
            is_current: true
          }
        ],
        education: [
          {
            school: {
              name: 'University',
              type: 'college'
            },
            degree: 'Bachelor\'s Degree',
            start_date: '2021-09',
            end_date: '2025-05',
            is_current: true
          }
        ],
        location: {
          name: 'Mumbai, Maharashtra, India',
          country: 'in',
          region: 'Maharashtra',
          city: 'Mumbai'
        },
        skills: ['Engineering', 'Programming', 'Mathematics'],
        is_mock_data: true
      }
    };
  } catch (err) {
    return { error: err.message || 'Failed to perform OSINT lookup' };
  }
};

const OSINTDashboard = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [openEnrichmentDialog, setOpenEnrichmentDialog] = useState(false);
  const [enrichmentData, setEnrichmentData] = useState(null);
  const [enrichmentLoading, setEnrichmentLoading] = useState(false);
  const [enrichmentError, setEnrichmentError] = useState(null);

  const handleSearch = async () => {
    if (!email) {
      setError('Please enter an email address');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/osint/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to perform OSINT search');
      }

      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailEnrichment = async () => {
    if (!email) {
      setEnrichmentError('Please enter an email address');
      return;
    }

    setEnrichmentLoading(true);
    setEnrichmentError(null);
    setEnrichmentData(null);
    setOpenEnrichmentDialog(true);

    try {
      const response = await fetch(`/api/osint/enrichment?email=${encodeURIComponent(email)}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch enrichment data');
      }
      
      const data = await response.json();
      setEnrichmentData(data);
    } catch (error) {
      console.error('Enrichment fetch error:', error);
      setEnrichmentError(error.message || 'Failed to fetch enrichment data');
    } finally {
      setEnrichmentLoading(false);
    }
  };

  const renderOverviewTab = () => {
    if (!result) return null;

    const { professional_info } = result;
    const sources = professional_info.sources || [];

    return (
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Search Summary
            </Typography>
            <List>
              <ListItem>
                <ListItemIcon>
                  <EmailIcon />
                </ListItemIcon>
                <ListItemText 
                  primary="Email" 
                  secondary={result.email} 
                />
                <Button 
                  variant="contained" 
                  color="primary" 
                  size="small" 
                  startIcon={<VisibilityIcon />}
                  onClick={handleEmailEnrichment}
                  sx={{
                    bgcolor: 'rgb(20, 184, 166)',
                    '&:hover': {
                      bgcolor: 'rgb(17, 155, 140)',
                    }
                  }}
                >
                  OSINT
                </Button>
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <LanguageIcon />
                </ListItemIcon>
                <ListItemText 
                  primary="Domain" 
                  secondary={professional_info.domain} 
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <SearchIcon />
                </ListItemIcon>
                <ListItemText 
                  primary="Sources Found" 
                  secondary={
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      {sources.map((source) => (
                        <Chip 
                          key={source} 
                          label={source} 
                          size="small" 
                          color="primary" 
                          variant="outlined" 
                          sx={{ color: 'rgb(20, 184, 166)', borderColor: 'rgb(20, 184, 166)' }}
                        />
                      ))}
                    </Box>
                  } 
                />
              </ListItem>
            </List>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Data Sources
            </Typography>
            <Box sx={{ height: 250, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              {sources.length > 0 ? (
                <PieChart
                  data={sources.map((source, index) => ({
                    title: source,
                    value: 1,
                    color: index === 0 ? 'rgb(20, 184, 166)' : index === 1 ? 'rgb(6, 182, 212)' : `hsl(${index * 45}, 70%, 50%)`
                  }))}
                  lineWidth={40}
                  paddingAngle={2}
                  rounded
                  animate
                />
              ) : (
                <Typography color="text.secondary">No data sources available</Typography>
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    );
  };

  const renderProfessionalInfoTab = () => {
    if (!result?.professional_info?.linkedin) return null;

    const { linkedin } = result.professional_info;

    return (
      <Grid container spacing={3}>
        {linkedin.company_info && linkedin.company_info.length > 0 && (
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Company Information
              </Typography>
              <Grid container spacing={2}>
                {linkedin.company_info.map((company, index) => (
                  <Grid item xs={12} sm={6} md={4} key={index}>
                    <Card>
                      <CardHeader
                        avatar={<BusinessIcon />}
                        title={company.name || 'Unknown Company'}
                      />
                      <CardContent>
                        <List dense>
                          <ListItem>
                            <ListItemText 
                              primary="Industry" 
                              secondary={company.industry || 'N/A'} 
                            />
                          </ListItem>
                          <ListItem>
                            <ListItemText 
                              primary="Size" 
                              secondary={company.size || 'N/A'} 
                            />
                          </ListItem>
                          <ListItem>
                            <ListItemText 
                              primary="Location" 
                              secondary={company.location || 'N/A'} 
                            />
                          </ListItem>
                        </List>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Paper>
          </Grid>
        )}

        {linkedin.people_results && linkedin.people_results.length > 0 && (
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Related Profiles
              </Typography>
              <Grid container spacing={2}>
                {linkedin.people_results.map((person, index) => (
                  <Grid item xs={12} sm={6} md={4} key={index}>
                    <Card>
                      <CardHeader
                        avatar={<PersonIcon />}
                        title={person.name || 'Unknown Person'}
                      />
                      <CardContent>
                        <List dense>
                          <ListItem>
                            <ListItemText 
                              primary="Title" 
                              secondary={person.title || 'N/A'} 
                            />
                          </ListItem>
                          <ListItem>
                            <ListItemText 
                              primary="Company" 
                              secondary={person.company || 'N/A'} 
                            />
                          </ListItem>
                          <ListItem>
                            <ListItemText 
                              primary="Location" 
                              secondary={person.location || 'N/A'} 
                            />
                          </ListItem>
                        </List>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Paper>
          </Grid>
        )}
      </Grid>
    );
  };

  const renderSocialProfilesTab = () => {
    if (!result?.professional_info?.social_profiles) return null;

    const { social_profiles } = result.professional_info;

    return (
      <Grid container spacing={3}>
        {social_profiles.map((profile, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Card>
              <CardHeader
                avatar={
                  profile.platform.toLowerCase() === 'linkedin' ? <LinkedInIcon /> :
                  profile.platform.toLowerCase() === 'github' ? <GitHubIcon /> :
                  profile.platform.toLowerCase() === 'twitter' ? <TwitterIcon /> :
                  <PersonIcon />
                }
                title={profile.platform}
                subheader={`@${profile.username}`}
              />
              <CardContent>
                <Button
                  variant="outlined"
                  fullWidth
                  href={profile.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{
                    color: 'rgb(20, 184, 166)',
                    borderColor: 'rgb(20, 184, 166)',
                    '&:hover': {
                      borderColor: 'rgb(17, 155, 140)',
                    }
                  }}
                >
                  View Profile
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    );
  };

  const renderEnrichmentContent = () => {
    if (enrichmentLoading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress sx={{ color: 'rgb(20, 184, 166)' }} />
        </Box>
      );
    }

    if (enrichmentError) {
      return (
        <Alert severity="error" sx={{ m: 2 }}>
          {enrichmentError}
        </Alert>
      );
    }

    if (!enrichmentData) {
      return (
        <Typography sx={{ p: 2 }}>No data available</Typography>
      );
    }

    // Person data from API response
    const person = enrichmentData.data || enrichmentData;

    return (
      <>
        <Box sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Avatar sx={{ width: 60, height: 60, mr: 2, bgcolor: 'rgb(20, 184, 166)' }}>
              {person.first_name ? person.first_name.charAt(0) : email.charAt(0).toUpperCase()}
            </Avatar>
            <Box>
              <Typography variant="h6">
                {person.full_name || email.split('@')[0].replace(/[._-]/g, ' ')}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {email}
              </Typography>
              {person.location && person.location.name && (
                <Typography variant="body2" color="textSecondary" sx={{ display: 'flex', alignItems: 'center' }}>
                  <LocationIcon fontSize="small" sx={{ mr: 0.5 }} />
                  {person.location.name}
                </Typography>
              )}
            </Box>
          </Box>

          <Divider sx={{ my: 2 }} />
          
          {/* Work Experience */}
          {person.work && person.work.length > 0 && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
                <WorkIcon fontSize="small" sx={{ mr: 0.5, color: 'rgb(20, 184, 166)' }} />
                Professional Experience
              </Typography>
              <List dense disablePadding>
                {person.work.map((work, index) => (
                  <ListItem key={index} disablePadding sx={{ mb: 1 }}>
                    <ListItemIcon sx={{ minWidth: '40px' }}>
                      <BusinessIcon fontSize="small" sx={{ color: 'rgb(20, 184, 166)' }} />
                    </ListItemIcon>
                    <ListItemText
                      primary={`${work.title} at ${work.company.name}`}
                      secondary={`${work.start_date || 'Current'} ${work.is_current ? '- Present' : work.end_date ? `- ${work.end_date}` : ''}`}
                    />
                  </ListItem>
                ))}
              </List>
            </Box>
          )}

          {/* Social Profiles */}
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
              <PublicIcon fontSize="small" sx={{ mr: 0.5, color: 'rgb(20, 184, 166)' }} />
              Social Profiles
            </Typography>
            <Grid container spacing={1}>
              {person.linkedin_url && (
                <Grid item xs={6}>
                  <Chip
                    icon={<LinkedInIcon />}
                    label="LinkedIn"
                    component="a"
                    href={person.linkedin_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    clickable
                    sx={{ width: '100%' }}
                  />
                </Grid>
              )}
              {person.github_url && (
                <Grid item xs={6}>
                  <Chip
                    icon={<GitHubIcon />}
                    label="GitHub"
                    component="a"
                    href={person.github_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    clickable
                    sx={{ width: '100%' }}
                  />
                </Grid>
              )}
              {person.twitter_url && (
                <Grid item xs={6}>
                  <Chip
                    icon={<TwitterIcon />}
                    label="Twitter"
                    component="a"
                    href={person.twitter_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    clickable
                    sx={{ width: '100%' }}
                  />
                </Grid>
              )}
            </Grid>
          </Box>
          
          {/* Skills */}
          {person.skills && person.skills.length > 0 && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
                <AssignmentIcon fontSize="small" sx={{ mr: 0.5, color: 'rgb(20, 184, 166)' }} />
                Skills
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {person.skills.map((skill, index) => (
                  <Chip 
                    key={index} 
                    label={skill} 
                    size="small"
                    sx={{
                      bgcolor: 'rgba(20, 184, 166, 0.1)',
                      color: 'rgb(20, 184, 166)',
                      borderColor: 'rgb(20, 184, 166)',
                    }}
                  />
                ))}
              </Box>
            </Box>
          )}
        </Box>
      </>
    );
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper sx={{ p: { xs: 2, md: 3 }, mb: 4, borderRadius: 2 }}>
        <Typography variant="h5" component="h1" gutterBottom sx={{ mb: 3, color: 'rgb(20, 184, 166)' }}>
          OSINT Dashboard
        </Typography>
        
        <Tabs 
          value={activeTab} 
          onChange={(e, newValue) => setActiveTab(newValue)}
          variant={isMobile ? "scrollable" : "standard"}
          scrollButtons={isMobile ? "auto" : false}
          sx={{ 
            mb: 3,
            '.MuiTab-root': {
              minWidth: isMobile ? 'auto' : 140
            },
            '.Mui-selected': {
              color: 'rgb(20, 184, 166) !important'
            },
            '.MuiTabs-indicator': {
              backgroundColor: 'rgb(20, 184, 166)'
            }
          }}
        >
          <Tab label="Email Search" />
          {result && (
            <>
              <Tab label="Overview" />
              <Tab label="Professional Info" />
              <Tab label="Social Profiles" />
            </>
          )}
        </Tabs>
        
        {activeTab === 0 && (
          <Box>
            <Box sx={{ 
              display: 'flex', 
              flexDirection: { xs: 'column', sm: 'row' }, 
              gap: 1, 
              alignItems: { xs: 'stretch', sm: 'center' }, 
              mb: 3
            }}>
              <TextField
                label="Email Address"
                variant="outlined"
                fullWidth
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter email address to search"
                size="small"
                sx={{ flexGrow: 1 }}
              />
              <Button
                variant="contained"
                color="primary"
                onClick={handleSearch}
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} /> : <SearchIcon />}
                sx={{
                  bgcolor: 'rgb(20, 184, 166)',
                  '&:hover': {
                    bgcolor: 'rgb(17, 155, 140)',
                  },
                  whiteSpace: 'nowrap',
                  minWidth: { xs: '100%', sm: 'auto' }
                }}
              >
                Search
              </Button>
              <Button 
                variant="outlined" 
                color="secondary" 
                onClick={handleEmailEnrichment}
                startIcon={<VisibilityIcon />}
                disabled={loading}
                sx={{ 
                  ml: { xs: 0, sm: 1 },
                  color: 'rgb(20, 184, 166)',
                  borderColor: 'rgb(20, 184, 166)',
                  '&:hover': {
                    borderColor: 'rgb(17, 155, 140)',
                  },
                  whiteSpace: 'nowrap',
                  minWidth: { xs: '100%', sm: 'auto' }
                }}
              >
                OSINT
              </Button>
            </Box>

            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}
          </Box>
        )}
        
        {result && (
          <Box p={1}>
            {activeTab === 1 && renderOverviewTab()}
            {activeTab === 2 && renderProfessionalInfoTab()}
            {activeTab === 3 && renderSocialProfilesTab()}
          </Box>
        )}
      </Paper>
      
      {/* Enrichment Dialog */}
      <Dialog
        open={openEnrichmentDialog}
        onClose={() => setOpenEnrichmentDialog(false)}
        fullWidth
        maxWidth="md"
        sx={{
          '.MuiPaper-root': {
            borderRadius: 2
          }
        }}
      >
        <DialogTitle>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center' }}>
              <EmailIcon sx={{ mr: 1, color: 'rgb(20, 184, 166)' }} />
              Email Intelligence: {email}
            </Typography>
            <IconButton onClick={() => setOpenEnrichmentDialog(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          {renderEnrichmentContent()}
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setOpenEnrichmentDialog(false)}
            sx={{
              color: 'rgb(20, 184, 166)',
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default OSINTDashboard; 