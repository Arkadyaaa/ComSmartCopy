import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, Modal, Button, FlatList, TextInput, Picker, Switch } from 'react-native';
import { useState, useEffect } from 'react';
import SidebarLayout from './SidebarLayout';
import { useRoute, useNavigation } from '@react-navigation/native';
import Gauge from '../components/CircularGauge';
import PartPickerModal from '../components/PartPickerModal';
import HoverableOpacity from '../components/HoverableOpacity';
import CustomDivider from '../components/CustomDivider';
import { getAllParts } from '../../services/apiRecords';
import { Sparkles, Trash2, Download, Save, Settings2, Target, Cpu, Gamepad2, Briefcase, Monitor, } from 'lucide-react';
import { LinearGradient } from 'expo-linear-gradient';
import GradientText from '../components/GradientText';
import { recommendBuild } from '../../services/pcRecommendationAlgorithm';
import { partImages } from '../components/PartImages.js';

export default function PCRecommendationScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const user = route.params?.user;

  // Font
  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;600;700&family=Inter:wght@300;400;500;600;700&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);

    return () => {
      document.head.removeChild(link); // clean up
    };
  }, []);

  const useCaseOptions = [
    { label: 'Gaming', value: 'gaming', icon: Gamepad2 },
    { label: 'Productivity', value: 'productivity', icon: Briefcase },
    { label: 'General Use', value: 'general_use', icon: Monitor },
  ];

  const getEmptyComponents = (groupedOptions) =>
    Object.keys(partImages).map((label) => ({
      label,
      value: '',
      price: 0,
      image: partImages[label],
      options: groupedOptions?.[label] || [],
    }));

  const [partOptions, setPartOptions] = useState({});
  const [recommendedComponents, setRecommendedComponents] = useState([]);
  const [components, setComponents] = useState(() => getEmptyComponents({}));

  useEffect(() => {
    async function fetchParts() {
      try {
        const grouped = await getAllParts();
        setPartOptions(grouped);

        const recommended = Object.entries(grouped).map(([label, options]) => {
          const first = options[0];
          return {
            label,
            value: first?.value || '',
            price: first?.price || 0,
            image: partImages[label],
            socket: first?.socket,
            microarchitecture: first?.microarchitecture,
            wattage: first?.wattage,
            benchmark: first?.benchmark,
            supported_socket: first?.supported_socket,
          };
        });

        setRecommendedComponents(recommended);
        setComponents(getEmptyComponents(grouped));
      } catch (err) {
        console.error(err);
        alert("Failed to load PC parts.");
      }
    }

    fetchParts();
  }, []);
  
  const formatPrice = (num) => {
    const rounded = Math.round(num);
    const formattedNumber = rounded.toLocaleString();
    return `₱${formattedNumber}`;
  };
  
  const totalPrice = components.reduce((sum, comp) => sum + (comp.price || 0), 0);

  const psuComponent = components.find((comp) => comp.label === 'PSU');
  const psuWatts = psuComponent?.wattage || 0;

  const gpuComponent = components.find((comp) => comp.label === 'GPU');
  const benchmarkScore = gpuComponent?.benchmark || 0;

  const [userBudget, setUserBudget] = useState('');
  const [tempBudget, setTempBudget] = useState(userBudget);
  const budget = userBudget ? parseInt(userBudget) : 0;
  
  const [userBenchmark, setUserBenchmark] = useState('');
  const [tempBenchmark, setTempBenchmark] = useState(userBenchmark);
  const benchmarkMax = userBenchmark ? parseInt(userBenchmark) || 0 : 10000;
  
  const [powerUsage, setPowerUsage] = useState(0);
  useEffect(() => {
  const totalPower = components.reduce((sum, comp) => {
    if (comp.label === 'GPU' && comp.tdp) return sum + parseInt(comp.tdp);
    //if (comp.label === 'CPU' && comp.wattage) return sum + parseInt(comp.wattage);
    //if (comp.label === 'FAN' && comp.wattage) return sum + parseInt(comp.wattage);
    //if (comp.label === 'STORAGE' && comp.wattage) return sum + parseInt(comp.wattage);
    return sum;
  }, 0);

  setPowerUsage(totalPower);
}, [components]);

  const gauges = [
    {
      label: 'Budget',
      value: totalPrice,
      limit: budget,
      max: Math.round(budget + (budget * 0.25)),
      isPrice: true,
    },
    {
      label: 'Benchmark Score',
      value: benchmarkScore,
      limit: benchmarkMax,
      max: Math.round(benchmarkMax * 2),
      invertColor: true,
      isBenchmark: true,
    },
    {
      label: 'Power Usage',
      value: powerUsage,
      limit: Math.round(psuWatts * 0.8),
      max: psuWatts,
      displayMax: true,
    },
  ];

  const [selectedPart, setSelectedPart] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  const handlePartPress = (item) => {
    setSelectedPart(item);
    setModalVisible(true);
  };

  const handleClearButton = () => {
    setComponents(getEmptyComponents(partOptions));
    setIncompatibleParts([]);
  };

  const handleSaveButton = () => {
    const hasEmptyParts = components.some((comp) => !comp.value);

    if (hasEmptyParts) {
      setWarningModalVisible(true);
    } else {
      setConfirmModalVisible(true);
    }
  };

  const handleLoadButton = () => {
    alert("No Builds Saved");
  };

  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [warningModalVisible, setWarningModalVisible] = useState(false);
  const [useCaseWarningVisible, setUseCaseWarningVisible] = useState(false);
  const [budgetWarningVisible, setBudgetWarningVisible] = useState(false);

  const handlePartSelect = (selectedPartLabel, selectedOption) => {
    const updatedComponents = components.map(comp => {
      if (comp.label === selectedPartLabel) {
        const updated = {
          ...comp,
          value: selectedOption.value,
          price: selectedOption.price,
        };
      
        if (selectedPartLabel === "PSU") {
          updated.wattage = selectedOption.wattage;
        }

        if (selectedPartLabel === "GPU"){
          updated.benchmark = selectedOption.benchmark;
          updated.tdp = selectedOption.tdp;
        }

      if (selectedPartLabel === "CPU") {
        updated.microarchitecture = selectedOption.microarchitecture;
      }

      if (selectedPartLabel === "MOTHERBOARD") {
        updated.socket = selectedOption.socket;
      }
      
      if (selectedPartLabel === "FAN") {
        updated.supported_socket = selectedOption.supported_socket;
      }

        return updated;
      }
      return comp;
    });

    setComponents(updatedComponents);
    setIncompatibleParts(checkCompatibility(updatedComponents));
  };

  const checkCompatibility = (components) => {
    const cpu = components.find(c => c.label === 'CPU');
    const mobo = components.find(c => c.label === 'MOTHERBOARD');
    const psu = components.find(c => c.label === 'PSU');
    const fan = components.find(c => c.label === 'FAN');

    const incompatible = [];

    if (cpu?.microarchitecture && mobo?.socket && cpu.microarchitecture !== mobo.socket) {
      incompatible.push('CPU', 'MOTHERBOARD');
    }

    if (psu?.wattage && Math.round(psu.wattage * 0.8) < powerUsage) {
      incompatible.push('PSU');
    }

    if (cpu?.microarchitecture && fan?.supported_socket) {
      const supportedSockets = fan.supported_socket
        .split(',')
        .map(s => s.trim().toUpperCase());

      if (!supportedSockets.includes(cpu.microarchitecture.toUpperCase())) {
        incompatible.push('FAN');
      }
    }

    return incompatible;
  };
  
  const [preferenceModalVisible, setPreferenceModalVisible] = useState(false);
  const [budgetModalVisible, setBudgetModalVisible] = useState(false);
  const [benchmarkModalVisible, setBenchmarkModalVisible] = useState(false);
  const [useCase, setUseCase] = useState('');
  const [advanced, setAdvanced] = useState(false);
  const [maxPowerPref, setMaxPowerPref] = useState('');
  const [incompatibleParts, setIncompatibleParts] = useState([]);

  useEffect(() => {
    setIncompatibleParts(checkCompatibility(components));
  }, [components, powerUsage]);

  const handleRecommendButton = () => {
    setPreferenceModalVisible(true);
  };

  const handleBudgetButton = () => {
    setBudgetModalVisible(true);
  };

  const handleBenchmarkButton = () => {
    setBenchmarkModalVisible(true);
  };

  const getPreferenceValues = (useCase) => {
    switch (useCase) {
      case 'gaming':
        return { benchmark: 15000 };
      case 'productivity':
        return { benchmark: 15000 };
      case 'general_use':
        return { benchmark: 10000 };
      default:
        return { benchmark: 10000 };
    }
  };


  return (

    <SidebarLayout activeTab="PC Recommendation" user={user}>
        
      <View style={styles.topBar}>
        {/* Left side */}
        <View style={styles.topBarLeft}>
          <View style={styles.iconWrapper}>
            <Cpu size={24} color="#3B82F6" />
          </View>
          <GradientText text="PC Recommendation" style={styles.header} gradient={GRADIENTS.accent}/>
        </View>

        {/* Right side */}
        <Text style={styles.subHeader}>Build your dream machine</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        
        <View style={styles.grid}>
          <HoverableOpacity 
            onPress={handleRecommendButton} 
            outerStyle={[styles.buttonsCard]}
            hoverStyle={styles.recommendButtonHover}
            {...GRADIENTS.accent}
          >
            <LinearGradient
              colors={GRADIENTS.accent.colors}
              start={GRADIENTS.accent.start}
              end={GRADIENTS.accent.end}
              style={[StyleSheet.absoluteFill, { borderRadius: 14 }]}
            />
  
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <Sparkles style={styles.buttonIcon} />
              <Text style={styles.buttonText}>Recommend</Text>
            </View>
          </HoverableOpacity  >

          <HoverableOpacity 
            onPress={handleClearButton} 
            outerStyle={[styles.buttonsCard, styles.clearButton]}
            hoverStyle={styles.clearButtonHover}
          >
            <Trash2 style={styles.buttonIcon}/>
            <Text style={styles.buttonText}>Clear</Text>
          </HoverableOpacity>

          <HoverableOpacity 
            onPress={handleLoadButton} 
            outerStyle={[styles.buttonsCard, styles.loadButton]}
            hoverStyle={styles.loadButtonHover}
          >
            <Download style={styles.buttonIcon}/>
            <Text style={styles.buttonText}>Load Build</Text>
          </HoverableOpacity>

          <HoverableOpacity 
            onPress={handleSaveButton} 
            outerStyle={[styles.buttonsCard, styles.saveButton]}
            hoverStyle={styles.saveButtonHover}
          >
            <Save style={styles.buttonIcon}/>
            <Text style={styles.buttonText}>Save Build</Text>
          </HoverableOpacity>
        </View>

        <View style={styles.grid}>
          {components.map((item, index) => {
            const isFilled = !!item.value;
            const isIncompatible = incompatibleParts.includes(item.label);

            return(
              <HoverableOpacity
                outerStyle={[
                  styles.partsCard,
                  isFilled && styles.partsCardFilled,
                  isIncompatible && styles.partsCardIncompatible,
                ]}
                hoverStyle={isIncompatible ? styles.partsCardHoverIncompatible : styles.partsCardHover}
                key={index}
                style={styles.partsCard}
                onPress={() => handlePartPress(item)}
                onHoverIn={() => isIncompatible && setHoveredPart(item.label)}
                onHoverOut={() => isIncompatible && setHoveredPart(null)}
                activeOpacity={0.8}
              >
                {(hover) => (
                  <>
                    <Text style={styles.label}>{item.label}</Text>
                    <Image
                      source={
                        isIncompatible
                          ? item.image.incompatible
                          : item.value
                            ? item.image.selected
                            : item.image.empty
                      }
                      style={styles.image}
                    />
                    <Text style={styles.value}>{item.value}</Text>
                    <Text style={[ item.value ? styles.label : styles.pricePlaceholder ]}>
                      {item.value ? formatPrice(item.price) : 'Click to select'}
                    </Text>

                    {/* --- Tooltip --- */}
                    {isIncompatible && hover && (
                      <View style={styles.tooltip}>
                        <Text style={styles.tooltipText}>
                          {{
                            PSU: 'PSU wattage is insufficient for selected components',
                            MOTHERBOARD: 'Motherboard socket does not match CPU',
                            CPU: 'CPU is not compatible with Motherboard',
                            FAN: 'Fan does not support selected CPU socket',
                          }[item.label] || 'Incompatible with selected components'}
                        </Text>
                      </View>
                    )}
                  </>
                )}
              </HoverableOpacity>
            );
          })}
        </View>

        <View style={styles.totalPriceContainer}>
          <Text style={styles.totalPriceText}>Total Build Cost</Text>
          <GradientText text={formatPrice(gauges[0].value)} style={styles.totalPrice} gradient={GRADIENTS.accent}/>
        </View>
        
        <CustomDivider />
        
        <View style={styles.gaugeGrid}>
          {gauges.map((gauges, index) => (
            <View key={index} style={styles.gaugeCard}>
              <Text style={styles.gaugeLabel}>{gauges.label}</Text>
              <Gauge size={gauges.size} 
                  value={gauges.value} 
                  limit={gauges.limit} 
                  max={gauges.max} 
                  isPrice={gauges.isPrice} 
                  isBenchmark={gauges.isBenchmark} 
                  invertColor={gauges.invertColor}/>
            </View>
          ))}
        </View>
        
        <View style={styles.grid}>
          <HoverableOpacity 
            onPress={handleBudgetButton} 
            outerStyle={[styles.buttonsCard, styles.budgetButton]}
            hoverStyle={styles.budgetButtonHover}
          >
            <Settings2 style={styles.buttonIcon}/>
            <Text style={styles.buttonText}>Set Budget</Text>
          </HoverableOpacity>

          <HoverableOpacity 
            onPress={handleBenchmarkButton} 
            outerStyle={[styles.buttonsCard, styles.benchmarkButton]}
            hoverStyle={styles.benchmarkButtonHover}
          >
            <Target style={styles.buttonIcon}/>
            <Text style={styles.buttonText}>Set Benchmark Goal</Text>
          </HoverableOpacity>
        </View>
      </ScrollView>
    
      <PartPickerModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        selectedPart={selectedPart}
        partOptions={partOptions}
        onSelect={handlePartSelect}
        components={components}
        setComponents={setComponents}
        formatPrice={formatPrice}
      />

      {/* SAVE BUILD */}
      <Modal
        transparent={true}
        visible={confirmModalVisible}
        animationType="fade"
        onRequestClose={() => setConfirmModalVisible(false)}
      >
        <View style={styles.confirmModal}>
          <View style={styles.confirmModalContent}>
            <Text style={styles.confirmModalTitle}>Proceed to Hardware Assembly?</Text>
            <Text style={styles.confirmModalText}>
              Your build has been saved. Do you want to continue to the next step?
            </Text>

            <View style={styles.confirmModalButtonContainer}>
              <HoverableOpacity
                onPress={() => setConfirmModalVisible(false)}
                outerStyle={styles.confirmModalCancelButton}
                hoverStyle={styles.confirmModalCancelButtonHover}
              >
                <Text style={styles.confirmModalCancelText}>Cancel</Text>
              </HoverableOpacity>

              <HoverableOpacity
                onPress={() => {
                  setConfirmModalVisible(false);
                  navigation.navigate('HardwareAssembly', { user });
                }}
                outerStyle={styles.confirmModalProceedButton}
                hoverStyle={styles.confirmModalProceedButtonHover}
              >
                <Text style={styles.confirmModalButtonText}>Proceed</Text>
              </HoverableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      
      {/* NO COMPONENTS SELECTED */}
      <Modal
        transparent={true}
        visible={warningModalVisible}
        animationType="fade"
        onRequestClose={() => setWarningModalVisible(false)}
      >
        <View style={styles.confirmModal}>
          <View style={styles.confirmModalContent}>
            <Text style={styles.confirmModalTitle}>Cannot Save Build</Text>
            <Text style={styles.confirmModalText}>
              Please select all components before saving the build.
            </Text>
            <HoverableOpacity
              onPress={() => setWarningModalVisible(false)}
              outerStyle={styles.confirmModalCancelButton}
              hoverStyle={styles.confirmModalCancelButtonHover}
            >
              <Text style={styles.confirmModalCancelText}>Close</Text>
            </HoverableOpacity>
          </View>
        </View>
      </Modal>

      {/* SET BUDGET */}
      <Modal
        transparent={true}
        visible={budgetModalVisible}
        animationType="fade"
        onRequestClose={() => setBudgetModalVisible(false)}
      >
        <View style={styles.preferenceModal}>
          <View style={styles.preferenceModalContent}>
            {/* Close Button */}
            <TouchableOpacity
              onPress={() => {
                setTempBudget(userBudget);
                setBudgetModalVisible(false);
              }}
              style={styles.modalCloseButton}
            >
              <Text style={styles.modalCloseText}>✕</Text>
            </TouchableOpacity>

            <View>
              <Text style={styles.preferenceModalTitle}>Set Budget</Text>

              <Text style={styles.preferenceModalLabel}>Budget (₱)</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                placeholder="Enter budget"
                placeholderTextColor="#9CA3AF"
                value={tempBudget}
                onChangeText={(text) => {
                  // Remove any non-digit characters
                  const numericText = text.replace(/[^0-9]/g, '');
                  setTempBudget(numericText);
                }}
              />
            </View>

            <View style={styles.confirmModalButtonContainer}>
              <HoverableOpacity
                onPress={() => {
                  setTempBudget(userBudget);
                  setBudgetModalVisible(false);
                }}
                outerStyle={styles.confirmModalCancelButton}
                hoverStyle={styles.confirmModalCancelButtonHover}
              >
                <Text style={styles.confirmModalCancelText}>Cancel</Text>
              </HoverableOpacity>

              <HoverableOpacity
                onPress={() => {
                  setUserBudget(tempBudget);
                  setBudgetModalVisible(false);
                }}
                outerStyle={styles.confirmModalProceedButton}
                hoverStyle={styles.confirmModalProceedButtonHover}
              >
                <Text style={styles.confirmModalButtonText}>Confirm</Text>
              </HoverableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* SET BENCHMARK GOAL */}
      <Modal
        transparent={true}
        visible={benchmarkModalVisible}
        animationType="fade"
        onRequestClose={() => setBenchmarkModalVisible(false)}
      >
        <View style={styles.preferenceModal}>
          <View style={styles.preferenceModalContent}>
            {/* Close Button */}
            <TouchableOpacity
              onPress={() => {
                setTempBenchmark(userBenchmark);
                setBenchmarkModalVisible(false);
              }}
              style={styles.modalCloseButton}
            >
              <Text style={styles.modalCloseText}>✕</Text>
            </TouchableOpacity>

            <View>
              <Text style={styles.preferenceModalTitle}>Set Benchmark Goal</Text>

              <Text style={styles.preferenceModalLabel}>Benchmark Goal</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                placeholder="Enter target benchmark"
                placeholderTextColor="#9CA3AF"
                value={tempBenchmark}
                onChangeText={(text) => {
                  // Remove any non-digit characters
                  const numericText = text.replace(/[^0-9]/g, '');
                  setTempBenchmark(numericText);
                }}
              />
            </View>

            <View style={styles.confirmModalButtonContainer}>
              <HoverableOpacity
                onPress={() => {
                  setTempBenchmark(userBenchmark);
                  setBenchmarkModalVisible(false);
                }}
                outerStyle={styles.confirmModalCancelButton}
                hoverStyle={styles.confirmModalCancelButtonHover}
              >
                <Text style={styles.confirmModalCancelText}>Cancel</Text>
              </HoverableOpacity>

              <HoverableOpacity
                onPress={() => {
                  setUserBenchmark(tempBenchmark)
                  setBenchmarkModalVisible(false);
                }}
                outerStyle={styles.confirmModalProceedButton}
                hoverStyle={styles.confirmModalProceedButtonHover}
              >
                <Text style={styles.confirmModalButtonText}>Confirm</Text>
              </HoverableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* USER PREFERENCE */}
      <Modal
        transparent={true}
        visible={preferenceModalVisible}
        animationType="fade"
        onRequestClose={() => setPreferenceModalVisible(false)}
      >
        <View style={styles.preferenceModal}>
          <View style={styles.preferenceModalContent}>
            {/* Close Button */}
            <TouchableOpacity
              onPress={() => {
                setTempBudget(userBudget);
                setPreferenceModalVisible(false);
              }}
              style={styles.modalCloseButton}
            >
              <Text style={styles.modalCloseText}>✕</Text>
            </TouchableOpacity>
            
            <View>
              <Text style={styles.preferenceModalTitle}>Build Preferences</Text>
              <Text style={styles.preferenceModalSubtitle}>Tell us about your ideal build and we'll recommend the best parts.</Text>
            </View>

            <View>
              <Text style={styles.preferenceModalLabel}>Budget (₱)</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                placeholder="Enter budget"
                placeholderTextColor="#9CA3AF"
                value={tempBudget}
                onChangeText={(text) => {
                  // Remove any non-digit characters
                  const numericText = text.replace(/[^0-9]/g, '');
                  setTempBudget(numericText);
                }}
              />
            </View>

            <View>
              <Text style={styles.preferenceModalLabel}>Use Case</Text>
              <View style={styles.preferenceButtonContainer}>
                {useCaseOptions.map((option) => {
                const IconComponent = option.icon;

                return (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.optionButton,
                      useCase === option.value && styles.optionButtonSelected
                    ]}
                    onPress={() => setUseCase(option.value)}
                  >
                    <IconComponent 
                      size={30} 
                      strokeWidth={1.5}
                      color={useCase === option.value ? COLORS.primary : COLORS.textPrimary} 
                      style={{ marginBottom: 4 }}
                    />
                    <Text
                      style={[
                        styles.optionButtonText
                      ]}
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
              </View>
            </View>

            <View style={styles.confirmModalButtonContainer}>
              <HoverableOpacity
                onPress={() => {
                  setTempBudget(userBudget);
                  setPreferenceModalVisible(false);
                }}
                outerStyle={styles.confirmModalCancelButton}
                hoverStyle={styles.confirmModalCancelButtonHover}
              >
                <Text style={styles.confirmModalCancelText}>Cancel</Text>
              </HoverableOpacity>

              <HoverableOpacity
                onPress={() => {
                  if (!tempBudget || 0 > tempBudget) {
                    setBudgetWarningVisible(true);
                    return;
                  }

                  if (!useCase) {
                    setUseCaseWarningVisible(true);
                    return;
                  }

                  const recommended = recommendBuild(partOptions, parseInt(tempBudget), useCase);
                  setComponents(recommended);

                  const { benchmark } = getPreferenceValues(useCase);
                  setUserBenchmark(benchmark.toString());
                  setUserBudget(tempBudget);

                  setTimeout(() => {
                    setIncompatibleParts(checkCompatibility(recommendedComponents));
                  }, 0);
                  setPreferenceModalVisible(false);
                }}
                outerStyle={styles.confirmModalProceedButton}
                hoverStyle={styles.confirmModalProceedButtonHover}
              >
                <Text style={styles.confirmModalButtonText}>Confirm</Text>
              </HoverableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        transparent={true}
        visible={useCaseWarningVisible}
        animationType="fade"
        onRequestClose={() => setUseCaseWarningVisible(false)}
      >
        <View style={styles.confirmModal}>
          <View style={styles.confirmModalContent}>
            <Text style={styles.confirmModalTitle}>No Use Case Selected</Text>
            <Text style={styles.confirmModalText}>
              Please select a use case before confirming.
            </Text>
            <HoverableOpacity
              onPress={() => setUseCaseWarningVisible(false)}
              outerStyle={styles.confirmModalCancelButtonFull}
              hoverStyle={styles.confirmModalCancelButtonHover}
            >
              <Text style={styles.confirmModalCancelText}>Close</Text>
            </HoverableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        transparent={true}
        visible={budgetWarningVisible}
        animationType="fade"
        onRequestClose={() => setBudgetWarningVisible(false)}
      >
        <View style={styles.confirmModal}>
          <View style={styles.confirmModalContent}>
            <Text style={styles.confirmModalTitle}>No Budget Set</Text>
            <Text style={styles.confirmModalText}>
              Please set a budget before confirming.
            </Text>
            <HoverableOpacity
              onPress={() => setBudgetWarningVisible(false)}
              outerStyle={styles.confirmModalCancelButtonFull}
              hoverStyle={styles.confirmModalCancelButtonHover}
            >
              <Text style={styles.confirmModalCancelText}>Close</Text>
            </HoverableOpacity>
          </View>
        </View>
      </Modal>
    </SidebarLayout>
  );
}

