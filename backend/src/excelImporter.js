import XLSX from 'xlsx';

const CATEGORY_BY_SHEET = [
  { test: /rwa|rwd|apartment|society|residential/i, category: 'Apartment' },
  { test: /it\s*parks?|tech\s*park|cowork/i, category: 'IT Park' },
  { test: /mall/i, category: 'Mall' },
  { test: /vendor|fabrication|production|sound/i, category: 'Vendor' },
  { test: /gym|fitness|health/i, category: 'Gym' },
  { test: /retail|store|supermarket|mart|shop/i, category: 'Retail Store' },
  { test: /canteen|cst|csd/i, category: 'Canteen' },
  { test: /govt|government/i, category: 'Government' },
  { test: /hotel|star/i, category: 'Hotel' }
];

const CATEGORY_FIELD_RULES = {
  Apartment: {
    name: ['name', 'apartment_name', 'society_name', 'building_name', 'rwa_name'],
    area: ['area', 'locality'],
    direction: ['direction', 'zone', 'region'],
    address: ['address', 'full_address'],
    contactName: ['contact_person', 'facility_manager', 'manager', 'owner', 'spoc'],
    phone: ['contact', 'contact_number', 'cont_number', 'phone', 'mobile'],
    email: ['email', 'email_id', 'mail'],
    rate: ['rate', 'rates', 'rent', 'rental', 'amount', 'charges'],
    units: ['units', 'no_of_units', 'number_of_units', 'flats'],
    occupied: ['occupied', 'no_occupied', 'number_occupied'],
    occupancy: ['occupancy', 'occupancy_percentage'],
    gst: ['gst_applicable', 'gst'],
    notes: ['remarks', 'notes', 'onboard_status', 'rwa_type']
  },
  'IT Park': {
    name: ['it_parks_and_coworking', 'it_parks', 'it_park', 'tech_park', 'park_name', 'location_name'],
    area: ['area', 'location_area'],
    google: ['direction', 'google_link', 'google_map', 'maps_link', 'location'],
    contactName: ['name', 'contact_person', 'spoc', 'manager'],
    phone: ['contact_number', 'contact', 'cont', 'cont_number', 'phone', 'mobile'],
    footfall: ['head_count', 'footfall', 'daily_footfall', 'visitors'],
    notes: ['company_name', 'companies', 'company', 'companies_inside', 'remarks', 'notes']
  },
  Mall: {
    name: ['malls_name', 'mall_name', 'mall', 'name_of_mall'],
    area: ['location', 'area', 'locality'],
    contactName: ['name', 'contact_person', 'manager', 'spoc'],
    phone: ['cont_number', 'contact_number', 'contact', 'phone', 'mobile'],
    landline: ['landline', 'land_line'],
    email: ['email', 'email_id', 'mail'],
    rate: ['rates', 'rate', 'rent', 'rental', 'amount', 'charges'],
    notes: ['remarks', 'notes']
  },
  Vendor: {
    name: ['company_names', 'campany_names', 'campony_names', 'company_name', 'campony_name', 'vendor_name', 'campany_name'],
    contactName: ['name', 'contact_person', 'vendor_contact'],
    phone: ['cont', 'contact', 'contact_number', 'cont_number', 'phone', 'mobile'],
    notes: ['vendor_category', 'category', 'remarks', 'notes']
  },
  Gym: {
    name: ['gym_details', 'gym_name', 'fitness_centre', 'fitness_center', 'name'],
    google: ['location', 'google_link', 'google_map', 'maps_link'],
    address: ['address'],
    contactName: ['contact_person', 'name', 'manager', 'owner', 'spoc'],
    phone: ['contact', 'contact_number', 'cont_number', 'phone', 'mobile'],
    rate: ['rental_per_day', 'rentel', 'rental', 'rent', 'rate', 'charges'],
    footfall: ['footfall', 'daily_footfall', 'visitors'],
    notes: ['remarks', 'notes']
  },
  'Retail Store': {
    name: ['store_name', 'retail_stores', 'retail_store', 'outlet_name', 'shop_name'],
    area: ['area', 'location', 'locality'],
    direction: ['direction', 'zone', 'region'],
    contactName: ['name', 'contact_person', 'manager', 'owner', 'spoc'],
    phone: ['cont_number', 'contact_number', 'contact', 'phone', 'mobile'],
    email: ['email', 'email_id', 'mail'],
    notes: ['remarks', 'notes']
  },
  Canteen: {
    name: ['cst_canteen', 'csd_canteen', 'canteen', 'canteen_name'],
    area: ['area', 'location'],
    google: ['direction', 'google_link', 'google_map', 'maps_link'],
    contactName: ['name', 'contact_person', 'manager', 'spoc'],
    phone: ['cont_numbers', 'contact_numbers', 'cont_number', 'contact_number', 'contact', 'phone', 'mobile'],
    email: ['email_id', 'email', 'mail'],
    rate: ['rentel', 'rental', 'rent', 'rate', 'amount', 'charges'],
    notes: ['remarks', 'notes']
  },
  Government: {
    name: ['govt_and_cst_names', 'govt_names', 'government_name', 'govt_name', 'name'],
    area: ['area', 'location'],
    google: ['direction', 'google_link', 'google_map', 'maps_link'],
    phone: ['cont_numbers', 'contact_numbers', 'cont_number', 'contact_number', 'contact', 'phone', 'mobile'],
    rate: ['rentel', 'rental', 'rent', 'rate', 'amount', 'charges'],
    notes: ['remarks', 'notes']
  },
  Hotel: {
    name: ['hotel_name', 'hotel', 'property_name'],
    google: ['location', 'google_link', 'google_map', 'maps_link'],
    area: ['area', 'locality'],
    contactName: ['name', 'contact_person', 'manager', 'spoc'],
    phone: ['cont_number', 'contact_number', 'contact', 'phone', 'mobile'],
    email: ['email_id', 'email', 'mail'],
    rate: ['basic_rate', 'rates', 'rate', 'rent', 'amount', 'charges'],
    notes: ['banquet_hall', 'capacities', 'lawns_capacities', 'remarks', 'notes']
  }
};

