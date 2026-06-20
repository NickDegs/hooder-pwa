// ── Types ────────────────────────────────────────────────────────────────────

export type PropertyCategory =
  | 'hotel' | 'office' | 'retail' | 'residential' | 'land' | 'industrial'
  | 'park' | 'street' | 'marina' | 'landmark' | 'stadium' | 'parking'
  | 'apartment' | 'villa' | 'penthouse' | 'duplex' | 'studio'
  | 'building' | 'townhouse' | 'yali' | 'garden_unit' | 'rooftop_unit'

export interface Property {
  id:           string
  name:         string
  address:      string
  category:     PropertyCategory
  neighborhood: string
  city:         string
  country:      string
  price:        number
  incomePerDay: number
  prestige:     number   // 1–5
  lat:          number
  lng:          number
  description:  string
  accentHex:    string
  roiPercent:   number
}

export interface City {
  id:      string
  name:    string
  country: string
  flag:    string
  lat:     number
  lng:     number
  zoom:    number
}

// ── Category meta ─────────────────────────────────────────────────────────────

export const categoryMeta: Record<PropertyCategory, { emoji: string; label: string; accent: string }> = {
  hotel:       { emoji: '🏨', label: 'Otel',      accent: '#3494ff' },
  office:      { emoji: '🏢', label: 'Ofis',      accent: '#bf5af2' },
  retail:      { emoji: '🏪', label: 'Mağaza',    accent: '#ffc434' },
  residential: { emoji: '🏠', label: 'Konut',     accent: '#30d158' },
  land:        { emoji: '🌿', label: 'Arsa',      accent: '#30b0c7' },
  industrial:  { emoji: '🏭', label: 'Endüstri',  accent: '#ff6b35' },
  park:        { emoji: '🌳', label: 'Park/Bahçe',    accent: '#34c759' },
  street:      { emoji: '🛣️',  label: 'Cadde/Sokak',  accent: '#ff9f0a' },
  marina:      { emoji: '⛵', label: 'Marina/Liman',  accent: '#0a84ff' },
  landmark:    { emoji: '🏛️', label: 'Meydan/Eser',  accent: '#ffd60a' },
  stadium:     { emoji: '🏟️', label: 'Stadyum/Arena', accent: '#ff375f' },
  parking:     { emoji: '🅿️',  label: 'Otopark',        accent: '#8e8e93' },
  apartment:   { emoji: '🏠', label: 'Daire',           accent: '#30d158' },
  villa:       { emoji: '🏡', label: 'Villa/Müstakil',  accent: '#34c759' },
  penthouse:   { emoji: '✨', label: 'Penthouse',        accent: '#ffd60a' },
  duplex:      { emoji: '🏘️', label: 'Dubleks',         accent: '#ff9f0a' },
  studio:      { emoji: '🛋️', label: 'Stüdyo Daire',   accent: '#5856d6' },
  building:    { emoji: '🏗️', label: 'Bina/Blok',       accent: '#0a84ff' },
  townhouse:   { emoji: '🏚️', label: 'Sıra Ev',         accent: '#ff6b35' },
  yali:        { emoji: '🚤', label: 'Yalı',             accent: '#0a84ff' },
  garden_unit: { emoji: '🌺', label: 'Bahçe Katı',       accent: '#30d158' },
  rooftop_unit:{ emoji: '🌇', label: 'Çatı Katı',        accent: '#ff9f0a' },
}

// ── Helper ────────────────────────────────────────────────────────────────────

function p(
  id: string, name: string, address: string, cat: PropertyCategory,
  hood: string, city: string, country: string,
  price: number, income: number, prestige: number,
  lng: number, lat: number, desc: string,
): Property {
  return {
    id, name, address, category: cat, neighborhood: hood, city, country,
    price, incomePerDay: income, prestige, lat, lng, description: desc,
    accentHex: categoryMeta[cat].accent,
    roiPercent: Math.round((income * 365) / price * 100 * 10) / 10,
  }
}

// ── Properties ────────────────────────────────────────────────────────────────

