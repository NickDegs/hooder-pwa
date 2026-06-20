// ── Dünya etiket verisi (tek pakette gömülü) ──────────────────────────────────
// Haritada GEZDİĞİN her yerde şehir/ülke etiketi görünmesi için dünyanın büyük
// şehirleri + ülkeleri burada gömülü gelir (canlı fetch beklemeden). Mülkler
// (satın alınabilir POI) hâlâ konuma göre çekilir; bunlar yalnız ETİKET/konum.
//
// Performans: bu liste binlerce nokta olsa bile haritada DONMA yapmaz, çünkü
// MapView yalnız EKRANDA GÖRÜNEN (viewport) marker'ları DOM'a ekler (culling).

export interface WorldPlace {
  name: string
  country: string   // ISO-2
  lat: number
  lng: number
  rank: number      // ~nüfus (milyon) — sığdırma sıralaması için
}

export function flagFromCC(code: string): string {
  if (!code || code.length !== 2) return '🌍'
  return code.toUpperCase().replace(/./g, c => String.fromCodePoint(127397 + c.charCodeAt(0)))
}

// [ad, ülke, lat, lng, rank]
const C: [string, string, number, number, number][] = [
  ['Tokyo','JP',35.6895,139.6917,37],['Delhi','IN',28.7041,77.1025,32],['Shanghai','CN',31.2304,121.4737,29],
  ['São Paulo','BR',-23.5505,-46.6333,22],['Mexico City','MX',19.4326,-99.1332,22],['Cairo','EG',30.0444,31.2357,21],
  ['Mumbai','IN',19.0760,72.8777,21],['Beijing','CN',39.9042,116.4074,21],['Dhaka','BD',23.8103,90.4125,21],
  ['Osaka','JP',34.6937,135.5023,19],['New York','US',40.7128,-74.0060,19],['Karachi','PK',24.8607,67.0011,16],
  ['Buenos Aires','AR',-34.6037,-58.3816,15],['Istanbul','TR',41.0082,28.9784,15],['Kolkata','IN',22.5726,88.3639,15],
  ['Manila','PH',14.5995,120.9842,14],['Lagos','NG',6.5244,3.3792,14],['Rio de Janeiro','BR',-22.9068,-43.1729,13],
  ['Tianjin','CN',39.3434,117.3616,13],['Kinshasa','CD',-4.4419,15.2663,13],['Guangzhou','CN',23.1291,113.2644,13],
  ['Los Angeles','US',34.0522,-118.2437,12],['Moscow','RU',55.7558,37.6173,12],['Shenzhen','CN',22.5431,114.0579,12],
  ['Lahore','PK',31.5497,74.3436,12],['Bangalore','IN',12.9716,77.5946,12],['Paris','FR',48.8566,2.3522,11],
  ['Bogotá','CO',4.7110,-74.0721,11],['Jakarta','ID',-6.2088,106.8456,11],['Chennai','IN',13.0827,80.2707,11],
  ['Lima','PE',-12.0464,-77.0428,11],['Bangkok','TH',13.7563,100.5018,10],['Seoul','KR',37.5665,126.9780,10],
  ['Nagoya','JP',35.1815,136.9066,10],['Hyderabad','IN',17.3850,78.4867,10],['London','GB',51.5074,-0.1276,9],
  ['Tehran','IR',35.6892,51.3890,9],['Chicago','US',41.8781,-87.6298,9],['Chengdu','CN',30.5728,104.0668,9],
  ['Nanjing','CN',32.0603,118.7969,9],['Wuhan','CN',30.5928,114.3055,9],['Ho Chi Minh City','VN',10.8231,106.6297,9],
  ['Luanda','AO',-8.8390,13.2894,8],['Ahmedabad','IN',23.0225,72.5714,8],['Kuala Lumpur','MY',3.1390,101.6869,8],
  ['Xi’an','CN',34.3416,108.9398,8],['Hong Kong','HK',22.3193,114.1694,7],['Dongguan','CN',23.0207,113.7518,7],
  ['Hangzhou','CN',30.2741,120.1551,7],['Foshan','CN',23.0218,113.1219,7],['Riyadh','SA',24.7136,46.6753,7],
  ['Baghdad','IQ',33.3152,44.3661,7],['Santiago','CL',-33.4489,-70.6693,7],['Surat','IN',21.1702,72.8311,7],
  ['Madrid','ES',40.4168,-3.7038,7],['Toronto','CA',43.6532,-79.3832,6],['Singapore','SG',1.3521,103.8198,6],
  ['Pune','IN',18.5204,73.8567,6],['Khartoum','SD',15.5007,32.5599,6],['Houston','US',29.7604,-95.3698,6],
  ['Dar es Salaam','TZ',-6.7924,39.2083,6],['Miami','US',25.7617,-80.1918,6],['Belo Horizonte','BR',-19.9167,-43.9345,6],
  ['Hanoi','VN',21.0285,105.8542,6],['Atlanta','US',33.7490,-84.3880,6],['Barcelona','ES',41.3851,2.1734,6],
  ['Dallas','US',32.7767,-96.7970,6],['Philadelphia','US',39.9526,-75.1652,6],['Washington','US',38.9072,-77.0369,6],
  ['Sydney','AU',-33.8688,151.2093,5],['Melbourne','AU',-37.8136,144.9631,5],['Berlin','DE',52.5200,13.4050,5],
  ['Johannesburg','ZA',-26.2041,28.0473,5],['Cape Town','ZA',-33.9249,18.4241,5],['Nairobi','KE',-1.2864,36.8172,5],
  ['Casablanca','MA',33.5731,-7.5898,5],['Algiers','DZ',36.7538,3.0588,5],['Rome','IT',41.9028,12.4964,4],
  ['Milan','IT',45.4642,9.1900,4],['Athens','GR',37.9838,23.7275,4],['Kiev','UA',50.4501,30.5234,4],
  ['Addis Ababa','ET',9.0249,38.7469,4],['Accra','GH',5.6037,-0.1870,4],['Abidjan','CI',5.3600,-4.0083,5],
  ['Boston','US',42.3601,-71.0589,5],['Phoenix','US',33.4484,-112.0740,5],['San Francisco','US',37.7749,-122.4194,5],
  ['Seattle','US',47.6062,-122.3321,4],['Montréal','CA',45.5017,-73.5673,4],['Vancouver','CA',49.2827,-123.1207,3],
  ['Dubai','AE',25.2048,55.2708,4],['Abu Dhabi','AE',24.4539,54.3773,2],['Doha','QA',25.2854,51.5310,2],
  ['Kuwait City','KW',29.3759,47.9774,3],['Amman','JO',31.9454,35.9284,4],['Beirut','LB',33.8938,35.5018,2],
  ['Jerusalem','IL',31.7683,35.2137,1],['Tel Aviv','IL',32.0853,34.7818,4],['Damascus','SY',33.5138,36.2765,2],
  ['Sanaa','YE',15.3694,44.1910,3],['Muscat','OM',23.5880,58.3829,1],['Manama','BH',26.2285,50.5860,1],
  ['Tashkent','UZ',41.2995,69.2401,3],['Almaty','KZ',43.2220,76.8512,2],['Baku','AZ',40.4093,49.8671,2],
  ['Tbilisi','GE',41.7151,44.8271,1],['Yerevan','AM',40.1792,44.4991,1],['Kabul','AF',34.5553,69.2075,4],
  ['Colombo','LK',6.9271,79.8612,1],['Kathmandu','NP',27.7172,85.3240,2],['Yangon','MM',16.8409,96.1735,5],
  ['Phnom Penh','KH',11.5564,104.9282,2],['Vientiane','LA',17.9757,102.6331,1],['Taipei','TW',25.0330,121.5654,3],
  ['Ulaanbaatar','MN',47.8864,106.9057,2],['Pyongyang','KP',39.0392,125.7625,3],['Busan','KR',35.1796,129.0756,3],
  ['Fukuoka','JP',33.5904,130.4017,2],['Sapporo','JP',43.0618,141.3545,2],['Surabaya','ID',-7.2575,112.7521,3],
  ['Bandung','ID',-6.9175,107.6191,2],['Davao','PH',7.1907,125.4553,2],['Cebu City','PH',10.3157,123.8854,1],
  ['Auckland','NZ',-36.8485,174.7633,2],['Brisbane','AU',-27.4698,153.0251,2],['Perth','AU',-31.9505,115.8605,2],
  ['Vienna','AT',48.2082,16.3738,2],['Warsaw','PL',52.2297,21.0122,2],['Budapest','HU',47.4979,19.0402,2],
  ['Prague','CZ',50.0755,14.4378,1],['Bucharest','RO',44.4268,26.1025,2],['Hamburg','DE',53.5511,9.9937,2],
  ['Munich','DE',48.1351,11.5820,1],['Amsterdam','NL',52.3676,4.9041,1],['Brussels','BE',50.8503,4.3517,2],
  ['Lisbon','PT',38.7223,-9.1393,3],['Stockholm','SE',59.3293,18.0686,2],['Oslo','NO',59.9139,10.7522,1],
  ['Copenhagen','DK',55.6761,12.5683,1],['Helsinki','FI',60.1699,24.9384,1],['Dublin','IE',53.3498,-6.2603,1],
  ['Zurich','CH',47.3769,8.5417,1],['Geneva','CH',46.2044,6.1432,1],['Lyon','FR',45.7640,4.8357,1],
  ['Marseille','FR',43.2965,5.3698,1],['Naples','IT',40.8518,14.2681,3],['Saint Petersburg','RU',59.9311,30.3609,5],
  ['Novosibirsk','RU',55.0084,82.9357,2],['Yekaterinburg','RU',56.8389,60.6057,1],['Minsk','BY',53.9006,27.5590,2],
  ['Belgrade','RS',44.7866,20.4489,1],['Sofia','BG',42.6977,23.3219,1],['Zagreb','HR',45.8150,15.9819,1],
  ['Tunis','TN',36.8065,10.1815,2],['Tripoli','LY',32.8872,13.1913,1],['Rabat','MA',34.0209,-6.8416,1],
  ['Dakar','SN',14.7167,-17.4677,3],['Bamako','ML',12.6392,-8.0029,2],['Kano','NG',12.0022,8.5920,4],
  ['Abuja','NG',9.0765,7.3986,3],['Ibadan','NG',7.3775,3.9470,3],['Douala','CM',4.0511,9.7679,3],
  ['Yaoundé','CM',3.8480,11.5021,3],['Kampala','UG',0.3476,32.5825,3],['Lusaka','ZM',-15.3875,28.3228,2],
  ['Harare','ZW',-17.8252,31.0335,2],['Maputo','MZ',-25.9692,32.5732,1],['Antananarivo','MG',-18.8792,47.5079,3],
  ['Mogadishu','SO',2.0469,45.3182,2],['Kigali','RW',-1.9706,30.1044,1],['Luanda','AO',-8.8390,13.2894,8],
  ['Pretoria','ZA',-25.7479,28.2293,2],['Durban','ZA',-29.8587,31.0218,3],['Bogotá','CO',4.7110,-74.0721,11],
  ['Medellín','CO',6.2442,-75.5812,4],['Cali','CO',3.4516,-76.5320,3],['Caracas','VE',10.4806,-66.9036,3],
  ['Quito','EC',-0.1807,-78.4678,2],['Guayaquil','EC',-2.1894,-79.8891,3],['La Paz','BO',-16.4897,-68.1193,2],
  ['Asunción','PY',-25.2637,-57.5759,2],['Montevideo','UY',-34.9011,-56.1645,1],['Brasília','BR',-15.8267,-47.9218,4],
  ['Salvador','BR',-12.9714,-38.5014,4],['Fortaleza','BR',-3.7319,-38.5267,4],['Curitiba','BR',-25.4284,-49.2733,3],
  ['Recife','BR',-8.0476,-34.8770,4],['Porto Alegre','BR',-30.0346,-51.2177,4],['Guadalajara','MX',20.6597,-103.3496,5],
  ['Monterrey','MX',25.6866,-100.3161,5],['Puebla','MX',19.0414,-98.2063,3],['Tijuana','MX',32.5149,-117.0382,2],
  ['Havana','CU',23.1136,-82.3666,2],['Santo Domingo','DO',18.4861,-69.9312,3],['Guatemala City','GT',14.6349,-90.5069,3],
  ['Panama City','PA',8.9824,-79.5199,2],['San José','CR',9.9281,-84.0907,1],['Kingston','JM',17.9714,-76.7920,1],
  ['Calgary','CA',51.0447,-114.0719,1],['Ottawa','CA',45.4215,-75.6972,1],['Denver','US',39.7392,-104.9903,3],
  ['Minneapolis','US',44.9778,-93.2650,3],['Detroit','US',42.3314,-83.0458,4],['San Diego','US',32.7157,-117.1611,3],
  ['Las Vegas','US',36.1699,-115.1398,2],['Portland','US',45.5152,-122.6784,2],['Orlando','US',28.5383,-81.3792,2],
  ['Honolulu','US',21.3069,-157.8583,1],['Anchorage','US',61.2181,-149.9003,1],['Reykjavik','IS',64.1466,-21.9426,1],
]

