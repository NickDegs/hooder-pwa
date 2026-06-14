import { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId:   'app.realvirtuality.landlord',
  appName: 'Hooder',
  webDir:  'dist',
  server: {
    androidScheme: 'https',
    allowNavigation: ['*.mapbox.com', '*.mapbox.cn'],
  },
  ios: {
    backgroundColor:          '#04080F',
    contentInset:             'always',
    allowsLinkPreview:        false,
    scrollEnabled:            false,
    limitsNavigationsToAppBoundDomains: false,
  },
}

export default config
