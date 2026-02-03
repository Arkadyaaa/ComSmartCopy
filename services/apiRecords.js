import supabase from "./supabase";

export async function getRecords() {
    let { data: User, error } = await supabase
        .from('User')
        .select('*');
    if (error) {
        throw new Error("Failed to fetch records");
    }
    return User; // Return the fetched records
}

export async function addRecords(username, userType, emailAddress) {
    if (!["participant", "tutor"].includes(userType)) {
        throw new Error("Invalid user type. Must be 'participant' or 'tutor'.");
    }

    const { error } = await supabase
        .from('User')
        .insert([
            { username, userType, emailAddress }, // Save emailAddress along with other fields
        ]);
    if (error) {
        console.error("Error adding record:", error); // Log the error for debugging
        throw new Error("Failed to add record");
    }
}

export async function deleteRecords(id) {
    const { error } = await supabase
        .from('User') // Ensure the table name matches
        .delete()
        .eq('id', id); // Use the provided id
    if (error) {
        throw new Error("Failed to delete record");
    }
}

export async function getUserInformation(userID) {
    const { data, error } = await supabase
        .from('userInformation')
        .select('*')
        .eq('userID', userID)
        .single();
    if (error) {
        throw new Error("Failed to fetch user information");
    }
    return data;
}

export async function upsertUserInformation(info) {
    let error, data;
    const payload = {
        userID: info.userID,
        firstName: info.firstName,
        middleInitial: info.middleInitial,
        lastName: info.lastName,
        participantType: info.participantType,
        age: info.age,
        gender: info.gender,
        contactNo: info.contactNo,
        imagepath: info.imagepath,
    };
    if (info.id) {
        ({ error } = await supabase
            .from('userInformation')
            .update(payload)
            .eq('id', info.id));
    } else {
        const result = await supabase
            .from('userInformation')
            .insert([payload])
            .select()
            .single();
        error = result.error;
        data = result.data;
    }
    if (error) {
        throw new Error("Failed to save user information");
    }
    return data;
}

export async function uploadProfileImage(localFileOrUri, filename) {
    let file;
    if (typeof window !== "undefined" && window.File && localFileOrUri instanceof File) {
        file = localFileOrUri;
    } else {
        const response = await fetch(localFileOrUri);
        file = await response.blob();
    }

    filename = filename.replace(/[^a-zA-Z0-9._-]/g, "_");

    const { data, error } = await supabase.storage
        .from('images')
        .upload(filename, file, { upsert: true });

    if (error) {
        console.error("Supabase Storage upload error:", error);
        throw new Error("Failed to upload image");
    }

    const { data: publicUrlData } = supabase
        .storage
        .from('images')
        .getPublicUrl(filename);

    return publicUrlData.publicUrl;
}

export async function getUserByIdFromAuth(userId) {
    const { data, error } = await supabase
        .from('User')
        .select('*')
        .eq('id', userId)
        .single();
    
    if (error) {
        throw new Error("Failed to fetch user");
    }
    return data;
}

const PART_CONFIG = {
  MOTHERBOARD: {
    table: 'PARTS_MOTHERBOARD',
    id: 'id',
    nameCol: 'name',
    priceCol: 'price',
    extraCols: ['socket', 'form_factor', 'ram_slots'],
  },
  GPU: {
    table: 'PARTS_GPU',
    id: 'id',
    nameCol: 'name',
    priceCol: 'price',
    extraCols: ['chipset', 'vram', 'tdp', 'benchmark'],
  },
  CPU: {
    table: 'PARTS_CPU',
    id: 'id',
    nameCol: 'name',
    priceCol: 'price',
    extraCols: ['cores', 'microarchitecture', 'core_clock', 'boost_clock'],
  },
  FAN: {
    table: 'PARTS_FAN',
    id: 'id',
    nameCol: 'name',
    priceCol: 'price',
    extraCols: ['supported_socket', 'type'],
  },
  RAM: {
    table: 'PARTS_RAM',
    id: 'id',
    nameCol: 'name',
    priceCol: 'price',
    extraCols: ['speed', 'size', 'stick'],
  },
  PSU: {
    table: 'PARTS_PSU',
    id: 'id',
    nameCol: 'name',
    priceCol: 'price',
    extraCols: ['type', 'wattage'],
  },
  STORAGE: {
    table: 'PARTS_STORAGE',
    id: 'id',
    nameCol: 'name',
    priceCol: 'price',
    extraCols: ['capacity', 'type', 'unit', 'form_factor',],
  },
  CASE: {
    table: 'PARTS_CASE',
    id: 'id',
    nameCol: 'name',
    priceCol: 'price',
    extraCols: ['type', 'dimensions', 'psu_type', 'bays',],
  },
};

export async function getAllParts() {
  const allParts = {};

  for (const [type, config] of Object.entries(PART_CONFIG)) {
    const { table, id, nameCol, priceCol, extraCols = [] } = config;
    const columns = [id, nameCol, priceCol, ...extraCols].join(', ');

    // First, get total count
    const { count, error: countError } = await supabase
      .from(table)
      .select('*', { count: 'exact', head: true });

    if (countError || count === null) {
      console.error(`Error getting count from ${table}:`, countError);
      continue;
    }

    const items = [];
    const pageSize = 1000;

    for (let from = 0; from < count; from += pageSize) {
      const to = Math.min(from + pageSize - 1, count - 1);

      const { data, error } = await supabase
        .from(table)
        .select(columns)
        .range(from, to);

      if (error) {
        console.error(`Error fetching ${type} from ${table}:`, error);
        break;
      }

      items.push(...data);
    }

    allParts[type] = items.map(item => ({
      id: item[id],
      value: item[nameCol],
      price: item[priceCol],
      ...extraCols.reduce((acc, col) => {
        acc[col] = item[col];
        return acc;
      }, {}),
    }));
  }

  return allParts;
}

export async function getCurrentUser() {
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !authUser) {
        throw new Error("Failed to get authenticated user");
    }

    const { data: userData, error: userError } = await supabase
        .from('User')
        .select('*')
        .eq('emailAddress', authUser.email)
        .single();

    if (userError) {
        throw new Error("Failed to fetch user data");
    }

    return userData;
}