export const GRADIENTS = {
  accent: {
    colors: ['#3C83F6', '#22D3EE'],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },
};

const COLORS = {
  bg: '#F7F8FA',
  card: '#FFFFFF',
  textPrimary: '#1A1A1A',
  textSecondary: '#6B7280',
  primary: '#3B82F6',
  primaryTranslucent: '#3b83f61a',
  primaryHover: '#2563EB',
  primarySoft: '#DBEAFE',
  danger: '#EF4444',
  dangerHover: '#c02d2dff',
  dangerSoft: '#FEE2E2',
  success: '#22C55E',
  successHover: '#16a349ff',
  border: '#E5E7EB',
  borderHover: '#d6d9dd',
};

const SHADOW = {
  shadowColor: '#000',
  shadowOpacity: 0.06,
  shadowRadius: 12,
  shadowOffset: { width: 0, height: 6 },
  elevation: 3,
};

const styles = StyleSheet.create({
  scrollContainer: {
    padding: 24,
    backgroundColor: COLORS.bg,
  },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 16,
  },

  maskText: {
    backgroundColor: 'transparent',
  },

  transparentText: {
    opacity: 0,
  },

  /* ---------- TOP BAR ----------*/

  topBar: {
    height: 64,
    paddingHorizontal: 24,
    backgroundColor: '#FFFFFF',

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',

    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },

  topBarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },

  iconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  header: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.textPrimary,
    textAlign: 'center',
    fontFamily: 'Orbitron, sans-serif',
  },

  subHeader: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    justifyContent: 'center',
  },

  /* ---------- ACTION BUTTONS ---------- */

  buttonsCard: {
    backgroundColor: COLORS.card,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 20,
    minWidth: 210,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    ...SHADOW,
  },

  recommendButton: {
    backgroundColor: COLORS.primary,
  },

  recommendButtonHover: {
    backgroundColor: COLORS.primaryHover,
  },

  saveButton: {
    backgroundColor: COLORS.success,
  },

  saveButtonHover: {
    backgroundColor: COLORS.successHover,
  },

  clearButton: {
    backgroundColor: COLORS.danger,
  },

  clearButtonHover: {
    backgroundColor: COLORS.dangerHover,
  },

  loadButton: {
    backgroundColor: COLORS.primary,
  },

  loadButtonHover: {
    backgroundColor: COLORS.successHover,
  },

  budgetButton: {
    backgroundColor: COLORS.success,
  },

  budgetButtonHover: {
    backgroundColor: COLORS.successHover,
  },

  benchmarkButton: {
    backgroundColor: COLORS.success,
  },

  benchmarkButtonHover: {
    backgroundColor: COLORS.successHover,
  },

  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },

  buttonIcon: {
    fontSize: 16,
    fontWeight: '100',
    color: '#FFFFFF',
    strokeWidth: '1.5',
  },

  /* ---------- PART CARDS ---------- */

  partsCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    width: 170,
    minHeight: 220,
    alignItems: 'center',
    position: 'relative',
    ...SHADOW,
  },

  partsCardFilled: {
    borderBottomWidth: 4,
    borderBottomColor: COLORS.primary,
  },

  partsCardIncompatible: {
    borderBottomWidth: 4,
    borderBottomColor: COLORS.danger,
  },

  partsCardHover: {
    transform: [{ translateY: -2 }],
  },

  partsCardHoverIncompatible: {
    backgroundColor: COLORS.dangerSoft,
  },

  image: {
    width: 64,
    height: 64,
    marginVertical: 10,
  },

  label: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginTop: 10,
  },

  pricePlaceholder: {
    fontSize: 14,
    fontWeight: '400',
    color: COLORS.textSecondary,
    letterSpacing: 0.6,
    marginTop: 10,
    fontStyle: 'italic',
  },

  value: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginTop: 4,
  },

  /* ---------- TOTAL PRICE ---------- */

  totalPriceContainer: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 18,
    marginVertical: 24,
    width: 300,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    ...SHADOW,
  },

  totalPriceText: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },

  totalPrice: {
    fontSize: 32,
    fontWeight: '700',
    color: COLORS.textPrimary,
    fontFamily: "Orbitron, sans-serif",
  },

  /* ---------- GAUGES ---------- */

  gaugeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 16,
    marginTop: 12,
    marginBottom: 12,
  },

  gaugeCard: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    minWidth: 180,
    ...SHADOW,
  },

  gaugeLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: 8,
  },

  /* ---------- MODALS ---------- */

  confirmModal: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },

  confirmModalContent: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 24,
    width: 420,
    ...SHADOW,
  },

  confirmModalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: 8,
  },

  confirmModalText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 20,
  },

  confirmModalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginTop: 20,
  },

  confirmModalProceedButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    width: '50%',
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  confirmModalProceedButtonHover: {
    backgroundColor: COLORS.primaryHover,
  },

  confirmModalCancelButton: {
    backgroundColor: COLORS.border,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    width: '50%',
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  confirmModalCancelButtonHover: {
    backgroundColor: COLORS.borderHover,
  },

  confirmModalProceedButtonFull: {
    backgroundColor: COLORS.border,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    width: '100%',
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  confirmModalCancelButtonFull: {
    backgroundColor: COLORS.border,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    width: '100%',
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  confirmModalButtonText: {
    fontWeight: '600',
    color: '#FFFFFF',
    alignItems: 'center',
  },

  confirmModalProceedText: {
    fontWeight: '600',
    color: COLORS.textPrimary,
    alignItems: 'center',
  },

  confirmModalCancelText: {
    fontWeight: '600',
    color: COLORS.textPrimary,
    alignItems: 'center',
  },
  
  modalCloseButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },

  modalCloseText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#9c9c9cff',
  },

  /* ---------- INPUT ---------- */

  input: {
    backgroundColor: COLORS.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 12,
    width: '100%',
    marginVertical: 8,
  },

  /* ---------- TOOLTIP ---------- */

  tooltip: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.danger,
    padding: 8,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },

  tooltipText: {
    color: '#FFFFFF',
    fontSize: 12,
    textAlign: 'center',
  },

  /* ---------- PREFERENCE MODAL ---------- */

  
  preferenceModal: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },

  preferenceModalContent: {
    width: '25%',
    minHeight: '25%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    justifyContent: 'space-between',
    elevation: 5,
  },

  preferenceModalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },

  preferenceModalSubtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginBottom: 10,
  },

  preferenceModalLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textPrimary,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginTop: 20,
  },

  preferenceSwitch: {
    marginBottom: 20,
  },

  preferenceButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 8,
    gap: 8,
  },

  optionButton: {
    flex: 1,
    aspectRatio: 1.5,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },

  optionButtonSelected: {
    backgroundColor: COLORS.primaryTranslucent,
    borderColor: COLORS.primary,
  },

  optionButtonText: {
    fontSize: 14,
    fontWeight: '400',
    color: COLORS.textPrimary,
  },
});