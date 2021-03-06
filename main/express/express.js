import Express from 'express';
import Promise from 'bluebird';
import bodyParser from 'body-parser';
import generateData from '../dataGeneration.js';
import checkProxy from './checkProxy.js';
import getCaptchaBalance from './captchas/getBalance.js';
import registration from './registration.js';
import { STATUS } from '../../constants/constants.js';

const crlf = (text) => text.replace(/\r\n|\r(?!\n)|\n/g, '\n');

export default () => {
  const app = new Express();
  app.use(bodyParser.json({ limit: '50mb' }));
  app.use(
    bodyParser.urlencoded({
      limit: '50mb',
      extended: true,
      parameterLimit: 50000,
    })
  );

  const proxyData = { isChecking: false, checked: [] };
  const accountsState = { isGenerating: false, list: [] };
  const generatedAccounts = { list: [] };
  const currentState = { state: {} };

  app.post('/generate', (req, res) => {
    const { state } = req.body;
    generatedAccounts.list = [];
    currentState.state = state;
    generatedAccounts.list = generateData(state);
    res.json(generatedAccounts.list);
  });

  app.post('/updateproxylist', async (req, res) => {
    const { list } = req.body;
    const normalized = crlf(list).trim().split('\n');
    proxyData.list = normalized;
    res.json(proxyData);
  });

  app.post('/proxycheck', async (req, res) => {
    const list = req.body;
    proxyData.isChecking = true;
    proxyData.checked = [];
    res.json(proxyData);
    await Promise.map(
      list,
      async (item) => {
        const result = await checkProxy(item);
        proxyData.checked.push(result);
      },
      { concurrency: 1000 }
    );
    proxyData.isChecking = false;
  });

  app.get('/ischecking', (_req, res) => {
    res.json(proxyData);
  });

  app.get('/test', (_req, res) => {
    res.send('test');
  });

  app.post('/signup', async (req, res) => {
    const state = req.body;
    const accountsInProgress = generatedAccounts.list.map((acc) => ({ ...acc, status: STATUS.ACCOUNT.IN_PROGRESS }));
    res.json({ isGenerating: true, list: accountsInProgress });

    accountsState.isGenerating = true;
    accountsState.list = [];

    const captcha = {
      type: state.currentCaptcha,
      apiKey: state.apiKey,
      username: state.username,
      password: state.password,
    };
    const proxyList = state.useProxy
      ? proxyData.checked.filter(({ isWorking }) => isWorking === STATUS.PROXY.WORKING)
      : [];

    await Promise.map(
      accountsInProgress,
      async (account) => {
        const result = await registration(account, captcha, proxyList);
        accountsState.list.push(result);
      },
      { concurrency: 50 }
    );
    accountsState.isGenerating = false;
  });

  app.get('/signup', (_req, res) => {
    res.json(accountsState);
  });

  app.post('/getbalance', async (req, res) => {
    const config = req.body;
    const balance = await getCaptchaBalance(config);
    res.json({ balance });
  });

  app.get('/serverstate', (_req, res) => {
    res.json({ proxyData, accountsState, generatedAccounts, currentState });
  });

  return app;
};
