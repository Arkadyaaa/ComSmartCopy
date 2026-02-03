import { View, Text, FlatList } from 'react-native';
import HoverableOpacity from '../HoverableOpacity';
import styles from './TableStyles';

export default function GpuTable({ options, onSelect, formatPrice }) {
  const renderItem = ({ item }) => (
    <HoverableOpacity
      onPress={() => onSelect(item)}
      outerStyle={styles.row}
      hoverStyle={styles.rowHovered}
    >
      <Text style={styles.cell}>{item.value || '—'}</Text>
      <Text style={styles.cell}>{item.chipset || '—'}</Text>
      <Text style={styles.cell}>{item.vram + " GB" || '—'}</Text>
      <Text style={styles.cell}>{item.tdp + "W" || '—'}</Text>
      <Text style={styles.cell}>{item.benchmark || '—'}</Text>
      <Text style={styles.cell}>{formatPrice(item.price) || '—'}</Text>
    </HoverableOpacity>
  );

  return (
    <>
      <View style={styles.headerRow}>
        <Text style={styles.cellHeader}>Name</Text>
        <Text style={styles.cellHeader}>Chipset</Text>
        <Text style={styles.cellHeader}>VRAM</Text>
        <Text style={styles.cellHeader}>TDP</Text>
        <Text style={styles.cellHeader}>Benchmark Score</Text>
        <Text style={styles.cellHeader}>Price</Text>
      </View>
      <FlatList
        data={options}
        keyExtractor={(item) => item.id?.toString() || item.name}
        renderItem={renderItem}
      />
    </>
  );
}