export function categoryFromSheet(sheetName = '') {
  const found = CATEGORY_BY_SHEET.find((item) => item.test.test(sheetName));
  return found ? found.category : clean(sheetName) || 'Other';
}

export function directionFromSheet(sheetName = '') {
  if (/north/i.test(sheetName)) return 'North';
  if (/south/i.test(sheetName)) return 'South';
  if (/east/i.test(sheetName)) return 'East';
  if (/west/i.test(sheetName)) return 'West';
  return '';
}

export function clean(value) {
  if (value === null || value === undefined) return '';
  return String(value).replace(/\u00a0/g, ' ').replace(/\s+/g, ' ').trim();
}

function normalizeKey(key) {
  return clean(key)
    .toLowerCase()
    .replace(/#/g, ' no ')
    .replace(/%/g, ' percentage ')
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

function uniqueHeaders(row) {
  const seen = new Map();
  return row.map((header, index) => {
    const base = clean(header) || `Column ${index + 1}`;
    const normalized = normalizeKey(base) || `column_${index + 1}`;
    const count = seen.get(normalized) || 0;
    seen.set(normalized, count + 1);
    return count ? `${base} ${count + 1}` : base;
  });
}

function toNumberLike(value) {
  const text = clean(value).replace(/,/g, '');
  if (!text || /^(na|n\/a|nil|none|-|—)$/i.test(text)) return null;
  const match = text.match(/[0-9]+(?:\.[0-9]+)?/);
  return match ? Number(match[0]) : null;
}

function detectHeaderIndex(rows) {
  let bestIndex = 0;
  let bestScore = -1;
  rows.slice(0, 20).forEach((row, index) => {
    const cells = row.map(clean);
    const text = cells.join(' ').toLowerCase();
    const nonEmpty = cells.filter(Boolean).length;
    const score =
      nonEmpty +
      (/s\s*no|sl\s*no|si\s*no|sn\b/.test(text) ? 3 : 0) +
      (/name|apartment|society|mall|hotel|gym|store|vendor|canteen|govt|it\s*parks?/.test(text) ? 5 : 0) +
      (/area|location|address|pincode|pin code|direction/.test(text) ? 4 : 0) +
      (/contact|phone|mobile|email|mail|rent|rate|footfall|units|occupancy|capacity/.test(text) ? 5 : 0);
    if (nonEmpty >= 2 && score > bestScore) {
      bestScore = score;
      bestIndex = index;
    }
  });
  return bestIndex;
}

function rowObject(headers, row) {
  const obj = {};
  headers.forEach((header, index) => {
    const key = normalizeKey(header || `column_${index + 1}`);
    if (!key) return;
    const value = clean(row[index]);
    if (Object.prototype.hasOwnProperty.call(obj, key) && value) {
      obj[`${key}_${index + 1}`] = value;
    } else {
      obj[key] = value;
    }
  });
  return obj;
}

function pickExact(obj, keys = []) {
  for (const key of keys) {
    const normalized = normalizeKey(key);
    if (clean(obj[normalized])) return obj[normalized];
  }
  return '';
}

function pickPattern(obj, patterns = []) {
  const entries = Object.entries(obj);
  for (const pattern of patterns) {
    const found = entries.find(([key, value]) => pattern.test(key) && clean(value));
    if (found) return found[1];
  }
  return '';
}

function isUrl(value) {
  const text = clean(value);
  return /^https?:\/\//i.test(text) || /maps\.app\.goo|share\.google|goo\.gl|google\.com\/maps/i.test(text);
}


function parseCoordinatePair(text) {
  const value = clean(text);
  if (!value) return { latitude: null, longitude: null };

  const decoded = decodeURIComponent(value);
  const candidates = [decoded];

  // Google Maps URL patterns: @12.9716,77.5946, !3d12.9716!4d77.5946, q=12.9716,77.5946
  const atMatch = decoded.match(/@(-?\d{1,3}(?:\.\d+)?),\s*(-?\d{1,3}(?:\.\d+)?)/);
  if (atMatch) candidates.unshift(`${atMatch[1]},${atMatch[2]}`);

  const bangMatch = decoded.match(/!3d(-?\d{1,3}(?:\.\d+)?)!4d(-?\d{1,3}(?:\.\d+)?)/);
  if (bangMatch) candidates.unshift(`${bangMatch[1]},${bangMatch[2]}`);

  const queryMatch = decoded.match(/[?&](?:q|query|ll|center)=(-?\d{1,3}(?:\.\d+)?),\s*(-?\d{1,3}(?:\.\d+)?)/i);
  if (queryMatch) candidates.unshift(`${queryMatch[1]},${queryMatch[2]}`);

  for (const candidate of candidates) {
    const match = clean(candidate).match(/(-?\d{1,3}(?:\.\d+)?)\s*[, ]\s*(-?\d{1,3}(?:\.\d+)?)/);
    if (!match) continue;
    const latitude = Number(match[1]);
    const longitude = Number(match[2]);
    if (Number.isFinite(latitude) && Number.isFinite(longitude) && Math.abs(latitude) <= 90 && Math.abs(longitude) <= 180) {
      return { latitude, longitude };
    }
  }
  return { latitude: null, longitude: null };
}

function gpsFromRow(obj, googleLink = '') {
  const latValue = pickExact(obj, ['latitude', 'lat', 'gps_latitude', 'gps_lat', 'gps_latitute', 'latitute']) || pickPattern(obj, [/^lat$|latitude|gps_lat/]);
  const lngValue = pickExact(obj, ['longitude', 'long', 'lng', 'lon', 'gps_longitude', 'gps_lng', 'gps_long']) || pickPattern(obj, [/^lng$|^lon$|longitude|gps_lng|gps_long/]);
  const directLat = toNumberLike(latValue);
  const directLng = toNumberLike(lngValue);
  if (directLat !== null && directLng !== null && Math.abs(directLat) <= 90 && Math.abs(directLng) <= 180) {
    return { latitude: directLat, longitude: directLng, gpsLocation: `${directLat}, ${directLng}` };
  }

  const combined = pickExact(obj, ['gps', 'gps_location', 'gps_coordinates', 'coordinates', 'lat_long', 'lat_lng', 'latitude_longitude']) ||
    pickPattern(obj, [/gps|coordinate|lat_long|lat_lng|latitude_longitude/]);
  const fromCombined = parseCoordinatePair(combined);
  if (fromCombined.latitude !== null && fromCombined.longitude !== null) {
    return { latitude: fromCombined.latitude, longitude: fromCombined.longitude, gpsLocation: `${fromCombined.latitude}, ${fromCombined.longitude}` };
  }

  const fromMap = parseCoordinatePair(googleLink);
  if (fromMap.latitude !== null && fromMap.longitude !== null) {
    return { latitude: fromMap.latitude, longitude: fromMap.longitude, gpsLocation: `${fromMap.latitude}, ${fromMap.longitude}` };
  }

  return { latitude: null, longitude: null, gpsLocation: '' };
}

function mapsSearchUrl(location) {
  const query = [location.name, location.area, location.address, location.pincode, location.city || 'Bengaluru'].filter(Boolean).join(', ');
  return query ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}` : '';
}

function gpsMapUrl(location) {
  if (location.latitude !== null && location.longitude !== null) {
    return `https://www.google.com/maps/search/?api=1&query=${location.latitude},${location.longitude}`;
  }
  return location.google_link || mapsSearchUrl(location);
}

