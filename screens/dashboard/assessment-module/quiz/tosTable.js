import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const BLOOM_LEVELS = [
  'Knowledge',
  'Comprehension',
  'Application',
  'Analysis',
  'Synthesis',
  'Evaluation',
];

function inferChapter(index) {
  if (index < 17) return 'chapter1';
  if (index < 34) return 'chapter2';
  return 'chapter3';
}


function computeTOSTable(questions = []) {
  const table = {
    chapter1: {},
    chapter2: {},
    chapter3: {},
    total: {},
  };

  Object.keys(table).forEach(row => {
    BLOOM_LEVELS.forEach(b => (table[row][b] = 0));
  });

  questions.forEach((q, idx) => {
    const bloom = q.bloom || 'Knowledge';
    const chapter = q.chapter || inferChapter(idx);
    table[chapter][bloom]++;
    table.total[bloom]++;
  });

  return table;
}

export default function TosTable({ questions, formativeQuizzes = [] }) {
  const tos = computeTOSTable(questions);

  const rowTotal = row =>
    BLOOM_LEVELS.reduce((sum, b) => sum + tos[row][b], 0);

  return (
    <View>
      {/* ================= TOS TABLE ================= */}
      <Text style={styles.title}>Table of Specifications (TOS)</Text>

      <View style={styles.rowHeader}>
        <Text style={styles.cellHeader}>Chapter</Text>
        {BLOOM_LEVELS.map(b => (
          <Text key={b} style={styles.cellHeader}>{b}</Text>
        ))}
        <Text style={styles.cellHeader}>Total</Text>
      </View>

      {['chapter1', 'chapter2', 'chapter3'].map((ch, i) => (
        <View key={ch} style={styles.row}>
          <Text style={styles.cell}>Chapter {i + 1}</Text>
          {BLOOM_LEVELS.map(b => (
            <Text key={b} style={styles.cell}>{tos[ch][b]}</Text>
          ))}
          <Text style={styles.cellBold}>{rowTotal(ch)}</Text>
        </View>
      ))}

      <View style={[styles.row, styles.totalRow]}>
        <Text style={styles.cellBold}>TOTAL</Text>
        {BLOOM_LEVELS.map(b => (
          <Text key={b} style={styles.cellBold}>{tos.total[b]}</Text>
        ))}
        <Text style={styles.cellBold}>{questions.length}</Text>
      </View>
    </View>
  );
}


const styles = StyleSheet.create({
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  rowHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    paddingBottom: 6,
  },
  row: {
    flexDirection: 'row',
    paddingVertical: 6,
  },
  totalRow: {
    borderTopWidth: 1,
    marginTop: 6,
  },
  cellHeader: {
    flex: 1,
    fontWeight: 'bold',
    fontSize: 12,
    textAlign: 'center',
  },
  cell: {
    flex: 1,
    fontSize: 12,
    textAlign: 'center',
  },
  formativeBox: {
  marginTop: 20,
  paddingTop: 12,
  borderTopWidth: 1,
},
formativeTitle: {
  fontSize: 16,
  fontWeight: 'bold',
  marginBottom: 10,
  textAlign: 'center',
},
formativeRow: {
  marginBottom: 6,
},
formativeText: {
  fontSize: 13,
  textAlign: 'left',
},
  cellBold: {
    flex: 1,
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
