import { partImages } from '../screens/components/PartImages.js';

function fanCpuCompatible(fan, cpu) {
  if (!fan || !cpu) return true;
  if (!fan.supported_socket) return true;
  const sockets = fan.supported_socket.split(',').map(s => s.trim());
  return sockets.includes(cpu.microarchitecture);
}

export function recommendBuild(partOptions, userBudget, useCase) {
  const selectionOrder = ['CPU', 'MOTHERBOARD', 'GPU', 'RAM', 'PSU', 'STORAGE', 'CASE', 'FAN'];

  // Step 1: Allocate percentages
  let allocation = {
    CPU: 0.25,
    GPU: 0.25,
    RAM: 0.1,
    MOTHERBOARD: 0.1,
    PSU: 0.1,
    STORAGE: 0.1,
    CASE: 0.05,
    FAN: 0.05,
  };

  // Step 2: Use-case allocation
  if (useCase === 'gaming') {
    allocation.GPU += 0.1;
    allocation.CPU -= 0.1;
  } else if (useCase === 'productivity') {
    allocation.CPU += 0.1;
    allocation.GPU -= 0.1;
  }

  // Step 3: Initial selection
  let build = [];

  for (let label of selectionOrder) {
    const options = partOptions[label] || [];
    if (!options.length) {
      build.push({ label, value: '', price: 0, image: partImages[label] });
      continue;
    }

    const sliceBudget = Math.floor(userBudget * allocation[label]);
    let affordable = options.filter(opt => opt.price <= sliceBudget);

    // Compatibility checks
    if (label === 'MOTHERBOARD') {
      const cpu = build.find(p => p.label === 'CPU');
      affordable = affordable.filter(mobo => cpu && mobo.socket === cpu.microarchitecture);
    }
    if (label === 'FAN') {
      const cpu = build.find(p => p.label === 'CPU');
      affordable = affordable.filter(fan => fanCpuCompatible(fan, cpu));
    }

    // Pick best option by benchmark
    let selected;
    if (affordable.length > 0) {
      selected = affordable.reduce((best, opt) => ((opt.benchmark || 0) > (best.benchmark || 0) ? opt : best), affordable[0]);
    } else {
      const compatible = options.filter(opt => {
        if (label === 'MOTHERBOARD') {
          const cpu = build.find(p => p.label === 'CPU');
          return cpu && opt.socket === cpu.microarchitecture;
        }
        if (label === 'FAN') {
          const cpu = build.find(p => p.label === 'CPU');
          return fanCpuCompatible(opt, cpu);
        }
        return true;
      });
      selected = compatible.length
        ? compatible.reduce((cheapest, opt) => (opt.price < cheapest.price ? opt : cheapest), compatible[0])
        : { value: '', price: 0, image: partImages[label] };
    }

    build.push({
      label,
      value: selected.value,
      price: selected.price,
      benchmark: selected.benchmark,
      wattage: selected.wattage,
      socket: selected.socket,
      microarchitecture: selected.microarchitecture,
      supported_socket: selected.supported_socket,
      tdp: selected.tdp,
      image: partImages[label],
    });
  }

  // Step 4: Leftover budget upgrades
  let remainingBudget = userBudget - build.reduce((sum, p) => sum + p.price, 0);

  while (remainingBudget > 0) {
    let upgraded = false;

    for (let label of selectionOrder) {
      if (remainingBudget <= 0) break;

      const current = build.find(p => p.label === label);
      const options = partOptions[label] || [];
      if (!options.length) continue;

      // Filter upgrades that fit remaining budget
      let affordableUpgrades = options.filter(opt =>
        opt.price > current.price && opt.price <= current.price + remainingBudget
      );

      // Compatibility check
      if (label === 'MOTHERBOARD') {
        const cpu = build.find(p => p.label === 'CPU');
        affordableUpgrades = affordableUpgrades.filter(mobo => cpu && mobo.socket === cpu.microarchitecture);
      }
      if (label === 'FAN') {
        const cpu = build.find(p => p.label === 'CPU');
        affordableUpgrades = affordableUpgrades.filter(fan => fanCpuCompatible(fan, cpu));
      }

      if (!affordableUpgrades.length) continue;

      const bestUpgrade = affordableUpgrades.reduce((a, b) => ((b.benchmark || 0) > (a.benchmark || 0) ? b : a), affordableUpgrades[0]);

      remainingBudget -= (bestUpgrade.price - current.price);

      Object.assign(current, {
        value: bestUpgrade.value,
        price: bestUpgrade.price,
        benchmark: bestUpgrade.benchmark,
        wattage: bestUpgrade.wattage,
        socket: bestUpgrade.socket,
        microarchitecture: bestUpgrade.microarchitecture,
        supported_socket: bestUpgrade.supported_socket,
        tdp: bestUpgrade.tdp,
      });

      upgraded = true;
    }

    // Stop loop if no upgrades possible
    if (!upgraded) break;
  }

  // Reorder output
  const outputOrder = ['MOTHERBOARD','GPU','CPU','FAN','RAM','PSU','STORAGE','CASE'];
  build.sort((a, b) => outputOrder.indexOf(a.label) - outputOrder.indexOf(b.label));

  return build;
}