function firstEmail(obj) {
  const direct = pickPattern(obj, [/email|e_mail|mail/]);
  const text = [direct, ...Object.values(obj)].join(' ');
  const match = text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
  return match ? match[0].replace(/[<>]/g, '') : clean(direct);
}

function phoneListFromText(text) {
  const parts = clean(text).split(/[;,/\\|]+/);
  const phones = [];
  for (const part of parts) {
    const digits = part.replace(/\D/g, '');
    if (digits.length >= 8 && digits.length <= 13 && !/^0+$/.test(digits)) {
      phones.push(digits.length > 10 && digits.startsWith('91') ? digits.slice(-10) : digits);
    }
  }
  return [...new Set(phones)];
}

function firstPhone(obj, ruleKeys = []) {
  const direct = pickExact(obj, ruleKeys) || pickPattern(obj, [/phone|mobile|contact_no|contact_number|cont_number|cont$|number|ph_no|cell|landline/]);
  const fromDirect = phoneListFromText(direct);
  if (fromDirect.length) return fromDirect.join(' / ');
  const fromAll = phoneListFromText(Object.values(obj).join(' '));
  return fromAll.join(' / ');
}

function mapsLink(obj, ruleKeys = []) {
  const direct = pickExact(obj, ruleKeys) || pickPattern(obj, [/google|map|location_link|maps_link|link|direction|location/]);
  if (isUrl(direct)) return clean(direct);
  const text = Object.values(obj).join(' ');
  const match = text.match(/https?:\/\/\S+/i);
  return match ? match[0] : '';
}

