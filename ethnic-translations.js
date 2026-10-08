/* Chinese display names only; original GeoEPR attributes remain unchanged. */
globalThis.EthnicTranslations = (() => {
  const pairs = text => Object.fromEntries(text.trim().split('\n').map(line => line.trim().split('|')));
  const countries = pairs(`
Afghanistan|阿富汗
Albania|阿尔巴尼亚
Algeria|阿尔及利亚
Angola|安哥拉
Argentina|阿根廷
Armenia|亚美尼亚
Australia|澳大利亚
Austria|奥地利
Azerbaijan|阿塞拜疆
Bahrain|巴林
Bangladesh|孟加拉国
Belarus (Byelorussia)|白俄罗斯
Belgium|比利时
Belize|伯利兹
Benin|贝宁
Bhutan|不丹
Bolivia|玻利维亚
Bosnia-Herzegovina|波斯尼亚和黑塞哥维那
Botswana|博茨瓦纳
Brazil|巴西
Brunei|文莱
Bulgaria|保加利亚
Burundi|布隆迪
Cambodia (Kampuchea)|柬埔寨
Cameroon|喀麦隆
Canada|加拿大
Central African Republic|中非共和国
Chad|乍得
Chile|智利
China|中国
Colombia|哥伦比亚
Comoros|科摩罗
Congo|刚果共和国
Congo, Democratic Republic of (Zaire)|刚果民主共和国
Costa Rica|哥斯达黎加
Cote D'Ivoire|科特迪瓦
Croatia|克罗地亚
Cyprus|塞浦路斯
Djibouti|吉布提
Dominican Republic|多米尼加共和国
Ecuador|厄瓜多尔
Egypt|埃及
El Salvador|萨尔瓦多
Equatorial Guinea|赤道几内亚
Eritrea|厄立特里亚
Estonia|爱沙尼亚
Ethiopia|埃塞俄比亚
Fiji|斐济
Finland|芬兰
France|法国
Gabon|加蓬
Georgia|格鲁吉亚
Ghana|加纳
Greece|希腊
Guatemala|危地马拉
Guinea|几内亚
Guinea-Bissau|几内亚比绍
Guyana|圭亚那
Honduras|洪都拉斯
Hungary|匈牙利
India|印度
Indonesia|印度尼西亚
Iran (Persia)|伊朗
Iraq|伊拉克
Israel|以色列
Italy/Sardinia|意大利
Japan|日本
Jordan|约旦
Kazakhstan|哈萨克斯坦
Kenya|肯尼亚
Kosovo|科索沃
Kuwait|科威特
Kyrgyz Republic|吉尔吉斯斯坦
Laos|老挝
Latvia|拉脱维亚
Lebanon|黎巴嫩
Liberia|利比里亚
Libya|利比亚
Lithuania|立陶宛
Macedonia (FYROM/North Macedonia)|北马其顿
Malawi|马拉维
Malaysia|马来西亚
Mali|马里
Mauritania|毛里塔尼亚
Mauritius|毛里求斯
Mexico|墨西哥
Moldova|摩尔多瓦
Mongolia|蒙古国
Montenegro|黑山
Morocco|摩洛哥
Mozambique|莫桑比克
Myanmar (Burma)|缅甸
Namibia|纳米比亚
Nepal|尼泊尔
Netherlands|荷兰
New Zealand|新西兰
Nicaragua|尼加拉瓜
Niger|尼日尔
Nigeria|尼日利亚
Pakistan|巴基斯坦
Panama|巴拿马
Papua New Guinea|巴布亚新几内亚
Paraguay|巴拉圭
Peru|秘鲁
Philippines|菲律宾
Poland|波兰
Rumania|罗马尼亚
Russia (Soviet Union)|俄罗斯
Rwanda|卢旺达
Saudi Arabia|沙特阿拉伯
Senegal|塞内加尔
Serbia|塞尔维亚
Sierra Leone|塞拉利昂
Singapore|新加坡
Slovakia|斯洛伐克
Slovenia|斯洛文尼亚
South Africa|南非
South Sudan|南苏丹
Spain|西班牙
Sri Lanka (Ceylon)|斯里兰卡
Sudan|苏丹
Surinam|苏里南
Switzerland|瑞士
Syria|叙利亚
Taiwan|台湾
Tajikistan|塔吉克斯坦
Tanzania (Tanganyika)|坦桑尼亚
Thailand|泰国
Togo|多哥
Trinidad and Tobago|特立尼达和多巴哥
Turkey (Ottoman Empire)|土耳其
Turkmenistan|土库曼斯坦
Uganda|乌干达
Ukraine|乌克兰
United Kingdom|英国
United States of America|美国
Uruguay|乌拉圭
Uzbekistan|乌兹别克斯坦
Venezuela|委内瑞拉
Vietnam, Democratic Republic of|越南
Yemen (Arab Republic of Yemen)|也门
Zambia|赞比亚
Zimbabwe (Rhodesia)|津巴布韦
`);
  const groups = pairs(`
Abkhazians|阿布哈兹人
Aboriginal people|原住民
Acehnese|亚齐人
Adyghe|阿迪格人
Afar|阿法尔人
African Americans|非裔美国人
Afrikaners|阿非利卡人
Afro-Caribbeans|非裔加勒比人
Afro-Colombian|非裔哥伦比亚人
Afro-Costa Ricans|非裔哥斯达黎加人
Afro-Ecuadorians|非裔厄瓜多尔人
Afro-Guyanese|非裔圭亚那人
Afro-Uruguayans|非裔乌拉圭人
Afrobrazilians|非裔巴西人
Afromexicans|非裔墨西哥人
Afronicaraguans|非裔尼加拉瓜人
Afropanamanians|非裔巴拿马人
Afroperuvians|非裔秘鲁人
Afrovenezuelans|非裔委内瑞拉人
Ahmadis|艾哈迈迪派信徒
Ainu|阿伊努人
Al-Akhdam|阿赫达姆人
Alawi|阿拉维派信徒
Alawites|阿拉维派信徒
Albanians|阿尔巴尼亚人
Altai|阿尔泰人
Amboinese|安汶人
American Indians|美国原住民
Americo-Liberians|美裔利比里亚人
Amhara|阿姆哈拉人
Annobon Islanders|安诺本岛居民
Anuak|阿努阿克人
Anyuak|阿努阿克人
Aostans (French speakers)|奥斯塔人（法语使用者）
Arab Americans|阿拉伯裔美国人
Arab Muslims|阿拉伯穆斯林
Arabs|阿拉伯人
Arabs/Moors|阿拉伯人／摩尔人
Armenian Catholics|亚美尼亚天主教徒
Armenian Orthodox|亚美尼亚正教徒
Armenians|亚美尼亚人
Asante (Akan)|阿散蒂人（阿肯人）
Ashkenazim (Jewish)|阿什肯纳兹犹太人
Asian Americans|亚裔美国人
Asians|亚裔
Assyrians|亚述人
Austrians|奥地利人
Avars|阿瓦尔人
Aymara|艾马拉人
Azande|阿赞德人
Azeri|阿塞拜疆人
Baganda|干达人
Bahais|巴哈伊信徒
Bai|白族
Bakongo|刚果人
Balanta|巴兰塔人
Balinese|巴厘人
Balkars|巴尔卡尔人
Baloch|俾路支人
Baluchis|俾路支人
Bamar (Barman)|缅族
Bamileke|巴米累克人
Banyarwanda|巴尼亚卢旺达族群（卢旺达语族群）
Bari|巴里人
Bashkirs|巴什基尔人
Basoga|索加人
Basques|巴斯克人
Baster|巴斯特人
Bataks|巴塔克人
Baule|包勒人
Baya|巴亚人
Bedoon|比杜恩人
Beja|贝贾人
Bemba speakers|本巴语使用者
Bembe|本贝人
Bengali Hindus|孟加拉印度教徒
Bengali Muslims|孟加拉穆斯林
Beni-Shugal-Gumez|贝尼尚古勒—古穆兹族群
Berbers|柏柏尔人
Beti (and related peoples)|贝蒂人及相关族群
Biharis (Urdu-Speaker)|比哈尔人（乌尔都语使用者）
Black Africans|非洲黑人
Blacks|黑人
Blacks (Mande, Peul, Voltaic etc.)|黑人（曼德人、富拉人、沃尔特族群等）
Blang|布朗族
Bodo|博多人
Bosniak/Muslims|波什尼亚克人／穆斯林
Bosniaks|波什尼亚克人
Bosniaks/Muslims|波什尼亚克人／穆斯林
Bougainvilleans|布干维尔人
Bouyei|布依族
Bubi|布比人
Buddhist Arakanese|若开佛教徒
Bulgarians|保加利亚人
Bumiputera (Muslims)|土著族群（穆斯林）
Bumiputera (other)|土著族群（其他）
Buryats|布里亚特人
Byelorussians|白俄罗斯人
Caste Hill Hindu Elite|山地印度教高种姓精英
Catalans|加泰罗尼亚人
Catholics In N. Ireland|北爱尔兰天主教徒
Central (Chewa)|中部族群（切瓦人）
Cham and Malays|占族与马来人
Chechens|车臣人
Cherkess|切尔克斯人
Chinese|华人
Chinese (Han)|汉族
Choco (Embera-Wounan)|乔科人（恩贝拉人、沃纳安人）
Christian lowlanders|低地基督徒
Christians|基督徒
Chukchi|楚科奇人
Chuvashes|楚瓦什人
Coloreds|有色人种（南非历史分类）
Coptic Christians|科普特基督徒
Corsicans|科西嘉人
Creoles|克里奥尔人
Crimean Tatars|克里米亚鞑靼人
Croats|克罗地亚人
Dai|傣族
Dalits|达利特人
Damara|达马拉人
Dao|瑶族
Dargins|达尔金人
Daur|达斡尔族
Dayak|达雅克人
Dayaks|达雅克人
Didinga|迪丁加人
Dinka|丁卡人
Diola|迪奥拉人
Djerma-Songhai|哲尔马人／桑海人
Dominican Haitians|多米尼加的海地裔居民
Dominicans|多米尼加人
Dong|侗族
Dongxiang|东乡族
Druze|德鲁兹人
Dutch|荷兰人
East Indians|印度裔
English|英格兰人
English speakers|英语使用者
Estonians|爱沙尼亚人
Eurasians and Others|欧亚混血及其他族群
Ewe|埃维人
Ewe (and related groups)|埃维人及相关族群
Fang|芳人
Fijians|斐济人
Finns|芬兰人
Flemings|弗拉芒人
Franco-Mauritians|法裔毛里求斯人
French|法国人
French speakers|法语使用者
Friulians|弗留利人
Fulani|富拉人
Fulani (and other northern Muslim peoples)|富拉人及其他北部穆斯林族群
Fur|富尔人
Ga-Adangbe|加人／阿丹格贝人
Gagauz|加告兹人
Galicians|加利西亚人
Garifuna|加里富纳人
Gartfuna|加里富纳人
Gelao|仡佬族
Georgians|格鲁吉亚人
German speakers (Austrians)|德语使用者（奥地利人）
Germans|德意志人
Gia Rai|嘉莱族
Gio|吉奥人
Gorani|戈拉尼人
Greek Catholics|希腊礼天主教徒
Greek Orthodox|希腊正教徒
Greeks|希腊人
Guarana and other eastern indigenous groups|瓜拉尼人及其他东部原住民族群
Hadjerai|哈杰赖人
Hani|哈尼族
Harari|哈勒尔人
Haratins (Black Moors)|哈拉廷人（黑人摩尔人）
Hausa|豪萨人
Hausa-Fulani and Muslim Middle Belt|豪萨人、富拉人及中部地带穆斯林
Hazara|哈扎拉人
Herero, Mbanderu|赫雷罗人／姆班德鲁人
Herero/Mbanderu|赫雷罗人／姆班德鲁人
Hill Tribes|山地族群
Himba|辛巴人
Hindi-speaking Hindus|印地语印度教徒
Hindus|印度教徒
Hmong|赫蒙族群（苗族相关支系）
Hoa (Chinese)|华族（华人）
Hui (proper)|回族
Hungarians|匈牙利人
Hutu|胡图人
Igbo|伊博人
Ijaw|伊乔人
Indian Tamils|印度裔泰米尔人
Indians|印度裔
Indigenous|原住民
Indigenous highland peoples (Kichwa)|高地原住民（基奇瓦人）
Indigenous lowland peoples (Shuar, Achuar etc.)|低地原住民（舒阿尔人、阿丘阿尔人等）
Indigenous peoples|原住民族群
Indigenous Peoples (Arawaks and Caribs)|原住民族群（阿拉瓦克人、加勒比人）
Indigenous peoples of the Amazon|亚马孙原住民族群
Indigenous peoples of the Andes|安第斯原住民族群
Indigenous Tripuri|特里普里原住民
Indigenous/Aboriginal Taiwanese|台湾原住民族群
Indo-Guyanese|印度裔圭亚那人
Ingush|印古什人
Isaas (Somali)|伊萨人（索马里人）
Ismaili Shia (South) (Arab)|南部伊斯玛仪派什叶派（阿拉伯人）
Israeli Arabs|以色列阿拉伯人
Italians|意大利人
Ja'afari Shia (Eastern Province) (Arab)|东部省贾法里派什叶派（阿拉伯人）
Japanese|日本人
Javanese|爪哇人
Jews|犹太人
Jingpo|景颇族
Jordanian Arabs|约旦阿拉伯人
Kabardins|卡巴尔达人
Kachins|克钦族群（多个相关民族的合称）
Kadazans|卡达山人
Kalanga|卡兰加人
Kalenjin-Masai-Turkana-Samburu|卡伦金人、马赛人、图尔卡纳人、桑布鲁人
Kalmyks|卡尔梅克人
Kamba|坎巴人
Kanouri|卡努里人
Kaonde (NW Province)|卡翁德人（西北省）
Karachai|卡拉恰伊人
Karakalpak|卡拉卡尔帕克人
Karelians|卡累利阿人
Karenni (Red Karens)|克伦尼人（红克伦人）
Kashmiri Muslims|克什米尔穆斯林
Kavango|卡万戈人
Kayin (Karens)|克伦人
Kazakh|哈萨克族
Kazakhs|哈萨克人
Khakass|哈卡斯人
Khmer|高棉人
Khmer Loeu (various indigenous minorities)|高地高棉族群（多个原住民少数族群）
Khmou|克木人
Kikuyu-Meru-Emb|基库尤人、梅鲁人、恩布人
Kinh (Vietnamese)|京族（越南人）
Kirghiz|柯尔克孜族
Kisii|基西人
Komi|科米人
Kono|科诺人
Krahn (Guere)|克拉恩人（盖雷人）
Kru|克鲁人
Kumyks|库梅克人
Kuna|库纳人
Kunama|库纳马人
Kurds|库尔德人
Kurds/Yezidis|库尔德人／雅兹迪人
Kuwaiti Shi'a (Arab)|科威特什叶派（阿拉伯人）
Kuwaiti Sunni (Arab)|科威特逊尼派（阿拉伯人）
Kyrgyz|吉尔吉斯人
Ladinos|拉迪诺人
Lahu|拉祜族
Langi/Acholi|兰吉人／阿乔利人
Lao (incl. Phuan)|老族（含普安人）
Lao Sung (excl. Hmong)|高山老族群（不含苗族）
Lao Tai|低地老族群
Lao Thoeng (excl. Khmou)|中山老族群（不含克木人）
Lari/Bakongo|拉里人／刚果人
Latinos|拉丁裔
Latvians|拉脱维亚人
Lezgins|列兹金人
Lhotsampa (Hindu Nepalese)|洛昌人（尼泊尔裔印度教徒）
Li|黎族
Limba|林巴人
Lisu|傈僳族
Lithuanians|立陶宛人
Lozi (Barotse)|洛齐人（巴罗策人）
Luanda (NW Province)|隆达人（西北省）
Luba Kasai|开赛卢巴人
Luba Shaba|沙巴卢巴人
Luhya|卢希亚人
Lulua|卢卢阿人
Lunda-Chokwe|隆达人／乔奎人
Lunda-Yeke|隆达人／耶克人
Luo|卢奥人
Luvale (NW Province)|卢瓦勒人（西北省）
Maasai|马赛人
Macedonians|马其顿人
Madhesi|马德西人
Madura|马都拉人
Mainland Chinese|中国大陆族群
Mainland Muslims|大陆地区穆斯林
Makassarese and Bugis|望加锡人／布吉人
Makonde-Yao|马孔德人／尧族群（非洲 Yao）
Malay|马来人
Malay Muslims|马来穆斯林
Malays|马来人
Malinke|马林凯人
Manchu|满族
Mandingo|曼丁哥人
Mandingue (and other eastern groups)|曼丁人及其他东部族群
Manipuri|曼尼普尔人
Manjaco|曼贾科人
Mano|马诺人
Maonan|毛南族
Maori|毛利人
Mapuche|马普切人
Marathis|马拉地人
Mari|马里人
Maronite Christians|马龙派基督徒
Maroons|马龙人（逃亡奴隶后裔族群）
Masalit|马萨利特人
Maya|玛雅人
Mbochi (proper)|姆博希人
Mbundu-Mestico|姆本杜人／混血族群
Mende|门德人
Mestizos|梅斯蒂索人（混血族群）
Miao|苗族
Mijikenda|米吉肯达人
Minangkabaus|米南加保人
Miskitos|米斯基托人
Mizo|米佐人
Mizrahim (Jewish)|米兹拉希犹太人
Mohajirs|穆哈吉尔人
Moldovans|摩尔多瓦人
Mongo|蒙戈人
Mongolians|蒙古族
Mongols|蒙古族
Mons|孟族
Montenegrins|黑山人
Moors (Muslims)|摩尔人（穆斯林）
Mordva|莫尔多瓦人
Moro|摩洛人
Mulam|仫佬族
Mundari|蒙达里人
Muong|芒族
Murle|穆尔勒人
Muslim Arakanese|若开穆斯林
Muslims|穆斯林
Mwali Comorans|莫埃利岛科摩罗人
Naga|那加人
Nama|纳马人
Naxi|纳西族
Ndebele|恩德贝莱人
Ndebele-Kalanga-(Tonga)|恩德贝莱人、卡兰加人、汤加人
New Zealanders|新西兰人
Newars|尼瓦尔人
Ngalops (Drupka)|恩加洛普人（竹巴人）
Ngazidja Comorans|大科摩罗岛科摩罗人
Non-Bumiputera (Indigenous)|非土著地位原住民族群
Northern Groups (Mole-Dagbani, Gurma, Grusi)|北部族群（莫莱—达格巴尼人、古尔马人、古鲁西人）
Northern Shafi'i|北部沙斐仪派
Northern Zaydis|北部宰德派
Northerners (Mande and Voltaic/Gur)|北部族群（曼德人、沃尔特／古尔族群）
Northerners (Tumbuka, Tonga, Ngonde)|北部族群（通布卡人、汤加人、恩贡德人）
Northwestern Anglophones (Grassfielders)|西北部英语族群（草原地区族群）
Nuba|努巴人
Nuer|努尔人
Nung|侬族
Nyanja speakers (Easterners)|尼扬贾语使用者（东部族群）
Nzwani Comorans|昂儒昂岛科摩罗人
Ogoni|奥戈尼人
Okinawans|冲绳人
Orang Asli|马来半岛原住民
Oroma|奥罗莫人
Ossetes|奥塞梯人
Ossetians (South)|南奥塞梯人
Other Akans|其他阿肯族群
Other Arab Groups|其他阿拉伯族群
Other Backward Classes/Castes|其他落后阶层／种姓（印度法定分类）
Other indigenous groups|其他原住民族群
Other Kivu groups|其他基伍族群
Other Muslims|其他穆斯林
Other Northern Groups|其他北部族群
Other Southern Nations|其他南部民族
Others Mainland (Christians and traditional religions)|大陆其他族群（基督教及传统宗教）
Ovambo|奥万博人
Ovimbundu-Ovambo|奥文本杜人／奥万博人
Pacific Islanders|太平洋岛民
Palestinian Arabs|巴勒斯坦阿拉伯人
Palestinians (Arab)|巴勒斯坦人（阿拉伯人）
Pamiri Tajiks|帕米尔塔吉克人
Papua New Guineans|巴布亚新几内亚人
Papuans|巴布亚人
Pashtuns|普什图人
Pedi (North Sotho)|佩迪人（北索托人）
Persians|波斯人
Peul|富拉人
Poles|波兰人
Protestants|新教徒
Protestants In N. Ireland|北爱尔兰新教徒
Pulaar (Peul, Toucouleur)|普拉尔语族群（富拉人、图库勒尔人）
Punjabi|旁遮普人
Qiang|羌族
Quechua|克丘亚人
Rashaida|拉沙伊达人
Roma|罗姆人
Romanians|罗马尼亚人
Romanians/Moldovans|罗马尼亚人／摩尔多瓦人
Russian speakers|俄语使用者
Russian-speakers|俄语使用者
Russians|俄罗斯人
Russians (Jewish)|俄罗斯犹太人
Rusyns|鲁辛人
Saho|萨霍人
Sahrawis|撒哈拉人
Salar|撒拉族
San|桑人
Sara|萨拉人
Sardinians|撒丁人
Scheduled Castes|表列种姓（印度法定分类）
Scheduled Tribes|表列部落（印度法定分类）
Scots|苏格兰人
Serbs|塞尔维亚人
Serer|塞雷尔人
Shan|掸族
Sharchops|沙尔乔普人
She|畲族
Shi'a Arabs|什叶派阿拉伯人
Shi'a Muslims (Arab)|什叶派穆斯林（阿拉伯人）
Shilluk|希卢克人
Shirazi (Zanzibar Africans)|设拉子族群（桑给巴尔非洲人）
Shona|绍纳人
Shona-Ndau|绍纳人／恩达乌人
Shui|水族
Sindhi|信德人
Sinhalese|僧伽罗人
Slovaks|斯洛伐克人
Slovenes|斯洛文尼亚人
Somali|索马里人
Somali (Ogaden)|索马里人（欧加登）
South Sotho|南索托人
South-Westerners (Ankole, Banyoro, Toro)|西南部族群（安科莱人、尼奥罗人、托罗人）
South/Central (Fon)|南部及中部族群（丰人）
Southeastern (Yoruba/Nagot and Goun)|东南部族群（约鲁巴／纳戈人、贡人）
Southern Mande|南部曼德族群
Southern Shafi'i|南部沙斐仪派
Southerners (Lomwe, Mang'anja, Nyanja, Yao)|南部族群（隆韦人、曼甘贾人、尼扬贾人、尧族群）
Southwestern (Adja)|西南部族群（阿贾人）
Southwestern Anglophones (Bakweri etc.)|西南部英语族群（巴克韦里人等）
Spanish|西班牙人
Sri Lankan Tamils|斯里兰卡泰米尔人
Sumus|苏穆人
Sundanese|巽他人
Sunni Arabs|逊尼派阿拉伯人
Sunni Shafii/Sofi (Hijazi) (Arab)|逊尼派沙斐仪／苏菲族群（汉志阿拉伯人）
Sunni Wahhabi (Najdi) (Arab)|逊尼派瓦哈比族群（内志阿拉伯人）
Sunnis (Arab)|逊尼派（阿拉伯人）
Susu|苏苏人
Swazi|斯威士人
Swedes|瑞典人
Swiss French|瑞士法语族群
Swiss Germans|瑞士德语族群
Swiss Italians|瑞士意大利语族群
Taiwanese|台湾族群
Tajiks|塔吉克人
Talysh|塔雷什人
Tamils and Telugus|泰米尔人／泰卢固人
Tatars|鞑靼人
Tay|岱依族（Tay）
Temne|泰姆奈人
Teso|特索人
Tetela-Kusu|泰特拉人／库苏人
Thai|泰族
Tibetans|藏族
Tigry|提格雷人（埃塞俄比亚）
Tiv|蒂夫人
Tonga-Ila-Lenje (Southerners)|汤加人、伊拉人、伦杰人（南部族群）
Toposa|托波萨人
Toubou|图布人
Tribal-Buddhists|部落佛教徒
Tsonga|聪加人
Tsonga-Chopi|聪加人／乔皮人
Tswana|茨瓦纳人
Tu|土族
Tuareg|图阿雷格人
Tujia|土家族
Tupi-Guarani and other indigenous groups|图皮—瓜拉尼人及其他原住民族群
Turkish|土耳其人
Turkmen|土库曼人
Turks|土耳其人
Tutsi|图西人
Tutsi-Banyamulenge|图西人／巴尼亚穆伦格人
Tuvinians|图瓦人
Udmurt|乌德穆尔特人
Uighur|维吾尔族
Ukrainians|乌克兰人
Uyghur|维吾尔族
Uzbeks|乌兹别克人
Venda|文达人
Vietnamese|越南人
Vili|维利人
Vlachs|弗拉赫人
Wa|佤族
Walloon|瓦隆人
Welsh|威尔士人
White|白人
White Moors (Beydan)|白人摩尔人（比丹人）
White Zimbabweans|津巴布韦白人
Whites|白人
Whites/mestizos|白人／梅斯蒂索混血族群
Wolof|沃洛夫人
Xhosa|科萨人
Xibe|锡伯族
Xinca|辛卡人
Yakuts|雅库特人
Yao|瑶族
Yeyi|耶伊人
Yi|彝族
Yoruba|约鲁巴人
Zaghawa|扎加瓦人
Zaghawa, Bideyat|扎加瓦人／比迪亚特人
Zanzibar Arabs|桑给巴尔阿拉伯人
Zhuang|壮族
Zomis (Chins)|佐米人（钦族）
Zoroastrians|琐罗亚斯德教徒
Zulu|祖鲁人
Adibasi Janajati|原住民族群（尼泊尔 Janajati）
Koreans|朝鲜族群
English Speakers|英语使用者
Indigenous peoples (Lenca, Maya-Chorti, Miskito, Tawahka/Sumu, Xicaque, Pech, Nahua)|原住民族群（伦卡人、乔尔蒂玛雅人、米斯基托人、塔瓦卡／苏穆人、希卡克人、佩奇人、纳瓦人）
Ngnbe-Bugl|恩戈贝—布格莱人
Papel|帕佩尔人
Fernandinos|费尔南迪诺人
Ndowe|恩多韦人
Kabr|卡布雷人
Bassa/Duala|巴萨人／杜阿拉人
Eshira/Bapounou|埃希拉人／普努人
Myene|米耶内人
Ngbaka/Mbaka|恩巴卡人／姆巴卡人
Yakoma|雅科马人
Kouyou|库尤人
Ngbandi|恩班迪人
Ngbaka|恩巴卡人
Cabindan Mayombe|卡宾达马永贝族群
Mafwe|马夫韦人
Basubia|苏比亚人
Kgalagadi|卡拉哈迪人
Mbukushu|姆布库舒人
Tswapong|茨瓦蓬人
Birwa|比尔瓦人
Shaygiyya, Ja'aliyyin and Danagla (Arab)|沙伊吉亚人、贾阿利因人、达纳格拉人（阿拉伯人）
Northern (Bariba, Peul, Ottamari, Yoa-Lokpa, Dendi, Gourmanch,ma)|北部族群（巴里巴人、富拉人、奥塔马里人、Yoa-Lokpa、登迪人、古尔马人）
Mbede (Nzebi, Bateke, Obamba)|姆贝德族群（恩泽比人、特克人、奥班巴人）
`);
  const types = pairs(`
Aggregate|合并记录
Dispersed|分散居住
Migrant|迁移族群
Regional & urban|区域及城市聚居
Regionally based|区域聚居
Statewide|全国分布
Urban|城市聚居
`);
  const indianNames = {Assamese:'阿萨姆人',Bengali:'孟加拉人',Gujarati:'古吉拉特人',Hindi:'印地语族群',Kannada:'卡纳达人',Malyalam:'马拉雅拉姆人',Marathi:'马拉地人',Oriya:'奥迪亚人',Punjabi:'旁遮普人','Punjabi-Sikhs':'旁遮普锡克人',Tamil:'泰米尔人',Telugu:'泰卢固人'};
  function group(name, country) {
    name = String(name ?? '').trim();
    if (name === 'Koreans' && country === 'China') return '朝鲜族';
    if (name === 'Yao' && country !== 'China') return '尧族群（非洲 Yao）';
    if (groups[name]) return groups[name];
    const match = name?.match(/^(.+?) \((?:non-|Non |Non-)(SC\/ST(?:\/OBCs| OBCs)?)\)$/);
    if (match && indianNames[match[1]]) return `${indianNames[match[1]]}（不含表列种姓、表列部落${match[2].includes('OBC') ? '及其他落后阶层' : ''}）`;
    return name;
  }
  function shortGroup(name,country) {
    if(name==='Scheduled Castes')return '表列种姓';
    if(name==='Scheduled Tribes')return '表列部落';
    const match=String(name).match(/^(.+?) \((?:non-|Non |Non-)(SC\/ST(?:\/OBCs| OBCs)?)\)$/);
    if(match && indianNames[match[1]])return indianNames[match[1]];
    return group(name,country);
  }
  function explanation(name) {
    if(name==='Scheduled Castes')return '印度法律列明的种姓类别，涵盖多个群体，不是单一民族。';
    if(name==='Scheduled Tribes')return '印度法律列明的部落类别，涵盖多个民族。';
    if(/non-|Non |Non-/.test(name) && /SC\/ST/.test(name))return '这是语言群体的研究分组；不含表列种姓、表列部落'+(name.includes('OBC')?'和其他落后阶层':'')+'。';
    if(name==='Other Muslims')return '数据源将未单独列出的穆斯林群体合在此项；这是宗教分组。';
    return '';
  }
  return {country:name => countries[name] || name, group, shortGroup, explanation, type:name => types[name] || name};
})();