export const worldCities: WorldPlace[] = C
  .map(([name, country, lat, lng, rank]) => ({ name, country, lat, lng, rank }))
  .sort((a, b) => b.rank - a.rank)

// Ülke etiketleri (en uzak zoom kademesi) — başkent/merkez yaklaşık koordinat
const K: [string, string, number, number, number][] = [
  ['Türkiye','TR',39.0,35.0,85],['United States','US',39.0,-98.0,331],['China','CN',35.0,103.0,1412],
  ['India','IN',22.0,79.0,1408],['Brazil','BR',-10.0,-52.0,214],['Russia','RU',61.0,90.0,144],
  ['Japan','JP',36.0,138.0,125],['Germany','DE',51.0,10.0,83],['United Kingdom','GB',54.0,-2.0,67],
  ['France','FR',46.0,2.0,68],['Italy','IT',42.0,12.0,59],['Spain','ES',40.0,-3.5,47],
  ['Mexico','MX',23.0,-102.0,130],['Indonesia','ID',-2.0,118.0,274],['Canada','CA',56.0,-106.0,38],
  ['Australia','AU',-25.0,134.0,26],['Saudi Arabia','SA',24.0,45.0,35],['UAE','AE',24.0,54.0,10],
  ['Egypt','EG',26.0,30.0,104],['Nigeria','NG',9.0,8.0,206],['South Africa','ZA',-29.0,24.0,60],
  ['Argentina','AR',-34.0,-64.0,45],['Iran','IR',32.0,53.0,84],['Pakistan','PK',30.0,70.0,231],
  ['Bangladesh','BD',24.0,90.0,165],['Vietnam','VN',16.0,108.0,97],['Thailand','TH',15.0,101.0,70],
  ['South Korea','KR',36.5,128.0,52],['Poland','PL',52.0,19.0,38],['Ukraine','UA',49.0,32.0,41],
  ['Netherlands','NL',52.2,5.3,17],['Malaysia','MY',4.0,102.0,33],['Philippines','PH',13.0,122.0,111],
  ['Colombia','CO',4.0,-73.0,51],['Chile','CL',-33.0,-71.0,19],['Peru','PE',-10.0,-76.0,33],
  ['Morocco','MA',32.0,-6.0,37],['Algeria','DZ',28.0,3.0,44],['Kenya','KE',0.0,38.0,54],
  ['Sweden','SE',62.0,15.0,10],['Switzerland','CH',47.0,8.0,9],['Austria','AT',47.5,14.0,9],
  ['Greece','GR',39.0,22.0,10],['Portugal','PT',39.5,-8.0,10],['Qatar','QA',25.3,51.2,3],
]

export const worldCountries: WorldPlace[] = K
  .map(([name, country, lat, lng, rank]) => ({ name, country, lat, lng, rank }))
  .sort((a, b) => b.rank - a.rank)
