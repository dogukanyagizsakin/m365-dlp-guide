export type LicenseType = 'e3' | 'e5' | 'bp'

export interface Task {
  id: string
  title: string
  desc: string
  path?: string
  tags: LicenseType[]
  tip?: string
}

export interface Phase {
  id: string
  label: string
  shortLabel: string
  icon: string
  color: string
  bgClass: string
  borderClass: string
  textClass: string
  info: string
  tasks: Task[]
}

export const PHASES: Phase[] = [
  {
    id: 'p0',
    label: 'Ön hazırlık',
    shortLabel: 'Hazırlık',
    icon: 'shield-check',
    color: 'indigo',
    bgClass: 'bg-indigo-50 dark:bg-indigo-950/30',
    borderClass: 'border-indigo-200 dark:border-indigo-800',
    textClass: 'text-indigo-700 dark:text-indigo-300',
    info: 'Tüm yapılandırmalara başlamadan önce bu ön koşulları tamamla. Admin rolü ve portal erişimi zorunlu.',
    tasks: [
      {
        id: 't0_1',
        title: 'Global Admin veya Compliance Admin rolünü doğrula',
        desc: 'Microsoft 365 admin center → Kullanıcılar → Roller bölümünden rolü kontrol et. Global Admin veya Compliance Administrator rolü gereklidir.',
        path: 'admin.microsoft.com → Users → Active users → Roles',
        tags: ['e3', 'e5', 'bp'],
        tip: 'Compliance Administrator rolü yeterlidir, Global Admin gerekmez.',
      },
      {
        id: 't0_2',
        title: 'compliance.microsoft.com portalına giriş yap',
        desc: 'Microsoft Purview compliance portalına admin hesabıyla giriş yap ve portalın sorunsuz açıldığını doğrula.',
        path: 'compliance.microsoft.com',
        tags: ['e3', 'e5', 'bp'],
      },
      {
        id: 't0_3',
        title: 'Mevcut DLP politikalarını kayıt altına al',
        desc: 'Purview → Data loss prevention → Policies altında var olan politikaları listele ve not al. Yeni kurulumda üzerine yazma riskine karşı mevcut durumu belgele.',
        path: 'Purview → DLP → Policies',
        tags: ['e3', 'e5', 'bp'],
      },
      {
        id: 't0_4',
        title: 'Lisans ve özellik durumunu doğrula',
        desc: 'M365 admin center → Billing → Licenses altından aktif lisansları kontrol et. E5 gerektiren özellikler için lisans sayısını doğrula.',
        path: 'admin.microsoft.com → Billing → Licenses',
        tags: ['e3', 'e5', 'bp'],
      },
      {
        id: 't0_5',
        title: 'Audit log tutmayı etkinleştir',
        desc: 'Purview → Audit → Start recording. DLP olaylarının izlenebilmesi için audit kaydı açık olmalı.',
        path: 'Purview → Audit → Start recording user and admin activity',
        tags: ['e3', 'e5', 'bp'],
        tip: 'Audit log varsayılan olarak kapalı gelebilir, mutlaka kontrol et.',
      },
    ],
  },
  {
    id: 'p1',
    label: 'Hassas bilgi türleri (SIT)',
    shortLabel: 'Bilgi türleri',
    icon: 'fingerprint',
    color: 'violet',
    bgClass: 'bg-violet-50 dark:bg-violet-950/30',
    borderClass: 'border-violet-200 dark:border-violet-800',
    textClass: 'text-violet-700 dark:text-violet-300',
    info: 'Sensitive Information Types — DLP\'nin algılayacağı hassas veri kalıplarını tanımla. Bu adım sonraki tüm politikaların temelidir.',
    tasks: [
      {
        id: 't1_1',
        title: 'Yerleşik SIT listesini gözden geçir',
        desc: 'Data classification → Sensitive info types altındaki hazır şablonları incele. Türkiye\'ye uygun: TCKN, IBAN, pasaport no, kredi kartı, sağlık verileri.',
        path: 'Purview → Data classification → Sensitive info types',
        tags: ['e3', 'e5', 'bp'],
      },
      {
        id: 't1_2',
        title: 'TC Kimlik Numarası (TCKN) SIT\'ini test et',
        desc: 'Turkey National Identity Number şablonunu bul, Test bölümüne örnek TCKN yapıştırarak algılama doğruluğunu kontrol et.',
        path: 'Purview → Data classification → SIT → Test',
        tags: ['e3', 'e5', 'bp'],
        tip: 'Regex: \\b[1-9][0-9]{10}\\b (11 haneli, 0 ile başlamaz)',
      },
      {
        id: 't1_3',
        title: 'IBAN ve finansal SIT\'leri doğrula',
        desc: 'Turkey Financial Account Number ve Credit Card Number şablonlarını test et. IBAN için TR ile başlayan 26 karakter formatını doğrula.',
        tags: ['e3', 'e5', 'bp'],
      },
      {
        id: 't1_4',
        title: 'Özel SIT oluştur — şirket içi veriler',
        desc: 'Create info type → Regex veya keyword dictionary tabanlı şablon oluştur. Ör: iç proje kodları, müşteri numarası formatları, çalışan ID.',
        path: 'Purview → Data classification → + Create info type',
        tags: ['e3', 'e5', 'bp'],
      },
      {
        id: 't1_5',
        title: 'SIT güven düzeylerini ayarla',
        desc: 'Her SIT için High / Medium / Low confidence threshold değerlerini belirle. Yüksek false positive riskinde Medium confidence ile başla.',
        tags: ['e3', 'e5', 'bp'],
        tip: 'High confidence → az false positive ama kaçırma riski. Low → çok eşleşme ama gürültü artar.',
      },
      {
        id: 't1_6',
        title: 'Trainable classifier\'ları değerlendir',
        desc: 'Finansal belgeler, HR verileri, kaynak kodu gibi kategoriler için AI tabanlı sınıflandırıcıları incele. E5 lisansı gerektirir.',
        path: 'Purview → Data classification → Trainable classifiers',
        tags: ['e5'],
      },
    ],
  },
  {
    id: 'p2',
    label: 'Duyarlılık etiketleri',
    shortLabel: 'Etiketler',
    icon: 'tag',
    color: 'teal',
    bgClass: 'bg-teal-50 dark:bg-teal-950/30',
    borderClass: 'border-teal-200 dark:border-teal-800',
    textClass: 'text-teal-700 dark:text-teal-300',
    info: 'Sensitivity labels — dosya ve e-postalara uygulanacak gizlilik sınıflandırma etiketlerini oluştur ve yayımla.',
    tasks: [
      {
        id: 't2_1',
        title: 'Etiket hiyerarşisini planla',
        desc: 'Genel → Dahili → Gizli → Çok Gizli yapısını belirle. Alt etiketleri (sub-labels) tanımla. Ör: Gizli/Hukuk, Gizli/Finans.',
        tags: ['e3', 'e5', 'bp'],
      },
      {
        id: 't2_2',
        title: 'Duyarlılık etiketlerini oluştur',
        desc: 'Information protection → Labels → + Create a label. Her etiket için ad, açıklama ve renk kodu belirle.',
        path: 'Purview → Information protection → Labels → Create a label',
        tags: ['e3', 'e5', 'bp'],
      },
      {
        id: 't2_3',
        title: 'Gizli etiketler için şifreleme ekle',
        desc: 'Gizli ve Çok Gizli etiketler için AES-256 şifreleme, içerik işaretleme (filigran, header/footer) ayarlarını yapılandır.',
        path: 'Purview → Information protection → Labels → [etiket] → Encryption',
        tags: ['e3', 'e5', 'bp'],
        tip: 'Şifreli dosyalar dış paylaşımda da korunmaya devam eder.',
      },
      {
        id: 't2_4',
        title: 'Otomatik etiketleme politikası oluştur',
        desc: 'Bir SIT algılandığında etiketin otomatik uygulanması için auto-labeling policy kur. Simulation modda önce test et.',
        path: 'Purview → Information protection → Auto-labeling',
        tags: ['e5'],
      },
      {
        id: 't2_5',
        title: 'Etiket politikasını yayımla',
        desc: 'Label policies → Publish label → hangi kullanıcı/grupların etiketi göreceğini seç. Varsayılan etiketi belirle.',
        path: 'Purview → Information protection → Label policies → Publish label',
        tags: ['e3', 'e5', 'bp'],
      },
      {
        id: 't2_6',
        title: 'Microsoft 365 Apps\'te etiketi doğrula',
        desc: 'Word, Excel, PowerPoint, Outlook\'ta Sensitivity ribbon\'ının göründüğünü test hesabıyla doğrula.',
        tags: ['e3', 'e5', 'bp'],
        tip: 'Etiket görünmüyorsa Microsoft 365 Apps güncel sürüm gerekebilir (2206+).',
      },
    ],
  },
  {
    id: 'p3',
    label: 'DLP politikaları',
    shortLabel: 'Politikalar',
    icon: 'file-certificate',
    color: 'amber',
    bgClass: 'bg-amber-50 dark:bg-amber-950/30',
    borderClass: 'border-amber-200 dark:border-amber-800',
    textClass: 'text-amber-700 dark:text-amber-300',
    info: 'Asıl DLP politikalarını oluştur — koşullar, eylemler, kapsam ve kullanıcı bildirimleri.',
    tasks: [
      {
        id: 't3_1',
        title: 'Finansal veri politikası oluştur',
        desc: 'Financial Data şablonundan başla: kredi kartı, IBAN, banka hesabı numaralarını kapsasın. Kuruluş dışı paylaşımı engelle, yöneticiye incident raporu gönder.',
        path: 'Purview → DLP → Policies → + Create policy → Financial',
        tags: ['e3', 'e5', 'bp'],
      },
      {
        id: 't3_2',
        title: 'Kişisel veri (KVKK/GDPR) politikası oluştur',
        desc: 'GDPR veya General Data Protection Regulation şablonunu özelleştir. TCKN, pasaport, sağlık verilerini ekle. İhlalde kullanıcıya policy tip, yöneticiye e-posta.',
        path: 'Purview → DLP → Policies → + Create policy → GDPR',
        tags: ['e3', 'e5', 'bp'],
      },
      {
        id: 't3_3',
        title: 'Sağlık verisi politikası oluştur',
        desc: 'Sağlık sektörü müşteriler için Medical and Health şablonunu yapılandır. PHI (Protected Health Information) kapsamını belirle.',
        path: 'Purview → DLP → Policies → + Create policy → Medical and Health',
        tags: ['e3', 'e5', 'bp'],
      },
      {
        id: 't3_4',
        title: 'Politika kapsamını (lokasyon) belirle',
        desc: 'Her politika için Exchange Email, SharePoint, OneDrive, Teams chat & channel, Endpoint devices seçeneklerini belirle. Belirli site/grupları hariç tut.',
        tags: ['e3', 'e5', 'bp'],
        tip: 'Endpoint Devices seçeneği için cihaz onboarding ayrıca yapılmalı (E5).',
      },
      {
        id: 't3_5',
        title: 'Koşul eşik değerlerini ayarla',
        desc: 'Kaç adet SIT eşleşmesinde kuralın tetikleneceğini belirle. Örn: 3\'ten fazla kredi kartı numarası. Instance count ve confidence level kombinasyonunu ayarla.',
        tags: ['e3', 'e5', 'bp'],
      },
      {
        id: 't3_6',
        title: 'Eylem kurallarını yapılandır',
        desc: 'Koşul eşleştiğinde: paylaşımı engelle, şifrele, policy tip göster, override izni ver seçeneklerini her politika için belirle.',
        tags: ['e3', 'e5', 'bp'],
      },
      {
        id: 't3_7',
        title: 'Kullanıcı bildirim metnini Türkçe yaz',
        desc: 'Policy tip mesajını Türkçe olarak özelleştir. İhlal gerekçesini ve kullanıcının ne yapması gerektiğini net biçimde açıkla.',
        path: 'Politika oluşturma sihirbazı → User notifications → Customize the policy tip text',
        tags: ['e3', 'e5', 'bp'],
        tip: 'Örnek: "Bu dosya hassas kişisel veri içeriyor. Kuruluş dışı paylaşım engellenmiştir."',
      },
      {
        id: 't3_8',
        title: 'Incident rapor yapılandır',
        desc: 'Policy match olduğunda hangi yöneticilere e-posta gönderileceğini, raporda hangi detayların (kullanıcı, dosya, eşleşen içerik) yer alacağını belirle.',
        tags: ['e3', 'e5', 'bp'],
      },
      {
        id: 't3_9',
        title: 'Endpoint DLP politikası ekle',
        desc: 'Endpoint DLP settings\'de izin verilen/engellenecek uygulamaları listele. USB kopyalama, tarayıcı yükleme, yazdırma eylemlerini kısıtla.',
        path: 'Purview → DLP → Endpoint DLP settings',
        tags: ['e5'],
        tip: 'Önce cihazları Microsoft Intune veya MDE ile onboard etmek gerekir.',
      },
    ],
  },
  {
    id: 'p4',
    label: 'Test & devreye alma',
    shortLabel: 'Test',
    icon: 'test-pipe',
    color: 'orange',
    bgClass: 'bg-orange-50 dark:bg-orange-950/30',
    borderClass: 'border-orange-200 dark:border-orange-800',
    textClass: 'text-orange-700 dark:text-orange-300',
    info: 'Politikaları simülasyon modunda test et, false positive analizini yap, ardından kademeli olarak enforce moda al.',
    tasks: [
      {
        id: 't4_1',
        title: 'Tüm politikaları simulation modunda başlat',
        desc: 'Her politika oluşturulurken "Run the policy in simulation mode" seç. Bu modda hiçbir şey engellenmez, sadece eşleşmeler kayıt altına alınır.',
        tags: ['e3', 'e5', 'bp'],
        tip: 'Simülasyon modunda kullanıcılar hiçbir şey görmez, politika gizli çalışır.',
      },
      {
        id: 't4_2',
        title: '5-7 iş günü simülasyon verisi topla',
        desc: 'En az bir hafta simülasyonda bırak. Activity Explorer\'dan günlük eşleşmeleri takip et. Normal iş akışını kapsayan veri birikmesini bekle.',
        path: 'Purview → Data classification → Activity explorer',
        tags: ['e3', 'e5', 'bp'],
      },
      {
        id: 't4_3',
        title: 'False positive analizini yap',
        desc: 'Hatalı eşleşmeleri tespit et: yanlış algılanan dosya tiplerini, regex çakışmalarını belgele. Confidence threshold\'u yükselt veya exception ekle.',
        tags: ['e3', 'e5', 'bp'],
      },
      {
        id: 't4_4',
        title: 'Exception listelerini yapılandır',
        desc: 'Belirli e-posta adresleri, SharePoint siteleri veya uygulama işlemlerini politika kapsamı dışına al. Yasal istisnalar için override kullanıcılarını belirle.',
        tags: ['e3', 'e5', 'bp'],
      },
      {
        id: 't4_5',
        title: 'Pilot grupla canlı test yap',
        desc: '10-20 kişilik IT/hukuk/finans pilot grubuyla politikayı enforce modda test et. Policy tip görünürlüğünü ve engelleme davranışını doğrula.',
        tags: ['e3', 'e5', 'bp'],
      },
      {
        id: 't4_6',
        title: 'Politikaları kademeli olarak enforce moda al',
        desc: 'Önce Exchange Email, ardından SharePoint/OneDrive, ardından Teams sırasıyla aktif et. Her adımda 2-3 gün izle.',
        path: 'Purview → DLP → Policies → [politika] → Edit → Turn on the policy',
        tags: ['e3', 'e5', 'bp'],
        tip: '"Turn it on right away" seçeneği ile politika hemen devreye girer.',
      },
      {
        id: 't4_7',
        title: 'Kullanıcılara bilgilendirme e-postası gönder',
        desc: 'DLP politikalarının devreye girdiğini, hangi eylemlerin kısıtlandığını ve override prosedürünü açıklayan iç iletişim gönder.',
        tags: ['e3', 'e5', 'bp'],
      },
    ],
  },
  {
    id: 'p5',
    label: 'İzleme & raporlama',
    shortLabel: 'İzleme',
    icon: 'chart-line',
    color: 'green',
    bgClass: 'bg-green-50 dark:bg-green-950/30',
    borderClass: 'border-green-200 dark:border-green-800',
    textClass: 'text-green-700 dark:text-green-300',
    info: 'Sürekli izleme rutinini kur, uyarı politikalarını yapılandır ve düzenli gözden geçirme takvimini oluştur.',
    tasks: [
      {
        id: 't5_1',
        title: 'DLP uyarı politikalarını yapılandır',
        desc: 'Purview → DLP → Alerts altından kritik SIT eşleşmeleri için high-severity alert policy kur. Bildirim alacak kişileri belirle.',
        path: 'Purview → DLP → Alerts',
        tags: ['e3', 'e5', 'bp'],
      },
      {
        id: 't5_2',
        title: 'Activity Explorer izleme rutini kur',
        desc: 'Haftalık Activity Explorer incelemesi için takvime ekle. Top users (en fazla ihlal eden), top locations (en riskli konumlar) filtrelerini kaydet.',
        path: 'Purview → Data classification → Activity explorer',
        tags: ['e3', 'e5', 'bp'],
      },
      {
        id: 't5_3',
        title: 'DLP raporlarını yapılandır',
        desc: 'Reports → DLP altından haftalık/aylık otomatik rapor gönderimini kur. False positive trendi ve policy match sayılarını izle.',
        path: 'Purview → Reports → DLP policy matches',
        tags: ['e3', 'e5', 'bp'],
      },
      {
        id: 't5_4',
        title: 'Microsoft Sentinel / Defender entegrasyonu',
        desc: 'DLP uyarılarını SIEM\'e bağla. security.microsoft.com → Settings → Microsoft Defender for Cloud Apps üzerinden log akışını yapılandır.',
        path: 'security.microsoft.com → Settings → SIEM integration',
        tags: ['e5'],
      },
      {
        id: 't5_5',
        title: 'Yöneticilere Compliance Admin rolü ver',
        desc: 'Purview portalını yönetecek kişilere Compliance Administrator veya DLP Compliance Management rolü ata.',
        path: 'admin.microsoft.com → Roles → Compliance Administrator',
        tags: ['e3', 'e5', 'bp'],
      },
      {
        id: 't5_6',
        title: 'Üçer aylık review takvimi oluştur',
        desc: 'Her 3 ayda bir politikaları iş gereksinimleriyle karşılaştırarak güncelleme için recurring toplantı ve hatırlatıcı kur.',
        tags: ['e3', 'e5', 'bp'],
      },
      {
        id: 't5_7',
        title: 'Yapılandırma belgesini tamamla',
        desc: 'Tüm politika ayarlarını, kapsam kararlarını, exception gerekçelerini ve override kullanıcılarını içeren yapılandırma dokümanı hazırla.',
        tags: ['e3', 'e5', 'bp'],
        tip: 'Bu belge audit ve uyumluluk incelemelerinde kritik kanıt niteliğindedir.',
      },
    ],
  },
]