function contactNameFromText(text) {
  const withoutEmail = clean(text).replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, '');
  const withoutPhones = withoutEmail.replace(/(?:\+?91[\s-]*)?(?:\d[\s-]*){8,13}/g, '');
  const first = clean(withoutPhones.split(/[;,]/)[0]);
  if (!first || /^office$|^contact$|^ph\s*no$|^phone$/i.test(first)) return '';
  return first.replace(/\s*,\s*$/, '');
}

function contactName(obj, rules = []) {
  const direct = pickExact(obj, rules) || pickPattern(obj, [/contact_person|manager|person|owner|coordinator|spoc|facility|incharge|in_charge/]);
  if (clean(direct) && !/^name$|^ph\s*no$|^contact$/i.test(clean(direct))) return clean(direct);
  const contactField = pickPattern(obj, [/contact|phone|mobile|cont/]);
  return contactNameFromText(contactField);
}

function statusFromRow(obj) {
  const text = pickPattern(obj, [/status|availability|active|verified|remarks|notes|onboard/]);
  if (/inactive|closed|not available|delete|wrong|not allowed/i.test(text)) return 'Inactive';
  if (/pending|to verify|verify|under_process|under process/i.test(text)) return 'Pending';
  return 'Active';
}

function suitability(category) {
  switch (category) {
    case 'Apartment': return 'Apartment activation, sampling, lead generation';
    case 'Gym': return 'Fitness brand promotion, sampling, membership partnerships';
    case 'Mall': return 'High-footfall kiosk, brand promotion, weekend activity';
    case 'IT Park': return 'Corporate sampling, lead collection, lunch-hour activation';
    case 'Hotel': return 'Premium brand visibility, HNI audience, banquet partnership';
    case 'Retail Store': return 'In-store promotion, FMCG sampling, consumer offer activation';
    case 'Vendor': return 'Operations support and campaign execution';
    case 'Canteen': return 'Institutional activation and controlled-location outreach';
    case 'Government': return 'Government/commercial complex activation and institutional visibility';
    default: return 'Brand activation and local promotion';
  }
}

