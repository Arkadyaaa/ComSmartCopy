import React, { useState } from 'react';
import { Container, Typography, List, ListItem, ListItemButton, 
         ListItemIcon, ListItemText, Paper, Button } from '@mui/material';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import KeyboardBackspaceIcon from '@mui/icons-material/KeyboardBackspace';
import SidebarLayout from './SidebarLayout';
import { useRoute, useNavigation } from '@react-navigation/native';

const tutorials = {
  "Input Devices": {
    "Identify different input devices": [
      "1. Visual identification of keyboards, mice, and scanners",
      "2. Understanding specialized input devices",
      "3. Demonstration of touch input devices"
    ],
    "Explain the function of each input device": [
      "1. Keyboard: Text input and shortcut functions",
      "2. Mouse: Pointer control and click actions",
      "3. Scanner: Image digitization process"
    ],
    "Demonstrate proper connection": [
      "1. Wired connections: USB, PS/2 ports",
      "2. Wireless connections: Bluetooth pairing",
      "3. Driver installation procedures"
    ]
  },
  "Output Devices": {
    "Classify output devices": [
      "1. Display devices: Monitors, projectors",
      "2. Printers: Laser, inkjet, dot matrix",
      "3. Audio devices: Speakers, headphones"
    ],
    "Describe the characteristics": [
      "1. Resolution and refresh rates for displays",
      "2. Print quality measurements (DPI)",
      "3. Audio frequency response ranges"
    ],
    "Troubleshoot common issues": [
      "1. Display artifacts and solutions",
      "2. Printer paper jam procedures",
      "3. Audio distortion troubleshooting"
    ]
  },
  "Storage Devices": {
    "Compare different storage media": [
      "1. HDD vs SSD performance comparison",
      "2. Optical media types (CD/DVD/Blu-ray)",
      "3. Flash storage variants (USB, SD cards)"
    ],
    "Calculate storage requirements": [
      "1. Determining capacity needs",
      "2. RAID configuration calculations",
      "3. Backup storage planning"
    ],
    "Perform proper maintenance": [
      "1. Disk defragmentation procedures",
      "2. SSD trim operations",
      "3. Storage device cleaning"
    ]
  },
  "System Unit Components": {
    "Identify internal components": [
      "1. CPU identification and specifications",
      "2. RAM types and configurations",
      "3. Expansion card recognition"
    ],
    "Explain the function of each": [
      "1. CPU processing pipeline",
      "2. RAM volatility characteristics",
      "3. GPU rendering processes"
    ],
    "Demonstrate proper handling": [
      "1. Anti-static precautions",
      "2. Component installation sequences",
      "3. Thermal paste application"
    ]
  },
  "Motherboard and Ports": {
    "Recognize motherboard form factors": [
      "1. ATX vs microATX vs mini-ITX",
      "2. Proprietary form factors",
      "3. Chassis compatibility checks"
    ],
    "Identify various port types": [
      "1. USB generations and variants",
      "2. Video output port differences",
      "3. Legacy port identification"
    ],
    "Configure motherboard settings": [
      "1. BIOS/UEFI navigation",
      "2. Boot sequence configuration",
      "3. Hardware monitoring setup"
    ]
  },
  "Peripheral Devices": {
    "Classify peripheral devices": [
      "1. Input vs output vs I/O devices",
      "2. Wired vs wireless peripherals",
      "3. Specialized peripherals (medical, industrial)"
    ],
    "Install and configure": [
      "1. Plug-and-play installation",
      "2. Driver manual installation",
      "3. Peripheral-specific software"
    ],
    "Troubleshoot connectivity": [
      "1. Connection interface checks",
      "2. Power delivery issues",
      "3. Signal interference resolution"
    ]
  }
};

export default function ViewLessonScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const user = route.params?.user;
  const [currentTopic, setCurrentTopic] = useState(null);
  const [currentCompetency, setCurrentCompetency] = useState(null);

  const handleBack = () => {
    if (currentCompetency) {
      setCurrentCompetency(null);
    } else if (currentTopic) {
      setCurrentTopic(null);
    } else {
      navigation.goBack();
    }
  };

  return (
    <SidebarLayout activeTab="Learning Materials" user={user}>
      <Container sx={{ mt: 3, mb: 4 }}>
        {/* Back Button */}
        <Button 
          startIcon={<KeyboardBackspaceIcon />}
          onClick={handleBack}
          sx={{ mb: 2 }}
          variant="outlined"
        >
          {currentCompetency ? 'Back to Competencies' : 
           currentTopic ? 'Back to Topics' : 'Back to Materials'}
        </Button>

        {/* Main Content */}
        {!currentTopic ? (
          // Topic Selection View
          <>
            <Typography variant="h4" align="center" gutterBottom>
              CHAPTER 1: COMPUTER HARDWARE COMPONENTS
            </Typography>
            <Paper elevation={3}>
              <List>
                {Object.keys(tutorials).map((topic) => (
                  <ListItem key={topic} disablePadding>
                    <ListItemButton onClick={() => setCurrentTopic(topic)}>
                      <ListItemText primary={topic} />
                      <ListItemIcon>
                        <ArrowForwardIosIcon />
                      </ListItemIcon>
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
            </Paper>
          </>
        ) : !currentCompetency ? (
          // Competency Selection View
          <>
            <Typography variant="h5" gutterBottom>
              {currentTopic} Competencies
            </Typography>
            <Paper elevation={3}>
              <List>
                {Object.keys(tutorials[currentTopic]).map((competency) => (
                  <ListItem key={competency} disablePadding>
                    <ListItemButton onClick={() => setCurrentCompetency(competency)}>
                      <ListItemText primary={competency} />
                      <ListItemIcon>
                        <ArrowForwardIosIcon />
                      </ListItemIcon>
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
            </Paper>
          </>
        ) : (
          // Tutorial Content View
          <>
            <Typography variant="h5" gutterBottom>
              {currentCompetency}
            </Typography>
            <Paper elevation={3} sx={{ p: 2 }}>
              <List>
                {tutorials[currentTopic][currentCompetency].map((step, index) => (
                  <ListItem key={index}>
                    <ListItemText primary={step} />
                  </ListItem>
                ))}
              </List>
            </Paper>
          </>
        )}
      </Container>
    </SidebarLayout>
  );
}