import { createGlobalState } from 'react-hooks-global-state';
import fs from 'fs';
import {
  STATE_NAMES,
  SERVERS,
  DATE_OF_BIRTH_TYPES,
  EMAIL_SETTINGS_TYPES,
  USERNAME_SETTINGS_TYPES,
  PASSWORD_SETTINGS_TYPES,
  CAPTCHA_SERVICES,
  dirname,
  isDev,
} from '../constants/constants.js';

const initialState = {
  [STATE_NAMES.USE_PROXY]: false,
  [STATE_NAMES.PROXY_LIST]: [],
  [STATE_NAMES.SERVER_NAME]: SERVERS.EUW,
  [STATE_NAMES.AMOUNT]: '10',
  [STATE_NAMES.BIRTH]: '2000-01-01', // Date of Birth (YYYY-MM-DD)
  [STATE_NAMES.BIRTH_TYPE]: DATE_OF_BIRTH_TYPES.RANDOM,
  [STATE_NAMES.EMAIL_MASK]: '@rito.plz',
  [STATE_NAMES.EMAIL_SETTINGS_TYPE]: EMAIL_SETTINGS_TYPES.RANDOM,
  [STATE_NAMES.USERNAME_MIN]: '8',
  [STATE_NAMES.USERNAME_MAX]: '12',
  [STATE_NAMES.USERNAME_SET_TYPE]: USERNAME_SETTINGS_TYPES.RANDOM,
  [STATE_NAMES.PASSWORD_LENGTH]: '10',
  [STATE_NAMES.PASSWORD_SET_TYPE]: PASSWORD_SETTINGS_TYPES.RANDOM,
  [STATE_NAMES.PASSWORD_ONE_FOR_ALL]: '',
  [STATE_NAMES.CURRENT_CAPTCHA]: CAPTCHA_SERVICES.TWOCAPTCHA,
  [STATE_NAMES.API_KEY]: '',
  [STATE_NAMES.DBC_USERNAME]: '',
  [STATE_NAMES.DBC_PASSWORD]: '',
};

const config = isDev ? {} : JSON.parse(fs.readFileSync(`${dirname}/config.json`));

const { useGlobalState } = createGlobalState({ ...initialState, ...config });

export default useGlobalState;