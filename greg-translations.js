/* GREG historical spellings: display translations, never identity merges. */
globalThis.GregTranslations = (() => {
  const names = Object.fromEntries(`
Curaçao Islanders|库拉索岛民
English-speaking population of the Lesser Antilles|小安的列斯群岛英语族群
Brahui|布拉灰人
Afghans|阿富汗族群（普什图人）
Turkmens|土库曼人
Teymurs|泰穆里人
Jamshidis|贾姆希迪人
Hazara-Deh-i-Zainat|德赫扎伊纳特哈扎拉人
Afghanistan Arabs|阿富汗阿拉伯人
Firoz-Kohis|菲罗兹科希人
Taimanis|泰马尼人
Hazara-Berberi|贝尔贝里哈扎拉人
Nuristanis|努里斯坦人
Kirghis|吉尔吉斯人
Pamir Tajiks|帕米尔塔吉克人
Ormuri|奥尔穆里人
Tirahi|蒂拉希人
Pashai|帕沙伊人
Parachi|帕拉奇人
Algeria Arabs|阿尔及利亚阿拉伯人
Oases Berbers|绿洲柏柏尔人
Morocco Arabs|摩洛哥阿拉伯人
Rif|里夫人
Kabiles|卡比尔人
Libya Arabs|利比亚阿拉伯人
Tuaregs|图阿雷格人
Shawiya|沙维亚人
Aromani|阿罗马尼亚人
Bambundu|姆本杜人
Ovimbundu|奥文本杜人
Herero|赫雷罗人
Bushmen|桑人（原称布须曼人）
Waluchazi|卢查齐人
Wayeye|耶伊人
Balozi|洛齐人
Wachokwe|乔奎人
Balunda|隆达人
Bankoya and Wambuela|恩科亚人／姆布埃拉人
Wanyaneka|尼亚内卡人
Samoans|萨摩亚人
Argentinians|阿根廷族群
Toba|托巴人
Caingua|凯因瓜人
Ashluslay, Choroti, Mataco, Maca|阿什卢斯莱人、乔罗蒂人、马塔科人、马卡人
Brazilians|巴西族群
Chileans|智利族群
Araucanians|阿劳坎人（马普切人）
Tehuelche and Óna|特韦尔切人／奥纳人
Alacaluf|阿拉卡卢夫人
Yamana|雅马纳人
Torres Strait Islanders|托雷斯海峡岛民
Australian aborigines|澳大利亚原住民
Australians|澳大利亚族群
Hungarians or Magyars|匈牙利人（马扎尔人）
Arabs of Yemen|也门阿拉伯人
Mashona|绍纳人
Bechuanas|茨瓦纳人
Pedi|佩迪人
Bahama Islanders|巴哈马岛民
Walloons|瓦隆人
Burmese|缅族
Bengalis|孟加拉人
Mayas|玛雅人
Kekchi|凯克奇玛雅人
Garifs (Black Caribs)|加里富纳人（黑人加勒比人）
English-speaking population of British Honduras|英属洪都拉斯英语族群
Toromonas|托罗莫纳人
Mayorunas|马约鲁纳人
Bolivians|玻利维亚族群
Chane|查内人
Maniteneris|马尼特内里人
More (Itene)|莫雷人（伊特内人）
Paiconecas|派科内卡人
Bororo|博罗罗人
Guarañoco|瓜拉尼奥科人
Baure|鲍雷人
Mojo|莫霍人
Cayubaba, Yuracare|卡尤巴巴人／尤拉卡雷人
Nagas|那加人
Palaung|德昂族（崩龙族群）
Lao|老族
Karen|克伦人
Kayah|克耶人
Mon (Talaing)|孟族
Chini|钦族
Khun|傣痕族群
Selung|莫肯人（塞隆人）
Nua|傣那族群
Barba|巴里巴人
Songai|桑海人
Fulbe|富拉人
Tem|特姆人
Busa|布萨人
Somba (incl. Berba, Bilapila)|松巴族群（含贝尔巴人、比拉皮拉人）
Melanesians of Solomon Isls.|所罗门群岛美拉尼西亚族群
Papuans of Solomon Isls.|所罗门群岛巴布亚族群
Melanesians of Santa Cruz Isls.|圣克鲁斯群岛美拉尼西亚族群
Outliers (Polynesians of Melanesia)|美拉尼西亚境内的波利尼西亚族群
Macu|马库族群
Panare|帕纳雷人
Baniwe|巴尼瓦人
Pase|帕塞人
Coreguaje, Sioni, etc.|科雷瓜赫人、锡奥纳人等
Yukuna|尤库纳人
Cueretu|库雷图人
Oyampi|瓦扬皮人
Tirio|蒂里奥人
Mura|穆拉人
Cocamas|科卡马人
Araras|阿拉拉人
Nambikwara|南比夸拉人
Catukinas|卡图基纳人
Yamamadis|雅马马迪人
Arikem|阿里肯人
Caritiana|卡里蒂亚纳人
Guana|瓜纳人
Cayapo|卡亚波人
Caingangs|凯因冈人
Botocudos|博托库多人
Guato|瓜托人
Caraja|卡拉雅人
Bacairis|巴卡伊里人
Galibis|加利比人
Tenetehara|特内特哈拉人
Tibetan-speaking peoples of Bhutan|不丹藏语族群
Loba|珞巴族群
Assamese|阿萨姆人
Oraons|奥拉翁人
Santals|桑塔尔人
Nepalese|尼泊尔族群
Lepchas|雷布查人
Riau, Palembang|廖内人／巨港族群
Dusuns|杜顺人
Melanaus|马兰诺人
Ibans|伊班人
Kadayans|克达央人
Banyaruanda|卢旺达人
Barundi|隆迪人
Eskimos|爱斯基摩族群（历史称谓）
English Canadians|加拿大英语族群
French Canadians|加拿大法语族群
Algonquins|阿尔冈昆人
Tsimshian|钦西安人
Haida|海达人
Cree|克里人
Montagnais|蒙塔涅人（因努人）
Kwakiutl|夸基乌特尔族群
Nootka|努特卡族群
Salish|萨利什族群
Arapahos|阿拉帕霍人
Norwegians|挪威人
Ojibway|奥吉布瓦人
Iroquois|易洛魁族群
Athapaskans|阿萨巴斯卡族群
Wakash|瓦卡什族群
Khmers|高棉人
Malays of Malaya|马来亚马来人
Stieng|斯丁族
Ma|麻族
Jarai|嘉莱族
Kui|库伊人
Siamese|暹罗泰族
Cham|占族
Mnong and Brao|姆农族／布劳族
Boloven|波罗芬族群
Sudan Arabs|苏丹阿拉伯人
Maba (incl. Masalit)|马巴族群（含马萨利特人）
Dago|达朱族群
Mubi|穆比人
Tama|塔马人
Bagirmi|巴吉尔米人
Kanuri|卡努里人
Tubu|图布人
Shoa-Arabs|舒瓦阿拉伯人
Banda|班达人
Chamba|昌巴人
Kotoko|科托科人
Masa|马萨人
Bura, Bata and Tera|布拉人、巴塔人、特拉人
Zagawa|扎加瓦人
Tamils|泰米尔人
Veddas|维达人
Sere-Mundu|塞雷—蒙杜族群
Ngiri|恩吉里族群
Bantu-speaking Pygmy tribes|使用班图语的俾格米族群
Maka|马卡人
Bobangi and Bangala|博班吉人／班加拉人
Bakota|科塔人
Mpongwe|姆蓬韦人
Bateke|特克人
Bakele|凯莱人
Gbaya|格巴亚人
Ngombe|恩贡贝人
Basakata|萨卡塔人
Bakuba|库巴人
Barega|莱加人
Baluba|卢巴人
Bakomo|科莫人
Banyoro|尼奥罗人
Moru-Mangbetu and Sere-Mundu-speaking Pygmy tribes|使用莫鲁—芒贝图语及塞雷—蒙杜语的俾格米族群
Moru-Mangbetu|莫鲁—芒贝图族群
Mba|姆巴人
Baboa|博阿人
Southern Lwo|南部卢奥族群
Bakonjo|孔乔人
Bemba|本巴人
Evenks (incl. Hamnigans)|鄂温克族群（含哈米尼干人）
Orochons|鄂伦春族群
Manchus|满族
Dahurs|达斡尔族
Mongols of Chinese Peoples' Republic|中国蒙古族
Nanaians|那乃人（赫哲族群）
Sibo|锡伯族
Hui|回族
Tunghsiang|东乡族
Paoan|保安族
Salars|撒拉族
Tujen|土族
Sari-Uighurs|裕固族
Uighurs|维吾尔族
Tulung|独龙族
Nahsi|纳西族
Achang|阿昌族
Pulang|布朗族
Pai|白族
Chuang|壮族
Mulao|仫佬族
Tung|侗族
Puyi|布依族
Shuichia|水族
Kehlao|仡佬族
Tuchia|土家族
Chiang|羌族
Jamaicans|牙买加族群
Mbum|姆布姆人
Jukun and Idoma|朱昆人／伊多马人
Bute|布特人
Duala|杜阿拉人
Tikar|蒂卡尔人
Mandara|曼达拉人
Swahili|斯瓦希里人
Motilones|莫蒂隆族群
Goajiro|瓜希罗人（瓦尤人）
Columbians|哥伦比亚族群
Muisca, Paese, Cofan, etc.|穆伊斯卡人、帕埃斯人、科凡人等
Bora|博拉人
Achaguas|阿查瓜人
Yaruro|雅鲁罗人
Venezuelans|委内瑞拉族群
Chamorros|查莫罗人
Costa Ricans|哥斯达黎加族群
Bribri|布里布里人
Cabecar|卡贝卡尔人
Terraba|特拉巴人
Boruca|博鲁卡人
Chorotegi-Mange|乔罗特加—曼格族群
Guatuso|瓜图索人
Cubans|古巴族群
Portuguese|葡萄牙人
Cook Islanders or Cook|库克群岛族群
Pukapukans|普卡普卡岛民
Czechs|捷克人
Danes|丹麦人
Danakil|阿法尔人（达纳基尔人）
Ecuadorians|厄瓜多尔族群
Achuale|阿丘阿尔人
Arabs of UAR (Egyptians)|埃及阿拉伯人
Nubians|努比亚人
Irishmen|爱尔兰人
Hondurans|洪都拉斯族群
Lenca|伦卡人
Pipil|皮皮尔人
Salvadorians|萨尔瓦多族群
Tigrai|提格利尼亚族群
Galla|奥罗莫人（旧称加拉人）
Tigre|提格雷人
Barea|巴雷亚人（纳拉人）
Agau|阿高族群
Sidamo|锡达莫族群
Koma|科马人
Somalis|索马里人
French-speaking population of Guiana|圭亚那地区法语族群
Saami|萨米人
Hindi-speaking peoples of Northern India|印度北部印地语族群
Falkland Islanders|福克兰群岛居民
Ponapeans|波纳佩岛民
Kusaieans|科斯雷岛民
Faroer Islanders|法罗群岛居民
Marquesans|马克萨斯群岛族群
Tahitians|塔希提人
Bretons|布列塔尼人
Alsatians and Lotharingians|阿尔萨斯人／洛林人
Lusatians|索布人（卢萨蒂亚人）
Akan|阿肯人
Gurma|古尔马人
Grusi|古鲁西人
Togo tribes|多哥各部族
Lobi|洛比人
Kulango|库兰戈人
Mossi|莫西人
Spaniards|西班牙人
Englishmen|英格兰人
French-speaking population of the Lesser Antilles|小安的列斯群岛法语族群
US Americans|美国族群
Iloko|伊洛科人
Guatemalians|危地马拉族群
Pocomchi|波科姆奇玛雅人
Ixil|伊希尔玛雅人
Chuj|丘赫玛雅人
Jalaltecs|哈卡尔特克人
Tojolabali|托霍拉瓦尔人
Mame|马姆玛雅人
Aguatecs|阿瓦卡特克人
Uspantecs|乌斯潘特克人
Quiche|基切玛雅人
Tsutujil|楚图希尔人
Kakchiquels|卡克奇克尔人
Pocoman|波科曼人
Chorti|乔尔蒂玛雅人
Lacandons|拉坎敦人
Kisi|基西人
Nalu|纳卢人
Tenda|滕达族群
Wai|瓦伊人
Kpelle|克佩勒人
Loma|洛马人
Frisians|弗里斯兰人
English-speaking population of Guiana|圭亚那地区英语族群
Jordan and Palestine Arabs|约旦及巴勒斯坦阿拉伯人
Haitians|海地族群
Sumu|苏穆人
Paya|帕亚人（佩奇人）
Nicaraguans|尼加拉瓜族群
Torrupan|托卢潘人
Rumanians|罗马尼亚人
Icelanders|冰岛人
Gayos|加约人
Alas|阿拉斯人
Achinese|亚齐人
Sea Nomads or Sea Gipsies (Orang-Laut)|海上游民族群（奥朗劳特人）
Batins|巴廷人
Kubu and Akits|库布人／阿基特人
Redjang-Lebongs|勒姜—勒邦族群
Lampongs|楠榜人
Simalur|锡默卢岛民
Mentawei|明打威族群
Niassans|尼亚斯人
Engganese|恩加诺人
Madurese|马都拉人
Banjarese|班贾尔人
Sumbawanese|松巴哇人
Sumbanese|松巴人
Bima|比马人
Manggarai|芒加莱人
Buginese|布吉人
Makassarese|望加锡人
Savu|萨武人
Poso|波索族群
Muna|穆纳人
Solor|索洛尔岛民
Butung|布顿人
Alors|阿洛尔族群
Talaud|塔劳德族群
Tenggerese|腾格尔人
Ngada|恩加达人
Sikka|锡卡人
Lio|利奥人
Sasaks and Bodhas|萨萨克人／博达族群
Laruntuks|拉兰图卡族群
Toala|托阿拉人
Mandars|曼达尔人
Sadang|萨当族群
Koro|科罗族群
Bungku|邦库人
Mori|莫里人
Laki|拉基人
Loinangs|洛伊南人
Banggai|邦盖人
Palu|帕卢族群
Tominis|托米尼族群
Gorontalos|哥伦打洛人
Bolaang-Mongondou|博朗—蒙贡多族群
Minahasa|米纳哈萨人
Ngadju|恩加朱人
Klemantans|克勒曼坦族群
Kayans|卡扬人
Punans, Beketans|普南人／贝克坦人
Bahau|巴豪人
Kenyahs|肯雅人
Muruts and Kelabits|穆鲁特人／克拉比特人
Benua|贝努阿族群
Badui|巴杜伊人
Rotinese|罗地人
Kupangs|古邦族群
Sula|苏拉族群
Mambai|曼拜人
Kisars, Babars, Wetars, Leti|基萨尔人、巴巴尔人、韦塔尔人、莱蒂人
Seran Islanders|塞兰岛民
Tanimbar Islanders|塔宁巴尔群岛族群
Kai (and Bandanese)|凯伊族群（含班达人）
Aru|阿鲁群岛族群
Noemfoor|努姆福尔族群
Marind-anim, Sentani|马林德阿尼姆人／森塔尼人
Ternate|特尔纳特人
Buru|布鲁族群
Tobelo|托贝洛人
Sangirese|桑吉尔人
Galelos, Lolod, Ibu (Ibo)|加莱拉人、洛洛达人、伊布人
Atonis|阿托尼人
Tetum|德顿人
Dagada|达加达族群
Macassai|马卡塞人
Waropens|瓦罗彭人
Kho|科人
Burushaskis|布鲁夏斯基人
Kohistanis|科希斯坦族群
Shina|希纳族群
Baltis|巴尔蒂人
Ladakhs|拉达克人
Gujars|古贾尔人
Kashmiris|克什米尔人
Kumaonis, Garhwalis|库马翁人／加尔瓦尔人
Bhotias|博蒂亚族群
Jhats, Awans|贾特人／阿万人
Panjabis|旁遮普人
Kanauri, Lahuli|金瑙尔人／拉胡尔人
Rajasthanis|拉贾斯坦族群
Bhils|比尔人
Gujaratis|古吉拉特人
Korkus|科尔库人
Gonds|贡德人
Biharis|比哈尔人
Kharias|卡里亚人
Mundas|蒙达人
Ho|霍人
Bhumij|布米吉人
Oriyas|奥里亚人
Juangs|朱昂人
Maler|马勒尔人
Kiratis|基拉特族群
Limbus|林布人
Tamangs (Murmis)|塔芒人（穆尔米人）
Kacharis|卡查里族群
Garos|加罗人
Khasis|卡西人
Tippera|特里普里人
Lushei|卢谢人
Thado, Mhar, Hallam, Marings,|塔多人、赫马尔人、哈拉姆人、马林人等
Manipuris|曼尼普尔人
Khamtis|坎底人
Mikirs|米基尔人（卡尔比人）
Andamanese|安达曼原住民族群
Nicobarese|尼科巴原住民族群
Malayalis|马拉雅利人
Telugu|泰卢固人
Gadabas|加达巴人
Savaras|萨瓦拉人
Kandh|孔德人
Kannarese|卡纳达人
Tulu|图卢人
Kodagus|科达瓦人
Azerbaijanians|阿塞拜疆人
Afshars|阿夫沙尔人
Karapapakh|卡拉帕帕克人
Talyshes|塔雷什人
Galesh|加莱什族群
Lur|卢尔人
Gilaki|吉拉克人
Kajars|卡扎尔人
Turkic tribes of southern and eastern Iran|伊朗南部及东部突厥族群
Iran Arabs|伊朗阿拉伯人
Bakhtiaris|巴赫蒂亚里人
Kashkais|卡什凯人
Mazanderani|马赞德兰人
Shahseven|沙赫塞文人
Tats|塔特人
Jews of Israel|以色列犹太人
Rhaetoromanians|雷托罗曼语族群
Lagoon tribes|潟湖族群
Gere|盖雷人
Bete|贝特人
Senufo|塞努福人
Iraq Arabs|伊拉克阿拉伯人
Circassians|切尔克斯人
Syria Arabs|叙利亚阿拉伯人
Waboni|博尼人
Wapokomo|波科莫人
Akikuyu|基库尤人
Wanyika|尼卡族群
Masai|马赛人
Akamba|坎巴人
Baluhya|卢希亚人
Joluo|卢奥人
Wadjagga|查加人
Nandi|南迪人
Suk|波科特人（旧称苏克人）
Sedang|色当族
Thai (incl. Thai Nea, Thai Pho)|泰族群（含 Thai Nea、Thai Pho 分支；原分类）
Vankieu|云乔族群
Sui|库伊族群（苏艾人，原名 Sui）
Bo and So|博族群／索族群
Lu|傣泐族群
Khmu|克木人
Yuang|泰沅族群
Lamet|拉默特人
Phuteng|普腾族群
Lebanon Arabs|黎巴嫩阿拉伯人
Gola|戈拉人
Basuto|索托人
Luxemburgers|卢森堡人
Malagasy|马达加斯加人
Uriankhai-Monchak|乌梁海—蒙恰克族群
Olöts|厄鲁特蒙古族群
Khalka-Mongols|喀尔喀蒙古族群
Altayan Urlankhai|阿尔泰乌梁海族群
Torgut|土尔扈特蒙古族群
Zakhchins|扎哈沁蒙古族群
Bayat|巴雅特蒙古族群
Khoton|和通族群
Därbäts|杜尔伯特蒙古族群
Darkhat|达尔哈特蒙古族群
Uriankhai of former Shabinsky area|原沙比地区乌梁海族群
Wakinga|金加人
Wafipa|菲帕人
Wayao|尧族群（非洲 Yao）
Makua|马夸人
Malavi|马拉维族群
West Sahara Arabs|西撒哈拉阿拉伯人
Soninke|索宁克人
Sanu|桑族群
Shleuh|施卢赫人
Tamazight|塔马齐格特语族群
Indians of India and Pakistan|印度及巴基斯坦裔族群
Maltese|马耳他人
Arabs of Saudi Arabia|沙特阿拉伯人
Mexicans|墨西哥族群
Kilihui|基利瓦人
Papago|帕帕戈人（托霍诺奥德姆人）
Yaqui|雅基人
Mayo|马约人
Aztecs|阿兹特克族群（纳瓦人）
Otomi|奥托米人
Tepehua|特佩瓦人
Totonacos|托托纳克人
Huaztec|瓦斯特克人
Popolocs of Puebla State|普埃布拉州波波洛卡人
Mazatecs|马萨特克人
Mixtec|米斯特克人
Tlapanecs|特拉帕内克人
Zapotecs|萨波特克人
Chinantecs|奇南特克人
Chontal of Oaxaca State|瓦哈卡州琼塔尔人
Huave|瓦韦人
Mixe|米赫人
Popolocs of Veracruz State|韦拉克鲁斯州波波卢卡人
Choli|乔尔玛雅人
Zoque|索克人
Tseltal|策尔塔尔人
Tarascans|塔拉斯科人（普雷佩查人）
Tepehuanos|特佩瓦诺人
Huichol|维乔尔人
Cora|科拉人
Pima|皮马人
Opata|奥帕塔人
Tarahumara|塔拉乌马拉人
Kikapoo|基卡普人
Amusgo|阿穆斯戈人
Cuicatecs|库伊卡特克人
Matlatzincans|马特拉钦卡人
Sulu-Samal|苏禄—萨马族群
Bisaya|比萨亚族群
Jakun|雅昆人
Senoi|塞诺伊族群
Semangs|塞芒族群
Makonde|马孔德人
Zulus|祖鲁人
Angoni|恩戈尼人
Melanesians of New Caledonia|新喀里多尼亚美拉尼西亚族群
Niueans|纽埃人
Pitcairners|皮特凯恩岛民
Melanesians of Banks Isls.|班克斯群岛美拉尼西亚族群
Melanesians of southern New Hebrides|新赫布里底群岛南部美拉尼西亚族群
Kambari|坎巴里族群
Nupe|努佩人
Mumuye|穆穆耶人
Ibo|伊博人
Ibibio|伊比比奥人
Bade|巴德人
Birom and Jerawa|比罗姆人／杰拉瓦族群
Bini|贝宁族群（埃多人）
Ijo|伊乔人
Katab|卡塔布族群
Angas|安加斯人
Tharu|塔鲁人
Magars|马加尔人
Sherpas|夏尔巴人
Gurungs|古隆人
Sunwars|苏努瓦尔人
Nauruans|瑙鲁人
Dutch-speaking population of Guiana|圭亚那地区荷兰语族群
Matagalpa|马塔加尔帕人
Ulva|乌尔瓦人
Maoris|毛利人
Paraguayans-Guarani|巴拉圭瓜拉尼族群
Lengua|伦瓜人
Peruvians|秘鲁族群
Sindhs|信德人
Panamans|巴拿马族群
Guaymi|瓜伊米人（恩戈贝族群）
Cunas|库纳人
Chocos|乔科族群
Melanesians of Bismarck Archipelago|俾斯麦群岛美拉尼西亚族群
Papuans of New Guinea|新几内亚巴布亚族群
Melanesians of New Guinea|新几内亚美拉尼西亚族群
Papuans of New Britain and New Ireland|新不列颠岛及新爱尔兰岛巴布亚族群
Mandjak|曼贾科人
Biafada|比亚法达人
Pepel|帕佩尔人
Balante|巴兰塔人
Marshallese|马绍尔群岛族群
Aeta and Battaks|阿埃塔人／巴塔克族群
Tagbanuwa and Palawan|塔格巴努瓦人／巴拉望族群
Kuyonon|库约农人
Tagalog|他加禄人
Bikol|比科尔人
Yakan|雅坎人
Magindanao|马京达瑙人
Subanon|苏巴农人
Lanao|拉瑙族群
Tirurai, Dulangan, Tagabili|蒂鲁赖人、杜兰甘人、塔加比利人
Tagakoolo|塔加卡奥洛人
Bilaan|比拉安人
Bagobo|巴戈博人
Bukidnon|布基农族群
Ata|阿塔族群
Manobo|马诺博族群
Mandaya|曼达亚人
Mangyan|曼吉安族群
Sambal|桑巴尔人
Pangasinan|邦阿西楠人
Pampangan|邦板牙人
Ilongot|伊隆戈特人
Ibanag|伊巴纳格人
Nabaloi|伊巴洛伊人
Kankanai|坎卡纳伊人
Ifugao|伊富高人
Bontok|邦托克人
Tinggian|廷吉安人
Apayo|阿帕约人
Kalinga|卡林加人
Gaddangs|加当人
Puerto Ricans|波多黎各族群
Bawenda|文达人
Xosa|科萨人
Hottentots|科伊科伊人（原数据旧称）
Northern Lwo|北部卢奥族群
Karamojo|卡拉莫贾族群
Lotuko|洛图科人
For|富尔人
Temaini|特迈因人
Koalib-Tagoi|科阿利布—塔戈伊族群
Kadugli-Krongo|卡杜格利—克龙戈族群
German Swiss|瑞士德语族群
French Swiss|瑞士法语族群
Italian Swiss|瑞士意大利语族群
Trinidad Islanders|特立尼达岛族群
Chaonam|海上族群（原称 Chaonam）
Tongans|汤加人
Tunisia Arabs|突尼斯阿拉伯人
Arabs of Turkey|土耳其阿拉伯人
Lâz|拉兹人
Kaoshan|台湾原住民族群（原称高山族）
Wapare|帕雷人
Wateita|泰塔人
Washambala|尚巴拉人
Wazaramo|扎拉莫人
Wasagara|萨加拉人
Irangi|兰吉人
Iraku|伊拉库人
Tatog|达托加人
Sandawe|桑达韦人
Wanyaturu|尼亚图鲁人
Wanyamwezi|尼亚姆韦齐人
Baha|哈族群
Wagogo|戈戈人
Wahehe|赫赫人
Hadzapi|哈扎人
Acholi|阿乔利人
Scotsmen|苏格兰人
Gaels|盖尔族群
English Irish and Scotch Irish|英格兰、爱尔兰及苏格兰—爱尔兰裔族群
Nenets|涅涅茨人
Nganasans|恩加纳桑人
Evens|鄂温人
Aleuts|阿留申人
Udmurts|乌德穆尔特人
Letts|拉脱维亚人
Moldavians|摩尔多瓦人
Livonians|利沃尼亚人
Dargwa or Dargins|达尔金人
Laks|拉克人
Noghays|诺盖人
Kumuk|库梅克人
Abkhaz|阿布哈兹人
Karachays|卡拉恰伊人
Kabardians|卡巴尔达人
Aguls|阿古尔人
Tabasarans|塔巴萨兰人
Lezghians|列兹金人
Ingushes|印古什人
Tsakhurs|察胡尔人
Rutuls|鲁图尔人
Dagh Chufuti|山地犹太人（原称 Dagh Chufuti）
Khinalugs|希纳卢格人
Kryz|克里兹人
Budukhs|布杜赫人
Udi|乌迪人
Kists|基斯特人
Abazinians|阿巴津人
Bats|巴茨人
Komi-Permyaks|科米—彼尔米亚克人
Mansi|曼西人
Khants|汉特人
Altayans|阿尔泰人
Shors|绍尔人
Ens|埃涅茨人
Dolgans|多尔干人
Kets|凯特人
Selkups|塞尔库普人
Yukaghirs|尤卡吉尔人
Koryaks|科里亚克人
Itelmens|伊捷尔缅人
Nivkhs|尼夫赫人
Olcha|乌尔奇人
Oroks|鄂罗克人
Udeghe|乌德盖人
Oroches|鄂罗奇人
Arabs of Middle Asia|中亚阿拉伯人
Bartangs|巴尔唐人
Roshanls|鲁尚人
Ishkashimis|伊什卡希姆人
Shugnanis|舒格南人
Yaghnobis|雅格诺比人
Karakalpaks|卡拉卡尔帕克人
Yazghulems|雅兹古拉姆人
Tofalar|图法拉尔人
Vepses|维普斯人
Tlinkit|特林吉特人
Hawaiians|夏威夷人
Shoshones|肖肖尼人
Navahos|纳瓦霍人
Apaches|阿帕奇人
Hopi|霍皮人
Sioux|苏族群
Muscogee|穆斯科吉人
Dogon|多贡人
Bobo|博博人
Uruguayans|乌拉圭族群
Warrau|瓦劳人
Puok and Ksakau|普奥克族群／克萨考族群
Nung and Giai|侬族／热依族
Lati and Lakwa|拉蒂族群／拉夸族群
Caolan|高兰族群
Raglai|拉格莱族
Ede|埃地族
Banar|巴拿族
Cham Re|占雷族群（赫雷人）
Ve|韦族群
Khatu|戈都族
Sre|斯雷族群
Bosnians|波斯尼亚族群
Tonga|汤加族群（非洲 Tonga）
Matebele|恩德贝莱人
Macapai|马卡帕伊族群
Maopitians|马奥皮蒂族群
Yure|尤雷族群
Amoipia|阿莫伊皮亚族群
Custenaus|库斯特瑙族群
Arumas|阿鲁马族群
Tsuva|楚瓦族群
Pacaja|帕卡雅族群
Guayupe and Marawa|瓜尤佩族群／马拉瓦族群
Carijon|卡里洪族群
Bakare|巴卡雷族群
Andoa|安多阿族群
Wagosha|戈沙族群
Berta|贝尔塔人
Lubu|卢布族群
Lom|洛姆族群
Nageh|纳格族群
Utan|乌坦族群
Bakian|巴基安族群
Wandama|旺达马族群
Salawati, Mairassi, Madiki|萨拉瓦蒂族群、迈拉西族群、马迪基族群
Mare|马雷族群
Tokode|托科德族群
Sobei, Yamna, Bonggo, Tobati a|索贝伊人、雅姆纳人、邦戈人、托巴蒂人等（原名截断）
Mangguangan|曼古安干族群
`.trim().split('\n').map(line=>line.split('|')));
  function clean(name) {
    const raw=String(name ?? '').trim();
    if (!/[ÃÂ]/.test(raw)) return raw;
    try { const cp1252={'“':147,'”':148,'‘':145,'’':146,'–':150,'—':151,'€':128}; const bytes=Uint8Array.from(raw,c=>cp1252[c] ?? c.charCodeAt(0)); const fixed=new TextDecoder('utf-8',{fatal:true}).decode(bytes); return fixed; } catch { return raw; }
  }
  function translate(name, country) {
    const normalized=clean(name);
    if (normalized === "Tay") return country === "CH" ? "傣族" : "傣／泰族群（GREG 原分类 Tay）";
    if (names[normalized]) return names[normalized];
    if (normalized === 'Yao') return '瑶族';
    if (normalized === 'Kachins') return '克钦族群（多个相关民族的合称）';
    if (normalized === 'Hmong') return '赫蒙族群（苗族相关支系）';
    const known=globalThis.EthnicTranslations?.group(normalized,'');
    return known || normalized;
  }
  return {clean,translate};
})();
