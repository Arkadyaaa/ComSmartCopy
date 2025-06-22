import { View, Text, FlatList } from 'react-native';
import HoverableOpacity from '../HoverableOpacity';
import styles from './TableStyles';

export default function CpuTable({ options, onSelect, formatPrice }) {
  const renderItem = ({ item }) => (
    <HoverableOpacity
      onPress={() => onSelect(item)}
      outerStyle={styles.row}
      hoverStyle={styles.rowHovered}
    >
      <Text style={styles.cell}>{item.value || '—'}</Text>
      <Text style={styles.cell}>{item.cores || '—'}</Text>
      <Text style={styles.cell}>{item.microarchitecture || '—'}</Text>
      <Text style={styles.cell}>{item.core_clock + " GHz" || '—'}</Text>
      <Text style={styles.cell}>{item.boost_clock ? item.boost_clock + " GHz" : '—'}</Text>
      <Text style={styles.cell}>{formatPrice(item.price) || '—'}</Text>
    </HoverableOpacity>
  );

  return (
    <>
      <View style={styles.headerRow}>
        <Text style={styles.cellHeader}>Name</Text>
        <Text style={styles.cellHeader}>Cores</Text>
        <Text style={styles.cellHeader}>Microarchitecture</Text>
        <Text style={styles.cellHeader}>Core Clock</Text>
        <Text style={styles.cellHeader}>Boost Clock</Text>
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