function combineNotes(obj, ruleKeys = []) {
  const values = [];
  for (const key of ruleKeys) {
    const value = pickExact(obj, [key]);
    if (clean(value)) values.push(`${clean(key).replace(/_/g, ' ')}: ${clean(value)}`);
  }
  const direct = pickPattern(obj, [/^notes?$|^remarks?$|comment|requirements/]);
  if (clean(direct)) values.unshift(clean(direct));
  return [...new Set(values)].join(' | ');
}

function invalidHeaderLike(location, obj) {
  const name = clean(location.name).toLowerCase();
  const area = clean(location.area).toLowerCase();
  const phone = clean(location.phone).toLowerCase();
  const headerNames = new Set([
    'name', 'gym name', 'store name', 'hotel name', 'malls name', 'mall name', 'cst canteen', 'govt and cst names',
    'it parks', 'retail stores', 'vendor category', 'campany names', 'campony names', 'company names', 'location', 'area'
  ]);
  if (headerNames.has(name)) return true;
  if ((name.includes('name') || name.includes('details')) && (phone.includes('ph') || phone.includes('cont') || area === 'area')) return true;
  const all = Object.values(obj).map(clean).join(' ').toLowerCase();
  return /^\s*(slno|sl no|si no|sn|s no)?\s*(name|area|pincode|contact|phone|email|location|direction|rate|footfall)+\s*$/i.test(all);
}

function valueOrBlankWhenUrl(value) {
  return isUrl(value) ? '' : clean(value);
}