export const allProperties: Property[] = [

  // ═══════════════════════════════════════════════
  //  İSTANBUL
  // ═══════════════════════════════════════════════

  // Oteller
  p('ist-h01','Çırağan Palace Kempinski','Çırağan Cad. No:32, Beşiktaş','hotel','Beşiktaş','Istanbul','TR',126000000,264000,5,29.0560,41.0505,'Osmanlı sarayından dönüştürülmüş 5 yıldızlı otel. Boğaz manzarası.'),
  p('ist-h02','Park Bosphorus Hotel','Süleyman Seba Cad. No:22, Beşiktaş','hotel','Beşiktaş','Istanbul','TR',84000000,156000,5,29.0210,41.0430,'Boğaz kıyısında prestijli otel.'),
  p('ist-h03','Hilton Istanbul Bosphorus','Cumhuriyet Cad. No:12, Şişli','hotel','Harbiye','Istanbul','TR',54000000,102000,4,28.9882,41.0490,'İstanbul\'un ikonik 5 yıldızlı oteli.'),
  p('ist-h04','Pera Palace Hotel','Meşrutiyet Cad. No:52, Beyoğlu','hotel','Beyoğlu','Istanbul','TR',36000000,72000,5,28.9764,41.0320,'1892\'den beri tarihi prestijli otel.'),
  p('ist-h05','W Istanbul','Süleyman Seba Cad. No:22, Akaretler','hotel','Beşiktaş','Istanbul','TR',28500000,54000,4,29.0082,41.0415,'Akaretler\'de modern tasarım oteli.'),
  p('ist-h06','Galataport Boutique Hotel','Kemankeş Cad. No:44, Karaköy','hotel','Karaköy','Istanbul','TR',18600000,37200,4,28.9752,41.0271,'Galata\'nın yeni prestij bölgesinde butik otel.'),

  // Konutlar – Beşiktaş / Nişantaşı / Etiler
  p('ist-r01','Bebek 108 Residence Daire 4A','Bebek Cad. No:108, Bebek','residential','Bebek','Istanbul','TR',14400000,18600,5,29.0451,41.0774,'Boğaz manzaralı butik apartman dairesi.'),
  p('ist-r02','Arnavutköy Yalı Daire','Arnavutköy Cad. No:18, Arnavutköy','residential','Arnavutköy','Istanbul','TR',25500000,29400,5,29.0401,41.0686,'Su üstü yalı dairesi, Boğaz\'a sıfır.'),
  p('ist-r03','Kuruçeşme Marina Apart','İstinye Cad. No:5, Kuruçeşme','residential','Kuruçeşme','Istanbul','TR',9600000,12300,4,29.0375,41.0655,'Sahil kenarında lüks daire.'),
  p('ist-r04','Nişantaşı No:28 Daire 6','Teşvikiye Cad. No:28, Nişantaşı','residential','Nişantaşı','Istanbul','TR',8400000,10200,4,28.9932,41.0492,'Nişantaşı\'nın kalbinde geniş daire.'),
  p('ist-r05','Ulus Park Sitesi Blok A','Ulus Sokak No:12, Etiler','residential','Etiler','Istanbul','TR',6600000,8400,4,29.0302,41.0700,'Etiler\'in sakin semtinde site dairesi.'),
  p('ist-r06','Zorlu Center Daire 14A','Levazım Mah. No:1, Beşiktaş','residential','Beşiktaş','Istanbul','TR',10500000,13200,5,29.0161,41.0672,'AVM üstü lüks rezidans dairesi.'),
  p('ist-r07','İstanbul Sapphire Kat 50','Büyükdere Cad. No:1, Levent','residential','Levent','Istanbul','TR',12600000,16500,5,29.0118,41.0755,'Türkiye\'nin en yüksek kule daireleri.'),
  p('ist-r08','Trump Towers Res. Daire 32','Şişli Meydanı, Şişli','residential','Şişli','Istanbul','TR',7800000,9600,4,28.9870,41.0606,'Trump Towers\'ın rezidans kulesi.'),
  p('ist-r09','Ortaköy Sahil Daire','Muallim Naci Cad. No:64, Ortaköy','residential','Ortaköy','Istanbul','TR',5700000,7200,4,29.0286,41.0501,'Ortaköy camisine yürüme mesafesinde.'),
  p('ist-r10','Acıbadem Yeşilyurt Sitesi Blok C','Çamlıca Cad. No:8, Acıbadem','residential','Acıbadem','Istanbul','TR',3600000,4500,3,29.0467,41.0055,'Asya yakasında köklü site dairesi.'),
  p('ist-r11','Kadıköy Moda Sahil Daire','Moda Cad. No:45, Kadıköy','residential','Moda','Istanbul','TR',4200000,5100,4,29.0322,40.9848,'Moda\'nın şık semtinde deniz manzaralı.'),
  p('ist-r12','Fenerbahçe Sahil Apt.','Bağdat Cad. No:316, Fenerbahçe','residential','Fenerbahçe','Istanbul','TR',5400000,6600,4,29.0610,40.9706,'Bağdat Caddesi\'nde lüks daire.'),
  p('ist-r13','Varyap Meridian Daire 8B','Libadiye Cad., Ataşehir','residential','Ataşehir','Istanbul','TR',2940000,3540,3,29.1190,40.9932,'Ataşehir\'in modern rezidansı.'),
  p('ist-r14','Nurol Park Daire 21','Ayazağa Mah. No:5, Maslak','residential','Maslak','Istanbul','TR',6300000,7800,4,29.0290,41.1080,'Maslak\'ta panoramik manzaralı daire.'),
  p('ist-r15','Pendik Marina Residence','Kurtköy Mah. No:12, Pendik','residential','Pendik','Istanbul','TR',1860000,2280,3,29.2110,40.8780,'Pendik marina kenarında site dairesi.'),
  p('ist-r16','Başakşehir Bahçeşehir Daire','Şehir Parkı Cad., Başakşehir','residential','Başakşehir','Istanbul','TR',1740000,2100,2,28.8020,41.0850,'Büyük şehir parkı yanı daire.'),
  p('ist-r17','Üsküdar Bağlarbaşı Konağı','Bağlarbaşı Cad. No:8, Üsküdar','residential','Üsküdar','Istanbul','TR',3300000,4050,3,29.0244,41.0230,'Restore edilmiş tarihi konak.'),

  // Ofisler
  p('ist-o01','Levent İş Kuleleri A Kule Kat 22','Büyükdere Cad. No:141, Levent','office','Levent','Istanbul','TR',25500000,42600,5,29.0118,41.0800,'İstanbul\'un en prestijli ofis kulesi.'),
  p('ist-o02','Maslak 42 Ofis Kat 18','Büyükdere Cad. No:255, Maslak','office','Maslak','Istanbul','TR',15600000,26400,5,29.0152,41.1020,'Maslak\'ta modern A sınıfı ofis.'),
  p('ist-o03','Kanyon Plaza Ofis Kat 12','Büyükdere Cad. No:185, Levent','office','Levent','Istanbul','TR',11400000,19200,4,29.0098,41.0750,'Kanyon AVM\'nin ofis kulesi.'),
  p('ist-o04','Sabancı Center Kule Kat 30','Büyükdere Cad. No:111, Levent','office','Levent','Istanbul','TR',20400000,34200,5,29.0100,41.0770,'Sabancı\'nın tarihi merkez kulesi.'),
  p('ist-o05','Uptown Tower Ofis Kat 15','Nispetiye Cad., Etiler','office','Etiler','Istanbul','TR',8700000,14400,4,29.0270,41.0740,'Etiler\'de çift kule ofis projesi.'),
  p('ist-o06','Haydarpaşa Liman Ofis','Haydarpaşa İskelesi, Kadıköy','office','Kadıköy','Istanbul','TR',12300000,20400,4,29.0130,40.9997,'Restore tarihi gar binası ofisi.'),

  // Mağazalar
  p('ist-s01','Kapalıçarşı Kuyumcu Dükkanı No:42','Kapalıçarşı, Beyazıt','retail','Fatih','Istanbul','TR',10500000,21600,5,28.9674,41.0107,'UNESCO miras alanında eşsiz konum.'),
  p('ist-s02','Mısır Çarşısı Baharat Dükkanı','Eminönü Mah., Fatih','retail','Eminönü','Istanbul','TR',5400000,10800,5,28.9714,41.0166,'Mısır Çarşısı\'nda tarihi dükkân.'),
  p('ist-s03','İstiklal Caddesi Bina No:214','İstiklal Cad. No:214, Beyoğlu','retail','Beyoğlu','Istanbul','TR',12600000,25800,5,28.9784,41.0328,'İstiklal\'de yüksek trafikli mağaza.'),
  p('ist-s04','Bağdat Caddesi Mağaza','Bağdat Cad. No:188, Kadıköy','retail','Bağdat Cad.','Istanbul','TR',6600000,13200,4,29.0500,40.9750,'Bağdat Caddesi\'nin lüks alışveriş hattı.'),
  p('ist-s05','Akmerkez Butik No:112','Nispetiye Cad., Etiler','retail','Etiler','Istanbul','TR',4800000,9600,4,29.0228,41.0706,'Premium AVM\'de köşe butik.'),

  // ═══════════════════════════════════════════════
  //  DUBAİ
  // ═══════════════════════════════════════════════

  // Oteller
  p('dxb-h01','Burj Al Arab Suite','Jumeirah Beach Rd, Jumeirah','hotel','Jumeirah','Dubai','AE',540000000,960000,5,55.1852,25.1412,'Dünyanın tek 7 yıldızlı oteli.'),
  p('dxb-h02','Atlantis The Palm','Palm Jumeirah Crescent','hotel','Palm Jumeirah','Dubai','AE',255000000,444000,5,55.1304,25.1305,'Palm\'ın ikonik mega-resort oteli.'),
  p('dxb-h03','Address Downtown Hotel','Mohammed Bin Rashid Blvd','hotel','Downtown','Dubai','AE',126000000,234000,5,55.2757,25.1928,'Burj Khalifa\'ya bitişik 5 yıldızlı.'),
  p('dxb-h04','Jumeirah Emirates Towers','Sheikh Zayed Rd','hotel','Trade Centre','Dubai','AE',84000000,156000,5,55.2799,25.2175,'İkiz kulelerden biri – 5 yıldızlı otel.'),
  p('dxb-h05','Four Seasons Resort Jumeirah','Jumeirah Beach Rd No:270','hotel','Jumeirah','Dubai','AE',105000000,192000,5,55.2142,25.2028,'Sahil kenarında yüksek prestijli resort.'),

  // Konutlar
  p('dxb-r01','Burj Khalifa Daire 128. Kat','1 Sheikh Mohammed Bin Rashid Blvd','residential','Downtown','Dubai','AE',66000000,84000,5,55.2744,25.1972,'Dünyanın en yüksek rezidans dairesi.'),
  p('dxb-r02','Palm Jumeirah Signature Villa','Frond K, Palm Jumeirah','residential','Palm Jumeirah','Dubai','AE',54000000,66000,5,55.1390,25.1080,'Palm\'da sahil villası.'),
  p('dxb-r03','JBR The Walk Daire 8A','JBR Walk, Dubai Marina','residential','JBR','Dubai','AE',10200000,12600,4,55.1280,25.0760,'Jumeirah Beach\'e sıfır daire.'),
  p('dxb-r04','Dubai Marina Tower Daire','Marina Walk, Dubai Marina','residential','Dubai Marina','Dubai','AE',8400000,10200,4,55.1402,25.0812,'Marina\'ya bakışlı lüks daire.'),
  p('dxb-r05','DIFC Residences Daire','Gate Village, DIFC','residential','DIFC','Dubai','AE',16500000,21000,5,55.2808,25.2090,'Finans merkezi içinde rezidans.'),
  p('dxb-r06','Downtown Standpoint Daire','Emaar Boulevard, Downtown','residential','Downtown','Dubai','AE',12600000,15600,4,55.2780,25.1965,'Burj Khalifa manzaralı daire.'),
  p('dxb-r07','Dubai Hills Mansion','Al Marabea, Dubai Hills Estate','residential','Dubai Hills','Dubai','AE',36000000,44400,5,55.2360,25.0960,'Golf sahası manzaralı villa.'),
  p('dxb-r08','Business Bay Daire 24C','Executive Tower, Business Bay','residential','Business Bay','Dubai','AE',5400000,6600,3,55.2620,25.1870,'Kanal manzaralı modern daire.'),
  p('dxb-r09','Jumeirah Village Circle Daire','JVC, Jumeirah','residential','JVC','Dubai','AE',2040000,2460,2,55.2100,25.0612,'Uygun fiyatlı yatırımlık daire.'),
  p('dxb-r10','Arabian Ranches Villa','Ranches Blvd, Dubailand','residential','Arabian Ranches','Dubai','AE',11400000,13800,4,55.2730,25.0350,'Kapalı site sakin villa.'),

  // Ofisler
  p('dxb-o01','Burj Khalifa Ofis Kat 88','1 Sheikh Mohammed Bin Rashid Blvd','office','Downtown','Dubai','AE',54000000,96000,5,55.2744,25.1972,'Dünyanın en yüksek ofis katı.'),
  p('dxb-o02','DIFC Gate Tower Ofis','Gate Building, DIFC','office','DIFC','Dubai','AE',25500000,43200,5,55.2808,25.2090,'Dubai\'nin Wall Street\'i.'),
  p('dxb-o03','One Central Ofis','World Trade Centre, DWTC','office','Trade Centre','Dubai','AE',15600000,26400,4,55.2900,25.2220,'Fuar merkezi complex ofisi.'),

  // Mağazalar
  p('dxb-s01','Dubai Mall Butik No:B-42','Financial Centre Rd, Downtown','retail','Downtown','Dubai','AE',12600000,26400,5,55.2796,25.1985,'Dünyanın en büyük AVM\'nde butik.'),
  p('dxb-s02','Gold Souk Dükkânı No:18','Gold Souk, Deira','retail','Deira','Dubai','AE',3600000,7200,4,55.3022,25.2680,'Altın çarşısında tarihi dükkân.'),
  p('dxb-s03','Mall of Emirates Mağaza','Sheikh Zayed Rd, Al Barsha','retail','Al Barsha','Dubai','AE',8400000,16800,4,55.2008,25.1182,'Kayak pistli AVM\'de mağaza.'),

  // ═══════════════════════════════════════════════
  //  NEW YORK
  // ═══════════════════════════════════════════════

  // Oteller
  p('nyc-h01','The Plaza Hotel Suite','768 5th Ave, Midtown','hotel','Midtown','New York','US',840000000,1440000,5,-73.9745,40.7645,'1907\'den beri ikonik NYC oteli.'),
  p('nyc-h02','Four Seasons Hotel NYC','57 E 57th St, Midtown','hotel','Midtown','New York','US',285000000,504000,5,-73.9714,40.7618,'Mimaride ödül alan 5 yıldızlı otel.'),
  p('nyc-h03','The Standard High Line','848 Washington St, Meatpacking','hotel','Meatpacking','New York','US',126000000,234000,4,-74.0071,40.7422,'High Line üzerinde trendy otel.'),

  // Konutlar
  p('nyc-r01','One57 Penthouse','157 W 57th St, Midtown','residential','Midtown','New York','US',294000000,372000,5,-73.9798,40.7651,'Billionaires\' Row\'un zirve penthousu.'),
  p('nyc-r02','432 Park Avenue Daire','432 Park Ave, Midtown','residential','Midtown','New York','US',135000000,174000,5,-73.9773,40.7619,'Dünyanın en ince gökdelen dairesi.'),
  p('nyc-r03','Central Park West Daire 15B','15 Central Park W, Upper West Side','residential','Upper West Side','New York','US',54000000,66000,5,-73.9813,40.7720,'Central Park\'a bakan klasik daire.'),
  p('nyc-r04','5th Avenue Penthouse','995 5th Ave, Upper East Side','residential','Upper East Side','New York','US',66000000,84000,5,-73.9623,40.7747,'Central Park manzaralı 5. Cadde.'),
  p('nyc-r05','SoHo Cast Iron Loft','35 Greene St, SoHo','residential','SoHo','New York','US',9600000,14400,4,-74.0013,40.7218,'Tarihi döküm demir çerçeveli loft.'),
  p('nyc-r06','Brooklyn Heights Brownstone','142 Columbia Heights, Brooklyn','residential','Brooklyn Heights','New York','US',14400000,18600,4,-73.9946,40.6962,'Manhattan manzaralı tarihi apartman.'),
  p('nyc-r07','Williamsburg Condo 3F','180 N 7th St, Williamsburg','residential','Williamsburg','New York','US',4200000,5400,3,-73.9602,40.7172,'Trendy Williamsburg\'de modern daire.'),
  p('nyc-r08','Tribeca Grand Loft','377 Greenwich St, Tribeca','residential','Tribeca','New York','US',16800000,21600,4,-74.0086,40.7201,'A-list ünlüler mahallesi loft.'),
  p('nyc-r09','Harlem Row House','2 W 130th St, Harlem','residential','Harlem','New York','US',2940000,3720,3,-73.9402,40.8107,'Restore edilmiş Victorian evi.'),
  p('nyc-r10','Queens LIC Daire','4545 Center Blvd, Long Island City','residential','Long Island City','New York','US',2460000,3060,3,-73.9549,40.7468,'Manhattan manzaralı Queens dairesi.'),

  // Ofisler
  p('nyc-o01','Empire State Building Ofis K.22','350 5th Ave, Midtown','office','Midtown','New York','US',84000000,144000,5,-73.9857,40.7484,'İkonik gökdelende prestijli ofis.'),
  p('nyc-o02','One World Trade Center Ofis','285 Fulton St, Downtown','office','Financial District','New York','US',54000000,96000,5,-74.0133,40.7130,'9/11 memorial yanında modern ofis.'),
  p('nyc-o03','Rockefeller Center Ofis','1221 6th Ave, Midtown','office','Midtown','New York','US',36000000,63000,5,-73.9800,40.7585,'Tarihi komplekste A sınıfı ofis.'),
  p('nyc-o04','Wall Street Ofis No:40','40 Wall St, Financial District','office','Financial District','New York','US',27600000,49200,5,-74.0089,40.7069,'Küresel finans kalbinde ofis.'),

  // Mağazalar
  p('nyc-s01','Times Square Retail','1560 Broadway, Midtown','retail','Midtown','New York','US',25500000,54000,5,-73.9855,40.7580,'Dünyanın en yoğun trafikli noktası.'),
  p('nyc-s02','5th Avenue Boutique','711 5th Ave, Midtown','retail','Midtown','New York','US',36000000,72000,5,-73.9712,40.7613,'Lüks markaların en gözde caddesi.'),
  p('nyc-s03','Brooklyn Dumbo Shop','55 Water St, DUMBO','retail','DUMBO','New York','US',6600000,13200,4,-73.9894,40.7028,'Sanat galerileri ve butikler bölgesi.'),

  // ═══════════════════════════════════════════════
  //  LONDRA
  // ═══════════════════════════════════════════════

  // Oteller
  p('lon-h01','The Savoy Hotel','Strand, City of Westminster','hotel','Strand','London','GB',1440000000,2460000,5,-0.1208,51.5103,'1889\'dan beri dünyanın en ikonik oteli.'),
  p('lon-h02','Claridge\'s Hotel','Brook St, Mayfair','hotel','Mayfair','London','GB',960000000,1680000,5,-0.1482,51.5121,'Mayfair\'in kraliyet favorisi oteli.'),
  p('lon-h03','The Connaught','Carlos Pl, Mayfair','hotel','Mayfair','London','GB',555000000,960000,5,-0.1499,51.5110,'Mayfair\'in 5 yıldızlı simgesi.'),

  // Konutlar
  p('lon-r01','Mayfair Mansion – Grosvenor Sq','Grosvenor Sq No:22, Mayfair','residential','Mayfair','London','GB',84000000,108000,5,-0.1499,51.5110,'Dünyanın en değerli adreslerinden.'),
  p('lon-r02','One Hyde Park Daire','Knightsbridge, London','residential','Knightsbridge','London','GB',135000000,174000,5,-0.1614,51.5021,'Dünyanın en pahalı rezidans kompleksi.'),
  p('lon-r03','Kensington Palace Gardens Villa','Palace Gardens, W8','residential','Kensington','London','GB',246000000,315000,5,-0.1860,51.5057,'Milyarder\'ler Caddesi olarak bilinir.'),
  p('lon-r04','Chelsea Terrace House','King\'s Rd No:284, Chelsea','residential','Chelsea','London','GB',14400000,18600,4,-0.1754,51.4870,'Chelsea\'nin klasik sıra evi.'),
  p('lon-r05','Notting Hill Garden Flat','Westbourne Grove No:48, Notting Hill','residential','Notting Hill','London','GB',7200000,9300,4,-0.2010,51.5139,'Film setine dönen şık mahalle.'),
  p('lon-r06','Shoreditch Warehouse Conversion','Curtain Rd No:95, Shoreditch','residential','Shoreditch','London','GB',4200000,5400,3,-0.0788,51.5232,'Eski fabrika loft dönüşümü.'),
  p('lon-r07','Canary Wharf Riverfront Daire','Westferry Rd No:10, Isle of Dogs','residential','Canary Wharf','London','GB',3600000,4620,3,-0.0240,51.4998,'Nehir manzaralı modern daire.'),
  p('lon-r08','Hampstead Village Cottage','Flask Walk No:14, Hampstead','residential','Hampstead','London','GB',8400000,10800,4,-0.1779,51.5567,'Londra\'nın köylü bir köşesi.'),
  p('lon-r09','Battersea Power Station Daire','Circus Rd West, Battersea','residential','Battersea','London','GB',9600000,12300,4,-0.1442,51.4846,'Eski enerji santrali rezidansı.'),
  p('lon-r10','Stratford Olympic Village Daire','Montfichet Rd, Stratford','residential','Stratford','London','GB',2040000,2580,3,-0.0100,51.5417,'Olimpiyat köyünden dönüştürülmüş.'),

  // Ofisler
  p('lon-o01','The Shard Ofis Kat 28','32 London Bridge St, Southwark','office','South Bank','London','GB',54000000,96000,5,-0.0886,51.5045,'Londra\'nın en yüksek binasında ofis.'),
  p('lon-o02','Canary Wharf Tower Ofis','1 Canada Sq, Canary Wharf','office','Canary Wharf','London','GB',33000000,57600,5,-0.0193,51.5050,'Küresel bankacılığın merkezi.'),
  p('lon-o03','City of London Ofis','30 St Mary Axe (Gherkin), EC3A','office','City of London','London','GB',42000000,74400,5,-0.0808,51.5145,'Salatalık Binası – ikonik ofis.'),
  p('lon-o04','Mayfair Ofis Binası','Berkeley Sq No:1, Mayfair','office','Mayfair','London','GB',24600000,43200,4,-0.1448,51.5105,'Hedge fon ve özel bankacılık merkezi.'),

  // Mağazalar
  p('lon-s01','Oxford Street Flagship','Oxford St No:300, Westminster','retail','Westminster','London','GB',20400000,43200,5,-0.1408,51.5154,'Avrupa\'nın en kalabalık alışveriş caddesi.'),
  p('lon-s02','Harrods Kiosk','87 Brompton Rd, Knightsbridge','retail','Knightsbridge','London','GB',12600000,26400,5,-0.1632,51.4994,'Efsanevi mağazanın konsept alanı.'),
  p('lon-s03','Portobello Road Market Unit','Portobello Rd No:144, Notting Hill','retail','Notting Hill','London','GB',5400000,10800,4,-0.2043,51.5168,'Dünyanın en ünlü antika pazarı.'),

  // ═══════════════════════════════════════════════
  //  TOKYO
  // ═══════════════════════════════════════════════

  // Oteller
  p('tyo-h01','Aman Tokyo','The Otemachi Tower, Chiyoda','hotel','Otemachi','Tokyo','JP',276000000,486000,5,139.7645,35.6860,'Japonya\'nın en prestijli butik oteli.'),
  p('tyo-h02','Park Hyatt Tokyo','3-7-1-2 Nishishinjuku, Shinjuku','hotel','Shinjuku','Tokyo','JP',144000000,252000,5,139.6900,35.6847,'Lost in Translation\'ın çekimyeri.'),
  p('tyo-h03','The Peninsula Tokyo','1-8-1 Yurakucho, Chiyoda','hotel','Hibiya','Tokyo','JP',186000000,324000,5,139.7607,35.6747,'Imperial Palace yanında 5 yıldızlı.'),

  // Konutlar
  p('tyo-r01','Minami Aoyama Mansion 5F','5-4 Minami Aoyama, Minato','residential','Aoyama','Tokyo','JP',17400000,21600,5,139.7134,35.6633,'Tokyo\'nun en şık semtinde lüks daire.'),
  p('tyo-r02','Roppongi Hills Residence 32F','6-10 Roppongi, Minato','residential','Roppongi','Tokyo','JP',12600000,16200,5,139.7312,35.6604,'Roppongi Hills rezidans kulesi.'),
  p('tyo-r03','Shibuya Daikanyama Flat','17-5 Daikanyama, Shibuya','residential','Daikanyama','Tokyo','JP',8400000,10500,4,139.7029,35.6480,'Trendy tasarım semtinde daire.'),
  p('tyo-r04','Shinjuku Serviced Apart','2-1 Kabukicho, Shinjuku','residential','Shinjuku','Tokyo','JP',5400000,6600,3,139.6996,35.6950,'Servis daireleri kompleksi.'),
  p('tyo-r05','Setagaya Family Mansion','3-2 Taishido, Setagaya','residential','Setagaya','Tokyo','JP',2940000,3600,3,139.6780,35.6360,'Sessiz aile semtinde geniş daire.'),
  p('tyo-r06','Odaiba Waterfront Daire','2-1 Daiba, Minato','residential','Odaiba','Tokyo','JP',4800000,6000,4,139.7759,35.6246,'Gökkuşağı Köprüsü manzaralı.'),
  p('tyo-r07','Akihabara Studio Apart','1-14 Soto-Kanda, Chiyoda','residential','Akihabara','Tokyo','JP',1560000,1920,2,139.7729,35.7022,'Elektronik merkezi yanı stüdyo.'),

  // Ofisler
  p('tyo-o01','Shinjuku Park Tower Ofis','2-6-1 Nishi Shinjuku','office','Shinjuku','Tokyo','JP',42000000,72000,5,139.6869,35.6908,'Tokyo\'nun ikonik ofis kulesi.'),
  p('tyo-o02','Marunouchi Building Ofis','2-4-1 Marunouchi, Chiyoda','office','Marunouchi','Tokyo','JP',25500000,43200,5,139.7648,35.6815,'Tokyo İstasyonu yanı A sınıfı ofis.'),
  p('tyo-o03','Toranomon Hills Ofis','1-23-1 Toranomon, Minato','office','Toranomon','Tokyo','JP',18600000,31200,4,139.7494,35.6673,'Yeni finans merkezi kulesi.'),

  // Mağazalar
  p('tyo-s01','Ginza Flagship Mağaza','5-7-2 Ginza, Chuo','retail','Ginza','Tokyo','JP',24600000,50400,5,139.7685,35.6714,'Tokyo\'nun lüks alışveriş caddesi.'),
  p('tyo-s02','Shibuya Crossing Retail','2-24 Shibuya, Shibuya','retail','Shibuya','Tokyo','JP',16800000,36000,5,139.7016,35.6580,'Dünyanın en yoğun yaya geçidi.'),
  p('tyo-s03','Harajuku Takeshita Dükkanı','1-7 Jingumae, Shibuya','retail','Harajuku','Tokyo','JP',4200000,8400,3,139.7036,35.6700,'Japon pop kültürünün kalbi.'),

  // ═══════════════════════════════════════════════
  //  PARİS
  // ═══════════════════════════════════════════════

  // Oteller
  p('par-h01','Le Bristol Paris','112 Rue du Faubourg Saint-Honoré, 8e','hotel','8e Arrondissement','Paris','FR',1740000000,2940000,5,2.3083,48.8729,'Fransız lüksünün zirvesi.'),
  p('par-h02','Ritz Paris','15 Pl. Vendôme, 1er','hotel','1er Arrondissement','Paris','FR',1260000000,2160000,5,2.3296,48.8686,'Coco Chanel\'in evi olan efsanevi otel.'),
  p('par-h03','Four Seasons George V','31 Ave George V, 8e','hotel','8e Arrondissement','Paris','FR',840000000,1440000,5,2.3010,48.8696,'Champs-Élysées yakını 5 yıldızlı.'),

  // Konutlar
  p('par-r01','Île Saint-Louis Haussmann Dairesi','12 Quai de Bourbon, Île Saint-Louis','residential','Île Saint-Louis','Paris','FR',25500000,32400,5,2.3561,48.8519,'Seine adacığında Haussmann yapısı.'),
  p('par-r02','Marais Haussmann Apart','32 Rue des Archives, 3e','residential','Le Marais','Paris','FR',12600000,16200,4,2.3567,48.8590,'Paris\'in en gözde tarihi mahallesi.'),
  p('par-r03','Saint-Germain Dairesi','8 Bd Saint-Germain, 6e','residential','Saint-Germain','Paris','FR',17400000,22200,5,2.3370,48.8512,'Entelektüeller mahallesi klasik daire.'),
  p('par-r04','16e Passy Lüks Daire','12 Ave Paul Doumer, 16e','residential','Passy','Paris','FR',11400000,14400,4,2.2760,48.8582,'Bourgeois Paris\'in kalbi.'),
  p('par-r05','Montmartre Artist Studio','18 Rue Lepic, Montmartre, 18e','residential','Montmartre','Paris','FR',2940000,3720,3,2.3332,48.8855,'Ressam atelye dairesine dönüşüm.'),
  p('par-r06','Nation Dairesi','44 Av. du Trône, 11e','residential','Nation','Paris','FR',2040000,2580,2,2.3957,48.8487,'Doğu Paris\'te uygun fiyatlı daire.'),
  p('par-r07','Boulogne Riverside Villa','15 Quai du 4 Septembre, Boulogne','residential','Boulogne','Paris','FR',18600000,23400,4,2.2401,48.8405,'Seine kenarında özel bahçeli villa.'),

  // Ofisler
  p('par-o01','La Défense Grande Arche Ofis','1 Parvis de la Défense, Puteaux','office','La Défense','Paris','FR',29400000,51600,5,2.2396,48.8924,'Paris\'in ana iş merkezi.'),
  p('par-o02','8e Arrondissement Ofis','42 Ave des Champs-Élysées, 8e','office','8e Arrondissement','Paris','FR',19200000,32400,4,2.3016,48.8730,'Champs-Élysées üzerinde prestijli ofis.'),

  // Mağazalar
  p('par-s01','Champs-Élysées Butik','86 Ave des Champs-Élysées, 8e','retail','8e Arrondissement','Paris','FR',48000000,86400,5,2.3016,48.8698,'Dünyanın en ünlü bulvarı.'),
  p('par-s02','Galeries Lafayette Kiosk','40 Bd Haussmann, 9e','retail','9e Arrondissement','Paris','FR',24600000,49200,5,2.3327,48.8733,'İkonik Paris mağazasında satış noktası.'),
  p('par-s03','Le Marais Concept Store','56 Rue de Bretagne, 3e','retail','Le Marais','Paris','FR',7200000,14400,4,2.3619,48.8630,'Trendsetterların buluşma noktası.'),

  // ═══════════════════════════════════════════════
  //  BAKÜ
  // ═══════════════════════════════════════════════

  // Oteller
  p('bak-h01','Four Seasons Baku','1 Neftchilar Ave, Baku','hotel','Sahil','Baku','AZ',54000000,96000,5,49.8432,40.3720,'Bakü\'nün en lüks oteli, Hazar manzarası.'),
  p('bak-h02','Fairmont Baku Flame Towers','1 Mehdi Huseyn St, Baku','hotel','Ağ Şəhər','Baku','AZ',36000000,64800,5,49.8672,40.3694,'Alev Kulesi\'ndeki ikonik otel.'),
  p('bak-h03','JW Marriott Absheron','2 Azadlig Ave, Baku','hotel','Sahil','Baku','AZ',25500000,44400,4,49.8502,40.3750,'Azadlık Meydanı yanı prestij otel.'),

  // Konutlar
  p('bak-r01','Flame Towers Residence 18F','1 Mehdi Huseyn St, Baku','residential','Ağ Şəhər','Baku','AZ',9600000,12300,5,49.8672,40.3694,'Alev Kulesi\'nde şehir manzaralı daire.'),
  p('bak-r02','İçərişəhər Tarihi Ev','8 Qoşa Qala, İçərişəhər','residential','İçərişəhər','Baku','AZ',5400000,6900,5,49.8362,40.3662,'UNESCO alanı içinde restore ev.'),
  p('bak-r03','Bulvar Residence Daire','Neftchilar Ave No:14, Sahil','residential','Sahil','Baku','AZ',3600000,4500,4,49.8482,40.3715,'Hazar Bulvarı kenarında daire.'),
  p('bak-r04','Port Baku Residence','153 Neftchilar Ave, Baku','residential','Port Baku','Baku','AZ',7200000,9150,4,49.8622,40.3706,'Liman manzaralı lüks daire.'),
  p('bak-r05','Khagani Street Apart','47 Khagani St, Baku','residential','Şəhər Mərkəzi','Baku','AZ',2040000,2580,3,49.8402,40.3704,'Şehir merkezinde pratik daire.'),

  // Ofisler
  p('bak-o01','Flame Towers Ofis Kat 22','1 Mehdi Huseyn St, Baku','office','Ağ Şəhər','Baku','AZ',9600000,17400,5,49.8672,40.3694,'Bakü\'nün simge kulesinde ofis.'),
  p('bak-o02','Baku White City Ofis','White City Boulevard, Baku','office','Ağ Şəhər','Baku','AZ',5400000,9600,4,49.8700,40.3710,'Yeni iş merkezi bölgesi ofisi.'),

  // Mağazalar
  p('bak-s01','İçərişəhər Butik Dükkânı','12 Kichik Qala, İçərişəhər','retail','İçərişəhər','Baku','AZ',1440000,2880,4,49.8362,40.3662,'UNESCO mirası alanında özel butik.'),
  p('bak-s02','Nizami Caddesi Mağazası','78 Nizami St, Baku','retail','Şəhər Mərkəzi','Baku','AZ',2460000,4920,3,49.8402,40.3704,'Bakü\'nün ana alışveriş caddesi.'),
  p('bak-s03','Port Baku Mall Kiosk','153 Neftchilar Ave, Baku','retail','Port Baku','Baku','AZ',1920000,3840,3,49.8622,40.3706,'Modern AVM\'de köşe kiosk.'),

  // ═══════════════════════════════════════════════
  //  İSTANBUL — PARKLAR, CADDELER, MARİNALAR, MEYDANLAR, STADYUMLAR
  // ═══════════════════════════════════════════════

  p('ist-pa01','Emirgan Korusu','Emirgan Cad. No:107, Sarıyer','park','Emirgan','Istanbul','TR',54000000,64800,5,29.0538,41.1082,'Boğaz kıyısında 3 köşklü tarihi koru, lale bahçeleri.'),
  p('ist-pa02','Yıldız Parkı','Çırağan Cad., Beşiktaş','park','Beşiktaş','Istanbul','TR',66000000,79200,5,29.0166,41.0515,'Osmanlı saray bahçesi, Boğaz manzarası.'),
  p('ist-pa03','Gülhane Parkı','Alemdar Cad., Fatih','park','Eminönü','Istanbul','TR',28500000,34200,4,28.9810,41.0130,'İstanbul\'un en eski halk parkı, Topkapı burnu.'),
  p('ist-pa04','Çamlıca Tepesi','Büyük Çamlıca Cad., Üsküdar','park','Üsküdar','Istanbul','TR',42000000,50400,5,29.0643,41.0275,'Şehrin 360° panoramik manzara tepesi.'),
  p('ist-pa05','Büyükada Çam Koruları','Büyükada, Adalar','park','Adalar','Istanbul','TR',96000000,115200,5,29.1227,40.8752,'Prens Adaları\'nın el değmemiş çam ormanları.'),

  p('ist-st01','İstiklal Caddesi Yol Hakkı','İstiklal Cad., Beyoğlu','street','Beyoğlu','Istanbul','TR',285000000,342000,5,28.9784,41.0335,'Türkiye\'nin en kalabalık yaya caddesi, 3M ziyaretçi/gün.'),
  p('ist-st02','Bağdat Caddesi Koridoru','Bağdat Cad., Kadıköy','street','Bağdat Cad.','Istanbul','TR',234000000,280800,5,29.0500,40.9750,'İstanbul\'un lüks alışveriş ve yaşam şeridi.'),
  p('ist-st03','Bebek Sahil Yolu','Cevdet Paşa Cad., Bebek','street','Bebek','Istanbul','TR',114000000,136800,4,29.0451,41.0774,'Boğaz kıyısının en gözde yürüyüş koridoru.'),
  p('ist-st04','Abdi İpekçi Caddesi','Abdi İpekçi Cad., Nişantaşı','street','Nişantaşı','Istanbul','TR',156000000,187200,5,28.9932,41.0492,'Türkiye\'nin Fifth Avenue\'su, haute couture vitrinleri.'),
  p('ist-st05','Kapalıçarşı Ana Koridoru','Havuzlu Çeşme Sk., Fatih','street','Fatih','Istanbul','TR',84000000,100800,5,28.9680,41.0108,'Kapalıçarşı\'nın 15. yy tarihi ana yolu.'),

  p('ist-mr01','Ataköy Marina','Rıhtım Cad. No:1, Bakırköy','marina','Bakırköy','Istanbul','TR',174000000,208800,5,28.8721,40.9833,'Marmara\'nın en büyük yat limanı, 900 tekne.'),
  p('ist-mr02','Kalamış Marina','Yacht Club Cad., Kadıköy','marina','Fenerbahçe','Istanbul','TR',114000000,136800,4,29.0610,40.9706,'Asya yakasının prestijli yat yeri.'),
  p('ist-mr03','Bebek Yat Koyu','Bebek Koyu, Bebek','marina','Bebek','Istanbul','TR',72000000,86400,5,29.0451,41.0774,'Boğaz\'ın en değerli küçük doğal koyu.'),
  p('ist-mr04','Tarabya Yat Limanı','Tarabya Sahili, Sarıyer','marina','Tarabya','Istanbul','TR',54000000,64800,4,29.0662,41.1211,'Tarihi Tarabya Koyu, elçilik yazlıkları.'),

  p('ist-lm01','Sultanahmet Meydanı','Sultanahmet Meydanı, Fatih','landmark','Eminönü','Istanbul','TR',840000000,1008000,5,28.9773,41.0054,'Hipodrom üzerine kurulu, Ayasofya-Mavi Cami arası ikonik meydan.'),
  p('ist-lm02','Ortaköy Meydanı','Meclis-i Mebusan Cad., Beşiktaş','landmark','Ortaköy','Istanbul','TR',360000000,432000,5,29.0286,41.0501,'Cami ve Boğaz Köprüsü\'nün iç içe geçtiği ikonik meydan.'),
  p('ist-lm03','Galata Kulesi Meydanı','Galata Meydanı, Beyoğlu','landmark','Beyoğlu','Istanbul','TR',255000000,306000,5,28.9742,41.0256,'Cenevizliler\'den kalma 14. yy kulesinin tarihi meydanı.'),
  p('ist-lm04','Dolmabahçe Sahil Şeridi','Çırağan Cad. No:1, Beşiktaş','landmark','Beşiktaş','Istanbul','TR',1140000000,1368000,5,29.0004,41.0389,'Dolmabahçe Sarayı ile Boğaz arasındaki 600m sahil.'),
  p('ist-lm05','Rumelihisarı Surları','Yahya Kemal Cad. No:42, Sarıyer','landmark','Bebek','Istanbul','TR',195000000,234000,4,29.0540,41.0900,'1452\'de Fatih\'in inşa ettirdiği Boğaz kalesi.'),

  p('ist-sd01','Vodafone Park','Dolmabahçe Cad. No:2, Beşiktaş','stadium','Beşiktaş','Istanbul','TR',1140000000,1710000,5,29.0054,41.0403,'Beşiktaş JK\'nın 43,000 kişilik Boğaz manzaralı yuvası.'),
  p('ist-sd02','Türk Telekom Stadyumu','Ali Sami Yen Spor Kompleksi, Sarıyer','stadium','Maslak','Istanbul','TR',1260000000,1890000,5,29.0310,41.1110,'Galatasaray\'ın 52,652 kişilik çift halkalı stadı.'),
  p('ist-sd03','Ülker Stadyumu','Kadıköy Spor Kompleksi, Kadıköy','stadium','Kadıköy','Istanbul','TR',960000000,1440000,5,29.0372,40.9928,'Fenerbahçe\'nin 50,530 kişilik kale surlu stadı.'),

  p('ist-lot01','Taksim Metro Otoparkı','İstiklal Cad. Altı, Beyoğlu','parking','Beyoğlu','Istanbul','TR',84000000,100800,3,28.9784,41.0369,'İstanbul\'un en yoğun merkezi kapalı otopark.'),
  p('ist-lot02','Levent Tower Otoparkı','Büyükdere Cad. No:255, Maslak','parking','Maslak','Istanbul','TR',54000000,64800,3,29.0152,41.1020,'Finans kuleleri altında 8 katlı otopark.'),

  // ═══════════════════════════════════════════════
  //  DUBAİ — PARKLAR, CADDELER, MARİNALAR, MEYDANLAR, STADYUMLAR
  // ═══════════════════════════════════════════════

  p('dxb-pa01','Safa Park','Al Wasl Rd, Jumeirah','park','Jumeirah','Dubai','AE',126000000,151200,4,55.2279,25.1884,'Dubai\'nin en sevilen 64 hektarlık halk parkı.'),
  p('dxb-pa02','Zabeel Park','Zabeel Rd, Karama','park','Karama','Dubai','AE',174000000,208800,4,55.3040,25.2248,'32 hektarlık şehir merkezi parkı, teleskop kulesi.'),
  p('dxb-pa03','Al Barsha Pond Park','Al Barsha Dr, Al Barsha','park','Al Barsha','Dubai','AE',84000000,100800,3,55.1998,25.1107,'Göl etrafında ağaçlık şehir parkı.'),

  p('dxb-st01','Sheikh Zayed Road Koridoru','Sheikh Zayed Rd, Trade Centre','street','Trade Centre','Dubai','AE',2040000000,2448000,5,55.2799,25.2175,'Dubai\'nin omurgası, 55 km\'lik ikonik bulvar.'),
  p('dxb-st02','JBR The Walk','JBR Walk, Dubai Marina','street','JBR','Dubai','AE',660000000,792000,5,55.1280,25.0760,'1.7 km açık hava sahil alışveriş koridoru.'),
  p('dxb-st03','Downtown Boulevard','Mohammed Bin Rashid Blvd','street','Downtown','Dubai','AE',1140000000,1368000,5,55.2757,25.1928,'Burj Khalifa\'yı çevreleyen ana bulvar halkası.'),

  p('dxb-mr01','Dubai Marina Yat Limanı','Marina Walk, Dubai Marina','marina','Dubai Marina','Dubai','AE',840000000,1008000,5,55.1402,25.0812,'200+ yatı barındıran yapay kanal mega marinası.'),
  p('dxb-mr02','Dubai Creek Harbor Rıhtımı','Creek Blvd, Dubai Creek','marina','Dubai Creek','Dubai','AE',285000000,342000,4,55.3518,25.2047,'Tarihi halicin yeni nesil liman bölgesi.'),
  p('dxb-mr03','Palm Jumeirah Özel Koyu','Crescent Rd, Palm Jumeirah','marina','Palm Jumeirah','Dubai','AE',555000000,666000,5,55.1304,25.1305,'Palm\'ın ucundaki VIP yat koyu.'),

  p('dxb-lm01','Burj Khalifa Esplanadı','1 Mohammed Bin Rashid Blvd','landmark','Downtown','Dubai','AE',2640000000,3168000,5,55.2744,25.1972,'Dünyanın en yüksek yapısının çevresi, Dubai Fountain.'),
  p('dxb-lm02','Dubai Frame Meydanı','Zabeel Park, Zabeel','landmark','Karama','Dubai','AE',285000000,342000,4,55.3002,25.2349,'150m yüksekliğindeki altın çerçevenin meydanı.'),
  p('dxb-lm03','Museum of the Future Bahçesi','One Central, DWTC','landmark','Trade Centre','Dubai','AE',450000000,540000,5,55.2820,25.2130,'Zaha Hadid\'in halef mimarisi – geleceğin müzesi çevresi.'),
  p('dxb-lm04','Global Village Festivali Alanı','Sheikh Mohammed Bin Zayed Rd','landmark','Global Village','Dubai','AE',255000000,306000,4,55.3064,25.0676,'90 ülke pavyonunun 1.6 km koridoru.'),

  p('dxb-sd01','Dubai World Cup Pisti','Nad Al Sheba, Dubai','stadium','Nad Al Sheba','Dubai','AE',2040000000,3060000,5,55.3161,25.1614,'Dünyanın en zengin yarış ödüllü hipodromu.'),
  p('dxb-sd02','Coca-Cola Arena','City Walk, Al Wasl','stadium','City Walk','Dubai','AE',1140000000,1710000,4,55.2405,25.1943,'17,000 kişilik tam kapalı çok amaçlı arena.'),

  // ═══════════════════════════════════════════════
  //  NEW YORK — PARKLAR, CADDELER, MARİNALAR, MEYDANLAR, STADYUMLAR
  // ═══════════════════════════════════════════════

  p('nyc-pa01','Central Park Bethesda Terrace','Central Park, Midtown','park','Midtown','New York','US',2460000000,2952000,5,-73.9713,40.7735,'341 hektarlık ikonik şehir parkının kalbi.'),
  p('nyc-pa02','High Line Parkı','W 30th St - Gansevoort St, Chelsea','park','Chelsea','New York','US',1140000000,1368000,5,-74.0048,40.7480,'Eski yük treni rayları üstüne kurulu 2.3 km park.'),
  p('nyc-pa03','Brooklyn Bridge Park','Furman St, Brooklyn Heights','park','Brooklyn Heights','New York','US',660000000,792000,5,-73.9970,40.6996,'Manhattan ve köprü manzaralı East River parkı.'),
  p('nyc-pa04','Prospect Park','Grand Army Plaza, Brooklyn','park','Park Slope','New York','US',1260000000,1512000,4,-73.9721,40.6602,'Brooklyn\'ün Olmsted tasarımlı 526 hektarlık büyük parkı.'),

  p('nyc-st01','5th Avenue Koridoru','5th Ave, Midtown','street','Midtown','New York','US',9600000000,11520000,5,-73.9712,40.7613,'Dünyanın birim başına en pahalı alışveriş adresi.'),
  p('nyc-st02','Broadway Caddesi','Broadway, Midtown','street','Midtown','New York','US',6600000000,7920000,5,-73.9855,40.7580,'Tiyatro ve ticaretin efsanevi ana koridoru.'),
  p('nyc-st03','Wall Street Koridoru','Wall St, Financial District','street','Financial District','New York','US',3600000000,4320000,5,-74.0089,40.7069,'Küresel finans başkentinin tarihi sokağı.'),
  p('nyc-st04','Madison Avenue','Madison Ave, Midtown','street','Midtown','New York','US',4800000000,5760000,5,-73.9623,40.7747,'Reklam endüstrisinin ve lüks galeri sokağının ikonik adresi.'),

  p('nyc-mr01','Manhattan Yacht Club Pier','N Moore St, Tribeca','marina','Tribeca','New York','US',285000000,342000,4,-74.0140,40.7218,'Hudson Nehri\'nde prestijli özel yat iskelesi.'),
  p('nyc-mr02','Brooklyn Navy Yard Marina','Flushing Ave, Williamsburg','marina','Williamsburg','New York','US',435000000,522000,3,-73.9602,40.7002,'Tarihi ABD Deniz Kuvvetleri tersanesinin marina alanı.'),

  p('nyc-lm01','Times Square Meydanı','Broadway & 7th Ave, Midtown','landmark','Midtown','New York','US',8400000000,10080000,5,-73.9855,40.7580,'50M+/yıl ziyaretçiyle dünyanın "Dünya\'nın Merkezi".'),
  p('nyc-lm02','Özgürlük Heykeli Adası','Liberty Island, Harbor','landmark','Financial District','New York','US',2640000000,3168000,5,-74.0445,40.6892,'1886\'dan beri ABD\'nin özgürlük simgesi, tarihi ada.'),
  p('nyc-lm03','Brooklyn Bridge Yürüyüş Yolu','Brooklyn Bridge, DUMBO','landmark','DUMBO','New York','US',1860000000,2232000,5,-73.9969,40.7061,'1883\'ten beri New York\'un simge yaya köprüsü.'),
  p('nyc-lm04','Rockefeller Center Sahası','1221 6th Ave, Midtown','landmark','Midtown','New York','US',4200000000,5040000,5,-73.9800,40.7585,'Noel buz pisti ve 70 katlı Art Deco kompleksi.'),

  p('nyc-sd01','Madison Square Garden','4 Penn Plaza, Midtown','stadium','Midtown','New York','US',3600000000,5400000,5,-73.9939,40.7505,'20,000 kişilik "Dünyanın En Ünlü Arenası".'),
  p('nyc-sd02','Yankee Stadium','1 E 161st St, South Bronx','stadium','Bronx','New York','US',2040000000,3060000,5,-73.9264,40.8296,'54,000 kişilik MLB\'nin en ünlü takımı Yankees yuvası.'),

  // ═══════════════════════════════════════════════
  //  LONDRA — PARKLAR, CADDELER, MARİNALAR, MEYDANLAR, STADYUMLAR
  // ═══════════════════════════════════════════════

  p('lon-pa01','Hyde Park','Hyde Park, Westminster','park','Westminster','London','GB',9600000000,11520000,5,-0.1657,51.5073,'Londra\'nın ikonik 142 hektarlık kraliyet parkı.'),
  p('lon-pa02','Kensington Gardens','Kensington Gardens, Kensington','park','Kensington','London','GB',6600000000,7920000,5,-0.1757,51.5057,'Peter Pan\'ın evi, Kraliçe Anne\'nin resmi bahçesi.'),
  p('lon-pa03','Greenwich Park','Greenwich Park, Greenwich','park','Greenwich','London','GB',3600000000,4320000,5,-0.0013,51.4769,'Meridyen sıfır noktası ve kraliyet gözlemevi parkı.'),
  p('lon-pa04','Regent\'s Park','Regent\'s Park, Westminster','park','Marylebone','London','GB',4800000000,5760000,5,-0.1545,51.5313,'ZOO, gül bahçesi ve açık hava tiyatrosu olan 197 ha park.'),

  p('lon-st01','Oxford Street Koridoru','Oxford St, Westminster','street','Westminster','London','GB',15600000000,18720000,5,-0.1408,51.5154,'Avrupa\'nın en kalabalık 300M+/yıl ziyaretçi alışveriş caddesi.'),
  p('lon-st02','Bond Street','Bond St, Mayfair','street','Mayfair','London','GB',7800000000,9360000,5,-0.1458,51.5130,'Lüks saatçilerin ve haute joaillerie\'nin ikonik sokağı.'),
  p('lon-st03','Carnaby Street','Carnaby St, Soho','street','Soho','London','GB',2340000000,2808000,4,-0.1399,51.5143,'1960\'ların mod modasının doğduğu efsanevi sokak.'),
  p('lon-st04','King\'s Road','King\'s Rd, Chelsea','street','Chelsea','London','GB',3300000000,3960000,4,-0.1754,51.4870,'Chelsea\'nin punk ve moda tarihinin omurgası.'),

  p('lon-mr01','St. Katharine Docks Marina','St. Katharine\'s Way, Tower Hill','marina','Tower Hill','London','GB',960000000,1152000,5,-0.0720,51.5055,'Tower Bridge yanı tarihi dok – lüks yat limanına dönüşüm.'),
  p('lon-mr02','Canary Wharf West India Docks','West India Ave, Canary Wharf','marina','Canary Wharf','London','GB',660000000,792000,4,-0.0210,51.5070,'Bankacılık adası etrafındaki tarihi ticaret doku.'),

  p('lon-lm01','Buckingham Palace Bahçesi','Buckingham Palace Rd, Westminster','landmark','Westminster','London','GB',15600000000,18720000,5,-0.1419,51.5014,'Kraliyet sarayının 39 hektarlık özel bahçesi ve törenleri.'),
  p('lon-lm02','Tower Bridge Güney Bankı','Tower Bridge Rd, Southwark','landmark','South Bank','London','GB',2040000000,2448000,5,-0.0755,51.5055,'1894\'ten beri Londra\'nın simgesi, Viktorya açılır köprü.'),
  p('lon-lm03','Westminster Parliament Meydanı','Parliament Sq, Westminster','landmark','Westminster','London','GB',3300000000,3960000,5,-0.1246,51.5007,'Big Ben, Westminster Abbey ve Parlamento\'nun önü.'),
  p('lon-lm04','Trafalgar Meydanı','Trafalgar Sq, Westminster','landmark','Westminster','London','GB',2340000000,2808000,5,-0.1281,51.5080,'Nelson\'s Column etrafındaki tarihi milli meydan.'),

  p('lon-sd01','Wembley Stadyumu','Wembley, Brent','stadium','Wembley','London','GB',4200000000,6300000,5,-0.2795,51.5560,'90,000 kişilik FA Cup ve milli takım yuvası.'),
  p('lon-sd02','Emirates Stadyumu','Queensland Rd, Holloway','stadium','Holloway','London','GB',2040000000,3060000,4,-0.1088,51.5549,'Arsenal\'in 60,704 kişilik sektöre referans olan evi.'),
  p('lon-sd03','Stamford Bridge','Fulham Rd, Chelsea','stadium','Chelsea','London','GB',1740000000,2610000,4,-0.1910,51.4816,'Chelsea FC\'nin 1877\'den beri tarihi sahası.'),

  // ═══════════════════════════════════════════════
  //  TOKYO — PARKLAR, CADDELER, MARİNALAR, MEYDANLAR, STADYUMLAR
  // ═══════════════════════════════════════════════

  p('tyo-pa01','Shinjuku Gyoen','11 Naito-machi, Shinjuku','park','Shinjuku','Tokyo','JP',1350000000,1620000,5,139.7109,35.6852,'144 hektarlık 70,000 ağaçlı ulusal Japon bahçesi.'),
  p('tyo-pa02','Ueno Parkı','Ueno, Taito','park','Ueno','Tokyo','JP',960000000,1152000,4,139.7741,35.7153,'Müzeler, zoo ve en ünlü sakura korusunu barındıran park.'),
  p('tyo-pa03','Yoyogi Parkı','2-1 Yoyogi Kamizonocho, Shibuya','park','Harajuku','Tokyo','JP',1140000000,1368000,4,139.6972,35.6710,'2 milyon m² cosplay, müzisyenler ve piknik parkı.'),
  p('tyo-pa04','Imperial Palace Doğu Bahçesi','1-1 Chiyoda, Chiyoda','park','Marunouchi','Tokyo','JP',6600000000,7920000,5,139.7630,35.6860,'İmparatorluk Sarayı\'nın halkına açık tarihi bahçe alanı.'),

  p('tyo-st01','Ginza Chuo Dori','Chuo Dori, Ginza','street','Ginza','Tokyo','JP',7800000000,9360000,5,139.7685,35.6714,'Japonya\'nın en pahalı toprağındaki lüks mağazalar caddesi.'),
  p('tyo-st02','Omotesando Avenue','Omotesando, Shibuya','street','Aoyama','Tokyo','JP',5700000000,6840000,5,139.7134,35.6633,'Tokyo\'nun "Champs-Élysées\'si", mimar imzalı butik vitrinleri.'),
  p('tyo-st03','Akihabara Electric Town Street','Chuo Dori, Chiyoda','street','Akihabara','Tokyo','JP',3300000000,3960000,4,139.7729,35.7022,'Elektronik, anime ve otaku kültürünün dünya merkezi.'),
  p('tyo-st04','Takeshita Caddesi','1-17 Jingumae, Shibuya','street','Harajuku','Tokyo','JP',2040000000,2448000,3,139.7036,35.6700,'Japon kawaii ve harajuku moda kültürünün kalbi.'),

  p('tyo-mr01','Odaiba Waterfront İskelesi','2-1 Daiba, Minato','marina','Odaiba','Tokyo','JP',285000000,342000,4,139.7759,35.6246,'Gökkuşağı Köprüsü manzaralı Tokyo Körfezi yat iskelesi.'),
  p('tyo-mr02','Hinode Feribot İskelesi','1 Kaigan, Minato','marina','Odaiba','Tokyo','JP',204000000,244800,3,139.7577,35.6434,'Tokyo Körfezi\'ndeki tarihi feribot ve tekne iskelesi.'),

  p('tyo-lm01','Shibuya Crossing Alanı','2-1 Dogenzaka, Shibuya','landmark','Shibuya','Tokyo','JP',4200000000,5040000,5,139.7016,35.6580,'2.5M+/gün yaya trafiğiyle dünyanın en yoğun kavşağı.'),
  p('tyo-lm02','Tokyo Tower Esplanadı','4-2-8 Shibakoen, Minato','landmark','Shiba','Tokyo','JP',1350000000,1620000,5,139.7454,35.6586,'1958\'den beri Tokyo silüetinin simgesi, çevre alanı.'),
  p('tyo-lm03','Sensoji Nakamise Yolu','2-3-1 Asakusa, Taito','landmark','Asakusa','Tokyo','JP',960000000,1152000,4,139.7966,35.7148,'628\'den beri açık, 250m\'lik tarihi çarşı koridoru.'),
  p('tyo-lm04','Tsukiji Outer Market','4-16-2 Tsukiji, Chuo','landmark','Tsukiji','Tokyo','JP',630000000,756000,4,139.7699,35.6658,'Dünyanın en ünlü balık pazarı çevre alışveriş sokakları.'),

  p('tyo-sd01','Japan National Stadium','10-2 Kasumigaokamachi, Shinjuku','stadium','Shinjuku','Tokyo','JP',2940000000,4410000,5,139.7138,35.6781,'60,102 kişilik 2020 Tokyo Olimpiyatları ana stadyumu.'),
  p('tyo-sd02','Tokyo Dome','1-3-61 Koraku, Bunkyo','stadium','Koraku','Tokyo','JP',2040000000,3060000,4,139.7517,35.7058,'55,000 kişilik Japonya\'nın ilk kapalı çok amaçlı stadı.'),

  // ═══════════════════════════════════════════════
  //  PARİS — PARKLAR, CADDELER, MARİNALAR, MEYDANLAR, STADYUMLAR
  // ═══════════════════════════════════════════════

  p('par-pa01','Bois de Boulogne','Route de Suresnes, 16e','park','16e Arrondissement','Paris','FR',6600000000,7920000,5,2.2424,48.8555,'845 hektarlık Paris\'in kuzey ormanı, Roland-Garros içinde.'),
  p('par-pa02','Tuileries Bahçesi','Rue de Rivoli, 1er','park','1er Arrondissement','Paris','FR',3600000000,4320000,5,2.3322,48.8634,'Louvre\'dan Concorde\'a uzanan 28 hektarlık kraliyet bahçesi.'),
  p('par-pa03','Luxembourg Bahçesi','6 Place Auguste-Comte, 6e','park','6e Arrondissement','Paris','FR',2460000000,2952000,5,2.3370,48.8462,'Sorbonne\'un bitişiğinde 23 hektarlık Fransız senato bahçesi.'),
  p('par-pa04','Bois de Vincennes','Route de la Pyramide, 12e','park','12e Arrondissement','Paris','FR',4200000000,5040000,4,2.4399,48.8314,'Paris\'in güney ormanı, 995 hektar, dört göl ve şatosu.'),

  p('par-st01','Champs-Élysées Koridoru','Av. des Champs-Élysées, 8e','street','8e Arrondissement','Paris','FR',29400000000,35280000,5,2.3016,48.8698,'Dünyanın en ünlü 1.9 km bulvarı, Tour de France finişi.'),
  p('par-st02','Rue du Faubourg Saint-Honoré','Rue du Faubourg Saint-Honoré, 8e','street','8e Arrondissement','Paris','FR',7800000000,9360000,5,2.3083,48.8729,'Fransız haute couture ve cumhurbaşkanlığı sarayının caddesi.'),
  p('par-st03','Boulevard Haussmann','Bd Haussmann, 9e','street','9e Arrondissement','Paris','FR',5700000000,6840000,5,2.3327,48.8733,'Galeries Lafayette ve Printemps\'ın büyük mağazalar bulvarı.'),
  p('par-st04','Rue de Rivoli','Rue de Rivoli, 1er','street','1er Arrondissement','Paris','FR',4200000000,5040000,4,2.3425,48.8587,'Louvre yanik tarihi alışveriş caddesi, 2 km.'),

  p('par-mr01','Seine Pont d\'Iéna İskelesi','Pont d\'Iéna, 16e','marina','16e Arrondissement','Paris','FR',285000000,342000,4,2.2892,48.8614,'Eiffel Kulesi altında Seine nehir yat iskelesi.'),
  p('par-mr02','Port Arsenal Marina','Bd de la Bastille, 12e','marina','12e Arrondissement','Paris','FR',225000000,270000,4,2.3691,48.8502,'Bastille yanı kanal ve Seine\'i birleştiren yat limanı.'),

  p('par-lm01','Eiffel Kulesi Esplanadı','Champ de Mars, 7e','landmark','7e Arrondissement','Paris','FR',42000000000,50400000,5,2.2945,48.8584,'7M+/yıl ile dünyanın en çok ziyaret edilen anıtın meydanı.'),
  p('par-lm02','Louvre Piramit Avlusu','Rue de Rivoli, 1er','landmark','1er Arrondissement','Paris','FR',25500000000,30600000,5,2.3364,48.8606,'9M+/yıl ziyaretçiyle dünyanın en çok ziyaret edilen müzesinin avlusu.'),
  p('par-lm03','Notre-Dame Katedrali Meydanı','Parvis Notre-Dame, 4e','landmark','Île de la Cité','Paris','FR',9600000000,11520000,5,2.3499,48.8530,'2024\'te yeniden açılan 850 yıllık gotik katedralin önü.'),
  p('par-lm04','Place Vendôme','Pl. Vendôme, 1er','landmark','1er Arrondissement','Paris','FR',5700000000,6840000,5,2.3296,48.8686,'Cartier, Ritz ve Chopard\'ın çevrelediği Napolyon meydanı.'),
  p('par-lm05','Pont des Arts Köprüsü','Pont des Arts, 6e','landmark','6e Arrondissement','Paris','FR',1740000000,2088000,4,2.3374,48.8580,'Aşk kilitleriyle ünlü Louvre-Enstitü arası yaya köprüsü.'),

  p('par-sd01','Stade de France','93210 Saint-Denis, Paris','stadium','Saint-Denis','Paris','FR',4200000000,6300000,5,2.3608,48.9244,'81,338 kişilik Fransa milli stadyumu.'),
  p('par-sd02','Parc des Princes','24 Rue du Commandant Guilbaud, 16e','stadium','16e Arrondissement','Paris','FR',2040000000,3060000,4,2.2529,48.8415,'PSG\'nin 47,929 kişilik tarihi yuvası.'),

  // ═══════════════════════════════════════════════
  //  BAKÜ — PARKLAR, CADDELER, MARİNALAR, MEYDANLAR, STADYUMLAR
  // ═══════════════════════════════════════════════

  p('bak-pa01','Heydar Aliyev Parkı','Heydar Aliyev Ave, Ağ Şəhər','park','Ağ Şəhər','Baku','AZ',54000000,64800,4,49.8672,40.3810,'Modern cumhurbaşkanlığı merkezinin tarihi parkı.'),
  p('bak-pa02','Sahil Bulvar Parkı','Neftchilar Ave, Sahil','park','Sahil','Baku','AZ',114000000,136800,5,49.8432,40.3700,'Hazar kıyısı boyunca 5 km sahil yürüyüş ve eğlence parkı.'),
  p('bak-pa03','Nagorny Park','Mehdi Huseyn Blvd, Baku','park','Nagorny','Baku','AZ',36000000,43200,4,49.8570,40.3752,'Şehir ve Hazar manzaralı tepe parkı.'),

  p('bak-st01','Nizami Caddesi Koridoru','Nizami St, Şəhər Mərkəzi','street','Şəhər Mərkəzi','Baku','AZ',204000000,244800,4,49.8402,40.3704,'Bakü\'nün ana alışveriş ve sosyal yaşam caddesi.'),
  p('bak-st02','Neftchilar Bulvarı','Neftchilar Ave, Sahil','street','Sahil','Baku','AZ',285000000,342000,5,49.8482,40.3715,'Hazar kıyısı boyunca uzanan prestijli sahil şeridi.'),
  p('bak-st03','İçərişəhər Kichik Qala Sokakları','Kichik Qala, İçərişəhər','street','İçərişəhər','Baku','AZ',96000000,115200,4,49.8362,40.3662,'UNESCO koruması altındaki 12. yy kale içi tarihi sokakları.'),

  p('bak-mr01','Bakü Körfezi Yat Limanı','Heydar Aliyev Ave, Sahil','marina','Sahil','Baku','AZ',165000000,198000,4,49.8432,40.3680,'Hazar Denizi kıyısında özel yat ve tekne limanı.'),
  p('bak-mr02','Bibi-Heybat Limanı','Bibi-Heybat, Baku','marina','Bibi-Heybat','Baku','AZ',66000000,79200,3,49.8740,40.3400,'Tarihi Bibi-Heybat Cami yanı tekne ve balıkçı limanı.'),

  p('bak-lm01','Qız Qalası Meydanı','Old City, İçərişəhər','landmark','İçərişəhər','Baku','AZ',285000000,342000,5,49.8372,40.3660,'UNESCO mirası 12. yy Kız Kulesi ve tarihi meydan.'),
  p('bak-lm02','Alev Kuleleri Esplanadı','1 Mehdi Huseyn St, Ağ Şəhər','landmark','Ağ Şəhər','Baku','AZ',660000000,792000,5,49.8672,40.3694,'3 alev şekilli kuleni önündeki gece show esplanadı.'),
  p('bak-lm03','Heydar Aliyev Merkezi','1 Heydar Aliyev Ave, Ağ Şəhər','landmark','Ağ Şəhər','Baku','AZ',435000000,522000,5,49.8700,40.3975,'Zaha Hadid imzalı dalga formlu müze ve kültür merkezi.'),
  p('bak-lm04','Azadlıq Meydanı','Azadlig Ave, Sahil','landmark','Sahil','Baku','AZ',234000000,280800,4,49.8502,40.3750,'Bağımsızlık meydanı, Bakü\'nün siyasi ve kültürel kalbi.'),

  p('bak-sd01','Bakı Olimpiya Stadyumu','Heydar Aliyev Ave, Baku','stadium','Ağ Şəhər','Baku','AZ',960000000,1440000,5,49.9093,40.4086,'68,700 kişilik UEFA Avrupa Ligi ve Azerbaycan F1 Grand Prix pisti.'),
  p('bak-sd02','Tofiq Bahramov Stadyumu','32A Mirali Qaşqay St, Baku','stadium','Sahil','Baku','AZ',285000000,427500,3,49.8562,40.3720,'1966 Dünya Kupası finali hakemine adanmış tarihi stad.'),

  // ═══════════════════════════════════════════════
  //  İSTANBUL — YALILAR, VİLLALAR, DAİRELER, DUBLEX, PENTHOUSE, BİNA
  // ═══════════════════════════════════════════════

  // Yalılar
  p('ist-ya01','Çengelköy Osmanlı Yalısı','Çengelköy Cad. No:4, Üsküdar','yali','Üsküdar','Istanbul','TR',255000000,306000,5,29.0740,41.0580,'18. yy ahşap yalı, Boğaz\'a sıfır, orijinal yapı korunmuş.'),
  p('ist-ya02','Kandilli Boğaz Yalısı','Kandilli Cad. No:8, Üsküdar','yali','Üsküdar','Istanbul','TR',156000000,187200,5,29.0590,41.0640,'Kandilli tepesinin eteğinde tarihi boğaz yalısı.'),
  p('ist-ya03','Anadoluhisarı Ahşap Yalı','Hisar İçi Sokak No:3, Beykoz','yali','Beykoz','Istanbul','TR',114000000,136800,4,29.0620,41.0830,'1456 fetih döneminden kalma restore ahşap yapı.'),
  p('ist-ya04','Arnavutköy Boğaz Yalısı','Arnavutköy Cad. No:42, Beşiktaş','yali','Arnavutköy','Istanbul','TR',204000000,244800,5,29.0391,41.0710,'Su üstü yapı, Boğaz\'dan tekne erişimli.'),
  p('ist-ya05','Sarıyer Büyük Boğaz Yalısı','Büyük Çamlıca Sk. No:1, Sarıyer','yali','Tarabya','Istanbul','TR',126000000,151200,4,29.0610,41.1250,'Boğaz köprüsü manzaralı geniş yalı.'),
  p('ist-ya06','Yeniköy Bodrum Çıkışlı Yalı','Yeniköy Cad. No:18, Sarıyer','yali','Yeniköy','Istanbul','TR',285000000,342000,5,29.0585,41.1022,'Bodrum ve iskele dahil 3 katlı modern yalı.'),

  // Villalar
  p('ist-vi01','Büyükada Köşk','Çankaya Cad. No:8, Adalar','villa','Adalar','Istanbul','TR',54000000,64800,5,29.1227,40.8752,'Prens Adası\'nda arabasız adada ahşap köşk.'),
  p('ist-vi02','Zekeriyaköy Müstakil Villa','Zekeriyaköy Cad. No:24, Sarıyer','villa','Sarıyer','Istanbul','TR',20400000,24480,4,29.0250,41.1820,'Orman içinde geniş bahçeli müstakil villa.'),
  p('ist-vi03','Beykoz Bağevi','Bağ Yolu Sk. No:5, Beykoz','villa','Beykoz','Istanbul','TR',12600000,15120,4,29.1010,41.1280,'Koruluk içinde bahçe ve havuzlu bağ evi.'),
  p('ist-vi04','Çekmeköy Bahçeli Villa','Ömerli Ormanları, Çekmeköy','villa','Çekmeköy','Istanbul','TR',7200000,8640,3,29.1930,41.0320,'İstanbul\'un yeşil köşesinde aile villası.'),
  p('ist-vi05','Çatalca Çiftlik Evi','Çatalca İlçesi, Avrupa Yakası','villa','Çatalca','Istanbul','TR',4800000,5760,3,28.4610,41.1430,'Tarlalı ve ahırlı geniş çiftlik evi.'),

  // Penthouselar
  p('ist-ph01','Maslak 42 Penthouse K.52','Büyükdere Cad. No:255, Maslak','penthouse','Maslak','Istanbul','TR',54000000,86400,5,29.0152,41.1020,'500 m² teras, 360° İstanbul manzarası.'),
  p('ist-ph02','Zorlu Center Penthouse K.36','Levazım Mah. No:1, Beşiktaş','penthouse','Beşiktaş','Istanbul','TR',66000000,105600,5,29.0161,41.0672,'Çift katlı penthouse, özel havuz ve helipad.'),
  p('ist-ph03','Sapphire Tower Penthouse K.58','Büyükdere Cad. No:1, Levent','penthouse','Levent','Istanbul','TR',84000000,134400,5,29.0118,41.0755,'Türkiye\'nin en yüksek binasında 58. kat panorama.'),
  p('ist-ph04','Bebek Köy Penthouse','Cevdet Paşa Cad. No:76, Bebek','penthouse','Bebek','Istanbul','TR',42000000,67200,5,29.0451,41.0774,'Boğaz\'ı izleyen özel teras, butik bina.'),

  // Dubleks daireler
  p('ist-dx01','Nişantaşı Dubleks No:7','Vali Konağı Cad. No:18, Nişantaşı','duplex','Nişantaşı','Istanbul','TR',14400000,23040,5,28.9932,41.0492,'İki katlı lüks dubleks, 280 m², özel giriş.'),
  p('ist-dx02','Bebek Dubleks Daire 4A','Bebek Cad. No:52, Bebek','duplex','Bebek','Istanbul','TR',18600000,29760,5,29.0451,41.0774,'Boğaz manzaralı çift katlı, 320 m² dubleks.'),
  p('ist-dx03','Etiler Dubleks Blok C','Nispetiye Cad. No:28, Etiler','duplex','Etiler','Istanbul','TR',10200000,16320,4,29.0302,41.0700,'Site içi dubleks, özel bahçe çıkışı.'),
  p('ist-dx04','Ataşehir Tripleks Villa','Ataşehir Bulvarı No:45, Ataşehir','duplex','Ataşehir','Istanbul','TR',8400000,13440,4,29.1190,40.9932,'Üç katlı tripleks, geniş otoparklı.'),

  // Stüdyo daireler
  p('ist-su01','Kadıköy 1+0 Stüdyo','Moda Cad. No:22, Kadıköy','studio','Moda','Istanbul','TR',1740000,2784,3,29.0322,40.9848,'Trendy Moda semtinde tam donanımlı stüdyo.'),
  p('ist-su02','Beşiktaş Stüdyo Daire','Sinanpaşa Mah. No:8, Beşiktaş','studio','Beşiktaş','Istanbul','TR',2160000,3456,3,29.0161,41.0440,'Çarşı yakını 35 m² stüdyo, eşyalı.'),
  p('ist-su03','Karaköy Loft Stüdyo','Bankalar Cad. No:12, Karaköy','studio','Karaköy','Istanbul','TR',2940000,4704,4,28.9752,41.0271,'Endüstriyel dönüşüm, yüksek tavan loft stüdyo.'),
  p('ist-su04','Levent Mini Daire','Büyükdere Cad. No:80, Levent','studio','Levent','Istanbul','TR',2520000,4032,3,29.0118,41.0755,'Finans merkezi yanı akıllı stüdyo.'),
  p('ist-su05','Üsküdar İskele Stüdyosu','Paşa Limanı Cad., Üsküdar','studio','Üsküdar','Istanbul','TR',1860000,2976,3,29.0244,41.0230,'Vapur iskelesi yanı boğaz manzaralı stüdyo.'),

  // Bahçe katı daireleri
  p('ist-ga01','Bebek Bahçe Katı Daire','Bebek Cad. No:28, Bebek','garden_unit','Bebek','Istanbul','TR',9600000,15360,4,29.0451,41.0774,'Özel bahçe girişli, 80 m² avlulu zemin kat.'),
  p('ist-ga02','Nişantaşı Bahçeli Zemin Kat','Abdi İpekçi Cad. No:6, Nişantaşı','garden_unit','Nişantaşı','Istanbul','TR',7800000,12480,4,28.9932,41.0492,'Bahçe erişimli butik bina zemin katı.'),
  p('ist-ga03','Fenerbahçe Bahçe Dairesi','Bağdat Cad. No:205, Kadıköy','garden_unit','Fenerbahçe','Istanbul','TR',5700000,9120,4,29.0610,40.9706,'250 m² özel bahçeli zemin kat daire.'),
  p('ist-ga04','Üsküdar Bahçeli Apartman Katı','Büyük Hamam Sk. No:4, Üsküdar','garden_unit','Üsküdar','Istanbul','TR',3300000,5280,3,29.0244,41.0230,'Restore binanın bahçe çıkışlı zemin katı.'),

  // Çatı katı daireleri
  p('ist-rt01','Cihangir Çatı Katı','Sıraselviler Cad. No:44, Beyoğlu','rooftop_unit','Beyoğlu','Istanbul','TR',8400000,13440,4,28.9826,41.0340,'İstanbul manzaralı 180° açık teras çatı katı.'),
  p('ist-rt02','Galata Çatı Dairesi','Galip Dede Cad. No:30, Beyoğlu','rooftop_unit','Beyoğlu','Istanbul','TR',10200000,16320,5,28.9742,41.0256,'Galata Kulesi görünümlü açık çatı terası.'),
  p('ist-rt03','Ortaköy Çatı Katı','Muallim Naci Cad. No:90, Beşiktaş','rooftop_unit','Ortaköy','Istanbul','TR',6600000,10560,4,29.0286,41.0501,'Boğaz Köprüsü\'ne karşı özel çatı katı.'),

  // Tüm binalar
  p('ist-bl01','Beyoğlu 6 Katlı Apartman','Tarlabaşı Blv. No:32, Beyoğlu','building','Beyoğlu','Istanbul','TR',84000000,134400,4,28.9784,41.0369,'18 daireli komple bina, ticari+konut karma.'),
  p('ist-bl02','Kadıköy 8 Katlı Kiralık Blok','Moda Cad. No:86, Kadıköy','building','Moda','Istanbul','TR',66000000,105600,4,29.0322,40.9848,'24 daireli kiralık gelir binası.'),
  p('ist-bl03','Nişantaşı Butik Apartman','Teşvikiye Cad. No:44, Nişantaşı','building','Nişantaşı','Istanbul','TR',114000000,182400,5,28.9932,41.0492,'6 dairelik lüks butik bina, her kat ayrı.'),

  // Sıra ev / Townhouse
  p('ist-th01','Arnavutköy Sıra Ev No:7','Arnavutköy Cad. No:7, Beşiktaş','townhouse','Arnavutköy','Istanbul','TR',25500000,40800,5,29.0391,41.0710,'Boğaz kıyısı tarihi sıra ev, restore 1890.'),
  p('ist-th02','Kuzguncuk Sıra Ev','İcadiye Cad. No:15, Üsküdar','townhouse','Üsküdar','Istanbul','TR',15600000,24960,4,29.0380,41.0360,'Rum mahallesinin son ahşap sıra evlerinden.'),
  p('ist-th03','Çekmeköy Townhouse K.A','Şehir Yolu Blv., Çekmeköy','townhouse','Çekmeköy','Istanbul','TR',8400000,13440,3,29.1930,41.0320,'Bahçeli modern townhouse kompleksi.'),

  // ═══════════════════════════════════════════════
  //  DUBAİ — YALILAR, VİLLALAR, DAİRELER, PENTHOUSE, BİNA
  // ═══════════════════════════════════════════════

  p('dxb-vi01','Emirates Hills Mega Villa','Montgomerie, Emirates Hills','villa','Emirates Hills','Dubai','AE',135000000,162000,5,55.1650,25.0920,'Dubai\'nin Bel-Air\'ı, golf sahası manzaralı 8 odalı villa.'),
  p('dxb-vi02','Palm Frond O Villa','Frond O, Palm Jumeirah','villa','Palm Jumeirah','Dubai','AE',54000000,64800,5,55.1250,25.1150,'Deniz erişimli Palm frond villası, özel iskele.'),
  p('dxb-vi03','Arabian Ranches III Villa','Ranches Blvd No:44, Dubailand','villa','Arabian Ranches','Dubai','AE',12600000,15120,4,55.2730,25.0350,'Kapalı site yeni nesil akıllı villa.'),
  p('dxb-vi04','Jumeirah 1 Villa','Jumeirah St No:88, Jumeirah','villa','Jumeirah','Dubai','AE',25500000,30600,4,55.2142,25.2028,'Sahil yürüyüş mesafesi müstakil villa.'),
  p('dxb-vi05','Dubai Hills Golf Villa','Golf Course Rd, Dubai Hills','villa','Dubai Hills','Dubai','AE',42000000,50400,5,55.2360,25.0960,'18 delik golf sahası kenarında tasarımcı villa.'),

  p('dxb-ph01','Burj Vista Penthouse K.65','Burj Vista Tower 1, Downtown','penthouse','Downtown','Dubai','AE',84000000,134400,5,55.2750,25.1958,'Burj Khalifa\'ya 300m mesafe, çatı havuzu.'),
  p('dxb-ph02','One Palm Penthouse','Palm Trunk, Palm Jumeirah','penthouse','Palm Jumeirah','Dubai','AE',156000000,249600,5,55.1370,25.1200,'Palm\'ın en prestijli 4 katlı penthouse.'),
  p('dxb-ph03','DIFC Penthouse Suite','Gate Village No:3, DIFC','penthouse','DIFC','Dubai','AE',66000000,105600,5,55.2808,25.2090,'Finans merkezi üstü özel helipad penthouse.'),

  p('dxb-su01','Dubai Marina Studio','Marina Walk, Dubai Marina','studio','Dubai Marina','Dubai','AE',1440000,2304,2,55.1402,25.0812,'43 m² tam donanımlı marina view stüdyo.'),
  p('dxb-su02','Business Bay Studio Daire','Executive Tower C, Business Bay','studio','Business Bay','Dubai','AE',1140000,1824,2,55.2620,25.1870,'Kanal manzaralı yeni nesil micro-apartment.'),
  p('dxb-su03','JVC Stüdyo','Circle Mall, JVC','studio','JVC','Dubai','AE',840000,1344,2,55.2100,25.0612,'Uygun fiyatlı akıllı stüdyo, yatırımlık.'),

  p('dxb-dx01','Downtown Duplex','Address Residences, Downtown','duplex','Downtown','Dubai','AE',25500000,40800,5,55.2757,25.1928,'Burj Khalifa manzaralı 2 katlı 480 m² dubleks.'),
  p('dxb-dx02','Palm Garden Duplex','Frond J, Palm Jumeirah','duplex','Palm Jumeirah','Dubai','AE',18600000,29760,4,55.1350,25.1100,'Özel bahçe ve iç havuzlu Palm dubleks.'),

  p('dxb-ga01','JBR Bahçe Katı','The Walk, JBR','garden_unit','JBR','Dubai','AE',7200000,11520,4,55.1280,25.0760,'Sahil şeridinde özel teras çıkışlı zemin kat.'),
  p('dxb-rt01','Marina Çatı Katı','Horizon Tower, Dubai Marina','rooftop_unit','Dubai Marina','Dubai','AE',17400000,27840,4,55.1402,25.0812,'Körfez ve marina manzaralı özel çatı terası.'),

  p('dxb-bl01','JVC 10 Katlı Kiralık Bina','Jumeirah Village Circle','building','JVC','Dubai','AE',84000000,134400,3,55.2100,25.0612,'80 stüdyo ve 1BR içeren tam kiralık blok.'),
  p('dxb-th01','Jumeirah Village Townhouse','Jumeirah Village Circle, Blk 12','townhouse','JVC','Dubai','AE',4800000,7680,3,55.2100,25.0612,'3 katlı 180 m² townhouse, özel bahçe.'),

  // ═══════════════════════════════════════════════
  //  NEW YORK — VİLLALAR, TOWNHOUSE, DAİRELER, PENTHOUSE, STÜDYo
  // ═══════════════════════════════════════════════

  p('nyc-th01','West Village Townhouse','456 W 11th St, West Village','townhouse','West Village','New York','US',25500000,40800,5,-74.0070,40.7339,'1840\'larda inşa Greenwich Village tarihi townhouse.'),
  p('nyc-th02','Brownstone Brooklyn Sıra Ev','234 Berkeley Pl, Park Slope','townhouse','Park Slope','New York','US',12600000,20160,4,-73.9793,40.6735,'1890\'lar sandstone cepheli 5 katlı brownstone.'),
  p('nyc-th03','Harlem Historic Brownstone','126 W 121st St, Harlem','townhouse','Harlem','New York','US',7200000,11520,4,-73.9515,40.8040,'Restore edilmiş Harlem Renaissance dönemi ev.'),
  p('nyc-th04','UES Townhouse','45 E 74th St, Upper East Side','townhouse','Upper East Side','New York','US',54000000,86400,5,-73.9641,40.7725,'Museum Mile yanı 6 katlı Beaux-Arts townhouse.'),

  p('nyc-ph01','432 Park Ave Super Penthouse','432 Park Ave K.88, Midtown','penthouse','Midtown','New York','US',264000000,422400,5,-73.9773,40.7619,'Dünyanın en ince kulesinde 88. kat penthouse.'),
  p('nyc-ph02','Tribeca Penthouse','443 Greenwich St, Tribeca','penthouse','Tribeca','New York','US',66000000,105600,5,-74.0094,40.7218,'A-list celebrity\'lerin mahallesi çatı terası.'),
  p('nyc-ph03','Chelsea Penthouse','515 W 29th St, Chelsea','penthouse','Chelsea','New York','US',42000000,67200,4,-74.0065,40.7510,'High Line üstü özel havuzlu çatı katı.'),

  p('nyc-su01','East Village Stüdyo','142 E 7th St, East Village','studio','East Village','New York','US',1860000,2976,3,-73.9836,40.7261,'Bohemian mahalle, 38 m² sanatçı stüdyosu.'),
  p('nyc-su02','Astoria Queens Stüdyo','32-18 30th Ave, Astoria','studio','Long Island City','New York','US',1440000,2304,2,-73.9276,40.7742,'Queens\'te uygun fiyatlı Manhattan erişimli stüdyo.'),
  p('nyc-su03','Financial District Micro','80 John St, FiDi','studio','Financial District','New York','US',2340000,3744,3,-74.0057,40.7069,'Wall Street\'e 2 dk\'lık 32 m² akıllı daire.'),

  p('nyc-dx01','SoHo Duplex Loft','60 Mercer St, SoHo','duplex','SoHo','New York','US',20400000,32640,5,-73.9991,40.7235,'İki katlı cast iron bina 320 m² sanatçı lofu.'),
  p('nyc-dx02','Brooklyn Heights Duplex','42 Willow St, Brooklyn Heights','duplex','Brooklyn Heights','New York','US',10200000,16320,4,-73.9952,40.6975,'Manhattan manzaralı 2 katlı tarihi daire.'),

  p('nyc-ga01','West Village Bahçe Katı','52 Perry St, West Village','garden_unit','West Village','New York','US',9600000,15360,4,-74.0043,40.7356,'Özel İngiliz bahçeli zemin kat, tarihi bina.'),
  p('nyc-rt01','Midtown Çatı Terası Daire','30 W 63rd St, Upper West Side','rooftop_unit','Upper West Side','New York','US',25500000,40800,5,-73.9843,40.7731,'Lincoln Center karşısı özel çatı katı.'),

  p('nyc-bl01','Harlem 12 Katlı Kiralık Bina','256 W 116th St, Harlem','building','Harlem','New York','US',84000000,134400,3,-73.9572,40.8021,'96 dairelik kiralık apartman blok.'),

  // ═══════════════════════════════════════════════
  //  LONDRA — YALILAR, VİLLALAR, DAİRELER, PENTHOUSE
  // ═══════════════════════════════════════════════

  p('lon-vi01','Kensington Palace Gardens Mansion','Palace Gardens Ter., Kensington','villa','Kensington','London','GB',360000000,432000,5,-0.1868,51.5060,'Milyarderler Caddesi\'ndeki muhafızlı geniş konak.'),
  p('lon-vi02','Surrey Country Estate','The Drive, Weybridge, Surrey','villa','Surrey','London','GB',54000000,64800,4,-0.3518,51.3720,'Londra\'ya 30 dk, 2 hektarlık Surrey ülke konağı.'),
  p('lon-vi03','Hampstead Detached Villa','The Grove No:8, Hampstead','villa','Hampstead','London','GB',25500000,30600,4,-0.1680,51.5547,'Heath kenarında 6 yatak odalı müstakil ev.'),
  p('lon-vi04','St. John\'s Wood Villa','Grove End Rd No:12, St. John\'s Wood','villa','Marylebone','London','GB',18600000,22320,4,-0.1740,51.5310,'Diplomat ve sanatçıların tercih ettiği özel ev.'),

  p('lon-ph01','One Hyde Park Penthouse K.18','Knightsbridge, London','penthouse','Knightsbridge','London','GB',285000000,456000,5,-0.1614,51.5021,'Dünyanın en pahalı rezidansının penthouse katı.'),
  p('lon-ph02','The Shard Çatı Katı Daire','32 London Bridge St K.32, Southwark','penthouse','South Bank','London','GB',66000000,105600,5,-0.0886,51.5045,'Londra\'nın en yüksek binasında konut katı.'),
  p('lon-ph03','Battersea Power Penthouse','Circus Rd West, Battersea','penthouse','Battersea','London','GB',48000000,76800,5,-0.1442,51.4846,'Eski santral dönüşümünün çatı katı.'),

  p('lon-th01','Chelsea Terrace House','The Vale No:6, Chelsea','townhouse','Chelsea','London','GB',17400000,27840,5,-0.1754,51.4870,'Bahçeli 4 katlı Chelsea sıra evi.'),
  p('lon-th02','Notting Hill Victorian Terrace','Ladbroke Grove No:48, Notting Hill','townhouse','Notting Hill','London','GB',11400000,18240,4,-0.2010,51.5139,'Kırık beyaz pastel cepheli Viktoryan sıra evi.'),
  p('lon-th03','Islington Georgian Terrace','Canonbury Sq No:14, Islington','townhouse','Islington','London','GB',8400000,13440,4,-0.0994,51.5441,'1820 Georgian mimarisi sıra evi.'),

  p('lon-su01','Shoreditch Micro Stüdyo','Redchurch St No:42, Shoreditch','studio','Shoreditch','London','GB',1440000,2304,3,-0.0788,51.5232,'Trendy Shoreditch\'te 36 m² co-living stüdyo.'),
  p('lon-su02','Elephant & Castle Stüdyo','Elephant Rd No:12, Southwark','studio','South Bank','London','GB',1140000,1824,2,-0.0981,51.4944,'Tube istasyonu yanı yenilenmiş stüdyo.'),

  p('lon-dx01','Mayfair Mews Dubleks','Shepherd Market, Mayfair','duplex','Mayfair','London','GB',21600000,34560,5,-0.1458,51.5045,'Eski ahır dönüşümü Mayfair\'in secretive duplex konutu.'),
  p('lon-ga01','Hampstead Bahçe Katı','Willow Rd No:4, Hampstead','garden_unit','Hampstead','London','GB',6600000,10560,4,-0.1679,51.5547,'Heath\'e yürüme mesafesinde özel bahçeli zemin kat.'),
  p('lon-rt01','Mayfair Çatı Dairesi','Grosvenor Sq No:8 Top, Mayfair','rooftop_unit','Mayfair','London','GB',36000000,57600,5,-0.1499,51.5110,'Grosvenor Meydanı\'nın üstünde özel teras katı.'),

  p('lon-bl01','Brixton 20 Dairelik Bina','Coldharbour Ln No:88, Brixton','building','Brixton','London','GB',36000000,57600,3,-0.1139,51.4620,'Bütünleşik kiralık 20 daireli yatırım binası.'),

  // ═══════════════════════════════════════════════
  //  TOKYO — VİLLALAR, PENTHOUSE, TOWNHOUSE, STÜDYO
  // ═══════════════════════════════════════════════

  p('tyo-vi01','Karuizawa Mountain Villa','1-1 Karuizawa, Nagano (Tokyo Dağ Evi)','villa','Setagaya','Tokyo','JP',9600000,11520,4,139.6780,35.6360,'Tokyo\'nun arka bahçesi Karuizawa\'da yazlık dağ evi.'),
  p('tyo-vi02','Kamakura Deniz Evi','2-1 Yuigahama, Kamakura','villa','Odaiba','Tokyo','JP',17400000,20880,4,139.7759,35.6246,'1 saatlik mesafede Pasifik kıyısı ahşap Japonya evi.'),
  p('tyo-vi03','Setagaya Müstakil Ev','3-5 Sangenjaya, Setagaya','villa','Setagaya','Tokyo','JP',7200000,8640,3,139.6780,35.6360,'İstasyon yakını müstakil bahçeli aile evi.'),
  p('tyo-vi04','Minato-ku Lüks Konut','5-8 Azabudai, Minato','villa','Roppongi','Tokyo','JP',36000000,43200,5,139.7312,35.6604,'Büyükelçilik mahallesinde özel bahçeli lüks konut.'),

  p('tyo-ph01','Roppongi Hills Penthouse K.54','6-10 Roppongi, Minato','penthouse','Roppongi','Tokyo','JP',36000000,57600,5,139.7312,35.6604,'Tokyo manzaralı özel helipad katı.'),
  p('tyo-ph02','Azabu Penthouse','2-4 Nishi Azabu, Minato','penthouse','Roppongi','Tokyo','JP',25500000,40800,5,139.7319,35.6598,'Tokyo\'nun prim mahallesinde 45. kat penthouse.'),

  p('tyo-su01','Shinjuku Micro Daire','2-14 Kabukicho, Shinjuku','studio','Shinjuku','Tokyo','JP',840000,1344,2,139.6996,35.6950,'Tokyo tarzı 25 m² tam işlevsel capsule-plus stüdyo.'),
  p('tyo-su02','Akihabara Geek Stüdyo','3-2 Soto-Kanda, Chiyoda','studio','Akihabara','Tokyo','JP',960000,1536,2,139.7729,35.7022,'Fiber internet, yüksek hız yapı, akıllı stüdyo.'),
  p('tyo-su03','Shibuya Serviced Stüdyo','1-12 Dogenzaka, Shibuya','studio','Shibuya','Tokyo','JP',1380000,2208,3,139.7016,35.6580,'Shibuya Crossing\'e 2 dk yürüyüş mesafesi stüdyo.'),

  p('tyo-th01','Yanaka Machiya (Geleneksel Sıra Ev)','3-2 Yanaka, Taito','townhouse','Ueno','Tokyo','JP',8400000,13440,4,139.7741,35.7153,'Edo dönemi machiya (町家) restore ahşap sıra evi.'),
  p('tyo-th02','Meguro Modern Townhouse','2-5 Meguro, Meguro','townhouse','Daikanyama','Tokyo','JP',12600000,20160,4,139.7029,35.6480,'3 katlı çağdaş Japon mimarisi townhouse.'),

  p('tyo-dx01','Aoyama Duplex Mansion','4-2 Minami Aoyama, Minato','duplex','Aoyama','Tokyo','JP',20400000,32640,5,139.7134,35.6633,'Aoyama\'nın en prestijli adresinde 2 katlı konut.'),
  p('tyo-ga01','Daikanyama Bahçe Katı','18-2 Sarugakucho, Shibuya','garden_unit','Daikanyama','Tokyo','JP',6600000,10560,4,139.7029,35.6480,'Sakin Daikanyama\'da gizli bahçe girişli zemin kat.'),
  p('tyo-rt01','Shinjuku Çatı Katı','1-26 Kabukicho, Shinjuku','rooftop_unit','Shinjuku','Tokyo','JP',11400000,18240,4,139.6996,35.6950,'Shinjuku neon manzaralı özel çatı katı.'),

  p('tyo-bl01','Setagaya 12 Dairelik Bina','5-4 Taishido, Setagaya','building','Setagaya','Tokyo','JP',25500000,40800,3,139.6780,35.6360,'Tamamen kiracılı 12 daireli sakin mahalle binası.'),

  // ═══════════════════════════════════════════════
  //  PARİS — VİLLALAR, PENTHOUSE, TOWNHOUSE, STÜDYO
  // ═══════════════════════════════════════════════

  p('par-vi01','Versailles Yakını Şato','Le Chesnay-Rocquencourt, Yvelines','villa','16e Arrondissement','Paris','FR',66000000,79200,5,2.1335,48.8072,'Versailles\'ın 2 km\'sinde özel parkı olan küçük şato.'),
  p('par-vi02','16e Arrondissement Özel Konak','Av. Foch No:58, 16e','villa','16e Arrondissement','Paris','FR',54000000,64800,5,2.2760,48.8582,'Paris\'in en seçkin caddesinde hd korunaklı konak.'),
  p('par-vi03','Neuilly-sur-Seine Villa','Bd du Château No:14, Neuilly','villa','Passy','Paris','FR',29400000,35280,4,2.2693,48.8847,'Seine\'in karşısında zengin Neuilly villası.'),

  p('par-ph01','Champs-Élysées Penthouse','55 Av. des Champs-Élysées, 8e','penthouse','8e Arrondissement','Paris','FR',84000000,134400,5,2.3016,48.8698,'Dünyanın en ünlü caddesinde 7. kat penthouse.'),
  p('par-ph02','Tour Montparnasse Çatı Katı','33 Av. du Maine, 15e','penthouse','15e Arrondissement','Paris','FR',36000000,57600,4,2.3220,48.8421,'210m yüksekten Paris silüeti gören terası.'),
  p('par-ph03','Saint-Germain Haussmann Penthouse','8 Quai Malaquais, 6e','penthouse','Saint-Germain','Paris','FR',48000000,76800,5,2.3395,48.8572,'Seine manzaralı Haussmann bina çatı katı.'),

  p('par-th01','Marais Hôtel Particulier','26 Rue des Francs-Bourgeois, 3e','townhouse','Le Marais','Paris','FR',42000000,67200,5,2.3557,48.8588,'17. yy özel saray (hôtel particulier), avlulu.'),
  p('par-th02','Montmartre Atelye Ev','12 Rue Lepic, Montmartre','townhouse','Montmartre','Paris','FR',12600000,20160,4,2.3332,48.8855,'Utrillo\'nun eski komşuluğu, atölyeli iki katlı ev.'),

  p('par-su01','Latin Quarter Stüdyo','22 Rue de la Huchette, 5e','studio','Saint-Germain','Paris','FR',1260000,2016,3,2.3470,48.8528,'Sorbonne\'e 3 dakika stüdyo, öğrenci kiralama.'),
  p('par-su02','Bastille Stüdyo Daire','44 Rue de la Roquette, 11e','studio','Nation','Paris','FR',1080000,1728,2,2.3762,48.8533,'Trendy Bastille semtinde küçük stüdyo.'),

  p('par-dx01','Île Saint-Louis Duplex','8 Quai de Bourbon, 4e','duplex','Île de la Cité','Paris','FR',25500000,40800,5,2.3561,48.8519,'Seine adası üzerinde 2 katlı Haussmann duplex.'),
  p('par-ga01','Marais Bahçe Katı','14 Rue de Bretagne, 3e','garden_unit','Le Marais','Paris','FR',8400000,13440,4,2.3619,48.8630,'Gizli avlulu tarihi Marais binası zemin katı.'),
  p('par-rt01','Montmartre Çatı Katı','3 Rue Norvins, 18e','rooftop_unit','Montmartre','Paris','FR',10200000,16320,4,2.3390,48.8863,'Sacré-Cœur manzaralı sanatçı çatı katı.'),

  p('par-bl01','9e Arrondissement Kiralık Bina','22 Rue La Bruyère, 9e','building','9e Arrondissement','Paris','FR',54000000,86400,3,2.3310,48.8789,'16 dairelik Haussmann gelir binası.'),

  // ═══════════════════════════════════════════════
  //  BAKÜ — VİLLALAR, DAİRELER, PENTHOUSE, TOWNHOUSE
  // ═══════════════════════════════════════════════

  p('bak-vi01','Abşeron Yarımadası Villa','Novkhani qəs., Abşeron','villa','Abşeron','Baku','AZ',11400000,13680,4,50.0200,40.4000,'Hazar sahili özel plajlı Abşeron yarımadası villası.'),
  p('bak-vi02','Nardaran Sayfiye Evi','Nardaran qəs., Sabunçu','villa','Sabunçu','Baku','AZ',4800000,5760,3,49.9310,40.4320,'Tarihi Nardaran köyünde bahçeli geleneksel ev.'),
  p('bak-vi03','Novkhanı Sahil Villası','Novkhanı Sahili, Abşeron','villa','Abşeron','Baku','AZ',7200000,8640,3,50.0130,40.3920,'Hazar kıyısı salkımı villalar sitesi.'),

  p('bak-ph01','Flame Towers Penthouse K.33','1 Mehdi Huseyn St, Ağ Şəhər','penthouse','Ağ Şəhər','Baku','AZ',25500000,40800,5,49.8672,40.3694,'Alev Kulesi\'nin en üst katında 360° panorama.'),
  p('bak-ph02','Crescent Mall Çatı Katı','Crescent Bay, Baku','penthouse','Port Baku','Baku','AZ',15600000,24960,4,49.8622,40.3706,'Crescent Bay projesi deniz manzaralı çatı katı.'),

  p('bak-su01','Sovetski Stüdyo Daire','8 Rasul Rza St, Şəhər Mərkəzi','studio','Şəhər Mərkəzi','Baku','AZ',540000,864,2,49.8402,40.3704,'Şehir merkezinde Sovyet döneminden restore stüdyo.'),
  p('bak-su02','White City Stüdyo','White City Blvd, Ağ Şəhər','studio','Ağ Şəhər','Baku','AZ',840000,1344,3,49.8700,40.3710,'Yeni iş merkezinde modern micro-daire.'),

  p('bak-th01','İçərişəhər Tarihi Sıra Ev','Kichik Qala Küç. No:5, İçərişəhər','townhouse','İçərişəhər','Baku','AZ',8400000,13440,4,49.8362,40.3662,'UNESCO koruması altındaki 12. yy taş sıra ev.'),
  p('bak-dx01','Sahil Residence Dubleks','Neftchilar Ave No:28, Sahil','duplex','Sahil','Baku','AZ',5400000,8640,4,49.8482,40.3715,'Hazar manzaralı 2 katlı dubleks daire.'),
  p('bak-ga01','Bulvar Bahçe Katı','Bulvar Parkı No:4, Sahil','garden_unit','Sahil','Baku','AZ',3300000,5280,3,49.8432,40.3700,'Sahil Bulvarı kenarında özel bahçeli zemin kat.'),
  p('bak-rt01','Nagorny Çatı Katı','Əliağa Vahid Küç. No:18, Nagorny','rooftop_unit','Nagorny','Baku','AZ',4200000,6720,4,49.8570,40.3752,'Şehir silüeti ve Hazar manzaralı çatı katı.'),
  p('bak-bl01','Nəriman Nərimanov Kiralık Bina','Nəriman Nərimanov Pr. No:56, Baku','building','Şəhər Mərkəzi','Baku','AZ',12600000,20160,3,49.8500,40.3900,'24 dairelik karma kullanımlı kiralık apartman.'),
]

