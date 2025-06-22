import { View, Text, FlatList } from 'react-native';
import HoverableOpacity from '../HoverableOpacity';
import styles from './TableStyles';

export default function CaseTable({ options, onSelect, formatPrice }) {
  const renderItem = ({ item }) => (
    <HoverableOpacity
      onPress={() => onSelect(item)}
      outerStyle={styles.row}
      hoverStyle={styles.rowHovered}
    >
      <Text style={styles.cell}>{item.value || '—'}</Text>
      <Text style={styles.cell}>{item.type || '—'}</Text>
      <Text style={styles.cell}>{item.dimensions || '—'}</Text>
      <Text style={styles.cell}>{item.psu_type || '—'}</Text>
      <Text style={styles.cell}>{item.bays || '—'}</Text>
      <Text style={styles.cell}>{formatPrice(item.price) || '—'}</Text>
    </HoverableOpacity>
  );

  return (
    <>
      <View style={styles.headerRow}>
        <Text style={styles.cellHeader}>Name</Text>
        <Text style={styles.cellHeader}>Type</Text>
        <Text style={styles.cellHeader}>Dimensions</Text>
        <Text style={styles.cellHeader}>Compatible PSU</Text>
        <Text style={styles.cellHeader}>Drive Bays</Text>
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
