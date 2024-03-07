interface WebLN {
  sendPayment: (invoice: string) => Promise<any>;
  enable: () => Promise<any>;
}

declare global {
  interface Window {
    webln: WebLN;
  }
}

export {};