// ── Cities ────────────────────────────────────────────────────────────────────

export const allCities: City[] = [
  { id: 'istanbul', name: 'Istanbul',  country: 'TR', flag: '🇹🇷', lat: 41.0082, lng:  28.9784, zoom: 12 },
  { id: 'dubai',    name: 'Dubai',     country: 'AE', flag: '🇦🇪', lat: 25.2048, lng:  55.2708, zoom: 12 },
  { id: 'newyork',  name: 'New York',  country: 'US', flag: '🇺🇸', lat: 40.7128, lng: -74.0060, zoom: 12 },
  { id: 'london',   name: 'London',    country: 'GB', flag: '🇬🇧', lat: 51.5074, lng:  -0.1276, zoom: 12 },
  { id: 'tokyo',    name: 'Tokyo',     country: 'JP', flag: '🇯🇵', lat: 35.6895, lng: 139.6917, zoom: 12 },
  { id: 'paris',    name: 'Paris',     country: 'FR', flag: '🇫🇷', lat: 48.8566, lng:   2.3522, zoom: 12 },
  { id: 'baku',     name: 'Baku',      country: 'AZ', flag: '🇦🇿', lat: 40.4093, lng:  49.8671, zoom: 13 },
]

// ── Grouping helpers ──────────────────────────────────────────────────────────

