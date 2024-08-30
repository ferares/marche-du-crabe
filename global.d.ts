import type en from "./langs/en.json"
 
declare global {
  // Use type safe message keys with `next-intl`
  type IntlMessages = typeof en
}