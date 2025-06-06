import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import SidebarLayout from './SidebarLayout';
import { useRoute } from '@react-navigation/native';
import { useState } from 'react';

export default function HardwareAssembly() {
  const route = useRoute();
  const user = route.params?.user;

  const assemblySteps = [
    { step: 'Step 1', image: null, title: 'Prepare Your Workspace', description: 'Clear a clean, static-free surface to work on. Gather your tools, especially a Phillips-head screwdriver.' },
    { step: 'Step 2', image: require('../../assets/assembly/MOBO.png'), title: 'Install the CPU', description: 'Open the CPU socket on the motherboard, align the CPU correctly, and gently place it in. Close the socket latch.' },
    { step: 'Step 3', image: require('../../assets/assembly/RAM.png'), title: 'Insert the RAM', description: 'Align the notches and press the RAM sticks into the DIMM slots until they click into place.' },
    { step: 'Step 4', image: require('../../assets/assembly/CPU_FAN.png'), title: 'Attach the CPU Cooler', description: 'Place the stock or aftermarket cooler on the CPU and secure it. Connect the cooler’s fan cable to the CPU_FAN header.' },
    { step: 'Step 5', image: require('../../assets/assembly/M2.png'), title: 'Install Storage Devices', description: 'Mount SSDs or HDDs in the appropriate bays or M.2 slots. Secure them with screws if needed and connect data/power cables.' },
    { step: 'Step 6', image: null, title: 'Install the Motherboard', description: 'Place the I/O shield in the case, then align the motherboard with standoffs and screw it in.' },
    { step: 'Step 7', image: null, title: 'Mount the Power Supply', description: 'Insert the PSU into the case (usually bottom-rear), secure it, and route the necessary power cables.' },
    { step: 'Step 8', image: require('../../assets/assembly/GPU.png'), title: 'Install the GPU', description: 'Insert the graphics card into the top PCIe slot, secure it with screws, and connect any required PCIe power cables.' },
    { step: 'Step 9', image: null, title: 'Connect All Cables', description: 'Connect front panel, power, USB, audio, SATA, and power cables as needed. Refer to the motherboard manual.' },
    { step: 'Step 10', image: null, title: 'Boot and Test', description: 'Connect to a monitor and keyboard. Power on and enter BIOS to check component detection and temperatures.' },
  ];

  const [currentStep, setCurrentStep] = useState(0);
  const step = assemblySteps[currentStep];

  const goNext = () => {
    if (currentStep < assemblySteps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const goBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <SidebarLayout activeTab="Hardware Assembly" user={user}>
      <View style={styles.container}>
        <Text style={styles.header}>Hardware Assembly Guide</Text>
        <View style={styles.divider} />

        <View style={styles.stepContainer}>
          <Image source={step.image} style={styles.image} />
          <Text style={styles.stepNumber}>{step.step}</Text>
          <Text style={styles.stepTitle}>{step.title}</Text>
          <Text style={styles.stepDescription}>{step.description}</Text>
        </View>

        <View style={styles.navigation}>
          <TouchableOpacity
            style={[styles.navButton, currentStep === 0 && styles.disabledButton]}
            onPress={goBack}
            disabled={currentStep === 0}
          >
            <Text style={styles.navButtonText}>Back</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.navButton, currentStep === assemblySteps.length - 1 && styles.disabledButton]}
            onPress={goNext}
            disabled={currentStep === assemblySteps.length - 1}
          >
            <Text style={styles.navButtonText}>Next</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SidebarLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    justifyContent: 'space-between',
  },
  header: {
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 12,
  },
  divider: {
    height: 1,
    backgroundColor: '#000',
    marginVertical: 12,
    width: '100%',
  },
  image: {
    width: 300,
    height: 300,
  },
  stepContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepNumber: {
    fontSize: 20,
    color: '#666',
    marginBottom: 8,
  },
  stepTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
    color: '#333',
  },
  stepDescription: {
    fontSize: 18,
    textAlign: 'center',
    color: '#555',
  },
  navigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  navButton: {
    backgroundColor: '#333',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  navButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  disabledButton: {
    backgroundColor: '#999',
  },
});