export interface HoodGroup {
  key:          string   // "Istanbul::Beşiktaş"
  neighborhood: string
  city:         string
  country:      string
  flag:         string
  lat:          number
  lng:          number
  properties:   Property[]
}

export interface CityGroup {
  city:       string
  country:    string
  flag:       string
  lat:        number
  lng:        number
  properties: Property[]
}

// Runtime konum-bazlı mülkler (kullanıcının gerçek konumundan üretilen). buildGroups
// + MapView bunları statik mülklerle BİRLİKTE gösterir. Bkz services/localProperties.
export let dynamicProperties: Property[] = []
export function setDynamicProperties(props: Property[]) { dynamicProperties = props }

export function buildGroups(): { hoods: HoodGroup[]; cities: CityGroup[] } {
  const flagMap: Record<string, string> = {}
  allCities.forEach(c => { flagMap[c.name] = c.flag })
  dynamicProperties.forEach(p => { if (!flagMap[p.city]) flagMap[p.city] = '📍' })

  const hoodMap = new Map<string, HoodGroup>()
  const cityMap = new Map<string, CityGroup>()

  allProperties.concat(dynamicProperties).forEach(prop => {
    const hk = `${prop.city}::${prop.neighborhood}`
    if (!hoodMap.has(hk)) {
      hoodMap.set(hk, {
        key: hk, neighborhood: prop.neighborhood,
        city: prop.city, country: prop.country,
        flag: flagMap[prop.city] ?? '🌍',
        lat: prop.lat, lng: prop.lng, properties: [],
      })
    }
    hoodMap.get(hk)!.properties.push(prop)

    if (!cityMap.has(prop.city)) {
      const cd = allCities.find(c => c.name === prop.city)
      cityMap.set(prop.city, {
        city: prop.city, country: prop.country,
        flag: flagMap[prop.city] ?? '🌍',
        lat: cd?.lat ?? prop.lat, lng: cd?.lng ?? prop.lng, properties: [],
      })
    }
    cityMap.get(prop.city)!.properties.push(prop)
  })

  hoodMap.forEach(h => {
    if (h.properties.length > 1) {
      h.lat = h.properties.reduce((s, p) => s + p.lat, 0) / h.properties.length
      h.lng = h.properties.reduce((s, p) => s + p.lng, 0) / h.properties.length
    }
  })

  return { hoods: Array.from(hoodMap.values()), cities: Array.from(cityMap.values()) }
}

