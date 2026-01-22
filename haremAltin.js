/**
 * HaremAltin Plugin v2.0
 * Haremaltin.com Socket.IO ile anlık döviz/altın fiyatları
 * 
 * Kullanım:
 *   HaremAltin.setConfigs({ selector: '#haremAltin' });
 *   HaremAltin.connect();
 * 
 * @author msahyilmaz
 * @license MIT
 * @repository https://github.com/msahyilmaz/haremaltin
 */

var HaremAltin = (function () {
    'use strict';

    var VERSION = '2.0.0';

    var configs = {
        selector: 'body',
        refreshTime: 1,
        isRefreshed: true,
        tableClass: 'table table-striped table-bordered',
        socketUrl: 'wss://hrmsocketonly.haremaltin.com:443',
        showHeader: true,
        showChange: true,
        currencySymbol: '₺',
        onPriceUpdate: null, // Callback fonksiyonu
        onConnect: null,
        onDisconnect: null,
        onError: null
    };

    var dovizData = [];
    var socket = null;
    var isConnected = false;

    /**
     * Konfigürasyon ayarlarını günceller
     * @param {Object} newConfigs - Yeni ayarlar
     */
    function setConfigs(newConfigs) {
        configs = Object.assign({}, configs, newConfigs);
        return this;
    }

    /**
     * Mevcut konfigürasyonu döner
     * @returns {Object} Konfigürasyon
     */
    function getConfigs() {
        return Object.assign({}, configs);
    }

    /**
     * Döviz ve altın verilerini işler
     * @param {Object} priceData - Fiyat verisi
     */
    function setDovuz(priceData) {
        if (priceData) {
            dovizData = processSocketIoData(priceData);
            renderTable();

            // Callback varsa çağır
            if (typeof configs.onPriceUpdate === 'function') {
                configs.onPriceUpdate(dovizData);
            }
        } else {
            connectSocketIo().catch(function (error) {
                console.warn('Socket.IO bağlantısı başarısız:', error);
                if (typeof configs.onError === 'function') {
                    configs.onError(error);
                }
            });
        }
    }

    /**
     * Socket.IO bağlantısı kurar
     * @returns {Promise} Bağlantı promise'i
     */
    function connectSocketIo() {
        return new Promise(function (resolve, reject) {
            // Socket.io kütüphanesinin yüklü olup olmadığını kontrol et
            if (typeof io === 'undefined') {
                reject('Socket.io kutuphanesi bulunamadi. Lutfen socket.io CDN\'i ekleyin.');
                return;
            }

            // Mevcut bağlantıyı kapat
            if (socket && socket.connected) {
                socket.disconnect();
            }

            try {
                // Socket.IO bağlantısı
                socket = io(configs.socketUrl, {
                    transports: ['websocket', 'polling'],
                    upgrade: true,
                    reconnection: true,
                    reconnectionDelay: 1000,
                    reconnectionAttempts: 5,
                    timeout: 20000,
                    forceNew: true
                });

                socket.on('connect', function () {
                    isConnected = true;
                    if (typeof configs.onConnect === 'function') {
                        configs.onConnect(socket.id);
                    }
                    resolve(socket);
                });

                // price_changed olayını dinle
                socket.on('price_changed', function (data) {
                    try {
                        if (data && typeof data === 'object') {
                            if (data.USDTRY || data.ALTINTRY || data.EURTRY || data.ALTIN) {
                                setDovuz(data);
                            } else if (data.data) {
                                setDovuz(data.data);
                            } else {
                                setDovuz(data);
                            }
                        }
                    } catch (err) {
                        console.error('Veri işleme hatası:', err);
                    }
                });

                socket.on('disconnect', function (reason) {
                    isConnected = false;
                    if (typeof configs.onDisconnect === 'function') {
                        configs.onDisconnect(reason);
                    }
                });

                socket.on('connect_error', function (error) {
                    reject('Socket.IO bağlantı hatası: ' + error.message);
                    if (typeof configs.onError === 'function') {
                        configs.onError(error);
                    }
                });

            } catch (error) {
                reject('Socket.IO başlatma hatası: ' + error.message);
            }
        });
    }

    /**
     * Bağlantıyı kapatır
     */
    function disconnect() {
        if (socket && socket.connected) {
            socket.disconnect();
            isConnected = false;
        }
    }

    /**
     * Socket.IO verisini işler
     * @param {Object} rawData - Ham veri
     * @returns {Array} İşlenmiş veri
     */
    function processSocketIoData(rawData) {
        var processed = [];

        var currencyMap = {
            'USDTRY': { label: 'USD/TRY', icon: '$', order: 1 },
            'EURTRY': { label: 'EUR/TRY', icon: '€', order: 2 },
            'GBPTRY': { label: 'GBP/TRY', icon: '£', order: 3 },
            'ALTINTRY': { label: 'Gram Altın', icon: '🥇', order: 4 },
            'KULCEALTIN': { label: 'Külçe Altın', icon: '🥇', order: 5 },
            'CEYREK_YENI': { label: 'Çeyrek Altın (Yeni)', icon: '🪙', order: 6 },
            'YARIM_YENI': { label: 'Yarım Altın (Yeni)', icon: '🪙', order: 7 },
            'TEK_YENI': { label: 'Tam Altın (Yeni)', icon: '🪙', order: 8 },
            'ATA_YENI': { label: 'Ata Altın (Yeni)', icon: '🪙', order: 9 },
            'CEYREK_ESKI': { label: 'Çeyrek Altın (Eski)', icon: '🪙', order: 10 },
            'YARIM_ESKI': { label: 'Yarım Altın (Eski)', icon: '🪙', order: 11 },
            'TEK_ESKI': { label: 'Tam Altın (Eski)', icon: '🪙', order: 12 },
            'ATA_ESKI': { label: 'Ata Altın (Eski)', icon: '🪙', order: 13 },
            'ONS': { label: 'Ons Altın', icon: '🥇', order: 14 },
            'GUMUS': { label: 'Gümüş', icon: '🥈', order: 15 }
        };

        Object.keys(rawData).forEach(function (key) {
            var upperKey = key.toUpperCase().replace(/_/g, '');
            var mappedInfo = null;

            // Anahtar eşleşmesi bul
            Object.keys(currencyMap).forEach(function (mapKey) {
                if (upperKey.includes(mapKey.replace(/_/g, '')) || mapKey.replace(/_/g, '').includes(upperKey)) {
                    mappedInfo = currencyMap[mapKey];
                }
            });

            // Doğrudan eşleşme
            if (!mappedInfo && currencyMap[key]) {
                mappedInfo = currencyMap[key];
            }

            if (mappedInfo && rawData[key]) {
                var item = rawData[key];
                processed.push({
                    key: key,
                    tur: mappedInfo.label,
                    alis: formatPrice(item.alis || item.buying || item.Buying || 'N/A'),
                    satis: formatPrice(item.satis || item.selling || item.Selling || 'N/A'),
                    degisim: item.change || item.Change || item.degisim || item.yuzde || '',
                    icon: mappedInfo.icon,
                    order: mappedInfo.order,
                    raw: item
                });
            }
        });

        // Sırala
        processed.sort(function (a, b) {
            return (a.order || 999) - (b.order || 999);
        });

        return processed;
    }

    /**
     * Fiyatı formatlar
     * @param {*} price - Fiyat
     * @returns {string} Formatlanmış fiyat
     */
    function formatPrice(price) {
        if (price === 'N/A' || price === undefined || price === null) return 'N/A';
        var num = parseFloat(price);
        if (isNaN(num)) return price;
        return num.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 4 });
    }

    /**
     * Tabloyu oluşturur ve gösterir
     */
    function renderTable() {
        var container = document.querySelector(configs.selector);
        if (!container) {
            console.error('Hedef element bulunamadı:', configs.selector);
            return;
        }

        var tableHtml = '<table class="' + configs.tableClass + '">';

        if (configs.showHeader) {
            tableHtml += '<thead><tr>';
            tableHtml += '<th>Döviz/Altın</th>';
            tableHtml += '<th>Alış</th>';
            tableHtml += '<th>Satış</th>';
            if (configs.showChange) {
                tableHtml += '<th>Değişim</th>';
            }
            tableHtml += '</tr></thead>';
        }

        tableHtml += '<tbody>';

        dovizData.forEach(function (item) {
            var rowClass = '';
            if (item.degisim) {
                if (String(item.degisim).includes('+') || parseFloat(item.degisim) > 0) {
                    rowClass = 'haremaltin-up';
                } else if (String(item.degisim).includes('-') || parseFloat(item.degisim) < 0) {
                    rowClass = 'haremaltin-down';
                }
            }

            tableHtml += '<tr class="' + rowClass + '">';
            tableHtml += '<td><strong>' + item.icon + ' ' + item.tur + '</strong></td>';
            tableHtml += '<td>' + item.alis + ' ' + configs.currencySymbol + '</td>';
            tableHtml += '<td>' + item.satis + ' ' + configs.currencySymbol + '</td>';
            if (configs.showChange) {
                tableHtml += '<td>' + (item.degisim || '-') + '</td>';
            }
            tableHtml += '</tr>';
        });

        tableHtml += '</tbody></table>';

        container.innerHTML = tableHtml;
    }

    /**
     * Mevcut veriyi döner
     * @returns {Array} Döviz verileri
     */
    function getData() {
        return dovizData.slice();
    }

    /**
     * Bağlantı durumunu döner
     * @returns {boolean} Bağlı mı?
     */
    function isConnectedStatus() {
        return isConnected;
    }

    /**
     * Versiyon bilgisini döner
     * @returns {string} Versiyon
     */
    function getVersion() {
        return VERSION;
    }

    // Public API
    return {
        setConfigs: setConfigs,
        getConfigs: getConfigs,
        setDovuz: setDovuz,
        connect: connectSocketIo,
        disconnect: disconnect,
        getData: getData,
        isConnected: isConnectedStatus,
        version: getVersion
    };
})();