export function buildLocation(sheetName, obj, rowNumber) {
  const category = categoryFromSheet(sheetName);
  const rules = CATEGORY_FIELD_RULES[category] || {};
  const sheetDirection = directionFromSheet(sheetName);

  const googleLink = mapsLink(obj, rules.google || []);
  const gps = gpsFromRow(obj, googleLink);
  let direction = pickExact(obj, rules.direction || []) || sheetDirection;
  if (isUrl(direction)) direction = sheetDirection || '';

  let name = pickExact(obj, rules.name || []);
  if (!name && category === 'Vendor') {
    const vendorCategory = pickExact(obj, ['vendor_category']);
    const vendorContact = pickExact(obj, rules.contactName || []);
    name = [vendorCategory, vendorContact].filter(Boolean).join(' - ');
  }
  if (!name) {
    name = pickPattern(obj, [/property|site|outlet|client|company|park_name|canteen|restaurant|supermarket|location_name/]);
  }

  const areaRaw = pickExact(obj, rules.area || []) || pickPattern(obj, [/^area$|locality|place|micro_market/]);
  const addressRaw = pickExact(obj, rules.address || []) || pickPattern(obj, [/address|full_address|complete_address/]);
  const contactRaw = contactName(obj, rules.contactName || []);
  const phone = firstPhone(obj, rules.phone || []);
  const email = firstEmail(obj);
  const rate = pickExact(obj, rules.rate || []) || pickPattern(obj, [/rent|rate|price|cost|amount|charges|rental|basic_rate|commercial/]);
  const footfall = pickExact(obj, rules.footfall || []) || pickPattern(obj, [/footfall|walkin|walk_ins|visitors|crowd|daily/]);
  const units = pickExact(obj, rules.units || []) || pickPattern(obj, [/units|flats|apartments|houses|no_of_units|number_of_units/]);
  const occupied = pickExact(obj, rules.occupied || []) || pickPattern(obj, [/occupied|families|families_staying/]);
  const occupancy = pickExact(obj, rules.occupancy || []) || pickPattern(obj, [/occupancy|occupied_percentage|percentage|occ/]);
  const gstApplicable = pickExact(obj, rules.gst || []) || pickPattern(obj, [/gst/]);
  const pincode = pickPattern(obj, [/pin|pincode|pin_code|zip/]);

  const location = {
    category,
    city: 'Bengaluru',
    status: statusFromRow(obj),
    source_sheet: sheetName,
    source_row: rowNumber,
    direction: clean(direction),
    name: clean(name),
    area: valueOrBlankWhenUrl(areaRaw),
    address: valueOrBlankWhenUrl(addressRaw),
    pincode: clean(pincode),
    google_link: clean(googleLink),
    latitude: gps.latitude,
    longitude: gps.longitude,
    gps_location: clean(gps.gpsLocation),
    contact_name: clean(contactRaw),
    phone: clean(phone),
    email: clean(email),
    rate: clean(rate),
    footfall: toNumberLike(footfall),
    units: toNumberLike(units),
    occupied: toNumberLike(occupied),
    occupancy: clean(occupancy),
    gst_applicable: clean(gstApplicable),
    activity_suitability: suitability(category),
    notes: combineNotes(obj, rules.notes || []),
    extra: obj
  };

  if (!location.name) {
    location.name = location.area || location.address || location.contact_name || `${category} row ${rowNumber}`;
  }
  if (!location.google_link) {
    location.google_link = mapsSearchUrl(location);
  }
  if (!location.gps_location) {
    location.gps_location = gpsMapUrl(location);
  }
  if (category === 'Mall' && !location.phone) {
    const landline = pickExact(obj, rules.landline || []);
    location.phone = clean(landline);
  }
  if (invalidHeaderLike(location, obj)) return null;
  return location;
}

export function parseExcelBuffer(buffer) {
  const workbook = XLSX.read(buffer, { type: 'buffer', cellDates: false });
  const records = [];
  const sheetSummaries = [];

  workbook.SheetNames.forEach((sheetName) => {
    const worksheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '', raw: false });
    if (!rows.length) return;

    const headerIndex = detectHeaderIndex(rows);
    const headers = uniqueHeaders(rows[headerIndex]);
    const sheetRecords = [];
    const skippedRows = [];

    rows.slice(headerIndex + 1).forEach((row, rowOffset) => {
      const rowNumber = headerIndex + rowOffset + 2;
      const hasData = row.some((cell) => clean(cell));
      if (!hasData) return;
      const obj = rowObject(headers, row);
      const location = buildLocation(sheetName, obj, rowNumber);
      if (!location || (!location.name && !location.area && !location.address && !location.phone && !location.google_link)) {
        skippedRows.push(rowNumber);
        return;
      }
      sheetRecords.push(location);
    });

    records.push(...sheetRecords);
    sheetSummaries.push({
      sheet: sheetName,
      category: categoryFromSheet(sheetName),
      headerRow: headerIndex + 1,
      importedRows: sheetRecords.length,
      skippedRows: skippedRows.length,
      detectedHeaders: headers.map(clean).filter(Boolean)
    });
  });

  return { records, sheetSummaries };
}
