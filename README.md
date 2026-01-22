# HaremAltin Plugin v2.0

<p align="center">
  <img src="https://img.shields.io/badge/version-2.0.0-gold" alt="Version">
  <img src="https://img.shields.io/badge/license-MIT-green" alt="License">
  <img src="https://img.shields.io/badge/Socket.IO-4.x-blue" alt="Socket.IO">
</p>

🏆 **Haremaltin.com'dan anlık döviz ve altın fiyatlarını çeken JavaScript eklentisi**

Socket.IO kullanarak gerçek zamanlı fiyat güncellemeleri alır ve tabloya render eder.

## 🚀 Kurulum

### CDN ile Kullanım

```html
<!-- Socket.IO (gerekli) -->
<script src="https://cdn.socket.io/4.7.4/socket.io.min.js"></script>

<!-- HaremAltin Plugin -->
<script src="https://cdn.jsdelivr.net/gh/msahyilmaz/haremaltin@main/haremAltin.min.js"></script>
```

### Manuel Kurulum

1. `haremAltin.min.js` dosyasını indirin
2. Projenize ekleyin
3. Socket.IO kütüphanesini dahil edin

## 📖 Kullanım

### Basit Kullanım

```html
<div id="haremAltin"></div>

<script>
HaremAltin.setConfigs({
    selector: '#haremAltin'
});

HaremAltin.connect();
</script>
```

### Gelişmiş Kullanım

```javascript
HaremAltin.setConfigs({
    selector: '#prices',
    tableClass: 'table table-striped table-bordered',
    showHeader: true,
    showChange: true,
    currencySymbol: '₺',
    
    // Callbacks
    onConnect: function(socketId) {
        console.log('Bağlandı:', socketId);
    },
    onDisconnect: function(reason) {
        console.log('Bağlantı kesildi:', reason);
    },
    onPriceUpdate: function(data) {
        console.log('Fiyatlar güncellendi:', data);
    },
    onError: function(error) {
        console.error('Hata:', error);
    }
});

HaremAltin.connect()
    .then(function() {
        console.log('Bağlantı başarılı!');
    })
    .catch(function(error) {
        console.error('Bağlantı hatası:', error);
    });
```

## ⚙️ Konfigürasyon

| Parametre | Tip | Varsayılan | Açıklama |
|-----------|-----|------------|----------|
| `selector` | string | `'body'` | Tablonun render edileceği CSS selector |
| `tableClass` | string | `'table table-striped table-bordered'` | Tablo CSS sınıfları |
| `showHeader` | boolean | `true` | Tablo başlığını göster |
| `showChange` | boolean | `true` | Değişim sütununu göster |
| `currencySymbol` | string | `'₺'` | Para birimi simgesi |
| `onConnect` | function | `null` | Bağlantı kurulunca çağrılır |
| `onDisconnect` | function | `null` | Bağlantı kesilince çağrılır |
| `onPriceUpdate` | function | `null` | Fiyat güncellenince çağrılır |
| `onError` | function | `null` | Hata oluşunca çağrılır |

## 🔧 API

### Metodlar

```javascript
// Konfigürasyon ayarla
HaremAltin.setConfigs({ selector: '#myDiv' });

// Mevcut konfigürasyonu al
var config = HaremAltin.getConfigs();

// Bağlantı kur
HaremAltin.connect().then(...).catch(...);

// Bağlantıyı kes
HaremAltin.disconnect();

// Mevcut verileri al
var data = HaremAltin.getData();

// Bağlantı durumu
var isConnected = HaremAltin.isConnected();

// Versiyon
var version = HaremAltin.version();
```

## 🎨 CSS Sınıfları

Plugin otomatik olarak şu sınıfları ekler:

- `.haremaltin-up` - Fiyat artışında (yeşil)
- `.haremaltin-down` - Fiyat düşüşünde (kırmızı)

```css
.haremaltin-up {
    background-color: rgba(40, 167, 69, 0.2) !important;
}

.haremaltin-down {
    background-color: rgba(220, 53, 69, 0.2) !important;
}
```

## 📊 Desteklenen Döviz/Altın Türleri

- USD/TRY
- EUR/TRY
- GBP/TRY
- Gram Altın
- Külçe Altın
- Çeyrek Altın (Yeni/Eski)
- Yarım Altın (Yeni/Eski)
- Tam Altın (Yeni/Eski)
- Ata Altın (Yeni/Eski)
- Ons Altın
- Gümüş

## 📝 Lisans

MIT License - [LICENSE](LICENSE)

## 👤 Yazar

**msahyilmaz**

- GitHub: [@msahyilmaz](https://github.com/msahyilmaz)

## 🤝 Katkıda Bulunma

1. Fork edin
2. Feature branch oluşturun (`git checkout -b feature/amazing`)
3. Commit edin (`git commit -m 'Add amazing feature'`)
4. Push edin (`git push origin feature/amazing`)
5. Pull Request açın

---

⭐ Bu projeyi beğendiyseniz yıldız vermeyi unutmayın!
