// ── Types ────────────────────────────────────────────────────────────────────

export type PropertyCategory = 'hotel' | 'office' | 'retail' | 'residential' | 'land' | 'industrial'

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
  p('ist-h01','Çırağan Palace Kempinski','Çırağan Cad. No:32, Beşiktaş','hotel','Beşiktaş','Istanbul','TR',42_000_000,88_000,5,29.0560,41.0505,'Osmanlı sarayından dönüştürülmüş 5 yıldızlı otel. Boğaz manzarası.'),
  p('ist-h02','Park Bosphorus Hotel','Süleyman Seba Cad. No:22, Beşiktaş','hotel','Beşiktaş','Istanbul','TR',28_000_000,52_000,5,29.0210,41.0430,'Boğaz kıyısında prestijli otel.'),
  p('ist-h03','Hilton Istanbul Bosphorus','Cumhuriyet Cad. No:12, Şişli','hotel','Harbiye','Istanbul','TR',18_000_000,34_000,4,28.9882,41.0490,'İstanbul\'un ikonik 5 yıldızlı oteli.'),
  p('ist-h04','Pera Palace Hotel','Meşrutiyet Cad. No:52, Beyoğlu','hotel','Beyoğlu','Istanbul','TR',12_000_000,24_000,5,28.9764,41.0320,'1892\'den beri tarihi prestijli otel.'),
  p('ist-h05','W Istanbul','Süleyman Seba Cad. No:22, Akaretler','hotel','Beşiktaş','Istanbul','TR',9_500_000,18_000,4,29.0082,41.0415,'Akaretler\'de modern tasarım oteli.'),
  p('ist-h06','Galataport Boutique Hotel','Kemankeş Cad. No:44, Karaköy','hotel','Karaköy','Istanbul','TR',6_200_000,12_400,4,28.9752,41.0271,'Galata\'nın yeni prestij bölgesinde butik otel.'),

  // Konutlar – Beşiktaş / Nişantaşı / Etiler
  p('ist-r01','Bebek 108 Residence Daire 4A','Bebek Cad. No:108, Bebek','residential','Bebek','Istanbul','TR',4_800_000,6_200,5,29.0451,41.0774,'Boğaz manzaralı butik apartman dairesi.'),
  p('ist-r02','Arnavutköy Yalı Daire','Arnavutköy Cad. No:18, Arnavutköy','residential','Arnavutköy','Istanbul','TR',8_500_000,9_800,5,29.0401,41.0686,'Su üstü yalı dairesi, Boğaz\'a sıfır.'),
  p('ist-r03','Kuruçeşme Marina Apart','İstinye Cad. No:5, Kuruçeşme','residential','Kuruçeşme','Istanbul','TR',3_200_000,4_100,4,29.0375,41.0655,'Sahil kenarında lüks daire.'),
  p('ist-r04','Nişantaşı No:28 Daire 6','Teşvikiye Cad. No:28, Nişantaşı','residential','Nişantaşı','Istanbul','TR',2_800_000,3_400,4,28.9932,41.0492,'Nişantaşı\'nın kalbinde geniş daire.'),
  p('ist-r05','Ulus Park Sitesi Blok A','Ulus Sokak No:12, Etiler','residential','Etiler','Istanbul','TR',2_200_000,2_800,4,29.0302,41.0700,'Etiler\'in sakin semtinde site dairesi.'),
  p('ist-r06','Zorlu Center Daire 14A','Levazım Mah. No:1, Beşiktaş','residential','Beşiktaş','Istanbul','TR',3_500_000,4_400,5,29.0161,41.0672,'AVM üstü lüks rezidans dairesi.'),
  p('ist-r07','İstanbul Sapphire Kat 50','Büyükdere Cad. No:1, Levent','residential','Levent','Istanbul','TR',4_200_000,5_500,5,29.0118,41.0755,'Türkiye\'nin en yüksek kule daireleri.'),
  p('ist-r08','Trump Towers Res. Daire 32','Şişli Meydanı, Şişli','residential','Şişli','Istanbul','TR',2_600_000,3_200,4,28.9870,41.0606,'Trump Towers\'ın rezidans kulesi.'),
  p('ist-r09','Ortaköy Sahil Daire','Muallim Naci Cad. No:64, Ortaköy','residential','Ortaköy','Istanbul','TR',1_900_000,2_400,4,29.0286,41.0501,'Ortaköy camisine yürüme mesafesinde.'),
  p('ist-r10','Acıbadem Yeşilyurt Sitesi Blok C','Çamlıca Cad. No:8, Acıbadem','residential','Acıbadem','Istanbul','TR',1_200_000,1_500,3,29.0467,41.0055,'Asya yakasında köklü site dairesi.'),
  p('ist-r11','Kadıköy Moda Sahil Daire','Moda Cad. No:45, Kadıköy','residential','Moda','Istanbul','TR',1_400_000,1_700,4,29.0322,40.9848,'Moda\'nın şık semtinde deniz manzaralı.'),
  p('ist-r12','Fenerbahçe Sahil Apt.','Bağdat Cad. No:316, Fenerbahçe','residential','Fenerbahçe','Istanbul','TR',1_800_000,2_200,4,29.0610,40.9706,'Bağdat Caddesi\'nde lüks daire.'),
  p('ist-r13','Varyap Meridian Daire 8B','Libadiye Cad., Ataşehir','residential','Ataşehir','Istanbul','TR',980_000,1_180,3,29.1190,40.9932,'Ataşehir\'in modern rezidansı.'),
  p('ist-r14','Nurol Park Daire 21','Ayazağa Mah. No:5, Maslak','residential','Maslak','Istanbul','TR',2_100_000,2_600,4,29.0290,41.1080,'Maslak\'ta panoramik manzaralı daire.'),
  p('ist-r15','Pendik Marina Residence','Kurtköy Mah. No:12, Pendik','residential','Pendik','Istanbul','TR',620_000,760,3,29.2110,40.8780,'Pendik marina kenarında site dairesi.'),
  p('ist-r16','Başakşehir Bahçeşehir Daire','Şehir Parkı Cad., Başakşehir','residential','Başakşehir','Istanbul','TR',580_000,700,2,28.8020,41.0850,'Büyük şehir parkı yanı daire.'),
  p('ist-r17','Üsküdar Bağlarbaşı Konağı','Bağlarbaşı Cad. No:8, Üsküdar','residential','Üsküdar','Istanbul','TR',1_100_000,1_350,3,29.0244,41.0230,'Restore edilmiş tarihi konak.'),

  // Ofisler
  p('ist-o01','Levent İş Kuleleri A Kule Kat 22','Büyükdere Cad. No:141, Levent','office','Levent','Istanbul','TR',8_500_000,14_200,5,29.0118,41.0800,'İstanbul\'un en prestijli ofis kulesi.'),
  p('ist-o02','Maslak 42 Ofis Kat 18','Büyükdere Cad. No:255, Maslak','office','Maslak','Istanbul','TR',5_200_000,8_800,5,29.0152,41.1020,'Maslak\'ta modern A sınıfı ofis.'),
  p('ist-o03','Kanyon Plaza Ofis Kat 12','Büyükdere Cad. No:185, Levent','office','Levent','Istanbul','TR',3_800_000,6_400,4,29.0098,41.0750,'Kanyon AVM\'nin ofis kulesi.'),
  p('ist-o04','Sabancı Center Kule Kat 30','Büyükdere Cad. No:111, Levent','office','Levent','Istanbul','TR',6_800_000,11_400,5,29.0100,41.0770,'Sabancı\'nın tarihi merkez kulesi.'),
  p('ist-o05','Uptown Tower Ofis Kat 15','Nispetiye Cad., Etiler','office','Etiler','Istanbul','TR',2_900_000,4_800,4,29.0270,41.0740,'Etiler\'de çift kule ofis projesi.'),
  p('ist-o06','Haydarpaşa Liman Ofis','Haydarpaşa İskelesi, Kadıköy','office','Kadıköy','Istanbul','TR',4_100_000,6_800,4,29.0130,40.9997,'Restore tarihi gar binası ofisi.'),

  // Mağazalar
  p('ist-s01','Kapalıçarşı Kuyumcu Dükkanı No:42','Kapalıçarşı, Beyazıt','retail','Fatih','Istanbul','TR',3_500_000,7_200,5,28.9674,41.0107,'UNESCO miras alanında eşsiz konum.'),
  p('ist-s02','Mısır Çarşısı Baharat Dükkanı','Eminönü Mah., Fatih','retail','Eminönü','Istanbul','TR',1_800_000,3_600,5,28.9714,41.0166,'Mısır Çarşısı\'nda tarihi dükkân.'),
  p('ist-s03','İstiklal Caddesi Bina No:214','İstiklal Cad. No:214, Beyoğlu','retail','Beyoğlu','Istanbul','TR',4_200_000,8_600,5,28.9784,41.0328,'İstiklal\'de yüksek trafikli mağaza.'),
  p('ist-s04','Bağdat Caddesi Mağaza','Bağdat Cad. No:188, Kadıköy','retail','Bağdat Cad.','Istanbul','TR',2_200_000,4_400,4,29.0500,40.9750,'Bağdat Caddesi\'nin lüks alışveriş hattı.'),
  p('ist-s05','Akmerkez Butik No:112','Nispetiye Cad., Etiler','retail','Etiler','Istanbul','TR',1_600_000,3_200,4,29.0228,41.0706,'Premium AVM\'de köşe butik.'),

  // ═══════════════════════════════════════════════
  //  DUBAİ
  // ═══════════════════════════════════════════════

  // Oteller
  p('dxb-h01','Burj Al Arab Suite','Jumeirah Beach Rd, Jumeirah','hotel','Jumeirah','Dubai','AE',180_000_000,320_000,5,55.1852,25.1412,'Dünyanın tek 7 yıldızlı oteli.'),
  p('dxb-h02','Atlantis The Palm','Palm Jumeirah Crescent','hotel','Palm Jumeirah','Dubai','AE',85_000_000,148_000,5,55.1304,25.1305,'Palm\'ın ikonik mega-resort oteli.'),
  p('dxb-h03','Address Downtown Hotel','Mohammed Bin Rashid Blvd','hotel','Downtown','Dubai','AE',42_000_000,78_000,5,55.2757,25.1928,'Burj Khalifa\'ya bitişik 5 yıldızlı.'),
  p('dxb-h04','Jumeirah Emirates Towers','Sheikh Zayed Rd','hotel','Trade Centre','Dubai','AE',28_000_000,52_000,5,55.2799,25.2175,'İkiz kulelerden biri – 5 yıldızlı otel.'),
  p('dxb-h05','Four Seasons Resort Jumeirah','Jumeirah Beach Rd No:270','hotel','Jumeirah','Dubai','AE',35_000_000,64_000,5,55.2142,25.2028,'Sahil kenarında yüksek prestijli resort.'),

  // Konutlar
  p('dxb-r01','Burj Khalifa Daire 128. Kat','1 Sheikh Mohammed Bin Rashid Blvd','residential','Downtown','Dubai','AE',22_000_000,28_000,5,55.2744,25.1972,'Dünyanın en yüksek rezidans dairesi.'),
  p('dxb-r02','Palm Jumeirah Signature Villa','Frond K, Palm Jumeirah','residential','Palm Jumeirah','Dubai','AE',18_000_000,22_000,5,55.1390,25.1080,'Palm\'da sahil villası.'),
  p('dxb-r03','JBR The Walk Daire 8A','JBR Walk, Dubai Marina','residential','JBR','Dubai','AE',3_400_000,4_200,4,55.1280,25.0760,'Jumeirah Beach\'e sıfır daire.'),
  p('dxb-r04','Dubai Marina Tower Daire','Marina Walk, Dubai Marina','residential','Dubai Marina','Dubai','AE',2_800_000,3_400,4,55.1402,25.0812,'Marina\'ya bakışlı lüks daire.'),
  p('dxb-r05','DIFC Residences Daire','Gate Village, DIFC','residential','DIFC','Dubai','AE',5_500_000,7_000,5,55.2808,25.2090,'Finans merkezi içinde rezidans.'),
  p('dxb-r06','Downtown Standpoint Daire','Emaar Boulevard, Downtown','residential','Downtown','Dubai','AE',4_200_000,5_200,4,55.2780,25.1965,'Burj Khalifa manzaralı daire.'),
  p('dxb-r07','Dubai Hills Mansion','Al Marabea, Dubai Hills Estate','residential','Dubai Hills','Dubai','AE',12_000_000,14_800,5,55.2360,25.0960,'Golf sahası manzaralı villa.'),
  p('dxb-r08','Business Bay Daire 24C','Executive Tower, Business Bay','residential','Business Bay','Dubai','AE',1_800_000,2_200,3,55.2620,25.1870,'Kanal manzaralı modern daire.'),
  p('dxb-r09','Jumeirah Village Circle Daire','JVC, Jumeirah','residential','JVC','Dubai','AE',680_000,820,2,55.2100,25.0612,'Uygun fiyatlı yatırımlık daire.'),
  p('dxb-r10','Arabian Ranches Villa','Ranches Blvd, Dubailand','residential','Arabian Ranches','Dubai','AE',3_800_000,4_600,4,55.2730,25.0350,'Kapalı site sakin villa.'),

  // Ofisler
  p('dxb-o01','Burj Khalifa Ofis Kat 88','1 Sheikh Mohammed Bin Rashid Blvd','office','Downtown','Dubai','AE',18_000_000,32_000,5,55.2744,25.1972,'Dünyanın en yüksek ofis katı.'),
  p('dxb-o02','DIFC Gate Tower Ofis','Gate Building, DIFC','office','DIFC','Dubai','AE',8_500_000,14_400,5,55.2808,25.2090,'Dubai\'nin Wall Street\'i.'),
  p('dxb-o03','One Central Ofis','World Trade Centre, DWTC','office','Trade Centre','Dubai','AE',5_200_000,8_800,4,55.2900,25.2220,'Fuar merkezi complex ofisi.'),

  // Mağazalar
  p('dxb-s01','Dubai Mall Butik No:B-42','Financial Centre Rd, Downtown','retail','Downtown','Dubai','AE',4_200_000,8_800,5,55.2796,25.1985,'Dünyanın en büyük AVM\'nde butik.'),
  p('dxb-s02','Gold Souk Dükkânı No:18','Gold Souk, Deira','retail','Deira','Dubai','AE',1_200_000,2_400,4,55.3022,25.2680,'Altın çarşısında tarihi dükkân.'),
  p('dxb-s03','Mall of Emirates Mağaza','Sheikh Zayed Rd, Al Barsha','retail','Al Barsha','Dubai','AE',2_800_000,5_600,4,55.2008,25.1182,'Kayak pistli AVM\'de mağaza.'),

  // ═══════════════════════════════════════════════
  //  NEW YORK
  // ═══════════════════════════════════════════════

  // Oteller
  p('nyc-h01','The Plaza Hotel Suite','768 5th Ave, Midtown','hotel','Midtown','New York','US',280_000_000,480_000,5,-73.9745,40.7645,'1907\'den beri ikonik NYC oteli.'),
  p('nyc-h02','Four Seasons Hotel NYC','57 E 57th St, Midtown','hotel','Midtown','New York','US',95_000_000,168_000,5,-73.9714,40.7618,'Mimaride ödül alan 5 yıldızlı otel.'),
  p('nyc-h03','The Standard High Line','848 Washington St, Meatpacking','hotel','Meatpacking','New York','US',42_000_000,78_000,4,-74.0071,40.7422,'High Line üzerinde trendy otel.'),

  // Konutlar
  p('nyc-r01','One57 Penthouse','157 W 57th St, Midtown','residential','Midtown','New York','US',98_000_000,124_000,5,-73.9798,40.7651,'Billionaires\' Row\'un zirve penthousu.'),
  p('nyc-r02','432 Park Avenue Daire','432 Park Ave, Midtown','residential','Midtown','New York','US',45_000_000,58_000,5,-73.9773,40.7619,'Dünyanın en ince gökdelen dairesi.'),
  p('nyc-r03','Central Park West Daire 15B','15 Central Park W, Upper West Side','residential','Upper West Side','New York','US',18_000_000,22_000,5,-73.9813,40.7720,'Central Park\'a bakan klasik daire.'),
  p('nyc-r04','5th Avenue Penthouse','995 5th Ave, Upper East Side','residential','Upper East Side','New York','US',22_000_000,28_000,5,-73.9623,40.7747,'Central Park manzaralı 5. Cadde.'),
  p('nyc-r05','SoHo Cast Iron Loft','35 Greene St, SoHo','residential','SoHo','New York','US',3_200_000,4_800,4,-74.0013,40.7218,'Tarihi döküm demir çerçeveli loft.'),
  p('nyc-r06','Brooklyn Heights Brownstone','142 Columbia Heights, Brooklyn','residential','Brooklyn Heights','New York','US',4_800_000,6_200,4,-73.9946,40.6962,'Manhattan manzaralı tarihi apartman.'),
  p('nyc-r07','Williamsburg Condo 3F','180 N 7th St, Williamsburg','residential','Williamsburg','New York','US',1_400_000,1_800,3,-73.9602,40.7172,'Trendy Williamsburg\'de modern daire.'),
  p('nyc-r08','Tribeca Grand Loft','377 Greenwich St, Tribeca','residential','Tribeca','New York','US',5_600_000,7_200,4,-74.0086,40.7201,'A-list ünlüler mahallesi loft.'),
  p('nyc-r09','Harlem Row House','2 W 130th St, Harlem','residential','Harlem','New York','US',980_000,1_240,3,-73.9402,40.8107,'Restore edilmiş Victorian evi.'),
  p('nyc-r10','Queens LIC Daire','4545 Center Blvd, Long Island City','residential','Long Island City','New York','US',820_000,1_020,3,-73.9549,40.7468,'Manhattan manzaralı Queens dairesi.'),

  // Ofisler
  p('nyc-o01','Empire State Building Ofis K.22','350 5th Ave, Midtown','office','Midtown','New York','US',28_000_000,48_000,5,-73.9857,40.7484,'İkonik gökdelende prestijli ofis.'),
  p('nyc-o02','One World Trade Center Ofis','285 Fulton St, Downtown','office','Financial District','New York','US',18_000_000,32_000,5,-74.0133,40.7130,'9/11 memorial yanında modern ofis.'),
  p('nyc-o03','Rockefeller Center Ofis','1221 6th Ave, Midtown','office','Midtown','New York','US',12_000_000,21_000,5,-73.9800,40.7585,'Tarihi komplekste A sınıfı ofis.'),
  p('nyc-o04','Wall Street Ofis No:40','40 Wall St, Financial District','office','Financial District','New York','US',9_200_000,16_400,5,-74.0089,40.7069,'Küresel finans kalbinde ofis.'),

  // Mağazalar
  p('nyc-s01','Times Square Retail','1560 Broadway, Midtown','retail','Midtown','New York','US',8_500_000,18_000,5,-73.9855,40.7580,'Dünyanın en yoğun trafikli noktası.'),
  p('nyc-s02','5th Avenue Boutique','711 5th Ave, Midtown','retail','Midtown','New York','US',12_000_000,24_000,5,-73.9712,40.7613,'Lüks markaların en gözde caddesi.'),
  p('nyc-s03','Brooklyn Dumbo Shop','55 Water St, DUMBO','retail','DUMBO','New York','US',2_200_000,4_400,4,-73.9894,40.7028,'Sanat galerileri ve butikler bölgesi.'),

  // ═══════════════════════════════════════════════
  //  LONDRA
  // ═══════════════════════════════════════════════

  // Oteller
  p('lon-h01','The Savoy Hotel','Strand, City of Westminster','hotel','Strand','London','GB',480_000_000,820_000,5,-0.1208,51.5103,'1889\'dan beri dünyanın en ikonik oteli.'),
  p('lon-h02','Claridge\'s Hotel','Brook St, Mayfair','hotel','Mayfair','London','GB',320_000_000,560_000,5,-0.1482,51.5121,'Mayfair\'in kraliyet favorisi oteli.'),
  p('lon-h03','The Connaught','Carlos Pl, Mayfair','hotel','Mayfair','London','GB',185_000_000,320_000,5,-0.1499,51.5110,'Mayfair\'in 5 yıldızlı simgesi.'),

  // Konutlar
  p('lon-r01','Mayfair Mansion – Grosvenor Sq','Grosvenor Sq No:22, Mayfair','residential','Mayfair','London','GB',28_000_000,36_000,5,-0.1499,51.5110,'Dünyanın en değerli adreslerinden.'),
  p('lon-r02','One Hyde Park Daire','Knightsbridge, London','residential','Knightsbridge','London','GB',45_000_000,58_000,5,-0.1614,51.5021,'Dünyanın en pahalı rezidans kompleksi.'),
  p('lon-r03','Kensington Palace Gardens Villa','Palace Gardens, W8','residential','Kensington','London','GB',82_000_000,105_000,5,-0.1860,51.5057,'Milyarder\'ler Caddesi olarak bilinir.'),
  p('lon-r04','Chelsea Terrace House','King\'s Rd No:284, Chelsea','residential','Chelsea','London','GB',4_800_000,6_200,4,-0.1754,51.4870,'Chelsea\'nin klasik sıra evi.'),
  p('lon-r05','Notting Hill Garden Flat','Westbourne Grove No:48, Notting Hill','residential','Notting Hill','London','GB',2_400_000,3_100,4,-0.2010,51.5139,'Film setine dönen şık mahalle.'),
  p('lon-r06','Shoreditch Warehouse Conversion','Curtain Rd No:95, Shoreditch','residential','Shoreditch','London','GB',1_400_000,1_800,3,-0.0788,51.5232,'Eski fabrika loft dönüşümü.'),
  p('lon-r07','Canary Wharf Riverfront Daire','Westferry Rd No:10, Isle of Dogs','residential','Canary Wharf','London','GB',1_200_000,1_540,3,-0.0240,51.4998,'Nehir manzaralı modern daire.'),
  p('lon-r08','Hampstead Village Cottage','Flask Walk No:14, Hampstead','residential','Hampstead','London','GB',2_800_000,3_600,4,-0.1779,51.5567,'Londra\'nın köylü bir köşesi.'),
  p('lon-r09','Battersea Power Station Daire','Circus Rd West, Battersea','residential','Battersea','London','GB',3_200_000,4_100,4,-0.1442,51.4846,'Eski enerji santrali rezidansı.'),
  p('lon-r10','Stratford Olympic Village Daire','Montfichet Rd, Stratford','residential','Stratford','London','GB',680_000,860,3,-0.0100,51.5417,'Olimpiyat köyünden dönüştürülmüş.'),

  // Ofisler
  p('lon-o01','The Shard Ofis Kat 28','32 London Bridge St, Southwark','office','South Bank','London','GB',18_000_000,32_000,5,-0.0886,51.5045,'Londra\'nın en yüksek binasında ofis.'),
  p('lon-o02','Canary Wharf Tower Ofis','1 Canada Sq, Canary Wharf','office','Canary Wharf','London','GB',11_000_000,19_200,5,-0.0193,51.5050,'Küresel bankacılığın merkezi.'),
  p('lon-o03','City of London Ofis','30 St Mary Axe (Gherkin), EC3A','office','City of London','London','GB',14_000_000,24_800,5,-0.0808,51.5145,'Salatalık Binası – ikonik ofis.'),
  p('lon-o04','Mayfair Ofis Binası','Berkeley Sq No:1, Mayfair','office','Mayfair','London','GB',8_200_000,14_400,4,-0.1448,51.5105,'Hedge fon ve özel bankacılık merkezi.'),

  // Mağazalar
  p('lon-s01','Oxford Street Flagship','Oxford St No:300, Westminster','retail','Westminster','London','GB',6_800_000,14_400,5,-0.1408,51.5154,'Avrupa\'nın en kalabalık alışveriş caddesi.'),
  p('lon-s02','Harrods Kiosk','87 Brompton Rd, Knightsbridge','retail','Knightsbridge','London','GB',4_200_000,8_800,5,-0.1632,51.4994,'Efsanevi mağazanın konsept alanı.'),
  p('lon-s03','Portobello Road Market Unit','Portobello Rd No:144, Notting Hill','retail','Notting Hill','London','GB',1_800_000,3_600,4,-0.2043,51.5168,'Dünyanın en ünlü antika pazarı.'),

  // ═══════════════════════════════════════════════
  //  TOKYO
  // ═══════════════════════════════════════════════

  // Oteller
  p('tyo-h01','Aman Tokyo','The Otemachi Tower, Chiyoda','hotel','Otemachi','Tokyo','JP',92_000_000,162_000,5,139.7645,35.6860,'Japonya\'nın en prestijli butik oteli.'),
  p('tyo-h02','Park Hyatt Tokyo','3-7-1-2 Nishishinjuku, Shinjuku','hotel','Shinjuku','Tokyo','JP',48_000_000,84_000,5,139.6900,35.6847,'Lost in Translation\'ın çekimyeri.'),
  p('tyo-h03','The Peninsula Tokyo','1-8-1 Yurakucho, Chiyoda','hotel','Hibiya','Tokyo','JP',62_000_000,108_000,5,139.7607,35.6747,'Imperial Palace yanında 5 yıldızlı.'),

  // Konutlar
  p('tyo-r01','Minami Aoyama Mansion 5F','5-4 Minami Aoyama, Minato','residential','Aoyama','Tokyo','JP',5_800_000,7_200,5,139.7134,35.6633,'Tokyo\'nun en şık semtinde lüks daire.'),
  p('tyo-r02','Roppongi Hills Residence 32F','6-10 Roppongi, Minato','residential','Roppongi','Tokyo','JP',4_200_000,5_400,5,139.7312,35.6604,'Roppongi Hills rezidans kulesi.'),
  p('tyo-r03','Shibuya Daikanyama Flat','17-5 Daikanyama, Shibuya','residential','Daikanyama','Tokyo','JP',2_800_000,3_500,4,139.7029,35.6480,'Trendy tasarım semtinde daire.'),
  p('tyo-r04','Shinjuku Serviced Apart','2-1 Kabukicho, Shinjuku','residential','Shinjuku','Tokyo','JP',1_800_000,2_200,3,139.6996,35.6950,'Servis daireleri kompleksi.'),
  p('tyo-r05','Setagaya Family Mansion','3-2 Taishido, Setagaya','residential','Setagaya','Tokyo','JP',980_000,1_200,3,139.6780,35.6360,'Sessiz aile semtinde geniş daire.'),
  p('tyo-r06','Odaiba Waterfront Daire','2-1 Daiba, Minato','residential','Odaiba','Tokyo','JP',1_600_000,2_000,4,139.7759,35.6246,'Gökkuşağı Köprüsü manzaralı.'),
  p('tyo-r07','Akihabara Studio Apart','1-14 Soto-Kanda, Chiyoda','residential','Akihabara','Tokyo','JP',520_000,640,2,139.7729,35.7022,'Elektronik merkezi yanı stüdyo.'),

  // Ofisler
  p('tyo-o01','Shinjuku Park Tower Ofis','2-6-1 Nishi Shinjuku','office','Shinjuku','Tokyo','JP',14_000_000,24_000,5,139.6869,35.6908,'Tokyo\'nun ikonik ofis kulesi.'),
  p('tyo-o02','Marunouchi Building Ofis','2-4-1 Marunouchi, Chiyoda','office','Marunouchi','Tokyo','JP',8_500_000,14_400,5,139.7648,35.6815,'Tokyo İstasyonu yanı A sınıfı ofis.'),
  p('tyo-o03','Toranomon Hills Ofis','1-23-1 Toranomon, Minato','office','Toranomon','Tokyo','JP',6_200_000,10_400,4,139.7494,35.6673,'Yeni finans merkezi kulesi.'),

  // Mağazalar
  p('tyo-s01','Ginza Flagship Mağaza','5-7-2 Ginza, Chuo','retail','Ginza','Tokyo','JP',8_200_000,16_800,5,139.7685,35.6714,'Tokyo\'nun lüks alışveriş caddesi.'),
  p('tyo-s02','Shibuya Crossing Retail','2-24 Shibuya, Shibuya','retail','Shibuya','Tokyo','JP',5_600_000,12_000,5,139.7016,35.6580,'Dünyanın en yoğun yaya geçidi.'),
  p('tyo-s03','Harajuku Takeshita Dükkanı','1-7 Jingumae, Shibuya','retail','Harajuku','Tokyo','JP',1_400_000,2_800,3,139.7036,35.6700,'Japon pop kültürünün kalbi.'),

  // ═══════════════════════════════════════════════
  //  PARİS
  // ═══════════════════════════════════════════════

  // Oteller
  p('par-h01','Le Bristol Paris','112 Rue du Faubourg Saint-Honoré, 8e','hotel','8e Arrondissement','Paris','FR',580_000_000,980_000,5,2.3083,48.8729,'Fransız lüksünün zirvesi.'),
  p('par-h02','Ritz Paris','15 Pl. Vendôme, 1er','hotel','1er Arrondissement','Paris','FR',420_000_000,720_000,5,2.3296,48.8686,'Coco Chanel\'in evi olan efsanevi otel.'),
  p('par-h03','Four Seasons George V','31 Ave George V, 8e','hotel','8e Arrondissement','Paris','FR',280_000_000,480_000,5,2.3010,48.8696,'Champs-Élysées yakını 5 yıldızlı.'),

  // Konutlar
  p('par-r01','Île Saint-Louis Haussmann Dairesi','12 Quai de Bourbon, Île Saint-Louis','residential','Île Saint-Louis','Paris','FR',8_500_000,10_800,5,2.3561,48.8519,'Seine adacığında Haussmann yapısı.'),
  p('par-r02','Marais Haussmann Apart','32 Rue des Archives, 3e','residential','Le Marais','Paris','FR',4_200_000,5_400,4,2.3567,48.8590,'Paris\'in en gözde tarihi mahallesi.'),
  p('par-r03','Saint-Germain Dairesi','8 Bd Saint-Germain, 6e','residential','Saint-Germain','Paris','FR',5_800_000,7_400,5,2.3370,48.8512,'Entelektüeller mahallesi klasik daire.'),
  p('par-r04','16e Passy Lüks Daire','12 Ave Paul Doumer, 16e','residential','Passy','Paris','FR',3_800_000,4_800,4,2.2760,48.8582,'Bourgeois Paris\'in kalbi.'),
  p('par-r05','Montmartre Artist Studio','18 Rue Lepic, Montmartre, 18e','residential','Montmartre','Paris','FR',980_000,1_240,3,2.3332,48.8855,'Ressam atelye dairesine dönüşüm.'),
  p('par-r06','Nation Dairesi','44 Av. du Trône, 11e','residential','Nation','Paris','FR',680_000,860,2,2.3957,48.8487,'Doğu Paris\'te uygun fiyatlı daire.'),
  p('par-r07','Boulogne Riverside Villa','15 Quai du 4 Septembre, Boulogne','residential','Boulogne','Paris','FR',6_200_000,7_800,4,2.2401,48.8405,'Seine kenarında özel bahçeli villa.'),

  // Ofisler
  p('par-o01','La Défense Grande Arche Ofis','1 Parvis de la Défense, Puteaux','office','La Défense','Paris','FR',9_800_000,17_200,5,2.2396,48.8924,'Paris\'in ana iş merkezi.'),
  p('par-o02','8e Arrondissement Ofis','42 Ave des Champs-Élysées, 8e','office','8e Arrondissement','Paris','FR',6_400_000,10_800,4,2.3016,48.8730,'Champs-Élysées üzerinde prestijli ofis.'),

  // Mağazalar
  p('par-s01','Champs-Élysées Butik','86 Ave des Champs-Élysées, 8e','retail','8e Arrondissement','Paris','FR',16_000_000,28_800,5,2.3016,48.8698,'Dünyanın en ünlü bulvarı.'),
  p('par-s02','Galeries Lafayette Kiosk','40 Bd Haussmann, 9e','retail','9e Arrondissement','Paris','FR',8_200_000,16_400,5,2.3327,48.8733,'İkonik Paris mağazasında satış noktası.'),
  p('par-s03','Le Marais Concept Store','56 Rue de Bretagne, 3e','retail','Le Marais','Paris','FR',2_400_000,4_800,4,2.3619,48.8630,'Trendsetterların buluşma noktası.'),

  // ═══════════════════════════════════════════════
  //  BAKÜ
  // ═══════════════════════════════════════════════

  // Oteller
  p('bak-h01','Four Seasons Baku','1 Neftchilar Ave, Baku','hotel','Sahil','Baku','AZ',18_000_000,32_000,5,49.8432,40.3720,'Bakü\'nün en lüks oteli, Hazar manzarası.'),
  p('bak-h02','Fairmont Baku Flame Towers','1 Mehdi Huseyn St, Baku','hotel','Ağ Şəhər','Baku','AZ',12_000_000,21_600,5,49.8672,40.3694,'Alev Kulesi\'ndeki ikonik otel.'),
  p('bak-h03','JW Marriott Absheron','2 Azadlig Ave, Baku','hotel','Sahil','Baku','AZ',8_500_000,14_800,4,49.8502,40.3750,'Azadlık Meydanı yanı prestij otel.'),

  // Konutlar
  p('bak-r01','Flame Towers Residence 18F','1 Mehdi Huseyn St, Baku','residential','Ağ Şəhər','Baku','AZ',3_200_000,4_100,5,49.8672,40.3694,'Alev Kulesi\'nde şehir manzaralı daire.'),
  p('bak-r02','İçərişəhər Tarihi Ev','8 Qoşa Qala, İçərişəhər','residential','İçərişəhər','Baku','AZ',1_800_000,2_300,5,49.8362,40.3662,'UNESCO alanı içinde restore ev.'),
  p('bak-r03','Bulvar Residence Daire','Neftchilar Ave No:14, Sahil','residential','Sahil','Baku','AZ',1_200_000,1_500,4,49.8482,40.3715,'Hazar Bulvarı kenarında daire.'),
  p('bak-r04','Port Baku Residence','153 Neftchilar Ave, Baku','residential','Port Baku','Baku','AZ',2_400_000,3_050,4,49.8622,40.3706,'Liman manzaralı lüks daire.'),
  p('bak-r05','Khagani Street Apart','47 Khagani St, Baku','residential','Şəhər Mərkəzi','Baku','AZ',680_000,860,3,49.8402,40.3704,'Şehir merkezinde pratik daire.'),

  // Ofisler
  p('bak-o01','Flame Towers Ofis Kat 22','1 Mehdi Huseyn St, Baku','office','Ağ Şəhər','Baku','AZ',3_200_000,5_800,5,49.8672,40.3694,'Bakü\'nün simge kulesinde ofis.'),
  p('bak-o02','Baku White City Ofis','White City Boulevard, Baku','office','Ağ Şəhər','Baku','AZ',1_800_000,3_200,4,49.8700,40.3710,'Yeni iş merkezi bölgesi ofisi.'),

  // Mağazalar
  p('bak-s01','İçərişəhər Butik Dükkânı','12 Kichik Qala, İçərişəhər','retail','İçərişəhər','Baku','AZ',480_000,960,4,49.8362,40.3662,'UNESCO mirası alanında özel butik.'),
  p('bak-s02','Nizami Caddesi Mağazası','78 Nizami St, Baku','retail','Şəhər Mərkəzi','Baku','AZ',820_000,1_640,3,49.8402,40.3704,'Bakü\'nün ana alışveriş caddesi.'),
  p('bak-s03','Port Baku Mall Kiosk','153 Neftchilar Ave, Baku','retail','Port Baku','Baku','AZ',640_000,1_280,3,49.8622,40.3706,'Modern AVM\'de köşe kiosk.'),
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