export function nearestHood(hoods: HoodGroup[], lat: number, lng: number): HoodGroup | null {
  if (!hoods.length) return null
  let best = hoods[0], bestDist = Infinity
  for (const h of hoods) {
    const d = Math.hypot(h.lat - lat, h.lng - lng)
    if (d < bestDist) { bestDist = d; best = h }
  }
  return best
}

// ── Formatters ────────────────────────────────────────────────────────────────

export function formatPrice(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000)     return `$${Math.floor(n / 1_000)}K`
  return `$${n}`
}

export function formatIncome(n: number): string {
  if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}K/gün`
  return `$${n}/gün`
}

// ── Leaderboard bots ──────────────────────────────────────────────────────────

export const leaderBots = [
  { name: 'Sheikh Al-Rashid',   netWorth: 890_000_000, count: 47, flag: '🇦🇪' },
  { name: 'Victoria Blackwood', netWorth: 750_000_000, count: 39, flag: '🇬🇧' },
  { name: 'Hiroshi Tanaka',     netWorth: 620_000_000, count: 33, flag: '🇯🇵' },
  { name: 'Isabella Morel',     netWorth: 480_000_000, count: 28, flag: '🇫🇷' },
  { name: 'Magnus Eriksson',    netWorth: 310_000_000, count: 22, flag: '🇸🇪' },
  { name: 'Layla Hassan',       netWorth: 250_000_000, count: 19, flag: '🇸🇦' },
  { name: 'Carlos Mendes',      netWorth: 190_000_000, count: 15, flag: '🇧🇷' },
  { name: 'Yuki Nakamura',      netWorth: 145_000_000, count: 12, flag: '🇯🇵' },
  { name: 'Sophie Müller',      netWorth:  98_000_000, count:  9, flag: '🇩🇪' },
  { name: 'Ali Karimov',        netWorth:  72_000_000, count:  7, flag: '🇦🇿' },
]
