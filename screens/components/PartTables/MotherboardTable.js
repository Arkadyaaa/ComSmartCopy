import { View, Text, FlatList } from 'react-native';
import HoverableOpacity from '../HoverableOpacity';
import styles from './TableStyles';

export default function MotherboardTable({ options, onSelect, formatPrice }) {
  const renderItem = ({ item }) => (
    <HoverableOpacity
      onPress={() => onSelect(item)}
      outerStyle={styles.row}
      hoverStyle={styles.rowHovered}
    >
      <Text style={styles.cell}>{item.value || '—'}</Text>
      <Text style={styles.cell}>{item.socket || '—'}</Text>
      <Text style={styles.cell}>{item.form_factor || '—'}</Text>
      <Text style={styles.cell}>{item.ram_slots || '—'}</Text>
      <Text style={styles.cell}>{formatPrice(item.price) || '—'}</Text>
    </HoverableOpacity>
  );

  return (
    <>
      <View style={styles.headerRow}>
        <Text style={styles.cellHeader}>Name</Text>
        <Text style={styles.cellHeader}>Socket</Text>
        <Text style={styles.cellHeader}>Form Factor</Text>
        <Text style={styles.cellHeader}>RAM Slots</Text>
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
